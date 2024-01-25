import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/casinoreporte";

export const serviceCasinoReporte = {
  listar_r002_ConsolidadoConsumo(params) {
    return from(axios.get(`${URL}/listar_r002_ConsolidadoConsumo`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },
  listar_r003_DetalleConsumo(params) {
    return from(axios.get(`${URL}/filtrarR003_DetalleConsumo`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  ListarReporte005ConsumoXUnidadorganizativa: (params) => {
    return from(axios.get(`${URL}/ListarReporte005ConsumoXUnidadorganizativa`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  ExportarReporte005ConsumoXUnidadorganizativa: (params) => {
    return from(axios.post(`${URL}/ExportarReporte005ConsumoXUnidadorganizativa`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },
}

export const storeListarAuditoriaComedor = `${URL}/filtrar`;
export const rpt_001_ConsumoComedores = `${URL}/rpt_001_ConsumoComedores`;
export const rpt_001_ConsumoComedoresNegado = `${URL}/rpt_001_ConsumoComedoresNegado`;
export function exportarExcel(params) {
  return from(axios.post(`${URL}/exportarExcelRpt_001_ConsumoComedores`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function exportarExcelNegados(params) {
  return from(axios.post(`${URL}/exportarExcelRpt_001_ConsumoComedoresNegado`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function exportarR003ExcelDetalleConsumo(params) {
  return from(axios.post(`${URL}/exportarR003_DetalleConsumo`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

//=============== REPORT: DETALLE DIARIO CONSUMO ==============================================
export function listar_r004_DetalleDiarioConsumo(params) {
  return from(axios.get(`${URL}/rpt_004_detallediarioconsumo`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}




