import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/AsistenciaPersonaHorario";

export function obtener(params) {
  //console.log("obtener", params);
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
  //console.log("listar", params, URL);
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

export function horarioDia(params) {
  return from(axios.get(`${URL}/listarHorarioDia`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}
export function horarioDiaBase(params) {
  return from(axios.get(`${URL}/listarHorarioDiaBase`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function validar(params) {
  return from(axios.post(`${URL}/validar`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function horarioActual(params) {
  return from(axios.get(`${URL}/obtenerHorarioActual`, { params: params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function listarbyfechas(params) { 
  return from(axios.get(`${URL}/listarhorariofechas`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export const servicePersonaHorario = {

 validarPersonaHorario(params) {
    return from(axios.get(`${URL}/validarPersonaHorario`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  }

}

 
// export function obtenerRangoFechas(params) {
//   //console.log("obtenerRangoFechas", params);
//   return from(axios.get(`${URL}/obtenerRangoFechas`, { params: params })).pipe(
//     map(result => result.data.result)
//   ).toPromise();
// }
 
