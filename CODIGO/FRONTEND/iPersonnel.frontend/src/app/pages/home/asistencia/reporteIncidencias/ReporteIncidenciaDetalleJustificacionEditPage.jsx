import React, { useEffect, useState } from 'react';
import { Button, Form, Popup } from 'devextreme-react';
import { GroupItem, Item } from 'devextreme-react/form';
import { addDaysToDate, convertyyyyMMddToDate, dateFormat, isNotEmpty, listarEstado, listarEstadoSimple } from "../../../../../_metronic";
import FileUploader from '../../../../partials/content/FileUploader';
import { obtener as obtenerJusti } from "../../../../api/asistencia/justificacion.api";
import { useSelector } from "react-redux";
import { isRequired } from '../../../../../_metronic/utils/securityUtils';
import { useStylesEncabezado } from '../../../../store/config/Styles';
import WithLoandingPanel from '../../../../partials/content/withLoandingPanel';
import { injectIntl } from 'react-intl';
import { obtener as obtenerAjuste } from "../../../../api/asistencia/bolsaHoras.api";
import { handleErrorMessages, handleSuccessMessages } from '../../../../store/ducks/notify-messages';
import AsistenciaPersonaJustificacionBuscar from '../../../../partials/components/AsistenciaPersonaJustificacionBuscar';
import { horarioActual } from '../../../../api/asistencia/personaHorario.api';
import { uploadFile } from '../../../../api/helpers/fileBase64.api';
import { crear } from "../../../../api/asistencia/personaJustificacion.api";
import { each } from 'lodash';


const ReporteIncidenciaDetalleJustificacionEditPage = ({
    showPopup,
    intl,
    dataRowEditNew,
    modoEdicion = true,
    // incidentList = [],
    // justificationList = [],
    height = "450px",
    width = "750px",
    setLoading,
    // saveJustificationsByPeople,
    maxSizeFile = "",
    //----------------
    reloadSavedJustification,
    dataMenu,
    usuario,

}) => {

    const [justificationData, setJustificationData] = useState({ IdPersona: 0, Fecha: '', NombreCompleto: '', Posicion: '' });
    const perfil = useSelector(state => state.perfil.perfilActual);

    const settingDataField = dataMenu.datos;
    const [dataRow, setDataRow] = useState(dataRowEditNew);
    const [dataPersonaHorario, setDataPersonaHorario] = useState(null);

    // const [modoEdicion, setModoEdicion] = useState(false);

    const classesEncabezado = useStylesEncabezado();
    const [isVisiblePopUpJustificacion, setisVisiblePopUpJustificacion] = useState(false);
    const [estadoSimple, setEstadoSimple] = useState([]);
    const [estado, setEstado] = useState([]);

    const [filtroLocal, setFiltroLocal] = useState({ IdCliente: perfil.IdCliente, IdCompania: dataRowEditNew.IdCompania, IdPersona: dataRowEditNew.IdPersona, Activo: "S", AplicaPorDia: dataRowEditNew.AplicaPorDia });
    const [dateJustifiedReadOnly, setDateJustifiedReadOnly] = useState(true);
    const [isCHE, setIsCHE] = useState(true);
    const [hourReadOnly, setHourReadOnly] = useState(true);
    const [showPopupResumen, setShowPopupResumen] = useState(false);
    const [dayCompleteReadOnly, setDayCompleteReadOnly] = useState(false);
    const [isObservationRequired, setIsObservationRequired] = useState(false);
    const [itemRequiereObservacion, setItemRequiereObservacion] = useState(true);

    //const [personaHorario, setPersonaHorario] = useState({}); //{ Turno: "", HoraEntrada: "", InicioRefrigerio: "", FinRefrigerio: "", HoraSalida: "" }
    const [horaEntradaMin, setHoraEntradaMin] = useState("");
    const [horaEntradaMax, setHoraEntradaMax] = useState("");
    const [fechaInicioMin, setFechaInicioMin] = useState(new Date());
    const [fechaFinMin, setFechaFinMin] = useState(new Date());
    const [fechaFinMax, setFechaFinMax] = useState(new Date());


    const [saldoActual, setSaldoActual] = useState({ SaldoActual: "", Minutos: 0 });
    const [saldoCompensado, setSaldoCompensado] = useState({ SaldoCompensado: "", Minutos: 0 });
    const [mostrarDescCompensacion, setMostrarDescCompensacion] = useState(false);

    const grabar = (e) => {
        let result = e.validationGroup.validate();
        if (result.isValid) {
            document.getElementById("btnUploadFile").click();
            if (dataRow.esNuevoRegistro) { 
                agregarPersonaJustificacion(dataRow);
            }
        }
    }

    async function agregarPersonaJustificacion(datarow) {
        setLoading(true);
        const { IdCompania, IdJustificacion, Observacion, Justificacion,
            FechaInicio, FechaFin, FechaAsistencia, FechaHoraInicio, FechaHoraFin, DiaCompleto, Activo, CompensarHorasExtras,
            CompensarHEPorPagar, Turno } = datarow;
        const { FileBase64, NombreArchivo, FechaArchivo } = justificationData;


        // console.log("***agregarPersonaJustificacion:> datarow :> ", datarow);
        let params = {
            IdCliente: perfil.IdCliente
            , IdDivision : perfil.IdDivision
            , IdPersona: dataRowEditNew.IdPersona
            , IdCompania: isNotEmpty(IdCompania) ? IdCompania : ""
            , IdJustificacion: isNotEmpty(IdJustificacion) ? IdJustificacion : ""
            , IdSecuencialJustificacion: 0
            , Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : ""
            , NombreArchivo: isNotEmpty(NombreArchivo) ? NombreArchivo : ""
            , IdItemSharepoint: ""
            , FechaArchivo: isNotEmpty(FechaArchivo) ? FechaArchivo : ""
            , FileBase64: isNotEmpty(FileBase64) ? FileBase64 : ""
            , ClaseArchivo: isNotEmpty(Justificacion) ? Justificacion : ""
            , FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd')
            , FechaFin: dateFormat(FechaFin, 'yyyyMMdd')
            , Turno
            //Detalle -- PersonaJustificacionDia
            , DiaCompleto: DiaCompleto
            , FechaAsistencia: dateFormat(FechaAsistencia, 'yyyyMMdd')
            , FechaHoraInicio: dateFormat(FechaHoraInicio, "yyyyMMdd hh:mm")
            , FechaHoraFin: dateFormat(FechaHoraFin, "yyyyMMdd hh:mm")
            , Activo: Activo
            , CompensarHorasExtras: CompensarHorasExtras
            , CompensarHEPorPagar: CompensarHEPorPagar
            , IdUsuario: usuario.username,
            PathFile: "",
            IdModulo: dataMenu.info.IdModulo,
            IdAplicacion: dataMenu.info.IdAplicacion,
            IdMenu: dataMenu.info.IdMenu
        };

        if (isNotEmpty(FileBase64)) {
            await uploadFile(params).then(response => {
                const { nombreArchivo,idItemSharepoint } = response;
                params.NombreArchivo = nombreArchivo;
                params.IdItemSharepoint = isNotEmpty(idItemSharepoint)?idItemSharepoint:'';
                crear(params)
                    .then((response) => {
                        if (response) {
                            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
                            reloadSavedJustification();
                        }
                    })
                    .catch((err) => {
                        if (err.response.status == 400)
                            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: err.response.data.responseException.exceptionMessage }), true)
                        else
                            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
                    }).finally(() => { setLoading(false); });
            }).catch((err) => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
        } else {
            await crear(params)
                .then((response) => {
                    if (response) {
                        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
                        reloadSavedJustification();
                    }
                })
                .catch((err) => {
                    if (err.response.status == 400)
                        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: err.response.data.responseException.exceptionMessage }), true)
                    else
                        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
                }).finally(() => { setLoading(false); });
        }
    }


    //***Archivo
    const onFileUploader = (data) => {
        const { file, fileName, fileDate } = data;
        //console.log("onFileUploader", { data });
        /* setJustificationData(prev => ({
             ...prev,
             FileBase64: file,
             NombreArchivo: fileName,
             FechaArchivo: fileDate
         }));*/
        justificationData.FileBase64 = file;
        justificationData.NombreArchivo = fileName;
        justificationData.FechaArchivo = fileDate;
    }


    //****************CARGA INICIAL********************* */
    async function cargarCombos() {
        let estadoSimple = listarEstadoSimple();
        setEstadoSimple(estadoSimple);
        let estado = listarEstado();
        setEstado(estado);
    }

    //***************Metodos********************** */

    //***Horario
    const obtenerPersonaHorario = async () => {

        setLoading(true);
        await horarioActual({
            IdCliente: perfil.IdCliente,
            IdDivision: perfil.IdDivision,
            IdPersona: dataRowEditNew.IdPersona,
            Fecha: dataRowEditNew.FechaAsistencia//dateFormat(varFecha, 'yyyyMMdd')
        }).then(response => {
            console.log("obtenerPersonaHorario :: response ::> ", response);
            setDataPersonaHorario(response);
            const { FechaInicio, FechaFin, HoraEntradaInicio, HoraEntradaFin, Turno, HoraSalidaFin } = response;
            console.log(FechaInicio, FechaFin, HoraEntradaInicio, HoraEntradaFin, Turno, HoraSalidaFin);
            //setPersonaHorario(data);
            // console.log(new Date(HoraEntradaInicio));
            // console.log(new Date(HoraEntradaFin));
            // console.log(new Date(HoraSalidaFin));
            const varFechaInicio = convertyyyyMMddToDate(FechaInicio);
            const varFechaMin = convertyyyyMMddToDate(dataRowEditNew.FechaAsistencia);
            const varFechaMax = convertyyyyMMddToDate(FechaFin);
            const varHoraEntradaMin = new Date(HoraEntradaInicio);
            const varHoraEntradaMax = Turno == 'N' ? addDaysToDate(new Date(HoraSalidaFin), 1) : new Date(HoraEntradaFin);

            setFechaInicioMin(varFechaInicio);
            setFechaFinMin(varFechaMin);
            setFechaFinMax(varFechaMax);
            setHoraEntradaMin(varHoraEntradaMin);
            setHoraEntradaMax(varHoraEntradaMax);

        }).catch((err) => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false) });


    }

    //***Bolsa Horas
    function obtenerResultadoCompensado(minutosSaldo) {
        const tiempoInicial = new Date(dataRow.FechaHoraInicio); //getMin
        const tiempoFinal = new Date(dataRow.FechaHoraFin); //getMinFinal

        const minutosTiempoInicial = (tiempoInicial.getHours()) * 60 + (tiempoInicial.getMinutes());
        const minutosTiempoFinal = (tiempoFinal.getHours()) * 60 + (tiempoFinal.getMinutes());

        const resultado = minutosSaldo + (minutosTiempoFinal - minutosTiempoInicial) * (-1);

        // console.log("--> minutosSaldo :> ", minutosSaldo);
        // console.log("--> minutosTiempoInicial :> ", minutosTiempoInicial);
        // console.log("--> minutosTiempoFinal :> ", minutosTiempoFinal);

        setSaldoCompensado({
            SaldoCompensado: convertirMinutosFormato(resultado),
            Minutos: resultado
        });

    }
    function convertirMinutosFormato(totalMinutes) {
        const signo = totalMinutes < 0 ? "-" : "";
        totalMinutes = totalMinutes * (totalMinutes < 0 ? -1 : 1);
        const hora = Math.floor(totalMinutes / 60);
        const minuto = totalMinutes % 60;
        const tiempo = signo + String(hora.toString()).padStart(2, '0') + ":" + String(minuto.toString()).padStart(2, '0');

        return tiempo;
    }
    const seleccionarCompensarHoras = (e) => {
        if (isNotEmpty(e.value)) {
            console.log("ENTER :> seleccionarCompensarHoras() ::> ", e);
            setIsCHE(e.value === 'S' ? false : true);

            if (e.value === 'S') {
                obtenerBolsaHoras();
                setMostrarDescCompensacion(true);
            } else {
                setMostrarDescCompensacion(false);
            }

        }
    }
    async function obtenerBolsaHoras() {
        setLoading(true);
        await obtenerAjuste({
            IdCliente: perfil.IdCliente,
            IdPersona: dataRowEditNew.IdPersona,
            IdCompania: dataRowEditNew.IdCompania
        }).then(data => {
            const { Fecha, SaldoFinal, MinutosSaldoFinal } = data;
            setSaldoActual({ SaldoActual: SaldoFinal, Minutos: MinutosSaldoFinal });
            obtenerResultadoCompensado(MinutosSaldoFinal);
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }


    //***Justificación
    const obtenerAsistenciaJustificacion = async (idJustificacion) => {
        console.log("**ENTER TO obtenerAsistenciaJustificacion()");
        setLoading(true);
        await obtenerJusti({
            IdCliente: perfil.IdCliente,
            IdCompania: dataRowEditNew.IdCompania,
            IdJustificacion: idJustificacion,
        }).then(data => {
            const { AplicaPorDia, AplicaPorHora, RequiereObservacion, RequiereAutorizacion } = data;
            let DiaCompleto = AplicaPorDia;
            const { HoraEntradaInicio, HoraEntradaFin, HoraSalidaFin, Turno } = dataPersonaHorario;
            const { JustificacionDiaCompleto } = dataRow;

            console.log("**dataRow**:> ", dataRow);
            console.log("**data**:> ", data);

            //Validamos si el turno es Nocturno
            let FechaHoraInicio = new Date(HoraEntradaInicio);
            let FechaHoraFin;
            if (Turno === 'N') {
                //Agrega un dia  
                FechaHoraFin = addDaysToDate(new Date(HoraSalidaFin), 1);
            } else {
                FechaHoraFin = new Date(HoraEntradaFin);
            }


            if (AplicaPorDia === 'S' && AplicaPorHora === 'N') {
                setDayCompleteReadOnly(true);   //combo Dia Completo bloqueado
                setHourReadOnly(true);//combo horas bloqueado
                setDateJustifiedReadOnly(false);
            } else if (AplicaPorDia === 'N' && AplicaPorHora === 'S') {
                setDayCompleteReadOnly(true); //combo Dia Completo bloqueado
                setHourReadOnly(false); //combo horas disponible
                setDateJustifiedReadOnly(false);
            } else if (AplicaPorDia === 'S' && AplicaPorHora === 'S') {
                // setDayCompleteReadOnly(false);  //combo Dia Completo disponible
                // setHourReadOnly(true); //Combo Horas disponible
                // setDateJustifiedReadOnly(false);

                setDayCompleteReadOnly(false);  //combo Dia Completo disponible
                
                if (JustificacionDiaCompleto === 'S') {
                    DiaCompleto = 'S';
                    setHourReadOnly(true); //Combo Horas disponible
                } else {
                    DiaCompleto = 'N'; 
                    setHourReadOnly(false); //Combo Horas disponible
                }

                setDateJustifiedReadOnly(false);
            }

            //JDL->
            setDataRow({
                ...dataRow, ...data, DiaCompleto,
                HoraEntradaInicio,
                HoraEntradaFin,
                HoraSalidaFin, Turno,
                FechaHoraInicio, FechaHoraFin
            });

        }).finally(() => { setLoading(false) });
    }

    const agregarJustificacion = async (justificaciones) => {
        const { IdJustificacion, Justificacion } = justificaciones[0];
        dataRow.IdJustificacion = IdJustificacion;
        dataRow.Justificacion = Justificacion;
        await obtenerAsistenciaJustificacion(IdJustificacion);
    };

    const abrirPopUpJustificacion = async (e) => {
        setisVisiblePopUpJustificacion(true);
    }

    const cambioDiaCompleto = async (e) => {

        const { HoraEntradaInicio, HoraEntradaFin, HoraSalidaFin, Turno } = dataPersonaHorario;
        //Validamos si el turno es Nocturno
        let FechaHoraInicio = new Date(HoraEntradaInicio);
        let FechaHoraFin;
        if (Turno === 'N') {
            //Agrega un dia  
            FechaHoraFin = addDaysToDate(new Date(HoraSalidaFin), 1);
        } else {
            FechaHoraFin = new Date(HoraEntradaFin);
        }

        console.log("***FechaHoraInicio:>", FechaHoraInicio);
        console.log("***FechaHoraFin:>", FechaHoraFin);

        if (e.value === 'S') {
            dataRow.FechaHoraInicio = FechaHoraInicio
            dataRow.FechaHoraFin = FechaHoraFin
        }

        setHourReadOnly(e.value === 'S' ? true : false);


    }


    useEffect(() => {
        setLoading(true);
        //CargaInicial
        cargarCombos();
        obtenerPersonaHorario();
    }, []);


    return (
        <Popup
            visible={showPopup.isVisiblePopUp}
            dragEnabled={false}
            closeOnOutsideClick={false}
            showTitle={true}
            height={height}
            width={width}
            title={(intl.formatMessage({ id: "ASISTENCIA.REPORT.INCIDENCIAS.JUSTIFICATION.TITLE" }).toUpperCase())}
            onHiding={() => showPopup.setisVisiblePopUp(!showPopup.isVisiblePopUp)}
        >


            <div className="row" >
                <div className='col-12' style={{ textAlign: "right" }}>
                    <Button
                        icon="fa fa-save"
                        type="default"
                        hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                        useSubmitBehavior={true}
                        validationGroup="FormJustificacion"
                        onClick={grabar}//aceptar
                    />
                </div>
            </div>


            {/* Datos de la Justificación */}
            <fieldset className="scheduler-border"  >
                <legend className="scheduler-border" >
                    <h5> {intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.DETAIL" }).toUpperCase()}</h5>
                </legend>
                <br></br>
                <Form formData={dataRow}
                    validationGroup="FormJustificacion"
                    onFieldDataChanged={(e) => {
                        const { FechaHoraInicio, FechaHoraFin, FechaInicio } = dataRow;
                        if (e.dataField == 'FechaHoraInicio' || e.dataField == 'FechaHoraFin') {
                            obtenerResultadoCompensado(saldoActual.Minutos);
                        }
                        if (e.dataField == 'FechaInicio') {
                            setFechaFinMin(FechaInicio);
                        }
                    }}
                >
                    <GroupItem colCount={8} colSpan={8} >

                        <Item dataField="IdCompania" visible={false} />
                        <Item dataField="IdJustificacion" visible={false} />
                        <Item dataField="FileBase64" visible={false} />
                        <Item dataField="NombreArchivo" visible={false} />
                        <Item dataField="FechaArchivo" visible={false} />
                        <Item dataField="RequiereAutorizacion" visible={false} />
                        <Item dataField="IdHorario" visible={false} />
                        <Item dataField="IdSecuencialJustificacion" visible={false} />

                        <GroupItem itemType="group" colSpan={4} >
                            <GroupItem colCount={4} >

                                <Item
                                    dataField="Justificacion"
                                    colSpan={4}
                                    isRequired={modoEdicion}
                                    label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION" }), }}
                                    editorOptions={{
                                        readOnly: (modoEdicion ? (dataRow.esNuevoRegistro ? false : true) : false),
                                        hoverStateEnabled: false,
                                        inputAttr: { style: "text-transform: uppercase" },
                                        showClearButton: true,
                                        buttons: [
                                            {
                                                name: "search",
                                                location: "after",
                                                useSubmitBehavior: true,
                                                options: {
                                                    stylingMode: "text",
                                                    icon: "search",
                                                    onClick: abrirPopUpJustificacion
                                                    // (evt) => {
                                                    //     setisVisiblePopUpJustificacion(true);//Inconveniente log ---E1035 
                                                    // },
                                                },
                                            },
                                        ],
                                        //onValueChanged: (e) => { if (!dataRowEditNew.esNuevoRegistro) obtenerAsistenciaJustificacion(dataRowEditNew.IdJustificacion) }
                                    }}
                                />

                                <Item
                                    dataField="DiaCompleto"
                                    label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.DAY" }) }}
                                    editorType="dxSelectBox"
                                    isRequired={modoEdicion ? isRequired('DiaCompleto', settingDataField) : false}
                                    colSpan={2}
                                    editorOptions={{
                                        items: estado,
                                        valueExpr: "Valor",
                                        displayExpr: "Descripcion",
                                        onValueChanged: (e) => {
                                            cambioDiaCompleto(e);
                                        },
                                        readOnly: dataRow.esNuevoRegistro && dayCompleteReadOnly ? true : false //dayCompleteReadOnly
                                    }}
                                />

                                <Item colSpan={2} />

                                <Item
                                    dataField="FechaHoraInicio"
                                    isRequired={true}
                                    colSpan={2}
                                    label={{ text: intl.formatMessage({ id: "ACCESS.REPORT.STARTTIME" }) }}
                                    editorType="dxDateBox"
                                    editorOptions={{
                                        //showClearButton: true,
                                        useMaskBehavior: true,
                                        maxLength: 5,
                                        displayFormat: "HH:mm",
                                        type: "time",
                                        min: horaEntradaMin,
                                        max: horaEntradaMax,
                                        readOnly: dataRow.esNuevoRegistro && hourReadOnly ? true : false
                                    }}
                                />
                                <Item
                                    dataField="FechaHoraFin"
                                    label={{ text: intl.formatMessage({ id: "ACCESS.REPORT.ENDTIME" }) }}
                                    isRequired={true}
                                    colSpan={2}
                                    editorType="dxDateBox"
                                    editorOptions={{
                                        //showClearButton: true,
                                        useMaskBehavior: true,
                                        maxLength: 5,
                                        displayFormat: "HH:mm",
                                        type: "time",
                                        min: horaEntradaMin,
                                        max: horaEntradaMax,
                                        readOnly: dataRow.esNuevoRegistro && hourReadOnly ? true : false
                                    }}
                                />

                                <Item
                                    dataField="CompensarHorasExtras"
                                    label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.CHE" }) }}
                                    editorType="dxSelectBox"
                                    isRequired={modoEdicion ? isRequired('CompensarHorasExtras', settingDataField) : false}
                                    colSpan={2}
                                    editorOptions={{
                                        items: estado,
                                        valueExpr: "Valor",
                                        displayExpr: "Descripcion",
                                        onValueChanged: (e) => {
                                            seleccionarCompensarHoras(e);
                                        },
                                        readOnly: dataRow.esNuevoRegistro ? false : true
                                    }}
                                />

                                <Item colSpan={2}>
                                    {mostrarDescCompensacion && (
                                        <div>
                                            <div style={{ display: "flex" }}>
                                                <div>
                                                    <b> {intl.formatMessage({ id: "ASSISTANCE.PERSON.INCIDENCE.JUSTIFICACTION.CURRENT_BALANCE" }) + " :"}</b>
                                                </div>
                                                {saldoActual.Minutos < 0 && (
                                                    <div style={{ color: "red" }}>
                                                        <b>&nbsp;{saldoActual.SaldoActual}&nbsp;</b>
                                                    </div>
                                                )}
                                                {saldoActual.Minutos >= 0 && (
                                                    <div >
                                                        <b>&nbsp;{saldoActual.SaldoActual}&nbsp;</b>
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ display: "flex" }}>
                                                <div>
                                                    <b> {intl.formatMessage({ id: "ASSISTANCE.PERSON.INCIDENCE.JUSTIFICACTION.AFTER_COMPENSATION" }) + " :"}</b>
                                                </div>
                                                {saldoCompensado.Minutos < 0 && (
                                                    <div style={{ color: "red" }}>
                                                        <b>&nbsp;{saldoCompensado.SaldoCompensado}&nbsp;</b>
                                                    </div>
                                                )}
                                                {saldoCompensado.Minutos >= 0 && (
                                                    <div >
                                                        <b>&nbsp;{saldoCompensado.SaldoCompensado}&nbsp;</b>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </Item>

                                <Item
                                    dataField="CompensarHEPorPagar"
                                    label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.HE" }) }}
                                    editorType="dxSelectBox"
                                    visible={false}
                                    // isRequired={modoEdicion ? isRequired('CompensarHEPorPagar', settingDataField) : false}
                                    colSpan={2}
                                    editorOptions={{
                                        items: estado,
                                        valueExpr: "Valor",
                                        displayExpr: "Descripcion",
                                        // readOnly: dataRow.esNuevoRegistro && isCHE ? false : true //isCHE
                                    }}
                                />


                            </GroupItem >
                        </GroupItem >

                        <GroupItem itemType="group" colSpan={4} >
                            <GroupItem colCount={4}>

                                <Item dataField="FechaInicio"
                                    colSpan={2}
                                    label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.DATE.FROM" }) }}
                                    isRequired={modoEdicion ? isRequired('FechaInicio', settingDataField) : false}
                                    editorType="dxDateBox"
                                    dataType="date"
                                    editorOptions={{
                                        displayFormat: "dd/MM/yyyy",
                                        // onValueChanged: (e) => { obtenerPersonaHorario(e.value) },   //LSF 2012022 descomentar , aunqe sale errores
                                        min: fechaInicioMin,
                                        max: fechaFinMax,
                                        readOnly: dataRow.esNuevoRegistro && !dateJustifiedReadOnly ? false : true
                                    }}
                                />

                                <Item dataField="FechaFin"
                                    colSpan={2}
                                    label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.DATE.UNTIL" }) }}
                                    isRequired={modoEdicion ? isRequired('FechaFin', settingDataField) : false}
                                    editorType="dxDateBox"
                                    dataType="date"
                                    editorOptions={{
                                        displayFormat: "dd/MM/yyyy",
                                        min: fechaFinMin,//dataRow.FechaInicio,
                                        max: fechaFinMax,
                                        readOnly: dataRow.esNuevoRegistro && !dateJustifiedReadOnly ? false : true
                                    }}
                                />

                                <Item
                                    dataField="Observacion"
                                    label={{ text: intl.formatMessage({ id: "COMMON.OBSERVATION" }), }}
                                    isRequired={itemRequiereObservacion}
                                    colSpan={4}
                                    editorType="dxTextArea"
                                    editorOptions={{
                                        maxLength: 500,
                                        inputAttr: { style: "text-transform: uppercase" },
                                        width: "100%",
                                        height: 76,
                                    }}
                                />

                                <Item colSpan={2}>
                                </Item>

                                <Item
                                    dataField="Activo"
                                    label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                                    editorType="dxSelectBox"
                                    isRequired={modoEdicion}
                                    colSpan={2}
                                    editorOptions={{
                                        items: estadoSimple,
                                        valueExpr: "Valor",
                                        displayExpr: "Descripcion",
                                        readOnly: !(modoEdicion ? (dataRow.esNuevoRegistro ? false : true) : false)
                                    }}
                                />

                            </GroupItem >
                        </GroupItem>

                        <Item
                            // dataField="Turno"
                            colSpan={4}
                            label={{ text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.TURN" }), visible: false }} >
                            {/* <AsistenciaPersonaHorarioDia horarioDia={personaHorario} /> */}
                        </Item>

                        {/* <Item
                            dataField="FechaAsistencia"
                            colSpan={2}
                            label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.DAY.SELECT" }) }}
                            editorType="dxDateBox"
                            dataType="date"
                            visible={isNotEmpty(dataRow.FechaAsistencia) && !dataRow.esNuevoRegistro ? true : false}
                            readOnly={true}
                            editorOptions={{
                                displayFormat: "dd/MM/yyyy",
                                readOnly: true,
                                inputAttr: { 'style': 'background-color: yellow' }
                            }}
                        /> */}

                    </GroupItem>
                </Form>
                <br></br>
            </fieldset>


            <br></br>

            {/* Datos de la Justificación */}
            <fieldset className="scheduler-border"  >
                <legend className="scheduler-border" >
                    <h5> {intl.formatMessage({ id: "COMMON.FILE" }).toUpperCase()}</h5>
                </legend>
                <FileUploader
                    agregarFotoBd={(data) => onFileUploader(data)}
                    fileNameX={justificationData.NombreArchivo}
                    fileDateX={justificationData.FechaArchivo}
                    MaxFileSize={maxSizeFile}
                />
                <br></br>
            </fieldset>





            <br></br>
            {/*+++++++++++++POPUP PERSONA JUSTIFICACIÓN+++++++++++++ */}

            {isVisiblePopUpJustificacion && (
                <AsistenciaPersonaJustificacionBuscar
                    selectData={agregarJustificacion}
                    showPopup={{ isVisiblePopUp: isVisiblePopUpJustificacion, setisVisiblePopUp: setisVisiblePopUpJustificacion }}
                    cancelar={() => setisVisiblePopUpJustificacion(false)}
                    filtro={filtroLocal}
                    varIdCompania={dataRowEditNew.IdCompania}
                />
            )}

        </Popup>

    );
};

export default injectIntl(WithLoandingPanel(ReporteIncidenciaDetalleJustificacionEditPage));