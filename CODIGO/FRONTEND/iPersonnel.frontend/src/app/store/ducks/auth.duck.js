import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { put, takeLatest } from "redux-saga/effects";
import { getUserByTokenX } from "../../crud/auth.crud";
import * as routerHelpers from "../../router/RouterHelpers";
import { refreshTokenLocalStorageKeyName } from "../../../_metronic/utils/utils";
import { expiretoken } from '../../api/seguridad/usuarioClaveAcceso.api';
import { removeAllLocalStorageCustomDatagrid } from "../../../_metronic/utils/securityUtils";

export const actionTypes = {
    Login: "[Login] Action",
    Logout: "[Logout] Action",
    LogoutStore: "[Logout] Action remove login",
    Register: "[Register] Action",
    UserRequested: "[Request User] Action",
    UserLoaded: "[Load User] Auth API",
    RefreshToken: "[Refresh Token] Refresh Token",
    SaveRefreshToken: "[Save Refresh Token] Save Refresh Token",
    ScreenLock: "[Screen Lock] Action",
    InitScreenLook: "[Screen Lock] Init Screen Look",
    AddCountTime: "[Screen Lock] Set count time",
    OpenSplashScreen: "[Open Splash Screen] Flag redirect page",
};

const initialAuthState = {
    user: undefined,
    authToken: undefined,
    ScreenLook: {
        init: 0, //Inicia el contador
        activate: 0, //Activa el bloqueo
        countTime: 0 //Contador para activar el bloqueo
    },
    isOpenSplashScreen: false
};

export const reducer = persistReducer(
    { storage, key: "storage-auth", whitelist: ["user", "authToken"] },
    (state = initialAuthState, action) => {
        switch (action.type) {
            case actionTypes.Login: {
                //console.log(`REDUCER::: [Login] payload=${action.payload }`);
                const { authToken } = action.payload;

                return {
                    authToken,
                    user: undefined,
                    ScreenLook: {
                        init: 1,
                        activate: 0,
                        countTime: 0
                    }
                };
            }

            case actionTypes.Register: {
                //console.log(`REDUCER::: [Register] payload=${action.payload }`);
                const { authToken } = action.payload;
                return { authToken, user: undefined };
            }

            //case actionTypes.Logout: {
            case actionTypes.LogoutStore: {
                //console.log(`REDUCER::: [Logout] payload=${action.payload }`);
                localStorage.removeItem(refreshTokenLocalStorageKeyName);
                removeAllLocalStorageCustomDatagrid();
                routerHelpers.forgotLastLocation();
                return initialAuthState;
            }

            case actionTypes.UserLoaded: {
                console.log(`REDUCER::: [UserLoaded] payload=${action.payload}`);
                const { user } = action.payload;
                return { ...state, user };
            }

            // case actionTypes.Perfil: {
            //     const { perfil } = action.payload;
            //     return { ...state, perfil };
            // }

            case actionTypes.SaveRefreshToken: {
                //console.log(`REDUCER::: [SaveRefreshToken] payload=${action.payload }`);
                const { authToken } = action.payload || {};
                if (!!authToken) {
                    let oldScreenOption = state.ScreenLook;
                    oldScreenOption.init = 1;
                    oldScreenOption.activate = 0;
                    oldScreenOption.countTime = 0;
                    return {
                        ...state,
                        authToken,
                        ScreenLook: oldScreenOption
                    }
                }
                else return { ...state }
            }

            case actionTypes.ScreenLock: {
                //console.log(`REDUCER::: [ScreenLock] payload=${action.payload }`);
                let flag = action.payload || 0;
                let oldScreenOption = state.ScreenLook;
                oldScreenOption.activate = flag;
                if (flag === 1) {
                    let refreshToken = localStorage.getItem(refreshTokenLocalStorageKeyName);

                    if (refreshToken === null || refreshToken === "") {
                        //Ya se ha removido, Se detiene la busqueda y se reinicia el contador
                        oldScreenOption.init = 0;
                        oldScreenOption.activate = 0;
                        oldScreenOption.countTime = 0;
                    } else {
                        //Se elimina el valor
                        //Se detiene el conteo
                        oldScreenOption.init = 0;
                        localStorage.removeItem(refreshTokenLocalStorageKeyName);
                    }

                    return {
                        ...state,
                        authToken: undefined,
                        ScreenLook: oldScreenOption
                    }
                } else {
                    return {
                        ...state,
                        ScreenLook: oldScreenOption
                    }
                }


            }
            case actionTypes.InitScreenLook: {
                //console.log(`REDUCER::: [InitScreenLook] payload=${action.payload }`);
                let oldScreenOption = state.ScreenLook;
                oldScreenOption.init = action.payload;
                return {
                    ...state,
                    ScreenLook: oldScreenOption
                };
            }
            case actionTypes.AddCountTime: {
                //console.log(`REDUCER::: [AddCountTime] payload=${action.payload }`);
                let oldScreenOption = state.ScreenLook;

                if (action.payload) {
                    oldScreenOption.countTime += 1;
                } else {
                    oldScreenOption.countTime = 0;
                }

                return {
                    ...state,
                    ScreenLook: oldScreenOption
                };
            }

            //Agregar accion de splash
            case actionTypes.OpenSplashScreen: {
                return {
                    ...state,
                    isOpenSplashScreen: action.payload
                }
            }

            default:
                return state;

        }
    }
);

export const actions = {
    login: authToken => ({ type: actionTypes.Login, payload: { authToken } }),
    register: authToken => ({
        type: actionTypes.Register,
        payload: { authToken }
    }),
    LogoutStore: () => ({ type: actionTypes.LogoutStore }),
    logout: (user) => ({ type: actionTypes.Logout, payload: user }),
    requestUser: user => ({ type: actionTypes.UserRequested, payload: { user } }),
    fulfillUser: user => ({ type: actionTypes.UserLoaded, payload: { user } }),
    //perfil: perfil => ({ type: actionTypes.Perfil, payload: { perfil } })
    saveRefreshToken: authToken => ({ type: actionTypes.SaveRefreshToken, payload: { authToken } }),
    updateScreenLock: activateScreenLook => ({ type: actionTypes.ScreenLock, payload: activateScreenLook }),
    setInitScreenLock: value => ({ type: actionTypes.InitScreenLook, payload: value }),
    updateCountTime: value => ({ type: actionTypes.AddCountTime, payload: value }),
    openSplashScreen: value => ({ type: actionTypes.OpenSplashScreen, payload: value })
};

export function* saga() {
    yield takeLatest(actionTypes.Login, function* loginSaga() {
        yield put(actions.requestUser());
    });

    yield takeLatest(actionTypes.Register, function* registerSaga() {
        yield put(actions.requestUser());
    });

    yield takeLatest(actionTypes.UserRequested, function* userRequested() {
        //const { data: user } = yield getUserByTokenX();
        let response = yield getUserByTokenX();
        yield put(actions.fulfillUser(response.data.result));
    });

    yield takeLatest(actionTypes.Logout, function* cerrarSesionSaga({ payload }) {
        // console.log("payload", payload);
        // let refreshToken = localStorage.getItem(refreshTokenLocalStorageKeyName);
        // let { IdUsuario } = payload;

        try {
            yield expiretoken({})
            yield put(actions.LogoutStore())
        } catch (error) {
            yield put(actions.LogoutStore())
        }
    });

}
