import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from "rxjs";
import { map } from "rxjs/operators";

export const URL = Constants.API_URL + "/api/asistenciasolicitudhhee";
 
export function dashboardautorizador(params) {
  return from(axios.get(`${URL}/dashboardautorizador`, { params }))
    .pipe(map(result => result.data.result))
    .toPromise();
}
 
export function obtener(params) {
  return from(axios.get(`${URL}/obtener`, { params }))
    .pipe(map(result => result.data.result))
    .toPromise();
} 
export const storeListar = `${URL}/filtrar`; 
export const storeListarConsulta = `${URL}/filtrarconsulta`; 
export const storeListarCompaniaResumen = `${URL}/filtrarcompaniaresumen`;
export const storeListarCompaniaDetalle = `${URL}/filtrarcompaniadetalle`;
