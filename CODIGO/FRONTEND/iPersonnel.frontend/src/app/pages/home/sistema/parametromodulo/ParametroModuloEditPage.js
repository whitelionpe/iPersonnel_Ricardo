import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { listarEstadoSimple, listarEstadoTodos } from "../../../../../_metronic";
//import { listarEstadoSimple, listarEstado } from "../../../../api/sistema/entidad.api";


const ParametroModuloEditPage = props => {
  const { intl } = props;

  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estadoRegistro, setEstadoRegistro] = useState([]);

  const classesEncabezado = useStylesEncabezado();

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    let estadoRegistro = listarEstadoTodos();

    setEstadoSimple(estadoSimple);
    setEstadoRegistro(estadoRegistro);
  }

  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarParametroDetalle(props.dataRowEditNew);
      } else {
        props.actualizarParametroDetalle(props.dataRowEditNew);
      }
    }
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
                    {intl.formatMessage({ id: "SYSTEM.PARAMETERMODULE.ADD" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

                <Item dataField="Valor"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.PARAMETERMODULE.VALUE" }) }}
                  isRequired={true}
                  colSpan={2}
                  editorOptions={{
                    maxLength: 100,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                  }}
                />
                <Item dataField="Descripcion"
                  label={{ text: intl.formatMessage({ id: "COMMON.DESCRIPTION" }) }}
                  isRequired={true}
                  colSpan={2}
                  editorType="dxTextArea"
                  editorOptions={{
                    maxLength: 500,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    height: 90
                  }}
                />
                <Item dataField="Sp_Antes"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.PARAMETERMODULE.SP_BEFORE" }) }}
                  editorOptions={{
                    maxLength: 100,
                    inputAttr: { 'style': 'text-transform: uppercase' }
                  }}
                />
                <Item dataField="Sp_Despues"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.PARAMETERMODULE.SP_AFTER" }) }}
                  editorOptions={{
                    maxLength: 100,
                    inputAttr: { 'style': 'text-transform: uppercase' }
                  }}
                />
                <Item dataField="EditableModulo"
                  editorType="dxSelectBox"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.PARAMETERMODULE.EDITABLE" }) }}
                  editorOptions={{
                    items: estadoRegistro,
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                  }}
                />
                <Item dataField="Fijo"
                  editorType="dxSelectBox"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.PARAMETERMODULE.PERMANENT" }) }}
                  editorOptions={{
                    items: estadoRegistro,
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                  }} />

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

                <Item dataField="IdModulo" visible={false} />
                <Item dataField="IdAplicacion" visible={false} />
                <Item dataField="IdParametro" visible={false} />
                <Item dataField="IdCliente" visible={false} />
                <Item dataField="IdSecuencial" visible={false} />
              </GroupItem>
            </Form>
         
        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(ParametroModuloEditPage);
