import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/IdentificacionReporte";


export const serviceReporte = {

  listarRFotocheckPorPeriodo: (params) => {
    return from(axios.get(`${URL}/listarRFotocheckPorPeriodo`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  listarRFotocheckPorPeriodoDetalle: (params) => {
    return from(axios.get(`${URL}/listarRFotocheckPorPeriodoDetalle`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  exportarR001_FotocheckPorPeriodoDetalle: (params) => {
    return from(axios.post(`${URL}/exportarR001_FotocheckPorPeriodoDetalle`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  listarIdentificacionReporte001EmisionFotochecksDynamic: (params) => {
    return from(axios.get(`${URL}/listarIdentificacionReporte001EmisionFotochecksDynamic`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  ExportarIdentificacionReporte001EmisionFotochecksDynamic: (params) => {
    return from(axios.post(`${URL}/exportarIdentificacionReporte001EmisionFotochecksDynamic`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  //

}

export const storeListarR001 = `${URL}/filtrarR001_FotocheckPorPeriodoDetalle`;



