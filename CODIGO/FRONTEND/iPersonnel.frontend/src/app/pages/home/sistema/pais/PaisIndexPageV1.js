import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Portlet } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useSelector } from "react-redux";

import {
    obtener,
    listar,
    crear,
    actualizar,
    eliminar
} from "../../../../api/sistema/pais.api";
import PaisListPage from "./PaisListPage";
import PaisEditPage from "./PaisEditPage";

const PaisIndexPage = ({ intl }) => {
    const usuario = useSelector(state => state.auth.user);
    const [paises, setPaises] = useState([]);

    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const classesEncabezado = useStylesEncabezado();
    const [focusedRowKey, setFocusedRowKey] = useState();

    async function agregarPais(pais) {

        const { IdPais, Pais, Activo } = pais;

        let params = {
            IdPais: IdPais.toUpperCase()
            , Pais: Pais.toUpperCase()
            , Activo: Activo
            , IdUsuario: usuario.username
        }
        await crear(params).then(response => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarPaises();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function actualizarPais(pais) {

        const { IdPais, Pais, Activo } = pais;
        let params = {
            IdPais: IdPais.toUpperCase()
            , Pais: Pais.toUpperCase()
            , Activo: Activo
            , IdUsuario: usuario.username
        }
        await actualizar(params).then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarPaises();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function eliminarRegistro(pais) {
        const { IdPais } = pais;
        await eliminar({ IdPais: IdPais, IdUsuario: usuario.username }).then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        listarPaises();
    }

    async function listarPaises() {

        let paises = await listar(
            {
                IdPais: "%"
                , Pais: "%"
                , NumPagina: 0
                , TamPagina: 0
            }
        );
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setPaises(paises);

    }

    async function obtenerPais(idPais) {
        if (idPais) {
            let pais = await obtener({ IdPais: idPais });
            setDataRowEditNew({ ...pais, esNuevoRegistro: false });
        }
    }

    const nuevoRegistro = () => {
        let pais = { Activo: "S" };
        setDataRowEditNew({ ...pais, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = async (dataRow) => {
        const { IdPais } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        await obtenerPais(IdPais);
    };

    const cancelarEdicion = () => {
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
    };

    const seleccionarRegistro = dataRow => {
        const { RowIndex } = dataRow;
        setFocusedRowKey(RowIndex);
    }

    useEffect(() => {
        listarPaises();

    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <CustomBreadcrumbs Title={intl.formatMessage({ id: "SYSTEM" }) + " / " + intl.formatMessage({ id: "COMMON.GENERALS" })} Subtitle={intl.formatMessage({ id: "SYSTEM.COUNTRY" })} />
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {(intl.formatMessage({ id: "SYSTEM.COUNTRY.MAINTENANCE" })).toUpperCase()}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        {modoEdicion && (
                            <>
                                <PaisEditPage
                                    modoEdicion={modoEdicion}
                                    dataRowEditNew={dataRowEditNew}
                                    actualizarPais={actualizarPais}
                                    agregarPais={agregarPais}
                                    cancelarEdicion={cancelarEdicion}
                                    titulo={titulo}
                                />
                                <div className="container_only">
                                    <div className="float-right">
                                        <ControlSwitch checked={auditoriaSwitch}
                                            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                                        /><b> {intl.formatMessage({ id: "AUDIT.DATA" })} </b>
                                    </div>
                                </div>
                                {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}

                            </>
                        )}
                        {!modoEdicion && (
                            <PaisListPage
                                paises={paises}
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

export default injectIntl(PaisIndexPage);
