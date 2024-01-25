import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem, PatternRule } from "devextreme-react/form";
import 'devextreme-react/text-area';
//import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import { obtenerTodos as listarTiposDocumento } from "../../../../api/sistema/tipodocumento.api";

import "../../../../store/config/styles.css";
import { serviceConfiguracionLogeo } from "../../../../api/seguridad/configuracionLogeo.api";
import { useSelector } from "react-redux";
import { listarEstadoSimple } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import PropTypes from "prop-types"

const UsuarioLoginViewPage = props => {

  const { intl, modoEdicion, settingDataField } = props;
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  const classesEncabezado = useStylesEncabezado();
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [estadosSimple, setEstadosSimple] = useState([]);

  const [cmbConfiguraciones, setCmbConfiguraciones] = useState([]);

  async function cargarCombos() {
    let tiposDocumento = await listarTiposDocumento();
    let estadosSimple = listarEstadoSimple();
    setTiposDocumento(tiposDocumento);
    setEstadosSimple(estadosSimple);

    //setConfiguraciones(congiguraciones);
    await serviceConfiguracionLogeo.obtenerTodos({ IdCliente }).then(cmbConfiguraciones => {
      setCmbConfiguraciones(cmbConfiguraciones);
    });
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
          </PortletHeaderToolbar>
        }
      />

      <PortletBody >
        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
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
            <Item dataField="IdPersona" visible={false} />
            <Item
              dataField="IdUsuario"
              isRequired={modoEdicion}
              colSpan={2}
              label={{ text: intl.formatMessage({ id: "SECURITY.USER.IDENTIFIER" }) }}
              editorOptions={{
                maxLength: 20,
                inputAttr: { style: "text-transform: uppercase" },
                readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
              }}
            />
            <Item
              dataField="Nombre"
              label={{ text: intl.formatMessage({ id: "SECURITY.USER.NAMES" }) }}
              isRequired={modoEdicion ? isRequired('Nombre', settingDataField) : false}
              editorOptions={{
                readOnly: !(modoEdicion ? isModified('Nombre', settingDataField) : false)
              }}
            />

            <Item
              dataField="Apellido"
              isRequired={modoEdicion ? isRequired('Apellido', settingDataField) : false}
              editorOptions={{
                readOnly: !(modoEdicion ? isModified('Apellido', settingDataField) : false)
              }}

            />

            <Item
              dataField="IdTipoDocumento"
              isRequired={modoEdicion ? isRequired('Nombre', settingDataField) : false}
              editorType="dxSelectBox"
              editorOptions={{
                items: tiposDocumento,
                valueExpr: "IdTipoDocumento",
                displayExpr: "Alias",
                readOnly: !(modoEdicion ? isModified('IdTipoDocumento', settingDataField) : false)
              }}
            />
            <Item
              dataField="Documento"
              label={{ text: intl.formatMessage({ id: "SECURITY.USER.DOCUMENTNUMBER" }) }}
              isRequired={modoEdicion ? isRequired('Documento', settingDataField) : false}
              editorOptions={{
                readOnly: !(modoEdicion ? isModified('Documento', settingDataField) : false)
              }}
            />
            <Item
              dataField="Correo"
              label={{ text: intl.formatMessage({ id: "SECURITY.USER.MAIL" }) }}
              isRequired={modoEdicion ? isRequired('Correo', settingDataField) : false}
              editorOptions={{
                readOnly: !(modoEdicion ? isModified('Correo', settingDataField) : false)
              }}
            />
            <Item
              dataField="Telefono"
              label={{ text: intl.formatMessage({ id: "SECURITY.USER.TELEPHONE" }) }}
              isRequired={modoEdicion ? isRequired('Telefono', settingDataField) : false}
              //editorType="dxNumberBox"
              dataType="number"
              editorOptions={{
                readOnly: !(modoEdicion ? isModified('Telefono', settingDataField) : false),
                showClearButton: true
              }}
            />
            <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />

            <Item
              dataField="IdConfiguracionLogeo"
              label={{
                text: intl.formatMessage({
                  id: "Configuración",
                }),
              }}
              isRequired={modoEdicion ? isRequired('IdConfiguracionLogeo', settingDataField) : false}
              editorType="dxSelectBox"
              editorOptions={{
                items: cmbConfiguraciones,
                valueExpr: "IdConfiguracionLogeo",
                displayExpr: "ConfiguracionLogeo",
                showClearButton: true,
                readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
              }}
            />

            <Item
              dataField="Activo"
              label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
              isRequired={modoEdicion}
              editorType="dxSelectBox"
              editorOptions={{
                readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false),
                items: estadosSimple,
                valueExpr: "Valor",
                displayExpr: "Descripcion"
              }}
            />

          </GroupItem>

        </Form>
      </PortletBody>
    </>
  );
};
UsuarioLoginViewPage.prototype = {
  showButtons: PropTypes.bool,
  modoEdicion: PropTypes.bool,

}
UsuarioLoginViewPage.defaultProps = {
  showButtons: true,
  modoEdicion: true,
}

export default injectIntl(UsuarioLoginViewPage);



