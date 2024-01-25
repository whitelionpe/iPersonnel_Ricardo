import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../../partials/components/Confirm";
import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";
import {
  obtener as obtenerMarca, crear as crearMarca, actualizar as actualizarMarca, eliminar as eliminarMarca
} from "../../../../../api/acceso/marcacion.api";
import { servicePersona } from "../../../../../api/administracion/persona.api";

import PersonaMarcacionEditPage from "./PersonaMarcacionEditPage";
import PersonaMarcacionListPage from "./PersonaMarcacionListPage";

import { dateFormat, isNotEmpty } from "../../../../../../_metronic";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import CasinoMarcacionMotivoPopUp from "../../../../../partials/components/CasinoMarcacionMotivoPopUp";

export const initialFilterMarcas = {
  IdCliente: '',
  TipoMarca: 'T', //T: Persona
  FlFecha: '3', //Para obtener marcas en un rango de fecha truncadas en dias.
  FechaMarca: '',//Date((new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDate()),
  FechaInicio: new Date(),
  FechaFin: new Date()
};

const PersonaMarcacionIndexPage = (props) => {
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const { intl, setLoading, settingDataField, getInfo, accessButton, varIdPersona, selectedIndex } = props;

  const [isVisible, setIsVisible] = useState(false);
  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.EDIT" }));
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));

  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [focusedRowKey, setFocusedRowKey] = useState();
  const [selectedDelete, setSelectedDelete] = useState({});
  const [instance, setInstance] = useState({});
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);
  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();
  const [selected, setSelected] = useState({});
  const [fechasContrato, setFechasContrato] = useState({ FechaInicioContrato: null, FechaFinContrato: null });

  const [modeView, setModeView] = useState(false);
  const [isVisiblePopUpMotivo, setisVisiblePopUpMotivo] = useState(false);
  //::::::::::::::::::::::::::::::::::::::::::::: Funciones Marcación ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarMarcacion(marcacion) {
    setLoading(true);
    const {
      IdZona,
      IdPuerta,
      IdEquipo,
      IdTipoIdentificacion,
      Identificacion,
      IdTipoMarcacion,
      FechaMarca,
      Entrada,
      Automatico,
      Online,
      Motivo,
      Tipo,
      Placa,
      IdVehiculo,
      FechaRegistro
    } = marcacion;

    let params = {
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdPersona: varIdPersona,
      IdZona: IdZona,
      IdPuerta: IdPuerta,
      IdEquipo: IdEquipo,
      IdTipoIdentificacion: IdTipoIdentificacion,
      Identificacion: Identificacion,
      IdTipoMarcacion: IdTipoMarcacion,
      FechaMarca: dateFormat(FechaMarca, 'yyyyMMdd hh:mm'), //new Date(FechaMarca).toLocaleString(),
      Entrada: Entrada,
      Automatico,
      Online:Online, 
      Motivo: isNotEmpty(Motivo) ? Motivo.toUpperCase() : "",
      AccesoNegado: "N",
      Exoneracion: "N",
      Hash: "",
      IdProceso: 0,
      OrigenRegistro:"W", // Web
      Tipo: isNotEmpty(Tipo) ? Tipo : "",
      Placa: isNotEmpty(Placa) ? Placa : "",
      IdVehiculo: isNotEmpty(IdVehiculo) ? IdVehiculo : 0,
      Pasajeros: '',
      FechaRegistro: dateFormat(FechaRegistro, 'yyyyMMdd'), 
      IdUsuario: usuario.username,
    };

    await crearMarca(params).then((response) => {

      //if (response) 
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setRefreshData(true);//Actualizar CustomDataGrid
      cancelarEdicion();      

    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarMarcacion(marcacion) {
    setLoading(true);
    const {
      IdZona,
      IdPuerta,
      IdEquipo,
      IdTipoIdentificacion,
      Identificacion,
      IdTipoMarcacion,
      FechaMarca,
      Entrada,
      Automatico,
      Online,
      Motivo,
      IdSecuencial,
      Tipo,
      Placa,
      IdVehiculo,
    } = marcacion;


    let params = {
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdPersona: varIdPersona,
      IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0,
      IdZona: IdZona,
      IdPuerta: IdPuerta,
      IdEquipo: IdEquipo,
      IdTipoIdentificacion: IdTipoIdentificacion,
      Identificacion: Identificacion,
      IdTipoMarcacion: IdTipoMarcacion,
      FechaMarca: dateFormat(FechaMarca, 'yyyyMMdd hh:mm'), //new Date(FechaMarca).toLocaleString(),
      Entrada: Entrada,
      Automatico,
      Online:Online, 
      Motivo: isNotEmpty(Motivo) ? Motivo.toUpperCase() : "",
      AccesoNegado: "N",
      Exoneracion: "N",
      Hash: "",
      IdProceso: 0,
      OrigenRegistro:"W", // Web
      Tipo: isNotEmpty(Tipo) ? Tipo : "",
      Placa: isNotEmpty(Placa) ? Placa : "",
      Pasajeros: '',
      IdVehiculo: isNotEmpty(IdVehiculo) ? IdVehiculo : 0,
      IdUsuario: usuario.username,
    };

    await actualizarMarca(params).then(() => {

      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setRefreshData(true);//Actualizar CustomDataGrid
      cancelarEdicion();
    

    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  // async function eliminarMarcacion(dataRow, confirm) {
  //   setSelectedDelete(dataRow);
  //   setIsVisible(true);
  //   if (confirm) {
  //     setLoading(true);
  //     const { IdCliente, IdPersona, IdSecuencial } = dataRow;
  //     await eliminarMarca({ IdCliente, IdPersona, IdVehiculo: 0, IdSecuencial, IdProceso: '' }).then(() => {
  //       handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
  //       setRefreshData(true);
  //       cancelarEdicion();
       
  //     }).catch(err => {
  //       handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
  //     }).finally(() => { setLoading(false); });

  //   }
  // }

  async function eliminarMarcacion(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      setisVisiblePopUpMotivo(true);
    }
  }
  // string idCliente, string idProceso, int idPersona, int idSecuencial

  const confirmarEliminar = async () => {
    setLoading(true);
    const { IdCliente, IdSecuencial } = selectedDelete;
    const { Motivo } = dataRowEditNew;
    await eliminarMarca({
      IdCliente,
      IdSecuencial,
      Motivo : isNotEmpty(Motivo) ? Motivo.toUpperCase() : ""
    }).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });
    setRefreshData(true);
    setisVisiblePopUpMotivo(false);
  };

  async function obtenerMarcacion(dataRow) {
    setLoading(true);
    const { IdCliente, IdPersona, IdSecuencial } = dataRow;
    await obtenerMarca({ IdCliente, IdPersona, IdSecuencial }).then(data => {
      const { FechaMarca,Automatico } = data;
      data.Automatico = Automatico === "S" ? "S" : "N";      
      let minutos = new Date(FechaMarca);
      let fechaCorta = new Date(FechaMarca);

      setDataRowEditNew({
        ...data, esNuevoRegistro: false,
        Minutos: minutos,
        FechaCorta: fechaCorta,
      });

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const seleccionarMarcacion = async (dataRow) => {
    const { RowIndex } = dataRow;
    setSelected(dataRow);
    if (RowIndex !== focusedRowKey) {
      setFocusedRowKey(RowIndex);

    }
  }

  const nuevoMarcacion = async () => {
    setModeView(false);
    setDataRowEditNew({});
    setLoading(true);
    await servicePersona.obtenerPeriodo({
      IdCliente: perfil.IdCliente,
      IdPersona: varIdPersona,
      FechaInicio: dateFormat(new Date(), 'yyyyMMdd'),
      FechaFin: dateFormat(new Date(), 'yyyyMMdd'),
    }).then(response => {
      if (response) {
        if (!isNotEmpty(response.MensajeValidacion)) {
          setFechasContrato({ FechaInicioContrato: response.FechaInicio, FechaFinContrato: response.FechaFin });
          
          let fecInicio = parseInt(response.FechaInicio) >  parseInt(dateFormat(new Date(), 'yyyyMMdd')) ? new Date(response.FechaInicio.substring(0, 4), response.FechaInicio.substring(4, 6) - 1, response.FechaInicio.substring(6, 8)) : new Date();

          const { Documento, IdPersona } = selectedIndex
          let dateNow = new Date();
          let data = {
            IdPersona,
            Activo: "S", MarcacionWeb: "N",
            FechaCorta: fecInicio,//dateNow
            Minutos: dateNow,
            FechaRegistro: dateNow,
            Tipo: "T",
            IdVehiculo: 0,
            Placa: "",
            IdTipoIdentificacion: 'DOCIDE',
            Identificacion: Documento,
            IdTipoMarcacion:"01",
            AccesoNegado:"S"
          };
          setDataRowEditNew({ ...data, esNuevoRegistro: true, Automatico: "N",   Online:"S"});
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

  const editarMarcacion = async (dataRow, flEditar) => {
    setLoading(true);
    setModeView(false);
    await servicePersona.obtenerPeriodo({
      IdCliente: perfil.IdCliente,
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

    setTituloTabs((flEditar) ? intl.formatMessage({ id: "ACTION.EDIT" }) : intl.formatMessage({ id: "ACTION.VIEW" }));
    await obtenerMarcacion(dataRow);
    setModoEdicion(true);
  };

   const verRegistro = async (dataRow) => {
    setDataRowEditNew({});
    setModeView(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.VIEW" }));
    await obtenerMarcacion(dataRow);
    setModoEdicion(true);
  };

  const cancelarEdicion = () => {
    setDataRowEditNew({});
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setModoEdicion(false);
  };


  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return <>

    {modoEdicion && (
      <>
        <PersonaMarcacionEditPage
          dataRowEditNew={dataRowEditNew}
          actualizarMarcacion={actualizarMarcacion}
          agregarMarcacion={agregarMarcacion}
          editarRegistro={editarMarcacion}
          cancelarEdicion={cancelarEdicion}
          titulo={tituloTabs}
          accessButton={accessButton}
          modoEdicion={modoEdicion}
          settingDataField={settingDataField}
          showHeaderInformation={true}
          getInfo={getInfo}
          varIdPersona = {varIdPersona}
          fechasContrato = {fechasContrato}
          modeView = {modeView}
        />
        <div className="container_only">
          <div className="float-right">
            <ControlSwitch
              checked={auditoriaSwitch}
              onChange={(e) => {
                setAuditoriaSwitch(e.target.checked);
              }}
            />
            <b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
          </div>
        </div>
        {auditoriaSwitch && (
          <AuditoriaPage dataRowEditNew={dataRowEditNew} />
        )}
      </>
    )}

    {!modoEdicion && (
      <>
        <PersonaMarcacionListPage
          uniqueId ={"PersonaMarcacionListPage"}
          editarRegistro={editarMarcacion}
          agregarRegistro={agregarMarcacion}
          eliminarRegistro={eliminarMarcacion}
          nuevoRegistro={nuevoMarcacion}
          cancelarEdicion={props.cancelarEdicion}
          seleccionarRegistro={seleccionarMarcacion}
          focusedRowKey={focusedRowKey}
          varIdPersona={varIdPersona}
          getInfo={getInfo}

          //=>..CustomerDataGrid
          isFirstDataLoad={isFirstDataLoad}
          setIsFirstDataLoad={setIsFirstDataLoad}
          dataSource={dataSource}
          refresh={refresh}
          resetLoadOptions={resetLoadOptions}
          refreshData={refreshData}
          setRefreshData={setRefreshData}
          accessButton={accessButton}
          verRegistro={verRegistro}
        />
      </>
    )}

    <Confirm
      message={intl.formatMessage({ id: "ALERT.REMOVE" })}
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      setInstance={setInstance}
      onConfirm={() => eliminarMarcacion(selectedDelete, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />

    
{isVisiblePopUpMotivo && (
                <CasinoMarcacionMotivoPopUp
                  dataRowEditNew = {dataRowEditNew}
                  showPopup={{ isVisiblePopUp: isVisiblePopUpMotivo, setisVisiblePopUp: setisVisiblePopUpMotivo }}
                  cancelar={() => setisVisiblePopUpMotivo(false)}
                  confirmar={confirmarEliminar}
                />
        )}

  </>
};

export default injectIntl(WithLoandingPanel(PersonaMarcacionIndexPage));
