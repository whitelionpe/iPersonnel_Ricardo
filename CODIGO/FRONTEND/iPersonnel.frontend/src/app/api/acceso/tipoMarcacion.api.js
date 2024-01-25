import axios from "axios";
import Constants from "../../store/config/Constants";
import CustomStore from "devextreme/data/custom_store";
import { isNotEmpty } from "../../../_metronic/utils/utils";
import { from } from "rxjs";
import { map } from "rxjs/operators";

export const URL = Constants.API_URL + "/api/AccesoTipoMarcacion";

 
export function obtenerTodos() {
    return from(axios.get(`${URL}/obtenerTodos`)).pipe(
        map(result => result.data.result)
    ).toPromise();
}
 


