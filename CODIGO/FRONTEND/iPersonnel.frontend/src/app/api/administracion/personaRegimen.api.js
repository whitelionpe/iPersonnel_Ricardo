import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/administracionpersonaregimen";


export function regimen(params) {
  return from(axios.get(`${URL}/obtenerregimen`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function guardia(params) {
  return from(axios.get(`${URL}/obtenerguardia`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtener(params) {
  return from(axios.get(`${URL}/obtener`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtenerTodos() {
  return from(axios.get(`${URL}/obtenerTodos`, {})).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function listar(params) {
  return from(axios.get(`${URL}/listar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function listarRegimenPersona(params) {
  return from(axios.get(`${URL}/listarRegimenPersona`, { params })).pipe(
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

// export const storeListar = `${URL}/filtrar`;//ANTES , ahora ya no existe 
 
export const storeFiltrarPopUp = `${URL}/filtrarPopUp`; 

//Se mueve del otro componente , y se convierte en el filtrar
export const storeFiltrar = `${URL}/filtrar`;
