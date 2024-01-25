import React, { useEffect, useState } from "react";
import { Portlet } from "../../../../partials/content/Portlet";
//import { Button } from "devextreme-react";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useSelector } from "react-redux";

import {
  eliminar,
  obtener,
  listar,
  crear,
  actualizar
} from "../../../../api/administracion/caracteristica.api";
import CaracteristicaListPage from "./CaracteristicaListPage";
import CaracteristicaEditPage from "./CaracteristicaEditPage";
import { injectIntl } from "react-intl"; //Multi-idioma

const CaracteristicaIndexPage = (props) => {

  const usuario = useSelector(state => state.auth.user);
  const { intl } = props;
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));

  async function agregarCaracteristica(caracteristica) {

    const { IdCaracteristica, Caracteristica, Alias, IdCliente, IdEntidad, Activo } = caracteristica;
    let params = {
      IdCaracteristica: IdCaracteristica.toUpperCase()
      , Caracteristica: Caracteristica.toUpperCase()
      , Alias: Alias.toUpperCase()
      , IdCliente: IdCliente
      , IdEntidad: IdEntidad
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await crear(params).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }) );
      setModoEdicion(false);
      listarCaracteristica();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
    });

  }

  async function actualizarCaracteristica(caracteristica) {

    const { IdCaracteristica, Caracteristica, Alias, IdCliente, IdEntidad, Activo } = caracteristica;
    let params = {
      IdCaracteristica: IdCaracteristica.toUpperCase()
      , Caracteristica: Caracteristica.toUpperCase()
      , Alias: Alias.toUpperCase()
      , IdCliente: IdCliente
      , IdEntidad: IdEntidad
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await actualizar(params).then(response => {
      handleSuccessMessages();
      setModoEdicion(false);
      listarCaracteristica();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
    });

  }

  async function eliminarRegistro(caracteristica) {
    const { IdCaracteristica, IdCliente, IdDivision } = caracteristica;
    await eliminar({ IdCaracteristica: IdCaracteristica, IdCliente: IdCliente, IdDivision: IdDivision, IdUsuario: usuario.username }).then(response => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
    });
    listarCaracteristica();
  }

  async function listarCaracteristica() {

    let caracteristicas = await listar({ IdCliente: '%', IdEntidad: '%', NumPagina: 0, TamPagina: 0 });
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setCaracteristicas(caracteristicas);
  }

  async function obtenerCaracteristica(filtro) {
    const { IdCaracteristica, IdCliente } = filtro;
    if (IdCaracteristica && IdCliente) {
      let caracteristica = await obtener({ IdCaracteristica: IdCaracteristica, IdCliente: IdCliente });
      setDataRowEditNew({ ...caracteristica, esNuevoRegistro: false });
    }
  }

  const nuevoRegistro = () => {
    let caracteristica = { Activo: "S" };
    setDataRowEditNew({ ...caracteristica, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);

  };

  const editarRegistro = dataRow => {
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerCaracteristica(dataRow);
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  useEffect(() => {
    listarCaracteristica();

  }, []);

  return (
    <>
      <div className="row">
        <div className="col-md-12">
          <Portlet className={classesEncabezado.border}>
            <AppBar position="static" className={classesEncabezado.principal}>
              <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                  {intl.formatMessage({ id: "ADMINISTRATION.CHARACTERISTIC.DETAIL.MAINTENANCE" })}
                </Typography>
              </Toolbar>
            </AppBar>
            {modoEdicion && (
              <CaracteristicaEditPage
                modoEdicion={modoEdicion}
                setModoEdicion={setModoEdicion}
                dataRowEditNew={dataRowEditNew}
                actualizarCaracteristica={actualizarCaracteristica}
                agregarCaracteristica={agregarCaracteristica}
                cancelarEdicion={cancelarEdicion}
                setTitulo={titulo}
              />
            )}
            {!modoEdicion && (
              <CaracteristicaListPage
                caracteristicas={caracteristicas}
                editarRegistro={editarRegistro}
                eliminarRegistro={eliminarRegistro}
              />
            )}
          </Portlet>
        </div>
      </div>
    </>
  );
};

export default injectIntl(CaracteristicaIndexPage);
