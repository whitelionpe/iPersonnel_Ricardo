import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleInfoMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";

import { useSelector } from "react-redux";
import { isNotEmpty } from "../../../../../_metronic";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import { eliminar, obtener, listar, crear, actualizar } from "../../../../api/sistema/cliente.api";
import ClienteListPage from "./ClienteListPage";
import ClienteEditPage from "./ClienteEditPage";


import {
  eliminar as eliminarDivi,
  obtener as obtenerDivi,
  // listar as listarDivi,
  crear as crearDivi,
  actualizar as actualizarDivi,
  listarTreeview
} from "../../../../api/sistema/division.api";
//import DivisionListPage from "../division/DivisionListPage";
import DivisionEditPage from "../division/DivisionEditPage";

import {
  eliminar as eliminarLic, obtener as obtenerLic, listar as listarLic, crear as crearLic, actualizar as actualizarLic
} from "../../../../api/sistema/licencia.api";
import LicenciaListPage from "../licencia/LicenciaListPage";
import LicenciaEditPage from "../licencia/LicenciaEditPage";

import { listar as listarConfig, obtener as obtenerConfig, actualizar as actualizarConfig, crear as crearConfig } from "../../../../api/sistema/configuracion.api";
import ConfiguracionListPage from "../configuracion/ConfiguracionListPage";
import ConfiguracionEditPage from "../configuracion/ConfiguracionEditPage";

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import PeopleOutlineIcon from '@material-ui/icons/PeopleOutline';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import CreditCardIcon from '@material-ui/icons/CreditCard';
import BuildIcon from '@material-ui/icons/Build';
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

import { PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { Button } from "devextreme-react";
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import MenuTreeViewPage from "../../../../partials/content/TreeView/MenuTreeViewPage";
import './ClienteStyle.css';
import { obtener as obtenerSistemaConfiguracion, obtener_medidas as obtenerSistemaConfiguracionMedidas } from "../../../../api/sistema/configuracion.api";


const ClienteIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);

  const [varIdCliente, setVarIdCliente] = useState();
  const [varCurrentCliente, setCurrentCliente] = useState();
  const [focusedRowKey, setFocusedRowKey] = useState();
  const [clientes, setClientes] = useState([]);
  const [selected, setSelected] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});


  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState({});
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);

  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [listarTabs, setListarTabs] = useState([]);

  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});
  const [isVisibleAlert, setIsVisibleAlert] = useState();

  const [alturaSugerido, setAlturaSugerido] = useState();
  const [anchoSugerido, setAnchoSugerido] = useState();
  const [alturaSugeridoRadio, setAlturaSugeridoRadio] = useState();
  const [anchoSugeridoRadio, setAnchoSugeridoRadio] = useState();

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };
  const [focusedRowKeyConfiguracion, setFocusedRowKeyConfiguracion] = useState();

  // Componentes Division
  const [actionButton, setActionButton] = useState({ new: false, edit: false, save: false, delete: false, cancel: false });
  const [showForm, setShowForm] = useState("");
  const [selectedNode, setSelectedNode] = useState();
  //const [varIdDivision, setVarIdDivision] = useState("");

  const [idMenu, setIdMenu] = useState("");

  const [menus, setMenus] = useState([{
    Icon: "flaticon2-expand"
    , varIdMenu: null
    , varIdMenuPadre: null
    , Menu: intl.formatMessage({ id: "SYSTEM.MENU.OPTIONS" })
    , MenuPadre: null
    , Nivel: 0
    , expanded: true
    , selected: false
  }]);

  //::MANTENIMIENTO DE CLIENTE::::::::::::::::::::::::::::::::::::::::::.::::::::::::::::::::::::::::::::::::

  async function agregarCliente(cliente) {
    setLoading(true);
    const { IdCliente, Cliente, Alias, Documento, Corporativo, Email_NivelServicio1, Email_NivelServicio2, Email_NivelServicio3, LogoAltura, LogoAncho, FileBase64, Activo } = cliente;
    let params = {
      IdCliente: IdCliente.toUpperCase()
      , Cliente: Cliente.toUpperCase()
      , Alias: Alias.toUpperCase()
      , Documento: Documento.toUpperCase()
      , Corporativo
      , Email_NivelServicio1: isNotEmpty(Email_NivelServicio1) ? Email_NivelServicio1.toUpperCase() : ""
      , Email_NivelServicio2: isNotEmpty(Email_NivelServicio2) ? Email_NivelServicio2.toUpperCase() : ""
      , Email_NivelServicio3: isNotEmpty(Email_NivelServicio3) ? Email_NivelServicio3.toUpperCase() : ""
      , Logo: isNotEmpty(FileBase64) ? FileBase64 : ""
      , LogoAltura: isNotEmpty(LogoAltura) ? LogoAltura : 0
      , LogoAncho: isNotEmpty(LogoAncho) ? LogoAncho : 0
      , Activo
      , IdUsuario: usuario.username
    };
    await crear(params).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      listarClientes();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });

  }

  async function actualizarCliente(cliente) {
    setLoading(true);
    const { IdCliente, Cliente, Alias, Documento, Corporativo, Email_NivelServicio1, Email_NivelServicio2, Email_NivelServicio3, LogoAltura, LogoAncho, FileBase64, Activo } = cliente;
    let params = {
      IdCliente: IdCliente.toUpperCase()
      , Cliente: Cliente.toUpperCase()
      , Alias: Alias.toUpperCase()
      , Documento: Documento.toUpperCase()
      , Corporativo
      , Email_NivelServicio1: isNotEmpty(Email_NivelServicio1) ? Email_NivelServicio1.toUpperCase() : ""
      , Email_NivelServicio2: isNotEmpty(Email_NivelServicio2) ? Email_NivelServicio2.toUpperCase() : ""
      , Email_NivelServicio3: isNotEmpty(Email_NivelServicio3) ? Email_NivelServicio3.toUpperCase() : ""
      , Logo: isNotEmpty(FileBase64) ? FileBase64 : ""
      , LogoAltura: isNotEmpty(LogoAltura) ? LogoAltura : 0
      , LogoAncho: isNotEmpty(LogoAncho) ? LogoAncho : 0
      , Activo
      , IdUsuario: usuario.username
    };
    await actualizar(params).then(response => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarClientes();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro(cliente, confirm) {
    setSelected(cliente);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente } = cliente;
      await eliminar({ IdCliente, IdUsuario: usuario.username }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
      await listarClientes();
    }
  }

  async function listarClientes() {
    setLoading(true);
    await listar({
      NumPagina: 0
      , TamPagina: 0
    }).then(clientes => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setClientes(clientes);
      changeTabIndex(0);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function obtenerCliente() {
    setLoading(true);
    const { IdCliente } = selected;

    await validateConfigurationImageLength(IdCliente);

    await obtener({ IdCliente }).then(cliente => {

      setDataRowEditNew({ ...cliente, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  const nuevoRegistro = () => {
    changeTabIndex(1);
    let cliente = { Activo: "S" };
    setDataRowEditNew({ ...cliente, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setIsVisibleAlert(true);
  };


  const editarRegistro = async (dataRow) => {
    changeTabIndex(1);
    const { IdCliente } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setDataRowEditNew({});
    await obtenerCliente(IdCliente);
  };


  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    setVarIdCliente("");
    setCurrentCliente({});
  };


  const seleccionarRegistro = dataRow => {
    const { IdCliente, Cliente, RowIndex } = dataRow;

    setModoEdicion(false);
    //Datos Principales
    setSelected(dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    if (IdCliente != varIdCliente) {
      setVarIdCliente(IdCliente);
      setCurrentCliente(dataRow);
      setFocusedRowKey(RowIndex);
    }
  }

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerCliente(dataRow.IdCliente);
  };

  async function validateConfigurationImageLength(IdCliente) {
    await obtenerSistemaConfiguracionMedidas({ IdCliente: IdCliente, IdImageSize: "MAXIMAGESIZECLIENTE", idImageRatio: "CLIENTIMAGERATIO" })
      .then(result => {
        // console.log("test", result)
        if (result === "") {
          setIsVisibleAlert(true);

          setAlturaSugerido(0)
          setAnchoSugerido(0)
          setAlturaSugeridoRadio(0)
          setAnchoSugeridoRadio(0)

        } else {
          setIsVisibleAlert(false);

          setAlturaSugerido(result.AltoMedida)
          setAnchoSugerido(result.AnchoMedida)

          setAlturaSugeridoRadio(result.AltoMedidaRadio)
          setAnchoSugeridoRadio(result.AnchoMedidaRadio)
        }
      }).finally();
  }

  /************--Configuración de acceso de botones*************/
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 5;
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  useEffect(() => {
    listarClientes();
    loadControlsPermission();
  }, []);

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  const getInfo = () => {
    const { IdCliente, Cliente, Alias } = selected;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdCliente, colSpan: 1 },
      { text: [intl.formatMessage({ id: "SYSTEM.CUSTOMER.NICKNAME" })], value: Alias, colSpan: 2 },
      { text: [intl.formatMessage({ id: "SYSTEM.CUSTOMER" })], value: Cliente, colSpan: 3 }
    ];

  }

  //::MANTENIMIENTO DE LICENCIAS:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


  async function agregarLicencia(licencia) {
    setLoading(true);
    const { IdModulo, IdCliente, Licencia, FechaFin, Clave, AlertarEmail, AlertarLicencia, Activo } = licencia;
    let data = {
      IdModulo: isNotEmpty(IdModulo) ? IdModulo : ""
      , IdCliente: varIdCliente
      , Licencia: isNotEmpty(Licencia) ? Licencia : ""
      , FechaFin: isNotEmpty(FechaFin) ? FechaFin : ""
      , Clave: isNotEmpty(Clave) ? Clave : ""
      , AlertarEmail: isNotEmpty(AlertarEmail) ? AlertarEmail : ""
      , AlertarLicencia: isNotEmpty(AlertarLicencia) ? AlertarLicencia : 0
      , Activo
      , Ruc: varCurrentCliente.Documento
      , IdUsuario: usuario.username
    };
    await crearLic(data).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarLicencia();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });

  }


  async function actualizarLicencia(licencia) {
    setLoading(true);
    const { IdModulo, IdCliente, Licencia, FechaFin, Clave, AlertarEmail, AlertarLicencia, Activo } = licencia;
    let data = {
      IdModulo: isNotEmpty(IdModulo) ? IdModulo : ""
      , IdCliente: varIdCliente
      , Licencia: isNotEmpty(Licencia) ? Licencia : ""
      , FechaFin: isNotEmpty(FechaFin) ? FechaFin : ""
      , Clave: isNotEmpty(Clave) ? Clave : ""
      , AlertarEmail: isNotEmpty(AlertarEmail) ? AlertarEmail : ""
      , AlertarLicencia: isNotEmpty(AlertarLicencia) ? AlertarLicencia : 0
      , Activo
      , Ruc: varCurrentCliente.Documento
      , IdUsuario: usuario.username
    };
    await actualizarLic(data).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarLicencia();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistroLicencia(licencia, confirm) {
    setSelected(licencia);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdModulo } = licencia;
      await eliminarLic({
        IdModulo,
        IdCliente,
        IdUsuario: usuario.username
      }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
      listarLicencia();
    }
  }

  async function listarLicencia() {
    setLoading(true);
    setModoEdicion(false);
    await listarLic({
      IdModulo: "%"
      , IdCliente: varIdCliente
      , NumPagina: 0
      , TamPagina: 0
    }).then(licencias => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(licencias);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });

  }

  async function obtenerLicencia(filtro) {

    setLoading(true);
    const { IdModulo, IdCliente } = filtro;
    await obtenerLic({
      IdModulo,
      IdCliente
    }).then(licencia => {
      setDataRowEditNew({ ...licencia, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  const editarRegistroLicencia = dataRow => {
    setModoEdicion(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerLicencia(dataRow);
  };


  const nuevoRegistroLicencia = () => {
    let nuevo = {
      Activo: "S"
    };
    setDataRowEditNew({ ...nuevo, varCurrentCliente, esNuevoRegistro: true });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };


  //Sistema Configuración::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  async function listarConfiguracion() {
    setLoading(true);
    setModoEdicion(false);
    await listarConfig({
      IdCliente: varIdCliente
      , IdConfiguracion: "%"
      , NumPagina: 0
      , TamPagina: 0
    }).then(licencias => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(licencias);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });

  }


  async function actualizarConfiguracion(datarow) {
    setLoading(true);
    const { IdConfiguracion, Configuracion, Valor1, Valor2, Valor3 } = datarow;
    let params = {
      IdCliente: varIdCliente
      , IdConfiguracion: isNotEmpty(IdConfiguracion) ? IdConfiguracion.toUpperCase() : ""
      , Configuracion: isNotEmpty(Configuracion) ? Configuracion.toUpperCase() : ""
      , Valor1: isNotEmpty(Valor1) ? Valor1.toUpperCase() : ""
      , Valor2: isNotEmpty(Valor2) ? Valor2.toUpperCase() : ""
      , Valor3: isNotEmpty(Valor3) ? Valor3.toUpperCase() : ""
      , IdUsuario: usuario.username
    };
    await actualizarConfig(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarConfiguracion();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerConfiguracion(dataRow) {
    setLoading(true);
    const { IdCliente, IdConfiguracion } = dataRow;
    await obtenerConfig({
      IdCliente,
      IdConfiguracion
    }).then(data => {
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  const seleccionarConfiguracion = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKeyConfiguracion(RowIndex);
  };


  const editarRegistroConfiguracion = async (dataRow) => {
    setModoEdicion(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerConfiguracion(dataRow);

  };

  const cancelarEdicionTabsConfiguracion = () => {
    setModoEdicion(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };


  async function importarConfiguracion(listarConfiguracionImpor) {
    try {
      setTimeout(function () {
        if (listarConfiguracionImpor.length > 0) {
          listarConfiguracionImpor.map(async (data) => {
            const { IdConfiguracion, Configuracion, Valor1, Valor2, Valor3 } = data;

            let params = {
              IdCliente: varIdCliente
              , IdConfiguracion: isNotEmpty(IdConfiguracion) ? IdConfiguracion.toUpperCase() : ""
              , Configuracion: isNotEmpty(Configuracion) ? Configuracion.toUpperCase() : ""
              , Valor1: isNotEmpty(Valor1) ? Valor1 : ""
              , Valor2: isNotEmpty(Valor2) ? Valor2 : ""
              , Valor3: isNotEmpty(Valor3) ? Valor3 : ""
              , IdUsuario: usuario.username
            };
            await crearConfig(params)
              .then((response) => {
                listarConfiguracion();
              })
              .catch((err) => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
              });
          });
        }

      }, 500);

    } catch (err) {
      setLoading(false);
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }
  }

  //::FUNCIONES  DIVISION :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarDivision(datarow) {

    setLoading(true);
    const { IdDivision, IdClientePadre, IdDivisionPadre, Division, IdPais, Activo, IdUnidadOrganizativaBase, Corporativo} = datarow;
    let data = {
      IdCliente: varIdCliente
      , IdDivision: isNotEmpty(IdDivision) ? IdDivision.toUpperCase() : ""
      // , IdClientePadre: isNotEmpty(IdClientePadre) ? IdClientePadre : ""
      , IdClientePadre: isNotEmpty(IdDivisionPadre) ? IdClientePadre : ""//Agregando tempporal
      , IdDivisionPadre: isNotEmpty(IdDivisionPadre) ? IdDivisionPadre : ""
      , Division: isNotEmpty(Division) ? Division.toUpperCase() : ""
      , IdPais: isNotEmpty(IdPais) ? IdPais.toUpperCase() : ""
      , Activo
      , IdUnidadOrganizativaBase: isNotEmpty(IdUnidadOrganizativaBase) ? IdUnidadOrganizativaBase: ""
      , Corporativo: Corporativo
      , IdUsuario: usuario.username
    };

    await crearDivi(data)
      .then(response => {
        if (response)
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        listarDivision();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });

  }

  async function actualizarDivision(division) {
    setLoading(true);
    const { IdCliente, IdDivision, IdClientePadre, IdDivisionPadre, Division, IdPais, Activo, IdUnidadOrganizativaBase, Corporativo } = division;
    let data = {
      IdCliente: IdCliente
      , IdDivision: isNotEmpty(IdDivision) ? IdDivision.toUpperCase() : ""
      , IdClientePadre: isNotEmpty(IdClientePadre) ? IdClientePadre : ""
      , IdDivisionPadre: isNotEmpty(IdDivisionPadre) ? IdDivisionPadre : ""
      , Division: isNotEmpty(Division) ? Division.toUpperCase() : ""
      , IdPais: isNotEmpty(IdPais) ? IdPais.toUpperCase() : ""
      , Activo
      , IdUnidadOrganizativaBase: isNotEmpty(IdUnidadOrganizativaBase) ? IdUnidadOrganizativaBase: ""
      , Corporativo: Corporativo
      , IdUsuario: usuario.username
    };
    await actualizarDivi(data).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarDivision();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }


  const seleccionarNodo = async (dataRow) => {

    const { IdMenu, Nivel } = dataRow;
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));

    //console.log("seleccionarNodo!Nivel:",Nivel);
    if (IdMenu != idMenu) {

      if (Nivel === 1) {
        setShowForm("");
        setSelectedNode(dataRow);
        setActionButton({ new: false, delete: false, edit: false });
      } else if (Nivel === 2) {
        setShowForm("");
        setActionButton({ new: true, delete: false, edit: false });
      } else if (Nivel === 3) {
        setShowForm("Division");
        await obtenerDivision(dataRow);
        setActionButton({ new: true, delete: true, edit: true });
      } else if (Nivel > 3) {
        setShowForm("Division");
        await obtenerDivision(dataRow);
        setActionButton({ new: true, delete: true, edit: true });

      }

      //setVarIdDivision(IdDivision);
      setSelectedNode(dataRow);
      //console.log("seleccionarNodo: ",dataRow);
    }

  }

  async function listarDivision() {
    setLoading(true);
    const { IdCliente } = selected;
    let divisiones = await listarTreeview({
      IdCliente: IdCliente,
      IdDivision: '%'
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });
    if (!isNotEmpty(divisiones)) {
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
      setMenus(divisiones);
      //console.log("listarDivision => divisiones:",divisiones);
      setLoading(false);
    }
    setModoEdicion(false);
  }

  async function eliminarNodoTreeview(selected, confirm) {
    setSelectedDelete(selectedNode);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdDivision } = selectedDelete;
      if (isNotEmpty(IdDivision) && isNotEmpty(IdCliente)) {
        await eliminarDivi({
          IdDivision,
          IdCliente,
          IdUsuario: usuario.username
        }).then(() => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
          setSelectedNode();
          setDataRowEditNew({});
        }).catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
        }).finally(() => { setLoading(false); });
      }
      listarDivision();
    }
  }

  const editarRegistroDivision = () => {
    setModoEdicion(true);
    //Activar botones
    setActionButton({ new: false, edit: false, save: true, cancel: true });
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
  };

  async function obtenerDivision(dataRow) {
    setLoading(true);
    const { IdDivision, IdCliente } = dataRow;
    await obtenerDivi({
      IdDivision, IdCliente
    }).then(division => {
      setDataRowEditNew({ ...division, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  const nuevoRegistroDivision = () => {
    const { IdCliente, IdDivision, IdDivisionPadre, IdMenu, IdMenuPadre, Nivel, IdPais } = selectedNode;
    let objeto = {};


    if (Nivel === 2 || Nivel > 2) {
      setShowForm("Division");
      setModoEdicion(true);
      setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
      //Activar botones
      setActionButton({ new: false, edit: false, save: true, cancel: true });
      objeto = { IdPais: IdPais, Activo: "S", IdCliente: varIdCliente, IdClientePadre: IdCliente, IdDivisionPadre: IdDivision, IdDivision: "", };
      setDataRowEditNew({ ...objeto, esNuevoRegistro: true });
    }
  };

  const cancelarEdicionDivision = () => {
    changeTabIndex(2);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    //setVarIdDivision("");
    setListarTabs([]);
    setActionButton({ new: true, edit: true, save: false, cancel: false });
  };

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const cancelarEdicionTabs = () => {
    setModoEdicion(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  async function eliminarListRowTab(selected, confirm) {
    let currentTab = tabIndex;
    // console.log("eliminarListRowTab|currentTab:", currentTab);
    switch (currentTab) {
      case 0:
        eliminarRegistro(selected, confirm);
        break;
      case 2:
        eliminarNodoTreeview(selected, confirm);
        break;
      case 3:
        eliminarRegistroLicencia(selected, confirm);
        break;
    }
  }

  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "ADMINISTRATION.CONTRACT.DIVISION.NAME",
      "ACCREDITATION.DATAEVALUATE.DETAIL",
      "SYSTEM.DIVISION",
      "SYSTEM.LICENSES",
      "SYSTEM.CONFIGURATIONS"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: "ADMINISTRATION.CHARACTERISTIC.DETAIL.CLIENT" })} ` + "  " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdCliente) ? false : true;
    //return true;
  }

  const tabContent_ClienteListPage = () => {
    return <ClienteListPage
      clientes={clientes}
      editarRegistro={editarRegistro}
      eliminarRegistro={eliminarRegistro}
      nuevoRegistro={nuevoRegistro}
      seleccionarRegistro={seleccionarRegistro}
      verRegistroDblClick={verRegistroDblClick}
      focusedRowKey={focusedRowKey}
      accessButton={accessButton}
    />
  }


  const tabContent_ClienteEditPage = () => {

    return <>
      <ClienteEditPage
        clientes={clientes}
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        actualizarCliente={actualizarCliente}
        agregarCliente={agregarCliente}
        cancelarEdicion={cancelarEdicion}
        titulo={titulo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        isVisibleAlert={isVisibleAlert}

        medidaSugeridas={{
          width: anchoSugerido, height: alturaSugerido,
          width_radio: anchoSugeridoRadio, height_radio: alturaSugeridoRadio
        }}
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
  }

  const tabContent_DivisionListPage = () => {
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
                onClick={nuevoRegistroDivision}
                disabled={!actionButton.new}
              />
              &nbsp;
              <Button
                icon="fa fa-edit"
                type="default"
                hint="Editar"
                disabled={!actionButton.edit}
                onClick={editarRegistroDivision}
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
                onClick={eliminarNodoTreeview}
                disabled={!actionButton.delete}
              />
              &nbsp;
              <Button
                icon="fa fa-times-circle"
                type="normal"
                hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                onClick={cancelarEdicionDivision}
                disabled={!actionButton.cancel}
              />
            </PortletHeaderToolbar>
          }>

        </PortletHeader>

        <Paper className={classes.paper}>
          <Grid container spacing={1} direction="row" justify="flex-start" alignItems="stretch" >
            <Grid item xs={5} style={{ borderRight: "1px solid #ebedf2" }} >

              <MenuTreeViewPage
                menus={menus}
                modoEdicion={modoEdicion}
                seleccionarNodo={seleccionarNodo}
                searchEnabled={false}
              />

            </Grid>

            <Grid item xs={7} >
              <Paper className={classes.paper}>
                <>

                  {showForm === "Division" && (

                    <DivisionEditPage
                      modoEdicion={modoEdicion}
                      dataRowEditNew={dataRowEditNew}
                      actualizarDivision={actualizarDivision}
                      agregarDivision={agregarDivision}
                      cancelarEdicion={cancelarEdicion}
                      titulo={titulo}
                      showButtons={false}
                      showAppBar={true}
                      disabledOptionPais={true}
                      accessButton={accessButton}
                      settingDataField={dataMenu.datos}

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

  const tabContent_LicenciaListPage = () => {
    return <>
      {modoEdicion && (
        <>
          <LicenciaEditPage
            dataRowEditNew={dataRowEditNew}
            actualizarLicencia={actualizarLicencia}
            agregarLicencia={agregarLicencia}
            cancelarEdicion={cancelarEdicionTabs}
            titulo={tituloTabs}
            modoEdicion={true}
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
          <LicenciaListPage
            licencias={listarTabs}
            editarRegistro={editarRegistroLicencia}
            eliminarRegistro={eliminarRegistroLicencia}
            nuevoRegistro={nuevoRegistroLicencia}
            cancelarEdicion={cancelarEdicion}
            getInfo={getInfo}
            accessButton={accessButton}
          />
        </>
      )}
    </>
  }

  const tabContent_ConfiguracionListPage = () => {
    return <>
      {modoEdicion && (
        <>
          <ConfiguracionEditPage
            dataRowEditNew={dataRowEditNew}
            actualizarConfiguracion={actualizarConfiguracion}
            cancelarEdicion={cancelarEdicionTabsConfiguracion}
            titulo={tituloTabs}
            modoEdicion={true}
            accessButton={accessButton}
            settingDataField={dataMenu.datos}
          />
          {/*<div className="container_only">
            <div className="float-right">
              <ControlSwitch checked={auditoriaSwitch}
                onChange={e => { setAuditoriaSwitch(e.target.checked) }}
              /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
            </div>
          </div>
          {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)} */}
        </>
      )}
      {!modoEdicion && (
        <>
          <ConfiguracionListPage
            configuraciones={listarTabs}
            seleccionarRegistro={seleccionarConfiguracion}
            editarRegistro={editarRegistroConfiguracion}
            cancelarEdicion={cancelarEdicion}
            getInfo={getInfo}
            accessButton={accessButton}
            focusedRowKey={focusedRowKeyConfiguracion}
            importarConfiguracion={importarConfiguracion}
            varIdCliente={varIdCliente}

            dataRowEditNew={dataRowEditNew}
            selected={selected}
          />
        </>
      )}
    </>
  }

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "SYSTEM" })}
        subtitle={intl.formatMessage({ id: "SYSTEM.CUSTOMERS.MAINTENANCE" })}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        //value={''}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
            onClick: () => { listarClientes() },
          },
          {
            label: intl.formatMessage({ id: "SYSTEM.CUSTOMERS" }),
            icon: <PeopleOutlineIcon fontSize="large" />,
            onClick: (e) => { obtenerCliente(selected) },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "SYSTEM.DIVISION" }),
            icon: <AccountTreeIcon fontSize="large" />,
            onClick: (e) => { listarDivision() },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          },
          {
            label: intl.formatMessage({ id: "SYSTEM.LICENSES" }),
            icon: <CreditCardIcon fontSize="large" />,
            onClick: () => { listarLicencia() },
            disabled: !tabsDisabled() && accessButton.Tabs[3] ? false : true
          },
          {
            label: intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS" }),
            icon: <BuildIcon fontSize="large" />,
            onClick: () => { listarConfiguracion() },
            disabled: !tabsDisabled() && accessButton.Tabs[4] ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_ClienteListPage(),
            tabContent_ClienteEditPage(),
            tabContent_DivisionListPage(),
            tabContent_LicenciaListPage(),
            tabContent_ConfiguracionListPage()
          ]
        }
      />

      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        onConfirm={() => eliminarListRowTab(selected, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />
    </>
  );
};


export default injectIntl(WithLoandingPanel(ClienteIndexPage));
