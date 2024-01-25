import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from "rxjs";
import { map } from "rxjs/operators";
export const URL = Constants.API_URL + "/api/accesopuerta";

export function obtener(params) {
  return from(axios.get(`${URL}/obtener`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtenerTodos(params) {
  return from(axios.get(`${URL}/obtenerTodos`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

/* export function listar(params) {
  return from(axios.get(`${URL}/listar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
} */

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
  return axios.delete(`${URL}/eliminar`, { params });
}

export const serviceAccesoPuerta= {

  listarSeleccionado: (params) => {
    return from(axios.get(`${URL}/listarSeleccionado`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  }
  
}