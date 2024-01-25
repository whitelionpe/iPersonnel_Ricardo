import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/casinoMarcacion";

export function listar(params) {
  return from(axios.get(`${URL}/listar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtener(params) {
  return from(axios.get(`${URL}/obtener`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}



export function excelconsolidadocc(params) {
  return from(axios.get(`${URL}/excelconsolidadocc`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}


/* export function rpt_001_ConsumoComedores(params) {
  return from(axios.get(`${URL}/rpt_001_ConsumoComedores`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
} */

export function excelrpt_001_consumocomedores(params) {
  console.log("excelrpt_001_consumocomedores", params);
  return from(axios.get(`${URL}/excelrpt_001_consumocomedores`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}
