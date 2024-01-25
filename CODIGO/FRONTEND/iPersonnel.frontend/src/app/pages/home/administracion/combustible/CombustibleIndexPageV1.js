import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Portlet } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { isNotEmpty } from "../../../../../_metronic";

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useSelector } from "react-redux";

import { obtener, listar, crear, actualizar, eliminar} from "../../../../api/administracion/combustible.api";
import CombustibleListPage from "./CombustibleListPage";
import CombustibleEditPage from "./CombustibleEditPage";

const CombustibleIndexPage = ({ intl }) => {
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);

    const [combustibles, setCombustibles] = useState([]);

    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const classesEncabezado = useStylesEncabezado();
    const [focusedRowKey, setFocusedRowKey] = useState(1);


    async function agregarCombustible(combustible) {
        const { IdCombustible, Combustible, Activo } = combustible;
        let params = {
            IdCombustible: isNotEmpty(IdCombustible) ? IdCombustible.toUpperCase() : ""
            , Combustible: isNotEmpty(Combustible) ? Combustible.toUpperCase() : ""
            , IdCliente: perfil.IdCliente
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await crear(params).then(response => {
            if (response) 
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarCombustible();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function actualizarCombustible(combustible) {

        const { IdCombustible, Combustible, Activo } = combustible;
        let params = {
            IdCombustible: isNotEmpty(IdCombustible) ? IdCombustible.toUpperCase() : ""
            , Combustible: isNotEmpty(Combustible) ? Combustible.toUpperCase() : ""
            , IdCliente: perfil.IdCliente
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await actualizar(params).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarCombustible();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function eliminarRegistro(combustible) {
        const { IdCliente, IdCombustible } = combustible;
        await eliminar({  
            IdCliente: IdCliente,
            IdCombustible: IdCombustible, 
            IdUsuario: usuario.username }).then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        listarCombustible();
    }

    async function listarCombustible() {

        let combustible = await listar();
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setCombustibles(combustible);
    }

    /*async function obtenerCombustible(idCombustible) {
        if (idCombustible) {
            let combustible = await obtener({ IdCombustible: idCombustible });
            setDataRowEditNew({ ...combustible, esNuevoRegistro: false });
        }
    }*/
    async function obtenerCombustible(filtro) {
        const { IdCliente, IdCombustible } = filtro;
        if (isNotEmpty(IdCliente)
            && isNotEmpty(IdCombustible)) {
            let combustible = await obtener({ 
                IdCliente: IdCliente,
                IdCombustible: IdCombustible 
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
            setDataRowEditNew({ ...combustible, esNuevoRegistro: false });
        }
    }

    const nuevoRegistro = () => {
        let combustible = { Activo: "S" };
        setDataRowEditNew({ ...combustible, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = dataRow => {
        const { IdCombustible } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerCombustible(dataRow);
    };

    const cancelarEdicion = () => {
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
    };

    const seleccionarRegistro = dataRow => {
        const { RowIndex } = dataRow;
        setFocusedRowKey(RowIndex);
    };

    useEffect(() => {
        listarCombustible();

    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                <CustomBreadcrumbs Title={intl.formatMessage({ id: "ADMINISTRATION.FUEL.MENU" })} SubMenu={intl.formatMessage({ id: "ADMINISTRATION.FUEL.SUBMENU" })} SubMenu1={intl.formatMessage({ id: "ADMINISTRATION.FUEL.SUBTITLE" })} Subtitle={intl.formatMessage({ id: "ADMINISTRATION.FUEL.FUEL" })}/>
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                {intl.formatMessage({ id: "ADMINISTRATION.FUEL.MAINTENANCE" }).toUpperCase()}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        {modoEdicion && (
                            <>
                                <CombustibleEditPage
                                    modoEdicion={modoEdicion}
                                    dataRowEditNew={dataRowEditNew}
                                    actualizarCombustible={actualizarCombustible}
                                    agregarCombustible={agregarCombustible}
                                    cancelarEdicion={cancelarEdicion}
                                    titulo={titulo}
                                />
                                <div className="container_only">
                                    <div className="float-right">
                                        <ControlSwitch checked={auditoriaSwitch}
                                            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                                        /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
                                        </div>
                                </div>
                                {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}

                            </>
                        )}
                        {!modoEdicion && (
                            <CombustibleListPage
                                combustibles={combustibles}
                                editarRegistro={editarRegistro}
                                eliminarRegistro={eliminarRegistro}
                                nuevoRegistro={nuevoRegistro}
                                seleccionarRegistro={seleccionarRegistro}
                                focusedRowKey={focusedRowKey}
                            />
                        )}
                    </Portlet>
                </div>
            </div>
        </>
    );
};

export default injectIntl (CombustibleIndexPage);
