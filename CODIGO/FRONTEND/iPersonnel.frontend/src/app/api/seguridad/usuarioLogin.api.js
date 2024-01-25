import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/SeguridadusuarioLogin";

export function actualizar(params) {
  return from(axios.put(`${URL}/actualizar`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtener(params) {

  return from(axios.put(`${URL}/obtener`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function confirmarClave(params) {
  //console.log("API.clave",params,URL);
  return from(axios.put(`${URL}/confirmarClave`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}


export function recuperarClave(params) {
  return from(axios.put(`${URL}/recuperarClave`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function restablecerPassword(params) {
  return from(axios.put(`${URL}/restablecerPassword`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}
//obtenercambioclave
export function confirmarCambioClave(params) {
  return from(axios.get(`${URL}/confirmarCambioClave`, { params: params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}
