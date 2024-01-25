import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/campamentoreserva";

export function crear(params) {
  return from(axios.post(`${URL}/crear`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function reservas(params) {
  return from(axios.get(`${URL}/reservas`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function reservasPorPersona(params) {
  return from(axios.post(`${URL}/reservasporpersona`, params )).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function reservasPorCama(params) {
  return from(axios.get(`${URL}/reservasporcama`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtener(params) {
  return from(axios.get(`${URL}/obtener`, { params: params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function eliminar(params) {
  return from(axios.delete(`${URL}/eliminar`, { params: params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export const storeListar = `${URL}/filtrar`;

export function checkin(params) {
  return from(axios.delete(`${URL}/checkin`, { params: params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function checkout(params) {
  return from(axios.delete(`${URL}/checkout`, { params: params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function actualizar(params) {
  return from(axios.post(`${URL}/actualizar`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function consultareserva(params) {
  return from(axios.get(`${URL}/consultareserva`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function excel(params) {
  return from(axios.get(`${URL}/excel`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function reservamasiva(params) {
  return from(axios.post(`${URL}/reservamasiva`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export const filtrarReservas = `${URL}/filtrarReservas`;
export const filtrarPersonas = `${URL}/filtrarPersonas`;
