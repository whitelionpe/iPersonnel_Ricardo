import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/TransporteProgramacionParadero";

export const service = {

  obtener: (params) => {
    return from(axios.get(`${URL}/obtener`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  listar: (params) => {
    return from(axios.get(`${URL}/listar`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  actualizarEstado: (params) => {
    return from(axios.get(`${URL}/actualizarEstado`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  }


}

