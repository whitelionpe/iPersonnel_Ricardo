import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages } from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { useSelector } from "react-redux";
import { useStylesTab } from "../../../../../store/config/Styles";

import { listar } from "../../../../../api/acreditacion/solicitudVehiculo.api";
import SolicitudListPage from "./SolicitudListPage";

//import VehiculoIndexPage from '../autorizador/vehiculo/VehiculoIndexPage';
import { obtener as obtenerConfigM } from "../../../../../api/sistema/configuracionModulo.api";
import DetalleIndexPage from "../../solicitud/movilizacion/vehiculo/detalle/DetalleIndexPage";




const SolicitudIndexPage = (props) => {

  const usuario = useSelector(state => state.auth.user);
  const { IdDivision, IdCliente } = useSelector(state => state.perfil.perfilActual);
  const perfil = useSelector(state => state.perfil.perfilActual);

  const { intl, setLoading, settingDataField, getInfo, accessButton, varPlaca, dataMenu } = props;

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));

  const classes = useStylesTab();
  const [listarTabs, setListarTabs] = useState([]);
  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.EDIT" }));
  const [instance, setInstance] = useState({});
  const [focusedRowKey, setFocusedRowKey] = useState(0);
  const [selected, setSelected] = useState({});
  const [colorRojo, setColorRojo] = useState();
  const [colorVerde, setColorVerde] = useState();
  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-Persona-:::::::::::::::::::::::::::::::::


  async function listarSolicitud() {
    setLoading(true);
    await listar(
      {
        IdCliente
        , IdDivision
        , IdPlaca: varPlaca
        , NumPagina: 0
        , TamPagina: 0
      }
    ).then(data => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(data)
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const seleccionarSolicitud = async (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
    setSelected(dataRow);
  }

  const abrirSolicitudDetalle = (data) => {
    let dataRow = data.row.data
    //console.log("abrirSolicitudDetalle data", { dataRow });

    setSelected(dataRow);
    setModoEdicion(true);
  };


  const cancelarEdicion = () => {
    setModoEdicion(false);
  };

  async function obtenerConfiguracionRojo() {
    setLoading(true);
    await obtenerConfigM({
      IdCliente: IdCliente,
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdConfiguracion: "ACREDITACION_ROJO"
    }).then(data => {
      // debugger;
      const { Valor1 } = data;
      setColorRojo(Valor1);
    }).catch(err => { }).finally(() => { setLoading(false); });
  }


  async function obtenerConfiguracionVerde() {
    setLoading(true);
    await obtenerConfigM({
      IdCliente: IdCliente,
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdConfiguracion: "ACREDITACION_VERDE"
    }).then(data => {
      const { Valor1 } = data;
      setColorVerde(Valor1);
      console.log("valo1verde", Valor1);
    }).catch(err => { }).finally(() => { setLoading(false); });
  }


  useEffect(() => {
    listarSolicitud();
    obtenerConfiguracionRojo();
    obtenerConfiguracionVerde();
  }, []);

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return <>



    {
      modoEdicion ? (
        <DetalleIndexPage
          cancelarEdicion={cancelarEdicion}
          selected={selected}
          colorRojo={colorRojo}
          colorVerde={colorVerde}
        />
      ) : (
        <SolicitudListPage
          colorRojo={colorRojo}
          colorVerde={colorVerde}
          solicitudes={listarTabs}
          focusedRowKey={focusedRowKey}
          seleccionarRegistro={seleccionarSolicitud}
          cancelarEdicion={props.cancelarEdicion}
          getInfo={getInfo}
          abrirSolicitudDetalle={abrirSolicitudDetalle}

        />
      )}




  </>
};

export default injectIntl(WithLoandingPanel(SolicitudIndexPage));
