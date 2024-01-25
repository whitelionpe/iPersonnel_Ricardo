import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import Form, {
  Item,
  GroupItem,
  RequiredRule,
  EmailRule,
  StringLengthRule,
  PatternRule,
} from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from '@material-ui/core/styles';

import { useStylesEncabezado } from "../../../../store/config/Styles";

import { obtenerTodos as obtenerTodosCategoria } from "../../../../api/administracion/categoria.api";
import { obtenerTodos as obtenerTodosTipoDocumento } from "../../../../api/sistema/tipodocumento.api";
import { obtenerTodos as obtenerTodosPais } from "../../../../api/sistema/pais.api";

import { listarEstadoSimple, listarEstado, PatterRuler, TYPE_SISTEMA_ENTIDAD, isNotEmpty } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";

import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import FotoWithHeight from "../../../../partials/content/FotoWithHeight";
import { handleErrorMes, handleInfoMessages } from "../../../../store/ducks/notify-messages";
import FieldsetAcreditacion from '../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';
import CardFotoClienteDivision from "../../../../partials/content/cardFotoClienteDivision";

const useStyles = makeStyles((theme) => ({
  clsColorText: {
    color: 'black',
  }
}));


const CompaniaEditPage = props => {

  const classes = useStyles();

  const { intl, modoEdicion, settingDataField, accessButton, selectedIndex, setLoading } = props;
  const [categorias, setCategorias] = useState([]);
  const [tipoDocumentos, setTipoDocumentos] = useState([]);
  const [paises, setPaises] = useState([]);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estadoRegistro, setEstadoRegistro] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [popupVisibleLogo, setPopupVisibleLogo] = useState(false);

  const [maxLengthDocumento, setMaxLengthDocumento] = useState(20);
  const [maskDocumento, setMaskDocumento] = useState("");
  const [caracterPermitido, setCaracterPermitido] = useState("SOLO_NUMEROS");
  const [valLongitudExacta, setValLongitudExacta] = useState("N");

  //Creación de usuario opcional
  const [creaUsuario, setCreaUsuario] = useState(false);
  const [usuarioCreado, setUsuarioCreado] = useState(false);
  //const [inputsControl, setInputsControl] = useState(null);
  const Formulario = useRef(null);
  //const itemForm = useRef(null);
  const perfilActual = useSelector(state => state.perfil.perfilActual);
  const [idPaisActual, setIdPaisActual] = useState("");


  async function cargarCombos() {
    setLoading(true);
    let categorias = await obtenerTodosCategoria();
    let paises = await obtenerTodosPais();

    // let datatipoDocumentos = await obtenerTodosTipoDocumento({ IdPais: '%' }).finally(() => {
    //   setLoading(false);
    // });

    let estadoSimple = listarEstadoSimple();
    let estadoRegistro = listarEstado();
    setCategorias(categorias);
    setPaises(paises);
    //setTipoDocumentos(datatipoDocumentos);
    setEstadoSimple(estadoSimple);
    setEstadoRegistro(estadoRegistro);

    /*if (!props.dataRowEditNew.esNuevoRegistro) {
      const { IdTipoDocumento, IdPais } = props.selectedIndex;
      onValueChangedPais(IdPais);
    }*/

    setLoading(false);
  }



  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {

      // document.getElementById("btnUpload").click();
      let datos = {
        IdCliente: props.dataRowEditNew.IdCliente
        , IdCompania: props.dataRowEditNew.IdCompania
        , Compania: props.dataRowEditNew.Compania
        , Alias: props.dataRowEditNew.Alias
        , Direccion: props.dataRowEditNew.Direccion
        , Contratista: props.dataRowEditNew.Contratista
        , IdTipoDocumento: props.dataRowEditNew.IdTipoDocumento
        //, Documento: (props.dataRowEditNew.Documento).substring(0, maxLengthDocumento) //JDL-> no es necesario cortar de acuerdo a la definicion tamano de tipo documento.
        , Documento: props.dataRowEditNew.Documento
        , IdCategoria: props.dataRowEditNew.IdCategoria
        , IdPais: props.dataRowEditNew.IdPais
        , Email: props.dataRowEditNew.Email
        , Telefono: props.dataRowEditNew.Telefono
        , NombreContacto: props.dataRowEditNew.NombreContacto
        , ControlarAsistencia: props.dataRowEditNew.ControlarAsistencia
        , Activo: props.dataRowEditNew.Activo
        , FileBase64: props.dataRowEditNew.FileBase64
        , LogoAltura: props.dataRowEditNew.LogoAltura
        , LogoAncho: props.dataRowEditNew.LogoAncho
        , CrearUsuario: props.dataRowEditNew.CrearUsuario
        , UsuarioCreado: usuarioCreado
      };

      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarCompania(datos);
      } else {
        props.actualizarCompania(datos);
      }
    }
  }

  const checkCambiado = (e) => {
    if (!e.value) {
      props.dataRowEditNew.NombreContacto = "";
      props.dataRowEditNew.Email = "";
      props.dataRowEditNew.Telefono = "";
    }
    setCreaUsuario(e.value);
  };

  function showInfo(tipo) {
    if (tipo === "logo") setPopupVisibleLogo(true);
  }

  function hideInfo(tipo) {
    if (tipo === "logo") setPopupVisibleLogo(false);
  }

  const onFileUploader = (data) => {
    const { file, fileWidth, fileHeight } = data;
    props.dataRowEditNew.FileBase64 = file;
    props.dataRowEditNew.LogoAltura = fileHeight;
    props.dataRowEditNew.LogoAncho = fileWidth;
  }


  async function onValueChangedPais(idPais) {
    console.log("onValueChangedPais", idPais);
    if (idPais) {
      let datatipoDocumentos = await obtenerTodosTipoDocumento({ IdPais: idPais });
      let filterTipoDocumentos = datatipoDocumentos.filter(k => k.IdEntidad === TYPE_SISTEMA_ENTIDAD.COMPANIA)
      if (filterTipoDocumentos.length > 0) {
        setTipoDocumentos(filterTipoDocumentos);
      } else {
        setTipoDocumentos("");
        props.dataRowEditNew.IdTipoDocumento = '';
        props.dataRowEditNew.Documento = '';
        setMaskDocumento("");
      }

      // if (Formulario.current != null) Formulario.current.instance.getEditor("IdPais").focus()
    }
  }

  async function onValueChangedTipoDocumento(value) {
    if (isNotEmpty(value)) {
      var resultado;

      if (!props.dataRowEditNew.esNuevoRegistro) {
        //let dataTipoDocumento = await obtenerTodosTipoDocumento({ IdPais: perfilActual.IdPais });
        let dataTipoDocumento = await obtenerTodosTipoDocumento({ IdPais: idPaisActual });
        resultado = dataTipoDocumento.find(x => x.IdTipoDocumento === value);
      } else {
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
      // if (Formulario.current != null) Formulario.current.instance.getEditor("IdTipoDocumento").focus()
    } else {
      props.dataRowEditNew.IdTipoDocumento = '';
      props.dataRowEditNew.Documento = '';
      setMaxLengthDocumento(20);
      setMaskDocumento("");
      // if (Formulario.current != null) Formulario.current.instance.getEditor("IdTipoDocumento").focus()
    }
  }


  const isRequiredRule = (id) => {
    return isRequired(id, settingDataField);
  }

  useEffect(() => {
    cargarCombos();
  }, []);

  useEffect(() => {


    if (!props.dataRowEditNew.esNuevoRegistro) {
      if (props.dataRowEditNew.IdUsuario != undefined && props.dataRowEditNew.IdUsuario != "") {
        setUsuarioCreado(true);
        setCreaUsuario(true);
        props.dataRowEditNew.CrearUsuario = true;
      } else props.dataRowEditNew.CrearUsuario = false;
    } else {
      setIdPaisActual(perfilActual.IdPais);
      onValueChangedPais(perfilActual.IdPais);
      setUsuarioCreado(false);
      setCreaUsuario(false);
    }
  }, [props.dataRowEditNew.esNuevoRegistro]);


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
            <Form
              formData={props.dataRowEditNew}
              validationGroup="FormEdicion"
              ref={Formulario}
            >
              <GroupItem itemType="group" colCount={5} >
                <GroupItem itemType="group" colSpan={4} colCount={2}>
                  <Item dataField="FileBase64" visible={false} />
                  <Item dataField="IdCompania"
                    isRequired={modoEdicion}
                    label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                    editorOptions={{
                      maxLength: 20,
                      inputAttr: { 'style': 'text-transform: uppercase' },
                      readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                    }}
                  >
                    <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                    <PatternRule pattern={PatterRuler.LETRAS_NUMEROS_GUIONES} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                  </Item>

                  <Item dataField="Compania"
                    label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }) }}
                    isRequired={modoEdicion ? isRequired('Compania', settingDataField) : false}
                    editorOptions={{
                      readOnly: !(modoEdicion ? isModified('Compania', settingDataField) : false),
                      maxLength: 100,
                      inputAttr: { 'style': 'text-transform: uppercase' },
                    }}
                  >
                    {(isRequiredRule("Compania")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                    <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                  </Item>

                  <Item dataField="Alias"
                    label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.NICKNAME" }) }}
                    isRequired={modoEdicion ? isRequired('Alias', settingDataField) : false}
                    editorOptions={{
                      readOnly: !(modoEdicion ? isModified('Alias', settingDataField) : false),
                      maxLength: 50,
                      inputAttr: { 'style': 'text-transform: uppercase' },
                    }}
                  >
                    {(isRequiredRule("Alias")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                    <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                  </Item>

                  <Item
                    dataField="Contratista"
                    label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.CONTRACTOR" }) }}
                    editorType="dxSelectBox"
                    isRequired={modoEdicion ? isRequired('Contratista', settingDataField) : false}
                    editorOptions={{
                      readOnly: !(modoEdicion ? isModified('Contratista', settingDataField) : false),
                      items: estadoRegistro,
                      valueExpr: "Valor",
                      displayExpr: "Descripcion",

                    }}
                  />

                  <Item
                    dataField="Direccion"
                    label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.ADDRESS" }) }}
                    isRequired={modoEdicion ? isRequired('Direccion', settingDataField) : false}
                    colSpan={2}
                    editorOptions={{
                      readOnly: !(modoEdicion ? isModified('Direccion', settingDataField) : false),
                      maxLength: 200,
                      inputAttr: { 'style': 'text-transform: uppercase' }
                    }}
                  />

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
                      displayExpr: "Pais",
                      onValueChanged: (e => {
                        setIdPaisActual(e.value);
                        onValueChangedPais(e.value);

                      }),
                      searchEnabled: true,
                    }}
                  />

                  <Item
                    dataField="IdCategoria"
                    label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.CATEGORY" }) }}
                    editorType="dxSelectBox"
                    isRequired={modoEdicion ? isRequired('IdCategoria', settingDataField) : false}
                    editorOptions={{
                      readOnly: !(modoEdicion ? isModified('IdCategoria', settingDataField) : false),
                      items: categorias,
                      valueExpr: "IdCategoria",
                      displayExpr: "Categoria"
                    }}
                  />

                  <Item
                    dataField="IdTipoDocumento"
                    label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.DOCUMENTTYPE" }) }}
                    editorType="dxSelectBox"
                    isRequired={modoEdicion ? isRequired('IdTipoDocumento', settingDataField) : false}
                    editorOptions={{
                      readOnly: !(modoEdicion ? isModified('IdTipoDocumento', settingDataField) : false),
                      items: tipoDocumentos,
                      valueExpr: "IdTipoDocumento",
                      displayExpr: "Alias",
                      onValueChanged: (e => onValueChangedTipoDocumento(e.value))
                    }}
                  />

                  <Item
                    dataField="Documento"
                    label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.DOCUMENT" }) }}
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
                    label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.DOCUMENT" }) }}
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

                  <Item
                    dataField="ControlarAsistencia"
                    label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.CONTROLATTENDACE" }) }}
                    editorType="dxSelectBox"
                    isRequired={modoEdicion}
                    editorOptions={{
                      readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false),
                      items: estadoRegistro,
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
                      items: estadoSimple,
                      valueExpr: "Valor",
                      displayExpr: "Descripcion",
                      readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
                    }}
                  />

                  <Item dataField="IdCliente" visible={false} />
                  <Item dataField="LogoAltura" visible={false} />
                  <Item dataField="LogoAncho" visible={false} />

                </GroupItem>

                {/* <GroupItem itemType="group" colSpan={1}>
                  <Item colSpan={1}>
                    <FotoWithHeight
                      agregarFotoBd={(data) => onFileUploader(data, "Logo")}
                      id={"Logo"}
                      esSubirImagen={true}
                      imagenB64={props.dataRowEditNew.Logo}
                      popupVisible={popupVisibleLogo}
                      hidePopup={() => hideInfo("logo")}
                      onClick={() => showInfo("logo")}
                    />
                  </Item>
                </GroupItem> */}

                <GroupItem colSpan={1} colCount={1}>
                  <Item colSpan={1}>

                    <CardFotoClienteDivision
                      id={"Logo"}
                      size={props.size}
                      esSubirImagen={true}
                      agregarFotoBd={(data) => onFileUploader(data, "Logo")}//onFileUploader: Solo va ha recargar la data temporalmente
                      hidePopup={() => hideInfo("logo")}
                      onClick={() => showInfo("logo")}
                      imagenB64={props.dataRowEditNew.Logo}
                      fechaFoto={props.dataRowEditNew.FechaModificacion}
                      popupVisible={popupVisibleLogo}
                      // imagenConfiguracion={{ width: props.dataRowEditNew.LogoAncho, height: props.dataRowEditNew.LogoAltura, minRange: 0.2, maxRange: 0.2, weight: 5242880 }}

                      numberPosition={"1"}
                      medidaSugeridas={props.medidaSugeridas}

                    />
                  </Item>
                </GroupItem>


              </GroupItem>
            </Form>
          </FieldsetAcreditacion>
          <FieldsetAcreditacion title={intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONTACTINFORMATION" })}>

            <Form
              formData={props.dataRowEditNew}
              validationGroup="FormEdicion"
              ref={Formulario}
            >

              <GroupItem itemType="group" colCount={5}>
                {
                  (modoEdicion && !usuarioCreado && props.licenciaAcreditacion) && 
                  <Item
                    dataField="CrearUsuario"
                    label={{
                      text: "Check",
                      visible: false
                    }}
                    editorType="dxCheckBox"
                    colSpan={5}
                    visible={true}
                    cssClass={` ${classes.clsColorText}`}
                    editorOptions={{
                      text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.SHOULD_CREATE_USER" }),
                      width: "100%",
                      onValueChanged: checkCambiado,
                      disabled: usuarioCreado,
                    }}
                  />
                }
                <Item
                  dataField="NombreContacto"
                  label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.CONTACTNAME" }) }}
                  isRequired={modoEdicion ? creaUsuario : false}
                  colSpan={2}
                  editorOptions={{
                    readOnly: !modoEdicion,
                    maxLength: 200,
                    inputAttr: { 'style': 'text-transform: uppercase' }
                  }}
                />
                {creaUsuario ? (
                  <Item
                    dataField="Email"
                    label={{ text: intl.formatMessage({ id: "SECURITY.USER.MAIL" }) }}
                    isRequired={modoEdicion ? creaUsuario : false}
                    colSpan={2}
                    editorOptions={{
                      inputAttr: { 'style': 'text-transform: uppercase' },
                      readOnly: !modoEdicion,
                      maxLength: 50
                    }}              >
                    <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                    <EmailRule message={intl.formatMessage({ id: "MESSAGES.INVALID.EMAIL" })} />
                  </Item>

                ) : (
                  <Item
                    dataField="Email"
                    label={{ text: intl.formatMessage({ id: "SECURITY.USER.MAIL" }) }}
                    colSpan={2}
                    editorOptions={{
                      inputAttr: { 'style': 'text-transform: uppercase' },
                      readOnly: !modoEdicion,
                      maxLength: 50
                    }}             >

                    <EmailRule message={intl.formatMessage({ id: "MESSAGES.INVALID.EMAIL" })} />
                  </Item>
                )
                }


                <Item
                  dataField="Telefono"
                  label={{ text: intl.formatMessage({ id: "SECURITY.USER.TELEPHONE" }) }}
                  isRequired={false}
                  dataType="number"
                  colSpan={1}
                  editorOptions={{
                    readOnly: (!modoEdicion),
                    showClearButton: true
                  }}
                >
                  <StringLengthRule max={50} />
                  <PatternRule pattern={PatterRuler.SOLO_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
                </Item>

              </GroupItem>

            </Form>
          </FieldsetAcreditacion>
        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(WithLoandingPanel(CompaniaEditPage));
