import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/acreditacionvisitapersonadetalle";

export function actualizarrequisitos(params) {
    return from(axios.put(`${URL}/actualizarrequisitos`, params)).pipe(
        map(result => result.data.result)
    ).toPromise();
}

export function actualizarArchivo(params) {
    return from(axios.put(`${URL}/actualizararchivo`, params,
        { headers: { 'content-type': 'multipart/form-data' } })).pipe(
            map(result => result.data.result)
        ).toPromise();
}


export function downloadFile(params) {
    return from(axios.get(`${URL}/downloadFileBase64`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  }
  
  export function actualizarobservado(params) {
    return from(axios.put(`${URL}/actualizarobservado`, params,
        { headers: { 'content-type': 'multipart/form-data' } })).pipe(
            map(result => result.data.result)
        ).toPromise();
}
