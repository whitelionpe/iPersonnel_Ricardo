import React, { useEffect } from "react";
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


const ConfiguracionModuloEditPage = props => {
  const { intl, accessButton, modoEdicion, settingDataField } = props;

  const classesEncabezado = useStylesEncabezado();

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      props.actualizarConfiguracionModulo(props.dataRowEditNew);
    }
  }

  const isRequiredRule = (id) => {
    return modoEdicion ? isRequired(id, settingDataField) : false;
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


              <Item dataField="IdConfiguracion"
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                isRequired={true}
                editorOptions={{
                  maxLength: 20,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: true
                }}
              >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item dataField="Configuracion"
                label={{ text: intl.formatMessage({ id: "SYSTEM.CONFIGURATION" }) }}
                isRequired={modoEdicion ? isRequired('Configuracion', settingDataField) : false}
                editorOptions={{
                  maxLength: 100,
                  inputAttr: { 'style': 'text-transform: uppercase' }
                }}
              >
                {(isRequiredRule("Configuracion")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

 
              <Item dataField="Valor1"
                label={{ text: intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS.VALOR1" }) }}
                isRequired={modoEdicion ? isRequired('Valor1', settingDataField) : false}
                editorOptions={{
                  maxLength: 300,
                  inputAttr: { 'style': 'text-transform: uppercase' }
                }}
              >
                {(isRequiredRule("Valor1")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item dataField="Valor2"
                label={{ text: intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS.VALOR2" }) }}
                //isRequired={modoEdicion ? isRequired('Valor2', settingDataField) : false}
                editorOptions={{
                  maxLength: 100,
                  inputAttr: { 'style': 'text-transform: uppercase' }
                }}
              >
                {/* {(isRequiredRule("Valor2")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />} */}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item dataField="Valor3"
                label={{ text: intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS.VALOR3" }) }}
                //isRequired={true}
                editorOptions={{
                  maxLength: 100,
                  inputAttr: { 'style': 'text-transform: uppercase' }
                }}
              >
                {(isRequiredRule("Valor3")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item dataField="Valor4"
                label={{ text: intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS.VALOR4" }) }}
                //isRequired={true}
                editorOptions={{
                  maxLength: 100,
                  inputAttr: { 'style': 'text-transform: uppercase' }
                }}
              >
                {(isRequiredRule("Valor4")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item dataField="Valor5"
                label={{ text: intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS.VALOR5" }) }}
                //isRequired={true}
                editorOptions={{
                  maxLength: 100,
                  inputAttr: { 'style': 'text-transform: uppercase' }
                }}
              >
                {(isRequiredRule("Valor5")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

            </GroupItem>
          </Form>
       
        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(ConfiguracionModuloEditPage);
