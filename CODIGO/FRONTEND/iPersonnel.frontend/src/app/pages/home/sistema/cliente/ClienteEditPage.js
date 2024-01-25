import React, { useEffect, useState, useRef } from "react";
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
import Alert from '@material-ui/lab/Alert';
import PropTypes from 'prop-types'
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import TextBox from 'devextreme-react/text-box';

import { useStylesEncabezado } from "../../../../store/config/Styles";
import { listarEstadoSimple, listarEstado, PatterRuler, isNotEmpty } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import FotoWithHeight from "../../../../partials/content/FotoWithHeight";
import { handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import FieldsetAcreditacion from '../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';
import AvatarEditor from "../../../../partials/content/AvatarEditor";
import CardFotoClienteDivision from "../../../../partials/content/cardFotoClienteDivision";
import "../../../../store/config/styles.css";

const ClienteEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton, isVisibleAlert } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estados, setEstados] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [popupVisibleLogo, setPopupVisibleLogo] = useState(false);
  const Formulario = useRef(null);
  const [nivelServicioEmail, setNivelServicioEmail] = useState("");

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    let estados = listarEstado();
    setEstados(estados);
    setEstadoSimple(estadoSimple);
  }

  function validateListMailFormat() {
    var _returnValue = true;
    var regExpEmail = new RegExp('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$');
    setNivelServicioEmail("");

    if (isNotEmpty(props.dataRowEditNew.Email_NivelServicio1)) {
      let arrayEmails = props.dataRowEditNew.Email_NivelServicio1.split(';');

      if (arrayEmails.length > 0) {
        arrayEmails.map(async (data) => {
          if (isNotEmpty(data)) {
            if (!regExpEmail.test(data.toLowerCase())) {
              setNivelServicioEmail(1);
              _returnValue = false;
            }
          }
        })
      }
    }

    if (isNotEmpty(props.dataRowEditNew.Email_NivelServicio2)) {
      let arrayEmails = props.dataRowEditNew.Email_NivelServicio2.split(';');

      if (arrayEmails.length > 0) {
        arrayEmails.map(async (data) => {
          if (isNotEmpty(data)) {
            if (!regExpEmail.test(data.toLowerCase())) {
              setNivelServicioEmail(2);
              _returnValue = false;
            }
          }
        })
      }
    }

    if (isNotEmpty(props.dataRowEditNew.Email_NivelServicio3)) {
      let arrayEmails = props.dataRowEditNew.Email_NivelServicio3.split(';');

      if (arrayEmails.length > 0) {
        arrayEmails.map(async (data) => {
          if (isNotEmpty(data)) {
            if (!regExpEmail.test(data.toLowerCase())) {
              setNivelServicioEmail(3);
              _returnValue = false;
            }
          }
        })
      }
    }

    return _returnValue;
  }

  async function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {

      if (!validateListMailFormat()) {
        handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "SYSTEM.CUSTOMER.EMAIL.SERVICE.MSG.SAVE" }) + " ");
        return;
      }

      if (!props.isVisibleAlert) {
        //document.getElementById("btnUpload").click();
        let datos = {
          IdCliente: props.dataRowEditNew.IdCliente
          , Cliente: props.dataRowEditNew.Cliente
          , Alias: props.dataRowEditNew.Alias
          , Documento: props.dataRowEditNew.Documento
          , Corporativo: props.dataRowEditNew.Corporativo
          , Email_NivelServicio1: props.dataRowEditNew.Email_NivelServicio1
          , Email_NivelServicio2: props.dataRowEditNew.Email_NivelServicio2
          , Email_NivelServicio3: props.dataRowEditNew.Email_NivelServicio3
          , Activo: props.dataRowEditNew.Activo
          , FileBase64: props.dataRowEditNew.FileBase64
          , LogoAltura: props.dataRowEditNew.LogoAltura
          , LogoAncho: props.dataRowEditNew.LogoAncho
        };

        let validar = [];
        const { LogoAltura, LogoAncho } = props.dataRowEditNew;
        if (LogoAltura > props.medidaSugeridas.alturaSugerido) {
          validar.push(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "SYSTEM.MESSAGE.INFO.HEIGHT" }));
        }
        if (LogoAncho > props.medidaSugeridas.anchoSugerido) {
          validar.push(intl.formatMessage({ id: "SYSTEM.MESSAGE.INFO.WIDTH" }));
        }

        let messageSumary = '';
        if (validar.length > 0) {
          result.isValid = false;
          for (let i = 0; i < validar.length; i++) {
            messageSumary += validar[i] + "\n" + "\n";
          }
          handleInfoMessages(messageSumary);
        }
        else {
          if (props.dataRowEditNew.esNuevoRegistro) {
            props.agregarCliente(datos);
          } else {
            props.actualizarCliente(datos);
          }
        }
      }

      else {
        let datos = {
          IdCliente: props.dataRowEditNew.IdCliente
          , Cliente: props.dataRowEditNew.Cliente
          , Alias: props.dataRowEditNew.Alias
          , Documento: props.dataRowEditNew.Documento
          , Corporativo: props.dataRowEditNew.Corporativo
          , Email_NivelServicio1: props.dataRowEditNew.Email_NivelServicio1
          , Email_NivelServicio2: props.dataRowEditNew.Email_NivelServicio2
          , Email_NivelServicio3: props.dataRowEditNew.Email_NivelServicio3
          , Activo: props.dataRowEditNew.Activo
          , FileBase64: props.dataRowEditNew.FileBase64
          , LogoAltura: props.dataRowEditNew.LogoAltura
          , LogoAncho: props.dataRowEditNew.LogoAncho
        };

        if (props.dataRowEditNew.esNuevoRegistro) {
          props.agregarCliente(datos);
        } else {
          props.actualizarCliente(datos);
        }
      }

    }
  }

  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }

  function showInfo(tipo) {
    if (tipo === "logo") setPopupVisibleLogo(true);
  }

  function hideInfo(tipo) {
    if (tipo === "logo") setPopupVisibleLogo(false);
  }

  const onFileUploader = (data) => {
    const { file, fileWidth, fileHeight } = data;
    // console.log("test_01",data)
    props.dataRowEditNew.FileBase64 = file;
    props.dataRowEditNew.LogoAltura = fileHeight;
    props.dataRowEditNew.LogoAncho = fileWidth;
  }


  const renderDetalleCorreos = () => {
    return (
      <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" id="editForm" >
        <GroupItem itemType="group" colSpan={4} colCount={2}>
          <Item
            dataField="Email_NivelServicio1"
            label={{ text: intl.formatMessage({ id: "SYSTEM.CUSTOMER.EMAIL.SERVICE1" }) }}
            //isRequired={modoEdicion ? isRequired("Email_NivelServicio1", settingDataField) : false}
            editorOptions={{
              inputAttr: { 'style': 'text-transform: uppercase' },
              readOnly: !(modoEdicion ? isModified("Email_NivelServicio1", settingDataField) : false),
              placeholder: intl.formatMessage({ id: "SYSTEM.LICENSE.ALERTEMAIL.PLACEHOLDER" }),
            }}
          >
            {/* {(isRequiredRule("Email_NivelServicio1")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={500} />} */}
            <EmailRule message={intl.formatMessage({ id: "MESSAGES.INVALID.EMAIL" })} />
          </Item>

          <Item>
            <TextBox
              defaultValue={intl.formatMessage({ id: "SYSTEM.CUSTOMER.EMAIL.SERVICE1.MSG" })}
              readOnly={true}
            />
          </Item>

          <Item
            dataField="Email_NivelServicio2"
            label={{ text: intl.formatMessage({ id: "SYSTEM.CUSTOMER.EMAIL.SERVICE2" }) }}
            //isRequired={modoEdicion ? isRequired("Email_NivelServicio2", settingDataField) : false}
            editorOptions={{
              inputAttr: { 'style': 'text-transform: uppercase' },
              readOnly: !(modoEdicion ? isModified("Email_NivelServicio2", settingDataField) : false),
              placeholder: intl.formatMessage({ id: "SYSTEM.LICENSE.ALERTEMAIL.PLACEHOLDER" }),

            }}
          >
            {/* {(isRequiredRule("Email_NivelServicio2")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={500} />} */}
            <EmailRule message={intl.formatMessage({ id: "MESSAGES.INVALID.EMAIL" })} />
          </Item>

          <Item>
            <TextBox
              defaultValue={intl.formatMessage({ id: "SYSTEM.CUSTOMER.EMAIL.SERVICE2.MSG" })}
              readOnly={true}
            />
          </Item>

          <Item
            dataField="Email_NivelServicio3"
            label={{ text: intl.formatMessage({ id: "SYSTEM.CUSTOMER.EMAIL.SERVICE3" }) }}
            //isRequired={modoEdicion ? isRequired("Email_NivelServicio3", settingDataField) : false}
            editorOptions={{
              inputAttr: { 'style': 'text-transform: uppercase' },
              readOnly: !(modoEdicion ? isModified("Email_NivelServicio3", settingDataField) : false),
              placeholder: intl.formatMessage({ id: "SYSTEM.LICENSE.ALERTEMAIL.PLACEHOLDER" }),

            }}
          >
            {/* {(isRequiredRule("Email_NivelServicio3")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={500} />} */}
            <EmailRule message={intl.formatMessage({ id: "MESSAGES.INVALID.EMAIL" })} />
          </Item>

          <Item>
            <TextBox
              defaultValue={intl.formatMessage({ id: "SYSTEM.CUSTOMER.EMAIL.SERVICE3.MSG" })}
              readOnly={true}
            />
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
      {props.showHeader && (
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
      )}
      <PortletBody >
        <React.Fragment>
          <FieldsetAcreditacion title={intl.formatMessage({ id: "COMMON.DETAIL" })}>
            {isVisibleAlert && (
              <>
                <Alert severity="warning" variant="outlined">
                  <div style={{ color: 'red' }} >
                    {intl.formatMessage({ id: "SYSTEM.CUSTOMER.INFO.CONFIGURATION.IMAGE" })}
                  </div>
                </Alert>
              </>
            )}
            <Form formData={props.dataRowEditNew}
              validationGroup="FormEdicion"
              disabled={!props.showHeader}
              ref={Formulario} >
              <GroupItem itemType="group" colCount={5}  >
                <Item colSpan={5}></Item>
                <GroupItem colSpan={4} colCount={4}>
                  <Item dataField="LogoAltura" visible={false} />
                  <Item dataField="LogoAncho" visible={false} />
                  <Item dataField="FileBase64" visible={false} />
                  <Item dataField="IdCliente"
                    colSpan={2}
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
                  <Item dataField="Cliente"
                    colSpan={2}
                    label={{ text: intl.formatMessage({ id: "SYSTEM.CUSTOMER" }) }}
                    isRequired={modoEdicion ? isRequired('Cliente', settingDataField) : false}
                    editorOptions={{
                      readOnly: !(modoEdicion ? isModified('Cliente', settingDataField) : false),
                      maxLength: 200,
                      inputAttr: { 'style': 'text-transform: uppercase' },
                    }}
                  >
                    {(isRequiredRule("Cliente")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={200} />}
                    <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
                  </Item>
                  <Item dataField="Documento"
                    colSpan={2}
                    label={{ text: intl.formatMessage({ id: "SYSTEM.CUSTOMER.DOCUMENT" }) }}
                    isRequired={modoEdicion ? isRequired('Documento', settingDataField) : false}
                    editorOptions={{
                      readOnly: !(modoEdicion ? isModified('Documento', settingDataField) : false),
                      maxLength: 20,
                      inputAttr: { 'style': 'text-transform: uppercase' },
                    }}
                  >
                    {(isRequiredRule("Documento")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                    <PatternRule pattern={PatterRuler.SOLO_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
                  </Item>
                  <Item dataField="Alias"
                    colSpan={2}
                    label={{ text: intl.formatMessage({ id: "SYSTEM.CUSTOMER.NICKNAME" }) }}
                    isRequired={modoEdicion ? isRequired('Alias', settingDataField) : false}
                    editorOptions={{
                      readOnly: !(modoEdicion ? isModified('Alias', settingDataField) : false),
                      maxLength: 100,
                      inputAttr: { 'style': 'text-transform: uppercase' },
                    }}
                  >
                    {(isRequiredRule("Alias")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                    <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
                  </Item>
                  <Item
                    dataField="Corporativo"
                    colSpan={2}
                    label={{ text: intl.formatMessage({ id: "SYSTEM.CUSTOMER.COORPORATION" }) }}
                    editorType="dxSelectBox"
                    isRequired={modoEdicion ? isRequired('Corporativo', settingDataField) : false}
                    editorOptions={{
                      readOnly: !(modoEdicion ? isModified('Corporativo', settingDataField) : false),
                      items: estados,
                      valueExpr: "Valor",
                      displayExpr: "Descripcion",
                    }}
                  />
                  <Item
                    dataField="Activo"
                    label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                    editorType="dxSelectBox"
                    colSpan={2}
                    editorOptions={{
                      readOnly: !props.modoEdicion,
                      items: estadoSimple,
                      valueExpr: "Valor",
                      displayExpr: "Descripcion",
                      disabled: props.dataRowEditNew.esNuevoRegistro ? true : false
                    }}
                  />

                </GroupItem>

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
                      imagenConfiguracion={{ width: props.dataRowEditNew.LogoAncho, height: props.dataRowEditNew.LogoAltura, minRange: 0.2, maxRange: 0.2, weight: 5242880 }}

                      numberPosition={"1"}
                      medidaSugeridas={props.medidaSugeridas}

                    />
                  </Item>
                </GroupItem>


              </GroupItem>
            </Form>
          </FieldsetAcreditacion>


          <FieldsetAcreditacion title={intl.formatMessage({ id: "SYSTEM.CUSTOMER.EMAIL.INFO" })}>
            <Form formData={props.dataRowEditNew}
              validationGroup="FormEdicion"
              disabled={!props.showHeader}
              ref={Formulario} >
              <GroupItem itemType="group" colCount={5}  >
                <Item colSpan={4}>
                  <div className="card-body" >
                    {renderDetalleCorreos()}
                  </div>
                </Item>
              </GroupItem>
            </Form>
          </FieldsetAcreditacion>

        </React.Fragment>
      </PortletBody>
    </>
  );
};
ClienteEditPage.propTypes = {
  showHeader: PropTypes.bool
}
ClienteEditPage.defaultProps = {
  showHeader: true
}

export default injectIntl(ClienteEditPage);
