import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/administracioncaracteristicadetalle";

export function obtener(param) {
  return from(axios.get(`${URL}/obtener`, { params: param })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtenerTodos(params) {
 // console.log("obtenerTodos",params);
  return from(axios.get(`${URL}/obtenerTodos`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function listar(params) {
  return from(axios.get(`${URL}/listar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function crear(param) {
  return from(axios.post(`${URL}/crear`, param)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function actualizar(param) {
  return from(axios.put(`${URL}/actualizar`, param)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function eliminar(param) {
  return from(axios.delete(`${URL}/eliminar`, { params: param })).pipe(
    map(result => result.data.result)
  ).toPromise();
}
