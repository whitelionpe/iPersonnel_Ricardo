import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleInfoMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesTab } from "../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";

import { useSelector } from "react-redux";
import { isNotEmpty } from "../../../../../_metronic";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import { servicePerfil } from "../../../../api/seguridad/perfil.api";
import PerfilListPage from "./PerfilListPage";
import PerfilEditPage from "./PerfilEditPage";

import {
  serviceUsuarioPerfil // eliminar as eliminarUsuario, obtener as obtenerUsuario, listar as listarUsuario, crear as crearUsuario, actualizar as actualizarUsuario 
} from "../../../../api/seguridad/usuarioPerfil.api";
import UsuarioPerfilEditPage from "./UsuarioPerfilEditPage";

import UsuarioPerfilListPage from "./UsuarioPerfilListPage";

import { eliminar as eliminarMenu, eliminarAll as eliminarMenuTodos, validarEliminar as validarEliminarMenu, listar as listarMenu, crear as crearMenu, listarTreeview } from "../../../../api/seguridad/perfilMenu.api";
//import { eliminar as eliminarMenuObjeto, crear as crearMenuObjeto } from "../../../../api/seguridad/perfilMenuObjeto.api";
import { obtenerTodos as listaModulos, obtenerModuloConLicencia } from "../../../../api/sistema/modulo.api";

import PerfilMenuEditPage from "./PerfilMenuEditPage";
import PerfilMenuListPage from "./PerfilMenuListPage";

import { eliminar as eliminarPC, obtener as obtenerPC, listar as listarPC, crear as crearPC, actualizar as actualizarPC, listarCaracteristicas } from "../../../../api/seguridad/perfilCaracteristica.api";
import PerfilCaracteristicaEditPage from "./PerfilCaracteristicaEditPage";
import PerfilCaracteristicaListPage from "./PerfilCaracteristicaListPage";

import { listar as listarUnidad, crear as crearUnidad, listarTreeview as listarTreeviewUnidad } from "../../../../api/seguridad/unidadOrganizativa.api";
//import { obtenerTodos as listaUnidadOrganizativa } from "../../../../api/administracion/unidadOrganizativa.api";
import PerfilUnidadOrganizativaEditPage from "./PerfilUnidadOrganizativaEditPage";

import {
  eliminar as eliminarDivision, obtener as obtenerDivision, listar as listarDivision, crear as crearDivision, actualizar as actualizarDivision
} from "../../../../api/seguridad/perfilDivision.api";
import PerfilDivisionListPage from "./PerfilDivisionListPage";
import PerfilDivisionEditPage from "./PerfilDivisionEditPage";

// import Tabs from '@material-ui/core/Tabs';
// import Tab from '@material-ui/core/Tab';
// import PropTypes from 'prop-types';

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import PersonIcon from '@material-ui/icons/Person';
import SupervisorAccount from '@material-ui/icons/SupervisorAccount';
//import AssignmentInd from '@material-ui/icons/AssignmentInd';
//import RecentActors from '@material-ui/icons/RecentActors';
//import AccessibilityNew from '@material-ui/icons/AccessibilityNew';
import Business from '@material-ui/icons/Business';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import DynamicFeedIcon from '@material-ui/icons/DynamicFeed';

//-customerDataGrid Star
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

//import HeaderInformation from "../../../../partials/components/HeaderInformation";
import SeguridadUsuarioBuscar from "../../../../partials/components/SeguridadUsuarioBuscar";

import BeenhereIcon from '@material-ui/icons/Beenhere';
import ProteccionDatosListPage from '../proteccionDatos/ProteccionDatosListPage';
import ProteccionDatosEditPage from '../proteccionDatos/ProteccionDatosEditPage';

import {
  crear as crearProteccion,
  listarseleccionados as listarProteccionCheck,
  eliminar as eliminarProteccion,
  eliminarTodos as eliminarTodosProteccion,
} from "../../../../api/seguridad/protecciondatos.api";

import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
//import { serviceCaracteristica } from "../../../../api/seguridad/caracteristica.api";
//import { storeFiltrar } from "../../../../api/seguridad/usuario.api";

export const initialFilter = {

  IdCliente: '',
  IdCompania: '',
  IdUsuario: '',
  NombreCompleto: '',
  Documento: '',
  Correo: '',
  ConfiguracionLogeo: '',
  IdConfiguracionLogeo: '',
  IdPerfil: '',
  IdModulo: '',
  IdAplicacion: '',
  Contratista: '',
  Activo: 'S',
};

const PerfilIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;

  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [focusedRowKey, setFocusedRowKey] = useState();
  const [focusedRowKeyUsuarioPerfil, setFocusedRowKeyUsuarioPerfil] = useState();
  const [focusedRowKeyPerfilMenu, setFocusedRowKeyPerfilMenu] = useState();
  const [focusedRowKeyPerfilCaracteristica, setFocusedRowKeyPerfilCaracteristica] = useState();

  //=========================REFRESH DATATABLE===================================================
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);
  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();
  //============================================================================
  const [moduloData, setModuloData] = useState([]);
  const [selected, setSelected] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [modoEdicionMenu, setModoEdicionMenu] = useState(false);
  const [listarTabs, setListarTabs] = useState([]);
  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);
  const [isVisibleConfirm, setIsVisibleConfirm] = useState(false);
  const [instance, setInstance] = useState({});
  const [focusedRowKeyDivision, setFocusedRowKeyDivision] = useState();
  const [menus, setMenus] = useState([{
    Icon: "flaticon2-expand"
    , IdMenu: null
    , IdModulo: null
    , IdMenuPadre: null
    , Menu: intl.formatMessage({ id: "SYSTEM.MENU.OPTIONS" })
    , MenuPadre: null
    , Nivel: 0
    , Orden: 0
    , expanded: true
  }]);
  const [unidadOrganizativaTreeView, setUnidadOrganizativaTreeView] = useState([{
    Icon: "flaticon2-expand"
    , IdMenu: null
    , IdModulo: null
    , IdMenuPadre: null
    , Menu: intl.formatMessage({ id: "SYSTEM.MENU.OPTIONS" })
    , MenuPadre: null
    , Nivel: 0
    , Orden: 0
    , expanded: true
  }]);
  const [varIdPerfil, setVarIdPerfil] = useState("");
  const [totalRowIndex, setTotalRowIndex] = useState(0);


  const handleChange = (event, newValue) => {
    //Estado cambio de tabs
    setTabIndex(newValue);
  };

  //FILTRO- CustomerDataGrid
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);

  //Popup Usuarios
  const [visiblePopUpUsuarios, setVisiblePopUpUsuarios] = useState(false);

  //Conf Botones 
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 8;
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  //::::::::::::::::::::::::::::FUNCIONES PARA GESTION PERFIL-:::::::::::::::::::::::::::::::::::

  async function agregarPerfil(dataRow) {
    setLoading(true);
    const { IdPerfil, Perfil, AutorizacionAutomatica, IdCaracteristica, Activo,AplicaUnidadOrganizativa } = dataRow;
    let param = {
      IdCliente: perfil.IdCliente,
      IdPerfil: isNotEmpty(IdPerfil) ? IdPerfil.toUpperCase() : "",
      Perfil: isNotEmpty(Perfil) ? Perfil.toUpperCase() : "",
      TipoPerfil: "",// isNotEmpty(TipoPerfil) ? TipoPerfil.toUpperCase() : "",
      IdCaracteristica: isNotEmpty(IdCaracteristica) ? IdCaracteristica : "",
      AutorizacionAutomatica: isNotEmpty(AutorizacionAutomatica) ? AutorizacionAutomatica ? "S" : "N" : "N",
      AplicaUnidadOrganizativa: isNotEmpty(AplicaUnidadOrganizativa) ? AplicaUnidadOrganizativa:"N",
       
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await servicePerfil.crear(param)
      .then(response => {
        if (response)
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        listarPerfiles();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function actualizarPerfil(dataRow) {
    setLoading(true);
    const { IdPerfil, Perfil, AutorizacionAutomatica, IdCaracteristica, Activo ,AplicaUnidadOrganizativa} = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdPerfil: isNotEmpty(IdPerfil) ? IdPerfil.toUpperCase() : "",
      Perfil: isNotEmpty(Perfil) ? Perfil.toUpperCase() : "",
      TipoPerfil: "",//isNotEmpty(TipoPerfil) ? TipoPerfil.toUpperCase() : "",
      IdCaracteristica: isNotEmpty(IdCaracteristica) ? IdCaracteristica : "",
      AutorizacionAutomatica: isNotEmpty(AutorizacionAutomatica) ? AutorizacionAutomatica ? "S" : "N" : "N", 
      AplicaUnidadOrganizativa: isNotEmpty(AplicaUnidadOrganizativa) ? AplicaUnidadOrganizativa:"N",
      Activo,
      IdUsuario: usuario.username
    };
    await servicePerfil.actualizar(params)
      .then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        listarPerfiles();
        setModoEdicion(false);
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisibleConfirm(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdPerfil } = selectedDelete;
      await servicePerfil.eliminar({
        IdCliente: IdCliente,
        IdPerfil: IdPerfil
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarPerfiles();
    }
  }

  async function listarPerfiles() {
    //setModoEdicion(false);
    setRefreshData(true);
    changeTabIndex(0);
  }

  async function obtenerPerfil(filtro) {

    setLoading(true);
    const { IdCliente, IdPerfil } = filtro;
    await servicePerfil.obtener({
      IdCliente: perfil.IdCliente,
      IdPerfil: IdPerfil
    }).then(perfiles => {
      const { AutorizacionAutomatica } = perfiles;
      console.log("JDL-AutorizacionAutomatica,",AutorizacionAutomatica);
      console.log("obtener Perfiles", perfiles);
      setDataRowEditNew({ ...perfiles, esNuevoRegistro: false, AutorizacionAutomatica: AutorizacionAutomatica === "S" ? true : false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const nuevoRegistro = () => {
    changeTabIndex(1);
    let perfil = {
      Activo: "S",
      FechaRegistro: new Date().toJSON().slice(0, 10),
      AplicaUnidadOrganizativa:"S"
    };
    setDataRowEditNew({ ...perfil, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setVarIdPerfil("");

  };


  const editarRegistro = dataRow => {
    changeTabIndex(1);
    const { IdPerfil } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerPerfil(dataRow);
  };

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    setVarIdPerfil("");
  };


  const seleccionarRegistro = dataRow => {
    const { IdPerfil, Perfil, RowIndex } = dataRow;
    setSelected(dataRow);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));

    setVarIdPerfil(IdPerfil);
    setFocusedRowKey(RowIndex);

  }

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerPerfil(dataRow);
  };


  //::::::::::::::::::::::FUNCIONES USUARIO PERFIL:::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarPerfilUsuario(usuarios) {
    setLoading(true);

    usuarios.map(async (data) => {
      const { IdUsuario, Activo } = data;
      let params = {
        IdCliente: perfil.IdCliente
        , IdUsuario: IdUsuario
        , IdPerfil: varIdPerfil
        , Activo: Activo
        , IdUsuarioModify: usuario.username
      };
      await serviceUsuarioPerfil.crear(params).then(response => {
        if (response)
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        //setModoEdicion(false);
        //listarPerfilUsuario();
        setRefreshData(true);
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    });
  }

  async function actualizarPerfilUsuario(dataRow) {
    setLoading(true);
    const { IdUsuario, Activo } = dataRow;
    let params = {
      IdCliente: perfil.IdCliente
      , IdUsuario: IdUsuario
      , IdPerfil: varIdPerfil
      , Activo: Activo
      , IdUsuarioModify: usuario.username
    };
    await serviceUsuarioPerfil.actualizar(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      //setModoEdicion(false);
      //listarPerfilUsuario();
      setRefreshData(true);
      listarPerfiles();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarPerfilUsuario(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisibleConfirm(true);
    if (confirm) {
      setLoading(true);
      const { IdPerfil, IdUsuario, IdCliente } = dataRow;
      await serviceUsuarioPerfil.eliminar({
        IdCliente,
        IdUsuario,
        IdPerfil: varIdPerfil,
      }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        // listarPerfiles(); 
        setRefreshData(true);
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    }
  }



  async function obtenerPerfilUsuario(dataRow) {
    setLoading(true);
    const { IdPerfil, IdUsuario, IdCliente } = dataRow;
    await serviceUsuarioPerfil.obtener({
      IdCliente,
      IdUsuario,
      IdPerfil: varIdPerfil
    }).then(usuarioPerfil => {
      setDataRowEditNew({ ...usuarioPerfil, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const seleccionarRegistroUsuarioPerfil = dataRow => {
    const { RowIndex } = dataRow;
    setFocusedRowKeyUsuarioPerfil(RowIndex);
  };


  const editarRegistroUsuarioPerfil = dataRow => {
    const { RowIndex } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    obtenerPerfilUsuario(dataRow);
    setFocusedRowKeyUsuarioPerfil(RowIndex);

  };

  const nuevoRegistroPopupUsuarios = () => {
    setVisiblePopUpUsuarios(true);
  }


  //::::::::::::::::::::::FUNCIONES PERFIL MENU :::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarPerfilMenu(dataRow, arrayMenu, arrayObjeto, arrayProtection) {
    try {

      const { IdModulo, IdAplicacion } = dataRow;

      let params = {
        IdCliente: perfil.IdCliente
        , IdPerfil: varIdPerfil
        , IdModulo: IdModulo
        , IdAplicacion: IdAplicacion
        , IdUsuario: usuario.username
      };

      let menus = arrayMenu.filter(data => { return !data.Edit });
      let menusDelete = arrayMenu.filter(data => { return data.Edit && data.selected === false });
      let objetos = arrayObjeto.filter(data => { return !data.Edit && data.selected });
      let objetosDelete = arrayObjeto.filter(data => { return data.Edit && data.selected === false });

      await crearMenu({
        informationBase: params,
        menus,
        menusDelete,
        objetos,
        objetosDelete,
        arrayProtection
      }).finally(() => { setLoading(false); listarPerfilMenu(); });

    } catch (err) {
      setLoading(false);
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }
  }


  async function obtenerPerfilMenuTreeview(dataRow, esNuevo) {
    setLoading(true);
    const { IdModulo, IdAplicacion } = dataRow;
    await listarTreeview({
      IdCliente: perfil.IdCliente,
      IdPerfil: varIdPerfil,
      IdModulo: IdModulo,
      IdAplicacion: IdAplicacion,

    }).then(menus => {
      //setModoEdicion(false);
      if (menus.length === 0) {//SIN DATA
        setMenus([{
          Activo: "S"
          , icon: "flaticon2-expand"
          , IdMenu: null
          , IdMenuPadre: null
          , IdModulo: IdModulo
          , Menu: intl.formatMessage({ id: "SYSTEM.MENU.NODATA" })
          , MenuPadre: null
          , expanded: true
        }])
      } else {
        setMenus(menus);
        if (esNuevo) {
          let result = menus.filter(data => { return data.selected });
          if (result.length > 0) {
            setModoEdicionMenu(true);
            handleInfoMessages("", "La aplicación ya está asignado al perfil");
          } else {
            setModoEdicionMenu(false);
          }
        }
      }
    }).finally(() => { setLoading(false); })

  }

  async function eliminarPerfilMenuTodo(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisibleConfirm(true);
    if (confirm) {
      setLoading(true);
      const { IdModulo, IdAplicacion, IdMenu, IdObjeto } = dataRow;

      //Elimando perfil menú con todo su referencia.
      await eliminarMenuTodos({
        IdCliente: perfil.IdCliente
        , IdPerfil: varIdPerfil
        , IdModulo
        , IdAplicacion
        , IdMenu
        , IdObjeto
      }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarPerfilMenu();
    }
  }

  async function listarPerfilMenu() {

    setLoading(true);
    await listarMenu({
      IdCliente: perfil.IdCliente,
      IdPerfil: varIdPerfil,
      IdModulo: '%',
      IdAplicacion: '%',
      IdMenu: '%',
      NumPagina: 0,
      TamPagina: 0
    }).then(PerfilMenu => {
      //setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setModoEdicion(false);
      setModoEdicionMenu(false);
      setListarTabs(PerfilMenu);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  const seleccionarPerfilMenu = dataRow => {
    const { RowIndex } = dataRow;
    setFocusedRowKeyPerfilMenu(RowIndex);
  };

  const editarPerfilMenu = dataRow => {
    const { RowIndex } = dataRow;
    setModoEdicion(true);
    //setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setDataRowEditNew(dataRow);
    obtenerPerfilMenuTreeview(dataRow);
    setFocusedRowKeyPerfilMenu(RowIndex);
  };

  const nuevoPerfilMenu = (e) => {
    let nuevo = { Activo: "S" };
    setDataRowEditNew({ ...nuevo, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setModoEdicionMenu(true);
    setMenus([{
      Activo: "S"
      , icon: "flaticon2-expand"
      , IdMenu: null
      , IdMenuPadre: null
      , IdModulo: ''
      , Menu: intl.formatMessage({ id: "SYSTEM.MENU.NODATA" })
      , MenuPadre: null
      , expanded: true
    }]);
  };


  //::::::::::::::::::::::FUNCIONES PERFIL CARACTERISTICA :::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarPerfilCaracteristica(dataRow) {
    setLoading(true);
    const { IdCaracteristica, Activo } = dataRow;
    let params = {
      IdCliente: perfil.IdCliente
      , IdPerfil: varIdPerfil
      , IdCaracteristica: IdCaracteristica
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await crearPC(params).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarPerfilCaracteristica();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function actualizarPerfilCaracteristica(dataRow) {
    setLoading(true);
    const { IdCaracteristica, Activo } = dataRow;
    let params = {
      IdCliente: perfil.IdCliente
      , IdPerfil: varIdPerfil
      , IdCaracteristica: IdCaracteristica
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await actualizarPC(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarPerfilCaracteristica();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistroPerfilCaracteristica(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisibleConfirm(true);
    if (confirm) {

      setLoading(true);
      const { IdCliente, IdPerfil, IdCaracteristica } = dataRow;
      await eliminarPC({
        IdCliente: IdCliente
        , IdPerfil: IdPerfil
        , IdCaracteristica: IdCaracteristica
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarPerfilCaracteristica();
    }
  }

  async function listarPerfilCaracteristica() {
    setLoading(true);
    setModoEdicion(false);
    await listarPC({
      IdCliente: perfil.IdCliente,
      IdPerfil: varIdPerfil,
      NumPagina: 0,
      TamPagina: 0
    }).then(data => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(data);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerPerfilCaracteristica(dataRow) {
    setLoading(true);
    const { IdCliente, IdPerfil, IdCaracteristica } = dataRow;
    await obtenerPC({
      IdCliente: IdCliente
      , IdPerfil: IdPerfil
      , IdCaracteristica: IdCaracteristica
    }).then(data => {
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const seleccionarPerfilCaracteristica = dataRow => {
    const { RowIndex } = dataRow;
    setFocusedRowKeyPerfilCaracteristica(RowIndex);
  };

  const editarRegistroPerfilCaracteristica = dataRow => {
    const { RowIndex } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerPerfilCaracteristica(dataRow);
    setFocusedRowKeyPerfilCaracteristica(RowIndex);
  };

  //::::::::::::::::::::::FUNCIONES PERFIL UNIDAD ORGANIZATIVA :::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarPerfilUnidadOrganizativa(dataRow, arraysCode) {
    setLoading(true);

    const { IdUnidadOrganizativa, Activo } = dataRow;
    let params = {
      IdCliente: perfil.IdCliente
      , IdPerfil: varIdPerfil
      , IdUnidadOrganizativa: IdUnidadOrganizativa
      , Activo: Activo
      , IdUsuario: usuario.username
      , ArraysCode: arraysCode
    };
    await crearUnidad(params).then(response => {
      if (response === "")
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarPerfilUnidadOrganizativa();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function listarPerfilUnidadOrganizativa() {
    setLoading(true);
    listarPerfilUnidadOrganizativaTreeView();
    await listarUnidad({
      IdCliente: perfil.IdCliente,
      IdPerfil: varIdPerfil,
      NumPagina: 0,
      TamPagina: 0
    }).then(data => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(data);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }


  //::MANTENIMIENTO DE PERFIL DIVISIÓN:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarPerfilDivision(division) {
    setLoading(true);
    const { IdDivision, IdPerfil, Activo } = division;
    let data = {
      IdCliente: perfil.IdCliente
      , IdDivision: isNotEmpty(IdDivision) ? IdDivision.toUpperCase() : ""
      , IdPerfil: varIdPerfil
      , Activo
      , IdUsuario: usuario.username
    };
    await crearDivision(data).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarPerfilDivision();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarPerfilDivision(division) {
    setLoading(true);
    const { IdDivision, IdPerfil, Activo } = division;
    let data = {
      IdCliente: perfil.IdCliente
      , IdDivision: isNotEmpty(IdDivision) ? IdDivision.toUpperCase() : ""
      , IdPerfil: varIdPerfil
      , Activo
      , IdUsuario: usuario.username
    };
    await actualizarDivision(data).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarPerfilDivision();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarPerfilDivision(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisibleConfirm(true);
    if (confirm) {

      setLoading(true);
      const { IdDivision, IdCliente, IdPerfil } = dataRow;
      await eliminarDivision({
        IdDivision,
        IdCliente,
        IdPerfil
        //IdUsuario: usuario.username
      }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });

      listarPerfilDivision();
    }
  }

  async function listarPerfilDivision() {
    setLoading(true);
    setModoEdicion(false);
    const { IdCliente, IdPerfil } = selected;
    await listarDivision({
      IdCliente
      , IdDivision: '%'
      , IdPerfil
      , numPagina: 0
      , tamPagina: 0
    }).then(data => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(data);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function obtenerPerfilDivision(filtro) {
    setLoading(true);
    const { IdDivision, IdCliente, IdPerfil } = filtro;
    await obtenerDivision({
      IdDivision, IdCliente, IdPerfil
    }).then(perfildivision => {
      setDataRowEditNew({ ...perfildivision, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const editarRegistroPerfilDivision = async (dataRow) => {
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    await obtenerPerfilDivision(dataRow);
  };


  const nuevoRegistroPerfilDivision = (dataRow) => {
    let nuevoDivision = {};
    const { IdDivision, IdCliente, IdPerfil } = dataRow;
    if (isNotEmpty(IdDivision)) {
      nuevoDivision = {
        Activo: "S", IdCliente: IdCliente, IdDivision: IdDivision, IdPerfil
      };
    } else {
      nuevoDivision = {
        Activo: "S", IdPerfil: ""
      };
    }
    setDataRowEditNew({ ...nuevoDivision, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const seleccionarRegistroDivision = dataRow => {
    const { RowIndex } = dataRow;
    setFocusedRowKeyDivision(RowIndex);
  };


  //::::::::::::::::::::::::::::: FUNCTION GLOBAL TABS :::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const nuevoRegistroTabs = (e) => {
    let nuevo = { Activo: "S" };
    setDataRowEditNew({ ...nuevo, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setMenus([{
      Icon: "flaticon2-expand"
      , IdMenu: null
      , IdModulo: null
      , IdMenuPadre: null
      , Menu: intl.formatMessage({ id: "SYSTEM.MENU.OPTIONS" })
      , MenuPadre: null
      , Nivel: 0
      , Orden: 0
      , expanded: true
    }]);

  };



  const cancelarEdicionTabs = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  //Datos Principales
  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  const getInfo = () => {
    const { IdPerfil, Perfil } = selected;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdPerfil, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ACCESS.PROFILE" })], value: Perfil, colSpan: 4 }
    ];

  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::



  async function listarModulo() {
    let data = await obtenerModuloConLicencia({
      IdCliente: perfil.IdCliente
    }
    ).catch(err => { handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err) });
    setModuloData(data);
  }


  // async function listar_Caracteristicas() {
  //   let data = await serviceCaracteristica.listar().catch(err => { handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err) });
  //   setCaracteristicaData(data);
  // }

  async function listarPerfilUnidadOrganizativaTreeView() {
    setLoading(true);
    await listarTreeviewUnidad({
      IdCliente: perfil.IdCliente,
      IdPerfil: varIdPerfil,
    }).then(dataTreeView => {
      if (!isNotEmpty(dataTreeView)) {
        //Sin data , mostrar por defecto.
        setUnidadOrganizativaTreeView([{
          Activo: "S"
          , icon: "flaticon2-expand"
          , IdMenu: null
          , IdMenuPadre: null
          , IdModulo: ""
          , Menu: "-SIN DATOS-"
          , MenuPadre: null
          , expanded: true
        }])
      } else {
        setUnidadOrganizativaTreeView(dataTreeView);
      }

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => setLoading(false));

  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function eliminarListRowTab(rowData, confirm) {
    let currentTab = tabIndex;

    switch (currentTab) {
      case 0:
        eliminarRegistro(rowData, confirm);
        break;
      case 2:
        eliminarPerfilMenuTodo({ ...rowData, ...{ IdMenu: '%' } }, confirm);
        break;
      // case 4:
      //   eliminarRegistroPerfilCaracteristica(rowData, confirm);
      //   break;
      case 5:
        eliminarPerfilDivision(rowData, confirm);
        break;
      case 6:
        eliminarPerfilUsuario(rowData, confirm);
        break;
    }
  }

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  useEffect(() => {
    listarPerfiles();
    listarModulo();
    //listar_Caracteristicas();
    loadControlsPermission();
    //listar_UnidadOrganizativa();
  }, []);



  //::::  PROTECCION DE DATOS     :::::::::::::::::::::::::::::::::::::::::::::::::::
  const cargarProteccionDatos = (dataRow) => {
    let { IdModulo, IdAplicacion } = dataRow;
    setDataRowEditNew({ IdCliente: perfil.IdCliente, IdPerfil: varIdPerfil, IdModulo, IdAplicacion });
    setModoEdicion(true);
  }

  const agregarDatosProteccion = async (dataRow) => {
    let { IdPerfil, IdModulo, IdAplicacion } = dataRowEditNew;
    let cont_rows = 0
    let isOk = false;
    let msj_error = '';
    let errores = false;
    setLoading(true);

    let param = {
      IdCliente: perfil.IdCliente,
      IdPerfil,
      IdModulo,
      IdAplicacion,
      IdMenu: dataRow.IdMenu
    }

    await eliminarTodosProteccion(param)
      .then(() => { isOk = true })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });

    if (isOk) {
      for (let i = 0; i < dataRow.Datos.length; i++) {
        await crearProteccion({
          ...param,
          IdMenu: dataRow.IdMenu,
          Campo: dataRow.Datos[i],
          IdUsuario: usuario.username
        })
          .then(() => {
            cont_rows++;
          })
          .catch(err => {
            errores = true;
            msj_error = msj_error + `${param.Campo} - ${err} <br/>`
          })
          .finally(() => { })
      }
      setLoading(false);
      if (errores) {
        console.log(msj_error);
      }
      if (cont_rows > 0) {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        listarPerfilMenu();
      }
    }
  }

  const cancelarEdicionDatosProteccion = () => {
    setModoEdicion(false);
    listarPerfilMenu();
  }

  const cargarDatosProteccion = async (IdMenu) => {
    const { IdCliente, IdPerfil, IdModulo, IdAplicacion } = dataRowEditNew;

    let param = {
      IdCliente,
      IdPerfil,
      IdModulo,
      IdAplicacion,
      IdMenu
    };
    setLoading(true);
    let datosEvaluar = await listarProteccionCheck(param)
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });

    return datosEvaluar;
  }

  const eliminarTodosDatosProteccion = async (dataRow) => {
    let { IdPerfil, IdModulo, IdAplicacion } = dataRowEditNew;
    setLoading(true);

    let param = {
      IdCliente: perfil.IdCliente,
      IdPerfil,
      IdModulo,
      IdAplicacion,
      IdMenu: dataRow.IdMenu
    }

    await eliminarTodosProteccion(param)
      .then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        listarPerfilMenu();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }




  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "MENU.APPS",
      "SECURITY.PROFILE.MENU.DATAPROTECTION",
      // "SECURITY.PROFILE.MENU.CHARACTERISTIC",
      "SECURITY.PROFILE.MENU.ORGANIZATIONALUNIT",
      "SYSTEM.DIVISION",
      "SECURITY.PROFILE.USER"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}` + " " + sufix;

  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdPerfil) ? false : true;
    //return true;
  }





  //0
  const tabContent_PerfilListPage = () => {
    return <PerfilListPage
      editarRegistro={editarRegistro}
      eliminarRegistro={eliminarRegistro}
      nuevoRegistro={nuevoRegistro}
      seleccionarRegistro={seleccionarRegistro}
      verRegistroDblClick={verRegistroDblClick}
      focusedRowKey={focusedRowKey}
      setFocusedRowKey={setFocusedRowKey}
      // showHeaderInformation={false}
      selected={{ IdPerfil: "" }}

      //Propiedades del customerDataGrid 
      uniqueId={"PerfilListado"}
      isFirstDataLoad={isFirstDataLoad}
      setIsFirstDataLoad={setIsFirstDataLoad}
      dataSource={dataSource}
      refresh={refresh}
      resetLoadOptions={resetLoadOptions}
      refreshData={refreshData}
      setRefreshData={setRefreshData}
      accessButton={accessButton}
      // getInfo={getInfo}
      setVarIdPerfil={setVarIdPerfil}
      totalRowIndex={totalRowIndex}
      setTotalRowIndex={setTotalRowIndex}

      titulo={titulo}

    />
  }
  //1
  const tabContent_PerfilEditPage = () => {
    return <>
      <PerfilEditPage
        titulo={titulo}
        dataRowEditNew={dataRowEditNew}
        setDataRowEditNew={setDataRowEditNew}
        modoEdicion={modoEdicion}
        actualizarPerfil={actualizarPerfil}
        agregarPerfil={agregarPerfil}
        // restablecerPassword={restablecerPassword}
        cancelarEdicion={cancelarEdicion}
        // agregarUsuarioFoto={agregarUsuarioFoto}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
      // blockAndUnlockUserAccount={blockAndUnlockUserAccount}
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
  //2
  const tabContent_PerfilMenuListPage = () => {
    return <>
      {modoEdicion && (
        <>
          <PerfilMenuEditPage
            dataRowEditNew={dataRowEditNew}
            titulo={titulo}
            moduloData={moduloData}
            modoEdicion={modoEdicion}
            modoEdicionMenu={modoEdicionMenu}
            getInfo={getInfo}
            menus={menus}
            agregarPerfilMenu={agregarPerfilMenu}
            listarTreeview={obtenerPerfilMenuTreeview}
            cancelarEdicion={cancelarEdicionTabs}
            accessButton={accessButton}
            settingDataField={dataMenu.datos}

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
          <PerfilMenuListPage
            modoEdicion={modoEdicion}
            usuarioPerfilData={listarTabs}
            editarRegistro={editarPerfilMenu}
            eliminarRegistro={eliminarPerfilMenuTodo}
            nuevoRegistro={nuevoPerfilMenu}
            cancelarEdicion={cancelarEdicion}
            seleccionarRegistro={seleccionarPerfilMenu}
            focusedRowKey={focusedRowKeyPerfilMenu}
            getInfo={getInfo}

            accessButton={accessButton}
          />
        </>
      )}
    </>
  }

  //3
  const tabContent_PerfilProteccionDatosListPage = () => {
    return <>
      {(modoEdicion ?
        <ProteccionDatosEditPage
          dataRowEditNew={dataRowEditNew}
          cancelarEdicion={cancelarEdicion}
          getInfo={getInfo}
          showButton={true}
          agregarDatosProteccion={agregarDatosProteccion}
          // cancelarEdicion={cancelarEdicionDatosProteccion}
          cargarDatosProteccion={cargarDatosProteccion}
          EliminarTodosDatosProteccion={eliminarTodosDatosProteccion}
        />
        :
        <ProteccionDatosListPage
          usuarioPerfilData={listarTabs}
          cancelarEdicion={cancelarEdicion}
          showButtons={true}
          cargarProteccionDatos={cargarProteccionDatos}
          getInfo={getInfo}
        />
      )}
    </>
  }

  //4
  const tabContent_PerfilCaracteristicaListPage = () => {
    return <>
      {modoEdicion && (
        <>
          <PerfilCaracteristicaEditPage
            dataRowEditNew={dataRowEditNew}
            actualizarPerfilCaracteristica={actualizarPerfilCaracteristica}
            agregarPerfilCaracteristica={agregarPerfilCaracteristica}
            cancelarEdicion={cancelarEdicionTabs}
            titulo={titulo}
            //caracteristicaData={caracteristicaData}

            modoEdicion={modoEdicion}
            accessButton={accessButton}
            settingDataField={dataMenu.datos}
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
          <PerfilCaracteristicaListPage
            perfilCaracteristicaData={listarTabs}
            editarRegistro={editarRegistroPerfilCaracteristica}
            eliminarRegistro={eliminarRegistroPerfilCaracteristica}
            nuevoRegistro={nuevoRegistroTabs}
            cancelarEdicion={cancelarEdicion}
            seleccionarRegistro={seleccionarPerfilCaracteristica}
            focusedRowKey={focusedRowKeyPerfilCaracteristica}
            getInfo={getInfo}

            accessButton={accessButton}
          />
        </>
      )}
    </>
  }

  //5
  const tabContent_PerfilUnidadOrganizativaListPage = () => {
    return <>
      <PerfilUnidadOrganizativaEditPage
        dataRowEditNew={dataRowEditNew}
        //eliminarUnidadOrganizativa={eliminarPerfilUnidadOrganizativa}
        //actualizarUnidadOrganizativa={actualizarPerfilUnidadOrganizativa}
        agregarUnidadOrganizativa={agregarPerfilUnidadOrganizativa}
        cancelarEdicion={cancelarEdicion}
        titulo={titulo}
        //unidadOrganizativaData={unidadOrganizativaData}
        unidadOrganizativaTreeView={unidadOrganizativaTreeView}
        getInfo={getInfo}
        accessButton={accessButton}
      />
    </>
  }

  //6
  const tabContent_PerfilDivisionListPage = () => {
    return <>
      {modoEdicion && (
        <>
          <PerfilDivisionEditPage
            dataRowEditNew={dataRowEditNew}
            actualizarRegistro={actualizarPerfilDivision}
            agregarRegistro={agregarPerfilDivision}
            cancelarEdicion={cancelarEdicionTabs}
            titulo={titulo}
            modoEdicion={modoEdicion}
            accessButton={accessButton}
            settingDataField={dataMenu.datos}
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
          <PerfilDivisionListPage
            divisiones={listarTabs}
            editarRegistro={editarRegistroPerfilDivision}
            eliminarRegistro={eliminarPerfilDivision}
            nuevoRegistro={nuevoRegistroPerfilDivision}

            seleccionarRegistro={seleccionarRegistroDivision}
            focusedRowKey={focusedRowKeyDivision}
            cancelarEdicion={cancelarEdicion}
            getInfo={getInfo}
            accessButton={accessButton}
          />
        </>
      )}
    </>
  }
  //7
  const tabContent_PerfilUsuarioPerfilListPage = () => {
    return <>

      {modoEdicion && (
        <>
          <UsuarioPerfilEditPage //UsuarioEdicion
            dataRowEditNew={dataRowEditNew}
            actualizarRegistro={actualizarPerfilUsuario}
            agregarRegistro={agregarPerfilUsuario}
            cancelarEdicion={cancelarEdicionTabs}
            titulo={titulo}
            // modoEdicion={true}
            setModoEdicion={setModoEdicion}
            modoEdicion={false}
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

          <UsuarioPerfilListPage
            titulo={titulo}
            getInfo={getInfo}
            showHeaderInformation={true}
            nuevoRegistro={nuevoRegistroPopupUsuarios}
            editarRegistro={editarRegistroUsuarioPerfil}
            eliminarRegistro={eliminarPerfilUsuario}
            seleccionarRegistro={seleccionarRegistroUsuarioPerfil}
            cancelarEdicion={cancelarEdicion}
            // verRegistroDblClick={verRegistroDblClick}

            focusedRowKey={focusedRowKeyUsuarioPerfil}
            isFirstDataLoad={isFirstDataLoad}
            setIsFirstDataLoad={setIsFirstDataLoad}
            dataSource={dataSource}
            refresh={refresh}
            resetLoadOptions={resetLoadOptions}
            refreshData={refreshData}
            setRefreshData={setRefreshData}
            filtro={selected}
            varIdPerfil={varIdPerfil}
            // selected={selected}

            selected={{ IdPerfil: "" }}
            uniqueId={"UsuarioxdPerfilListPage"}
          />

        </>
      )}

      <SeguridadUsuarioBuscar
        showPopup={{ isVisiblePopUp: visiblePopUpUsuarios, setisVisiblePopUp: setVisiblePopUpUsuarios }}
        cancelar={() => setVisiblePopUpUsuarios(false)}
        agregar={agregarPerfilUsuario}
        selectionMode={"multiple"}
        uniqueId={"popupUsuariosBuscar"}
      />
    </>
  }

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "SECURITY.USER.MENU" })}
        subtitle={intl.formatMessage({ id: "ACCESS.PROFILE.MAINTENANCE" })}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        //value={''}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "SECURITY.PROFILE.MENU.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
            onClick: () => { listarPerfiles() },
          },
          {
            label: intl.formatMessage({ id: "SECURITY.PROFILE.MENU.PROFILE" }),
            icon: <PersonIcon fontSize="large" />,
            onClick: (e) => { obtenerPerfil(selected) },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "MENU.APPS" }),
            icon: <DynamicFeedIcon fontSize="large" />,
            onClick: (e) => { listarPerfilMenu() },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          },
          {
            label: intl.formatMessage({ id: "SECURITY.PROFILE.MENU.DATAPROTECTION" }),
            icon: <BeenhereIcon fontSize="large" />,
            //onClick: () => { llistarPerfilMenu() },
            disabled: !tabsDisabled() && accessButton.Tabs[3] ? false : true
          },
          // {
          //   label: intl.formatMessage({ id: "SECURITY.PROFILE.MENU.CHARACTERISTIC" }),
          //   icon: <AccessibilityNew fontSize="large" />,
          //   onClick: () => { listarPerfilCaracteristica() },
          //   disabled: !tabsDisabled() && accessButton.Tabs[4] ? false : true
          // },
          {
            label: intl.formatMessage({ id: "SYSTEM.DIVISION" }),
            icon: <AccountTreeIcon fontSize="large" />,
            onClick: () => { listarPerfilDivision() },
            disabled: !tabsDisabled() && accessButton.Tabs[6] ? false : true
          },
          {
            label: intl.formatMessage({ id: "SECURITY.PROFILE.MENU.ORGANIZATIONALUNIT" }),
            icon: <Business fontSize="large" />,
            onClick: () => { listarPerfilUnidadOrganizativa() },
            disabled: !tabsDisabled() && accessButton.Tabs[5] ? false : true
          },
          {
            label: intl.formatMessage({ id: "SECURITY.PROFILE.USER" }),
            icon: <SupervisorAccount fontSize="large" />,
            //onClick: () => { listarPerfilUsuario(); },
            disabled: !tabsDisabled() && accessButton.Tabs[7] ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_PerfilListPage(),
            tabContent_PerfilEditPage(),
            tabContent_PerfilMenuListPage(),
            tabContent_PerfilProteccionDatosListPage(),
            //tabContent_PerfilCaracteristicaListPage(),
            tabContent_PerfilDivisionListPage(),
            tabContent_PerfilUnidadOrganizativaListPage(),
            tabContent_PerfilUsuarioPerfilListPage(),
          ]
        }
      />

      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisibleConfirm}
        setIsVisible={setIsVisibleConfirm}
        setInstance={setInstance}
        onConfirm={() => eliminarListRowTab(selectedDelete, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />

    </>
  );
};

//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
export default injectIntl(WithLoandingPanel(PerfilIndexPage));
