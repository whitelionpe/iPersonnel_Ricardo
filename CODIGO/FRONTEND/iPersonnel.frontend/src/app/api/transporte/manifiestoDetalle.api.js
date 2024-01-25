import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from "rxjs";
import { map } from "rxjs/operators";
export const URL = Constants.API_URL + "/api/TransporteManifiestoDetalle";

  export const service = {

    listar: (params) => {
      return from(axios.get(`${URL}/listar`, { params })).pipe(
        map(result => result.data.result)
      ).toPromise();
    },
  
    crearDetalle: (params) => {
      return from(axios.post(`${URL}/crearDetalle`, params)).pipe(
        map(result => result.data.result)
      ).toPromise();
    },

    asignarMasivo: (params) => {
      return from(axios.put(`${URL}/asignarMasivo`, params)).pipe(
        map(result => result.data.result)
      ).toPromise();
    },

    actualizar: (params) => {
      return from(axios.put(`${URL}/actualizar`, params)).pipe(
        map(result => result.data.result)
      ).toPromise();
    },
  
  
  }
