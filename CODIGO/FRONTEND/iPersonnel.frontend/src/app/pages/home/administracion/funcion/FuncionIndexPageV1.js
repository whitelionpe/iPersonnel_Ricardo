import React, { useEffect, useState } from "react";
import { Portlet } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useSelector } from "react-redux";

import { eliminar, obtener, listar, crear, actualizar } from "../../../../api/administracion/funcion.api";
import FuncionListPage from "./FuncionListPage";
import FuncionEditPage from "./FuncionEditPage";
import { injectIntl } from "react-intl"; //Multi-idioma
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";

const FuncionIndexPage = (props) => {
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);

    const { intl } = props;

    const [funcion, setFuncion] = useState([]);
    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const classesEncabezado = useStylesEncabezado();
    const [focusedRowKey, setFocusedRowKey] = useState(1);

    async function agregarFuncion(dataRow) {
        const { IdFuncion, Funcion, Activo } = dataRow;
        let params = {
            IdCliente: perfil.IdCliente,
            IdFuncion: IdFuncion.toUpperCase(),
            Funcion: Funcion.toUpperCase(),
            Activo: Activo,
            IdUsuario: usuario.username
        };
        await crear(params)
            .then(response => {
                if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
                setModoEdicion(false);
                listarFuncion();
            })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
    }

    async function actualizarFuncion(dataRow) {
        const { IdFuncion, Funcion, Activo } = dataRow;
        let params = {
            IdCliente: perfil.IdCliente,
            IdFuncion: IdFuncion.toUpperCase(),
            Funcion: Funcion.toUpperCase(),
            Activo: Activo,
            IdUsuario: usuario.username
        };
        await actualizar(params)
            .then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
                setModoEdicion(false);
                listarFuncion();
            })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
    }

    async function eliminarRegistro(dataRow) {
        const { IdFuncion, IdCliente } = dataRow;
        await eliminar({  IdCliente: IdCliente, IdFuncion: IdFuncion })
            .then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
            })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
        listarFuncion();
    }

    async function listarFuncion() {
        let Funcions = await listar({
            IdCliente: perfil.IdCliente,
            NumPagina: 0,
            TamPagina: 0
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setFuncion(Funcions);
    }

    async function obtenerFuncion(filtro) {
        const { IdFuncion, IdCliente } = filtro;
        if (IdFuncion && IdCliente) {
            let Funcion = await obtener({ IdFuncion: IdFuncion, IdCliente: IdCliente }).catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
            setDataRowEditNew({ ...Funcion, esNuevoRegistro: false });
        }
    }

    const nuevoRegistro = () => {
        let Funcion = { Activo: "S" };
        setDataRowEditNew({ ...Funcion, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = dataRow => {
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerFuncion(dataRow);
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
        listarFuncion();
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <Portlet className={classesEncabezado.border}>
                    <CustomBreadcrumbs Title={intl.formatMessage({ id: "ADMINISTRATION.FUNCTION.PATHNAME" })} />

                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "ADMINISTRATION.FUNCTION.MAINTENANCE" })}
                                </Typography>
                            </Toolbar>
                        </AppBar>

                        {modoEdicion && (
                            <>
                                <FuncionEditPage
                                    //funcion={funcion}
                                    modoEdicion={modoEdicion}
                                    dataRowEditNew={dataRowEditNew}
                                    actualizarFuncion={actualizarFuncion}
                                    agregarFuncion={agregarFuncion}
                                    cancelarEdicion={cancelarEdicion}
                                    titulo={titulo}
                                />
                                <div className="container_only">
                                    <div className="float-right">
                                        <ControlSwitch
                                            checked={auditoriaSwitch}
                                            onChange={e => {
                                                setAuditoriaSwitch(e.target.checked);
                                            }}
                                        />
                                        <b> {intl.formatMessage({ id: "AUDIT.DATA" })} </b>
                                    </div>
                                </div>
                                {auditoriaSwitch && <AuditoriaPage dataRowEditNew={dataRowEditNew} />}
                            </>
                        )}
                        {!modoEdicion && (
                            <FuncionListPage
                                funcion={funcion}
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

export default injectIntl(FuncionIndexPage);
