import React, { useEffect, useState, Fragment } from "react";
import Login from "./Login";
import queryString from 'query-string';
import Constants from "../../store/config/Constants";
import AuthPageSplash from '../../partials/components/Auth/AuthPageSplash';
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import LoginTopBar from "./LoginTopBar";
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  fondoImagen: {
    backgroundImage: `url(new_logos/2personnel_bg.jpg)`,
    backgroundSize: "cover",
  },
}));

function AuthPage(props) {
  const { intl } = props;

  const [setViewLogin,] = useState(false);
  const [btnIniciarOpenDrawer, setBtnIniciarOpenDrawer] = useState(false);
  const classes = useStyles();

  let params = queryString.parse(props.location.search)

  const loadScriptByURL = (id, url, callback) => {
    //Registrar reCaptcha invisible de Google.
    //Referencia:>> https://www.akashmittal.com/google-recaptcha-reactjs/
    const isScriptExist = document.getElementById(id);
    if (!isScriptExist) {
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.src = url;
      script.id = id;
      script.onload = function () {
        if (callback) callback();
      };
      document.body.appendChild(script);
    }
    if (isScriptExist && callback) callback();
  }

  useEffect(() => {
    //-> 2 ESTA LINEA PINTA EL PRIMER INGRESO EN BACKGROUD EN INICIO
    document.body.classList.add(classes.fondoImagen)
    if (params != undefined) {
      if (params.confirm != undefined && params.confirm.length > 5) {
        setViewLogin(true);
      }
    }

    loadScriptByURL("recaptcha-key", `${Constants.CAPTCHA_URL}?render=${Constants.CAPTCHA_SECRETKEYSITE}`, function () {
    });

  }, []);

  const [onLandingPage, setOnLandingPage] = useState(true)
  const personnelLogo = "/new_logos/2personnel_w.png";

  function handleAcreditacionChange() {
    setOnLandingPage(prevState => !prevState)
  }
  const btnIniciar = () => {
    setBtnIniciarOpenDrawer(!btnIniciarOpenDrawer)
  };

  return (
    <Fragment>
      {/* <video autoPlay muted loop id="bg-video" style={{ position: "fixed" }}>
        <source src="https://video.wixstatic.com/video/11062b_8d52ed902b1a4d6286fa91831c44e79e/1080p/mp4/file.mp4" type="video/mp4" />
      </video> */}
      <div className="homeRow" style={{
        backgroundImage: "url(/new_logos/2personnel_bg.jpg)", backgroundSize: "cover"
      }}>
        <div className="loginColumn">
          <LoginTopBar handleAcreditacionChange={handleAcreditacionChange} style={{ display: "none" }} btnIniciarOpenDrawer={btnIniciarOpenDrawer} setBtnIniciarOpenDrawer={setBtnIniciarOpenDrawer} />
          <img src={personnelLogo} style={{ position: 'relative', marginLeft: '45px', padding: '19px 89px 20px 0px', width: '33rem' }} />
          {
            onLandingPage ?
              <div
                id="loginLeftColumn"
                className="clsDescripcionWeb">
                <h1 style={{
                  fontSize: "32px",
                  marginBottom: '2.5rem'
                }}> {intl.formatMessage({ id: "DESCRIPTION.WEB.MAIN" })}</h1>
                <Button
                  icon="new_logos/arrow_right_negro.svg"
                  className="classEfectoYellow"
                  text={intl.formatMessage({ id: "LOG.IN.INICIAR" })}
                  type="default"
                  rtlEnabled={true}
                  style={{ width: "10.5rem", justifyContent: "center" }}
                  onClick={btnIniciar}
                />
              </div>
              : <Login />
          }
        </div>
        <div className={onLandingPage ? "loginHomeGalleryImage" : "loginHomeImage"}>
          {/*
          {
            onLandingPage ?
              <AuthPageSplash handleAcreditacionChange={handleAcreditacionChange} showImageGallery={true} /> // reemplazar por carrusel de fotos
              :
              <AuthPageSplash handleAcreditacionChange={handleAcreditacionChange} showImageGallery={false} />
          }
          */}
          <AuthPageSplash handleAcreditacionChange={handleAcreditacionChange} showImageGallery={false} />
        </div>
      </div>
    </Fragment>
  );
}

export default injectIntl(AuthPage);
