import React from "react";
import { Redirect, Switch } from "react-router-dom";

import PaisIndexPage from "./pais/PaisIndexPage";
import TipoDocumentoIndexPage from "./tipodocumento/TipoDocumentoIndexPage";
import ModuloJobIndexPage from "./modulojob/ModuloJobIndexPage";

import ClienteIndexPage from "./cliente/ClienteIndexPage";
import LicenciaIndexPage from "./licencia/LicenciaIndexPage";
import DivisionIndexPage from "./division/DivisionIndexPage";
import ModuloIndexPage from "./modulo/ModuloIndexPage";
import ModuloReglaIndexPage from "./moduloregla/ModuloReglaIndexPage";
import ParametroIndexPage from "./parametro/ParametroIndexPage";
import ParametroModuloIndexPage from "./parametromodulo/ParametroModuloIndexPage";
import TipoEquipoIndexPage from "./tipoequipo/TipoEquipoIndexPage";
import TipoLecturaIndexPage from "./tipolectura/TipoLecturaIndexPage";
import EquipoIndexPage from "./equipo/EquipoIndexPage";
import EstadoCivilIndexPage from "./estadoCivil/EstadoCivilIndexPage";
import TipoSangreIndexPage from "./tipoSangre/TipoSangreIndexPage";
import EntidadIndexPage from "./entidad/EntidadIndexPage";
import LicenciaConducirIndexPage from "./licenciaConducir/LicenciaConducirIndexPage";
import MenuIndexPage from "./menu/MenuIndexPage";
import ModuloAplicacionIndexPage from "./moduloAplicacion/ModuloAplicacionIndexPage";
import AplicacionIndexPage from "./aplicacion/AplicacionIndexPage";
import TipoMantenimientoIndexPage from "./tipoMantenimiento/TipoMantenimientoIndexPage";
import ObjetoIndexPage from "./objeto/ObjetoIndexPage";
import MonedaIndexPage from "./moneda/MonedaIndexPage";
import RepositorioIndexPage from "./repositorio/RepositorioIndexPage";
//import ProcesoIndexPage from "./proceso/ProcesoIndexPage";
import procesoProgramacionIndexPage from "./procesoProgramacion/ProcesoProgramacionIndexPage";
import ImportacionTablaIndexPage from "./importacionTabla/ImportacionTablaIndexPage";
import EquipoAsignadoIndexPage from './reporte/r001_EquipoAsignado/EquipoAsignadoIndexPage';

import { ProtectedRoute } from '../../../router/ProtectedRoute';
import PlantillaIndexPage from "./plantilla/PlantillaIndexPage";
export default function SistemaPage(props) {

  return (
    <Switch> 
      <Redirect
        exact={true}
        from="/sistema"
        to="/sistema/"
      />
      <ProtectedRoute
        path="/sistema/pais"
        component={PaisIndexPage}
      />
      <ProtectedRoute
        path="/sistema/tipodocumento"
        component={TipoDocumentoIndexPage}
      />
      <ProtectedRoute
        path="/sistema/modulojob"
        component={ModuloJobIndexPage}
      />
      <ProtectedRoute
        path="/sistema/cliente"
        component={ClienteIndexPage}
      />
      <ProtectedRoute
        path="/sistema/licencia"
        component={LicenciaIndexPage}
      />
      <ProtectedRoute
        path="/sistema/division"
        component={DivisionIndexPage}
      />
      <ProtectedRoute
        path="/sistema/modulo"
        component={ModuloIndexPage}
      />
      <ProtectedRoute
        path="/sistema/regla"
        component={ModuloReglaIndexPage}
      />
      <ProtectedRoute
        path="/sistema/parametro"
        component={ParametroIndexPage}
      />
      <ProtectedRoute
        path="/sistema/parametromodulo"
        component={ParametroModuloIndexPage}
      />
      <ProtectedRoute
        path="/sistema/tipoequipo"
        component={TipoEquipoIndexPage}
      />
      <ProtectedRoute
        path="/sistema/tipolectura"
        component={TipoLecturaIndexPage}
      />
      <ProtectedRoute
        path="/sistema/equipo"
        component={EquipoIndexPage}
      />
      <ProtectedRoute
        path="/sistema/estadocivil"
        component={EstadoCivilIndexPage}
      />
      <ProtectedRoute
        path="/sistema/tiposangre"
        component={TipoSangreIndexPage}
      />
      <ProtectedRoute
        path="/sistema/entidad"
        component={EntidadIndexPage}
      />
      <ProtectedRoute
        path="/sistema/licenciaConducir"
        component={LicenciaConducirIndexPage}
      />
      <ProtectedRoute
        path="/sistema/menu"
        component={MenuIndexPage}
      />

      <ProtectedRoute
        path="/sistema/moduloAplicacion"
        component={ModuloAplicacionIndexPage}
      />

      <ProtectedRoute
        path="/sistema/aplicacion"
        component={AplicacionIndexPage}
      />
      <ProtectedRoute
        path="/sistema/tipoMantenimiento"
        component={TipoMantenimientoIndexPage}
      />

      <ProtectedRoute
        path="/sistema/objeto"
        component={ObjetoIndexPage}
      />
      <ProtectedRoute
        path="/sistema/moneda"
        component={MonedaIndexPage}
      />

      <ProtectedRoute
        path="/sistema/repositorio"
        component={RepositorioIndexPage}
      />

      <ProtectedRoute
        path="/sistema/procesoProgramacion"
        component={procesoProgramacionIndexPage}
      />

      <ProtectedRoute
        path="/sistema/importacionTabla"
        component={ImportacionTablaIndexPage}
      />

      <ProtectedRoute
        path="/sistema/reporte/equipoDisponible"
        component={EquipoAsignadoIndexPage}
      />

      <ProtectedRoute
        path="/sistema/plantillasCorreo"
        component={PlantillaIndexPage}
      />

    </Switch>
  );
}
