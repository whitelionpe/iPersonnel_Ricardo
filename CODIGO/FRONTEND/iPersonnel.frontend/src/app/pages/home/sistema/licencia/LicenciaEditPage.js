import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem, PatternRule, RequiredRule, StringLengthRule } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { isNotEmpty, listarEstadoSimple, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import { obtenerTodos as obtenerCmbModulo } from "../../../../api/sistema/modulo.api";
import { handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { Tooltip } from 'devextreme-react/tooltip';
import FieldsetAcreditacion from '../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';


const LicenciaEditPage = props => {

  const { intl, modoEdicion, settingDataField, accessButton } = props;

  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [cmbModulo, setCmbModulo] = useState([]);
  const [valueMaxLicencia, setValueMaxLicencia] = useState(0);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    let cmbModulo = await obtenerCmbModulo({ IdModulo: '%', Modulo: '%' });
    setEstadoSimple(estadoSimple);
    setCmbModulo(cmbModulo);
  }

  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }

  function validateListMailFormat() {
    var _returnValue = true;
    var regExpEmail = new RegExp('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$');

    if (isNotEmpty(props.dataRowEditNew.AlertarEmail)) {
      let arrayEmails = props.dataRowEditNew.AlertarEmail.split(';');

      if (arrayEmails.length > 0) {
        arrayEmails.map(async (data) => {
          if (isNotEmpty(data)) {
            let correo = data.toLowerCase();
            // console.log("validateListMailFormat", correo);
            if (!regExpEmail.test(correo)) {
              _returnValue = false;
            }
          }
        })
      }
    }

    return _returnValue;
  }


  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {

      if (!validateListMailFormat()) {
        handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "Hay un correo incorrecto en el campo Alerta Email" }));
        return;
      }

      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarLicencia(props.dataRowEditNew);
      } else {
        props.actualizarLicencia(props.dataRowEditNew);
      }

    }
  }

  function onValueChangedLicencia(value) {
    if (isNotEmpty(value)) {
      setValueMaxLicencia(value);
    }
  }


  const renderDetalleCorreos = () => {
    return (
      <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" id="editForm" >
        <GroupItem itemType="group" colSpan={4} colCount={2}>

          <Item
            dataField="AlertarEmail"
            label={{ text: intl.formatMessage({ id: "SYSTEM.LICENSE.ALERTEMAIL" }) }}
            isRequired={modoEdicion ? isRequired("AlertarEmail", settingDataField) : false}
            editorOptions={{
              inputAttr: { 'style': 'text-transform: uppercase' },
              placeholder: intl.formatMessage({ id: "SYSTEM.LICENSE.ALERTEMAIL.PLACEHOLDER" }),
              readOnly: !(modoEdicion ? isModified("AlertarEmail", settingDataField) : false),
              showClearButton: true,
            }}
          >
          </Item>

          <Item
            dataField="AlertarLicencia"
            label={{ text: intl.formatMessage({ id: "SYSTEM.LICENSE.ALERTLICENSE", }), }}
            isRequired={modoEdicion ? isRequired("AlertarLicencia", settingDataField) : false}
            editorType="dxNumberBox"
            dataType="number"
            editorOptions={{
              readOnly: !(modoEdicion ? isModified("AlertarLicencia", settingDataField) : false),
              inputAttr: {
                style: "text-transform: uppercase; text-align: right"
              },
              min: 0,
              max: valueMaxLicencia,
              showSpinButtons: true,
              showClearButton: true,
            }}
          >
            <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA", })} />
          </Item>



        </GroupItem>
      </Form>
    )
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

          <FieldsetAcreditacion title={intl.formatMessage({ id: "COMMON.DETAIL" })}>
            <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
              <GroupItem itemType="group" colCount={2} colSpan={2}>

                <Item
                  dataField="IdModulo"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.MODULE" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion}
                  editorOptions={{
                    items: cmbModulo,
                    valueExpr: "IdModulo",
                    displayExpr: "Modulo",
                    searchEnabled: true,
                    readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                  }}
                >
                </Item>

                <Item></Item>

                <Item
                  dataField="Licencia"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.LICENSE" }) }}
                  isRequired={modoEdicion ? isRequired('Licencia', settingDataField) : false}
                  editorType="dxNumberBox"
                  dataType="number"
                  editorOptions={{
                    readOnly: !(modoEdicion ? isModified('Licencia', settingDataField) : false),
                    inputAttr: { style: "text-transform: uppercase; text-align: right" },
                    showSpinButtons: true,
                    showClearButton: true,
                    min: 0,
                    onValueChanged: (e) => onValueChangedLicencia(e.value)
                  }}
                >
                  <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
                </Item>


                <Item dataField="FechaFin"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.LICENSE.ENDDATE" }) }}
                  isRequired={modoEdicion ? isRequired('FechaFin', settingDataField) : false}
                  editorType="dxDateBox"
                  dataType="date"
                  editorOptions={{
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    displayFormat: "dd/MM/yyyy",
                    readOnly: !(modoEdicion ? isModified('FechaFin', settingDataField) : false)
                  }}
                />
                <Item dataField="Clave"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.LICENSE.PASSWORD" }) }}
                  isRequired={true}
                  editorOptions={{
                    readOnly: !(modoEdicion ? isModified('Clave', settingDataField) : false),
                    showClearButton: true
                  }}
                >
                </Item>

                <RequiredRule
                  message={intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.PASSWORDREQUIRED" })} />
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
                <Item dataField="IdCliente" visible={false} />
              </GroupItem>

            </Form>
          </FieldsetAcreditacion>

          <FieldsetAcreditacion title={intl.formatMessage({ id: "SYSTEM.LICENSE.ALERTS" })}>
          <div className="card-body" >
                  {renderDetalleCorreos()}
                </div>
          </FieldsetAcreditacion>
         
         


        </React.Fragment>
      </PortletBody>
    </>
  );

};

export default injectIntl(LicenciaEditPage);
