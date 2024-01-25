import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from "rxjs";
import { map } from "rxjs/operators";
export const URL = Constants.API_URL + "/api/SistemaEntidadDato";

export function obtenerTodos(params) {
  return from(axios.get(`${URL}/obtenerTodos`, {params})).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtenerEntidadDatoPendientes(params) {
  return from(axios.get(`${URL}/obtenerEntidadDatoPendientes`, {params})).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export const storeListar = `${URL}/filtrar`;
