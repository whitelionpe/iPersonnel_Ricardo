import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from "rxjs";
import { map } from "rxjs/operators";

export const URL = Constants.API_URL + "/api/AccesoPersonaPerfil";

export const serviceAccesoPersonaPerfil = {

  listar: (params) => {
    console.log("listar.api", params);
    return from(axios.get(`${URL}/listar`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  obtener: (params) => {
    return from(axios.get(`${URL}/obtener`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  crear: (params) => {
    return from(axios.post(`${URL}/crear`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  crearMultiple: (params) => {
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
    return from(axios.delete(`${URL}/eliminar`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  listarHistorial: (params) => {
    return from(axios.get(`${URL}/listarHistorial`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },
  

}

export const storeListar = `${URL}/filtrar`;
