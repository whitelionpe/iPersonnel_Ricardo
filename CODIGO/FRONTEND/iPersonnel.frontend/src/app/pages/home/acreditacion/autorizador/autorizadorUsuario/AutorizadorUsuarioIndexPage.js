import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { handleErrorMessages, handleSuccessMessages, handleWarningMessages } from "../../../../../store/ducks/notify-messages";
import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";
import Confirm from "../../../../../partials/components/Confirm";
import { isNotEmpty } from "../../../../../../_metronic";

import { eliminar, obtener, crear, actualizar, crearMultiple } from "../../../../../api/acreditacion/autorizadorUsuario.api";
import AutorizadorUsuarioListPage from "./AutorizadorUsuarioListPage";
import AutorizadorUsuarioEditPage from "./AutorizadorUsuarioEditPage";
import SeguridadPerfilDetalleArea from "../../../../../partials/components/SeguridadPerfilDetalleArea";
import { serviceUsuarioPerfil } from "../../../../../api/seguridad/usuarioPerfil.api";
import { obtener as obtenerSistemaConfiguracion } from "../../../../../api/sistema/configuracion.api";

//-customerDataGrid Star
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
export const initialFilter = {
  Activo: 'S',
  IdCliente: '',
  IdUsuario: '',
  IdAutorizador: ''
};


const AutorizadorUsuarioIndexPage = (props) => {
  const { intl, setLoading, getInfo, accessButton, varIdAutorizador, selected, cancelarEdicion, changeTabIndex } = props;
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);

  const [autorizadorUsuariofocusedRowKey, setFocusedRowKeyAutorizadorUsuario] = useState(0);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);

  //FILTRO- CustomerDataGrid
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const [filterData, setFilterData] = useState({ ...initialFilter });
  const [selectedDelete, setSelectedDelete] = useState({});
  const [isVisibleConfirm, setIsVisibleConfirm] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);
  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();
  const [instance, setInstance] = useState({});
  const [varIdUsuario, setVarIdUsuario] = useState("");

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  const [grillaAutorizadorUsuario, setGrillaAutorizadorUsuario] = useState([]);
  const [gridBoxValue, setGridBoxValue] = useState([]);
  //Poppup Detalle Usuarios
  const [isVisiblePopUpUsuarioDetalle, setIsVisiblePopUpUsuarioDetalle] = useState(false);
  const [perfilesData, setPerfilesData] = useState([]);
  const [varCaracteristicaDefault, setVarCaracteristicaDefault] = useState({ IdCompaniaMandante: "", CompaniaMandante: "" });

  async function listarAutorizadorUsuario() {
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    changeTabIndex(4);
    setModoEdicion(false)
    setRefreshData(true);
  };

  const nuevoRegistro = () => {
    let nuevo = { Activo: "S" };
    let currentUsers = dataSource._items;

    setDataRowEditNew({ ...nuevo, esNuevoRegistro: true, currentUsers });
    setGrillaAutorizadorUsuario([]);
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };




  async function agregarAutorizadorUsuario(usuarios) {
    setLoading(true);

    const { IdPerfil } = usuarios[0];
    var parametro = {
      IdCliente: IdCliente,
      IdAutorizador: varIdAutorizador,
      IdUsuarios: usuarios.map(item => item.IdUsuario).join(","),
      Activo: 'S',
      IdPerfil: isNotEmpty(IdPerfil) ? IdPerfil.toUpperCase() : ""
    }
    let nombres = '';
    await crearMultiple(parametro).then(result => {
      result = result.data;
      setGrillaAutorizadorUsuario(result);
      if (result.length === 1) {
        nombres = result[0].NombreCompleto;
      }
      setRefreshData(true);
      var rsObservados = result.filter(o => o.Activo === "N");
      var rsOk = result.filter(o => o.Activo === "S");
      if (rsObservados.length === 0 && rsOk.length > 0) {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }), nombres);
        setModoEdicion(false);
      } else {
        if (rsOk.length > 0) {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }), nombres);

        } else {
          handleWarningMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.NO.SUCESS" }));

        }
      }
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
    }).finally(() => {
      setLoading(false);
    })

  }


  const seleccionarAutorizadorUsuario = dataRow => {
    const { IdUsuario, RowIndex } = dataRow;
    setVarIdUsuario(IdUsuario);
    setFocusedRowKeyAutorizadorUsuario(RowIndex);
  };


  async function eliminarAutorizadorUsuario(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisibleConfirm(true);
    if (confirm) {

      setLoading(true);
      const { IdUsuario, IdCliente } = dataRow;
      await eliminar({
        IdCliente,
        IdUsuario,
        IdAutorizador: varIdAutorizador,
      }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      setRefreshData(true);
    }
  }


  async function actualizarAutorizadorUsuario(dataRow) {
    setLoading(true);
    const { IdUsuario, Activo } = dataRow;
    let params = {
      IdCliente: IdCliente
      , IdUsuario: IdUsuario
      , IdAutorizador: varIdAutorizador
      , Activo: Activo
      , IdUsuarioModify: usuario.username
    };
    await actualizar(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      setRefreshData(true);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerAutorizadorUsuario(dataRow) {
    setLoading(true);
    const { IdUsuario, IdCliente } = dataRow;
    await obtener({
      IdCliente,
      IdUsuario,
      IdAutorizador: varIdAutorizador
    }).then(usuarioPerfil => {
      setDataRowEditNew({ ...usuarioPerfil, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  const editarAutorizadorUsuario = dataRow => {
    const { RowIndex } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerAutorizadorUsuario(dataRow);

    setFocusedRowKeyAutorizadorUsuario(RowIndex);

  };

  const cancelarEdicionTAutorizadorUsuario = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
  };

  const viewPoppupDetalle = async (dataRow) => {
    const { IdCliente, IdUsuario } = dataRow;
    listarPerfiles(IdCliente, IdUsuario);
    //Actualizar IdPerfil
    setDataRowEditNew({ IdCliente, IdUsuario, IdPerfil: "01AP003A" })
    setIsVisiblePopUpUsuarioDetalle(true);
  };


  async function configurationCaracteristica() {
    setLoading(true);
    await obtenerSistemaConfiguracion({ IdCliente, IdConfiguracion: "ACREDITACION_AUTORI" })
      .then(result => {
        setVarCaracteristicaDefault({ Valor1: result.Valor1 })
      }).finally(() => { setLoading(false); });
  }


  async function listarPerfiles(idCliente, idUsuario) {
    setLoading(true);
    await serviceUsuarioPerfil.obtenerTodos({
      IdCliente: idCliente,
      IdPerfil: '%',
      IdUsuario: idUsuario,
      IdCaracteristica: varCaracteristicaDefault.Valor1
    }).then(data => {
      console.log("listarPerfiles", data);
      setPerfilesData(data);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }


  useEffect(() => {
    configurationCaracteristica();
  }, []);


  return <>

    <>

      {modoEdicion && (
        <>
          <AutorizadorUsuarioEditPage
            dataRowEditNew={dataRowEditNew}
            actualizarRegistro={actualizarAutorizadorUsuario}
            agregarRegistro={agregarAutorizadorUsuario}
            cancelarEdicion={cancelarEdicionTAutorizadorUsuario}
            titulo={titulo}
            gridBoxValue={gridBoxValue}
            setGridBoxValue={setGridBoxValue}

            modoEdicion={modoEdicion}
            accessButton={accessButton}
            //settingDataField={settingDataField}
            getInfo={getInfo}
            grillaAutorizadorUsuario={grillaAutorizadorUsuario}
            setGrillaAutorizadorUsuario={setGrillaAutorizadorUsuario}

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
          <AutorizadorUsuarioListPage
            editarRegistro={editarAutorizadorUsuario}
            eliminarRegistro={eliminarAutorizadorUsuario}
            nuevoRegistro={nuevoRegistro}
            cancelarEdicion={cancelarEdicion}
            seleccionarRegistro={seleccionarAutorizadorUsuario}
            focusedRowKey={autorizadorUsuariofocusedRowKey}
            setFocusedRowKeyAutorizadorUsuario={setFocusedRowKeyAutorizadorUsuario}
            getInfo={getInfo}
            showHeaderInformation={true}
            accessButton={accessButton}
            viewPoppupDetalle={viewPoppupDetalle}

            //customerDataGrid 
            uniqueId={"AutorizadorUsuarioListPage"}
            isFirstDataLoad={isFirstDataLoad}
            setIsFirstDataLoad={setIsFirstDataLoad}
            dataSource={dataSource}
            refresh={refresh}
            resetLoadOptions={resetLoadOptions}
            refreshData={refreshData}
            setRefreshData={setRefreshData}
            selected={selected}
            idAutorizador={varIdAutorizador}

          />
        </>
      )}


      <SeguridadPerfilDetalleArea
        varIdUsuario={varIdUsuario}
        perfilesData={perfilesData}
        showPopup={{ isVisiblePopUp: isVisiblePopUpUsuarioDetalle, setisVisiblePopUp: setIsVisiblePopUpUsuarioDetalle }}
        cancelar={() => setIsVisiblePopUpUsuarioDetalle(false)}
        showButton={false}
        dataRowEditNew={dataRowEditNew}
      />

      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisibleConfirm}
        setIsVisible={setIsVisibleConfirm}
        setInstance={setInstance}
        onConfirm={() => eliminarAutorizadorUsuario(selectedDelete, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />


    </>


  </>

};



export default injectIntl(WithLoandingPanel(AutorizadorUsuarioIndexPage));
