import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/SeguridadusuarioClaveAcceso";

export function expiretoken(params) {
    return from(axios.post(`${URL}/expiretoken`, params)).pipe(
        map(result => result.data.result)
    ).toPromise();
}