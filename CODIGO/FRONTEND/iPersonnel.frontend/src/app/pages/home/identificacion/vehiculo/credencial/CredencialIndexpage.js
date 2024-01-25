import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import { isNotEmpty, dateFormat } from "../../../../../../_metronic";

//import { useStylesEncabezado, useStylesTab } from "../../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../../partials/components/Confirm";

import {
  handleErrorMessages,
  handleSuccessMessages,
  handleInfoMessages,
  handleWarningMessages,
} from "../../../../../store/ducks/notify-messages";

import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";

import {
  serviceVehiculoCredencial
  // listar,
  // obtener,
  // crear,
  // actualizar,
  // eliminar
} from "../../../../../api/identificacion/vehiculoCredencial.api";

import CredencialEditPage from "../../vehiculo/credencial/CredencialEditPage";
import CredencialListPage from "../../vehiculo/credencial/CredencialListPage";
import { obtener as obtenerConfigM } from "../../../../../api/sistema/configuracionModulo.api";
import { serviceVehiculo } from "../../../../../api/administracion/vehiculo.api";

const CredencialIndexpage = (props) => {
  const { intl, setLoading, getInfo, accessButton, settingDataField, varIdVehiculo, foto, cancelarEdicion, selectedIndex, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  const [listarTabs, setListarTabs] = useState([]);
  const [focusedRowKey, setFocusedRowKey] = useState(0);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  //const [selected, setSelected] = useState({});

  const [isVisible, setIsVisible] = useState(false);
  const [confirmarImpresion, setConfirmarImpresion] = useState(false);

  const [instance, setInstance] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});

  //const [requisitoHistorialData, setCredencialHistorialData] = useState([]);
  const [maxFechaFin, setMaxFechaFin] = useState("N");


  const [fechasContrato, setFechasContrato] = useState({ FechaInicioContrato: null, FechaFinContrato: null });

  /**VEHICULO REQUISITO***************************************************/

  const listarCredencial = async () => {
    setLoading(true);
    setModoEdicion(false);
    await serviceVehiculoCredencial.listar({
      IdCliente: IdCliente,
      IdVehiculo: varIdVehiculo,
    }).then(vehiculosCredencial => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(vehiculosCredencial);
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const agregarCredencial = async (datos) => {
    const {
      Credencial,
      IdMotivo,
      IdTipoCredencial,
      FechaInicio,
      FechaFin,
      Impreso,
      FechaImpreso,
      CodigoReferencia,
      Observacion,
      Activo,
    } = datos;

    let params = {
      IdCliente,
      IdVehiculo: varIdVehiculo,
      IdSecuencial: 0,
      Credencial: isNotEmpty(Credencial) ? Credencial.toUpperCase() : "",
      IdMotivo,
      IdTipoCredencial,
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : "",
      Impreso: 'N',//Impreso no por defecto!
      FechaImpreso: isNotEmpty(FechaImpreso) ? dateFormat(FechaImpreso, 'yyyyMMdd') : "",
      CodigoReferencia: isNotEmpty(CodigoReferencia) ? CodigoReferencia.toUpperCase() : "",
      Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : "",
      Activo,
      IdUsuario: usuario.username,
    };
    setLoading(true);
    await serviceVehiculoCredencial.crear(params)
      .then((response) => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        listarCredencial();
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  const actualizarCredencial = async (datos, print = 'N') => {
    if (print === 'S') {
      setSelectedDelete(datos);
      setConfirmarImpresion(true);
      return;
    }
    const {
      IdCliente,
      IdVehiculo,
      IdSecuencial,
      Credencial,
      IdMotivo,
      IdTipoCredencial,
      FechaInicio,
      FechaFin,
      Impreso,
      FechaImpreso,
      CodigoReferencia,
      Observacion,
      Activo,
    } = datos;

    let params = {
      IdCliente,
      IdVehiculo,
      IdSecuencial,
      Credencial: isNotEmpty(Credencial) ? Credencial.toUpperCase() : "",
      IdMotivo,
      IdTipoCredencial,
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : "",
      Impreso,
      FechaImpreso: isNotEmpty(FechaImpreso) ? dateFormat(FechaImpreso, 'yyyyMMdd') : "",
      CodigoReferencia: isNotEmpty(CodigoReferencia) ? CodigoReferencia.toUpperCase() : "",
      Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : "",
      Activo,
      IdUsuario: usuario.username,
    };
    setLoading(true);
    await serviceVehiculoCredencial.actualizar(params)
      .then((response) => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        listarCredencial()
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });

  }

  async function actualizarImpresion(datos) {

    const {
      IdCliente,
      IdVehiculo,
      IdSecuencial,
      Credencial,
      IdMotivo,
      IdTipoCredencial,
      FechaInicio,
      FechaFin,
      Impreso,
      FechaImpreso,
      CodigoReferencia,
      Observacion,
      Activo,
    } = datos;

    let params = {
      IdCliente,
      IdVehiculo,
      IdSecuencial,
      Credencial: isNotEmpty(Credencial) ? Credencial.toUpperCase() : "",
      IdMotivo,
      IdTipoCredencial,
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : "",
      Impreso: 'S',
      FechaImpreso: isNotEmpty(FechaImpreso) ? dateFormat(FechaImpreso, 'yyyyMMdd') : "",
      CodigoReferencia: isNotEmpty(CodigoReferencia) ? CodigoReferencia.toUpperCase() : "",
      Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : "",
      Activo,
      IdUsuario: usuario.username,
    };
    setLoading(true);
    await serviceVehiculoCredencial.actualizar(params)
      .then((response) => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        listarCredencial()
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });

  }

  async function eliminarRegistro(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      const {
        IdCliente,
        IdVehiculo,
        IdSecuencial,
      } = selectedDelete;
      await serviceVehiculoCredencial.eliminar({
        IdCliente: IdCliente,
        IdVehiculo: IdVehiculo,
        IdSecuencial: IdSecuencial,
        IdUsuario: usuario.username,
      })
        .then(() => {
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
          );
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        });
      listarCredencial();
    }
  }

  async function obtenerCredencial(dataRow) {
    const {
      IdCliente,
      IdVehiculo,
      IdSecuencial,
    } = dataRow;
    if (IdVehiculo) {
      let data = await serviceVehiculoCredencial.obtener({
        IdCliente,
        IdVehiculo,
        IdSecuencial,
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }
  }

  const seleccionarRegistro = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };

  const editarRegistro = async (dataRow) => {

    setLoading(true);
    // Valida Si tiene un contrato vigente
    await serviceVehiculo.obtenerPeriodo({
      IdCliente: IdCliente,
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

    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerCredencial(dataRow);
    setModoEdicion(true);

  };

  // const nuevoRegistroTabs = () => {
  //   let hoy = new Date();
  //   let fecInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  //   let nuevo = { Activo: "S", Impreso: "N", FechaInicio: fecInicio,Credencial:"(AUTOGENERADO)" };
  //   setDataRowEditNew({
  //     ...nuevo,
  //     esNuevoRegistro: true,
  //   });
  //   setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
  //   setModoEdicion(true);
  // };

  const nuevoRegistro = async () => {
    setLoading(true);
    setDataRowEditNew({});
    // Valida Si tiene un contrato vigente
    await serviceVehiculo.obtenerPeriodo({
      IdCliente: IdCliente,
      IdVehiculo: varIdVehiculo,
      FechaInicio: dateFormat(new Date(), 'yyyyMMdd'),
      FechaFin: dateFormat(new Date(), 'yyyyMMdd'),
    }).then(response => {
      if (response) {
        if (!isNotEmpty(response.MensajeValidacion)) {

          setFechasContrato({ FechaInicioContrato: response.FechaInicio, FechaFinContrato: response.FechaFin });

          let arr_activos = listarTabs.filter(x => x.Activo == 'S');
          if (arr_activos.length > 0) {
            handleWarningMessages(intl.formatMessage({ id: "IDENTIFICATION.VEHICLE.VALIDATE.MESSAGE" }));
            return false;
          }else
          {
            
            let fecInicio = parseInt(response.FechaInicio) >  parseInt(dateFormat(new Date(), 'yyyyMMdd')) ? new Date(response.FechaInicio.substring(0, 4), response.FechaInicio.substring(4, 6) - 1, response.FechaInicio.substring(6, 8)) : new Date();
            let fecFin = new Date(response.FechaFin.substring(0, 4), response.FechaFin.substring(4, 6) - 1, response.FechaFin.substring(6, 8));
            let nuevo = { Activo: "S", Impreso: 'N', FechaInicio: fecInicio , FechaFin:fecFin, Credencial:intl.formatMessage({ id: "COMMON.CODE.AUTO" })};
            setDataRowEditNew({
              ...nuevo,
              esNuevoRegistro: true,
              isReadOnly: false,
              IdVehiculo: 0,
            });
            setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
            setModoEdicion(true);
          }
        


        } else {
          setFechasContrato({ FechaInicioContrato: null, FechaFinContrato: null });
          handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), response.MensajeValidacion);
        }
      }
    }).finally(x => {
      setLoading(false);
    });

    setLoading(false);
  }

  const cancelarEdicionCredencial = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  async function obtenerConfiguracionParameters() {
    setLoading(true);
    await obtenerConfigM({
      IdCliente: IdCliente,
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdConfiguracion: "MAXFECHAFIN"
    }).then(data => {
      const { Valor1 } = data;
      setMaxFechaFin(Valor1);
      console.log("valo1", Valor1);
    }).catch(err => { }).finally(() => { setLoading(false); });
  }


  useEffect(() => {
    listarCredencial();
    obtenerConfiguracionParameters();
  }, []);

  return <>

    {modoEdicion && (
      <>
        <CredencialEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarCredencial={actualizarCredencial}
          agregarCredencial={agregarCredencial}
          cancelarEdicion={cancelarEdicionCredencial}
          titulo={titulo}
          accessButton={accessButton}
          settingDataField={settingDataField}
          varIdVehiculo={varIdVehiculo}
          foto={foto}
          showHeaderInformation={true}
          getInfo={getInfo}
          selectedIndex={selectedIndex}
          maxFechaFinObj={maxFechaFin}

          fechasContrato={fechasContrato}

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
        <CredencialListPage
          vehiculosCredencial={listarTabs}
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

    <Confirm
      message={intl.formatMessage({ id: "IDENTIFICATION.PHOTOCHECK.PRINT.CONFIRM" })}
      isVisible={confirmarImpresion}
      setIsVisible={setConfirmarImpresion}
      setInstance={setInstance}
      onConfirm={() => actualizarImpresion(selectedDelete)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />

  </>

};


export default injectIntl(WithLoandingPanel(CredencialIndexpage));
