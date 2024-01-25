import React, { useState, useEffect } from 'react';
import { keyreport } from '../../../api/seguridad/usuario.api'
import { useSelector } from "react-redux";
import Iframe from 'react-iframe'
import './iFrameReport.css';
import Constants from '../../../store/config/Constants';
const FrameReport = (
  {
    ReportName = '',
    ReportDescription = '',
    PathReporte = '',
    Parametros = {},
    Width = 100, //Porcentaje
    Height = 400, //500 //Pixeles
    HeightFrame = 350,//450,
    VerFrame,
    SetVerFrame
  }
) => {
  const splashScreen = document.getElementById("splash-screen");

  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const RUTA_REPORTE = Constants.URL_REPORTING_SERVICES;

  const [cargarIframe, setCargarIframe] = useState(false);
  const [urlIframe, setUrlIframe] = useState("");
  const [reportToken, setReportToken] = useState("");

  useEffect(() => {
    if (VerFrame) {
      cargarAccesoReporte();
    }
  }, [VerFrame]);

  const cargarAccesoReporte = async () => {

    let IdUsuario = usuario.username;
    let IdCliente = perfil.IdCliente;

    await keyreport({ IdUsuario, IdCliente, ReportName })
      .then(x => {
        //console.log("keyport.x",x);
        //console.log("Inicio del reporting")
        if (x !== undefined) {
          let str_key = encodeURIComponent(x);
          //console.log("str_key->",str_key);
          setReportToken(str_key);
          cargarReporte(IdUsuario, str_key);
        } else {
          console.error('Error al retornar validacion');
          SetVerFrame(false);
          setCargarIframe(false);
        }
      })
      .catch(error => {
        //console.error('Error:', error);
        SetVerFrame(false);
        setCargarIframe(false);
      })
  }

  const cargarReporte = (userName, reportToken) => {
   // console.log("cargarReporte.reportToken",reportToken);
    if (reportToken === '') {
      //console.log("Error, no existe token");
      SetVerFrame(false);
      setCargarIframe(false);
      return;
    }

    let hostname = window.origin;//;//window.origin;//window.origin;//; //--> Cambiar a localhost en DEV : ;/ //;//
    let url_report = `${hostname}${RUTA_REPORTE}`;

    ReportName = encodeURIComponent(ReportName);
    ReportDescription = encodeURIComponent(ReportDescription);
    PathReporte = encodeURIComponent(PathReporte);
    let parametrosJSON = encodeURIComponent(JSON.stringify(Parametros));
    let arrayKey = ['username', 'token', 'ReportName', 'ReportDescription', 'pathReporte', 'parametros', 'Width', 'Height'];
    let arrayValues = [userName, reportToken, ReportName, ReportDescription, PathReporte, parametrosJSON, Width, Height];
    //let arrayKey = ['ReportName', 'ReportDescription', 'pathReporte', 'parametros', 'Width', 'Height'];
    //let arrayValues = [ReportName, ReportDescription, PathReporte, parametrosJSON, Width, Height];
    let parametrosEnvio = '';


    for (let i = 0; i < arrayKey.length; i++) {
      parametrosEnvio += `${arrayKey[i]}=${arrayValues[i]}&`;
    }
    //console.log(parametrosEnvio);
    //console.log(parametrosEnvio.substring(0, parametrosEnvio.length - 1));
    parametrosEnvio = parametrosEnvio.substring(0, parametrosEnvio.length - 1);
    setUrlIframe(`${url_report}?${parametrosEnvio}`);
    setCargarIframe(true);
    SetVerFrame(false);
    //iniciar loaded...->
    splashScreen.classList.remove("hidden");
  }

  const onLoaded = (e) => {
    //Finalizar loaded...>
    splashScreen.classList.add("hidden");
  }

  return (
    <div>
      <br />
      <div>
        {(cargarIframe) ?
          <>
            <Iframe url={urlIframe}
              width="100%"
              height={`${HeightFrame}px`}
              id="myId"
              className="clsIframe"
              display="initial"
              position="relative"
              onLoad={onLoaded}
            />
          </>
          : null}
      </div>
    </div>
  );
};

export default FrameReport;
