import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { ProtectedRoute } from '../../../router/ProtectedRoute';

import CategoriaIndexPage from "./categoria/CategoriaIndexPage";
import UbigeoIndexPage from "./ubigeo/UbigeoIndexPage";
import CompaniaIndexPage from "./compania/CompaniaIndexPage";
import PersonaIndexPage from "./persona/PersonaIndexPage";
import CentroCostoIndexPage from "./centroCosto/CentroCostoIndexPage";
import CaracteristicaIndexPage from "./caracteristica/CaracteristicaIndexPage";
import FuncionIndexPage from "./funcion/FuncionIndexPage";
import ColorIndexPage from "./color/ColorIndexPage";
import CombustibleIndexPage from "./combustible/CombustibleIndexPage";
import MarcaIndexPage from "./marca/MarcaIndexPage";
import TipoVehiculoIndexPage from "./tipoVehiculo/TipoVehiculoIndexPage";
import TipoPosicionIndexPage from "./tipoPosicion/TipoPosicionIndexPage";
import UnidadOrganizativaIndexPage from "./unidadOrganizativa/UnidadOrganizativaIndexPage";
import ZonaIndexPage from "./zona/ZonaIndexPage";
import PosicionIndexPage from "./posicion/PosicionIndexPage";
import MotivoCeseIndexPage from "./motivoCese/MotivoCeseIndexPage";
import VehiculoIndexPage from "./vehiculo/VehiculoIndexPage";
import IndisciplinaIndexPage from "./indisciplina/IndisciplinaIndexPage";
import TipoContratoIndexPage from "./tipoContrato/TipoContratoIndexPage";
import ContratoIndexPage from "./contrato/ContratoIndexPage";
import RegimenIndexPage from './regimen/RegimenIndexPage';
import FeriadoIndexPage from './feriado/FeriadoIndexPage'; 
import Posicionv2IndexPage from "./posicionv2/Posicionv2IndexPage";
import Posicionv3IndexPage from "./posicionv3/Posicionv3IndexPage";
import ImportarDatosIndexPage from "./importarDatos/personas/ImportarDatosIndexPage";
import ImportarDatosVehiculoIndexPage from "./importarDatos/vehiculos/ImportarDatosVehiculoIndexPage";
import ContratistaPosicionIndexPage from "./contratista_posicion/ContratistaPosicionIndexPage";

import ReporteMovimientoIndexPage from "./reporte/r001_movimientoPersonal/ReporteMovimientoIndexPage";
import TrabajadoresContratosActivosIndexPage from "./reporte/r002_trabajadoresContratosActivos/TrabajadoresContratosActivosIndexPage";
import TrabajadoresPorSedeIndexPage from "./reporte/r003_trabajadoresPorSede/TrabajadoresPorSedeIndexPage";
import VehiculosPorSedeIndexPage from "./reporte/r004_vehiculosPorSede/VehiculosPorSedeIndexPage";


export default function AdministracionPage() {
  return (

    <Switch>

      <Redirect
        exact={true}
        from="/administracion"
        to="/administracion/"
      />
      <ProtectedRoute
        path="/administracion/categoria"
        component={CategoriaIndexPage}
      />
      <ProtectedRoute
        path="/administracion/ubigeo"
        component={UbigeoIndexPage}
      />
      <ProtectedRoute
        path="/administracion/compania"
        component={CompaniaIndexPage}
      />
      <ProtectedRoute
        path="/administracion/persona"
        component={PersonaIndexPage}
      />
      <ProtectedRoute
        path="/administracion/centrocosto"
        component={CentroCostoIndexPage}
      />
      <ProtectedRoute
        path="/administracion/caracteristica"
        component={CaracteristicaIndexPage}
      />
      <ProtectedRoute
        path="/administracion/funcion"
        component={FuncionIndexPage}
      />
      <ProtectedRoute
        path="/administracion/color"
        component={ColorIndexPage}
      />
      <ProtectedRoute
        path="/administracion/combustible"
        component={CombustibleIndexPage}
      />
      <ProtectedRoute
        path="/administracion/marca"
        component={MarcaIndexPage}
      />
      <ProtectedRoute
        path="/administracion/tipovehiculo"
        component={TipoVehiculoIndexPage}
      />
      <ProtectedRoute
        path="/administracion/tipoPosicion"
        component={TipoPosicionIndexPage}
      />
      <ProtectedRoute
        path="/administracion/unidadOrganizativa"
        component={UnidadOrganizativaIndexPage}
      />
      <ProtectedRoute
        path="/administracion/zona"
        component={ZonaIndexPage}
      />
      <ProtectedRoute
        path="/administracion/posicion"
        component={PosicionIndexPage}
      />
      <ProtectedRoute
        path="/administracion/motivoCese"
        component={MotivoCeseIndexPage}
      />
      <ProtectedRoute
        path="/administracion/vehiculo"
        component={VehiculoIndexPage}
      />
      <ProtectedRoute
        path="/administracion/indisciplina"
        component={IndisciplinaIndexPage}
      />

      <ProtectedRoute
        path="/administracion/tipoContrato"
        component={TipoContratoIndexPage}
      />

      <ProtectedRoute
        path="/administracion/contrato"
        component={ContratoIndexPage}
      />

      <ProtectedRoute
        path="/administracion/regimen"
        component={RegimenIndexPage}
      />

      <ProtectedRoute
        path="/administracion/feriado"
        component={FeriadoIndexPage}
      />

      <ProtectedRoute
        path="/administracion/posicionv2"
        component={Posicionv2IndexPage}
      />

      <ProtectedRoute
        path="/administracion/posicionv3"
        component={Posicionv3IndexPage}
      />

      <ProtectedRoute
        path="/administracion/importarDatos/personas"
        component={ImportarDatosIndexPage}
      />

      <ProtectedRoute
        path="/administracion/importarDatos/vehiculos"
        component={ImportarDatosVehiculoIndexPage}
      />

      <ProtectedRoute
        path="/administracion/contratista_funciones"
        component={FuncionIndexPage}
      />

      <ProtectedRoute
        path="/administracion/contratista_posiciones"
        component={ContratistaPosicionIndexPage}
      />

      <ProtectedRoute
        path="/administracion/reporte/r001_movimientoPersonal"
        component={ReporteMovimientoIndexPage}
      />

      <ProtectedRoute
        path="/administracion/reporte/r002_trabajadoresContratosActivos"
        component={TrabajadoresContratosActivosIndexPage}
      />

      <ProtectedRoute
        path="/administracion/reporte/r003_trabajadoresPorSede"
        component={TrabajadoresPorSedeIndexPage}
      />

      <ProtectedRoute
        path="/administracion/reporte/r004_vehiculosPorSede"
        component={VehiculosPorSedeIndexPage}
      />



    </Switch>

  );
}
