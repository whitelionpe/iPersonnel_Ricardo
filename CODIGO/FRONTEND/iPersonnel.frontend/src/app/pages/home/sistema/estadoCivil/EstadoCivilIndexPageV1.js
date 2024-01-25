import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";

import { Portlet } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useSelector } from "react-redux";

import {
    obtener,
    listar,
    crear,
    actualizar,
    eliminar
} from "../../../../api/sistema/estadoCivil.api";
import EstadoCivilListPage from "./EstadoCivilListPage";
import EstadoCivilEditPage from "./EstadoCivilEditPage";

const EstadoCivilIndexPage = ({ intl }) => {
    const usuario = useSelector(state => state.auth.user);

    const [estadoCiviles, setEstadoCiviles] = useState([]);

    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const classesEncabezado = useStylesEncabezado();
    const [focusedRowKey, setFocusedRowKey] = useState();


    async function agregarEstadoCivil(estadoCivil) {

        const { IdEstadoCivil, EstadoCivil, Activo } = estadoCivil;
        let params = {
            IdEstadoCivil: IdEstadoCivil.toUpperCase()
            , EstadoCivil: EstadoCivil.toUpperCase()
            , Activo
            , IdUsuario: usuario.username
        };
        await crear(params).then(response => {
            if (response)
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarEstadoCivil();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function actualizarEstadoCivil(estadoCivil) {

        const { IdEstadoCivil, EstadoCivil, Activo } = estadoCivil;
        let params = {
            IdEstadoCivil: IdEstadoCivil.toUpperCase()
            , EstadoCivil: EstadoCivil.toUpperCase()
            , Activo
            , IdUsuario: usuario.username
        };
        await actualizar(params).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarEstadoCivil();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function eliminarRegistro(estadoCivil) {
        const { IdEstadoCivil } = estadoCivil;
        await eliminar({ IdEstadoCivil, IdUsuario: usuario.username }).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        listarEstadoCivil();
    }

    async function listarEstadoCivil() {

        let estadoCivil = await listar();
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setEstadoCiviles(estadoCivil);
    }

    async function obtenerEstadoCivil(idEstadoCivil) {
        if (idEstadoCivil) {
            let estadoCivil = await obtener({ IdEstadoCivil: idEstadoCivil });
            setDataRowEditNew({ ...estadoCivil, esNuevoRegistro: false });
        }
    }

    const nuevoRegistro = () => {
        let estadoCivil = { Activo: "S" };
        setDataRowEditNew({ ...estadoCivil, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = async (dataRow) => {
        const { IdEstadoCivil } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        await obtenerEstadoCivil(IdEstadoCivil);
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
        listarEstadoCivil();

    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <CustomBreadcrumbs Title={intl.formatMessage({ id: "SYSTEM" }) + " / " + intl.formatMessage({ id: "COMMON.GENERALS" })} Subtitle={intl.formatMessage({ id: "SYSTEM.CIVILSTATUS" })} />

                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "SYSTEM.CIVILSTATUS.MAINTENANCE" }).toUpperCase()}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        {modoEdicion && (
                            <>
                                <EstadoCivilEditPage
                                    modoEdicion={modoEdicion}
                                    dataRowEditNew={dataRowEditNew}
                                    actualizarEstadoCivil={actualizarEstadoCivil}
                                    agregarEstadoCivil={agregarEstadoCivil}
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
                            <EstadoCivilListPage
                                estadoCiviles={estadoCiviles}
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

export default injectIntl(EstadoCivilIndexPage);
