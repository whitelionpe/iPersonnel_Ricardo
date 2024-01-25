import React from "react";
import "./DashboardIndexPage.css";
import { useEffect } from "react";
import Constants from "../../../../../store/config/Constants";
const AccesoPersonaPage = () => {
  const splashScreen = document.getElementById("splash-screen");

  useEffect(() => {
    splashScreen.classList.remove("hidden");
  }, []);

  const onLoaded = e => {
    //Finalizar loaded...>
    splashScreen.classList.add("hidden");
  };

  return (
    <div className="panel panelcontainer">
      <iframe
        className="iframe_Acreditacion"
        src={Constants.DASHBOARD.ACCESO_AREA_CRITICA}
        width={"100%"}
        height={"100%"}
        frameborder="0"
        allowFullScreen="true"
        display="initial"
        position="relative"
        onLoad={onLoaded}
      ></iframe>
      <div id="itemshield"></div>
      <div className="panelClear"></div>
    </div>
  );
};

export default AccesoPersonaPage;
