import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { listarEstadoSimple, PatterRuler } from "../../../../../_metronic";
import Form, {
  Item,
  GroupItem,
  RequiredRule,
  StringLengthRule,
  PatternRule
} from "devextreme-react/form";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";


const GrupoEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton } = props;
  const classesEncabezado = useStylesEncabezado();


  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarGrupo(props.dataRowEditNew);
      } else {
        props.actualizarGrupo(props.dataRowEditNew);
      }
    }
  }


  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }

  useEffect(() => {
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

              <Item dataField="IdGrupo"
                isRequired={modoEdicion}
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                editorOptions={{
                  maxLength: 20,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item dataField="Grupo"
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.GRUPO" }) }}
                isRequired={modoEdicion ? isRequired('Grupo', settingDataField) : false}
                editorOptions={{
                  //readOnly: !(modoEdicion ? isModified('Grupo', settingDataField) : false),
                  maxLength: 100,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                }}
              >
                {(isRequiredRule("Grupo")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                <PatternRule pattern={PatterRuler.LETRAS_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>



              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: listarEstadoSimple(),
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
                }}
              />

              <Item dataField="IdCliente" visible={false} />
              <Item dataField="IdCompania" visible={false} />

            </GroupItem>
          </Form>

        </React.Fragment>
      </PortletBody>
    </>
  );
};



export default injectIntl(GrupoEditPage);
