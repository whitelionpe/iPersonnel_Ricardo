import React, { useState, useEffect, useRef } from 'react';
import { FormattedMessage } from "react-intl";
import clsx from "clsx";

import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormHelperText from '@material-ui/core/FormHelperText';
import { makeStyles } from '@material-ui/core/styles';
import { MensajeValidacionLogin } from "../../../_metronic/utils/utils";
import { COLORS } from "../../values/colors"
import OutlinedInput from '@material-ui/core/OutlinedInput';
import ClearIcon from "@material-ui/icons/Clear";
import EyeShowIcon from '../../partials/content/Acreditacion/Svg/DashboardMenu/EyeShow';
import EyeHideIcon from '../../partials/content/Acreditacion/Svg/DashboardMenu/EyeHide';
import { toast } from '../../store/ducks/notify-messagesV01';
import { AzureADConfiguration } from '../../store/config/AzureADConfiguration';
import { PublicClientApplication } from '@azure/msal-browser'


const useStyles = makeStyles((theme) => ({
  fondoImagen: {
    backgroundImage: `url(new_logos/2personnel_bg.jpg)`,
    backgroundSize: "cover",
  },
  root: {
    '& .MuiTextField-root': {
      margin: 'normal',
    },
    '& .MuiSvgIcon-root.MuiSelect-icon': {
      fill: 'white',
      fontSize: '40px',
      position: 'inherit',
      right: '15px'
    }
  },
}));


const LoginUserPassword = (
  { handleSubmit,
    handleBlur,
    values,
    setValues,
    touched,
    errors,
    isSubmitting,
    loading,
    loadingButtonStyle,
    status,
    intl,
    handleChange,
    setIsForgotPassword,
    minutos,
    loginByAzureAd
  }
) => {
  const splashScreen = document.getElementById("splash-screen");
  const [mensajeError, setMensajeError] = useState("AUTH.LOGIN.MESSAGE.BLANK");
  const [showpasswords, setShowpasswords] = useState(false);//Password


  const txtFocusUsuario = useRef(null);
  const txtFocusPassword = useRef(null);
  const btnFocusLogin = useRef(null);
  const classes = useStyles();

  const msalInstance = new PublicClientApplication({
    auth: {
      clientId: AzureADConfiguration.appId,
      authority: AzureADConfiguration.authority,
      redirectUri: AzureADConfiguration.redirectUri,
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: true
    }
  });

  const [state, setState] = useState({
    error: null,
    isAuthenticated: false,
    user: {}
  });

  //=========== TABs : 32 ==================
  const onKeyDownUser = (e) => {
    if (e.key === "Tab" || e.key === " " || e.keyCode === 9) {
      e.preventDefault();
      txtFocusPassword.current.focus()
    }
  };

  const onKeyDownPass = (e) => {
    if (e.key === "Tab" || e.key === " " || e.keyCode === 9) {
      e.preventDefault();
      let btnIngresar_ = document.getElementById("kt_login_signin_submit");
      btnIngresar_.classList.add('classCerrarSesionBorder');
      btnIngresar_.focus()

    }
  };

  const onKeyDownLogin = (e) => {
    if (e.key === "Tab" || e.key === " " || e.keyCode === 9) {
      e.preventDefault();
      let btnIngresar_ = document.getElementById("kt_login_signin_submit");
      btnIngresar_.classList.remove('classCerrarSesionBorder');
      txtFocusUsuario.current.focus()

    }
  };

  const handleClickShowPassword = (num) => {
    setShowpasswords(!showpasswords);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  function RecuperarContrasena_onClick() {
    // values.isForgotPassword = true;
    setIsForgotPassword(true);
  }

  const [value, setValue] = useState('')
  const handleClear = () => {
    setValue('')
  }
  const handleSearch = (event) => {
    setValue(event.target.value)
    Object.assign(values, { username: event.target.value });

  }
  // ==========================================

  const loginMicrosoft = async () => {
    try {
      //login via popup
      var result = await msalInstance.loginPopup({
        scopes: AzureADConfiguration.scopes,
        prompt: "login"//"select:account"
      });
      splashScreen.classList.remove("hidden");
      setState({ isAuthenticated: true });
      //==================================================
      //Se realiza envio al Web API:
      let { accessToken } = result;
      loginByAzureAd({ accessToken });

    }
    catch (err) {
      console.log("*loginMicrosoft|ERROR: ", err);
      splashScreen.classList.add("hidden");
      setState({
        isAuthenticated: false,
        user: {},
        error: err
      });
    }
  }

  useEffect(() => {

    //-> 2 ESTA LINEA PINTA EL PRIMER INGRESO EN BACKGROUD EN INICIO
    document.body.classList.add(classes.fondoImagen)

    if (status !== undefined && status !== null) {
      //console.log("MensajeValidacionLogin",MensajeValidacionLogin);
      let itemMensaje = MensajeValidacionLogin.filter(x => x.Id === status)

      let descripcion = intl.formatMessage({ id: itemMensaje[0].Descripcion });

      if (status === '09' || status === '04') {
        descripcion = descripcion.replace('{0}', minutos);

      }

      toast(
        "error",
        descripcion
      )
    } else {
      setMensajeError("AUTH.LOGIN.MESSAGE.BLANK");
    }
  }, [status, onKeyDownLogin]);



  return (
    <>
      <form
        noValidate={true}
        autoComplete="off"
        onSubmit={handleSubmit}
        className="makeStyles-root-2 clsLoginFormUsuario"
      >

        <FormControl variant="standard" className="clsUsuariodInput">
          <InputLabel shrink htmlFor="username-input" className="inputLabel">
            <FormattedMessage id="AUTH.INPUT.USERNAME" />
          </InputLabel>
          <OutlinedInput
            id="username-input"
            type="text"
            className="kt-width-full"
            name="username"
            onBlur={handleBlur}
            placeholder={intl.formatMessage({ id: "AUTH.INPUT.ACTION.USER" })}
            value={value}
            onChange={handleSearch}
            onKeyDown={onKeyDownUser}
            inputRef={txtFocusUsuario}
            helperText={touched.username && errors.username}
            error={Boolean(touched.username && errors.username)}
            variant="outlined"
            size="small"
            endAdornment={
              value ? (
                <IconButton
                  size="small"
                  onClick={handleClear}
                >
                  <ClearIcon />
                </IconButton>
              ) : undefined
            }
          />
          <FormHelperText style={{ color: 'white', fontSize: '12px', display: "contents" }}>{touched.username && errors.username}</FormHelperText>
        </FormControl>

        <FormControl variant="standard" className="clsPasswordInput" style={{ marginTop: "1rem" }}>
          <InputLabel shrink htmlFor="password-input" className="inputLabel">
            <FormattedMessage id="AUTH.LOGIN.PASSWORD" />
          </InputLabel>
          <OutlinedInput
            id="password-input"
            type={showpasswords ? 'text' : 'password'}
            className="kt-width-full"
            name="password"
            placeholder={intl.formatMessage({ id: "AUTH.INPUT.ACTION.PASSWORD" })}
            value={values.password}
            onChange={handleChange}
            onKeyDown={onKeyDownPass}
            inputRef={txtFocusPassword}
            onBlur={handleBlur}
            error={Boolean(touched.password && errors.password)}

            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge='end'
                  color={COLORS.white}
                >
                  {showpasswords ? <EyeShowIcon stroke="#B5B5B5" /> : <EyeHideIcon stroke="#B5B5B5" />}
                </IconButton>
              </InputAdornment>
            }
          />
          <FormHelperText style={{ color: 'white', fontSize: '12px', display: "contents" }}>{touched.password && errors.password}</FormHelperText>
        </FormControl>

        <div className="kt-login__actions">
          <a id="olvido-contrasenia-ancla"
            style={{ fontWeight: 'bold', color: COLORS.secure, margin: '19px 12px' }}
            onClick={() => {
              RecuperarContrasena_onClick();
            }}> <FormattedMessage id="AUTH.FORGOT.TITLE" />
          </a>

          <button
            id="kt_login_signin_submit"
            type="submit"

            onKeyDown={onKeyDownLogin}
            ref={btnFocusLogin}
            //disabled={isSubmitting}
            className={`classEfectoYellow ${clsx({
              "kt-spinner kt-spinner--right kt-spinner--md kt-spinner--light": loading
            })}`}
            style={loadingButtonStyle}
          >
            <FormattedMessage id="AUTH.LOGIN.BUTTON" />
          </button>
        </div>

      </form>

      <div className="kt-login__actions">
        <a id="olvido-contrasenia-ancla"
          style={{ fontWeight: 'bold', color: COLORS.white, margin: '19px 12px' }}
          onClick={() => {
            loginMicrosoft();
          }}>
          <FormattedMessage id="AUTH.FORGOT.TITLE.MICROSOFT" />
        </a>
      </div>

    </>
  );
};

export default LoginUserPassword;
