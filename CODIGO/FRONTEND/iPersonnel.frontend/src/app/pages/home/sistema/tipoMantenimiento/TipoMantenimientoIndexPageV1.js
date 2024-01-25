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

import { obtener, listar, crear, actualizar, eliminar } from "../../../../api/sistema/tipomantenimiento.api";
import TipoMantenimientoListPage from "./TipoMantenimientoListPage";
import TipoMantenimientoEditPage from "./TipoMantenimientoEditPage";

const TipoMantenimientoIndexPage = ({ intl }) => {
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);

    const [tiposMantenimiento, setTiposMantenimiento] = useState([]);

    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const classesEncabezado = useStylesEncabezado();
    const [focusedRowKey, setFocusedRowKey] = useState(1);

    async function agregarTipoMantenimiento(tipoMantenimiento) {
        const { IdTipoMantenimiento, TipoMantenimiento, Activo } = tipoMantenimiento;
        let params = {
            IdTipoMantenimiento: isNotEmpty(IdTipoMantenimiento) ? IdTipoMantenimiento.toUpperCase() : ""
            , TipoMantenimiento: isNotEmpty(TipoMantenimiento) ? TipoMantenimiento.toUpperCase() : ""
            , IdCliente: perfil.IdCliente
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await crear(params).then(response => {
            if (response)
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarTipoMantenimiento();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function actualizarTipoMantenimiento(tipoMantenimiento) {
        const { IdTipoMantenimiento, TipoMantenimiento, Activo } = tipoMantenimiento;
        let params = {
            IdTipoMantenimiento: isNotEmpty(IdTipoMantenimiento) ? IdTipoMantenimiento.toUpperCase() : ""
            , TipoMantenimiento: isNotEmpty(TipoMantenimiento) ? TipoMantenimiento.toUpperCase() : ""
            , IdCliente: perfil.IdCliente
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await actualizar(params).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarTipoMantenimiento();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function eliminarTipoMantenimiento(tipoMantenimiento) {
        const { IdCliente, IdTipoMantenimiento} = tipoMantenimiento;
        await eliminar({
            IdCliente:IdCliente,
            IdTipoMantenimiento,
            IdUsuario: usuario.username
        }).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        listarTipoMantenimiento();
    }

    async function listarTipoMantenimiento() {
        let lisTipoMantenimiento = await listar();
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setTiposMantenimiento(lisTipoMantenimiento);

    }


    async function obtenerTipoMantenimiento(filtro) {
        const { IdCliente, IdTipoMantenimiento } = filtro;
        if (isNotEmpty(IdCliente)
            && isNotEmpty(IdTipoMantenimiento)) {
            let tipoMantenimiento = await obtener({
                IdCliente: IdCliente,
                IdTipoMantenimiento: IdTipoMantenimiento
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
            setDataRowEditNew({ ...tipoMantenimiento, esNuevoRegistro: false });
        }
    }

    const nuevoRegistro = () => {
        let tipoMantenimiento = { Activo: "S" };
        setDataRowEditNew({ ...tipoMantenimiento, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = dataRow => {
        const { IdTipoMantenimiento } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerTipoMantenimiento(dataRow);
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
        listarTipoMantenimiento();
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    {/*<CustomBreadcrumbs Title={intl.formatMessage({ id: "SECURITY.CHARACTERISTIC.MENU" })} SubMenu={intl.formatMessage({ id: "SECURITY.CHARACTERISTIC.SUBMENU" })} Subtitle={intl.formatMessage({ id: "SECURITY.CHARACTERISTIC.CHARACTERISTIC" })} />*/}
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    TIPO MANTENIMIENTO{/*{intl.formatMessage({ id: "SECURITY.CHARACTERISTIC.MAINTENANCE" }).toUpperCase()}*/}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        {modoEdicion && (
                            <>
                                <TipoMantenimientoEditPage
                                    modoEdicion={modoEdicion}
                                    dataRowEditNew={dataRowEditNew}
                                    actualizarTipoMantenimiento={actualizarTipoMantenimiento}
                                    agregarTipoMantenimiento={agregarTipoMantenimiento}
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
                            <TipoMantenimientoListPage
                                lisTipoMantenimiento={tiposMantenimiento}
                                editarRegistro={editarRegistro}
                                eliminarRegistro={eliminarTipoMantenimiento}
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

export default injectIntl(TipoMantenimientoIndexPage);
