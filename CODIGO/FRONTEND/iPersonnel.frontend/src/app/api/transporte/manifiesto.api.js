import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/TransporteManifiesto";

export const service = {

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

  actualizarEstados: (params) => {
    return from(axios.put(`${URL}/actualizarEstados`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  eliminar: (params) => {
    return from(axios.delete(`${URL}/eliminar`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  listarInformacionAsientos: (params) => {
    return from(axios.get(`${URL}/listarInformacionAsientos`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  listarReporteUrbanito :(params) => {
    return from(axios.get(`${URL}/listarReporteUrbanito`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  }
  
}

export const storeListar = `${URL}/filtrar`;
export const storeListarVehiculos = `${URL}/filtrarVehiculos`;
export const storeListarPersonas = `${URL}/filtrarPersonas`; //Traes personas con licencia. -_-
export const storeListarTrabajadores = `${URL}/filtrarTrabajadores`;
export const storeListarChofer = `${URL}/filtrarChofer`;


