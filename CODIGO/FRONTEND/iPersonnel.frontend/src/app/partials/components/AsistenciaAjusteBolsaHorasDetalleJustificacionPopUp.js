import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";//Multi-idioma
import { Button, RadioGroup } from "devextreme-react";
import { Portlet, PortletHeaderPopUp, PortletHeaderToolbar } from "../content/Portlet";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";
import Form, { Item, GroupItem, PatternRule } from "devextreme-react/form";
import { handleInfoMessages } from "../../store/ducks/notify-messages";
import { listarEstado } from "../../../_metronic";
import DataGrid, { Column, Paging } from "devextreme-react/data-grid";
import { AppBar, Toolbar, Typography } from "@material-ui/core";
import { useStylesEncabezado } from "../../store/config/Styles";

const AsistenciaAjusteBolsaHorasDetalleJustificacionPopUp = props => {
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
        height={"450px"}
        width={"800px"}
        title={intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.VERDETALLEJUSTIFICACION" }).toUpperCase()}
        onHiding={() => props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)}
      >
        <Portlet>

          <Form formData={props.dataRowEditNew} validationGroup="FormEdicionPrincipal">
            <GroupItem itemType="group" colCount={2} colSpan={2}>

              <div className="row">
                <div className="col-md-12">
                  <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" >
                      <h5>{intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.JUSTIFICACION" })} </h5>
                    </legend> 
                    <Form formData={props.dataRowEditNew} validationGroup="FormEdicion1">
                      <GroupItem itemType="group" colCount={2}  >
                        <Item dataField="IdJustificacion"
                          label={{
                            text: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.CODIGO" })
                          }}
                          editorOptions={{
                            readOnly: true,
                            maxLength: 100,
                            inputAttr: { 'style': 'text-transform: uppercase' },
                          }}
                        />
                        <Item dataField="Justificacion"
                          label={{
                            text: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.JUSTIFICACION" })
                          }}
                          editorOptions={{
                            readOnly: true,
                            maxLength: 500,
                            inputAttr: { 'style': 'text-transform: uppercase' },
                          }}
                        />
                        <Item dataField="HorasDia"
                          label={{
                            text: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.TOTALHORASJUSTDIA" })
                          }}
                          editorOptions={{
                            readOnly: true,
                            maxLength: 500,
                            inputAttr: { 'style': 'text-transform: uppercase' },
                          }}
                        />
                        {/* <Item dataField="TotalHoras"
                          label={{
                            text: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.TOTALHORASJUST" })
                          }}
                          editorOptions={{
                            readOnly: true,
                            maxLength: 500,
                            inputAttr: { 'style': 'text-transform: uppercase' },
                          }}
                        /> */}
                        <Item
                          dataField="FechaCreacion"
                          label={{
                            text: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.FECHACREACION" }),
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
                          dataField="Observacion"
                          label={{ text: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.OBSERVACION" }), }}
 
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


            </GroupItem>
          </Form>

          <br></br>

          <AppBar position="static" className={classesEncabezado.secundario}>
            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
              <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                {intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.DETALLEDIAJUSTIFICACION" })}
              </Typography>
            </Toolbar>
          </AppBar>

          <br></br>
          <DataGrid
            dataSource={props.detalleDiaJustificacion}
            showBorders={true}
            focusedRowEnabled={true}
            keyExpr="RowIndex"
            noDataText={intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.NO_DATA" })}
          >
 
            <Column dataField="FechaAsistencia"
              caption={intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.FECHADIA" })}
              width={"35%"} alignment={"center"}
              dataType="date" format="dd/MM/yyyy" />
            <Column dataField="FechaHoraInicio"
              caption={intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.FECHAHORAINICIO" })}
              width={"35%"} alignment={"center"}
              dataType="datetime" format="dd/MM/yyyy HH:mm" />
            <Column dataField="FechaHoraFin"
              caption={intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.FECHAHORAFIN" })}
              width={"35%"} alignment={"center"}
              dataType="datetime" format="dd/MM/yyyy HH:mm" />


            <Paging defaultPageSize={10} />

          </DataGrid>
 
          < br ></br>
          <br></br>
        </Portlet>
      </Popup>
    </>
  );
};

AsistenciaAjusteBolsaHorasDetalleJustificacionPopUp.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
};
AsistenciaAjusteBolsaHorasDetalleJustificacionPopUp.defaultProps = {
  showButton: true,
  selectionMode: "row",
};
export default injectIntl(AsistenciaAjusteBolsaHorasDetalleJustificacionPopUp);
