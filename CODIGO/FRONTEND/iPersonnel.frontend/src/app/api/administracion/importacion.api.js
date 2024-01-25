import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from "rxjs";
import { map } from "rxjs/operators";

export const URL = Constants.API_URL + "/api/AdministracionImportar";

export const service = {

     descargarPlantillaPersona(params) {
      return from(axios.get(`${URL}/descargarPlantillaPersona`, { params })).pipe(
          map(result => result.data.result)
      ).toPromise();
      },

    descargarPlantillaVehiculo(params) {
        return from(axios.get(`${URL}/descargarPlantillaVehiculo`, { params })).pipe(
            map(result => result.data.result)
        ).toPromise();
        },
  
    cargarDatosPersona(params) {
      return from(axios.post(`${URL}/cargarDatosPersona`, params)).pipe(
          map(result => result.data.result)
      ).toPromise();
    },

    cargarDatosVehiculo(params) {
      return from(axios.post(`${URL}/cargarDatosVehiculo`, params)).pipe(
          map(result => result.data.result)
      ).toPromise();
    }

}

