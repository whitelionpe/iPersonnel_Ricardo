import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import { isNotEmpty, dateFormat } from "../../../../../../_metronic";

import { useStylesEncabezado, useStylesTab } from "../../../../../store/config/Styles";
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
  eliminar
} from "../../../../../api/acceso/grupoRestriccion.api";

import GrupoRestriccionEditPage from "../../grupo/restriccion/GrupoRestriccionEditPage";
import GrupoRestriccionListPage from "../../grupo/restriccion/GrupoRestriccionListPage";

import { obtenerTodos as obtenerTodosRestriccion } from "../../../../../api/acceso/restriccion.api";

import { uploadFile } from "../../../../../api/helpers/fileBase64.api";

const GrupoRestriccionIndexPage = (props) => {
  const { intl, setLoading, getInfo, accessButton, settingDataField, varIdGrupo, cancelarEdicion, pathFile } = props;
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

  const [accesoRestriccionData, setAccesoRestriccionData] = useState([]);

  //:::::::::::::::::::::::::::::::::::::::::::::-Funciones-Restricción-Grupo-:::::::::::::::::::::::::::::::::

  async function listarRestriccion() {
    setLoading(true);
    setModoEdicion(false);
    await listar({
      IdDivision: IdDivision,
      IdCliente: IdCliente,
      IdGrupo: varIdGrupo
    }).then(restriccion => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(restriccion);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function agregarRestriccion(dataRow) {
    setLoading(true);
    const { IdRestriccion, FechaInicio, FechaFin, HoraInicio, HoraFin, FlgDiaCompleto, Activo } = dataRow;
    let params = {
      IdSecuencial: 0
      , IdDivision: IdDivision
      , IdCliente: IdCliente
      , IdGrupo: varIdGrupo
      , IdRestriccion: IdRestriccion
      , FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : ""
      , FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : ""
      , HoraInicio: isNotEmpty(HoraInicio) ? dateFormat(HoraInicio, "hh:mm") : ""
      , HoraFin: isNotEmpty(HoraFin) ? dateFormat(HoraFin, "hh:mm") : ""
      , FlgDiaCompleto: FlgDiaCompleto
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await crear(params).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarRestriccion();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarRestriccion(dataRow) {
    setLoading(true);
    const { IdDivision, IdCliente, IdGrupo, IdRestriccion, IdSecuencial, FechaInicio, FechaFin, HoraInicio, HoraFin, FlgDiaCompleto, Activo } = dataRow;
    let params = {
      IdSecuencial: IdSecuencial
      , IdDivision: IdDivision
      , IdCliente: IdCliente
      , IdGrupo: IdGrupo
      , IdRestriccion: IdRestriccion
      , FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : ""
      , FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : ""
      , HoraInicio: isNotEmpty(HoraInicio) ? dateFormat(HoraInicio, "hh:mm") : ""
      , HoraFin: isNotEmpty(HoraFin) ? dateFormat(HoraFin, "hh:mm") : ""
      , FlgDiaCompleto: FlgDiaCompleto
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await actualizar(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarRestriccion();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdSecuencial, IdDivision, IdCliente, IdGrupo, IdRestriccion } = selectedDelete;
      await eliminar({
        IdSecuencial: IdSecuencial,
        IdDivision: IdDivision,
        IdCliente: IdCliente,
        IdGrupo: IdGrupo,
        IdRestriccion: IdRestriccion,
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarRestriccion();
    } else {
      let { Horario } = { selected };
      setSelected({ ...dataRow, Horario });
      setIsVisible(true);
    }
  }

  async function obtenerRestriccion(dataRow) {
    setLoading(true);
    const { IdSecuencial, IdDivision, IdCliente, IdGrupo, IdRestriccion } = dataRow;
    await obtener({
      IdSecuencial: IdSecuencial,
      IdDivision: IdDivision,
      IdCliente: IdCliente,
      IdGrupo: IdGrupo,
      IdRestriccion: IdRestriccion,
    }).then(Restriccion => {
      setDataRowEditNew({ ...Restriccion, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  const editarRegistro = dataRow => {
    console.log("editarRegistro|dataRow:", dataRow);
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerRestriccion(dataRow);
  };

  const seleccionarRegistro = dataRow => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };

  const nuevoRegistro = () => {
    let nuevo = { Activo: "S" };
    setDataRowEditNew({ ...nuevo, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const cancelarEdicionRestriccion = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  //::::::::::::::::::::::::::::::::::::::::-Listar Restricciones -::::::::::::::::::::::::::::::::::::::::::::::::::://
  async function obtener_Todos_Restriccion() {
    let restriccion = await obtenerTodosRestriccion({
      IdCliente: IdCliente,
      IdDivision: IdDivision
    });
    setAccesoRestriccionData(restriccion);
  }

  useEffect(() => {
    listarRestriccion();
    obtener_Todos_Restriccion()
  }, []);

  return <>

    {modoEdicion && (
      <>
        <GrupoRestriccionEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarRestriccion={actualizarRestriccion}
          agregarRestriccion={agregarRestriccion}
          cancelarEdicion={cancelarEdicionRestriccion}
          titulo={titulo}
          accessButton={accessButton}
          settingDataField={settingDataField}
          varIdGrupo={varIdGrupo}
          getInfo={getInfo}
          accesoRestriccionData={accesoRestriccionData}
          setDataRowEditNew={setDataRowEditNew}

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
        <GrupoRestriccionListPage
          grupoRestriccionData={listarTabs}
          editarRegistro={editarRegistro}
          eliminarRegistro={eliminarRegistro}
          nuevoRegistro={nuevoRegistro}
          seleccionarRegistro={seleccionarRegistro}
          focusedRowKey={focusedRowKey}
          accessButton={accessButton}
          getInfo={getInfo}
          cancelarEdicion={cancelarEdicion}
          pathFile={pathFile}

        />
      </>
    )}

    <Confirm
      message={intl.formatMessage({ id: "ALERT.REMOVE" })}
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      setInstance={setInstance}
      onConfirm={() => eliminarRegistro(selectedDelete, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />
  </>

};



export default injectIntl(WithLoandingPanel(GrupoRestriccionIndexPage));
