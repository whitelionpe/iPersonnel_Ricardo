import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from "rxjs";
import { map } from "rxjs/operators";

export const URL = Constants.API_URL + "/api/TransporteProgramacionPasajero";

export const service = {

    descargarPlantillaPasajeros(params) {
      return from(axios.get(`${URL}/descargarPlantillaPasajeros`,{params})).pipe(
          map(result => result.data)
      ).toPromise();
      },
  
      cargarPasajerosExcel(params) {
      return from(axios.post(`${URL}/cargarPasajerosExcel`, params)).pipe(
          map(result => result.data)
      ).toPromise();
    },

     exportarExcelPasajeros(params) {
        return from(axios.post(`${URL}/exportarExcelPasajeros`, params)).pipe(
          map(response => response.data)).toPromise();
      }
}

export const loadUrl = `${URL}/filtrar`;


