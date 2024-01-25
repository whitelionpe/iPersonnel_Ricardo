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

const AsistenciaAjusteBolsaHorasDetalleAjustePopUp = props => {
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
        height={"300px"}
        width={"800px"}
        title={intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.DETALLEAJUSTE" }).toUpperCase()}
        onHiding={() => props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)}
      >
        <Portlet>

          <Form formData={props.dataRowEditNew} validationGroup="FormEdicionPrincipal">
            <GroupItem itemType="group" colCount={2} colSpan={2}>

              <div className="row">
                <div className="col-md-12">
                  <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" >
                      <h5>{intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.AJUSTE" })} </h5>
                    </legend>
                    <Form formData={props.dataRowEditNew} validationGroup="FormEdicion1">
                      <GroupItem itemType="group" colCount={2}  >

                        <Item
                          dataField="Fecha"
                          label={{
                            text: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.FECHAAJUSTE" }),
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
                          dataField="FechaCreacion"
                          label={{
                            text: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.FECHAREGISTRO" }),
                          }}
                          // editorType="dxDateBox"
                          // dataType="date"
                          editorOptions={{
                            readOnly: true,
                            inputAttr: { style: "text-transform: uppercase" },
                            // displayFormat: "dd/MM/yyyy HH:mm",
                          }}
                        />


                        <Item dataField="Entrada"
                          label={{
                            text: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.ENTRADAHHEE" })
                          }}
                          editorOptions={{
                            readOnly: true,
                            maxLength: 500,
                            inputAttr: { 'style': 'text-transform: uppercase' },
                          }}
                        />

                        <Item dataField="Salida"
                          label={{
                            text: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.SALIDAHHEE" })
                          }}
                          editorOptions={{
                            readOnly: true,
                            maxLength: 500,
                            inputAttr: { 'style': 'text-transform: uppercase' },
                          }}
                        />


                        <Item
                          dataField="Motivo"
                          label={{ text: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.MOTIVO" }), }}

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
          <br></br>
        </Portlet>
      </Popup>
    </>
  );
};

AsistenciaAjusteBolsaHorasDetalleAjustePopUp.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
};
AsistenciaAjusteBolsaHorasDetalleAjustePopUp.defaultProps = {
  showButton: true,
  selectionMode: "row",
};
export default injectIntl(AsistenciaAjusteBolsaHorasDetalleAjustePopUp);
