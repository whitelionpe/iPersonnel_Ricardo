import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from "rxjs";
import { map } from "rxjs/operators";
export const URL = Constants.API_URL + "/api/sistemaentidad";

export const serviceEntidad = {
  
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

  listar: () => {
    return from(axios.get(`${URL}/listar`, {})).pipe(
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
  }

}

////////////////////////--PENDIENTE POR ELIMINIAR-2020-07-10////////////////////////////////////

// export function listarEstadoSimple() {
//   return [{ Valor: "S", Descripcion: "ACTIVO" }, { Valor: "N", Descripcion: "INACTIVO" }];
// }

// export function listarEstado() {
//   return [{ Valor: "S", Descripcion: "SÍ" }, { Valor: "N", Descripcion: "NO" }];
// }

// export function listarSexoSimple() {
//   return [{ Valor: "M", Descripcion: "MASCULINO" }, { Valor: "F", Descripcion: "FEMENINO" }];
// }
// export function listarTipoDato() {
//   return [{ Valor: "I", Descripcion: "NÚMERO" }, { Valor: "S", Descripcion: "CADENA" }, { Valor: "D", Descripcion: "FECHA" }];
// }
// export function listarTipoEntrada() {
//   return [{ Valor: "E", Descripcion: "ENTRADA" }, { Valor: "S", Descripcion: "SALIDA" }, { Valor: "A", Descripcion: "AMBAS" }];
// }

// export function listarIconos() {
//   return [{ id: "inactivefolder", name: 'Inactivefolder', icon: 'inactivefolder' },
//   { id: "activefolder", name: 'Activefolder', icon: 'activefolder' },
//   { id: "map", name: 'Map', icon: 'map' },
//   { id: "key", name: 'Key', icon: 'key' },
//   { id: "bookmark", name: 'Bookmark', icon: 'bookmark' },
//   { id: "user", name: 'User', icon: 'user' },
//   { id: "columnfield", name: 'Columnfield', icon: 'columnfield' },
//   ];
// }

// export function listarTipoObjeto() {
//   return [{ Valor: "B", Descripcion: "BOTON" }, { Valor: "T", Descripcion: "TAB" }];
// }