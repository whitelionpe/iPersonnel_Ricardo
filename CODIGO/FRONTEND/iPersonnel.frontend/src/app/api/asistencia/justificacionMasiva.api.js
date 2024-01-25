import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/AsistenciaJustificacionMasiva";

export function obtener(params) {
  return from(axios.get(`${URL}/obtener`, { params: params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtenerTodos(params) {
  return from(axios.get(`${URL}/obtenerTodos`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function listar(params) {
  return from(axios.get(`${URL}/listar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function crear(params) {
  return from(axios.post(`${URL}/crear`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function actualizar(params) {
  return from(axios.post(`${URL}/actualizar`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function eliminar(params) {
  return from(axios.delete(`${URL}/eliminar`, { params: params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function validarlista(params) {
  return from(axios.post(`${URL}/validarlista`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export const storeListar = `${URL}/filtrar`;

export function listarPersonasJustificadas(params) {
  return from(axios.get(`${URL}/listarPersonasJustificadas`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function eliminarPersonasJustificadas(params) {
  return from(axios.delete(`${URL}/eliminarPersonasJustificadas`, { params: params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export const servicioJustificacionMasiva = {
 
  descargarPlantilla: (params) => {
    return from(axios.get(`${URL}/descargarPlantilla`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  importarJustificaciones(params) {
    return from(axios.post(`${URL}/importarJustificaciones`, params)).pipe(
        map(result => result.data.result)
    ).toPromise();
  },
 
  crearJustificacionesMasivas: (params) => {
    return from(axios.post(`${URL}/crearJustificacionesMasivas`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  listarHistorial: (params) => {
    return from(axios.get(`${URL}/listarHistorial`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },
  
  listarJustificacionesCancelacion: (params) => {
    return from(axios.get(`${URL}/listarJustificacionesCancelacion`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  
  cancelarJustificacionesPersonasMasivas: (params) => {
    return from(axios.post(`${URL}/cancelarJustificacionesPersonasMasivas`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

}

 