import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { isNotEmpty, dateFormat } from "../../../../../../_metronic";
import { useStylesEncabezado, useStylesTab } from "../../../../../store/config/Styles";
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
  serviceAccesoVehiculoPerfil
} from "../../../../../api/acceso/vehiculoPerfil.api";
import { serviceVehiculo } from "../../../../../api/administracion/vehiculo.api";

import PerfilEditPage from "../../vehiculo/perfil/PerfilEditPage";
import PerfilListPage from "../../vehiculo/perfil/PerfilListPage";

const PerfilIndexPage = (props) => {
  const { intl, setLoading, getInfo, accessButton, settingDataField, varIdVehiculo, cancelarEdicion } = props;
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);


  const [listarTabs, setListarTabs] = useState([]);
  const [focusedRowKey, setFocusedRowKey] = useState();

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [selected, setSelected] = useState({});

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});
  const [fechasContrato, setFechasContrato] = useState({ FechaInicioContrato: null, FechaFinContrato: null });

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-Perfil-Vehiculo:::::::::::::::::::::::::::::::::

  async function listarPerfil() {
    setModoEdicion(false);
    let perfiles = await serviceAccesoVehiculoPerfil.listar({
      IdVehiculo: varIdVehiculo,
      IdPerfil: '%',
      IdSecuencial: 0,
      NumPagina:0,
      TamPagina:0
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setListarTabs(perfiles);
  }

  async function agregarPerfil(dataRow) {
    setLoading(true);
    const { IdPerfil, IdSecuencial, FechaInicio, FechaFin, Activo } = dataRow;
    let params = {
      IdVehiculo: varIdVehiculo,
      IdPerfil: IdPerfil,
      IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0,
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : "",
      Activo: Activo,
      IdUsuario: usuario.username,
    };
    await serviceAccesoVehiculoPerfil.crear(params)
      .then((response) => {
        if (response)
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
          );
        listarPerfil();
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function actualizarPerfil(dataRow) {
    setLoading(true);
    const { IdCliente, IdVehiculo, IdPerfil, IdSecuencial, FechaInicio, FechaFin, Activo } = dataRow;
    let params = {
      IdCliente: IdCliente,
      IdVehiculo: IdVehiculo,
      IdPerfil: IdPerfil,
      IdSecuencial: IdSecuencial,
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : "",
      Activo: Activo,
      IdUsuario: usuario.username,
    };
    await serviceAccesoVehiculoPerfil.actualizar(params)
      .then(() => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
        );
        listarPerfil();
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
      const { IdCliente, IdVehiculo, IdPerfil, IdSecuencial } = selectedDelete;
      await serviceAccesoVehiculoPerfil.eliminar({
        IdCliente: IdCliente,
        IdVehiculo: IdVehiculo,
        IdPerfil: IdPerfil,
        IdSecuencial: IdSecuencial
      })
        .then((response) => {
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
          );
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
        listarPerfil();
    }
  }

  async function obtenerPerfil(dataRow) {
    const { IdCliente, IdVehiculo, IdPerfil, IdSecuencial } = dataRow;
    if (IdVehiculo) {
      let perfiles = await serviceAccesoVehiculoPerfil.obtener({
        IdCliente: IdCliente,
        IdVehiculo: IdVehiculo,
        IdPerfil: IdPerfil,
        IdSecuencial: IdSecuencial
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
      setDataRowEditNew({ ...perfiles, esNuevoRegistro: false });
    }
  }

  const seleccionarRegistro = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
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
    await obtenerPerfil(dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setModoEdicion(true);
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

  const cancelarEdicionPerfil = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  useEffect(() => {
    listarPerfil();
  }, []);

  return <>

    {modoEdicion && (
      <>
        <PerfilEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarPerfil={actualizarPerfil}
          agregarPerfil={agregarPerfil}
          cancelarEdicion={cancelarEdicionPerfil}
          titulo={titulo}
          accessButton={accessButton}
          settingDataField={settingDataField}
          showHeaderInformation={true}
          getInfo={getInfo}
          setDataRowEditNew={setDataRowEditNew}
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
        <PerfilListPage
          dsPerfil={listarTabs}
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
export default injectIntl(WithLoandingPanel(PerfilIndexPage));
