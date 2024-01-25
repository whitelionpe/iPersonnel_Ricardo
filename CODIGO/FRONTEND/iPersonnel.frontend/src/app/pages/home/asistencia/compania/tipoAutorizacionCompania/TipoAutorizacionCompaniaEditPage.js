import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";
import Form, { Item, GroupItem, RequiredRule, PatternRule, StringLengthRule } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";

import { listarEstadoSimple, PatterRuler } from "../../../../../../_metronic";
import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";

import { obtenerTodos as obtenerTiposAutorizacion }  from "../../../../../api/asistencia/tipoAutorizacion.api";
import Alerts from "../../../../../partials/components/Alert/Alerts";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";

const TipoAutorizacionCompaniaEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton,varIdPersona } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [cboTipoAutorizacion, setCboTipoAutorizacion] = useState([]);

  const classesEncabezado = useStylesEncabezado();

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    let dataTipoAutorizacion = await obtenerTiposAutorizacion({ IdTipoAutorizacion:'%' });
    setEstadoSimple(estadoSimple);
    setCboTipoAutorizacion(dataTipoAutorizacion);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarTipoAutorizacionCompania(props.dataRowEditNew);
      } else {
        props.actualizarTipoAutorizacionCompania(props.dataRowEditNew);
      }
    }
  }

  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }

  useEffect(() => {
    cargarCombos();
  }, []);

  return (
    <>
   <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
                toolbar={
                    <PortletHeader
                        title={""}
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
              dataField="IdTipoAutorizacion"
              label={{ text: intl.formatMessage({ id: "ASSISTANCE.AUTHORIZATION.TYPE" }) }}
              editorType="dxSelectBox"
              isRequired={modoEdicion}
              editorOptions={{
                maxLength: 20,
                items: cboTipoAutorizacion,
                valueExpr: "IdTipoAutorizacion",
                displayExpr: "TipoAutorizacion",
                readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
              }}
              />
              </GroupItem>
            
              <Item
                dataField="NivelAprobacion"
                label={{text: intl.formatMessage({ id: "ASSISTANCE.APPROVAL.LEVEL", }),}}
                isRequired={ modoEdicion ? isRequired("NivelAprobacion", settingDataField): false}
                editorType="dxNumberBox"
                dataType="number"
                editorOptions={{
                  readOnly: !(modoEdicion? isModified("NivelAprobacion", settingDataField): false),
                  inputAttr: { style: "text-transform: uppercase; text-align: right",},
                  showSpinButtons: true,
                  showClearButton: false,
                  min: 0,
                  max: 5,
                }}
              >
                <PatternRule
                  pattern={/[0-9]/}
                  message={intl.formatMessage({
                    id: "COMMON.ENTER.NUMERIC.DATA",
                  })}
                />
              </Item>
              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
                }}
              />

            </GroupItem>
          </Form>
     

        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(TipoAutorizacionCompaniaEditPage);
