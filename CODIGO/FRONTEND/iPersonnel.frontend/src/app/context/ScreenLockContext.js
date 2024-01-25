import React, { createContext, useState, useEffect, useRef } from 'react';
import { useSelector, useStore, useDispatch } from "react-redux";
import { actions } from '../store/ducks/auth.duck';
import Constants from '../store/config/Constants';
import { Redirect } from "react-router-dom";
export const ScreenLockContext = createContext();

const ScreenLockProvider = (props) => {
    const refCallBack = useRef();

    //ScreenLock: ---------------------------------------------------
    const dispatch = useDispatch();
    const updateScreenLock = (value) => dispatch(actions.updateScreenLock(value));
    const updateCountTime = (value) => dispatch(actions.updateCountTime(value));
    const ScreenLook = useSelector(state => state.auth.ScreenLook);
    const usuario = useSelector(state => state.auth.user);
    //---------------------------------------------------------------
    //RedirectSplashScreen:------------------------------------------
    const TotalSeconds = 5;
    const [MessageTitle, setMessageTitle] = useState("Error de conexión");
    const [MessageBody, setMessageBody] = useState("La página se redireccionará");
    const [MessageSeconds, setMessageSeconds] = useState(TotalSeconds);
    //const [MessageOpen, setMessageOpen] = useState(false);
    const isOpenSplashScreen = useSelector(state => state.auth.isOpenSplashScreen);
    const openSplashScreen = (value) => dispatch(actions.openSplashScreen(value));
    const logout = (IdUsuario) => dispatch(actions.logout({ IdUsuario }));
    //Agregar el redux con el flag de redireccion
    //---------------------------------------------------------------

    function aumentarContador() {
        // console.log(`SCREEN_LOCK_PROVIDER::: ScreenLook.init=${ScreenLook.init}`);
        if (ScreenLook.init === 1) {
            console.log(`SCREEN_LOCK_PROVIDER::: ActualizarContador=${true}`);
            updateCountTime(true)
            if (ScreenLook.countTime >= Constants.SECONDS_TIMEOUT_FOR_LOCK) {
                console.log(`SCREEN_LOCK_PROVIDER::: UpdateScreenLock=${1}`);
                updateScreenLock(1);
            }
        } else {
            //console.log(`SCREEN_LOCK_PROVIDER::: ActualizarContador=${false}`);
            updateCountTime(false);
        }

        if (isOpenSplashScreen) {
            let cont = MessageSeconds - 1;
            //console.log("SCREEN_LOCK_PROVIDER::: contador: ", cont);
            setMessageBody(`La página se redireccionará en ${MessageSeconds} segundos.`)

            setMessageSeconds(cont);
        }

    }

    function setCountTime(value) {
        let flag = value != 0 || false;
        updateCountTime(flag)
    }


    useEffect(() => {
        refCallBack.current = aumentarContador;
    });

    useEffect(() => {

        if (isOpenSplashScreen && MessageSeconds < -1) {
            //setMessageOpen(false);
            openSplashScreen(false)
            setMessageSeconds(TotalSeconds);
            //console.log("SCREEN_LOCK_PROVIDER::: Se redirecciona pagina");
            if (usuario) logout(usuario.username);
        }

    }, [MessageSeconds]);


    useEffect(() => {
        function tick() {
            refCallBack.current();
        }
        let id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);


    return (
        <ScreenLockContext.Provider
            value={{
                aumentarContador,
                setCountTime,
                MessageTitle,
                MessageBody,
                isOpenSplashScreen,
                //setMessageOpen
            }}
        >
            {props.children}
        </ScreenLockContext.Provider>
    );
};

export default ScreenLockProvider;