import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem, RequiredRule, StringLengthRule, PatternRule } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";

import { obtenerTodos as obtenerTP } from "../../../../../api/sistema/tipoProceso.api";

import { listarEstadoSimple, PatterRuler } from "../../../../../../_metronic";
import { isRequired } from "../../../../../../_metronic/utils/securityUtils";
import { obtenerTodos as obtenerAplicaciones } from "../../../../../api/sistema/moduloAplicacion.api";
import { useSelector } from "react-redux";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import FieldsetAcreditacion from '../../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';


const ProcesoEditPage = props => {
  const { intl, accessButton, modoEdicion, settingDataField, setLoading } = props;

  const classesEncabezado = useStylesEncabezado();

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarProcesoCliente(props.dataRowEditNew);
      } else {
        props.actualizarProcesoCliente(props.dataRowEditNew);
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
              <Item dataField="IdCliente" visible={false} />

              <Item dataField="Proceso"
                label={{ text: intl.formatMessage({ id: "SYSTEM.PROCESS" }) }}
                isRequired={modoEdicion}
                //isRequired={modoEdicion ? isRequired('IdProceso', settingDataField) : false}
                colSpan={1}
                editorOptions={{
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: true
                  //readOnly: !(modoEdicion ? isModified('IdProceso', settingDataField) : false)
                }}
              />
              
              <Item dataField="TipoProceso"
                label={{ text: intl.formatMessage({ id: "SYSTEM.PROCESS.TYPE" }) }}
                isRequired={modoEdicion}
                colSpan={1}
                editorOptions={{
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: true
                }}
              />

              <Item dataField="CorreoAdicional"
                label={{ text: intl.formatMessage({ id: "SYSTEM.PROCESS.EMAIL" }) }}
                isRequired={modoEdicion}
                //isRequired={modoEdicion ? isRequired('CorreoAdicional', settingDataField) : false}
                editorType="dxTextArea"
                colSpan={2}
                editorOptions={{
                  //readOnly: !(modoEdicion ? isModified('Descripcion', settingDataField) : false),
                  maxLength: 500,
                  height: 200,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                }}
              >
                {(isRequiredRule("CorreoAdicional")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={500} />}
                {/*  <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} /> */}
              </Item>

              <Item dataField="Modulo"
                label={{ text: intl.formatMessage({ id: "SYSTEM.MODULE" }) }}
                isRequired={modoEdicion}
                colSpan={1}
                editorOptions={{
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: true
                }}
              />

              <Item dataField="Aplicacion"
                label={{ text: intl.formatMessage({ id: "SYSTEM.MODULEAPLICATION.APLICATION" }) }}
                isRequired={modoEdicion}
                colSpan={1}
                editorOptions={{
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: true
                }}
              />

              <Item/>

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                colSpan={1}
                isRequired={modoEdicion}
                editorOptions={{
                  items: listarEstadoSimple(),
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
                }}
              />

            </GroupItem>
          </Form>

        </React.Fragment>
      </PortletBody>

    </>
  );
};

export default injectIntl(WithLoandingPanel(ProcesoEditPage));
