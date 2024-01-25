import axios from "axios";
import Constants from "../../store/config/Constants";
//import CustomStore from "devextreme/data/custom_store";
//import { isNotEmpty } from "../../../_metronic/utils/utils";
import { from } from "rxjs";
import { map } from "rxjs/operators";

export const URL = Constants.API_URL + "/api/asistenciapersona";

export function obtener(params) {
    return from(axios.get(`${URL}/obtener`, { params })).pipe(
        map(result => result.data.result)
    ).toPromise();
}

export function listar(params) {
    return from(axios.get(`${URL}/listar`, { params })).pipe(
        map(result => result.data.result)
    ).toPromise();
}

/* export const storeListar = `${URL}/filtrar`; */


export function crearconposicion(params) {
    return from(axios.post(`${URL}/crearconposicion`, params)).pipe(
        map(result => result.data.result)
    ).toPromise();
}


export const storeListarHoraExtra = `${URL}/filtrarHoraExtra`;

export const storeListarPersonas = `${URL}/filtrarPersonas`;

export const storeBuscarPersonas = `${URL}/buscarPersonas`;
export const storeBuscarPersonasPerfil = `${URL}/buscarPersonasPerfil`;

export const servicePersona = {

    exportarExcel: (params) => {
        return from(axios.post(`${URL}/exportarExcel`, params)).pipe(
            map(result => result.data.result)
        ).toPromise();
    }


}
