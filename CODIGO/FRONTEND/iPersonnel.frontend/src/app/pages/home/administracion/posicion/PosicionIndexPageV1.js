import React, { useEffect, useState } from "react";
import { Portlet } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";

import { useSelector } from "react-redux";
import { isNotEmpty } from "../../../../../_metronic";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import {obtener, listar, crear, actualizar, eliminar } from "../../../../api/administracion/posicion.api";
import PosicionListPage from "./PosicionListPage";
import PosicionEditPage from "./PosicionEditPage";
import { injectIntl } from "react-intl"; //Multi-idioma

const PosicionIndexPage = ({intl}) => {
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);

    const [focusedRowKey, setFocusedRowKey] = useState(1);
    const [posiciones, setPosiciones] = useState([]);

    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const classesEncabezado = useStylesEncabezado(); 

    async function agregarPosicion(data) {
        const { IdUnidadOrganizativa, IdTipoPosicion, IdFuncion, IdPosicion, Posicion, Confianza, Fiscalizable, Activo } = data;
        let param = {
            IdUnidadOrganizativa : isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa.toUpperCase() : "",
            IdTipoPosicion: isNotEmpty(IdTipoPosicion) ? IdTipoPosicion.toUpperCase() : "",
            IdFuncion: isNotEmpty(IdFuncion) ? IdFuncion.toUpperCase() : "",
            IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion.toUpperCase() : "",
            Posicion: isNotEmpty(Posicion) ? Posicion.toUpperCase() : "",
            Confianza,
            Fiscalizable,
            IdCliente: perfil.IdCliente,
            Activo,
            IdUsuario: usuario.username
        };
        await crear(param)
            .then(response => {
                if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
                setModoEdicion(false);
                listarPosiciones();
            })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
    }


    async function actualizarPosicion(posicion) {
        const { IdUnidadOrganizativa, IdTipoPosicion, IdFuncion, IdPosicion, Posicion, Confianza, Fiscalizable, Activo } = posicion;
        let params = {
            IdUnidadOrganizativa : isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa.toUpperCase() : "",
            IdTipoPosicion: isNotEmpty(IdTipoPosicion) ? IdTipoPosicion.toUpperCase() : "",
            IdFuncion: isNotEmpty(IdFuncion) ? IdFuncion.toUpperCase() : "",
            IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion.toUpperCase() : "",
            Posicion: isNotEmpty(Posicion) ? Posicion.toUpperCase() : "",
            Confianza,
            Fiscalizable,
            IdCliente: perfil.IdCliente,
            Activo,
            IdUsuario: usuario.username
        };
        await actualizar(params)
            .then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
                setModoEdicion(false);
                listarPosiciones();
            })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
    }


    async function eliminarRegistro(posicion) {
        const { IdPosicion, IdCliente } = posicion;
        await eliminar({
            IdPosicion: IdPosicion,
            IdCliente: IdCliente,
            IdUsuario: usuario.username
        })
            .then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
            })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
        listarPosiciones();
    }


    async function listarPosiciones() {
        let posiciones = await listar({
            IdCliente: perfil.IdCliente,
            NumPagina: 0,
            TamPagina: 0
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setPosiciones(posiciones);
        //changeTabIndex(0);
    }


    async function obtenerPosicion(filtro) {
        const { IdPosicion, IdCliente } = filtro;
        if (isNotEmpty(IdPosicion) && isNotEmpty(IdCliente)) {
            let posicion = await obtener({
                IdPosicion: IdPosicion,
                IdCliente: IdCliente
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
            setDataRowEditNew({ ...posicion, esNuevoRegistro: false });
        }
    }


    const nuevoRegistro = () => {
        let posicion = {
            Activo: "S",
            IdCliente: perfil.IdCliente
        };
        setDataRowEditNew({ ...posicion, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };


    const editarRegistro = dataRow => {
        const { IdPosicion } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerPosicion(dataRow);
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
        listarPosiciones();
    }, []);



    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <Portlet className={classesEncabezado.border}>
                    <CustomBreadcrumbs Title={intl.formatMessage({ id: "ADMINISTRATION.POSITION.PATHNAME" })} />

                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "ADMINISTRATION.POSITION.MAINTENANCE" })}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        {modoEdicion && (
                            <>
                                <PosicionEditPage
                                    titulo={titulo}
                                    modoEdicion={modoEdicion}
                                    dataRowEditNew={dataRowEditNew}
                                    actualizarPosicion={actualizarPosicion}
                                    agregarPosicion={agregarPosicion}
                                    cancelarEdicion={cancelarEdicion}
                                />
                                <div className="container_only">
                                    <div className="float-right">
                                        <ControlSwitch checked={auditoriaSwitch}
                                            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                                        /><b> { intl.formatMessage({ id: "AUDIT.DATA" }) } </b>
                                        </div>
                                </div>
                                {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}

                            </>
                        )}
                        {!modoEdicion && (
                            <PosicionListPage
                                posiciones={posiciones}
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
export default injectIntl(PosicionIndexPage);
