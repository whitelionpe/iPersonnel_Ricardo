import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../../partials/components/Confirm";

import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";

import {
  obtener,
  listar,
  crear,
  actualizar,
  eliminar
} from "../../../../../api/acreditacion/perfilEntidadDato.api";

import EntidadDatoEditpage from "./EntidadDatoEditpage";
import EntidadDatoListPage from "./EntidadDatoListPage"

const EntidadDatoIndexPage = (props) => {

  const usuario = useSelector(state => state.auth.user);
  const { IdDivision, IdCliente } = useSelector(state => state.perfil.perfilActual);
  const perfil = useSelector(state => state.perfil.perfilActual);

  const { intl, setLoading, settingDataField, getInfo, accessButton, varIdPerfil } = props;

  const { IdPerfil, IdEntidad } = props.selected;

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

  async function agregarEntidadDato(selectedRowsEntidadDatos) {
    let IsError = false;
    try {
      if (selectedRowsEntidadDatos != undefined) {

        if (selectedRowsEntidadDatos.length > 0) {
          selectedRowsEntidadDatos.map(async (data) => {
            const { IdEntidad, IdDato } = data;
            let params = {
              IdCliente: IdCliente,
              IdPerfil: varIdPerfil,
              IdEntidad: IdEntidad,
              IdDato: IdDato,
              Obligatorio: 'S',
              Editable: 'S',
              IdUsuario: usuario.username
            };
            await crear(params)
              .then((response) => {
                IsError = false;
              })
              .catch((err) => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
                IsError = true;
              });
          });

          if (!IsError) {
            setTimeout(() => {
              listarTipoEntidadDato();
              handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
              setModoEdicion(false);
            }, 700);
          }

        }
      }
    } catch (err) {
      setLoading(false);
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }
  }

  async function actualizarEntidadDato(datarow) {
    setLoading(true);
    const { IdCliente, IdPerfil, IdEntidad, IdDato, Obligatorio, Editable } = datarow;
    let data = {
      IdCliente: IdCliente
      , IdPerfil: IdPerfil
      , IdEntidad: IdEntidad
      , IdDato: IdDato
      , Obligatorio: Obligatorio
      , Editable: Editable
      , IdUsuario: usuario.username
    };
    await actualizar(data).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarTipoEntidadDato();
      setModoEdicion(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerEntidadDato(dataRow) {
    setLoading(true);
    const { IdCliente, IdPerfil, IdEntidad, IdDato } = dataRow;
    await obtener({
      IdCliente: IdCliente,
      IdPerfil: IdPerfil,
      IdEntidad: IdEntidad,
      IdDato: IdDato
    }).then(data => {
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarEntidadDato(data, confirm) {
    setSelectedDelete(data);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdPerfil, IdEntidad, IdDato } = selectedDelete;
      await eliminar({
        IdCliente: IdCliente,
        IdPerfil: IdPerfil,
        IdEntidad: IdEntidad,
        IdDato: IdDato
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarTipoEntidadDato();
    }
  }

  async function listarTipoEntidadDato() {
    setLoading(true);
    await listar(
      {
        IdCliente: IdCliente,
        IdPerfil: varIdPerfil,
        IdEntidad: '%',
        IdDato: '%',
        NumPagina: 0,
        TamPagina: 0
      }
    ).then(data => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(data)

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const seleccionarRegistro = async (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };

  const nuevoRegistro = () => {
    let data = { Obligatorio: 'S', Editable: 'S', esNuevoRegistro: true };
    setDataRowEditNew(data);
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  }

  const editarRegistro = async (dataRow) => {
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerEntidadDato(dataRow);
  };

  useEffect(() => {
    listarTipoEntidadDato();
  }, []);


  const cancelarEdicion = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function eliminarListRowTab(selected, confirm) {
    eliminarEntidadDato(selected, confirm);
  }

  return <>

    {modoEdicion && (
      <>
        <EntidadDatoEditpage
          dataRowEditNew={dataRowEditNew}
          actualizar={actualizarEntidadDato}
          agregar={agregarEntidadDato}
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
        <EntidadDatoListPage
          entidadDatos={listarTabs}
          seleccionarRegistro={seleccionarRegistro}
          editarRegistro={editarRegistro}
          eliminarRegistro={eliminarEntidadDato}
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

export default injectIntl(WithLoandingPanel(EntidadDatoIndexPage));
