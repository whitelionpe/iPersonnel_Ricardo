import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
//import { Portlet } from "../../../../partials/content/Portlet";
// import AppBar from "@material-ui/core/AppBar";
// import Toolbar from "@material-ui/core/Toolbar";
// import Typography from "@material-ui/core/Typography";
// import TouchAppIcon from "@material-ui/icons/TouchApp"; 
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import DepartureBoardIcon from '@material-ui/icons/DepartureBoard';

import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { useSelector } from "react-redux";
import { isNotEmpty } from "../../../../../_metronic";

// import Tabs from '@material-ui/core/Tabs';
// import Tab from '@material-ui/core/Tab';
// import PropTypes from 'prop-types';
import RoomRoundedIcon from '@material-ui/icons/RoomRounded';
//import WorkOutlineRoundedIcon from '@material-ui/icons/WorkOutlineRounded';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import MenuTreeViewPage from "../../../../partials/content/TreeView/MenuTreeViewPage";
import Confirm from "../../../../partials/components/Confirm";
//import { confirm, custom } from "devextreme/ui/dialog";

import { Button } from "devextreme-react";
import { PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";

import {
  eliminar,
  obtener,
  //  listarTreeview,
  crear,
  actualizar
} from "../../../../api/administracion/zona.api";
import ZonaEditPage from "./ZonaEditPage";

import {
  listarTreeview,
} from "../../../../api/asistencia/zonaEquipo.api";

import {
  eliminar as eliminarPuertaServicio,
  obtener as obtenerPuertaServicio,
  crear as crearPuertaServicio,
  actualizar as actualizarPuertaServicio
} from "../../../../api/acceso/puerta.api";
import PuertaEditPage from "../../acceso/puerta/PuertaEditPage";

import {

  eliminar as eliminarEquipoServicio,
  crear as crearEquipoServicio,
  actualizar as actualizarEquipoServicio
} from "../../../../api/asistencia/zonaEquipo.api";
// import {
//   // obtenerTodos as obtenerTodosDevice,
//   // obtener as obtenerEquipoServicio,
// } from "../../../../api/sistema/equipo.api";
import EquipoEditPage from "../../sistema/equipo/EquipoEditPage";
import EquipoCheckListPage from "../../sistema/equipo/EquipoCheckListPage";

import { serviceEquipo } from "../../../../api/sistema/equipo.api";
import { serviceEquipoAsignado } from "../../../../api/sistema/equipoAsignado.api";


import {
  eliminar as eliminarRequisito,
  obtener as obtenerRequisito,
  listar as listarRequisito,
  crear as crearRequisito,
  actualizar as actualizarRequisito
} from "../../../../api/acceso/zonaRequisito.api";

import {
  obtenerByZona as obtenerByZona,
} from "../../../../api/acceso/marcacion.api";

import {
  obtenerByZona as obtenerVehiculoByZona,
} from "../../../../api/acceso/vehiculoMarcacion.api";

import {
  eliminar as eliminarPE,
  obtener as obtenerPE,
  listar as listarPE,
  crear as crearPE,
  CrearPesonaMasivo,
  actualizar as actualizarPE
} from "../../../../api/asistencia/personaEquipo.api";

import ZonaRequisitoEditPage from "../../acceso/zonaRequisito/ZonaRequisitoEditPage";
import ZonaRequisitoListPage from "../../acceso/zonaRequisito/ZonaRequisitoListPage";

import PersonaEquipoEditPage from "../../asistencia/personaEquipo/PersonaEquipoEditPage";
import PersonaEquipoListPage from "../../asistencia/personaEquipo/PersonaEquipoListPage";

import { getDateOfDay } from "../../../../../_metronic/utils/utils";

//Custom grid: ::::::::::::::::::::::::::::::::
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
//:::::::::::::::::::::::::::::::::::::::::::::

import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

export const initialFilterMarcas = {
  IdCliente: '',
  IdPersona: '',
  IdVehiculo: '',
};


const ZonaIndexPage = (props) => {

  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const options = [{ id: 1, name: 'Zona', icon: 'map' }, { id: 2, name: 'Puerta', icon: 'key' }, { id: 3, name: 'Equipos', icon: 'toolbox' }];

  const [focusedRowKey, setFocusedRowKey] = useState();

  //const [varIdMenu, setVarIdMenu] = useState("PE");
  const [varIdZona, setVarIdZona] = useState("");
  const [varIdEquipo, setVarIdEquipo] = useState("");

  const [showForm, setShowForm] = useState("");
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(true);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.EDIT" }));
  const [listar, setListar] = useState([]);
  const [selectedDelete, setSelectedDelete] = useState({});


  const [dataRowEditNewTabs, setDataRowEditNewTabs] = useState({});
  const [modoEdicionTabs, setModoEdicionTabs] = useState(false);
  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.EDIT" }));
  const [listarTabs, setListarTabs] = useState([]);
  const [equiposPersona, setEquiposPersona] = useState([]);

  const [selected, setSelected] = useState({});
  const classesEncabezado = useStylesEncabezado();
  const [nivel_popup, setNivel_popup] = useState(0);
  //const [idMenu, setIdMenu] = useState("");
  const [menus, setMenus] = useState([{
    Icon: "flaticon2-expand"
    , varIdMenu: null
    , varIdMenuPadre: null
    , Menu: "-SIN DATA-"
    , MenuPadre: null
    , Nivel: 0
    , expanded: true
    , selected: false
  }]);
  const [dataFilter, setDataFilter] = useState({ IdModulo: "" });
  const [isSubMenu, setIsSubMenu] = useState(false);
  //const [modulos, setModulos] = useState([]);
  //definir estado de botones de accion.
  const [actionButton, setActionButton] = useState({
    new: false, edit: false, save: false, delete: false, cancel: false
  });

  //Configuración de tabs
  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedNode, setSelectedNode] = useState();

  const handleChange = (event, newValue) => {
    //Estado cambio de tabs
    setTabIndex(newValue);
  };

  const [isVisible, setIsVisible] = useState(false);
  const [isVisibleConfirm, setIsVisibleConfirm] = useState(false);

  const [instance, setInstance] = useState({});

  const [messagePopup, setMessagePopup] = useState(intl.formatMessage({ id: "ALERT.REMOVE" }));


  const [filterDataMarcacionPersona, setFilterDataMarcacionPersona] = useState({ IdCliente: perfil.IdCliente });//
  const [filterDataMarcacionVehiculo, setFilterDataMarcacionVehiculo] = useState({ IdCliente: perfil.IdCliente });//

  //Custom grid:  :::::::::::::::::::::::::::::::::::::::::::::
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [filterData, setFilterData] = useState({ ...initialFilterMarcas });
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();
  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::

  //Configuracion Tabs
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 4; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  const [isModuleActive, setIsModuleActive] = useState(false);

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones para administrar Zona-:::::::::::::::::::::::::::::::::
  async function agregarZona(zona) {
    setLoading(true);
    const { IdCliente, IdDivision, IdZona, IdZonaPadre, Zona, Activo } = zona;
    let data = {
      IdCliente: isNotEmpty(IdCliente) ? IdCliente : ""
      , IdDivision: isNotEmpty(IdDivision) ? IdDivision : ""
      , IdZona: isNotEmpty(IdZona) ? IdZona.toUpperCase() : ""
      , IdZonaPadre: isNotEmpty(IdZonaPadre) ? IdZonaPadre : ""
      , Zona: isNotEmpty(Zona) ? Zona.toUpperCase() : ""
      , Activo
      , IdModulo: isNotEmpty(dataMenu.info.IdModulo) ? dataMenu.info.IdModulo : ""
      , IdUsuario: usuario.username
    };
    await crear(data).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      //setModoEdicion(false);
      listarZona();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarZona(zona) {
    setLoading(true);
    const { IdCliente, IdDivision, IdZona, IdZonaPadre, Zona, Activo } = zona;
    let data = {
      IdCliente: isNotEmpty(IdCliente) ? IdCliente : ""
      , IdDivision: isNotEmpty(IdDivision) ? IdDivision : ""
      , IdZona: isNotEmpty(IdZona) ? IdZona.toUpperCase() : ""
      , IdZonaPadre: isNotEmpty(IdZonaPadre) ? IdZonaPadre : ""
      , Zona: isNotEmpty(Zona) ? Zona.toUpperCase() : ""
      , Activo
      , IdUsuario: usuario.username
    };
    await actualizar(data).then(response => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      //setModoEdicion(false);
      listarZona();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  //async function eliminarNodoTreeview(zona) {
  async function eliminarNodoTreeview() {
    const { IdDivision, IdCliente, IdZona, IdPuerta, IdEquipo } = selectedNode;
    //const { IdDivision, IdCliente, IdZona, IdPuerta, IdEquipo } = zona;
    if (isNotEmpty(IdEquipo)) {
      //Equipo
      await eliminarEquipoServicio({ IdDivision, IdCliente, IdZona, IdEquipo, IdUsuario: usuario.username, IdModulo: dataMenu.info.IdModulo }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
    } else if (isNotEmpty(IdPuerta)) {
      //Puerta
      await eliminarPuertaServicio({ IdDivision, IdCliente, IdZona, IdPuerta, IdUsuario: usuario.username }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });

    } else if (isNotEmpty(IdZona)) {
      //Zona 
      await eliminar({ IdDivision, IdCliente, IdZona, IdModulo: dataMenu.info.IdModulo, IdUsuario: usuario.username }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
    }
    setVarIdZona("");
    listarZona();
  }

  async function listarZona() {
    setLoading(true);
    let zonas = await listarTreeview({
      IdCliente: perfil.IdCliente
      , IdDivision: perfil.IdDivision
      , IdModulo: isNotEmpty(dataMenu.info.IdModulo) ? dataMenu.info.IdModulo : ""
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
    if (!isNotEmpty(zonas)) {
      //Sin data , mostrar por defecto.
      setMenus([{
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
      setMenus(zonas);
    }
    setModoEdicion(false);
    //setLoading(false);
  }

  async function obtenerZona(filtro) {
    setLoading(true);
    const { IdDivision, IdCliente, IdZona, IdMenu } = filtro;
    if (isNotEmpty(IdMenu)) {
      let zona = await obtener({ IdDivision, IdCliente, IdZona, IdMenu })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
      setDataRowEditNew({ ...zona, esNuevoRegistro: false });
    }
    else {
      handleInfoMessages(intl.formatMessage({ id: "SYSTEM.MENU.MESSAGE.SELECTIONMENU" }));
    }
  }

  const nuevoRegistroConfirm = (objeto, tipo) => {
    setShowForm(tipo);
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    //Activar botones
    setActionButton({ new: false, edit: false, save: true, cancel: true });
    setDataRowEditNew({ ...objeto, esNuevoRegistro: true });
  }

  const nuevoRegistro = () => {
    // console.log("nuevoRegistro|selectedNode:",selectedNode);
    const { IdCliente, IdDivision, IdZona, IdPuerta, Nivel } = selectedNode;

    let objeto = {};
    // console.log("nuevoRegistro|Nivel:",Nivel);

    if (Nivel === 1) {
      //Division para agregar Zonas.>[Solo Zonas]
      objeto = { Activo: "S", IdCliente, IdDivision, IdZonaPadre: "", IdZona: "" };
      setShowForm("Zona");
    } else if (Nivel === 2) {
      // Zona para agregar Sub-Zonas o Puerta>[Sub-Zona o Puerta]
      objeto = { Activo: "S", IdCliente, IdDivision, IdZonaPadre: IdZona, IdZona: "" };

      setMessagePopup(intl.formatMessage({ id: "ADMINISTRATION.ZONE.ADD.ZUBZONE" }));
      loadMessagePopUp(objeto, false, false, 2);
      // objeto = { Activo: "S", IdCliente: perfil.IdCliente, IdDivision, IdZona, IdPuerta, IdEquipo: "" };
      // setShowForm("Equipos");
      // listarEquipo(selectedNode);
    } else if (Nivel === 3) {
      objeto = { Activo: "S", IdCliente: perfil.IdCliente, IdDivision, IdZona, IdPuerta, IdEquipo: "" };
      setShowForm("Equipos");
      listarEquipo(selectedNode);
    }
    if (Nivel === 1 || Nivel === 3) {
      setModoEdicion(true);
      setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
      //Activar botones
      setActionButton({ new: false, edit: false, save: true, cancel: true });
      setDataRowEditNew({ ...objeto, esNuevoRegistro: true });
    }

  };

  const nuevoRegistroZonaPuerta = (str_objeto) => {
    // console.log("nuevoRegistroZonaPuerta se visualiza: ", str_objeto, selected);
    listarEquipo(selectedNode);
    nuevoRegistroConfirm(selected, str_objeto);
  }

  const callConfirmPuerta = () => {
    //console.log("callConfirmPuerta", selectedNode);

    setTimeout(function () {
      const { IdCliente, IdDivision, IdZona, IdPuerta, Nivel } = selectedNode;
      let objeto = { Activo: "S", IdCliente, IdDivision, IdZona, IdPuerta: "" };
      setMessagePopup(intl.formatMessage({ id: "ADMINISTRATION.ZONE.ADD.TEAM" }));
      loadMessagePopUp(objeto, false, false, 3);
    }, 500);
  }

  const treeViewSetFocusNodo = (data, idMenu) => {
    let menus = [];
    let objIndex = data.findIndex((obj => obj.IdMenu === idMenu));
    if (objIndex >= 0) data[objIndex].selected = true;
    menus.push(...data);
    return menus;
  }

  const seleccionarNodo = async (dataRow) => {
    const { IdMenu, IdMenuPadre, IdZona, IdPuerta, IdEquipo, Nivel, IdModulo } = dataRow;
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));

    if (Nivel === 1) {
      //Division sin formulario-
      setShowForm("");
    } else if (Nivel === 2) {
      setShowForm("Zona");
      await obtenerZona(dataRow);
    } else if (Nivel === 3) {
      // setShowForm("Puerta");
      // await obtenerPuerta(dataRow);
      setShowForm("Equipo");
      await obtenerEquipo(dataRow)
      // } else if (Nivel === 4) {
      //   setShowForm("Equipo");
      //   await obtenerEquipo(dataRow)
    }
    setVarIdZona(IdZona);
    setVarIdEquipo(IdEquipo);
    setSelectedNode(dataRow);

    //Activar botones
    setActionButton({
      /* new: isNotEmpty(IdEquipo) ? false : true
    delete: isNotEmpty(IdZona) ? true : false,
     edit: isNotEmpty(IdZona) ? true : false */
      new: isNotEmpty(IdModulo) ? true : false,
      delete: isNotEmpty(IdModulo) ? true : false,
      edit: isNotEmpty(IdModulo) ? true : false
    });
    setIsModuleActive(isNotEmpty(IdModulo) ? false : true);
  }

  const editarRegistro = (dataRow) => {
    setModoEdicion(true);
    //Activar botones
    setActionButton({ new: false, edit: false, save: true, cancel: true });
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));

  };

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    seleccionarNodo(selectedNode);
    setVarIdZona("");
    setListar([]);
    //Activar botones
    setActionButton({ new: true, edit: true, save: false, cancel: false });
    //cancelarEdicionSection();
    //Treeview: Comportamiento para agregar nuevo menu
    setIsSubMenu(false);
    setDataFilter({ IdModulo: "" });
  };

  useEffect(() => {
    listarZona();
    loadControlsPermission()
  }, []);

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones para administrar Puerta-:::::::::::::::::::::::::::::::::
  async function obtenerPuerta(filtro) {
    setLoading(true);

    const { IdDivision, IdCliente, IdZona, IdPuerta } = filtro;
    /*if (isNotEmpty(IdZona)) {
      let puerta = */
    await obtenerPuertaServicio({
      IdDivision, IdCliente, IdZona, IdPuerta
    }).then(puerta => {
      setDataRowEditNew({ ...puerta, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    })
      .finally(() => { setLoading(false); });
  }

  async function agregarPuerta(puerta) {
    setLoading(true);
    const { IdCliente, IdDivision, IdZona, IdPuerta, Puerta, IdTipoPuerta, PuertaCalle, Activo } = puerta;
    let data = {
      IdCliente: isNotEmpty(IdCliente) ? IdCliente : ""
      , IdDivision: isNotEmpty(IdDivision) ? IdDivision : ""
      , IdZona: isNotEmpty(IdZona) ? IdZona : ""
      , IdPuerta: isNotEmpty(IdPuerta) ? IdPuerta.toUpperCase() : ""
      , Puerta: isNotEmpty(Puerta) ? Puerta.toUpperCase() : ""
      , IdTipoPuerta: isNotEmpty(IdTipoPuerta) ? IdTipoPuerta.toUpperCase() : ""
      , PuertaCalle: isNotEmpty(PuertaCalle) ? PuertaCalle : ""
      , Activo
      , IdUsuario: usuario.username
    };
    await crearPuertaServicio(data).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      listarZona();
      seleccionarNodo(selectedNode);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarPuerta(puerta) {
    setLoading(true);
    const { IdCliente, IdDivision, IdZona, IdPuerta, Puerta, IdTipoPuerta, PuertaCalle, Activo } = puerta;
    let data = {
      IdCliente: isNotEmpty(IdCliente) ? IdCliente : ""
      , IdDivision: isNotEmpty(IdDivision) ? IdDivision : ""
      , IdZona: isNotEmpty(IdZona) ? IdZona : ""
      , IdPuerta: isNotEmpty(IdPuerta) ? IdPuerta.toUpperCase() : ""
      , Puerta: isNotEmpty(Puerta) ? Puerta.toUpperCase() : ""
      , IdTipoPuerta: isNotEmpty(IdTipoPuerta) ? IdTipoPuerta.toUpperCase() : ""
      , PuertaCalle: isNotEmpty(PuertaCalle) ? PuertaCalle : ""
      , Activo
      , IdUsuario: usuario.username
    };
    await actualizarPuertaServicio(data).then(response => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarZona();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones para administrar Equipos-:::::::::::::::::::::::::::::::::
  async function listarEquipo(filtro) {
    // console.log("listarEquipo:filtro",filtro);
    setLoading(true);
    const { IdCliente, IdDivision, IdZona, IdPuerta } = filtro;

    await serviceEquipoAsignado.listar({
      IdCliente,
      IdTipoEquipo: '%',
      IdModelo: '%',
      IdTipoLectura: '%'
    }).then(equipos => {
      setListar(equipos);
      // console.log("listarEquipo:equipos",equipos);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }



  async function agregarEquipo(equipo) {
    setLoading(true);
    const { IdCliente, IdDivision, IdZona, IdPuerta, Equipos, Activo } = equipo;
    if (isNotEmpty(Equipos)) {

      let tot_rows = 0;
      for (let i = 0; i < Equipos.length; i++) {
        let idEquipo = Equipos[i];

        let data = {
          IdCliente: isNotEmpty(IdCliente) ? IdCliente : ""
          , IdDivision: isNotEmpty(IdDivision) ? IdDivision : ""
          , IdZona: isNotEmpty(IdZona) ? IdZona : ""
          // , IdPuerta: isNotEmpty(IdPuerta) ? IdPuerta : ""
          , IdEquipo: isNotEmpty(idEquipo) ? idEquipo : ""
          , Activo
          , IdUsuario: usuario.username
          , IdModulo: dataMenu.info.IdModulo
        };

        await crearEquipoServicio(data).then(() => {
          setModoEdicion(false);
          tot_rows++;
        }).catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });

      }

      if (tot_rows > 0) {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        listarZona();
        seleccionarNodo(selectedNode);//EGSC
      }

    }

  }

  async function actualizarEquipo(equipo) {
    setLoading(true);
    const { IdCliente, IdDivision, IdZona, IdPuerta } = selectedNode;
    const {
      IdEquipo, Equipo
      , IdTipoEquipo
      , IdModelo
      , IdEquipoPadre
      , MacAddress
      , FuncionEntradaSalida
      , IP
      , Mascara
      , Gateway
      , IPServer
      , HostName
      , COMVirtual
      , SalidaVerde
      , SalidaRojo
      , BitsxSegundo
      , BitsDatos
      , Paridad
      , BitsParada
      , IdTipoLectura
      , DiferenciaHoraria
      , Activo } = equipo;

    let data = {
      IdCliente: isNotEmpty(IdCliente) ? IdCliente : ""
      , IdDivision: isNotEmpty(IdDivision) ? IdDivision : ""
      , IdZona: isNotEmpty(IdZona) ? IdZona : ""
      // , IdPuerta: isNotEmpty(IdPuerta) ? IdPuerta : ""

      , IdEquipo: isNotEmpty(IdEquipo) ? IdEquipo.toUpperCase() : ""
      , Equipo: isNotEmpty(Equipo) ? Equipo.toUpperCase() : ""
      , IdTipoEquipo: isNotEmpty(IdTipoEquipo) ? IdTipoEquipo.toUpperCase() : ""
      , IdModelo: isNotEmpty(IdModelo) ? IdModelo.toUpperCase() : ""
      , IdEquipoPadre: isNotEmpty(IdEquipoPadre) ? IdEquipoPadre : ""
      , MacAddress: isNotEmpty(MacAddress) ? MacAddress.toUpperCase() : ""
      , FuncionEntradaSalida: isNotEmpty(FuncionEntradaSalida) ? FuncionEntradaSalida : ""
      , IP: isNotEmpty(IP) ? IP.toUpperCase() : ""
      , Mascara: isNotEmpty(Mascara) ? Mascara.toUpperCase() : ""
      , Gateway: isNotEmpty(Gateway) ? Gateway.toUpperCase() : ""
      , IPServer: isNotEmpty(IPServer) ? IPServer.toUpperCase() : ""
      , HostName: isNotEmpty(HostName) ? HostName.toUpperCase() : ""
      , COMVirtual: isNotEmpty(COMVirtual) ? COMVirtual.toUpperCase() : ""
      , SalidaVerde: isNotEmpty(SalidaVerde) ? SalidaVerde.toUpperCase() : ""
      , SalidaRojo: isNotEmpty(SalidaRojo) ? SalidaRojo.toUpperCase() : ""
      , BitsxSegundo: isNotEmpty(BitsxSegundo) ? BitsxSegundo.toUpperCase() : ""
      , BitsDatos: isNotEmpty(BitsDatos) ? BitsDatos.toUpperCase() : ""
      , Paridad: isNotEmpty(Paridad) ? Paridad.toUpperCase() : ""
      , BitsParada: isNotEmpty(BitsParada) ? BitsParada.toUpperCase() : ""
      , IdTipoLectura: isNotEmpty(IdTipoLectura) ? IdTipoLectura.toUpperCase() : ""
      , DiferenciaHoraria: isNotEmpty(DiferenciaHoraria) ? DiferenciaHoraria : ""
      , IdCliente: perfil.IdCliente
      , Activo
      , IdUsuario: usuario.username
    };
    await actualizarEquipoServicio(data).then(() => {
      serviceEquipo.actualizar(data).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        setModoEdicion(false);
        listarZona();
        seleccionarNodo(selectedNode);
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerEquipo(filtro) {
    setLoading(true);
    const { IdCliente, IdEquipo } = filtro;

    await serviceEquipo.obtener({
      IdCliente, IdEquipo
    }).then(equipo => {
      setDataRowEditNew({ ...equipo, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  //::::::::::::::::::::::FUNCION ZONA REQUISITO:::::::::::::::::::::::::::::::::::::::::::::::::

  // async function agregarZonaRequisito(zonaRequisito) {
  //   setLoading(true);
  //   const { IdCliente, IdDivision, IdZona, IdRequisito, Activo, Warning } = zonaRequisito;
  //   let data = {
  //     IdCliente
  //     , IdDivision
  //     , IdZona
  //     , IdRequisito: isNotEmpty(IdRequisito) ? IdRequisito.toUpperCase() : ""
  //     , Activo: Activo
  //     , Warning: Warning
  //     , IdUsuario: usuario.username
  //   };
  //   await crearRequisito(data).then(response => {
  //     if (response)
  //       handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
  //     listarZonaRequisito();
  //   }).catch(err => {
  //     handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
  //   }).finally(() => { setLoading(false); });
  // }

  // async function actualizarZonaRequisito(zonaRequisito) {
  //   setLoading(true);
  //   const { IdCliente, IdDivision, IdZona, IdRequisito, Activo, Warning } = zonaRequisito;
  //   let data = {
  //     IdCliente
  //     , IdDivision
  //     , IdZona
  //     , IdRequisito: isNotEmpty(IdRequisito) ? IdRequisito.toUpperCase() : ""
  //     , Activo: Activo
  //     , Warning: Warning
  //     , IdUsuario: usuario.username
  //   };
  //   await actualizarRequisito(data).then(() => {
  //     handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
  //     listarZonaRequisito();
  //   }).catch(err => {
  //     handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
  //   }).finally(() => { setLoading(false); });
  // }

  // async function eliminarZonaRequisito() {
  //   setLoading(true);
  //   const { IdZona, IdRequisito, IdCliente, IdDivision } = selected;
  //   await eliminarRequisito({
  //     IdZona,
  //     IdRequisito,
  //     IdCliente,
  //     IdDivision,
  //     IdUsuario: usuario.username
  //   }).then(() => {
  //     handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
  //   }).catch(err => {
  //     handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
  //   }).finally(() => { setLoading(false); });
  //   listarZonaRequisito();
  // }

  async function loadMessagePopUp(p_data, p_confirm, p_cancel, p_nivelPopUp, evt) {

    // console.log("loadMessagePopUp|p_data|p_confirm1|p_cancel|p_nivelPopUp|evt", p_data, p_confirm, p_cancel, p_nivelPopUp,evt);

    if (p_confirm) {

      // p_nivelPopUp => -1= ok | -2 = cancel
      // console.log("loadMessagePopUp|nivel_popup:",nivel_popup);

      switch (nivel_popup) {
        case -2:
        case 1: eliminarRegistroPersonaEquipo(); break;
        case 2: nuevoRegistroZonaPuerta("Zona"); break;
        case 3: nuevoRegistroZonaPuerta("Equipos"); break;
      }


    } if (p_cancel) {
      switch (nivel_popup) {
        case 2: callConfirmPuerta(); break;
      }

    } else {
      //console.log("cargaObjeto", p_confirm, p_cancel, p_nivelPopUp);
      setSelected(p_data);
      setIsVisible(true);
      setNivel_popup(p_nivelPopUp)
    }

  }


  async function listarZonaRequisito() {
    setLoading(true);
    const { IdCliente, IdDivision, IdZona } = selectedNode
    setModoEdicionTabs(false);
    await listarRequisito({
      IdZona
      , IdCliente
      , IdDivision
      , NumPagina: 0
      , TamPagina: 0
    }).then(zonaRequisitos => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(zonaRequisitos);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  async function obtenerZonaRequisito(filtro) {
    setLoading(true);
    const { IdZona, IdRequisito, IdCliente, IdDivision } = filtro;
    await obtenerRequisito({
      IdZona,
      IdRequisito,
      IdCliente,
      IdDivision
    }).then(perfilRequisito => {
      setDataRowEditNewTabs({ ...perfilRequisito, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const editarZonaRequisito = dataRow => {
    const { RowIndex } = dataRow;
    setModoEdicionTabs(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerZonaRequisito(dataRow);
    setFocusedRowKey(RowIndex);
  };

  const seleccionarRegistroZonaRequisito = dataRow => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };


  const nuevoRegistroTabs = () => {
    let nuevo = { Activo: "S", Warning: "N", ...selectedNode };
    setDataRowEditNewTabs({ ...nuevo, esNuevoRegistro: true });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicionTabs(true);
  };

  const cancelarEdicionTabs = () => {
    setModoEdicionTabs(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNewTabs({});
  };




  //::::::::::::::::::::::::::::::::::::::::::::: Funciones Persona Equipo ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


  async function agregarPersonaEquipo(ListPersonas) {
    setLoading(true);
    const { IdDivision, IdZona, IdEquipo, IdMenu } = selectedNode

    if (isNotEmpty(IdZona) && IdEquipo === null) {
      if (ListPersonas.length > 0) {
        ListPersonas.map(async (data) => {
          const { IdPersona, Activo } = data;
          let params = {
            IdCliente: perfil.IdCliente
            , IdDivision: IdDivision
            , IdPersona: IdPersona
            , IdMenu: IdMenu
            , IdUsuario: usuario.username
          };
          await CrearPesonaMasivo(params)
            .then((response) => {
              listarPersonaEquipo();
              handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            })
            .catch((err) => {
              handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
            });
        });

      }
    }

    if (isNotEmpty(IdZona) && isNotEmpty(IdEquipo)) {

      if (ListPersonas.length > 0) {
        ListPersonas.map(async (data) => {
          const { IdPersona, Activo } = data;
          let params = {
            IdCliente: perfil.IdCliente
            , IdPersona: IdPersona
            , IdDivision: IdDivision
            , IdZona: IdZona
            , IdEquipo: IdEquipo
            , Activo: Activo
            , IdUsuario: usuario.username
          };
          await crearPE(params)
            .then((response) => {
              listarPersonaEquipo();
              handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            })
            .catch((err) => {
              handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
            });
        });

      }

    }

    setLoading(false);
    // else{
    //   listarPersonaEquipo();
    //  handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
    // }

    // let data = {
    //       IdCliente : perfil.IdCliente
    //     , IdPersona: IdPersona
    //     , IdDivision:IdDivision
    //     , IdZona: IdZona
    //     , IdEquipo: IdEquipo
    //     , Activo: Activo
    //     , IdUsuario: usuario.username
    // };
    // await crearPE(data).then(response => {
    //     if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
    //     listarPersonaEquipo();
    //     setModoEdicionTabs(false);

    // }).catch(err => {
    //     handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    // }).finally(() => { setLoading(false); });
  }

  async function actualizarPersonaEquipo(datarow) {
    setLoading(true);
    const { IdDivision, IdZona, IdEquipo, IdCliente, IdPersona, Activo } = datarow;
    let data = {
      IdCliente: IdCliente
      , IdPersona: IdPersona
      , IdDivision: IdDivision
      , IdZona: IdZona
      , IdEquipo: IdEquipo
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await actualizarPE(data).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicionTabs(false);
      listarPersonaEquipo();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistroPersonaEquipo(data, confirm) {
    setSelectedDelete(data);
    setIsVisibleConfirm(true);
    // console.log("eliminarRegistroPersonaEquipo|data|confirm",data,confirm);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdPersona, IdDivision, IdZona, IdEquipo } = selectedDelete;
      // console.log("selectedDelete:",selectedDelete);
      await eliminarPE({
        IdCliente: IdCliente,
        IdPersona: IdPersona,
        IdDivision: IdDivision,
        IdZona: IdZona,
        IdEquipo: IdEquipo
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarPersonaEquipo();
    }
  }

  async function listarPersonaEquipo() {
    setLoading(true);

    const { IdDivision, IdZona, IdEquipo } = selectedNode;

    if (IdEquipo != null) {
      await listarPE(
        {
          IdCliente: perfil.IdCliente
          , IdPersona: 0
          , IdDivision: IdDivision
          , IdZona: IdZona
          , IdEquipo: isNotEmpty(IdEquipo) ? IdEquipo : ""
          , Option: 1
          , NumPagina: 0
          , TamPagina: 0
        }
      ).then(data => {
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        changeTabIndex(1);
        setListarTabs(data)
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    }

    if (IdEquipo === null) {
      await listarPE(
        {
          IdCliente: perfil.IdCliente
          , IdPersona: 0
          , IdDivision: IdDivision
          , IdZona: IdZona
          , IdEquipo: isNotEmpty(IdEquipo) ? IdEquipo : ""
          , Option: 2
          , NumPagina: 0
          , TamPagina: 0
        }
      ).then(data => {
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        changeTabIndex(1);
        setListarTabs(data)
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    }
  }

  async function listarEquiposPorPersona(dataRow) {
    setLoading(true);
    const { IdDivision, IdZona, IdEquipo } = selectedNode;
    const { IdPersona } = dataRow;
    console.log("listarEquiposPorPersona|dataRow:", dataRow);
    await listarPE(
      {
        IdCliente: perfil.IdCliente
        , IdPersona: IdPersona
        , IdDivision: IdDivision
        , IdZona: '%'
        , IdEquipo: '%'
        , Option: 1
        , NumPagina: 0
        , TamPagina: 0
      }
    ).then(data => {
      // setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      // changeTabIndex(1);
      setEquiposPersona(data)
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerPersonaEquipo(dataRow) {
    setLoading(true);
    const { IdCliente, IdPersona, IdDivision, IdZona, IdEquipo } = dataRow;
    await obtenerPE({ IdCliente, IdPersona, IdDivision, IdZona, IdEquipo }).then(data => {
      setDataRowEditNewTabs({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const seleccionarPersonaEquipo = (dataRow) => {
    const { RowIndex } = dataRow;
    // setFocusedRowKeyCondicionEspecial(RowIndex);
  };

  const nuevoRegistroPersonaEquipo = () => {
    changeTabIndex(1);
    let data = { Activo: "S" };
    setDataRowEditNewTabs({ ...data, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicionTabs(true);
  };

  const editarRegistroPersonaEquipo = async (dataRow) => {
    // console.log("editarRegistroPersonaEquipo:dataRow",dataRow);
    changeTabIndex(1);
    setModoEdicionTabs(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerPersonaEquipo(dataRow);

  };

  const cancelarEdicionPersonaEquipo = () => {
    changeTabIndex(1);
    setModoEdicionTabs(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNewTabs({});
  };

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  const cargarDatosInfo = (currentObject, Nivel) => {
    let Id = '';
    let Name = '';

    // console.log("cargarDatosInfo|currentObject|Nivel:",currentObject,Nivel);

    switch (Nivel) {
      case 1: Id = currentObject.IdDivision; break;
      case 2: Id = currentObject.IdZona; break;
      case 3: Id = currentObject.IdEquipo; break;
    };
    Name = currentObject.Menu;
    return { Id, Name };
  }

  const getInfo = () => {
    let Datos = [
      { text: intl.formatMessage({ id: "SYSTEM.DIVISION" }), value: "", id: "" },
      { text: intl.formatMessage({ id: "ADMINISTRATION.ZONE" }), value: "", id: "" },
      { text: intl.formatMessage({ id: "ADMINISTRATION.ZONE.DEVICE" }), value: "", id: "" }
    ];
    let { Menu, Nivel, IdMenu } = selectedNode;
    let currentObject = {};

    for (let i = Nivel; i >= 1; i--) {
      currentObject = menus.filter(x => x.IdMenu == IdMenu)[0];
      let { Id, Name } = cargarDatosInfo(currentObject, i);
      Datos[i - 1].id = Id
      Datos[i - 1].value = Name;
      IdMenu = currentObject.IdMenuPadre;
    }

    return Datos.filter(x => x.value != "").map(x => { return { text: x.text, value: x.value, colSpan: 1 } });
  }

  async function eliminarListRowTab(rowData, confirm) {
    let currentTab = tabIndex;

    switch (currentTab) {
      case 1:
        eliminarRegistroPersonaEquipo(rowData, confirm)
        break;
    }
  }

  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "ADMINISTRATION.ZONE.PERSON"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdZona) ? false : true;
  }

  const tabContent_Zona = () => {
    return <>
      <div className={classes.gridRoot}>

        <PortletHeader
          title={""}
          toolbar={
            <PortletHeaderToolbar>
              <Button
                icon="fa fa-plus"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.NEW" })}
                onClick={nuevoRegistro}
                disabled={!actionButton.new}
              />
              &nbsp;
              <Button
                icon="fa fa-edit"
                type="default"
                hint="Editar"
                disabled={!actionButton.edit}
                onClick={editarRegistro}
                // disabled={isModuleActive}
              />
              &nbsp;
              <Button
                icon="fa fa-save"
                type="default"
                hint="Grabar"
                onClick={() => { document.getElementById("idButtonGrabarTview").click() }}
                disabled={!actionButton.save}
                // disabled={isModuleActive}
              />
              &nbsp;
              <Button
                icon="fa fa-trash"
                type="default"
                hint="Eliminar"
                onClick={eliminarNodoTreeview}
                disabled={isModuleActive}
              />
              &nbsp;
              <Button
                icon="fa fa-times-circle"
                type="normal"
                hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                onClick={cancelarEdicion}
                disabled={!actionButton.cancel}
              />
            </PortletHeaderToolbar>
          }>

        </PortletHeader>



        <Paper className={classes.paper}>
          <Grid container spacing={1} direction="row" justify="flex-start" alignItems="stretch" >
            <Grid item xs={5} style={{ borderRight: "1px solid #ebedf2" }} >

              <MenuTreeViewPage
                id={"MenuTreeViewPage"}
                menus={menus}
                modoEdicion={modoEdicion}
                seleccionarNodo={seleccionarNodo}
              />

            </Grid>

            <Grid item xs={7} >
              <Paper className={classes.paper}>
                <>

                  {showForm === "Zona" && (
                    <ZonaEditPage
                      modoEdicion={modoEdicion}
                      dataRowEditNew={dataRowEditNew}
                      actualizarZona={actualizarZona}
                      agregarZona={agregarZona}
                      cancelarEdicion={cancelarEdicion}
                      titulo={titulo}
                      showAppBar={true}
                      settingDataField={dataMenu.datos}
                      accessButton={accessButton}
                    />
                  )}
                  {showForm === "Puerta" && (
                    <PuertaEditPage
                      modoEdicion={modoEdicion}
                      dataRowEditNew={dataRowEditNew}
                      actualizarPuerta={actualizarPuerta}
                      agregarPuerta={agregarPuerta}
                      cancelarEdicion={cancelarEdicion}
                      titulo={titulo}
                      showAppBar={true}
                    />
                  )}
                  {showForm === "Equipo" && (
                    <EquipoEditPage
                      modoEdicion={modoEdicion}
                      dataRowEditNew={dataRowEditNew}
                      actualizarEquipo={actualizarEquipo}
                      cancelarEdicion={cancelarEdicion}
                      titulo={titulo}
                      showButtons={false}
                      settingDataField={dataMenu.datos}
                      accessButton={accessButton}
                    />
                  )}
                  {showForm === "Equipos" && (
                    <EquipoCheckListPage
                      equipos={listar}
                      dataRowEditNew={dataRowEditNew}
                      agregarEquipos={agregarEquipo}
                      modoEdicion={modoEdicion}
                      cancelarEdicion={cancelarEdicion}
                    />
                  )}
                  {isNotEmpty(showForm) && (
                    <>
                      <div className="col-12 d-inline-block">
                        <div className="float-right">
                          <ControlSwitch checked={auditoriaSwitch}
                            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                          /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
                        </div>
                      </div>
                      {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
                    </>
                  )}
                </>
              </Paper>
            </Grid>

          </Grid>
        </Paper>

      </div>
    </>
  }




  const tabContent_PersonaEquipoListPage = () => {
    return <>
      {modoEdicionTabs && (
        <>
          <PersonaEquipoEditPage
            dataRowEditNew={dataRowEditNewTabs}
            setDataRowEditNew={setDataRowEditNewTabs}
            actualizarPersonaEquipo={actualizarPersonaEquipo}
            agregarPersonaEquipo={agregarPersonaEquipo}
            cancelarEdicion={cancelarEdicionTabs}
            titulo={tituloTabs}
            getInfo={getInfo}
            modoEdicion={modoEdicionTabs}
            setModoEdicion={setModoEdicionTabs}
            accessButton={accessButton}
            settingDataField={dataMenu.datos}
            selectedNode={selectedNode}
          />
          <div className="container_only">
            <div className="float-right">
              <ControlSwitch checked={auditoriaSwitch}
                onChange={e => { setAuditoriaSwitch(e.target.checked) }}
              /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
            </div>
          </div>
          {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewTabs} />)}
        </>
      )}
      {!modoEdicionTabs && (
        <>
          <PersonaEquipoListPage
            personaEquipo={listarTabs}
            seleccionarRegistro={seleccionarPersonaEquipo}
            nuevoRegistro={nuevoRegistroPersonaEquipo}
            editarRegistro={editarRegistroPersonaEquipo}
            eliminarRegistro={eliminarRegistroPersonaEquipo}
            listarEquiposPorPersona={listarEquiposPorPersona}
            cancelarEdicion={cancelarEdicion}
            focusedRowKey={focusedRowKey}
            modoEdicion={modoEdicionTabs}
            getInfo={getInfo}
            accessButton={accessButton}
            equiposPersona={equiposPersona}
          />
        </>
      )}
    </>
  }


  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "ASSISTANCE.MAIN" })}
        submenu={intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.CONFIGURACIÓN" })}
        subtitle={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.ZONE.MAINTENANCE" }),
            icon: <RoomRoundedIcon fontSize="large" />,
          },
          //<Comentado AESA- LSF - 18102023>
          // { 
          //   label: intl.formatMessage({ id: "ADMINISTRATION.ZONE.PERSON" }),
          //   icon: <PersonOutlineIcon fontSize="large" />,
          //   onClick: (e) => { listarPersonaEquipo() },
          //   disabled: !tabsDisabled() && accessButton.Tabs[1] ? false : true
          // },

        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_Zona(),
            // tabContent_PersonaEquipoListPage(), //<Comentado AESA- LSF - 18102023>
          ]
        }
      />

      <Confirm
        message={messagePopup}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        onConfirm={() => loadMessagePopUp({}, true, false, -1)}
        onHide={() => loadMessagePopUp({}, false, true, -2,)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
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


export default injectIntl(WithLoandingPanel(ZonaIndexPage));
