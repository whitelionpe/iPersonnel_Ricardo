import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/acreditacionvisitapersona";

export function crear(params) {
    return from(axios.post(`${URL}/crear`, params)).pipe(
        map(result => result.data.result)
    ).toPromise();
}


export function actualizarfoto(params) {
    return from(axios.put(`${URL}/actualizarfoto`, params)).pipe(
        map(result => result.data.result)
    ).toPromise();
}

export function listarbySolicitud(params) {
  return from(axios.get(`${URL}/listarbySolicitud`, { params })).pipe(
      map(result => result.data.result)
  ).toPromise();
}

export function obtenerbysolicitante(params) {
  return from(axios.get(`${URL}/obtenerbysolicitante`, { params })).pipe(
      map(result => result.data.result)
  ).toPromise();
}
