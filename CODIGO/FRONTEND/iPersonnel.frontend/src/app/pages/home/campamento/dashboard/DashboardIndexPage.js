import React, { useEffect } from 'react';
import Constants from '../../../../store/config/Constants';
import './DashboardIndexPage.css';
const DashboardIndexPage = () => {

  const splashScreen = document.getElementById("splash-screen");

  useEffect(() => {
    splashScreen.classList.remove("hidden");
  }, []);

  const onLoaded = (e) => {
    //Finalizar loaded...>
    splashScreen.classList.add("hidden");
  }

  return (
    <div className="panel panelcontainer">
      <iframe
        className="iframe_Campamento"
        // src="https://app.powerbi.com/reportEmbed?reportId=73fa3c2a-f40f-46c6-ab3c-b6b2a27207d3&autoAuth=true&ctid=735c8717-de7a-442a-9690-bc6ce9a33475&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXBhYXMtMS1zY3VzLXJlZGlyZWN0LmFuYWx5c2lzLndpbmRvd3MubmV0LyJ9" 
        //https://app.powerbi.com/view?r=eyJrIjoiYmI2NDcwODgtNDY1ZS00NzkzLWFkMzUtMzFlZmMyMTBlODJjIiwidCI6Ijg5N2RhYzA0LTYyYWMtNDliNC1iNTk4LWZjMGFlYWFlMzgxMSIsImMiOjR9
        //src="http://192.168.3.41:86/ReportsPBI/powerbi/CAMPAMENTO/DASHBOARD/iPersonnelCampamento?RS:EMBED=TRUE"
        src={Constants.DASHBOARD.CAMPAMENTO}
        width={'100%'}
        height={'100%'}
        frameborder="0" allowFullScreen="true"
        display="initial"
        position="relative"
        onLoad={onLoaded}
      ></iframe>
      <div id="itemshield"></div>
      <div className="panelClear"></div>
    </div>
  );
};

export default DashboardIndexPage;
