import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { ProtectedRoute } from '../../../router/ProtectedRoute';

import MotivoIndexPage from "./motivo/MotivoIndexPage"
import TipoIdentificacionIndexPage from "./tipoIdentificacion/TipoIdentificacionIndexPage";
import TipoCredencialIndexPage from "./tipoCredencial/TipoCredencialIndexPage"
import PersonaCredencialIndexPage from "./personaCredencial/PersonaCredencialIndexPage"
import LicenciaIndexPage from "./licencia/LicenciaIndexPage"
import VehiculoIndexPage from "./vehiculo/VehiculoIndexPage"
import DevolucionMasivaIndexPage from "./devolucionMasiva/DevolucionMasivaIndexPage"
import rs001_EmisionFotocheck from "./reporte/rs001_EmisionFotocheck/EmisionFotocheckIndexPage";
import rs002_Biometria from "./reporte/rs002_Biometria/BiometriaIndexPage";
import r001_FotocheckPorPeriodo from "./reporte/r001_FotocheckPorPeriodo/FotocheckPorPeriodoIndexPage";

export default function AccesoPage() {
  return (

    <Switch>

      <Redirect
        exact={true}
        from="/identificacion"
        to="/identificacion/"
      />

      <ProtectedRoute
        path="/identificacion/motivo"
        component={MotivoIndexPage}
      />
      <ProtectedRoute
        path="/identificacion/tipoIdentificacion"
        component={TipoIdentificacionIndexPage}
      />
      <ProtectedRoute
        path="/identificacion/tipoCredencial"
        component={TipoCredencialIndexPage}
      />
      <ProtectedRoute
        path="/identificacion/persona"
        component={PersonaCredencialIndexPage}
      />
      <ProtectedRoute
        path="/identificacion/licencia"
        component={LicenciaIndexPage}
      />
      <ProtectedRoute
        path="/identificacion/vehiculo"
        component={VehiculoIndexPage}
      />
      <ProtectedRoute
        path="/identificacion/devolucionMasiva"
        component={DevolucionMasivaIndexPage}
      />

      <ProtectedRoute path="/identificacion/fotocheck"
        component={rs001_EmisionFotocheck}
      />

      <ProtectedRoute path="/identificacion/biometria"
        component={rs002_Biometria}
      />

      <ProtectedRoute path="/identificacion/r001_FotocheckPorPeriodo"
        component={r001_FotocheckPorPeriodo}
      />
 

    </Switch>

  );
}

