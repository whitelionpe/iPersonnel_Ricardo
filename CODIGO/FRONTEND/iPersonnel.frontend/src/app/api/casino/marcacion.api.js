import axios from "axios";
import Constants from "../../store/config/Constants";
import CustomStore from "devextreme/data/custom_store";
import { isNotEmpty } from "../../../_metronic/utils/utils";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/CasinoMarcacion";

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

export function excelformato(params) {
  return from(axios.get(`${URL}/excelformato`, { params }))
    .pipe(map(result => result.data.result))
    .toPromise();
}

export function cargamasiva(params) {
  return from(axios.post(`${URL}/cargamasiva`, params))
    .pipe(map(result => result.data.result))
    .toPromise();
}

export function procesarmasivo(params) {
  return from(axios.post(`${URL}/procesarmasivo`, params))
    .pipe(map(result => result.data.result))
    .toPromise();
}

export const storeListar = `${URL}/filtrar`;
