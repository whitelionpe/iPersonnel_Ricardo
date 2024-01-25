import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from "rxjs";
import { map } from "rxjs/operators";

export const URL = Constants.API_URL + "/api/fileBase64Helpers";

export function downloadFile(params) {
    return from(axios.get(`${URL}/downloadFileBase64`, { params })).pipe(
        map(result => result.data.result)
    ).toPromise();
}

export function uploadFile(params) {
    //console.log("uploadFile",params);
    return from(axios.post(`${URL}/uploadFileBase64`, params)).pipe(
        map(result => result.data.result)
    ).toPromise();
}

