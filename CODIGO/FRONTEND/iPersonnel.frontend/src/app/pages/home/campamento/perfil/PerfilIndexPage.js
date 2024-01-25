import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import PropTypes from 'prop-types';
import { isNotEmpty } from "../../../../../_metronic";
import { Portlet } from "../../../../partials/content/Portlet";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import ContactsIcon from '@material-ui/icons/Contacts';
import DynamicFeedIcon from '@material-ui/icons/DynamicFeed';
import BusinessIcon from '@material-ui/icons/Business';

import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";

import {
  eliminar, obtener, listar, crear, actualizar
} from "../../../../api/campamento/perfil.api";
import PerfilListPage from "./PerfilListPage";
import PerfilEditPage from "./PerfilEditPage";

import {
  listarTreeView as listarTreeViewApi,
  eliminar as eliminarCampPerfilDet,
  crear as crearCampPerfilDet
} from "../../../../api/campamento/perfilDetalle.api";

import { servicePersonaPerfil } from '../../../../api/campamento/personaPerfil.api';
//import PerfilDetalleListPage from "../perfilDetalle/PerfilDetalleListPage";
import PerfilDetalleEditPage from "../perfilDetalle/PerfilDetalleEditPage";

import {
  eliminar as eliminarCCP,
  obtener as obtenerCCP,
  listar as listarCCP,
  crear as crearCCP,
  actualizar as actualizarCCP
} from "../../../../api/campamento/companiaPerfil.api";

import PerfilCompaniaEditPage from "./PerfilCompaniaEditPage"
import PerfilCompaniaListPage from "./PerfilCompaniaListPage"
import PerfilPersonaIndexPage from "./PerfilPersonaIndexPage";

export const initialFilter = {
  IdCliente: "1",
  IdDivision: "",
  IdCompania: "",
  Compania: "",
  TipoDocumento: "",
  Documento: "",
  Pais: "",
  Contratista: "",
  Activo: "S",
  IdPerfil: ""
};


const PerfilIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();

  const [campamentosPerfil, setCampamentosPerfil] = useState([]);
  const [varIdPerfil, setVarIdPerfil] = useState("");
  const [focusedRowKey, setFocusedRowKey] = useState(0);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [selected, setSelected] = useState({
    IdCliente: perfil.IdCliente,
    IdDivision: perfil.IdDivision
  });
  const [tabIndex, setTabIndex] = useState(0);
  const handleChange = (event, newValue) => { setTabIndex(newValue); };

  const [dataRowEditNewTabs, setDataRowEditNewTabs] = useState({});
  const [modoEdicionSection, setModoEdicionSection] = useState(false);

  // const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

  const [listarTabs, setListarTabs] = useState([]);
  const [isVisibleConfirm, setIsVisibleConfirm] = useState(false);
  const [focusedRowKeyCompaniaPerfil, setfocusedRowKeyCompaniaPerfil] = useState();
  const [isNewCompaniaPerfil, setIsNewCompaniaPerfil] = useState(false);
  //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
  const [totalRowIndex, setTotalRowIndex] = useState(0);
  const [messageConfirm, setMessageConfirm] = useState("ALERT.REMOVE");
  const [forceDelete, setForceDelete] = useState(0);

  const [menus, setMenus] = useState([{
    Icon: "flaticon2-expand"
    , IdMenu: null
    //, IdModulo: null //ff
    , IdMenuPadre: null
    , Menu: intl.formatMessage({ id: "SYSTEM.MENU.OPTIONS" })
    , MenuPadre: null
    , Nivel: 0
    //, Orden: 0 //ff
    , expanded: true
    , selected: false
  }]);

  //Filtro DatGrid
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();


  //::::::::::::::::::::::::::::FUNCIONES PARA CAMPAMENTO PERFIL-:::::::::::::::::::::::::::::::::::

  async function agregarCampamentoPerfil(data) {
    setLoading(true);
    const { IdPerfil, Perfil, Activo } = data;
    let param = {
      IdPerfil: isNotEmpty(IdPerfil) ? IdPerfil.toUpperCase() : "",
      Perfil: isNotEmpty(Perfil) ? Perfil.toUpperCase() : "",
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await crear(param)
      .then(response => {
        if (response)
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        setModoEdicion(false);
        listarCampamentosPerfil();
        setRefreshData(true);
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }


  async function actualizarCampamentoPerfil(dataRow) {
    setLoading(true);
    const { IdCliente, IdDivision, IdPerfil, Perfil, Activo } = dataRow;
    let params = {
      IdPerfil: isNotEmpty(IdPerfil) ? IdPerfil.toUpperCase() : "",
      Perfil: isNotEmpty(Perfil) ? Perfil.toUpperCase() : "",
      IdCliente,
      IdDivision,
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await actualizar(params)
      .then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        setModoEdicion(false);
        listarCampamentosPerfil();
        setRefreshData(true);
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }


  async function eliminarRegistro(dataRow, confirm, force) {
    setSelected(dataRow);
    setIsVisibleConfirm(true);
    setMessageConfirm("ALERT.REMOVE");
    setForceDelete(0);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdDivision, IdPerfil } = dataRow
      await eliminar({
        IdCliente,
        IdDivision: perfil.IdDivision,
        IdPerfil: IdPerfil,
        forceDelete: isNotEmpty(force) ? 1 : 0,
        IdUsuario: usuario.username
      })
        .then(response => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
          listarCampamentosPerfil();
          setRefreshData(true);
          setFocusedRowKey();
          setVarIdPerfil("");
        })
        .catch(err => {
          console.log(err, err.response, err.response.data);
          if (!!err.response) {
            let dataError = err.response;
            let { responseException } = dataError.data;
            let { exceptionMessage } = responseException;
            let { force } = exceptionMessage;

            if (!!force) {
              forceDeleteMessage();
            } else {
              handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }
          } else {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
          }
        }).finally(() => { setLoading(false); });
    }
  }

  const forceDeleteMessage = () => {
    //EGSC
    setMessageConfirm("ALERT.REMOVE.WITHDETAILS");
    setIsVisibleConfirm(true);
    setForceDelete(1)
  }

  async function listarCampamentosPerfil() {
    /* setLoading(true);
    const { IdCliente, IdDivision } = selected;
    await listar({
      IdCliente,
      IdDivision,
      NumPagina: 0,
      TamPagina: 0
    }).then(campamentosPerfil => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setCampamentosPerfil(campamentosPerfil);
      changeTabIndex(0);
      setModoEdicion(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); }); */
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    changeTabIndex(0);
    setModoEdicion(false);
  }


  async function obtenerCampamentoPerfil() {
    setLoading(true);
    const { IdCliente, IdDivision, IdPerfil } = selected;
    await obtener({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdPerfil
    }).then(campamentoPerfil => {
      setDataRowEditNew({ ...campamentoPerfil, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    })
      .finally(() => { setLoading(false); });
  }




  const nuevoRegistro = () => {
    changeTabIndex(1);
    const { IdCliente, IdDivision } = selected;
    let campamentoPerfil = {
      Activo: "S",
      IdCliente,
      IdDivision,
      FechaRegistro: new Date().toJSON().slice(0, 10)
    };
    setDataRowEditNew({ ...campamentoPerfil, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);

  };


  const editarRegistro = async (dataRow) => {
    changeTabIndex(1);
    const { IdPerfil, RowIndex } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    //await 
    obtenerCampamentoPerfil(IdPerfil);
    setFocusedRowKey(RowIndex);
  };


  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };


  const seleccionarRegistro = dataRow => {
    const { IdPerfil, RowIndex } = dataRow;
    setModoEdicion(false);
    //Datos Principales
    setSelected(dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    if (IdPerfil != varIdPerfil) {
      setVarIdPerfil(IdPerfil);
      setFocusedRowKey(RowIndex);
    }
  }

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerCampamentoPerfil(dataRow.IdPerfil);
  };

  //::::::::::::::::::::::FUNCIONES PERFIL MENU :::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarCompaniaPerfil(selectedRow) {
    setLoading(true);
    for (let i = 0; i < selectedRow.length; i++) {

      if (isNotEmpty(selectedRow[i].IdCompania)) {
        await crearCCP({
          IdCliente: perfil.IdCliente,
          IdDivision: perfil.IdDivision,
          IdCompania: selectedRow[i].IdCompania,
          IdPerfil: varIdPerfil,
          Activo: "S",
          IdUsuario: usuario.username
        }).then(response => {
          if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
          listarCampamentoCompaniaPerfil();
        }).catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
      }
    }

    // const { IdCompania, Activo } = selectRow;
    // let param = {
    //     IdCliente : perfil.IdCliente,
    //     IdDivision : perfil.IdDivision,
    //     IdCompania: IdCompania,
    //     IdPerfil: varIdPerfil,
    //     Activo: Activo,
    //     IdUsuario: usuario.username
    // };
    // await crearCCP(param)
    //     .then(response => {
    //         if (response)
    //             handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
    //             listarCampamentoCompaniaPerfil()
    //     })
    //     .catch(err => {
    //         handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    //     }).finally(() => { setLoading(false); });
  }


  async function actualizarCompaniaPerfil(dataRow) {
    setLoading(true);
    const { IdCliente, IdDivision, IdCompania, IdPerfil, Perfil, Activo } = dataRow;
    let params = {
      IdCliente,
      IdDivision,
      IdCompania,
      IdPerfil,
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await actualizarCCP(params)
      .then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        listarCampamentoCompaniaPerfil();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function obtenerCompaniaPerfil(dataRow) {
    setLoading(true);
    const { IdCliente, IdCompania, IdPerfil } = dataRow;
    await obtenerCCP({
      IdCliente,
      IdDivision: perfil.IdDivision,
      IdCompania,
      IdPerfil
    }).then(data => {
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
      console.log("obtenerCompaniaPerfil-data:", data);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    })
      .finally(() => { setLoading(false); });
  }

  async function eliminarCompaniaPerfil(dataRow, confirm) {
    console.log("eliminarCompaniaPerfil-dataRow:", dataRow);
    setIsVisibleConfirm(true);
    setMessageConfirm("ALERT.REMOVE");
    setForceDelete(0);
    setSelected(dataRow);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdCompania, IdPerfil } = dataRow
      await eliminarCCP({
        IdCliente,
        IdDivision: perfil.IdDivision,
        IdCompania,
        IdPerfil
      })
        .then(response => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
      listarCampamentoCompaniaPerfil();
    }
  }


  async function listarCampamentoCompaniaPerfil() {
    setLoading(true);
    const { IdCliente, IdDivision, IdPerfil } = selected;
    await listarCCP({
      IdCliente,
      IdDivision,
      IdCompania: '%',
      IdPerfil,
      NumPagina: 0,
      TamPagina: 0
    }).then(data => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(data);
      setModoEdicion(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const seleccionarCompaniaPerfil = dataRow => {
    const { RowIndex } = dataRow;
    setfocusedRowKeyCompaniaPerfil(RowIndex);
  };

  const editarCompaniaPerfil = dataRow => {
    const { RowIndex } = dataRow;
    setModoEdicion(true);
    setIsNewCompaniaPerfil(false);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setDataRowEditNew(dataRow);
    obtenerCompaniaPerfil(dataRow);
    setfocusedRowKeyCompaniaPerfil(RowIndex);
  };

  const nuevoCompaniaPerfil = (e) => {
    let nuevo = { Activo: "S" };

    setDataRowEditNew({ ...nuevo, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setIsNewCompaniaPerfil(true);
  };

  /**********************--Configuración de acceso de botones*************/
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 4; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }
  /***********************************************************************/

  useEffect(() => {
    //console.log(props.dataMenu);

    listarCampamentosPerfil();
    loadControlsPermission();
  }, []);


  //:::::::::::::::::::::::::::TREE VIEW ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function listarTreeView() {
    setLoading(true);
    const { IdCliente, IdDivision } = selected;
    //let perfilDetalles = 
    await listarTreeViewApi({
      IdCliente
      , IdDivision: perfil.IdDivision
      , IdPerfil: varIdPerfil
    }).then(perfilDetalles => {
      console.log("listarTreeView|perfilDetalles:", perfilDetalles);
      setMenus(perfilDetalles);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  const seleccionarNodo = (dataRow) => {
    const { IdPerfil } = dataRow;
  }


  //::::::::::::::::::::::FUNCION CAMPAMENTO DETALLE:::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarCampPerfilDetalle(perfilDetalle) {
    //Paso 1- Eliminar configuración
    setLoading(true);
    await eliminarRegistroCampPerfilDetalle(perfilDetalle[0]).then(() => {
      let promesas = [];
      setLoading(true);
      for (let i = 0; i < perfilDetalle.length; i++) {
        let node = perfilDetalle[i];
        const { IdCliente, IdDivision, IdPerfil, IdCampamento, IdModulo, IdHabitacion, Activo } = node;
        let params = {
          IdPerfil
          , IdCampamento: isNotEmpty(IdCampamento) ? IdCampamento.toUpperCase() : ""
          , IdModulo: isNotEmpty(IdModulo) ? IdModulo.toUpperCase() : ""
          , IdHabitacion: isNotEmpty(IdHabitacion) ? IdHabitacion.toUpperCase() : ""
          , Activo: "S"
          , IdCliente
          , IdDivision
          , IdUsuario: usuario.username
        };
        // Paso 2- Insertar configuración
        promesas.push(crearCampPerfilDet(params));
      }

      Promise.all(promesas)
        .then(res => {
          let tot_recibidos = res.length;

          if (tot_recibidos >= 1) {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicionSection(false);
            listarTreeView();
          }

          setLoading(false);
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
          setLoading(false);
        }).finally(() => { setLoading(false); });

    });
  }

  async function eliminarRegistroCampPerfilDetalle(perfilDetalle) {
    setLoading(true);
    const { IdPerfil, IdCampamento, IdModulo, IdHabitacion, IdCliente, IdDivision } = perfilDetalle;
    await eliminarCampPerfilDet({
      IdPerfil,
      IdCampamento,
      IdModulo,
      IdHabitacion,
      //IdCama,
      IdCliente,
      IdDivision,
      IdUsuario: usuario.username
    }).then(() => {
      // handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  //Datos Principales
  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  const cancelarEdicionTabs = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const getInfo = () => {
    const { IdPerfil, Perfil } = selected;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdPerfil, colSpan: 2 },
      { text: [intl.formatMessage({ id: "CAMP.PROFILE.PROFILE" })], value: Perfil, colSpan: 4 }
    ];

  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function eliminarListRowTab(selected, confirm, index) {
    let currentTab = tabIndex;
    switch (currentTab) {
      case 0:
        if (index === 0) {
          eliminarRegistro(selected, confirm);
        } else {
          eliminarRegistro(selected, confirm, 1);
        }
        break;
      case 3:
        eliminarCompaniaPerfil(selected, confirm);
        break;
    }
  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "CAMP.PROFILE.DETAIL.DETAIL",
      "ADMINISTRATION.COMPANY.COMPANY",
      "CAMP.PERSON.PROFILE.LIST"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdPerfil) ? false : true;
    //return true;
  }

  const tabContent_PerfilListPage = () => {
    return <PerfilListPage

      editarRegistro={editarRegistro}
      eliminarRegistro={eliminarRegistro}
      nuevoRegistro={nuevoRegistro}
      seleccionarRegistro={seleccionarRegistro}
      verRegistroDblClick={verRegistroDblClick}
      focusedRowKey={focusedRowKey}
      setFocusedRowKey={setFocusedRowKey}
      //::::::::::::::::::::::::::::::::::::::::
      isFirstDataLoad={isFirstDataLoad}
      setIsFirstDataLoad={setIsFirstDataLoad}
      dataSource={dataSource}
      refresh={refresh}
      resetLoadOptions={resetLoadOptions}
      refreshData={refreshData}
      setRefreshData={setRefreshData}
      showButtons={true}
      setVarIdPerfil={setVarIdPerfil}
      totalRowIndex={totalRowIndex}
      setTotalRowIndex={setTotalRowIndex}
    />
  }

  const tabContent_PerfilEditPage = () => {
    return <>
      <PerfilEditPage
        titulo={titulo}
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        actualizarCampamentoPerfil={actualizarCampamentoPerfil}
        agregarCampamentoPerfil={agregarCampamentoPerfil}
        cancelarEdicion={cancelarEdicion}
        settingDataField={dataMenu.datos}
        accessButton={accessButton}
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
  }

  const tabContent_PerfilDetalleEditPage = () => {
    return <>
      <PerfilDetalleEditPage
        dataRowEditNew={dataRowEditNewTabs}
        //actualizarCampPerfilDetalle={actualizarCampPerfilDetalle}
        agregarCampPerfilDetalle={agregarCampPerfilDetalle}
        cancelarEdicion={cancelarEdicion}
        menus={menus}
        getInfo={getInfo}
        accessButton={accessButton}
      />

    </>
  }

  const tabContent_PerfilCompaniaListPage = () => {
    return <>
      {modoEdicion && (
        <>
          <PerfilCompaniaEditPage
            dataRowEditNew={dataRowEditNew}
            titulo={titulo}
            modoEdicion={modoEdicion}
            menus={menus}
            agregarCompaniaPerfil={agregarCompaniaPerfil}
            actualizarCompaniaPerfil={actualizarCompaniaPerfil}
            cancelarEdicion={cancelarEdicionTabs}
            accessButton={accessButton}
            settingDataField={dataMenu.datos}
            varIdPerfil={varIdPerfil}
            // :: DataGrid
            isFirstDataLoad={isFirstDataLoad}
            setIsFirstDataLoad={setIsFirstDataLoad}
            dataSource={dataSource}
            refresh={refresh}
            resetLoadOptions={resetLoadOptions}
            refreshData={refreshData}
            setRefreshData={setRefreshData}
            isNewCompaniaPerfil={isNewCompaniaPerfil}

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
          <PerfilCompaniaListPage
            companiaPerfilData={listarTabs}
            editarRegistro={editarCompaniaPerfil}
            eliminarRegistro={eliminarCompaniaPerfil}
            nuevoRegistro={nuevoCompaniaPerfil}
            cancelarEdicion={cancelarEdicion}
            seleccionarRegistro={seleccionarCompaniaPerfil}
            focusedRowKey={focusedRowKeyCompaniaPerfil}
            getInfo={getInfo}
            accessButton={accessButton}
          />
        </>
      )}
    </>
  }

  async function listarCampamentoPersonaPerfil() {
    //EGSC
    setLoading(true);

    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setModoEdicion(false);
    await servicePersonaPerfil.listarbyperfil({
      IdDivision: perfil.IdDivision,
      IdPerfil: varIdPerfil,
      IdCompania: ''
    }).then(data => {
      console.log("data", { data });
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(data);
      setModoEdicion(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });

    setLoading(false);
    // await listarCCP({
    //   IdCliente,
    //   IdDivision,
    //   IdCompania: '%',
    //   IdPerfil,
    //   NumPagina: 0,
    //   TamPagina: 0
    // }).then(data => {
    //   setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    //   setListarTabs(data);
    //   setModoEdicion(false);
    // }).catch(err => {
    //   handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    // }).finally(() => { setLoading(false); });
  }


  const tabContent_PerfilPersonas = () => {
    return <PerfilPersonaIndexPage
      intl={intl}
      setLoading={setLoading}
      getInfo={getInfo}
      accessButton={accessButton}
      varIdPerfil={varIdPerfil}
      dataSource={listarTabs}
      cancelarEdicion={cancelarEdicion}
      settingDataField={dataMenu.datos}
      refrescarGrilla={listarCampamentoPersonaPerfil}
    />;
  }
  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "CAMP.PROFILE.MENU" })}
        submenu={intl.formatMessage({ id: "CAMP.PROFILE.MAINTENANCE" })}
        subtitle={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
          },
          {
            label: intl.formatMessage({ id: "CAMP.PROFILE.PROFILE" }),
            icon: <ContactsIcon fontSize="large" />,
            onClick: (e) => { obtenerCampamentoPerfil(selected) },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "CAMP.PROFILE.DETAIL.DETAIL" }),
            icon: <DynamicFeedIcon fontSize="large" />,
            onClick: (e) => { listarTreeView() },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }),
            icon: <BusinessIcon fontSize="large" />,
            onClick: () => { listarCampamentoCompaniaPerfil() },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          },
          {
            label: intl.formatMessage({ id: "CASINO.PERSON.GROUP.PERSONS" }),
            icon: <PeopleAltOutlinedIcon fontSize="large" />,
            onClick: () => { listarCampamentoPersonaPerfil() },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true

          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_PerfilListPage(),
            tabContent_PerfilEditPage(),
            tabContent_PerfilDetalleEditPage(),
            tabContent_PerfilCompaniaListPage(),
            tabContent_PerfilPersonas()
          ]
        }
      />

      <Confirm
        message={intl.formatMessage({ id: messageConfirm })}
        isVisible={isVisibleConfirm}
        setIsVisible={setIsVisibleConfirm}
        setInstance={setInstance}
        onConfirm={() => eliminarListRowTab(selected, true, forceDelete)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />
    </>
  );
};


export default injectIntl(WithLoandingPanel(PerfilIndexPage));
