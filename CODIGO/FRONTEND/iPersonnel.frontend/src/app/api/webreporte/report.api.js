import axios from "axios";
import Constants from "../../store/config/Constants";
import CustomStore from "devextreme/data/custom_store";
import { isNotEmpty } from "../../../_metronic/utils/utils";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import https from 'https';
export const URL = Constants.WEB_REPORTE + "/api/seguridad";


export function validar(params) {
    return from(axios.post(`${URL}/validar`, params)).pipe(
        map(result => result.data.result)
    ).toPromise();
}
