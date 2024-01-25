import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/acreditacionautorizadordivision";

  export function crear(params) {
    return from(axios.post(`${URL}/crear`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  }
  
  export function actualizar(params) {
    return from(axios.put(`${URL}/actualizar`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  }
  
  export function eliminar(params) {
    return from(axios.delete(`${URL}/eliminar`, { params: params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  }


  export function listarTreeView(params) {
    //console.log("listarTreeView", params)
    return from(axios.get(`${URL}/listartreeview`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  }
  