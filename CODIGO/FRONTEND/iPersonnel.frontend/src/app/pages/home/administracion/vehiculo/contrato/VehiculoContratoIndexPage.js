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
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
} from "../../../../../api/administracion/vehiculoContrato.api";

import VehiculoContratoEditPage from "../../vehiculo/contrato/VehiculoContratoEditPage";
import VehiculoContratoListPage from "../../vehiculo/contrato/VehiculoContratoListPage";

const VehiculoContratoIndexPage = (props) => {

  const { intl, setLoading, getInfo, accessButton, settingDataField, varIdVehiculo, cancelarEdicion, selectedIndex } = props;
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
  const [focusedRowKeyContrato, setFocusedRowKeyContrato] = useState();
  const [fechasContrato, setFechasContrato] = useState({ FechaInicioContrato: null, FechaFinContrato: null });

  const [showConfirm, setShowConfirm] = useState(false);

  const eventConfirm = async () => {
    //Se oculta el confirm:
    setShowConfirm(false);

    const {
      IdSecuencial
    , IdCompaniaMandante
    , IdContrato
    , IdCompaniaContratista
    , IdDivision
    , FechaInicio
    , FechaFin
    , IdUnidadOrganizativa
    , IdCompaniaSubContratista
    , IdCentroCosto
    , Activo
  } = selected;

  let params = {
     IdCliente: IdCliente
    , IdVehiculo: varIdVehiculo
    , IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0
    , IdCompaniaMandante: isNotEmpty(IdCompaniaMandante) ? IdCompaniaMandante.toUpperCase() : ""
    , IdContrato: isNotEmpty(IdContrato) ? IdContrato.toUpperCase() : ""
    , IdCompaniaContratista: isNotEmpty(IdCompaniaContratista) ? IdCompaniaContratista.toUpperCase() : ""
    , IdDivision: isNotEmpty(IdDivision) ? IdDivision.toUpperCase() : ""
    , FechaInicio: FechaInicio
    , FechaFin: FechaFin
    , IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa : ""
    , IdCompaniaSubContratista: isNotEmpty(IdCompaniaSubContratista) ? IdCompaniaSubContratista.toUpperCase() : ""
    , IdCentroCosto: isNotEmpty(IdCentroCosto) ? IdCentroCosto.toUpperCase() : ""
    , Activo: Activo
    , IdUsuario: usuario.username
    , IsConfim : "S"
  };
  await crear(params)
    .then((response) => {
      if (response)
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
        );
      listarVehiculoContrato();
    })
    .catch((err) => {
       handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
    });
  


}

  const listarVehiculoContrato = async () => {
    setLoading(true);
    const { IdCliente, IdVehiculo } = selectedIndex;
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    await listar({
      IdCliente,
      IdVehiculo,
      NumPagina: 0,
      TamPagina: 0
    }).then(contratos => {
      setListarTabs(contratos);
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function agregarVehiculoContrato(contrato) {
    const {
        IdSecuencial
      , IdCompaniaMandante
      , IdContrato
      , IdCompaniaContratista
      , IdDivision
      , FechaInicio
      , FechaFin
      , IdUnidadOrganizativa
      , IdCompaniaSubContratista
      , IdCentroCosto
      , Activo
    } = contrato;

    let params = {
       IdCliente: IdCliente
      , IdVehiculo: varIdVehiculo
      , IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0
      , IdCompaniaMandante: isNotEmpty(IdCompaniaMandante) ? IdCompaniaMandante.toUpperCase() : ""
      , IdContrato: isNotEmpty(IdContrato) ? IdContrato.toUpperCase() : ""
      , IdCompaniaContratista: isNotEmpty(IdCompaniaContratista) ? IdCompaniaContratista.toUpperCase() : ""
      , IdDivision: isNotEmpty(IdDivision) ? IdDivision.toUpperCase() : ""
      , FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, "yyyyMMdd") : ""
      , FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, "yyyyMMdd") : ""
      , IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa : ""
      , IdCompaniaSubContratista: isNotEmpty(IdCompaniaSubContratista) ? IdCompaniaSubContratista.toUpperCase() : ""
      , IdCentroCosto: isNotEmpty(IdCentroCosto) ? IdCentroCosto.toUpperCase() : ""
      , Activo: Activo
      , IdUsuario: usuario.username
      , IsConfim : "N"
    };
    await crear(params)
      .then((response) => {
        if (response)
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
          );
        listarVehiculoContrato();
      })
      .catch((err) => {
        let { confirm, mensajeValidacion } = err.response.data.responseException.exceptionMessage;

        if (!!confirm) {
            setSelected(params);
            setShowConfirm(true);
        } else {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), mensajeValidacion, true);
        }
      });

  }

  const actualizarVehiculoContrato = async (x) => {
    const {
        IdCliente
      , IdVehiculo
      , IdSecuencial
      , IdCompaniaMandante
      , IdContrato
      , IdCompaniaContratista
      , IdDivision
      , FechaInicio
      , FechaFin
      , IdUnidadOrganizativa
      , IdCompaniaSubContratista
      , IdCentroCosto
      , Activo
    } = x;

    let params = {
        IdCliente: IdCliente
      , IdVehiculo: IdVehiculo
      , IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0
      , IdCompaniaMandante: isNotEmpty(IdCompaniaMandante) ? IdCompaniaMandante : ""
      , IdContrato: isNotEmpty(IdContrato) ? IdContrato : ""
      , IdCompaniaContratista: isNotEmpty(IdCompaniaContratista) ? IdCompaniaContratista : ""
      , IdDivision: isNotEmpty(IdDivision) ? IdDivision : ""
      , FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, "yyyyMMdd") : ""
      , FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, "yyyyMMdd") : ""
      , IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa : ""
      , IdCompaniaSubContratista: isNotEmpty(IdCompaniaSubContratista) ? IdCompaniaSubContratista : ""
      , IdCentroCosto: isNotEmpty(IdCentroCosto) ? IdCentroCosto : ""
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await actualizar(params)
      .then((response) => {
        if (response)
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
          );
        listarVehiculoContrato();
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
  }

  async function obtenerVehiculoContrato(filtro) {
    setLoading(true);
    const { IdVehiculo, IdCliente, IdSecuencial } = filtro;
    await obtener({
      IdVehiculo: IdVehiculo,
      IdCliente: IdCliente,
      IdSecuencial: IdSecuencial
    }).then(contrato => {
       console.log("obtenerVehiculoContrato|contrato:",contrato)
      setFechasContrato({ FechaInicioContrato: contrato.FechaInicioContrato, FechaFinContrato: contrato.FechaFinContrato });
      setDataRowEditNew({
        ...contrato, esNuevoRegistro: false, isReadOnly: false
      });
    })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false) });

  }

  const editarVehiculoContrato = async (dataRow, flEditar) => {
    setDataRowEditNew({});
    setTitulo((flEditar) ? intl.formatMessage({ id: "ACTION.EDIT" }) : intl.formatMessage({ id: "ACTION.VIEW" }));
    await obtenerVehiculoContrato(dataRow);
    setModoEdicion(true);
  }

  const eliminarVehiculoContrato = async (contrato, confirm) => {
    setSelectedDelete(contrato);
    setIsVisible(true);
    if (confirm) {
      const { IdVehiculo, IdCliente, IdSecuencial } = selectedDelete;
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
      listarVehiculoContrato();
    }
  }

  const nuevoRegistroVehiculoContrato = () => {
    let contrato = { Activo: "S", ...setSelected };
    setDataRowEditNew({});
    setFechasContrato({ FechaInicioContrato: null, FechaFinContrato: null });
    setDataRowEditNew({ ...contrato, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  }

  const seleccionarVehiculoContrato = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKeyContrato(RowIndex);
  };

  const cancelarVehiculoContrato = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const verRegistro = async (dataRow) => {
    setModoEdicion(false);
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    await obtenerVehiculoContrato(dataRow);
  };

  

  useEffect(() => {
    listarVehiculoContrato();
  }, []);

  return <>

    {modoEdicion && (
      <>
        <VehiculoContratoEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          setDataRowEditNew={setDataRowEditNew}
          actualizarContrato={actualizarVehiculoContrato}
          agregarContrato={agregarVehiculoContrato}
          cancelarEdicion={cancelarVehiculoContrato}
          titulo={titulo}
          accessButton={accessButton}
          settingDataField={settingDataField}
          varIdVehiculo={varIdVehiculo}
          getInfo={getInfo}
          ocultarEdit={props.ocultarEdit}
          fechasContrato = {fechasContrato}
          setFechasContrato = {setFechasContrato}
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
        <VehiculoContratoListPage
          contratos={listarTabs}
          editarRegistro={editarVehiculoContrato}
          eliminarRegistro={eliminarVehiculoContrato}
          nuevoRegistro={nuevoRegistroVehiculoContrato}
          seleccionarRegistro={seleccionarVehiculoContrato}
          focusedRowKey={focusedRowKeyContrato}
          accessButton={accessButton}
          getInfo={getInfo}
          cancelarEdicion={cancelarEdicion}

          showButtons={props.showButtons}
          ocultarEdit={props.ocultarEdit}
          verRegistro={verRegistro}
        />
      </>
    )}

    <Confirm
      message={intl.formatMessage({ id: "ALERT.REMOVE" })}
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      setInstance={setInstance}
      onConfirm={() => eliminarVehiculoContrato(selectedDelete, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />

<Confirm
      message={intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONTRACT.CONFIM.CESE" })}
      isVisible={showConfirm}
      setIsVisible={setShowConfirm}
      setInstance={setInstance}
      onConfirm={eventConfirm}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />

  </>

};

export default injectIntl(WithLoandingPanel(VehiculoContratoIndexPage));
