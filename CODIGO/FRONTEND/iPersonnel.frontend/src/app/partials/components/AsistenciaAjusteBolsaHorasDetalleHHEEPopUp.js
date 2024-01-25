import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";//Multi-idioma
import { Button, RadioGroup, TabPanel } from "devextreme-react";
import { Portlet, PortletHeaderPopUp, PortletHeaderToolbar } from "../content/Portlet";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";
import Form, { Item, GroupItem, PatternRule } from "devextreme-react/form";
import { handleInfoMessages } from "../../store/ducks/notify-messages";
import { listarEstado } from "../../../_metronic";
import DataGrid, { Column, Paging } from "devextreme-react/data-grid";
import { AppBar, Toolbar, Typography } from "@material-ui/core";
import { useStylesEncabezado } from "../../store/config/Styles";

const AsistenciaAjusteBolsaHorasDetalleHHEEPopUp = props => {
  const { intl } = props;
  const [horaEntradaMin, setHoraEntradaMin] = useState();
  const [horaEntradaMax, setHoraEntradaMax] = useState();
  const movimientos = [{ Valor: "S", Descripcion: "ENTRADA" }, { Valor: "N", Descripcion: "SALIDA" }];

  const classesEncabezado = useStylesEncabezado();

  function aceptar() {

    //Validar que se ingrese un motivo
    if (props.dataRowEditNew.Motivo == undefined || props.dataRowEditNew.Motivo.length == 0) {
      handleInfoMessages(intl.formatMessage({ id: "ASSINTANCE.MARKING.NO.MOTIVE" }));
      return;
    }

    props.grabar();
  }

  useEffect(() => { }, []);

  return (
    <>
      <Popup
        visible={props.showPopup.isVisiblePopUp}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={"650px"}
        width={"850px"}
        title={intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.VERDETALLEHHEE" }).toUpperCase()}
        onHiding={() => props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)}
      >
        <Portlet>

          <TabPanel id="tabPanel">
            <Item title={intl.formatMessage({ id: "TRANSPORTE.MANIFEST.INFORMATION" })}
              icon="floppy">

              <Form formData={props.dataRowEditNew} validationGroup="FormEdicionPrincipal">
                <GroupItem itemType="group" colCount={2} colSpan={2}>

                  <div className="row">
                    <div className="col-md-12">
                      <fieldset className="scheduler-border" >
                        <legend className="scheduler-border" >
                          <h5>{intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.LEYENDASOLICITUD" })} </h5>
                        </legend>
                        {/* 
                    <div className="col-md-12" style={{ marginTop: "15px" }}>
                    </div> */}
                        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion1">
                          <GroupItem itemType="group" colCount={2}  >
                            <Item dataField="NombreSolicitante"
                              label={{
                                text: intl.formatMessage({ id: "ACCREDITATION.PROFILE.ENTITY.APPLICANT" })
                              }}
                              colSpan={2}
                              editorOptions={{
                                readOnly: true,
                                maxLength: 500,
                                inputAttr: { 'style': 'text-transform: uppercase' },
                              }}
                            />
                            <Item dataField="IdSolicitudHHEE"
                              label={{
                                text: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.SOLICITUDHHEE" })
                              }}
                              editorOptions={{
                                readOnly: true,
                                maxLength: 100,
                                inputAttr: { 'style': 'text-transform: uppercase' },
                              }}
                            />
                            <Item
                              dataField="FechaSolicitud"
                              label={{
                                text: intl.formatMessage({ id: "ADMINISTRATION.REQUEST.DATE" }),
                              }}
                              editorType="dxDateBox"
                              dataType="date"
                              editorOptions={{
                                readOnly: true,
                                inputAttr: { style: "text-transform: uppercase" },
                                displayFormat: "dd/MM/yyyy",
                              }}
                            />
                            <Item
                              dataField="FechaInicio"
                              label={{
                                text: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.INICIOFECHAHHEE" }),
                              }}
                              editorType="dxDateBox"
                              dataType="date"
                              editorOptions={{
                                readOnly: true,
                                inputAttr: { style: "text-transform: uppercase" },
                                displayFormat: "dd/MM/yyyy",
                              }}
                            />
                            <Item
                              dataField="FechaFin"
                              label={{
                                text: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.FINFECHAHHEE" }),
                              }}
                              editorType="dxDateBox"
                              dataType="date"
                              editorOptions={{
                                readOnly: true,
                                inputAttr: { style: "text-transform: uppercase" },
                                displayFormat: "dd/MM/yyyy",
                              }}
                            />


                            <Item dataField="EstadoDescripcion"
                              label={{
                                text: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.ESTADOAPROBACION" })
                              }}
                              editorOptions={{
                                readOnly: true,
                                maxLength: 100,
                                inputAttr: { 'style': 'text-transform: uppercase' },
                              }}
                            />

                            <Item dataField="Automatico"
                              isRequired={false}
                              label={{
                                text: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.APROBACIONAUTOMATICA" })
                              }}
                              editorType="dxCheckBox"
                              editorOptions={{
                                readOnly: true,
                                value: props.dataRowEditNew.Automatico === "S" ? true : false,
                                // text: intl.formatMessage({ id: "ACCESS.REPORT.CURRENT.VALIDITY" }),
                                width: "100%"
                              }}
                            />

                            <Item
                              dataField="Observacion"
                              label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.REASON" }), }}

                              editorType="dxTextArea"
                              editorOptions={{
                                maxLength: 500,
                                inputAttr: { style: "text-transform: uppercase" },
                                width: "100%",
                                height: 50,
                              }}
                            />
                          </GroupItem>
                        </Form>

                      </fieldset>
                    </div>
                  </div>

                  <br></br>

                  <div className="row">
                    <div className="col-md-12">
                      <fieldset className="scheduler-border" >
                        <legend className="scheduler-border" >
                          <h5>{intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.LEYENDAHHEE" })} </h5>
                        </legend>
                        {/* 
                    <div className="col-md-12" style={{ marginTop: "15px" }}>
                    </div> */}

                        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion2">
                          <GroupItem itemType="group" colCount={2} >

                            <Item dataField="Minutos"
                              label={{
                                text: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.TIEMPOTOTAL" })
                              }}
                              editorOptions={{
                                readOnly: true,
                                maxLength: 100,
                                inputAttr: { 'style': 'text-transform: uppercase' },
                              }}
                            />

                            <Item dataField="MinutosPagados"
                              label={{
                                text: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.TIEMPOPAGADO" })
                              }}
                              editorOptions={{
                                readOnly: true,
                                maxLength: 100,
                                inputAttr: { 'style': 'text-transform: uppercase' },
                              }}
                            />

                            <Item dataField="MinutosCompensados"
                              label={{
                                text: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.TIEMPOCOMPENSADO" })
                              }}
                              editorOptions={{
                                readOnly: true,
                                maxLength: 100,
                                inputAttr: { 'style': 'text-transform: uppercase' },
                              }}
                            />

                            <Item dataField="MinutosExcluidos"
                              label={{
                                text: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.TIEMPOEXCLUIDO" })
                              }}
                              editorOptions={{
                                readOnly: true,
                                maxLength: 100,
                                inputAttr: { 'style': 'text-transform: uppercase' },
                              }}
                            />

                          </GroupItem>
                        </Form>
                      </fieldset>
                    </div>
                  </div>

                </GroupItem>
              </Form>

              <br></br>
            </Item>



            <Item title={intl.formatMessage({ id: "ACCREDITATION.PROFILE.DIVISION" })}
              icon="comment">

              <br></br>

              <AppBar position="static" className={classesEncabezado.secundario}>
                <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                  <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                    {intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.DETALLEAPROBADORES" })}
                  </Typography>
                </Toolbar>
              </AppBar>

              <DataGrid
                dataSource={props.detalleAprobadores}
                showBorders={true}
                focusedRowEnabled={true}
                keyExpr="RowIndex"
                noDataText={intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.NO_DATA" })}
              >


                <Column dataField="IdPersonaAprobador"
                  caption={intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.CODIGOAPROBADOR" })}
                  width={"10%"} alignment={"center"} />

                <Column dataField="NombreCompleto"
                  caption={intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.NOMBREAPROBADOR" })}
                  width={"20%"} alignment={"center"} />

                <Column dataField="Perfil"
                  caption={intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.PERFILAPROBADOR" })}
                  width={"20%"} alignment={"center"} />

                <Column dataField="NivelAprobacion"
                  caption={intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.NIVELAPROBADOR" })}
                  width={"10%"} alignment={"center"} />

                <Column dataField="FechaAprobacion"
                  caption={intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.FECHAAPROBADOR" })}
                  width={"20%"} alignment={"center"}
                  dataType="date" format="dd/MM/yyyy" />

                <Column dataField="Observacion"
                  caption={intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.OBSERVACION" })}
                  width={"20%"} alignment={"center"} />

                <Paging defaultPageSize={10} />

              </DataGrid>

              <br></br>
              <br></br>

              <AppBar position="static" className={classesEncabezado.secundario}>
                <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                  <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                    {intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.DETALLEDIAS" })}
                  </Typography>
                </Toolbar>
              </AppBar>

              <DataGrid
                dataSource={props.detalleDia}
                showBorders={true}
                focusedRowEnabled={true}
                keyExpr="RowIndex"
                noDataText={intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.NO_DATA" })}
              >
                <Column dataField="Fecha"
                  caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" })}
                  width={"20%"} alignment={"center"}
                  dataType="date" format="dd/MM/yyyy" />
                <Column dataField="Minutos"
                  caption={intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.TIEMPO" })}
                  width={"20%"} alignment={"center"} />
                <Column dataField="MinutosPagados"
                  caption={intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.TIEMPOPAGADO" })}
                  width={"20%"} alignment={"center"} />

                <Column dataField="MinutosCompensados"
                  caption={intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.TIEMPOCOMPENSADO" })}
                  width={"20%"} alignment={"center"} />

                <Column dataField="MinutosExcluidos"
                  caption={intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.TIEMPOEXCLUIDO" })}
                  width={"20%"} alignment={"center"} />

                <Paging defaultPageSize={10} />


              </DataGrid>

              < br ></br>
            </Item>

          </TabPanel>

          <br></br>
        </Portlet>
      </Popup>
    </>
  );
};

AsistenciaAjusteBolsaHorasDetalleHHEEPopUp.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
};
AsistenciaAjusteBolsaHorasDetalleHHEEPopUp.defaultProps = {
  showButton: true,
  selectionMode: "row",
};
export default injectIntl(AsistenciaAjusteBolsaHorasDetalleHHEEPopUp);
