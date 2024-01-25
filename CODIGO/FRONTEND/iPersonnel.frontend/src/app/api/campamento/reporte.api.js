import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/CampamentoReserva";

export const service = {

  reporteReservasLiberadas(params) {
    return from(axios.post(`${URL}/reporteReservasLiberadas`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  reporteSolicitudesHabitacionIndexPage(params) {
    return from(axios.post(`${URL}/exportarExcelRpt_004_SolicitudesHabitacion`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  reporteOcupabilidadCompania(params) {
    return from(axios.get(`${URL}/filtrarR005_OcupabilidadCompania`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  exportarExcelOcupabilidadCompania: (params) => {
    return from(axios.post(`${URL}/exportarR005_OcupabilidadCompania`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  reporteValorizacion(params) {
    return from(axios.get(`${URL}/filtrarR006_Valorizacion`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  exportarExcelValorizacion: (params) => {
    return from(axios.post(`${URL}/exportarR006_Valorizacion`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  }
}

export const storeListarR004 = `${URL}/reporteSolicitudesHabitacion`;
export const rpt_007_CamasPorDia = `${URL}/rpt_007_CamasPorDia`;

export function exportarExcelCamasPorDia(params){
  return from(axios.post(`${URL}/exportarExcelRpt_007_CamasPorDia`, params)).pipe(
      map(result => result.data.result)
  ).toPromise();
}
