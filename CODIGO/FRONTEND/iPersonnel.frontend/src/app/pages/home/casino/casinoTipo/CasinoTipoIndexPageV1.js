import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { Portlet } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useSelector } from "react-redux";

import { obtener, listar, crear, actualizar, eliminar } from "../../../../api/casino/casinoTipo.api";
import CasinoTipoListPage from "./CasinoTipoListPage";
import CasinoTipoEditPage from "./CasinoTipoEditPage";

const CasinoTipoIndexPage = ({ intl }) => {
    const usuario = useSelector(state => state.auth.user);

    const [casinoTipos, setcasinoTipos] = useState([]);

    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const classesEncabezado = useStylesEncabezado();
    const [focusedRowKey, setFocusedRowKey] = useState(1);


    async function agregarCasinoTipo(comedorTipo) {

        const { IdTipo, Tipo, Activo } = comedorTipo;
        let params = {
            IdTipo: IdTipo.toUpperCase()
            , Tipo: Tipo.toUpperCase()
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await crear(params).then(response => {
            if (response)
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarCasinoTipo();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function actualizarCasinoTipo(casinoTipo) {

        const { IdTipo, Tipo, Activo } = casinoTipo;
        let params = {
            IdTipo: IdTipo.toUpperCase()
            , Tipo: Tipo.toUpperCase()
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await actualizar(params).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarCasinoTipo();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function eliminarRegistro(casinoTipo) {
        const { IdTipo } = casinoTipo;
        await eliminar({ IdTipo: IdTipo, IdUsuario: usuario.username }).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        listarCasinoTipo();
    }

    async function listarCasinoTipo() {
        //console.log("listarCasinoTipo", casinoTipo);
        let casinoTipo = await listar();
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setcasinoTipos(casinoTipo);
    }

    async function obtenerCasinoTipo(idTipo) {
        if (idTipo) {
            let casinoTipo = await obtener({ IdTipo: idTipo });
            setDataRowEditNew({ ...casinoTipo, esNuevoRegistro: false });
        }
    }

    const nuevoRegistro = () => {
        let casinoTipo = { Activo: "S" };
        setDataRowEditNew({ ...casinoTipo, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = dataRow => {
        const { IdTipo } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerCasinoTipo(IdTipo);
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
        listarCasinoTipo();

    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <CustomBreadcrumbs Title={intl.formatMessage({ id: "CASINO.TYPE.MENU" })} SubMenu={intl.formatMessage({ id: "CASINO.TYPE.SUBMENU" })} Subtitle={intl.formatMessage({ id: "CASINO.TYPE.SUBTITLE" })} />
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "CASINO.TYPE.MAINTENANCE" }).toUpperCase()}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        {modoEdicion && (
                            <>
                                <CasinoTipoEditPage
                                    modoEdicion={modoEdicion}
                                    dataRowEditNew={dataRowEditNew}
                                    actualizarCasinoTipo={actualizarCasinoTipo}
                                    agregarCasinoTipo={agregarCasinoTipo}
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
                            <CasinoTipoListPage
                                casinoTipos={casinoTipos}
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

export default injectIntl(CasinoTipoIndexPage);
