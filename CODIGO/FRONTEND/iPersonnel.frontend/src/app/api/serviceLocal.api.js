import axios from "axios";
import Constants from "../store/config/Constants";
import { from } from "rxjs";
import { map } from "rxjs/operators";
export const URL = Constants.API_URL_LOCALHOST + "/api/Service";

export const serviceLocal = {

  PrintBadge: (params) => {
    //console.log("params-->", params);
    return from(axios.post(`${URL}/PrintBadge`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  EditBadge: (params) => {
    //console.log("params-->", params);
    return from(axios.post(`${URL}/EditBadge`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  UploadDesign: (params) => {
    //console.log("params-->", params);
    return from(axios.post(`${URL}/UploadDesign`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },

  DownloadDesign: (params) => {
    //console.log("download-params-->", params);
    return from(axios.post(`${URL}/DownloadDesign`, params)).pipe(
      map(result => result.data.result)
    ).toPromise();
  },
  EnroladorSigma:(params) => {
    return from(axios.post(`${URL}/EnroladorSigma`, params)).pipe(
        map(result => result.data.result)
    ).toPromise();
  },

}

