import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";
import Form, { 
  Item,
  GroupItem,
  RequiredRule,
  StringLengthRule,
  PatternRule
  } from "devextreme-react/form";import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { CheckBox } from 'devextreme-react/check-box';
import { obtenerTodos as obtenerCmbComedor } from "../../../../api/casino/comedor.api";
import { obtenerTodos as obtenerCmbServicio } from "../../../../api/casino/comedorServicio.api";
import { isNotEmpty } from "../../../../../_metronic";
import PropTypes from "prop-types"
import dxCheckBox, { IOptions } from "devextreme/ui/check_box";
import HeaderInformation from "../../../../partials/components/HeaderInformation";

import { listarEstadoSimple,listarEstado, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";


const GrupoServicioEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton  } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estadoRegistro, setEstadoRegistro] = useState([]);

  const classesEncabezado = useStylesEncabezado();
  const [cmbComedor, setCmbComedor] = useState([]);
  const [cmbServicio, setCmbServicio] = useState([]);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    let estadoRegistro = listarEstado();
    let cmbComedorX = await obtenerCmbComedor({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision, IdTipo: '%' });

    let cmbServicioX = await obtenerCmbServicio({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision, IdComedor: '%' });

    setEstadoSimple(estadoSimple);
    setEstadoRegistro(estadoRegistro);

    setCmbComedor(cmbComedorX);
    setCmbServicio(cmbServicioX);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarGrupoServicio(props.dataRowEditNew);
      } else {
        props.actualizarGrupoServicio(props.dataRowEditNew);
      }
    }
  }


  async function onValueChangedComedor(value) {
    let servicios = await obtenerCmbServicio({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision, IdComedor: value });
    setCmbServicio(servicios);
  }

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

      <PortletBody >
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={4} colSpan={4}>
              <Item colSpan={4}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "COMMON.DETAIL" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>
              <Item dataField="IdGrupo" visible={false} />
              <Item
                dataField="IdComedor"
                label={{ text: intl.formatMessage({ id: "CASINO.DINNINGROOM" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                colSpan={2}
                editorOptions={{
                  items: cmbComedor,
                  valueExpr: "IdComedor",
                  displayExpr: "Comedor",
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false,
                  onValueChanged: (e => onValueChangedComedor(e.value))
                }}
              />
              <Item
                dataField="IdServicio"
                editorType="dxSelectBox"
                label={{ text: intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE" }) }}
                isRequired={modoEdicion}
                colSpan={2}
                editorOptions={{
                  items: cmbServicio,
                  valueExpr: "IdServicio",
                  displayExpr: function (item) {
                    if (item) {
                      return item.Servicio + "- [" + item.HoraInicio + " " + item.HoraFin + "]";
                    }
                  },
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false,
                }}
              />
              <Item dataField="Lunes"
               label={{
                text: "Check",
                visible: false
              }}
                editorType="dxCheckBox"
                isRequired={modoEdicion ? isRequired('Lunes', settingDataField) : false}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('Lunes', settingDataField) : false),
                  text: intl.formatMessage({ id: "CASINO.GROUP.SERVICE.MONDAY" }),
                  width: "100%"
                }}
              />
              <Item dataField="Martes"
               label={{
                text: "Check",
                visible: false
              }}
                editorType="dxCheckBox"
                //label={{ text: intl.formatMessage({ id: "CASINO.GROUP.SERVICE.TUESDAY" }) }}
                isRequired={modoEdicion ? isRequired('Martes', settingDataField) : false}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('Martes', settingDataField) : false),
                  //value: props.dataRowEditNew.Martes === "S" ? true : false
                  text: intl.formatMessage({ id: "CASINO.GROUP.SERVICE.TUESDAY" }),
                  width: "100%"
                }}
              />
              <Item dataField="Miercoles"
               label={{
                text: "Check",
                visible: false
              }}
                editorType="dxCheckBox"
                //label={{ text: intl.formatMessage({ id: "CASINO.GROUP.SERVICE.WEDNESDAY" }) }}
                isRequired={modoEdicion ? isRequired('Miercoles', settingDataField) : false}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('Miercoles', settingDataField) : false),
                  //value: props.dataRowEditNew.Miercoles === "S" ? true : false
                  text: intl.formatMessage({ id: "CASINO.GROUP.SERVICE.WEDNESDAY" }),
                  width: "100%"
                }}
              />
              <Item dataField="Jueves"
               label={{
                text: "Check",
                visible: false
              }}
                editorType="dxCheckBox"
                //label={{ text: intl.formatMessage({ id: "CASINO.GROUP.SERVICE.THURSDAY" }) }}
                isRequired={modoEdicion ? isRequired('Jueves', settingDataField) : false}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('Jueves', settingDataField) : false),
                  //value: props.dataRowEditNew.Jueves === "S" ? true : false,
                  text: intl.formatMessage({ id: "CASINO.GROUP.SERVICE.THURSDAY" }),
                  width: "100%"
                }}
              />
              <Item dataField="Viernes"
               label={{
                text: "Check",
                visible: false
              }}
                editorType="dxCheckBox"
                //label={{ text: intl.formatMessage({ id: "CASINO.GROUP.SERVICE.FRIDAY" }) }}
                isRequired={modoEdicion ? isRequired('Viernes', settingDataField) : false}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('Viernes', settingDataField) : false),
                  //value: props.dataRowEditNew.Viernes === "S" ? true : false
                  text: intl.formatMessage({ id: "CASINO.GROUP.SERVICE.FRIDAY" }),
                  width: "100%"
                }}
              />
              <Item dataField="Sabado"
               label={{
                text: "Check",
                visible: false
              }}
                editorType="dxCheckBox"
                //label={{ text: intl.formatMessage({ id: "CASINO.GROUP.SERVICE.SATURDAY" }) }}
                isRequired={modoEdicion ? isRequired('Sabado', settingDataField) : false}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('Sabado', settingDataField) : false),
                  //value: props.dataRowEditNew.Sabado === "S" ? true : false
                  text: intl.formatMessage({ id: "CASINO.GROUP.SERVICE.SATURDAY" }),
                  width: "100%"
                }}
              />

              <Item dataField="Domingo" colSpan={2}
               label={{
                text: "Check",
                visible: false
              }}
                editorType="dxCheckBox"
                //label={{ text: intl.formatMessage({ id: "CASINO.GROUP.SERVICE.SUNDAY" }) }}
                isRequired={modoEdicion ? isRequired('Domingo', settingDataField) : false}
                editorOptions={{ 
                  readOnly: !(modoEdicion ? isModified('Domingo', settingDataField) : false),
                  //value: props.dataRowEditNew.Domingo === "S" ? true : false 
                  text: intl.formatMessage({ id: "CASINO.GROUP.SERVICE.SUNDAY" }),
                  width: "100%"
                }}
              />


              {/*<Item dataField="Domingo"
                editorType="dxCheckBox"
                label={{ text: intl.formatMessage({ id: "CASINO.GROUP.SERVICE.SUNDAY" }) }} 
                editorOptions={{ 
                  items: estadoRegistro,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion"
                }}
              />*/}
              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                colSpan={2}
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

export default injectIntl(GrupoServicioEditPage);
