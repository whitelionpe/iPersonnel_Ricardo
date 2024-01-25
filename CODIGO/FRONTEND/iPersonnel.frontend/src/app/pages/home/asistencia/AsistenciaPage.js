import React from "react";
import { Redirect, Switch } from "react-router-dom";

import PlanillaIndexPage from "./planilla/PlanillaIndexPage";
import ConfiguracionHhEeIndexPage from "./configuracionHHEE/ConfiguracionHhEeIndexPage";
import ConceptoHoraExtraIndexPage from "./conceptoHoraExtra/ConceptoHoraExtraIndexPage";
import JustificacionIndexPage from "./justificacion/JustificacionIndexPage";
import HorarioIndexPage from "./horario/HorarioIndexPage";
import CompaniaIndexPage from "./compania/CompaniaIndexPage";
import PersonaAsistenciaIndexPage from "./persona/PersonaAsistenciaIndexPage";
import CondicionEspecialIndexPage from "./condicionEspecial/CondicionEspecialIndexPage";
import ZonaIndexPage from "./zonaEquipo/ZonaIndexPage";
import JustificacionMasivaIndexPage from "./justificacionMasiva/JustificacionMasivaIndexPage";
import MarcacionMasivaIndexPage from "./marcacionMasiva/MarcacionMasivaIndexPage";
import IncidenciaIndexPage from "./incidencia/IncidenciaIndexPage";
import HorarioMasivoIndexPage from "./horarioMasivo/HorarioMasivoIndexPage";
import HoraExtraIndexPage from "./horaExtra/HoraExtraIndexPage";
import ReporteIncidenciaIndex from "./reporteIncidencias/ReporteIncidenciaIndex";
import BonoNocturnoIndexPage from "./bonoNocturno/BonoNocturnoIndexPage";
import CuponeraIndexPage from "./cuponera/CuponeraIndexPage";
import GrupoIndexPage from "./grupo/GrupoIndexPage";
import TipoAutorizacionIndexPage from "./tipoAutorizacion/TipoAutorizacionIndexPage";

import PersonalSinHorarioIndexPage from "./reporte/r001_personalsinhorario/PersonalSinHorarioIndexPage";
import PersonalConHorarioIndexPage from "./reporte/r002_personalconhorario/PersonalConHorarioIndexPage";
import PersonalMarcasIndexPage from "./reporte/r003_personalmarcas/PersonalMarcasIndexPage";
import PersonalTiempoAdicionalAloneIndexPage from "./reporte/r004_personaltiempoadicional/PersonalTiempoAdicionalAloneIndexPage";
import PersonalAsistenciaIndexPage from "./reporte/r005_asistenciapersonal/PersonalAsistenciaIndexPage";
import ResultadoCalculoAsistenciaIndexPage from "./reporte/r006_calculoasistencia/ResultadoCalculoAsistenciaIndexPage";
import CalculoBonoNocturnoIndexPage from "./reporte/r007_bononocturno/CalculoBonoNocturnoIndexPage";
import HorasExtrasAprobadasIndexPage from "./reporte/r008_horasExtrasAprobadas/HorasExtrasAprobadasIndexPage";
import BolsaHorasIndexPage from "./reporte/r009_bolsaHoras/BolsaHorasIndexPage";
import EmpleadosIndexPage from "./reporte/r011_Empleados/EmpleadosIndexPage";

import ProcesarAsistenciaIndexPage from "./procesarAsistencia/ProcesarAsistenciaIndexPage";
import { ProtectedRoute } from '../../../router/ProtectedRoute';
import AprobadorHHEEIndexPage from "./aprobadorHHEE/AprobadorHHEEIndexPage";
import IncidenciaAsistenciaAloneIndexPage from "./reporte/r010_incidencia/IncidenciaAsistenciaAloneIndexPage";
import JustificacionAsistenciaIndexPage from "./reporte/r012_justificacion/JustificacionAsistenciaIndexPage";
import SolicitudIndexPage from "./solicitud/SolicitudIndexPage";
import SolicitudAprobacionIndexPage from "./solicitudaprobacion/SolicitudAprobacionIndexPage";
import ConfiguracionHorarioIndexPage from "./reporte/r013_configuracionhorario/ConfiguracionHorarioIndexPage";
import IntegracionInfotipoIndexPage from "./integracionInfotipo/IntegracionInfotipoIndexPage";
import BloqueoPlanillaIndexPage from "./bloqueoPlanilla/BloqueoPlanillaIndexPage";
import GruposMarcacionIndexPage from "./reporte/r015_GruposMarcacion/GruposMarcacionIndexPage";
import HorasExtrasRitinsaIndexPage from "./reporte/r016_horasExtrasRitinsa/HorasExtrasRitinsaIndexPage"; 
import ReporteSunafilIndexPage from "./reporte/r017_reporteSunafil/ReporteSunafilIndexPage"; 


export default function AsistenciaPage(props) {

  return (
    <Switch>
      <Redirect
        exact={true}
        from="/asistencia"
        to="/asistencia/"
      />
      <ProtectedRoute
        path="/asistencia/conceptoIntegracion"
        component={IntegracionInfotipoIndexPage}
      />
      <ProtectedRoute
        path="/asistencia/conceptoHoraExtra"
        component={ConceptoHoraExtraIndexPage}
      />
      <ProtectedRoute
        path="/asistencia/configuracionrHoraExtra"
        component={ConfiguracionHhEeIndexPage}
      />
      <ProtectedRoute
        path="/asistencia/aprobadorHHEE"
        component={AprobadorHHEEIndexPage}
      />
      <ProtectedRoute
        path="/asistencia/planilla"
        component={PlanillaIndexPage}
      />
      <ProtectedRoute
        path="/asistencia/justificacion"
        component={JustificacionIndexPage}
      />
      <ProtectedRoute
        path="/asistencia/compania"
        component={CompaniaIndexPage}
      />
      <ProtectedRoute
        path="/asistencia/persona"
        component={PersonaAsistenciaIndexPage}
      />
      <ProtectedRoute
        path="/asistencia/condicionEspecial"
        component={CondicionEspecialIndexPage}
      />
      <ProtectedRoute
        path="/asistencia/horarios"
        component={HorarioIndexPage}
      />
      <ProtectedRoute
        path="/asistencia/bonoNocturno"
        component={BonoNocturnoIndexPage}
      />
      <ProtectedRoute
        path="/asistencia/cuponera"
        component={CuponeraIndexPage}
      />
      <ProtectedRoute
        path="/asistencia/grupo"
        component={GrupoIndexPage}
      />
      <ProtectedRoute
        path="/asistencia/tipoAutorizacion"
        component={TipoAutorizacionIndexPage}
      />
      <ProtectedRoute
        path="/asistencia/zonaEquipo"
        component={ZonaIndexPage}
      />
      <ProtectedRoute
        path="/asistencia/justificacionMasiva"
        component={JustificacionMasivaIndexPage}
      />
      <ProtectedRoute
        path="/asistencia/incidencia"
        component={IncidenciaIndexPage}
      />
      <ProtectedRoute
        path="/asistencia/horarioMasivo"
        component={HorarioMasivoIndexPage}
      />
      <ProtectedRoute
        path="/asistencia/horasExtra"
        component={HoraExtraIndexPage}
      />
      <ProtectedRoute
        path="/asistencia/reporteIncidencias"
        component={ReporteIncidenciaIndex}
      />
      <ProtectedRoute
        path="/asistencia/reporte/r001_personalsinhorario"
        component={PersonalSinHorarioIndexPage}
      />
      <ProtectedRoute
        path="/asistencia/reporte/r002_personalconhorario"
        component={PersonalConHorarioIndexPage}
      />
      <ProtectedRoute
        path="/asistencia/reporte/r003_personalmarcas"
        component={PersonalMarcasIndexPage}
      />
      <ProtectedRoute
        path="/asistencia/reporte/r004_personaltiempoadicional"
        component={PersonalTiempoAdicionalAloneIndexPage}
      />
      <ProtectedRoute
        path="/asistencia/reporte/r005_asistenciapersonal"
        component={PersonalAsistenciaIndexPage}
      />
      <ProtectedRoute
        path="/asistencia/reporte/r006_calculoasistencia"
        component={ResultadoCalculoAsistenciaIndexPage}
      />
      <ProtectedRoute
        path="/asistencia/reporte/r007_bononocturno"
        component={CalculoBonoNocturnoIndexPage}
      />
      <ProtectedRoute
        path="/asistencia/reporte/r008_horasExtrasAprobadas"
        component={HorasExtrasAprobadasIndexPage}
      />
      <ProtectedRoute
        path="/asistencia/reporte/r009_BolsaHoras"
        component={BolsaHorasIndexPage}
      />

      <ProtectedRoute
        path="/asistencia/reporte/r010_incidencias"
        component={IncidenciaAsistenciaAloneIndexPage}
      />

      <ProtectedRoute
        path="/asistencia/reporte/r011_Empleados"
        component={EmpleadosIndexPage}
      />

      <ProtectedRoute
        path="asistencia/reporte/r012_Justificaciones" //ANTES : "/asistencia/reporte/r014_ConfiguracionJustificacion" 
        component={JustificacionAsistenciaIndexPage}
      />

      <ProtectedRoute
        path="/asistencia/reporte/r013_ConfiguracionHorario"
        component={ConfiguracionHorarioIndexPage}
      />

      <ProtectedRoute
        path="/asistencia/reporte/r015_GruposMarcacion"
        component={GruposMarcacionIndexPage}
      />

      <ProtectedRoute
        path="/asistencia/reporte/r016_horasExtrasRitinsa"
        component={HorasExtrasRitinsaIndexPage}
      />

      <ProtectedRoute
        path="/asistencia/reporte/r017_reporteSunafil"
        component={ReporteSunafilIndexPage} 
      />

      <ProtectedRoute
        path="/asistencia/procesarAsistencia"
        component={ProcesarAsistenciaIndexPage}
      />

      <ProtectedRoute
        path="/asistencia/solicitud"
        component={SolicitudIndexPage}
      />

      <ProtectedRoute
        path="/asistencia/solicitudaprobacion"
        component={SolicitudAprobacionIndexPage}
      />


      <ProtectedRoute
        path="/asistencia/bloqueoPlanilla"
        component={BloqueoPlanillaIndexPage}
      />

      
      <ProtectedRoute
        path="/asistencia/marcacionMasiva"
        component={MarcacionMasivaIndexPage}
      />

    </Switch>
  );
}
