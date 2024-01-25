import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/AsistenciaPersonaGrupo";

export const servicePersonaGrupo = {

  obtener: (params) => {
    return from(axios.get(`${URL}/obtener`, { params })).pipe(
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
  eliminarMasivo: (params) => {
     return from(axios.post(`${URL}/eliminarMasivoPersona`,  params )).pipe(
       map(result => result.data.result)
     ).toPromise();
   },

  obtenerZona: (params) => {
    return from(axios.get(`${URL}/obtenerZona`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  obtenerZonaEquipo: (params) => {
    return from(axios.get(`${URL}/obtenerZonaEquipo`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  }, 

}

export const storeFiltrar = `${URL}/filtrar`;  
  