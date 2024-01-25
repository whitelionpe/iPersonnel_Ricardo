import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../../partials/components/Confirm";

import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";
//import { dateFormat, isNotEmpty } from "../../../../../../_metronic";
//import AsistenciaDetalleBuscar from "../../../../../partials/components/AsistenciaDetalleBuscar";
//import { uploadFile } from "../../../../../api/helpers/fileBase64.api";

//-customerDataGrid
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

import UsuarioListPage from './UsuarioListPage'
import UsuarioEditPage from './UsuarioEditPage'

import {
  ActualizarConfiguracionLogueo,
  serviceUser
} from "../../../../../api/seguridad/usuario.api";

export const initialFilter = {
  Activo: 'S',
  IdCliente: '',
  IdUsuario: '',
  IdPerfil: '',
  IdModulo: '',
  IdAplicacion: '',
  IdConfiguracionLogeo: ''

};

const UsuarioIndexPage = (props) => {

  const usuario = useSelector(state => state.auth.user);
  //const { IdDivision, IdCliente } = useSelector(state => state.perfil.perfilActual);
  const perfil = useSelector((state) => state.perfil.perfilActual);

  const { IdConfiguracionLogeo } = props.selected;

  const { intl, setLoading, settingDataField, getInfo, accessButton, varIdPersona, dataMenu } = props;
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));

  const [focusedRowKey, setFocusedRowKey] = useState();

  const [selected, setSelected] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});

  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  //const [pathFile, setPathFile] = useState();

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };


  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-Persona-:::::::::::::::::::::::::::::::::

  const cancelarEdicion = () => {

    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    props.cancelarEdicion();
  };


  //::::::::::::::::::::::::::::::::::::::::::::: Funciones Persona Justificacion ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  // :::::::::::::::::::::::::::::::::::::::::::::::::::::: Metodos Usuario :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: 

  async function actualizarUsuarios(listUsuarios) {
    setLoading(true);
    if (listUsuarios.length > 0) {
      listUsuarios.map(async (data) => {
        const { IdCliente, IdUsuario } = data;
        let params = {
          IdCliente: IdCliente
          , IdUsuario: IdUsuario
          , IdConfiguracionLogeo: IdConfiguracionLogeo
          , IdUsuarioModificacion: usuario.username
        };
        await ActualizarConfiguracionLogueo(params)
          .then((response) => {
            // listarAplicacionObjeto();
            setRefreshData(true);
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
          })
          .catch((err) => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
          });
      });
    }

    setLoading(false);
  }

  async function eliminarUsuario(dataRow, confirm) {
    setSelected(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdUsuario } = dataRow;
      await serviceUser.eliminar({
        IdCliente: perfil.IdCliente,
        IdUsuario: IdUsuario,
      }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        // listarUsuarios();
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });

    }
  }

  const nuevoRegistro = () => {
    // changeTabIndex(2);
    let usuario = { Activo: "S", Bloqueado: false, CaducaClave: false, PrimeraClaveCambiada: false, SuperAdministrador: false };
    setDataRowEditNew({ ...usuario, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };


  const verRegistroDblClick = async (dataRow) => {
    await obtenerUsuario(dataRow);
    setModoEdicion(true);
  };

  async function obtenerUsuario(filtro) {
    setLoading(true);
    const { IdCliente, IdUsuario } = filtro;
    await serviceUser.obtener({
      IdCliente,
      IdUsuario,
    }).then(usuario => {

      usuario.Bloqueado = usuario.Bloqueado === "S" ? true : false;
      usuario.CaducaClave = usuario.CaducaClave === "S" ? true : false;
      usuario.PrimeraClaveCambiada = usuario.PrimeraClaveCambiada === "S" ? true : false;
      usuario.SuperAdministrador = usuario.SuperAdministrador === "S" ? true : false;
      usuario.ValidarAd = usuario.ValidarAd === "S" ? true : false;

      setDataRowEditNew({ ...usuario, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


  //FILTRO- CustomerDataGrid
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();

  //Modulo
  //const [moduloData, setModuloData] = useState([]);
  const [filterData, setFilterData] = useState({ ...initialFilter });


  //Datos Principales
  const changeTabIndex = (index) => {
    handleChange(null, index);
  };

  useEffect(() => {

  }, []);

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return <>

    {modoEdicion && (
      <>
        <UsuarioEditPage
          modoEdicion={false}
          dataRowEditNew={dataRowEditNew}
          // actualizarAplicacion={actualizarAplicacion}
          actualizarUsuarios={actualizarUsuarios}
          cancelarEdicion={cancelarEdicion}
          titulo={titulo}
          accessButton={accessButton}
          settingDataField={dataMenu.datos}
          setModoEdicion={setModoEdicion}
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
        <UsuarioListPage
          eliminarRegistro={eliminarUsuario}
          nuevoRegistro={nuevoRegistro}
          verRegistroDblClick={verRegistroDblClick}
          focusedRowKey={focusedRowKey}
          setFocusedRowKey={setFocusedRowKey}
          // showHeaderInformation={false}
          selected={{ IdPerfil: "" }}

          //Propiedades del customerDataGrid 
          uniqueId={"UsuariosIndexPageListado"}
          isFirstDataLoad={isFirstDataLoad}
          setIsFirstDataLoad={setIsFirstDataLoad}
          dataSource={dataSource}
          refresh={refresh}
          resetLoadOptions={resetLoadOptions}
          refreshData={refreshData}
          setRefreshData={setRefreshData}
          accessButton={accessButton}

          // moduloData={moduloData}
          filterData={filterData}
          setFilterData={setFilterData}
          getInfo={getInfo}
          showHeaderInformation={true}
          cancelarEdicion={props.cancelarEdicion}
          filtroLocal={props.filtroLocal}
        />

        <Confirm
          message={intl.formatMessage({ id: "ALERT.REMOVE" })}
          isVisible={isVisible}
          setIsVisible={setIsVisible}
          setInstance={setInstance}
          onConfirm={() => eliminarUsuario(selectedDelete, true)}
          title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
          confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
          cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
        />
      </>
    )}

  </>
};

export default injectIntl(WithLoandingPanel(UsuarioIndexPage));
