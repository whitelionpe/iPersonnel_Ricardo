import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import { isNotEmpty, dateFormat } from "../../../../../../_metronic";

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
  listar ,
  obtener ,
  crear ,
  actualizar ,
  eliminar ,
} from "../../../../../api/administracion/vehiculoCaracteristica.api";

import VehiculoCaracteristicasEditPage from "../../vehiculo/caracteristica/VehiculoCaracteristicasEditPage";
import VehiculoCaracteristicasListPage from "../../vehiculo/caracteristica/VehiculoCaracteristicasListPage";
 
const VehiculoCaracteristicasIndexPage = (props) => {
  
  const { intl, setLoading, getInfo, accessButton, settingDataField, varIdVehiculo, cancelarEdicion,pathFile } = props;
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

  /***********************   CARACTERISTICA   ********************************************** */
  const agregarCaracteristica = async (caracteristica) => {
    setLoading(true);
    const {
      IdCaracteristica,
      IdCaracteristicaDetalle,
      IdSecuencial,
      FechaInicio,
      FechaFin,
      Activo,
    } = caracteristica;

    let params = {
      IdVehiculo: varIdVehiculo,
      IdCliente: IdCliente,
      IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0,
      IdCaracteristica: isNotEmpty(IdCaracteristica) ? IdCaracteristica : "",
      IdCaracteristicaDetalle: isNotEmpty(IdCaracteristicaDetalle) ? IdCaracteristicaDetalle : "",
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio,'yyyyMMdd')  : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin,'yyyyMMdd') : "",
      Activo,
      IdUsuario: usuario.username,
    };

    await crear(params)
      .then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        listarCaracteristica();
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false) });
  };
 
  const actualizarCaracteristica = async (caracteristica) => {
    setLoading(true);
    const {
      IdVehiculo,
      IdCliente,
      IdCaracteristica,
      IdSecuencial,
      IdCaracteristicaDetalle,
      FechaInicio,
      FechaFin,
      Activo,
    } = caracteristica;
    let params = {
      IdVehiculo: IdVehiculo,
      IdCliente: IdCliente,
      IdCaracteristica:IdCaracteristica,
      IdSecuencial:IdSecuencial,
      IdCaracteristicaDetalle: isNotEmpty(IdCaracteristicaDetalle) ? IdCaracteristicaDetalle : "",
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio,'yyyyMMdd')  : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin,'yyyyMMdd') : "",
      Activo,
      IdUsuario: usuario.username,
    };
    await actualizar(params)
      .then(() => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
        );
        listarCaracteristica();
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false) });
  };

  async function obtenerCaracteristica(filtro) {
    setLoading(true);
    const { IdVehiculo,IdCliente,IdCaracteristica, IdSecuencial } = filtro;
    await obtener({
      IdVehiculo: IdVehiculo,
      IdCliente: IdCliente,
      IdCaracteristica: IdCaracteristica,
      IdSecuencial:IdSecuencial,
    }).then(dato => {
      setDataRowEditNew({
        ...dato,
        esNuevoRegistro: false,
        isReadOnly: false,
      });
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => {
      setLoading(false);
    });
  }

  const editarCaracteristica = async (dataRow) => {
    setDataRowEditNew({});
    await obtenerCaracteristica(dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setModoEdicion(true);
  };

  const eliminarCaracteristica = async (caracteristica, confirm) => {
    setSelectedDelete(caracteristica);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdVehiculo,IdCliente,IdCaracteristica, IdSecuencial } = selectedDelete;
      await eliminar({
        IdVehiculo: IdVehiculo,
        IdCliente: IdCliente,
        IdCaracteristica: IdCaracteristica,
        IdSecuencial:IdSecuencial
      }).then(() => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
        );
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false) });
      listarCaracteristica();
    }
  };

  
  const listarCaracteristica = async () => {
    setLoading(true);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    await listar({
      IdVehiculo: varIdVehiculo,
      IdCliente: IdCliente,
    }).then(datos => {
      setListarTabs(datos);
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  };

  const nuevoCaracteristica = () => {
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setDataRowEditNew({
      Activo: "S",
      esNuevoRegistro: true,
      isReadOnly: false,
    });
  };

  const seleccionarCaracteristica = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };

  const cancelarCaracteristica = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  useEffect(() => {
    listarCaracteristica();
  }, []);

  return <>

    {modoEdicion && (
      <>
        <VehiculoCaracteristicasEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarCaracteristica={actualizarCaracteristica}
          agregarCaracteristica={agregarCaracteristica}
          cancelarEdicion={cancelarCaracteristica}
          titulo={titulo}
          accessButton={accessButton}
          settingDataField={settingDataField}
          getInfo={getInfo}
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
        <VehiculoCaracteristicasListPage
          vehiculoDatos={listarTabs}
          editarRegistro={editarCaracteristica}
          eliminarRegistro={eliminarCaracteristica}
          nuevoRegistro={nuevoCaracteristica}
          seleccionarRegistro={seleccionarCaracteristica}
          focusedRowKey={focusedRowKey}
          accessButton={accessButton}
          getInfo = {getInfo}
          cancelarEdicion={cancelarEdicion}
        />
      </>
    )}

    <Confirm
      message={intl.formatMessage({ id: "ALERT.REMOVE" })}
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      setInstance={setInstance}
      onConfirm={() => eliminarCaracteristica(selectedDelete, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />
  </>

};

export default injectIntl(WithLoandingPanel(VehiculoCaracteristicasIndexPage));
