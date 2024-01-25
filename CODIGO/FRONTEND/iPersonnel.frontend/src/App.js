/**
 * Entry application component used to compose providers and render Routes.
 *
 * Note: Because of
 */

import React, { useEffect, useRef, useState } from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { LastLocationProvider } from "react-router-last-location";
import { Routes } from "./app/router/Routes";
import { I18nProvider, LayoutSplashScreen, ThemeProvider } from "./_metronic";

//---------------------------------------------------
import { useSelector, useStore } from "react-redux";
//import crossCuttingService from "./app/shared/SimulateCrossCuttingService";
//import PasswordRequestForm from "./app/partials/components/PasswordRequestForm/PasswordRequestForm";
import { actions } from "./app/store/ducks/auth.duck";
//import { isBoolean, isSet } from "./app/shared/CommonHelper";

//import constants from "./app/shared/GlobalConstants";

//---------------------------------------------------
import Relogin from './app/pages/auth/Relogin';
import RedirectSplashScreen from './app/partials/components/RedirectSplashScreen/RedirectSplashScreen';
//---------------------------------------------------
import ScreenLockProvider from './app/context/ScreenLockContext';

export default function App({ store, persistor, basename }) {
  return (
    /* Provide Redux store */
    <Provider store={store} loading={<LayoutSplashScreen />}>
      {/* Asynchronously persist redux stores and show `SplashScreen` while it's loading. */}
      <PersistGate persistor={persistor}>
        <ScreenLockProvider>
        
          {/* Add high level `Suspense` in case if was not handled inside the React tree. */}
          <React.Suspense fallback={<LayoutSplashScreen />}>
            {/* Override `basename` (e.g: `homepage` in `package.json`) */}
            <BrowserRouter basename={basename}>
              {/*This library only returns the location that has been active before the recent location change in the current window lifetime.*/}
              <LastLocationProvider>
                {/* Provide theme overrides. */}
                <ThemeProvider>
                  {/* Provide `react-intl` context synchronized with Redux state.  */}
                  <I18nProvider>
                    {/* Render routes with provided `Layout`. */}
                    <RedirectSplashScreen />
                    <Relogin store={store} />
                    <Routes store={store} />
                  </I18nProvider>
                </ThemeProvider>
              </LastLocationProvider>
            </BrowserRouter>
          </React.Suspense>
        </ScreenLockProvider>
      </PersistGate>
    </Provider>
  );
}
