import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../../partials/components/Confirm";
import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";
import { useStylesTab } from "../../../../../store/config/Styles";
import {
  obtener as obtenerPCE, listar as listarPCE, crear as crearPCE, actualizar as actualizarPCE, eliminar as eliminarPCE
} from "../../../../../api/asistencia/personaCondicionEspecial.api";
import PersonaCondicionEspecialEditPage from "./PersonaCondicionEspecialEditPage";
import PersonaCondicionEspecialListPage from "./PersonaCondicionEspecialListPage";
import { dateFormat, isNotEmpty } from "../../../../../../_metronic";
import { servicePersona } from "../../../../../api/administracion/persona.api";

const PersonaCondicionEspecialIndexPage = (props) => {

  const usuario = useSelector(state => state.auth.user);
  const { IdDivision, IdCliente } = useSelector(state => state.perfil.perfilActual);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const { intl, setLoading, settingDataField, getInfo, accessButton, varIdPersona, cancelarEdicion } = props;
  const [isVisible, setIsVisible] = useState(false);
  const [focusedRowKeyCondicionEspecial, setFocusedRowKeyCondicionEspecial] = useState();
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState({});
  const classes = useStylesTab();
  const [listarTabs, setListarTabs] = useState([]);
  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.EDIT" }));
  const [instance, setInstance] = useState({});
  const [fechasContrato, setFechasContrato] = useState({ FechaInicioContrato: null, FechaFinContrato: null });

  
  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-Persona-:::::::::::::::::::::::::::::::::

  useEffect(() => {
    listarPersonaCondicionEspecial();
  }, []);

  //::::::::::::::::::::::::::::::::::::::::::::: Funciones Condicion Especial ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


  async function agregarPersonaCondicionEspecial(datarow) {
    setLoading(true);
    const { IdCondicionEspecial, IdCompania, FechaInicio, FechaFin, Activo } = datarow;
    let data = {
      IdCliente
      , IdPersona: varIdPersona
      , IdSecuencial: 0
      , IdCompania: isNotEmpty(IdCompania) ? IdCompania.toUpperCase() : ""
      , IdCondicionEspecial: isNotEmpty(IdCondicionEspecial) ? IdCondicionEspecial.toUpperCase() : ""
      , FechaInicio: dateFormat(FechaInicio,'yyyyMMdd') //(new Date(FechaInicio)).toLocaleString()
      , FechaFin: dateFormat(FechaFin,'yyyyMMdd') //(new Date(FechaFin)).toLocaleString()
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await crearPCE(data).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarPersonaCondicionEspecial();
      setModoEdicion(false);

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarPersonaCondicionEspecial(datarow) {
    setLoading(true);
    const { IdCliente, IdPersona, IdSecuencial, IdCondicionEspecial, IdCompania, FechaInicio, FechaFin, Activo } = datarow;
    let data = {
      IdCliente: IdCliente
      , IdPersona: IdPersona
      , IdSecuencial: IdSecuencial
      , IdCompania: isNotEmpty(IdCompania) ? IdCompania.toUpperCase() : ""
      , IdCondicionEspecial: isNotEmpty(IdCondicionEspecial) ? IdCondicionEspecial.toUpperCase() : ""
      , FechaInicio:  dateFormat(FechaInicio,'yyyyMMdd')//(new Date(FechaInicio)).toLocaleString()
      , FechaFin: dateFormat(FechaFin,'yyyyMMdd') //(new Date(FechaFin)).toLocaleString()
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await actualizarPCE(data).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarPersonaCondicionEspecial();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistroPersonaCondicionEspecial(data, confirm) {
    setSelectedDelete(data);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdPersona, IdSecuencial } = selectedDelete;
      await eliminarPCE({ IdCliente: IdCliente, IdPersona: IdPersona, IdSecuencial: IdSecuencial }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarPersonaCondicionEspecial();
    }
  }

  async function listarPersonaCondicionEspecial() {
    setLoading(true);
    await listarPCE(
      {
        IdCliente
        , IdPersona: varIdPersona
        , NumPagina: 0
        , TamPagina: 0
      }
    ).then(data => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      //changeTabIndex(3);
      setListarTabs(data)
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerPersonaCondicionEspecial(dataRow) {
    setLoading(true);
    const { IdCliente, IdPersona, IdSecuencial } = dataRow;
    await obtenerPCE({ IdCliente, IdPersona, IdSecuencial }).then(data => {
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const seleccionarPersonaCondicionEspecial = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKeyCondicionEspecial(RowIndex);
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
    await obtenerPersonaCondicionEspecial(dataRow);
    setModoEdicion(true);
  };

  const cancelarEdicionTabsPersonaCondicionEspecial = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };


  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return <>

    {modoEdicion && (
      <>
        <PersonaCondicionEspecialEditPage
          dataRowEditNew={dataRowEditNew}
          actualizarPersonaCondicionEspecial={actualizarPersonaCondicionEspecial}
          agregarPersonaCondicionEspecial={agregarPersonaCondicionEspecial}
          cancelarEdicion={cancelarEdicionTabsPersonaCondicionEspecial}
          titulo={tituloTabs}
          modoEdicion={modoEdicion}
          accessButton={accessButton}
          getInfo={getInfo}
          varIdPersona={varIdPersona}
          fechasContrato = {fechasContrato}
        />
        <div className="container_only">
          <div className="float-right">
            <ControlSwitch checked={auditoriaSwitch}
              onChange={e => { setAuditoriaSwitch(e.target.checked) }}
            /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
          </div>
        </div>
        {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
      </>
    )}

    {!modoEdicion && (
      <>
        <PersonaCondicionEspecialListPage
          personaCondicionEspecial={listarTabs}
          seleccionarRegistro={seleccionarPersonaCondicionEspecial}
          editarRegistro={editarRegistro}
          eliminarRegistro={eliminarRegistroPersonaCondicionEspecial}
          nuevoRegistro={nuevoRegistro}
          cancelarEdicion={cancelarEdicion}
          getInfo={getInfo}
          accessButton={accessButton}
          focusedRowKey={focusedRowKeyCondicionEspecial}
        />
      </>
    )}

    <Confirm
      message={intl.formatMessage({ id: "ALERT.REMOVE" })}
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      setInstance={setInstance}
      onConfirm={() => eliminarRegistroPersonaCondicionEspecial(selectedDelete, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />


  </>
};

export default injectIntl(WithLoandingPanel(PersonaCondicionEspecialIndexPage));
