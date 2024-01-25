import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/AsistenciaGrupoZonaEquipo";

export const serviceZonaEquipo = {
 
  crear: (params) => {
    return from(axios.post(`${URL}/crear`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  crearMultiple: (params) => {
    //console.log("params", params);
    return from(axios.post(`${URL}/crearMultiple`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  eliminar: (params) => {
    return from(axios.delete(`${URL}/eliminar`, { params })).pipe(
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

  listarTreeViewGrupoZonaEquipo: (params) => {
    return from(axios.get(`${URL}/listarTreeViewPopup`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  }

}

