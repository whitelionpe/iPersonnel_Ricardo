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

import { obtenerTodos as obtenerTA } from "../../../../api/sistema/tipoAplicacion.api";

import { listarEstadoSimple, PatterRuler, listarEstado } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";



const AplicacionEditPage = props => {
  const { intl, accessButton, modoEdicion, settingDataField } = props;

  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [cboTipoAplicacion, setCboTipoAplicacion] = useState([]);
  const [estadoRegistro, setEstadoRegistro] = useState([]);

  // async function cargarCombos() {
  //   let data = await obtenerTA({ IdTipoAplicacion:'%'});
  //   let estadoSimple = listarEstadoSimple();

  //   setCboTipoAplicacion(data);
  //   setEstadoSimple(estadoSimple);

  // }

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    let cboTipoAplicacion = await obtenerTA({ IdTipoAplicacion: '%' });
    let estadoRegistro = listarEstado();

    setEstadoSimple(estadoSimple);
    setCboTipoAplicacion(cboTipoAplicacion);
    setEstadoRegistro(estadoRegistro);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarAplicacion(props.dataRowEditNew);
      } else {
        props.actualizarAplicacion(props.dataRowEditNew);
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
              <Item dataField="IdAplicacion"
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                isRequired={modoEdicion}
                editorOptions={{
                  maxLength: 10,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item dataField="Aplicacion"
                label={{ text: intl.formatMessage({ id: "COMMON.DESCRIPTION" }) }}
                isRequired={modoEdicion ? isRequired('Aplicacion', settingDataField) : false}
                colSpan={2}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('Aplicacion', settingDataField) : false),
                  maxLength: 50,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                }}
              >
                {(isRequiredRule("Aplicacion")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>

              <Item
                dataField="IdTipoAplicacion"
                label={{ text: intl.formatMessage({ id: "SYSTEM.APLICATION.TYPE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                // isRequired={modoEdicion ? isRequired('TipoAplicacion', settingDataField) : false}
                editorOptions={{
                  items: cboTipoAplicacion,
                  valueExpr: "IdTipoAplicacion",
                  displayExpr: "TipoAplicacion",
                  readOnly: !(modoEdicion ? isModified('Aplicacion', settingDataField) : false),
                }}
              />

              <Item
                dataField="UsoExterno"
                label={{ text: intl.formatMessage({ id: "SYSTEM.EXTERNALUSE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false),
                  items: estadoRegistro,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion"
                }}
              />

              <Item />

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

export default injectIntl(AplicacionEditPage);
