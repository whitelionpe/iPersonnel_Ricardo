import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/acreditacionrequisitosolicitud";



export function downloadFile(params) {
  return from(axios.get(`${URL}/downloadFileBase64`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtener(params) {
  return from(axios.get(`${URL}/obtener`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

