import axios from "axios";
import Constants from "../../store/config/Constants";
import CustomStore from "devextreme/data/custom_store";
import { isNotEmpty } from "../../../_metronic/utils/utils";
import { from } from 'rxjs';
import { map } from 'rxjs/operators'; 

export const URL = Constants.API_URL + "/api/casinopersonaGrupo";

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

export function exportarExcel (params)  {
  return from(axios.post(`${URL}/exportarExcel`, params)).pipe(
      map(result => result.data.result)
  ).toPromise();
}

export const servicePersonaGrupo = {

  validarDatosPersona(params) {
    return from(axios.get(`${URL}/validarDatosPersona`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  CrearMultiple(params) {
     return from(axios.post(`${URL}/CrearMultiple`, params)).pipe(
       map(result => result.data.result)
     ).toPromise();
   },

 }
 
export function listarMasivo(params) {
  return from(axios.get(`${URL}/filtrarTodos`, { params })).pipe(
      map(({ data }) => data
      )).toPromise();
}

export const storeListar = `${URL}/filtrar`; 
export const storeListarMostrar = `${URL}/filtrarMostrar`; 
export const storeListarPersonaGrupo = `${URL}/filtrarPersonaGrupo`; 

