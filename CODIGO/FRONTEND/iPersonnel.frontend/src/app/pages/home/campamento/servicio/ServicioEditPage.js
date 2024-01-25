import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { 
  Item,
  GroupItem,
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

import { listarEstadoSimple, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";


const ServicioEditPage = props => {
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const { intl, modoEdicion, settingDataField, accessButton } = props;

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarServicio(props.dataRowEditNew);
      } else {
        props.actualizarServicio(props.dataRowEditNew);
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

              <Item dataField="IdServicio"
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                isRequired={modoEdicion}
                editorOptions={{
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false,
                  maxLength: 10,
                  inputAttr: { 'style': 'text-transform: uppercase' }
                }}
                >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                </Item>

              <Item dataField="Servicio"
                label={{ text: intl.formatMessage({ id: "COMMON.DESCRIPTION" }) }}
                isRequired={modoEdicion ? isRequired('Servicio', settingDataField) : false}
                colSpan={2}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('Servicio', settingDataField) : false),
                  maxLength: 100,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                }}
                >
                {(isRequiredRule("Servicio")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false),
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion"
                }}
              />

              <Item dataField="IdCliente" visible={false} />
              <Item dataField="IdDivision" visible={false} />

            </GroupItem>
          </Form>
        </React.Fragment>
      </PortletBody>
    </>
  );
};


export default injectIntl(ServicioEditPage);
