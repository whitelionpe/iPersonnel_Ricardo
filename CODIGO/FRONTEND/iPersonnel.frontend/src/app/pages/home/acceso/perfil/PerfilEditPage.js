import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";//Multi-idioma
import Form, { Item, GroupItem, RequiredRule, StringLengthRule, PatternRule } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { listarEstadoSimple, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";

//import { listarEstadoSimple } from "../../../../api/sistema/entidad.api";
import { serviceEntidad } from "../../../../api/sistema/entidad.api";


const PerfilEditPage = props => {
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
        props.agregarPerfil(props.dataRowEditNew);
      } else {
        props.actualizarPerfil(props.dataRowEditNew);
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
            //visible={props.modoEdicion}
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

                <Item dataField="IdPerfil"
                  label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                  isRequired={modoEdicion}
                  editorOptions={{
                    maxLength: 10,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                  }}
                >
                  {(isRequiredRule("IdPerfil")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                  <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
                </Item>


                <Item dataField="Perfil"
                  label={{ text: intl.formatMessage({ id: "ACCESS.PROFILE" }) }}
                  isRequired={modoEdicion ? isRequired('Perfil', settingDataField) : false}
                  colSpan={2}
                  editorOptions={{
                    maxLength: 100,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    readOnly: !(modoEdicion ? isModified('Perfil', settingDataField) : false)
                  }}
                />
                <Item
                  dataField="IdEntidad"
                  label={{ text: intl.formatMessage({ id: "ACCESS.PROFILE.ENTITY" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion ? isRequired('IdEntidad', settingDataField) : false}
                  editorOptions={{
                    items: cmbEntidad,
                    valueExpr: "IdEntidad",
                    displayExpr: "Entidad",
                    readOnly: !(modoEdicion ? isModified('IdEntidad', settingDataField) : false)
                  }}
                />
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

export default injectIntl(PerfilEditPage);
