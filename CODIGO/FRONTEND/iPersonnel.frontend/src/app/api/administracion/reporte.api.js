import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/AdministracionReporte";

export function listarEstadisticas(params) {
  return from(axios.get(`${URL}/listarEstadisticas`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function listarDetalleEstadisticas(params) {
  return from(axios.get(`${URL}/listarDetalleEstadisticas`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function listarReportePersonasActivos(params) {
  return from(axios.get(`${URL}/listarReportePersonasActivos`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export const serviceReporte = {
  exportarExcelR003: (params) => {
    return from(axios.post(`${URL}/exportarExcelR003_TrabajadoresPorSede`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  exportarR001_MovimientoPersonasDetalle: (params) => {
    return from(axios.post(`${URL}/exportarR001_MovimientoPersonasDetalle`, params)).pipe(
        map(result => result.data.result)
    ).toPromise();
}

}

export function exportarReportePersonasTodos(params) {
  return from(axios.get(`${URL}/exportarReportePersonasTodos`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export const storeListarR001 = `${URL}/filtrarR001_MovimientoPersonasDetalle`;
export const storeListarR003 = `${URL}/filtrarR003_TrabajadorePorSede`;
export const storeReportePersonasActivosDetalle = `${URL}/listarReportePersonasActivosDetalle`;
export const storeListarR002 = `${URL}/filtrarR002_TrabajadoresPorContrato`;


