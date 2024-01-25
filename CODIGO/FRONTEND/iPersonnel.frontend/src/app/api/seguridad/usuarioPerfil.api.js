import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/SeguridadUsuarioPerfil";

export const serviceUsuarioPerfil = {
  obtener: (params) => {
    return from(axios.get(`${URL}/obtener`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  obtenerTodos: (params) => {
    return from(axios.get(`${URL}/obtenerTodos`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  obtenerPorUsuario: (params) => {
    return from(axios.get(`${URL}/obtenerPorUsuario`, { params })).pipe(
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
    return from(axios.delete(`${URL}/eliminar`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },


  listarMultipleSelection: (params) => {
    return from(axios.get(`${URL}/listarMultipleSelection`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  listarbyPerfil: (params) => {
    return from(axios.put(`${URL}/listarbyPerfil`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  configuracionByUsuario: (params) => {
    //console.log("configuracionByUsuario.param",params);
    return from(axios.get(`${URL}/configuracionByUsuario`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  }
  
}