import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/acreditacionvisita";

export function crear(params) {
    return from(axios.post(`${URL}/crear`, params)).pipe(
        map(result => result.data.result)
    ).toPromise();
}

export function cerrar(params) {
    return from(axios.put(`${URL}/cerrar`, params)).pipe(
        map(result => result.data.result)
    ).toPromise();
}


export function contratoinfo(params) {
    return from(axios.get(`${URL}/contratocontratistainfo`, { params })).pipe(
        map(result => result.data.result)
    ).toPromise();
}

export const storeListar = `${URL}/filtrar`;

export function obtener(params) {
    return from(axios.get(`${URL}/obtener`, { params })).pipe(
        map(result => result.data.result)
    ).toPromise();
}

 