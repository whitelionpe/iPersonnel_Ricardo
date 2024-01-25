import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { ProtectedRoute } from '../../../router/ProtectedRoute';

import DashboardIndexPage from "./dashboard/DashboardIndexPage";
import DatosEvaluarIndexPage from "./datosEvaluar/DatosEvaluarIndexPage";
import RequisitoIndexPage from "./requisito/RequisitoIndexPage";
import PerfilIndexPage from "./perfil/PerfilIndexPage";
import AutorizadorIndexPage from "./autorizador/AutorizadorIndexPage";

import PersonaIndexPage from "./persona/PersonaIndexPage";
import VehiculoIndexPage from "./vehiculo/VehiculoIndexPage";
// import SolicitudPersonaIndexPage from "./solicitud/autorizador/persona/PersonaIndexPage";
//>Proceso de Movilización++++++++++++++++++++++++++++++++++++++
import MovilizacionPersonaIndexPage from "./solicitud/movilizacion/persona/SolicitudIndexPage";
import MovilizacionVehiculoIndexPage from "./solicitud/movilizacion/vehiculo/MovilizacionVehiculoIndexPage";
import MovilizacionVisitaIndexPage from "./solicitud/movilizacion/visita/VisitaIndexPage";
//>Proceso de Desmovilización++++++++++++++++++++++++++++++++++++++
import DesmovilizacionPersonaIndexPage from "./solicitud/desmovilizacion/persona/DesmovilizacionPersonaIndexPage";
//>Proceso de Actualización++++++++++++++++++++++++++++++++++++++
import ActualizacionPersonaIndexPage from "./solicitud/actualizacion/persona/ActualizacionPersonaIndexPage";

//>Reporte++++++++++++++++++++++++++++++++++++++
import r001_AnalisisIndexPage from "./reporte/r001_AnalisisAcreditacion/ReporteIndexPage";
import r002_ResultadoAutorizadoresIndexPage from "./reporte/r002_ResultadoAutorizaciones/ResultadoAutorizadoresIndexPage";
import DesmovilizacionVehiculoIndexPage from "./solicitud/desmovilizacion/vehiculo/DesmovilizacionVehiculoIndexPage";
import ActualizacionVehiculoIndexPage from "./solicitud/actualizacion/vehiculo/ActualizacionVehiculoIndexPage";

export default function AdministracionPage() {
  return (

    <Switch>

      <Redirect
        exact={true}
        from="/acreditacion"
        to="/acreditacion/"
      />

      <ProtectedRoute
        path="/acreditacion/dashboard"
        component={DashboardIndexPage}
      />

      <ProtectedRoute
        path="/acreditacion/datosEvaluar"
        component={DatosEvaluarIndexPage}
      />
      <ProtectedRoute
        path="/acreditacion/requisito"
        component={RequisitoIndexPage}
      />
      <ProtectedRoute
        path="/acreditacion/perfil"
        component={PerfilIndexPage}
      />

      <ProtectedRoute
        path="/acreditacion/autorizador"
        component={AutorizadorIndexPage}
      />

      <ProtectedRoute
        path="/acreditacion/persona"
        component={PersonaIndexPage}
      />

      <ProtectedRoute
        path="/acreditacion/vehiculo"
        component={VehiculoIndexPage}
      />

      <ProtectedRoute
        path="/acreditacion/solicitud/movilizacion/persona"
        component={MovilizacionPersonaIndexPage}
      />

      <ProtectedRoute
        path="/acreditacion/solicitud/movilizacion/vehiculo"
        component={MovilizacionVehiculoIndexPage}
      />

      <ProtectedRoute
        path="/acreditacion/solicitud/movilizacion/visita"
        component={MovilizacionVisitaIndexPage}
      />

      <ProtectedRoute
        path="/acreditacion/solicitud/desmovilizacion/persona"
        component={DesmovilizacionPersonaIndexPage}
      />

      <ProtectedRoute
        path="/acreditacion/solicitud/desmovilizacion/vehiculo"
        component={DesmovilizacionVehiculoIndexPage}
      />

      <ProtectedRoute
        path="/acreditacion/solicitud/actualizacion/persona"
        component={ActualizacionPersonaIndexPage}
      />

      <ProtectedRoute
        path="/acreditacion/solicitud/actualizacion/vehiculo"
        component={ActualizacionVehiculoIndexPage}
      />


      <ProtectedRoute
        path="/acreditacion/reporte/r001_ReportePorTiempo"
        component={r001_AnalisisIndexPage}
      />

      <ProtectedRoute
        path="/acreditacion/reporte/r002_ResultadoAutorizaciones"
        component={r002_ResultadoAutorizadoresIndexPage}
      />

    </Switch>


  );
}
