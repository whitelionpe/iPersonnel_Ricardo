import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../../store/config/Styles";

import { obtenerTodos as obtenerTodosEntidad } from "../../../../../../api/sistema/entidad.api";
import { injectIntl } from "react-intl";

import { listarEstadoSimple } from "../../../../../../../_metronic";
//import { isRequired, isModified } from "../../../../../../../_metronic/utils/securityUtils";

const SolicitudEditPage = props => {
  const [entidades, setEntidades] = useState([]);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const { intl, modoEdicion, settingDataField, accessButton } = props;


  async function cargarCombos() {
    let entidades = await obtenerTodosEntidad(0, 0);
    let estadoSimple = listarEstadoSimple();
    setEntidades(entidades);

    setEstadoSimple(estadoSimple);
  }

  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarCaracteristica(props.dataRowEditNew);
      } else {
        props.actualizarCaracteristica(props.dataRowEditNew);
      }
    }
  }

  // const isRequiredRule = (id) => {
  //   return modoEdicion ? false : isRequired(id, settingDataField);
  // }

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
              onClick={props.cancelarEdicion} />

          </PortletHeaderToolbar>
        }
      />
      <PortletBody >
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >

            <GroupItem itemType="group" colCount={2} colSpan={2} >
              <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "COMMON.DETAIL" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>
              <Item dataField="IdSolicitud"
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                // isRequired={modoEdicion ? isRequired('IdSolicitud', settingDataField) : false}
                editorOptions={{
                  maxLength: 10,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  // readOnly: !(modoEdicion ? isModified('IdSolicitud', settingDataField) : false)
                }}
              >
                {/* <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} /> */}
              </Item>

              <Item dataField="IdContrato"
                // isRequired={modoEdicion ? isRequired('Alias', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "Contrato" }) }}
                editorOptions={{
                  // readOnly: !(modoEdicion ? isModified('Alias', settingDataField) : false),
                  maxLength: 30,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                }}
              >
                {/* {(isRequiredRule("Alias")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={30} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} /> */}
              </Item>

              <Item dataField="Documento"
                // isRequired={modoEdicion ? isRequired('Caracteristica', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "Documento" }) }}
                editorOptions={{
                  // readOnly: !(modoEdicion ? isModified('TipoDocumento', settingDataField) : false),
                  maxLength: 100,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                }}
              >
                {/* {(isRequiredRule("Caracteristica")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} /> */}
              </Item>

              <Item dataField="Nombre"
                // isRequired={modoEdicion ? isRequired('Caracteristica', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "Nombre" }) }}
                editorOptions={{
                  // readOnly: !(modoEdicion ? isModified('TipoDocumento', settingDataField) : false),
                  maxLength: 100,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                }}
              >
                {/* {(isRequiredRule("Caracteristica")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} /> */}
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
            </GroupItem>

          </Form>
        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(SolicitudEditPage);
