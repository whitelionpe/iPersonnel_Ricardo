import axios from "axios";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import Constants from "../../store/config/Constants";

export const URL = Constants.API_URL + "/api/TransporteManifiestoResponsable";

export const service = {
  // Lista todas las rutas para una fecha especificada | params: { FechaProgramacion }
  listarRutas: (params) => from(axios.get(`${URL}/rutas`, { params })).pipe(map(response => response.data)).toPromise(),
  // Lista todas las horas de salida de un bus para una fecha y ruta especificada | params: { IdParaderoOrigen, IdParaderoDestino, FechaProgramacion }
  listarHoras: (params) => from(axios.get(`${URL}/horas`, { params })).pipe(map(response => response.data)).toPromise(),
  // Lista todos los paraderos de una ruta (tipo: ORIGEN o DESTINO) | params: { IdManifiesto, Tipo: {'ORI','DES'} }
  listarParaderos: (params) => from(axios.get(`${URL}/paraderos`, { params })).pipe(map(response => response.data)).toPromise(),
  // Asigna un pasajero a un asiento (update -> Transporte_Manifiesto_Detalle) | params: { IdManifiesto, CodigoTrabajador, IdParaderoOrigen, IdParaderoDestino }
  //asignar: (params) => from(axios.put(`${URL}/asignar`, { params })).pipe(map(response => response.data)).toPromise(),

  asignar: (params) => {
    return from(axios.put(`${URL}/asignar`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  // Actualizar un pasajero a un asiento (update -> Transporte_Manifiesto_Detalle) | params: { IdManifiesto, CodigoTrabajador, IdParaderoOrigen, IdParaderoDestino }
  actualizar: (params) => from(axios.put(`${URL}/actualizar`, { params })).pipe(map(response => response.data)).toPromise(),

  // Elimina la asignación del trabajador con el asiento (delete -> Transporte_Manifiesto_Detalle) | params: { IdManifiesto, Asiento }
  eliminarAsignacion: (params) => from(axios.delete(`${URL}/eliminarAsignacion`, { params })).pipe(map(response => response.data)).toPromise(),
  // Lista todas las asignaciones para un IdManifiesto | params: { IdManifiesto }
  listar: (params) => from(axios.get(`${URL}/listar`, { params })).pipe(map(response => response.data)).toPromise(),
  // Obtiene información del manifiesto | params: { IdManifiesto }
  obtenerManifiesto: (params) => from(axios.get(`${URL}/obtenerManifiesto`, { params })).pipe(map(response => response.data)).toPromise(),
  // Obtiene la cantidad de asientos libres para un determinado manifiesto | params: { IdManifiesto }
  obtenerAsientosLibres: (params) => from(axios.get(`${URL}/obtenerAsientosLibres`, { params })).pipe(map(response => response.data)).toPromise(),
  // Lista todos los paraderos activos y excluye el partadero pasado por paránmetro | params: { IdParaderoAExcluir }
  listarParaderosTodos: (params) => from(axios.get(`${URL}/paraderosTodos`, { params })).pipe(map(response => response.data)).toPromise(),
  // Lista todos los paraderos de las rutas (tipo: ORIGEN o DESTINO) | params: { Tipo: {'ORI','DES'}, IdParaderoTipoOpuesto }
  listarParaderosRutas: (params) => from(axios.get(`${URL}/paraderosRutas`, { params })).pipe(map(response => response.data)).toPromise(),
  // Lista todos los paraderos activos y excluye el partadero pasado por paránmetro | params: { IdParaderoOrigen, IdParaderoDestino }
  listarFechasProgramadas: (params) => from(axios.get(`${URL}/listarFechasProgramadas`, { params })).pipe(map(response => response.data)).toPromise(),
  // Lista todas las validaciones de acceso para un trabajadfor para una fecha específica | params: { CodigoTrabajador, FechaConsulta }
  listarValidacionesAcceso: (params) => from(axios.get(`${URL}/listarValidacionesAcceso`, { params })).pipe(map(response => response.data)).toPromise(),
};
