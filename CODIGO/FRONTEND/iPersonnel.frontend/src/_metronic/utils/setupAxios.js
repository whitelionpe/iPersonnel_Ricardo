//import React, { useContext } from 'react';
import { actions } from "../../app/store/ducks/auth.duck";
import { refreshTokenLocalStorageKeyName } from "./utils";

export function setupAxios(axios, store) {
  const XCustomRefreshTokenHeaderName = "x-custom-refresh-token"; //Nombre de refreshToken en header
  const XCustomRecreatedTokenHeaderName = "x-custom-recreated-token"; //Indica si existe el token de  actualizacion
  const XCustomIsValidDowntimeHeaderName = "x-custom-is-valid-downtime";

  //const updateScreenLock = (value) => dispatch(actions.setInitScreenLock(value));

  const sendRequest = (milliseconds, originalRequest) => {
    // console.log('SETUP_AXIOS:::Request reenviado:',originalRequest);
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(axios.request(originalRequest)), milliseconds);
    });
  };

  //Configuracion de Request:
  axios.interceptors.request.use(
    req => {
      //Se obtiene el path:
      let currentPath = window.location.pathname;
      if (!!currentPath) {
        if (
          req.method.toLowerCase() === "get" ||
          req.method.toLowerCase() === "delete"
        ) {
          let params = req.params;
          if (typeof params === "string") {
            params = JSON.parse(params);
          }

          req.params = {
            ...params,
            urlPath: encodeURIComponent(currentPath)
          };
        } else {
          let dataHeader = req.headers;
          let isFormData = false;

          // let content = req.headers["content-type"];
          for (let item in dataHeader) {
            if (item.toLowerCase() === "content-type") {
              if (dataHeader[item]) {
                isFormData =
                  dataHeader[item].indexOf("multipart/form-data") >= 0;
              }
            }
          }

          //config.headers.put['Content-Type']
          if (isFormData) {
            req.data.append("urlPath", encodeURIComponent(currentPath));
          } else {
            let data = req.data;
            if (typeof data === "string") {
              data = JSON.parse(data);
            }

            req.data = {
              ...data,
              urlPath: encodeURIComponent(currentPath)
            };
          }
          //Content-Type: 'multipart/form-data'
        }
      }

      // console.log('SETUP_AXIOS:::ENVIO INI ----------------------------  ');

      const {
        auth: { authToken }
      } = store.getState();
      // console.log("SETUP_AXIOS:::authToken: ",authToken);

      if (authToken) {
        req.headers.Authorization = `Bearer ${authToken}`;
        const refreshToken = localStorage.getItem(
          refreshTokenLocalStorageKeyName
        );

        if (refreshToken)
          req.headers[XCustomRefreshTokenHeaderName] = refreshToken;
      }
      // console.log('SETUP_AXIOS:::ENVIO END ----------------------------  ');
      return req;
    },
    err => Promise.reject(err)
  );

  //Configuracion de Response:
  axios.interceptors.response.use(
    resp => {
      const { headers } = resp;
      if (
        XCustomRecreatedTokenHeaderName in (headers || {}) &&
        !!headers[XCustomRecreatedTokenHeaderName]
      ) {
        const [refreshToken, isUpdateRefreshToken, isUpdateToken] = JSON.parse(
          headers[XCustomRecreatedTokenHeaderName]
        );

        if (isUpdateRefreshToken == 1 && isUpdateToken == 0) {
          localStorage.setItem(refreshTokenLocalStorageKeyName, refreshToken);
          //Evaluar si se debe agregar al redux.
          //console.log("SETUP AXIOS:::Se actualiza el screenlock");
          !!store && store.dispatch(actions.activateScreenLock(true));
        }
      }
      return resp;
    },
    error => {
      const { config, response } = error;
      const { status, headers } = response || {};

      // console.log('SETUP_AXIOS:::ERROR INI::-------------------------------------------Jimy');
      // console.log("error-->", error);
      // console.log("response-->", response);
      // console.log("status-->", status);
      // console.log("headers-->", headers);
      // console.log('SETUP_AXIOS:::ERROR END::-------------------------------------------JImmy');

      if (!error.response) {
        // console.log("SETUP_AXIOS:::NO EXISTE RESPONSE, SE REDIRECCIONA PAGINA.");
        let path = window.location.pathname;
        // console.log("Error de red", path);
        if (path !== "/auth/login") {
          !!store && store.dispatch(actions.openSplashScreen(true));
        }
      }

      // console.log(`SETUP_AXIOS:::${XCustomRecreatedTokenHeaderName}: `,headers[XCustomRecreatedTokenHeaderName] );

      if (
        XCustomRecreatedTokenHeaderName in (headers || {}) &&
        !!headers[XCustomRecreatedTokenHeaderName]
      ) {
        //    console.log('SETUP_AXIOS:::Se evalua valores:');

        const [token, isUpdateRefreshToken, isUpdateToken] = JSON.parse(
          headers[XCustomRecreatedTokenHeaderName]
        );
        // console.log('SETUP_AXIOS:::token:',token);
        // console.log('SETUP_AXIOS:::isUpdateRefreshToken:',isUpdateRefreshToken);
        // console.log('SETUP_AXIOS:::isUpdateToken:',isUpdateToken);

        //Se actualiza el access toke:
        if (isUpdateRefreshToken == 0 && isUpdateToken == 1) {
          // console.log('SETUP_AXIOS:::Se actualiza el refresh token');
          !!store && store.dispatch(actions.saveRefreshToken(token));
          // console.log('SETUP_AXIOS:::Se reenvia request');
          return axios.request(config);
          //sendRequest(150, config);
        } else {
          // console.log('SETUP_AXIOS:::Se finaliza la sesion.');
          !!store &&
            store.dispatch(actions.logout({ IdUsuario: "2Personnel" }));
        }
      } else if (status === 509) {
        return Promise.resolve(response);
      } else if (status === 401) {
        !!store && store.dispatch(actions.logout({ IdUsuario: "2Personnel" }));
        //Validar Remover los alerts.
      } else {
        return Promise.reject(error);
      }
      // console.log('SETUP_AXIOS:::ERROR END -------------------------------------------  ');
    }
  );
}
