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
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar,
} from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { useSelector } from "react-redux";
 
import { obtenerTodos as obtenerTodosCaracteristica } from "../../../../../api/administracion/caracteristica.api";
import { obtenerTodos as obtenerTodosCaracteristicaDetalle } from "../../../../../api/administracion/caracteristicaDetalle.api";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";

import { listarEstadoSimple, PatterRuler } from "../../../../../../_metronic";
import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";

const VehiculoCaracteristicasEditPage = (props) => {
  const { intl ,modoEdicion, settingDataField, accessButton} = props;
  const perfil = useSelector((state) => state.perfil.perfilActual);

  const [caracteristicas, setCaracteristicas] = useState([]);
  const [caracteristicaDetalles, setCaracteristicaDetalle] = useState([]);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();

  async function cargarCombos() {
    if (perfil.IdCliente) {
      let caracteristica = await obtenerTodosCaracteristica({
        IdCliente: perfil.IdCliente,
        IdEntidad: "V",
      });
      // let caracteristicaDetalle = await obtenerTodosCaracteristicaDetalle({
      //   IdCliente: perfil.IdCliente,
      //   IdCaracteristica: "%",
      // });
      let estadoSimple = listarEstadoSimple();

      setCaracteristicas(caracteristica);
      // setCaracteristicaDetalle(caracteristicaDetalle);
      setEstadoSimple(estadoSimple);
      if(!props.dataRowEditNew.esNuevoRegistro){
        getCaracteristicaDetalle(props.dataRowEditNew.IdCaracteristica);
      }

    }
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

  const getCaracteristicaDetalle = async (value) => {
    if (value) {
      let caracteristicaDetalle = await obtenerTodosCaracteristicaDetalle({
        IdCliente: perfil.IdCliente,
        IdCaracteristica: value,
      });
      setCaracteristicaDetalle(caracteristicaDetalle);
    }
  };

  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }

  useEffect(() => {
    cargarCombos();
  }, []);

  return (
    <>
      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title={""}
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
        } />

      <PortletBody>
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2}>
                <AppBar
                  position="static"
                  className={classesEncabezado.secundario}
                >
                  <Toolbar
                    variant="dense"
                    className={classesEncabezado.toolbar}
                  >
                    <Typography
                      variant="h6"
                      color="inherit"
                      className={classesEncabezado.title}
                    >
                      {intl.formatMessage({ id: "COMMON.DETAIL" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>
              <Item dataField="IdVehiculo" visible={false} />
              <Item dataField="IdSecuencial" visible={false} />
              <Item
                dataField="IdCaracteristica"
                label={{
                  text: intl.formatMessage({
                    id: "ADMINISTRATION.VEHICLE.CHARACTERISTIC",
                  }),
                }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  items: caracteristicas,
                  valueExpr: "IdCaracteristica",
                  displayExpr: "Caracteristica",
                  searchEnabled: true,
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false,
                  onValueChanged: (e => getCaracteristicaDetalle(e.value))

                }}
              ></Item>
              <Item
                dataField="IdCaracteristicaDetalle"
                label={{
                  text: intl.formatMessage({
                    id: "ADMINISTRATION.VEHICLE.VALUE",
                  }),
                }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  items: caracteristicaDetalles,
                  valueExpr: "IdCaracteristicaDetalle",
                  displayExpr: "CaracteristicaDetalle",
                  searchEnabled: true,
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              ></Item>

              <Item
                dataField="FechaInicio"
                isRequired={modoEdicion ? isRequired('FechaInicio', settingDataField) : false}
                label={{
                  text: intl.formatMessage({
                    id: "ADMINISTRATION.VEHICLE.STARTDATE",
                  }),
                }}
                editorType="dxDateBox"
                dataType="date"
                editorOptions={{
                  inputAttr: { style: "text-transform: uppercase" },
                  displayFormat: "dd/MM/yyyy",
                  readOnly: !(modoEdicion ? isModified('FechaInicio', settingDataField) : false)
                }}
              />

              <Item
                dataField="FechaFin"
                isRequired={modoEdicion ? isRequired('FechaFin', settingDataField) : false}
                label={{
                  text: intl.formatMessage({
                    id: "ADMINISTRATION.VEHICLE.ENDDATE",
                  }),
                }}
                editorType="dxDateBox"
                dataType="date"
                editorOptions={{
                  inputAttr: { style: "text-transform: uppercase" },
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

export default injectIntl(VehiculoCaracteristicasEditPage);
