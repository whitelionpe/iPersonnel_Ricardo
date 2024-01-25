import axios from "axios";
import { from } from "rxjs";
import { map } from "rxjs/operators";
import Constants from "../../store/config/Constants";

export const URL = Constants.API_URL + "/api/SistemaPlantillaCorreo";

export function obtenerTodos(params) {
  return from(axios.get(`${URL}/obtenerTodos`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}
