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
import { obtenerTodos as obtenerTodosLicencias } from "../../../../../api/identificacion/licencia.api";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";

const PersonaLicenciaEditPage = props => {

  const { intl, modoEdicion, settingDataField, accessButton,fechasContrato } = props;

  const perfil = useSelector(state => state.perfil.perfilActual);

  const [licencias, setLicencias] = useState([]);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();

  async function cargarCombos() {
    if (perfil.IdCliente) {
      let dataLicencias = await obtenerTodosLicencias({ IdCliente: perfil.IdCliente});
      let estadoSimple = listarEstadoSimple();
      setLicencias(dataLicencias);
      setEstadoSimple(estadoSimple);
    }
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarLicencia(props.dataRowEditNew);
      } else {
        props.actualizarLicencia(props.dataRowEditNew);
      }
    }
  }


  useEffect(() => {
    cargarCombos();
  }, []);

  return (
    <>
  
      <HeaderInformation 
            data={props.getInfo()}
             visible={props.showHeaderInformation} 
             labelLocation={'left'} 
             colCount={6}
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
              <Item dataField="IdPersona" visible={false} />
              <Item dataField="IdSecuencial" visible={false} />
              <Item
                dataField="IdLicencia"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.LICENSE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  items: licencias,
                  valueExpr: "IdLicencia",
                  displayExpr: "Licencia",
                  searchEnabled: true,
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false,
                }}
              />

              <Item/>

              <Item dataField="FechaInicio"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" }) }}
                isRequired={modoEdicion ? isRequired('FechaInicio', settingDataField) : false}
                editorType="dxDateBox"
                dataType="date"
                editorOptions={{
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  displayFormat: "dd/MM/yyyy",
                  readOnly: !(modoEdicion ? isModified('FechaInicio', settingDataField) : false),
                  min: fechasContrato.FechaInicioContrato,
                  max: fechasContrato.FechaFinContrato
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
                  readOnly: !(modoEdicion ? isModified('FechaFin', settingDataField) : false),
                  min: fechasContrato.FechaInicioContrato,
                  max: fechasContrato.FechaFinContrato
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

export default injectIntl(PersonaLicenciaEditPage);
