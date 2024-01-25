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

import { serviceEntidad } from "../../../../api/sistema/entidad.api";

import { listarEstadoSimple, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import { red } from "@material-ui/core/colors";

const RequisitoEditPage = props => {

  const { intl, accessButton, modoEdicion, settingDataField } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [cmbEntidad, setCmbEntidad] = useState([]);


  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    let cmbEntidad = await serviceEntidad.obtenerTodos({ ImprimirFotocheck: "" });

    setEstadoSimple(estadoSimple);
    setCmbEntidad(cmbEntidad);
  }


  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarRequisito(props.dataRowEditNew);
      } else {
        props.actualizarRequisito(props.dataRowEditNew);
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
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion"  >
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
              <GroupItem itemType="group" colCount={2} colSpan={2}>

                <Item dataField="IdRequisito"
                  label={{
                    text: intl.formatMessage({ id: "ACCESS.REQUIREMENTS.CODE" }),
                    width: "50px",
                    style: "dx-field-item-label-content"
                  }}
                  isRequired={modoEdicion}
                  editorOptions={{
                    maxLength: 10,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false,

                  }}
                >
                  <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                  <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                </Item>


                <Item dataField="Requisito"
                  className={"dx-field-item-label-content"}
                  label={{
                    text: intl.formatMessage({ id: "ACCESS.REQUIREMENTS.REQUIREMENT" }),
                  }}
                  isRequired={modoEdicion ? isRequired('Requisito', settingDataField) : false}
                  editorOptions={{
                    maxLength: 50,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    readOnly: !(modoEdicion ? isModified('Requisito', settingDataField) : false)

                  }}
                >
                  {(isRequiredRule("Requisito")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                  <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
                </Item>
              </GroupItem>

              <Item dataField="DiasNotificacion"
                dateType="numeric"
                label={{
                  width: "auto",
                  text: intl.formatMessage({ id: "ACCESS.REQUIREMENTS.NUMBERDAYS" })
                }}
                isRequired={modoEdicion ? isRequired('DiasNotificacion', settingDataField) : false}
                editorOptions={{
                  maxLength: 4,
                  readOnly: !(modoEdicion ? isModified('DiasNotificacion', settingDataField) : false),
                  // width:300
                }}
              >
                <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
              </Item>

              <Item
                dataField="IdEntidad"
                label={{ text: intl.formatMessage({ id: "ACCESS.REQUIREMENTS.ENTITY" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  readOnly: !props.modoEdicion,
                  items: cmbEntidad,
                  valueExpr: "IdEntidad",
                  displayExpr: "Entidad",
                  enabled: props.dataRowEditNew.esNuevoRegistro ? false : true
                }}
              />


              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  //readOnly: !props.modoEdicion,
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
                  //disabled: props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              />
            </GroupItem>
          </Form>



        </React.Fragment>
      </PortletBody >
    </>
  );

};


export default injectIntl(RequisitoEditPage);
