import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/AcreditacionRequisitoSolicitudVehiculo";


 
export function downloadFile(params) {
    return from(axios.get(`${URL}/downloadFileBase64`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  }

