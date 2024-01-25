import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from "rxjs";
import { map } from "rxjs/operators";

export const URL = Constants.API_URL + "/api/administracionvehiculo";

export function listar(params) {
    return from(axios.get(`${URL}/listar`, { params })).pipe(
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

export function obtener(params) {
    return from(axios.get(`${URL}/obtener`, { params })).pipe(
        map(result => result.data.result)
    ).toPromise();
}

export const serviceVehiculo = {
    
    exportarExcel: (params) => {
        return from(axios.post(`${URL}/exportarExcel`, params)).pipe(
            map(result => result.data.result)
        ).toPromise();
    },
    exportarExcelAcreditacionVehiculos: (params) => {
        return from(axios.post(`${URL}/exportarExcelAcreditacionVehiculos`, params)).pipe(
            map(result => result.data.result)
        ).toPromise();
    },

    obtenerPeriodo: (params) => {
        return from(axios.post(`${URL}/obtenerPeriodo`, params)).pipe(
            map(result => result.data.result)
        ).toPromise();
    },
    
}

export const storeFiltrar = `${URL}/filtrar`;
export const storeFiltrarAcreditacionVehiculos = `${URL}/filtrarAcreditacionVehiculos`;

