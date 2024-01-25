import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/accesogrupopuerta";


export const serviceAccesoGrupoPuerta = {

  obtener: (params) => {
    return from(axios.get(`${URL}/obtener`, { params: params })).pipe(
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

  crearMultiple: (params) => {
    console.log("params", params);
    return from(axios.post(`${URL}/crearMultiple`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  actualizar: (params) => {
    return from(axios.put(`${URL}/actualizar`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  eliminar: (params) => {
    return from(axios.delete(`${URL}/eliminar`, { params: params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  listarTreeView:(params)=> {
    return from(axios.get(`${URL}/listartreeview`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },
  
  listarTreeViewGrupoPuerta: (params) => {
    return from(axios.get(`${URL}/listarTreeViewGrupoPuerta`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  }

}



