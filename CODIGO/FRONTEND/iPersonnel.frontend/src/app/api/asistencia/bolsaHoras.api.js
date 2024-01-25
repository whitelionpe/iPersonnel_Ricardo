import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/AsistenciaBolsaHoras";
 
export function obtener(params) {
  return from(axios.get(`${URL}/obtener`, { params: params })).pipe(
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
 
export const exportarExcel = (params) => {
  return from(axios.post(`${URL}/exportarExcel`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

  export const storeFiltrar = `${URL}/filtrar`;

//SOLICITUD HHEE
export function obtenerDetalle(params) {
  return from(axios.get(`${URL}/obtenerDetalle`, { params: params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}
 
export function obtenerDetalleDia(params) {
  return from(axios.get(`${URL}/obtenerDetalleDia`, { params: params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}
    
export function obtenerAprobadores(params) {
  return from(axios.get(`${URL}/obtenerAprobadores`, { params: params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

//SOLICITUD JUSTIFICACION
export function obtenerJustificacion(params) {
  return from(axios.get(`${URL}/obtenerJustificacion`, { params: params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtenerDetalleDiaJustificacion(params) {
  return from(axios.get(`${URL}/obtenerDetalleDiaJustificacion`, { params: params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}



    
