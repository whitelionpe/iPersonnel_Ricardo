import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Portlet } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";

import { useSelector } from "react-redux";
import { dateFormat, isNotEmpty } from "../../../../../_metronic";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import PropTypes from 'prop-types';

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import GroupWorkSharpIcon from '@material-ui/icons/GroupWorkSharp';
import DashboardSharpIcon from '@material-ui/icons/DashboardSharp';
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";
import BusinessIcon from '@material-ui/icons/Business';

// import HeaderInformation from "../../../../partials/components/HeaderInformation";

import {
  eliminar, obtener, listar, crear, actualizar
} from "../../../../api/casino/casinoGrupo.api";
import CasinoGrupoListPage from "./CasinoGrupoListPage";
import CasinoGrupoEditPage from "./CasinoGrupoEditPage";

import {
  listar as listarCGrupoServicio,
  obtener as obtenerCGrupoServicio,
  crear as crearCGrupoServicio,
  actualizar as actualizarCGrupoServicio,
  eliminar as eliminarCGrupoServicio
} from "../../../../api/casino/grupoServicio.api";
import GrupoServicioListPage from "../grupoServicio/GrupoServicioListPage";
import GrupoServicioEditPage from "../grupoServicio/GrupoServicioEditPage";

import {
  listar as listarPerGrupo,
  obtener as obtenerPerGrupo,
  crear as crearPerGrupo,
  actualizar as actualizarPerGrupo,
  eliminar as eliminarPerGrupo
} from "../../../../api/casino/personaGrupo.api";
import PersonasGrupoListPage from "../personaGrupo/PersonasGrupoListPage";
import PersonasGrupoEditPage from "../personaGrupo/PersonasGrupoEditPage";
import { validarlista } from "../../../../api/administracion/persona.api";
// import AdministracionPersonaBuscar from "../../../../partials/components/AdministracionPersonaBuscar";
import { storeListar as buscarEmpleado } from "../../../../api/administracion/persona.api";
import CasinoGrupoCompaniaIndexPage from "./casinoGrupoCompania/CasinoGrupoCompaniaIndexPage";

import {
  servicePersonaGrupo
} from "../../../../api/casino/personaGrupo.api";

//-customerDataGrid Star
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

export const initialFilter = {
  IdCliente: "1",
  IdDivision: "",
  IdGrupo: "",
  Activo: "S",
};

export const initialFilterPersonaGrupo = {
  Activo: "S",
  IdCliente: "",
  Condicion: "TRABAJADOR",
  MostrarGrupo: "TODOS",
  Personas: "",
};

const CasinoGrupoIndexPage = (props) => {
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const { intl, setLoading, dataMenu } = props;

  const [varIdGrupo, setVarIdGrupo] = useState("");
  const [focusedRowKey, setFocusedRowKey] = useState(0);
  const [casinoGrupos, setCasinoGrupos] = useState([]);

  const [focusedRowKeyPGrupo, setFocusedRowKeyPGrupo] = useState();
  const [gridBoxValue, setGridBoxValue] = useState([]);

  //Datos principales
  const [selected, setSelected] = useState({});

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  //const [modoEdicion, setModoEdicion] = useState(false);
  //const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [listarTabs, setListarTabs] = useState([]);

  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);

  const [isVisiblePopUpPersonas, setisVisiblePopUpPersonas] = useState(false);
  const [personasValidadas, setPersonasValidadas] = useState([]);

  const handleChange = (event, newValue) => {
    //Estado cambio de tabs
    setTabIndex(newValue);
  };
  const [grillaPersona, setGrillaPersona] = useState([]);

  let arr_mensajes = [];


  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

  //FILTRO- CustomerDataGrid
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);

  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();


  //::::::::::::::::::::::::::::FUNCIONES CASINO GRUPO-:::::::::::::::::::::::::::::::::::

  async function agregarCasinoGrupo(data) {
    setLoading(true);
    const { IdGrupo, Grupo, Activo } = data;
    let param = {
      IdGrupo: isNotEmpty(IdGrupo) ? IdGrupo.toUpperCase() : "",
      Grupo: isNotEmpty(Grupo) ? Grupo.toUpperCase() : "",
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await crear(param)
      .then(response => {
        if (response)
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        //setModoEdicion(false);
        listarCasinoGrupos();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }


  async function actualizarCasinoGrupo(casinoGrupo) {
    setLoading(true);
    const { IdGrupo, Grupo, Activo } = casinoGrupo;
    let params = {
      IdGrupo: isNotEmpty(IdGrupo) ? IdGrupo.toUpperCase() : "",
      Grupo: isNotEmpty(Grupo) ? Grupo.toUpperCase() : "",
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await actualizar(params)
      .then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        //setModoEdicion(false);
        listarCasinoGrupos();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }


  async function eliminarRegistro(casinoGrupo, confirm) {
    setSelected(casinoGrupo);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdDivision, IdGrupo } = casinoGrupo;
      await eliminar({
        IdCliente: IdCliente,
        IdDivision: IdDivision,
        IdGrupo: IdGrupo,
        IdUsuario: usuario.username
      })
        .then(response => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
      listarCasinoGrupos();
    }
  }


  async function listarCasinoGrupos() {
    setLoading(true);
    await listar({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdGrupo: '%',
      NumPagina: 0,
      TamPagina: 0
    }).then(casinoGrupos => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setCasinoGrupos(casinoGrupos);
      changeTabIndex(0);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function obtenerCasinoGrupo() {
    setLoading(true);
    const { IdCliente, IdDivision, IdGrupo } = selected;
    await obtener({
      IdCliente,
      IdDivision,
      IdGrupo
    }).then(casinoGrupo => {
      setDataRowEditNew({ ...casinoGrupo, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  const nuevoRegistro = () => {
    changeTabIndex(1);
    let casinoGrupo = {
      Activo: "S",
      FechaRegistro: new Date().toJSON().slice(0, 10)
    };
    setDataRowEditNew({ ...casinoGrupo, esNuevoRegistro: true });
    setGrillaPersona([]);
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setVarIdGrupo("");

  };


  const editarRegistro = dataRow => {
    changeTabIndex(1);
    const { IdGrupo } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    //setVarIdComedor(IdComedor);
    obtenerCasinoGrupo(dataRow);
  };


  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    setGrillaPersona([]);
    setVarIdGrupo("");
  };


  const seleccionarRegistro = dataRow => {
    const { IdGrupo, Grupo, RowIndex } = dataRow;
    setModoEdicion(false);
    //Datos Principales
    setSelected(dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    if (IdGrupo != varIdGrupo) {
      setVarIdGrupo(IdGrupo);
      setFocusedRowKey(RowIndex);
    }
  }

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerCasinoGrupo(dataRow);
  };


  /*********************************************************** */
  //console.log(dataMenu);
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 5; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  //::::::::::::::::::::::FUNCION GRUPO SERVICIOS::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarGrupoServicio(dataGrupoServicio) {
    const { IdGrupo, IdComedor, IdServicio, Lunes, Martes, Miercoles, Jueves, Viernes, Sabado, Domingo, Activo } = dataGrupoServicio;
    setLoading(true);
    let params = {
      IdGrupo: varIdGrupo
      , IdComedor: isNotEmpty(IdComedor) ? IdComedor.toUpperCase() : ""
      , IdServicio: isNotEmpty(IdServicio) ? IdServicio.toUpperCase() : ""
      , Lunes: (Lunes) ? "S" : "N"
      , Martes: (Martes) ? "S" : "N"
      , Miercoles: (Miercoles) ? "S" : "N"
      , Jueves: (Jueves) ? "S" : "N"
      , Viernes: (Viernes) ? "S" : "N"
      , Sabado: (Sabado) ? "S" : "N"
      , Domingo: (Domingo) ? "S" : "N"
      , Activo
      , IdCliente: perfil.IdCliente
      , IdDivision: perfil.IdDivision
      , IdUsuario: usuario.username
    };
    await crearCGrupoServicio(params).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarGrupoServicio();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function actualizarGrupoServicio(grupoServicio) {

    const { IdGrupo, IdComedor, IdServicio, Lunes, Martes, Miercoles, Jueves, Viernes, Sabado, Domingo, Activo } = grupoServicio;
    setLoading(true);
    let params = {
      IdGrupo: varIdGrupo
      , IdComedor: isNotEmpty(IdComedor) ? IdComedor.toUpperCase() : ""
      , IdServicio: isNotEmpty(IdServicio) ? IdServicio.toUpperCase() : ""
      , Lunes: (Lunes) ? "S" : "N"
      , Martes: (Martes) ? "S" : "N"
      , Miercoles: (Miercoles) ? "S" : "N"
      , Jueves: (Jueves) ? "S" : "N"
      , Viernes: (Viernes) ? "S" : "N"
      , Sabado: (Sabado) ? "S" : "N"
      , Domingo: (Domingo) ? "S" : "N"
      , Activo
      , IdCliente: perfil.IdCliente
      , IdDivision: perfil.IdDivision
      , IdUsuario: usuario.username
    };
    await actualizarCGrupoServicio(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarGrupoServicio();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function eliminarRegistroGrupoServicio(grupoServicio, confirm) {
    setSelected(grupoServicio);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdGrupo, IdComedor, IdServicio, IdCliente, IdDivision } = grupoServicio;
      await eliminarCGrupoServicio({
        IdGrupo: IdGrupo,
        IdComedor: IdComedor,
        IdServicio: IdServicio,
        IdCliente: IdCliente,
        IdDivision: IdDivision,
        IdUsuario: usuario.username
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarGrupoServicio();
    }
  }

  async function listarGrupoServicio() {
    setLoading(true);

    await listarCGrupoServicio({
      IdGrupo: varIdGrupo,
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdComedor: '%',
      IdServicio: '%',
      NumPagina: 0, TamPagina: 0
    }).then(grupoServicios => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(grupoServicios);
      setModoEdicion(false);
      //changeTabIndex(0);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }


  async function obtenerGrupoServicio(filtro) {
    setLoading(true);
    const { IdGrupo, IdComedor, IdServicio, IdCliente, IdDivision } = filtro;
    await obtenerCGrupoServicio({
      IdGrupo: IdGrupo,
      IdComedor: IdComedor,
      IdServicio: IdServicio,
      IdCliente: IdCliente,
      IdDivision: IdDivision
    }).then(grupoServicio => {
      grupoServicio.Lunes = grupoServicio.Lunes === "S" ? true : false;
      grupoServicio.Martes = grupoServicio.Martes === "S" ? true : false;
      grupoServicio.Miercoles = grupoServicio.Miercoles === "S" ? true : false;
      grupoServicio.Jueves = grupoServicio.Jueves === "S" ? true : false;
      grupoServicio.Viernes = grupoServicio.Viernes === "S" ? true : false;
      grupoServicio.Sabado = grupoServicio.Sabado === "S" ? true : false;
      grupoServicio.Domingo = grupoServicio.Domingo === "S" ? true : false;

      setDataRowEditNew({ ...grupoServicio, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  const editarRegistroGrupoServicio = dataRow => {
    setModoEdicion(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerGrupoServicio(dataRow);
  };

  const nuevoRegistroTabsGrupoServicio = () => {
    let nuevo = { Activo: "S" };
    setDataRowEditNew({ ...nuevo, esNuevoRegistro: true });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };



  const cancelarEdicionTabsGrupoServicio = () => {
    setModoEdicion(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };


  //:::::::::::::::::::::::::::::::::::::::::::::-FUNCION GRUPO PERSONA:::::::::::::::::::::::::::::::::::::::

  /*   async function listarPersonaGrupo() {
      setLoading(true);
  
      let hoy = new Date();
      let fecInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      await listarPerGrupo({
        //IdPersona: 0,
        IdCliente: perfil.IdCliente,
        IdDivision: perfil.IdDivision,
        IdGrupo: varIdGrupo,
        Filtro: JSON.stringify({
          FechaInicio: fecInicio,
          FechaFin: hoy,
        }),
        NumPagina: 0, TamPagina: 0
      }).then(personasGrupo => {
        setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
        setListarTabs(personasGrupo);
        setModoEdicion(false);
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  
    } */

  async function listarPersonaGrupo() {
    setRefreshData(true);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setModoEdicion(false);
    changeTabIndex(3);
  }

  async function obtenerPersonaGrupo(filtro) {
    setGrillaPersona([]);
    //console.log("filtro:",filtro);
    const { IdCliente, IdDivision, IdPersona, IdGrupo, IdSecuencial } = filtro;
    if (IdCliente && IdDivision && IdPersona && IdGrupo) {
      let personaGrupo = await obtenerPerGrupo({
        IdPersona: IdPersona,
        IdGrupo: IdGrupo,
        IdCliente: IdCliente,
        IdDivision: IdDivision,
        IdSecuencial
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
      // console.log("personagrupo:", personaGrupo);
      let persona = await buscarEmpleado({
        skip: "0",
        take: "100",
        sort: JSON.stringify([{ selector: "RowIndex", desc: false }]),
        filter: JSON.stringify([
          ["IdCliente", "=", perfil.IdCliente],
          "AND",
          ["IdPersona", "=", IdPersona],])
      });

      let { NombreCompleto, TipoDocumento, Documento, Activo } = persona.data[0];
      setGrillaPersona([{ RowIndex: 1, IdPersona, NombreCompleto, TipoDocumento, Documento, Activo }]);
      setDataRowEditNew({ ...personaGrupo, esNuevoRegistro: false });
    }
  }


  async function validarDatosPersona() {
    setLoading(true);
    const  {IdPersona,FechaInicio,FechaFin} = dataRowEditNew;
    // console.log("validarDatosPersona|dataRowEditNew:",dataRowEditNew);
    await servicePersonaGrupo.validarDatosPersona({
        IdCliente: perfil.IdCliente
      , IdPersona: IdPersona
      , IdDivision: perfil.IdDivision
      , IdGrupo : varIdGrupo
      , FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : ""
      , FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : ""
    }).then(data => {
      console.log("validarDatosPersona|data:",data);
      // setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      // setListarTabs(personasGrupo);
      // setModoEdicion(false);
      setGrillaPersona(data)
    }).catch(err => { }).finally(() => { setLoading(false); });
  }


  async function agregarPersonaGrupo(personas) {
    setLoading(true);
    var arrayPersonas = personas.map(x => (x.IdPersona)).join(',');

    // let funcArray = [];
    // let str_Ok = '';
    // let str_Errores = '';
    // for (let index = 0; index < personas.length; index++) {
    //   // console.log("agregarPersonaGrupo|personas[index]:",personas[index]);
    //   await registrarPersonaGrupoItem(personas[index]);
    // }
    // str_Ok = arr_mensajes.map(x => (x.Id == 0 ? x.Mensaje : "")).join('');
    // str_Errores = arr_mensajes.map(x => (x.Id == 1 ? x.Mensaje : "")).join('');

    // if (arr_mensajes.length === 1) {
    //   handleSuccessMessages(str_Ok);
    // } else {
    //   handleSuccessMessages(intl.formatMessage({ id: "CASINO.PERSON.GROUP.REGISTRATIONRECORD" }));
    // }
    // arr_mensajes = [];
    // var resultFechaFin =  isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : ""
    const  {FechaInicio,FechaFin} = dataRowEditNew;
     console.log("registrarPersonaGrupoItem|dataRowEditNew:",dataRowEditNew);

    let params = {
       IdDivision: perfil.IdDivision
      ,IdGrupo: varIdGrupo
      ,IdPersona: arrayPersonas
      ,IdSecuencial: 0
      ,FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : ""
      ,FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : ""
      ,Activo: 'S'
    };
    await servicePersonaGrupo.CrearMultiple(params).then(response => {
    }).catch(err => {
    }).finally(() => { setLoading(false); });
    
    listarPersonaGrupo();
 
  }

  const registrarPersonaGrupoItem = async (data) => {
    setLoading(true);
    const { IdPersona, FechaInicio, FechaFin, Activo, NombreCompleto } = data;

// var resultFechaFin =  isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : ""
 console.log("registrarPersonaGrupoItem|resultFechaFin:",FechaFin);

    let params = {
      IdPersona: isNotEmpty(IdPersona) ? IdPersona : 0
      , IdGrupo: varIdGrupo
      , FechaInicio: FechaInicio
      , FechaFin: FechaFin
      , Activo: Activo
      , IdCliente: perfil.IdCliente
      , IdDivision: perfil.IdDivision
      , IdUsuario: usuario.username
      , IdSecuencial: 0
    };
    await crearPerGrupo(params).then(response => {
      if (response) {
        let respuesta = intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" });
        arr_mensajes.push({ Id: 0, Mensaje: `${respuesta} - ${NombreCompleto}.\r\n` });

      } else {
        arr_mensajes.push({ Id: 1, Mensaje: `No se pudo registrar para la persona ${NombreCompleto}.\r\n` });
      }
    }).catch(err => {
      arr_mensajes.push({ Id: 1, Mensaje: `No se pudo registrar para la persona ${NombreCompleto}.\r\n` });
    }).finally(() => { setLoading(false); });
  };

  async function actualizarPersonaGrupo(personaGrupo) {
    setLoading(true);
    const { IdPersona, FechaInicio, FechaFin, Activo, IdSecuencial } = personaGrupo;
    let params = {
      IdPersona: isNotEmpty(IdPersona) ? IdPersona : 0
      , IdGrupo: varIdGrupo
      , FechaInicio: FechaInicio
      , FechaFin: FechaFin
      , Activo: Activo
      , IdCliente: perfil.IdCliente
      , IdDivision: perfil.IdDivision
      , IdUsuario: usuario.username
      , IdSecuencial
    };
    await actualizarPerGrupo(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarPersonaGrupo();
      setRefreshData(true);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistroPersonaGrupo(personaGrupo, confirm) {
    setSelected(personaGrupo);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdPersona, IdGrupo, IdCliente, IdDivision, IdSecuencial } = personaGrupo;
      await eliminarPerGrupo({
        IdPersona: IdPersona,
        IdGrupo: IdGrupo,
        IdCliente: IdCliente,
        IdDivision: IdDivision,
        IdUsuario: usuario.username,
        IdSecuencial
      }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        listarPersonaGrupo();
        setRefreshData(true);
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });

    }
  }


  const nuevoRegistroTabsPersonaGrupo = () => {

    let hoy = new Date();
    let fecInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    /* let fecFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
    fecFin = fecFin.setMinutes(-1); */
    let fecFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    let nuevo = { Activo: "S", FechaInicio: fecInicio, FechaFin: fecFin };
    let currentUsers = dataSource._items;
    //debugger;
    setDataRowEditNew({
      ...nuevo, esNuevoRegistro: true, currentUsers

    });
    setGrillaPersona([]);
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));

    setModoEdicion(true);
  };


  const editarRegistroPersonaGrupo = dataRow => {
    const { RowIndex, IdPersona } = dataRow;
    setModoEdicion(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerPersonaGrupo(dataRow);
    setFocusedRowKeyPGrupo(RowIndex);
    setGridBoxValue([IdPersona]);
  };

  const cancelarEdicionTabsPersonaGrupo = () => {
    setModoEdicion(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const seleccionarPersonaGrupo = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKeyPGrupo(RowIndex);
  };


  const cargaListaPersonaGrupo = async (filtro) => {
    setLoading(true);
    let personasGrupo = await listarPerGrupo({
      //IdPersona: 0,
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdGrupo: varIdGrupo,
      NumPagina: 0, TamPagina: 0,
      Filtro: JSON.stringify(filtro),
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    })
      .finally(() => { setLoading(false); });
    setListarTabs(personasGrupo);
  };
  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //Datos Principales
  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  const getInfo = () => {
    const { IdGrupo, Grupo } = selected;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdGrupo, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ACCESS.PERSON.GRUPO" })], value: Grupo, colSpan: 4 }
    ];
  }

  useEffect(() => {
    listarCasinoGrupos();
    loadControlsPermission();
  }, []);

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function eliminarListRowTab(selected, confirm) {
    let currentTab = tabIndex;
    switch (currentTab) {
      case 0:
        eliminarRegistro(selected, confirm);
        break;
      case 2:
        eliminarRegistroGrupoServicio(selected, confirm);
        break;
      case 3:
        eliminarRegistroPersonaGrupo(selected, confirm);
        break;
    }
  }


  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "", 
      "",
      "CASINO.DINNINGROOM.SERVICE.SERVICES",
      "CASINO.PERSON.GROUP.PERSONS",
      "CONFIG.MENU.ASISTENCIA.COMPAÑÍA"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`): "";
    
    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdGrupo) ? false : true;
    //return true;
  }

  const tabContent_CasinoGrupoListPage = () => {
    return <CasinoGrupoListPage
      casinoGrupos={casinoGrupos}
      titulo={titulo}
      editarRegistro={editarRegistro}
      eliminarRegistro={eliminarRegistro}
      nuevoRegistro={nuevoRegistro}
      seleccionarRegistro={seleccionarRegistro}
      verRegistroDblClick={verRegistroDblClick}
      focusedRowKey={focusedRowKey}
      accessButton={accessButton}
    />
  }


  const tabContent_CasinoGrupoEditPage = () => {
    return <>
      <CasinoGrupoEditPage
        titulo={titulo}
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        actualizarCasinoGrupo={actualizarCasinoGrupo}
        agregarCasinoGrupo={agregarCasinoGrupo}
        cancelarEdicion={cancelarEdicion}
        //getInfo={getInfo}
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

  const tabContent_GrupoServicioListPage = () => {
    return <>
      {modoEdicion && (
        <>
          <GrupoServicioEditPage
            dataRowEditNew={dataRowEditNew}
            actualizarGrupoServicio={actualizarGrupoServicio}
            agregarGrupoServicio={agregarGrupoServicio}
            cancelarEdicion={cancelarEdicionTabsGrupoServicio}
            titulo={tituloTabs}
            getInfo={getInfo}
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
          <GrupoServicioListPage
            grupoServicios={listarTabs}
            editarRegistro={editarRegistroGrupoServicio}
            eliminarRegistro={eliminarRegistroGrupoServicio}
            nuevoRegistro={nuevoRegistroTabsGrupoServicio}
            cancelarEdicion={cancelarEdicion}
            getInfo={getInfo}
            accessButton={accessButton}
          />
        </>
      )}
    </>
  }

  const tabContent_PersonasGrupoListPage = () => {
    return <>
      {modoEdicion && (
        <>
          <PersonasGrupoEditPage
            dataRowEditNew={dataRowEditNew}
            actualizarPersonaGrupo={actualizarPersonaGrupo}
            agregarPersonaGrupo={agregarPersonaGrupo}
            validarDatosPersona={validarDatosPersona}
            cancelarEdicion={cancelarEdicionTabsPersonaGrupo}
            gridBoxValue={gridBoxValue}
            setGridBoxValue={setGridBoxValue}
            titulo={tituloTabs}
            grillaPersona={grillaPersona}
            setGrillaPersona={setGrillaPersona}
            getInfo={getInfo}
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
          <PersonasGrupoListPage
            personasGrupo={listarTabs}
            editarRegistro={editarRegistroPersonaGrupo}
            eliminarRegistro={eliminarRegistroPersonaGrupo}
            cargaListaPersonaGrupo={cargaListaPersonaGrupo}
            nuevoRegistro={nuevoRegistroTabsPersonaGrupo}
            cancelarEdicion={cancelarEdicion}
            seleccionarRegistro={seleccionarPersonaGrupo}
            focusedRowKey={focusedRowKeyPGrupo}
            getInfo={getInfo}
            allowUpdating={false}
            accessButton={accessButton}

            //customerDataGrid
            showHeaderInformation={true}
            uniqueId={"personasGrupoList"}
            isFirstDataLoad={isFirstDataLoad}
            setIsFirstDataLoad={setIsFirstDataLoad}
            dataSource={dataSource}
            refresh={refresh}
            resetLoadOptions={resetLoadOptions}
            refreshData={refreshData}
            setRefreshData={setRefreshData}
            selected={selected}
          />
        </>
      )}
    </>
  }


  const tabContent_CasinoGrupoCompaniaListPage = () => {
    return <>

     <CasinoGrupoCompaniaIndexPage
      varIdGrupo={varIdGrupo}
      cancelarEdicion={cancelarEdicion}
      getInfo={getInfo}
      accessButton={accessButton}
      settingDataField={dataMenu.datos}
     />
    </>
  }
  

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "CASINO.GROUP.MENU" })}
        subtitle={intl.formatMessage({ id: "CASINO.GROUP.SERVICE.MAINTENANCE" })}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
          },
          {
            label: intl.formatMessage({ id: "ACCESS.PERSON.GRUPOS" }),
            icon: <GroupWorkSharpIcon fontSize="large" />,
            onClick: (e) => { obtenerCasinoGrupo(selected) },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.SERVICES" }),
            icon: <DashboardSharpIcon fontSize="large" />,
            onClick: (e) => { listarGrupoServicio() },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          },
          {
            label: intl.formatMessage({ id: "CASINO.PERSON.GROUP.PERSONS" }),
            icon: <PeopleAltOutlinedIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[3] ? false : true
          },
          {
            label: intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.COMPAÑÍA" }),
            icon: <BusinessIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[4] ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_CasinoGrupoListPage(),
            tabContent_CasinoGrupoEditPage(),
            tabContent_GrupoServicioListPage(),
            tabContent_PersonasGrupoListPage(),
            tabContent_CasinoGrupoCompaniaListPage()
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
export default injectIntl(WithLoandingPanel(CasinoGrupoIndexPage));
