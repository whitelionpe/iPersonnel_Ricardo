import React from 'react';
import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
import { exportDataGrid } from 'devextreme/excel_exporter';

//impoimportt ap
import { obtenerTodos as obtenerTodosTipoDocumento } from "../../app/api/sistema/tipodocumento.api";
import { obtenerTodos as obtenerTodosTipoSangre } from "../../app/api/sistema/tipoSangre.api";
import { obtenerTodos as obtenerTodosEstadoCivil } from "../../app/api/sistema/estadoCivil.api";
import { obtenerTodos as obtenerTodosLicencias } from "../../app/api/sistema/licenciaConducir.api";
import { obtenerTodos as obtenerCmbDivision } from "../../app/api/sistema/division.api";
import { obtenerTodos as obtenerCmbFuncion } from "../../app/api/administracion/funcion.api";
import { obtenerTodos as obtenerCmbTipoPosicion } from "../../app/api/administracion/tipoPosicion.api";
import { validarUsoLicencia as validarLicencia } from "../../app/api/sistema/licencia.api";
import { handleInfoMessages, handleWarningMessages } from '../../app/store/ducks/notify-messages';


export function removeCSSClass(ele, cls) {
  const reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
  ele.className = ele.className.replace(reg, " ");
}

export function addCSSClass(ele, cls) {
  ele.classList.add(cls);
}

export const toAbsoluteUrl = pathname => process.env.PUBLIC_URL + pathname;
export const refreshTokenLocalStorageKeyName = "ip::xcrt";  //Nombre de refreshToken en LocalStorage

//Valores para cargar el popp de relogin
export const GlobalConstants = {
  isOpenPasswordRequestForm: 'isOpenPasswordRequestForm',
  refreshTokenInterval: 'refreshTokenInterval',
}


/*  removeStorage: removes a key from localStorage and its sibling expiracy key
    params:
        key <string>     : localStorage key to remove
    returns:
        <boolean> : telling if operation succeeded
 */
export function removeStorage(key) {
  try {
    localStorage.setItem(key, "");
    localStorage.setItem(key + "_expiresIn", "");
  } catch (e) {
    //console.log("removeStorage: Error removing key [" + key + "] from localStorage: " + JSON.stringify(e));
    return false;
  }
  return true;
}

/*  getStorage: retrieves a key from localStorage previously set with setStorage().
    params:
        key <string> : localStorage key
    returns:
        <string> : value of localStorage key
        null : in case of expired key or failure
 */
export function getStorage(key) {
  const now = Date.now(); //epoch time, lets deal only with integer
  // set expiration for storage
  let expiresIn = localStorage.getItem(key + "_expiresIn");
  if (expiresIn === undefined || expiresIn === null) {
    expiresIn = 0;
  }

  expiresIn = Math.abs(expiresIn);
  if (expiresIn < now) {
    // Expired
    removeStorage(key);
    return null;
  } else {
    try {
      const value = localStorage.getItem(key);
      return value;
    } catch (e) {
      //console.log("getStorage: Error reading key [" + key + "] from localStorage: " + JSON.stringify(e));
      return null;
    }
  }
}
/*  setStorage: writes a key into localStorage setting a expire time
    params:
        key <string>     : localStorage key
        value <string>   : localStorage value
        expires <number> : number of seconds from now to expire the key
    returns:
        <boolean> : telling if operation succeeded 
 */
export function setStorage(key, value, expires) {
  if (expires === undefined || expires === null) {
    expires = 24 * 60 * 60; // default: seconds for 1 day
  }

  const now = Date.now(); //millisecs since epoch time, lets deal only with integer
  const schedule = now + expires * 1000;
  try {
    localStorage.setItem(key, value);
    localStorage.setItem(key + "_expiresIn", schedule);
  } catch (e) {
    //console.log("setStorage: Error setting key [" + key + "] in localStorage: " + JSON.stringify(e));
    return false;
  }
  return true;
}

export function isNotEmpty(value) {
  return value !== undefined && value !== null && value !== "";
}

export function dateFormat(date, y) {
  //console.log("Listar-formato-Fecha",dateFormat(Date.now(),"dd-MM-yyyy hh:mm"))
  if (date == null) return "";

  var x = new Date(date);
  var z = {
    M: x.getMonth() + 1,
    d: x.getDate(),
    h: x.getHours(),
    m: x.getMinutes(),
    s: x.getSeconds()
  };
  y = y.replace(/(M+|d+|h+|m+|s+)/g, function (v) {
    return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-2)
  });

  return y.replace(/(y+)/g, function (v) {
    return x.getFullYear().toString().slice(-v.length)
  });
}

// Transforma string de fecha en formato dd/MM/yyyy a un objeto de fecha javascript
export function dateFromString(formattedString) {
  const dateParts = formattedString.split('/');
  return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
};

export function getDateOfDay() {
  let hoy = new Date();
  let FechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  let FechaFin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);
  FechaFin = FechaFin.setMinutes(-1);
  FechaFin = new Date(FechaFin);

  return { FechaInicio, FechaFin }
}

export function getStartAndEndOfMonthByDay(hoy, cant = 1) {
  //console.log("getStartAndEndOfMonthByDay", hoy, cant);
  if (typeof (cant) === "undefined") cant = 1;
  if (!(hoy instanceof Date)) hoy = new Date();

  let FechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  let FechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + cant, 1);
  FechaFin = FechaFin.setMinutes(-1);
  FechaFin = new Date(FechaFin);
  return { FechaInicio, FechaFin }
}

export function getStartOfMonthAndToday() {
  let hoy = new Date();
  let FechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  let FechaFin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return { FechaInicio, FechaFin }
}

export function getMinusDaysBeforeAndToday(days) {
  // debugger;
  if(!isNotEmpty(days)) days=0;
  let hoy = new Date();
  let aux = new Date();
  let antes = new Date( aux.setDate(aux.getDate()+(days*(-1))));
  let FechaInicio = new Date(antes.getFullYear(), antes.getMonth(), antes.getDate());
  let FechaFin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return { FechaInicio, FechaFin }
}

export function getFirstDayAndLastDayYear() {
  let FechaInicio = new Date(new Date().getFullYear(), 0, 1);
  let FechaFin = new Date(new Date().getFullYear(), 11, 31);
  return { FechaInicio, FechaFin }
}

export function getFirstDayAndCurrentlyMonthOfYear() {
  let FechaInicio = new Date(new Date().getFullYear(), 0, 1);
  let FechaFin = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
  return { FechaInicio, FechaFin }
}

export function convertyyyyMMddToFormatDate(strFecha) {
  strFecha = strFecha || '';
  if (strFecha.length > 6) {
    let dia = strFecha.substring(6, 8);
    let mes = strFecha.substring(4, 6);
    let anio = strFecha.substring(0, 4);

    return dia + '/' + mes + '/' + anio;
  }
  return '';
}

export function convertyyyyMMddToDate(strFecha) {
  let dia = parseInt(strFecha.substring(6, 8));
  let mes = parseInt(strFecha.substring(4, 6));
  let anio = parseInt(strFecha.substring(0, 4));

  return new Date(anio, (mes - 1), dia);
}


export function convertyyyyMMddToDateTime(strFecha) {
  // console.log("convertTo...", strFecha);
  let dia = parseInt(strFecha.substring(6, 8));
  let mes = parseInt(strFecha.substring(4, 6));
  let anio = parseInt(strFecha.substring(0, 4));

  let hora = parseInt(strFecha.substring(8, 11));
  let minuto = parseInt(strFecha.substring(12, 15));


  //  MM/dd/yyyy HH:mm:ss

  return new Date(anio, (mes - 1), dia, hora, minuto);
}


export function addDaysToDate(fecha, dias) {

  let nuevaFecha = new Date(
    fecha.getFullYear(),
    fecha.getMonth(),
    (fecha.getDate() + dias),
    fecha.getHours(),
    fecha.getMinutes(),
    fecha.getSeconds()
  );
  return nuevaFecha;
}

export function truncateDate(fecha) {

  let nuevaFecha = new Date(
    fecha.getFullYear(),
    fecha.getMonth(),
    fecha.getDate()
  );
  return nuevaFecha;
}

export function isDate(value) {
  switch (typeof value) {
    case 'number':
      return true;
    case 'string':
      return !isNaN(Date.parse(value));
    case 'object':
      if (value instanceof Date) {
        return !isNaN(value.getTime());
      }
    default:
      return false;
  }
}



export function getDayWeek(pdate) {
  let dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo", ''];
  let meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  //var x = document.getElementById("fecha");
  let date = new Date(pdate);//Date(x.value.replace(/-+/g, '/'));
  var fechaNum = date.getDate();
  var mon_name = date.getMonth();
  var day_name = date.getDay() - 1;
  if (day_name < 0) day_name = 6;
  console.log("day_name", day_name);
  //demo: return  Miercoles 26 de Mayo de 2021
  return dias[day_name] + " " + fechaNum + " de " + meses[mon_name] + " de " + date.getFullYear();

}


//////////////////////-<lista de Opciones>-Ini-//////////////////////////////////////

export function listarSaldoBolsaHoras() {
  return [{ Valor: "S", Descripcion: "POSITIVO" }, { Valor: "N", Descripcion: "NEGATIVO" }, { Valor: "T", Descripcion: "TODOS" }];
}

export function listarEstadoSimple() {
  return [{ Valor: "S", Descripcion: "ACTIVO" }, { Valor: "N", Descripcion: "INACTIVO" }];
}

export function listarEstado() {
  return [{ Valor: "S", Descripcion: "SÍ" }, { Valor: "N", Descripcion: "NO" }];
}

export function listarEstadoDotacion() {
  return [{ Valor: "N", Descripcion: "NO" }, { Valor: "S", Descripcion: "Sí, dotación por contrato" }, { Valor: "Y", Descripcion: "Sí, dotación por UO del contrato" }];
}

export function listarEstadoTodos() {
  return [{ Valor: "S", Descripcion: "SÍ" }, { Valor: "N", Descripcion: "NO" }, { Valor: "T", Descripcion: "TODOS" }];
}

export function listarTipoControl() {
  return [{ Valor: "I", Descripcion: "CHECK IN" }, { Valor: "O", Descripcion: "CHECK OUT" }, { Valor: "A", Descripcion: "AMBOS" }];
}

export function listarTipoEjecucion() {
  return [{ Valor: "AUTO", Descripcion: "AUTOMÁTICO" }, { Valor: 'PERSO', Descripcion: "PERSONALIZADO" }];
}

export function listarTipoAccionTransporte() {
  return [{ Valor: "1", Descripcion: "VIAJA PARA TRABAJAR" }, { Valor: "2", Descripcion: "VIAJA POR DESCANSO" }, { Valor: "0", Descripcion: "TODOS" }];
}

export function listarEstadoManifiesto() {
  return [{ Valor: "ABIERTO", Descripcion: "Abierto" }, { Valor: "CERRADO", Descripcion: "Cerrado" }, { Valor: "EMBARCADO", Descripcion: "Embarcado" }];
}

export function listarTipoOperacionAcreditacion() {
  return [
    { Valor: "M", Descripcion: "MOVILIZACION" },
    { Valor: "D", Descripcion: "DESMOVILIZACION" }
  ];
}

export function listarEstadoCierre() {
  return [{ Valor: "S", Descripcion: "Cerrado" }, { Valor: "N", Descripcion: "Abierto" }];
}

export function listarEstadoAprobado() {
  return [{ Valor: "S", Descripcion: "Aprobado" }, { Valor: "N", Descripcion: "No aprobado" }];
}

export function listarEstadoAprobacion() {
  return [
    { Valor: "I", Descripcion: "INCOMPLETA" },
    { Valor: "P", Descripcion: "PENDIENTE" },
    { Valor: "O", Descripcion: "OBSERVADA" },
    { Valor: "R", Descripcion: "RECHAZADA" },
    { Valor: "A", Descripcion: "APROBADA" }
  ];
}

export function listarTipoPerfil() {
  return [{ Valor: "I", Descripcion: "INTERNO" }, { Valor: "E", Descripcion: "EXTERNO" }];
}

export function listarSexoSimple() {
  return [{ Valor: "M", Descripcion: "MASCULINO" }, { Valor: "F", Descripcion: "FEMENINO" }];
}
export function listarTipoDato() {
  return [{ Valor: "I", Descripcion: "NÚMERO" }, { Valor: "S", Descripcion: "TEXTO" }, { Valor: "D", Descripcion: "FECHA" }];
}
export function listarTipoEntrada() {
  return [{ Valor: "E", Descripcion: "ENTRADA" }, { Valor: "S", Descripcion: "SALIDA" }, { Valor: "A", Descripcion: "AMBAS" }];
}

export function listarTipoDatoImportacion() {
  return [{ Valor: "N", Descripcion: "NUMERICO" }, { Valor: "S", Descripcion: "TEXTO" }, { Valor: "D", Descripcion: "FECHA" }];
}
export function listarTipoObjeto() {
  return [{ Valor: "B", Descripcion: "BOTON" }, { Valor: "T", Descripcion: "TAB" }];
}

export function listarTipoReporteSunafil() {
  return [{ Valor: "S", Descripcion: "HORAS TRABAJADAS" }, { Valor: "N", Descripcion: "MARCAS" }];
}

export const listarTipoNivel = [
  { Valor: "B", Descripcion: "BÁSICO - [La contraseña debe contener letras o números]", Mensaje: 'La contraseña debe contener letras o números' },
  { Valor: "I", Descripcion: "INTERMEDIO - [La contraseña debe contener letras y números]", Mensaje: 'La contraseña debe contener letras y números' },
  { Valor: "A", Descripcion: "AVANZADO - [La contraseña debe contener letras, números, mayúscula y símbolo]", Mensaje: 'La contraseña debe contener letras, números, mayúscula y símbolo' }];

export function listarTipoSeveridad() {
  return [{ Valor: 1, Descripcion: "SIMPLE" }, { Valor: 2, Descripcion: "INTERMEDIO" }, { Valor: 3, Descripcion: "ALTO" }];
}
export function listarTipoGrupo() {
  return [{ Valor: "1", Descripcion: "TODOS" }, { Valor: "2", Descripcion: "CON GRUPO VIGENTE" }, { Valor: "3", Descripcion: "CON GRUPO VENCIDO" }, { Valor: "4", Descripcion: "SIN GRUPO" }];
}

export function listarTipoPersonas() {
  return [{ Valor: 1, Descripcion: "TODOS" },
  { Valor: 2, Descripcion: "CON PLANILLA" },
  { Valor: 3, Descripcion: "SIN PLANILLA" },
  { Valor: 4, Descripcion: "CON CONDICIÓN ESPECIAL" },
  { Valor: 5, Descripcion: "SIN CONDICIÓN ESPECIAL" },
  { Valor: 6, Descripcion: "CON GRUPO" },
  { Valor: 7, Descripcion: "SIN GRUPO" },
  { Valor: 8, Descripcion: "CON HORARIO" },
  { Valor: 9, Descripcion: "SIN HORARIO" }
  ];
}


export function listarTipoAcreditacion() {
  return [{ Valor: "1", Descripcion: "TODOS" },
  { Valor: "2", Descripcion: "CON ACREDITACIÓN" },
  { Valor: "3", Descripcion: "SIN ACREDITACIÓN" }
  ];
}

export function listarGrupo() {
  return [{ Valor: "TODOS", Descripcion: "TODOS" }, { Valor: "SINASIG", Descripcion: "SIN ASIGNAR" }, { Valor: "VENCIDO", Descripcion: "VENCIDOS" }];
}

export function listarTipoCama() {
  return [{ Valor: "N", Descripcion: "TODOS" }, { Valor: "S", Descripcion: "EXCLUSIVAS" }];
}

export function transporteAplicaPara() {
  return [
    { Valor: "TODOS", Descripcion: "TODOS" },
    { Valor: "MBM", Descripcion: "MBM" },
    { Valor: "CONT", Descripcion: "CONTRATISTA" }
  ];
}

export function listarEstadosCama() {
  return [{ Valor: "L", Descripcion: "LIBRE" }, { Valor: "A", Descripcion: "ASIGNADO-EXCLUSIVA" }, { Valor: "R", Descripcion: "RESERVADO" }, { Valor: "O", Descripcion: "OCUPADO" }];
}

export function listarTipoHabitacion() {
  return [{ Valor: "", Descripcion: "TODOS" }, { Valor: "S", Descripcion: "EXCLUSIVAS" }];
}

export function listarCondicion() {
  return [
    { Valor: "TRABAJADOR", Descripcion: "TRABAJADOR" },
    //{ Valor: "CESADO", Descripcion: "CESADO" },
    { Valor: "VISITA", Descripcion: "VISITA" },
    { Valor: "LIBRE", Descripcion: "LIBRE" }
  ];
}

export function listarCondicionReportePersonas() {
  return [{ Valor: "ALTAS", Descripcion: "ALTAS" }, { Valor: "BAJAS", Descripcion: "BAJAS" }];
}

export function listarConsultaAccesoGrupos() {
  return [
    { Valor: "C01", Descripcion: "Compañia con grupos Asignados" },
    { Valor: "C02", Descripcion: "Compañia sin ningun grupo Asignado" },
  ];
}

export function listarConsultaGrupos() {
  return [
    { Valor: "C01", Descripcion: "Compañia con grupos Asignados" },
    { Valor: "C02", Descripcion: "Compañia con grupos Asignados sólo vigentes" },
    { Valor: "C03", Descripcion: "Compañia con grupos Vencidos" },
    { Valor: "C04", Descripcion: "Compañia sin ningun grupo Asignado" },
  ];
}

export function listarConsultaPerfiles() {
  return [
    { Valor: "C01", Descripcion: "Con Perfil Asignado" },
    { Valor: "C02", Descripcion: "Sin Perfil Asignado" },
  ];
}


export function listarConsultaCompanias() {
  return [
    { Valor: "CC01", Descripcion: "Con Compañía Asignado" },
    { Valor: "CC02", Descripcion: "Sin Compañía Asignado" },
  ];
}

export const PersonaCondicion = () => {
  return {
    TRABAJADOR: 'TRABAJADOR',
    CESADO: 'CESADO',
    VISITA: 'VISITA'
  }
}

export function listarTurno() {
  return [{ Valor: "D", Descripcion: "DIA" }, { Valor: "N", Descripcion: "NOCHE" }];
}



export function listarIconos() {
  return [{ id: "inactivefolder", name: 'Inactivefolder', icon: 'inactivefolder' },
  { id: "activefolder", name: 'Activefolder', icon: 'activefolder' },
  { id: "map", name: 'Map', icon: 'map' },
  { id: "key", name: 'Key', icon: 'key' },
  { id: "bookmark", name: 'Bookmark', icon: 'bookmark' },
  { id: "user", name: 'User', icon: 'user' },
  { id: "columnfield", name: 'Columnfield', icon: 'columnfield' },
  ];
}

export const listarContratista = [
  { Valor: "S", Descripcion: "SI" },
  { Valor: "N", Descripcion: "NO" }];


export const clasificarCompania = [
  { Valor: "S", Descripcion: "SI" },
  { Valor: "N", Descripcion: "NO" },
  { Valor: "P", Descripcion: "SIN PERSONA" }
];

//////////////////////-<lista de Opciones>-End//////////////////////////////////////

//////////////////////-<lista de Unidad de Medida de Almacenamiento / Sistema - Repositorio >-Ini//////////////////////////////////////
export function listarUnidadMedida() {
  return [
    { Valor: "MB", Descripcion: "Megabyte" },
    { Valor: "GB", Descripcion: "Gigabyte" },
    { Valor: "TB", Descripcion: "Terabyte" }
  ]
}
//////////////////////-<lista de Unidad de Medida de Almacenamiento / Sistema - Repositorio >-End//////////////////////////////////////

//////////////////////-<lista de Opciones Acceso - Marcaciones >-Ini//////////////////////////////////////
export function listarTipoMarcacion() {
  return [
    { Valor: "C", Descripcion: "CHOFER" },
    { Valor: "P", Descripcion: "PASAJERO" },
    { Valor: "T", Descripcion: "TRANSEÚNTE" },
    { Valor: "V", Descripcion: "VEHÍCULO" },
  ];
}

export function listarTipoReporte() {
  return [
    { Valor: "V", Descripcion: "VEHICULOS" },
    { Valor: "P", Descripcion: "PERSONAS" }

  ];
}


export function listarModoMarcacion() {
  return [
    { Valor: "S", Descripcion: "ENTRADA" },
    { Valor: "N", Descripcion: "SALIDA" }
  ];
}

export function listarEntidadControl() {
  return [
    { Valor: "T", Descripcion: "PERSONAS" },
    { Valor: "V", Descripcion: "VEHICULOS" }
  ];
}

//////////////////////-<lista de Opciones Acceso - Marcaciones>-End//////////////////////////////////////


//////////////////////-<lista de Opciones Acreditacion  >-Ini//////////////////////////////////////
export function listarTipoDatoEvaluar() {
  return [
    { Valor: "T", Descripcion: "Texto", Tipo: "dxTextBox" },
    { Valor: "F", Descripcion: "Fecha", Tipo: "dxDateBox" },
    { Valor: "L", Descripcion: "Lista", Tipo: "dxTextBox" },
    { Valor: "N", Descripcion: "Número", Tipo: "dxNumberBox" },
    { Valor: "A", Descripcion: "Archivo", Tipo: "dxTextBox" },
  ];
}

export function listarTipoRequisito() {
  return [
    { Valor: "S", Descripcion: "Solicitante" },
    { Valor: "A", Descripcion: "Autorizador" }
  ];
}


export function listarTipoImpresion() {
  return [{ Valor: "S", Descripcion: "IMPRESO" }, { Valor: "N", Descripcion: "NO IMPRESO" }, { Valor: "", Descripcion: "TODOS" }];
}


export function listarVigencia() {
  return [{ Valor: "S", Descripcion: "VIGENTE" }, { Valor: "N", Descripcion: "NO VIGENTE" }, { Valor: "", Descripcion: "TODOS" }];
}

export function listarIdentificacion() {
  return [{ Valor: "S", Descripcion: "ENROLADO" }, { Valor: "N", Descripcion: "PENDIENTE" }];
}

export function listarTipo() {
  return [
    { Valor: "R", Descripcion: "ROSTRO" },
    { Valor: "M", Descripcion: "MANO" },
    { Valor: "D", Descripcion: "DEDO" },
    { Valor: "I", Descripcion: "IRIS" },
    { Valor: "V", Descripcion: "VOZ" }];
}

export function listarTipoConsulta() {
  return [{ Valor: "T", Descripcion: "TOTALIZADO" }, { Valor: "P", Descripcion: "PROMEDIO" }];
}

export function listarIntervaloControl() {
  return [
    { valor: "1", descripcion: "1 HORAS" },
    { valor: "2", descripcion: "2 HORAS" },
    { valor: "3", descripcion: "3 HORAS" },
    { valor: "4", descripcion: "4 HORAS" },
    { valor: "6", descripcion: "6 HORAS" },
    { valor: "8", descripcion: "8 HORAS" },
    { valor: "12", descripcion: "12 HORAS" },
    { valor: "24", descripcion: "24 HORAS" }
  ];
}

export function listarFrecuencia() {
  return [{ Valor: "D", Descripcion: "DIARIA" }, { Valor: "S", Descripcion: "SEMANAL" }];
}

export function listarUnidadTiempo() {
  return [{ Valor: "H", Descripcion: "HORA" }, { Valor: "M", Descripcion: "MINUTO" }];
}

//////////////////////-<lista de Opciones Acreditacion  >-End//////////////////////////////////////

export function DiasSemana() {
  return [
    { Dia: 1, Descripcion: 'CAMP.RESERVATION.WEEKDAY.SUNDAY' },
    { Dia: 2, Descripcion: 'CAMP.RESERVATION.WEEKDAY.MONDAY' },
    { Dia: 3, Descripcion: 'CAMP.RESERVATION.WEEKDAY.TUESDAY' },
    { Dia: 4, Descripcion: 'CAMP.RESERVATION.WEEKDAY.WEDNESDAY' },
    { Dia: 5, Descripcion: 'CAMP.RESERVATION.WEEKDAY.THURSDAY' },
    { Dia: 6, Descripcion: 'CAMP.RESERVATION.WEEKDAY.FRIDAY' },
    { Dia: 7, Descripcion: 'CAMP.RESERVATION.WEEKDAY.SATURDAY' }
  ];
}

export function Meses() {
  return [
    { Mes: 1, Descripcion: "CAMP.RESERVATION.MONTHS.JANUARY", Abr: "Ene." },
    { Mes: 2, Descripcion: "CAMP.RESERVATION.MONTHS.FEBRUARY", Abr: "Feb." },
    { Mes: 3, Descripcion: "CAMP.RESERVATION.MONTHS.MARCH", Abr: "Mar." },
    { Mes: 4, Descripcion: "CAMP.RESERVATION.MONTHS.APRIL", Abr: "Abr." },
    { Mes: 5, Descripcion: "CAMP.RESERVATION.MONTHS.MAY", Abr: "May." },
    { Mes: 6, Descripcion: "CAMP.RESERVATION.MONTHS.JUNE", Abr: "Jun." },
    { Mes: 7, Descripcion: "CAMP.RESERVATION.MONTHS.JULY", Abr: "Jul." },
    { Mes: 8, Descripcion: "CAMP.RESERVATION.MONTHS.AUGUST", Abr: "Ago." },
    { Mes: 9, Descripcion: "CAMP.RESERVATION.MONTHS.SEPTEMBER", Abr: "Sep." },
    { Mes: 10, Descripcion: "CAMP.RESERVATION.MONTHS.OCTOBER", Abr: "Oct." },
    { Mes: 11, Descripcion: "CAMP.RESERVATION.MONTHS.NOVEMBER", Abr: "Nov." },
    { Mes: 12, Descripcion: "CAMP.RESERVATION.MONTHS.DECEMBER", Abr: "Dic." },
  ];
}

export function getMonths() {
  return [
    { Id: '01', Descripcion: "CAMP.RESERVATION.MONTHS.JANUARY", Mes: "ENERO" },
    { Id: '02', Descripcion: "CAMP.RESERVATION.MONTHS.FEBRUARY", Mes: "FEBRERO" },
    { Id: '03', Descripcion: "CAMP.RESERVATION.MONTHS.MARCH", Mes: "MARZO" },
    { Id: '04', Descripcion: "CAMP.RESERVATION.MONTHS.APRIL", Mes: "ABRIL" },
    { Id: '05', Descripcion: "CAMP.RESERVATION.MONTHS.MAY", Mes: "MAYO" },
    { Id: '06', Descripcion: "CAMP.RESERVATION.MONTHS.JUNE", Mes: "JUNIO" },
    { Id: '07', Descripcion: "CAMP.RESERVATION.MONTHS.JULY", Mes: "JULIO" },
    { Id: '08', Descripcion: "CAMP.RESERVATION.MONTHS.AUGUST", Mes: "AGOSTO" },
    { Id: '09', Descripcion: "CAMP.RESERVATION.MONTHS.SEPTEMBER", Mes: "SEPTIEMBRE" },
    { Id: '10', Descripcion: "CAMP.RESERVATION.MONTHS.OCTOBER", Mes: "OCTUBRE" },
    { Id: '11', Descripcion: "CAMP.RESERVATION.MONTHS.NOVEMBER", Mes: "NOVIEMBRE" },
    { Id: '12', Descripcion: "CAMP.RESERVATION.MONTHS.DECEMBER", Mes: "DICIEMBRE" },
  ];
}

export function getDays() {
  return [
    { Id: '01', Descripcion: "01" },
    { Id: '02', Descripcion: "02" },
    { Id: '03', Descripcion: "03" },
    { Id: '04', Descripcion: "04" },
    { Id: '05', Descripcion: "05" },
    { Id: '06', Descripcion: "06" },
    { Id: '07', Descripcion: "07" },
    { Id: '08', Descripcion: "08" },
    { Id: '09', Descripcion: "09" },
    { Id: '10', Descripcion: "10" },
    { Id: '11', Descripcion: "11" },
    { Id: '12', Descripcion: "12" },
    { Id: '13', Descripcion: "13" },
    { Id: '14', Descripcion: "14" },
    { Id: '15', Descripcion: "15" },
    { Id: '16', Descripcion: "16" },
    { Id: '17', Descripcion: "17" },
    { Id: '18', Descripcion: "18" },
    { Id: '19', Descripcion: "19" },
    { Id: '20', Descripcion: "20" },
    { Id: '21', Descripcion: "21" },
    { Id: '22', Descripcion: "22" },
    { Id: '23', Descripcion: "23" },
    { Id: '24', Descripcion: "24" },
    { Id: '25', Descripcion: "25" },
    { Id: '26', Descripcion: "26" },
    { Id: '27', Descripcion: "27" },
    { Id: '28', Descripcion: "28" },
    { Id: '29', Descripcion: "29" },
    { Id: '30', Descripcion: "30" },
    { Id: '31', Descripcion: "31" }
  ];
}

export function listarEstadoIncidencias() {
  return [{ Valor: "S", Descripcion: "JUSTIFICADOS" }, { Valor: "N", Descripcion: "SIN JUSTIFICAR" }, { Valor: "T", Descripcion: "TODOS" }];
}

export const exportExcelDataGrid = (title, refDataGrid, fileName) => {

  const workbook = new ExcelJS.Workbook();
  const dataSheet = workbook.addWorksheet('data');

  dataSheet.getRow(2).getCell(2).value = title;
  dataSheet.getRow(2).getCell(2).font = { bold: true, size: 16, underline: 'double' };

  exportDataGrid({
    worksheet: dataSheet,
    component: refDataGrid,
    topLeftCell: { row: 4, column: 2 },
    customizeCell: function (options) {
      setAlternatingRowsBackground(options.gridCell, options.excelCell);
    }
  }).then(function () {
    workbook.xlsx.writeBuffer().then(function (buffer) {
      FileSaver.saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `${fileName}.xlsx`);

    });
  });
}

function setAlternatingRowsBackground(gridCell, excelCell) {
  if (gridCell.rowType === 'header' || gridCell.rowType === 'data') {
    if (excelCell.fullAddress.row % 2 === 0) {
      excelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D3D3D3' }, bgColor: { argb: 'D3D3D3' } };
    }
  }
}

//exportExcelDataGrid //Pendiente// exportExcelDataGridCustomer

//Resgistrar datos temporal
export function setDataTempLocal(key, data) {
  // let result = JSON.parse(localStorage.getItem(`vcg:${key}`));
  if (isNotEmpty(data)) {
    localStorage.setItem(`vcg:${key}`, JSON.stringify(data));
  }
  return data;
}
export function getDataTempLocal(key) {
  let result = JSON.parse(localStorage.getItem(`vcg:${key}`));
  if (isNotEmpty(result)) {
    return result;
    // result = {};
  }

}
export function removeDataTempLocal(key) {
  localStorage.removeItem(`vcg:${key}`);
}

export async function listarTipoDocumento(object) {
  const { IdPais } = object;
  let result = JSON.parse(localStorage.getItem('vcg:administracionTipoDocu'));
  // console.log("listarTipoDocumento.local", result);
  if (!isNotEmpty(result)) {
    // console.log("Sin Data");
    await obtenerTodosTipoDocumento({ IdPais }).then(response => {
      result = response;
      localStorage.setItem('vcg:administracionTipoDocu', JSON.stringify(response))
    });
  }
  //  console.log("listarTipoDocumento", result);
  return result;
}


export async function listarTipoSangre() {
  let result = JSON.parse(localStorage.getItem('vcg:administracionTipoSangre'));
  if (!isNotEmpty(result)) {
    await obtenerTodosTipoSangre().then(response => {
      result = response;
      localStorage.setItem('vcg:administracionTipoSangre', JSON.stringify(response))
    });
  }
  return result;
}

export async function listarEstadoCivil() {
  let result = JSON.parse(localStorage.getItem('vcg:administracionEstadoCivil'));
  if (!isNotEmpty(result)) {
    await obtenerTodosEstadoCivil().then(response => {
      result = response;
      localStorage.setItem('vcg:administracionEstadoCivil', JSON.stringify(response))
    });
  }
  return result;
}

export async function listarLicencia(object) {
  const { IdPais } = object;
  let result = JSON.parse(localStorage.getItem('vcg:administracionLicencia'));
  if (!isNotEmpty(result)) {
    await obtenerTodosLicencias({ IdPais }).then(response => {
      result = response;
      localStorage.setItem('vcg:administracionLicencia', JSON.stringify(response))
    });
  }
  return result;
}


export async function listarDivision(object) {
  const { IdCliente } = object;
  let result = JSON.parse(localStorage.getItem('vcg:administracionDivision'));
  if (!isNotEmpty(result)) {
    await obtenerCmbDivision({ IdCliente }).then(response => {
      result = response;
      localStorage.setItem('vcg:administracionDivision', JSON.stringify(response))
    });
  }
  return result;
}

export async function listarTipoPosicion(object) {
  console.log("***listarTipoPosicion(object)",object);
  const { IdCliente,Activo} = object;
  let result = JSON.parse(localStorage.getItem('vcg:administracionTipoPosicion'));
  if (!isNotEmpty(result)) {
    await obtenerCmbTipoPosicion({ IdCliente,Activo:isNotEmpty(Activo)?Activo:'%'}).then(response => {
      result = response;
      localStorage.setItem('vcg:administracionTipoPosicion', JSON.stringify(response))
    });
  }
  return result;
}

export async function listarFuncion(object) {
  const { IdCliente } = object;
  let result = JSON.parse(localStorage.getItem('vcg:administracionFuncion'));
  if (!isNotEmpty(result)) {
    await obtenerCmbFuncion({ IdCliente }).then(response => {
      result = response;
      localStorage.setItem('vcg:administracionFuncion', JSON.stringify(response))
    });
  }
  return result;
}

export async function validarUsoLicencia(params) {
  const { IdCliente, IdModulo } = params;
  let nextRow = true;
  await validarLicencia({ IdCliente, IdModulo }).then(response => {
    if (response.length > 0) {
      const { Texto, UsadasPorcentaje, LicSaldo, LicAdquirida, LicUsadas } = response[0];
      if (UsadasPorcentaje > 99) {
        nextRow = false;
        //Alerta Restrictivo
        handleWarningMessages(Texto + ". " + LicAdquirida + ". " + LicUsadas + ". ");
      } else {
        //Alerta informativo
        handleInfoMessages(Texto + ". " + LicAdquirida + ". " + LicUsadas + ". " + LicSaldo);
      }
    }

  });

  return nextRow;
}

//////////////////////////// FUNCIONES PARA DESCARGA DE ARCHIVOS //////////////////////////////////////

export function base64ToArrayBuffer(base64) {
  var binaryString = window.atob(base64);
  var binaryLen = binaryString.length;
  var bytes = new Uint8Array(binaryLen);
  for (var i = 0; i < binaryLen; i++) {
    var ascii = binaryString.charCodeAt(i);
    bytes[i] = ascii;
  }
  return bytes;
}

export function saveByteArray(reportName, byte, filetype) {
  var blob = new Blob([byte], { type: filetype });
  var link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  var fileName = reportName;
  link.download = fileName;
  link.click();
};

//////////////////////-<Configuración Campos: isRequired/isModified  >-INI-//////////////////////////////////////

export function currentItem(data, identity) {
  if (isNotEmpty(data)) {
    return data.length > 0 ? data.find(item => item.Campo.toUpperCase() === identity.toUpperCase()) : undefined;
  }
  return undefined;
}

// export function isRequired(identity, data) {
//   let result = currentItem(data, identity);
//   return result ? (result.Obligatorio === 'S') : false;
// }

// export function isModified(identity, data) {
//   // console.log("isModified", identity, data);
//   let result = currentItem(data, identity);
//   return result ? (result.Modificable === 'S') : false;
// }

export const PaginationSetting = {
  TOTAL_RECORDS: 20,
  SHOW_MAX: 5,
};

//////////////////////-<Configuración Campos: >-END-//////////////////////////////////////

export const PatterRuler = {
  //LETRAS_NUMEROS: `^[A-Za-z0-9\g]+$`,//("[0-9a-zA-Z\g]+$");
  //HORARIO: `^[A-Za-z0-9'_:-.,:“”""()/ñ \g]+$`,
  LETRAS_NUMEROS: "^[0-9a-zA-Z \g]+$",
  SOLO_LETRAS: `^[A-Za-z'\g]+$`, // `^[A-Za-z'\g]+$`
  SOLO_NUMEROS: `^[0-9]+$`,
  //SOLO_NUMEROS: `/^\[0-9]+$/`,
  LETRAS_NUMEROS_GUIONES: "^[0-9a-zA-Z\g_-]+$",
  //LETRAS_DESCRIPCION: `^[A-Za-zÁÉÍÓÚÑ0-9'&.,:“”""()/ñ \g]+$`, //`[A-Za-z0-9'&.,:“”""() \g]+$`,
  LETRAS_DESCRIPCION: `^[A-Za-zÁÉÍÓÚÑáéíóú0-9'&.,:“”""-_()/ñÑ \g]+$`,
  CODE: `^[A-Za-z0-9ñÑ\g_-]+$`,
  IP: `^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$`,
  MACADDRESS: "^([0-9A-Fa-f]{2}[:-])" + "{5}([0-9A-Fa-f]{2})|" + "([0-9a-fA-F]{4}\\." + "[0-9a-fA-F]{4}\\." + "[0-9a-fA-F]{4})$",
  HOSTNAME: "^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$",
  PATH: "^(.+)\/([^/]+)$",
  HORARIO: `^[A-Za-zÁÉÍÓÚÑ0-9'&.,:“”""-_()/ñ \g]+$`,
  RUC: "/\d{11}/",
  DNI: "/^\D*\d{8}$/"
}

// ^[\w]{15}$
// /^\D*\d{3}$/


/* ::::::::::::::::::::::::: FUNCIONES GENERALES DE VALIDACION - INI :::::::::::::::::::::::::::::::::*/

export const isString = value => typeof value === "string";
export const isNumber = value => typeof value === "number";
export const isBoolean = value => typeof value === "boolean";
export const isPrimitive = value => typeof value === "string" || typeof value === "number" || typeof value === "boolean";
export const isSet = value => value !== "" && value !== null && value !== undefined;
export const isUnset = value => value === "" || value === null || value === undefined;
//export const isNullOrUndefined = value => value === null || value === undefined;
export const isArray = (value, validateIfNotEmpty = false) => Array.isArray(value) && (!validateIfNotEmpty || (validateIfNotEmpty && value.length > 0))
export const isObject = value => typeof value === 'object' && value !== null && !Array.isArray(value);
export const isObjectOrArray = value => (typeof value === 'object' && value !== null) || Array.isArray(value);
export const isFunction = value => value && typeof value === "function";
export const isBooleanOrFunction = value => isBoolean(value) || isFunction(value);
export const isPrimitiveOrFunction = value => isPrimitive(value) || isFunction(value);
export const isStringOrFunction = value => isString(value) || isFunction(value);
export const arePlainArraySame = (arr1, arr2) => {
  if (typeof arr1 !== typeof arr2) return false;
  if (!isArray(arr1) || !isArray(arr2)) return false;
  if (arr1.length !== arr2.length) return false;
  return !arr1.some((v1, i1) => v1 !== arr2[i1]);
}

/* ::::::::::::::::::::::::: FUNCIONES GENERALES DE VALIDACION - END :::::::::::::::::::::::::::::::::*/

export const MensajeValidacionLogin = [
  { Id: '00', Descripcion: "AUTH.LOGIN.MESSAGE.SERVER_ERROR" },
  { Id: '01', Descripcion: "AUTH.LOGIN.MESSAGE.NO_EXISTE" },
  { Id: '02', Descripcion: "AUTH.LOGIN.MESSAGE.SIN_PERFIL" },
  { Id: '03', Descripcion: "AUTH.LOGIN.MESSAGE.SIN_DIVISION" },
  { Id: '04', Descripcion: "AUTH.LOGIN.MESSAGE.BLOQUEADO_X_INTENTOS" },
  { Id: '05', Descripcion: "AUTH.LOGIN.MESSAGE.SIN_CORREO" },
  { Id: '06', Descripcion: "AUTH.LOGIN.MESSAGE.SIN_TELEFONO" },
  { Id: '07', Descripcion: "AUTH.LOGIN.MESSAGE.ERROR" },
  { Id: '08', Descripcion: "AUTH.LOGIN.MESSAGE.NO_EXISTE_COD_SEGURIDAD" },
  { Id: '09', Descripcion: "AUTH.LOGIN.MESSAGE.BLOQUEADO_X_COD_SEG" },
  { Id: '10', Descripcion: "AUTH.LOGIN.MESSAGE.USUARIO_INACTIVADO" },
  { Id: '12', Descripcion: "AUTH.LOGIN.MESSAGE.USUARIO_SIN_COMPANIA_ACTUAL" }
];

/* ::::::::::::::::::::::::: FUNCIONES configuracion de aplicaciones :::::::::::::::::::::::::::::::::*/
export function getLicencias() {
  return [
    { id: '01', title: "", icon: "acreditacion", activo: 's' }
  ]
}

export const IMG_CARRUSEL = [
  "2personnel_slide_mineria_nov_final-2.jpg",
  "2personnel_slide_industry_18_nov-3.jpg",
  "2p_final_construccion.jpg",
  "2personnel_slide_agroindustria_nov-4.jpg"
];

// export const IMG_CARRUSEL_X = [
//   "https://2personnel.com/wp-content/uploads/2020/11/2personnel_slide_mineria_nov_final-2.jpg",
//   "https://2personnel.com/wp-content/uploads/2020/11/2personnel_slide_industry_18_nov-3.jpg",
//   "https://2personnel.com/wp-content/uploads/2020/11/2p_final_construccion.jpg",
//   "https://2personnel.com/wp-content/uploads/2020/11/2personnel_slide_agroindustria_nov-4.jpg"
// ];

// export const MENU_PRINCIPAL = [
//   { classIcon: '2personnel', text: "CONFIG.SISTEMA", activo: 1, accion: null },
//    { classIcon: 'acreditacion', text: 'ACCREDITATION.MAIN', activo: 1, accion: 'https://2personnelplus.whitelion.pe:8086/' },
//   //{ classIcon: 'acreditacion', text: 'ACCREDITATION.MAIN', activo: 1, accion: 'http://localhost:3001/' },
//   // { classIcon: 'asistencia', text: 'ASSISTANCE.MAIN', activo: 1, accion: 'http://192.168.3.41:8087/' },
//   // { classIcon: 'hoteleria', text: 'HOSPITALITY.MAIN', activo: 0, accion: null },
//   // { classIcon: 'comedor', text: 'CASINO.DINNINGROOM', activo: 0, accion: null },
//   // { classIcon: 'Transporte', text: 'TRANSPORT.MAIN', activo: 1, accion: 'http://192.168.3.41:8085/' },
//   // { classIcon: 'acceso', text: 'ACCESS.MAIN', activo: 0, accion: null },
//   // { classIcon: 'identificacion', text: 'CONFIG.MODULE.IDENTIFICACION', activo: 0, accion: null },
//   // { classIcon: 'induccionymantenimiento', text: 'CONFIG.MODULE.INDUCCIONES', activo: 0, accion: null },
//   // { classIcon: 'EPP', text: 'CONFIG.MENU.EPPS', activo: 0, accion: null },
//   // { classIcon: 'Dashboard', text: 'CONFIG.MENU.CAMPAMENTOS.DASHBOARD', activo: 0, accion: 'https://2personnelplus.whitelion.pe:8080/auth/login#/' },

// ]

export const TYPE_SISTEMA_ENTIDAD = {
  COMPANIA: "C",
  FOTOCHEK: "F",
  PERSONAS: "P",
  VEHICULOS: "V",
}

export const TYPE_TIPO_REQUISITO = {
  SOLICITANTE: "S",
  AUTORIZADOR: "A",
}

export const TYPE_IDENTIFICACION_TIPOIDENTIFICACION = {
  DOCUMENTO_DE_IDENTIDAD: "DOCIDE",
  RECONOCIMIENTO_FACIAL: "FACIAL",
  FOTOCHECK: "FOTOCHECK",
  HUELLA_DIGITAL: "HUELLA",
}

export const STATUS_ACREDITACION_SOLICITUD = {
  INCOMPLETA: "I",
  PENDIENTE: "P",
  OBSERVADO: "O",
  RECHAZADO: "R",
  APROBADO: "A",
}


//dd
export const PANTALLAS_ACREDITACION = {
  TARJETA: "T",
  LISTA: "L",
  EDITAR: 'E',
  LISTAR_MASIVO: 'LM',
  EDITAR_MASIVO: 'EM'
}

export function listarComps() {
  return [
    { Valor: "COM1", Descripcion: "COM1" },
    { Valor: "COM2", Descripcion: "COM2" },
    { Valor: "COM3", Descripcion: "COM3" },
    { Valor: "COM4", Descripcion: "COM4" },
    { Valor: "COM5", Descripcion: "COM5" },
    { Valor: "COM6", Descripcion: "COM6" },
    { Valor: "COM7", Descripcion: "COM7" },
    { Valor: "COM8", Descripcion: "COM8" },
    { Valor: "COM9", Descripcion: "COM9" },
  ];
}

export const EstadoSolicitudAsistenciaHHEE = [
  { Valor: "P", Descripcion: "Pendiente" },
  { Valor: "E", Descripcion: "En proceso" },
  { Valor: "R", Descripcion: "Rechazada" },
  { Valor: "A", Descripcion: "Aprobada" }
];

//Custom grid: ::::::::::::::::::::::::::::::::
export const transformData = {
  FechaInicio: (rawValue) => dateFormat(rawValue, "yyyyMMdd"),
  FechaFin: (rawValue) => dateFormat(rawValue, "yyyyMMdd"),
}
export const reverseTransformData = {
  FechaInicio: (value) => convertyyyyMMddToDate(value),
  FechaFin: (value) => convertyyyyMMddToDate(value),
}

//Formato HH:mm para asistencia ===============================
export const getTimeFormat = (field) => {
  let TotalMinutos = field;
  let horas = Math.floor(TotalMinutos / 60);
  let minutos = TotalMinutos % 60;
  let indexSubstring = horas > 99 ? -3 : -2;
  return `${("000" + horas).slice(indexSubstring)}:${("000" + minutos).slice(-2)}`;

};

export const timeFormatMinutes = (strMinutes) => {
  let strformat = "";

  if (!strMinutes || strMinutes === "" || strMinutes === null) {
    return 0;
  }
  strMinutes = strMinutes.replace(":", "");

  switch (strMinutes.length) {
    case 1: strformat = "0" + strMinutes + "00"; break;
    case 2: strformat = strMinutes + "00"; break;
    case 3: strformat = strMinutes + "0"; break;
    case 4: strformat = strMinutes; break;
    default: strformat = "0000"; break;
  }

  let hours = parseInt(strformat.substring(0, 2));
  let minutes = parseInt(strformat.substring(2, 4));

  return minutes + (hours * 60);
}

export const CellHorasRender = ({ field }) => {
  let TotalMinutos = "00:00";

  //Para valores numericos: 
  if (field !== null && field !== undefined) {
    TotalMinutos = getTimeFormat(field);
  }

  //Para valores cadena; 
  if (typeof field === "string") {
    TotalMinutos = timeFormatMinutes(field);
    TotalMinutos = getTimeFormat(TotalMinutos);
  }

  return (
    <div style={{ textAlign: "center" }}>
      {TotalMinutos}
    </div>
  );
};
//==============================================================
export const colsSpanDefault = (colSpan) => {
  return `col-xs-12 col-sm-12 col-md-${colSpan} col-lg-${colSpan} col-xl-${colSpan} col-xxl-${colSpan}`;
}



export function NivelesUbicacionPais() {
  return [
    { Pais: "AR", Ubicacion: {Nivel1:"Provincia",Nivel2:"Departamento",Nivel3:"Municipio"} },
    { Pais: "BRA", Ubicacion: {Nivel1:"Estado",Nivel2:"Municipio",Nivel3:"Ciudad"} },
    { Pais: "CH", Ubicacion: {Nivel1:"Región",Nivel2:"Provincia",Nivel3:"Comuna"} },
    { Pais: "CO", Ubicacion: {Nivel1:"Departamento",Nivel2:"Municipio",Nivel3:"Comuna"} },
    { Pais: "PE", Ubicacion: {Nivel1:"Departamento",Nivel2:"Provincia",Nivel3:"Distrito"} },
    { Pais: "V", Ubicacion: {Nivel1:"Departamento",Nivel2:"Provincia",Nivel3:"Distrito"} } ,
    { Pais: "ECU", Ubicacion: {Nivel1:"Provincia",Nivel2:"Cantón",Nivel3:"Parroquia"} },
  ];
}