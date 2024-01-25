import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import TipoModuloIndexPage from "./tipoModulo/TipoModuloIndexPage";
import TipoHabitacionIndexPage from "./tipoHabitacion/TipoHabitacionIndexPage";
import CampamentoIndexPage from "./campamento/CampamentoIndexPage";
import TipoCamaIndexPage from "./tipoCama/TipoCamaIndexPage";
import PerfilIndexPage from "./perfil/PerfilIndexPage";
import PersonaIndexPage from "./persona/PersonaIndexPage";
import CompaniaPerfilIndexPage from "./companiaPerfil/CompaniaPerfilIndexPage";
import ServicioIndexPage from "./servicio/ServicioIndexPage";
import CamaIndexPage from "./cama/CamaIndexPage";
import { ProtectedRoute } from '../../../router/ProtectedRoute';
import MasivoPersonaIndex from "./reserva/MasivoPersonaIndex";
import DashboardIndexPage from "./dashboard/DashboardIndexPage";
import PruebaIndexPage from "./prueba/pruebaIndexPage";
import HabitacionExclusivaIndexPage from "./habitacionExclusiva/HabitacionExclusivaIndexPage";
import ReporteIndexPage from "./reporte/r001_Reportes_Y_Consultas/ReporteIndexPage";
import ConsultaDisponibilidadIndexPage from "./reporte/r002_ConsultaDisponibilidad/ConsultaDisponibilidadIndexPage";
import ReporteReservasLiberadasIndexPage from "./reporte/r003_ReporteReservasLiberadas/ReporteReservasLiberadasIndexPage";
import ReporteSolicitudesHabitacionIndexPage from "./reporte/r004_ReportesSolicitudesHabitacion/ReporteSolicitudesHabitacionIndexPage";
import ReporteOcupabilidadCompaniaIndex from "./reporte/r005_ReporteOcupabilidadCompania/ReporteOcupabilidadCompaniaIndex";
import ReporteValorizacionIndex from "./reporte/r006_ReporteValorizacion/ReporteValorizacionIndex";
import ReporteCamaPorDiaIndexPage from "./reporte/r007_ReporteCamaPorDia/ReporteCamaPorDiaIndexPage";

export default function CampamentoPage() {
  return (
    <Switch>

      <Redirect
        exact={true}
        from="/campamento"
        to="/campamento/"
      />
      <ProtectedRoute
        path="/campamento/tipoModulo"
        component={TipoModuloIndexPage}
      />

      <ProtectedRoute
        path="/campamento/tipoHabitacion"
        component={TipoHabitacionIndexPage}
      />
      <ProtectedRoute
        path="/campamento/campamento"
        component={CampamentoIndexPage}
      />
      <ProtectedRoute
        path="/campamento/tipoCama"
        component={TipoCamaIndexPage}
      />
      <ProtectedRoute
        path="/campamento/perfil"
        component={PerfilIndexPage}
      />

      <ProtectedRoute
        path="/campamento/persona"
        component={PersonaIndexPage}
      />

      <ProtectedRoute
        path="/campamento/companiaPerfil"
        component={CompaniaPerfilIndexPage}
      />

      <ProtectedRoute
        path="/campamento/servicio"
        component={ServicioIndexPage}
      />

      <ProtectedRoute
        path="/campamento/cama"
        component={CamaIndexPage}
      />


      <ProtectedRoute
        path="/campamento/masivopersona"
        component={MasivoPersonaIndex}
      />

      <ProtectedRoute
        path="/campamento/habitacionExclusiva"
        component={HabitacionExclusivaIndexPage}
      />

      <Route
        path="/campamento/prueba"
        component={PruebaIndexPage}
      />

      <ProtectedRoute
        path="/campamento/reporte/r001_Reportes_Y_Consultas"
        component={ReporteIndexPage}
      />

      <ProtectedRoute
        path="/campamento/reporte/r002_ConsultaDisponibilidad"
        component={ConsultaDisponibilidadIndexPage}
      />

      <ProtectedRoute
        path="/campamento/reporte/r003_ReporteReservasLiberadas"
        component={ReporteReservasLiberadasIndexPage}
      />

      <ProtectedRoute
        path="/campamento/reporte/r004_ReporteSolicitudesHabitaciones"
        component={ReporteSolicitudesHabitacionIndexPage}
      />

      <ProtectedRoute
        path="/campamento/reporte/r005_ReporteOcupabilidadCompania"
        component={ReporteOcupabilidadCompaniaIndex}
      />

      <ProtectedRoute
        path="/campamento/reporte/r006_ReporteValorizacion"
        component={ReporteValorizacionIndex}
      />

      <ProtectedRoute
        path="/campamento/reporte/r007_ReporteCamaPorDia"
        component={ReporteCamaPorDiaIndexPage}
      />

      <ProtectedRoute
        path="/campamento/dashboard"
        component={DashboardIndexPage}
      />


    </Switch>
  );
}
