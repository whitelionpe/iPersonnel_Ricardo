import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/SeguridadUsuarioFoto";


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
  return from(axios.delete(`${URL}/eliminar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtener(params) {
  console.log("obtener.API",URL,  params);
  return from(axios.get(`${URL}/obtener`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}



