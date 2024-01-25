import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/AccesoReporte";

export const serviceReporte = {

  c001Intervalo: (params) => {
    return from(axios.get(`${URL}/c001Intervalo`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  listaMarcaciones: (params) => {
    return from(axios.get(`${URL}/listaMarcaciones`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  R003ReportePermanencia: (params) => {
    return from(axios.get(`${URL}/filtrarR003_Permanencia`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  R003ExportarReportePermanenciaTodo: (params) => {
    return from(axios.get(`${URL}/exportarR003_ReportePermanenciaTodo`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },



  consultaTrabajadores: (params) => {
    return from(axios.get(`${URL}/filtrarR004_EstadoTrabajador`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  exportarExcelEstadoPersona: (params) => {
    return from(axios.post(`${URL}/exportarR004_EstadoTrabajador`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  exportarExcelEstadoVisita: (params) => {
    return from(axios.post(`${URL}/exportarR005_EstadoVisita`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  consultaEstadoVisitas: (params) => {
    return from(axios.get(`${URL}/filtrarR005_EstadoVisita`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  consultaEstadoVehiculo: (params) => {
    return from(axios.get(`${URL}/filtrarR006_EstadoVehiculo`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  exportarExcelEstadoVehiculo: (params) => {
    return from(axios.post(`${URL}/exportarR006_EstadoVehiculo`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  filtrarR007_TrabajadorPermanencia: (params) => {
    return from(axios.get(`${URL}/filtrarR007_TrabajadorPermanencia`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  exportarExcelTrabajadorPermanencia: (params) => {
    return from(axios.post(`${URL}/exportarR007_TrabajadorPermanencia`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  filtrarR008_VehiculoPermanencia: (params) => {
    return from(axios.get(`${URL}/filtrarR008_VehiculoPermanencia`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  exportarExcelVehiculoPermanencia: (params) => {
    return from(axios.post(`${URL}/exportarR008_VehiculoPermanencia`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  ListarAccesoReporte001MarcacionesPersonaDynamic: (params) => {
    return from(axios.get(`${URL}/listarAccesoReporte001MarcacionesPersonaDynamic`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  ExportarAccesoReporte001MarcacionesPersonaDynamic: (params) => {
    return from(axios.post(`${URL}/exportarAccesoReporte001MarcacionesPersonaDynamic`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  ListarAccesoReporte009ListarPersonaXControlAccesoEquipo: (params) => {
    return from(axios.get(`${URL}/listarAccesoReporte009ListarPersonaXControlAccesoEquipo`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  ExportarAccesoReporte009ListarPersonaXControlAccesoEquipo: (params) => {
    return from(axios.post(`${URL}/exportarAccesoReporte009ListarPersonaXControlAccesoEquipo`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },
}
export const filtrarR007 = `${URL}/filtrarR007_TrabajadorPermanencia`;
export const filtrarR008 = `${URL}/filtrarR008_VehiculoPermanencia`;
export const storeFiltrar = `${URL}/filtrarMarcaciones`;

export const storeListar = `${URL}/rpt_002_Vencimiento`;

export function exportarReporteRequisito(params) {
  return from(axios.get(`${URL}/rpt_002_VencimientoExport`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export const storeR003Det = `${URL}/filtrarReportePermanenciaDetalle`;

