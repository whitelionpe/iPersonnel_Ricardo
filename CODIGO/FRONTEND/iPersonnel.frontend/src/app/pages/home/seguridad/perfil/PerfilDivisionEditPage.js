import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { listarEstadoSimple, isRequired, isModified } from "../../../../../_metronic";
//import { listarEstadoSimple } from "../../../../api/sistema/entidad.api";
import { obtenerTodos as obtenerTodosDivisiones } from "../../../../api/sistema/division.api";

const DivisionEditPage = props => {
  const { intl, modoEdicion, settingDataField } = props;
  const perfil = useSelector((state) => state.perfil.perfilActual);
  const [divisiones, setDivisiones] = useState([]);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();

  async function cargarCombos() {
    let divisiones = await obtenerTodosDivisiones({
      IdCliente: perfil.IdCliente,
    });
    let estadoSimple = listarEstadoSimple();

    setDivisiones(divisiones);
    setEstadoSimple(estadoSimple);
  }


  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarRegistro(props.dataRowEditNew);
      } else {
        props.actualizarRegistro(props.dataRowEditNew);
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
              useSubmitBehavior={true} 
              onClick={grabar}
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

              <Item
                dataField="IdDivision"
                label={{ text: intl.formatMessage({ id: "SYSTEM.DIVISION" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  items: divisiones,
                  valueExpr: "IdDivision",
                  displayExpr: "Division",
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              />
              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                colSpan={2}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
                  //disabled: props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              />
              <Item dataField="IdCliente" visible={false} />
              <Item dataField="IdPerfil" visible={false} />
            </GroupItem>
          </Form>
        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl (DivisionEditPage);
