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
  obtener as obtenerPP, listar as listarPP, crear as crearPP, actualizar as actualizarPP, eliminar as eliminarPP
} from "../../../../../api/asistencia/personaPlanilla.api";
import PersonaPlanillaEditPage from "./PlanillaEditPage";
import PersonaPlanillaListPage from "./PlanillaListPage";
import { dateFormat, isNotEmpty } from "../../../../../../_metronic";
import { servicePersona } from "../../../../../api/administracion/persona.api";

const PlanillaIndexPage = (props) => {
  const { intl, setLoading, settingDataField, getInfo, accessButton, varIdPersona, selectedIndex } = props;
  const usuario = useSelector(state => state.auth.user);
  const { IdDivision, IdCliente } = useSelector(state => state.perfil.perfilActual);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const [isVisible, setIsVisible] = useState(false);
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
  const [focusedRowKey, setFocusedRowKey] = useState(0);
  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-Persona-:::::::::::::::::::::::::::::::::
  useEffect(() => {
    listarPersonaPlanilla();
  }, []);

  //::::::::::::::::::::::::::::::::::::::::::::: Funciones Planilla Persona :::::::::::::::::::::::::::::::::

  async function agregarPersonaPlanilla(datarow) {
    setLoading(true);
    const { IdPlanilla, IdCompania, FechaInicio, FechaFin, Activo } = datarow;
    let data = {
      IdCliente
      , IdPersona: varIdPersona
      , IdPlanilla: isNotEmpty(IdPlanilla) ? IdPlanilla.toUpperCase() : ""
      , IdCompania: isNotEmpty(IdCompania) ? IdCompania.toUpperCase() : ""
      , FechaInicio: dateFormat(FechaInicio, "yyyyMMdd") 
      , FechaFin: dateFormat(FechaFin,"yyyyMMdd")
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await crearPP(data).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarPersonaPlanilla();
      setModoEdicion(false);

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarPersonaPlanilla(datarow) {
    setLoading(true);
    const { IdCliente, IdPersona, IdPlanilla, IdCompania, FechaInicio, FechaFin, Activo } = datarow;
    let data = {
      IdCliente
      , IdPersona: IdPersona
      , IdPlanilla: isNotEmpty(IdPlanilla) ? IdPlanilla.toUpperCase() : ""
      , IdCompania: isNotEmpty(IdCompania) ? IdCompania.toUpperCase() : ""
      , FechaInicio: dateFormat(FechaInicio, "yyyyMMdd") 
      , FechaFin: dateFormat(FechaFin,"yyyyMMdd") 
       , Activo: Activo
      , IdUsuario: usuario.username
    };
    await actualizarPP(data).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarPersonaPlanilla();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistroPersonaPlanilla(data, confirm) {
    setSelectedDelete(data);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdPersona, IdCompania, IdPlanilla } = selectedDelete;
      await eliminarPP({ IdCliente: IdCliente, IdPersona: IdPersona, IdPlanilla: IdPlanilla, IdCompania: IdCompania }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarPersonaPlanilla();
    }
  }

  async function listarPersonaPlanilla() {
    setLoading(true);
    await listarPP(
      {
        IdCliente
        , IdPersona: varIdPersona
        , IdPlanilla: '%'
        , IdCompania: '%'
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

  async function obtenerPersonaPlanilla(dataRow) {
    setLoading(true);
    const { IdCliente, IdPersona, IdPlanilla, IdCompania } = dataRow;
    await obtenerPP({ IdCliente, IdPersona, IdPlanilla, IdCompania }).then(data => {
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  // const nuevoRegistroTabsPersonaPlanilla = () => {
  //   let hoy = new Date();
  //   let fecInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  //   let planilla = { Activo: "S", FechaInicio: fecInicio  };
  //   setDataRowEditNew({ ...planilla, Longitud: 0, esNuevoRegistro: true });
  //   setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
  //   setModoEdicion(true);
  // };

  // const editarRegistroPersonaPlanilla = async (dataRow) => {
  //   setModoEdicion(true);
  //   setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
  //   obtenerPersonaPlanilla(dataRow);
  // };

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
    await obtenerPersonaPlanilla(dataRow);
    setModoEdicion(true);
  };

  const cancelarEdicionTabsPersonaPlanilla = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return <>

    {modoEdicion && (
      <>
        <PersonaPlanillaEditPage
          dataRowEditNew={dataRowEditNew}
          actualizarPersonaPlanilla={actualizarPersonaPlanilla}
          agregarPersonaPlanilla={agregarPersonaPlanilla}
          cancelarEdicion={cancelarEdicionTabsPersonaPlanilla}
          titulo={tituloTabs}
          modoEdicion={modoEdicion}
          accessButton={accessButton}
          getInfo={getInfo}
          varIdPersona={varIdPersona}
          fechasContrato ={fechasContrato}
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
        <PersonaPlanillaListPage
          personasPlanilla={listarTabs}
          editarRegistro={editarRegistro}
          eliminarRegistro={eliminarRegistroPersonaPlanilla}
          nuevoRegistro={nuevoRegistro}
          getInfo={getInfo}
          accessButton={accessButton}
          cancelarEdicion={props.cancelarEdicion}
          focusedRowKey={focusedRowKey}
        />
      </>
    )}


    <Confirm
      message={intl.formatMessage({ id: "ALERT.REMOVE" })}
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      setInstance={setInstance}
      onConfirm={() => eliminarRegistroPersonaPlanilla(selectedDelete, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />


  </>
};

export default injectIntl(WithLoandingPanel(PlanillaIndexPage));
