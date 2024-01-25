import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/AdministracionReporteVehiculo";

export const serviceReporte = {

  exportarR004_VehiculosPorSede: (params) => {
    return from(axios.post(`${URL}/exportarExcelR004_VehiculosPorSede`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

}

export const filtrarR004_VehiculosPorSede = `${URL}/filtrarR004_VehiculosPorSede`;

