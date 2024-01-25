import React, { Fragment, useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../../partials/content/withLoandingPanel";
import Form, {
  Item,
  GroupItem,
  PatternRule,
  RequiredRule,
  EmailRule,
  StringLengthRule,
  EmptyItem
} from "devextreme-react/form";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../../store/config/Styles";
import { listarEstado, listarEstadoSimple, PatterRuler, isNotEmpty, dateFormat } from "../../../../../../../_metronic";
import { obtenerTodos as obtenerTodosLicencias } from "../../../../../../api/sistema/licenciaConducir.api";
import ImageViewer from '../../../../../../partials/content/ImageViewer/ImageViewer';
import CustomTabNav from '../../../../../../partials/components/Tabs/CustomTabNav'; // Revisar si no tiene otros estilos.
import { createItem, createItemAutorizador } from '../../../../../../partials/content/Acreditacion/DynamicColumns';

import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../../partials/content/Portlet";
import { Button } from "devextreme-react";
import { actualizarautorizador } from "../../../../../../api/acreditacion/solicitud.api"
import { handleErrorMessages, handleSuccessMessages, } from "../../../../../../store/ducks/notify-messages";
import { obtener as obtenerDetalle, downloadFile as downloadFileDetalle } from "../../../../../../api/acreditacion/solicitudDetalle.api"
import { withRouter } from 'react-router-dom';
import FieldsetAcreditacion from '../../../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';
import RequestStructurePopup from "../../../../../../partials/content/Acreditacion/RequestStructure/RequestStructurePopup";


const PersonaEditPage = (props) => {

  const classesEncabezado = useStylesEncabezado();
  const { intl, setLoading, dataMenu, modoEdicion, viewTextoUbigeo } = props;
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const tipoDocumentos = props.tipoDocumentos;
  const tipoSangres = props.tipoSangres;
  const estadoCiviles = props.estadoCiviles;
  const sexoSimple = props.sexoSimple;
  const paises = props.paises;
  const ubigeos = props.ubigeos;

  const [settingDataField, setSettingDataField] = useState([]);
  const [maxLengthDocumento, setMaxLengthDocumento] = useState(20);
  const [estadoDiscapacidad, setEstadoDiscapacidad] = useState([]);
  const [valueEdad, setValueEdad] = useState(0);
  const [licenciaConducir, setLicenciaCondudir] = useState([]);

  const [estadoSimple, setEstadoSimple] = useState([]);
  const [flUpdateImage, setFlUpdateImage] = useState(false);
  const [viewpopup, setViewpopup] = useState(false);
  //Ubigeo: ---------------------------------------------------------------
  const [titleUbigeo, setTitleUbigeo] = useState("");
  const [currentUbigeo, setCurrentUbigeo] = useState({});
  const [currentFieldNameUbigeo, setCurrentFieldNameUbigeo] = useState("");
  const [ubigeoBoxValue, setUbigeoBoxValue] = useState({});
  const [dataUbigeoResidencia, setDataUbigeoResidencia] = useState({ IdUbigeo: '', Departamento: '', Provincia: '', Distrito: '' });
  const [dataUbigeoNacimiento, setDataUbigeoNacimiento] = useState({ IdUbigeo: '', Departamento: '', Provincia: '', Distrito: '' });
  //-----------------------------------------------------------------------
  //Foto:
  const [currentImagePersona, setCurrentImagePersona] = useState("");

  //---------------------------------------------------------
  // const [contratos, setContratos] = useState([]);
  // const [unidades, setUnidades] = useState([]);
  // const [centroCostos, setCentroCostos] = useState([]);
  // const [viewBtnContrato, setViewBtnContrato] = useState(false);
  // const [selectedContract, setSelectedContract] = useState({ Asunto: '' });

  //---------------------------------------------------------
  const [mascara, setMascara] = useState("");
  const [reglas, setReglas] = useState("");

  const isRequiredAccreditation = (fieldName) => {
    let valor = settingDataField.filter(x => x.IdDato.toUpperCase() === fieldName.toUpperCase());

    if (valor.length > 0) {
      return valor[0].Obligatorio === 'S';
    }
    return false; //Si no existe configuracion no es obligatorio
  }

  const isModifiedAccreditation = (fieldName) => {
    let valor = settingDataField.filter(x => x.IdDato.toUpperCase() === fieldName.toUpperCase());

    if (valor.length > 0) {
      return modoEdicion ? valor[0].Editable === 'S' : false;
    }

    return false;//Si no existe configuracion se deshabilita
  }

  const isRequiredRuleAccreditation = (id) => {
    return modoEdicion ? false : isRequiredAccreditation(id);
  }
  //-======================================
  const [evaluarRequerido, setEvaluarRequerido] = useState(false);

  // const elementos = [
  //   { id: "idDatosGenerales", nombre: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.TAB1" }), bodyRender: (e) => { return renderGenerales() } },
  //   { id: "idDatosPersonales", nombre: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.TAB2" }), bodyRender: (e) => { return renderDatosPersonales() } },
  //   { id: "idDatosEvaluar", nombre: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.TAB3" }), bodyRender: (e) => { return renderDatosEvaluar() } },
  // ]
  //============================ STEPS ====================
  const steps = [
    {
      id: "idDatosGenerales",
      title: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.TAB1" })
    },
    {
      id: "idDatosPersonales",
      title: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.TAB2" })
    },
    {
      id: "idDatosEvaluar",
      title: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.TAB3" })
    }
  ];

  const validateFormDataByStepNumber = currentStep => {

    let isValidate = false;
    let message = "";

    if (!!modoEdicion) {
      return { isValidate: true, message: "" };
    }
    return { isValidate, message };
  };

  const eventoRetornar = () => {
    let { IdCompaniaContratista, IdCompaniaMandante } = props.dataRowEditNew;
    props.eventoRetornar({
      IdCompaniaContratista,
      IdCompaniaMandante
    })
    //console.log("eventoRetornarHome END  ======================");
  }


  const onValueChangedFechaNacimiento = (e) => {
    let FechaNacimiento = (new Date(e.value))
    let FechaActual = new Date()
    let edad = FechaActual.getFullYear() - FechaNacimiento.getFullYear()

    if (e.value != null) {
      setValueEdad(edad);
    }
    else {
      setValueEdad(0);
    }
  };


  const renderGenerales = () => {
    return (
      <FieldsetAcreditacion title={intl.formatMessage({ id: "ACCREDITATION.PEOPLE.EDIT" })}>
        <Form
          formData={props.dataRowEditNew}
          validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} colSpan={2}>
            <Item dataField="CompaniaMandante" label={{ text: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.EDIT.COMPANY.APPLY" }) }} editorOptions={{ readOnly: true }} />
            <Item dataField="CompaniaContratista" label={{ text: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.EDIT.COMPANY.CONTRACTOR" }) }} editorOptions={{ readOnly: true }} />
            <Item dataField="CompaniaSubContratista" label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBCONTRACTOR" }) }} editorOptions={{ readOnly: true }} />
            <EmptyItem />
            <Item dataField="IdDivision" visible={false} />
            <Item dataField="Division" label={{ text: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.EDIT.PLACE" }) }} editorOptions={{ readOnly: true }} />
            <Item dataField="Perfil" label={{ text: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.EDIT.PROFILE" }) }} editorOptions={{ readOnly: true }} />
            <Item dataField="IdContrato" label={{ text: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.EDIT.CONTRACT" }) }} editorOptions={{ readOnly: true }} />
            <GroupItem colCount={6} >
              <Item dataField="Asunto" colSpan={6} label={{ text: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.EDIT.AFFAIR" }) }} editorOptions={{ readOnly: true }} />
            </GroupItem>
            <Item dataField="UnidadOrganizativa" label={{ text: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.EDIT.UO" }) }} editorOptions={{ readOnly: true }} />
            <Item dataField="CentroCosto" label={{ text: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.EDIT.COSTCENTER" }) }} editorOptions={{ readOnly: true }} />

            <Item dataField="Funcion" label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.FUNCTION" }) }} editorOptions={{ readOnly: true }} />
            <Item dataField="Posicion" label={{ text: intl.formatMessage({ id: "ACCREDITATION.COMPANY.DATA.POSITION" }) }} editorOptions={{ readOnly: true }} />


            <Item
              dataField="FechaInicio"
              label={{
                text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" }),
              }}
              // disabled={!props.dataRowEditNew.esNuevoRegistro}
              editorType="dxDateBox"
              dataType="datetime"
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                displayFormat: "dd/MM/yyyy",
                readOnly: true
              }}
            />
            <Item
              dataField="FechaFin"
              label={{
                text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" }),
              }}
              editorType="dxDateBox"
              dataType="datetime"
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                displayFormat: "dd/MM/yyyy",
                readOnly: true
              }}
            />

          </GroupItem >


        </Form>
      </FieldsetAcreditacion>
    );
  }
  const renderDatosPersonales = () => {
    return (
      <>
        <FieldsetAcreditacion title={intl.formatMessage({ id: "ACCREDITATION.PEOPLE.GENERALDATA" })}>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
            <GroupItem itemType="group" colSpan={2} colCount={2}>
              <Item
                dataField="IdTipoDocumento"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT.TYPE" }) }}
                editorType="dxSelectBox"
                isRequired={isRequiredAccreditation("IdTipoDocumento")}
                editorOptions={{
                  items: tipoDocumentos,
                  valueExpr: "IdTipoDocumento",
                  displayExpr: "Alias",
                  searchEnabled: true,
                  placeholder: "Seleccione..",
                  showClearButton: true,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !modoEdicion ? true : !(props.permisosDatosPersona.IDTIPODOCUMENTO),
                  onValueChanged: onValueChangedTipoDocumento,
                }}
              />

              <Item rowSpan={4}>
                <Fragment>
                  <ImageViewer
                    // setImagedLoad={cargarFotoSeleccionada}
                    defaultImage={currentImagePersona}
                    setFlUpdate={setFlUpdateImage}
                    flUpdate={flUpdateImage}
                    width={192}
                    height={192}
                    editImage={false}
                    intl={intl}
                  />
                </Fragment>
              </Item>

              <Item
                dataField="Documento"
                isRequired={isRequiredAccreditation("Documento")}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" }) }}
                editorOptions={{
                  maxLength: maxLengthDocumento,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !modoEdicion ? true : !(props.permisosDatosPersona.DOCUMENTO),
                  mask: mascara
                }}
              >
                {(isRequiredRuleAccreditation("Documento")) ?
                  <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                  : <StringLengthRule max={20} />}
                <PatternRule pattern={reglas} message={"Valor incorrecto"} />
              </Item>

              <EmptyItem />

              <Item
                dataField="Apellido"
                isRequired={isRequiredAccreditation("Apellido")}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.SURNAMES" }) }}
                editorOptions={{
                  maxLength: 50,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !modoEdicion ? true : !(props.permisosDatosPersona.APELLIDO),
                }}
              >
                {(isRequiredRuleAccreditation("Apellido")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
                <PatternRule pattern={PatterRuler.SOLO_LETRAS} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>

              <EmptyItem />

              <Item
                dataField="Nombre"
                isRequired={isRequiredAccreditation("Nombre")}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.NAME" }) }}
                editorOptions={{
                  maxLength: 50,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !modoEdicion ? true : !(props.permisosDatosPersona.NOMBRE),
                }}
              >
                {(isRequiredRuleAccreditation("Nombre")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
                <PatternRule pattern={PatterRuler.SOLO_LETRAS} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>

              <EmptyItem />

              <Item
                dataField="Direccion"
                isRequired={isRequiredAccreditation("Direccion")}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.ADDRESS" }) }}
                colSpan={2}
                editorOptions={{
                  maxLength: 500,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !modoEdicion ? true : !(props.permisosDatosPersona.DIRECCION),
                }}
              />

              {viewTextoUbigeo === "S" && (<Item
                dataField="LugarNacimiento"
                isRequired={isRequiredAccreditation("UBIGEONACIMIENTO")}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.BIRTHPLACE" }) }}
                editorOptions={{
                  maxLength: 400,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !modoEdicion ? true : !(props.permisosDatosPersona.UBIGEONACIMIENTO),
                }}
              />)}
              {viewTextoUbigeo === "S" && (
              <Item
                  dataField="LugarResidencia"
                  isRequired={isRequiredAccreditation("UBIGEORESIDENCIA")}
                  label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.RECIDENSEPLACE" }) }}
                  editorOptions={{
                    maxLength: 400,
                    inputAttr: { style: "text-transform: uppercase" },
                    readOnly: !modoEdicion ? true : !(props.permisosDatosPersona.UBIGEORESIDENCIA),
                  }}
                />
              )}
              {viewTextoUbigeo === "N" && (<Item
                colSpan={1}
                dataField="UbigeoNacimiento"
                isRequired={isRequiredAccreditation("IdUbigeoNacimiento")}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.BIRTHPLACE" }) }}
                editorOptions={{
                  readOnly: true,
                  hoverStateEnabled: false,
                  inputAttr: { style: "text-transform: uppercase" },
                  showClearButton: true,
                  buttons: [
                    {
                      name: "search",
                      location: "after",
                      useSubmitBehavior: true,
                      options: {
                        stylingMode: "text",
                        icon: "search",
                        disabled: !modoEdicion ? false : (props.permisosDatosPersona.IDUBIGEONACIMIENTO),// !modoEdicion, //? true : //!props.dataRowEditNew.esNuevoRegistro,
                        onClick: (evt) => {

                          setTitleUbigeo("Ubigeo de nacimiento");
                          setCurrentUbigeo(props.dataRowEditNew.IdUbigeoNacimiento);
                          setCurrentFieldNameUbigeo("IdUbigeoNacimiento");


                          if (props.dataRowEditNew.IdUbigeoNacimiento !== "") {
                            setUbigeoBoxValue(dataUbigeoNacimiento);
                          }
                          setViewpopup(true);
                        },
                      },
                    },
                  ],
                }}
              />
              )}

              {viewTextoUbigeo === "N" && (
              <Item
                colSpan={1}
                dataField="UbigeoResidencia"
                isRequired={isRequiredAccreditation("IdUbigeoResidencia")}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.RECIDENSEPLACE" }) }}
                editorOptions={{
                  readOnly: true,
                  hoverStateEnabled: false,
                  inputAttr: { style: "text-transform: uppercase" },
                  showClearButton: true,
                  buttons: [
                    {
                      name: "search",
                      location: "after",
                      useSubmitBehavior: true,
                      options: {
                        stylingMode: "text",
                        icon: "search",
                        disabled: !modoEdicion ? false : (props.permisosDatosPersona.IDUBIGEORESIDENCIA),//  !modoEdicion,
                        onClick: (evt) => {
                          setViewpopup(true);

                          setTitleUbigeo("Ubigeo de residencia");
                          setCurrentUbigeo(props.dataRowEditNew.IdUbigeoResidencia);
                          setCurrentFieldNameUbigeo("IdUbigeoResidencia");


                            if (props.dataRowEditNew.IdUbigeoResidencia !== "") {
                            setUbigeoBoxValue(dataUbigeoResidencia);
                          }
                          setViewpopup(true);
                          //ubigeoBoxValue
                          //setUbigeoBoxValue
                        },
                      },
                    },
                  ],
                }}
                />)}

              <Item
                dataField="FechaNacimiento"
                isRequired={isRequiredAccreditation("FechaNacimiento")}
                label={{ text: intl.formatMessage({ id: "ACCREDITATION.EDIT.BIRTHDAY" }) }}
                editorType="dxDateBox"
                dataType="date"
                editorOptions={{
                  displayFormat: "dd/MM/yyyy",
                  showClearButton: false,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !modoEdicion ? true : !(props.permisosDatosPersona.FECHANACIMIENTO),
                  onValueChanged: onValueChangedFechaNacimiento

                }}
              />
              <Item
                dataField="Edad"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.AGE" }) }}
                editorOptions={{
                  disabled: true,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !modoEdicion ? true : !(props.permisosDatosPersona.FECHANACIMIENTO),
                  value: props.dataRowEditNew.esNuevoRegistro ? valueEdad : (valueEdad > 0 ? valueEdad : props.dataRowEditNew.Edad),

                }}
              >
                {(isRequiredRuleAccreditation("FechaNacimiento")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={200} />}
                <PatternRule pattern={PatterRuler.SOLO_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
              </Item>

              <Item
                dataField="Sexo"
                isRequired={isRequiredAccreditation("Sexo")}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.GENDER" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: sexoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  placeholder: "Seleccione..",
                  showClearButton: true,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !modoEdicion ? true : !(props.permisosDatosPersona.SEXO),
                }}
              />

              <Item
                dataField="IdEstadoCivil"
                isRequired={isRequiredAccreditation("IdEstadoCivil")}
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
                  readOnly: !modoEdicion ? true : !(props.permisosDatosPersona.IDESTADOCIVIL),
                }}
              />
              <Item
                dataField="TelefonoMovil"
                isRequired={isRequiredAccreditation("TelefonoMovil")}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.MOBILE.PHONE" }) }}
                editorOptions={{
                  maxLength: 20,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !modoEdicion ? true : !(props.permisosDatosPersona.TELEFONOMOVIL),
                }}
              >
                {(isRequiredRuleAccreditation("TelefonoMovil")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={20} />}
                <PatternRule pattern={PatterRuler.SOLO_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
              </Item>

              <Item
                dataField="TelefonoFijo"
                isRequired={isRequiredAccreditation("TelefonoFijo")}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.MOBILE.LANDLINE" }) }}
                editorOptions={{
                  maxLength: 50,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !modoEdicion ? true : !(props.permisosDatosPersona.TELEFONOFIJO),
                }}
              >
                {(isRequiredRuleAccreditation("TelefonoFijo")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
                <PatternRule pattern={PatterRuler.SOLO_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
              </Item>

              <Item
                dataField="Email"
                isRequired={isRequiredAccreditation("Email")}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.MAIL" }) }}
                colSpan={2}
                editorOptions={{
                  maxLength: 50,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !modoEdicion ? true : !(props.permisosDatosPersona.EMAIL),
                }}
              >
                {(isRequiredRuleAccreditation("Email")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
                <EmailRule message={intl.formatMessage({ id: "MESSAGES.INVALID.EMAIL" })} />
              </Item>
            </GroupItem>
          </Form>
        </FieldsetAcreditacion>

        <FieldsetAcreditacion title={intl.formatMessage({ id: "CONFIG.MENU.ADMINISTRACION.DATOS_ADICIONALES" })}>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
            <GroupItem itemType="group" colSpan={2} colCount={2}>

              <Item
                dataField="IdTipoSangre"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.BLOOD.TYPE" }) }}
                editorType="dxSelectBox"
                isRequired={isRequiredAccreditation("IdTipoSangre")}
                editorOptions={{
                  items: tipoSangres,
                  valueExpr: "IdTipoSangre",
                  displayExpr: "TipoSangre",
                  placeholder: "Seleccione..",
                  searchEnabled: true,
                  showClearButton: true,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !modoEdicion ? true : !(props.permisosDatosPersona.IDTIPOSANGRE),
                }}
              />
              <Item
                dataField="Alergia"
                isRequired={isRequiredAccreditation("Alergia")}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.ALLERGY" }) }}
                editorOptions={{
                  maxLength: 200,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !modoEdicion ? true : !(props.permisosDatosPersona.ALERGIA),
                }}
              >
                {(isRequiredRuleAccreditation("Alergia")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={200} />}
                <PatternRule pattern={PatterRuler.LETRAS_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>
              <Item
                dataField="Discapacidad"
                isRequired={isRequiredAccreditation("Discapacidad")}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.DISABILITY" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: estadoDiscapacidad,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  searchEnabled: true,
                  showClearButton: true,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !modoEdicion ? true : !(props.permisosDatosPersona.DISCAPACIDAD),
                }}
              />
              <EmptyItem />

            </GroupItem>
          </Form>
        </FieldsetAcreditacion>

        <FieldsetAcreditacion title={intl.formatMessage({ id: "ACCREDITATION.PEOPLE.EMERGENCY" })}>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
            <GroupItem itemType="group" colSpan={2} colCount={2}>
              <Item
                dataField="EmergenciaNombre"
                isRequired={isRequiredAccreditation("EmergenciaNombre")}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.EMERGENCYNAME" }) }}
                editorOptions={{
                  maxLength: 50,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !modoEdicion ? true : !(props.permisosDatosPersona.EMERGENCIANOMBRE),
                }}
              >
                {(isRequiredRuleAccreditation("EmergenciaNombre")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
                <PatternRule pattern={PatterRuler.SOLO_LETRAS} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>

              <Item
                dataField="EmergenciaTelefono"
                isRequired={isRequiredAccreditation("EmergenciaTelefono")}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.EMERGENCYPHONE" }) }}
                editorOptions={{
                  maxLength: 50,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !modoEdicion ? true : !(props.permisosDatosPersona.EMERGENCIATELEFONO),
                }}
              >
                {(isRequiredRuleAccreditation("EmergenciaTelefono")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
                <PatternRule pattern={PatterRuler.SOLO_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
              </Item>
            </GroupItem>
          </Form>
        </FieldsetAcreditacion>

        <FieldsetAcreditacion title={intl.formatMessage({ id: "SYSTEM.DRIVERSLICENSE" })}>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
            <GroupItem itemType="group" colSpan={2} colCount={2}>
              <Item
                dataField="IdPaisLicenciaConducir"
                isRequired={isRequiredAccreditation("IdPaisLicenciaConducir")}
                // label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.DRIVING.CATEGORY" }) }}
                label={{ text: intl.formatMessage({ id: "SYSTEM.COUNTRY" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: paises,
                  valueExpr: "IdPais",
                  displayExpr: "Pais",
                  searchEnabled: true,
                  placeholder: "Seleccione..",
                  showClearButton: true,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !modoEdicion ? true : !(props.permisosDatosPersona.IDPAISLICENCIACONDUCIR),
                  // onValueChanged: onValueChangedPais
                }}
              />
              <Item
                dataField="IdLicenciaConducir"
                isRequired={isRequiredAccreditation("IdLicenciaConducir")}
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
                  readOnly: !modoEdicion ? true : !(props.permisosDatosPersona.IDLICENCIACONDUCIR),
                }}
              />
              <Item
                dataField="NumeroLicenciaConducir"
                isRequired={isRequiredAccreditation("NumeroLicenciaConducir")}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.LICENSE.NUMBER" }) }}
                editorOptions={{
                  maxLength: 20,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !modoEdicion ? true : !(props.permisosDatosPersona.NUMEROLICENCIACONDUCIR),
                }}
              >
                {(isRequiredRuleAccreditation("NumeroLicenciaConducir")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={20} />}
                <PatternRule pattern={PatterRuler.SOLO_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
              </Item>
            </GroupItem>
          </Form>
        </FieldsetAcreditacion>
      </>
    );

  }
  const renderDatosEvaluar = () => {
    const grupos = props.optRequisito.filter(x => x.Tipo === 'G');
    return (
      <Fragment>
        {
          grupos.map(grupo => (
            <FieldsetAcreditacion title={(grupo.Text || "").toLocaleLowerCase()}>
              <div>
                <Form formData={props.dataRowEditNew} labelLocation={"top"} validationGroup="FormEdicion">

                  <GroupItem itemType="group" colSpan={2} colCount={2}  >
                    {
                      props.optRequisito.map((x, i) => {

                        return (props.optRequisito.Tipo !== 'G' && x.IdRequisito === grupo.Value ? createItemAutorizador(x, true, descargarArchivo, eventoEstado, true, intl) : null);

                      })
                    }
                  </GroupItem>

                </Form>
              </div>
            </FieldsetAcreditacion>
          ))
        }
      </Fragment>
    )
  }

  const descargarArchivo = async (id) => {
    //debugger;
    if (id !== "") {
      await downloadFileDetalle({
        IdSolicitud: props.dataRowEditNew.IdSolicitud,
        IdFile: id
      }).then(res => {
        var a = document.createElement("a"); //Create <a>
        a.href = res.file; //Image Base64 Goes here
        a.download = res.name; //File name Here
        a.click(); //Downloaded file  
      });
    }
  }

  //---------------------------------------------------------

  const eventoEstado = (data) => {
    props.dataRowEditNew[`${data.Index}|CHECK`] = data.value;
    let tempRequisitos = props.optRequisito;
    let flUpdate = false;
    for (let i = 0; i < tempRequisitos.length; i++) {
      if (tempRequisitos[i].Index === data.Index) {
        tempRequisitos[i].EstadoAprobacion = data.value;
        flUpdate = true;
        break;
      }

    }
    if (flUpdate) {
      props.setOptRequisito(tempRequisitos);
    }
  }

  useEffect(() => {

    if (props.cargarDatos) {
      cargarCombos();

      if (isNotEmpty(props.dataRowEditNew.Foto)) {
        setCurrentImagePersona(props.dataRowEditNew.Foto);
        setFlUpdateImage(true);
      }

      if (isNotEmpty(props.dataRowEditNew.FechaNacimiento)) {
        onValueChangedFechaNacimiento({ value: props.dataRowEditNew.FechaNacimiento });
      }
      if (isNotEmpty(props.dataRowEditNew.IdTipoDocumento)) {
        onValueChangedTipoDocumento({ value: props.dataRowEditNew.IdTipoDocumento });
      }
      if (isNotEmpty(props.dataRowEditNew.IdPaisLicenciaConducir)) {
        onValueChangedPais({ value: props.dataRowEditNew.IdPaisLicenciaConducir });
      }

    }

  }, [props.cargarDatos])

  const cargarCombos = async () => {
    let estadoSimple = listarEstadoSimple();
    let estadoDiscapacidad = listarEstado();
    setEstadoDiscapacidad(estadoDiscapacidad);
    setEstadoSimple(estadoSimple);
  }


  const paintTitle = () => {

    return (
      <div className="title-estado-general">
        <div className="title-estado-general-bar"> {intl.formatMessage({ id: "ACCREDITATION.EDIT.REQUEST" })}
          <b>{zeroPad(props.dataRowEditNew.IdSolicitud, 8)} </b>
        </div>
        {paintState()}
      </div>
    );
  }

  function zeroPad(num, places) {
    if (num === undefined) {
      return "";
    }
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
  }

  const paintState = () => {

    let estado = '';
    let css = '';
    switch (props.dataRowEditNew.EstadoAprobacion) {
      case 'I': css = 'estado_item_incompleto'; estado = intl.formatMessage({ id: "COMMON.INCOMPLETE" }); break;
      case 'P': css = 'estado_item_pendiente'; estado = intl.formatMessage({ id: "COMMON.EARRING" }); break;
      case 'O': css = 'estado_item_observado'; estado = intl.formatMessage({ id: "COMMON.OBSERVED" }); break;
      case 'R': css = 'estado_item_rechazado'; estado = intl.formatMessage({ id: "COMMON.REJECTED" }); break;
      case 'A': css = 'estado_item_aprobado'; estado = intl.formatMessage({ id: "COMMON.APPROVED" }); break;
      default: css = 'estado_item_incompleto'; estado = intl.formatMessage({ id: "COMMON.INCOMPLETE" }); break;
    }

    return <span className={`estado_item_izq estado_item_general  ${css}`}   >{estado}</span>


  }

  const onValueChangedTipoDocumento = (e) => {
    const resultado = tipoDocumentos.find(x => x.IdTipoDocumento === e.value);
    if (resultado) {

      setMaxLengthDocumento(resultado.Longitud)

      if (resultado.Mascara !== "") {
        setMascara(resultado.Mascara);
      } else {
        setMascara("");
      }

      if (resultado.CaracteresPermitidos !== "") {

        if (PatterRuler.hasOwnProperty(resultado.CaracteresPermitidos)) {
          setReglas(PatterRuler[resultado.CaracteresPermitidos]);
        } else {
          setReglas("");
        }
      } else {
        setReglas("");
      }
    } else {
      setMaxLengthDocumento(20);
    }
  };

  const onValueChangedPais = async (item) => {
    if (item != null && item.value !== "") {
      await obtenerTodosLicencias({ IdPais: item.value }).then(response => {
        let tmp_licencias = response;
        setLicenciaCondudir(tmp_licencias);
      });


    }
  }

  const cargarParametrosFormulario = () => {
    let {
      IdSolicitud,
      Nombre,
      Apellido, Direccion, IdTipoDocumento,
      Documento, Sexo, IdEstadoCivil,
      IdTipoSangre, Alergia, IdUbigeoNacimiento,
      IdUbigeoResidencia, FechaNacimiento, TelefonoMovil,
      TelefonoFijo, Email, EmergenciaNombre,
      EmergenciaTelefono, IdPaisLicenciaConducir, IdLicenciaConducir,
      NumeroLicenciaConducir, Discapacidad, NumeroHijos,
      Observacion
    } = props.dataRowEditNew;

    //Detalle:
    let Detalle = [];

    for (let i = 0; i < props.optRequisito.length; i++) {
      let x = props.optRequisito[i];
      if ((x.Tipo != "G" && x.Tipo != "B") && x.Aprobar == 'S') {
        let Observacion = props.dataRowEditNew[`${x.Index}|OBS`];
        let EstadoAprobacion = props.dataRowEditNew[`${x.Index}|CHECK`];

        let valor = props.dataRowEditNew[x.Index];

        if (x.Tipo === "F") {
          valor = isNotEmpty(valor) ? dateFormat(valor, 'yyyyMMdd') : "";
        }

        // console.log("[1] __________________> ", valor);
        Detalle.push({
          IdCliente: perfil.IdCliente,
          IdSolicitud: 0,
          IdRequisito: x.IdRequisito,
          IdDatoEvaluar: x.Value,
          TipoRequisito: 'S',
          Valor: isNotEmpty(valor) ? valor.toUpperCase() : "",
          Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : "",
          EstadoAprobacion: isNotEmpty(EstadoAprobacion) ? EstadoAprobacion : "",
          NombreArchivo: '',
          TipoArchivo: ''
        });
      }

    }

    const params =
    {
      IdCliente: perfil.IdCliente,
      IdSolicitud: isNotEmpty(IdSolicitud) ? IdSolicitud : 0,
      Nombre: isNotEmpty(Nombre) ? Nombre.toUpperCase() : "",
      Apellido: isNotEmpty(Apellido) ? Apellido.toUpperCase() : "",
      Direccion: isNotEmpty(Direccion) ? Direccion.toUpperCase() : "",
      IdTipoDocumento: isNotEmpty(IdTipoDocumento) ? IdTipoDocumento : "",
      Documento: isNotEmpty(Documento) ? Documento.toUpperCase() : "",
      Sexo: isNotEmpty(Sexo) ? Sexo : "",
      IdEstadoCivil: isNotEmpty(IdEstadoCivil) ? IdEstadoCivil : "",
      IdTipoSangre: isNotEmpty(IdTipoSangre) ? IdTipoSangre : "",
      Alergia: isNotEmpty(Alergia) ? Alergia.toUpperCase() : "",
      IdUbigeoNacimiento: isNotEmpty(IdUbigeoNacimiento) ? IdUbigeoNacimiento : "",
      IdUbigeoResidencia: isNotEmpty(IdUbigeoResidencia) ? IdUbigeoResidencia : "",
      FechaNacimiento: isNotEmpty(FechaNacimiento) ? (new Date(FechaNacimiento)).toLocaleDateString() : "",
      TelefonoMovil: isNotEmpty(TelefonoMovil) ? TelefonoMovil : "",
      TelefonoFijo: isNotEmpty(TelefonoFijo) ? TelefonoFijo : "",
      Email: isNotEmpty(Email) ? Email.toUpperCase() : "",
      EmergenciaNombre: isNotEmpty(EmergenciaNombre) ? EmergenciaNombre.toUpperCase() : "",
      EmergenciaTelefono: isNotEmpty(EmergenciaTelefono) ? EmergenciaTelefono : "",
      IdPaisLicenciaConducir: isNotEmpty(IdPaisLicenciaConducir) ? IdPaisLicenciaConducir : "",
      IdLicenciaConducir: isNotEmpty(IdLicenciaConducir) ? IdLicenciaConducir : "",
      NumeroLicenciaConducir: isNotEmpty(NumeroLicenciaConducir) ? NumeroLicenciaConducir.toUpperCase() : "",
      Discapacidad: isNotEmpty(Discapacidad) ? Discapacidad.toUpperCase() : "",
      NumeroHijos: isNotEmpty(NumeroHijos) ? NumeroHijos : "",
      Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : "",
      SolicitudCompleta: "N",
      IdUsuarioRegistro: usuario.username,
      Detalle: JSON.stringify(Detalle)
    };
    return params;
  }

  const guardarAvance = () => {
    let params = cargarParametrosFormulario();
    evento_actualizarSolicitud(params);
  }


  const evento_actualizarSolicitud = async (params) => {
    await actualizarautorizador(params)
      .then(async res => {
        viewScreeRequest('U');

        setTimeout(() => {
          eventoRetornarHome();
        }, 1000);

      })
      .catch(err => {
        setLoading(false)
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.ERROR" }), "Ocurrió un error inesperado");


      })
      .finally(res => {
      });
  }

  const viewScreeRequest = (tipo) => {
    setLoading(false);

    if (props.dataRowEditNew.esNuevoRegistro) {
      handleSuccessMessages(
        intl.formatMessage({ id: "MESSAGES.SUCESS" }),
        intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
    } else {
      handleSuccessMessages(
        intl.formatMessage({ id: "MESSAGES.SUCESS" }),
        intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
    }

  }

  const eventoRetornarHome = () => {
    let { IdCompaniaContratista, IdCompaniaMandante } = props.dataRowEditNew;
    props.cancelarEdicion({
      IdCompaniaContratista,
      IdCompaniaMandante
    })
  }

  function retornaColor() {
    const { DiasTranscurridos } = props.dataRowEditNew;
    let color = '';
    if (!isNotEmpty(DiasTranscurridos)) {
      color = 'rgb(167, 167, 167)';
    }
    else if (DiasTranscurridos >= props.colorRojo) {
      color = 'red';
    }
    else if (DiasTranscurridos <= props.colorVerde) {
      color = 'green';
    } else if (DiasTranscurridos < props.colorRojo && DiasTranscurridos > props.colorVerde) {
      color = '#ffd400';
    }

    return color;
  }

  function retornaColorTexto() {
    const { DiasTranscurridos } = props.dataRowEditNew;
    let color = '';
    if (DiasTranscurridos < props.colorRojo && DiasTranscurridos > props.colorVerde) {
      color = 'black';
    }
    else {
      color = 'white';
    }
    return color;
  }

  const renderTiemporAcreditacion = () => {
    return (


      <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
        <GroupItem itemType="group" colSpan={3} colCount={3} >
          <Item colSpan={3}>
            <AppBar
              position="static"
              className={classesEncabezado.secundario}
            >
              <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                <Typography
                  variant="h6"
                  color="inherit"
                  className={classesEncabezado.title}
                >
                  {intl.formatMessage({ id: "ADMINISTRATION.REQUEST.ACCREDITATION.TIME" })}
                </Typography>
              </Toolbar>
            </AppBar>
          </Item>
          <Item
            dataField="FechaSolicitud"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.REQUEST.ACCREDITATION.STARTDATE" }) }}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy HH:mm",
              readOnly: true
            }}
          />

          <Item
            dataField="FechaAprobacion"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.REQUEST.ACCREDITATION.APPROVAL.DATE" }) }}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy HH:mm",
              readOnly: true
            }}
          />

          <Item
            dataField="FechaProcesado"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.REQUEST.ACCREDITATION.DATE.PROCESS" }) }}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy HH:mm",
              readOnly: true
            }}
          />


          <Item
            dataField="TiempoAcreditacion"
            label={{ text: intl.formatMessage({ id: "ACCREDITATION.TIME" }) }}
            editorOptions={{
              readOnly: true,
              inputAttr: { 'style': 'background-color: ' + retornaColor() + ' ;color: ' + retornaColorTexto() + '' }
            }}
          />


          <Item />
        </GroupItem>
      </Form>


    )
  }

  return (
    <Fragment>

      <div className="row" style={{ width: "100%" }}>
        <div className="col-12">

          <PortletHeader
            classNameHead={"title-estado-general-row"}
            title={paintTitle()}
            toolbar={
              <PortletHeaderToolbar>
                <PortletHeaderToolbar>
                  <Button
                    icon="fa fa-save"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                    onClick={guardarAvance}
                    visible={false}
                  />
                  &nbsp;
                  &nbsp;
                  <Button
                    icon="fa fa-times-circle"
                    type="normal"
                    hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                    onClick={props.cancelarEdicion}
                  />
                </PortletHeaderToolbar>
              </PortletHeaderToolbar>
            }
          />

          <PortletBody>
            <RequestStructurePopup
              steps={steps}
              validateFormDataByStepNumber={validateFormDataByStepNumber}
              eventReturnHome={eventoRetornar}
            >
              {renderGenerales()}
              {renderDatosPersonales()}
              {renderDatosEvaluar()}
            </RequestStructurePopup>
            <br></br>
            {renderTiemporAcreditacion()}
          </PortletBody>

        </div>
      </div>
    </Fragment>
  );
};

export default injectIntl(WithLoandingPanel(withRouter(PersonaEditPage)));
