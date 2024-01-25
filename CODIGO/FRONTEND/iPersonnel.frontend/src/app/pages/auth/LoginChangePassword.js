import React, { useState, useEffect } from 'react';
import { FormattedMessage, injectIntl } from "react-intl";
import clsx from "clsx";
import { listarTipoNivel } from '../../../_metronic/utils/utils';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormHelperText from '@material-ui/core/FormHelperText';
import { TextField } from "@material-ui/core";

const LoginChangePassword = ({
  // handleSubmit,
  loading,
  loadingButtonStyle,
  intl,
  // handleChange
  longitudClave,
  datosValidacion,
  cambiarPasswordUsuario,
  setSubmitting,
  setStatus,
  mensajeErrorCambioPass = ''
}) => {

  const defaultLongitudMin = 6;
  const defaultLongitudMax = 100;
  const mensajeErrorPassword2 = intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.CONFIRMPASSWORDMATCHPASSWORD" });

  const [passwords, setPasswords] = useState({ password: '', password2: '' });
  const [showpasswords, setShowpasswords] = useState({ password: false, password2: false });
  const [mostrarError, setMostrarError] = useState({ error1: false, error2: false });
  const [cumpleSeguridad, setCumpleSeguridad] = useState(false);
  const [passwordIguales, setPasswordIguales] = useState(false);


  const [mensajes, setMensajes] = useState({
    mensajePassword: '',
    mensajePassword2: ''
  });
  const [tipoValidacion, setTipoValidacion] = useState({ Valor: '', Descripcion: '', Mensaje: '' });
  const [aplicarValidaciones, setAplicarValidaciones] = useState({ digitos: false, letras: false, mayusculas: false, minusculas: false, simbolos: false });
  const [longitudMinima, setLongitudMinima] = useState(defaultLongitudMin);

  useEffect(() => {
    //console.log("login-changePassword.datosValidacion", datosValidacion);
    let { longitud, tipo } = datosValidacion;
    let tipoValidacion = listarTipoNivel.filter(x => x.Valor === tipo);

    if (tipoValidacion.length) {
      setTipoValidacion(tipoValidacion[0]);
      if (longitud !== 0) {
        setLongitudMinima(longitud);
      }
    }
    //Modificando los bloques a validar de acuerdo al tipo: 
    switch (tipo) {
      case 'B': setAplicarValidaciones({ digitos: false, letras: false, mayusculas: false, minusculas: false, simbolos: false }); break;
      case 'I': setAplicarValidaciones({ digitos: true, letras: true, mayusculas: false, minusculas: false, simbolos: false }); break;
      case 'A': setAplicarValidaciones({ digitos: true, letras: true, mayusculas: true, minusculas: true, simbolos: true }); break;
    }
  }, []);

  const handleChange = (e) => {
    //console.log("handleChange", e.target.name, e.target.value);
    if (e.target.name === "password") {
      setPasswords({ ...passwords, [e.target.name]: e.target.value });
    } else {
      setPasswords({ ...passwords, [e.target.name]: e.target.value });
    }
  }

  const handleBlur = (e) => {

    if (e.target.name === 'password') {
      validarCajaPassword(e);
    } else {
      validarCajaPassword2(e);
    }

  }

  const validarCajaPassword = (e) => {

    validarCajaPasswordByText(e.target.value);

  }

  const validarCajaPasswordByText = (valor) => {
    let cumpleValidacion = true;
    let cantidad = valor.trim().length;

    if (valor === '') {
      setCumpleSeguridad(false);
      setMensajes({ ...mensajes, mensajePassword: `La longitud minima es de ${longitudMinima} caracteres` });
      return;
    }

    if (cantidad < longitudMinima || cantidad >= defaultLongitudMax) {
      setCumpleSeguridad(false);
      setMensajes({ ...mensajes, mensajePassword: `La longitud minima es de ${longitudMinima} caracteres` });
      return;
    }

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
    setCumpleSeguridad(cumpleValidacion);
    setMostrarError({ ...mostrarError, error1: !cumpleValidacion });
    setMensajes({ ...mensajes, mensajePassword: (cumpleValidacion) ? '' : tipoValidacion.Mensaje });
  }

  const validarCajaPassword2 = (e) => {
    validarCajaPassword2ByText(e.target.value);
  }

  const validarCajaPassword2ByText = (value) => {

    let cumpleValidacion = true;

    if (value !== passwords.password) {
      cumpleValidacion = false;
    }
    setPasswordIguales(cumpleValidacion);
    setMostrarError({ ...mostrarError, error2: !cumpleValidacion });
    setMensajes({ ...mensajes, mensajePassword2: (cumpleValidacion) ? '' : mensajeErrorPassword2 });
  }

  const cambiarPassword = () => {
    //console.log("cambiarPassword", passwords.password, passwords.password2);
    validarCajaPasswordByText(passwords.password);
    validarCajaPassword2ByText(passwords.password2);
    setTimeout(() => {
      if (cumpleSeguridad && passwordIguales) {
        cambiarPasswordUsuario(passwords.password, setSubmitting, setStatus);
      }
    }, 1000);
  }


  const handleClickShowPassword = (num) => {

    if (num === 1) {
      setShowpasswords({ ...showpasswords, password: !showpasswords.password });
    } else {
      setShowpasswords({ ...showpasswords, password2: !showpasswords.password2 });

    }

  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <form
      noValidate={true}
      autoComplete="off"
      className="kt-form"
    // onSubmit={handleSubmit}
    >

      <div className="kt-grid__item kt-grid__item--fluid  kt-grid__item--order-tablet-and-mobile-1  kt-login__wrapper">
        {/* <div className="kt-login__body"> */}
        <div className="kt-login__form">

          <h5 className="kt-login__title">
            <FormattedMessage id="SECURITY.SETTING.LOGING.USERLOGIN.ENTERNEWPASSPWORD" />
          </h5>

          <FormControl fullWidth size="small" style={{ marginTop: '15px' }} >            
            <TextField
              id="changepassword1"
              name="password"
              label={intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.ENTERPASSWORD" })}
              type={showpasswords.password ? 'text' : 'password'}
              value={passwords[0]}
              variant="outlined"
              onChange={handleChange}
              onBlur={handleBlur}
              error={mostrarError.error1}
              // helperText={mensajes.mensajePassword}
              //margin="normal"
              className="kt-width-full"
              InputProps={{ // <-- This is where the toggle button is added.
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => { handleClickShowPassword(1); }}
                      onMouseDown={handleMouseDownPassword}
                      style={{ marginLeft: '-15px' }}
                    >
                      {showpasswords.password ? <Visibility style={{ position: 'absolute', marginLeft: '20px' }} /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                )
              }}

            />
            <FormHelperText className='alert-text' >{mensajes.mensajePassword}</FormHelperText>
          </FormControl>

          <FormControl fullWidth size="small" style={{ marginTop: '15px' }}  >
           
            <TextField
              id="changepassword2"
              label={intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.CONFIRMPASSWORD" })}
              name="password2"
              type={showpasswords.password2 ? 'text' : 'password'}
              value={passwords[1]}
              onChange={handleChange}
              onBlur={handleBlur}
              variant="outlined"
              //onKeyDown={onKeyDownPassword2}
              required={true}
              error={mostrarError.error2}
              // helperText={mensajes.mensajePassword2}
              //margin="normal"
              className="kt-width-full"
              InputProps={{ // <-- This is where the toggle button is added.
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      //onClick={handleClickShowPassword}
                      onClick={() => { handleClickShowPassword(2) }}
                      style={{ marginLeft: '-15px' }}
                    >
                      {showpasswords.password2 ? <Visibility style={{ position: 'absolute', marginLeft: '20px' }} /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <FormHelperText className='alert-text' >{mensajes.mensajePassword2}</FormHelperText>
          </FormControl>

          <div className="kt-login__actions">
            <br />
            <button
              id="kt_login_change_submit"
              type="button"
              //disabled={isSubmitting}
              className={`btn btn-primary btn-elevate kt-login__btn-primary ${clsx({
                "kt-spinner kt-spinner--right kt-spinner--md kt-spinner--light": loading
              })}`}
              style={loadingButtonStyle}
              onClick={cambiarPassword}
            >
              <FormattedMessage id="AUTH.LOGIN.BUTTON.CHANGEPASSWORD" />
            </button>
            {/*JDL->2023-03-31->Cambio de posicion del mensaje excepción*/}
            <br />
            {
              (mensajeErrorCambioPass === '') ? null :
                (<div role="alert" className="alert alert-danger">
                  <div className="alert-text">{mensajeErrorCambioPass.toUpperCase()}</div>
                </div>)
            }
          </div>
        </div>
      </div>
    </form>
  );
};

export default LoginChangePassword;
