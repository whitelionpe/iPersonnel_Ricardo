import React, { useEffect, useState, useCallback } from "react";
import { injectIntl } from "react-intl";
import Form, {
  Item,
  GroupItem,
  PatternRule,
  RequiredRule,
  EmailRule,
  NumericRule,
  StringLengthRule
} from "devextreme-react/form";
import "devextreme-react/text-area";
import { Button } from "devextreme-react";
import { Switch } from 'devextreme-react/switch'
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar
} from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import "../../../../store/config/styles.css";
import { serviceConfiguracionLogeo } from "../../../../api/seguridad/configuracionLogeo.api";
import { useSelector } from "react-redux";
import {
  listarEstadoSimple,
  listarEstado,
  patterRuler,
  isNotEmpty,
  PatterRuler
} from "../../../../../_metronic";
import {
  useStylesEncabezado,
  useStylesTab
} from "../../../../store/config/Styles";
import PropTypes from "prop-types";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import AdministracionPersonaBuscar from "../../../../partials/components/AdministracionPersonaBuscar";
import { confirmAction } from "../../../../store/ducks/notify-messages";
import { obtenerTodos as listarTipoDocumento } from "../../../../api/sistema/tipodocumento.api"; // No llamar de memoria _metronic por que podria cambiar datos en tipo de documento y los cambios de memoria no los reflejaria.
import FieldsetAcreditacion from '../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';
import Constants from '../../../../store/config/Constants';

const UsuarioEditPage = props => {
  const { intl, showButtons, accessButton, modoEdicion, settingDataField, dataRowEditNew } = props;
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const [isVisiblePopUpPersonas, setisVisiblePopUpPersonas] = useState(false);
  const [isVisibleButtonBlockUnlockUser, setIsVisibleButtonBlockUnlockUser] = useState(false);
  const classesEncabezado = useStylesEncabezado();
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [maxLengthDocumento, setMaxLengthDocumento] = useState(20); // Se le asigna el valor 20 el campo Documento porque es el valor maximo en la tabla Administracion_Persona
  const [maskDocumento, setMaskDocumento] = useState("");
  const [caracterPermitido, setCaracterPermitido] = useState("SOLO_NUMEROS");
  const [valLongitudExacta, setValLongitudExacta] = useState("N"); // Se le asigna el valor 20 el campo Documento porque es el valor maximo en la tabla Administracion_Persona

  const [cmbConfiguraciones, setCmbConfiguraciones] = useState([]);

  const [validaEmailAD, setValidaEmailAD] = useState(true);

  async function cargarCombos() {
    let tiposDocumento = await listarTipoDocumento({ IdPais: perfil.IdPais })

    setTiposDocumento(tiposDocumento);


    await serviceConfiguracionLogeo.obtenerTodos({ IdCliente }).then(cmbConfiguraciones => {
      setCmbConfiguraciones(cmbConfiguraciones);
      if (props.dataRowEditNew.esNuevoRegistro) {
        let filterConfiguracionLogueo = cmbConfiguraciones.filter(x => x.Principal === "S");
        props.setDataRowEditNew({ ...props.dataRowEditNew, IdConfiguracionLogeo: filterConfiguracionLogueo[0].IdConfiguracionLogeo })
      }
    });

  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (dataRowEditNew.esNuevoRegistro) {
        props.agregarUsuario({ ValidaEmailAD: Constants.AUTENTICATE_AD === "S" ? validaEmailAD : false,...dataRowEditNew });
      } else {
        props.actualizarUsuario({ ValidaEmailAD: Constants.AUTENTICATE_AD === "S" ? validaEmailAD : false,...dataRowEditNew });
      }
    }
  }


  async function restablecerPassword(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {

      var response = await confirmAction(intl.formatMessage({ id: "SECURITY.USER.SUCCESSFULLY.AREYOUSURERESTORED.MSG" }), intl.formatMessage({ id: "COMMON.YES" }), intl.formatMessage({ id: "COMMON.NOT" }));
      if (response.isConfirmed) {
        setIsVisibleButtonBlockUnlockUser(false);
        props.restablecerPassword(dataRowEditNew);
      }
    }
  }

  async function blockUserAccount(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {

      //instrucciones para bloquear cuenta de usuario...
      var confirmBlock = await confirmAction(intl.formatMessage({ id: "SECURITY.BLOCK.USER.CONFIRM" }), intl.formatMessage({ id: "COMMON.YES" }), intl.formatMessage({ id: "COMMON.NOT" }));
      if (confirmBlock.isConfirmed) {
        setIsVisibleButtonBlockUnlockUser(true);
        //bloquear cuenta de usuario.
        props.blockAndUnlockUserAccount(dataRowEditNew, true);
      }
    }
  }

  async function unlockUserAccount(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      //instrucciones para desbloquear cuenta de usuario...
      var confirmUnlock = await confirmAction(intl.formatMessage({ id: "SECURITY.UNLOCK.USER.COFIRM" }), intl.formatMessage({ id: "COMMON.YES" }), intl.formatMessage({ id: "COMMON.NOT" }));
      if (confirmUnlock.isConfirmed) {
        setIsVisibleButtonBlockUnlockUser(false);
        //Desbloquear cuenta de usuario.
        props.blockAndUnlockUserAccount(dataRowEditNew, false);
      }

    }
  }


  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }

  useEffect(() => {
    cargarCombos();
  }, []);

  useEffect(() => {
    if (isNotEmpty(dataRowEditNew)) {
      if (isNotEmpty(dataRowEditNew.Bloqueado)) {
        console.log("dataRowEditNew.Bloqueado", dataRowEditNew.Bloqueado);
        setIsVisibleButtonBlockUnlockUser(dataRowEditNew.Bloqueado ? true : false);
      }
    }
  }, [dataRowEditNew]);

  const buscar = () => {
    setisVisiblePopUpPersonas(true);
  }

  const onValuechangedValidarEmailAD = useCallback((e) => {
    setValidaEmailAD(e.value);
  },[]);

  async function onValueChangedTipoDocumento(value) {
    console.log("**onValueChangedTipoDocumento**:> ", value);
    if (isNotEmpty(value)) {

      let dataTipoDocumento = await listarTipoDocumento({ IdPais: perfil.IdPais });
      let resultado = dataTipoDocumento.find(x => x.IdTipoDocumento === value);
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
    } else {
      // props.dataRowEditNew.IdTipoDocumento = '';
      // props.dataRowEditNew.Documento = '';
      // setMaxLengthDocumento(20);
      // setMaskDocumento("");
    }
  }

  const agregarPersona = (data) => {

    if (data.length > 0) {
      let persona = data[0];
      dataRowEditNew.IdPersona = persona.IdPersona;
      dataRowEditNew.Nombre = persona.Nombre;
      dataRowEditNew.Apellido = persona.Apellido;
      dataRowEditNew.IdTipoDocumento = persona.IdTipoDocumento;
      dataRowEditNew.Documento = persona.Documento;
      dataRowEditNew.Correo = persona.Email;
      dataRowEditNew.Telefono = persona.TelefonoMovil;
      dataRowEditNew.TipoDocumento = persona.TipoDocumento;

      console.log("**agregarPersona**:> ", data[0]);
    }

  }
  const renderUsuarioEstado = () => {
    return (
      <Form formData={dataRowEditNew} validationGroup="FormEdicion" id="editForm" >
        <GroupItem itemType="group" colCount={2} colSpan={2}>
          <Item
            colSpan={1}
            dataField="Bloqueado"
            label={{
              text: "Check",
              visible: false
            }}
            editorType="dxCheckBox"
            editorOptions={{
              readOnly: !(modoEdicion ? isModified("Bloqueado", settingDataField) : false),
              text: intl.formatMessage({ id: "SECURITY.USER.LOCKED" }),
              width: "100%"
            }}
          />
          <Item
            colSpan={1}
            dataField="FechaBloqueado"
            label={{ text: intl.formatMessage({ id: "SECURITY.USER.DATELOCKED" }), visible: false }}
            editorType="dxDateBox"
            dataType="date"
            editorOptions={{
              readOnly: true,
              displayFormat: "dd/MM/yyyy HH:mm",
              width: "70%"
            }}
          />

          <Item
            colSpan={1}
            dataField="CaducaClave"
            label={{
              text: "Check",
              visible: false
            }}
            editorType="dxCheckBox"
            editorOptions={{
              readOnly: true,
              text: intl.formatMessage({ id: "SECURITY.USER.KEYEXPIRY" }),
              width: "100%"
            }}
          />
          <Item
            colSpan={1}
            dataField="FechaCaducaClave"
            label={{ text: intl.formatMessage({ id: "SECURITY.USER.EXPIRATIONDATE" }), visible: false }}
            editorType="dxDateBox"
            dataType="date"
            editorOptions={{
              readOnly: true,
              displayFormat: "dd/MM/yyyy HH:mm",
              width: "70%"
            }}
          />

          <Item
            colSpan={1}
            dataField="PrimeraClaveCambiada"
            label={{
              text: "Check",
              visible: false
            }}
            editorType="dxCheckBox"
            editorOptions={{
              readOnly: true,
              text: intl.formatMessage({ id: "SECURITY.USER.FIRSTPWDCHANGE" }),
              width: "100%"
            }}
          />

          <Item
            colSpan={1}
            dataField="FechaPrimeraClaveCambiada"
            label={{ text: intl.formatMessage({ id: "SECURITY.USER.KEYDATE" }), visible: false }}
            editorType="dxDateBox"
            dataType="date"
            editorOptions={{
              readOnly: true,
              displayFormat: "dd/MM/yyyy HH:mm",
              width: "70%"
            }}
          />

        </GroupItem>
      </Form>
    )
  }
  const renderUsuarioPrivilegio = () => {
    return (
      <Form formData={dataRowEditNew} validationGroup="FormEdicion" id="editForm" >
        <GroupItem itemType="group" colCount={2} >
          <Item
            dataField="SuperAdministrador"
            label={{
              text: "Check",
              visible: false
            }}
            isRequired={modoEdicion ? isRequired("SuperAdministrador", settingDataField) : false}
            editorType="dxCheckBox"
            editorOptions={{
              readOnly: !(modoEdicion ? isModified("SuperAdministrador", settingDataField) : false),
              text: intl.formatMessage({ id: "SECURITY.USER.SUPERADMIN" }),
              width: "100%"
            }}
          />
          <Item
            dataField="ValidarAd"
            label={{
              text: "Check",
              visible: false
            }}
            isRequired={modoEdicion ? isRequired("SuperAdministrador", settingDataField) : false}
            editorType="dxCheckBox"
            editorOptions={{
              readOnly: !(modoEdicion ? isModified("ValidarAd", settingDataField) : false),
              text: intl.formatMessage({ id: "SECURITY.USER.ACTIVEDIRECTORY" }),
              width: "100%"
            }}
          />
        </GroupItem>
      </Form>
    )
  }

  // console.log("valLongitudExacta:", valLongitudExacta);
  // console.log("maxLengthDocumento:", maxLengthDocumento);

  return (
    <>
      {showButtons && (
        <PortletHeader
          title={props.titulo}
          toolbar={
            <PortletHeaderToolbar>
              <>{
                  Constants.AUTENTICATE_AD === "S" && (
                  <>
                    <Switch
                      hint={"Validar email en Azure AD"}
                      defaultValue={true}
                      onValueChanged={onValuechangedValidarEmailAD}/>
                    &nbsp;
                  </>
                  )
                }
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
                  icon="fa fa-address-book"
                  type="default"
                  hint={intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.ADD.PERSON" })}
                  onClick={buscar}
                  useSubmitBehavior={true}
                  validationGroup="FormEdicion"
                  visible={modoEdicion}
                  disabled={!modoEdicion}
                />
                &nbsp;
                <Button
                  icon="key"
                  type="default"
                  hint={intl.formatMessage({ id: "SECURITY.USER.SUCCESSFULLY.AREYOUSURERESTORED" })}
                  onClick={restablecerPassword}
                  visible={modoEdicion && !dataRowEditNew.esNuevoRegistro}
                />
                &nbsp;
                <Button
                  icon="fa light fa-lock"
                  type="default"
                  hint={intl.formatMessage({ id: "SECURITY.BLOCK.USER" })}
                  onClick={blockUserAccount}
                  visible={modoEdicion && !dataRowEditNew.esNuevoRegistro && !isVisibleButtonBlockUnlockUser}
                />
                &nbsp;
                <Button
                  icon="fa light fa-unlock"
                  type="default"
                  hint={intl.formatMessage({ id: "SECURITY.UNLOCK.USER" })}
                  onClick={unlockUserAccount}
                  visible={modoEdicion && !dataRowEditNew.esNuevoRegistro && isVisibleButtonBlockUnlockUser}
                />
                &nbsp;
                <Button
                  icon="fa fa-times-circle"
                  type="normal"
                  hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                  onClick={props.cancelarEdicion}
                />
              </>
            </PortletHeaderToolbar>
          }
        />
      )
      }
      <PortletBody>
        <FieldsetAcreditacion title={intl.formatMessage({ id: "SECURITY.PROFILE.USER" })}>
          <Form formData={dataRowEditNew} validationGroup="FormEdicion">
            <GroupItem itemType="group" colCount={2} colSpan={2}>

              <Item dataField="IdPersona" visible={false} />
              <Item
                dataField="IdUsuario"
                isRequired={modoEdicion}
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                editorOptions={{
                  maxLength: 20,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !dataRowEditNew.esNuevoRegistro ? true : false
                }}
              >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.LETRAS_NUMEROS_GUIONES} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>
              <Item />

              <Item
                dataField="Nombre"
                label={{ text: intl.formatMessage({ id: "SECURITY.USER.NAMES" }) }}
                isRequired={true}
                editorOptions={{
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !(modoEdicion ? isModified("Nombre", settingDataField) : false)
                }}
              >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>

              <Item
                dataField="Apellido"
                label={{ text: intl.formatMessage({ id: "SECURITY.USER.SURNAMES" }) }}
                isRequired={true}
                editorOptions={{
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !(modoEdicion ? isModified("Apellido", settingDataField) : false)
                }}
              >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>

              <Item
                dataField="IdTipoDocumento"
                label={{ text: intl.formatMessage({ id: "SYSTEM.DOCUMENTOTYPE" }) }}
                isRequired={modoEdicion ? isRequired("IdTipoDocumento", settingDataField) : false}
                editorType="dxSelectBox"
                editorOptions={{
                  items: tiposDocumento,
                  valueExpr: "IdTipoDocumento",
                  displayExpr: "Alias",
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !(modoEdicion ? isModified("IdTipoDocumento", settingDataField) : false),
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
                dataField="Correo"
                label={{ text: intl.formatMessage({ id: "SECURITY.USER.MAIL" }) }}
                //isRequired={modoEdicion ? isRequired("Correo", settingDataField) : false}
                editorOptions={{
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !(modoEdicion ? isModified("Correo", settingDataField) : false)
                }}
              >
                {/* (isRequiredRule("Correo"))  */}
                {isRequired("Correo", settingDataField) ?
                  <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
                <EmailRule message={intl.formatMessage({ id: "MESSAGES.INVALID.EMAIL" })} />
              </Item>

              <Item
                dataField="Telefono"
                label={{ text: intl.formatMessage({ id: "SECURITY.USER.TELEPHONE" }) }}
                // isRequired={modoEdicion ? isRequired("Telefono", settingDataField) : false}
                dataType="number"
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified("Telefono", settingDataField) : false),
                  showClearButton: true
                }}
              >
                {/* (isRequiredRule("Telefono")) */}
                {isRequired("Telefono", settingDataField) ?
                  <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>
              <Item
                dataField="IdConfiguracionLogeo"
                label={{
                  text: intl.formatMessage({ id: "SECURITY.SETTING.LOGING.SECURITY.LEVEL" })
                }}
                isRequired={modoEdicion ? isRequired("IdConfiguracionLogeo", settingDataField) : false}
                editorType="dxSelectBox"
                editorOptions={{
                  items: cmbConfiguraciones,
                  valueExpr: "IdConfiguracionLogeo",
                  displayExpr: "ConfiguracionLogeo",
                  showClearButton: true,
                  readOnly: !(modoEdicion ? isModified("IdConfiguracionLogeo", settingDataField) : false)
                }}
              />

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                isRequired={modoEdicion}
                editorType="dxSelectBox"
                editorOptions={{
                  readOnly: !(modoEdicion ? dataRowEditNew.esNuevoRegistro ? false : true : false),
                  items: listarEstadoSimple(),
                  valueExpr: "Valor",
                  displayExpr: "Descripcion"
                }}
              />
            </GroupItem>
          </Form>
        </FieldsetAcreditacion>
        <FieldsetAcreditacion title={intl.formatMessage({ id: "SECURITY.USER.OTHERDATA" })}>
          <Form formData={dataRowEditNew} validationGroup="FormEdicion">
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item
                dataField="Contratista"
                label={{ text: intl.formatMessage({ id: "SECURITY.USER.ISCONTRACTOR" }) }}
                isRequired={false}
                editorType="dxSelectBox"
                editorOptions={{
                  readOnly: !(modoEdicion ? true : false),
                  items: listarEstado(),
                  valueExpr: "Valor",
                  displayExpr: "Descripcion"
                }}
              />

              <Item
                dataField="ResponsableContratista"
                label={{ text: intl.formatMessage({ id: "SECURITY.USER.ISCONTRACTOR_RESPONSIBLE" }) }}
                isRequired={false}
                editorType="dxSelectBox"
                editorOptions={{
                  readOnly: !(modoEdicion ? true : false),
                  items: listarEstado(),
                  valueExpr: "Valor",
                  displayExpr: "Descripcion"
                }}
              />
            </GroupItem>
          </Form>
        </FieldsetAcreditacion>
        <br />
        <div className="row">

          <div className="col-md-6">

            <fieldset className="scheduler-border"  >
              <legend className="scheduler-border" >
                <h5>{intl.formatMessage({ id: "SECURITY.USER.STATE" })} </h5>
              </legend>
              {renderUsuarioEstado()}
            </fieldset>

          </div>


          <div className="col-md-6">

            <fieldset className="scheduler-border">
              <legend className="scheduler-border" >
                <h5>{intl.formatMessage({ id: "SECURITY.USER.PRIVILEGE" })} </h5>
              </legend>
              {renderUsuarioPrivilegio()}
            </fieldset>

          </div>

        </div>

      </PortletBody>

      {/* POPUP-> buscar persona */}
      {isVisiblePopUpPersonas && (
        <AdministracionPersonaBuscar
          showPopup={{ isVisiblePopUp: isVisiblePopUpPersonas, setisVisiblePopUp: setisVisiblePopUpPersonas }}
          cancelar={() => setisVisiblePopUpPersonas(false)}
          agregar={agregarPersona}
          selectionMode={"single"}
          uniqueId={"personasBuscarUsuarioEditPage"}
        />
      )}


    </>
  );
};
UsuarioEditPage.prototype = {
  showButtons: PropTypes.bool,
  modoEdicion: PropTypes.bool
};
UsuarioEditPage.defaultProps = {
  showButtons: true,
  modoEdicion: true
};

export default injectIntl(UsuarioEditPage);
