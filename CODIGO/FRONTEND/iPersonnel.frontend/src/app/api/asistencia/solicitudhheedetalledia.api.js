import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from "rxjs";
import { map } from "rxjs/operators";

export const URL = Constants.API_URL + "/api/asistenciasolicitudhheedetalledia";

export function listar(params) {
    return from(axios.get(`${URL}/listar`, { params }))
        .pipe(map(result => result.data.result))
        .toPromise();
}
 
 
export function listartiempoadicional(params) {
  return from(axios.get(`${URL}/listartiempoadicional`, { params }))
      .pipe(map(result => result.data.result))
      .toPromise();
}

/*

export function crearsolicitante(params) {
  return from(axios.post(`${URL}/crearsolicitante`, params)).pipe(
      map(result => result.data.result)
  ).toPromise();
}

export function actualizarsolicitante(params) {
  return from(axios.post(`${URL}/actualizarsolicitante`, params)).pipe(
      map(result => result.data.result)
  ).toPromise();
}

export function cerrarsolicitud(params) {
  return from(axios.post(`${URL}/cerrarsolicitud`, params)).pipe(
      map(result => result.data.result)
  ).toPromise();
}


export function crearsolicitantefoto(params) {
  return from(axios.post(`${URL}/crearsolicitantefoto`, params)).pipe(
      map(result => result.data.result)
  ).toPromise();
}
 
export function UploadSolicitanteArchivo(params) {
  return from(axios.post(`${URL}/UploadSolicitanteArchivo`, params,
      { headers: { 'content-type': 'multipart/form-data' } })).pipe(
          map(result => result.data.result)
      ).toPromise();
}

*/