import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import {  isNotEmpty } from "../../../../../_metronic";
import { obtenerTodos } from "../../../../api/asistencia/tipoIncidencia.api";
import { useSelector } from "react-redux";
import Form, {
  Item,
  GroupItem
} from "devextreme-react/form";
import ColorBox from 'devextreme-react/color-box';

const IncidenciaEditPage = props => {

  const { intl, modoEdicion, accessButton,valueColor } = props;
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  const classesEncabezado = useStylesEncabezado();
  const [cmbTipoIncidencia, setCbTipoIncidencia] = useState([]);

  var colorNuevo = "";

  async function cargarCombos() {
    let data = await obtenerTodos({ IdTipoIncidencia: '%' });
    setCbTipoIncidencia(data);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.dataRowEditNew.Color =  isNotEmpty(colorNuevo) ? colorNuevo : valueColor ;
        props.agregarIncidencia(props.dataRowEditNew);
      } else {
        props.dataRowEditNew.Color =  isNotEmpty(colorNuevo) ? colorNuevo : valueColor ;
        props.actualizarIncidencia(props.dataRowEditNew);
      }
    }
  }

  function onValueChangedColorFondo(value) {
    if (isNotEmpty(value)) {
      colorNuevo = value;
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
                dataField="IdIncidencia"
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                editorOptions={{
                  readOnly: true
                }}
              />

              <Item
                dataField="Incidencia"
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.INCIDENCE.INCIDENCE" }) }}
                editorOptions={{
                  readOnly: true
                }}
              />

              <Item
                dataField="IdTipoIncidencia"
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.INCIDENCE.INCIDENCE.TYPE" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: cmbTipoIncidencia,
                  valueExpr: "IdTipoIncidencia",
                  displayExpr: "TipoIncidencia",
                  showClearButton: true,
                  readOnly: true
                }}
              />

              <Item
                dataField="Color"
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.INCIDENCE.COLOR" }) }}
                editorOptions={{
                  readOnly: true,
                  maxLength: 10,
                }}
              >
                <ColorBox
                  readOnly={!props.modoEdicion}
                  defaultValue={valueColor}
                  applyValueMode="instantly"
                  onValueChanged={(e) => onValueChangedColorFondo(e.value)}
                />
              </Item>

            </GroupItem>
          </Form>

        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(IncidenciaEditPage);
