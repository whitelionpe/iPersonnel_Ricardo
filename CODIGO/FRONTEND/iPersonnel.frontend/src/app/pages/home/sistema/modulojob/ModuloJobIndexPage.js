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
} from "../../../../api/sistema/modulojob.api";
import JobListPage from "./ModuloJobListPage";
import JobEditPage from "./ModuloJobEditPage";

import {
    eliminar as eliminarDetalle,
    obtener as obtenerDetalle,
    listar as listarDetalle,
    crear as crearDetalle,
    actualizar as actualizarDetalle
} from "../../../../api/sistema/divisionModuloJob.api";
import DivisionModuloJobListPage from "../divisionmodulojob/divisionModuloJobListPage";
import DivisionModuloJobEditPage from "../divisionmodulojob/divisionModuloJobEditPage";

const ModuloJobIndexPage = () => {
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);

    const [jobs, setJobs] = useState([]);
    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [titulo, setTitulo] = useState("Listado");
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const classesEncabezado = useStylesEncabezado();
    const [focusedRowKey, setFocusedRowKey] = useState(1);
    //:::::::::::::::::::::::::::::::::::::::::::::-variables para Job modulo-:::::::::::::::::::::::::::::::::
    const [jobModulos, setJobModulos] = useState([]);
    const [dataRowEditNewDetalle, setDataRowEditNewDetalle] = useState({});
    const [modoEdicionDetalle, setModoEdicionDetalle] = useState(false);


    async function agregarJob(job) {

        const { IdJob, IdModulo, Job, Comentario, Activo } = job;
        let params = {
            IdJob: IdJob.toUpperCase()
            , IdModulo: IdModulo
            , Job: Job.toUpperCase()
            , Comentario: Comentario.toUpperCase()
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await crear(params).then(response => {
            if (response) handleSuccessMessages("Se registró con éxito!");
            setModoEdicion(false);
            listarJobs();
        }).catch(err => {
            //handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function actualizarJob(job) {

        const { IdJob, IdModulo, Job, Comentario, Activo } = job;
        let params = {
            IdJob: IdJob.toUpperCase()
            , IdModulo: IdModulo
            , Job: Job.toUpperCase()
            , Comentario: Comentario.toUpperCase()
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await actualizar(params).then(() => {
            handleSuccessMessages("Se actualizó con éxito!");
            setModoEdicion(false);
            listarJobs();
        }).catch(err => {
            //handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function eliminarRegistro(job) {
        const { IdModulo, IdJob } = job;

        await eliminar({ IdJob: IdJob, IdModulo: IdModulo, IdUsuario: usuario.username }).then(response => {
            handleSuccessMessages("Se eliminó con éxito!");
        }).catch(err => {
            //handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        listarJobs();
    }

    async function listarJobs() {

        let jobs = await listar({
            IdModulo: '%',
            NumPagina: 0,
            TamPagina: 0
        }).catch(err => {
            //handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        setTitulo("Listado");
        setJobs(jobs);
    }

    async function obtenerJob(filtro) {
        const { IdJob, IdModulo } = filtro;

        if (IdJob && IdModulo) {
            let job = await obtener({ IdJob: IdJob, IdModulo: IdModulo }).catch(err => {
               // handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
            setDataRowEditNew({ ...job, esNuevoRegistro: false });
        }
    }

    const nuevoRegistro = () => {
        let job = { Activo: "S" };
        setDataRowEditNew({ ...job, esNuevoRegistro: true });
        setDataRowEditNewDetalle({});
        listarJobModulos({ IdModulo: "0", IdJob: "0" });
        setTitulo("Nuevo");
        setModoEdicion(true);
    };

    const editarRegistro = dataRow => {
        const { IdJob, IdModulo } = dataRow;
        let filtro = { IdJob: IdJob, IdModulo: IdModulo };
        setModoEdicion(true);
        setTitulo("Editar");
        obtenerJob(filtro);
        listarJobModulos(dataRow);
    };

    const cancelarEdicion = () => {
        setModoEdicion(false);
        setTitulo("Listado");
        setDataRowEditNew({});
    };

    const seleccionarRegistro = dataRow => {
        const { RowIndex } = dataRow;
        setFocusedRowKey(RowIndex);
    };


    useEffect(() => {
        listarJobs();

    }, []);
    //:::::::::::::::::::::::::::::::::::::::::::::-Funcinones - para Job modulo-:::::::::::::::::::::::::::::::::
    async function agregarJobModulo(jobModulo) {

        const { IdSecuencial, IdModulo, IdJob, Activo, Nombre_Procedimiento } = jobModulo;
        let params = {
            IdSecuencial: IdSecuencial === undefined ? 0 : IdSecuencial
            , IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdModulo: IdModulo
            , IdJob: IdJob
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
            listarJobModulos(jobModulo);
        }).catch(err => {
           // handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function actualizarJobModulo(jobModulo) {

        const { IdSecuencial, IdModulo, IdJob, Activo, Nombre_Procedimiento } = jobModulo;
        let params = {
            IdSecuencial: IdSecuencial === undefined ? 0 : IdSecuencial
            , IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdModulo: IdModulo
            , IdJob: IdJob
            , Activo: Activo
            , Nombre_Procedimiento: Nombre_Procedimiento.toUpperCase()
            , IdUsuario: usuario.username
        }
        await actualizarDetalle(
            params
        ).then(() => {
            handleSuccessMessages("Se actualizó con éxito!");
            setModoEdicionDetalle(false);
            setTitulo("Editar");
            listarJobModulos(jobModulo);
        }).catch(err => {
           // handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function eliminarRegistroDetalle(jobModulo) {
        const { IdSecuencial, IdCliente, IdDivision, IdModulo, IdJob } = jobModulo;
        let params = { IdSecuencial: IdSecuencial, IdCliente: IdCliente, IdDivision: IdDivision, IdModulo: IdModulo, IdJob: IdJob, IdUsuario: usuario.username }
        await eliminarDetalle(params).then(() => {
            handleSuccessMessages("Se eliminó con éxito!");
        }).catch(err => {
           // handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        listarJobModulos(jobModulo);
    }

    async function listarJobModulos(filtro) {
        const { IdModulo, IdJob } = filtro;
        let jobModulos = await listarDetalle(
            {
                IdCliente: perfil.IdCliente
                , IdDivision: perfil.IdDivision
                , IdModulo: IdModulo
                , IdJob: IdJob
                , NumPagina: 0
                , TamPagina: 0
            }
        ).catch(err => {
           // handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        setTitulo("Listado");
        setJobModulos(jobModulos);
    }

    async function obtenerJobModulo(filtro) {

        const { IdCliente, IdDivision, IdModulo, IdJob, IdSecuencial } = filtro;
        if (IdCliente) {
            let reglaModulo = await obtenerDetalle({ IdCliente: IdCliente, IdDivision: IdDivision, IdModulo: IdModulo, IdJob: IdJob, IdSecuencial: IdSecuencial }).catch(err => {
               // handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
            setDataRowEditNewDetalle({ ...reglaModulo, esNuevoRegistro: false });
        }
    }

    const nuevoRegistroDetalle = () => {
        const { IdModulo, IdJob } = dataRowEditNew;
        if (!IdJob) {
            handleInfoMessages("Crear Job!");
        } else {
            let jobModulo = { Activo: "S", IdModulo: IdModulo, IdJob: IdJob };
            setDataRowEditNewDetalle({ ...jobModulo, esNuevoRegistro: true });
            setTitulo("Nuevo procedimiento");
            setModoEdicionDetalle(true);
        }
    };

    const editarRegistroDetalle = dataRow => {
        const { IdCliente, IdDivision, IdModulo, IdJob, IdSecuencial } = dataRow;
        let filtro = { IdCliente: IdCliente, IdDivision: IdDivision, IdModulo: IdModulo, IdJob: IdJob, IdSecuencial: IdSecuencial }
        setModoEdicionDetalle(true);
        setTitulo("Editar procedimiento");
        obtenerJobModulo(filtro);
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
                                    {("Mantenimiento de Job").toUpperCase()}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        {modoEdicion && (
                            <>
                                {!modoEdicionDetalle && (
                                    <>
                                        <JobEditPage
                                            modoEdicion={modoEdicion}
                                            dataRowEditNew={dataRowEditNew}
                                            actualizarJob={actualizarJob}
                                            agregarJob={agregarJob}
                                            cancelarEdicion={cancelarEdicion}
                                            titulo={titulo}
                                        />
                                        <DivisionModuloJobListPage
                                            jobModulos={jobModulos}
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
                                        <DivisionModuloJobEditPage
                                            modoEdicion={modoEdicionDetalle}
                                            dataRowEditNew={dataRowEditNewDetalle}
                                            actualizarJobModulo={actualizarJobModulo}
                                            agregarJobModulo={agregarJobModulo}
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
                            <JobListPage
                                jobs={jobs}
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

export default ModuloJobIndexPage;
