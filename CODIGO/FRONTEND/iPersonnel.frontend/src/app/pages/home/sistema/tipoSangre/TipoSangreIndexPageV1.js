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
} from "../../../../api/sistema/tipoSangre.api";
import TipoSangreListPage from "./TipoSangreListPage";
import TipoSangreEditPage from "./TipoSangreEditPage";

const TipoSangreIndexPage = ({ intl }) => {
    const usuario = useSelector(state => state.auth.user);

    const [tiposSangre, setTiposSangre] = useState([]);

    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const classesEncabezado = useStylesEncabezado();
    const [focusedRowKey, setFocusedRowKey] = useState(1);

    async function agregarTipoSangre(tipoSangre) {

        const { IdTipoSangre, TipoSangre, Activo } = tipoSangre;
        let params = {
            IdTipoSangre: IdTipoSangre.toUpperCase()
            , TipoSangre: TipoSangre.toUpperCase()
            , Activo
            , IdUsuario: usuario.username
        };
        await crear(params).then(response => {
            if (response)
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarTipoSangre();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function actualizarTipoSangre(tipoSangre) {

        const { IdTipoSangre, TipoSangre, Activo } = tipoSangre;
        let params = {
            IdTipoSangre: IdTipoSangre.toUpperCase()
            , TipoSangre: TipoSangre.toUpperCase()
            , Activo
            , IdUsuario: usuario.username
        };
        await actualizar(params).then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarTipoSangre();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function eliminarRegistro(tipoSangre) {
        const { IdTipoSangre } = tipoSangre;
        await eliminar({ IdTipoSangre: IdTipoSangre, IdUsuario: usuario.username }).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        listarTipoSangre();
    }

    async function listarTipoSangre() {

        let tipoSangre = await listar();
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setTiposSangre(tipoSangre);

    }

    async function obtenerTipoSangre(idTipoSangre) {
        if (idTipoSangre) {
            let tipoSangre = await obtener({ IdTipoSangre: idTipoSangre });
            setDataRowEditNew({ ...tipoSangre, esNuevoRegistro: false });
        }
    }

    const nuevoRegistro = () => {
        let tipoSangre = { Activo: "S" };
        setDataRowEditNew({ ...tipoSangre, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = dataRow => {
        const { IdTipoSangre } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerTipoSangre(IdTipoSangre);
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
        listarTipoSangre();

    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <CustomBreadcrumbs Title={intl.formatMessage({ id: "SYSTEM" }) + " / " + intl.formatMessage({ id: "COMMON.GENERALS" })} Subtitle={intl.formatMessage({ id: "SYSTEM.BLOODTYPE" })} />

                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "SYSTEM.BLOODTYPE.MAINTENANCE" }).toUpperCase()}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        {modoEdicion && (
                            <>
                                <TipoSangreEditPage
                                    modoEdicion={modoEdicion}
                                    dataRowEditNew={dataRowEditNew}
                                    actualizarTipoSangre={actualizarTipoSangre}
                                    agregarTipoSangre={agregarTipoSangre}
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
                            <TipoSangreListPage
                                tiposSangre={tiposSangre}
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

export default injectIntl(TipoSangreIndexPage);
