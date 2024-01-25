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
} from "../../../../../api/administracion/personaLicencia.api";

import { servicePersona } from "../../../../../api/administracion/persona.api";

import PersonaLicenciaEditPage from "../../persona/licencia/PersonaLicenciaEditPage";
import PersonaLicenciaListPage from "../../persona/licencia/PersonaLicenciaListPage";
import PropTypes from "prop-types";

const PersonaLicenciaIndexPage = (props) => {
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


  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-Licencia-persona:::::::::::::::::::::::::::::::::

  async function agregarLicencia(dataRow) {
    setLoading(true);
    const {  IdLicencia, FechaInicio, FechaFin, Activo } = dataRow;
    let params = {
        IdCliente : IdCliente
      , IdPersona : varIdPersona
      , IdLicencia: isNotEmpty(IdLicencia) ? IdLicencia : ""
      , IdSecuencial: 0
      , FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio,'yyyyMMdd')  : ""
      , FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin,'yyyyMMdd') : ""
      , Activo
      , IdUsuario: usuario.username
    };
    await crear(params).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarLicencia();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarLicencia(dataRow) {
    setLoading(true);
    const { IdCliente,IdPersona, IdSecuencial, IdLicencia, FechaInicio, FechaFin, Activo } = dataRow;
    let params = {
         IdCliente : IdCliente
      ,  IdPersona : IdPersona
      , IdLicencia: IdLicencia
      , IdSecuencial: IdSecuencial 
      , FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio,'yyyyMMdd')  : ""
      , FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin,'yyyyMMdd') : ""
      , Activo
      , IdUsuario: usuario.username
    };
    await actualizar(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarLicencia();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarLicencia(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdPersona, IdLicencia, IdSecuencial,  } = selectedDelete;
      await eliminar({ 
              IdCliente: IdCliente,
              IdPersona: IdPersona,
              IdLicencia: IdLicencia,
              IdSecuencial: IdSecuencial,
             }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarLicencia();
    }
  }

  async function listarLicencia() {
    setLoading(true);
    setModoEdicion(false);
    await listar({
        IdCliente: IdCliente,
        IdPersona: varIdPersona,
        IdLicencia: '%',
        NumPagina: 0, 
        TamPagina: 0
    }).then(data => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(data);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  async function obtenerLicencia(dataRow) {
    setLoading(true);
    const { IdCliente, IdPersona, IdLicencia, IdSecuencial } = dataRow;

    await obtener({ 
        IdCliente : IdCliente,
        IdPersona : IdPersona,
        IdLicencia : IdLicencia,
        IdSecuencial : IdSecuencial
         })
      .then(data => {
        setDataRowEditNew({ ...data, esNuevoRegistro: false });
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
      .finally(() => { setLoading(false) });
  }

  const seleccionarLicencia = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };
  
  const editarLicencia = async (dataRow) => {

    setLoading(true);

    await servicePersona.obtenerPeriodo({
      IdCliente: IdCliente,
      IdPersona: varIdPersona,
      FechaInicio: dateFormat(new Date(), 'yyyyMMdd'),
      FechaFin: dateFormat(new Date(), 'yyyyMMdd'),
    }).then(response => {
      if (response) {
        console.log("obtenerPeriodo|response:",response);
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
    obtenerLicencia(dataRow);
    setModoEdicion(true);

  };

   const nuevoLicencia = async () => {

     let nuevo = { Activo: "S",  };

     await servicePersona.obtenerPeriodo({
      IdCliente: IdCliente,
      IdPersona: varIdPersona,
      FechaInicio: dateFormat(new Date(), 'yyyyMMdd'),
      FechaFin: dateFormat(new Date(), 'yyyyMMdd'),
    }).then(response => {
      if (response) {
        // console.log("nuevoLicencia|response:",response);

        if (!isNotEmpty(response.MensajeValidacion)) {
          setFechasContrato({ FechaInicioContrato: response.FechaInicio, FechaFinContrato: response.FechaFin });
          
          let fecInicio = parseInt(response.FechaInicio) >  parseInt(dateFormat(new Date(), 'yyyyMMdd')) ? new Date(response.FechaInicio.substring(0, 4), response.FechaInicio.substring(4, 6) - 1, response.FechaInicio.substring(6, 8)) : new Date();
          let fecFin = new Date(response.FechaFin.substring(0, 4), response.FechaFin.substring(4, 6) - 1, response.FechaFin.substring(6, 8));
      
          setDataRowEditNew({
            ...nuevo,
            FechaInicio:fecInicio,
            FechaFin:fecFin,
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
  setLoading(false);


   };

  const cancelarLicencia = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };


  useEffect(() => {
    listarLicencia();
  }, []);

  return <>

    {modoEdicion && (
      <>
        <PersonaLicenciaEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarLicencia={actualizarLicencia}
          agregarLicencia={agregarLicencia}
          cancelarEdicion={cancelarLicencia}
          titulo={titulo}
          accessButton={accessButton}
          settingDataField={settingDataField}
          varIdPersona={varIdPersona}
          showHeaderInformation ={true}
          getInfo={getInfo}
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
        <PersonaLicenciaListPage
          personaLicencias={listarTabs}
          editarRegistro={editarLicencia}
          eliminarRegistro={eliminarLicencia}
          nuevoRegistro={nuevoLicencia}
          seleccionarRegistro={seleccionarLicencia}
          focusedRowKey={focusedRowKey}
          accessButton={accessButton}
          getInfo = {getInfo}
          cancelarEdicion={cancelarEdicion}
          showButtons ={props.showButtons}
        />
      </>
    )}

    <Confirm
      message={intl.formatMessage({ id: "ALERT.REMOVE" })}
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      setInstance={setInstance}
      onConfirm={() => eliminarLicencia(selectedDelete, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />
  </>

};

PersonaLicenciaIndexPage.propTypes = {
  showButtons: PropTypes.bool,
}
PersonaLicenciaIndexPage.defaultProps = {
  showButtons: true,
}

export default injectIntl(WithLoandingPanel(PersonaLicenciaIndexPage));
