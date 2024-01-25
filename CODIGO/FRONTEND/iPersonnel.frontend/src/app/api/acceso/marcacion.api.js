import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from "rxjs";
import { map } from "rxjs/operators";

export const URL = Constants.API_URL + "/api/AccesoMarcacion";

export function obtener(params) {
  return from(axios.get(`${URL}/obtener`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function listar(params) {
  return from(axios.get(`${URL}/listar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtenerTodos() {
  return from(axios.get(`${URL}/obtenerTodos`)).pipe(
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

export function obtenerByZona(params) {
  return from(axios.get(`${URL}/obtenerbyzona`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export const storeFiltrar = `${URL}/filtrar`;
export const storeListarbyZona = `${URL}/filtrarbyzona`;


export function validar(params) {
  return from(axios.put(`${URL}/validar`,  params )).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function validarVehiculo(params) {
  return from(axios.put(`${URL}/validarVehiculo`,  params )).pipe(
    map(result => result.data.result)
  ).toPromise();
}


