import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";//Multi-idioma
import { Button, RadioGroup } from "devextreme-react";
import { Portlet, PortletHeaderPopUp, PortletHeaderToolbar } from "../content/Portlet";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";
import Form, { Item, GroupItem, PatternRule } from "devextreme-react/form";
import { handleInfoMessages } from "../../store/ducks/notify-messages";
import { listarEstado } from "../../../_metronic";

const AsistenciaAjusteBolsaHorasPopUp = props => {
  const { intl } = props;
  const [horaEntradaMin, setHoraEntradaMin] = useState();
  const [horaEntradaMax, setHoraEntradaMax] = useState();
  const movimientos = [{ Valor: "S", Descripcion: "ENTRADA" }, { Valor: "N", Descripcion: "SALIDA" }]; 

  function aceptar() { 

    //Validar que se ingrese un motivo
    if (props.dataRowEditNew.Motivo == undefined || props.dataRowEditNew.Motivo.length == 0 ) {   
      handleInfoMessages(intl.formatMessage({ id: "ASSINTANCE.MARKING.NO.MOTIVE" }));
      return;
    } 

     props.grabar();
  }

  useEffect(() => {  }, []);

  return (
    <>
      <Popup
        visible={props.showPopup.isVisiblePopUp}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={"350px"}
        width={"500px"}
        title={intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.AGREGAR_AJUSTE" }).toUpperCase()}
        onHiding={() => props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)}
      >
        <Portlet>

          {props.showButton && (
            <PortletHeaderPopUp
              title={""}
              toolbar={
                <PortletHeaderToolbar>
                  <Button
                    icon="todo"
                    type="default"
                    text={intl.formatMessage({ id: "ACTION.ACCEPT" })}
                    onClick={aceptar}
                    useSubmitBehavior={true}
                  />
                </PortletHeaderToolbar>
              }
            />
          )}

          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
            <GroupItem itemType="group" colCount={2} >

              <Item
                dataField="Fecha"
                label={{
                  text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" }),
                }}
                isRequired={true}
                editorType="dxDateBox"
                dataType="date"
                editorOptions={{
                  inputAttr: { style: "text-transform: uppercase" },
                  displayFormat: "dd/MM/yyyy",
                }}
              />


              <Item
                dataField="CantidadHoras"
                isRequired={true}
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.TIME" }) }}
                editorType="dxDateBox"
                editorOptions={{
                  //showClearButton: true,
                  useMaskBehavior: true,
                  maxLength: 5,
                  displayFormat: "HH:mm",
                  type: "time",
                  min: horaEntradaMin,
                  max: horaEntradaMax,
                  readOnly: false
                }}
              />
 

              <Item
                dataField="TipoMovimiento"
                label={{ text: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.TIPO_AJUSTE" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  readOnly: false,
                  items: movimientos,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                }}
              />



            </GroupItem>
            <GroupItem itemType="group" colCount={2} >
              <Item
                dataField="Motivo"
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.REASON" }), }}
                colSpan={2}
                isRequired={true}
                editorType="dxTextArea"
                editorOptions={{
                  maxLength: 500,
                  inputAttr: { style: "text-transform: uppercase" },
                  width: "100%",
                  height: 100,
                }}
              />
            </GroupItem>
          </Form>
{/* 
          <RadioGroup items={movimientos}
                  defaultValue={movimientos[0]}
                  layout="horizontal" /> */}

        </Portlet>
      </Popup>
    </>
  );
};

AsistenciaAjusteBolsaHorasPopUp.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
};
AsistenciaAjusteBolsaHorasPopUp.defaultProps = {
  showButton: true,
  selectionMode: "row",
};
export default injectIntl(AsistenciaAjusteBolsaHorasPopUp);
