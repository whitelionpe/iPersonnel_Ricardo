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

import { listarEstadoSimple, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";


const UnidadOrganizativaEditPage = props => {

  const { intl, modoEdicion, settingDataField, accessButton,codigoAutogenerado } = props;

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
        props.agregar(props.dataRowEditNew);
      } else {
        props.actualizar(props.dataRowEditNew);
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
              id="idGrabarUO"
              icon="fa fa-save"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.RECORD" })}
              useSubmitBehavior={true}
              disabled={!props.modoEdicion}
              validationGroup="FormEdicion"
              onClick={grabar}
              visible={false}
            />
            &nbsp;
            <Button
              icon="fa fa-times-circle"
              type="normal"
              hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
              onClick={props.cancelarEdicion}
              disabled={!props.modoEdicion}
              visible={false}
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
              <Item dataField="IdCliente" visible={false} />
              <Item dataField="IdUnidadOrganizativaPadre" visible={false} />


              {/*CONFIGURACION - CODIGO AUTOGENERADO */}
              <Item dataField="IdUnidadOrganizativa"
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }} 
                visible={codigoAutogenerado ? true : false}
                isRequired={true}
                colSpan={2} 
                editorOptions={{
                  readOnly: true,
                  maxLength: 20,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  disabled: !props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              >
                {/* <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} /> */}
              </Item>

              {/*CODIGO INGRESADO */}
              <Item dataField="IdUnidadOrganizativa"
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                isRequired={true}
                visible={!codigoAutogenerado ? true : false}    
                colSpan={2}
                editorOptions={{
                  readOnly: !props.modoEdicion,
                  maxLength: 20,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  disabled: !props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item dataField="UnidadOrganizativa"
                isRequired={true}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.COSTCENTER.UO.TAB" }) }}
                colSpan={2}
                editorOptions={{
                  readOnly: !props.modoEdicion,
                  maxLength: 100,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                }}
              >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                colSpan={2}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  readOnly: !props.modoEdicion,
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  disabled: props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              />
            </GroupItem>
          </Form>
        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(UnidadOrganizativaEditPage);
