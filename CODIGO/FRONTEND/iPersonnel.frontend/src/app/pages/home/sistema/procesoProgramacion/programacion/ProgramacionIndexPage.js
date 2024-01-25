import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import { isNotEmpty, dateFormat } from "../../../../../../_metronic";
import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../../partials/components/Confirm";

import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";

import { service } from "../../../../../api/sistema/procesoProgramacion.api";
import ProgramacionEditPage from "./ProgramacionEditPage";
import ProgramacionListPage from "./ProgramacionListPage";


const ProgramacionIndexPage = (props) => {

    const { intl, setLoading, dataMenu, varIdCliente, varIdProceso, getInfo, accessButton, cancelarEdicion } = props;
    const usuario = useSelector(state => state.auth.user);
    const { IdCliente } = useSelector(state => state.perfil.perfilActual);
    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();

    const [focusedRowKeyProcesoProgramacion, setFocusedRowKeyProcesoProgramacion] = useState();

    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);

    const [isVisible, setIsVisible] = useState(false);
    const [dataRowEditNew, setDataRowEditNew] = useState({});

    const [listarTabs, setListarTabs] = useState([]);
    const [selectedDelete, setSelectedDelete] = useState({});
    const [instance, setInstance] = useState({});
    const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.EDIT" }));
    const [varIdProgramacion, setVarIdProgramacion] = useState("");

    useEffect(() => {
        listarProcesoProgramacion();

    }, []);


    async function agregarProcesoProgramacion(dataRow) {
        setLoading(true);
        const { IdProceso, IdProgramacion, Programacion, Frecuencia, FrecuenciaEjecucion, Lunes, Martes, Miercoles,
            Jueves, Viernes, Sabado, Domingo, UnaEjecucion, HoraEjecucion, UnidadTiempo, RepetirCadaTiempo,
            HoraInicio, HoraFin, TerminaEjecutarse, FechaInicio, FechaFin, Activo } = dataRow;
        let params = {
            IdCliente: varIdCliente
            , IdProceso: varIdProceso
            , IdProgramacion: isNotEmpty(IdProgramacion) ? IdProgramacion : 0
            , Programacion: isNotEmpty(Programacion) ? Programacion.toUpperCase() : ""
            , Frecuencia: Frecuencia
            , FrecuenciaEjecucion: isNotEmpty(FrecuenciaEjecucion) ? FrecuenciaEjecucion : 0
            , Lunes: (Lunes) ? "S" : "N"
            , Martes: (Martes) ? "S" : "N"
            , Miercoles: (Miercoles) ? "S" : "N"
            , Jueves: (Jueves) ? "S" : "N"
            , Viernes: (Viernes) ? "S" : "N"
            , Sabado: (Sabado) ? "S" : "N"
            , Domingo: (Domingo) ? "S" : "N"
            , UnaEjecucion
            , HoraEjecucion: isNotEmpty(HoraEjecucion) ? dateFormat(HoraEjecucion, "hh:mm") : ""
            , UnidadTiempo
            , RepetirCadaTiempo: isNotEmpty(RepetirCadaTiempo) ? RepetirCadaTiempo : 0
            , HoraInicio: isNotEmpty(HoraInicio) ? dateFormat(HoraInicio, "hh:mm") : ""
            , HoraFin: isNotEmpty(HoraFin) ? dateFormat(HoraFin, "hh:mm") : ""
            , TerminaEjecutarse
            , FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : ""
            , FechaFin: TerminaEjecutarse === "S" ? dateFormat(FechaFin, 'yyyyMMdd') : "" //isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : ""
            , Activo
            , IdUsuario: usuario.username
        }
        await service.crear(params).then(response => {
            if (response)
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            listarProcesoProgramacion();
            setModoEdicion(false);
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    async function actualizarProcesoProgramacion(dataRow) {
        setLoading(true);
        const { IdCliente, IdProgramacion, Programacion, Frecuencia, FrecuenciaEjecucion, Lunes, Martes, Miercoles,
            Jueves, Viernes, Sabado, Domingo, UnaEjecucion, HoraEjecucion, UnidadTiempo, RepetirCadaTiempo,
            HoraInicio, HoraFin, TerminaEjecutarse, FechaInicio, FechaFin, Activo } = dataRow;
        // console.log("datos", dataRow);
        let params = {
            IdCliente: varIdCliente
            , IdProceso: varIdProceso
            , IdProgramacion: isNotEmpty(IdProgramacion) ? IdProgramacion : 0
            , Programacion: isNotEmpty(Programacion) ? Programacion.toUpperCase() : ""
            , Frecuencia: Frecuencia
            , FrecuenciaEjecucion: isNotEmpty(FrecuenciaEjecucion) ? FrecuenciaEjecucion : 0
            , Lunes: (Lunes) ? "S" : "N"
            , Martes: (Martes) ? "S" : "N"
            , Miercoles: (Miercoles) ? "S" : "N"
            , Jueves: (Jueves) ? "S" : "N"
            , Viernes: (Viernes) ? "S" : "N"
            , Sabado: (Sabado) ? "S" : "N"
            , Domingo: (Domingo) ? "S" : "N"
            , UnaEjecucion
            , HoraEjecucion: isNotEmpty(HoraEjecucion) ? dateFormat(HoraEjecucion, "hh:mm") : ""
            , UnidadTiempo
            , RepetirCadaTiempo: isNotEmpty(RepetirCadaTiempo) ? RepetirCadaTiempo : 0
            , HoraInicio: isNotEmpty(HoraInicio) ? dateFormat(HoraInicio, "hh:mm") : ""
            , HoraFin: isNotEmpty(HoraFin) ? dateFormat(HoraFin, "hh:mm") : ""
            , TerminaEjecutarse
            , FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : ""
            , FechaFin: TerminaEjecutarse === "S" ? dateFormat(FechaFin, 'yyyyMMdd') : "" //isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : ""
            , Activo
            , IdUsuario: usuario.username
        }
        await service.actualizar(params).then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            listarProcesoProgramacion();
            setModoEdicion(false);
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    async function eliminarProcesoProgramacion(dataRow, confirm) {
        setSelectedDelete(dataRow);
        setIsVisible(true);
        if (confirm) {
            setLoading(true);
            const { IdProceso, IdProgramacion } = dataRow;
            await service.eliminar({
                IdCliente: varIdCliente,
                IdProceso: varIdProceso,
                IdProgramacion
            }).then((result) => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
                listarProcesoProgramacion();
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
        }
    }

    async function listarProcesoProgramacion() {
        setLoading(true);
        let programaciones = await service.listar({
            IdCliente: varIdCliente
            , IdProceso: varIdProceso
            , IdProgramacion: 0
            , NumPagina: 0
            , TamPagina: 0
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false) });
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setListarTabs(programaciones);
    }

    async function obtenerProcesoProgramacion(dataRow) {
        setLoading(true);
        const { IdProgramacion } = dataRow;
        await service.obtener({
            IdCliente: varIdCliente
            , IdProceso: varIdProceso
            , IdProgramacion: IdProgramacion
        }).then(procesoProgramacion => {
            //console.log("obtenerProcesoProgramacion data:", procesoProgramacion);
            procesoProgramacion.Lunes = procesoProgramacion.Lunes === "S" ? true : false;
            procesoProgramacion.Martes = procesoProgramacion.Martes === "S" ? true : false;
            procesoProgramacion.Miercoles = procesoProgramacion.Miercoles === "S" ? true : false;
            procesoProgramacion.Jueves = procesoProgramacion.Jueves === "S" ? true : false;
            procesoProgramacion.Viernes = procesoProgramacion.Viernes === "S" ? true : false;
            procesoProgramacion.Sabado = procesoProgramacion.Sabado === "S" ? true : false;
            procesoProgramacion.Domingo = procesoProgramacion.Domingo === "S" ? true : false;

            procesoProgramacion.HoraEjecucion = "2020-01-01 " + procesoProgramacion.HoraEjecucion;
            procesoProgramacion.HoraInicio = "2020-01-01 " + procesoProgramacion.HoraInicio;
            procesoProgramacion.HoraFin = "2020-01-01 " + procesoProgramacion.HoraFin

            setDataRowEditNew({ ...procesoProgramacion, esNuevoRegistro: false });
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    const seleccionarProcesoProgramacion = dataRow => {
        const { IdProgramacion, RowIndex } = dataRow;
        setVarIdProgramacion(IdProgramacion);
        setFocusedRowKeyProcesoProgramacion(RowIndex);
    };

    const editarProcesoProgramacion = async (dataRow) => {
        const { IdProceso, IdProgramacion, RowIndex } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        setFocusedRowKeyProcesoProgramacion(RowIndex);
        await obtenerProcesoProgramacion(dataRow);
    };

    const cancelarProcesoProgramacion = () => {
        props.changeTabIndex(3);
    };

    const cancelarProcesoProgramacionList = () => {
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
    };

    const nuevoProcesoProgramacion = (e) => {
        //let hoy = new Date();
        //let fecFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        let nuevo = {
            Activo: "S",
            TerminaEjecutarse: "N",
            UnaEjecucion: "N",
            UnidadTiempo: "H",
            HoraEjecucion: "2020-01-01 00:00:00.000",
            HoraInicio: "2020-01-01 00:00:00.000",
            HoraFin: "2020-01-01 23:59:00.000",
            FechaInicio: new Date(),
            //FechaFin: fecFin,
            RepetirCadaTiempo: 1,
            Frecuencia: "D",
            FrecuenciaEjecucion: 1
        };
        setDataRowEditNew({ ...nuevo, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);

    };

    //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
    return <>
        {modoEdicion && (
            <>
                <ProgramacionEditPage
                    //tituloApp={titulo}
                    modoEdicion={modoEdicion}
                    dataRowEditNew={dataRowEditNew}
                    agregarProcesoProgramacion={agregarProcesoProgramacion}
                    actualizarProcesoProgramacion={actualizarProcesoProgramacion}
                    cancelarEdicion={cancelarProcesoProgramacionList}
                    accessButton={accessButton}
                    //settingDataField={dataMenu.datos}
                    getInfo={getInfo}
                    varIdProceso={varIdProceso}
                    titulo={tituloTabs}
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
            <>
                <ProgramacionListPage
                    programaciones={listarTabs}
                    seleccionarRegistro={seleccionarProcesoProgramacion}
                    editarRegistro={editarProcesoProgramacion}
                    eliminarRegistro={eliminarProcesoProgramacion}
                    nuevoRegistro={nuevoProcesoProgramacion}
                    cancelarEdicion={cancelarProcesoProgramacion}
                    focusedRowKey={focusedRowKeyProcesoProgramacion}
                    getInfo={getInfo}
                    accessButton={accessButton}
                    titulo={tituloTabs}
                />
            </>
        )}

        <Confirm
            message={intl.formatMessage({ id: "ALERT.REMOVE" })}
            isVisible={isVisible}
            setIsVisible={setIsVisible}
            setInstance={setInstance}
            onConfirm={() => eliminarProcesoProgramacion(selectedDelete, true)}
            title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
            confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
            cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
        />

    </>

};

//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

export default injectIntl(WithLoandingPanel(ProgramacionIndexPage));
