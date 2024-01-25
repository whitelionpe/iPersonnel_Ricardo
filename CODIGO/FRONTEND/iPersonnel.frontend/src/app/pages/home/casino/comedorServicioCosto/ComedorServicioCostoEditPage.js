import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import Form, { SimpleItem, Label, Item, GroupItem, PatternRule } from "devextreme-react/form";

import { isNotEmpty } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";

const ComedorServicioCostoEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton } = props;

  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estadoRegistro, setEstadoRegistro] = useState([]);

  const classesEncabezado = useStylesEncabezado();

  const [valuePorcentajeAsumidoTrabajador, setvaluePorcentajeAsumidoTrabajador] = useState(0);


  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarComedorServicioCosto(props.dataRowEditNew);
      } else {
        props.actualizarComedorServicioCosto(props.dataRowEditNew);
      }
    }
  }

  function onValueChanged(e) {
    console.log("onValueChanged:e:", e);
    console.log("props.dataRowEditNew.Costo:", props.dataRowEditNew.Costo);

    props.dataRowEditNew.CostoAsuminoEmpresa = (props.dataRowEditNew.Costo * e.value);
    props.dataRowEditNew.CostoAsuminoTrabajador = (props.dataRowEditNew.Costo * (1 - e.value));
    setvaluePorcentajeAsumidoTrabajador(1 - e.value);
  }

  useEffect(() => {

  }, []);

  return (
    <>
      <PortletHeader
        title={props.titulo}
        toolbar={
          <PortletHeaderToolbar>
            <Button
              icon="fa fa-save"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.RECORD" })}
              onClick={grabar}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
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
      <PortletBody >
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "COMMON.DETAIL" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

              <GroupItem itemType="group" colCount={2} colSpan={2}>

                <Item
                  dataField="IdCategoriaCosto"
                  label={{ text: intl.formatMessage({ id: "CASINO.CATEGORY.COST" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion}
                  colSpan={4}
                  editorOptions={{
                    items: props.comedorServicioCosto,
                    valueExpr: "IdCategoriaCosto",
                    displayExpr: "CategoriaCosto",
                    readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                  }}
                />
              </GroupItem>



              <GroupItem itemType="group" >
                <GroupItem cssClass={"card"} >
                  <GroupItem cssClass={"card-header"}>
                    <Label text={intl.formatMessage({ id: "CASINO.DINING.ROOM.COST.SERVICE.ASSUMED.COMPANY" })} />
                  </GroupItem>
                  <GroupItem cssClass={"card-body"} >

                    <Item
                      dataField="PorcentajeAsumidoEmpresa"
                      label={{ text: intl.formatMessage({ id: "%" }) }}
                      isRequired={modoEdicion ? isRequired('PorcentajeAsumidoEmpresa', settingDataField) : false}
                      editorType="dxNumberBox"
                      dataType="number"
                      maxLength={3}
                      min={10}
                      max={20}
                      editorOptions={{
                        readOnly: !(modoEdicion ? isModified('PorcentajeAsumidoEmpresa', settingDataField) : false),
                        inputAttr: { style: "text-transform: uppercase; text-align: right" },
                        showSpinButtons: true,
                        showClearButton: true,
                        onValueChanged: onValueChanged,
                        // format:"#0%",
                        format: "#0.##%",
                        min: 0.00,
                        max: 1,
                      }}
                    >
                      <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
                    </Item>

                    <Item
                      dataField="CostoAsuminoEmpresa"
                      label={{
                        text: intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.COST", }),
                      }}
                      editorType="dxNumberBox"
                      dataType="number"
                      editorOptions={{
                        inputAttr: {
                          style: "text-transform: uppercase; text-align: right",
                        },
                        format: props.formatCurrency,
                        readOnly: true
                      }}
                    />
                  </GroupItem>
                </GroupItem>
              </GroupItem>

              <GroupItem itemType="group" >
                <GroupItem cssClass={"card"} >
                  <GroupItem cssClass={"card-header"}>
                    <Label text={intl.formatMessage({ id: "CASINO.DINING.ROOM.COST.SERVICE.ASSUMED.WORKER" })} />
                  </GroupItem>
                  <GroupItem cssClass={"card-body"} >
                    <Item
                      dataField="PorcentajeAsumidoTrabajador"
                      label={{ text: intl.formatMessage({ id: "%" }) }}
                      isRequired={modoEdicion ? isRequired('PorcentajeAsumidoTrabajador', settingDataField) : false}
                      editorType="dxNumberBox"
                      dataType="number"
                      editorOptions={{
                        value: props.dataRowEditNew.esNuevoRegistro ? valuePorcentajeAsumidoTrabajador : (valuePorcentajeAsumidoTrabajador > 0 ? valuePorcentajeAsumidoTrabajador : props.dataRowEditNew.PorcentajeAsumidoTrabajador),
                        readOnly: true,
                        inputAttr: { style: "text-transform: uppercase; text-align: right" },
                        showSpinButtons: true,
                        showClearButton: true,
                        // format:"#0%",
                        format: "#0.##%",
                      }}
                    >
                      <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
                    </Item>

                    <Item
                      dataField="CostoAsuminoTrabajador"
                      label={{
                        text: intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.COST", }),
                      }}
                      editorType="dxNumberBox"
                      dataType="number"
                      editorOptions={{
                        inputAttr: {
                          style: "text-transform: uppercase; text-align: right",
                        },
                        format: props.formatCurrency,
                        readOnly: true
                      }}
                    />
                  </GroupItem>
                </GroupItem>
              </GroupItem>
            </GroupItem>
          </Form>
        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(ComedorServicioCostoEditPage);
