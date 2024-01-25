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
import { handleInfoMessages } from "../../../../store/ducks/notify-messages";

import { listarEstadoSimple, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import AdministracionZonaModuloBuscar from "../../../../partials/components/AdministracionZonaModuloBuscar";


const CampamentoEditPage = props => {
  const { intl, accessButton, modoEdicion, settingDataField, dataRowEditNew } = props;
  
  const perfil = useSelector(state => state.perfil.perfilActual);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [popupVisibleZona, setPopupVisibleZona] = useState(false);

  //const [DiasLiberarReserva, setDiasLiberarReserva] = useState(true);
  const [readOnlyInputDiasReserva, setReadOnlyInputDiasReserva] = useState(false);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
  }

  async function onValueChangedLiberar(value) {
    let isChecked = value;

    if (isChecked) {
      setReadOnlyInputDiasReserva(false);
    }
    else {
      dataRowEditNew.DiasLiberarReserva = 0;
      setReadOnlyInputDiasReserva(true);
    }

  }

  function grabar(e) {
    let result = e.validationGroup.validate();

    if (result.isValid) {

      if (dataRowEditNew.DiasLiberarReserva == 0 && dataRowEditNew.LiberarReserva) {
        handleInfoMessages(intl.formatMessage({ id: "CAMP.CAMP.ALERT" }));
        return;
      }

      if (dataRowEditNew.esNuevoRegistro) {
        props.agregarCampamento(dataRowEditNew);
      } else {
        props.actualizarCampamento(dataRowEditNew);
      }
    }
  }

  const selectZona = (dataPopup) => {
     props.dataRowEditNew.IdZona = dataPopup.IdZona
     props.dataRowEditNew.Zona = dataPopup.Zona
    setPopupVisibleZona(false);
  }

  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
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
              <Item dataField="IdCampamento"
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                isRequired={modoEdicion}
                editorOptions={{
                  maxLength: 10,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !dataRowEditNew.esNuevoRegistro ? true : false
                }}
                >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                </Item>

              <Item dataField="Campamento"
                label={{ text: intl.formatMessage({ id: "CAMP.CAMP" }) }}
                isRequired={modoEdicion ? isRequired('Campamento', settingDataField) : false}
                colSpan={2}
                editorOptions={{
                  readOnly: !props.modoEdicion,
                  maxLength: 100,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !(modoEdicion ? isModified('Campamento', settingDataField) : false)
                }}
                >
                {(isRequiredRule("Campamento")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                </Item>

              <Item dataField="LiberarReserva"
                label={{
                  text: "Check",
                  visible: false
                }}
                //label={{ text: intl.formatMessage({ id: "CAMP.CAMP.RELEASERESERVATION" }) }}
                editorType="dxCheckBox"
                isRequired={modoEdicion ? isRequired('LiberarReserva', settingDataField) : false}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('LiberarReserva', settingDataField) : false),
                  text: intl.formatMessage({ id: "CAMP.CAMP.RELEASERESERVATION" }),
                  width: "100%",
                  onValueChanged: (e => onValueChangedLiberar(e.value))
                }}
              />

              <Item
                dataField="DiasLiberarReserva"
                label={{ text: intl.formatMessage({ id: "CAMP.CAMP.DAYSRELEASERESERVATION" }) }}
                editorType="dxNumberBox"
                isRequired={modoEdicion ? isRequired('DiasLiberarReserva', settingDataField) : false}
                dataType="number"
                editorOptions={{
                  readOnly: (!(modoEdicion ? isModified('DiasLiberarReserva', settingDataField) : false)) || readOnlyInputDiasReserva,
                  //readOnly: readOnlyInputDiasReserva,
                  inputAttr: { style: "text-transform: uppercase; text-align: right" },
                  showSpinButtons: true,
                  showClearButton: true,
                  //value: !(modoEdicion ? isModified('DiasLiberarReserva', settingDataField) : false),
                }}
              >
                <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
              </Item>

              <Item
                dataField="DiasPermanencia"
                label={{ text: intl.formatMessage({ id: "CAMP.CAMP.DAYSPERMANENCE" }) }}
                editorType="dxNumberBox"
                isRequired={modoEdicion ? isRequired('DiasPermanencia', settingDataField) : false}
                dataType="number"
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('DiasPermanencia', settingDataField) : false),
                  inputAttr: { style: "text-transform: uppercase; text-align: right" },
                  showSpinButtons: true,
                  showClearButton: true,
                  min:1,
                  max:99
                }}
              >
                <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
              </Item>


              <Item dataField="HoraCheckOut"
                label={{ text: intl.formatMessage({ id: "CAMP.CAMP.HORACHECKOUT" }) }}
                isRequired={modoEdicion ? isRequired('HoraCheckOut', settingDataField) : false}
                editorType="dxDateBox"
                editorOptions={{
                  showClearButton: true,
                  useMaskBehavior: true,
                  maxLength: 5,
                  displayFormat: "HH:mm",
                  type: "time",
                  readOnly: !(modoEdicion ? isModified('HoraCheckOut', settingDataField) : false)
                }}
              />

        <Item
              dataField="Zona"
              label={{ text: intl.formatMessage({ id: "CAMP.CAMP.PHYSICAL.AREA" }) }}
              isRequired={true}
              editorOptions={{
                hoverStateEnabled: false,
                inputAttr: { 'style': 'text-transform: uppercase' },
                showClearButton: true,
                buttons: [{
                  name: 'search',
                  location: 'after',
                  useSubmitBehavior: true,
                  options: {
                    stylingMode: 'text',
                    icon: 'search',
                    disabled: !modoEdicion ? true : false,
                    onClick: () => {
                      setPopupVisibleZona(true);
                    },
                  }
                }]
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

        {popupVisibleZona && (
              <AdministracionZonaModuloBuscar
              selectData={selectZona}
              showPopup={{ isVisiblePopUp: popupVisibleZona, setisVisiblePopUp: setPopupVisibleZona }}
              cancelarEdicion={() => setPopupVisibleZona(false)}
              dataMenu ={props.dataMenu}
              />
        )}

        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(CampamentoEditPage);
