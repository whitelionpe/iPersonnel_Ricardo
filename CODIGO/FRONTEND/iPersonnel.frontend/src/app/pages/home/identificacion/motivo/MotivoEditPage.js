import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem, RequiredRule, PatternRule, StringLengthRule } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { listarEstadoSimple, listarEstado, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";


const MotivoEditPage = props => {
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estado, setEstado] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const { intl, accessButton, modoEdicion, settingDataField } = props;

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);

    let estado = listarEstado();
    setEstado(estado);
  }


  function grabar(e) {
    let result = e.validationGroup.validate();

    if (result.isValid) {
      console.log("grabar", props.dataRowEditNew);
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarMotivo(props.dataRowEditNew);
      } else {
        props.actualizarMotivo(props.dataRowEditNew);
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
    <><PortletHeader
      title={props.titulo}
      toolbar={
        <PortletHeaderToolbar>

          <Button
            icon="fa fa-save"
            type="default"
            hint={intl.formatMessage({ id: "ACTION.RECORD" })}
            visible={modoEdicion}
            disabled={!accessButton.grabar}
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

              <Item dataField="IdMotivo"
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


              <Item dataField="Motivo"
                label={{ text: intl.formatMessage({ id: "IDENTIFICATION.REASON" }) }}
                isRequired={modoEdicion ? isRequired('Motivo', settingDataField) : false}
                editorOptions={{
                  maxLength: 50,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !(modoEdicion ? isModified('Motivo', settingDataField) : false)

                }}
              >
                {(isRequiredRule("Motivo")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>

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

              {/* <Item
                dataField="Emision"
                isrequired={modoEdicion ? isRequired('Emision', settingDataField) : false}
                label={{
                  text: intl.formatMessage({
                    id: "IDENTIFICATION.ISSUE.QUESTION",
                  }),
                }}
                editorType="dxSelectBox"

                editorOptions={{
                  items: estado,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !(modoEdicion ? isModified('Emision', settingDataField) : false)
                }}
              /> */}

            </GroupItem>
          </Form>
        </React.Fragment>
      </PortletBody>
    </>
  );

};


export default injectIntl(MotivoEditPage);
