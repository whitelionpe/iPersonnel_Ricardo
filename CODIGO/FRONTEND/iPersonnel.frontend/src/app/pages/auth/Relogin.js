import React, { useEffect, useRef, useState, useContext } from 'react';

import { useSelector, useStore } from "react-redux";
//import crossCuttingService from "./app/shared/SimulateCrossCuttingService";
import PasswordRequestForm from '../../partials/components/PasswordRequestForm/PasswordRequestForm';

import { actions } from "../../store/ducks/auth.duck";
import { isBoolean, isSet, GlobalConstants, refreshTokenLocalStorageKeyName } from "../../../_metronic/utils/utils";
import { refreshTokenPasswordX } from '../../crud/auth.crud';
import { ScreenLockContext } from '../../context/ScreenLockContext';
//refreshTokenPassword

//import constants from "./app/shared/GlobalConstants";

const Relogin = ({ store }) => {

    const { setCountTime } = useContext(ScreenLockContext);
    const errorMessagePasswordRequired = 'Es necesario ingresar la contraseña';
    const activateScreenLook = useSelector(state => state.auth.ScreenLook.activate);
    const { username, idUsuario } = useSelector(({ auth: { user: { firstName: username = "", username: idUsuario = "" } = {} } = {}, }) => ({ username, idUsuario }));
    const perfil = useSelector(state => state.perfil.perfilActual);

    const [isOpen, setIsOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const WhiteListPath = ["/auth/login"];

    useEffect(() => {
        let pathAccess = isPathAccess();
        let flag = activateScreenLook == 1 && pathAccess;
        //console.log(`RELOGIN::: PathAccess=${pathAccess} - activateScreenLook=${activateScreenLook} - Flag=${flag}`);

        setIsOpen(flag);

    }, [activateScreenLook]);


    useEffect(() => {
        //console.log(`RELOGIN::: isOpen=${isOpen} - isPahAccess=${!isPathAccess()}`);

        if (isOpen && !isPathAccess()) {
            //console.log("RELOGIN:::En login se desactiva splah:", isOpen);
            setIsOpen(false);
        }


    }, [isOpen]);

    const isPathAccess = () => {
        let path = window.location.pathname;
        let pathAccess = !WhiteListPath.includes(path);
        //console.log(`RELOGIN::: path=${path} - pathAccess=${pathAccess}`);
        return pathAccess;
    }



    const onSendCredential = async (credencial) => {
        const { password, token } = credencial;
        if (isSet(password) && isSet(idUsuario)) {
            let idPerfil = perfil.IdPerfil;
            await refreshTokenPasswordX({ idUsuario, password, idPerfil, tokenClient: token }).then((data) => {
                //console.log("refreshTokenPasswordX",data);
                if (data != undefined) {
                    let { respuesta, username, accessToken, refreshToken } = data;

                    if (!!accessToken) {
                        store.dispatch(actions.saveRefreshToken(accessToken));
                        localStorage.setItem(refreshTokenLocalStorageKeyName, refreshToken);
                        //Actualizando el contador: 
                        setCountTime(0);
                    }
                }

            }).catch(err => {
                //console.log("refreshTokenPasswordX.catch", err);
                if (err.response !== undefined && err.response.hasOwnProperty('data')) {
                    let dataError = err.response.data;
                    if (dataError === undefined) {
                        setErrorMessage("Error de conexión al servidor.");

                    } else {
                        setErrorMessage(dataError.message);
                    }
                } else {
                    setErrorMessage("Error de conexión al servidor.");
                }
            });
        } else {
            setErrorMessage(errorMessagePasswordRequired);
        }
    };
    const onBackLogin = () => {
        store.dispatch(actions.logout({ IdUsuario: username }));
    };
    const onCleanedErrorMessage = () => setErrorMessage("");

    return (
        <PasswordRequestForm 
            isOpen={isOpen}
            // isOpen={true}
            username={username}
            errorMessage={errorMessage}
            timeoutErrorMessage={5000}
            onSendCredential={onSendCredential}
            onBackLogin={onBackLogin}
            onCleanedErrorMessage={onCleanedErrorMessage}
        />
    );
}


export default Relogin;