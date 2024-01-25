import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import { isNotEmpty, dateFormat } from "../../../../../../_metronic";

import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../../partials/components/Confirm";

import {
  handleErrorMessages,
  handleSuccessMessages,
  handleInfoMessages,
} from "../../../../../store/ducks/notify-messages";

import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";

import {
  listar ,
  obtener ,
  crear ,
  actualizar ,
  eliminar ,
} from "../../../../../api/administracion/personaCaracteristica.api";

import PersonaCaracteristicaEditPage from "../../persona/caracteristica/PersonaCaracteristicaEditPage";
import PersonaCaracteristicaListPage from "../../persona/caracteristica/PersonaCaracteristicaListPage";
 
const PersonaCaracteristicaIndexPage = (props) => {
  
  console.log("PersonaCaracteristicaIndexPage|props:",props);

  const { intl, setLoading, getInfo, accessButton, settingDataField, varIdPersona, cancelarEdicion,pathFile } = props;
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  const [listarTabs, setListarTabs] = useState([]);
  const [focusedRowKey, setFocusedRowKey] = useState(0);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [selected, setSelected] = useState({});

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-caracteristica-persona:::::::::::::::::::::::::::::::::
  async function agregarCaracteristica(caracteristica) {
    setLoading(true);
    const {  IdCaracteristica, IdCaracteristicaDetalle, IdSecuencial, FechaInicio, FechaFin, Activo } = caracteristica;
    let params = {
        IdPersona : varIdPersona
      , IdCliente : IdCliente
      , IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0
      , IdCaracteristica: isNotEmpty(IdCaracteristica) ? IdCaracteristica : ""
      , IdCaracteristicaDetalle: isNotEmpty(IdCaracteristicaDetalle) ? IdCaracteristicaDetalle : ""
      , FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio,'yyyyMMdd')  : ""
      , FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin,'yyyyMMdd') : ""
      , Activo
      , IdUsuario: usuario.username
    };
    await crear(params).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarCaracteristica();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarCaracteristica(caracteristica) {
    setLoading(true);
    const { IdPersona, IdCliente, IdSecuencial, IdCaracteristica, IdCaracteristicaDetalle, FechaInicio, FechaFin, Activo } = caracteristica;
    let params = {
        IdPersona : IdPersona
      , IdCliente : IdCliente
      , IdSecuencial: IdSecuencial 
      , IdCaracteristica: IdCaracteristica
      , IdCaracteristicaDetalle: isNotEmpty(IdCaracteristicaDetalle) ? IdCaracteristicaDetalle : ""
      , FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio,'yyyyMMdd')  : ""
      , FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin,'yyyyMMdd') : ""
      , Activo
      , IdUsuario: usuario.username
    };
    await actualizar(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarCaracteristica();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarCaracteristica(caracteristica, confirm) {
    setSelectedDelete(caracteristica);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdPersona, IdCliente, IdSecuencial, IdCaracteristica, IdCaracteristicaDetalle } = selectedDelete;
      await eliminar({ 
              IdPersona: IdPersona,
              IdSecuencial: IdSecuencial,
              IdCliente: IdCliente,
              IdCaracteristica: IdCaracteristica,
              IdCaracteristicaDetalle: IdCaracteristicaDetalle,
              IdUsuario: usuario.username
             }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarCaracteristica();
    }
  }

  async function listarCaracteristica() {
    setLoading(true);
    setModoEdicion(false);
    await listar({
        IdPersona: varIdPersona,
        IdCliente: IdCliente,
        NumPagina: 0, 
        TamPagina: 0
    }).then(caracteristicas => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(caracteristicas);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  async function obtenerCaracteristica(filtro) {
    setLoading(true);
    const { IdPersona, IdCliente, IdSecuencial, IdCaracteristica, IdCaracteristicaDetalle } = filtro;

    await obtener({ 
        IdPersona : IdPersona,
        IdCliente : IdCliente,
        IdCaracteristica : IdCaracteristica,
        IdCaracteristicaDetalle : IdCaracteristicaDetalle, 
        IdSecuencial : IdSecuencial
         })
      .then(caracteristica => {
        setDataRowEditNew({ ...caracteristica, esNuevoRegistro: false });
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
      .finally(() => { setLoading(false) });
  }

  const editarCaracteristica = dataRow => {
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerCaracteristica(dataRow);
  };


   const nuevoCaracteristica = () => {
     let nuevo = { Activo: "S" };
     setDataRowEditNew({
       ...nuevo,
       esNuevoRegistro: true,
     });
     setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
     setModoEdicion(true);
   };

  const cancelarCaracteristica = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };


  useEffect(() => {
    listarCaracteristica();
  }, []);

  return <>

    {modoEdicion && (
      <>
        <PersonaCaracteristicaEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarCaracteristica={actualizarCaracteristica}
          agregarCaracteristica={agregarCaracteristica}
          cancelarEdicion={cancelarCaracteristica}
          titulo={titulo}
          accessButton={accessButton}
          settingDataField={settingDataField}
          varIdPersona={varIdPersona}
          getInfo={getInfo}
        />

        <div className="container_only">
          <div className="float-right">
            <ControlSwitch
              checked={auditoriaSwitch}
              onChange={e => { setAuditoriaSwitch(e.target.checked) }}
            /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
          </div>
        </div>
        {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
      </>
    )}
    {!modoEdicion && (
      <>
        <PersonaCaracteristicaListPage
          personaCaracteristicas={listarTabs}
          editarRegistro={editarCaracteristica}
          eliminarRegistro={eliminarCaracteristica}
          nuevoRegistro={nuevoCaracteristica}
          focusedRowKey={focusedRowKey}
          accessButton={accessButton}
          getInfo = {getInfo}
          cancelarEdicion={cancelarEdicion}
        />
      </>
    )}

    <Confirm
      message={intl.formatMessage({ id: "ALERT.REMOVE" })}
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      setInstance={setInstance}
      onConfirm={() => eliminarCaracteristica(selectedDelete, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />
  </>

};

export default injectIntl(WithLoandingPanel(PersonaCaracteristicaIndexPage));
