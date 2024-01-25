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
} from "../../../../../api/casino/companiaGrupo.api";

import {
  listar as listarCGrupoServicio,
} from "../../../../../api/casino/grupoServicio.api";

import CompaniaGrupoEditPage from "../../companiaGrupo/grupo/CompaniaGrupoEditPage";
import CompaniaGrupoListPage from "../../companiaGrupo/grupo/CompaniaGrupoListPage";
 
const CompaniaGrupoIndexPage = (props) => {
  const { intl, setLoading, getInfo, accessButton, settingDataField, varIdCompania, cancelarEdicion } = props;
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

  const [grupoServicios, setGrupoServicios] = useState([]);


  //:::::::::::::::::::::::::::::::::::::::::::::-FUNCION GRUPO PERSONA:::::::::::::::::::::::::::::::::

  async function agregarGrupo(dataPersonaGrupo) {
    setLoading(true);
    const { IdGrupo, FechaInicio, FechaFin, Activo } = dataPersonaGrupo;
    let params = {
        IdCliente: IdCliente
      , IdCompania: varIdCompania
      , IdDivision: IdDivision
      , IdGrupo: isNotEmpty(IdGrupo) ? IdGrupo.toUpperCase() : ""
      , FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio,'yyyyMMdd')  : ""
      , FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin,'yyyyMMdd') : ""
      , Activo
      , IdUsuario: usuario.username
    };
    await crear(params).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarGrupo();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });
  }

  async function actualizarGrupo(personaGrupo) {
    setLoading(true);
    const { IdCompania,IdGrupo,IdCliente,IdDivision, FechaInicio, FechaFin, Activo } = personaGrupo;
    let params = {
        IdCliente: IdCliente
      , IdCompania: IdCompania
      , IdDivision: IdDivision
      , IdGrupo: isNotEmpty(IdGrupo) ? IdGrupo.toUpperCase() : ""
      , FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio,'yyyyMMdd')  : ""
      , FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin,'yyyyMMdd') : ""
      , Activo
      , IdUsuario: usuario.username
    };
    await actualizar(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarGrupo();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });
  }

  async function eliminarGrupo(personaGrupo, confirm) {
    setSelectedDelete(personaGrupo);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente,IdCompania, IdDivision,IdGrupo } = selectedDelete;
      await eliminar({
        IdCliente: IdCliente
      , IdCompania: IdCompania
      , IdDivision: IdDivision
      , IdGrupo: IdGrupo
      , IdUsuario: usuario.username
      }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false) });
      listarGrupo();
    }
  }

  async function listarGrupo() {
    setLoading(true);
    await listar({
      IdCliente: IdCliente,
      IdCompania: varIdCompania,
      IdDivision: IdDivision,
      IdGrupo: '%',
      NumPagina: 0,
      TamPagina: 0
    }).then(personasGrupo => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(personasGrupo);
      setModoEdicion(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });

  }

  async function obtenerGrupo(filtro) {
    setLoading(true);
    const { IdCliente,IdCompania, IdDivision,IdGrupo } = filtro;
    await obtener({
      IdCliente : IdCliente,
      IdCompania : IdCompania,
      IdDivision : IdDivision,
      IdGrupo : IdGrupo,
    }).then(personaGrupo => {
      setDataRowEditNew({ ...personaGrupo, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });
  }

  async function listarGrupoServicio(dataRow) {
    setLoading(true);
    const { IdGrupo,IdCliente,IdDivision } = dataRow;
    await listarCGrupoServicio({
      IdGrupo: IdGrupo,
      IdCliente: IdCliente,
      IdDivision: IdDivision,
      IdComedor: '%',
      IdServicio: '%',
      NumPagina: 0,
      TamPagina: 0
    }).then(grupoServicios => {
      setGrupoServicios(grupoServicios);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const editarGrupo = dataRow => {
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerGrupo(dataRow);
    listarGrupoServicio(dataRow);
  };

  const seleccionarGrupo = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };

   const nuevoGrupo = () => {
     let nuevo = { Activo: "S" };
     setDataRowEditNew({ ...nuevo,esNuevoRegistro: true,});
     setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
     setModoEdicion(true);
   };

  const cancelarGrupo = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  useEffect(() => {
    listarGrupo();
  }, []);

  return <>

    {modoEdicion && (
      <>
        <CompaniaGrupoEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarGrupo={actualizarGrupo}
          agregarGrupo={agregarGrupo}
          cancelarEdicion={cancelarGrupo}
          titulo={titulo}
          accessButton={accessButton}
          settingDataField={settingDataField}
          varIdCompania={varIdCompania}
          getInfo={getInfo}
          grupoServicios = {grupoServicios}
          setGrupoServicios = {setGrupoServicios}
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
        <CompaniaGrupoListPage
          personasGrupo={listarTabs}
          editarRegistro={editarGrupo}
          eliminarRegistro={eliminarGrupo}
          nuevoRegistro={nuevoGrupo}
          seleccionarRegistro={seleccionarGrupo}
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
      onConfirm={() => eliminarGrupo(selectedDelete, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />
  </>

};

export default injectIntl(WithLoandingPanel(CompaniaGrupoIndexPage));
