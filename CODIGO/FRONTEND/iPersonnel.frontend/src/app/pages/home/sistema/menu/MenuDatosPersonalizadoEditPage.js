import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
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

import { listarEstado } from "../../../../../_metronic";

import { listarEstadoSimple, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";

const MenuDatosPersonalizadoEditPage = props => {
  const { intl,  modoEdicion, settingDataField } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  async function cargarCombos() {

    let estadoActivo = listarEstado();
    setEstadoSimple(estadoActivo);
  }

  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarMenuDatos(props.dataRowEditNew);
      } else {
        props.actualizarMenuDatos(props.dataRowEditNew);
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
                      {intl.formatMessage({ id: "SYSTEM.MENUDATA.CONFIGFORM" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

              <Item
                dataField="Campo"
                isRequired = {true}
                label={{ text: intl.formatMessage({ id: "SYSTEM.MENUDATA.CONTRYSITE" }) }}
                colSpan={2}
                editorOptions={{
                  maxLength: 100,
                  disabled: !props.dataRowEditNew.esNuevoRegistro ? true : false,
                }}
							>
							 <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> 
							{/* <PatternRule pattern={PatterRuler.SOLO_LETRAS} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} /> */}
						</Item>

              <Item
                dataField="Descripcion"
                label={{ text: intl.formatMessage({ id: "SYSTEM.MENUDATA.DESCRIPTION" }) }}
                isRequired = {true}
                colSpan={2}
                editorOptions={{
                  maxLength: 500,
                  inputAttr: { style: "text-transform: uppercase" },
                  height: 45
                }}
                >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> 
                {/* <PatternRule pattern={PatterRuler.LETRAS_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} /> */}
              </Item>
  
              <Item dataField="Obligatorio"
                label={{
                  text: "Check",
                  visible: false
                }}
                editorType="dxCheckBox"
                editorOptions={{
                  // readOnly: props.modoEdicion ? true :false,
                  text: intl.formatMessage({ id: "SYSTEM.MENUDATA.ISMANDATORY" }),
                  width: "100%"
                }}
              />

              <Item dataField="Modificable"
                label={{
                  text: "Check",
                  visible: false
                }}
                editorType="dxCheckBox"
                editorOptions={{
                  // readOnly: props.modoEdicion ? true :false,
                  text: intl.formatMessage({ id: "SYSTEM.MENUDATA.ISMODIFIABLE" }),
                  width: "100%"
                }}
              />

            </GroupItem>
          </Form>

        </React.Fragment>
      </PortletBody>
    </>
  );

};

export default injectIntl(MenuDatosPersonalizadoEditPage);
