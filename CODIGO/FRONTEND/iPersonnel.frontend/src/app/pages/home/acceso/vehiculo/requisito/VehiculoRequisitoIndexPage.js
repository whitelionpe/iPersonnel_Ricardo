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
  listarVigentes,
  obtener,
  crear,
  actualizar,
  eliminar,
  listarHistorial
} from "../../../../../api/acceso/vehiculoRequisito.api";

import VehiculoRequisitoEditPage from "../../vehiculo/requisito/VehiculoRequisitoEditPage";
import VehiculoRequisitoListPage from "../../vehiculo/requisito/VehiculoRequisitoListPage";
import { uploadFile } from "../../../../../api/helpers/fileBase64.api";

const VehiculoRequisitoIndexPage = (props) => {
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
  const [requisitoHistorialData, setRequisitoHistorialData] = useState([]);

  /**VEHICULO REQUISITO***************************************************/

  const listarRequisito = async () => {
    setLoading(true);

    setModoEdicion(false);
    await listarVigentes({
      IdCliente: IdCliente,
      IdVehiculo: varIdVehiculo,
    }).then(vehiculosRequisito => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(vehiculosRequisito);
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function agregarRequisito(requisito) {
    const { IdRequisito, FechaInicio, FechaFin, Requisito, NombreArchivo, FileBase64, FechaArchivo } = requisito;
    let params = {
      IdCliente: IdCliente,
      IdVehiculo: varIdVehiculo,
      IdRequisito: IdRequisito,
      IdSecuencial: 0,
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : "",
      FileBase64: isNotEmpty(FileBase64) ? FileBase64 : "",
      NombreArchivo: isNotEmpty(NombreArchivo) ? NombreArchivo : "",
      IdItemSharepoint: "",
      ClaseArchivo: isNotEmpty(Requisito) ? Requisito : "",
      FechaArchivo: isNotEmpty(FechaArchivo) ? dateFormat(FechaArchivo, 'yyyyMMdd') : "",
      IdUsuario: usuario.username,
      PathFile: "",
      IdModulo: idModulo,
      IdAplicacion: idAplicacion,
      IdMenu: idMenu
    };

    if (isNotEmpty(FileBase64)) {
      await uploadFile(params).then(response => {
        //Recuperar Nombre archivo.
        const { nombreArchivo, idItemSharepoint } = response;
        params.NombreArchivo = nombreArchivo;
        params.IdItemSharepoint = idItemSharepoint;

        crear(params)
          .then((response) => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            listarRequisito();
          })
          .catch((err) => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
          });
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
    } else {
      //Requisito sin archivo.
      await crear(params)
        .then((response) => {
          if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
          listarRequisito();
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        });
    }
  }

  async function actualizarRequisito(requisito) {
    const { IdCliente, IdVehiculo, IdRequisito, FechaInicio, FechaFin, IdSecuencial, Requisito, NombreArchivo, FileBase64, FechaArchivo,IdItemSharepoint } = requisito;
    let params = {
      IdCliente: IdCliente,
      IdVehiculo: IdVehiculo,
      IdRequisito: IdRequisito,
      IdSecuencial: IdSecuencial,
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : "",
      FileBase64: isNotEmpty(FileBase64) ? FileBase64 : "",
      NombreArchivo: isNotEmpty(NombreArchivo) ? NombreArchivo : "",
      IdItemSharepoint: isNotEmpty(IdItemSharepoint) ? IdItemSharepoint : "",
      ClaseArchivo: isNotEmpty(Requisito) ? Requisito : "",
      FechaArchivo: isNotEmpty(FechaArchivo) ? dateFormat(FechaArchivo, 'yyyyMMdd') : "",
      IdUsuario: usuario.username,
      PathFile: "",
      IdModulo: idModulo,
      IdAplicacion: idAplicacion,
      IdMenu: idMenu
    };

    if (isNotEmpty(FileBase64)) {
      await uploadFile(params).then(response => {
        //Recuperar Nombre archivo.
        const { nombreArchivo, idItemSharepoint } = response;
        params.NombreArchivo = nombreArchivo;
        params.IdItemSharepoint = idItemSharepoint;
        
        actualizar(params)
          .then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            listarRequisito();
          })
          .catch((err) => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
          });
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    } else {
      await actualizar(params)
        .then(() => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
          listarRequisito();
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        });
    }

  }

  async function eliminarRegistro(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      const {
        IdCliente,
        IdVehiculo,
        IdRequisito,
        IdSecuencial,
      } = selectedDelete;
      await eliminar({
        IdCliente: IdCliente,
        IdVehiculo: IdVehiculo,
        IdRequisito: IdRequisito,
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
      listarRequisito();
    }
  }

  async function obtenerRequisito(filtro) {
    const {
      IdDivision,
      IdCliente,
      IdVehiculo,
      IdRequisito,
      IdSecuencial,
    } = filtro;
    if (IdVehiculo) {
      let requisito = await obtener({
        IdDivision,
        IdCliente,
        IdVehiculo,
        IdRequisito,
        IdSecuencial,
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
      setDataRowEditNew({ ...requisito, esNuevoRegistro: false });
    }
  }

  const seleccionarRegistro = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };

 


  async function listarHistorialRequisito(dataRow) {
    const { IdCliente, IdVehiculo, IdRequisito } = dataRow;
    let data = await listarHistorial({
      IdCliente: IdCliente,
      IdVehiculo: IdVehiculo,
      IdRequisito: IdRequisito
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });
    setRequisitoHistorialData(data);
  };

  const nuevoRegistro = async () => {
    setLoading(true);
    setDataRowEditNew({});
    let nuevo = { Activo: "S"};
    setDataRowEditNew({
      ...nuevo,
      esNuevoRegistro: true,
    });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setLoading(false);

  };

  const editarRegistro =  async (dataRow) => {
     setLoading(true);
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    await obtenerRequisito(dataRow);
    setLoading(false);
  };

  const cancelarEdicionRequisito = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  useEffect(() => {
    listarRequisito();
  }, []);

  return <>

    {modoEdicion && (
      <>
        <VehiculoRequisitoEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarRequisito={actualizarRequisito}
          agregarRequisito={agregarRequisito}
          cancelarEdicion={cancelarEdicionRequisito}
          titulo={titulo}
          accessButton={accessButton}
          settingDataField={settingDataField}
          varIdVehiculo={varIdVehiculo}
          showHeaderInformation={true}
          getInfo={getInfo}
          idModulo={idModulo}
          idAplicacion={idAplicacion}
          idMenu={idMenu}
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
        <VehiculoRequisitoListPage
          vehiculosRequisito={listarTabs}
          editarRegistro={editarRegistro}
          eliminarRegistro={eliminarRegistro}
          nuevoRegistro={nuevoRegistro}
          seleccionarRegistro={seleccionarRegistro}
          focusedRowKey={focusedRowKey}
          accessButton={accessButton}
          getInfo={getInfo}
          cancelarEdicion={cancelarEdicion}
          listarHistorialRequisito={listarHistorialRequisito}
          requisitoHistorialData={requisitoHistorialData}
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


export default injectIntl(WithLoandingPanel(VehiculoRequisitoIndexPage));
