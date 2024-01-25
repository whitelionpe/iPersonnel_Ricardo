import React, { Suspense, lazy, useEffect } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
//import Builder from "./Builder";
import Dashboard from "./Dashboard";
//import DocsPage from "./docs/DocsPage";
import { LayoutSplashScreen } from "../../../_metronic";
import { ErrorPage1 } from "../errors/ErrorPage1";
import { actions } from '../../store/ducks/auth.duck';
import { useDispatch } from "react-redux";

// const GoogleMaterialPage = lazy(() =>
//   import("./google-material/GoogleMaterialPage")
// );
// const ReactBootstrapPage = lazy(() =>
//   import("./react-bootstrap/ReactBootstrapPage")
// );

const SeguridadPage = lazy(() => import(/* webpackChunkName: "Seguridad" */"./seguridad/SeguridadPage"));

const SistemaPage = lazy(() => import(/* webpackChunkName: "Sistema" */"./sistema/SistemaPage"));

const AdministracionPage = lazy(() => import(/* webpackChunkName: "Administracion" */"./administracion/AdministracionPage"));

const AccesoPage = lazy(() => import(/* webpackChunkName: "Acceso" */"./acceso/AccesoPage"));

const IdentificacionPage = lazy(() => import(/* webpackChunkName: "Identificacion" */"./identificacion/IdentificacionPage"));

const CasinoPage = lazy(() => import(/* webpackChunkName: "Casino" */"./casino/CasinoPage"));

const CampamentoPage = lazy(() => import(/* webpackChunkName: "Campamento" */"./campamento/CampamentoPage"));

const AcreditacionPage = lazy(() => import(/* webpackChunkName: "Acreditacion" */"./acreditacion/AcreditacionPage"));

const AsistenciaPage = lazy(() => import(/* webpackChunkName: "Asistencia" */"./asistencia/AsistenciaPage"));

const TransportePage = lazy(() => import(/* webpackChunkName: "Transporte" */"./transporte/TransportePage"));


//process.env.PUBLIC_URL
export default function HomePage(props) {
  const dispatch = useDispatch();
  const setInitScreenLock = (value) => dispatch(actions.setInitScreenLock(value));

  useEffect(() => {
    setInitScreenLock(1);
  }, []);

  return (

    <Suspense fallback={<LayoutSplashScreen />}>

      <Switch>
        {
          /* Redirect from root URL to /dashboard. */
          <Redirect exact from="/" to="/dashboard" />
        }
        {/* <Route path="/builder" component={Builder} /> */}
        <Route path="/dashboard" component={Dashboard} />
        {/* <Route path="/google-material" component={GoogleMaterialPage} />
        <Route path="/react-bootstrap" component={ReactBootstrapPage} />
        <Route path="/docs" component={DocsPage} /> */}
        <Route path="/seguridad" component={SeguridadPage} />
        <Route path="/sistema" component={SistemaPage} />
        <Route path="/administracion" component={AdministracionPage} />
        <Route path="/acceso" component={AccesoPage} />
        <Route path="/acreditacion" component={AcreditacionPage} />
        <Route path="/identificacion" component={IdentificacionPage} />
        <Route path="/casino" component={CasinoPage} />
        <Route path="/campamento" component={CampamentoPage} />
        <Route path="/asistencia" component={AsistenciaPage} />
        <Route path="/transporte" component={TransportePage} />

        <Route path="*" component={ErrorPage1} />
        <Redirect to="/error/error-v1" />

      </Switch>

    </Suspense>

  );
}
