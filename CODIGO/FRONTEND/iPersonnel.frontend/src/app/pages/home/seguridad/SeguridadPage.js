import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import UsuarioIndexPage from "./usuario/UsuarioIndexPage";
import PerfilIndexPage from "./perfil/PerfilIndexPage";
import CaracteristicaIndexPage from "./caracteristica/CaracteristicaIndexPage";
import ConfiguracionLogeoIndexPage from "./configuracionLogeo/ConfiguracionLogeoIndexPage";
import UsuarioLoginIndexPage from "./usuarioLogin/UsuarioLoginIndexPage";
import { ProtectedRoute } from '../../../router/ProtectedRoute';

export default function SeguridadPage() {
  return (
    <Switch>
      <Redirect
        exact={true}
        from="/seguridad"
        to="/seguridad"
      />

      <ProtectedRoute
        path="/seguridad/usuario"
        component={UsuarioIndexPage}

      />
      <ProtectedRoute
        path="/seguridad/perfil"
        component={PerfilIndexPage}
      />
      <ProtectedRoute
        path="/seguridad/caracteristica"
        component={CaracteristicaIndexPage}
      />
      <ProtectedRoute
        path="/seguridad/configuracionLogeo"
        component={ConfiguracionLogeoIndexPage}
      />
      <Route
        path="/seguridad/usuarioLogin"
        component={UsuarioLoginIndexPage}
      />


    </Switch>
  );
}
