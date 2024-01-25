import React, { useEffect, useState, useRef } from "react";
import { injectIntl } from "react-intl";
import Form, {
  Item,
  EmptyItem,
  GroupItem,
  SimpleItem,
  ButtonItem,
  RequiredRule,
  StringLengthRule,
  PatternRule,
  EmailRule,
} from "devextreme-react/form";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { useSelector } from "react-redux";
import { Button } from "devextreme-react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import SelectionUbigeo from "../../../../partials/content/SelectBox/selectionUbigeo";

import { TYPE_SISTEMA_ENTIDAD, listarEstado, listarEstadoSimple, PatterRuler, listarSexoSimple, isNotEmpty, listarTipoSangre, listarEstadoCivil, listarLicencia } from "../../../../../_metronic";
import PropTypes from 'prop-types';
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import AdministracionUbigeoBuscar from '../../../../partials/components/AdministracionUbigeoBuscar';
import { obtenerTodos as listarTipoDocumento } from "../../../../api/sistema/tipodocumento.api"; // No llamar de memoria _metronic por que podria cambiar datos en tipo de documento y los cambios de memoria no los reflejaria.
import FieldsetAcreditacion from '../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';
import { handleInfoMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";

const PersonaEditPage = props => {

  const perfil = useSelector(state => state.perfil.perfilActual);
   
  const { intl, modoEdicion, settingDataField, setLoading, accessButton, activarTxtUbigeo } = props;
 
  const [paises, setPaises] = useState([]); 
  const [idPaisActual, setIdPaisActual] = useState(perfil.IdPais); 
  const [idPaisNacimiento, setIdPaisNacimiento] = useState(perfil.IdPais);
  const [idPaisResidencia, setIdPaisResidencia] = useState(perfil.IdPais);

  const [tipoDocumentos, setTipoDocumentos] = useState([]);
  const [tipoSangres, setTipoSangres] = useState([]);
  const [estadoCiviles, setEstadoCiviles] = useState([]);
  const [licenciaConducir, setLicenciaCondudir] = useState([]);
  const [maxLengthDocumento, setMaxLengthDocumento] = useState(20); // Se le asigna el valor 20 el campo Documento porque es el valor maximo en la tabla Administracion_Persona
  const [maskDocumento, setMaskDocumento] = useState("");
  const [caracterPermitido, setCaracterPermitido] = useState("SOLO_NUMEROS");
  const [valLongitudExacta, setValLongitudExacta] = useState("N"); // Se le asigna el valor 20 el campo Documento porque es el valor maximo en la tabla Administracion_Persona
  const [valueEdad, setValueEdad] = useState(0);
  const Formulario = useRef(null);
  const [popUpVisibleUbigeo, setpopUpVisibleUbigeo] = useState(false);
  const [popUpVisibleUbigeoResidencia, setpopUpVisibleUbigeoResidencia] = useState(false);
  const classesEncabezado = useStylesEncabezado();

  async function cargarCombos() {
    setLoading(true);
    setTipoDocumentos(props.dataCombos[0]);
    setTipoSangres(props.dataCombos[1]);
    setEstadoCiviles(props.dataCombos[2]);
    setLicenciaCondudir(props.dataCombos[3]);
    setPaises(props.dataCombos[4]);
    setLoading(false);
  }

  async function grabar(e) {
    console.log("**grabar :> dataRowEditNew :> ", props.dataRowEditNew);
    let result = e.validationGroup.validate();

    if (result.isValid) {

      //Agregar campos nuevos
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarPersona(props.dataRowEditNew);
      } else {
        props.actualizarPersona(props.dataRowEditNew);
      }
    }
  }

  async function onValueChangedTipoDocumento(value) {
    if (isNotEmpty(value)) {
      var resultado;

      if (!props.dataRowEditNew.esNuevoRegistro) {//->Edicion
        //let dataTipoDocumento = await listarTipoDocumento({ IdPais: perfil.IdPais });
        // let dataTipoDocumento = await listarTipoDocumento({ IdPais: idPaisActual }); //LSF 18092023
        let dataTipoDocumento = await listarTipoDocumento({ IdPais: props.dataRowEditNew.IdPais });
        resultado = dataTipoDocumento.find(x => x.IdTipoDocumento === value);

        //Obtener Tipo Documento de acuerdo al Pais de la persona
        let filterTipoDocumentos = dataTipoDocumento.filter(k => k.IdEntidad === TYPE_SISTEMA_ENTIDAD.PERSONAS)
        if (filterTipoDocumentos.length > 0)
          setTipoDocumentos(filterTipoDocumentos);

      } else {//->Nuevo
        props.dataRowEditNew.Documento = '';
        resultado = tipoDocumentos.find(x => x.IdTipoDocumento === value);
      }

      setValLongitudExacta(resultado.LongitudExacta); // Marcar como obligatorio.

      if (resultado && resultado.LongitudExacta === 'S') {
        setMaxLengthDocumento(resultado.Longitud);
        setMaskDocumento(resultado.Mascara);
        setCaracterPermitido(resultado.CaracteresPermitidos)
      } else {
        setMaxLengthDocumento(20);
        setMaskDocumento(resultado.Mascara);
        setCaracterPermitido(resultado.CaracteresPermitidos)
      }
      //if (Formulario.current != null) Formulario.current.instance.getEditor("IdTipoDocumento").focus()
    } else {
      props.dataRowEditNew.IdTipoDocumento = '';
      props.dataRowEditNew.Documento = '';
      setMaxLengthDocumento(20);
      setMaskDocumento("");
      //if (Formulario.current != null) Formulario.current.instance.getEditor("IdTipoDocumento").focus()
    }

  }

  function onValueChangedFechaNacimiento(e) {
    let FechaNacimiento = (new Date(e.value))
    let FechaActual = new Date()
    let edad = FechaActual.getFullYear() - FechaNacimiento.getFullYear()

    if (e.value != null) {
      setValueEdad(edad);
    }
    else {
      setValueEdad(0);
    }
  }

  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }

  const selectUbigeoNacimiento = (data) => {
    let { IdUbigeo, Departamento, Provincia, Distrito } = data[0];
    props.dataRowEditNew.IdUbigeoNacimiento = IdUbigeo;
    props.dataRowEditNew.UbigeoNacimiento = IdUbigeo + '<' + Departamento + '-' + Provincia + '-' + Distrito + '>'
  }

  const selectUbigeoResidencia = (data) => {
    let { IdUbigeo, Departamento, Provincia, Distrito } = data[0];
    props.dataRowEditNew.IdUbigeoResidencia = IdUbigeo;
    props.dataRowEditNew.UbigeoResidencia = IdUbigeo + '<' + Departamento + '-' + Provincia + '-' + Distrito + '>'
  }

  useEffect(() => { 
    cargarCombos();
  }, []);

  const titlePersonActive = (dataRowEditNew) => {
    return <>
      {dataRowEditNew.Severidad === 3 ? (
        <b style={{ color: "red" }}>{dataRowEditNew.Activo === "N" ? intl.formatMessage({ id: "ADMINISTRATION.PERSON.INACTIVE" }) + "-[F3]" : ""}</b>
      ) : (
        <b style={{ color: "red" }}>{dataRowEditNew.Activo === "N" ? intl.formatMessage({ id: "ADMINISTRATION.PERSON.INACTIVE" }) : ""}</b>
      )
      }
    </>
  }

  return (
    <>
      {(props.showButtons) ?
        <PortletHeader
          //title={(<>{props.titulo} <b style={{ color: "red" }}>{props.dataRowEditNew.Activo === "N" ? intl.formatMessage({ id: "ADMINISTRATION.PERSON.INACTIVE" }) : ""}</b> </>)}
          title={titlePersonActive(props.dataRowEditNew)}
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
        : null}
      <PortletBody >
        <FieldsetAcreditacion title={intl.formatMessage({ id: "ADMINISTRATION.PERSON.PERSONAL.INFORMATION" })}>
          <Form
            formData={props.dataRowEditNew}
            validationGroup="FormEdicion"
            ref={Formulario}
          >
            <GroupItem itemType="group" colCount={2} colSpan={2}>

              <Item
                dataField="IdPais"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COUNTRY" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion ? isRequired('IdPais', settingDataField) : false}
                //ref={itemForm}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('IdPais', settingDataField) : false),
                  items: paises,
                  valueExpr: "IdPais",
                  value: idPaisActual,
                  displayExpr: "Pais"
                }}
                visible={false}
              />

              {/* <EmptyItem>

              </EmptyItem> */}
              <Item

                dataField="IdTipoDocumento"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT.TYPE" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  items: tipoDocumentos,
                  valueExpr: "IdTipoDocumento",
                  displayExpr: "Alias",
                  searchEnabled: true,
                  placeholder: "Seleccione..",
                  showClearButton: true,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !(modoEdicion ? isModified('IdTipoDocumento', settingDataField) : false),
                  onValueChanged: (e => onValueChangedTipoDocumento(e.value))
                }}
              />

              {/*::::::::::::::::: Se esta contemplando 2 Item de Documento para soportar la logica de cambios en tipo de documentos - INI ::::::::::::::::::: */}
              <Item
                dataField="Documento"
                label={{ text: intl.formatMessage({ id: "SECURITY.USER.DOCUMENTNUMBER" }) }}
                isRequired={true}
                visible={valLongitudExacta === "S" ? false : true} // Se oculta si la variable Longitud Exacta
                editorOptions={{
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !(modoEdicion ? isModified("Documento", settingDataField) : false),
                  mask: maskDocumento,
                }}
              >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={caracterPermitido === "SOLO_NUMEROS" ? PatterRuler.SOLO_NUMEROS : /^/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
                <PatternRule pattern={caracterPermitido === "SOLO_LETRAS" ? PatterRuler.LETRAS_NUMEROS : /^/} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                <PatternRule pattern={caracterPermitido === "LETRAS_DESCRIPCION" ? PatterRuler.LETRAS_DESCRIPCION : /^/} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>

              <Item
                dataField="Documento"
                label={{ text: intl.formatMessage({ id: "SECURITY.USER.DOCUMENTNUMBER" }) }}
                isRequired={true}
                visible={valLongitudExacta === "S" ? true : false} // Se muestra si la variable Longitud Exacta.
                editorOptions={{
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !(modoEdicion ? isModified("Documento", settingDataField) : false),
                  mask: maskDocumento,
                }}
              >
                <StringLengthRule min={maxLengthDocumento} max={maxLengthDocumento} message={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.DOCUMENT.LENGTH" }) + ` ${maxLengthDocumento}`} />
                <PatternRule pattern={caracterPermitido === "SOLO_NUMEROS" ? PatterRuler.SOLO_NUMEROS : /^/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
                <PatternRule pattern={caracterPermitido === "SOLO_LETRAS" ? PatterRuler.LETRAS_NUMEROS : /^/} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                <PatternRule pattern={caracterPermitido === "LETRAS_DESCRIPCION" ? PatterRuler.LETRAS_DESCRIPCION : /^/} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>
              {/*::::::::::::::::: Se esta contemplando 2 Item de Documento para soportar la logica de cambios en tipo de documentos - FIN ::::::::::::::::::: */}



              <Item
                dataField="Apellido"
                isRequired={modoEdicion ? isRequired('Apellido', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.SURNAMES" }) }}
                editorOptions={{
                  maxLength: 50,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !(modoEdicion ? isModified('Apellido', settingDataField) : false)
                }}
              >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>

              <Item
                dataField="Nombre"
                isRequired={modoEdicion ? isRequired('Nombre', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.NAME" }) }}
                editorOptions={{
                  maxLength: 50,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !(modoEdicion ? isModified('Nombre', settingDataField) : false)
                }}
              >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>

              <Item
                dataField="Direccion"
                isRequired={modoEdicion ? isRequired('Direccion', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.ADDRESS" }) }}
                colSpan={2}
                editorOptions={{
                  maxLength: 500,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !(modoEdicion ? isModified('Direccion', settingDataField) : false)
                }}
              />

              <Item
                dataField="Sexo"
                isRequired={modoEdicion ? isRequired('Sexo', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.GENDER" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: listarSexoSimple(),
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  placeholder: "Seleccione..",
                  searchEnabled: true,
                  showClearButton: true,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !(modoEdicion ? isModified('Sexo', settingDataField) : false)
                }}
              />

              <Item
                dataField="IdTipoSangre"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.BLOOD.TYPE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion ? isRequired('IdTipoSangre', settingDataField) : false}
                editorOptions={{
                  items: tipoSangres,
                  valueExpr: "IdTipoSangre",
                  displayExpr: "TipoSangre",
                  placeholder: "Seleccione..",
                  searchEnabled: true,
                  showClearButton: true,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !(modoEdicion ? isModified('IdTipoSangre', settingDataField) : false)
                }}
              />

              <Item
                dataField="Alergia"
                isRequired={modoEdicion ? isRequired('Alergia', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.ALLERGY" }) }}
                editorOptions={{
                  maxLength: 200,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !(modoEdicion ? isModified('Alergia', settingDataField) : false)
                }}
              >
                {(isRequiredRule("Alergia")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={200} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item
                dataField="Discapacidad"
                isRequired={modoEdicion ? isRequired('Discapacidad', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.DISABILITY" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: listarEstado(),
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  searchEnabled: true,
                  showClearButton: true,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !(modoEdicion ? isModified('Discapacidad', settingDataField) : false)
                }}
              />
              <Item
                dataField="FechaNacimiento"
                isRequired={modoEdicion ? isRequired('FechaNacimiento', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.BIRTHDAY" }) }}
                editorType="dxDateBox"
                dataType="date"
                editorOptions={{
                  displayFormat: "dd/MM/yyyy",
                  showClearButton: false,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !(modoEdicion ? isModified('FechaNacimiento', settingDataField) : false),
                  onValueChanged: onValueChangedFechaNacimiento

                }}
              />
              <Item
                dataField="Edad"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.AGE" }) }}
                editorOptions={{
                  disabled: true,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !(modoEdicion ? isModified('Edad', settingDataField) : false),
                  value: props.dataRowEditNew.esNuevoRegistro ? valueEdad : (valueEdad > 0 ? valueEdad : props.dataRowEditNew.Edad),

                }}
              >
                {(isRequiredRule("Alergia")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={200} />}
                <PatternRule pattern={PatterRuler.SOLO_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
              </Item>

              <Item
                dataField="IdEstadoCivil"
                isRequired={modoEdicion ? isRequired('IdEstadoCivil', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.CIVIL.STATUS" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: estadoCiviles,
                  valueExpr: "IdEstadoCivil",
                  displayExpr: "EstadoCivil",
                  placeholder: "Seleccione..",
                  searchEnabled: true,
                  showClearButton: true,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !(modoEdicion ? isModified('IdEstadoCivil', settingDataField) : false)
                }}
              />
              <Item
                dataField="NumeroHijos"
                isRequired={modoEdicion ? isRequired('NumeroHijos', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.NUMBERCHILDREN" }) }}
                dataType="number"
                editorOptions={{
                  maxLength: 4,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !(modoEdicion ? isModified('NumeroHijos', settingDataField) : false)

                }}
              >
                {(isRequiredRule("NumeroHijos")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={4} />}
                <PatternRule pattern={PatterRuler.SOLO_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
              </Item>

              <Item
                dataField="IdLicenciaConducir"
                isRequired={modoEdicion ? isRequired('IdLicenciaConducir', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.DRIVING.CATEGORY" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: licenciaConducir,
                  valueExpr: "IdLicenciaConducir",
                  displayExpr: "LicenciaConducir",
                  searchEnabled: true,
                  placeholder: "Seleccione..",
                  showClearButton: true,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !(modoEdicion ? isModified('IdLicenciaConducir', settingDataField) : false)
                }}
              />
              <Item
                dataField="NumeroLicenciaConducir"
                isRequired={modoEdicion ? isRequired('IdLicenciaConducir', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.LICENSE.NUMBER" }) }}
                editorOptions={{
                  maxLength: 20,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !(modoEdicion ? isModified('NumeroLicenciaConducir', settingDataField) : false)
                }}
              >
                {(isRequiredRule("NumeroLicenciaConducir")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={20} />}
                <PatternRule pattern={PatterRuler.LETRAS_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item
                dataField="TelefonoMovil"
                isRequired={modoEdicion ? isRequired('TelefonoMovil', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.MOBILE.PHONE" }) }}
                editorOptions={{
                  maxLength: 20,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !(modoEdicion ? isModified('TelefonoMovil', settingDataField) : false)
                }}
              >
                {(isRequiredRule("TelefonoMovil")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={20} />}
                <PatternRule pattern={PatterRuler.SOLO_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
              </Item>

              <Item
                dataField="TelefonoFijo"
                isRequired={modoEdicion ? isRequired('TelefonoFijo', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.MOBILE.LANDLINE" }) }}
                editorOptions={{
                  maxLength: 50,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !(modoEdicion ? isModified('TelefonoFijo', settingDataField) : false)
                }}
              >
                {(isRequiredRule("TelefonoFijo")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
                <PatternRule pattern={PatterRuler.SOLO_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
              </Item>


              <Item
                dataField="Email"
                isRequired={modoEdicion ? isRequired('Email', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.MAIL" }) }}
                colSpan={2}
                editorOptions={{
                  maxLength: 50,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !(modoEdicion ? isModified('Email', settingDataField) : false)
                }}
              >
                {(isRequiredRule("Email")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
                <EmailRule message={intl.formatMessage({ id: "MESSAGES.INVALID.EMAIL" })} />
              </Item>

              <Item
                dataField="EmergenciaNombre"
                isRequired={modoEdicion ? isRequired('EmergenciaNombre', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.EMERGENCYNAME" }) }}
                editorOptions={{
                  maxLength: 50,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !(modoEdicion ? isModified('EmergenciaNombre', settingDataField) : false)
                }}
              >
                {(isRequiredRule("EmergenciaNombre")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>

              <Item
                dataField="EmergenciaTelefono"
                isRequired={modoEdicion ? isRequired('EmergenciaTelefono', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.EMERGENCYPHONE" }) }}
                editorOptions={{
                  maxLength: 50,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !(modoEdicion ? isModified('EmergenciaTelefono', settingDataField) : false)
                }}
              >
                {(isRequiredRule("EmergenciaTelefono")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
                <PatternRule pattern={PatterRuler.SOLO_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
              </Item>

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: listarEstadoSimple(),
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  disabled: props.dataRowEditNew.esNuevoRegistro ? true : false,
                  readOnly: !modoEdicion

                }}
              />


            </GroupItem>
          </Form>
        </FieldsetAcreditacion>
        <FieldsetAcreditacion title={intl.formatMessage({ id: "ADMINISTRATION.PERSON.BIRTHPLACE" })}>
          <Form
            formData={props.dataRowEditNew}
            validationGroup="FormEdicion"
            ref={Formulario}
          >
            <GroupItem itemType="group" colCount={2} colSpan={2} visible={!activarTxtUbigeo}>
              <Item
                dataField="IdPaisNacimiento"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COUNTRY" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: paises,
                  valueExpr: "IdPais",
                  // value: idPaisNacimiento, 
                  displayExpr: "Pais",
                  onValueChanged: (e => {
                    setIdPaisNacimiento(e.value);
                    // props.dataRowEditNew.IdUbigeoNacimiento = '';
                    // props.dataRowEditNew.UbigeoNacimiento = ''; 
                  }),
                }}
              />

              <Item
                colSpan={2}
                dataField="UbigeoNacimiento"
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.FILTER.UBIGEO" }) }}
                editorOptions={{
                  hoverStateEnabled: false,
                  inputAttr: { style: "text-transform: uppercase" },
                  showClearButton: true,
                  readOnly: true,
                  buttons: [
                    {
                      name: "search",
                      location: "after",
                      useSubmitBehavior: true,
                      options: {
                        stylingMode: "text",
                        icon: "search",
                        disabled: !modoEdicion ? true : false,
                        onClick: () => {
                          if (isNotEmpty(props.dataRowEditNew.IdPaisNacimiento))
                            setpopUpVisibleUbigeo(true);
                          else
                            handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ADMINISTRATION.PERSON.MESSAGE_BORN_PLACE" }));

                        },
                      },
                    },
                  ],
                }}
              />
            </GroupItem>

            <GroupItem itemType="group" colCount={2} colSpan={2} visible={activarTxtUbigeo}>
              <Item
                colSpan={2}
                dataField="LugarNacimiento"
                //isRequired={modoEdicion ? isRequired('LugarNacimiento', settingDataField) : false}
                isRequired={false}
                label={{ text: intl.formatMessage({ id: "COMMON.DESCRIPTION" }) }}
                editorOptions={{
                  maxLength: 400,
                  inputAttr: { style: "text-transform: uppercase" },
                  //readOnly: !(modoEdicion ? isModified('LugarNacimiento', settingDataField) : false)
                  readOnly: !modoEdicion
                }}
              >
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>
            </GroupItem>
          </Form>
        </FieldsetAcreditacion>
        <FieldsetAcreditacion title={intl.formatMessage({ id: "ADMINISTRATION.PERSON.RECIDENSEPLACE" })}>
          <Form
            formData={props.dataRowEditNew}
            validationGroup="FormEdicion"
            ref={Formulario}
          >
            <GroupItem itemType="group" colCount={2} colSpan={2} visible={!activarTxtUbigeo}>
              <Item
                dataField="IdPaisResidencia"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COUNTRY" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: paises,
                  valueExpr: "IdPais",
                  // value: idPaisResidencia,
                  displayExpr: "Pais",
                  onValueChanged: (e => {
                    setIdPaisResidencia(e.value);
                    // props.dataRowEditNew.IdUbigeoResidencia = '';
                    // props.dataRowEditNew.UbigeoResidencia = '' ;
                  }),
                }}
              />

              <Item
                colSpan={2}
                dataField="UbigeoResidencia"
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.FILTER.UBIGEO" }) }}
                editorOptions={{
                  hoverStateEnabled: false,
                  inputAttr: { style: "text-transform: uppercase" },
                  showClearButton: true,
                  readOnly: true,
                  buttons: [
                    {
                      name: "search",
                      location: "after",
                      useSubmitBehavior: true,
                      options: {
                        stylingMode: "text",
                        icon: "search",
                        disabled: !modoEdicion ? true : false,
                        onClick: () => {
                          if (isNotEmpty(props.dataRowEditNew.IdPaisResidencia))
                            setpopUpVisibleUbigeoResidencia(true);
                          else
                            handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ADMINISTRATION.PERSON.MESSAGE_RESIDENCE_PLACE" }));

                        },
                      },
                    },
                  ],
                }}
              />
            </GroupItem>

            <GroupItem itemType="group" colCount={2} colSpan={2} visible={activarTxtUbigeo}>
              <Item
                colSpan={2}
                dataField="LugarResidencia"
                //isRequired={modoEdicion ? isRequired('LugarResidencia', settingDataField) : false}
                isRequired={false}
                label={{ text: intl.formatMessage({ id: "COMMON.DESCRIPTION" }) }}
                editorOptions={{
                  maxLength: 400,
                  inputAttr: { style: "text-transform: uppercase" },
                  //readOnly: !(modoEdicion ? isModified('LugarResidencia', settingDataField) : false)
                  readOnly: !modoEdicion
                }}
              >
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>
            </GroupItem>
          </Form>
        </FieldsetAcreditacion>
      </PortletBody>

      {/* Popup Ubigeo Nacimiento */}
      {popUpVisibleUbigeo && (
        <AdministracionUbigeoBuscar
          selectData={selectUbigeoNacimiento}
          showPopup={{ isVisiblePopUp: popUpVisibleUbigeo, setisVisiblePopUp: setpopUpVisibleUbigeo }}
          cancelarEdicion={() => setpopUpVisibleUbigeo(false)}
          uniqueId={"AdministracionUbigeoBuscarPopUp"}
          showButton={true}
          idPais={idPaisNacimiento}
        />
      )}

      {/* Popup Ubigeo Residencia */}
      {popUpVisibleUbigeoResidencia && (
        <AdministracionUbigeoBuscar
          selectData={selectUbigeoResidencia}
          showPopup={{ isVisiblePopUp: popUpVisibleUbigeoResidencia, setisVisiblePopUp: setpopUpVisibleUbigeoResidencia }}
          cancelarEdicion={() => setpopUpVisibleUbigeoResidencia(false)}
          uniqueId={"AdministracionUbigeoResidenciaBuscarPopUp"}
          showButton={true}
          idPais={idPaisResidencia}
        />
      )}
    </>
  );

};
PersonaEditPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  proteccionDatos: PropTypes.array,
  modoDetalle: PropTypes.bool,
  cargaExterna: PropTypes.bool,

}
PersonaEditPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  proteccionDatos: [],
  modoDetalle: false,
  cargaExterna: false
}


export default injectIntl(WithLoandingPanel(PersonaEditPage));


