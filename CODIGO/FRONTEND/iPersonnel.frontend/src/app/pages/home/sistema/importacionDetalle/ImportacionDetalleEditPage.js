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

import { listarEstado, listarTipoDatoImportacion, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import HeaderInformation from "../../../../partials/components/HeaderInformation";


const ImportacionDetalleEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [tipoDato, setTipoDato] = useState([]);
  const classesEncabezado = useStylesEncabezado();

  const [disabledFormato, setDisabledFormato] = useState(true);

  async function cargarCombos() {
    let estadoSimple = listarEstado();
    setEstadoSimple(estadoSimple);

    let tipoDatos = listarTipoDatoImportacion();
    setTipoDato(tipoDatos);

  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarDetalle(props.dataRowEditNew);
      } else {
        props.actualizarDetalle(props.dataRowEditNew);
      }
    }
  }

  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }


  function onValueChangedTipoDato(value) {
    if (value === "N") {
      props.setDataRowEditNew({ ...props.dataRowEditNew, TamanioDato: 10 });
      setDisabledFormato(true);
    } else if (value === "D") {
      props.setDataRowEditNew({ ...props.dataRowEditNew, TamanioDato: 10 });
      setDisabledFormato(false);
    }
    else {
      props.setDataRowEditNew({ ...props.dataRowEditNew, TamanioDato: 0 });
      setDisabledFormato(true);
    }
  }

  useEffect(() => {
    cargarCombos();
  }, []);


  return (
    <>

      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
        toolbar={

          <PortletHeader
            title=""
            toolbar={
              <PortletHeaderToolbar>
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



                <Item dataField="Campo"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.IMPORT.FIELD" }) }}
                  isRequired={true}
                  editorOptions={{
                    inputAttr: { style: "text-transform: uppercase" },
                    maxLength: 100,
                    readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                  }}
                >
                </Item>

                <Item dataField="Titulo"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.IMPORT.TITLE" }) }}
                  isRequired={modoEdicion ? isRequired("Titulo", settingDataField) : false}
                  editorOptions={{
                    inputAttr: { style: "text-transform: uppercase" },
                    maxLength: 50,
                    readOnly: !(modoEdicion ? isModified("Titulo", settingDataField) : false),

                  }}
                >
                </Item>

                <Item
                  dataField="Orden"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.IMPORT.ORDER" }) }}
                  isRequired={modoEdicion ? isRequired("Orden", settingDataField) : false}
                  editorType="dxNumberBox"
                  dataType="number"
                  editorOptions={{
                    inputAttr: { style: "text-transform: uppercase; text-align: right" },
                    readOnly: !(modoEdicion ? isModified("Orden", settingDataField) : false),
                    showSpinButtons: true,
                    showClearButton: true,
                    min: 0,
                    max: 99
                  }}
                >
                  <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
                </Item>

                <Item
                  dataField="Obligatorio"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.IMPORT.REQUIRED" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion ? isRequired("Obligatorio", settingDataField) : false}
                  editorOptions={{
                    items: estadoSimple,
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                    readOnly: !(modoEdicion ? isModified("Obligatorio", settingDataField) : false),
                  }}
                />

                <Item
                  dataField="Editable"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.IMPORT.EDITABLE" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion ? isRequired("Editable", settingDataField) : false}
                  editorOptions={{
                    items: estadoSimple,
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                    readOnly: !(modoEdicion ? isModified("Editable", settingDataField) : false),
                  }}
                />

                <Item
                  dataField="TipoDato"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.IMPORT.DATATYPE" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion ? isRequired("TipoDato", settingDataField) : false}
                  editorOptions={{
                    items: tipoDato,
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                    readOnly: !(modoEdicion ? isModified("TipoDato", settingDataField) : false),
                    onValueChanged: (e) => onValueChangedTipoDato(e.value)
                  }}
                />

                <Item
                  dataField="TamanioDato"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.IMPORT.DATAZISE" }) }}
                  isRequired={modoEdicion ? isRequired("TamanioDato", settingDataField) : false}
                  editorType="dxNumberBox"
                  dataType="number"
                  editorOptions={{
                    inputAttr: { style: "text-transform: uppercase; text-align: right" },
                    readOnly: !(modoEdicion ? isModified("TamanioDato", settingDataField) : false),
                    showSpinButtons: true,
                    showClearButton: true,
                    min: 0,
                    max: 999
                  }}
                >
                  <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
                </Item>

                <Item dataField="Formato"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.IMPORT.FORMAT" }) }}
                  editorOptions={{
                    disabled: disabledFormato
                  }}
                />

                <Item
                  dataField="Importar"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.IMPORT.IMPORT" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion ? isRequired("Importar", settingDataField) : false}
                  editorOptions={{
                    items: estadoSimple,
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                    readOnly: !(modoEdicion ? isModified("Importar", settingDataField) : false),
                  }}
                />
              </GroupItem>
            </Form>
       
        </React.Fragment>
      </PortletBody>

    </>
  );
};

export default injectIntl(ImportacionDetalleEditPage);
