import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from "rxjs";
import { map } from "rxjs/operators";

export const URL = Constants.API_URL + "/api/AccesoMarcacionVehiculo";

export function obtener(params) {
    return from(axios.get(`${URL}/obtener`, { params })).pipe(
        map(result => result.data.result)
    ).toPromise();
}

export function obtenerTodos() {
    return from(axios.get(`${URL}/obtenerTodos`)).pipe(
        map(result => result.data.result)
    ).toPromise();
}

export function personas(params) {
    return from(axios.get(`${URL}/personas`, { params })).pipe(
        map(result => result.data.result)
    ).toPromise();
}


export function obtenerByZona(params) {
    return from(axios.get(`${URL}/obtenerbyzona`, { params })).pipe(
        map(result => result.data.result)
    ).toPromise();
}

export const storeListarbyZona = `${URL}/filtrarbyzona`;
