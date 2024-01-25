import React, { Fragment, useEffect, useState } from "react";
import { Button, DataGrid, Popup, TabPanel } from "devextreme-react";
import { injectIntl } from "react-intl";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import WithLoandingPanel from "../../../../partials/content/withLoandingPanel";
import { Item, Form, GroupItem } from "devextreme-react/form";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { useSelector } from "react-redux";
import { dateFormat, isNotEmpty, listarEstado } from "../../../../../_metronic";
import { isRequired } from "../../../../../_metronic/utils/securityUtils";
import { AppBar, Toolbar, Typography } from "@material-ui/core";
import FileUploader from "../../../../partials/content/FileUploader";
import CustomTabNav from "../../../../partials/components/Tabs/CustomTabNav";
import { Column, Summary, TotalItem, Button as ColumnButton } from "devextreme-react/data-grid";
import AsistenciaJustificacionBuscar from "../../../../partials/components/AsistenciaJustificacionBuscar";
import { handleErrorMessages, handleWarningMessages } from "../../../../store/ducks/notify-messages";
import AsistenciaPersonaPerfilBuscar from "../../../../partials/components/AsistenciaPersonaPerfilBuscar";
import { detallePersonaInvalida as obtenerDetalle } from "../../../../api/asistencia/personaJustificacion.api";



const ReporteIncidenciaJustificacionMasivaEditPage = (props) => {
  const { intl, setLoading, modoEdicion, settingDataField, accessButton, varIdPersona, dataRowEditNew, setDataRowEditNew, varIdCompania,
    idModulo, idMenu, idAplicacion, dataResumen, dataPersonaHorario, selectedRow,
    personasCorrectas, personasIncorrectas} = props;

  const perfil = useSelector(state => state.perfil.perfilActual);
  const classesEncabezado = useStylesEncabezado();
  const [companiaContratista] = useState("N");
  const [isVisiblePopUpJustificacion, setisVisiblePopUpJustificacion] = useState(false);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estado, setEstado] = useState([]);
  const [filtroLocal, setFiltroLocal] = useState({ IdCliente: perfil.IdCliente, IdCompania: dataRowEditNew.IdCompania });
  const [fileBase64, setFileBase64] = useState();
  const [dateJustifiedReadOnly, setDateJustifiedReadOnly] = useState(true);
  const [dayCompleteReadOnly, setDayCompleteReadOnly] = useState(true);
  const [hourReadOnly, setHourReadOnly] = useState(true);
  const [isCHE, setIsCHE] = useState(true);

  const [itemRequiereObservacion, setItemRequiereObservacion] = useState(true);
  const [popupVisiblePersonas, setPopupVisiblePersonas] = useState(false);
  const [popupVisibleDetallePersonasInvalida, setPopupVisibleDetallePersonasInvalida] = useState(false);
  const [observacionesDetalle, setObservacionesDetalle] = useState([]);

  const flLimpiar = props.procesados;

  /*Adjuntar Documentos */
  const onFileUploader = (data) => { 
    const { file, fileName, fileDate } = data;
    dataRowEditNew.FileBase64 = file;
    dataRowEditNew.NombreArchivo = fileName;
    dataRowEditNew.FechaArchivo = fileDate;
  }

  /* Grilla Personas validadas */
  const renderGrillaCorrecta = () => {
    return (
      <DataGrid
        dataSource={props.personasValidadas.filter(x => x.EsValida === 'S')}
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="IdPersona"
        // onCellPrepared={onCellPrepared}
        noDataText={intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.NO_DATA" })}
      >
        <Column dataField="IdPersona" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} alignment={"left"} />
        <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })} width={"40%"} alignment={"left"} />
        <Column type="buttons" width={"5%"} visible={true} >
          <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarRegistro} />
        </Column>
      </DataGrid>
    );
  }

  const renderGrillaIncorrecta = () => {
    return (
      <DataGrid
        dataSource={props.personasValidadas.filter(x => x.EsValida === 'N')}
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="IdPersona"
        //onCellPrepared={ColorRojo}
        noDataText={intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.NO_DATA" })}
      >
        <Column dataField="IdPersona" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} alignment={"left"} />
        <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })} width={"40%"} alignment={"left"} />
        <Column dataField="MensajeJustificaciones" caption={intl.formatMessage({ id: "ASSISTANCE.JUSTIFICATION.MASSIVE.MESSAGE" })} width={"40%"} alignment={"left"} />
        <Column type="buttons" width={"5%"} visible={true} >
          <ColumnButton icon="fas fa-eye" hint={intl.formatMessage({ id: "ACTION.DETAIL", })} onClick={abrirDetallePersonaInvalida} />
        </Column>
      </DataGrid>
    );
  }

  const renderGrillaDetalleInvalidos = () => {
    return (
      <DataGrid
        dataSource={observacionesDetalle}
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="RowId"
        //onCellPrepared={ColorRojo}
        noDataText={intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.NO_DATA" })}
      >
        <Column dataField="IdPersona" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} alignment={"center"} visible={false} />
        <Column dataField="Fecha" caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" })} dataType="date" format="dd/MM/yyyy" width={"15%"} alignment={"center"} />
        <Column dataField="DiaSemana" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY" })} width={"15%"} alignment={"center"} />
        <Column dataField="Observacion" caption={intl.formatMessage({ id: "ASSISTANCE.JUSTIFICATION.MASSIVE.MESSAGE" })} width={"70%"} alignment={"left"} />

      </DataGrid>
    );
  }

  const eliminarRegistro = evt => {
    setLoading(true);
    // evt.cancel = true;
    props.eliminarRegistro(evt.row.data);
  };

  const abrirDetallePersonaInvalida = async evt => {
    setLoading(true);
    const { IdCliente, IdPersona } = evt.row.data;
    const { IdCompania, FechaInicio, FechaFin, DiaCompleto } = dataRowEditNew;

    let params = {
      IdCliente,
      IdPersona,
      IdCompania,
      FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd'),
      FechaFin: dateFormat(FechaFin, 'yyyyMMdd'),
      DiaCompleto
    };

    await obtenerDetalle(params)
      .then(response => {
        console.log("Response :> ", response.data);
        if (response.data.length > 0) {
          setObservacionesDetalle(response.data);
        } else {
          setObservacionesDetalle([]);
        }
        setPopupVisibleDetallePersonasInvalida(true);
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      })
      .finally(() => {
        setLoading(false);
      });


  };

  // function ColorRojo(e) {
  // if (e.rowType === 'data') {
  //   e.cellElement.style.color = 'red';
  // }
  // }

  function onCellPrepared(e) {
    if (e.rowType === 'data') {

      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }

    }
  }


  /*Metodos de PopUp Justificacion */
  /*********************************/
  const seleccionarJustificacion = async (justificaciones) => {
    const { IdJustificacion, Justificacion, EsSubsidio } = justificaciones[0];
    dataRowEditNew.IdJustificacion = IdJustificacion;
    dataRowEditNew.Justificacion = Justificacion;
    dataRowEditNew.EsSubsidio = EsSubsidio;
    await props.obtenerAsistenciaJustificacion(IdJustificacion)
  };

  const agregarPersonaAsistencia = async (personas) => {
    let auxList = [];

    //Incorporar las personas seleccionadas al listado general
    if (personas.length > 0) {
      personas.forEach(item => {
        let existe = props.personasValidadas.filter(x => x.IdPersona === item.IdPersona); //x.EsValida === 'S' && 
        if (existe.length === 0) {
          //ALmacenamos en la lista auxiliar
          auxList.push({
            IdCompania: item.IdCompania,
            IdCliente: item.IdCompania,
            IdPersona: item.IdPersona,
            NombreCompleto: item.NombreCompleto,
            EsValida: "S",
            MensajeJustificaciones: ""
          });
        }
      });

      if (auxList.length > 0) {
        auxList = auxList.concat(props.personasValidadas);
        let personas = auxList.map(x => x.IdPersona).join(',');

        //Validar si existen en el listado general::> Enviar la nueva lista
        props.obtenerJustificacionFechaPersona(personas);
      }
    }


  }

  async function cargarCombos() {
    let estado = listarEstado();
    setEstado(estado);
  }

  function validarDatos() {
    let result = true;
    let personas = props.personasValidadas.filter(x => x.EsValida === 'S');

    if (personas.length === 0) {
      handleWarningMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ASSISTANCE.INCIDENCE.JUSTIFICATION.MASSIVE.THERE_NO_PERSON" }));
      result = false;
    }


    return result;
  }


  const grabar = (e) => {
    let result = e.validationGroup.validate();

    if (result.isValid) {
      if (!validarDatos()) { return; }

      document.getElementById("btnUploadFile").click(); 
      props.registrarPersonaJustificacionMasiva(dataRowEditNew);
    }

  }
  const agregarPersona = (e) => {
    setPopupVisiblePersonas(true);
  } 



  useEffect(() => {
    cargarCombos();
  }, []);



  useEffect(() => {
    if (!isNotEmpty(dataRowEditNew)) return;

    const { AplicaPorDia, AplicaPorHora, RequiereObservacion, RequiereAutorizacion,
      Origen, TipoJustificacionInasistencia, TieneJustificacion } = dataRowEditNew;

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


  }, [dataRowEditNew]);


  return (
    <Fragment>

      <div className="row" style={{ backgroundColor: '#f1f6ff', borderBottom: '1px solid #ebedf2' }}>
        <div className="col-12">
          <Form formData={dataRowEditNew} validationGroup="FormEdicion" className="cabecera-info" >
            <GroupItem itemType="group" colCount={8} colSpan={8} >
              <Item
                dataField="Compania"
                label={{ text: intl.formatMessage({ id: "CASINO.REPORT.COMPANY" }) }}
                colSpan={4}
              >
              </Item>
              <Item
                colSpan={2}
              ></Item>
              <Item
                colSpan={2}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <Button
                  icon={"fa fa-save"}
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.RECORD" }) + "  " + intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.JUSTIFICACION" })}
                  onClick={grabar}
                  useSubmitBehavior={true}
                  validationGroup="FormEdicion"
                />
                &nbsp;
                <Button
                  icon={"fa fa-user"}
                  type="default"
                  hint={intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.ADD.PERSON" })}
                  onClick={agregarPersona}
                  useSubmitBehavior={true}
                  validationGroup="FormEdicion"
                />
                &nbsp;
                <Button
                  icon="fa fa-times-circle"
                  type="normal"
                  hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                  onClick={props.cancelarEdicion}
                />
                &nbsp;


              </Item>
            </GroupItem>
          </Form>
        </div>

      </div>


      <br></br>

      <PortletBody>
        <React.Fragment>

          {/* Cabecera de la sección - Justificación*/}
          <Form formData={dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={8} colSpan={8} >
              <Item colSpan={8}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title} >
                      {intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.VERDETALLEJUSTIFICACION" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>
            </GroupItem>
          </Form>

          <br></br>

          {/* Datos de la Justificación */}
          <div className="row">
            <div className="col-12">

              <TabPanel id="tabPanel" >
                <Item title={intl.formatMessage({ id: "ACTION.DETAIL" })}
                  icon="floppy">
                  <PortletBody>
                    <br></br>
                    {/* Sección de Justificacion */}
                    <fieldset className="scheduler-border"  >
                      <legend className="scheduler-border" >
                        <h5>{intl.formatMessage({ id: "COMMON.DATA" }) + " " + intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.JUSTIFICACION" })} </h5>
                      </legend>
                      <br></br>
                      <Form formData={dataRowEditNew}
                        validationGroup="FormEdicion"
                        onFieldDataChanged={(e) => {
                          if (e.dataField == 'FechaInicio' || e.dataField == 'FechaFin') {
                            //validar personas
                            let personas = props.personasValidadas.map(x => x.IdPersona).join(',');
                            props.obtenerJustificacionFechaPersona(personas);
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

                          <Item
                            colSpan={4}
                            dataField="Justificacion"
                            isRequired={modoEdicion}
                            label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION" }), }}
                            editorOptions={{
                              readOnly: (modoEdicion ? (dataRowEditNew.esNuevoRegistro ? false : true) : false),
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
                                    onClick: (evt) => {
                                      setisVisiblePopUpJustificacion(true);//Inconveniente log ---E1035  
                                    },
                                  },
                                },
                              ],
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
                                setIsCHE(e.value === 'S' ? false : true)
                              },
                              readOnly: dataRowEditNew.esNuevoRegistro ? false : true
                            }}
                          />

                          <Item colSpan={2}>
                          </Item>
                          <Item
                            dataField="CompensarHEPorPagar"
                            label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.HE" }) }}
                            editorType="dxSelectBox"
                            visible={false}
                            colSpan={2}
                            editorOptions={{
                              items: estado,
                              valueExpr: "Valor",
                              displayExpr: "Descripcion",
                              readOnly: dataRowEditNew.esNuevoRegistro && isCHE ? false : true //isCHE
                            }}
                          />

                          <Item dataField="FechaInicio"
                            colSpan={2}
                            label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.DATE.FROM" }) }}
                            isRequired={true}
                            editorType="dxDateBox"
                            dataType="date"
                            editorOptions={{
                              displayFormat: "dd/MM/yyyy",
                              readOnly: dataRowEditNew.esNuevoRegistro ? false : true
                            }}
                          />

                          <Item dataField="FechaFin"
                            colSpan={2}
                            label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.DATE.UNTIL" }) }}
                            isRequired={true}
                            editorType="dxDateBox"
                            dataType="date"
                            editorOptions={{
                              displayFormat: "dd/MM/yyyy",
                              readOnly: dataRowEditNew.esNuevoRegistro ? false : true
                            }}
                          />

                          <Item
                            colSpan={4}
                            label={{ text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.TURN" }), visible: false }} >
                          </Item>


                          <GroupItem itemType="group" colSpan={4} >
                            <GroupItem colCount={4} >

                              <Item
                                dataField="DiaCompleto"
                                label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.DAY" }) }}
                                editorType="dxSelectBox"
                                isRequired={true}
                                colSpan={2}
                                editorOptions={{
                                  items: estado,
                                  valueExpr: "Valor",
                                  displayExpr: "Descripcion",
                                  onValueChanged: (e) => {
                                    setHourReadOnly(e.value === 'S' ? true : false);
                                  },
                                  // readOnly: dataRowEditNew.esNuevoRegistro ? false : true
                                  readOnly: dataRowEditNew.esNuevoRegistro && dayCompleteReadOnly ? true : false //dayCompleteReadOnly

                                }}
                              />

                            </GroupItem >

                            <GroupItem itemType="group" colSpan={4} >
                              <GroupItem colCount={2} >
                                <Item
                                  dataField="FechaHoraInicio"
                                  isRequired={true}
                                  label={{ text: intl.formatMessage({ id: "ACCESS.REPORT.STARTTIME" }) }}
                                  editorType="dxDateBox"
                                  editorOptions={{
                                    useMaskBehavior: true,
                                    maxLength: 5,
                                    displayFormat: "HH:mm",
                                    type: "time",
                                    // readOnly: dataRowEditNew.esNuevoRegistro && hourReadOnly ? false : true
                                    readOnly: dataRowEditNew.esNuevoRegistro && hourReadOnly ? true : false
                                  }}
                                />

                                <Item
                                  dataField="FechaHoraFin"
                                  label={{ text: intl.formatMessage({ id: "ACCESS.REPORT.ENDTIME" }) }}
                                  isRequired={true}
                                  editorType="dxDateBox"
                                  editorOptions={{
                                    useMaskBehavior: true,
                                    maxLength: 5,
                                    displayFormat: "HH:mm",
                                    type: "time",
                                    // readOnly: dataRowEditNew.esNuevoRegistro && hourReadOnly ? false : true
                                    readOnly: dataRowEditNew.esNuevoRegistro && hourReadOnly ? true : false
                                  }}
                                >
                                </Item>

                              </GroupItem >
                            </GroupItem >

                          </GroupItem>

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

                          <Item colSpan={6} visible={isNotEmpty(!dataRowEditNew) && dataRowEditNew.esNuevoRegistro ? true : false} />


                          <Item
                            colSpan={2}
                          />

                          <Item colSpan={4} visible={isNotEmpty(dataRowEditNew) && !dataRowEditNew.esNuevoRegistro ? true : false} />

                        </GroupItem>
                      </Form>
                    </fieldset>
                    <br></br>
                    {dataRowEditNew.EsSubsidio === "S" && (
                      <>
                        <br></br>
                        <fieldset className="scheduler-border"  >
                          <br></br>
                          <Form formData={dataRowEditNew}
                            validationGroup="FormEdicion"
                            onFieldDataChanged={(e) => {
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
                                  readOnly: dataRowEditNew.esNuevoRegistro ? false : true
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
                                  readOnly: dataRowEditNew.esNuevoRegistro ? false : true
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
                                  readOnly: dataRowEditNew.esNuevoRegistro ? false : true
                                }}
                              />
                            </GroupItem>
                          </Form>
                        </fieldset>
                      </>
                    )}
                    <br></br>
                    {/* Sección de datos adjuntos */}
                    <fieldset className="scheduler-border"  >
                      <legend className="scheduler-border" >
                        <h5>{intl.formatMessage({ id: "ADMINISTRATION.PERSON.INDISCIPLINE.ATTACHFILE" })} </h5>
                      </legend>
                      <br></br>
                      <Form formData={dataRowEditNew} validationGroup="FormEdicion" >
                        <GroupItem itemType="group" colCount={2} colSpan={2}>
                          <Item colSpan={2}>
                            {/* Componente-> Cargar un documento .PDF*/}
                            <FileUploader
                              agregarFotoBd={(data) => onFileUploader(data)}
                              fileNameX={dataRowEditNew.NombreArchivo}
                              fileDateX={dataRowEditNew.FechaArchivo}
                            />
                          </Item>

                          <Item colSpan={2} > <br></br></Item>
                          <Item colSpan={2} ><br></br> </Item>

                        </GroupItem>
                      </Form>
                    </fieldset>
                  </PortletBody>
                </Item>
                <Item title={
                  intl.formatMessage({ id: "ASSISTANCE.INCIDENCE.JUSTIFICATION.MASSIVE.CORRECT_PERSON" })
                  + (props.personasValidadas.filter(x => x.EsValida === 'S').length > 0 ?
                    " (" + props.personasValidadas.filter(x => x.EsValida === 'S').length + ")" : " (0)")}
                  icon="check">

                  <PortletBody>
                    <br></br>
                    {renderGrillaCorrecta()}
                  </PortletBody>
                </Item>
                <Item title={intl.formatMessage({ id: "ASSISTANCE.INCIDENCE.JUSTIFICATION.MASSIVE.WRONG_PERSON" })
                  + (props.personasValidadas.filter(x => x.EsValida === 'N').length > 0 ?
                    " (" + props.personasValidadas.filter(x => x.EsValida === 'N').length + ")" : " (0)")}
                  icon="close">
                  <PortletBody>
                    <br></br>
                    {renderGrillaIncorrecta()}
                  </PortletBody>

                </Item>

              </TabPanel>

            </div>
          </div>

          <br></br>

        </React.Fragment>

      </PortletBody>

      {/*******>POPUP BUSCAR POR PERSONAS.>******** */}
      {popupVisiblePersonas && (
        <AsistenciaPersonaPerfilBuscar
          showPopup={{ isVisiblePopUp: popupVisiblePersonas, setisVisiblePopUp: setPopupVisiblePersonas }}
          cancelar={() => setPopupVisiblePersonas(false)}
          agregar={agregarPersonaAsistencia}
          selectionMode={"multiple"}
          uniqueId={"IncidenciaMasiva_AsistenciaPersonaPerfilBuscar"}
          varIdCompania={varIdCompania}
        />
      )}

      {/*+++++++++++++POPUP JUSTIFICACIÓN+++++++++++++ */}
      {isVisiblePopUpJustificacion && (
        <AsistenciaJustificacionBuscar
          selectData={seleccionarJustificacion}
          showPopup={{ isVisiblePopUp: isVisiblePopUpJustificacion, setisVisiblePopUp: setisVisiblePopUpJustificacion }}
          cancelar={() => setisVisiblePopUpJustificacion(false)}
          varIdCompania={varIdCompania}
          filtro={filtroLocal}
        />
      )}

      {/*+++++++++++++POPUP DETALLE PERSONA INVALIDA +++++++++++++ */}
      <Popup
        visible={popupVisibleDetallePersonasInvalida}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={"650px"}
        width={"900px"}
        title={(
          intl.formatMessage({ id: "ACTION.DETAIL" })
          + " " +
          intl.formatMessage({ id: "COMMON.OBSERVATION" })
        ).toUpperCase()}
        onHiding={() =>
          setPopupVisibleDetallePersonasInvalida(!popupVisibleDetallePersonasInvalida)
        }
      >
        {renderGrillaDetalleInvalidos()}
      </Popup>


    </Fragment>

  );


};


export default injectIntl(WithLoandingPanel(ReporteIncidenciaJustificacionMasivaEditPage));
