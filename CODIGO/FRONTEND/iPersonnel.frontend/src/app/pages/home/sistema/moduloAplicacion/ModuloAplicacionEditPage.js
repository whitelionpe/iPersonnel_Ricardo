import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";//Multi-idioma
import Form, {
  Item,
  GroupItem,
  SimpleItem,
  ButtonItem,
  RequiredRule,
  StringLengthRule,
  PatternRule
} from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { obtenerTodos as obtenerTodosAplicaciones } from "../../../../api/sistema/aplicacion.api";

import { listarEstadoSimple, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";



const ModuloAplicacionEditPage = props => {

  const { intl, accessButton, modoEdicion, settingDataField } = props;
  const [aplicaciones, setAplicaciones] = useState([]);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    let aplicaciones = await obtenerTodosAplicaciones();
    setAplicaciones(aplicaciones);
    setEstadoSimple(estadoSimple);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNewApp.esNuevoRegistro) {
        props.agregarModuloAplicacion(props.dataRowEditNewApp);
      } else {
        props.actualizarModuloAplicacion(props.dataRowEditNewApp);
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
      <PortletHeader
        title={props.tituloApp}
        toolbar={
          <PortletHeaderToolbar>

            <Button
              icon="fa fa-save"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.RECORD" })}
              onClick={grabar}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
            />
            &nbsp;
            <Button
              icon="fa fa-times-circle"
              type="normal"
              hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
              onClick={props.cancelarEdicionApp}
            />

          </PortletHeaderToolbar>
        }
      />
      <PortletBody >
        <React.Fragment>
         
            <Form formData={props.dataRowEditNewApp} validationGroup="FormEdicion" >
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

                <Item dataField="IdModulo" visible={false} />
                <Item
                  dataField="IdAplicacion"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.MODULEAPLICATION.APLICATION" }) }}
                  editorType="dxSelectBox"
                  isRequired={true}
                  editorOptions={{
                    items: aplicaciones,
                    valueExpr: "IdAplicacion",
                    displayExpr: "Aplicacion",
                    readOnly: !props.dataRowEditNewApp.esNuevoRegistro ? true : false
                  }}
                >
                  <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                  <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                </Item>

                <Item
                  dataField="Activo"
                  label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                  editorType="dxSelectBox"
                  isRequired={true}
                  editorOptions={{
                    items: estadoSimple,
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                    disabled: props.dataRowEditNewApp.esNuevoRegistro ? true : false
                  }}
                />
              </GroupItem>
            </Form>
           
        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(ModuloAplicacionEditPage);
