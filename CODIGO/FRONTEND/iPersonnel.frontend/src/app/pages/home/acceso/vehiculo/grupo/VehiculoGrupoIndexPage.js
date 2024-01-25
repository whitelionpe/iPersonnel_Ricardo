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
} from "../../../../../api/acceso/vehiculoGrupo.api";
import VehiculoGrupoListPage from "../../vehiculo/grupo/VehiculoGrupoListPage";
import VehiculoGrupoEditPage from "../../vehiculo/grupo/VehiculoGrupoEditPage";
import { serviceVehiculo } from "../../../../../api/administracion/vehiculo.api";

const VehiculoGrupoIndexPage = (props) => {
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

  /**VEHÍCULO GRUPO ******************************************************/

  async function listarGrupo() {
    setLoading(true);
    setModoEdicion(false);
    await listar({
      IdDivision: IdDivision,
      IdCliente: IdCliente,
      IdVehiculo: varIdVehiculo,
    }).then(grupos => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(grupos);
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function agregarGrupo(grupo) {
    const { IdGrupo, FechaInicio, FechaFin, IdSecuencial } = grupo;
    let params = {
      IdCliente: IdCliente,
      IdDivision: IdDivision,
      IdVehiculo: varIdVehiculo,
      IdSecuencial: 0,
      IdGrupo: isNotEmpty(IdGrupo) ? IdGrupo : "",
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio,'yyyyMMdd')  : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin,'yyyyMMdd') : "",
      IdUsuario: usuario.username,
    };
    await crear(params)
      .then((response) => {
        if (response)
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
          );
        listarGrupo();
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
  }

  async function actualizarGrupo(dataRow) {
    setLoading(true);
    const { IdCliente,IdDivision, IdVehiculo,IdSecuencial,IdGrupo, FechaInicio, FechaFin } = dataRow;
    let params = {
      IdCliente : IdCliente ,
      IdDivision: IdDivision,
      IdVehiculo: IdVehiculo,
      IdSecuencial: IdSecuencial,
      IdGrupo: isNotEmpty(IdGrupo) ? IdGrupo : "",
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio,'yyyyMMdd')  : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin,'yyyyMMdd') : "",
      IdUsuario: usuario.username,
    };
    await actualizar(params)
      .then(() => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
        );
        listarGrupo();
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro(grupo, confirm) {
    setSelectedDelete(grupo);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdDivision,IdVehiculo, IdGrupo,IdSecuencial  } = selectedDelete;
      await eliminar({
        IdCliente : IdCliente,
        IdDivision :  IdDivision,
        IdVehiculo : IdVehiculo,
        IdGrupo : IdGrupo,
        IdSecuencial :  IdSecuencial,
      })
        .then(() => {
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
          );
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
      listarGrupo();
    }
  }

  async function obtenerGrupo(filtro) {
    setLoading(true);
    const { IdCliente, IdDivision, IdVehiculo,IdGrupo, IdSecuencial } = filtro;
    await obtener({
      IdCliente : IdCliente,
      IdDivision : IdDivision,
      IdVehiculo : IdVehiculo,
      IdGrupo : IdGrupo,
      IdSecuencial : IdSecuencial,
    }).then(grupo => {
      setDataRowEditNew({ ...grupo, esNuevoRegistro: false });
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  const seleccionarRegistro = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };

  const cancelarEdicionGrupo = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const nuevoRegistro = async () => {
    setLoading(true);
    setDataRowEditNew({});
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
            esNuevoRegistro: true
          });
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
    await obtenerGrupo(dataRow);
    setModoEdicion(true);
  };

  useEffect(() => {
    listarGrupo();
  }, []);

  return <>

    {modoEdicion && (
      <>
        <VehiculoGrupoEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarGrupo={actualizarGrupo}
          agregarGrupo={agregarGrupo}
          cancelarEdicion={cancelarEdicionGrupo}
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
        <VehiculoGrupoListPage
          vehiculoGrupos={listarTabs}
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



export default injectIntl(WithLoandingPanel(VehiculoGrupoIndexPage));
