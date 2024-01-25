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
} from "../../../../../api/administracion/personaRegimen.api";

import PersonaRegimenEditPage from "../../persona/regimen/PersonaRegimenEditPage";
import PersonaRegimenListPage from "../../persona/regimen/PersonaRegimenListPage";
 
const PersonaRegimenIndexPage = (props) => {

  const { intl, setLoading, getInfo, accessButton, settingDataField, varIdPersona, cancelarEdicion,pathFile } = props;
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

//::::::::::-Funciones, REGIMEN PERSONA:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
async function agregarRegimen(regimen) {
  setLoading(true);
  const {   IdRegimen, IdGuardia, IdSecuencial, FechaInicio, FechaFin, Activo } = regimen;
  let params = {
      IdPersona : varIdPersona
    , IdCliente : IdCliente
    , IdDivision: IdDivision
    , IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0
    , IdRegimen: isNotEmpty(IdRegimen) ? IdRegimen : ""
    , IdGuardia: isNotEmpty(IdGuardia) ? IdGuardia : ""
    , FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio,'yyyyMMdd') : ""
    , FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin,'yyyyMMdd') : ""
    , Activo
    , IdUsuario: usuario.username
  };
  await crear(params).then(response => {
    if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
    listarRegimen();
  }).catch(err => {
    handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
  }).finally(() => { setLoading(false); });
}

async function actualizarRegimen(regimen) {
  setLoading(true);
  const { IdPersona, IdCliente, IdDivision, IdRegimen, IdGuardia, IdSecuencial, FechaInicio, FechaFin, Activo } = regimen;
  let params = {
    IdPersona : IdPersona
    , IdCliente : IdCliente
    , IdDivision: IdDivision
    , IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0
    , IdRegimen: isNotEmpty(IdRegimen) ? IdRegimen : ""
    , IdGuardia: isNotEmpty(IdGuardia) ? IdGuardia : ""
    , FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio,'yyyyMMdd') : ""
    , FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin,'yyyyMMdd') : ""
    , Activo : Activo
    , IdUsuario: usuario.username
  };
  await actualizar(params).then(() => {
    handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
    listarRegimen();
  }).catch(err => {
    handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
  }).finally(() => { setLoading(false); });
}

async function eliminarRegimen(regimen, confirm) {
  setSelectedDelete(regimen);
  setIsVisible(true);
  if (confirm) {
    setLoading(true);
    const { IdPersona, IdCliente, IdSecuencial } = regimen;
    await eliminar({ 
      IdPersona: IdPersona,
       IdSecuencial: IdSecuencial,
        IdCliente: IdCliente,
         IdUsuario: usuario.username
         }).then(response => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
    listarRegimen();
  }
}

async function listarRegimen() {
  setLoading(true);
  setModoEdicion(false);
  await listar({
      IdPersona: varIdPersona,
      IdCliente: IdCliente, 
      NumPagina: 0,
      TamPagina: 0
  }).then(perRegimen => {
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setListarTabs(perRegimen);
  }).catch(err => {
    handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
  }).finally(() => { setLoading(false); });

}

async function obtenerRegimen(filtro) {
  setLoading(true);
  const { IdPersona, IdCliente, IdSecuencial } = filtro;

  await obtener({ 
        IdPersona : IdPersona,
        IdCliente : IdCliente,
        IdSecuencial  : IdSecuencial
    })
    .then(regimen => {
      setDataRowEditNew({ ...regimen, esNuevoRegistro: false });
    })
    .catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    })
    .finally(() => { setLoading(false) });
}

const seleccionarRegimen = (dataRow) => {
  const { RowIndex } = dataRow;
  setFocusedRowKey(RowIndex);
};

const editarRegimen = dataRow => {
  setModoEdicion(true);
  setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
  obtenerRegimen(dataRow);
};

const nuevoRegimen = () => {
  let hoy = new Date();
  let nuevo = { FechaInicio: hoy, Activo: "S", FechaFin: props.fechaFinContrato, ...selected };
  setDataRowEditNew({ ...nuevo, esNuevoRegistro: true });
  setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
  setModoEdicion(true);
};

  const cancelarRegimen = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  useEffect(() => {
    listarRegimen();
  }, []);

  return <>

    {modoEdicion && (
      <>
        <PersonaRegimenEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarRegimen={actualizarRegimen}
          agregarRegimen={agregarRegimen}
          cancelarEdicion={cancelarRegimen}
          titulo={titulo}
          accessButton={accessButton}
          settingDataField={settingDataField}
          varIdPersona={varIdPersona}
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
        <PersonaRegimenListPage
          personasRegimen={listarTabs}
          editarRegistro={editarRegimen}
          eliminarRegistro={eliminarRegimen}
          nuevoRegistro={nuevoRegimen}
          seleccionarRegistro={seleccionarRegimen}
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
      onConfirm={() => eliminarRegimen(selectedDelete, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />
  </>

};

export default injectIntl(WithLoandingPanel(PersonaRegimenIndexPage));
