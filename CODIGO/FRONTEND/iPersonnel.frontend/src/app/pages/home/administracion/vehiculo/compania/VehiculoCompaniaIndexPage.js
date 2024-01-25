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
} from "../../../../../api/administracion/vehiculoCompania.api";

import VehiculoCompaniaEditPage from "../../vehiculo/compania/VehiculoCompaniaEditPage";
import VehiculoCompaniaListPage from "../../vehiculo/compania/VehiculoCompaniaListPage";
 
const VehiculoCompaniaIndexPage = (props) => {

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


  //::: COMPANIA  :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const listarCompania = async () => {
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
  }

  async function agregarCompania(data) {
    const {
      Activo,
      FechaInicio,
      FechaFin,
      IdCompania
    } = data;

    let params = {
      IdCliente: IdCliente,
      IdVehiculo: varIdVehiculo,
      IdCompania: IdCompania,
      IdSecuencial: 0,
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio,'yyyyMMdd')  : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin,'yyyyMMdd') : "",
      Activo,
      IdUsuario: usuario.username,
    };
    await crear(params)
      .then((response) => {
        if (response)
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
          );
        listarCompania();
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });


  }

  const actualizarCompania = async (dataRow) => {
    const {
      IdCliente,
      IdVehiculo,
      Activo,
      FechaFin,
      FechaInicio,
      IdCompania,
      IdSecuencial,
    } = dataRow;

    let params = {
      IdCliente: IdCliente,
      IdVehiculo: IdVehiculo,
      IdCompania: IdCompania,
      IdSecuencial :IdSecuencial,
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio,'yyyyMMdd')  : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin,'yyyyMMdd') : "",
      Activo,
      IdUsuario: usuario.username,
    };
    await actualizar(params)
      .then((response) => {
        if (response)
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
          );
        listarCompania();
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
  }


  async function obtenerCompania(filtro) {
    const { IdVehiculo,IdCliente,IdSecuencial, IdCompania } = filtro;
    if (IdVehiculo) {
      let dato = await obtener({
        IdVehiculo: IdVehiculo,
        IdCliente: IdCliente,
        IdSecuencial: IdSecuencial,
        IdCompania: IdCompania,
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
      setDataRowEditNew({
        ...dato,
        esNuevoRegistro: false,
        isReadOnly: false,
      });
    }
  }

  const editarCompania= (dataRow) => {
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerCompania(dataRow);
  }


  const eliminarCompania= async (dataRow, confirm) => {
    console.log("eliminarCompania|dataRow:",dataRow);
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      const { IdVehiculo,IdCliente,IdSecuencial } = selectedDelete;
      await eliminar({
        IdVehiculo: IdVehiculo,
        IdCliente: IdCliente,
        IdSecuencial: IdSecuencial,
        IdUsuario: usuario.username
      }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
      listarCompania();
    }
  }

  const nuevoCompania = () => {
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    let hoy = new Date();
    let fecInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    let fecFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
    fecFin = fecFin.setMinutes(-1);

    setDataRowEditNew({
      Activo: "S",
      esNuevoRegistro: true,
      isReadOnly: false,
      FechaInicio: fecInicio,
      FechaFin: fecFin,
    });
  }

  const seleccionarCompania = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };

  const cancelarCompania = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  useEffect(() => {
    listarCompania();
  }, []);

  return <>

    {modoEdicion && (
      <>
        <VehiculoCompaniaEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew} 
          setDataRowEditNew = {setDataRowEditNew}
          actualizarCompania={actualizarCompania}
          agregarCompania={agregarCompania}
          cancelarEdicion={cancelarCompania}
          titulo={titulo}
          accessButton={accessButton}
          settingDataField={settingDataField}
          varIdVehiculo={varIdVehiculo}
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
        <VehiculoCompaniaListPage
          vehiculoCompania={listarTabs}
          editarRegistro={editarCompania}
          eliminarRegistro={eliminarCompania}
          nuevoRegistro={nuevoCompania}
          seleccionarRegistro={seleccionarCompania}
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
      onConfirm={() => eliminarCompania(selectedDelete, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />
  </>

};

export default injectIntl(WithLoandingPanel(VehiculoCompaniaIndexPage));
