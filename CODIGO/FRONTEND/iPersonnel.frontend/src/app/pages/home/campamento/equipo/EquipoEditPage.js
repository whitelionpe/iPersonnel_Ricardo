import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Form, { 
  Item,
  GroupItem,
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
import { injectIntl } from "react-intl";
import { listarEstadoSimple,listarTipoControl, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import { serviceEquipoAsignado } from "../../../../api/sistema/equipoAsignado.api";
import HeaderInformation from "../../../../partials/components/HeaderInformation";

const EquipoEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton,idZona,idModulo } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);
  const classesEncabezado = useStylesEncabezado();
  const [cmbEquipo, setCmbEquipo] = useState([]);

  async function cargarCombos() {
    //Cambiar por zona->JDL->2023-12-07
    console.log("JDL.>idZona,idModulo",idZona,idModulo);
    let cmbEquipo = await serviceEquipoAsignado.listarZona({ idModulo, idZona });
    setCmbEquipo(cmbEquipo);
       // Si es cado editar se setea el valor por defecto IdEquipo Asignado.
    if(!props.dataRowEditNew.esNuevoRegistro){
      setCmbEquipo([{ IdEquipo:props.dataRowEditNew.IdEquipo, Equipo:props.dataRowEditNew.Equipo }]);
    }
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarEquipo(props.dataRowEditNew);
      } else {
        props.actualizarEquipo(props.dataRowEditNew);
      }
    }
  }

  useEffect(() => {
    cargarCombos();
  }, []);

  return (
    <>
    <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
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
                      onClick={props.cancelarEdicion} />
                  </PortletHeaderToolbar>
                }
              />
            } />
      <PortletBody >
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >

            <GroupItem itemType="group" colCount={2} colSpan={2} >
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
                dataField="IdEquipo"
                label={{ text: intl.formatMessage({ id: "SYSTEM.DEVICE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  items: cmbEquipo,
                  valueExpr: "IdEquipo",
                  displayExpr: "Equipo",
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              />

              <Item
                dataField="TipoControl"
                label={{ text: intl.formatMessage({ id: "ACCESS.R001.INTERVALCONSULTATION.CONTROL.TYPE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  items: listarTipoControl(),
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                }}
              />
               
              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  items: listarEstadoSimple(),
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

export default injectIntl(EquipoEditPage);
