import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";//Multi-idioma
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
//import { listarEstadoSimple } from "../../../../api/sistema/entidad.api";
//import { serviceEntidad } from "../../../../api/sistema/entidad.api";
import { listarEstadoSimple, isRequired, isModified } from "../../../../../_metronic";
import { serviceCaracteristica } from "../../../../api/seguridad/caracteristica.api";


const PerfilCaracteristicaEditPage = props => {
  const { intl, modoEdicion, accessButton } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  //const [cmbEntidad, setCmbEntidad] = useState([]);
  const [caracteristicaData, setCaracteristicaData] = useState([]);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    //let cmbEntidad = await serviceEntidad.obtenerTodos({ ImprimirFotocheck: "" });

    setEstadoSimple(estadoSimple);
    //setCmbEntidad(cmbEntidad);
  }

  async function listar_Caracteristicas() {
    let data = await serviceCaracteristica.listar().
      catch(err => { console.log(err); });
    setCaracteristicaData(data);
  }


  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarPerfilCaracteristica(props.dataRowEditNew);
      } else {
        props.actualizarPerfilCaracteristica(props.dataRowEditNew);
      }
    }
  }

  useEffect(() => {
    cargarCombos();
    listar_Caracteristicas();
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

              <Item
                dataField="IdCaracteristica"
                label={{ text: intl.formatMessage({ id: "SECURITY.PROFILE.CHARACTERISTIC" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  items: caracteristicaData,
                  valueExpr: "IdCaracteristica",
                  displayExpr: "Caracteristica",
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
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
                  //disabled: props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              />
            </GroupItem>
          </Form>
        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(PerfilCaracteristicaEditPage);
