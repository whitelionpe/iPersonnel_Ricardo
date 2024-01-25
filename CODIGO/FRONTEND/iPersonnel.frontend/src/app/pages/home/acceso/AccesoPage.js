import React from "react";
import { Redirect, Switch } from "react-router-dom";

import ExoneracionIndexPage from "./exoneracion/ExoneracionIndexPage";
import RequisitoIndexPage from "./requisito/RequisitoIndexPage";
import PerfilIndexPage from "./perfil/PerfilIndexPage";
import RestriccionIndexPage from "./restriccion/RestriccionIndexPage";
import GrupoIndexPage from "./grupo/GrupoIndexPage";
import { ProtectedRoute } from '../../../router/ProtectedRoute';

import PersonaAccesoIndexPage from "./persona/PersonaAccesoIndexPage";
import VehiculoIndexPage from "./vehiculo/VehiculoIndexPage";
import HorarioIndexPage from "./horario/HorarioIndexPage";
import TipoPuertaIndexPage from "./tipoPuerta/TipoPuertaIndexPage";
import CompaniaGrupoIndexPage from "./companiaGrupo/CompaniaGrupoIndexPage";

import MarcacionesPersonaIndexPage from "./reporte/rs001_MarcacionesPersona/MarcacionesPersonaIndexPage";
import ConsultaPorIntervaloIndexPage from './reporte/r001_ConsultaPorIntervalo/ReporteIndexPage';
import ReporteRequisitoIndexPage from './reporte/r002_ReporteRequisito/ReporteRequisitoIndexPage';
import ReporteTrabajadoresIndex from './reporte/r004_TrabajadoresEstadoActual/ReporteTrabajadoresIndex';
import ReporteVisitasIndex from "./reporte/r005_VisitasEstadoActual/ReporteVisitasIndex";
import ReporteVehiculosIndex from './reporte/r006_VehiculosEstadoActual/ReporteVehiculosIndex';
import PermanenciaTrabajadorIndexPage from './reporte/r003_PermanenciaTrabajador/PermanenciaTrabajadorIndexPage';
import PermanenciaVehiculoIndexPage from './reporte/r007_PermanenciaVehiculo/PermanenciaVehiculoIndexPage';
import PersonaControlAccesoIndexPage from './reporte/r009_PersonControlAcceso/PersonaControlAccesoIndexPage';
import Dashboard from './reporte/dashboard/AccesoPersonaPage'
export default function AccesoPage() {
  return (
    <Switch>

      <Redirect exact={true} from="/acceso" to="/acceso/" />

      <ProtectedRoute path="/acceso/exoneracion" component={ExoneracionIndexPage} />
      <ProtectedRoute path="/acceso/dashboard" component={Dashboard} />

      <ProtectedRoute path="/acceso/perfil" component={PerfilIndexPage} />

      <ProtectedRoute exact path="/acceso/requisito" component={RequisitoIndexPage} />

      <ProtectedRoute path="/acceso/restriccion" component={RestriccionIndexPage} />

      <ProtectedRoute path="/acceso/grupo" component={GrupoIndexPage} />

      <ProtectedRoute path="/acceso/persona" component={PersonaAccesoIndexPage} />

      <ProtectedRoute path="/acceso/vehiculo" component={VehiculoIndexPage} />

      <ProtectedRoute path="/acceso/horario" component={HorarioIndexPage} />

      <ProtectedRoute path="/acceso/tipopuerta" component={TipoPuertaIndexPage} />

      <ProtectedRoute path="/acceso/companiaGrupo" component={CompaniaGrupoIndexPage} />

      <ProtectedRoute path="/acceso/rs001_marcacionesPersona" component={MarcacionesPersonaIndexPage} />

      <ProtectedRoute path="/acceso/r001_consultaPorIntervalo" component={ConsultaPorIntervaloIndexPage} />

      <ProtectedRoute path="/acceso/r002_reporteRequisito" component={ReporteRequisitoIndexPage} />

      <ProtectedRoute path="/acceso/r003_PermanenciaTrabajador" component={PermanenciaTrabajadorIndexPage} />

      <ProtectedRoute path="/acceso/r004_TrabajadoresEstadoActual" component={ReporteTrabajadoresIndex} />

      <ProtectedRoute path="/acceso/r005_VisitasEstadoActual" component={ReporteVisitasIndex} />

      <ProtectedRoute path="/acceso/r006_VehiculosEstadoActual" component={ReporteVehiculosIndex} />

      <ProtectedRoute path="/acceso/r007_PermanenciaVehiculo" component={PermanenciaVehiculoIndexPage} />

      <ProtectedRoute path="/acceso/r009_PersonaControlAcceso" component={PersonaControlAccesoIndexPage} /> 
    </Switch>
  );
}
