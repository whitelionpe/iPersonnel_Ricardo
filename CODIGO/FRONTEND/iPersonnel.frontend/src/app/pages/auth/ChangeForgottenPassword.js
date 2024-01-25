import React, { useState, useEffect, Fragment } from "react";

import { FormattedMessage, injectIntl } from "react-intl";
// import { TextField } from "@material-ui/core";
// import clsx from "clsx";
// import { listarTipoNivel } from '../../../_metronic/utils/utils';
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import IconButton from "@material-ui/core/IconButton";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import InputAdornment from "@material-ui/core/InputAdornment";
import Input from "@material-ui/core/Input";
import FormHelperText from "@material-ui/core/FormHelperText";
import { listarTipoNivel } from "../../../_metronic/utils/utils";
// import { requestPassword } from "../../crud/auth.crud";
// import { Formik } from "formik";
import { Link } from "react-router-dom";
//import { values } from 'lodash';

import {
  restablecerPassword,
  confirmarCambioClave
} from "../../api/seguridad/usuarioLogin.api";
//import { obtenercambioclave } from '../../api/seguridad/usuario.api';
import {
  handleErrorMessages,
  handleSuccessMessages,
  handleInfoMessages
} from "../../../../src/app/store/ducks/notify-messages";
//import { isNotEmpty } from "../../../_metronic";

import { Alert, AlertTitle } from "@material-ui/lab";
import Constants from "../../store/config/Constants";

const ChangeForgottenPassword = ({
  // handleSubmit,
  intl,
  // setSubmitting,
  // setStatus,
  // mensajeErrorrecuperarPassword = '',
  params
}) => {
  //const { IdCliente, IdUsuario } = params;
  const [loading, setLoading] = useState(false);
  //const [showpasswords, setShowpasswords] = useState(false);
  const [showpasswordsConfirm, setShowpasswordsConfirm] = useState(false);
  //const [error, setError] = useState(false);
  //const [Msgerror, setMsgerror] = useState("");

  //>........Asignar validación de usuario para el cambio de contraseña.
  const defaultLongitudMin = 6;
  const defaultLongitudMax = 100;
  const mensajeErrorPassword2 = "El valor de las contraseñas debe ser iguales.";
  const [passwords, setPasswords] = useState({ password: "", password2: "" });
  const [showpasswords, setShowpasswords] = useState({
    password: false,
    password2: false
  });
  const [mostrarError, setMostrarError] = useState({
    error1: false,
    error2: false
  });
  const [cumpleSeguridad, setCumpleSeguridad] = useState(false);
  const [passwordIguales, setPasswordIguales] = useState(false);

  const [datosValidacion, setDatosValidacion] = useState({
    longitud: 6,
    tipo: "A",
    primeraClaveCambiada: "S"
  });

  const [mensajes, setMensajes] = useState({
    mensajePassword: "",
    mensajePassword2: ""
  });
  const [tipoValidacion, setTipoValidacion] = useState({
    Valor: "",
    Descripcion: "",
    Mensaje: ""
  });
  const [aplicarValidaciones, setAplicarValidaciones] = useState({
    digitos: false,
    letras: false,
    mayusculas: false,
    minusculas: false,
    simbolos: false
  });
  const [longitudMinima, setLongitudMinima] = useState(defaultLongitudMin);

  // const [nivel, setNivel] = useState();
  // const [longitudClave, setLongitudClave] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showComponent, setShowComponent] = useState(false);

  const handleClickShowPassword = num => {
    setShowpasswords(!showpasswords);
  };

  const handleMouseDownPassword = event => {
    event.preventDefault();
  };

  const handleClickShowPasswordConfirm = num => {
    setShowpasswordsConfirm(!showpasswordsConfirm);
  };

  const handleMouseDownPasswordConfirm = event => {
    event.preventDefault();
  };

  const GuardarCambios = e => {
    var password = document.getElementById("txtPassword").value;
    var confirmarPassword = document.getElementById("txtConfirmPassword").value;
    // console.log("GuardarCambios", password,)
    // console.log("GuardarCambios-confirmarPassword", confirmarPassword)

    validarCajaPasswordByText(password);
    validarCajaPassword2ByText(confirmarPassword);
    setTimeout(() => {
      if (cumpleSeguridad && passwordIguales) {
        RestablecerPassword(password);
      }
    }, 1000);
  };

  // if (isNotEmpty(password) && isNotEmpty(confirmarPassword)) {
  //   if (password === confirmarPassword) {
  //  RestablecerPassword(password);
  // } else {
  //   setError(true);
  //   setMsgerror('CONTRASEÑAS INGRESADAS NO COINCIDEN')
  //   // handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "SYSTEM.REPOSITORY.CONFIRMPASSWORDMATCHPASSWORD" }));
  // }

  // }
  // else {
  //   setError(true);
  //   setMsgerror("INGRESE LAS CONTRASEÑAS")
  // }
  //}

  async function RestablecerPassword(password) {
    setLoading(true);
    let Confirm = encodeURIComponent(params.confirm);
    //let IdUsuario = encodeURIComponent(params.User);
    let data = {
      //IdUsuario,
      Confirm,
      NuevaClave: password,
      IdTipoAplicacion: Constants.ID_TIPO_APLICACION
    };

    await restablecerPassword(data)
      .then(response => {
        handleSuccessMessages("Éxito!", "Se actualizó con éxito!");
        setTimeout(() => {
          btnCancelar_click();
        }, 2000);
      })
      .catch(err => {
        handleErrorMessages(
          intl.formatMessage({ id: "MESSAGES.ERROR" }),
          "Ocurrió un error al procesar la solicitud."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }

  /******************************-validacion campo de contraseña*********************************************** */
  const handleChange = e => {
    //console.log("handleChange", e.target.name, e.target.value);
    if (e.target.name === "password") {
      setPasswords({ ...passwords, [e.target.name]: e.target.value });
    } else {
      setPasswords({ ...passwords, [e.target.name]: e.target.value });
    }
  };

  const handleBlur = e => {
    if (e.target.name === "password") {
      validarCajaPassword(e);
    } else {
      validarCajaPassword2(e);
    }
  };

  const validarCajaPassword = e => {
    validarCajaPasswordByText(e.target.value);
  };

  function btnCancelar_click() {
    window.location = "/auth/login";
  }

  const validarCajaPasswordByText = valor => {
    //console.log("validarCajaPasswordByText", valor)
    let cumpleValidacion = true;
    let cantidad = valor.trim().length;

    if (valor === "") {
      setCumpleSeguridad(false);
      setMensajes({
        ...mensajes,
        mensajePassword: `La longitud minima es de ${longitudMinima} caracteres`
      });
      return;
    }

    if (cantidad < longitudMinima || cantidad >= defaultLongitudMax) {
      setCumpleSeguridad(false);
      setMensajes({
        ...mensajes,
        mensajePassword: `La longitud minima es de ${longitudMinima} caracteres`
      });
      return;
    }
    //console.log("aplicarValidaciones", aplicarValidaciones);
    if (aplicarValidaciones.digitos) {
      cumpleValidacion = cumpleValidacion && /[0-9]/.test(valor);
    }

    if (aplicarValidaciones.letras) {
      cumpleValidacion =
        cumpleValidacion && (/[A-Z]/.test(valor) || /[a-z]/.test(valor));
    }

    if (aplicarValidaciones.mayusculas) {
      cumpleValidacion = cumpleValidacion && /[A-Z]/.test(valor);
    }

    if (aplicarValidaciones.minusculas) {
      cumpleValidacion = cumpleValidacion && /[a-z]/.test(valor);
    }

    if (aplicarValidaciones.simbolos) {
      cumpleValidacion =
        cumpleValidacion &&
        (/(.*[!,@,#,$,%,^,&,*,?,_,-,~])/.test(valor) ||
          !/^[A-Za-z0-9 ]+$/.test(valor));
    }
    //console.log("cumpleValidacion", cumpleValidacion);
    setCumpleSeguridad(cumpleValidacion);
    setMostrarError({ ...mostrarError, error1: !cumpleValidacion });
    setMensajes({
      ...mensajes,
      mensajePassword: cumpleValidacion ? "" : tipoValidacion.Mensaje
    });
    //console.log("mensajes", mensajes);
  };

  const validarCajaPassword2 = e => {
    validarCajaPassword2ByText(e.target.value);
  };

  const validarCajaPassword2ByText = value => {
    //console.log("validarCajaPassword2ByText", value);
    let cumpleValidacion = true;

    if (value !== passwords.password) {
      cumpleValidacion = false;
    }
    setPasswordIguales(cumpleValidacion);
    setMostrarError({ ...mostrarError, error2: !cumpleValidacion });
    setMensajes({
      ...mensajes,
      mensajePassword2: cumpleValidacion ? "" : mensajeErrorPassword2
    });
  };

  useEffect(() => {
    validarCambioClave();
    //Nivel avanzado cambio de contraseña.
    let { longitud, tipo } = datosValidacion;
    setLongitudMinima(longitud);
    setAplicarValidaciones({
      digitos: true,
      letras: true,
      mayusculas: true,
      minusculas: true,
      simbolos: true
    });

    //Configurando mensajes:
    let tipoValidacion = listarTipoNivel.filter(x => x.Valor === tipo);
    if (tipoValidacion.length) {
      setTipoValidacion(tipoValidacion[0]);
    }
  }, []);

  const validarCambioClave = async () => {
    //console.log('******** ', params);

    let confirm = encodeURIComponent(params.confirm);
    await confirmarCambioClave({ codigo: confirm })
      .then(resp => {
        setShowForm(true);
        setShowComponent(true);
      })
      .catch(err => {
        setShowForm(false);
        setShowComponent(true);
      });
  };

  return showComponent ? (
    <div className="kt-login__body">
      <div className="kt-login__form">
        {/* <div className="kt-grid__item kt-grid__item--fluid  kt-grid__item--order-tablet-and-mobile-1  kt-login__wrapper">
            <div className="kt-login__body">
              <div className="kt-login__form"> */}
        {/* <div className="kt-login__title">
            <h3>
              <FormattedMessage id="Restablecer Contraseña" />
            </h3>
          </div> */}

        <form //onSubmit={handleSubmit}
          id="FormChangeForgottenPassword"
          noValidate={true}
          autoComplete="off"
          className="kt-form"
        >
          {/* {
              (mensajeErrorCambioPass === '') ? null :
                (<div role="alert" className="alert alert-danger">
                  <div className="alert-text">{mensajeErrorCambioPass}</div>
                </div>)
            } */}
          <br />
          <br />
          <h6 className="kt-login__title">
            <FormattedMessage id="Restablecer Contraseña" />
          </h6>

          {showForm ? (
            <Fragment>
              {/* <div className="form-group"> */}
              <FormControl fullWidth>
                <InputLabel htmlFor="standard-adornment-password">
                  Contraseña
                </InputLabel>
                <Input
                  id="txtPassword"
                  name="password"
                  type={showpasswords ? "text" : "password"}
                  // value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={mostrarError.error1}
                  //margin="normal"
                  className="kt-width-full"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                      >
                        {showpasswords ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                <FormHelperText id="txtPassword-error-text">
                  {mensajes.mensajePassword}
                </FormHelperText>
              </FormControl>
              {/* </div> */}
              <br />
              {/* <div className="form-group"> */}
              <FormControl fullWidth>
                <InputLabel htmlFor="standard-adornment-password">
                  Confirmar Contraseña
                </InputLabel>
                <Input
                  id="txtConfirmPassword"
                  name="password2"
                  type={showpasswordsConfirm ? "text" : "password"}
                  // value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  //error={error}
                  error={mostrarError.error2}
                  //margin="normal"
                  className="kt-width-full"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPasswordConfirm}
                        onMouseDown={handleMouseDownPasswordConfirm}
                      >
                        {showpasswordsConfirm ? (
                          <Visibility />
                        ) : (
                          <VisibilityOff />
                        )}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                <FormHelperText id="txtConfirmPassword-error-text">
                  {" "}
                  {mensajes.mensajePassword2}{" "}
                </FormHelperText>
                {/* <FormHelperText id="changepassword2-error-text">{touched.password && errors.password}</FormHelperText>  */}
              </FormControl>
              {/* </div> */}

              <div
                className="kt-login__actions"
                style={{ display: "inline-flex", marginTop: "20px" }}
              >
                <Link to="/auth" style={{ marginRight: "10px" }}>
                  <button
                    id="btnCancelar"
                    type="button"
                    className="btn btn-secondary btn-elevate kt-login__btn-secondary"
                  >
                    Cancelar
                  </button>
                </Link>

                <button
                  id="cambiarpass-btnguardarCambios"
                  type="button"
                  className="btn btn-primary btn-elevate kt-login__btn-primary"
                  // disabled={isSubmitting}
                  onClick={GuardarCambios}
                >
                  Guardar Cambios
                </button>
              </div>
            </Fragment>
          ) : (
            <div>
              <Alert severity="warning">
                <AlertTitle>{"Link invalido"}</AlertTitle>
                {
                  "La url ingresada no es correcta o su tiempo de validez expiro."
                }
              </Alert>
              <Link to="/auth">
                <div className="kt-login__actions">
                  <button
                    id="btnCancelar"
                    type="button"
                    className="btn btn-primary btn-elevate kt-login__btn-primary"
                  >
                    Volver
                  </button>
                </div>
              </Link>
            </div>
          )}
        </form>
        {/* )}
                </Formik> */}
      </div>
    </div>
  ) : //     </div>
  //   </div>
  // </div >
  null;
};

export default ChangeForgottenPassword;
