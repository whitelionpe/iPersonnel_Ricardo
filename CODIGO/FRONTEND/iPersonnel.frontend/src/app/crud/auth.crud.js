import axios from "axios";
import Constants from "../store/config/Constants";
import { from } from "rxjs";
import { map } from "rxjs/operators";

export const LOGIN_URL = Constants.API_URL + "/api/usuario/authenticate";
export const REGISTER_URL = "api/auth/register";
export const REQUEST_PASSWORD_URL = "api/auth/forgot-password";
export const REFRESH_TOKEN_PWD_URL = Constants.API_URL + "/api/usuario/refreshTokenPassword";
export const REFRESH_TOKEN_PERFIL_URL = Constants.API_URL + "/api/usuario/refreshTokenbyperfil";
export const ME_URL = Constants.API_URL + "/api/usuario/getUserByToken";
export const LOGIN_AD_URL = Constants.API_URL + "/api/UsuarioAD/authenticateAzureAD"; 

export function login(username, password, tokenClient) {

  return from(axios.post(LOGIN_URL, {
    username, password,
    idAplicacion: Constants.APLICACION,
    idTipoAplicacion: Constants.ID_TIPO_APLICACION,
    tokenClient
  }
  )).pipe(
    map(result => result.data.result)
  ).toPromise();
}
 
export async function loginbyAD(accessToken, params) {

  let response = null;
  let data = { ...params };
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;
  headers.append("Authorization", bearer);

  if (data) headers.append('Content-Type', 'application/json');
  let options = {
    method: 'POST',
    headers: headers,
    body: data ? JSON.stringify(data) : null,
  };

  response = await fetch(LOGIN_AD_URL, options)
    .then(response => {
      if ((response.status === 200 || response.status === 201)) {
        return response.json();
      } else {
        throw new Error(response.status);
      }
    })
    .then(data => { return data.result; })
    .catch(error => { console.log("Error", error); return null; });

  return response;
} 

export function requestPassword(email) {
  return axios.post(REQUEST_PASSWORD_URL, { email });
}

export function getUserByTokenX() {
  // Authorization head should be fulfilled in interceptor.
  return axios.get(ME_URL);
  // return from(axios.get(ME_URL)).pipe(
  //   map(result => result.data.result)
  // ).toPromise();
}

export function refreshTokenPasswordX(params) {
  //return axios.post(REFRESH_TOKEN_PWD_URL, { username, password, idPerfil });
  const { idUsuario, password, idPerfil, tokenClient } = params;
  return from(axios.post(REFRESH_TOKEN_PWD_URL, { username: idUsuario, password, idPerfil, idAplicacion: Constants.APLICACION, idTipoAplicacion: Constants.ID_TIPO_APLICACION, tokenClient })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function refreshTokenPerfilX(params) {
  //console.log("refreshTokenPerfilX->", params);
  //return axios.post(REFRESH_TOKEN_PERFIL_URL, { idPerfil });
  return from(axios.post(REFRESH_TOKEN_PERFIL_URL, params)).pipe(
    map(result => result.data.result)
  ).toPromise();

}


export function validateloginX(params) {
  // return axios.post(`${Constants.API_URL}/api/usuario/validatelogin`,
  //   { ...params, idAplicacion: Constants.APLICACION, idTipoAplicacion: Constants.ID_TIPO_APLICACION });

  return from(axios.post(`${Constants.API_URL}/api/usuario/validatelogin`, { ...params, idAplicacion: Constants.APLICACION, idTipoAplicacion: Constants.ID_TIPO_APLICACION })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function resendcodeX(params) {
  //return axios.post(`${Constants.API_URL}/api/usuario/resendcode`, params);
  return from(axios.post(`${Constants.API_URL}/api/usuario/resendcode`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}
