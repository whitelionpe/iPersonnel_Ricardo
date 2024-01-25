import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/AcreditacionSolicitud";

export function obtener(params) {
  return from(axios.get(`${URL}/obtener`, { params: params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtenerTodos(params) {
  return from(axios.get(`${URL}/obtenerTodos`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function listar(params) {
  return from(axios.get(`${URL}/listar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function crear(params) {
  return from(axios.post(`${URL}/crear`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function actualizar(params) {
  return from(axios.put(`${URL}/actualizar`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function eliminar(params) {
  return from(axios.delete(`${URL}/eliminar`, { params: params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export const storeListar = `${URL}/filtrar`;





export function actualizarautorizador(params) {
  return from(axios.post(`${URL}/actualizarsolicitanteautorizador`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export const storeReportes = `${URL}/reporteGeneral`;



//********************************* MOVILIZACION   ******************************** */
//PERSONAS
export const storeListarGeneral = `${URL}/filtrarGeneral`;
export function obtenerbyautorizador(params) {
  return from(axios.get(`${URL}/obtenersolicitud`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

//VEHICULOS
export const storeListarSolicitudVehiculo = `${URL}/filtrarSolicitudVehiculo`;
export function obtenerSolicitudVehiculoAutorizador(params) {
  return from(axios.get(`${URL}/obtenersolicitudvehiculoautorizador`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}
//VISITAS
export const storeListarMovilizacionVisita = `${URL}/filtrarMovilizacionVisita`;
//EN ESTA RUTA SE ENCUENTRA
// import { listarbySolicitud, obtenerbysolicitante } from "../../../../../../api/acreditacion/visitaPersona.api";

//********************************* DESMOVILIZACION   ******************************** */
export const storeListarDesmovilizacionPersona = `${URL}/filtrarDesmovilizacionPersona`;
export const storeListarDesmovilizacionVehiculo = `${URL}/filtrarDesmovilizacionVehiculo`;

export function obtenerSolicitudDesmovilizacionPersona(params) {
  return from(axios.get(`${URL}/ObtenerSolicitudAutorizadorpersona`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtenerSolicitudDesmovilizacionVehiculo(params) {
  return from(axios.get(`${URL}/obtenersolicituddesmovilizacionvehiculo`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

//********************************* ACTUALIZACION   ******************************** */
export const storeListarActualizacionPersona = `${URL}/filtrarActualizacionPersona`;
export const storeListarActualizacionVehiculo = `${URL}/filtrarActualizacionVehiculo`;

export function obtenerSolicitudActualizacionPersona(params) {
  return from(axios.get(`${URL}/obtenerSolicitudActualizacionPersona`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtenerSolicitudActualizacionVehiculo(params) {
  console.log("call api rest -> params", params);
  return from(axios.get(`${URL}/obtenerSolicitudActualizacionVehiculo`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}


//********************************* DESCARGAS   ******************************** */
export const serviceSolicitud = {

  exportarExcel: (params) => {
    return from(axios.post(`${URL}/exportarExcel`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  exportarExcelSolicitudVehiculo: (params) => {
    return from(axios.post(`${URL}/exportarExcelSolicitudVehiculo`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  exportarExcelMovilizacionVisita: (params) => {
    return from(axios.post(`${URL}/exportarExcelMovilizacionVisita`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  exportarExcelDesmovilizacionPersona: (params) => {
    return from(axios.post(`${URL}/exportarExcelDesmovilizacionPersona`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  exportarExcelDesmovilizacionVehiculo: (params) => {
    return from(axios.post(`${URL}/exportarExcelDesmovilizacionVehiculo`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  exportarExcelActualizacionPersona: (params) => {
    return from(axios.post(`${URL}/exportarExcelActualizacionPersona`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  exportarExcelActualizacionVehiculo: (params) => {
    return from(axios.post(`${URL}/exportarExcelActualizacionVehiculo`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  downloadFile: (params) => {
    return from(axios.post(`${URL}/downloadFileBase64`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  }

}

export function excelformato(params) {
  return from(axios.get(`${URL}/excelformato`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function downloadFile(params) {
  return from(axios.get(`${URL}/downloadFileBase64`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}