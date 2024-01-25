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
import { servicePersonaPerfil } from "../../../../../api/campamento/personaPerfil.api";
import { servicePersona } from "../../../../../api/administracion/persona.api";
import PersonaPerfilEditPage from "../../persona/perfil/PersonaPerfilEditPage";
import PersonaPerfilListPage from "../../persona/perfil/PersonaPerfilListPage";

const PersonaPerfilIndexPage = (props) => {
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
  const [fechasContrato, setFechasContrato] = useState({ FechaInicioContrato: null, FechaFinContrato: null });

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-Perfil-persona:::::::::::::::::::::::::::::::::

  async function listarPerfil() {
    setModoEdicion(false);
    let perfiles = await servicePersonaPerfil.listar({
      IdCliente: IdCliente,
      IdPersona: varIdPersona,
      IdPerfil: '%',
      IdSecuencial: 0,
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setListarTabs(perfiles);
    // console.log("listarPerfil|perfiles:",perfiles);
  }

  async function agregarPerfil(dataRow) {
    setLoading(true);
    const { IdSecuencial,IdPerfil,FechaInicio, FechaFin, CheckInSinReserva, DiasPermanencia, Activo } = dataRow;
    let params = {
      IdCliente: IdCliente,
      IdPersona: varIdPersona,
      IdDivision: IdDivision,
      IdPerfil: IdPerfil,
      IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0,
      IdCompania: "",
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : "",
      CheckInSinReserva: isNotEmpty(CheckInSinReserva) ? CheckInSinReserva : "",
      DiasPermanencia: isNotEmpty(DiasPermanencia) ? DiasPermanencia : 0,
      Activo: Activo,
      IdUsuario: usuario.username,
    };
    await servicePersonaPerfil.crear(params)
      .then((response) => {
        if (response)
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
          );
        listarPerfil();
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function actualizarPerfil(dataRow) {
    setLoading(true);
    const { IdCliente,IdDivision, IdPersona, IdPerfil, IdSecuencial, FechaInicio, FechaFin,CheckInSinReserva,DiasPermanencia, Activo } = dataRow;
    let params = {
      IdCliente: IdCliente,
      IdPersona: IdPersona,
      IdDivision: IdDivision,
      IdPerfil: IdPerfil,
      IdSecuencial:IdSecuencial,
      IdCompania: "",
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : "",
      CheckInSinReserva: isNotEmpty(CheckInSinReserva) ? CheckInSinReserva : "",
      DiasPermanencia: isNotEmpty(DiasPermanencia) ? DiasPermanencia : 0,
      Activo: Activo,
      IdUsuario: usuario.username,
    };
    await servicePersonaPerfil.actualizar(params)
      .then(() => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
        );
        listarPerfil();
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdPersona, IdSecuencial } = selectedDelete;
      await servicePersonaPerfil.eliminar({
        IdCliente,
        IdPersona,
        IdSecuencial
      })
        .then(() => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
        })
        .finally(() => {
          setLoading(false);
        });
        listarPerfil();
    }
  }

  async function obtenerPerfil(dataRow) {
    const { IdCliente, IdPersona, IdSecuencial } = dataRow;
    if (IdPersona) {
      let perfiles = await servicePersonaPerfil.obtener({
        IdCliente: IdCliente,
        IdPersona: IdPersona,
        IdSecuencial: IdSecuencial,
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
      setDataRowEditNew({ ...perfiles, esNuevoRegistro: false });
    }
  }

  const seleccionarRegistro = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };

  const editarRegistro = async (dataRow) => {

    setLoading(true);
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
    obtenerPerfil(dataRow);
  };

  const nuevoRegistro = async () => {

    setDataRowEditNew({});

    setLoading(true);
    await servicePersona.obtenerPeriodo({
      IdCliente: IdCliente,
      IdPersona: varIdPersona,
      FechaInicio: dateFormat(new Date(), 'yyyyMMdd'),
      FechaFin: dateFormat(new Date(), 'yyyyMMdd'),
    }).then(response => {
      if (response) {
        if (!isNotEmpty(response.MensajeValidacion)) {
          setFechasContrato({ FechaInicioContrato: response.FechaInicio, FechaFinContrato: response.FechaFin });
          
          let fecInicio = parseInt(response.FechaInicio) >  parseInt(dateFormat(new Date(), 'yyyyMMdd')) ? new Date(response.FechaInicio.substring(0, 4), response.FechaInicio.substring(4, 6) - 1, response.FechaInicio.substring(6, 8)) : new Date();
          let fecFin = new Date(response.FechaFin.substring(0, 4), response.FechaFin.substring(4, 6) - 1, response.FechaFin.substring(6, 8));
          let nuevo = { Activo: "S", FechaInicio: fecInicio,FechaFin: fecFin};
          setDataRowEditNew({
            ...nuevo,
            CheckInSinReserva:'S',
            esNuevoRegistro: true,
          });
          setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
          setModoEdicion(true);

        } else {
          setFechasContrato({ FechaInicioContrato: null, FechaFinContrato: null });
          handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), response.MensajeValidacion);
        }
      }
    }).finally(x => {
      setLoading(false);
    });

  };

  const cancelarEdicionPerfil = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  useEffect(() => {
    listarPerfil();
  }, []);

  return <>

    {modoEdicion && (
      <>
        <PersonaPerfilEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarPerfil={actualizarPerfil}
          agregarPerfil={agregarPerfil}
          cancelarEdicion={cancelarEdicionPerfil}
          titulo={titulo}
          accessButton={accessButton}
          settingDataField={settingDataField}
          showHeaderInformation={true}
          getInfo={getInfo}
          setDataRowEditNew={setDataRowEditNew}
          fechasContrato = {fechasContrato}
          varIdPersona = {varIdPersona}
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
        <PersonaPerfilListPage
          dsPerfil={listarTabs}
          editarRegistro={editarRegistro}
          eliminarRegistro={eliminarRegistro}
          nuevoRegistro={nuevoRegistro}
          seleccionarRegistro={seleccionarRegistro}
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
      onConfirm={() => eliminarRegistro(selectedDelete, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />
  </>

};



export default injectIntl(WithLoandingPanel(PersonaPerfilIndexPage));
