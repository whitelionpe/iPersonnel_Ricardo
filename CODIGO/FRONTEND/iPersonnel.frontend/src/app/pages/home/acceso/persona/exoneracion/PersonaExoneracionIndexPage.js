import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import { isNotEmpty, dateFormat } from "../../../../../../_metronic";

import { handleErrorMessages, handleSuccessMessages, handleInfoMessages} from "../../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../../partials/components/Confirm";

import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";

import {
  listar ,
  obtener ,
  crear ,
  actualizar ,
  eliminar ,
} from "../../../../../api/acceso/personaExoneracion.api";
import { servicePersona } from "../../../../../api/administracion/persona.api";

import PersonaExoneracionListPage from "./PersonaExoneracionListPage";
import PersonaExoneracionEditPage from "./PersonaExoneracionEditPage";


const ExoneracionIndexPage = (props) => {
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



  async function agregarExoneracion(datarow) {
    setLoading(true);
    const {
      IdExoneracion,
      FechaInicio,
      FechaFin,
      Observacion,
      IdSecuencial,
    } = datarow;

    let params = {
      IdCliente: IdCliente,
      IdPersona: varIdPersona,
      IdExoneracion: isNotEmpty(IdExoneracion) ? IdExoneracion : "",
      IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0,
      IdDivision: IdDivision,
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio,'yyyyMMdd')  : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin,'yyyyMMdd') : "",
      Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : "",
      IdUsuario: usuario.username,
    };
    await crear(params)
      .then((response) => {
        if (response)
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
          );
        listarExoneracion();
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function actualizarExoneracion(datarow) {
    setLoading(true);
    const {
      IdCliente,
      IdPersona,
      IdExoneracion,
      IdSecuencial,
      IdDivision,
      FechaInicio,
      FechaFin,
      Observacion,
    } = datarow;
    let params = {
      IdCliente: IdCliente, 
      IdPersona: IdPersona,
      IdExoneracion: isNotEmpty(IdExoneracion) ? IdExoneracion : "",
      IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0,
      IdDivision: IdDivision,
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio,'yyyyMMdd')  : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin,'yyyyMMdd') : "",
      Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : "",
      IdUsuario: usuario.username,
    };
    await actualizar(params)
      .then(() => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
        );
        listarExoneracion();
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro(data, confirm) {
    setSelectedDelete(data);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdPersona, IdExoneracion,IdSecuencial } = selectedDelete;
      await eliminar({
        IdCliente,
        IdPersona,
        IdExoneracion,
        IdSecuencial,
        IdUsuario: usuario.username,
      })
        .then((response) => {
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
          );
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
        listarExoneracion();
    }
  }

  async function listarExoneracion() {
    setModoEdicion(false);
    let data = await listar({
      IdCliente: IdCliente,
      IdPersona: varIdPersona,
      IdExoneracion:'%',
      NumPagina: 0,
      TamPagina: 0,
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setListarTabs(data);
  }

  async function obtenerExoneracion(datarow) {
    const { IdCliente, IdPersona, IdExoneracion,IdSecuencial } = datarow;
    if (IdSecuencial) {
      let exoneracionRequisito = await obtener({
        IdCliente,
        IdPersona,
        IdExoneracion,
        IdSecuencial,
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
      setDataRowEditNew({
        ...exoneracionRequisito,
        esNuevoRegistro: false,
      });
    }
  }

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
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerExoneracion(dataRow);
    setModoEdicion(true);

  };

  const cancelarEdicionExoneracion = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const seleccionarRegistro = dataRow => {
    const {  RowIndex } = dataRow;
    setModoEdicion(false);
    setFocusedRowKey(RowIndex);
  }

 
  useEffect(() => {
    listarExoneracion();
  }, []);

  return <>

    {modoEdicion && (
      <>
        <PersonaExoneracionEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarExoneracion={actualizarExoneracion}
          agregarExoneracion={agregarExoneracion}
          cancelarEdicion={cancelarEdicionExoneracion}
          titulo={titulo}
          accessButton={accessButton}
          settingDataField={settingDataField}
          varIdPersona={varIdPersona}
          showHeaderInformation ={true}
          getInfo={getInfo}
          setDataRowEditNew  = {setDataRowEditNew}
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
        <PersonaExoneracionListPage
          personaExoneracionData={listarTabs}
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



export default injectIntl(WithLoandingPanel(ExoneracionIndexPage));
