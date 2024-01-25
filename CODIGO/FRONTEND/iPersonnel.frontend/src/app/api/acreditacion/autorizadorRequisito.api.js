import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/AcreditacionAutorizadorRequisito";

  export function listar(params) {
    return from(axios.get(`${URL}/listar`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  }
  
  export function crear(params) {
    return from(axios.post(`${URL}/crear`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  }
 
  export function eliminar(params) {
    return from(axios.delete(`${URL}/eliminar`, { params: params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  }
  
  