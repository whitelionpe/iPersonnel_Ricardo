import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/AsistenciaConfiguracionHHEE";

export const serviceConfiguracion = {

  obtener: (params) => {
    //console.log("obtener", params, URL);
    return from(axios.get(`${URL}/obtener`, { params: params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  obtenerTodos: (params) => {
    return from(axios.get(`${URL}/obtenerTodos`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  listar: (params) => {
    //console.log("listar",params,URL );
    return from(axios.get(`${URL}/listar`, { params })).pipe(
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
    return from(axios.delete(`${URL}/eliminar`, { params: params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  }

  // export function ObtenerJustificacionPorCompania(params) {
  //   return from(axios.get(`${URL}/ObtenerJustificacionPorCompania`, { params })).pipe(
  //     map(result => result.data.result)
  //   ).toPromise();
  // }

}

export const storeListar = `${URL}/filtrar`;
