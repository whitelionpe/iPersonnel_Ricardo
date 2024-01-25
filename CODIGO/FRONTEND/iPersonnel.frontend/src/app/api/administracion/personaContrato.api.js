import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/administracionpersonacontrato";

export const servicePersonaContrato = {

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

  obtenerTodos2p: (params) => {
    return from(axios.get(`${URL}/obtenerTodos2p`, { params })).pipe(
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

  crearposicion: (params) => {
    return from(axios.post(`${URL}/crearposicion`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },
  actualizarposicion: (params) => {
    return from(axios.put(`${URL}/actualizarposicion`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  obtenerposicion: (params) => {
    return from(axios.get(`${URL}/obtenerposicion`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  listarposicion: (params) => {
    return from(axios.get(`${URL}/listarposicion`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  eliminarposicion: (params) => {
    return from(axios.delete(`${URL}/eliminarposicion`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();

  },
  bajacontratoanterior: (params) => {
    return from(axios.put(`${URL}/bajacontratoanterior`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  cambiarContratoPersona: (params) => {
    return from(axios.put(`${URL}/cambiarContratopersona`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  ampliarContratoPersona: (params) => {
    return from(axios.put(`${URL}/ampliarContratopersona`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  validarAmpliarContratoPersona: (params) => {
    return from(axios.get(`${URL}/validarAmpliarContrato`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },
}



// export const service = {

//   obtenerContratoActual: (params) => {
//     return from(axios.get(`${URL}/obtenerContratoActual`, { params })).pipe(
//       map(result => result.data.result)
//     ).toPromise();
//   }

// }

//export const storeListar = `${URL}/filtrar`;


//ADD
export const filtraracreditacion = `${URL}/filtraracreditacion`;


