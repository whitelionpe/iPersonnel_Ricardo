import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import PropTypes from 'prop-types';

import { isNotEmpty, dateFormat } from "../../../../../../_metronic";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../../partials/components/Confirm";
import {
  handleErrorMessages,
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
} from "../../../../../api/acceso/personaRequisitoOpcional.api";
import PersonaRequisitoOpcionalEditPage from "./PersonaRequisitoOpcionalEditPage";
import PersonaRequisitoOpcionalListPage from "./PersonaRequisitoOpcionalListPage";

const PersonaRequisitoOpcionalIndexPage = (props) => {
  const { intl, setLoading, getInfo, accessButton, settingDataField, varIdPersona, documento, cancelarEdicion, idAplicacion, idMenu, idModulo } = props;
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
  const [, setInstance] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});
  const [requisitosHistorialData, setRequisitosHistorialData] = useState([])

  async function agregarRequisito(dataRow) {
    setLoading(true);
    const { IdRequisito, Requisito, FechaInicio, FechaFin } = dataRow;

    let params = {
      IdDivision: IdDivision,
      IdCliente: IdCliente,
      IdPersona: varIdPersona,
      IdUsuario: usuario.username,
      IdRequisito: isNotEmpty(IdRequisito) ? IdRequisito : "",
      IdRequisitoOld: "",

      Requisito: isNotEmpty(Requisito) ? Requisito : "",
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : "",
    };

    await crear(params)
      .then((response) => {
        if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        listarRequisito();
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });

  }

  async function actualizarRequisito(dataRow) {

    setLoading(true);
    const { IdCliente, IdPersona, IdRequisito, IdRequisitoOld, FechaInicio, FechaFin } = dataRow;
    let params = {
      IdDivision: IdDivision,
      IdCliente: IdCliente,
      IdPersona: IdPersona,
      IdRequisito: isNotEmpty(IdRequisito) ? IdRequisito : "",
      IdRequisitoOld: isNotEmpty(IdRequisitoOld) ? IdRequisitoOld : "",

      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : "",

      IdUsuario: usuario.username,
      IdModulo: idModulo,
      IdAplicacion: idAplicacion,
      IdMenu: idMenu,
    };

    await actualizar(params)
      .then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        listarRequisito();
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const {
        IdDivision,
        IdCliente,
        IdPersona,
        IdRequisito,

      } = selectedDelete;
      await eliminar({
        IdDivision,
        IdCliente,
        IdPersona,
        IdRequisito,
        IdUsuario: usuario.username,
      })
        .then(() => {
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
          );
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
      listarRequisito();
    } else {
      let { Nombre, Apellido } = selected;
      setSelected({ ...dataRow, Nombre, Apellido });
      setIsVisible(true);
    }
  }

  async function obtenerRequisito(dataRow) {
    setLoading(true);
    const {
      IdDivision,
      IdCliente,
      IdPersona,
      IdRequisito,
    } = dataRow;
    if (IdPersona) {
      let requisito = await obtener({
        IdDivision,
        IdCliente,
        IdPersona,
        IdRequisito,
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      setDataRowEditNew({ ...requisito, esNuevoRegistro: false });
    }
  }

  async function listarRequisito() {
    setModoEdicion(false);
    let data = await listarVigentes({
      IdCliente: IdCliente,
      IdPersona: varIdPersona,
      IdRequisito: '%',

    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));

    setListarTabs(data);
  }

  const seleccionarRegistro = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };

  const editarRegistro = async (dataRow) => {
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerRequisito(dataRow);
  };

  async function listarHistorialRequisito(dataRow) {
    const { IdCliente, IdDivision, IdPersona, IdRequisito } = dataRow;

    let data = await listarHistorial({
      IdCliente,
      IdDivision,
      IdPersona,
      IdRequisito
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });
    setRequisitosHistorialData(data);
  };

  const nuevoRegistro = async () => {
    setDataRowEditNew({});
    setLoading(true);
    let nuevo = { Activo: "S" }; //FechaInicio: fecInicio,FechaFin: fecFin};
    setDataRowEditNew({
      ...nuevo,
      esNuevoRegistro: true,
    });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
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
        <PersonaRequisitoOpcionalEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarRequisito={actualizarRequisito}
          agregarRequisito={agregarRequisito}
          cancelarEdicion={cancelarEdicionRequisito}
          titulo={titulo}
          accessButton={accessButton}
          settingDataField={settingDataField}
          varIdPersona={varIdPersona}
          showHeaderInformation={true}
          getInfo={getInfo}
          setDataRowEditNew={setDataRowEditNew}
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
        <PersonaRequisitoOpcionalListPage
          personaRequisitosData={listarTabs}
          editarRegistro={editarRegistro}
          eliminarRegistro={eliminarRegistro}
          nuevoRegistro={nuevoRegistro}
          seleccionarRegistro={seleccionarRegistro}
          focusedRowKey={focusedRowKey}
          accessButton={accessButton}
          getInfo={getInfo}
          cancelarEdicion={cancelarEdicion}
          listarHistorialRequisito={listarHistorialRequisito}
          requisitosHistorialData={requisitosHistorialData}
          showButtons={props.showButtons}
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

PersonaRequisitoOpcionalIndexPage.propTypes = {
  showButtons: PropTypes.bool,
}
PersonaRequisitoOpcionalIndexPage.defaultProps = {
  showButtons: true,
}

export default injectIntl(WithLoandingPanel(PersonaRequisitoOpcionalIndexPage));
