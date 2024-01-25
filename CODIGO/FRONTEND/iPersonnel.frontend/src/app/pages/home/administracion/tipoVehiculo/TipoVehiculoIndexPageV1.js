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

import {obtener,listar,crear,actualizar,eliminar} from "../../../../api/administracion/tipoVehiculo.api";
import TipoVehiculoListPage from "./TipoVehiculoListPage";
import TipoVehiculoEditPage from "./TipoVehiculoEditPage";

const TipoVehiculoIndexPage = ({ intl }) => {
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);

    const [tipoVehiculos, setTipoVehiculos] = useState([]);

    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const classesEncabezado = useStylesEncabezado();
    const [focusedRowKey, setFocusedRowKey] = useState(1);

    async function agregarTipoVehiculo(tipoVehiculo) {
        const { IdTipoVehiculo, TipoVehiculo, Activo } = tipoVehiculo;
        let params = {
            IdTipoVehiculo:  isNotEmpty(IdTipoVehiculo) ? IdTipoVehiculo.toUpperCase() : ""
            , TipoVehiculo:  isNotEmpty(TipoVehiculo) ? TipoVehiculo.toUpperCase() : ""
            , IdCliente: perfil.IdCliente
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await crear(params).then(response => {
            if (response)
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarTipoVehiculo();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function actualizarTipoVehiculo(tipoVehiculo) {

        const { IdTipoVehiculo, TipoVehiculo, Activo } = tipoVehiculo;
        let params = {
            IdTipoVehiculo:  isNotEmpty(IdTipoVehiculo) ? IdTipoVehiculo.toUpperCase() : ""
            , TipoVehiculo:  isNotEmpty(TipoVehiculo) ? TipoVehiculo.toUpperCase() : ""
            , IdCliente: perfil.IdCliente
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await actualizar(params).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarTipoVehiculo();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function eliminarRegistro(tipoVehiculo) {
        const { IdCliente, IdTipoVehiculo } = tipoVehiculo;
        await eliminar({ IdCliente: IdCliente,
            IdTipoVehiculo: IdTipoVehiculo, 
            IdUsuario: usuario.username }).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        listarTipoVehiculo();
    }

    async function listarTipoVehiculo() {

        let tipoVehiculo = await listar();
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setTipoVehiculos(tipoVehiculo);

    }

    /*async function obtenerTipoVehiculo(idTipoVehiculo) {
        if (idTipoVehiculo) {
            let tipoVehiculo = await obtener({ IdTipoVehiculo: idTipoVehiculo });
            setDataRowEditNew({ ...tipoVehiculo, esNuevoRegistro: false });
        }
    }*/

    
    async function obtenerTipoVehiculo(filtro) {
        const { IdCliente, IdTipoVehiculo } = filtro;
        if (isNotEmpty(IdCliente)
            && isNotEmpty(IdTipoVehiculo)) {
            let tipoVehiculo = await obtener({ 
                IdCliente: IdCliente,
                IdTipoVehiculo: IdTipoVehiculo 
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
            setDataRowEditNew({ ...tipoVehiculo, esNuevoRegistro: false });
        }
    }

    const nuevoRegistro = () => {
        let tipoVehiculo = { Activo: "S" };
        setDataRowEditNew({ ...tipoVehiculo, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = dataRow => {
        const { IdTipoVehiculo } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerTipoVehiculo(dataRow);
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
        listarTipoVehiculo();

    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                <CustomBreadcrumbs Title={intl.formatMessage({ id: "ADMINISTRATION.VEHICLETYPE.MENU" })} SubMenu={intl.formatMessage({ id: "ADMINISTRATION.VEHICLETYPE.SUBMENU" })} SubMenu1={intl.formatMessage({ id: "ADMINISTRATION.VEHICLETYPE.SUBTITLE" })} Subtitle={intl.formatMessage({ id: "ADMINISTRATION.VEHICLETYPE.VEHICLETYPE" })}/>
                <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                {intl.formatMessage({ id: "ADMINISTRATION.VEHICLETYPE.MAINTENANCE" }).toUpperCase()}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                            {modoEdicion && (
                                <>
                                    <TipoVehiculoEditPage
                                        modoEdicion={modoEdicion}
                                        dataRowEditNew={dataRowEditNew}
                                        actualizarTipoVehiculo={actualizarTipoVehiculo}
                                        agregarTipoVehiculo={agregarTipoVehiculo}
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
                                <TipoVehiculoListPage
                                    tipoVehiculos={tipoVehiculos}
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

export default injectIntl (TipoVehiculoIndexPage);
