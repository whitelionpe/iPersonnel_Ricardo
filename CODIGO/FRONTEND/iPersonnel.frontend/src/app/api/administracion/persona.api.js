import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from "rxjs";
import { map } from "rxjs/operators";

export const URL = Constants.API_URL + "/api/administracionpersona";


export const servicePersona = {


    obtener: (params) => {
        return from(axios.get(`${URL}/obtener`, { params })).pipe(
            map(result => result.data.result)
        ).toPromise();
    },

    obtenerTodos: (params) => {
        return from(axios.get(`${URL}/obtenerTodos`, { params })).pipe(
            map(result => result.data.result)
        ).toPromise();
    },

    listar: (params) => {
        return from(axios.get(`${URL}/listar`, { params })).pipe(
            map(result => result.data.result)
        ).toPromise();
    },

    crear: (params) => {
        return from(axios.post(`${URL}/crear`, params)).pipe(
            map(result => result.data.result)
        ).toPromise();
    },

    actualizar: (params) => {
        return from(axios.put(`${URL}/actualizar`, params)).pipe(
            map(result => result.data.result)
        ).toPromise();
    },

    eliminar: (params) => {
        return from(axios.delete(`${URL}/eliminar`, { params })).pipe(
            map(result => result.data.result)
        ).toPromise();
    },


    crearconposicion: (params) => {
        return from(axios.post(`${URL}/crearconposicion`, params)).pipe(
            map(result => result.data.result)
        ).toPromise();
    },

    validarlista: (params) => {
        return from(axios.post(`${URL}/validarlista`, params)).pipe(
            map(result => result.data.result)
        ).toPromise();
    },

    obtenerPeriodo: (params) => {
        return from(axios.post(`${URL}/obtenerPeriodo`, params)).pipe(
            map(result => result.data.result)
        ).toPromise();
    },

    exportarExcel: (params) => {
        return from(axios.post(`${URL}/exportarExcel`, params)).pipe(
            map(result => result.data.result)
        ).toPromise();
    },

    exportarExcelAcreditacionPersonas: (params) => {
        return from(axios.post(`${URL}/exportarExcelAcreditacionPersonas`, params)).pipe(
            map(result => result.data.result)
        ).toPromise();
    },

    // exportarExcelIdentificacionPersonas: (params) => {
    //     return from(axios.post(`${URL}/exportarExcelIdentificacionPersonas`, params)).pipe(
    //         map(result => result.data.result)
    //     ).toPromise();
    // },

    listarCombosPersona: (params) => {
        return from(axios.get(`${URL}/listarCombosPersona`, { params })).pipe(
            map(result => result.data.result)
        ).toPromise();
    },

}

export function dowloadTemplate(params) {
    return from(axios.get(`${URL}/dowloadTemplate`, { params })).pipe(
        map(result => result.data.result)
    ).toPromise();
}


export function upLoadDataMassive(params) {
    return from(axios.post(`${URL}/upLoadDataMassive`, params)).pipe(
        map(result => result.data.result)
    ).toPromise();
}


export const storeListar = `${URL}/filtrar`;
export const storeListarAcreditacionPersonas = `${URL}/filtrarAcreditacionPersonas`;
//export const storeListarIdentificacionPersonas = `${URL}/filtrarIdentificacionPersonas`;


//ADD
export function obtenerbydocumento(params) {
    return from(axios.get(`${URL}/obtenerbydocumento`, { params })).pipe(
        map(result => result.data.result)
    ).toPromise();
}
