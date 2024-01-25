import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import { isNotEmpty, dateFormat, validarUsoLicencia } from "../../../../../../_metronic";

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
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
} from "../../../../../api/casino/personaGrupo.api";

import {
  listar as listarCGrupoServicio,
} from "../../../../../api/casino/grupoServicio.api";

import { servicePersona } from "../../../../../api/administracion/persona.api";

import PersonaGrupoEditPage from "../../personaGrupo/grupo/PersonaGrupoEditPage";
import PersonaGrupoListPage from "../../personaGrupo/grupo/PersonaGrupoListPage";

const PersonaGrupoIndexPage = (props) => {
  const { intl, setLoading, getInfo, accessButton, settingDataField, varIdPersona, cancelarEdicion } = props;
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
  const [fechasContrato, setFechasContrato] = useState({ FechaInicioContrato: null, FechaFinContrato: null });

  //:::::::::::::::::::::::::::::::::::::::::::::-FUNCION GRUPO PERSONA:::::::::::::::::::::::::::::::::

  async function agregarGrupo(dataPersonaGrupo) {
    setLoading(true);
    const { IdGrupo, FechaInicio, FechaFin, Activo } = dataPersonaGrupo;
    let params = {
      IdPersona: varIdPersona
      , IdGrupo: isNotEmpty(IdGrupo) ? IdGrupo.toUpperCase() : ""
      , FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : ""
      , FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : ""
      , Activo
      , IdCliente: IdCliente
      , IdDivision: IdDivision
      , IdUsuario: usuario.username
      , IdSecuencial: 0
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
    const { IdPersona, IdGrupo, IdCliente, IdDivision, FechaInicio, FechaFin, Activo, IdSecuencial } = personaGrupo;
    let params = {
      IdPersona: IdPersona
      , IdGrupo: isNotEmpty(IdGrupo) ? IdGrupo.toUpperCase() : ""
      , FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : ""
      , FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : ""
      , Activo: Activo
      , IdCliente: IdCliente
      , IdDivision: IdDivision
      , IdUsuario: usuario.username
      , IdSecuencial: IdSecuencial
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
      const { IdPersona, IdGrupo, IdCliente, IdDivision, IdSecuencial } = selectedDelete;
      await eliminar({
        IdPersona: IdPersona,
        IdGrupo: IdGrupo,
        IdCliente: IdCliente,
        IdDivision: IdDivision,
        IdSecuencial: IdSecuencial,
        IdUsuario: usuario.username
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
      IdPersona: varIdPersona,
      IdCliente: IdCliente,
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
    const { IdPersona, IdGrupo, IdCliente, IdDivision } = filtro;
    await obtener({
      IdPersona: IdPersona,
      IdGrupo: IdGrupo,
      IdCliente: IdCliente,
      IdDivision: IdDivision
    }).then(personaGrupo => {
      setDataRowEditNew({ ...personaGrupo, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });
  }

  async function listarGrupoServicio(dataRow) {
    setLoading(true);
    const { IdGrupo, IdCliente, IdDivision } = dataRow;
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

  const editarGrupo = async(dataRow) => {

    await servicePersona.obtenerPeriodo({
      IdCliente: IdCliente,
      IdPersona: varIdPersona,
      FechaInicio: dateFormat(new Date(), 'yyyyMMdd'),
      FechaFin: dateFormat(new Date(), 'yyyyMMdd'),
    }).then(response => {
      if (response) {
        if (!isNotEmpty(response.MensajeValidacion)) {
          setFechasContrato({ FechaInicioContrato: response.FechaInicio, FechaFinContrato: response.FechaFin });
        } else {
          setFechasContrato({ FechaInicioContrato: null, FechaFinContrato: null });
          handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), response.MensajeValidacion);
        }
      }
    }).finally(x => {
      setLoading(false);
    });

    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerGrupo(dataRow);
    listarGrupoServicio(dataRow);
  };

  const seleccionarGrupo = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };

  const nuevoGrupo = async () => {
    let nextRow = true;
    await validarUsoLicencia({
      IdCliente: IdCliente,
      IdModulo: props.dataMenu.info.IdModulo,
    }).then(response => {
      nextRow = response;
    })
         await servicePersona.obtenerPeriodo({
          IdCliente: IdCliente,
          IdPersona: varIdPersona,
          FechaInicio: dateFormat(new Date(), 'yyyyMMdd'),
          FechaFin: dateFormat(new Date(), 'yyyyMMdd'),
        }).then(response => {
          if (response) {
            if (!isNotEmpty(response.MensajeValidacion)) {
              setFechasContrato({ FechaInicioContrato: response.FechaInicio, FechaFinContrato: response.FechaFin });
              if (nextRow){

                let fecInicio = parseInt(response.FechaInicio) >  parseInt(dateFormat(new Date(), 'yyyyMMdd')) ? new Date(response.FechaInicio.substring(0, 4), response.FechaInicio.substring(4, 6) - 1, response.FechaInicio.substring(6, 8)) : new Date();
                let fecFin = new Date(response.FechaFin.substring(0, 4), response.FechaFin.substring(4, 6) - 1, response.FechaFin.substring(6, 8));

                   let nuevo = { Activo: "S" ,FechaInicio: fecInicio , FechaFin:fecFin};
                   setDataRowEditNew({ ...nuevo, esNuevoRegistro: true, });
                   setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
                   setModoEdicion(true);
              };
            } else {
              setFechasContrato({ FechaInicioContrato: null, FechaFinContrato: null });
              handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), response.MensajeValidacion);
            }
          }
        }).finally(x => {
          setLoading(false);
        });
      setLoading(false);

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
        <PersonaGrupoEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarGrupo={actualizarGrupo}
          agregarGrupo={agregarGrupo}
          cancelarEdicion={cancelarGrupo}
          titulo={titulo}
          accessButton={accessButton}
          settingDataField={settingDataField}
          varIdPersona={varIdPersona}
          getInfo={getInfo}
          setGrupoServicios={setGrupoServicios}
          grupoServicios={grupoServicios}
          fechasContrato = {fechasContrato}
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
        <PersonaGrupoListPage
          personasGrupo={listarTabs}
          editarRegistro={editarGrupo}
          eliminarRegistro={eliminarGrupo}
          nuevoRegistro={nuevoGrupo}
          seleccionarRegistro={seleccionarGrupo}
          focusedRowKey={focusedRowKey}
          accessButton={accessButton}
          getInfo={getInfo}
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

export default injectIntl(WithLoandingPanel(PersonaGrupoIndexPage));
