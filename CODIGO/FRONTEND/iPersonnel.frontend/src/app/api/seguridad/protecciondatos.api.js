import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/Seguridadprotecciondatos";

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

export function eliminar(params) {
  return from(axios.delete(`${URL}/eliminar`, { params: params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function listarseleccionados(params) {
  return from(axios.get(`${URL}/listarseleccionados`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function eliminarTodos(params) {
  return from(axios.delete(`${URL}/eliminarall`, { params: params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function listarTreeview(params) {
  return from(axios.get(`${URL}/listarTreeview`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

