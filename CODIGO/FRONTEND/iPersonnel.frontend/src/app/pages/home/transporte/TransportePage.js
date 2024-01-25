import React from "react";
import { Redirect, Switch } from "react-router-dom";

import TipoRutaIndexPage from "./tipoRuta/TipoRutaIndexPage";
import RutaIndexPage from "./ruta/RutaIndexPage";
import ParaderoIndexPage from "./paradero/ParaderoIndexPage";
import ManifiestoCupoIndexPage from "./manifiestoReservacionCupoSemanal/ManifiestoCupoIndexPage";
import TipoProgramacionIndexPage from "./tipoProgramacion/TipoProgramacionIndexPage";
import ProgramacionIndexPage from "./programacion/ProgramacionIndexPage";
import ManifiestoIndexPage from "./manifiesto/ManifiestoIndexPage";
import VehiculoIndexPage from "./vehiculo/VehiculoIndexPage";
import PersonaIndexPage from "./persona/PersonaIndexPage";
import ManifiestoFinalIndexPage from "./reporte/r001_ManifiestoFinal/ManifiestoFinalIndexPage";
import ProgramacionesManifiestos from "./reporte/r002_ProgramacionesManifiestos/ProgramacionesManifiestos";
import OcupacionBuses from "./reporte/r003_OcupacionBuses/OcupacionBuses";
import PersonalNoAbordo from "./reporte/r004_PersonalNoAbordo/PersonalNoAbordo";
import PersonalEmbarque from "./reporte/r005_PersonalEmbarque/PersonalEmbarque";
import ProgramacionesManifiestosUrbanito from "./reporte/r006_ProgramacionesManifiestosUrbanito/ProgramacionesManifiestosUrbanito";

import { ProtectedRoute } from '../../../router/ProtectedRoute';
export default function TransportePage(props) {

  return (
    <Switch>

      <Redirect
        exact={true}
        from="/transporte"
        to="/transporte/"
      />

      <ProtectedRoute
        path="/transporte/tipoRuta"
        component={TipoRutaIndexPage}
      />

      <ProtectedRoute
        path="/transporte/ruta"
        component={RutaIndexPage}
      />

      <ProtectedRoute
        path="/transporte/paradero"
        component={ParaderoIndexPage}
      />

      <ProtectedRoute
        path="/transporte/manifiestoReservacionCupoSemanal"
        component={ManifiestoCupoIndexPage}
      />

      <ProtectedRoute
        path="/transporte/tipoProgramacion"
        component={TipoProgramacionIndexPage}
      />

      <ProtectedRoute
        path="/transporte/programacion"
        component={ProgramacionIndexPage}
      />

      <ProtectedRoute
        path="/transporte/manifiesto"
        component={ManifiestoIndexPage}
      />

      <ProtectedRoute
        path="/transporte/vehiculo"
        component={VehiculoIndexPage}
      />

      <ProtectedRoute
        path="/transporte/persona"
        component={PersonaIndexPage}
      />

      <ProtectedRoute
        path="/transporte/reporte/r001_ManifiestoFinal"
        component={ManifiestoFinalIndexPage}
      />

      <ProtectedRoute
        path="/transporte/reporte/r002_ProgramacionesManifiestos"
        component={ProgramacionesManifiestos}
      />

      <ProtectedRoute
        path="/transporte/reporte/r003_OcupacionBuses"
        component={OcupacionBuses}
      />

      <ProtectedRoute
        path="/transporte/reporte/r004_PersonalNoAbordo"
        component={PersonalNoAbordo}
      />

      <ProtectedRoute
        path="/transporte/reporte/r005_PersonalEmbarque"
        component={PersonalEmbarque}
      />

    <ProtectedRoute
        path="/transporte/reporte/r006_ProgramacionesManifiestosUrbanito"
        component={ProgramacionesManifiestosUrbanito}
      />

    </Switch>
  );
}
