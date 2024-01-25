import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/AsistenciaMarcacionMasiva";

export function listar(params) {
  return from(axios.get(`${URL}/listar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}
 
export const storeListar = `${URL}/filtrar`;
 

export const servicioMarcacionMasiva = {
 
  descargarPlantilla: (params) => {
    return from(axios.get(`${URL}/descargarPlantilla`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  importarMarcaciones(params) {
    return from(axios.post(`${URL}/importarMarcaciones`, params)).pipe(
        map(result => result.data.result)
    ).toPromise();
  },
 
  crearMarcacionesMasivas: (params) => {
    return from(axios.post(`${URL}/crearMarcacionesMasivas`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  listarHistorial: (params) => {
    return from(axios.get(`${URL}/listarHistorial`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },
  
  listarMarcacionCancelacion: (params) => {
    return from(axios.get(`${URL}/listarMarcacionCancelacion`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  
  cancelarMarcacionesMasivas: (params) => {
    return from(axios.post(`${URL}/cancelarMarcacionesMasivas`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

}

 
