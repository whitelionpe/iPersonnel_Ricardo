import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Form, {
  Item,
  EmptyItem,
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
import { injectIntl } from "react-intl";
import { isNotEmpty } from "../../../../../_metronic";

import { listarTipoDatoEvaluar, listarEstadoSimple, listarEstado, PatterRuler } from "../../../../../_metronic/utils/utils";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import { serviceEntidad } from "../../../../api/sistema/entidad.api";

import {
  obtenerTodos as listarInterfaces
} from "../../../../api/acreditacion/interfaz.api";

import {
  listar as ListarReferenciaTabla
} from "../../../../api/acreditacion/interfaz.api";

import {
  obtenerTodos as listarCaracteristicaDetalle
} from "../../../../api/administracion/caracteristicaDetalle.api";

import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../store/ducks/notify-messages";
import FieldsetAcreditacion from '../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';


const DatosEvaluarEditPage = props => {
  const { intl, modoEdicion, settingDataField } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estado, setEstado] = useState([]);
  const [tipoDatosEvaluar, setTipoDatosEvaluar] = useState([]);
  const [boolEntidad, setBoolEntidad] = useState(false);
  const [enableAttachFile, setEnableAttachFile] = useState(true);
  const [interfaz, setInterfaz] = useState([]);

  const [boolCampoRequerido, setBoolCampoRequerido] = useState(false);

  const [multipleCombo, setMultipleCombo] = useState([]);
  const [valueExprMultiple, setValueExprMultiple] = useState([]);
  const [displayExprMultiple, setDisplayExprMultipleo] = useState([]);

  const [caracteristicaDetalle, setCaracteristicaDetalle] = useState([]);

  const [entidades, setEntidades] = useState([]);
  const classesEncabezado = useStylesEncabezado();

  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);
  const [isDataFieldVisible, setisDataFieldVisible] = useState([true, false, false, false]);

  const [disableOptionInterfaz, setDisableOptionInterfaz] = useState(false);
  const [disableOptionValorDefecto, setDisableOptionValorDefecto] = useState(false);
  const [cmbRequeridoCambioCompania, setCmbRequeridoCambioCompania] = useState([]);

  const isRequiredRule = (id) => {
    return modoEdicion ? true : isRequired(id, settingDataField);
  }


  useEffect(() => {
    cargarCombos();
    if (!props.dataRowEditNew.esNuevoRegistro) {
      cargarCombosEdit();
    }
  }, []);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    let datoEvaluar = listarTipoDatoEvaluar();
    let estado = listarEstado();

    setEstadoSimple(estadoSimple);
    setTipoDatosEvaluar(datoEvaluar);
    setCmbRequeridoCambioCompania(estado);
    setEstado(estado);
    let entidad = await serviceEntidad.obtenerTodos({ ImprimirFotocheck: "" });
    setEntidades(entidad);

  }

  async function cargarCombosEdit() {
    //console.log("cargarCombos|props.dataRowEditNew.esNuevoRegistro:", props.dataRowEditNew.esNuevoRegistro);
    let interfazData = await listarInterfaces({ TipoDato: props.dataRowEditNew.Tipo });
    console.log(interfazData);
    setInterfaz(interfazData);
    onValueChangedTipoDato(props.dataRowEditNew.Tipo);
    setEnableAttachFile(true);
    if (props.dataRowEditNew.Tipo === 'F') {
      if (props.dataRowEditNew.CodigoInterfaz === null) {
        setMultipleCombo([]);
        setCaracteristicaDetalle([]);
      }
      else {
        let dataReferenciaTabla = await ListarReferenciaTabla({ IdInterfaz: props.dataRowEditNew.IdInterfaz, IdCliente: IdCliente });
        setValueExprMultiple("Codigo");
        setDisplayExprMultipleo("Descripcion");
        setMultipleCombo(dataReferenciaTabla);
      }
    } else if (props.dataRowEditNew.Tipo === 'L') {
      setEnableAttachFile(false);
      let dataCaracteristicasDetalle = await listarCaracteristicaDetalle({ IdCliente: IdCliente, IdCaracteristica: props.dataRowEditNew.IdCaracteristica });
      setCaracteristicaDetalle(dataCaracteristicasDetalle);
      if (props.dataRowEditNew.CodigoInterfaz === null) {
        props.dataRowEditNew.ValorDefecto = '';
        props.dataRowEditNew.CodigoInterfaz = '';
        setCaracteristicaDetalle([]);
        setDisableOptionValorDefecto(true);
      }
      else {

        let dataReferenciaTabla = await ListarReferenciaTabla({ IdInterfaz: props.dataRowEditNew.IdInterfaz, IdCliente: IdCliente });

        //console.log('IdCaracteristica: props.dataRowEditNew.IdInterfaz', props.dataRowEditNew.IdInterfaz);
        setValueExprMultiple("Codigo");
        setDisplayExprMultipleo("Descripcion");
        setMultipleCombo(dataReferenciaTabla);
        props.dataRowEditNew.ValorDefecto = props.dataRowEditNew.ValorDefecto;
        setDisableOptionValorDefecto(false);
      }

    }

  }

  function grabar(e) {

    let result = e.validationGroup.validate();

    if (isNotEmpty(props.dataRowEditNew.IdInterfaz) && !isNotEmpty(props.dataRowEditNew.CodigoInterfaz)) {
      handleInfoMessages(intl.formatMessage({ id: "ACCREDITATION.DATEEVALUATE.MSG_VALIDATION01" }));
      return;
    }

    if (isNotEmpty(props.dataRowEditNew.IdInterfaz) &&
      isNotEmpty(props.dataRowEditNew.CodigoInterfaz) &&
      props.dataRowEditNew.Tipo === 'L' &&
      !isNotEmpty(props.dataRowEditNew.ValorDefecto)) {
      handleInfoMessages(intl.formatMessage({ id: "ACCREDITATION.DATEEVALUATE.MSG_VALIDATION02" }));
      return;
    }

    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregar(props.dataRowEditNew);
      } else {
        props.actualizar(props.dataRowEditNew);
      }
    }
  }


  async function onValueChangedTipoDato(value) {
    console.log("onValueChangedTipoDato|value:", value);
    let interfazData = await listarInterfaces({ TipoDato: value });
    // console.log("onValueChangedTipoDato|interfazData:",interfazData);
    setInterfaz(interfazData);
    setEnableAttachFile(true);
    if (value === 'L') {
      setBoolEntidad(false);
      // setBoolCampoRequerido(true)
      setDisableOptionInterfaz(false);
      setEnableAttachFile(false);
      props.dataRowEditNew.AdjuntarArchivo = "N";
    }
    else if (value === 'F') {
      //setBoolEntidad(true);
      //setBoolCampoRequerido(true)
      setDisableOptionInterfaz(false);
    }
    else {


      if (props.dataRowEditNew.esNuevoRegistro) {
        props.dataRowEditNew.IdInterfaz = ''
        props.dataRowEditNew.CodigoInterfaz = ''
        props.dataRowEditNew.IdEntidad = ''
        setBoolCampoRequerido(false)
      }

      setBoolEntidad(false);
      setDisableOptionInterfaz(true);
    }

    switch (value) {
      case "T": setisDataFieldVisible([true, false, false, false]); break;
      case "F": setisDataFieldVisible([false, true, false, false]); break;
      case "L": setisDataFieldVisible([false, false, true, false]); break;
      case "N": setisDataFieldVisible([false, false, false, true]); break;
    }
    if (props.dataRowEditNew.esNuevoRegistro) {
      setMultipleCombo([]);
    }

  }

  async function onValueChangedInterfaz(value) {

    if (value === null) {
      setBoolEntidad(false);
      setMultipleCombo([]);
      setCaracteristicaDetalle([]);

      if (props.dataRowEditNew.esNuevoRegistro) {

        setBoolCampoRequerido(false)
      }

    }
    else {
      let dataReferenciaTabla = await ListarReferenciaTabla({ IdInterfaz: value, IdCliente: IdCliente });
      setValueExprMultiple("Codigo");
      setDisplayExprMultipleo("Descripcion");
      setMultipleCombo(dataReferenciaTabla);

      if (!!dataReferenciaTabla && dataReferenciaTabla.length > 0) {
        props.dataRowEditNew.IdEntidad = dataReferenciaTabla[0].IdEntidad;
      }
      setBoolEntidad(true);
    }

  }

  async function onValueChangedCodigoInterfaz(value) {
    // console.log('onValueChangedCodigoInterfaz value ',value)
    let dataCaracteristicasDetalle = await listarCaracteristicaDetalle({ IdCliente: IdCliente, IdCaracteristica: value });
    setCaracteristicaDetalle(dataCaracteristicasDetalle);
    if (value === null) {
      props.dataRowEditNew.ValorDefecto = '';
      props.dataRowEditNew.CodigoInterfaz = ''
      setCaracteristicaDetalle([]);
    }

  }



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
              visible={props.modoEdicion}
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
              <GroupItem itemType="group" colCount={4} colSpan={4}>
                <SimpleItem dataField="IdCliente" visible={false} />
                <Item dataField="IdDatoEvaluar"
                  isRequired={true}
                  label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                  colSpan={2}
                  editorOptions={{
                    maxLength: 10,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    readOnly: !props.dataRowEditNew.esNuevoRegistro,
                  }}
                >
                  {(isRequiredRule("IdDatoEvaluar")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={10} />}
                  <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
                </Item>

                <Item dataField="DatoEvaluar"
                  isRequired={true}
                  label={{ text: intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE" }) }}
                  colSpan={2}
                  editorOptions={{
                    maxLength: 100,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    readOnly: !props.modoEdicion,
                  }}
                >
                  {(isRequiredRule("DatoEvaluar")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                  <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
                </Item>
                <Item
                  dataField="Tipo"
                  label={{ text: intl.formatMessage({ id: "ACCREDITATION.DATEEVALUATE.TYPE" }) }}
                  editorType="dxSelectBox"
                  isRequired={true}
                  colSpan={2}
                  editorOptions={{
                    //value:  props.dataRowEditNew.esNuevoRegistro ? valueTipo : ( isNotEmpty(valueTipo) ? valueTipo : props.dataRowEditNew.Tipo ),
                    items: tipoDatosEvaluar,
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                    readOnly: !props.dataRowEditNew.esNuevoRegistro,
                    // onValueChanged: (e) => onValueChangedTipo(e.value),
                    onValueChanged: (e) => onValueChangedTipoDato(e.value),
                    placeholder: "Seleccione..",
                  }}
                />


                <Item
                  dataField="FlDatoOpcional"
                  label={{ text: intl.formatMessage({ id: "ACCREDITATION.DATEEVALUATE.OPTIONALTYPE.LABEL" }) }}
                  editorType="dxCheckBox"
                  isRequired={false}
                  colSpan={2}
                  editorOptions={{
                    readOnly: !props.dataRowEditNew.esNuevoRegistro,
                    onValueChanged: (e) => { props.dataRowEditNew.DatoOpcional = e.value ? "S" : "N"; }
                  }}
                />

                <Item
                  dataField="IdEntidad"
                  label={{ text: intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.ENTITY" }) }}
                  editorType="dxSelectBox"
                  isRequired={true}
                  colSpan={2}
                  editorOptions={{
                    items: entidades,
                    valueExpr: "IdEntidad",
                    displayExpr: "Entidad",
                    readOnly: props.dataRowEditNew.esNuevoRegistro ? false : (props.dataRowEditNew.Actualizable == "S" ? false : true),
                    placeholder: "Seleccione..",
                    // onValueChanged: (e) => onValueChangedEntidad(e.value),
                  }}
                />


                <Item
                  dataField="IdInterfaz"
                  label={{ text: intl.formatMessage({ id: "ACCREDITATION.ASOCIADO.A" }) }}
                  editorType="dxSelectBox"
                  isRequired={boolCampoRequerido}
                  colSpan={2}
                  editorOptions={{
                    items: interfaz,
                    valueExpr: "IdInterfaz",
                    displayExpr: "Interfaz",
                    readOnly: props.dataRowEditNew.esNuevoRegistro ? false : (props.dataRowEditNew.Actualizable == "S" ? false : true),
                    showClearButton: true,
                    onValueChanged: (e) => onValueChangedInterfaz(e.value),

                  }}
                />

                <Item
                  dataField="CodigoInterfaz"
                  label={{ text: intl.formatMessage({ id: "ACCREDITATION.VALOR.ASOCIADO" }) }}
                  editorType="dxSelectBox"
                  isRequired={boolCampoRequerido}
                  colSpan={2}
                  editorOptions={{
                    items: multipleCombo,
                    valueExpr: valueExprMultiple,
                    displayExpr: displayExprMultiple,
                    readOnly: props.dataRowEditNew.esNuevoRegistro ? false : (props.dataRowEditNew.Actualizable == "S" ? false : true),
                    showClearButton: true,
                    onValueChanged: (e) => onValueChangedCodigoInterfaz(e.value),

                  }}
                />
                <Item dataField="DatoTexto"
                  isRequired={false}
                  label={{ text: intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE.DEFAULTVALUE" }) }}
                  editorType={"dxTextBox"}
                  visible={isDataFieldVisible[0]}
                  colSpan={2}
                  editorOptions={{
                    maxLength: 200,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    readOnly: !props.modoEdicion,
                  }}
                >
                  <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
                </Item>
                <Item dataField="DatoFecha"
                  isRequired={false}
                  label={{ text: intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE.DEFAULTVALUE" }) }}
                  editorType={"dxDateBox"}
                  dataType="datetime"
                  visible={isDataFieldVisible[1]}
                  colSpan={2}
                  editorOptions={{
                    maxLength: 200,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    readOnly: !props.modoEdicion,
                    displayFormat: "dd/MM/yyyy",
                  }}
                />
                <Item
                  dataField="ValorDefecto"
                  label={{ text: intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE.DEFAULTVALUE" }) }}
                  editorType="dxSelectBox"
                  visible={isDataFieldVisible[2]}
                  colSpan={2}
                  editorOptions={{
                    items: caracteristicaDetalle,
                    valueExpr: "IdCaracteristicaDetalle",
                    displayExpr: "CaracteristicaDetalle",
                    readOnly: !(disableOptionValorDefecto ? (props.dataRowEditNew.esNuevoRegistro ? true : false) : true),
                  }}
                />
                <Item dataField="DatoNumerico"
                  isRequired={false}
                  label={{ text: intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE.DEFAULTVALUE" }) }}
                  editorType={"dxNumberBox"}
                  visible={isDataFieldVisible[3]}
                  colSpan={2}
                  editorOptions={{
                    maxLength: 200,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    readOnly: !props.modoEdicion,
                  }}
                />
                <Item dataField="ReglaInterfaz"
                  colSpan={2}
                  label={{ text: intl.formatMessage({ id: "ACCREDITATION.DATEEVALUATE.INTERFACERULER" }) }}
                  editorOptions={{
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    maxLength: 500,
                    height: 50,
                    readOnly: props.dataRowEditNew.esNuevoRegistro ? false : (props.dataRowEditNew.Actualizable == "S" ? false : true),
                  }}
                >
                  <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
                </Item>

                <Item
                  dataField="AdjuntarArchivo"
                  label={{ text: intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE.ATTACHFILE" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion ? isRequired("AdjuntarArchivo", settingDataField) : false}
                  colSpan={2}
                  editorOptions={{
                    items: cmbRequeridoCambioCompania,
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                    readOnly: props.dataRowEditNew.esNuevoRegistro ? !enableAttachFile : props.modoEdicion ? !enableAttachFile : true
                  }}
                />

                <Item
                  dataField="Activo"
                  label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                  editorType="dxSelectBox"
                  isRequired={true}
                  colSpan={2}
                  editorOptions={{
                    //readOnly: !props.modoEdicion,
                    items: estadoSimple,
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                    readOnly: props.dataRowEditNew.esNuevoRegistro ? true : !props.modoEdicion
                  }}
                />

              </GroupItem>
            </Form>
          </FieldsetAcreditacion>

          <FieldsetAcreditacion title={intl.formatMessage({ id: "ACREDITATION.DATAEVALUATE.REENTRYSECTION" })}>
            <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
              <GroupItem itemType="group" colCount={5} colSpan={5}>
                <Item colSpan={4}
                  label={{ text: intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE.REQUIREDCHANGECOMPANY" }) }}
                />
                <Item
                  dataField="RequeridoCambioCompania"
                  colSpan={1}
                  label={{ text: intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE.REQUIREDCHANGECOMPANY" }), visible: false }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion ? isRequired("RequeridoCambioCompania", settingDataField) : false}
                  editorOptions={{
                    items: cmbRequeridoCambioCompania,
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                    inputAttr: { style: "text-transform: uppercase; text-align: right" },
                    // readOnly: props.dataRowEditNew.esNuevoRegistro ? true : !props.modoEdicion,
                    readOnly: !props.modoEdicion,
                  }}
                />

                <Item colSpan={4}
                  label={{ text: intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE.MINIMUNVALIDATIONDAYS" }) }}
                />

                <Item
                  dataField="ValidacionMinimaDias"
                  colSpan={1}
                  label={{ text: intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE.MINIMUNVALIDATIONDAYS" }), visible: false }}
                  isRequired={modoEdicion ? isRequired("ValidacionMinimaDias", settingDataField) : false}
                  editorType="dxNumberBox"
                  dataType="number"
                  editorOptions={{
                    // readOnly: props.dataRowEditNew.esNuevoRegistro ? true : !props.modoEdicion,
                    inputAttr: {
                      style: "text-transform: uppercase; text-align: right"
                    },
                    showSpinButtons: true,
                    showClearButton: true,
                    readOnly: !props.modoEdicion
                  }}
                >
                  <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
                </Item>

                <Item colSpan={4}
                  label={{ text: intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE.UPGRADEABLE" }) }}
                />
                <Item
                  dataField="Actualizable"
                  colSpan={1}
                  label={{ text: intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE.UPGRADEABLE" }), visible: false }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion ? isRequired("Actualizable", settingDataField) : false}
                  editorOptions={{
                    items: estado,
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                    inputAttr: { style: "text-transform: uppercase; text-align: right" },
                    readOnly: !props.modoEdicion
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

export default injectIntl(DatosEvaluarEditPage);
