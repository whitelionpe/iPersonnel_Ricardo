/**
 * High level router.
 *
 * Note: It's recommended to compose related routes in internal router
 * components (e.g: `src/pages/auth/AuthPage`, `src/pages/home/HomePage`).
 */

import React from "react";
import { Redirect, Route, Switch, withRouter } from "react-router-dom";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { useLastLocation } from "react-router-last-location";
import HomePage from "../pages/home/HomePage";
import ErrorsPage from "../pages/errors/ErrorsPage";
import LogoutPage from "../pages/auth/Logout";
import { LayoutContextProvider } from "../../_metronic";
import Layout from "../../_metronic/layout/Layout";
import * as routerHelpers from "../router/RouterHelpers";
import AuthPage from "../pages/auth/AuthPage";
import { refreshTokenLocalStorageKeyName } from "../../_metronic/utils/utils";
import { actions } from '../store/ducks/auth.duck';

export const Routes = withRouter((props) => {

    const { history, location } = props;

    //const lastLocation = useLastLocation();
    //routerHelpers.saveLastLocation(lastLocation);
    const dispatch = useDispatch();
    const updateScreenLock = (value) => dispatch(actions.updateScreenLock(value));

    const pathsLogin = ["/auth/ChangeForgottenPassword"];
    const isLoginWhiteList = pathsLogin.includes(location.pathname);

    const { isAuthorized, menuConfig } = useSelector(
        ({ auth, builder: { menuConfig } }) => ({
            menuConfig,
            isAuthorized: auth.user != null,
            //userLastLocation: routerHelpers.getLastLocation()
        }),
        shallowEqual
    );

    const existsRefreshToken = (localStorage.getItem(refreshTokenLocalStorageKeyName) || "") != "";

    // console.log("--------------------------------------");
    // console.log(`ROUTES::: isAuthorized=${isAuthorized} - existsRefreshToken=${existsRefreshToken} `);
    // console.log(location);
    // console.log(history);
    // console.log(location.pathname);

    // console.log("--------------------------------------");

    if (!existsRefreshToken) {
        //console.log(`ROUTES::: No existe token, se borra splah para redireccionar a Login`); 
        updateScreenLock(1);
    }

    return (
        /* Create `LayoutContext` from current `history` and `menuConfig`. */
        <LayoutContextProvider history={history} menuConfig={menuConfig}>
            <Switch>
                {!isAuthorized || !existsRefreshToken ? (
                    /* Render auth page when user at `/auth` and not authorized. */
                    (isLoginWhiteList) ?
                        <AuthPage history={history} />
                        :
                        <Route path="/" exact component={AuthPage} />
                ) : (
                    /* Otherwise redirect to root page (`/`) */
                    <Redirect from="/auth" to={location.pathname} />
                )}

                <Route path="/error" component={ErrorsPage} />
                <Route path="/logout" component={LogoutPage} />

                {!isAuthorized || !existsRefreshToken ? (
                    // <Redirect to="/auth/login" />
                    <Redirect to="/" />
                ) : (
                    <Layout menu_perfil={menuConfig}>
                        <HomePage />
                    </Layout>
                )}

            </Switch>
        </LayoutContextProvider>
    );
});
