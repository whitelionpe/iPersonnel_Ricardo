import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../../partials/components/Confirm";
import { useSelector } from "react-redux";
import { useStylesTab } from "../../../../../store/config/Styles";

import {
  crear as crearAjuste, eliminar as eliminarAjuste, obtener as obtenerAjuste,
  obtenerDetalle, obtenerDetalleDia, obtenerAprobadores,
  obtenerJustificacion, obtenerDetalleDiaJustificacion
} from "../../../../../api/asistencia/bolsaHoras.api";

import PersonaBolsaHorasListPage from "./PersonaBolsaHorasListPage";
import { dateFormat, isNotEmpty } from "../../../../../../_metronic";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import AsistenciaAjusteBolsaHorasPopUp from "../../../../../partials/components/AsistenciaAjusteBolsaHorasPopUp";
import AsistenciaAjusteBolsaHorasDetalleHHEEPopUp from "../../../../../partials/components/AsistenciaAjusteBolsaHorasDetalleHHEEPopUp";
import AsistenciaAjusteBolsaHorasDetalleJustificacionPopUp from "../../../../../partials/components/AsistenciaAjusteBolsaHorasDetalleJustificacionPopUp";
import AsistenciaAjusteBolsaHorasDetalleAjustePopUp from "../../../../../partials/components/AsistenciaAjusteBolsaHorasDetalleAjustePopUp";
export const initialFilterMarcas = {
  IdCliente: '',
  IdPersona: '',
  IdCompania: '',
  FechaInicio: new Date(),
  FechaFin: new Date()
};


const PersonaBolsaHorasIndexPage = (props) => {
  const usuario = useSelector(state => state.auth.user);
  const { IdDivision, IdCliente } = useSelector(state => state.perfil.perfilActual);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const { intl, setLoading, settingDataField, getInfo, accessButton, dataMenu, varIdPersona, IdModulo, selectedIndex, varIdCompania } = props;

  const [filterDataMarcas, setFilterDataMarcas] = useState({ ...initialFilterMarcas });
  const [isVisible, setIsVisible] = useState(false);
  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.EDIT" }));
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));

  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [focusedRowKeyMarcacion, setFocusedRowKeyMarcacion] = useState();
  const [selectedDelete, setSelectedDelete] = useState({});
  const classes = useStylesTab();
  const [instance, setInstance] = useState({});
  const [ocultarEdit, setOcultarEdit] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);
  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();
  const [selected, setSelected] = useState({});

  const [modeView, setModeView] = useState(false);
  const [isVisiblePopUpMotivo, setisVisiblePopUpMotivo] = useState(false);

  const [isVisiblePopUpAjuste, setisVisiblePopUpAjuste] = useState(false);
  const [isVisiblePopUpDetalleHHEE, setisVisiblePopUpDetalleHHEE] = useState(false);
  const [isVisiblePopUpDetalleJustificacion, setisVisiblePopUpDetalleJustificacion] = useState(false);
  const [isVisiblePopUpDetalleAjuste, setisVisiblePopUpDetalleAjuste] = useState(false);

  const [saldoActual, setSaldoActual] = useState({ SaldoActual: "", Minutos: 0 });

  const [detalle, setDetalle] = useState({});
  const [detalleDia, setDetalleDia] = useState([]);
  const [detalleAprobadores, setDetalleAprobadores] = useState([]);

  const [detalleJustificacion, setDetalleJustificacion] = useState({});
  const [detalleDiaJustificacion, setDetalleDiaJustificacion] = useState({});

  //::::::::::::::::::::::::::::::::::::::::::::: Funciones Bolsa Horas ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function eliminarRegistroBolsaHoras(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisible(true);
    console.log("ENTER TO ELIMINAR() >> dataRow : ", dataRow);
    if (confirm) {
      confirmarEliminar();
    }
  }

  const confirmarEliminar = async () => {
    setLoading(true);
    const { IdSecuencial, Fecha } = selectedDelete;
    await eliminarAjuste({
      IdCliente: perfil.IdCliente,
      IdCompania: varIdCompania,
      IdPersona: varIdPersona,
      IdSecuencial,
      FechaIngreso: dateFormat(Fecha, 'yyyyMMdd'),
      IdDivision
    }).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });
    await obtenerBolsaHoras();
    setRefreshData(true);
    setisVisiblePopUpMotivo(false);
  };

  async function obtenerBolsaHoras() {
    setLoading(true);
    await obtenerAjuste({
      IdCliente: perfil.IdCliente,
      IdPersona: varIdPersona,
      IdCompania: varIdCompania
    }).then(data => {
      const { Fecha, SaldoFinal, MinutosSaldoFinal } = data;
      setSaldoActual({ SaldoActual: SaldoFinal, Minutos: MinutosSaldoFinal });
      //setDataRowEditNew({ ...data, esNuevoRegistro: false, Minutos: minutos, FechaCorta: fechaCorta, });

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const seleccionarMarcacion = async (dataRow) => {
    const { RowIndex } = dataRow;
    setSelected(dataRow);
    if (RowIndex !== focusedRowKeyMarcacion) {
      setFocusedRowKeyMarcacion(RowIndex);
    }
  }

  const agregarAjuste = async () => {

    ///dataRowEditNew
    setDataRowEditNew({ Fecha: new Date(), TipoMovimiento: 'S', Motivo: '' });

    setisVisiblePopUpAjuste(true);
  }

  const grabarBolsaHoras = async () => {
    setLoading(true);
    const { Motivo, Fecha, CantidadHoras, TipoMovimiento } = dataRowEditNew;

    await crearAjuste({
      IdCliente: perfil.IdCliente,
      IdPersona: varIdPersona,
      IdCompania: varIdCompania,
      Fecha: dateFormat(Fecha, 'yyyyMMdd'),
      CantidadHoras: dateFormat(CantidadHoras, 'yyyyMMdd hh:mm'),
      TipoMovimiento,
      Motivo: isNotEmpty(Motivo) ? Motivo.toUpperCase() : "",
      IdDivision
    }).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.REGISTRATION" }));
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });
    await obtenerBolsaHoras();
    setRefreshData(true);
    setisVisiblePopUpAjuste(false);
  };


  async function verDetalle(data) {
    console.log("data  ::> ", data);
    if (data.TipoEvento === 'H') {
      await verDetalleHHEE(data);
      await verDetalleDiaHHEE(data);
      await verDetalleAprobadoresHHEE(data);
      setisVisiblePopUpDetalleHHEE(true);
    }
    else if (data.TipoEvento === 'J') {
      await verJustificacion(data);
      await verDetalleDiaJustificacion(data);
      setisVisiblePopUpDetalleJustificacion(true);
    } else {
      verAjuste(data);
      setisVisiblePopUpDetalleAjuste(true);
    }
  }

  //DETALLE SOLICITUD HHHEE
  async function verDetalleHHEE(data) {
    setLoading(true);
    const { IdSolicitudHHEE } = data;
    await obtenerDetalle({
      IdCliente: perfil.IdCliente,
      IdPersona: varIdPersona,
      IdCompania: varIdCompania,
      IdSolicitudHHEE: IdSolicitudHHEE
    }).then(response => {

      if (isNotEmpty(response))
        setDetalle(response);
      else
        setDetalle({});

      setDataRowEditNew(response);
      console.log('RESPONSE obtenerDetalle ::> ', response);
      // setDetalle(response);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }
  async function verDetalleDiaHHEE(data) {
    setLoading(true);
    const { IdSolicitudHHEE } = data;
    await obtenerDetalleDia({
      IdCliente: perfil.IdCliente,
      IdPersona: varIdPersona,
      IdCompania: varIdCompania,
      IdSolicitudHHEE: IdSolicitudHHEE
    }).then(response => {
      if (response.length > 0)
        setDetalleDia(response);
      else
        setDetalleDia([]);

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }
  async function verDetalleAprobadoresHHEE(data) {
    setLoading(true);
    const { IdSolicitudHHEE } = data;
    await obtenerAprobadores({
      IdCliente: perfil.IdCliente,
      IdPersona: varIdPersona,
      IdCompania: varIdCompania,
      IdSolicitudHHEE: IdSolicitudHHEE
    }).then(response => {
      if (response.length > 0)
        setDetalleAprobadores(response);
      else
        setDetalleAprobadores([]);

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  //DETALLE JUSTIFICACION
  async function verJustificacion(data) {
    setLoading(true);
    const { IdJustificacion, IdSecuencialJustificacion, Fecha } = data;
    await obtenerJustificacion({
      IdCliente: perfil.IdCliente,
      IdPersona: varIdPersona,
      IdCompania: varIdCompania,
      IdJustificacion: IdJustificacion,
      IdSecuencialJustificacion: IdSecuencialJustificacion,
      Fecha: dateFormat(Fecha, "yyyyMMdd")
    }).then(response => {
      if (isNotEmpty(response))
        setDetalleJustificacion(response);
      else
        setDetalleJustificacion({});
      setDataRowEditNew(response);
      // setDetalle(response);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function verDetalleDiaJustificacion(data) {
    setLoading(true);
    const { IdJustificacion, IdSecuencialJustificacion, Fecha } = data;
    await obtenerDetalleDiaJustificacion({
      IdCliente: perfil.IdCliente,
      IdPersona: varIdPersona,
      IdCompania: varIdCompania,
      IdJustificacion: IdJustificacion,
      IdSecuencialJustificacion: IdSecuencialJustificacion,
      Fecha: dateFormat(Fecha, "yyyyMMdd")
    }).then(response => {

      if (isNotEmpty(response))
        setDetalleDiaJustificacion(response);
      else
        setDetalleDiaJustificacion([]);

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  //DETALLE AJUSTE 
  async function verAjuste(data) {
    // setLoading(true);
    setDataRowEditNew(data);

  }





  const cancelarEdicionBolsaHoras = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  useEffect(() => { 
    if (isNotEmpty(varIdPersona)) { 
      obtenerBolsaHoras(); 
      resetLoadOptions();
    }
    //setLoading(false);

  }, [varIdPersona]);

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return <>

    {!modoEdicion && (
      <>
        <PersonaBolsaHorasListPage
          seleccionarRegistro={seleccionarMarcacion}
          // editarRegistro={editarRegistroMarcacion}
          eliminarRegistro={eliminarRegistroBolsaHoras}
          // nuevoRegistro={nuevoRegistroMarcacion}
          cancelarEdicion={props.cancelarEdicion}
          getInfo={getInfo}
          accessButton={accessButton}
          focusedRowKey={focusedRowKeyMarcacion}
          // verRegistro={verRegistro}

          //=>..CustomerDataGrid
          // filterData={filterDataMarcas}
          // setFilterData={setFilterDataMarcas}
          isFirstDataLoad={isFirstDataLoad}
          setIsFirstDataLoad={setIsFirstDataLoad}
          dataSource={dataSource}
          refresh={refresh}
          resetLoadOptions={resetLoadOptions}
          refreshData={refreshData}
          setRefreshData={setRefreshData}
          varIdPersona={varIdPersona}
          varIdCompania={varIdCompania}
          ocultarEdit={ocultarEdit}
          agregarAjuste={agregarAjuste}

          saldoActual={saldoActual}
          VerDetalle={verDetalle}
          dataMenu={dataMenu}
        />
      </>
    )}

    <Confirm
      message={intl.formatMessage({ id: "ALERT.REMOVE" })}
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      setInstance={setInstance}
      onConfirm={() => eliminarRegistroBolsaHoras(selectedDelete, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />



    {isVisiblePopUpAjuste && (
      <AsistenciaAjusteBolsaHorasPopUp
        dataRowEditNew={dataRowEditNew}
        showPopup={{ isVisiblePopUp: isVisiblePopUpAjuste, setisVisiblePopUp: setisVisiblePopUpAjuste }}
        cancelar={() => setisVisiblePopUpAjuste(false)}
        grabar={grabarBolsaHoras}
      />
    )}


    {isVisiblePopUpDetalleHHEE && (
      <AsistenciaAjusteBolsaHorasDetalleHHEEPopUp
        dataRowEditNew={dataRowEditNew}
        showPopup={{ isVisiblePopUp: isVisiblePopUpDetalleHHEE, setisVisiblePopUp: setisVisiblePopUpDetalleHHEE }}
        cancelar={() => setisVisiblePopUpDetalleHHEE(false)}
        detalleDia={detalleDia}
        detalleAprobadores={detalleAprobadores}
      // grabar={grabarBolsaHoras}
      />
    )}

    {isVisiblePopUpDetalleJustificacion && (
      <AsistenciaAjusteBolsaHorasDetalleJustificacionPopUp
        dataRowEditNew={dataRowEditNew}
        showPopup={{ isVisiblePopUp: isVisiblePopUpDetalleJustificacion, setisVisiblePopUp: setisVisiblePopUpDetalleJustificacion }}
        cancelar={() => setisVisiblePopUpDetalleJustificacion(false)}
        detalleDiaJustificacion={detalleDiaJustificacion}
      // grabar={grabarBolsaHoras}
      />
    )}

    {isVisiblePopUpDetalleAjuste && (
      <AsistenciaAjusteBolsaHorasDetalleAjustePopUp
        dataRowEditNew={dataRowEditNew}
        showPopup={{ isVisiblePopUp: isVisiblePopUpDetalleAjuste, setisVisiblePopUp: setisVisiblePopUpDetalleAjuste }}
        cancelar={() => setisVisiblePopUpDetalleAjuste(false)}
      // detalleDiaJustificacion={detalleDiaJustificacion} 
      // grabar={grabarBolsaHoras}
      />
    )}


  </>
};

export default injectIntl(WithLoandingPanel(PersonaBolsaHorasIndexPage));
