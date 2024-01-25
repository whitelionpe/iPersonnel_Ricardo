import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
//import { Portlet } from "../../../../partials/content/Portlet";
// import AppBar from "@material-ui/core/AppBar";
// import Toolbar from "@material-ui/core/Toolbar";
// import Typography from "@material-ui/core/Typography";
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import DepartureBoardIcon from '@material-ui/icons/DepartureBoard';
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";

import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
//import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { useSelector } from "react-redux";
import { isNotEmpty, dateFormat } from "../../../../../_metronic";

// import Tabs from '@material-ui/core/Tabs';
// import Tab from '@material-ui/core/Tab';
// import PropTypes from 'prop-types';
import RoomRoundedIcon from '@material-ui/icons/RoomRounded';
import WorkOutlineRoundedIcon from '@material-ui/icons/WorkOutlineRounded';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import MenuTreeViewPage from "../../../../partials/content/TreeView/MenuTreeViewPage";
import Confirm from "../../../../partials/components/Confirm";
import { confirm, custom } from "devextreme/ui/dialog";

import { Button } from "devextreme-react";
import { PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";

import {
  eliminar, obtener, listarTreeview, crear, actualizar
} from "../../../../api/administracion/zona.api";
import ZonaEditPage from "./ZonaEditPage";

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
} from "../../../../api/acceso/puertaEquipo.api";
import { serviceEquipo } from "../../../../api/sistema/equipo.api";
import { serviceEquipoAsignado } from "../../../../api/sistema/equipoAsignado.api";

import EquipoEditPage from "../../sistema/equipo/EquipoEditPage";
import EquipoCheckListPage from "../../sistema/equipo/EquipoCheckListPage";

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

import ZonaRequisitoEditPage from "../../acceso/zonaRequisito/ZonaRequisitoEditPage";
import ZonaRequisitoListPage from "../../acceso/zonaRequisito/ZonaRequisitoListPage";

import PersonaMarcacionEditPage from "../../acceso/zona/PersonaMarcacionEditPage";
import PersonaMarcacionListPage from "../../acceso/zona/PersonaMarcacionListPage";
import VehiculoMarcacionListPage from "../../acceso/zona/VehiculoMarcacionListPage";
import VehiculoMarcacionEditPage from "../../acceso/zona/VehiculoMarcacionEditPage";

import ReportePermanenciaIndexPage from "./permanencia/ReportePermanenciaIndexPage";

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
  //const options = [{ id: 1, name: 'Zona', icon: 'map' }, { id: 2, name: 'Puerta', icon: 'key' }, { id: 3, name: 'Equipos', icon: 'toolbox' }];

  const [focusedRowKey, setFocusedRowKey] = useState();
  const [varIdDivision, setVarIdDivision] = useState("");
  const [varIdZona, setVarIdZona] = useState("");
  const [varIdPuerta, setVarIdPuerta] = useState("");
  const [varIdEquipo, setVarIdEquipo] = useState("");
  const [varNivel, setVarNivel] = useState(0);

  const [showForm, setShowForm] = useState("");
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(true);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.EDIT" }));
  const [listar, setListar] = useState([]);

  const [dataRowEditNewTabs, setDataRowEditNewTabs] = useState({});
  const [modoEdicionTabs, setModoEdicionTabs] = useState(false);
  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.EDIT" }));
  const [listarTabs, setListarTabs] = useState([]);
  const [selected, setSelected] = useState({});
  //const classesEncabezado = useStylesEncabezado();
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
  //definición estado de botones de acción.
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

  const [isDisabledTabsZona, setDisabledTabsZona] = useState(true);

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

  const [messagePopup, setMessagePopup] = useState("");


  const [filterDataMarcacionPersona, setFilterDataMarcacionPersona] = useState({ IdCliente: perfil.IdCliente });//
  const [filterDataMarcacionVehiculo, setFilterDataMarcacionVehiculo] = useState({ IdCliente: perfil.IdCliente });//

  //Custom grid:  :::::::::::::::::::::::::::::::::::::::::::::
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  //const [filterData, setFilterData] = useState({ ...initialFilterMarcas });
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();
  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::

  //Configuracion Tabs
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 5; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }


  //Activar e Inactivar Módulos
  //const [isModuleActive, setIsModuleActive] = useState(false);

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones para administrar Zona-:::::::::::::::::::::::::::::::::
  async function agregarZona(zona) {
    setLoading(true);
    const { IdZona, IdZonaPadre, Zona, Activo } = zona;
    let data = {
      IdCliente: perfil.IdCliente
      , IdDivision: perfil.IdDivision
      , IdZona: isNotEmpty(IdZona) ? IdZona.toUpperCase() : ""
      , IdZonaPadre: isNotEmpty(IdZonaPadre) ? IdZonaPadre : ""
      , Zona: isNotEmpty(Zona) ? Zona.toUpperCase() : ""
      , Activo
      , IdUsuario: usuario.username
      , IdModulo: dataMenu.info.IdModulo
    };
    await crear(data).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      //setModoEdicion(false);
      // listarZona();
      // setActionButton({ new: false, edit: false, save: false, cancel: true, delete: false });
      listarZona();
      setShowForm("");
      setVarNivel(0);
      setModoEdicion(false);
      setActionButton({ new: false, edit: false, save: false, cancel: true, delete: false });

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
      , IdModulo: dataMenu.info.IdModulo
    };
    await actualizar(data).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      //setModoEdicion(false);

      // setActionButton({ new: false, edit: false, save: false, cancel: true });
      // listarZona();
      listarZona();
      setShowForm("");
      setVarNivel(0);
      setModoEdicion(false);
      setActionButton({ new: false, edit: false, save: false, cancel: true, delete: false });

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  //async function eliminarNodoTreeview(zona) {
  async function eliminarNodoTreeview(confirm) {
    //console.log("eliminarNodoTreeview", confirm)
    if (confirm === undefined) setIsVisible(true)
    if (confirm) setLoading(true);
    if (confirm) setLoading(true);
    const { IdDivision, IdCliente, IdZona, IdPuerta, IdEquipo } = selectedNode;
    if (showForm === "Equipo" && confirm) {
      //Equipo
      await eliminarEquipoServicio({ IdDivision, IdCliente, IdZona, IdPuerta, IdEquipo, IdUsuario: usuario.username, IdModulo: dataMenu.info.IdModulo }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    } else if (showForm === "Puerta" && confirm) {
      //Puerta
      await eliminarPuertaServicio({ IdDivision, IdCliente, IdZona, IdPuerta, IdUsuario: usuario.username }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });

    } else if (showForm === "Zona" && confirm) {
      //Zona 
      await eliminar({ IdDivision, IdCliente, IdZona, IdModulo: dataMenu.info.IdModulo, IdUsuario: usuario.username }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    }
    if (confirm) setShowForm("");
    if (confirm) setVarNivel(0);
    if (confirm) listarZona();
    setModoEdicion(false);
    setActionButton({ new: false, edit: false, save: false, cancel: true, delete: false });

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
      //console.log("listarZona|zonas:", zonas);

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
      // console.log("obtenerZona|filtro:", filtro);
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

  const nuevoRegistro = (button) => {

    const { IdCliente, IdDivision, IdZona, IdPuerta, Nivel, Menu } = selectedNode;

    let objeto = {};
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));


    if (Nivel === 1 && button === "ZONA") {
      //Division para agregar Zonas.>[Solo Zonas]
      objeto = { Activo: "S", IdCliente, IdDivision, IdZonaPadre: "", IdZona: "" };
      setShowForm("Zona");

    } else if (Nivel === 2 && button === "ZONA") {
      //Zona para agregar Sub-Zonas o Puerta>[Sub-Zona o Puerta]
      objeto = { Activo: "S", IdZonaPadre: IdZona, IdZona: "" };
      setShowForm("Zona");
      setTitulo(intl.formatMessage({ id: "ACTION.NEW" }) + " - " + intl.formatMessage({ id: "ADMINISTRATION.ZUBZONE" }) + " - [" + Menu + "]");
      //setMessagePopup(intl.formatMessage({ id: "ADMINISTRATION.ZONE.ADD.ZUBZONE" }));
      //loadMessagePopUp(objeto, false, false, 2);

      //Acción de botones
      //setActionButton({ new: false, edit: false, save: true, cancel: true, delete: false });

    } else if (Nivel === 2 && button === "PUERTA") {

      objeto = { Activo: "S", IdZona, IdPuerta, IdEquipo: "" };
      setShowForm("Puerta");

    } else if (Nivel === 3 && button === "EQUIPO") {
      listarEquipo(selectedNode);
      setShowForm("Equipos");
    }

    //Limpiar formulario
    setModoEdicion(true);
    setDataRowEditNew({ ...objeto, esNuevoRegistro: true });
    //Aplicar Acción a los botones
    setActionButton({ new: false, edit: false, save: true, cancel: true, delete: false });

    // if (Nivel === 1 || Nivel === 3) {
    //   setModoEdicion(true);      
    //   //Acción de botones.
    //   setActionButton({ new: false, edit: false, save: true, cancel: true, delete: false });

    //   setDataRowEditNew({ ...objeto, esNuevoRegistro: true });
    // }

  };

  const nuevoRegistroZonaPuerta = (str_objeto) => {

    nuevoRegistroConfirm(selected, str_objeto);

  }

  const callConfirmPuerta = () => {
    setTimeout(function () {
      const { IdCliente, IdDivision, IdZona, IdPuerta, Nivel } = selectedNode;
      let objeto = { Activo: "S", IdCliente, IdDivision, IdZona, IdPuerta: "" };
      setMessagePopup(intl.formatMessage({ id: "ADMINISTRATION.ZONE.ADD.DOOR" }));
      loadMessagePopUp(objeto, false, false, 3);
    }, 500);

  }

  // const treeViewSetFocusNodo = (data, idMenu) => {
  //   let menus = [];
  //   let objIndex = data.findIndex((obj => obj.IdMenu === idMenu));
  //   if (objIndex >= 0) data[objIndex].selected = true;
  //   menus.push(...data);
  //   return menus;
  // }



  const seleccionarNodo = async (dataRow) => {

    //console.log("seleccionarNodo|dataRow:", dataRow);

    const { IdDivision, IdZona, IdPuerta, IdEquipo, Nivel, IdModulo } = dataRow;

    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    setVarNivel(Nivel);

    if (Nivel === 1) {
      //Division sin formulario-
      setShowForm("");
    } else if (Nivel === 2) {
      setShowForm("Zona");
      await obtenerZona(dataRow);
    } else if (Nivel === 3) {
      setShowForm("Puerta");
      await obtenerPuerta(dataRow);
    } else if (Nivel === 4 || Nivel === 5) {
      setShowForm("Equipo");
      await obtenerEquipo(dataRow)
    }

    setVarIdDivision(IdDivision);
    setVarIdZona(IdZona);
    setVarIdPuerta(IdPuerta);
    setVarIdEquipo(IdEquipo);
    setSelectedNode(dataRow);

    //Acción de botones.
    if (Nivel === 1) {
      setActionButton({ new: isNotEmpty(IdDivision) ? true : false });
    } else {
      setActionButton({
        new: isNotEmpty(IdModulo) ? true : false,
        delete: isNotEmpty(IdModulo) ? true : false,
        edit: isNotEmpty(IdModulo) ? true : false,
      });

    }
    // setIsModuleActive(isNotEmpty(IdModulo) ? false : true);
    // let disabled = !isNotEmpty(IdModulo);
    setDisabledTabsZona(!isNotEmpty(IdModulo));

  }

  const editarRegistro = () => {
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
    setActionButton({ new: true, edit: true, save: false, cancel: true });
    //cancelarEdicionSection();
    //Treeview: Comportamiento para agregar nuevo menu**********************
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

    if (isNotEmpty(IdPuerta)) {
      await obtenerPuertaServicio({
        IdDivision, IdCliente, IdZona, IdPuerta
      }).then(puerta => {
        setDataRowEditNew({ ...puerta, esNuevoRegistro: false });
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
        .finally(() => { setLoading(false); });
    }
    setLoading(false);

  }

  async function agregarPuerta(puerta) {
    setLoading(true);
    const { IdZona, IdPuerta, Puerta, IdTipoPuerta, PuertaCalle, Activo } = puerta;
    let data = {
      IdCliente: perfil.IdCliente
      , IdDivision: perfil.IdDivision
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
      // setModoEdicion(false);
      // listarZona();
      // seleccionarNodo(selectedNode);
      listarZona();
      setShowForm("");
      setVarNivel(0);
      setModoEdicion(false);
      setActionButton({ new: false, edit: false, save: false, cancel: true, delete: false });

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
    await actualizarPuertaServicio(data).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarZona();
      setShowForm("");
      setVarNivel(0);
      setModoEdicion(false);
      setActionButton({ new: false, edit: false, save: false, cancel: true, delete: false });

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones para administrar Equipos-:::::::::::::::::::::::::::::::::
  async function listarEquipo(filtro) {
    setLoading(true);
    const { IdCliente, IdDivision, IdZona, IdPuerta } = filtro;
    //PENDIENTE LISTAR EQUIPOS PENDIENTE DE ASIGNAR

    await serviceEquipoAsignado.listar({
      IdCliente,
      IdTipoEquipo: '%',
      IdModelo: '%',
      IdTipoLectura: '%'
    }).then(equipos => {
      setListar(equipos);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  async function agregarEquipos(equipo) {
    setLoading(true);
    const { IdZona, IdPuerta, Equipos, Activo } = equipo;
    if (isNotEmpty(Equipos)) {

      let tot_rows = 0;
      for (let i = 0; i < Equipos.length; i++) {
        let idEquipo = Equipos[i];

        let data = {
          IdCliente: perfil.IdCliente
          , IdDivision: perfil.IdDivision
          , IdZona: varIdZona//isNotEmpty(IdZona) ? IdZona : ""
          , IdPuerta: varIdPuerta//isNotEmpty(IdPuerta) ? IdPuerta : ""
          , IdEquipo: isNotEmpty(idEquipo) ? idEquipo : ""
          , Activo: "S"
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
        setShowForm("");
        setVarNivel(0);
        setModoEdicion(false);
        seleccionarNodo(selectedNode);//EGSC
        setActionButton({ new: false, edit: false, save: false, cancel: true, delete: false });
      }

    }

  }

  async function actualizarEquipo(equipo) {
    setLoading(true);
    const { IdZona, IdPuerta } = selectedNode;
    const {
      IdEquipo
      , Equipo
      , IdTipoEquipo
      , IdModelo
      , IdEquipoPadre
      , MacAddress
      , NumeroSerie
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
      IdCliente: perfil.IdCliente
      , IdDivision: perfil.IdDivision
      , IdZona: isNotEmpty(IdZona) ? IdZona : ""
      , IdPuerta: isNotEmpty(IdPuerta) ? IdPuerta : ""

      , IdEquipo: isNotEmpty(IdEquipo) ? IdEquipo.toUpperCase() : ""
      , Equipo: isNotEmpty(Equipo) ? Equipo.toUpperCase() : ""
      , IdTipoEquipo: isNotEmpty(IdTipoEquipo) ? IdTipoEquipo.toUpperCase() : ""
      , IdModelo: isNotEmpty(IdModelo) ? IdModelo.toUpperCase() : ""
      , IdEquipoPadre: isNotEmpty(IdEquipoPadre) ? IdEquipoPadre : ""
      , MacAddress: isNotEmpty(MacAddress) ? MacAddress.toUpperCase() : ""
      , NumeroSerie: isNotEmpty(NumeroSerie) ? NumeroSerie.toUpperCase() : ""
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
      , Activo
      , IdUsuario: usuario.username
    };
    await actualizarEquipoServicio(data).then(() => {
      serviceEquipo.actualizar(data).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        // setModoEdicion(false);
        // listarZona();
        // seleccionarNodo(selectedNode);
        listarZona();
        setShowForm("");
        setVarNivel(0);
        setModoEdicion(false);
        seleccionarNodo(selectedNode);//EGSC
        setActionButton({ new: false, edit: false, save: false, cancel: true, delete: false });
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

  async function agregarZonaRequisito(zonaRequisito) {
    setLoading(true);
    const { IdCliente, IdDivision, IdZona, IdRequisito, Activo, Warning } = zonaRequisito;
    let data = {
      IdCliente
      , IdDivision
      , IdZona
      , IdRequisito: isNotEmpty(IdRequisito) ? IdRequisito.toUpperCase() : ""
      , Activo: Activo
      , Warning: Warning
      , IdUsuario: usuario.username
    };
    await crearRequisito(data).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarZonaRequisito();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarZonaRequisito(zonaRequisito) {
    setLoading(true);
    const { IdCliente, IdDivision, IdZona, IdRequisito, Activo, Warning } = zonaRequisito;
    let data = {
      IdCliente
      , IdDivision
      , IdZona
      , IdRequisito: isNotEmpty(IdRequisito) ? IdRequisito.toUpperCase() : ""
      , Activo: Activo
      , Warning: Warning
      , IdUsuario: usuario.username
    };
    await actualizarRequisito(data).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarZonaRequisito();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarZonaRequisito() {
    setLoading(true);
    const { IdZona, IdRequisito, IdCliente, IdDivision } = selected;
    await eliminarRequisito({
      IdZona,
      IdRequisito,
      IdCliente,
      IdDivision,
      IdUsuario: usuario.username
    }).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
    listarZonaRequisito();
  }

  async function loadMessagePopUp(p_data, p_confirm, p_cancel, p_nivelPopUp, evt) {

    if (p_confirm) {

      switch (nivel_popup) {
        case -2:
        case 1: eliminarZonaRequisito(); break;
        case 2: nuevoRegistroZonaPuerta("Zona"); break;
        // case 3: nuevoRegistroZonaPuerta("Puerta"); break;
      }


    } if (p_cancel) {
      switch (nivel_popup) {
        case 2: callConfirmPuerta(); break;
      }

    } else {
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

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }


  const cargarDatosInfo = (currentObject, Nivel) => {
    let Id = '';
    let Name = '';

    switch (Nivel) {
      case 1: Id = currentObject.IdDivision; break;
      case 2: Id = currentObject.IdZona; break;
      case 3: Id = currentObject.IdPuerta; break;
      case 4: Id = currentObject.IdEquipo; break;
    };
    Name = currentObject.Menu;
    return { Id, Name };
  }

  const getInfo = () => {

    let Datos = [
      { text: intl.formatMessage({ id: "SYSTEM.DIVISION" }), value: "", id: "" },
      { text: intl.formatMessage({ id: "ADMINISTRATION.ZONE" }), value: "", id: "" },
      { text: intl.formatMessage({ id: "ADMINISTRATION.ZONE.DOOR" }), value: "", id: "" },
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
  //:::  LISTAR MARCACION PERSONA ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: 
  const listarMarcacionPersona = async () => {



    const { IdCliente, IdDivision, IdEquipo, IdPuerta, IdZona } = selectedNode;
    let { FechaInicio, FechaFin } = getDateOfDay();

    let filtros = {
      IdCliente: perfil.IdCliente,
      IdDivision,
      IdZona,
      IdPuerta,
      IdEquipo,
      IdPersona: 0,
      FechaInicio,//: FechaInicio.toLocaleString(),
      FechaFin,//: FechaFin.toLocaleString()
    };
    setFilterDataMarcacionPersona(filtros);
    //console.log("setFilterDataMarcacionPersona", filtros);
    setListarTabs([]);
    setModoEdicionTabs(false);


  }

  const verMarcacionPersona = async (data) => {
    const { IdDivision, IdEquipo, IdPuerta, IdZona, IdPersona, FechaMarca, FechaCorta, Minutos } = data;
    setModoEdicionTabs(true);
    //FechaCorta Minutos
    let filtros = {
      IdDivision: isNotEmpty(IdDivision) ? IdDivision : "",
      IdZona: isNotEmpty(IdZona) ? IdZona : "",
      IdPuerta: isNotEmpty(IdPuerta) ? IdPuerta : "",
      IdEquipo: isNotEmpty(IdEquipo) ? IdEquipo : "",
      IdPersona: isNotEmpty(IdPersona) ? IdPersona : 0,
      FechaInicio: FechaMarca,
      FechaFin: FechaMarca,
    };


    let zonaMarcacion = await obtenerByZona({
      IdCliente: perfil.IdCliente,
      filtro: JSON.stringify(filtros),
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNewTabs({ ...zonaMarcacion[0], esNuevoRegistro: false, isReadOnly: true, });
  }

  const consultarMarcacionPersonas = async (filtro) => {
    setListarTabs([]);
    const { IdDivision, IdEquipo, IdPuerta, IdZona } = selectedNode;
    let { FechaInicio, FechaFin } = filtro;
    FechaInicio = dateFormat(FechaInicio, "yyyyMMdd"); //new Date(FechaInicio).toLocaleString();
    FechaFin = dateFormat(FechaFin, "yyyyMMdd"); //new Date(FechaFin).toLocaleString();

    let filtros = {
      IdDivision,
      IdZona,
      IdPuerta,
      IdEquipo,
      IdPersona: 0,
      FechaInicio,
      FechaFin
    };

    let zonaMarcacion = await obtenerByZona({
      IdCliente: perfil.IdCliente,
      filtro: JSON.stringify(filtros),
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });

    setListarTabs(zonaMarcacion);


  }

  //:::  LISTAR MARCACION VEHICULO :::::::::::::::::::::::::::::::::::::::::::::::::::::

  const listarMarcacionVehiculo = async () => {
    setListarTabs([]);
    const { IdCliente, IdDivision, IdEquipo, IdPuerta, IdZona } = selectedNode;
    let { FechaInicio, FechaFin } = getDateOfDay();



    let filtros = {
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdZona,
      IdPuerta,
      IdEquipo,
      IdVehiculo: 0,
      FechaInicio,//: FechaInicio.toLocaleString(),
      FechaFin,//: FechaFin.toLocaleString()
    };


    setFilterDataMarcacionVehiculo(filtros);
    //console.log("setFilterDataMarcacionVehiculo", filtros);

    setListarTabs([]);
    setModoEdicionTabs(false);


    // let zonaMarcacion = await obtenerVehiculoByZona({
    //   IdCliente: perfil.IdCliente,
    //   filtro: JSON.stringify(filtros),
    // }).catch(err => {
    //   handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    // });

    // setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    // setListarTabs(zonaMarcacion);
    // setModoEdicionTabs(false);

  }

  const verMarcacionVehiculo = async (data) => {
    const { IdDivision, IdEquipo, IdPuerta, IdZona, IdVehiculo, FechaMarca } = data;
    setModoEdicionTabs(true);

    let filtros = {
      IdDivision,
      IdZona,
      IdPuerta,
      IdEquipo,
      IdVehiculo,
      FechaInicio: FechaMarca,
      FechaFin: FechaMarca,
    };

    let zonaMarcacion = await obtenerVehiculoByZona({
      IdCliente: perfil.IdCliente,
      filtro: JSON.stringify(filtros),
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNewTabs({ ...zonaMarcacion[0], esNuevoRegistro: false, isReadOnly: true, });
  }

  const consultarMarcacionVehiculo = async (filtro) => {
    setListarTabs([]);
    const { IdDivision, IdEquipo, IdPuerta, IdZona } = selectedNode;

    let { FechaInicio, FechaFin } = filtro;
    FechaInicio = dateFormat(FechaInicio, "yyyyMMdd hh:mm");// new Date(FechaInicio).toLocaleString();
    FechaFin = dateFormat(FechaFin, "yyyyMMdd");//new Date(FechaFin).toLocaleString();

    let filtros = {
      IdDivision,
      IdZona,
      IdPuerta,
      IdEquipo,
      IdVehiculo: 0,
      FechaInicio,
      FechaFin
    };

    let zonaMarcacion = await obtenerVehiculoByZona({
      IdCliente: perfil.IdCliente,
      filtro: JSON.stringify(filtros),
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });

    setListarTabs(zonaMarcacion);


  }


  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "ADMINISTRATION.ZONE.REQUIREMENTS",
      "ADMINISTRATION.ZONE.MARK.PERSON",
      "ADMINISTRATION.ZONE.MARK.VEHICLE",
      "ACCESS.REPORT.PERMANENCE"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }


  const tabsDisabled = () => {
    return isNotEmpty(varIdZona) ? false : true;
    //return true;
  }

  const tabsDisabledPermanencia = () => {

    return isNotEmpty(varIdDivision) && !isNotEmpty(varIdPuerta) && !isNotEmpty(varIdEquipo) ? false : true;
  }

  const tabContent_Zona = () => {
    return <>

      <div className={classes.gridRoot}>
        {/**-++INCIO+++DEFINICION DE BOTONES++++ */}
        <PortletHeader
          title={""}
          toolbar={
            <PortletHeaderToolbar>
              <Button
                icon="fa fa-plus"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.NEW" }) + " " + intl.formatMessage({ id: "ADMINISTRATION.ZONE" })}
                onClick={() => nuevoRegistro('ZONA')}
                disabled={!actionButton.new || !(actionButton.new && (varNivel === 1 || varNivel === 2) ? true : false)}
              />
              &nbsp;
              <Button
                icon="fa fa-key"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.NEW" }) + " " + intl.formatMessage({ id: "ADMINISTRATION.ZONE.DOOR" })}
                onClick={() => nuevoRegistro('PUERTA')}
                disabled={!actionButton.new || !(actionButton.new && (varNivel === 2) ? true : false)}
              />
              &nbsp;
              <Button
                icon="fa fa-toolbox"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.NEW" }) + " " + intl.formatMessage({ id: "ADMINISTRATION.ZONE.DEVICE" })}
                onClick={() => nuevoRegistro('EQUIPO')}
                disabled={!actionButton.new || !(actionButton.new && (varNivel === 3) ? true : false)}
              />
              &nbsp;


              <Button
                icon="fa fa-edit"
                type="default"
                hint="Editar"
                disabled={!actionButton.edit}
                onClick={editarRegistro}
              />
              &nbsp;
              <Button
                icon="fa fa-save"
                type="default"
                hint="Grabar"
                onClick={() => { document.getElementById("idButtonGrabarTview").click() }}
                disabled={!actionButton.save}
              />
              &nbsp;
              <Button
                icon="fa fa-trash"
                type="default"
                hint="Eliminar"
                onClick={() => eliminarNodoTreeview(undefined)}
                disabled={!actionButton.delete}
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
                dataFilter={dataFilter}
                setDataFilter={setDataFilter}
                isSubMenu={isSubMenu}
                setIsSubMenu={setIsSubMenu}
                seleccionarNodo={seleccionarNodo}
                showModulo={false}
                showButton={false}
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
                      tipoEquipos={""}
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
                      agregarEquipos={agregarEquipos}
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


  const tabContent_ZonaRequisitoListPage = () => {
    return <>
      {modoEdicionTabs && (
        <>
          <ZonaRequisitoEditPage
            dataRowEditNew={dataRowEditNewTabs}
            actualizar={actualizarZonaRequisito}
            agregar={agregarZonaRequisito}
            cancelarEdicion={cancelarEdicionTabs}
            titulo={tituloTabs}
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
          <ZonaRequisitoListPage
            zonaRequisitos={listarTabs}
            editarRegistro={editarZonaRequisito}
            setMessagePopup={setMessagePopup}
            eliminarRegistro={loadMessagePopUp}
            nuevoRegistro={nuevoRegistroTabs}
            cancelarEdicion={cancelarEdicion}
            seleccionarRegistro={seleccionarRegistroZonaRequisito}
            focusedRowKey={focusedRowKey}
            getInfo={getInfo}
          />
        </>
      )}
    </>
  }

  const tabContent_PersonaMarcacionListPage = () => {
    return <>
      {modoEdicionTabs && (
        <>
          <PersonaMarcacionEditPage
            dataRowEditNew={dataRowEditNewTabs}
            cancelarEdicion={cancelarEdicionTabs}
            titulo={tituloTabs}
            getInfo={getInfo}
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
          <PersonaMarcacionListPage
            //personaMarcacionData={listarTabs}
            filterData={filterDataMarcacionPersona}
            setFilterData={setFilterDataMarcacionPersona}
            verRegistro={verMarcacionPersona}
            cancelarEdicion={cancelarEdicion}
            consultarPersonas={consultarMarcacionPersonas}
            focusedRowKey={focusedRowKey}
            getInfo={getInfo}
          />
        </>
      )}
    </>
  }

  const tabContent_VehiculoMarcacionListPage = () => {
    return <>
      {modoEdicionTabs && (
        <>
          <VehiculoMarcacionEditPage
            dataRowEditNew={dataRowEditNewTabs}
            cancelarEdicion={cancelarEdicionTabs}
            titulo={tituloTabs}
            getInfo={getInfo}
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
          <VehiculoMarcacionListPage
            //personaMarcacionData={listarTabs}
            filter={filterDataMarcacionVehiculo}
            //setFilterData={setFilterDataMarcacionVehiculo}
            verRegistro={verMarcacionVehiculo}
            cancelarEdicion={cancelarEdicion}
            consultarRegistro={consultarMarcacionVehiculo}
            focusedRowKey={focusedRowKey}
            getInfo={getInfo}

            //Propiedades del customerDataGrid 
            //uniqueId={"posicionesList"}
            isFirstDataLoad={isFirstDataLoad}
            setIsFirstDataLoad={setIsFirstDataLoad}
            dataSource={dataSource}
            refresh={refresh}
            resetLoadOptions={resetLoadOptions}
            refreshData={refreshData}
            setRefreshData={setRefreshData}

          />
        </>
      )}
    </>
  }

  const tabContent_ReportePermanenciaIndexPage = () => {
    return <>
      <ReportePermanenciaIndexPage
        varIdZona={varIdZona}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}

        selected={selected}
        dataRowEditNew={dataRowEditNew}
        changeTabIndex={changeTabIndex}
        dataRowEditNewTabs={dataRowEditNewTabs}
        setModoEdicionTabs={setModoEdicionTabs}
        setListarTabs={setListarTabs}
        selectedNode={selectedNode}

      />
    </>
  }

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "ADMINISTRATION.ZONE.MENU" })}
        subtitle={intl.formatMessage({ id: "ADMINISTRATION.ZONE.MAINTENANCE" })}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.ZONE.MAINTENANCE" }),
            icon: <RoomRoundedIcon fontSize="large" />
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.ZONE.REQUIREMENTS" }),
            icon: <WorkOutlineRoundedIcon fontSize="large" />,
            onClick: (e) => { listarZonaRequisito() },
            //disabled: tabsDisabled() 
            disabled: isDisabledTabsZona
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.ZONE.MARK.PERSON" }),
            icon: <PersonOutlineIcon fontSize="large" />,
            onClick: (e) => { listarMarcacionPersona() },
            disabled: isDisabledTabsZona
            //disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.ZONE.MARK.VEHICLE" }),
            icon: <DepartureBoardIcon fontSize="large" />,
            onClick: () => { listarMarcacionVehiculo() },
            disabled: isDisabledTabsZona
            //disabled: !tabsDisabled() && accessButton.Tabs[3] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ACCESS.REPORT.PERMANENCE" }),
            icon: <PeopleAltOutlinedIcon fontSize="large" />,
            disabled: isDisabledTabsZona //!tabsDisabledPermanencia() && accessButton.Tabs[4] ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_Zona(),
            tabContent_ZonaRequisitoListPage(),
            tabContent_PersonaMarcacionListPage(),
            tabContent_VehiculoMarcacionListPage(),
            tabContent_ReportePermanenciaIndexPage()
          ]
        }
      />

      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        onConfirm={() => eliminarNodoTreeview(true)} //loadMessagePopUp({}, true, false, -1)
        onHide={() => eliminarNodoTreeview(false)} //loadMessagePopUp({}, false, true, -2,)
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />
    </>
  );
};



export default injectIntl(WithLoandingPanel(ZonaIndexPage));
