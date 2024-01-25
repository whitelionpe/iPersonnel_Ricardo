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

import { listarEstado, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";

 

const ImportacionTablaEditPage = props => {
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const { intl, modoEdicion, settingDataField, accessButton } = props;

  async function cargarCombos() {
    let estadoSimple = listarEstado();
    setEstadoSimple(estadoSimple);

  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarImportacion(props.dataRowEditNew);
      } else {
        props.actualizarImportacion(props.dataRowEditNew);
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

              <Item dataField="Tabla"
                label={{ text: intl.formatMessage({ id: "SYSTEM.IMPORT.TABLE" }) }}
                isRequired={true}
                editorOptions={{
                  inputAttr: { style: "text-transform: uppercase" },
                  maxLength: 100,
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              >
              </Item>

              <Item></Item>

              <Item
                dataField="Prioridad"
                label={{ text: intl.formatMessage({ id: "SYSTEM.IMPORT.PRIORITY"})}}
                isRequired={modoEdicion? isRequired("Prioridad", settingDataField): false}
                editorType="dxNumberBox"
                dataType="number"
                editorOptions={{
                  inputAttr: { style: "text-transform: uppercase; text-align: right" },
                  readOnly: !(modoEdicion ? isModified("Prioridad", settingDataField): false),
                  showSpinButtons: true,
                  showClearButton: true,
                  min:1, 
                  max:99
                }}
              >
                <PatternRule pattern={/[0-9]/}  message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA"})}/>
              
              </Item>

              <Item
                dataField="Importar"
                label={{ text: intl.formatMessage({ id: "SYSTEM.IMPORT.IMPORT" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion? isRequired("Importar", settingDataField): false}
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !(modoEdicion ? isModified("Importar", settingDataField): false),
                }}
              />

              <Item
                dataField="Descripcion"
                label={{ text: intl.formatMessage({ id: "SYSTEM.IMPORT.DESCRIPTION" }), }}
                isRequired={modoEdicion? isRequired("Descripcion", settingDataField): false}
                colSpan={2}
                editorType="dxTextArea"
                editorOptions={{
                  maxLength: 500,
                  inputAttr: { style: "text-transform: uppercase" },
                  width: "100%",
                  height: 50,
                  readOnly: !(modoEdicion ? isModified("Descripcion", settingDataField): false),
                }}
              />

            </GroupItem>
          </Form>

        </React.Fragment>
      </PortletBody>

    </>
  );
};

export default injectIntl(ImportacionTablaEditPage);
