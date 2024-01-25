import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button, Popover, Popup } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { AppBar } from "@material-ui/core";
import { Toolbar } from "@material-ui/core";
import { Typography } from "@material-ui/core";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { useSelector } from "react-redux";
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";
import { isRequired } from "../../../../../../_metronic/utils/securityUtils";
import { injectIntl } from "react-intl";
import FileUploader from "../../../../../partials/content/FileUploader";
import FileViewer from "../../../../../partials/content/FileViewer";
import { downloadFile } from "../../../../../api/helpers/fileBase64.api";
import { addDaysToDate, dateFormat, getDayWeek, isNotEmpty } from "../../../../../../_metronic";
import PropTypes from 'prop-types';
import { handleErrorMessages } from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { listarEstadoSimple, listarEstado } from "../../../../../../_metronic";
import AsistenciaPersonaJustificacionBuscar from "../../../../../partials/components/AsistenciaPersonaJustificacionBuscar";
import './PersonaJustificacionPage.css'
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import AsistenciaDetalleBuscar from "../../../../../partials/components/AsistenciaDetalleBuscar";
import { obtenerTodos as obtenerDetalleHorario } from "../../../../../api/asistencia/horarioDia.api";
import AsistenciaPersonaJustificacionResumenDiaPopOver from "../../../../../partials/components/AsistenciaPersonaJustificacionResumenDiaPopOver";
import { obtener as obtenerAjuste } from "../../../../../api/asistencia/bolsaHoras.api";
import FieldsetAcreditacion from '../../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';

const PersonaJustificacionEditPage = props => {
  const { intl, setLoading, modoEdicion, settingDataField, accessButton, varIdPersona, dataRowEditNew, setDataRowEditNew, varIdCompania, idModulo, idMenu, idAplicacion, dataResumen, dataPersonaHorario } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);
  const classesEncabezado = useStylesEncabezado();
  const [isVisiblePopUpCompaniaMandante, setisVisiblePopUpCompaniaMandante] = useState(false);
  const [companiaContratista] = useState("N");
  const [isVisiblePopUpJustificacion, setisVisiblePopUpJustificacion] = useState(false);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estado, setEstado] = useState([]);
  const [filtroLocal, setFiltroLocal] = useState({ IdCliente: perfil.IdCliente, IdCompania: varIdCompania, IdPersona: varIdPersona, Activo: "S", AplicaPorDia: dataRowEditNew.AplicaPorDia });
  const [fileBase64, setFileBase64] = useState();
  const [isVisiblePopUpFile, setisVisiblePopUpFile] = useState(false);
  const [dateJustifiedReadOnly, setDateJustifiedReadOnly] = useState(true);
  const [dayCompleteReadOnly, setDayCompleteReadOnly] = useState(true);
  const [hourReadOnly, setHourReadOnly] = useState(true);
  const [isCHE, setIsCHE] = useState(true);
  const [showPopupResumen, setShowPopupResumen] = useState(false);

  const [isVisiblePopUpHorarioDia, setisVisiblePopUpHorarioDia] = useState(false);
  const [listarPopUpHorarioDias, setListarPopUpHorarioDias] = useState([]);

  const [personaHorario, setPersonaHorario] = useState({}); //{ Turno: "", HoraEntrada: "", InicioRefrigerio: "", FinRefrigerio: "", HoraSalida: "" }
  const [horaEntradaMin, setHoraEntradaMin] = useState();
  const [horaEntradaMax, setHoraEntradaMax] = useState();
  const [fechaInicioMin, setFechaInicioMin] = useState(new Date());
  const [fechaFinMax, setFechaFinMax] = useState(new Date());

  const [itemRequiereObservacion, setItemRequiereObservacion] = useState(true);

  const [saldoActual, setSaldoActual] = useState({ SaldoActual: "", Minutos: 0 });
  const [saldoCompensado, setSaldoCompensado] = useState({ SaldoCompensado: "", Minutos: 0 });
  const [mostrarDescCompensacion, setMostrarDescCompensacion] = useState(false);

  const esEditar = modoEdicion && !dataRowEditNew.esNuevoRegistro;
  const animationConfig = {
    show: {
      type: 'pop',
      from: {
        scale: 0
      },
      to: {
        scale: 1
      }
    },
    hide: {
      type: 'fade',
      from: 1,
      to: 0
    }
  };

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
    let estado = listarEstado();
    setEstado(estado);

  }

  const getInitConfiguration = async () => {
    obtenerPersonaHorario(dataPersonaHorario);
  }

  function obtenerPersonaHorario(data) {
    if (!isNotEmpty(data)) return;

    const { FechaInicio, FechaFin, HoraEntradaInicio, HoraEntradaFin, Turno, HoraSalidaFin } = data;

    dataRowEditNew.Turno = Turno;
    setPersonaHorario(data);
    setFechaInicioMin(new Date(FechaInicio));
    setFechaFinMax(new Date(FechaFin));
    setHoraEntradaMin(new Date(HoraEntradaInicio));
    if (Turno === 'N') setHoraEntradaMax(addDaysToDate(new Date(HoraSalidaFin), 1));
    else setHoraEntradaMax(new Date(HoraEntradaFin));

  }

  function grabar(e) {
    // add:IdItemSharepoint
    let result = e.validationGroup.validate();
    if (result.isValid) {
      document.getElementById("btnUploadFile").click();
      if (dataRowEditNew.esNuevoRegistro) {
        props.agregarPersonaJustificacion(dataRowEditNew);
      } else {
        props.actualizarPersonaJustificacion(dataRowEditNew);
      }
    }
  }

  function verResumenDia(e) {
    props.obtenerResumenDia(dataRowEditNew.FechaAsistencia);
    setShowPopupResumen(true);
  }

  function ocultarResumenDia(e) {
    setShowPopupResumen(false);
  }

  const selectCompaniaMandante = (mandante) => {
    const { IdCompania, Compania } = mandante[0];
    dataRowEditNew.IdCompania = IdCompania;
    dataRowEditNew.CompaniaMandante = Compania;
  }

  /*++++++++++++++++++++JUSTIFICACIÓN+++++++++++++++++++++++++++++*/
  const agregarJustificacion = async (justificaciones) => {
    const { IdJustificacion, Justificacion, EsSubsidio } = justificaciones[0];
    dataRowEditNew.IdJustificacion = IdJustificacion;
    dataRowEditNew.Justificacion = Justificacion;
    dataRowEditNew.EsSubsidio = EsSubsidio;
    await props.obtenerAsistenciaJustificacion(IdJustificacion, personaHorario)
  };

  //++++++++++++++++++ARCHIVO PDF+++++++++++++++++++++++++++++++++++++++++++++++*/
  async function descargarArchivo() {

    if (!isNotEmpty(fileBase64)) {
      let params = {
        FileName: dataRowEditNew.NombreArchivo,
        FileType: "data:application/pdf;base64,",
        path: "",
        idModulo,
        idAplicacion,
        idMenu
      };
      setLoading(true);
      await downloadFile(params)
        .then(data => {
          setFileBase64(data.fileBase64);
          document.getElementById("fileOpenWindow").click()
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
        }).finally(() => setLoading(false));

    } else {
      document.getElementById("fileOpenWindow").click()
    }
  }

  const onFileUploader = (data) => {
    const { file, fileName, fileDate } = data;
    dataRowEditNew.FileBase64 = file;
    dataRowEditNew.NombreArchivo = fileName;
    dataRowEditNew.FechaArchivo = fileDate;
  }

  //+++++++++++++++++Eventos++++++++++++++++++++++++++++++++++++++++++++++*/
  const seleccionarCompensarHoras = (e) => {
    if (isNotEmpty(e.value)) {
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
      IdPersona: varIdPersona,
      IdCompania: varIdCompania
    }).then(data => {
      const { Fecha, SaldoFinal, MinutosSaldoFinal } = data;
      setSaldoActual({ SaldoActual: SaldoFinal, Minutos: MinutosSaldoFinal });
      obtenerResultadoCompensado(MinutosSaldoFinal);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  function obtenerResultadoCompensado(minutosSaldo) {
 
    const tiempoInicial = new Date(dataRowEditNew.FechaHoraInicio); //getMin
    const tiempoFinal = new Date(dataRowEditNew.FechaHoraFin); //getMinFinal
 
    const diaInicial =(tiempoInicial.getDay());
    const diaFinal = (tiempoFinal.getDay());

    let minutosTiempoInicial=0;
    let minutosTiempoFinal=0;
    if (diaInicial<diaFinal){ 
       minutosTiempoInicial = (tiempoInicial.getHours()) * 60 + (tiempoInicial.getMinutes());
       minutosTiempoFinal = (tiempoFinal.getHours()) * 60 + (tiempoFinal.getMinutes()) + 1440; //--> Agregamos un día adicional
    }
    else{ 
       minutosTiempoInicial = (tiempoInicial.getHours()) * 60 + (tiempoInicial.getMinutes());
       minutosTiempoFinal = (tiempoFinal.getHours()) * 60 + (tiempoFinal.getMinutes());
    } 

    const resultado = minutosSaldo + (minutosTiempoFinal - minutosTiempoInicial) * (-1);
  
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


  useEffect(() => {
    cargarCombos();
    getInitConfiguration();
  }, []);

  useEffect(() => {
    if (!isNotEmpty(dataRowEditNew)) return;

    const { AplicaPorDia, AplicaPorHora, RequiereObservacion, RequiereAutorizacion,
      Origen, TipoJustificacionInasistencia, TieneJustificacion } = dataRowEditNew;

    if (Origen === 'INCIDENCIA') {
      if (TipoJustificacionInasistencia === 'S') {//--Validacion que indica si aplica habilitar el combo Dia o Hora de acuerdo a la incidencia
        //Si presenta justificaciones, solo debes justificar por horas
        if (TieneJustificacion === 'S') {
          setDayCompleteReadOnly(true);   //combo Dia Completo bloqueado
          setHourReadOnly(false);//combo horas bloqueado . 
        } else {
          if (AplicaPorDia === 'S' && AplicaPorHora === 'N') {
            setDayCompleteReadOnly(true);   //combo Dia Completo bloqueado
            setHourReadOnly(true);//combo horas bloqueado 
          } else if (AplicaPorDia === 'N' && AplicaPorHora === 'S') {
            setDayCompleteReadOnly(true); //combo Dia Completo bloqueado
            setHourReadOnly(false); //combo horas disponible 
          } else if (AplicaPorDia === 'S' && AplicaPorHora === 'S') {
            setDayCompleteReadOnly(false);  //combo Dia Completo disponible
            setHourReadOnly(true); //Combo Horas disponible 
          }
        }
      } else {
        //dataRowEditNew.DiaCompleto = 'N';
        setDayCompleteReadOnly(true);   //combo Dia Completo bloqueado
        setHourReadOnly(false);//combo horas desbloqueado 
      }
      setDateJustifiedReadOnly(true);
    }
    else {
      if (AplicaPorDia === 'S' && AplicaPorHora === 'N') {
        setDayCompleteReadOnly(true);   //combo Dia Completo bloqueado
        setHourReadOnly(true);//combo horas bloqueado
        setDateJustifiedReadOnly(false);
      } else if (AplicaPorDia === 'N' && AplicaPorHora === 'S') {
        setDayCompleteReadOnly(true); //combo Dia Completo bloqueado
        setHourReadOnly(false); //combo horas disponible
        setDateJustifiedReadOnly(false);
      } else if (AplicaPorDia === 'S' && AplicaPorHora === 'S') {
        setDayCompleteReadOnly(false);  //combo Dia Completo disponible
        setHourReadOnly(true); //Combo Horas disponible
        setDateJustifiedReadOnly(false);
      }
    }
    setItemRequiereObservacion(RequiereObservacion === 'S' ? true : false);
    obtenerResultadoCompensado(saldoActual.Minutos);

  }, [dataRowEditNew]);

  // useEffect(() => {

  //   obtenerResultadoCompensado(saldoActual.Minutos);

  // }, [saldoActual])

  //++++++++++++++++++++++++++++++++POPUP DETALLE HORARIO+++++++++++++++++++++++++++++++++++*/
  const personaHorarioDetalle = async () => {
    setLoading(true);
    await obtenerDetalleHorario({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdCompania: varIdCompania,
      IdHorario: personaHorario.IdHorario
    }).then(data => {
      setListarPopUpHorarioDias(data);
      setisVisiblePopUpHorarioDia(true);
    }).finally(() => { setLoading(false) });

  }

  const contentRenderPopoverInformation = () => {
    return (
      <>
        <AsistenciaPersonaJustificacionResumenDiaPopOver
          dataResumen={dataResumen}
          varFecha={dataRowEditNew.FechaAsistencia}
          showTitleInside={true}
          idModulo={idModulo}
          idMenu={idMenu}
          idAplicacion={idAplicacion}
        />
      </>
    );
  }

  return (
    <>
      {props.showButtons && (
        <HeaderInformation
          data={props.getInfoJustificacion()}
          visible={true}
          labelLocation={'left'}
          colCount={6}
          toolbar={
            <PortletHeader
              title={""}
              toolbar={
                <PortletHeaderToolbar>
                  &nbsp;
                  <Button
                    icon="far fa-file-pdf"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.DOWNLOAD" })}
                    onClick={descargarArchivo}
                    visible={isNotEmpty(dataRowEditNew.NombreArchivo) && !dataRowEditNew.esNuevoRegistro ? true : false}
                  />
                  &nbsp;
                  <Button
                    icon="fa fa-save"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                    useSubmitBehavior={true}
                    validationGroup="FormEdicion"
                    onClick={grabar}
                    visible={modoEdicion}
                    disabled={!accessButton.grabar}
                  />
                  &nbsp;
                  <Button
                    icon="fa fa-times-circle"
                    type="normal"
                    hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                    onClick={props.cancelarEdicion}
                  />

                </PortletHeaderToolbar>
              }
            />
          }
        />
      )}

      <PortletBody >
        <React.Fragment>
          <div id="divDetailJustification">
            <FieldsetAcreditacion title={intl.formatMessage({ id: "COMMON.DETAIL" })}>
              {/* Sección informativa*/}
              <fieldset className="scheduler-border"  >
                <legend className="scheduler-border" >
                  <h5>{dataRowEditNew.Origen} </h5>
                </legend>
                <Form formData={dataRowEditNew} validationGroup="FormEdicion" >
                  <GroupItem itemType="group" colCount={8} colSpan={8} >
                    <Item colSpan={3}>
                      <div className="card">
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-3">
                              <div style={{ backgroundColor: dataRowEditNew.Color, color: "white", borderRadius: "3px", height: "100%" }}>
                                {/* <div style={{ backgroundColor: dataRowEditNew.Color, color: "white", borderRadius: "3px", height: "100%", display: "flex",flexWrap:"initial", alignContent: "center" }}>
                              <i className="flaticon2-calendar-5" style={{ fontSize: "70px", }} ></i>*/}
                              </div>
                            </div>
                            <div className="col-md-9">
                              <div className="row"><h3>{(dataRowEditNew.Evento).toUpperCase()}</h3></div>
                              <div className="row">
                                <h4>
                                  {isNotEmpty(dataRowEditNew.HoraEntrada) ? (" De " + (dateFormat(dataRowEditNew.HoraEntrada, 'hh:mm')).toUpperCase() + " a " + (dateFormat(dataRowEditNew.HoraSalida, 'hh:mm')).toUpperCase()) + (dataRowEditNew.Origen == "INCIDENCIA" && isNotEmpty(dataRowEditNew.DuracionEvento) ? " (" + dataRowEditNew.DuracionEvento + " hrs) " : "") : " - "}
                                </h4>
                              </div>
                              <div className="row" ><h5 style={{ color: "red" }}>  {isNotEmpty(dataRowEditNew.Saldo) ? ("*Usted aún presenta " + dataRowEditNew.Saldo + " hrs por justificar.") : ""}</h5></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Item>

                    <GroupItem itemType="group" colCount={1} colSpan={1}>
                      <Item colSpan={1}>
                        <p className="dayName" > </p>
                      </Item>
                      <Item colSpan={1}>
                      </Item>
                      <Item colSpan={1}>
                      </Item>
                      <Item colSpan={1}
                        label={{ text: intl.formatMessage({ id: "ACTION.VIEW" }) + " " + intl.formatMessage({ id: "COMMON.SUMMARY" }), visible: true }}
                      >
                        <Button
                          id="btnVerResumen"
                          icon="flaticon2-information icon-nm"
                          type="default"
                          hint={intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.SUMMARY_HINT" })}
                          //useSubmitBehavior={true}
                          validationGroup="FormVerResumen"
                          onClick={verResumenDia}
                          visible={true}
                          disabled={false}
                        />
                      </Item>

                    </GroupItem>


                    <GroupItem itemType="group" colCount={4} colSpan={4}>
                      <Item
                        colSpan={4}
                        label={{ text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY" }), visible: true }} >
                        <p className="dayName" > {isNotEmpty(personaHorario.HoraEntradaInicio) ? getDayWeek(new Date(personaHorario.HoraEntradaInicio)) : ""} </p>
                      </Item>
                      <Item
                        colSpan={3}
                        label={{ text: intl.formatMessage({ id: "ASSISTANCE.MASSIVE.SCHEDULES" }), visible: true }} >
                        {/* <AsistenciaPersonaHorarioDia horarioDia={personaHorario} /> */}
                        <table style={{ width: '100%' }}>
                          <thead>
                            <tr style={{ textAlign: 'center' }}>
                              <th className="header-dia" > {intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.TURN" }).toUpperCase()} </th>
                              <th className="header-ingreso"> {intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.ENTRY" }).toUpperCase()} </th>
                              <th className="header-refrigerio" colSpan={2}> {intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.REFRESHMENT" }).toUpperCase()} </th>
                              <th className="header-salida">{intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.DEPARTURE" }).toUpperCase()}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{ textAlign: 'center' }} >
                              <td className="detail">  {personaHorario.Turno === "N" ? (<i className="fas fa-moon" style={{ fontSize: "15px" }} />) : (<i className="fas fa-sun text-warning " style={{ fontSize: "15px" }} />)} </td>
                              <td className="detail"> {personaHorario.HoraEntrada} </td>
                              <td className="detail"> {personaHorario.InicioRefrigerio} </td>
                              <td className="detail"> {personaHorario.FinRefrigerio} </td>
                              <td className="detail">{personaHorario.HoraSalida}  </td>
                            </tr>
                          </tbody>
                        </table>

                        &nbsp;

                      </Item>
                      <Item
                        colSpan={1}
                        label={{ text: intl.formatMessage({ id: "ACTION.VIEW" }) + " " + intl.formatMessage({ id: "ACTION.DETAIL" }), visible: true }}
                      >
                        &nbsp;
                        <Button
                          icon="far fa-calendar-alt"
                          type="default"
                          hint={intl.formatMessage({ id: "ASSISTANCE.PERSON.SCHEDULE.VIEW" })}
                          useSubmitBehavior={true}
                          onClick={personaHorarioDetalle}
                        />

                      </Item>

                    </GroupItem>


                  </GroupItem>
                </Form>
              </fieldset>
              <br></br>
              {/* Datos de la Justificación */}
              <fieldset className="scheduler-border"  >
                <br></br>
                <Form formData={dataRowEditNew}
                  validationGroup="FormEdicion"
                  onFieldDataChanged={(e) => {
                    const { FechaHoraInicio, FechaHoraFin } = dataRowEditNew;
                    if (e.dataField == 'FechaHoraInicio' || e.dataField == 'FechaHoraFin') {
                      obtenerResultadoCompensado(saldoActual.Minutos);
                    }
                  }}
                >
                  <GroupItem colCount={8} colSpan={8} >

                    <Item dataField="IdCompania" visible={false} />
                    <Item dataField="IdJustificacion" visible={false} />
                    <Item dataField="FileBase64" visible={false} />
                    <Item dataField="NombreArchivo" visible={false} />
                    <Item dataField="IdItemSharepoint" visible={false} />
                    <Item dataField="FechaArchivo" visible={false} />
                    <Item dataField="RequiereAutorizacion" visible={false} />
                    <Item dataField="IdHorario" visible={false} />
                    <Item dataField="IdSecuencialJustificacion" visible={false} />

                    <GroupItem itemType="group" colSpan={4} >
                      <GroupItem colCount={4} >

                        <Item
                          colSpan={4}
                          dataField="Justificacion"
                          isRequired={modoEdicion}
                          label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION" }), }}
                          editorOptions={{
                            readOnly: true,
                            hoverStateEnabled: false,
                            inputAttr: { style: "text-transform: uppercase" },
                            showClearButton: true,
                            buttons: [
                              {
                                name: "search",
                                location: "after",
                                useSubmitBehavior: true,
                                options: {
                                  disabled: (esEditar ? true : false),
                                  stylingMode: "text",
                                  icon: "search",
                                  onClick: (evt) => {
                                    setisVisiblePopUpJustificacion(true);//Inconveniente log ---E1035 
                                  },
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
                              setHourReadOnly(e.value === 'S' ? true : false);
                            },
                            readOnly: (esEditar ? true : false),
                          }}
                        />
                        <Item colSpan={2}>
                        </Item>

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
                            readOnly: (esEditar ? true : false),
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
                            readOnly: (esEditar ? true : false),
                          }}
                        >
                        </Item>


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
                            readOnly: (esEditar ? true : false),
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
                            readOnly: (esEditar ? true : false),
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
                            readOnly: (esEditar ? true : false),
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
                            min: dataRowEditNew.FechaInicio,
                            max: fechaFinMax,
                            readOnly: (esEditar ? true : false),
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
                            readOnly: (esEditar ? true : false),
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

                    <Item
                      dataField="FechaAsistencia"
                      colSpan={2}
                      label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.DAY.SELECT" }) }}
                      editorType="dxDateBox"
                      dataType="date"
                      visible={isNotEmpty(dataRowEditNew.FechaAsistencia) && !dataRowEditNew.esNuevoRegistro ? true : false}
                      readOnly={true}
                      editorOptions={{
                        displayFormat: "dd/MM/yyyy",
                        readOnly: true,
                        inputAttr: { 'style': 'background-color: yellow' }
                      }}
                    />

                  </GroupItem>
                </Form>
              </fieldset>

              {dataRowEditNew.EsSubsidio === "S" && (
                <>
                  <br></br>
                  <fieldset className="scheduler-border"  >
                    <br></br>
                    <Form formData={dataRowEditNew}
                      validationGroup="FormEdicion"
                      onFieldDataChanged={(e) => {
                        // const { FechaHoraInicio, FechaHoraFin } = dataRowEditNew;
                        // if (e.dataField == 'FechaHoraInicio' || e.dataField == 'FechaHoraFin') {
                        //   obtenerResultadoCompensado(saldoActual.Minutos);
                        // }
                      }}
                    >
                      <GroupItem colCount={6} colSpan={6} >
                        <Item dataField="EnfermedadInicio"
                          colSpan={2}
                          label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.DATE.ONSETOFDISEASE" }) }}
                          isRequired={modoEdicion ? isRequired('EnfermedadInicio', settingDataField) : false}
                          editorType="dxDateBox"
                          dataType="date"
                          editorOptions={{
                            displayFormat: "dd/MM/yyyy",
                            // min: fechaInicioMin,
                            // max: fechaFinMax,
                            readOnly: modoEdicion ? false : true
                          }}
                        />

                        <Item dataField="EnfermedadFin"
                          colSpan={2}
                          label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.DATE.ENDOFSICKNESS" }) }}
                          isRequired={modoEdicion ? isRequired('EnfermedadFin', settingDataField) : false}
                          editorType="dxDateBox"
                          dataType="date"
                          editorOptions={{
                            displayFormat: "dd/MM/yyyy",
                            // min: fechaInicioMin,
                            // max: fechaFinMax,
                            readOnly: modoEdicion ? false : true
                          }}
                        />

                        <Item dataField="CertificadoInicio"
                          colSpan={2}
                          label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.DATE.HOMECERTIFICATE" }) }}
                          isRequired={modoEdicion ? isRequired('CertificadoInicio', settingDataField) : false}
                          editorType="dxDateBox"
                          dataType="date"
                          editorOptions={{
                            displayFormat: "dd/MM/yyyy",
                            //  min: fechaInicioMin,
                            // max: fechaFinMax,
                            readOnly: modoEdicion ? false : true
                          }}
                        />
                      </GroupItem>
                    </Form>
                  </fieldset>
                </>
              )}

            </FieldsetAcreditacion>

            <FieldsetAcreditacion title={intl.formatMessage({ id: "COMMON.FILE" })}>
              <Form formData={dataRowEditNew} validationGroup="FormEdicion" >
                {/* Sección de datos adjuntos */}
                <GroupItem itemType="group" colCount={2} colSpan={2}>
                  <Item colSpan={2}>
                    {/* Componente-> Cargar un documento .PDF*/}
                    <FileUploader
                      agregarFotoBd={(data) => onFileUploader(data)}
                      fileNameX={props.dataRowEditNew.NombreArchivo}
                      fileDateX={props.dataRowEditNew.FechaArchivo}
                    />
                  </Item>

                </GroupItem>
              </Form>
            </FieldsetAcreditacion>
            <AdministracionCompaniaBuscar
              selectData={selectCompaniaMandante}
              showPopup={{ isVisiblePopUp: isVisiblePopUpCompaniaMandante, setisVisiblePopUp: setisVisiblePopUpCompaniaMandante }}
              cancelarEdicion={() => setisVisiblePopUpCompaniaMandante(false)}
              uniqueId={"administracionCompaniaBuscar"}
              contratista={companiaContratista}
            />

            {/*+++++++++++++POPUP PERSONA JUSTIFICACIÓN+++++++++++++ */}
            <AsistenciaPersonaJustificacionBuscar
              selectData={agregarJustificacion}
              showPopup={{ isVisiblePopUp: isVisiblePopUpJustificacion, setisVisiblePopUp: setisVisiblePopUpJustificacion }}
              cancelar={() => setisVisiblePopUpJustificacion(false)}
              filtro={filtroLocal}
              varIdCompania={varIdCompania}
            />
            {/*+++++++++++++Vista previa del PDF- +++++++++++++ */}
            <FileViewer
              showPopup={{ isVisiblePopUp: isVisiblePopUpFile, setisVisiblePopUp: setisVisiblePopUpFile }}
              cancelar={() => setisVisiblePopUpFile(false)}
              fileBase64={fileBase64}
              fileName={dataRowEditNew.NombreArchivo}
            />
            {/*+++++++++++++POPUP DETALLE HORARIO+++++++++++++ */}
            <AsistenciaDetalleBuscar
              listDetalle={listarPopUpHorarioDias}
              showPopup={{ isVisiblePopUp: isVisiblePopUpHorarioDia, setisVisiblePopUp: setisVisiblePopUpHorarioDia }}
              cancelar={() => setisVisiblePopUpHorarioDia(false)}
              idDiaSeleccionado={personaHorario.IdDiaSeleccionado}
              showButton={false}
            />

            <Popover
              target="#btnVerResumen"
              position="left"
              width={760}
              showTitle={false}
              title={"Estatus de : "}
              visible={showPopupResumen}
              onHiding={ocultarResumenDia}
              shading={true}
              shadingColor="rgba(0, 0, 0, 0.5)"
              animation={animationConfig}
              contentRender={contentRenderPopoverInformation}
            >
            </Popover>
          </div>
        </React.Fragment>
      </PortletBody>
    </>
  );

};

PersonaJustificacionEditPage.propTypes = {
  showButtons: PropTypes.bool
}
PersonaJustificacionEditPage.defaultProps = {
  showButtons: true
}

export default injectIntl(WithLoandingPanel(PersonaJustificacionEditPage));
