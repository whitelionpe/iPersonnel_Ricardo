import React, { useEffect, useState } from "react";
import { Portlet } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { useSelector } from "react-redux";

import {
    eliminar,
    obtener,
    listar,
    crear,
    actualizar
} from "../../../../api/sistema/moduloregla.api";
import ReglaListPage from "./ModuloReglaListPage";
import ReglaEditPage from "./ModuloReglaEditPage";

import {
    eliminar as eliminarDetalle,
    obtener as obtenerDetalle,
    listar as listarDetalle,
    crear as crearDetalle,
    actualizar as actualizarDetalle
} from "../../../../api/sistema/divisionModuloRegla.api";
import DivisionModuloReglaListPage from "../divisionmoduloregla/divisionModuloReglaListPage";
import DivisionModuloReglaEditPage from "../divisionmoduloregla/divisionModuloReglaEditPage";

const ModuloReglaIndexPage = () => {
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);

    const [reglas, setReglas] = useState([]);
    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [titulo, setTitulo] = useState("Listado");
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const classesEncabezado = useStylesEncabezado();
    const [focusedRowKey, setFocusedRowKey] = useState(1);
    //:::::::::::::::::::::::::::::::::::::::::::::-variables para regla modulo-:::::::::::::::::::::::::::::::::
    const [reglaModulos, setReglaModulos] = useState([]);
    const [dataRowEditNewDetalle, setDataRowEditNewDetalle] = useState({});
    const [modoEdicionDetalle, setModoEdicionDetalle] = useState(false);


    async function agregarRegla(regla) {

        const { IdRegla, IdModulo, Regla, Comentario, Activo } = regla;
        let params = {
            IdRegla: IdRegla.toUpperCase()
            , IdModulo: IdModulo
            , Regla: Regla.toUpperCase()
            , Comentario: Comentario.toUpperCase()
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await crear(params).then(response => {
            if (response) handleSuccessMessages("Se registró con éxito!");;
            setModoEdicion(false);
            listarReglas();
        }).catch(err => {
            //handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function actualizarRegla(regla) {

        const { IdRegla, IdModulo, Regla, Comentario, Activo } = regla;
        let params = {
            IdRegla: IdRegla.toUpperCase()
            , IdModulo: IdModulo
            , Regla: Regla.toUpperCase()
            , Comentario: Comentario.toUpperCase()
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await actualizar(params).then(() => {
            handleSuccessMessages("Se actualizó con éxito!");
            setModoEdicion(false);
            listarReglas();
        }).catch(err => {
            //handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function eliminarRegistro(regla) {
        const { IdModulo, IdRegla } = regla;

        await eliminar({ IdRegla: IdRegla, IdModulo: IdModulo, IdUsuario: usuario.username }).then(response => {
            handleSuccessMessages("Se eliminó con éxito!");
        }).catch(err => {
            //handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        listarReglas();
    }

    async function listarReglas() {

        let reglas = await listar({
            IdRegla: '%',
            IdModulo: '%',
            NumPagina: 0,
            TamPagina: 0
        }).catch(err => {
           // handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        setTitulo("Listado");
        setReglas(reglas);

    }

    async function obtenerRegla(filtro) {
        const { IdRegla, IdModulo } = filtro;

        if (IdRegla && IdModulo) {
            let regla = await obtener({ IdRegla: IdRegla, IdModulo: IdModulo }).catch(err => {
               // handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
            setDataRowEditNew({ ...regla, esNuevoRegistro: false });
        }
    }

    const nuevoRegistro = () => {
        let regla = { Activo: "S" };
        setDataRowEditNew({ ...regla, esNuevoRegistro: true });
        setDataRowEditNewDetalle({});
        listarReglaModulos({ IdModulo: "0", IdRegla: "0" });
        setTitulo("Nuevo");
        setModoEdicion(true);
    };

    const editarRegistro = dataRow => {
        const { IdRegla, IdModulo } = dataRow;
        let filtro = { IdRegla: IdRegla, IdModulo: IdModulo };
        setModoEdicion(true);
        setTitulo("Editar");
        obtenerRegla(filtro);
        listarReglaModulos(dataRow);
    };

    const cancelarEdicion = () => {
        setModoEdicion(false);
        setTitulo("Listado");
        setDataRowEditNew({});
    };

    const seleccionarRegistro = dataRow => {
        const { RowIndex } = dataRow;
        setFocusedRowKey(RowIndex);
    }

    useEffect(() => {
        listarReglas();

    }, []);
    //:::::::::::::::::::::::::::::::::::::::::::::-Funcinones - para regla modulo-:::::::::::::::::::::::::::::::::
    async function agregarReglaModulo(reglaModulo) {

        const { IdSecuencial, IdModulo, IdRegla, Activo, Nombre_Procedimiento } = reglaModulo;
        let params = {
            IdSecuencial: IdSecuencial === undefined ? 0 : IdSecuencial
            , IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdModulo: IdModulo
            , IdRegla: IdRegla
            , Activo: Activo
            , Nombre_Procedimiento: Nombre_Procedimiento.toUpperCase()
            , IdUsuario: usuario.username
        }
        await crearDetalle(
            params
        ).then(response => {
            if (response) handleSuccessMessages("Se registró con éxito!");
            setModoEdicionDetalle(false);
            setTitulo("Editar");
            listarReglaModulos(reglaModulo);
        }).catch(err => {
           // handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function actualizarReglaModulo(reglaModulo) {

        const { IdSecuencial, IdModulo, IdRegla, Activo, Nombre_Procedimiento } = reglaModulo;
        let params = {
            IdSecuencial: IdSecuencial === undefined ? 0 : IdSecuencial
            , IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdModulo: IdModulo
            , IdRegla: IdRegla
            , Activo: Activo
            , Nombre_Procedimiento: Nombre_Procedimiento.toUpperCase()
            , IdUsuario: usuario.username
        }
        await actualizarDetalle(params).then(() => {
            handleSuccessMessages("Se actualizó con éxito!");
            setModoEdicionDetalle(false);
            setTitulo("Editar");
            listarReglaModulos(reglaModulo);
        }).catch(err => {
          //  handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function eliminarRegistroDetalle(reglaModulo) {
        const { IdSecuencial, IdCliente, IdDivision, IdModulo, IdRegla } = reglaModulo;
        let params = { IdSecuencial: IdSecuencial, IdCliente: IdCliente, IdDivision: IdDivision, IdModulo: IdModulo, IdRegla: IdRegla, IdUsuario: usuario.username }
        await eliminarDetalle(params).then(() => {
            handleSuccessMessages("Se eliminó con éxito!");
        }).catch(err => {
          //  handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        listarReglaModulos(reglaModulo);
    }

    async function listarReglaModulos(filtro) {
        const { IdModulo, IdRegla } = filtro;
        let reglaModulos = await listarDetalle(
            {
                IdCliente: perfil.IdCliente
                , IdDivision: perfil.IdDivision
                , IdModulo: IdModulo
                , IdRegla: IdRegla
                , NumPagina: 0
                , TamPagina: 0
            }
        ).catch(err => {
           // handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        setTitulo("Listado");
        setReglaModulos(reglaModulos);
    }

    async function obtenerReglaModulo(filtro) {

        const { IdCliente, IdDivision, IdModulo, IdRegla, IdSecuencial } = filtro;
        if (IdCliente) {
            let reglaModulo = await obtenerDetalle({ IdCliente: IdCliente, IdDivision: IdDivision, IdModulo: IdModulo, IdRegla: IdRegla, IdSecuencial: IdSecuencial }).catch(err => {
               // handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
            setDataRowEditNewDetalle({ ...reglaModulo, esNuevoRegistro: false });
        }
    }

    const nuevoRegistroDetalle = () => {
        const { IdModulo, IdRegla } = dataRowEditNew;
        if (!IdRegla) {
            handleInfoMessages("Crear regla!");
        } else {
            let reglaModulo = { Activo: "S", IdModulo: IdModulo, IdRegla: IdRegla };
            setDataRowEditNewDetalle({ ...reglaModulo, esNuevoRegistro: true });
            setTitulo("Nuevo procedimiento");
            setModoEdicionDetalle(true);
        }
    };

    const editarRegistroDetalle = dataRow => {
        const { IdCliente, IdDivision, IdModulo, IdRegla, IdSecuencial } = dataRow;
        let filtro = { IdCliente: IdCliente, IdDivision: IdDivision, IdModulo: IdModulo, IdRegla: IdRegla, IdSecuencial: IdSecuencial }
        setModoEdicionDetalle(true);
        setTitulo("Editar procedimiento");
        obtenerReglaModulo(filtro);
    };

    const cancelarEdicionDetalle = () => {
        setModoEdicionDetalle(false);
        setTitulo("Listado");
        setDataRowEditNewDetalle({});
    };


    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {("Mantenimiento de regla").toUpperCase()}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        {modoEdicion && (
                            <>
                                {!modoEdicionDetalle && (
                                    <>
                                        <ReglaEditPage
                                            modoEdicion={modoEdicion}
                                            dataRowEditNew={dataRowEditNew}
                                            actualizarRegla={actualizarRegla}
                                            agregarRegla={agregarRegla}
                                            cancelarEdicion={cancelarEdicion}
                                            titulo={titulo}
                                        />
                                        <DivisionModuloReglaListPage
                                            reglaModulos={reglaModulos}
                                            editarRegistro={editarRegistroDetalle}
                                            eliminarRegistro={eliminarRegistroDetalle}
                                            nuevoRegistro={nuevoRegistroDetalle}
                                        />
                                        <div className="container_only">
                                            <div className="float-right">
                                                <ControlSwitch checked={auditoriaSwitch}
                                                    onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                                                />Datos de auditoría
                                        </div>
                                        </div>
                                        {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
                                    </>
                                )}{modoEdicionDetalle && (
                                    <>
                                        <DivisionModuloReglaEditPage
                                            modoEdicion={modoEdicionDetalle}
                                            dataRowEditNew={dataRowEditNewDetalle}
                                            actualizarReglaModulo={actualizarReglaModulo}
                                            agregarReglaModulo={agregarReglaModulo}
                                            cancelarEdicion={cancelarEdicionDetalle}
                                            titulo={titulo}
                                        />
                                        <div className="container_only">
                                            <div className="float-right">
                                                <ControlSwitch checked={auditoriaSwitch}
                                                    onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                                                />Datos de auditoría
                                        </div>
                                        </div>
                                        {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewDetalle} />)}
                                    </>
                                )}
                            </>
                        )}
                        {!modoEdicion && (
                            <ReglaListPage
                                reglas={reglas}
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

export default ModuloReglaIndexPage;
