import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
export const URL = Constants.API_URL + "/api/asistenciaaprobacionhhee";

export function listarxnivel(params) {
    return from(axios.get(`${URL}/listarxnivel`, { params }))
        .pipe(map(result => result.data.result))
        .toPromise();
}
 