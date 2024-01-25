import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import { connect, useDispatch } from "react-redux";
import { injectIntl } from "react-intl";
import * as auth from "../../store/ducks/auth.duck";
import * as perfilStore from "../../store/ducks/perfil.duck";
import * as builder from '../../../_metronic/ducks/builder';
import { login, validateloginX, resendcodeX, loginbyAD } from "../../crud/auth.crud";
import { serviceUsuarioPerfil } from '../../api/seguridad/usuarioPerfil.api';
import { serviceUsuarioClave } from '../../api/seguridad/usuarioClave.api';
import FormControl from '@material-ui/core/FormControl';

import LoginUserPassword from './LoginUserPassword';
import LoginAuthentication from './LoginAuthentication';
import LoginUserDivision from './LoginUserDivision';
import LoginChangePassword from './LoginChangePassword';
import ForgotPassword from './ForgotPassword';
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../src/app/store/ducks/notify-messages";
import { crear_menu } from './LoginUtils';
import { isNotEmpty, refreshTokenLocalStorageKeyName } from "../../../_metronic/utils/utils";
import Constants from "../../store/config/Constants";
import { actions } from "../../store/ducks/auth.duck";
import { refreshTokenPerfilX } from '../../crud/auth.crud';
import { serviceCodigoAutenticacion } from "../../api/seguridad/codigoAutenticacion.api";

function Login(props) {


  const dispatch = useDispatch();
  //const diasAvisar = 5;
  const { intl } = props;
  const splashScreen = document.getElementById("splash-screen");
  // const [loading, setLoading] = useState(false);

  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const PaginaActiva = {
    LOGIN: 1,
    PERFIL: 2,
    CAMBIO_PASSWORD: 3,
    CONFIM_CODE: 4,
    FORGOT_PASSWORD: 5
  }

  //jdelvillar.
  const [verPagina, setVerPagina] = useState(PaginaActiva.LOGIN);

  const [mensajeErrorCambioPass, setMensajeErrorCambioPass] = useState("");
  const [accessToken, setAccessToken] = useState([]);
  const [refreshToken, setRefreshToken] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const [divisiones, setDivisiones] = useState([]);
  const [divisionView, setDivisionView] = useState([]);
  const [user_name, setUserName] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [IdCliente, setIdCliente] = useState("");
  const [dobleAutenticacion, setDobleAutenticacion] = useState("N");
  const [minutosCaduca, setMinutosCaduca] = useState(0);
  const [datosContratista, setDatosContratista] = useState({ Contratista: '', ResponsableContratista: '', IdCompania: '' });
  const [datosValidacion, setDatosValidacion] = useState({
    longitud: 0,
    tipo: '',
    primeraClaveCambiada: 'S'
  });

  const [mensajeClaveCaduca, setMensajeClaveCaduca] = useState('');
  const [msjConfirmCodigo, setMsjConfirmCodigo] = useState('');
  const [flagTelefono, setFlagTelefono] = useState("N");
  const [minutos, setMinutos] = useState(0);

  //ADD-JDL-Add-20-05-2023
  const [MessageServer, setMessageServer] = useState("");
  const [showFromForgotPassword, setShowFromForgotPassword] = useState("VIEW-1");


  useEffect(() => {

    props.setPerfiles(divisionView);

  }, []);

  const fnSelectPerfil = value => {
    if (value) {
      let datos = divisiones.filter(x => x.IdPerfil === value);
      setDivisionView(datos);
    }
  };


  /************************************************************* */

  const cargarDatosMenu = async (perfil) => {
    //-> Recupera opciones de menú que tiene asignado el usuario de acuerdo a su perfil..
    await serviceUsuarioPerfil.listarbyPerfil({
      IdCliente: perfil.IdCliente,
      IdPerfil: perfil.IdPerfil,
      IdUsuario: perfil.IdUsuario,
      IdAplicacion: Constants.APLICACION
    }).then(menus => {
      //Con este resultado se pinta opcinoes de menú
      let { obj_menu, lista_accesos } = crear_menu(menus);

      props.setMenuUsuario({ opciones: lista_accesos });
      props.setMenuConfig(obj_menu);
    });

  }



  /************************************************************* */

  const validarUsuarioPassword = (values, setStatus, setSubmitting, token) => {

    splashScreen.classList.remove("hidden");//activar loanding
    //enableLoading();
    //setLoading(true);
    setTimeout(() => {

      // siteVerifyCaptcha(token).then(response => {
      //   if (response.data.requestHumano) {

      login(values.username.toUpperCase(), values.password, token)
        .then((resp) => {

          //console.log("login.resp...>", resp);

          const { cambiarClaveCaducada } = resp;
          splashScreen.classList.add("hidden");//ocultar loanding

          let dobleAutenticacion = resp.dobleAutenticacion;
          // console.log("dobleAutenticacion...", dobleAutenticacion);

          if (dobleAutenticacion == "N") {
            setAccessToken(resp.accessToken);
            setRefreshToken(resp.refreshToken);
          } else {
            setFlagTelefono(resp.flagTelefono);
          }
          let cambioClave = resp.primeraClaveCambiada;
          setPerfiles(resp.perfil);
          setDivisiones(resp.division);
          setUserName(values.username);
          setNombreCompleto(resp.nombreCompleto);

          setDatosContratista({
            Contratista: resp.Contratista,
            ResponsableContratista: resp.ResponsableContratista,
            IdCompania: resp.IdCompania
          });

          setDobleAutenticacion(dobleAutenticacion);
          setMinutosCaduca(resp.minutosCaduca);
          setDatosValidacion({
            longitud: resp.longitudClave,
            tipo: resp.nivelSeguridadClave,
            primeraClaveCambiada: cambioClave
          });


          if (dobleAutenticacion === "S") {
            setVerPagina(PaginaActiva.CONFIM_CODE);
          } else {
            if (cambiarClaveCaducada === 'S') {
              handleInfoMessages(intl.formatMessage({ id: "LOGIN.PASSWORD.EXPIRED" }), intl.formatMessage({ id: "LOGIN.PASSWORD.CHANGE.PASSWORD.MSG" }),);
              setVerPagina(PaginaActiva.CAMBIO_PASSWORD);
            } else if (cambioClave === 'N') {
              handleInfoMessages(intl.formatMessage({ id: "LOGIN.PASSWORD.FIRSTPASSWORD" }), intl.formatMessage({ id: "LOGIN.PASSWORD.FIRSTPASSWORD.CHANGE.MSG" }),);
              setVerPagina(PaginaActiva.CAMBIO_PASSWORD);
            } else {
              seccionVerPerfil();
            }
          }
        })
        .catch(error => {
          let dataError = error.response;
          if (dataError) {
            let { responseException } = dataError.data;
            let { exceptionMessage } = responseException;
            let { message, code, minutos } = exceptionMessage;
            setMinutos(minutos)
            setSubmitting(false);
            setStatus(exceptionMessage === undefined ? "00" : code);
            setStatus(null)
          } else {
            setStatus("00");
          }
          splashScreen.classList.add("hidden");//ocultar loanding
        });
    }, 1000);
  }

  const seccionVerPerfil = () => {
    setVerPagina(PaginaActiva.PERFIL);
    let minutosDia = 1440;
    let minutosCaduca = minutosCaduca;

    if (minutosCaduca > 0) {

      if ((minutosCaduca / minutosDia) > 6) {
        setMensajeClaveCaduca('');
      } else {
        let dias = Math.trunc(minutosCaduca / minutosDia);
        //let horas = minutosCaduca % minutosDia;

        if (dias !== 0) {
          setMensajeClaveCaduca(`Su contraseña vencerá en ${dias} días.`);
        } else {
          setMensajeClaveCaduca(`Su contraseña vence el día de hoy.`);
        }
      }
    } else {
      setMensajeClaveCaduca('');
    }
  }

  const fnSelectDivision = async (value) => {
    //console.log("LOGIN::: fnSelectDivision", value);
    //console.log("fnSelectDivision.ingresamos, value", value);
    if (value) {
      let datos = divisionView.find(x => x.IdDivision === value);
      //console.log("divisionView",divisionView);
      //console.log("LOGIN::: fnSelectDivision datos", datos);

      if (datos) {
        const { IdCliente, IdDivision, Cliente, Division, IdPerfil, Perfil, IdPais } = datos;
        let perfil = { IdCliente, IdDivision, Cliente, Division, IdPerfil, Perfil, IdPais };

        //console.log("LOGIN::: fnSelectDivision refreshToken", refreshToken);
        //console.log("LOGIN::: fnSelectDivision dobleAutenticacion", dobleAutenticacion)
        if (dobleAutenticacion === "S") {
          setTimeout(async () => {
            cargarDatosPerfilMenu(perfil);
          }, 1000);
        } else {
          //console.log("Here, cargarDatosPerfilMenu",perfil);
          cargarDatosPerfilMenu(perfil);
        }
      }
    }
  };

  const updateRefreshToken = async (datos) => {
    //console.log("updateRefreshToken",datos);
    //let idPerfil = datos.IdPerfil;
    const { IdPerfil, token } = datos;
    //console.log("Init updateRefreshToken");
    localStorage.setItem(refreshTokenLocalStorageKeyName, refreshToken);//Antiguo token.
    //props.store.dispatch(actions.saveRefreshToken(accessToken));//Antiguo access token
    dispatch(actions.saveRefreshToken(accessToken));//Antiguo access token

    await refreshTokenPerfilX({ idPerfil: IdPerfil, tokenClient: token }).then((data) => {
      //console.log("refreshTokenPerfilX", data);
      if (data != undefined) {
        let { respuesta, username, accessToken, refreshToken } = data;
        //console.log("refreshTokenPerfil --> ", data);
        if (!!accessToken) {
          //console.log("-- >", accessToken);
          localStorage.setItem(refreshTokenLocalStorageKeyName, refreshToken);
          //props.store.dispatch(actions.saveRefreshToken(accessToken)); 
          dispatch(actions.saveRefreshToken(accessToken));
          //console.log("accessToken...>",accessToken);
          props.actionLogin(accessToken);
          /*********************************************** */
          //console.log("cargarDatosPerfilMenu - Cargar opciones de menú");
          /***************************************************************** */
          //CREAR MENU:
          //console.log("LOGIN::: fnSelectDivision cargarDatosMenu", datos);
          cargarDatosMenu({ IdCliente: datos.IdCliente, IdPerfil: datos.IdPerfil, IdUsuario: user_name });
          /***************************************************************** */
          setIdCliente(datos.IdCliente);
          //console.log("Se cargan perfiles: ", perfiles);
          // props.setPerfiles(perfiles);
          props.setPerfiles(divisionView);

          //Se agrega los datos de compañia:
          datos.Contratista = datosContratista.Contratista
          datos.ResponsableContratista = datosContratista.ResponsableContratista
          datos.IdCompania = datosContratista.IdCompania
          props.setPerfilActual(datos);
          // console.log("setPerfilActual..>",datos);
          // console.log("Open dashboard...");
          //Direccionar página dashboard;
          // setTimeout(async () => { props.history.push({ pathname: '/dashboard' }) }, 500);
          /*********************************************** */
        }
      }
      //console.log("End updateRefreshToken");
    }).catch(err => {
      if (err.response !== undefined && err.response.hasOwnProperty('data')) {
        let dataError = err.response.data;
        if (dataError === undefined) {
          setMensajeClaveCaduca("Error de conexión al servidor.");
        } else {
          setMensajeClaveCaduca(dataError.message);
        }
      } else {
        setMensajeClaveCaduca("Error de conexión al servidor.");
      }
    });
  }

  const cargarDatosPerfilMenu = (datos) => {

    //OBTENER - reCAPTCHA de google.
    window.grecaptcha.ready(() => {
      window.grecaptcha.execute(Constants.CAPTCHA_SECRETKEYSITE, { action: 'submit' }).then(token => {

        updateRefreshToken({ ...datos, token });

      });
    });

  }

  const cambiarPasswordUsuario = (password, setSubmitting, setStatus) => {
    //console.log("cambiarPasswordUsuario", password);
    // enableLoading();
    splashScreen.classList.remove("hidden"); //Activar loanding
    //setLoading(true);
    //console.log("cambiarPasswordUsuario", setLoading );
    let param = {
      IdCliente: IdCliente,
      IdUsuario: user_name,
      Clave: password,
      IdUsuarioModificacion: user_name,
      IdTipoAplicacion: Constants.ID_TIPO_APLICACION
    };

    setTimeout(async () => {

      let config = {
        headers: { Authorization: `Bearer ${accessToken}` }
      };

      const mensajeErrorGuardar01 = intl.formatMessage({ id: "LOGIN.PASSWORD.ERROR.OCCURRED.MSG" });      //'Ocurrió un error al intentar guardar la información.';
      const mensajeErrorGuardar02 = intl.formatMessage({ id: "LOGIN.PASSWORD.MUST.DIFFERENT.PASSWORD" }); //'Debe ingresar una contraseña distinta a las registradas anteriormente.';

      await serviceUsuarioClave.crearbytoken(param, config)//config
        .then((resp) => {
          //Actualizado ok 

          if (resp.id === 0) {
            setAccessToken([]);
            setRefreshToken([]);
            //console.log("Se limpia los perfiles");
            setPerfiles([]);
            setDivisiones([]);
            setUserName("");
            setVerPagina(PaginaActiva.LOGIN);
            setSubmitting(false);
            setStatus(null);
            setMinutos(0);
            //Mensaje de cambio de clave exitoso!-JDL-2022-07-04
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "AUTH.CHANGE.PASSWORD.SUCCESS" }),);

          } else {
            setMensajeErrorCambioPass((resp.id === 2) ? mensajeErrorGuardar02 : mensajeErrorGuardar01);
          }

        })
        .catch((resp) => {
          //Ocurrio error 
          setMensajeErrorCambioPass(mensajeErrorGuardar01);
        })
        .finally(() => {
          // disableLoading();
          //setLoading(false);
          splashScreen.classList.add("hidden");//Ocultar loanding
        });
    }, 500);

  }

  async function generarCodigoVerificacion(correo, usuario, token) {

    //JDL->ADD-20-05-2023-> Recuperar Clave con codigo verificacion
    splashScreen.classList.remove("hidden"); //Activar loanding

    let data = {
      IdAplicacion: Constants.APLICACION,
      IdTipoAplicacion: Constants.ID_TIPO_APLICACION,
      Identificador: correo,
      Usuario: usuario,
      NotificarPor: Constants.NOTIFY_BY,// "SMTP"/SMS,
      Codigo: "",//enviar vacio para generar codigo autenticación
      NuevaContrasenia: "",
      tokenClient: token //JDL->ADD-15-08-2023-> Obtener token ID
    };
    await serviceCodigoAutenticacion.RecuperarClave(data).then(response => {

      setMessageServer("");
      //console.log("1-ServiceRecuperar", response);
      setDatosValidacion({
        longitud: response.longitudClave,
        tipo: response.nivelSeguridadClave
      });
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "AUTH.LOGIN.TITLE.AUTHENTICATION" }) + "correo");
      setShowFromForgotPassword("VIEW-2");//Cambiar a vista ingresar código verificación.

    }).catch(err => {

      if (isNotEmpty(err.response)) {
        const { responseException } = err.response.data;
        setMessageServer(responseException.exceptionMessage.message);
      } else {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      }

    }).finally(() => {
      splashScreen.classList.add("hidden");//Ocultar loanding
    });



  }

  async function guardarNuevoPassword(correo, usuario, codigo, newPassword, token) {
    //JDL->ADD-20-05-2023-> Guardar Clave con codigo verificacion
    splashScreen.classList.remove("hidden"); //Activar loanding

    let data = {
      IdAplicacion: Constants.APLICACION,
      IdTipoAplicacion: Constants.ID_TIPO_APLICACION,
      Identificador: correo,
      Usuario: usuario,
      NotificarPor: Constants.NOTIFY_BY,// "SMTP"/SMS,
      Codigo: codigo,
      NuevaContrasenia: newPassword,
      tokenClient: token
    };
    await serviceCodigoAutenticacion.RecuperarClave(data).then(response => {
      setVerPagina(PaginaActiva.LOGIN);
      setIsForgotPassword(false);
      setMessageServer("");
      //console.log("1-ServiceRecuperar", response);
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "AUTH.CHANGE.PASSWORD.SUCCESS" }));
      setShowFromForgotPassword("VIEW-1");//Cambiar a vista inicial. 


    }).catch(err => {

      if (isNotEmpty(err.response)) {
        const { responseException } = err.response.data;
        setMessageServer(responseException.exceptionMessage.message);
      } else {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      }

    }).finally(() => {
      splashScreen.classList.add("hidden");//Ocultar loanding
    });

  }

  const getTitle = (tipo) => {

    switch (verPagina) {
      case PaginaActiva.LOGIN: return "AUTH.LOGIN.TITLE.WELCOME";
      case PaginaActiva.PERFIL: return ("AUTH.LOGIN.TITLE");
      case PaginaActiva.CAMBIO_PASSWORD: return ("AUTH.LOGIN.TITLE.CHANGEPASSWORD");
      case PaginaActiva.CONFIM_CODE: return ("AUTH.LOGIN.TITLE.CONFIM_CODE");
      case PaginaActiva.FORGOT_PASSWORD: return ("");
      default: return ("AUTH.LOGIN.TITLE.WELCOME");
    }

  }

  const cargarComponenteOlvideContrasenia = (value) => {
    setIsForgotPassword(value);
    if (value) {
      setVerPagina(PaginaActiva.FORGOT_PASSWORD);
    }
  }


  const confirmarCodigoVerificacion = async (value) => {

    let param = {
      username: user_name,
      codigo: value
    }
    splashScreen.classList.remove("hidden"); //Activar loanding
    //setLoading(true);
    setTimeout(() => {
      //console.log("Parametros:", param);

      validateloginX(param)
        .then(resp => {
          //setLoading(false);
          splashScreen.classList.add("hidden");//Ocultar loanding

          //console.log("Step 1- Codigo confirmado", resp);

          setAccessToken(resp.accessToken);
          setRefreshToken(resp.refreshToken);

          //console.log("AccesToken", resp.accessToken);
          //console.log("RefreshToken", resp.refreshToken);

          if (datosValidacion.primeraClaveCambiada === 'N') {
            setVerPagina(PaginaActiva.CAMBIO_PASSWORD);
          } else {
            seccionVerPerfil();
          }

        })
        .catch(error => {

          //console.log("Error", error);
          var descripcion = "";
          if (error.response) {
            let dataError = error.response;
            let { responseException } = dataError.data;
            let { exceptionMessage } = responseException;

            const { message, code } = exceptionMessage;

            if (code === '09' || code === '04') {
              let minutos = 0;//err.response.data.minutos;
              descripcion = message.replace('{0}', minutos);
            }

            setMsjConfirmCodigo(descripcion ? descripcion : message);

            splashScreen.classList.add("hidden");//Ocultar loanding

          }


        });
    }, 1000);
  }

  const ReenviarCodigo = async () => {
    //console.log("Reenviarcodigo");
    //setLoading(true);
    splashScreen.classList.remove("hidden"); //Activar loanding
    await resendcodeX({ username: user_name })
      .then(resp => {
        //console.log("Correcto", resp);
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          resp.message);

      })
      .catch(err => {
        //console.log("Error", err);
        setMsjConfirmCodigo(err.response.data.message);
      })
      .finally(() => { //setLoading(false); 
        splashScreen.classList.add("hidden");//Ocultar loanding
      });

  }
  // ::::::::::::::::: AGREGAR :::::::::::::::
  const cargarComponenteLoginUserPassword = (value) => {
    if (value) {
      //Numero: 1 (PaginaActiva.LOGIN)
      setVerPagina(PaginaActiva.LOGIN);
    }
  }

  const loginByAzureAd = (data) => {
    let { accessToken } = data;
    splashScreen.classList.add("hidden");
    window.grecaptcha.ready(() => {
      window.grecaptcha.execute(Constants.CAPTCHA_SECRETKEYSITE, { action: 'submit' })
        .then(async token => {

          let resp = await loginbyAD(accessToken, {
            tokenClient: token, idAplicacion: Constants.APLICACION,
          });

          if (!!resp) {
            splashScreen.classList.add("hidden");

            setAccessToken(resp.accessToken);
            setRefreshToken(resp.refreshToken);

            let cambioClave = resp.primeraClaveCambiada;
            setPerfiles(resp.perfil);
            setDivisiones(resp.division);
            setUserName(resp.Username);
            setNombreCompleto(resp.nombreCompleto);

            setDatosContratista({
              Contratista: resp.Contratista,
              ResponsableContratista: resp.ResponsableContratista,
              IdCompania: resp.IdCompania
            });

            setDobleAutenticacion(dobleAutenticacion);
            setMinutosCaduca(resp.minutosCaduca);
            setDatosValidacion({
              longitud: resp.longitudClave,
              tipo: resp.nivelSeguridadClave,
              primeraClaveCambiada: cambioClave
            });

            seccionVerPerfil();

          } else {
            splashScreen.classList.add("hidden");//ocultar loanding
          }

        });
    });

  }

  return (
    <>
      <div className="kt-login__body">
        <div className="kt-login__form">
          <FormControl variant='standard' style={{ paddingTop: "178px" }}>
            <h1 className="clsTitleLogin" >
              {intl.formatMessage({ id: Constants.NAME_MODULO })}
            </h1>
            <p style={{ color: 'white', fontWeight: "bold", marginTop: "1rem" }} >{Constants.AppVersion} </p>
          </FormControl>
          <Formik
            initialValues={{
              username: "",
              password: "",
              password2: "",
              email: "",
              isForgotPassword: false,
            }}
            validate={values => {
              const errors = {};
              if (!values.username) {
                // https://github.com/formatjs/react-intl/blob/master/docs/API.md#injection-api
                errors.username = intl.formatMessage({ id: "AUTH.VALIDATION.REQUIRED_FIELD" });
              }
              if (!values.password) {
                errors.password = intl.formatMessage({ id: "AUTH.VALIDATION.REQUIRED_FIELD" });
              }
              return errors;
            }}
            onSubmit={(values, { setStatus, setSubmitting }) => {

              //VALIDAR - CAPTCHA
              window.grecaptcha.ready(() => {
                window.grecaptcha.execute(Constants.CAPTCHA_SECRETKEYSITE, { action: 'submit' }).then(token => {
                  //  submitData(token);
                  //console.log("window.grecaptcha.execute.token",token );
                  //CONFIRMAR API DEL SERVER
                  validarUsuarioPassword(values, setStatus, setSubmitting, token);
                });
              });

            }}
          >

            {formisk => {
              switch (verPagina) {
                case PaginaActiva.LOGIN: return (
                  <LoginUserPassword {...formisk}
                    intl={intl}
                    setIsForgotPassword={cargarComponenteOlvideContrasenia}
                    minutos={minutos}
                    loginByAzureAd={loginByAzureAd}
                  />);
                case PaginaActiva.PERFIL: return (
                  <LoginUserDivision
                    divisionView={divisionView}
                    fnSelectDivision={fnSelectDivision}
                    fnSelectPerfil={fnSelectPerfil}
                    perfiles={perfiles}
                    intl={intl}
                    mensajeClaveCaduca={mensajeClaveCaduca}
                  />);
                case PaginaActiva.CAMBIO_PASSWORD: return (
                  <LoginChangePassword {...formisk}
                    intl={intl}
                    datosValidacion={datosValidacion}
                    cambiarPasswordUsuario={cambiarPasswordUsuario}
                    mensajeErrorCambioPass={mensajeErrorCambioPass}

                  />);
                case PaginaActiva.CONFIM_CODE: return (
                  <LoginAuthentication
                    intl={intl}
                    perfiles={perfiles}
                    msjConfirmCodigo={msjConfirmCodigo}
                    EsTelefono={flagTelefono}
                    confirmarCodigoVerificacion={confirmarCodigoVerificacion}
                    ReenviarCodigo={ReenviarCodigo}
                  />);
                case PaginaActiva.FORGOT_PASSWORD: return (
                  <ForgotPassword {...formisk}
                    intl={intl}
                    generarCodigoVerificacion={generarCodigoVerificacion}
                    guardarNuevoPassword={guardarNuevoPassword}
                    MessageServer={MessageServer}
                    setMessageServer={setMessageServer}
                    showFromForgotPassword={showFromForgotPassword}
                    setShowFromForgotPassword={setShowFromForgotPassword}
                    datosValidacion={datosValidacion}
                    // ::::::::::::: AGREGAR FUNCION :::::::::::::::
                    setIsLoginUserPassword={cargarComponenteLoginUserPassword}
                  />);
                default: return null;
              }
            }}


          </Formik>


        </div>
      </div>
    </>
  );
}

const mapDispatchToProps = dispatch => {
  return {
    actionLogin: data => dispatch(auth.actions.login(data)),
    setPerfilActual: data => dispatch(perfilStore.actions.setPerfilActual(data)),
    setPerfiles: data => dispatch(perfilStore.actions.setPerfiles(data)),
    setMenuUsuario: data => dispatch(perfilStore.actions.setOpciones(data)),
    setMenuConfig: data => dispatch(builder.actions.setMenuConfig(data))
  };
};

export default injectIntl(connect(null, mapDispatchToProps)(Login));
