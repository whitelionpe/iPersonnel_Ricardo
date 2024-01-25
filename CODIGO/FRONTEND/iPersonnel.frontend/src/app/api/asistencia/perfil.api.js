import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/AsistenciaPerfil";
 

export function obtener(params) {
  //  console.log("obtenerPerfil : ", params);
  return from(axios.get(`${URL}/obtener`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function listarTreeview(params) {
  return from(axios.get(`${URL}/listarTreeview`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}
 
export function listarUsuarios(params) {
  return from(axios.get(`${URL}/listarUsuarios`, { params })).pipe(
      map(result => result.data.result)
  ).toPromise();
} 

export function listarUnidadesOrganizativas(params) {
  return from(axios.get(`${URL}/listarUnidadesOrganizativas`, { params })).pipe(
      map(result => result.data.result)
  ).toPromise();
} 

export function listarDivisiones(params) {
  return from(axios.get(`${URL}/listarDivisiones`, { params })).pipe(
      map(result => result.data.result)
  ).toPromise();
} 

export function listar(params) {
  return from(axios.get(`${URL}/listar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}
 
export function actualizarPerfilPadre(params) {
  return from(axios.put(`${URL}/actualizarPerfilPadre`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
} 