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

import { obtener, listar, crear, actualizar,eliminar } from "../../../../api/administracion/color.api";
import ColorListPage from "./ColorListPage";
import ColorEditPage from "./ColorEditPage";

const ColorIndexPage = ({ intl }) => {
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);

    const [colores, setColores] = useState([]);

    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const classesEncabezado = useStylesEncabezado();
    const [focusedRowKey, setFocusedRowKey] = useState(1);


    async function agregarColor(color) {
        const { IdColor, Color, Activo } = color;
        let params = {
            IdColor:  isNotEmpty(IdColor) ? IdColor.toUpperCase() : ""
            , Color: isNotEmpty(Color) ? Color.toUpperCase() : ""
            , IdCliente: perfil.IdCliente
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await crear(params).then(response => {
            if (response) 
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarColor();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function actualizarColor(color) {

        const { IdColor, Color, Activo } = color;
        let params = {
            IdColor:  isNotEmpty(IdColor) ? IdColor.toUpperCase() : ""
            , Color: isNotEmpty(Color) ? Color.toUpperCase() : ""
            , IdCliente: perfil.IdCliente
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await actualizar(params)
        .then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarColor();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function eliminarRegistro(Color) {
        const { IdCliente, IdColor } = Color;
        await eliminar({ 
            IdCliente: IdCliente,
            IdColor: IdColor, 
            IdUsuario: usuario.username 
        }).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        listarColor();
    }

    async function listarColor() {
        /*console.log("listarColor", colores);
        let colores = await listar({
            IdCliente: perfil.IdCliente,
            IdColor: '%',
            NumPagina: 0,
            TamPagina: 0
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setColores(colores);*/
        
        let color = await listar();
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setColores(color);
    }

    async function obtenerColor(filtro) {
        const { IdCliente, IdColor } = filtro;
        if (isNotEmpty(IdCliente)
            && isNotEmpty(IdColor)) {
            let color = await obtener({ 
                IdCliente: IdCliente,
                IdColor: IdColor 
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
            setDataRowEditNew({ ...color, esNuevoRegistro: false });
        }
    }

    const nuevoRegistro = () => {
        let color = { Activo: "S" };
        setDataRowEditNew({ ...color, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = dataRow => {
        const { IdColor } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerColor(dataRow);
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
        listarColor();

    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                <CustomBreadcrumbs Title={intl.formatMessage({ id: "ADMINISTRATION.COLOR.MENU" })} SubMenu={intl.formatMessage({ id: "ADMINISTRATION.COLOR.SUBMENU" })} SubMenu1={intl.formatMessage({ id: "ADMINISTRATION.COLOR.SUBTITLE" })} Subtitle={intl.formatMessage({ id: "ADMINISTRATION.COLOR.COLOR" })} />
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                {intl.formatMessage({ id: "ADMINISTRATION.COLOR.MAINTENANCE" }).toUpperCase()}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        {modoEdicion && (
                            <>
                                <ColorEditPage
                                    modoEdicion={modoEdicion}                                   
                                    dataRowEditNew={dataRowEditNew}
                                    actualizarColor={actualizarColor}
                                    agregarColor={agregarColor}
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
                            <ColorListPage
                                colores={colores}
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

export default injectIntl (ColorIndexPage);
