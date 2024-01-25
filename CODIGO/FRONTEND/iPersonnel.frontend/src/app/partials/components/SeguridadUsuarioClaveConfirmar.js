import React, { useState } from "react";
import { injectIntl } from "react-intl"; //Multi-idioma
import { Button } from "devextreme-react";
import {
  Portlet,
  PortletHeader,
  PortletBody,
  PortletHeaderToolbar,
} from "../content/Portlet";

import { isNotEmpty } from "../../../_metronic";
import Form, { Item, GroupItem, RequiredRule, Label } from "devextreme-react/form";

import { Popup } from "devextreme-react/popup";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";

import { confirmarClave } from "../../api/seguridad/usuarioLogin.api";

import Alert from '@material-ui/lab/Alert';
import { WithLoandingPanel } from "../../partials/content/withLoandingPanel";
import Constants from "../../store/config/Constants";


const SeguridadUsuarioClaveConfirmar = (props) => {

  const { intl, setLoading } = props;
  const { IdCliente } = useSelector((state) => state.perfil.perfilActual);
  const usuario = useSelector(state => state.auth.user);

  const [claveUsuario, setClaveUsuario] = useState("");
  const [errorClave, setErrorClave] = useState(false);

  //Obtenemos la clave del usuario
  async function validarUsuarioClave(token) {

    setLoading(true);
    setErrorClave(false);

    await confirmarClave({
      IdCliente,
      IdUsuario: "usuario.usernamenoingreses",
      ClaveUsuario: claveUsuario,
      IdTipoAplicacion: Constants.ID_TIPO_APLICACION,
      tokenClient: token
    }).then(result => {

      if (result.confirmPassword) {
        props.showPopup.setisVisiblePopUp(false);
        props.confirmarPassword(true);

      } else {
        if (isNotEmpty(claveUsuario)) setErrorClave(true)
        //props.showPopup.setisVisiblePopUp(true)
      }

    }).finally(() => { setLoading(false) });

  }


  return (
    <React.Fragment>
      <Popup
        visible={props.showPopup.isVisiblePopUp}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={"200px"}
        width={"350px"}
        title={(intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.CONFIRMPASSWORD" })).toUpperCase()}
        onHiding={() => {
          props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
          props.cancelarEdicion();
        }
        }
      >

        <Portlet>

          <PortletHeader
            title={intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.ENTERPASSWORD" })}
            toolbar={
              <PortletHeaderToolbar>

                <Button
                  id="btnConfirm"
                  icon="fa flaticon2-check-mark"
                  type="normal"
                  hint={intl.formatMessage({ id: "ACTION.ACCEPT" })}
                  onClick={() => {
                    //:::>Obtener recaptcha google..
                    window.grecaptcha.ready(() => {
                      window.grecaptcha.execute(Constants.CAPTCHA_SECRETKEYSITE, { action: 'submit' }).then(token => {
                        //CONFIRMAR API DEL SERVER
                        validarUsuarioClave(token)
                      });
                    });
                  }}
                  useSubmitBehavior={true}
                  validationGroup="FormEdicion"
                //visible={true}
                />
                {/* {intl.formatMessage({ id: "ACTION.ACCEPT" })}
                  </Button> */}


              </PortletHeaderToolbar>
            }
          />

          <PortletBody >
            <Form validationGroup="FormEdicion">
              <GroupItem itemType="group" colCount={2} colSpan={2}>
                <Item
                  dataField="Clave"
                  colSpan={2}
                  label={{ text: intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.PASSWORD" }) }}
                  isRequired={true}
                  editorOptions={{
                    maxLength: 50,
                    mode: "password",
                    showClearButton: true,
                    onValueChanged: ((e) => { setClaveUsuario(e.value) }),
                    onKeyPress: ((e) => {
                      if (e.event.code === "Enter") document.getElementById("btnConfirm").click();
                    }),

                  }}
                >
                  <RequiredRule
                    message={intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.PASSWORDREQUIRED" })} />
                </Item>

              </GroupItem>

            </Form>
            {errorClave && (
              <Alert severity="error">{intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.INCORRECTPASSWORD" })}</Alert>
            )}


          </PortletBody>


        </Portlet>
      </Popup>
    </React.Fragment>
  );
};

SeguridadUsuarioClaveConfirmar.propTypes = {
  showButton: PropTypes.bool,

};
SeguridadUsuarioClaveConfirmar.defaultProps = {
  showButton: true,

};
export default injectIntl(WithLoandingPanel(SeguridadUsuarioClaveConfirmar));
