import axios from "axios";
import Constants from "../../store/config/Constants";
//import CustomStore from "devextreme/data/custom_store";
//import { isNotEmpty } from "../../../_metronic/utils/utils";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/administracionposicion";

export function obtener(params) {
  console.log("obtenertv", params);
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

export function listarTreeview(params) {
  return from(axios.get(`${URL}/listarTreeview`, { params })).pipe(
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

export const storeFiltrar = `${URL}/filtrar`;

/* export function listarTreeviewPosicion(params) { 
  return from(axios.get(`${URL}/listarTreeviewPosicion`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
} */


