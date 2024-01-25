import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import Confirm from "../../../../../partials/components/Confirm";

import {
  crear as crearARequisito,
  eliminar as eliminarARequisito,
  listar as listarRequisitos
} from "../../../../../api/acreditacion/autorizadorRequisito.api";

import AutorizadorRequisitoListPage from "./AutorizadorRequisitoListPage";
import AutorizadorRequisitoEditPage from "./AutorizadorRequisitoEditPage";
import { isNotEmpty } from "../../../../../../_metronic";

const AutorizadorRequisitoIndexPage = (props) => {
  const { intl, setLoading, getInfo, accessButton, varIdAutorizador, selectedIndex } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);
  const usuario = useSelector(state => state.auth.user);

  const classesEncabezado = useStylesEncabezado();
  const [focusedRowKey, setFocusedRowKey] = useState(0);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  const [selectedDelete, setSelectedDelete] = useState({});
  const [isVisibleConfirm, setIsVisibleConfirm] = useState(false);
  const [instance, setInstance] = useState({});

  //*****AUTORIZADOR REQUISITO***************************************************/
  async function listarAutorizadorRequisito() {
    setLoading(true);
    if (isNotEmpty(varIdAutorizador)) {
      await listarRequisitos({ IdCliente: perfil.IdCliente, IdAutorizador: varIdAutorizador, IdRequisito: "%" }).then((data) => {
        setDataSource(data);
      }).finally(() => { setLoading(false); });
    }
  }

  const nuevoAutorizadorRequisito = () => {
    const { IdAutorizador } = selectedIndex;
    setDataRowEditNew({ IdCliente: perfil.IdCliente, IdAutorizador, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };


  async function agregarAutorizadorRequisito(dataRow) {
    setLoading(true);
    const { IdAutorizador, IdRequisito } = dataRow;
    let params = {
      IdCliente: perfil.IdCliente
      , IdAutorizador: isNotEmpty(IdAutorizador) ? IdAutorizador.toUpperCase() : ""
      , IdRequisito: isNotEmpty(IdRequisito) ? IdRequisito.toUpperCase() : ""
      , IdUsuario: usuario.username
    }
    await crearARequisito(params).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarAutorizadorRequisito();
      setModoEdicion(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const seleccionarAutorizadorRequisito = async (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  }

  async function eliminarAutorizadorRequisito(dataRow, confirm) {
    //console.log("eliminarAutorizadorRequisito dataRow", dataRow, confirm);
   
    if (confirm) {
      setLoading(true); 
      const { IdAutorizador, IdRequisito } = selectedDelete;
      await eliminarARequisito({
        IdCliente: perfil.IdCliente,
        IdAutorizador,
        IdRequisito
      }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarAutorizadorRequisito();
    }else{
      setSelectedDelete(dataRow);
      setIsVisibleConfirm(true);
    }
  }

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});

  };

  useEffect(() => {
    listarAutorizadorRequisito();
  }, []);

  return <>

    {modoEdicion && (
      <>
        <AutorizadorRequisitoEditPage
          dataRowEditNew={dataRowEditNew}
          agregarRegistro={agregarAutorizadorRequisito}
          cancelarEdicion={cancelarEdicion}
          titulo={titulo}
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
        <AutorizadorRequisitoListPage
          eliminarRegistro={eliminarAutorizadorRequisito}
          nuevoRegistro={nuevoAutorizadorRequisito}
          cancelarEdicion={props.cancelarEdicion}
          seleccionarRegistro={seleccionarAutorizadorRequisito}
          dataSource={dataSource}
          focusedRowKey={focusedRowKey}
          getInfo={getInfo}
        />
      </>
    )}

    <Confirm
      message={intl.formatMessage({ id: "ALERT.REMOVE" })}
      isVisible={isVisibleConfirm}
      setIsVisible={setIsVisibleConfirm}
      setInstance={setInstance}
      onConfirm={() => eliminarAutorizadorRequisito(selectedDelete, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />


  </>
};

export default injectIntl(WithLoandingPanel(AutorizadorRequisitoIndexPage));
