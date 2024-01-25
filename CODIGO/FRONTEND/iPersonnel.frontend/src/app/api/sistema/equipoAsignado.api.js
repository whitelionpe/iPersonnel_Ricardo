import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/sistemaEquipoAsignado";

export const rpt_001_EquipoAsignado = `${URL}/rpt_001_EquipoAsignado`;

export const serviceEquipoAsignado = {

  listar: (params) => {
    return from(axios.get(`${URL}/listar`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  listarZona: (params) => {
    return from(axios.get(`${URL}/listarZona`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },


  listarPrinters: (params) => {
    return from(axios.get(`${URL}/listarPrinters`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  exportarExcel: (params) => {
    return from(axios.post(`${URL}/exportarExcelRpt_001_EquipoAsignado`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  listar_asignado(params) {
    return from(axios.get(`${URL}/listar_asignado`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  actualizar_asignado(params) {
    return from(axios.put(`${URL}/actualizar_asignado`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },


}
