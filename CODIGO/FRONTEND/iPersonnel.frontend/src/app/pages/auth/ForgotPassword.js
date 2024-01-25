import React, { useState, useEffect } from 'react';
import { FormattedMessage, injectIntl } from "react-intl";
import { Button } from "devextreme-react";

import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import { TextField } from "@material-ui/core";
import InputLabel from '@material-ui/core/InputLabel';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import InputAdornment from '@material-ui/core/InputAdornment';
import OutlinedInput from '@material-ui/core/OutlinedInput';//add


import { Formik } from "formik";
import * as Yup from "yup";
import { isNotEmpty } from "../../../_metronic";
import WithLoandingPanel from '../../partials/content/withLoandingPanel';
import { handleErrorMessages } from '../../store/ducks/notify-messages';
import EyeShowIcon from '../../partials/content/Acreditacion/Svg/DashboardMenu/EyeShow';
import EyeHideIcon from '../../partials/content/Acreditacion/Svg/DashboardMenu/EyeHide';
import Constants from '../../store/config/Constants';


const ForgotPassword = ({
  intl,
  generarCodigoVerificacion,
  guardarNuevoPassword,
  showFromForgotPassword,
  setShowFromForgotPassword,
  MessageServer = '',
  setMessageServer = '',
  datosValidacion,
  // :::::::::: AGREGAR ::::::::::::::
  setIsLoginUserPassword,
}) => {
  const defaultLongitudMin = 6;
  const [Msgerror, setMsgerror] = useState("");
  const [showpasswords, setShowpasswords] = useState(false);//Password
  const [showChangePasswords, setShowChangePasswords] = useState(false);//Password
  const [forgotPass, setForgotPass] = useState({ Identificador: "", CodigoVerificacion: "", Usuario: "" });
  const [aplicarValidaciones, setAplicarValidaciones] = useState({ digitos: false, letras: false, mayusculas: false, minusculas: false, simbolos: false });
  const [longitudMinima, setLongitudMinima] = useState(defaultLongitudMin);

  //+++Eventos para ocultar o mostrar contrasenia +++++
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


  function regresarCodigoIngresado() {
    //++++++++++++++++++++<Regresar al codigo>++++++++++++++ 
    setMsgerror("");
    setMessageServer("");
    setShowFromForgotPassword("VIEW-2");
    //document.getElementById("txtCodigo").value = forgotPass.CodigoVerificacion;
  }

  const irSiguientePagina = () => {
    //console.log("2-eventos");
    //setShowFromForgotPassword("VIEW-3");
    setMessageServer("");
    setMsgerror("");
    var codigo = document.getElementById("txtCodigo").value;
    if (isNotEmpty(codigo)) {
      setShowFromForgotPassword("VIEW-3");
      setForgotPass({ ...forgotPass, CodigoVerificacion: codigo });
    }
    else {
      if (codigo === '') {
        setMsgerror(intl.formatMessage({ id: "AUTH.LOGIN.TITLE.ENTER.CODE" }));
      }
    }

  }

  function guardarClave() {
    //++++++++++++++++++++<Almacenar contrasenia>++++++++++++++ 
    //console.log("GuardarClave");
    setMessageServer("");
    setMsgerror("");
    const { Identificador, CodigoVerificacion, Usuario } = forgotPass;
    var password = document.getElementById("txtPassword").value;
    var changePassword = document.getElementById("txtChangePassword").value;

    if (isNotEmpty(password) && isNotEmpty(changePassword)) {
      //Confirmar regla validacion
      if (!validarCajaPasswordByText(password)) return;
      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(Constants.CAPTCHA_SECRETKEYSITE, { action: 'submit' }).then(token => {
          //Obtener token Id desde Recaptcha de google.
          guardarNuevoPassword(Identificador, Usuario, CodigoVerificacion, changePassword, token);
        });
      });
    }
    else {
      if (isNotEmpty(password)) {
        setMsgerror(intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.ENTERPASSWORD" }));
        handleErrorMessages("error", intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.ENTERPASSWORD" }))
      }
      if (isNotEmpty(changePassword)) {
        setMsgerror(intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.ENTERPASSWORD" }));
        handleErrorMessages("error", intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.ENTERPASSWORD" }))
      }
    }

  }
  function reenviarCodigo() {
    //++++++++++++++++++++<Reenviar codigo>++++++++++++++
    setMessageServer("");
    setMsgerror("");
    if (isNotEmpty(forgotPass.Identificador) && isNotEmpty(forgotPass.Usuario)) {
      //JDL->ADD-15-08-2023-> Obtener token ID
      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(Constants.CAPTCHA_SECRETKEYSITE, { action: 'submit' }).then(token => {
          //Obtener token Id desde Recaptcha de google.
          generarCodigoVerificacion(forgotPass.Identificador, forgotPass.Usuario, token);
        });
        //generarCodigoVerificacion(forgotPass.Identificador, forgotPass.Usuario);
      });

    }

  }

  function enviarCodigo() {
    //++++++++++++++++++++<Generar codigo>++++++++++++++
    //console.log("Step1>enviarCodigo....");
    setMessageServer("");
    setMsgerror("");

    var usuario = document.getElementById("txtUsuario").value;
    var email = document.getElementById("txtEmail").value;
    if (isNotEmpty(email) && isNotEmpty(usuario)) {
      setForgotPass({ ...forgotPass, Identificador: email, Usuario: usuario });
      //JDL->ADD-15-08-2023-> Obtener token ID
      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(Constants.CAPTCHA_SECRETKEYSITE, { action: 'submit' }).then(token => {
          //Obtener token Id desde Recaptcha de google.
          generarCodigoVerificacion(email, usuario, token);
        });

      });

      //setShowFromForgotPassword("VIEW-2");//TEMPORAL
    }
    else {
      if (email === '') {
        setMsgerror(intl.formatMessage({ id: "AUTH.FORGOT.ENTER.EMAIL" }));
        handleErrorMessages("error", intl.formatMessage({ id: "AUTH.FORGOT.ENTER.EMAIL" }))
      }
    }
  }

  function IniciarSession_onClick() {
    //++++++++++++++++++++< IR a Iniciar Session>++++++++++++++ 
    // values.isForgotPassword = true;
    setIsLoginUserPassword(true);
    setMessageServer("");
    setMsgerror("");
    setShowFromForgotPassword("VIEW-1");
  }

  const SchemaStep1 = Yup.object().shape({
    usuario: Yup.string().required(intl.formatMessage({ id: "AUTH.VALIDATION.REQUIRED_FIELD" })),
    email: Yup.string().required(intl.formatMessage({ id: "AUTH.VALIDATION.REQUIRED_FIELD" })).email(intl.formatMessage({ id: "MESSAGES.INVALID.EMAIL" })),
  });

  const SchemaStep2 = Yup.object().shape({
    codigoVerificacion: Yup.string().required(intl.formatMessage({ id: "AUTH.VALIDATION.REQUIRED_FIELD" })).matches(/(?=.*[0-9])/, intl.formatMessage({ id: "SECURITY.SETTING.CODE.NUMERIC" })).min(6, intl.formatMessage({ id: "SECURITY.SETTING.CODE.LENGTH" })),
  });

  const SchemaStep3 = Yup.object().shape({
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
      let { tipo } = datosValidacion;
      switch (tipo) {
        case 'B': setMsgerror(intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.BASICLEVEL" })); handleErrorMessages("error", intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.BASICLEVEL" })); break;
        case 'I': setMsgerror(intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.INTERMEDIATELEVEL" })); handleErrorMessages("error", intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.INTERMEDIATELEVEL" })); break;
        case 'A': setMsgerror(intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.ADVANCEDLEVEL" })); handleErrorMessages("error", intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.ADVANCEDLEVEL" })); break;
      }
    }
    return cumpleValidacion;
  }

  useEffect(() => {
    //console.log("login-changePassword.datosValidacion", datosValidacion);
    let { tipo, longitud } = datosValidacion;
    setLongitudMinima(longitud);
    //Modificando los bloques a validar de acuerdo al tipo: 
    switch (tipo) {
      case 'B': setAplicarValidaciones({ digitos: false, letras: false, mayusculas: false, minusculas: false, simbolos: false }); break;
      case 'I': setAplicarValidaciones({ digitos: true, letras: true, mayusculas: false, minusculas: false, simbolos: false }); break;
      case 'A': setAplicarValidaciones({ digitos: true, letras: true, mayusculas: true, minusculas: true, simbolos: true }); break;
    }
  }, [datosValidacion]);

  return (
    <div className="makeStyles-root-2 forgotPasswordForm">
      {/* <div className="kt-login__body"> */}
      {/* +++++++++++++++++++>[1]>FORMULARIO INGRESAR CORREO >++++++++++++++++++++++++++++++++ */}
      {(showFromForgotPassword === "VIEW-1") && (
        <>
          <Formik
            initialValues={{
              email: "",
              usuario: ""
            }}
            validationSchema={SchemaStep1}
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
              //isSubmitting
              isValid
            }) => (
              <>
                <form
                  onSubmit={handleSubmit}
                  className="kt-form clsLoginFormUsuario">

                  <div className="clsLoginForgotPassword">
                    <h5> <FormattedMessage id="AUTH.FORGOT.TITLE" /></h5>
                    <p> <FormattedMessage id="AUTH.FORGOT.DESC" /> </p>
                  </div>

                  <FormControl fullWidth style={{ display: "block", width: "fit-content" }}>

                    <InputLabel shrink htmlFor="txtEmail" className="inputLabel">
                      <FormattedMessage id="AUTH.INPUT.USERNAME" />
                    </InputLabel>

                    <TextField
                      id="txtUsuario"
                      type="text"
                      label={intl.formatMessage({ id: "AUTH.INPUT.USERNAME" })}
                      //margin="normal"
                      className="kt-width-full"
                      //fullWidth={true}
                      name="usuario"
                      variant="outlined"

                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.usuario}
                      helperText={touched.usuario && errors.usuario}
                      error={Boolean(touched.usuario && errors.usuario) || Msgerror.length > 0 ? true : false}
                    //error={error}
                    />

                    <FormHelperText className='alert-text' > {Msgerror} </FormHelperText>
                    <br />
                    <InputLabel shrink htmlFor="txtEmail" className="inputLabel">
                      <FormattedMessage id="ADMINISTRATION.PERSON.MAIL" />
                    </InputLabel>
                    <TextField
                      id="txtEmail"
                      type="text"
                      placeholder={intl.formatMessage({ id: "ADMINISTRATION.PERSON.MAIL" })}
                      className="kt-width-full"
                      name="email"
                      variant="outlined"

                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.email}
                      helperText={touched.email && errors.email}
                      error={Boolean(touched.email && errors.email) || Msgerror.length > 0 ? true : false}
                    />

                    <FormHelperText className='alert-text' > {Msgerror} </FormHelperText>

                  </FormControl>

                  <div className="kt-login__actions_enviar">
                    <a id="olvido-contrasenia-ancla"
                      onClick={IniciarSession_onClick}>
                      <FormattedMessage id="LOG.IN" />
                    </a>


                    <Button
                      id="btnEnviarCodigo"
                      type="button"
                      className="classCerrarSesionForgot"
                      disabled={!isValid || (Object.keys(touched).length === 0 && touched.constructor === Object)}
                      onClick={enviarCodigo}>
                      <FormattedMessage id="AUTH.LOGIN.BUTTON.SEND" />
                    </Button>
                  </div>

                </form>
              </>
            )}
          </Formik>

        </>)}
      {/* +++++++++++++++++++>[2]>FORMULARIO INGRESAR CODIGO VERIFICACION >++++++++++++++++++++++++++++++++ */}
      {(showFromForgotPassword === "VIEW-2") && (
        <>
          <div className="kt-login__title">
            <article>
              <h5> <FormattedMessage id="AUTH.LOGIN.TITLE.ENTER.CODE" /></h5>
              <p> <FormattedMessage id="AUTH.LOGIN.TITLE.AUTHENTICATION.EMAIL" /> </p>
            </article>
          </div>
          <Formik
            initialValues={{
              codigoVerificacion: ""
            }}
            validationSchema={SchemaStep2}
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
              //isSubmitting
              isValid
            }) => (
              <>
                <form
                  onSubmit={handleSubmit}
                  className="kt-form clsLoginFormUsuario">

                  <FormControl fullWidth style={{ display: "block", width: "fit-content" }}>

                    {/* <InputLabel shrink htmlFor="txtEmail" className="inputLabel">
                      <FormattedMessage id="AUTH.LOGIN.TITLE.ENTER.CODE" />
                    </InputLabel> */}

                    <TextField
                      id="txtCodigo"
                      type="text"
                      label={intl.formatMessage({ id: "COMMON.CODE" })}
                      //margin="normal"
                      className="kt-width-full"
                      //fullWidth={true}
                      name="codigoVerificacion"
                      variant="outlined"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.codigoVerificacion}
                      helperText={touched.codigoVerificacion && errors.codigoVerificacion}
                      error={Boolean(touched.codigoVerificacion && errors.codigoVerificacion) || Msgerror.length > 0 ? true : false}
                    />

                  </FormControl>

                  <div className="kt-login__actions" style={{ display: "inline-grid", marginRight: "6rem" }}>

                    <div className="clsParrafoColorLoginCode">
                      <p> <FormattedMessage id="AUTH.LOGIN.TITLE.CODE.QUESTION" /> </p>
                    </div>

                    <a onClick={reenviarCodigo} className="clsLinkColorLoginCode">
                      <FormattedMessage id="ACTION.RESEND" />
                    </a>

                    <Button
                      id="btnSiguiente"
                      type="button"
                      style={{ marginLeft: "2rem" }}
                      className="classCerrarSesionForgot"
                      disabled={!isValid || (Object.keys(touched).length === 0 && touched.constructor === Object)}
                      onClick={irSiguientePagina}
                    >
                      <FormattedMessage id="COMMON.NEXT" />
                    </Button>
                  </div>

                </form>
              </>
            )}
          </Formik>

        </>)}
      {/* +++++++++++++++++++>[3]>FORMULARIO CAMBIO DE CONTRASENIA >++++++++++++++++++++++++++++++++ */}
      {(showFromForgotPassword === "VIEW-3") && (
        <>
          <div className="kt-login__title">
            <article>
              <h5> <FormattedMessage id="SECURITY.SETTING.LOGING.USERLOGIN.ENTERNEWPASSPWORD" /></h5>
              <br />
              {/* <p> <FormattedMessage id="AUTH.LOGIN.TITLE.AUTHENTICATION" /> </p> */}
            </article>
          </div>
          <Formik
            initialValues={{
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
                  className="kt-form clsLoginFormUsuario">
                  <FormControl fullWidth size="small">

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
                      //error={error}
                      // margin="normal"
                      InputProps={{ // <-- This is where the toggle button is added.
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                            // style={{ marginLeft: '-15px' }}
                            >
                              {showpasswords ? <EyeShowIcon stroke="#B5B5B5" /> : <EyeHideIcon stroke="#B5B5B5" />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    //labelWidth={120}
                    />
                    {/* <FormHelperText className='alert-text' style={{color: 'white'}}> {Msgerror} </FormHelperText> */}

                  </FormControl>

                  <FormControl size="small" style={{ marginTop: '15px', width: "fit-content", display: "block" }} >
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
                      //error={error}
                      // margin="normal"
                      InputProps={{ // <-- This is where the toggle button is added.
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowChangePassword}
                              onMouseDown={handleMouseDownChangePassword}
                              style={{ marginLeft: '-15px' }}
                            >
                              {showChangePasswords ? <EyeShowIcon stroke="#B5B5B5" /> : <EyeHideIcon stroke="#B5B5B5" />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    //labelWidth={150}
                    />
                    {/* <FormHelperText className='alert-text' style={{color: 'white'}}> {Msgerror} </FormHelperText> */}
                  </FormControl>

                  <div className="kt-login__actions">
                    <a id="olvido-contrasenia-ancla"
                      style={{ fontWeight: 'bold', color: '#002d6d', margin: '19px 12px' }}
                      onClick={regresarCodigoIngresado}>
                      <FormattedMessage id="COMMON.CODE" />
                    </a>

                    {/* {isNotEmpty(MessageServer) && (
                        <div role="alert" className="alert alert-danger">
                          <div className="alert-text">{MessageServer}</div>
                        </div>
                      )} */}
                    <Button
                      id="btnGuardar"
                      type="button"
                      className="classCerrarSesion"
                      //disabled={!isSubmitting}
                      disabled={!isValid || (Object.keys(touched).length === 0 && touched.constructor === Object)}
                      onClick={guardarClave}
                    >
                      <FormattedMessage id="ACTION.RECORD" />
                    </Button>
                  </div>
                </form>
              </>
            )}
          </Formik>

        </>)}
    </div>
    // </div>
  );
};

export default WithLoandingPanel(ForgotPassword);
