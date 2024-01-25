import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../../partials/components/Confirm";
import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";
import {
  obtener as obtenerMarca, crear as crearMarca, actualizar as actualizarMarca, eliminar as eliminarMarca, listar as listarMarcas
} from "../../../../../api/acceso/marcacion.api";
import VehiculoMarcacionEditPage from "./VehiculoMarcacionEditPage";
import VehiculoMarcacionListPage from "./VehiculoMarcacionListPage";
import { dateFormat, isNotEmpty } from "../../../../../../_metronic";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { serviceVehiculo } from "../../../../../api/administracion/vehiculo.api";
import CasinoMarcacionMotivoPopUp from "../../../../../partials/components/CasinoMarcacionMotivoPopUp";

export const initialFilterMarcas = {
  IdCliente: '',
  IdPersona: '',
  TipoMarca: 'V', //: Vehiculo
  FlFecha: '3', //Para obtener marcas en un rango de fecha truncadas en dias.
  FechaMarca: '',//Date((new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDate()),
  FechaInicio: new Date(),//new Date((new Date()).getFullYear(), (new Date()).getMonth(), 1),
  FechaFin: new Date(),//new Date((new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDate() + 26)
};

const VehiculoMarcacionIndexPage = (props) => {
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const { intl, setLoading, settingDataField, getInfo, accessButton, varIdVehiculo, selectedIndex,varIdTipoVehiculo } = props;
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
  const [dataPasajero, setDataPasajero] = useState([]);
  const [fechasContrato, setFechasContrato] = useState({ FechaInicioContrato: null, FechaFinContrato: null });

  const [modeView, setModeView] = useState(false);
  const [isVisiblePopUpMotivo, setisVisiblePopUpMotivo] = useState(false);
  //::::::::::::::::::::::::::::::::::::::::::::: Funciones Marcación ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarMarcacion(marcacion) {
    setLoading(true);
    const {
      IdPersona,
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
      Pasajeros,
      FechaRegistro
    } = marcacion;

    //Pasajero convertir es string separado por comma: 
    var strIdPersona = '';
    if (isNotEmpty(Pasajeros)) {
      strIdPersona = Pasajeros.map(x => x.IdPersona).join(',');
    }

    let params = {
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdPersona: IdPersona,
      IdSecuencial: 0,
      IdVehiculo: isNotEmpty(varIdVehiculo) ? varIdVehiculo : 0,
      IdZona: IdZona,
      IdPuerta: IdPuerta,
      IdEquipo: IdEquipo,
      IdTipoIdentificacion: IdTipoIdentificacion,
      Identificacion: Identificacion,
      IdTipoMarcacion: IdTipoMarcacion,
      FechaMarca: dateFormat(FechaMarca, 'yyyyMMdd hh:mm'), 
      Entrada: Entrada,
      Automatico,
      Online,
      Motivo: isNotEmpty(Motivo) ? Motivo.toUpperCase() : "",
      AccesoNegado: "N",
      Exoneracion: "N",
      Hash: "",
      IdProceso: '',
      OrigenRegistro:"W", // Web
      Tipo: isNotEmpty(Tipo) ? Tipo : "",
      Placa: isNotEmpty(Placa) ? Placa : "",
      Pasajeros: strIdPersona,
      FechaRegistro: dateFormat(FechaRegistro, 'yyyyMMdd'), 
      IdUsuario: usuario.username,
    };
    await crearMarca(params)
      .then((response) => {
        if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        cancelarEdicion();      
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function actualizarMarcacion(marcacion) {
    setLoading(true);
    const {
      IdZona,
      IdPuerta,
      IdEquipo,
      IdSecuencial,
      IdProceso,
      IdPersona,
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
      Pasajeros
    } = marcacion;
    //Pasajero convertir es string separado por comma: 
    var strIdPersona = '';
    if (isNotEmpty(Pasajeros)) {
      strIdPersona = Pasajeros.map(x => x.IdPersona).join(',');
    }

    let params = {
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdPersona: IdPersona,
      IdVehiculo: isNotEmpty(IdVehiculo) ? IdVehiculo : 0,
      IdSecuencial,
      IdZona: IdZona,
      IdPuerta: IdPuerta,
      IdEquipo: IdEquipo,
      IdTipoIdentificacion: IdTipoIdentificacion,
      Identificacion: Identificacion,
      IdTipoMarcacion: IdTipoMarcacion,
      FechaMarca: dateFormat(FechaMarca, 'yyyyMMdd hh:mm'),
      Entrada: Entrada,
      Automatico, 
      Online,
      Motivo: isNotEmpty(Motivo) ? Motivo.toUpperCase() : "",
      AccesoNegado: "N",
      Exoneracion: "N",
      Hash: "",
      IdProceso,
      OrigenRegistro:"W", // Web
      Tipo: isNotEmpty(Tipo) ? Tipo : "",
      Placa: isNotEmpty(Placa) ? Placa : "",
      Pasajeros: strIdPersona,
      IdUsuario: usuario.username,
    };
    await actualizarMarca(params)
      .then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
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
  //     const { IdCliente, IdProceso, IdSecuencial } = selectedDelete;
  //     await eliminarMarca({ IdCliente, IdProceso, IdSecuencial }).then(() => {
  //       handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
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
    const { IdCliente, IdPersona, IdVehiculo, IdSecuencial, IdProceso } = dataRow;
    //-->Obtener marcas relacionado a un proceso.    
    await listarMarcas({ IdCliente, IdPersona: 0, IdVehiculo, IdSecuencial, IdProceso }).then(data => {
      setDataPasajero(data);
    })
    await obtenerMarca({ IdCliente, IdPersona, IdVehiculo, IdSecuencial }).then(data => {
      //  console.log("obtenerMarca|data:",data);
      const { FechaMarca, Online, Automatico } = data; 
      let minutos = new Date(FechaMarca);
      let fechaCorta = new Date(FechaMarca);
      setDataRowEditNew({
        ...data, esNuevoRegistro: false,
        Online,
        Automatico,
        Minutos: minutos,
        FechaCorta: fechaCorta,
      });

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const seleccionarMarcacion = async (dataRow) => {
    const { RowIndex } = dataRow;
    if (RowIndex !== focusedRowKey) {
      setFocusedRowKey(RowIndex);
    }
  }


  const nuevoMarcacion = async () => {
    setModeView(false);
    setDataRowEditNew({});
    setLoading(true);
    await serviceVehiculo.obtenerPeriodo({
      IdCliente: perfil.IdCliente,
      IdVehiculo: varIdVehiculo,
      FechaInicio: dateFormat(new Date(), 'yyyyMMdd'),
      FechaFin: dateFormat(new Date(), 'yyyyMMdd'),
    }).then(response => {
      if (response) {
        if (!isNotEmpty(response.MensajeValidacion)) {
          setFechasContrato({ FechaInicioContrato: response.FechaInicio, FechaFinContrato: response.FechaFin });
          
          let fecInicio = parseInt(response.FechaInicio) >  parseInt(dateFormat(new Date(), 'yyyyMMdd')) ? new Date(response.FechaInicio.substring(0, 4), response.FechaInicio.substring(4, 6) - 1, response.FechaInicio.substring(6, 8)) : new Date();
          let dateNow = new Date();
          let data = {
            Activo: "S", MarcacionWeb: "N",
            FechaCorta: fecInicio,//dateNow
            Minutos: dateNow,
            FechaRegistro: dateNow,
            Tipo: "V",
            IdVehiculo: varIdVehiculo,
            Placa: "",
            IdTipoIdentificacion: 'DOCIDE',
            Entrada:"S",
            IdTipoMarcacion:"01"
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
    setModeView(false);
    setLoading(true);
    setDataRowEditNew({});
    await serviceVehiculo.obtenerPeriodo({
      IdCliente: perfil.IdCliente,
      IdVehiculo: varIdVehiculo,
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
    setModeView(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.VIEW" }));
    await obtenerMarcacion(dataRow);
    setModoEdicion(true);
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    setDataPasajero([]);
    setRefreshData(true);//Actualizar CustomDataGrid

  };


  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return <>

    {modoEdicion && (
      <>
        <VehiculoMarcacionEditPage
          dataRowEditNew={dataRowEditNew}
          actualizarMarcacion={actualizarMarcacion}
          agregarMarcacion={agregarMarcacion}
          editarRegistro={editarMarcacion}
          cancelarEdicion={cancelarEdicion}
          titulo={tituloTabs}
          dataPasajero={dataPasajero}
          varIdVehiculo = {varIdVehiculo}
          varIdTipoVehiculo={varIdTipoVehiculo}
          accessButton={accessButton}
          modoEdicion={modoEdicion}
          settingDataField={settingDataField}
          showHeaderInformation={true}
          getInfo={getInfo}
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
        <VehiculoMarcacionListPage
          editarRegistro={editarMarcacion}
          agregarRegistro={agregarMarcacion}
          eliminarRegistro={eliminarMarcacion}
          verRegistro ={verRegistro}
          nuevoRegistro={nuevoMarcacion}
          cancelarEdicion={props.cancelarEdicion}
          seleccionarRegistro={seleccionarMarcacion}
          focusedRowKey={focusedRowKey}
          varIdVehiculo={varIdVehiculo}
          getInfo={getInfo}

          isFirstDataLoad={isFirstDataLoad}
          setIsFirstDataLoad={setIsFirstDataLoad}
          dataSource={dataSource}
          refresh={refresh}
          resetLoadOptions={resetLoadOptions}
          refreshData={refreshData}
          setRefreshData={setRefreshData}
          accessButton={accessButton}
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

export default injectIntl(WithLoandingPanel(VehiculoMarcacionIndexPage));
