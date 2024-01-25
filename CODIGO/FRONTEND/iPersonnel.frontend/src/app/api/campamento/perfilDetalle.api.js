import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/CampamentoPerfilDetalle";
 
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

export function listarTreeView(params) {
  return from(axios.get(`${URL}/listartreeview`, { params })).pipe(
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

export function campamentos(params) {
  return from(axios.get(`${URL}/campamentos`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function listartipomodulo(params) {
  return from(axios.get(`${URL}/tipomodulo`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function listartipohabitacion(params) {
  return from(axios.get(`${URL}/tipohabitacion`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}
