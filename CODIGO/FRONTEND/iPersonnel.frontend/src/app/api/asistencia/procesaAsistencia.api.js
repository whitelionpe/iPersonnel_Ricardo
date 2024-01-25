import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/AsistenciaProceso";


export const ServiceProceso = {

  obtener: (params) => {
    return from(axios.get(`${URL}/obtener`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  procesar: (params) => {
    return from(axios.post(`${URL}/procesar`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  exportarProcesoLog: (params) => {
    return from(axios.post(`${URL}/ExportProcesoLog`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

}

export const filtrarProcesoAsistencia = `${URL}/filtrarProcesoLog`;
