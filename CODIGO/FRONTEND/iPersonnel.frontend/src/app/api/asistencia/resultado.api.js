import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/AsistenciaResultado";
 
// export function listar(params) {
//   return from(axios.get(`${URL}/listar`, { params })).pipe(
//     map(result => result.data.result)
//   ).toPromise();
// }
  
 
export function obtener(params) {
  return from(axios.get(`${URL}/obtener`, { params: params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

  export const storeFiltrar = `${URL}/filtrar`;


  