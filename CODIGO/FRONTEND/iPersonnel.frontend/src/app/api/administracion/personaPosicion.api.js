import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/administracionpersonaposicion";

export const servicioPersonaPosicion = {

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

  //JDL.>Endpoint sera exclusivo para PDT hasta incluir una division 
  // obtenerActual: (params) => {
  //   return from(axios.get(`${URL}/obtenerActual`, { params })).pipe(
  //     map(result => result.data.result)
  //   ).toPromise();
  // },

  obtenerActualxSede: (params) => {
    return from(axios.get(`${URL}/obtenerActualxSede`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },


  validar: (params) => {
    return from(axios.put(`${URL}/validar`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  listar: (params) => {
    return from(axios.get(`${URL}/listar`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  listarTreeview: (params) => {
    return from(axios.get(`${URL}/listarTreeview`, { params })).pipe(
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

  personas: (params) => {
    return from(axios.get(`${URL}/Personas`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  obtenerPeriodoPosicion: (params) => {
    return from(axios.post(`${URL}/obtenerPeriodoPosicion`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  }



}