import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem,RequiredRule,StringLengthRule, PatternRule } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { listarEstadoSimple, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";

 
const MonedaEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();

  async function cargarCombos() {

    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);

  }

  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarMoneda(props.dataRowEditNew);
      } else {
        props.actualizarMoneda(props.dataRowEditNew);
      }
    }
  }

  useEffect(() => {
    cargarCombos();
  }, []);

  return (
    <><PortletHeader
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

              <Item dataField="IdMoneda"
                isRequired={modoEdicion}
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                editorOptions={{
                  maxLength: 10,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item dataField="Moneda"
                label={{ text: intl.formatMessage({ id: "SYSTEM.CURRENCY" }) }}
                isRequired={modoEdicion ? isRequired('Moneda', settingDataField) : false}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('Moneda', settingDataField) : false),
                  maxLength: 50,
                  inputAttr: { 'style': 'text-transform: uppercase' },

                }}
              />

                <Item
                    dataField="Formato"
                    label={{ text: intl.formatMessage({ id: "SYSTEM.IMPORT.FORMAT" }) }}
                    isRequired={modoEdicion ? isRequired('Formato', settingDataField) : false}
                    editorType="dxSelectBox"
                    editorOptions={{
                    items: [{ valor: "S/ #,##0.##", descripcion: "S/ #,##0.##" },{ valor: "$ #,##0.##", descripcion: "$ #,##0.##" },{ valor: "€ #,##0.##", descripcion: "€ #,##0.##" }, { valor: "Bs #,##0.##", descripcion: "Bs #,##0.##" }],
                    valueExpr: "valor",
                    displayExpr: "descripcion",
                    maxLength: 20,
                    readOnly: !(modoEdicion ? isModified('Formato', settingDataField) : false),
                }}
                />

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
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

export default injectIntl(MonedaEditPage);
