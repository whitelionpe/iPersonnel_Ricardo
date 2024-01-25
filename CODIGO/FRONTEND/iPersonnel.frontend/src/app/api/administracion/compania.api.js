import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from "rxjs";
import { map } from "rxjs/operators";
export const URL = Constants.API_URL + "/api/administracioncompania";

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
  return from(axios.delete(`${URL}/eliminar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function eliminarAsistencia(params) {
  return from(axios.delete(`${URL}/eliminarAsistencia`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export const storeListar = `${URL}/filtrar`;

export const storeListarAsistencia = `${URL}/filtrarAsistencia`;

export function actualizarAsistencia(params) {

  return from(axios.post(`${URL}/actualizarAsistencia`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function crearAsistencia(params) {

  return from(axios.post(`${URL}/crearAsistencia`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export const storeListarComedores = `${URL}/filtrarCompaniaComedores`;

export const storeListarCompania = `${URL}/filtrarCompaniaPerfiles`;

export const serviceCompania = {

  exportarExcel: (params) => {
    return from(axios.post(`${URL}/exportarExcel`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  exportarExcelPerfil: (params) => {
    return from(axios.post(`${URL}/exportarExcelPerfil`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  obtenerTodosConfiguracion: (params) => {
    return from(axios.get(`${URL}/obtenerTodosConfiguracion`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  }

}
//USUARIO COMPAÑIA
export const storeListarUsuarioCompania = `${URL}/filtrarUsuarioCompania`;