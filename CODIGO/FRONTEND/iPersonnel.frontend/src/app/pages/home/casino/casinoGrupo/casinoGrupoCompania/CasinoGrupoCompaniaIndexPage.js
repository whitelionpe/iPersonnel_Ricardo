import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";
import Confirm from "../../../../../partials/components/Confirm";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { handleErrorMessages,handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import { listar, obtener, crear, actualizar, eliminar } from "../../../../../api/casino/companiaGrupo.api";
import { serviceCompaniaGrupo } from "../../../../../api/casino/companiaGrupo.api";
import CasinoGrupoCompaniaListPage from "../casinoGrupoCompania/CasinoGrupoCompaniaListPage";
import CasinoGrupoCompaniaEditPage from "../casinoGrupoCompania/CasinoGrupoCompaniaEditPage";
import { dateFormat, isNotEmpty } from "../../../../../../_metronic";

const CasinoGrupoCompaniaIndexPage = (props) => {
  const { intl, setLoading, getInfo, accessButton, varIdGrupo, cancelarEdicion } = props;
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  const [listarTabs, setListarTabs] = useState([]);
  const [focusedRowKey, setFocusedRowKey] = useState(0);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [selected, setSelected] = useState({});
  const [isVisibleConfirm, setIsVisibleConfirm] = useState(false);
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [instance, setInstance] = useState({});

  //:::::::::::::::::::::::::::::::::::::::::::::-FUNCIONES GRUPO COMPAÑIA:::::::::::::::::::::::::::::::::

  async function listarGrupo() {
    setLoading(true);
    await listar({
      IdCliente: IdCliente,
      IdGrupo: varIdGrupo,
      IdDivision: IdDivision,
      IdCompania: '%',
      NumPagina: 0,
      TamPagina: 0
    }).then(grupoCompania => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(grupoCompania);
      setModoEdicion(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });

  }

  const seleccionarGrupoCompania = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };

  async function agregarCompaniaGrupo(dataRow) {
    setLoading(true);
   const { IdCompania, FechaInicio, FechaFin, Activo } = dataRow;
    let param = {
        IdCliente: IdCliente
      , IdCompania: IdCompania
      , IdDivision: IdDivision
      , IdGrupo: varIdGrupo
      , FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio,'yyyyMMdd')  : ""
      , FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin,'yyyyMMdd') : ""
      , Activo
      , IdUsuario: usuario.username
    };
    await serviceCompaniaGrupo.CrearMultiple(param)
      .then(response => {
        if (response)
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        listarGrupo()
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }
  
  async function actualizarCompaniaGrupo(dataRow) {
    setLoading(true);
    const { IdCliente,IdCompania,IdDivision,IdGrupo,FechaInicio, FechaFin,Activo } = dataRow;
    let params = {
         IdCliente: IdCliente
      , IdCompania: IdCompania
      , IdDivision: IdDivision
      , IdGrupo: IdGrupo
      , FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio,'yyyyMMdd')  : ""
      , FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin,'yyyyMMdd') : ""
      , Activo
      , IdUsuario: usuario.username
    };
    await actualizar(params)
      .then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        listarGrupo();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }
  
  async function obtenerCompaniaGrupo(dataRow) {
    setLoading(true);
    const { IdCliente,IdCompania,IdDivision, IdGrupo } = dataRow;
    await obtener({
      IdCliente,
      IdCompania,
      IdDivision,
      IdGrupo
    }).then(data => {
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    })
      .finally(() => { setLoading(false); });
  }

  const editarCompaniaGrupo = dataRow => {
    const { RowIndex } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setDataRowEditNew(dataRow);
    obtenerCompaniaGrupo(dataRow);
    setFocusedRowKey(RowIndex);
  };
  
  const nuevoCompaniaGrupo = (e) => {
    let nuevo = { Activo: "S" };
    setDataRowEditNew({ ...nuevo, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const cancelarGrupo = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  async function eliminarCompaniaGrupo(dataRow, confirm) {
    setSelected(dataRow);
    setIsVisibleConfirm(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente,IdCompania,IdDivision, IdGrupo } = dataRow;
      await eliminar({
        IdCliente,
        IdCompania,
        IdDivision,
        IdGrupo,
      })
        .then(response => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
      listarGrupo();
    }
  }

  useEffect(() => {
    listarGrupo();
  }, []);

  return <>

    {modoEdicion && (
      <>
         <CasinoGrupoCompaniaEditPage
          dataRowEditNew={dataRowEditNew}
          titulo={titulo}
          modoEdicion={modoEdicion}
          agregarCompaniaGrupo={agregarCompaniaGrupo}
          actualizarCompaniaGrupo={actualizarCompaniaGrupo}
          cancelarEdicion={cancelarGrupo}
          accessButton={accessButton}
          settingDataField={props.settingDataField}

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
        <CasinoGrupoCompaniaListPage
          personasGrupo={listarTabs}
          seleccionarRegistro={seleccionarGrupoCompania}
          focusedRowKey={focusedRowKey}
          accessButton={accessButton}
          getInfo={getInfo}
          cancelarEdicion={cancelarEdicion}
          editarRegistro={editarCompaniaGrupo}
          eliminarRegistro={eliminarCompaniaGrupo}
          nuevoRegistro={nuevoCompaniaGrupo} 
        />
      </>
    )}
    
    <Confirm
      message={intl.formatMessage({ id: "ALERT.REMOVE" })}
      isVisible={isVisibleConfirm}
      setIsVisible={setIsVisibleConfirm}
      setInstance={setInstance}
      onConfirm={() => eliminarCompaniaGrupo(selected, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />
  </>

};

export default injectIntl(WithLoandingPanel(CasinoGrupoCompaniaIndexPage));
