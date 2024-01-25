import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { useSelector } from "react-redux"; 

import { listarEstadoSimple } from "../../../../../../_metronic";
import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";

import { obtenerTodos as obtenerTodosCaracteristica } from "../../../../../api/administracion/caracteristica.api";
import { obtenerTodos as obtenerTodosCaracteristicaDetalle } from "../../../../../api/administracion/caracteristicaDetalle.api";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
 

const PersonaCaracteristicaEditPage = props => {

  const { intl, modoEdicion, settingDataField, accessButton, setLoading, dataRowEditNew } = props;

  const perfil = useSelector(state => state.perfil.perfilActual);

  const [caracteristicas, setCaracteristicas] = useState([]);
  const [caracteristicaDetalles, setCaracteristicaDetalle] = useState([]);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();

  async function cargarCombos() {

   
      setLoading(true);
      let caracteristica = await obtenerTodosCaracteristica({ IdCliente: perfil.IdCliente, IdEntidad: 'P' });
      let estadoSimple = listarEstadoSimple();

      setCaracteristicas(caracteristica);
      setEstadoSimple(estadoSimple);
      console.log("cargar->",dataRowEditNew);
      
      if (!dataRowEditNew.esNuevoRegistro) {
        const { IdCaracteristica } = dataRowEditNew;
        getCaracteristicaDetalle(IdCaracteristica);
      }

      setLoading(false);
    
  }

  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (dataRowEditNew.esNuevoRegistro) {
        props.agregarCaracteristica(dataRowEditNew);
      } else {
        props.actualizarCaracteristica(dataRowEditNew);
      }
    }
  }

  const getCaracteristicaDetalle = async (value) => {
    if (value) {
      setLoading(true);
      let caracteristicaDetalle = await obtenerTodosCaracteristicaDetalle({ IdCliente: perfil.IdCliente, IdCaracteristica: value })
      setCaracteristicaDetalle(caracteristicaDetalle);
      setLoading(false);
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
          <Form formData={dataRowEditNew} validationGroup="FormEdicion" >
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
              <Item dataField="IdSecuencial" visible={false} />
              <Item
                dataField="IdCaracteristica"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.CHARACTERISTIC" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  items: caracteristicas,
                  valueExpr: "IdCaracteristica",
                  displayExpr: "Caracteristica",
                  searchEnabled: true,
                  readOnly: !dataRowEditNew.esNuevoRegistro ? true : false,
                  onValueChanged: (e => getCaracteristicaDetalle(e.value))
                }}
              >
              </Item>
              <Item
                dataField="IdCaracteristicaDetalle"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.VALUE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion ? isRequired('IdCaracteristicaDetalle', settingDataField) : false}
                editorOptions={{
                  items: caracteristicaDetalles,
                  valueExpr: "IdCaracteristicaDetalle",
                  displayExpr: "CaracteristicaDetalle",
                  searchEnabled: true,
                  readOnly: !(modoEdicion ? isModified('IdCaracteristicaDetalle', settingDataField) : false)
                }}
              >
              </Item>

              <Item dataField="FechaInicio"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" }) }}
                isRequired={modoEdicion ? isRequired('FechaInicio', settingDataField) : false}
                editorType="dxDateBox"
                dataType="date"
                editorOptions={{
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  displayFormat: "dd/MM/yyyy",
                  readOnly: !(modoEdicion ? isModified('FechaInicio', settingDataField) : false)
                }}
              />

              <Item dataField="FechaFin"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" }) }}
                isRequired={modoEdicion ? isRequired('FechaFin', settingDataField) : false}
                editorType="dxDateBox"
                dataType="date"
                editorOptions={{
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  displayFormat: "dd/MM/yyyy",
                  readOnly: !(modoEdicion ? isModified('FechaFin', settingDataField) : false)
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
                  readOnly: !(modoEdicion ? (dataRowEditNew.esNuevoRegistro ? false : true) : false)
                }}
              />
            </GroupItem>
          </Form>

        </React.Fragment>
      </PortletBody>
    </>
  );

};

export default injectIntl(WithLoandingPanel( PersonaCaracteristicaEditPage));
