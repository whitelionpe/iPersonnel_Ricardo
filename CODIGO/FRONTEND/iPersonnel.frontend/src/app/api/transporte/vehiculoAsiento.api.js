import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/TransporteVehiculoAsiento";

export const service = {

  obtener: (params) => {
    return from(axios.get(`${URL}/obtener`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  obtenerTodos: (params) => {
    return from(axios.get(`${URL}/obtenerTodos`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  crear: (params) => {
    return from(axios.put(`${URL}/crear`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  // crear: (params) => {
  //   return from(axios.post(`${URL}/crear`, params)).pipe(
  //     map(result => result.data.result)
  //   ).toPromise();
  // },

}

