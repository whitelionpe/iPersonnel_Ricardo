import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { isNotEmpty } from "../../../../../../_metronic";
import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../../partials/components/Confirm";

import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";

import { servicePersonaGrupo } from "../../../../../api/asistencia/personaGrupo.api";
import { serviceZonaEquipo } from "../../../../../api/asistencia/grupoZonaEquipo.api";

import PersonaGrupoListPage from "./PersonaGrupoListPage";
import PersonaGrupoEditPage from "./PersonaGrupoEditPage";


const PersonaGrupoIndexPage = (props) => {
  const { intl, setLoading, getInfo, accessButton, settingDataField, varIdPersona, cancelarEdicion, varIdCompania, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);
  const [grupo, setGrupo] = useState([]);
  const [focusedRowKey, setFocusedRowKey] = useState(0);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [selected, setSelected] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});
  const [grupoZonaEquipo, setGrupoZonaEquipo] = useState([]);



  async function agregarPersonaGrupo(datarow) {
    setLoading(true);
    const { IdCompania, IdGrupo, Activo } = datarow;
    let data = {
      IdCliente: IdCliente
      , IdCompania: isNotEmpty(IdCompania) ? IdCompania.toUpperCase() : ""
      , IdPersona: varIdPersona
      , IdGrupo: isNotEmpty(IdGrupo) ? IdGrupo.toUpperCase() : ""
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await servicePersonaGrupo.crear(data).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }),
        intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarGrupo();
      setModoEdicion(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
    }).finally(() => { setLoading(false); });
  }


  async function actualizarPersonaGrupo(datarow) {
    setLoading(true);
    const { IdCompania, IdGrupo, Activo } = datarow;
    let data = {
      IdCliente: IdCliente
      , IdCompania: isNotEmpty(IdCompania) ? IdCompania.toUpperCase() : ""
      , IdPersona: varIdPersona
      , IdGrupo: isNotEmpty(IdGrupo) ? IdGrupo.toUpperCase() : ""
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await servicePersonaGrupo.actualizar(data).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }),
        intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarGrupo();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function eliminarRegistro(data, confirm) {
    setSelectedDelete(data);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdCompania, IdPersona, IdGrupo } = selectedDelete;
      await servicePersonaGrupo.eliminar({
        IdCliente: IdCliente,
        IdCompania: IdCompania,
        IdGrupo: IdGrupo,
        IdPersona: IdPersona,
        IdUsuario: usuario.username
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarGrupo();
    }
  }

  async function listarGrupo() {
    setLoading(true);
    await servicePersonaGrupo.listar(
      {
        IdCliente
        , IdCompania: varIdCompania
        , IdPersona: varIdPersona
        , NumPagina: 0
        , TamPagina: 0
      }
    ).then(data => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setGrupo(data);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function obtenergrupo(datarow) {
    const { IdCliente, IdCompania, IdPersona, IdGrupo } = datarow;
    setLoading(true);
    await servicePersonaGrupo.obtener({
      IdCliente: IdCliente,
      IdCompania: IdCompania,
      IdPersona: IdPersona,
      IdGrupo: IdGrupo
    }).then(data => {
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  const nuevoRegistro = () => {
    let data = { Activo: "S", IdCompania: varIdCompania };
    setDataRowEditNew({ ...data, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };


  const editarRegistro = async (dataRow) => {
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenergrupo(dataRow);
  };


  const cancelarEdicionGrupo = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };


  const seleccionarRegistro = dataRow => {
    const { RowIndex } = dataRow;
    setModoEdicion(false);
    setSelected(dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    setFocusedRowKey(RowIndex);
  }


  /*Listado de equipo****************************************/
  async function listarTVGrupoZonaEquipo() {
    setLoading(true);
    const { IdCliente, IdDivision, IdGrupo } = selected;
    await serviceZonaEquipo.listarTreeViewGrupoZonaEquipo({
      IdCliente,
      IdDivision,
      IdCompania: varIdCompania,
      IdGrupo,
      IdModulo: dataMenu.info.IdModulo,
      numPagina: 0,
      tamPagina: 0
    })
      .then(objGrupoZonaEquipo => {
        setGrupoZonaEquipo(objGrupoZonaEquipo);
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => {
        setLoading(false);
      });
  }

  const verGrupoZonaEquipo = async (dataRow) => {
    setSelected(dataRow);
    listarTVGrupoZonaEquipo();
  };



  useEffect(() => {
    listarGrupo();
  }, []);



  return <>

    {modoEdicion && (
      <>
        <PersonaGrupoEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarPersonaGrupo={actualizarPersonaGrupo}
          agregarPersonaGrupo={agregarPersonaGrupo}
          cancelarEdicion={cancelarEdicionGrupo}
          titulo={titulo}
          accessButton={accessButton}
          settingDataField={settingDataField}
          varIdPersona={varIdPersona}
          getInfo={getInfo}
          varIdCompania={varIdCompania}
          verGrupoZonaEquipo={verGrupoZonaEquipo}
          grupoZonaEquipo={grupoZonaEquipo}
          setDataRowEditNew={setDataRowEditNew}
          dataMenu={dataMenu}
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
        <PersonaGrupoListPage
          personaGrupoData={grupo}
          editarRegistro={editarRegistro}
          eliminarRegistro={eliminarRegistro}
          nuevoRegistro={nuevoRegistro}
          seleccionarRegistro={seleccionarRegistro}
          focusedRowKey={focusedRowKey}
          accessButton={accessButton}
          getInfo={getInfo}
          cancelarEdicion={cancelarEdicion}
          dataMenu={dataMenu}
          varIdCompania={varIdCompania}
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



export default injectIntl(WithLoandingPanel(PersonaGrupoIndexPage));
