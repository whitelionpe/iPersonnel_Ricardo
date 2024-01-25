import axios from "axios";
import Constants from "../../store/config/Constants";
import CustomStore from "devextreme/data/custom_store";
import { isNotEmpty } from "../../../_metronic/utils/utils";
import { from } from "rxjs";
import { map } from "rxjs/operators";

export const URL = Constants.API_URL + "/api/AccesoVehiculoRestriccion";
 
export function listar(params) {
    return from(axios.get(`${URL}/listar`, { params })).pipe(
        map(result => result.data.result)
    ).toPromise();
}
  
export function obtener(params) {
    return from(axios.get(`${URL}/obtener`, { params })).pipe(
        map(result => result.data.result)
    ).toPromise();
}

export function crear(params) {
    return from(axios.post(`${URL}/crear`, params)).pipe(
        map(result => result.data.result)
    ).toPromise();
}

export function actualizar(params) {
    return from(axios.put(`${URL}/actualizar`, params)).pipe(
        map(result => result.data.result)
    ).toPromise();
}

export function eliminar(params) {
    return from(axios.delete(`${URL}/eliminar`, { params })).pipe(
        map(result => result.data.result)
    ).toPromise();
}

export function listarPuerta(params) {
    return from(axios.get(`${URL}/listarPuerta`, { params })).pipe(
        map(result => result.data.result)
    ).toPromise();
}

export function listarZona(params) {
    return from(axios.get(`${URL}/listarZona`, { params })).pipe(
        map(result => result.data.result)
    ).toPromise();
}