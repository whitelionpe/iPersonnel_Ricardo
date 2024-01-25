import axios from "axios";
import Constants from "../../store/config/Constants";
import CustomStore from "devextreme/data/custom_store";
import { isNotEmpty } from "../../../_metronic/utils/utils";
import { from } from "rxjs";
import { map } from "rxjs/operators";

export const URL = Constants.API_URL + "/api/AccesoVehiculoRequisito";

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

export function listarVigentes(params) {
    return from(axios.get(`${URL}/listarVigentes`, { params })).pipe(
        map(result => result.data.result)
    ).toPromise();
}

export function listarHistorial(params) {
    return from(axios.get(`${URL}/listarHistorial`, { params })).pipe(
        map(result => result.data.result)
    ).toPromise();
}

