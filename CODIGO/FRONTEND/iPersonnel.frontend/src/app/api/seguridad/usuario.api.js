import axios from "axios";
import Constants from "../../store/config/Constants";
import CustomStore from "devextreme/data/custom_store";
import { isNotEmpty } from "../../../_metronic/utils/utils";
import { from } from "rxjs";
import { map } from "rxjs/operators";
export const URL = Constants.API_URL + "/api/seguridadusuario";

export const serviceUser = {
  obtener: (params) => {
    return from(axios.get(`${URL}/obtener`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  obtenerPersona: (params) => {
    return from(axios.get(`${URL}/obtenerPersona`, { params })).pipe(
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

  actualizarConfiguracionLogueo: (params) => {
    return from(axios.put(`${URL}/actualizarConfiguracionLogueo`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  eliminar: (params) => {
    return from(axios.delete(`${URL}/eliminar`, { params })).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  bloquearUsuario: (params) => {
    return from(axios.put(`${URL}/bloquearUsuario`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  desBloquearUsuario: (params) => {
    return from(axios.put(`${URL}/desBloquearUsuario`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  }

}

export const storeUsuariosListado = new CustomStore({
  key: "RowIndex",
  load: function (loadOptions) {
    let params = "?";
    ["skip", "take", "requireTotalCount", "sort", "filter"].forEach(function (i) {
      if (i in loadOptions && isNotEmpty(loadOptions[i])) {
        params += `${i}=${JSON.stringify(loadOptions[i])}&`;
      }
    });
    // console.log("storeUsuariosListado.Antes..",params);
    return axios
      .get(`${URL}/listarFiltro${params}`)
      .then(response => {
        return {
          data: response.data.data,
          totalCount: response.data.totalCount
        };
      })
      .catch(error => {
        throw "Error al recuperar datos"; // + error;
      });
  }
});

export const storeFiltrar = `${URL}/filtrar`; 

export function keyreport(params) {
  //return axios.post(`${URL}/keyreport`, usuario);
  return from(axios.post(`${URL}/keyreport`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function ActualizarConfiguracionLogueo(params) {
  return from(axios.put(`${URL}/ActualizarConfiguracionLogueo`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

