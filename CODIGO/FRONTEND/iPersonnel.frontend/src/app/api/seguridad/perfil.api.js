import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/SeguridadPerfil";

export const servicePerfil = {

  obtener: (params) => {
    return from(axios.get(`${URL}/obtener`, { params: params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  obtenerTodos: (params) => {
    return from(axios.get(`${URL}/obtenerTodos`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  obtenerTodosAcreditacion: (params) => {
    return from(axios.get(`${URL}/obtenerTodosAcreditacion`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  listar: (params) => {
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
  },

  listarPendientes: (params) => {
    return from(axios.get(`${URL}/listarPendientes`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  listarMultipleSelection: (params) => {
    return from(axios.get(`${URL}/listarMultipleSelection`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  }

}

export const storeFiltrar = `${URL}/filtrar`; 