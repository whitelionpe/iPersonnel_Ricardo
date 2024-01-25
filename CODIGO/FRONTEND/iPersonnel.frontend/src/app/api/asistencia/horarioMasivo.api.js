import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/AsistenciaHorarioMasivo";

export const serviceHorarioMasivo = {

  obtener: (params) => {
    return from(axios.get(`${URL}/obtener`, { params: params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  listar: (params) => {
    return from(axios.get(`${URL}/listar`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  listarHistorial: (params) => {
    return from(axios.get(`${URL}/listarHistorial`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },
  
  validarPersonas: (params) => {
    return from(axios.post(`${URL}/validarPersonas`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  crearHorariosMasivos: (params) => {
    return from(axios.post(`${URL}/crearHorariosMasivos`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  descargarPlantilla: (params) => {
    return from(axios.get(`${URL}/descargarPlantilla`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  importarHorarios(params) {
    return from(axios.post(`${URL}/importarHorarios`, params)).pipe(
        map(result => result.data.result)
    ).toPromise();
  },
}
