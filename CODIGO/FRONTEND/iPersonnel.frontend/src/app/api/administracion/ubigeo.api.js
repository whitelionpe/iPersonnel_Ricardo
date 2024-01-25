import axios from "axios";
import Constants from "../../store/config/Constants";
import CustomStore from "devextreme/data/custom_store";
import { isNotEmpty } from "../../../_metronic/utils/utils";
import { from } from "rxjs";
import { map } from "rxjs/operators";
export const URL = Constants.API_URL + "/api/administracionubigeo";

export function obtener(params) {
  return from(axios.get(`${URL}/obtener`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtenerTodos() {
  return from(axios.get(`${URL}/obtenerTodos`)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

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
  return axios.delete(`${URL}/eliminar`, { params });
}

export const storeUbigeoListado = new CustomStore({
  //loadMode: 'raw',
  key: "RowIndex",
  load: function (loadOptions) {
    let params = "?";
    ["skip", "take", "requireTotalCount", "sort", "filter"].forEach(function (i) {
      if (i in loadOptions && isNotEmpty(loadOptions[i])) {
        params += `${i}=${JSON.stringify(loadOptions[i])}&`;
      }
    });
    // console.log("storeUbigeoListado.Antes..",params);
    // // params = params.slice(0, -1);
    // console.log("storeUbigeoListado.Despues", params);
    return axios
      .get(`${URL}/listarFiltro${params}`)
      .then(response => {
        return {
          data: response.data.result.data,
          totalCount: response.data.result.totalCount
        };
      })
      .catch(error => {
        throw "Error al recuperar datos"; // + error;
      });
  }
});


export const storeListar = `${URL}/filtrar`;



