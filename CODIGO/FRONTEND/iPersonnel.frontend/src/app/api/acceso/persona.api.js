import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from "rxjs";
import { map } from "rxjs/operators";

export const URL = Constants.API_URL + "/api/AccesoPersona";

export const servicePersona = {    

    exportarExcel: (params) => {
        return from(axios.post(`${URL}/exportarExcel`, params)).pipe(
            map(result => result.data.result)
        ).toPromise();
    },

  

    
}
export const storeListar = `${URL}/filtrar`;

