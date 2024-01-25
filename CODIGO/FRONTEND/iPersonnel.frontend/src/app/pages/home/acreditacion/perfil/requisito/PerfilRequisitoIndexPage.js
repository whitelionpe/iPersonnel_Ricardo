import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../../partials/components/Confirm";

import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";

import {
  service
} from "../../../../../api/acreditacion/perfilRequisito.api";

import PerfilRequisitoEditPage from "./PerfilRequisitoEditPage";
import PerfilRequisitoListPage from "./PerfilRequisitoListPage"

const PerfilRequisitoIndexPage = (props) => {

  const { intl, setLoading, settingDataField, getInfo, accessButton, varIdPerfil, selectedIndex } = props;

  const usuario = useSelector(state => state.auth.user);
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  const perfil = useSelector(state => state.perfil.perfilActual);


  const { IdPerfil, IdEntidad } = selectedIndex;

  const [isVisible, setIsVisible] = useState(false);
  const [focusedRowKey, setFocusedRowKey] = useState();

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));

  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState({});

  const [listarTabs, setListarTabs] = useState([]);
  const [instance, setInstance] = useState({});

  const [filtroLocal, setFiltroLocal] = useState({
    IdPerfil: IdPerfil, IdEntidad: IdEntidad,
  });

  //:::::::::::::::::::::::::::::::::::::::::::::-|funciones- Entidad Dato|-:::::::::::::::::::::::::::::::::

  async function agregarRegistro(dataRow) {
    const { IdRequisito, Activo } = dataRow;
    try {

      let params = {
        IdCliente,
        IdPerfil: varIdPerfil,
        IdRequisito,
        Activo,
        IdUsuario: usuario.username
      };
      await service.crear(params)
        .then(() => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
          listarRequisito();
          setModoEdicion(false);
        }).catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
        });
      listarRequisito();

    } catch (err) {
      setLoading(false);
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }

  }

  async function actualizarRegistro(datarow) {
    setLoading(true);
    const { IdCliente, IdPerfil, IdRequisito, Activo } = datarow;
    let data = {
      IdCliente: IdCliente
      , IdPerfil: IdPerfil
      , IdRequisito
      , Activo
      , IdUsuario: usuario.username
    };
    await service.actualizar(data).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarRequisito();
      setModoEdicion(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerRegistro(dataRow) {
    setLoading(true);
    const { IdCliente, IdPerfil, IdRequisito, Activo } = dataRow;
    await service.obtener({
      IdCliente,
      IdPerfil,
      IdRequisito,
      Activo
    }).then(data => {
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro(data, confirm) {
    setSelectedDelete(data);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdPerfil, IdRequisito } = selectedDelete;
      await service.eliminar({
        IdCliente,
        IdPerfil,
        IdRequisito,
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarRequisito();
    }
  }

  async function listarRequisito() {
    setLoading(true);
    await service.listar(
      {
        IdCliente,
        IdPerfil: varIdPerfil,
      }).then(data => {
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setListarTabs(data);
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  const seleccionarRegistro = async (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };

  const nuevoRegistro = () => {
    let data = { ...selectedIndex, esNuevoRegistro: true, Activo: 'S' };
    setDataRowEditNew(data);
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  }

  const editarRegistro = async (dataRow) => {
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerRegistro(dataRow);
  };

  useEffect(() => {
    listarRequisito();
  }, []);


  const cancelarEdicion = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };
  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function eliminarListRowTab(selected, confirm) {
    eliminarRegistro(selected, confirm);
  }

  return <>

    {modoEdicion && (
      <>
        <PerfilRequisitoEditPage
          dataRowEditNew={dataRowEditNew}
          actualizar={actualizarRegistro}
          agregar={agregarRegistro}
          cancelarEdicion={cancelarEdicion}
          titulo={titulo}
          modoEdicion={modoEdicion}
          settingDataField={props.settingDataField}
          accessButton={accessButton}
          getInfo={getInfo}
          varIdPerfil={varIdPerfil}
          setModoEdicion={setModoEdicion}
          filtroLocal={filtroLocal}
        />

        <div className="container_only">
          <div className="float-right">
            <ControlSwitch checked={auditoriaSwitch}
              onChange={e => { setAuditoriaSwitch(e.target.checked) }}
            /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
          </div>
        </div>
        {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
      </>

    )}

    {!modoEdicion && (
      <>
        <PerfilRequisitoListPage
          dataSource={listarTabs}
          seleccionarRegistro={seleccionarRegistro}
          editarRegistro={editarRegistro}
          eliminarRegistro={eliminarRegistro}
          nuevoRegistro={nuevoRegistro}
          cancelarEdicion={props.cancelarEdicion}
          getInfo={getInfo}
          accessButton={accessButton}
          focusedRowKey={focusedRowKey}
        />
      </>
    )}

    <Confirm
      message={intl.formatMessage({ id: "ALERT.REMOVE" })}
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      setInstance={setInstance}
      onConfirm={() => eliminarListRowTab(selectedDelete, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />
  </>
};

export default injectIntl(WithLoandingPanel(PerfilRequisitoIndexPage));
