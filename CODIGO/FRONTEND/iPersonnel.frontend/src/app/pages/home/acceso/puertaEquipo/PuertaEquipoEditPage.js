import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";//Multi-idioma
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { listarEstadoSimple } from "../../../../api/sistema/entidad.api";
import { obtenerTodos as obtenerCmbEntidad } from "../../../../api/administracion/entidad.api";
import PropTypes from 'prop-types'

const PuertaEquipoEditPage = props => {
  const { intl } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [cmbEntidad, setCmbEntidad] = useState([]);


  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    let cmbEntidad = await obtenerCmbEntidad();

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

  useEffect(() => {
    cargarCombos();
  }, []);


  return (
    <>
      {props.showButton && (
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
        />)}
      <PortletBody >
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2} visible={props.showAppBar}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "ACCESS.PROFILE.ADD" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>
              <Item dataField="IdPerfil"
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                isRequired={true}
                editorOptions={{
                  maxLength: 10,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  disabled: !props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              />
              <Item dataField="Perfil"
                label={{ text: intl.formatMessage({ id: "ACCESS.PROFILE" }) }}
                isRequired={true}
                colSpan={2}
                editorOptions={{
                  maxLength: 100,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  disabled: !props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              />
              <Item
                dataField="IdEntidad"
                label={{ text: intl.formatMessage({ id: "ACCESS.PROFILE.ENTITY" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
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
                isRequired={true}
                editorOptions={{
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
PuertaEquipoEditPage.propTypes = {
  showButton: PropTypes.bool,
  showAppBar: PropTypes.bool
}
PuertaEquipoEditPage.defaultProps = {
  showButton: true,
  showAppBar: true
}
export default injectIntl(PuertaEquipoEditPage);
