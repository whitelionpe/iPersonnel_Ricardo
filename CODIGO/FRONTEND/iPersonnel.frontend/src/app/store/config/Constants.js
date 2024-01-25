import React from "react";
import AcreditacionV01 from "../../partials/content/Acreditacion/Svg/DashboardMenu/AcreditacionV01";
import HomeIconV01 from "../../partials/content/Acreditacion/Svg/DashboardMenu/HomeIconV01";
import EmbarqueV01 from "../../partials/content/Acreditacion/Svg/DashboardMenu/EmbarqueV01";
import HospedajeIconV01 from "../../partials/content/Acreditacion/Svg/DashboardMenu/HospedajeIconV01";
import AsistenciaV01 from "../../partials/content/Acreditacion/Svg/DashboardMenu/AsistenciaV01";


class Constants extends React.Component {
  //static API_URL = "http://192.168.3.11:4091"; 
  //static API_URL = "https://localhost:3006";
  //static API_URL = "http://192.168.0.25:57217"; 
  //static API_URL = "http://localhost:57217";
  //static API_URL = "http://192.168.3.11:4091";
  //static API_URL = "https://localhost:44376"; 
  //static API_URL = "https://localhost:44311"; 
  //static API_URL = "https://localhost:5001";
  // static API_URL = "https://localhost:5001";
  //static API_URL = "http://192.168.3.41:4091"; 
  //static API_URL = "http://192.168.3.41:8098";//API DEV ACREDITACION   
  //static API_URL = "https://api2personnelplus.whitelion.pe:8091";
  //static API_URL = "https://api2personnelplus.whitelion.pe:8091"; //Produccion
  //static API_URL = "https://2pbackendwlt.azurewebsites.net"; //AZURE V1
  static API_URL = "https://apps.whitelion.pe"; //AZURE V2

  static API_URL_LOCALHOST = "http://localhost:1010";//::::::-> NO COMENTAR, SE USA PARA EDIT/PRINT BADGE..:::::::
  static AppName = "2PERSONNEL";
  static AppVersion = "V.2.1";//Entrega 08-01-2024 
  static SECONDS_TIMEOUT_FOR_LOCK = 400;
  static APLICACION = "AP00";
  static ID_TIPO_APLICACION = "WEB";
  static CAPTCHA_URL = "https://www.google.com/recaptcha/api.js"
  static CAPTCHA_SECRETKEYSITE = "6LeKHoIaAAAAAO4x8ArgbONUAXxENW4AZBTDr76q";
  static NAME_MODULO = "DESCRIPTION.WEB.MODULE.ADMINISTRATION";
  static CLIENTE_LOGOID = "LogoEmpresaPrincipal.png";
  static DESCRIPCION_COMPANIA_DEFAULT = "LAGUNAS NORTE" //Nombre del cliente para los reportes..
  static NOTIFY_BY = "SMTP"; //SMTP/SMS
  static FLAG_SPANISH = "188-peru.svg";//"131-chile.svg";  //Bandera por defecto asignado ->  

  static URL_REPORTING_SERVICES = "/RS/Rpt.aspx";
  static DASHBOARD = {
    CAMPAMENTO: "https://app.powerbi.com/view?r=eyJrIjoiYTY1ZDk5MDAtNGRkZS00MGFkLTg3NzItYWNiY2IwMzlmYmQzIiwidCI6IjczNWM4NzE3LWRlN2EtNDQyYS05NjkwLWJjNmNlOWEzMzQ3NSJ9",
    //ACREDITACION: "https://app.powerbi.com/view?r=eyJrIjoiMjA4ODQ4MGItZTU5Ni00OTQxLWEzNWYtYTUwZDljM2VjMjk0IiwidCI6IjczNWM4NzE3LWRlN2EtNDQyYS05NjkwLWJjNmNlOWEzMzQ3NSJ9"
    ACREDITACION: "https://app.powerbi.com/view?r=eyJrIjoiMTFiMDg3MTktNzU1Zi00OGVkLWFmZWEtNWU4MDkwNmY4OWJmIiwidCI6IjczNWM4NzE3LWRlN2EtNDQyYS05NjkwLWJjNmNlOWEzMzQ3NSJ9",
    ACCESO_AREA_CRITICA: "https://app.powerbi.com/view?r=eyJrIjoiYTJkNThhYjktNmQ4ZC00YmRjLTljOGYtMzUzNTNiMzJhNjQ0IiwidCI6IjczNWM4NzE3LWRlN2EtNDQyYS05NjkwLWJjNmNlOWEzMzQ3NSJ9"

  };
  // static MENU_PRINCIPAL = [
  //   { classIcon: '2personnel', text: "CONFIG.SISTEMA", activo: 1, accion: null },
  //   { classIcon: 'acreditacion', text: 'ACCREDITATION.MAIN', activo: 1, accion: 'https://2personnelplus.whitelion.pe:8086/' },
  //   { classIcon: 'Transporte', text: 'TRANSPORT.MAIN', activo: 1, accion: 'https://2personnelplus.whitelion.pe:8085/' },
  //   { classIcon: 'hoteleria', text: 'HOSPITALITY.MAIN', activo: 1, accion: 'https://2personnelplus.whitelion.pe:8087/' },
  //   { classIcon: 'asistencia', text: 'ASSISTANCE.MAIN', activo: 1, accion: 'https://2personnelplus.whitelion.pe:8093/' },

  // ];

  static MENU_PRINCIPAL = [
    { icon: <HomeIconV01 style={{ margin: "0 auto", textAlign: "center", display: "flow", }} />, classIcon: '2personnel', text: 'DESCRIPTION.WEB.MODULE.ADMINISTRATION', activo: 1, accion: null },
    { icon: <AcreditacionV01 style={{ margin: "0 auto", textAlign: "center", display: "flow", }} />, classIcon: 'acreditacion', text: 'DESCRIPTION.WEB.MODULE.ACREDITACION', activo: 1, accion: 'https://2personnelplus.whitelion.pe:8086/' },
    { icon: <EmbarqueV01 style={{ margin: "0 auto", textAlign: "center", display: "flow", }} />, classIcon: 'Transporte', text: 'DESCRIPTION.WEB.MODULE.TRANSPORTE', activo: 1, accion: 'https://2personnelplus.whitelion.pe:8085/' },
    { icon: <HospedajeIconV01 style={{ margin: "0 auto", textAlign: "center", display: "flow", }} />, classIcon: 'hoteleria', text: 'DESCRIPTION.WEB.MODULE.HOSPEDAJE', activo: 1, accion: 'https://2personnelplus.whitelion.pe:8087/' },
    { icon: <AsistenciaV01 style={{ margin: "0 auto", textAlign: "center", display: "flow", }} />, classIcon: 'asistencia', text: 'DESCRIPTION.WEB.MODULE.ASISTENCIA', activo: 1, accion: 'https://2personnelplus.whitelion.pe:8093/' },
  ];
  
  static AUTENTICATE_AD = "S";//Agregar autenticacion AZURE AD
  static AZURE_AD_APP_ID = "28c77fa9-2a9e-4634-93b3-7133cb0193e2" //Produccion
  static AZURE_AD_SCOPE_DEFAULT = "api://9b78f4c9-dc4a-4a7f-b625-7c56cd475d88/access_as_user" //Produccion
  static AZURE_AD_AUTHORITY = "https://login.microsoftonline.com/735c8717-de7a-442a-9690-bc6ce9a33475"


  //static AZURE_AD_APP_ID = "34269c8c-3dc9-4a3d-a40c-4e414044e893" //Desarrollo
  //static AZURE_AD_SCOPE_DEFAULT = "api://a5496d8b-3df1-4767-8d0c-2197206fdea9/access_as_user" //Desarollo
}

export default Constants;
