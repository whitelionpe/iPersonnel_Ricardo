import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import CasinoTipoIndexPage from "./casinoTipo/CasinoTipoIndexPage"
import ComedorIndexPage from "./comedor/ComedorIndexPage"
import CasinoGrupoIndexPage from "./casinoGrupo/CasinoGrupoIndexPage"
import PersonaIndexPage from "./personaGrupo/PersonaIndexPage";
import ReporteIndexPage from "./reporte/ReporteIndexPage";
import CategoriaCostoIndexPage from "./categoriaCosto/CategoriaCostoIndexPage";
import CompaniaGrupoIndex from "./companiaGrupo/CompaniaGrupoIndex";

import { ProtectedRoute } from '../../../router/ProtectedRoute';
import ConsolidadoConsumoIndexPage from './reporte/r002_ConsolidadoConsumo/ConsolidadoConsumoIndexPage';
import AuditoriaComedorIndexPage from './reporte/r003_AuditoriaComedor/AuditoriaComedorIndexPage';
import ConsumoComedoresIndexPage from './reporte/r001_ConsumoComedores/ConsumoComedoresIndexPage';
import CargaConsumoServiciosIndexPage from "./cargaConsumoServicios/CargaConsumoServiciosIndexPage";
import DetalleDiarioConcumoIndexPage from './reporte/r004_detallediarioconsumo/DetalleDiarioConcumoIndexPage';
import DetalleConsumoIndexPage from './reporte/r004_DetalleConsumo/DetalleConsumoIndexPage';
import ConsumoUnidadOrganizativaIndePage from './reporte/r0005_ConsumoUnidadOrganizativa/ConsumoUnidadOrganizativaIndePage';

export default function CasinoPage() {
  return (
    <Switch>

      <Redirect
        exact={true}
        from="/casino"
        to="/casino/"
      />
      <ProtectedRoute
        path="/casino/casinoTipo"
        component={CasinoTipoIndexPage}
      />
      <ProtectedRoute
        path="/casino/comedor"
        component={ComedorIndexPage}
      />
      <ProtectedRoute
        path="/casino/casinoGrupo"
        component={CasinoGrupoIndexPage}
      />
      <ProtectedRoute
        path="/casino/personaGrupo"
        component={PersonaIndexPage}
      />

      <ProtectedRoute
        path="/casino/reporte"
        component={ReporteIndexPage}
      />

      <ProtectedRoute
        path="/casino/categoriaCosto"
        component={CategoriaCostoIndexPage}
      />

      <ProtectedRoute
        path="/casino/rp_02_consolidadoConsumo"
        component={ConsolidadoConsumoIndexPage}
      />

      <ProtectedRoute
        path="/casino/rp_01_consumoComedores"
        component={ConsumoComedoresIndexPage}
      />
      <ProtectedRoute
        path="/casino/rp_03_detalleconsumo"
        component={DetalleConsumoIndexPage}
      />
      <Route
        path="/casino/rp_auditoria"
        component={AuditoriaComedorIndexPage}
      />

      <ProtectedRoute
        path="/casino/companiaGrupo"
        component={CompaniaGrupoIndex}
      />

      <ProtectedRoute
        path="/casino/cargaConsumoServicios"
        component={CargaConsumoServiciosIndexPage}
      />

      <ProtectedRoute
        path="/casino/rp_04_detallediarioconsumo"
        component={DetalleDiarioConcumoIndexPage}
      />

      <ProtectedRoute
        path="/casino/rp_05_consolidadconsumoundorg"
        component={ConsumoUnidadOrganizativaIndePage}
      />
      
    </Switch>
  );
}
