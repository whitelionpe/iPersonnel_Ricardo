import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from "rxjs";
import { map } from "rxjs/operators";
export const URL = Constants.API_URL + "/api/SeguridadCodigoAutenticacion";

export const serviceCodigoAutenticacion = {

  
  RecuperarClave: (params) => {
    return from(axios.post(`${URL}/RecuperarClave`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

 

}
