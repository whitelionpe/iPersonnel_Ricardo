import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/AcreditacionReporte";

export const storeReportes = `${URL}/reporteGeneral`;

export const serviceReporte = {

  r001_Analisis: (params) => {
    return from(axios.get(`${URL}/reporte_001`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  r001_detalle_toExcel: (params) => {
    return from(axios.post(`${URL}/reporte_001_detalle_toExcel`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  r002ResultadosAutorizador: (params) => {
    return from(axios.get(`${URL}/r002ResultadosAutorizador`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },


}

export const r001_detalle_dataSource = `${URL}/reporte_001_detalle_dataSource`;

export const storeFiltrarReserva = `${URL}/filtrarpersona`;

