import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/CampamentoPersonaPerfil";

export function listarPerfilActual(params) {
  return from(axios.get(`${URL}/listarPerfilActual`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export const servicePersonaPerfil = {

  listar: (params) => {
    return from(axios.get(`${URL}/listar`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  obtener: (params) => {
    return from(axios.get(`${URL}/obtener`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  crear: (params) => {
    return from(axios.post(`${URL}/crear`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  actualizar: (params) => {
    return from(axios.put(`${URL}/actualizar`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  eliminar: (params) => {
    return from(axios.delete(`${URL}/eliminar`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  listarbyperfil: (params) => {
    return from(axios.get(`${URL}/listarbyperfil`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  crearmasivobyperfil: (params) => {
    return from(axios.post(`${URL}/crearmasivobyperfil`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },
  

}

export const storeListarPerfil = `${URL}/filtrar`;
export const storePersonaSinPerfil = `${URL}/filtrarPersonaSinPerfil`;





