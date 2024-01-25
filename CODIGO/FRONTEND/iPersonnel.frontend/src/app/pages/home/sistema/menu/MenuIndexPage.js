import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Portlet } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { Button } from "devextreme-react";
import { PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";

import { isNotEmpty } from "../../../../../_metronic";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";

import {
  serviceMenu
} from "../../../../api/sistema/menu.api";

import {
  eliminar as eliminarDatos,
  crear as crearDatos,
  actualizar as actualizarDatos,
  obtener as obtenerDatos,
  listar as listarDatos
} from "../../../../api/sistema/menuDatosPersonalizado.api";

import MenuEditPage from "./MenuEditPage";
import MenuTreeViewPage from "../../../../partials/content/TreeView/MenuTreeViewPage";//partials/content/Treeview/MenuTreeViewPage
import MenuDatosPersonalizadoEditPage from "./MenuDatosPersonalizadoEditPage";
import MenuDatosPersonalizadoListPage from "./MenuDatosPersonalizadoListPage";

import {
  eliminar as eliminarMenObjeto,
  crear as crearMenObjeto,
  actualizar as actualizarMenObjeto,
  obtener as obtenerMenObjeto,
  listar as listarMenObjeto
} from "../../../../api/sistema/menuObjeto.api";
import MenuObjetoEditPage from "./MenuObjetoEditPage";
import MenuObjetoListPage from "./MenuObjetoListPage";
import MenuControllerEditPage from "./MenuControllerEditPage";
// import MenuControllerListPage from "./MenuControllerListPage";
import SistemaObjetoBuscar from "../../../../partials/components/SistemaObjetoBuscar";
import { obtenerTodos as ListarObjetos } from "../../../../api/sistema/objeto.api";
import { serviceMenuController } from "../../../../api/sistema/menuController.api";
import DynamicFeedIcon from '@material-ui/icons/DynamicFeed';
import DnsIcon from '@material-ui/icons/Dns';
import AssignmentLateIcon from '@material-ui/icons/AssignmentLate';
//import AccountCircleOutlinedIcon from "@material-ui/icons/AccountCircleOutlined";

const MenuIndexPage = (props) => {
  const { intl, setLoading , TipoAplicacion } = props;
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [selectedNode, setSelectedNode] = useState({});
  const [varIdMenu, setVarIdMenu] = useState("");
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


  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(true);
  const [titulo, setTitulo] = useState("");
  const [icono, setIcono] = useState("");
  const [actionButton, setActionButton] = useState({
    new: true, edit: true, save: true, delete: true, cancel: true
  });

  const [dataRowEditNewSection, setDataRowEditNewSection] = useState({});
  const [modoEdicionSection, setModoEdicionSection] = useState(false);
  const [tituloSection, setTituloSection] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [listarSection, setListarSection] = useState([]);

  const classesEncabezado = useStylesEncabezado();
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);

  const classes = useStyles();
  const [showConfigurarCampos, setShowConfigurarCampos] = useState(false);
  const [showTabs, setShowTabs] = useState(false);
  const [showPersonalizar, setShowPersonalizar] = useState(false);
  const [valueColorBarraMenu, setValueColorBarraMenu] = useState("");
  const [valueColorFondo, setValueColorFondo] = useState("");

  const handleChange = (event, newValue) => {
    setTabHorIndex(newValue);
  };

  const [tabHorIndex, setTabHorIndex] = useState(0);

  const [isVisiblePopUpObjetos, setisVisiblePopUpObjetos] = useState(false);
  const [focusedRowKeyMenuObjeto, setFocusedRowKeyMenuObjeto] = useState();
  const [menuObjetos, setMenuObjetos] = useState([]);
  const [menuController, setMenuController] = useState([]);
  //Eliminar
  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});

  const [grillaObjeto, setGrillaObjeto] = useState([]);
  const [gridBoxValue, setGridBoxValue] = useState([]);

  const [isVisibleOpcion2, setIsVisibleOpcion2] = useState(false);

  const onValueChangedPersonalizar = (value) => { setShowPersonalizar(value) }

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones para administrar el Menú-:::::::::::::::::::::::::::::::::
  async function agregarMenu(menu) {
    setLoading(true);
    const { IdMenu, Descripcion, IdModulo, IdAplicacion, IdMenuPadre, Menu, Ruta, Icono,IconoBase64, Nivel, Orden, Activo, Personalizar, ColorBarraMenu, ColorFondo, IdRepositorio, ConfigurarDatos } = menu;
    let data = {
      IdModulo
      , IdAplicacion
      , IdMenu
      , IdMenuPadre: isNotEmpty(IdMenuPadre) ? IdMenuPadre : ""
      , Menu: isNotEmpty(Menu) ? Menu : ""
      , Descripcion: isNotEmpty(Descripcion) ? Descripcion : ""
      , Ruta: isNotEmpty(Ruta) ? Ruta : ""
      , Icono: isNotEmpty(Icono) ? Icono : ""
      , IconoBase64: isNotEmpty(IconoBase64) ? IconoBase64 : ""
      , Nivel: isNotEmpty(Nivel) ? Nivel : 0
      , Orden: isNotEmpty(Orden) ? Orden : 0
      , Activo
      , Personalizar: isNotEmpty(Personalizar) ? Personalizar : ""
      , ColorBarraMenu: isNotEmpty(ColorBarraMenu) ? ColorBarraMenu : ""
      , ColorFondo: isNotEmpty(ColorFondo) ? ColorFondo : ""
      , IdRepositorio: isNotEmpty(IdRepositorio) ? IdRepositorio : ""
      , ConfigurarDatos: isNotEmpty(ConfigurarDatos) ? ConfigurarDatos : ""
      , IdCliente: perfil.IdCliente
      , IdUsuario: usuario.username
    };
    await serviceMenu.crear(data).then(response => {
      listarMenu();
      setVarIdMenu("");
      setIsVisibleOpcion2(false);
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function actualizarMenu(menu) {
    setLoading(true);
    const { IdMenu, Descripcion, IdModulo, IdAplicacion, IdMenuPadre, Menu, Ruta, Icono,IconoBase64, Nivel, Orden, Activo, Personalizar, ColorBarraMenu, ColorFondo, IdRepositorio, ConfigurarDatos } = menu;
    setValueColorBarraMenu(ColorBarraMenu);
    setValueColorFondo(ColorFondo);
    let data = {
      IdModulo
      , IdAplicacion
      , IdMenu: isNotEmpty(IdMenu) ? IdMenu : ""
      , IdMenuPadre: isNotEmpty(IdMenuPadre) ? IdMenuPadre : ""
      , Menu: isNotEmpty(Menu) ? Menu : ""
      , Descripcion: isNotEmpty(Descripcion) ? Descripcion : ""
      , Ruta: isNotEmpty(Ruta) ? Ruta : ""
      , Icono: isNotEmpty(Icono) ? Icono : ""
      , IconoBase64: isNotEmpty(IconoBase64) ? IconoBase64 : ""
      , Nivel: isNotEmpty(Nivel) ? Nivel : 0
      , Orden: isNotEmpty(Orden) ? Orden : 0
      , Activo
      , Personalizar: isNotEmpty(Personalizar) ? Personalizar : ""
      , ColorBarraMenu: isNotEmpty(ColorBarraMenu) ? ColorBarraMenu : ""
      , ColorFondo: isNotEmpty(ColorFondo) ? ColorFondo : ""
      , IdRepositorio: isNotEmpty(IdRepositorio) ? IdRepositorio : ""
      , ConfigurarDatos: isNotEmpty(ConfigurarDatos) ? ConfigurarDatos : ""
      , IdCliente: perfil.IdCliente
      , IdUsuario: usuario.username
    };
    await serviceMenu.actualizar(data).then(response => {
      listarMenu();
      setVarIdMenu("");
      setIsVisibleOpcion2(false);
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function eliminarRegistro(menu, confirm) {
    setSelectedDelete(menu);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdModulo, IdAplicacion, IdMenu, Personalizado } = selectedNode;
      let data = { IdCliente: perfil.IdCliente, IdModulo, IdAplicacion, IdMenu, Personalizado };
      await serviceMenu.eliminar(data).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      setVarIdMenu("");
      setIsVisibleOpcion2(false);
      listarMenu(menu);
    }
  }


  async function obtenerMenu(filtro) {
    setLoading(true);
    changeTabIndex(0);
    const { IdModulo, IdAplicacion, IdMenu } = filtro;

    await serviceMenu.obtener({ IdModulo, IdAplicacion, IdMenu }).then(menu => {
      const { ConfigurarDatos, ColorBarraMenu, ColorFondo } = menu;
      setShowConfigurarCampos(ConfigurarDatos === "S" ? true : false);

      setValueColorBarraMenu(isNotEmpty(ColorBarraMenu) ? ColorBarraMenu : "");
      setValueColorFondo(isNotEmpty(ColorFondo) ? ColorFondo : "");

      setDataRowEditNew({ ...menu, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  async function listarMenu() {
    setLoading(true);
    const { IdModulo, IdAplicacion } = props.moduloAplicacion;
    let menus = await serviceMenu.listarTreeView({ IdCliente: perfil.IdCliente, IdModulo, IdAplicacion, NumPagina: 0, TamPagina: 0 });

    if (menus.length === 0) {
      setMenus([])
    } else {
      setMenus(menus);
      setLoading(false);
    }

    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "SYSTEM.MENU.VIEW" }));
    setActionButton({ new: true, edit: true, save: true, delete: true, cancel: true });
  }

  const nuevoRegistroMenu = () => {
    const { IdModulo, IdAplicacion, IdMenuPadre, IdMenu, Nivel } = selectedNode;
    let menu = {};
    if (!isNotEmpty(IdMenuPadre)) {
      //Crear menu en la Raiz
      menu = { IdMenu: IdModulo + "99", IdMenuPadre: "", Nivel: 1, Orden: 0, Activo: "S", Personalizar: "N", IdAplicacion, IdModulo, ConfigurarDatos: "N" };
      setActionButton({ new: true, edit: true, save: false, delete: true, cancel: false });

      setIsVisibleOpcion2(true);
    } else {
      //Crear sub-menu
      if (isNotEmpty(IdMenu)) {
        menu = { IdMenu: IdModulo + "99", IdMenuPadre: IdMenu, Nivel: (Nivel + 1), Orden: 0, Activo: "S", Personalizar: "N", IdAplicacion, IdModulo, ConfigurarDatos: "N" };
        setActionButton({ new: true, edit: true, save: false, delete: true, cancel: false });

      } else {
        handleInfoMessages(intl.formatMessage({ id: "SYSTEM.MENU.MESSAGE.SELECTIONMENU" }));
        return;
      }
    }
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setListarSection([]);
    setValueColorBarraMenu("");
    setValueColorFondo("");
    setVarIdMenu("");
    setDataRowEditNew({ ...menu, esNuevoRegistro: true });
  };

  const editarRegistroMenu = () => {
    setModoEdicion(true);
    setActionButton({ new: true, edit: true, save: false, delete: true, cancel: false });
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setShowTabs(true);
  };


  const seleccionarNodo = (dataRow) => {
    const { IdMenu, IdMenuPadre, Nivel } = dataRow;
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    setSelectedNode(dataRow);

    (IdMenuPadre == null && Nivel == 0) ? setIsVisibleOpcion2(false) : setIsVisibleOpcion2(true);

    if (IdMenuPadre == null) {
      setActionButton({ new: false, edit: true, save: true, delete: true, cancel: true });
      return;
    }

    obtenerMenu(dataRow);
    setVarIdMenu(IdMenu);
    setActionButton({ new: false, edit: false, save: true, delete: false, cancel: true });
  }


  const cancelarEdicion = () => {

    const { IdMenuPadre, Nivel } = selectedNode

    if (IdMenuPadre == null && Nivel == 0) {
      setModoEdicion(false);
      setTitulo(intl.formatMessage({ id: "SYSTEM.MENU.VIEW" }));
      cancelarEdicionSection();
      setDataRowEditNew({});
      setActionButton({ new: false, edit: true, save: true, delete: true, cancel: true });
      setIsVisibleOpcion2(false);
    } else {
      setModoEdicion(false);
      setTitulo(intl.formatMessage({ id: "SYSTEM.MENU.VIEW" }));
      cancelarEdicionSection();
      setDataRowEditNew({});
      seleccionarNodo(selectedNode);
      setActionButton({ new: false, edit: false, save: true, delete: false, cancel: true });
    }

  };


  //:::::::::::::::::::::::::::::::::::::::::::::-funciones para administrar campos obligatorios:::::::::::::::::::::::::::::::::

  async function listarMenuDatos() {//filtro

    const { IdModulo, IdAplicacion, IdMenu } = selectedNode;

    setLoading(true);
    await listarDatos({
      IdCliente: perfil.IdCliente,
      IdModulo,
      IdAplicacion,
      IdMenu,
      NumPagina: 0,
      TamPagina: 0
    }).then(menuDatos => {
      setTituloSection(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarSection(menuDatos);

      setActionButton({ new: true, edit: true, save: true, delete: true, cancel: true });

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

    setModoEdicionSection(false);


  }


  async function agregarMenuDatos(menuDatos) {
    setLoading(true);
    const { IdModulo, IdAplicacion, IdMenu, Campo, Descripcion, Obligatorio, Modificable } = menuDatos;
    let params = {
      IdCliente: perfil.IdCliente
      , IdModulo
      , IdAplicacion
      , IdMenu
      , Campo: isNotEmpty(Campo) ? Campo : ""
      , Descripcion: isNotEmpty(Descripcion) ? Descripcion.toUpperCase() : ""
      , Obligatorio: Obligatorio ? "S" : "N"
      , Modificable: Modificable ? "S" : "N"
      , IdUsuario: usuario.username
    };
    await crearDatos(params).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));

      listarMenuDatos(params);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarMenuDatos(dataRow) {
    setLoading(true);
    const { IdModulo, IdAplicacion, IdMenu, Campo, Descripcion, Obligatorio, Modificable } = dataRow;
    let params = {
      IdCliente: perfil.IdCliente
      , IdModulo
      , IdAplicacion
      , IdMenu
      , Campo: isNotEmpty(Campo) ? Campo : ""
      , Descripcion: isNotEmpty(Descripcion) ? Descripcion.toUpperCase() : ""
      , Obligatorio: Obligatorio ? "S" : "N"
      , Modificable: Modificable ? "S" : "N"
      , IdUsuario: usuario.username
    };
    await actualizarDatos(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicionSection(false);
      listarMenuDatos();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarMenuDatos(menuDatos, confirm) {
    setSelectedDelete(menuDatos);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdModulo, IdCliente, IdAplicacion, IdMenu, Campo } = menuDatos;
      await eliminarDatos({
        IdCliente,
        IdModulo,
        IdAplicacion,
        IdMenu,
        Campo,
        IdUsuario: usuario.username
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarMenuDatos(menuDatos);
    }
  }

  async function obtenerMenuDatos(filtro) {
    setLoading(true);
    const { IdModulo, IdAplicacion, IdMenu, Campo } = filtro;
    await obtenerDatos({
      IdCliente: perfil.IdCliente,
      IdModulo,
      IdAplicacion,
      IdMenu,
      Campo
    }).then(menuDatos => {

      menuDatos.Obligatorio = menuDatos.Obligatorio === "S" ? true : false;
      menuDatos.Modificable = menuDatos.Modificable === "S" ? true : false;

      setDataRowEditNewSection({ ...menuDatos, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }


  const editarRegistroMenuDatos = async (dataRow) => { //= dataRow => {
    changeTabIndex(2);
    setModoEdicionSection(true);
    setTituloSection(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerMenuDatos(dataRow);
  };


  const nuevoRegistroSection = () => {
    let nuevo = { Obligatorio: false, Modificable: false, ...selectedNode };
    setDataRowEditNewSection({ ...nuevo, esNuevoRegistro: true });
    setTituloSection(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicionSection(true);
    changeTabIndex(2);
  };

  const cancelarEdicionSection = () => {
    setModoEdicionSection(false);
    setTituloSection(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNewSection({});
  };


  //:::::::::FUNCIÓN MENU OBJETO:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function listarMenuObjeto() {
    setLoading(true);
    const { IdModulo, IdAplicacion, IdMenu } = selectedNode;
    //const { IdModulo, IdAplicacion, IdMenu, IdObjeto } = filtro;
    await listarMenObjeto({
      IdModulo,
      IdAplicacion,
      IdMenu,
      IdObjeto: '%',
      NumPagina: 0,
      TamPagina: 0
    }).then(menuObjetos => {
      setTituloSection(intl.formatMessage({ id: "ACTION.LIST" }));
      setMenuObjetos(menuObjetos);
      setActionButton({ new: true, edit: true, save: true, delete: true, cancel: true });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }



  async function agregarMenuObjeto(objetos) {
    setLoading(true);
    objetos.map(async (data) => {
      const { IdObjeto, Activo } = data;
      const { IdModulo, IdAplicacion, IdMenu } = selectedNode;
      let params = {
        IdModulo: isNotEmpty(IdModulo) ? IdModulo.toUpperCase() : ""
        , IdAplicacion: isNotEmpty(IdAplicacion) ? IdAplicacion.toUpperCase() : ""
        , IdMenu: isNotEmpty(IdMenu) ? IdMenu.toUpperCase() : ""
        , IdObjeto: isNotEmpty(IdObjeto) ? IdObjeto.toUpperCase() : ""
        , Activo
        , IdUsuario: usuario.username
      };

      await crearMenObjeto(params).then(response => {
        // if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        listarMenuObjeto(params);
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    });

    for (let i = 0; i < objetos.length; i++) {
      if (i === objetos.length - 1) {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      }
    }
  }

  async function actualizarMenuObjeto(dataRow) {
    setLoading(true);
    const { IdModulo, IdAplicacion, IdMenu, IdObjeto, Activo } = dataRow;
    let params = {
      IdModulo: isNotEmpty(IdModulo) ? IdModulo.toUpperCase() : ""
      , IdAplicacion: isNotEmpty(IdAplicacion) ? IdAplicacion.toUpperCase() : ""
      , IdMenu: isNotEmpty(IdMenu) ? IdMenu.toUpperCase() : ""
      , IdObjeto: isNotEmpty(IdObjeto) ? IdObjeto.toUpperCase() : ""
      , Activo
      , IdUsuario: usuario.username
    };
    await actualizarMenObjeto(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicionSection(false);
      listarMenuObjeto();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarMenuObjeto(menuObj, confirm) {
    setSelectedDelete(menuObj);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const {
        IdModulo,
        IdAplicacion,
        IdMenu,
        IdObjeto
      } = menuObj;
      await eliminarMenObjeto(
        {
          IdModulo,
          IdAplicacion,
          IdMenu,
          IdObjeto,
          IdUsuario: usuario.username
        }).then(response => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
      listarMenuObjeto(menuObj);
    }
  }

  async function obtenerMenuObjeto(filtro) {
    setLoading(true);
    const { IdModulo, IdAplicacion, IdMenu, IdObjeto } = filtro;
    await obtenerMenObjeto({
      IdModulo, IdAplicacion, IdMenu, IdObjeto
    }).then(menuDatos => {
      setDataRowEditNewSection({ ...menuDatos, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  const editarRegistroMenuObjeto = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicionSection(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerMenuObjeto(dataRow);
  };


  const nuevoRegistroMenuObjeto = () => {
    setisVisiblePopUpObjetos(true);
  };


  const seleccionarRegistroMenuObjeto = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKeyMenuObjeto(RowIndex);
  };



  //:::::::::FUNCIÓN MENÚ CONTROLLER:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function listarMenuController() {
    setLoading(true);
    changeTabIndex(3);
    const { IdModulo, IdAplicacion, IdMenu } = selectedNode;
    await serviceMenuController.listar({
      IdModulo,
      IdAplicacion,
      IdMenu,
      NumPagina: 0,
      TamPagina: 0
    }).then(menuController => {
      setTituloSection(intl.formatMessage({ id: "ACTION.LIST" }));
      setMenuController(menuController);
      setActionButton({ new: true, edit: true, save: true, delete: true, cancel: true });

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
    setModoEdicionSection(false);
  }


  async function agregarMenuController(controllers) {
    setLoading(true);
    const { IdModulo, IdAplicacion, IdMenu, IdController } = controllers;
    let params = {
      IdModulo
      , IdAplicacion
      , IdMenu
      , IdController: isNotEmpty(IdController) ? IdController.toUpperCase() : ""
      , IdUsuario: usuario.username
    };
    await serviceMenuController.crear(params).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarMenuController(params);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  async function eliminarMenuController(menuControllers, confirm) {
    setSelectedDelete(menuControllers);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdModulo, IdAplicacion, IdMenu, IdController } = menuControllers;
      await serviceMenuController.eliminar({
        IdModulo,
        IdAplicacion,
        IdMenu,
        IdController,
        IdUsuario: usuario.username
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarMenuController(menuControllers);
    }
  }



  const nuevoRegistroMenuController = () => {
    let nuevo = { ...selectedNode };
    setDataRowEditNewSection({ ...nuevo, esNuevoRegistro: true });
    setTituloSection(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicionSection(true);
    changeTabIndex(3);
  };




  /*******************************************************************/
  const changeTabIndex = (index) => {
    handleChange(null, index);
  }


  async function eliminarListRowTab(rowData, confirm) {
    let currentTab = tabHorIndex;

    switch (currentTab) {
      case 0:
        eliminarRegistro(rowData, confirm);
        break;
      case 1:
        eliminarMenuObjeto(rowData, confirm);
        break;
      case 2:
        eliminarMenuDatos(rowData, confirm);
        break;
      case 3:
        eliminarMenuController(rowData, confirm);
        break;
    }
  }

  const tabsDisabledConfigurationDatos = () => {
    return (isNotEmpty(varIdMenu) && showConfigurarCampos && !modoEdicion) ? true : false;
  }

  const tabsDisabled = () => {
    return (isNotEmpty(varIdMenu) && selectedNode.Nivel > 0 && !modoEdicion) ? false : true;
  }



  useEffect(() => {
    listarMenu();
  }, []);


  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (

    <>
      <div className={classes.gridRoot}>


        {/*##########.-Asignar componente MenuTreeViewPage-##################################################*/}

        <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
          toolbar={
            <PortletHeader
              title={""}
              toolbar={
                <PortletHeaderToolbar>
                  <Button
                    icon="fa fa-plus"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.NEW" })}
                    onClick={nuevoRegistroMenu}
                    disabled={actionButton.new}
                    useSubmitBehavior={true}
                    validationGroup="FormEdicion"
                  />
                  &nbsp;
                  <Button
                    icon="fa fa-edit"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.EDIT" })}
                    disabled={actionButton.edit}
                    onClick={editarRegistroMenu}
                  />
                  &nbsp;
                  <Button
                    id="btnGrabar"
                    icon="fa fa-save"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                    onClick={() => { document.getElementById("idButtonSave").click() }}
                    disabled={actionButton.save}
                  />
                  &nbsp;
                  <Button
                    icon="fa fa-trash"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.REMOVE" })}
                    onClick={eliminarRegistro}
                    disabled={actionButton.delete}
                  />
                  &nbsp;
                  <Button
                    icon="fa fa-times-circle"
                    type="normal"
                    hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                    onClick={cancelarEdicion}
                    disabled={actionButton.cancel}
                  />
                  &nbsp;
                  <Button
                    icon="home"
                    type="normal"
                    hint={intl.formatMessage({ id: "COMMON.HOME" })}
                    onClick={props.cancelarIndex}
                    disabled={modoEdicion}
                  />
                </PortletHeaderToolbar>
              }>

            </PortletHeader>

          } />


        <Paper className={classes.paper}>
          <Grid container spacing={1} direction="row" justify="flex-start" alignItems="stretch" >
            <Grid item xs={6} style={{ borderRight: "1px solid #ebedf2" }} >

              <MenuTreeViewPage
                menus={menus}
                modoEdicion={modoEdicion}
                seleccionarNodo={seleccionarNodo}
              />

            </Grid>

            {isVisibleOpcion2 && (

              <Grid item xs={6} >
                <>
                  <Paper square className={classes.root}>
                    <Tabs
                      value={tabHorIndex}
                      onChange={handleChange}
                      variant="fullWidth"
                      indicatorColor="primary"
                      textColor="primary"
                    //aria-label="icon tabs example"

                    >
                      <Tab
                        label={intl.formatMessage({ id: "SYSTEM.MENU.MENU" })}
                        icon={<DynamicFeedIcon fontSize="large" />}
                        onClick={(e) => {
                          obtenerMenu(selectedNode);
                          setActionButton({ new: false, edit: false, save: true, delete: false, cancel: true });
                        }}
                        {...tabPropsIndex(0)}
                        className={classes.tabContent}
                        disabled={false}
                      />
                      <Tab
                        label={intl.formatMessage({ id: "SYSTEM.MENU.OBJECT.TAB" })}
                        icon={<DnsIcon fontSize="large" />}
                        onClick={listarMenuObjeto}{...tabPropsIndex(1)}
                        className={classes.tabContent}
                        disabled={!tabsDisabled() ? false : true}
                      />
                      <Tab
                        label={intl.formatMessage({ id: "SYSTEM.MENUDATA.TAB" })}
                        icon={<AssignmentLateIcon fontSize="large" />}
                        onClick={listarMenuDatos}
                        {...tabPropsIndex(2)}
                        disabled={!tabsDisabledConfigurationDatos()}
                        className={classes.tabContent}
                      />
                      {/* <Tab
                      label={intl.formatMessage({ id: "SYSTEM.MENUDATA.CONTROLLER" })}
                      icon={<AccountCircleOutlinedIcon fontSize="large" />}
                      onClick={listarMenuController}
                      {...tabPropsIndex(3)}
                      className={classes.tabContent}
                      disabled={!tabsDisabled() ? false : true}

                    /> */}
                    </Tabs>
                  </Paper>

                  <TabPanel value={tabHorIndex} className={classes.TabPanel} index={0}>
                    <MenuEditPage
                      titulo={titulo}
                      modoEdicion={modoEdicion}
                      dataRowEditNew={dataRowEditNew}
                      actualizarMenu={actualizarMenu}
                      agregarMenu={agregarMenu}
                      cancelarEdicion={cancelarEdicion}
                      icono={icono}
                      setIcono={setIcono}
                      eliminarMenu={eliminarRegistro}
                      onValueChangedPersonalizar={onValueChangedPersonalizar}
                      showPersonalizar={showPersonalizar}
                      accessButton={props.accessButton}
                      settingDataField={props.settingDataField}
                      valueColorBarraMenu={valueColorBarraMenu}
                      valueColorFondo={valueColorFondo}
                      setValueColorBarraMenu={setValueColorBarraMenu}
                      setValueColorFondo={setValueColorFondo}
                      TipoAplicacion = { TipoAplicacion }
                    />
                    <div className="col-12 d-inline-block">
                      <div className="float-right">
                        <ControlSwitch checked={auditoriaSwitch}
                          onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                        /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
                      </div>
                    </div>
                    {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}

                  </TabPanel>

                  <TabPanel value={tabHorIndex} className={classes.TabPanel} index={1}>
                    <>
                      {modoEdicionSection && (
                        <>
                          <MenuObjetoEditPage
                            dataRowEditNew={dataRowEditNewSection}
                            actualizarMenuObjeto={actualizarMenuObjeto}
                            agregarMenuObjeto={agregarMenuObjeto}
                            cancelarEdicion={cancelarEdicionSection}
                            titulo={tituloSection}

                            grillaObjeto={grillaObjeto}
                            setGrillaObjeto={setGrillaObjeto}
                            gridBoxValue={gridBoxValue}
                            setGridBoxValue={setGridBoxValue}

                          />
                          <div className="col-12 d-inline-block">
                            <div className="float-right">
                              <ControlSwitch checked={auditoriaSwitch}
                                onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                              /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
                            </div>
                          </div>
                          {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewSection} />)}

                        </>
                      )}
                      {!modoEdicionSection && (
                        <>
                          <MenuObjetoListPage
                            menuObjetos={menuObjetos}
                            modoEdicion={modoEdicion}
                            editarRegistro={editarRegistroMenuObjeto}
                            eliminarRegistro={eliminarMenuObjeto}
                            nuevoRegistro={nuevoRegistroMenuObjeto}
                            seleccionarRegistro={seleccionarRegistroMenuObjeto}
                            focusedRowKey={focusedRowKeyMenuObjeto}
                          />
                        </>
                      )}
                      {/* POPUP-> buscar objeto */}
                      <SistemaObjetoBuscar
                        objetos={ListarObjetos}
                        showPopup={{ isVisiblePopUp: isVisiblePopUpObjetos, setisVisiblePopUp: setisVisiblePopUpObjetos }}
                        cancelar={() => setisVisiblePopUpObjetos(false)}
                        agregar={agregarMenuObjeto}
                        selectionMode={"multiple"}
                        showButton={true}
                      />
                    </>
                  </TabPanel>

                  <TabPanel value={tabHorIndex} className={classes.TabPanel} index={2}>
                    <>

                      {/*##########.-Asignar componente MenuDatosPersonalizadoEditPage y MenuDatosPersonalizadoListPage-##################################################*/}
                      <AppBar position="static" className={classesEncabezado.secundario}>
                        <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                          <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                            {intl.formatMessage({ id: "SYSTEM.MENU.REQUIREDFIELDS" })}
                          </Typography>
                        </Toolbar>
                      </AppBar>

                      {modoEdicionSection && (
                        <>
                          <MenuDatosPersonalizadoEditPage
                            dataRowEditNew={dataRowEditNewSection}
                            actualizarMenuDatos={actualizarMenuDatos}
                            agregarMenuDatos={agregarMenuDatos}
                            cancelarEdicion={cancelarEdicionSection}
                            titulo={tituloSection}
                            modoEdicion={modoEdicionSection}
                            accessButton={props.accessButton}
                            settingDataField={props.settingDataField}
                          />
                          <div className="col-12 d-inline-block">
                            <div className="float-right">
                              <ControlSwitch checked={auditoriaSwitch}
                                onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                              /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
                            </div>
                          </div>
                          {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewSection} />)}

                        </>
                      )}
                      {!modoEdicionSection && (
                        <>
                          <MenuDatosPersonalizadoListPage
                            menuDatos={listarSection}
                            modoEdicion={modoEdicion}
                            editarRegistro={editarRegistroMenuDatos}
                            eliminarRegistro={eliminarMenuDatos}
                            nuevoRegistro={nuevoRegistroSection}
                            cancelarEdicion={cancelarEdicion}
                          />
                        </>
                      )}
                    </>
                  </TabPanel>

                  {/* <TabPanel value={tabHorIndex} className={classes.TabPanel} index={3}>
                  <>
                    {modoEdicionSection && (
                      <>
                        <MenuControllerEditPage
                          dataRowEditNew={dataRowEditNewSection}
                          agregarMenuController={agregarMenuController}
                          cancelarEdicion={cancelarEdicionSection}
                          titulo={tituloSection}

                        />
                        <div className="col-12 d-inline-block">
                          <div className="float-right">
                            <ControlSwitch checked={auditoriaSwitch}
                              onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                            /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
                          </div>
                        </div>
                        {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewSection} />)}

                      </>
                    )}
                    {!modoEdicionSection && (
                      <>
                        <MenuControllerListPage
                          menuController={menuController}
                          modoEdicion={modoEdicion}
                          eliminarRegistro={eliminarMenuController}
                          nuevoRegistro={nuevoRegistroMenuController}
                        />
                      </>
                    )}
                   
                  </>
                </TabPanel> */}
                </>

              </Grid>

            )}
          </Grid>

        </Paper>


      </div>

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
      {/* POPUP-> buscar objeto */}
      <SistemaObjetoBuscar
        objetos={ListarObjetos}
        showPopup={{ isVisiblePopUp: isVisiblePopUpObjetos, setisVisiblePopUp: setisVisiblePopUpObjetos }}
        cancelar={() => setisVisiblePopUpObjetos(false)}
        agregar={agregarMenuObjeto}
        selectionMode={"multiple"}
        showButton={true}
      />

    </>


  );
};
{/* //-->Configuracion Tabs. */ }
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },
  TabPanel: {
    order: 0,
    flex: '1 3 50%'
  },
  tabContent: {
    '&.Mui-selected': {
      color: '#337ab7',
    },
  },
  gridRoot: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(0),
    //textAlign: 'left',
    //backgroundColor: theme.palette.background.paper,
  }

}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Portlet
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </Portlet>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function tabPropsIndex(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}


MenuIndexPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
};
MenuIndexPage.defaultProps = {
  showHeaderInformation: true,
};
export default injectIntl(WithLoandingPanel(MenuIndexPage));
