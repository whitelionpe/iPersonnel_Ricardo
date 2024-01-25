import axios from "axios";
import Constants from "../../store/config/Constants";
import CustomStore from "devextreme/data/custom_store";
import { isNotEmpty } from "../../../_metronic/utils/utils";
import { from } from "rxjs";
import { map } from "rxjs/operators";

export const URL = Constants.API_URL + "/api/AccesoPersonaGrupo";

export function listar(params) {
    return from(axios.get(`${URL}/listar`, { params })).pipe(
        map(result => result.data.result)
    ).toPromise();
}

export function listarPersona(params) {
    return from(axios.get(`${URL}/listarPersona`, { params })).pipe(
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



export function eliminarMasivo(params) {
    return from(axios.post(`${URL}/eliminarMasivoPersona`, params)).pipe(
        map(result => result.data.result)
    ).toPromise();
}

export function listarMasivo(params) {
    return from(axios.get(`${URL}/filtrarTodos`, { params })).pipe(
        map(({ data }) => data
        )).toPromise();
}


export const storeListar = `${URL}/filtrar`;

export const service = {

    obtenerZona: (params) => {
        return from(axios.get(`${URL}/ObtenerZona`, { params })).pipe(
            map(result => result.data.result)
        ).toPromise();
    },

    obtenerPuerta: (params) => {
        return from(axios.get(`${URL}/ObtenerPuerta`, { params })).pipe(
            map(result => result.data.result)
        ).toPromise();
    },

    obtenerEquipo: (params) => {
        return from(axios.get(`${URL}/ObtenerEquipo`, { params })).pipe(
            map(result => result.data.result)
        ).toPromise();
    }

}