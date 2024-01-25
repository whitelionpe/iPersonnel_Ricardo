import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages } from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { useSelector } from "react-redux";
import { useStylesTab } from "../../../../../store/config/Styles";

import { listar } from "../../../../../api/acreditacion/solicitud.api";
import SolicitudListPage from "./SolicitudListPage";

//import FichaPersonaIndexPage from '../autorizador/persona/PersonaIndexPage';
import FichaPersonaIndexPage from '../../solicitud/autorizador/persona/PersonaIndexPage';

import { obtener as obtenerConfigM } from "../../../../../api/sistema/configuracionModulo.api";

const SolicitudIndexPage = (props) => {

  //const usuario = useSelector(state => state.auth.user);
  const { IdDivision, IdCliente } = useSelector(state => state.perfil.perfilActual);
  //const perfil = useSelector(state => state.perfil.perfilActual);

  const { intl, setLoading, settingDataField, getInfo, accessButton, varIdDocumento, dataMenu, selectedIndex } = props;

  //const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));

  const classes = useStylesTab();
  const [listarTabs, setListarTabs] = useState([]);
  //const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.EDIT" }));
  //const [instance, setInstance] = useState({});
  const [focusedRowKey, setFocusedRowKey] = useState(0);
  const [selected, setSelected] = useState({});
  const [colorRojo, setColorRojo] = useState();
  const [colorVerde, setColorVerde] = useState();
  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-Persona-:::::::::::::::::::::::::::::::::


  async function listarSolicitud() {
    setLoading(true);
    const { IdCliente, Documento } = selectedIndex;
   // console.log("IdCliente,IdDivision,Documento", IdCliente, IdDivision, Documento);
    await listar(
      {
        IdCliente
        , IdDivision
        , IdDocumento: Documento
        , NumPagina: 0
        , TamPagina: 0
      }).then(data => {
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setListarTabs(data)
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  const seleccionarSolicitud = async (dataRow) => {
    console.log("seleccionarSolicitud", dataRow);
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
    setSelected(dataRow);
  }

  const abrirSolicitudDetalle = (data) => {
    setSelected(data);
    setModoEdicion(true);
    console.log("abrirSolicitudDetalle|data:",data);
    
  };

   const cancelarEdicion = () => {
     setModoEdicion(false);
     //setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
     //setDataRowEditNew({});
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
    }).finally(() => { setLoading(false); });
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
      //console.log("valo1verde",Valor1);
    }).finally(() => { setLoading(false); });
  }


  useEffect(() => {
    listarSolicitud();
    obtenerConfiguracionRojo();
    obtenerConfiguracionVerde();
  }, []);

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return <>

    {modoEdicion && (
      //::::::::::::::::- Detalle de la solicitud-:::::::::::::::::::::::::::
      <FichaPersonaIndexPage
        selected={selected}
        cancelarEdicion={cancelarEdicion}
        colorRojo = {colorRojo}
        colorVerde = {colorVerde}
      />

    )}
    {!modoEdicion && (
      //::::::::::::::::- Listar solicitud-:::::::::::::::::::::::::::  */}

      <SolicitudListPage
        solicitudes={listarTabs}
        cancelarEdicion={props.cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        seleccionarRegistro={seleccionarSolicitud}
        focusedRowKey={focusedRowKey}
        abrirSolicitudDetalle={abrirSolicitudDetalle}
        colorRojo={colorRojo}
        colorVerde={colorVerde}
      />

    )}


  </>
};

export default injectIntl(WithLoandingPanel(SolicitudIndexPage));
