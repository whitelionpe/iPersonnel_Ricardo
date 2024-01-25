import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/AsistenciaPersonaJustificacion";

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
  //console.log("crear.api",params)
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


export function crearjustificacionmasivoxpersona(params) {
  //console.log("crear.api",params)
  return from(axios.post(`${URL}/crearjustificacionmasivoxpersona`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function validar(params) {
  return from(axios.get(`${URL}/validar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtenerResumen(params) {
  return from(axios.get(`${URL}/obtenerresumen`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function ValidarPersona(params) {
  return from(axios.get(`${URL}/validarPersona`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
} 

export function crearMasivo(params) {
  //console.log("crear.api",params)
  return from(axios.post(`${URL}/crearMasivo`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function detallePersonaInvalida(params) {
  return from(axios.get(`${URL}/detallePersonaInvalida`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export const storeListar = `${URL}/filtrar`;

