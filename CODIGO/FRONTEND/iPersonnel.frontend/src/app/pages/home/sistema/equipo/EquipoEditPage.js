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
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { obtenerTodos as obtenerTipoEquipo } from "../../../../api/sistema/tipoequipo.api";
import { obtenerTodos as obtenerTipoModelo } from "../../../../api/sistema/tipoequipoModelo.api";
import { obtenerTodos as obtenerTipoLectura } from "../../../../api/sistema/tipolectura.api";
import PropTypes from "prop-types"
import { isNotEmpty, listarComps, listarEstadoSimple, listarTipoEntrada, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import FieldsetAcreditacion from '../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';


const EquipoEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton } = props;

  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estadoEntrada, setEstadoEntrada] = useState([]);
  const [tipoEquipos, setTipoEquipos] = useState([]);
  const [tipoModelos, setTipoModelos] = useState([]);
  const [tipoLecturas, setTipoLecturas] = useState([]);
  const classesEncabezado = useStylesEncabezado();

  async function cargarCombos() {

    let estadoSimple = listarEstadoSimple();
    let estadoEntrada = listarTipoEntrada();
    let tiposEquipos = await obtenerTipoEquipo({ IdTipoEquipo: '%', IdTipoEquipoHijo: '%' });
    let tipoLectura = await obtenerTipoLectura();
    setTipoEquipos(tiposEquipos);

    setEstadoSimple(estadoSimple);
    setEstadoEntrada(estadoEntrada);
    setTipoLecturas(tipoLectura);
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

  async function onValueChangedTipoEquipo(values) {
    try {
      let tipoModelo = await obtenerTipoModelo({ IdTipoEquipo: values });
      setTipoModelos(tipoModelo);
    } catch (error) {

    }
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
              id="idButtonGrabarTview"
              icon="fa fa-save"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.RECORD" })}
              visible={props.showButtons ? props.modoEdicion : false}
              onClick={grabar}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
              disabled={!accessButton.grabar}
            />
            &nbsp;
            <Button
              icon="fa fa-times-circle"
              type="normal"
              hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
              onClick={props.cancelarEdicion}
              visible={props.showButtons ? true : false}
            />
          </PortletHeaderToolbar>
        }
      />

      <PortletBody >
        <React.Fragment>

          <FieldsetAcreditacion title={intl.formatMessage({ id: "SYSTEM.TEAM.DATA" })}>
            <Form formData={props.dataRowEditNew} validationGroup="FormEdicion"  >
              <GroupItem itemType="group" colCount={2} colSpan={2}>
                <Item dataField="IdTipoEquiPadre" visible={false} />
                <Item dataField="IdEquipo"
                  isRequired={false}
                  label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                  colSpan={1}
                  editorOptions={{
                    readOnly: !(modoEdicion ? isModified('IdEquipo', settingDataField) : false),
                    maxLength: 50,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    placeholder: intl.formatMessage({ id: "COMMON.CODE.AUTO" }).toUpperCase()
                  }}
                >
                </Item>
                <Item
                  dataField="IdTipoEquipo"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.TEAMTYPE" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion}
                  editorOptions={{
                    items: isNotEmpty(props.tipoEquipos) ? props.tipoEquipos : tipoEquipos,
                    valueExpr: "IdTipoEquipo",
                    displayExpr: "TipoEquipo",
                    searchEnabled: true,
                    onValueChanged: (e => { onValueChangedTipoEquipo(e.value) }),
                    readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                  }}
                >
                  <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                  <PatternRule pattern={PatterRuler.LETRAS_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                </Item>
                <Item
                  dataField="IdModelo"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.MODEL" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion ? isRequired('IdModelo', settingDataField) : false}
                  editorOptions={{
                    readOnly: !(modoEdicion ? isModified('IdModelo', settingDataField) : false),
                    items: tipoModelos,
                    valueExpr: "IdModelo",
                    displayExpr: "Modelo",
                    searchEnabled: true,
                  }}
                />
                <Item dataField="Equipo"
                  isRequired={modoEdicion ? isRequired('Equipo', settingDataField) : false}
                  label={{ text: intl.formatMessage({ id: "COMMON.DESCRIPTION" }) }}
                  colSpan={2}
                  editorOptions={{
                    readOnly: !(modoEdicion ? isModified('Equipo', settingDataField) : false),
                    maxLength: 50,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                  }}
                >
                  <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                </Item>
                <Item dataField="MacAddress"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.MACADDRESS" }) }}
                  editorOptions={{
                    readOnly: !(modoEdicion ? isModified('MacAddress', settingDataField) : false),
                    maxLength: 50,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                  }}
                />
                <Item dataField="NumeroSerie"
                  isRequired={modoEdicion ? isRequired('NumeroSerie', settingDataField) : false}
                  label={{ text: intl.formatMessage({ id: "SYSTEM.DEVICE.SERIE" }) }}
                  editorOptions={{
                    readOnly: !(modoEdicion ? isModified('NumeroSerie', settingDataField) : false),
                    maxLength: 100,
                    inputAttr: { 'style': 'text-transform: uppercase' }
                  }}
                />
                <Item
                  dataField="IdTipoLectura"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.READINGTYPE" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion ? isRequired('IdTipoLectura', settingDataField) : false}
                  editorOptions={{
                    readOnly: !(modoEdicion ? isModified('IdTipoLectura', settingDataField) : false),
                    items: tipoLecturas,
                    valueExpr: "IdTipoLectura",
                    displayExpr: "TipoLectura",
                  }}
                />
                <Item
                  dataField="FuncionEntradaSalida"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.INPUTOUTPUTFUNCTION" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion ? isRequired('FuncionEntradaSalida', settingDataField) : false}
                  editorOptions={{
                    readOnly: !(modoEdicion ? isModified('FuncionEntradaSalida', settingDataField) : false),
                    items: estadoEntrada,
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                  }}
                />
                <Item dataField="DiferenciaHoraria"
                  dataType="numeric"
                  isRequired={modoEdicion ? isRequired('DiferenciaHoraria', settingDataField) : false}
                  label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.TIMEDIFFERENCE" }) }}
                  editorOptions={{
                    readOnly: !(modoEdicion ? isModified('DiferenciaHoraria', settingDataField) : false),
                    maxLength: 4,
                  }}
                >
                  <PatternRule pattern={PatterRuler.SOLO_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
                </Item>
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

                <Item
                  dataField="UsoGeolocalizacion"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.DEVICE.GEOLOCALIZACION" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion}
                  editorOptions={{
                    readOnly: props.dataRowEditNew.esNuevoRegistro ? false : !modoEdicion,
                    items: estadoSimple,
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                  }}
                />

                <Item dataField="Licencia"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.DEVICE.LICENCIA" }) }}
                  editorOptions={{
                    readOnly: props.dataRowEditNew.esNuevoRegistro ? false : !modoEdicion,
                    maxLength: 50,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                  }}
                />

                <Item
                  dataField="HablitarControlxPin"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.DEVICE.HABILITAR.CONTROL.PIN" }) }}
                  editorType="dxSelectBox"
                  editorOptions={{
                    readOnly: props.dataRowEditNew.esNuevoRegistro ? false : !modoEdicion,
                    items: estadoSimple,
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                  }}
                />

                <Item dataField="PrinterName"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.DEVICE.PRINTER.NAME" }) }}
                  editorOptions={{
                    readOnly: props.dataRowEditNew.esNuevoRegistro ? false : !modoEdicion,
                    maxLength: 50,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                  }}
                />


              </GroupItem>
            </Form>
          </FieldsetAcreditacion>

          <FieldsetAcreditacion title={intl.formatMessage({ id: "SYSTEM.TEAM.INPUTANDOUTPUTCONFIGURATION" })}>
            <Form formData={props.dataRowEditNew} validationGroup="FormEdicion"  >
              <GroupItem itemType="group" colCount={2} colSpan={2}>

                <Item dataField="COMVirtual"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.VIRTUALCOM" }) }}
                  editorType="dxSelectBox"
                  editorOptions={{
                    items: listarComps(),
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                    showClearButton: true,
                    searchEnabled: true,
                    readOnly: !(modoEdicion ? isModified('COMVirtual', settingDataField) : false),

                  }}
                >
                  {/* {(isRequiredRule("COMVirtual")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />} */}
                  <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                </Item>

                <Item dataField="SalidaVerde"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.GREENOUTPUT" }) }}
                  editorType="dxSelectBox"
                  editorOptions={{
                    items: listarComps(),
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                    showClearButton: true,
                    searchEnabled: true,
                    readOnly: !(modoEdicion ? isModified('SalidaVerde', settingDataField) : false),

                  }}
                >
                  {/* {(isRequiredRule("SalidaVerde")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />} */}
                  <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                </Item>

                <Item dataField="SalidaRojo"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.REDOUTPUT" }) }}
                  editorType="dxSelectBox"
                  editorOptions={{
                    items: listarComps(),
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                    showClearButton: true,
                    searchEnabled: true,
                    readOnly: !(modoEdicion ? isModified('SalidaRojo', settingDataField) : false),

                  }}
                >
                  {/* {(isRequiredRule("SalidaRojo")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />} */}
                  <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                </Item>

                <Item dataField="BitsxSegundo"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.BITSPERSECOND" }) }}
                  editorOptions={{
                    readOnly: !(modoEdicion ? isModified('BitsxSegundo', settingDataField) : false),
                    maxLength: 50,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                  }}
                >
                  {/* {(isRequiredRule("BitsxSegundo")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />} */}
                  <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                </Item>

                <Item dataField="BitsDatos"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.DATABITS" }) }}
                  editorOptions={{
                    readOnly: !(modoEdicion ? isModified('BitsDatos', settingDataField) : false),
                    maxLength: 50,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                  }}
                >
                  {/* {(isRequiredRule("BitsDatos")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />} */}
                  <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                </Item>

                <Item dataField="Paridad"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.PARITY" }) }}
                  editorOptions={{
                    readOnly: !(modoEdicion ? isModified('Paridad', settingDataField) : false),
                    maxLength: 50,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                  }}
                >
                  {/* {(isRequiredRule("Paridad")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />} */}
                  <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                </Item>

                <Item dataField="BitsParada"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.STOPBITS" }) }}
                  editorOptions={{
                    readOnly: !(modoEdicion ? isModified('BitsParada', settingDataField) : false),
                    maxLength: 50,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                  }}
                >
                  {/* {(isRequiredRule("BitsParada")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />} */}
                  <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                </Item>

              </GroupItem>
            </Form>
          </FieldsetAcreditacion>

          <FieldsetAcreditacion title={intl.formatMessage({ id: "SYSTEM.TEAM.NETWORKCONFIGURATION" })}>
            <Form formData={props.dataRowEditNew} validationGroup="FormEdicion"  >
              <GroupItem itemType="group" colCount={2} colSpan={2}>

                <Item dataField="IP"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.IP" }) }}
                  isRequired={modoEdicion ? isRequired('IP', settingDataField) : false}
                  editorOptions={{
                    readOnly: !props.modoEdicion,
                    maxLength: 50,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    disabled: isNotEmpty(props.dataRowEditNew.IdEquipoPadre) ? true : false
                  }}
                />

                <Item dataField="Mascara"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.MASK" }) }}
                  editorOptions={{
                    readOnly: !(modoEdicion ? isModified('Mascara', settingDataField) : false),
                    maxLength: 50,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                  }}
                />
                <Item dataField="Gateway"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.GATEWAY" }) }}
                  editorOptions={{
                    readOnly: !(modoEdicion ? isModified('Gateway', settingDataField) : false),
                    maxLength: 50,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                  }}
                />
                <Item dataField="IPServer"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.IPSERVER" }) }}
                  editorOptions={{
                    readOnly: !(modoEdicion ? isModified('IPServer', settingDataField) : false),
                    maxLength: 50,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                  }}
                />
                <Item dataField="HostName"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.HOSTNAME" }) }}
                  editorOptions={{
                    readOnly: !(modoEdicion ? isModified('HostName', settingDataField) : false),
                    maxLength: 50,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                  }}
                />

                <Item dataField="NumeroPuerto"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.DEVICE.NUMERO.PUERTO" }) }}
                  editorOptions={{
                    readOnly: props.dataRowEditNew.esNuevoRegistro ? false : !modoEdicion,
                    maxLength: 50,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                  }}
                />

              </GroupItem>
            </Form>
          </FieldsetAcreditacion>

        </React.Fragment>
      </PortletBody>
    </>
  );

};
EquipoEditPage.prototype = {
  showButtons: PropTypes.bool,
  modoEdicion: PropTypes.bool,
  idTipoEquipoHijo: PropTypes.string
}
EquipoEditPage.defaultProps = {
  showButtons: true,
  modoEdicion: true,
  idTipoEquipoHijo: "%"
}


export default injectIntl(EquipoEditPage);
