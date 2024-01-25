import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/SeguridadusuarioClave";

export const serviceUsuarioClave = {

  cambiarClave: (params) => {
    return from(axios.post(`${URL}/cambiarClave`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

 
  crearbytoken: (params, config) => {
    //console.log("CreatebyToken,params,config", params, config);
    return from(axios.post(`${URL}/crear`, params, config)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  resetearPassword: (params) => {
    return from(axios.put(`${URL}/resetearPassword`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();

  }
  
}
