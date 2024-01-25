import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { isNotEmpty, dateFormat } from "../../../../../../_metronic";
import { handleErrorMessages, handleInfoMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
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
} from "../../../../../api/acceso/vehiculoExoneracion.api";
import VehiculoExoneracionListPage from "../../vehiculo/exoneracion/VehiculoExoneracionListPage";
import VehiculoExoneracionEditPage from "../../vehiculo/exoneracion/VehiculoExoneracionEditPage";
import { serviceVehiculo } from "../../../../../api/administracion/vehiculo.api";

const VehiculoExoneracionIndexPage = (props) => {
  const { intl, setLoading, getInfo, accessButton, settingDataField, varIdVehiculo, cancelarEdicion } = props;
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


  /**VEHICULO EXONERACIÓN***************************************************/

  async function agregarExoneracion(exoneracion) {
    const { IdExoneracion, FechaInicio, FechaFin, Observacion, IdSecuencial } = exoneracion;

    let params = {
      IdCliente: IdCliente,
      IdVehiculo: varIdVehiculo,
      IdExoneracion: isNotEmpty(IdExoneracion) ? IdExoneracion : "",
      IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0,
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
      });
  }

  async function actualizarExoneracion(exoneracion) {
    const { IdCliente,IdVehiculo,IdExoneracion,IdSecuencial, FechaInicio, FechaFin, Observacion } = exoneracion;
    let params = {
      IdCliente: IdCliente,
      IdVehiculo: IdVehiculo,
      IdExoneracion: IdExoneracion,
      IdSecuencial: IdSecuencial,
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
      });
  }

  async function eliminarRegistro(exoneracion, confirm) {
    setSelectedDelete(exoneracion);
    setIsVisible(true);
    if (confirm) {
      const { IdCliente, IdVehiculo,IdExoneracion, IdSecuencial } = selectedDelete;
      await eliminar({
        IdCliente:IdCliente,
        IdVehiculo:IdVehiculo,
        IdExoneracion:IdExoneracion,
        IdSecuencial : IdSecuencial,
        IdUsuario: usuario.username,
      })
        .then((response) => {
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
          );
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        });
      listarExoneracion();
    }
  }

  async function listarExoneracion() {
    setLoading(true);
    setModoEdicion(false);
    await listar({
      IdCliente: IdCliente,
      IdVehiculo: varIdVehiculo,
      NumPagina: 0,
      TamPagina: 0,
    }).then(vehiculosExoneracion => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(vehiculosExoneracion);
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  async function obtenerExoneracion(filtro) {
    const { IdCliente, IdVehiculo,IdExoneracion, IdSecuencial } = filtro;
    if (IdSecuencial) {
      let vehiculoExoneracion = await obtener({
        IdCliente : IdCliente,
        IdVehiculo : IdVehiculo,
        IdExoneracion : IdExoneracion,
        IdSecuencial : IdSecuencial ,
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
      setDataRowEditNew({
        ...vehiculoExoneracion,
        esNuevoRegistro: false,
      });
    }
  }


  const seleccionarRegistro= (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };

  const cancelarEdicionExoneracion = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const nuevoRegistro = async () => {
    setDataRowEditNew({});
    setLoading(true);
    await serviceVehiculo.obtenerPeriodo({
      IdCliente: IdCliente,
      IdVehiculo: varIdVehiculo,
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
    obtenerExoneracion(dataRow);
    setModoEdicion(true);

  };


  useEffect(() => {
    listarExoneracion();
  }, []);

  return <>

    {modoEdicion && (
      <>
        <VehiculoExoneracionEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarExoneracion={actualizarExoneracion}
          agregarExoneracion={agregarExoneracion}
          cancelarEdicion={cancelarEdicionExoneracion}
          titulo={titulo}
          accessButton={accessButton}
          settingDataField={settingDataField}
          varIdVehiculo={varIdVehiculo}
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
        <VehiculoExoneracionListPage
          vehiculosExoneracion={listarTabs}
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



export default injectIntl(WithLoandingPanel(VehiculoExoneracionIndexPage));
