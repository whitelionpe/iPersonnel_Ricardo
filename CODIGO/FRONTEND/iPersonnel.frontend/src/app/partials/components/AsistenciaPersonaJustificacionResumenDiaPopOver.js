import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button, TreeView } from "devextreme-react";
import { Popover } from 'devextreme-react/popover';
import { Portlet } from "../content/Portlet";
import { addDaysToDate, dateFormat, getDataTempLocal, getDayWeek, isNotEmpty, setDataTempLocal } from "../../../_metronic";
import { DataGrid, Column, Button as ColumnButton, MasterDetail } from "devextreme-react/data-grid";
import PropTypes from "prop-types";
import Form, { GroupItem, Item } from "devextreme-react/form";
import { useStylesEncabezado } from "../../store/config/Styles";
import { WithLoandingPanel } from "../../partials/content/withLoandingPanel";
import { AppBar, Icon, Typography } from "@material-ui/core";
import '../components/AsistenciaPersonaHorarioDia.css';
import { handleErrorMessages } from "../../store/ducks/notify-messages";
import { downloadFile } from "../../api/helpers/fileBase64.api";
import FileViewer from "../content/FileViewer";

export const initialFilter = {
  IdCliente: "",
  IdCompania: "",
  IdPersona: "",
  AplicaFuturo: "",
  Activo: "S",
};

const AsistenciaPersonaJustificacionResumenDiaPopOver = (props) => {
  const { intl, setLoading, dataResumen, varFecha, showTitleInside, idModulo, idMenu, idAplicacion } = props;
  const classesEncabezado = useStylesEncabezado();

  const [personaHorario, setPersonaHorario] = useState({ Turno: "", HoraEntrada: "", InicioRefrigerio: "", FinRefrigerio: "", HoraSalida: "" });
  const [horarioFlexible, setHorarioFlexible] = useState({ Minutos: "", HoraEntradaFlexible: "", HoraSalidaFlexible: "" });
  const [estadoProceso, setEstadoProceso] = useState(0);
  const [marcaciones, setMarcaciones] = useState("");
  const [marcacionesNocturnas, setMarcacionesNocturnas] = useState({ Dia1: "", Marcaciones1: "", Dia2: "", Marcaciones2: "" });
  const [dataIncidencias, setDataIncidencias] = useState([]);
  const [dataJustificaciones, setDataJustificaciones] = useState([]);
  const [dataEventos, setDataEventos] = useState([]);
  const [dataOtrasJustificaciones, setDataOtrasJustificaciones] = useState([]);
  const [dataMarcaEvento, setDataMarcaEvento] = useState({ IdIncidencia: "", Incidencia: "" });
  const [dataPrimeraUltimaMarca, setDataPrimeraUltimaMarca] = useState({ IdPlanilla: "", PrimeraUltimaMarca: "" });


  const [isVisibleAlertJustificaciones, setIsVisibleAlertJustificaciones] = useState(false);
  const [isVisibleAlertIncidencias, setIsVisibleAlertIncidencias] = useState(false);
  const [isVisibleAlertMarcas, setIsVisibleAlertMarcas] = useState(false);
  const [isVisibleMarcasNocturnas, setIsVisibleMarcasNocturnas] = useState(false);
  const [isVisibleAlertEvento, setIsVisibleAlertEvento] = useState(false);
  const [isVisibleHorarioFlexible, setIsVisibleHorarioFlexible] = useState(false);
  const [isVisibleHorario, setIsVisibleHorario] = useState(true);
  const [isVisibleObservacion, setIsVisibleObservacion] = useState(false);
  const [isVisibleOtrasJustificaciones, setIsVisibleOtrasJustificaciones] = useState(false);
  const [isVisibleEventoMarca, setIsVisibleEventoMarca] = useState(false);
  const [isVisiblePrimeraUltimaMarca, setIsVisiblePrimeraUltimaMarca] = useState(false);

  const [mensajeEvento, setMensajeEvento] = useState("");
  const [mensajeObservacion, setMensajeObservacion] = useState("");
  const [totalMinutosJustificados, setTotalMinutosJustificados] = useState("0");

  const [fileBase64, setFileBase64] = useState();
  const [fileName, setFileName] = useState();
  const [isVisiblePopUpFile, setisVisiblePopUpFile] = useState(false);

  let styleMark = {
    borderRadius: "5px",
    color: "white",
    padding: "3px 10px 3px 10px",
    textAlign: "left",
    borderRadius: "5px",
    fontSize: "12px",
    fontWeight: "bold",
    margin: "auto",
  };
  function setColorStyle(color) {
    styleMark = { ...styleMark, backgroundColor: color };

    return styleMark;
  }

  useEffect(() => {
    try {
      cargarInformacionResumen(dataResumen);
    } catch (error) {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), error, true)
    }
  }, [dataResumen]);


  function cargarInformacionResumen(data) {
    let varTurno = 'D';
    let lstEventos = [];

    if (!isNotEmpty(data)) return;
    if (data.length === 0) return;

    //Seccion PROCESADO
    setEstadoProceso(data[4][0].EsProcesado);
    //Seccion HORARIO 
    if (data[0].length > 0) {
      setPersonaHorario(data[0][0]);
      varTurno = data[0][0].Turno;
      setIsVisibleHorario(true);
    }
    else {
      setIsVisibleHorario(false);
    }

    //Seccion MARCACION  
    if (data[1].length == 1) {//Diurno - marcaciones en un solo día
      setMarcaciones(data[1][0].MarcacionDetalle);
      setMarcacionesNocturnas({ Dia1: "", Marcaciones1: "", Dia2: "", Marcaciones2: "" })
      setIsVisibleMarcasNocturnas(false);
      if (data[1][0].MarcacionDetalle == "") {
        setIsVisibleAlertMarcas(true);
      }
      else {
        setIsVisibleAlertMarcas(false);
      }
    }
    else if (data[1].length == 2) {//Nocturno  -  marcaciones en dos días
      if (varTurno == 'D' && data[1][1].MarcacionDetalle == '') {
        setMarcaciones(data[1][0].MarcacionDetalle);
        setMarcacionesNocturnas({ Dia1: "", Marcaciones1: "", Dia2: "", Marcaciones2: "" })
        setIsVisibleMarcasNocturnas(false);
        if (data[1][0].MarcacionDetalle == "") {
          setIsVisibleAlertMarcas(true);
        }
        else {
          setIsVisibleAlertMarcas(false);
        }
      }
      else {
        setMarcaciones("");
        setMarcacionesNocturnas({
          Dia1: dateFormat(varFecha, 'dd-MM-yyyy'), Marcaciones1: data[1][0].MarcacionDetalle,
          Dia2: dateFormat(addDaysToDate(new Date(varFecha), 1), 'dd-MM-yyyy'), Marcaciones2: data[1][1].MarcacionDetalle
        });
        if (data[1][0].MarcacionDetalle == "" && data[1][1].MarcacionDetalle == "") {
          setIsVisibleAlertMarcas(true);
          setIsVisibleMarcasNocturnas(false);
        }
        else {
          setIsVisibleAlertMarcas(false);
          setIsVisibleMarcasNocturnas(true);
        }

      }
    }
    else {
      setIsVisibleAlertMarcas(true);
      setIsVisibleMarcasNocturnas(false);
    }

    //Seccion INCIDENCIAS
    if (data[2].length === 0) { setIsVisibleAlertIncidencias(true); } else { setDataIncidencias(data[2]); setIsVisibleAlertIncidencias(false); }
    //Seccion JUSTIFICACIONES
    if (data[3].length === 0) { setIsVisibleAlertJustificaciones(true); setDataJustificaciones([])}
    else { setDataJustificaciones(data[3]); setIsVisibleAlertJustificaciones(false); setTotalMinutosJustificados(data[3].reduce((sum, item) => { return sum + item.Total }, 0)) }

    //Seccion Evento
    if (data[5].length === 0) {
      setIsVisibleAlertEvento(false);
      setMensajeEvento("");
    }
    else {
      setDataEventos(data[5]);
      setIsVisibleAlertEvento(true);
    }

    // Seccion HHEE 
    if (data[6].length === 0) {
      setIsVisibleHorarioFlexible(false);
    }
    else {
      if (data[6][0].AplicaHoraFlexible == 1) {
        setHorarioFlexible(data[6][0]);
        setIsVisibleHorarioFlexible(true);
      } else {
        setIsVisibleHorarioFlexible(false);
      }
    }

    // Seccion Observacion
    if (data[7].length === 0) {
      setIsVisibleObservacion(false);
    } else {
      setMensajeObservacion(data[7][0].Observacion);
      setIsVisibleObservacion(true);
    }

    //Seccion Otras Justificaciones
    if (data[8].length === 0) {
      setIsVisibleOtrasJustificaciones(false);
    } else {
      setDataOtrasJustificaciones(data[8])
      setIsVisibleOtrasJustificaciones(true);
    }

    //Seccion Evento Marcacion
    if (data[9].length === 0) {
      setIsVisibleEventoMarca(false);
    } else {
      setDataMarcaEvento(data[9][0])
      setIsVisibleEventoMarca(true);
    }

    //Seccion Planilla Config. Primera y Ultima Marca
    if (data[10].length === 0) {
      setIsVisiblePrimeraUltimaMarca(false);
    } else if (data[10][0].PrimeraUltimaMarca == 'S') {
      setDataPrimeraUltimaMarca(data[10][0])
      setIsVisiblePrimeraUltimaMarca(true);
    } else {
      setIsVisiblePrimeraUltimaMarca(false);
    }

  }

  function habilitarSubGrillaJustificaciones(incidente) {
    let resultado = false;
    let lista = [];

    if (!isNotEmpty(incidente)) return resultado;
    if (!isNotEmpty(dataJustificaciones)) return resultado;

    lista = dataJustificaciones.filter(item => item.IdIncidencia == incidente.IdIncidencia);

    if (lista.length == 0) return resultado; else resultado = true;

    return resultado;
  }

  function obtenerJustificacionesPorIncidencia(incidente) {
    let resultado = [];

    if (!isNotEmpty(incidente)) return resultado;
    if (!isNotEmpty(dataJustificaciones)) return resultado;

    resultado = dataJustificaciones.filter(item => item.IdIncidencia == incidente.IdIncidencia);

    return resultado;
  }

  function obtenerSumatoriaJustificaciones(incidente) {
    let resultado = "";
    let lista = [];

    // if (!isNotEmpty(incidente)) return resultado;
    // if (!isNotEmpty(dataJustificaciones)) return resultado;

    // lista = dataJustificaciones.filter(item => item.IdIncidencia == incidente.IdIncidencia);

    // if (lista.length == 0) return resultado;

    //let suma = lista[0].SumaTotal; //Ya no va ---> lista.reduce((sum, item) => { return sum + item.Total }, 0);

    let suma = incidente.length > 0 ? incidente[0].SumaTotalJustificado : "00:00";
    resultado = intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.SUMMARY.MIN_TOTAL_JUSTIFIED" }) + " : " + suma;

    return resultado;
  }

  //-----------
  //DESCARGA DE ARCHIVO JUSTIFICACION
  //----------


  function cellRenderFile(data) {
    return isNotEmpty(data.value) ? (
      <div className="dx-command-edit-with-icons">
        <span
          className="dx-icon-exportpdf"
          title={intl.formatMessage({ id: "ACTION.DOWNLOAD" })}
          aria-label={intl.formatMessage({ id: "ACTION.DOWNLOAD" })}
          onClick={(e) => descargaArchivo(data)}
        />
      </div>
    ) : (
      <div>
        {intl.formatMessage({ id: "ASSISTANCE.PERSON.INCIDENCE.JUSTIFICACTION.WITHOUT_FILE" })}
      </div>
    )
  }

  const descargaArchivo = async (evt) => { 
    
    const { NombreArchivo,IdItemSharepoint } = evt.data;

    if (fileName !== NombreArchivo) {
      setFileName(NombreArchivo);
      let params = {
        FileName: NombreArchivo,
        FileType: "data:application/pdf;base64,",
        path: "",
        idModulo,
        idAplicacion,
        idMenu,
        IdItemSharepoint
      }; 

      console.log("***descargaArchivo :> ", params);

      setLoading(true);
      await downloadFile(params)
        .then(data => {
          setFileBase64(data.fileBase64);
          //setisVisiblePopUpFile(true);
          document.getElementById("fileOpenWindow").click()
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => setLoading(false));
    } else {
      if (isNotEmpty(fileBase64)) {
        //setisVisiblePopUpFile(true);
        document.getElementById("fileOpenWindow").click()
      }
    }
  }

  const animationConfig = {
    show: {
      type: 'pop',
      from: {
        scale: 0,
      },
      to: {
        scale: 1,
      },
    },
    hide: {
      type: 'fade',
      from: 1,
      to: 0,
    },
  };

  function cellRenderObservacion(data) {
    return <div className="">
            <p>
              (<a
                id="link3"
              >Ver</a>)
            </p>

            <Popover
              target="#link3"
              showEvent="mouseenter"
              hideEvent="mouseleave"
              position="top"
              width={500}
              animation={animationConfig}
            >
            {data.value}
            </Popover>
          </div>
  }



  //------------

  return (
    <>
      <div id='divPopOver'   >
        <Portlet>

          {showTitleInside && (
            <div>
              <Form validationGroup="FormEdicion" >
                <GroupItem itemType="group" colCount={2} colSpan={2} >
                  <Item colSpan={2}>
                    <AppBar position="static" className={classesEncabezado.secundario}>
                      <Typography variant="h6" color="inherit" className={classesEncabezado.title} >
                        {intl.formatMessage({ id: "COMMON.SUMMARY.DAY" }) + " "}
                      </Typography>
                    </AppBar>
                  </Item>
                </GroupItem>
              </Form>
              <br />
            </div>
          )}

          <div>
            <div className="row">
              <div className="col-md-6" style={{ textAlign: 'left' }}>
                <div style={estadoProceso === 0 ? { color: 'red' } : { color: 'green' }} >
                  {estadoProceso === 0 ?
                    (intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.VALIDATION.NO_PROCESSED" }).toUpperCase()) + "  " :
                    (intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.STATE.PROCESSED" }).toUpperCase()) + "  "}

                  {estadoProceso === 0 ?
                    (<i className="fas fa-bell" style={{ fontSize: "15px" }} />) :
                    (<i className="fas fa-check " style={{ fontSize: "15px" }} />)}
                </div>
              </div>
              <div className="col-md-6" style={{ textAlign: 'right' }}>
                <p className="dayName" > {getDayWeek(new Date(varFecha)).toUpperCase()} </p>
              </div>
            </div>
            <br />

            {isVisibleHorario && (
              <div className="row">
                <div className="col-md-3" style={{ textAlign: 'left' }}>
                  <h6>{intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.ENTER.HOUR" }).toUpperCase() + " :"} </h6>
                </div>
                <div className="col-md-9">
                  <div className="row">
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
                  </div>
                </div>
                <br />
              </div>
            )}

            {isVisibleHorarioFlexible && (
              <div className="row">
                <div className="col-md-4" style={{ textAlign: 'left' }}>
                  <h6>{intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.ENTER.HOUR.FLEXIBLE" }).toUpperCase() + " :"} </h6>
                </div>
                <div className="col-md-8">
                  <div >
                    <table style={{ width: '100%' }}>
                      <thead>
                        <tr style={{ textAlign: 'center' }}>
                          <th className="header-dia" > {intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.TIME_FLEXIBLE" }).toUpperCase()} </th>
                          <th className="header-ingreso"> {intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.ENTRY_FLEXIBLE" }).toUpperCase()} </th>
                          <th className="header-salida">{intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.DEPARTURE_FLEXIBLE" }).toUpperCase()}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ textAlign: 'center' }} >
                          <td className="detail"> {horarioFlexible.MinutosFlexible} </td>
                          <td className="detail"> {horarioFlexible.HoraEntradaFlexible} </td>
                          <td className="detail"> {horarioFlexible.HoraSalidaFlexible}  </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <br />
              </div>
            )}
            <br />

            {/* +++++++++ Visualizar Información de Resumen ++++++++*/}
            {!isVisibleObservacion && (
              <div>
                <div className="row">
                  <div className="col-md-3" style={{ textAlign: 'left' }}>
                    <h6>{intl.formatMessage({ id: "ACCESS.PERSON.MARK.TAB" }).toUpperCase() + " :"} </h6>
                  </div>
                  <div className="col-md-5" style={{ textAlign: 'left' }}>

                    {isVisibleEventoMarca && (
                      <div className="row">
                        <div style={setColorStyle(dataMarcaEvento.Color)} >
                          {dataMarcaEvento.Incidencia}
                        </div>
                      </div>
                    )}

                    {(<div className="row">{marcaciones}</div>)}

                    {isVisibleAlertMarcas && (
                      <div style={{ color: 'red' }} >
                        {intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.NO_DATA_MARK" })}
                      </div>
                    )}

                  </div>
                  <div className="col-md-4" style={{ textAlign: 'left' }}>
                    {/* fa-check-square fa-box-check*/}
                    {isVisiblePrimeraUltimaMarca && estadoProceso === 1 && (
                      <div className="row">
                        <Icon className="fas fa-check-square" />
                        <h6>{intl.formatMessage({ id: "ASSISTANCE.PERSON.INCIDENCE.SUMMARY.HAVE_CHECK_FIRSTLASTMARK" })} </h6>
                      </div>
                    )}
                  </div>
                </div>

                {isVisibleMarcasNocturnas && (
                  <div className="row">
                    {/* <div className="col-md-1"> </div> */}
                    {/* fontWeight: "bold" ,color: "#222" */}
                    <div className="col-md-3" style={{ textAlign: 'right' }}>
                      <h6> {marcacionesNocturnas.Dia1 + " : "} </h6>
                    </div>
                    <div className="col-md-9" style={{ textAlign: 'left' }}>
                      {marcacionesNocturnas.Marcaciones1}
                    </div>

                    {/* <div className="col-md-1"> </div> */}
                    <div className="col-md-3" style={{ textAlign: 'right' }}>
                      <h6>  {marcacionesNocturnas.Dia2 + " : "} </h6>
                    </div>
                    <div className="col-md-9" style={{ textAlign: 'left' }}>
                      {marcacionesNocturnas.Marcaciones2}
                    </div>
                  </div>
                )}

                <br />
              </div>
            )}
            {/* +++++++++ Visualizar Información de Incidencias(Justificables) ++++++++*/}
            {(
              <div>
                <div className="row">
                  <div className="col-md-3" style={{ textAlign: 'left' }}>
                    <h6>{intl.formatMessage({ id: "ASSISTANCE.PERSON.INCIDENCE.JUSTIFICACTION.SUBTITLE_JUSTIFIED_INCIDENT" }).toUpperCase() + " :"} </h6>
                  </div>
                  <div className="col-md-9" style={{ textAlign: 'left' }}>

                    {isVisibleAlertIncidencias && (
                      <div style={{ color: 'red' }} >
                        {intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.NO_DATA_INCIDENT" })}
                      </div>
                    )}
                  </div>
                  <div className="col-md-12">
                    <div style={isVisibleAlertIncidencias ? { display: 'none' } : { display: 'block' }} >
                      <DataGrid
                        dataSource={dataIncidencias}
                        showBorders={true}
                        // focusedRowEnabled={true}
                        keyExpr="IdIncidencia">
                        <Column dataField="Incidencia" caption={intl.formatMessage({ id: "ASSISTANCE.INCIDENCE.INCIDENCE" })} width={"40%"} allowSorting={false} />
                        <Column dataField="Total" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.TIME" })} width={"20%"} alignment={"center"} allowSorting={false} />
                        <Column dataField="Justificado" caption={intl.formatMessage({ id: "ASSISTANCE.PERSON.INCIDENCE.JUSTIFICACTION.HEADER_JUSTIFICATED" })} width={"20%"} alignment={"center"} allowSorting={false} />
                        <Column dataField="Saldo" caption={intl.formatMessage({ id: "ASSISTANCE.PERSON.INCIDENCE.JUSTIFICACTION.HEADER_WITHOUT_JUSTIFICATED" })} width={"20%"} alignment={"center"} allowSorting={false} />

                        <MasterDetail enabled={true} component={(opt) =>
                          <div>
                            <div style={habilitarSubGrillaJustificaciones(opt.data.data) ? { display: 'block' } : { display: 'none' }} >
                              <DataGrid
                                dataSource={obtenerJustificacionesPorIncidencia(opt.data.data)}
                                showBorders={true}
                                // focusedRowEnabled={true}
                                keyExpr="IdJustificacion">
                                <Column dataField="Justificacion" caption={intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.JUSTIFICACIÓN" })} width={"40%"} allowSorting={false} />
                                <Column dataField="Solicitud" caption={intl.formatMessage({ id: "ACCREDITATION.REQUEST" })} width={"20%"} alignment={"center"} allowSorting={false} />
                                <Column dataField="Total" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.TIME" })} width={"20%"} alignment={"center"} allowSorting={false} />
                                <Column dataField="NombreArchivo" caption={intl.formatMessage({ id: "COMMON.FILE" })} cellRender={cellRenderFile} width={"20%"} alignment={"center"} allowSorting={false} />

                                
                                <Column dataField="Observacion" cellRender={cellRenderObservacion} width={100} alignment={"center"} />
                                
                              </DataGrid>
                              {/* <div style={{ textAlign: "right" }}>
                            <br />
                            <h6>{obtenerSumatoriaJustificaciones(opt.data.data)} </h6>
                          </div> */}
                            </div>
                            <div style={habilitarSubGrillaJustificaciones(opt.data.data) ? { display: 'none' } : { display: 'block' }} >
                              <h6>
                                <div style={{ color: 'red' }} >
                                  {"* " + intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.NO_DATA_JUSTIFY" })}
                                </div>
                              </h6>
                            </div>
                          </div>
                        }
                        />
                      </DataGrid>
                      <div style={{ textAlign: "left" }}>
                        <br />
                        <h6>{obtenerSumatoriaJustificaciones(dataIncidencias)} </h6>
                        {/* opt.data.data */}
                      </div>
                    </div>
                  </div>
                </div>
                <br /> 
              </div> 
            )}
            {/* +++++++++ Visualizar Información de Resultados de Marcas(Otras Incidencias) ++++++++*/}
            {!isVisibleObservacion && (
              <div>
                {isVisibleAlertEvento && (
                  <div className="row">
                    <div className="col-md-6" style={{ textAlign: 'left' }}>
                      <h6>{intl.formatMessage({ id: "ASSISTANCE.PERSON.INCIDENCE.JUSTIFICACTION.SUBTITLE_RESULT" }).toUpperCase() + " :"} </h6>
                    </div>
                    <div className="col-md-6" style={{ textAlign: 'left' }}>
                      {/* <div style={{ color: 'black', display: "none" }} >
                        {mensajeEvento}
                      </div> */}
                    </div>

                    <div className="col-md-12">

                      <DataGrid
                        dataSource={dataEventos}
                        showBorders={true}
                        showColumnHeaders={false}
                        keyExpr="IdEvents">
                        <Column dataField="Evento" caption={intl.formatMessage({ id: "SYSTEM.PROCESS.EVENT" })} width={"100%"} allowSorting={false} />
                      </DataGrid>

                    </div>
                  </div>
                )}
                <br />

              </div>
            )}

            {/* +++++++++ Visualizar Mensaje de Observación ++++++++*/}
            {isVisibleObservacion && (
              <div>
                <div className="row">
                  <div className="col-md-3" style={{ textAlign: 'left' }}>
                    <h6>{intl.formatMessage({ id: "COMMON.OBSERVATION" }).toUpperCase() + " :"} </h6>
                  </div>
                  <div className="col-md-9" style={{ textAlign: 'left' }}>
                    <div style={{ color: 'red' }} >
                      {mensajeObservacion}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* +++++++++ Visualizar Otras Justificaciones(Sin Incidencias) ++++++++*/}
            {isVisibleOtrasJustificaciones && (

              <div className="row">
                <div className="col-md-3" style={{ textAlign: 'left' }}>
                  <h6>{intl.formatMessage({ id: "ASSISTANCE.PERSON.INCIDENCE.JUSTIFICACTION.OTHER_JUSTIFICATIONS" }).toUpperCase() + " :"} </h6>
                </div>
                <div className="col-md-9" style={{ textAlign: 'left' }}>

                </div>
                <div className="col-md-12">
                  <DataGrid
                    dataSource={dataOtrasJustificaciones}
                    showBorders={true}
                    // focusedRowEnabled={true}
                    keyExpr="IdJustificacion">
                    <Column dataField="Justificacion" caption={intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION" })} width={"30%"} allowSorting={false} />
                    <Column dataField="FechaAsistencia" caption={intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.DATE" })} width={"20%"} alignment={"center"} allowSorting={false} />
                    <Column dataField="Solicitud" caption={intl.formatMessage({ id: "ACCREDITATION.LIST.REQUEST" })} width={"20%"} alignment={"center"} allowSorting={false} />
                    <Column dataField="DiaCompleto" caption={intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.DAY" })} width={"20%"} alignment={"center"} allowSorting={false} />
                    <Column dataField="NombreArchivo" caption={intl.formatMessage({ id: "COMMON.FILE" })} cellRender={cellRenderFile} width={"10%"} alignment={"center"} allowSorting={false} />

                  </DataGrid>

                </div>
              </div>

            )}

          </div>
        </Portlet >

        <FileViewer
          showPopup={{ isVisiblePopUp: isVisiblePopUpFile, setisVisiblePopUp: setisVisiblePopUpFile }}
          cancelar={() => setisVisiblePopUpFile(false)}
          fileBase64={fileBase64}
          fileName={fileName}
        />
      </div >
    </>
  );

};

AsistenciaPersonaJustificacionResumenDiaPopOver.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
  varIdCompania: PropTypes.string
};
AsistenciaPersonaJustificacionResumenDiaPopOver.defaultProps = {
  showButton: false,
  selectionMode: "row",
  uniqueId: "asistenciaJustificacion",
  varIdCompania: ""
};
export default injectIntl(WithLoandingPanel(AsistenciaPersonaJustificacionResumenDiaPopOver));
