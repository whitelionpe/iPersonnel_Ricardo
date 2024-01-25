import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/identificacionpersonacredencial";

export const ServicePersonaCredencial = {

  obtener: (params) => {
    return from(axios.get(`${URL}/obtener`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  obtenerPrintBadge: (params) => {
    return from(axios.get(`${URL}/obtenerPrintBadge`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  obtenerTodos: (params) => {
    return from(axios.get(`${URL}/obtenerTodos`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  listar: (params) => {
    return from(axios.get(`${URL}/listar`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  crear: (params) => {
    return from(axios.post(`${URL}/crear`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  actualizar: (params) => {
    //console.log("Actualizar", params);
    return from(axios.put(`${URL}/actualizar`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  eliminar: (params) => {
    return from(axios.delete(`${URL}/eliminar`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  exportarExcelIdentificacionPersonas: (params) => {
    return from(axios.post(`${URL}/exportarExcelIdentificacionPersonas`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

}

export function devolucionFotocheck(params) {
  return from(axios.put(`${URL}/devolucionFotocheck`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

// export function obtenerCredencial(params) {
//   return from(axios.get(`${URL}/obtenerCredencial`, { params })).pipe(
//     map(result => result.data.result)
//   ).toPromise();
// }

export function devolucionFotocheckMasiva(params) {
  return from(axios.get(`${URL}/devolucionFotocheckMasiva`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export const storeListarIdentificacionPersonas = `${URL}/filtrarIdentificacionPersonas`;

