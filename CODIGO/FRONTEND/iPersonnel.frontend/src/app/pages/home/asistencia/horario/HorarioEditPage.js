import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem, RequiredRule, PatternRule, StringLengthRule } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import HeaderInformation from "../../../../partials/components/HeaderInformation";


import { listarEstadoSimple, listarEstado, PatterRuler, isNotEmpty } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";

const HorarioEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton,setDataRowEditNew } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estado, setEstado] = useState([]);
  const [cicloValue, setCicloValue] = useState(0);
  const [semanalValue, setSemanalValue] = useState([]);

  const classesEncabezado = useStylesEncabezado();
  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
    let estado = listarEstado();
    setEstado(estado);
  }

  async function onValueChangedSemanal(value) {
    if (isNotEmpty(value)){
      if (value === "S") {
        props.dataRowEditNew.Ciclo = 7 ; 
        setSemanalValue("S");
        console.log("**props.dataRowEditNew** :> ",props.dataRowEditNew);
        //setDataRowEditNew({...props.dataRowEditNew, Ciclo:7});
      }
      if(value === "N")
      {
        props.dataRowEditNew.Ciclo = 1 ; 
        setSemanalValue("N");
      }
    }
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarHorario(props.dataRowEditNew);
      } else {
        props.actualizarHorario(props.dataRowEditNew);
      }
    }
  }


  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }

  useEffect(() => {
    // console.log("***props.dataRowEditNew :> ",props.dataRowEditNew);
    cargarCombos();
  }, []);

  return (
    <>
    
<HeaderInformation
        data={props.getInfo()}
        visible={true}
        labelLocation={'left'} colCount={6}
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

              <Item dataField="IdHorario"
                isRequired={modoEdicion}
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                editorOptions={{
                  maxLength: 20,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item dataField="Horario"
                isRequired={modoEdicion}
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE" }) }}
                editorOptions={{
                  maxLength: 100,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !modoEdicion,
                }}
              >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.HORARIO} />
              </Item>

              <Item
                dataField="Flexible"
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.FLEXIBLE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion ? isRequired('Flexible', settingDataField) : false}
                editorOptions={{
                  items: estado,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !modoEdicion,
                }}
              />

              <Item
                dataField="Semanal"
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.WEEKLY" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  value: isNotEmpty(props.dataRowEditNew.Semanal) ? props.dataRowEditNew.Semanal : semanalValue,
                  items: estado,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  onValueChanged: (e) => onValueChangedSemanal(e.value),
                  disabled: !props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              />

              <Item
                dataField="Ciclo"
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.CYCLE" }) }}
                isRequired={modoEdicion}
                editorType="dxNumberBox"
                dataType="number"
                editorOptions={{
                  inputAttr: { style: "text-transform: uppercase; text-align: right" },
                  showSpinButtons: true,
                  showClearButton: false,
                  disabled: props.dataRowEditNew.Semanal === "S",
                  min: !props.dataRowEditNew.esNuevoRegistro ? props.dataRowEditNew.Ciclo : 1,
                  // readOnly: !modoEdicion, //---> LSF 20230907
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              >
                <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
              </Item>

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
                }}
              />

              <Item dataField="IdCliente" visible={false} />
              <Item dataField="IdDivision" visible={false} />
              <Item dataField="IdCompania" visible={false} />

            </GroupItem>
          </Form>
        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(HorarioEditPage);
