import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Formik } from "formik";
import * as Yup from "yup";

import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import { TextField } from "@material-ui/core";
import InputLabel from '@material-ui/core/InputLabel';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import InputAdornment from '@material-ui/core/InputAdornment';
import OutlinedInput from '@material-ui/core/OutlinedInput';

import 'devextreme-react/text-area';
import { Button } from "devextreme-react";
import { PortletBody } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import "../../../../store/config/styles.css";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import PropTypes from "prop-types";

import Constants from "../../../../store/config/Constants";
import { isNotEmpty } from "../../../../../_metronic";

const UsuarioLoginEditPage = props => {

  const { intl, dataRowEditNew,MessageServer, setMessageServer } = props;

  const defaultLongitudMin = 6;
  const [Msgerror, setMsgerror] = useState("");
  const [showAfterPasswords, setShowAfterPasswords] = useState(false);//Password
  const [showpasswords, setShowpasswords] = useState(false);//Password
  const [showChangePasswords, setShowChangePasswords] = useState(false);//Password
  const [aplicarValidaciones, setAplicarValidaciones] = useState({ digitos: false, letras: false, mayusculas: false, minusculas: false, simbolos: false });
  const [nivel, setNivel] = useState("A");
  const [longitudMinima, setLongitudMinima] = useState(defaultLongitudMin);



  function grabar(e) {

    //++++++++++++++++++++<Actualiza contrasenia>++++++++++++++ 
    //console.log("GuardarClave");
    setMessageServer("");
    setMsgerror("");
    // const { Identificador, CodigoVerificacion } = forgotPass;
    var afterPassword = document.getElementById("txtAfterPassword").value;
    var password = document.getElementById("txtPassword").value;
    var changePassword = document.getElementById("txtChangePassword").value;

    if (isNotEmpty(afterPassword) && isNotEmpty(password) && isNotEmpty(changePassword)) {
      //Confirmar regla validacion
      if (!validarCajaPasswordByText(password)) return;
      props.cambiarClaveUsuario({ ClaveAnterior: afterPassword, Clave: password });
    }
    else {
      if (isNotEmpty(password)) {
        setMsgerror(intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.ENTERPASSWORD" }));
      }
      if (isNotEmpty(changePassword)) {
        setMsgerror(intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.ENTERPASSWORD" }));
      }
    }

  }


  //Obtenemos la configuración del nivel de seguridad de la contraseña
  async function obtenerConfiguracionPWD() {

    setLongitudMinima(dataRowEditNew.LongitudClave);
    setNivel(dataRowEditNew.NivelSeguridadClave);

    switch (dataRowEditNew.NivelSeguridadClave) {
      case 'B': setAplicarValidaciones({ digitos: false, letras: false, mayusculas: false, minusculas: false, simbolos: false }); break;
      case 'I': setAplicarValidaciones({ digitos: true, letras: true, mayusculas: false, minusculas: false, simbolos: false }); break;
      case 'A': setAplicarValidaciones({ digitos: true, letras: true, mayusculas: true, minusculas: true, simbolos: true }); break;
    }

  }

  //+++Eventos para ocultar o mostrar contrasenia +++++
  const handleClickShowAfterPassword = () => {
    setShowAfterPasswords(!showAfterPasswords);
  };
  const handleMouseDownAfterPassword = (event) => {
    event.preventDefault();
  };

  const handleClickShowPassword = () => {
    setShowpasswords(!showpasswords);
  };
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  const handleClickShowChangePassword = () => {
    setShowChangePasswords(!showChangePasswords);
  };
  const handleMouseDownChangePassword = (event) => {
    event.preventDefault();
  };

  const SchemaStep3 = Yup.object().shape({
    afterPassword: Yup.string().required(intl.formatMessage({ id: "AUTH.VALIDATION.INVALID_FIELD" })),
    password: Yup.string().required(intl.formatMessage({ id: "AUTH.VALIDATION.INVALID_FIELD" })).min(longitudMinima, intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.PASSWORDLENGTH" }) + " " + longitudMinima.toString()),
    changePassword: Yup.string().required(intl.formatMessage({ id: "AUTH.VALIDATION.REQUIRED_FIELD" })).oneOf([Yup.ref('password'), null], intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.CONFIRMPASSWORDMATCHPASSWORD" })),

  });

  const validarCajaPasswordByText = (valor) => {
    let cumpleValidacion = true;

    if (aplicarValidaciones.digitos) {
      cumpleValidacion = cumpleValidacion && /[0-9]/.test(valor);
    }
    if (aplicarValidaciones.letras) {
      cumpleValidacion = cumpleValidacion && (/[A-Z]/.test(valor) || /[a-z]/.test(valor));
    }

    if (aplicarValidaciones.mayusculas) {
      cumpleValidacion = cumpleValidacion && /[A-Z]/.test(valor);
    }

    if (aplicarValidaciones.minusculas) {
      cumpleValidacion = cumpleValidacion && /[a-z]/.test(valor);
    }

    if (aplicarValidaciones.simbolos) {
      cumpleValidacion = cumpleValidacion && (/(.*[!,@,#,$,%,^,&,*,?,_,-,~])/.test(valor) || !(/^[A-Za-z0-9 ]+$/.test(valor)));
    }
    if (!cumpleValidacion) {

      switch (nivel) {
        case 'B': setMsgerror(intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.BASICLEVEL" })); break;
        case 'I': setMsgerror(intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.INTERMEDIATELEVEL" })); break;
        case 'A': setMsgerror(intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.ADVANCEDLEVEL" })); break;
      }
    }
    return cumpleValidacion;
  }

  useEffect(() => {
    obtenerConfiguracionPWD();

  }, []);

  return (
    <React.Fragment>

      <PortletBody >
        <div className="row">
          <div className="col-md-4"></div>
          <div className="col-md-4">

            <br />
            <div className="kt-grid__item kt-grid__item--fluid  kt-grid__item--order-tablet-and-mobile-1  kt-login__wrapper">
              <div className="kt-login__body">
                <div className="kt-login__form">
                  <div className="kt-login__title">
                    <article>
                      <h5> {intl.formatMessage({ id: "AUTH.CHANGE.PASSWORD" })}</h5>
                      <br />
                      {/* <p> <FormattedMessage id="AUTH.LOGIN.TITLE.AUTHENTICATION" /> </p> */}
                    </article>
                  </div>
                  <Formik
                    initialValues={{
                      afterPassword: "",
                      password: "",
                      changePassword: ""
                    }}
                    validationSchema={SchemaStep3}
                    onSubmit={() => { }}
                    validateOnMount
                  >
                    {({
                      values,
                      //status,
                      errors,
                      touched,
                      handleChange,
                      handleBlur,
                      handleSubmit,
                      //isSubmitting,
                      isValid
                    }) => (
                      <>
                        <form
                          onSubmit={handleSubmit}
                          className="kt-form">
                          <FormControl fullWidth size="small" style={{ marginTop: '15px' }}  >

                            <TextField
                              id="txtAfterPassword"
                              label={intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.PASSWORD" }) + " " + intl.formatMessage({ id: "ACREDITATION.PREVIOUS" })}
                              name="afterPassword"
                              variant="outlined"
                              type={showAfterPasswords ? 'text' : 'password'}
                              className="kt-width-full"
                              value={values.afterPassword}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={Boolean(touched.afterPassword && errors.afterPassword)}
                              helperText={touched.afterPassword && errors.afterPassword}
                              InputProps={{ // <-- This is where the toggle button is added.
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      aria-label="toggle password visibility"
                                      onClick={handleClickShowAfterPassword}
                                      onMouseDown={handleMouseDownAfterPassword}
                                      style={{ marginLeft: '-15px' }}
                                    >
                                      {showAfterPasswords ? <Visibility style={{ position: 'absolute', marginLeft: '20px' }} /> : <VisibilityOff style={{ position: 'absolute', marginLeft: '20px' }} />}
                                    </IconButton>
                                  </InputAdornment>
                                )
                              }}

                            />

                          </FormControl>
                          <FormControl fullWidth size="small" style={{ marginTop: '15px' }}  >

                            <TextField
                              id="txtPassword"
                              label={intl.formatMessage({ id: "ACREDITATION.NEW" }) + " " + intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.PASSWORD" })}
                              name="password"
                              variant="outlined"
                              type={showpasswords ? 'text' : 'password'}
                              className="kt-width-full"
                              value={values.password}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={Boolean(touched.password && errors.password) || Msgerror.length > 0 ? true : false}
                              helperText={touched.password && errors.password}
                              InputProps={{ // <-- This is where the toggle button is added.
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      aria-label="toggle password visibility"
                                      onClick={handleClickShowPassword}
                                      onMouseDown={handleMouseDownPassword}
                                      style={{ marginLeft: '-15px' }}
                                    >
                                      {showpasswords ? <Visibility style={{ position: 'absolute', marginLeft: '20px' }} /> : <VisibilityOff style={{ position: 'absolute', marginLeft: '20px' }} />}
                                    </IconButton>
                                  </InputAdornment>
                                )
                              }}
                            />
                            <FormHelperText className='alert-text' > {Msgerror} </FormHelperText>

                          </FormControl>

                          <FormControl fullWidth size="small" style={{ marginTop: '15px' }} >
                            <TextField
                              id="txtChangePassword"
                              label={intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.CONFIRMPASSWORD" })}
                              name="changePassword"
                              variant="outlined"
                              type={showChangePasswords ? 'text' : 'password'}
                              className="kt-width-full"
                              value={values.changePassword}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={Boolean(touched.changePassword && errors.changePassword) || Msgerror.length > 0 ? true : false}
                              helperText={touched.changePassword && errors.changePassword}
                              InputProps={{ // <-- This is where the toggle button is added.
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      aria-label="toggle password visibility"
                                      onClick={handleClickShowChangePassword}
                                      onMouseDown={handleMouseDownChangePassword}
                                      style={{ marginLeft: '-15px' }}
                                    >
                                      {showChangePasswords ? <Visibility style={{ position: 'absolute', marginLeft: '20px' }} /> : <VisibilityOff style={{ position: 'absolute', marginLeft: '20px' }} />}
                                    </IconButton>
                                  </InputAdornment>
                                )
                              }}
                            />
                            <FormHelperText className='alert-text' > {Msgerror} </FormHelperText>
                          </FormControl>

                          <div className="kt-login__actions">

                            {isNotEmpty(MessageServer) && (
                              <div role="alert" className="alert alert-danger">
                                <div className="alert-text">{MessageServer}</div>
                                <br />
                              </div>
                            )}
                            
                            <br />
                            <Button
                              id="btnGuardar"
                              type="button"
                              className="classCerrarSesion"
                              disabled={!isValid || (Object.keys(touched).length === 0 && touched.constructor === Object)}
                              onClick={grabar}
                            >
                              {intl.formatMessage({ id: "AUTH.LOGIN.BUTTON.CHANGEPASSWORD" })}
                            </Button>
                          </div>
                        </form>
                      </>
                    )}
                  </Formik>
                </div>
              </div>
            </div>

          </div>
          <div className="col-md-4"></div>
        </div>
       

      </PortletBody>
    </React.Fragment>
  );
};



UsuarioLoginEditPage.prototype = {
  showButtons: PropTypes.bool

}
UsuarioLoginEditPage.defaultProps = {
  showButtons: true
}


export default injectIntl(UsuarioLoginEditPage);
