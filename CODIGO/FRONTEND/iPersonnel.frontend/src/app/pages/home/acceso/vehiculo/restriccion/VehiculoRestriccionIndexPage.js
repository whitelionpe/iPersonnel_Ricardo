import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import { isNotEmpty, dateFormat } from "../../../../../../_metronic";

import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../../partials/components/Confirm";

import {
  handleErrorMessages,
  handleInfoMessages,
  handleSuccessMessages,
} from "../../../../../store/ducks/notify-messages";
import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";
import {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar
} from "../../../../../api/acceso/vehiculoRestriccion.api";
import VehiculoRestriccionEditPage from "../../vehiculo/restriccion/VehiculoRestriccionEditPage";
import VehiculoRestriccionListPage from "../../vehiculo/restriccion/VehiculoRestriccionListPage";
import { uploadFile } from "../../../../../api/helpers/fileBase64.api";
import { serviceVehiculo } from "../../../../../api/administracion/vehiculo.api";

const VehiculoRestriccionIndexPage = (props) => {
  const { intl, setLoading, getInfo, accessButton, settingDataField, varIdVehiculo, cancelarEdicion, idAplicacion, idMenu, idModulo } = props;
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  const [listarTabs, setListarTabs] = useState([]);
  const [focusedRowKey, setFocusedRowKey] = useState(0);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [, setInstance] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});
  const [fechasContrato, setFechasContrato] = useState({ FechaInicioContrato: null, FechaFinContrato: null });

  /**VEHÍCULO RESTRICCIÓN ************************************************/

  async function listarRestriccion() {
    setLoading(true);
    setModoEdicion(false);
    await listar({
      IdCliente: IdCliente,
      IdVehiculo: varIdVehiculo,
    }).then(vehiculoRestricciones => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(vehiculoRestricciones);
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  async function agregarRestriccion(restriccion) {
    const {
      IdSecuencial,
      IdRestriccion,
      FechaInicio,
      FechaFin,
      HoraInicio,
      HoraFin,
      FlgDiaCompleto, NombreArchivo, FileBase64, FechaArchivo, Restriccion
    } = restriccion;
    let params = {
      IdCliente: IdCliente,
      IdRestriccion: isNotEmpty(IdRestriccion) ? IdRestriccion : "",
      IdVehiculo: varIdVehiculo,
      IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0,
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : "",
      HoraInicio: isNotEmpty(HoraInicio) ? dateFormat(HoraInicio, "hh:mm") : "",
      HoraFin: isNotEmpty(HoraFin) ? dateFormat(HoraFin, "hh:mm") : "",
      FlgDiaCompleto: isNotEmpty(FlgDiaCompleto) ? FlgDiaCompleto : "",
      FileBase64: isNotEmpty(FileBase64) ? FileBase64 : "",
      NombreArchivo: isNotEmpty(NombreArchivo) ? NombreArchivo : "",
      IdItemSharepoint: "",
      ClaseArchivo: isNotEmpty(Restriccion) ? Restriccion : "",
      FechaArchivo: isNotEmpty(FechaArchivo) ? dateFormat(FechaArchivo, 'yyyyMMdd') : "",
      IdUsuario: usuario.username,
      PathFile: "",
      IdModulo: idModulo,
      IdAplicacion: idAplicacion,
      IdMenu: idMenu
    };

    if (isNotEmpty(FileBase64)) {
      setLoading(true);
      await uploadFile(params).then(response => {
        //Recuperar Nombre archivo.
        const { nombreArchivo, idItemSharepoint } = response;
        params.NombreArchivo = nombreArchivo;
        params.IdItemSharepoint = idItemSharepoint;

        crear(params)
          .then((response) => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            listarRestriccion();
          })
          .catch((err) => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
          }).finally(() => { setLoading(false); });
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    } else {
      await crear(params)
        .then((response) => {
          if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
          listarRestriccion();
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }
  }

  async function actualizarRestriccion(restriccion) {
    const {
      IdCliente,
      IdVehiculo,
      IdRestriccion,
      IdSecuencial,
      FechaInicio,
      FechaFin,
      HoraInicio,
      HoraFin,
      FlgDiaCompleto, NombreArchivo, FileBase64, FechaArchivo, Restriccion,IdItemSharepoint
    } = restriccion;
    let params = {
      IdCliente: IdCliente,
      IdRestriccion: IdRestriccion,
      IdVehiculo: IdVehiculo,
      IdSecuencial: IdSecuencial,
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : "",
      HoraInicio: isNotEmpty(HoraInicio) ? dateFormat(HoraInicio, "hh:mm") : "",
      HoraFin: isNotEmpty(HoraFin) ? dateFormat(HoraFin, "hh:mm") : "",
      FlgDiaCompleto: isNotEmpty(FlgDiaCompleto) ? FlgDiaCompleto : "",
      FileBase64: isNotEmpty(FileBase64) ? FileBase64 : "",
      NombreArchivo: isNotEmpty(NombreArchivo) ? NombreArchivo : "",
      IdItemSharepoint: isNotEmpty(IdItemSharepoint) ? IdItemSharepoint : "",
      ClaseArchivo: isNotEmpty(Restriccion) ? Restriccion : "",
      FechaArchivo: isNotEmpty(FechaArchivo) ? dateFormat(FechaArchivo, 'yyyyMMdd') : "",
      IdUsuario: usuario.username,
      PathFile: "",
      IdModulo: idModulo,
      IdAplicacion: idAplicacion,
      IdMenu: idMenu,
    };

    if (isNotEmpty(FileBase64)) {
      setLoading(true);
      await uploadFile(params).then(response => {
        //Recuperar Nombre archivo.
        const { nombreArchivo, idItemSharepoint } = response;
        params.NombreArchivo = nombreArchivo;
        params.IdItemSharepoint = idItemSharepoint;

        actualizar(params)
          .then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            listarRestriccion();
          }).catch((err) => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
          }).finally(() => { setLoading(false) });
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    } else {
      setLoading(true);
      await actualizar(params)
        .then(() => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
          listarRestriccion();
        }).catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false) });
    }

  }

  async function eliminarRegistro(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const {
        IdCliente,
        IdRestriccion,
        IdVehiculo,
        IdSecuencial,
      } = selectedDelete;
      await eliminar({
        IdCliente: IdCliente,
        IdRestriccion: IdRestriccion,
        IdVehiculo: IdVehiculo,
        IdSecuencial: IdSecuencial
      })
        .then(() => {
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
          );
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
      listarRestriccion();
    }
  }

  async function obtenerRestriccion(dataRow) {
    setLoading(true);
    const {
      IdCliente,
      IdRestriccion,
      IdVehiculo,
      IdSecuencial,
    } = dataRow;
    await obtener({
      IdCliente: IdCliente,
      IdRestriccion: IdRestriccion,
      IdVehiculo: IdVehiculo,
      IdSecuencial: IdSecuencial
    }).then(restriccion => {
      console.log("obtenerRestriccion|restriccion:", restriccion);
      setDataRowEditNew({ ...restriccion, esNuevoRegistro: false });
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const seleccionarRegistro = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
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

          let fecInicio = parseInt(response.FechaInicio) > parseInt(dateFormat(new Date(), 'yyyyMMdd')) ? new Date(response.FechaInicio.substring(0, 4), response.FechaInicio.substring(4, 6) - 1, response.FechaInicio.substring(6, 8)) : new Date();
          let fecFin = new Date(response.FechaFin.substring(0, 4), response.FechaFin.substring(4, 6) - 1, response.FechaFin.substring(6, 8));
          let nuevo = { Activo: "S", FechaInicio: fecInicio, FechaFin: fecFin, HoraInicio: '2020-01-01 00:00:00.000', HoraFin: '2020-01-01 23:59:00.000' };
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
    await obtenerRestriccion(dataRow);
    setModoEdicion(true);
  };


  const cancelarEdicionRestriccion = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  useEffect(() => {
    listarRestriccion();
  }, []);

  return <>

    {modoEdicion && (
      <>
        <VehiculoRestriccionEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarRestriccion={actualizarRestriccion}
          agregarRestriccion={agregarRestriccion}
          cancelarEdicion={cancelarEdicionRestriccion}
          titulo={titulo}
          accessButton={accessButton}
          settingDataField={settingDataField}
          varIdVehiculo={varIdVehiculo}
          showHeaderInformation={true}
          getInfo={getInfo}
          setLoading={setLoading}
          idModulo={idModulo}
          idAplicacion={idAplicacion}
          idMenu={idMenu}
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
        <VehiculoRestriccionListPage
          vehiculoRestricciones={listarTabs}
          editarRegistro={editarRegistro}
          eliminarRegistro={eliminarRegistro}
          nuevoRegistro={nuevoRegistro}
          seleccionarRegistro={seleccionarRegistro}
          focusedRowKey={focusedRowKey}
          accessButton={accessButton}
          getInfo={getInfo}
          cancelarEdicion={cancelarEdicion}
          idModulo={idModulo}
          idAplicacion={idAplicacion}
          idMenu={idMenu}
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



export default injectIntl(WithLoandingPanel(VehiculoRestriccionIndexPage));
