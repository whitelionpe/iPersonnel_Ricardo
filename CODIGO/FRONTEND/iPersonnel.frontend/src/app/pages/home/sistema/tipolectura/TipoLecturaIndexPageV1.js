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
import { isNotEmpty } from "../../../../../_metronic";

import {
    obtener,
    listar,
    crear,
    actualizar,
    eliminar
} from "../../../../api/sistema/tipolectura.api";
import TipoLecturaListPage from "./TipoLecturaListPage";
import TipoLecturaEditPage from "./TipoLecturaEditPage";

const TipoLecturaIndexPage = ({ intl }) => {
    const usuario = useSelector(state => state.auth.user);
    const [tipoLecturas, setTipoLecturas] = useState([]);

    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const classesEncabezado = useStylesEncabezado();
    const [focusedRowKey, setFocusedRowKey] = useState();

    async function agregarTipoLectura(tipoLectura) {
        const { IdTipoLectura, TipoLectura, Activo } = tipoLectura;

        let params = {
            IdTipoLectura: isNotEmpty(IdTipoLectura) ? IdTipoLectura.toUpperCase() : ""
            , TipoLectura: isNotEmpty(TipoLectura) ? TipoLectura.toUpperCase() : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        }
        await crear(params).then(response => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarTipoLecturas();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }


    async function actualizarTipoLectura(tipoLectura) {
        const { IdTipoLectura, TipoLectura, Activo } = tipoLectura;
        let params = {
            IdTipoLectura: isNotEmpty(IdTipoLectura) ? IdTipoLectura.toUpperCase() : ""
            , TipoLectura: isNotEmpty(TipoLectura) ? TipoLectura.toUpperCase() : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        }
        await actualizar(params).then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarTipoLecturas();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }


    async function eliminarRegistro(tipoLectura) {
        const { IdTipoLectura } = tipoLectura;

        await eliminar({ IdTipoLectura: IdTipoLectura, IdUsuario: usuario.username }).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        listarTipoLecturas();
    }


    async function listarTipoLecturas() {
        let tipoLecturas = await listar(
            {
                IdTipoLectura: "%"
                , TipoLectura: "%"
                , NumPagina: 0
                , TamPagina: 0
            }
        );
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setTipoLecturas(tipoLecturas);
    }


    async function obtenerTipoLectura(idTipoLectura) {
        if (idTipoLectura) {
            let tipoLectura = await obtener({ IdTipoLectura: idTipoLectura });
            setDataRowEditNew({ ...tipoLectura, esNuevoRegistro: false });
        }
    }


    const nuevoRegistro = () => {
        let tipoLectura = { Activo: "S" };
        setDataRowEditNew({ ...tipoLectura, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };


    const editarRegistro = dataRow => {
        const { IdTipoLectura } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerTipoLectura(IdTipoLectura);
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
        listarTipoLecturas();

    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <CustomBreadcrumbs Title={intl.formatMessage({ id: "SYSTEM" }) + " / " + intl.formatMessage({ id: "SYSTEM.TYPE.DEVICE.CONFIGURATION" })} Subtitle={intl.formatMessage({ id: "SYSTEM.READTYPE" })} />

                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {(intl.formatMessage({id:"SYSTEM.READTYPE.MAINTENANCE"})).toUpperCase()}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        {modoEdicion && (
                            <>
                                <TipoLecturaEditPage
                                    modoEdicion={modoEdicion}
                                    dataRowEditNew={dataRowEditNew}
                                    actualizarTipoLectura={actualizarTipoLectura}
                                    agregarTipoLectura={agregarTipoLectura}
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
                            <TipoLecturaListPage
                                tipoLecturas={tipoLecturas}
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

export default injectIntl(TipoLecturaIndexPage);
