import React  from 'react';
import './DashboardIndexPage.css';
import { useEffect } from 'react';
import Constants from '../../../../store/config/Constants';
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
        className="iframe_Acreditacion"
        //src="http://192.168.3.41:86/ReportsPBI/powerbi/ACREDITACION/DASHBOARD/iPersonnelAcreditacion?RS:EMBED=TRUE" 
        //src="https://app.powerbi.com/reportEmbed?reportId=56587c2e-2687-4cbd-b694-f4d0f1d14eb2&groupId=b1126c50-ebed-4dab-9bbf-03285e4406b1&autoAuth=true&ctid=735c8717-de7a-442a-9690-bc6ce9a33475&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXBhYXMtMS1zY3VzLXJlZGlyZWN0LmFuYWx5c2lzLndpbmRvd3MubmV0LyJ9"
        src={Constants.DASHBOARD.ACREDITACION}
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
