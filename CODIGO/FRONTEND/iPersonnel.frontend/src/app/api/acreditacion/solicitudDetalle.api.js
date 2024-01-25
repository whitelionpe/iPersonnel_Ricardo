import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/acreditacionsolicituddetalle";

export function obtener(params) {
  return from(axios.get(`${URL}/obtener`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function downloadFile(params) {
  return from(axios.get(`${URL}/downloadFileBase64`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtenerbyautorizador(params) {
  return from(axios.get(`${URL}/obtenerbyautorizador`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtenerbyautorizadorTodos(params) {
  return from(axios.get(`${URL}/obtenerbyautorizadorTodos`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}
