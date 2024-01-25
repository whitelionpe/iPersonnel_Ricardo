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
import { isNotEmpty } from "../../../../../_metronic";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import { listar } from "../../../../api/sistema/modulo.api";
import ModuloListPage from "./ModuloListPage";

import {
  eliminar as eliminarModParametro, obtener as obtenerModParametro, listar as listarModParametro, crear as crearModParametro, actualizar as actualizarModParametro
} from "../../../../api/sistema/parametro.api";
import ParametroListPage from "../parametro/ParametroListPage";
import ParametroEditPage from "../parametro/ParametroEditPage";

import {
  eliminar as eliminarParametroDet, obtener as obtenerParametroDet, listar as listarParametroDet, crear as crearParametroDet, actualizar as actualizarParametroDet
} from "../../../../api/sistema/parametroModulo.api";
import ParametroModuloEditPage from "../parametromodulo/ParametroModuloEditPage";

import {
  eliminar as eliminarModRegla, obtener as obtenerModRegla, listar as listarModRegla, crear as crearModRegla, actualizar as actualizarModRegla
} from "../../../../api/sistema/moduloregla.api";
import ModuloReglaListPage from "../moduloregla/ModuloReglaListPage";
import ModuloReglaEditPage from "../moduloregla/ModuloReglaEditPage";

import {
  eliminar as eliminarModJob, obtener as obtenerModJob, listar as listarModJob, crear as crearModJob, actualizar as actualizarModJob
} from "../../../../api/sistema/modulojob.api";
import ModuloJobListPage from "../modulojob/ModuloJobListPage";
import ModuloJobEditPage from "../modulojob/ModuloJobEditPage";

import {
  eliminar as eliminarModAuditoria, obtener as obtenerModAuditoria, listar as listarModAuditoria, crear as crearModAuditoria, actualizar as actualizarModAuditoria
} from "../../../../api/sistema/auditoria.api";
import AuditoriaListPage from "./AuditoriaListPage";
import AuditoriaEditPage from "./AuditoriaEditPage";

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import PropTypes from 'prop-types';

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import DynamicFeedIcon from '@material-ui/icons/DynamicFeed';
import VerticalSplitIcon from '@material-ui/icons/VerticalSplit';
import WorkIcon from '@material-ui/icons/Work';
import FindInPageIcon from '@material-ui/icons/FindInPage';

//import HeaderInformation from "../../../../partials/components/HeaderInformation";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

const ModuloIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  //console.log("dataMenu",dataMenu);
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [isVisibleModApp, setIsVisibleModApp] = useState(false);

  const [varIdModulo, setVarIdModulo] = useState("");
  const [varIdAplicacion, setVarIdAplicacion] = useState("");

  const [focusedRowKey, setFocusedRowKey] = useState();
  const [focusedRowKeyAplicacion, setFocusedRowKeyAplicacion] = useState();
  const [focusedRowKeyParametro, setFocusedRowKeyParametro] = useState();
  const [focusedRowKeyParametroModulo, setFocusedRowKeyParametroModulo] = useState();
  const [modulos, setModulos] = useState([]);

  const [selected, setSelected] = useState({});

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);

  const [modoEdicion, setModoEdicion] = useState(false);
  const [modoEdicionDetalle, setModoEdicionDetalle] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [dataRowEditNewDetalle, setDataRowEditNewDetalle] = useState({});

  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [listarTabs, setListarTabs] = useState([]);

  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);

  const [collapsed, setCollapsed] = useState(false);
  const [expandRow, setExpandRow] = useState(0);
  const [collapsedParametro, setCollapsedParametro] = useState(false);
  const [expandRowParametro, setExpandRowParametro] = useState(0);

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };
  ///FUNCION MODULO::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function listarModulos() {
    
    console.log("listarModulos");

    setLoading(true);
    disabledTabs(true);


    let modulos = await listar({
      IdModulo: "%"
      , Modulo: "%"
      , NumPagina: 0
      , TamPagina: 0
    }).then(modulos => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
            //Desactivar el tab menus.
      setModulos(modulos);
      changeTabIndex(0);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });


  }

  const seleccionarModulo = dataRow => {
    const { IdModulo, RowIndex } = dataRow;
    if (IdModulo !== varIdModulo) {
      setVarIdModulo(IdModulo);
      setFocusedRowKey(RowIndex);
      //Control externo.
      disabledTabs(true);
      setExpandRow(RowIndex);
      setCollapsed(false);
    }
  }

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});

  };

  //Configuración de Tabs y botones
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 5;
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  useEffect(() => {
    listarModulos();
    loadControlsPermission();
  }, []);


  //::::::::::::::::::::::::::::: MODULO APLICACION  :::::::::::::::::::::::::::::::::::::::::::::::::::::
  const disabledTabs = (value) => {
    if (value) {
      //Eliminar LocalStorage
      localStorage.removeItem('dataRowAplication');
      //bloquear tab-Menu
      document.getElementById("vertical-tab-1").classList.add("Mui-disabled");
      document.getElementById("vertical-tab-2").classList.add("Mui-disabled");
      document.getElementById("vertical-tab-3").classList.add("Mui-disabled");
      document.getElementById("vertical-tab-4").classList.add("Mui-disabled");
    } else {
      //desbloquear tab-Menu
      document.getElementById("vertical-tab-1").classList.remove("Mui-disabled");
      document.getElementById("vertical-tab-2").classList.remove("Mui-disabled");
      document.getElementById("vertical-tab-3").classList.remove("Mui-disabled");
      document.getElementById("vertical-tab-4").classList.remove("Mui-disabled");
    }
  }
  const goTabMenu = () => {
    //Leer localStoreage.
    let dataRow = JSON.parse(localStorage.getItem('dataRowAplication'));
    if (isNotEmpty(dataRow)) {
      const { IdAplicacion } = dataRow;
      setSelected(dataRow);
      setVarIdAplicacion(IdAplicacion);
    }
  }
  const seleccionarAplicacion = async (dataRow) => {
    //Crear un registro en el navegador
    localStorage.setItem('dataRowAplication', JSON.stringify(dataRow));
    //Bloquear tab
    disabledTabs(false);
     
  }

  ///FUNCION PARAMETRO:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarParametro(parametro) {
    setLoading(true);
    const { IdParametro, Parametro, Activo } = parametro;
    let params = {
      IdCliente: perfil.IdCliente
      , IdModulo: varIdModulo
      , IdAplicacion: varIdAplicacion
      , IdParametro: isNotEmpty(IdParametro) ? IdParametro.toUpperCase() : ""
      , Parametro: isNotEmpty(Parametro) ? Parametro.toUpperCase() : ""
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await crearModParametro(params).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarParametro();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function actualizarParametro(parametro) {
    setLoading(true);
    const { IdCliente, IdModulo, IdAplicacion, IdParametro, Parametro, Activo } = parametro;
    let params = {
      IdCliente: IdCliente
      , IdModulo: IdModulo
      , IdAplicacion: IdAplicacion
      , IdParametro: isNotEmpty(IdParametro) ? IdParametro.toUpperCase() : ""
      , Parametro: isNotEmpty(Parametro) ? Parametro.toUpperCase() : ""
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await actualizarModParametro(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarParametro();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistroParametro(parametro, confirm) {
    setSelected(parametro);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdModulo, IdAplicacion, IdParametro } = parametro;
      await eliminarModParametro({
        IdCliente,
        IdParametro,
        IdAplicacion,
        IdModulo,
        IdUsuario: usuario.username
      }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
      listarParametro();
    }
  }

  async function listarParametro() {
    setLoading(true);
    goTabMenu();
    const { IdAplicacion, IdModulo } = selected;
    setModoEdicion(false);
    await listarModParametro({
      IdCliente: perfil.IdCliente,
      IdParametro: '%',
      IdAplicacion,
      IdModulo,
      NumPagina: 0,
      TamPagina: 0
    }).then(parametros => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(parametros);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });

  }

  async function obtenerParametro(filtro) {
    setLoading(true);
    const { IdCliente, IdModulo, IdAplicacion, IdParametro } = filtro;
    let parametro = await obtenerModParametro({
      IdCliente,
      IdModulo,
      IdAplicacion,
      IdParametro
    }).then(parametro => {
      setDataRowEditNew({ ...parametro, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  const nuevoRegistroParametro = () => {
    let nuevo = { Activo: "S", ...selected };
    setDataRowEditNew({ ...nuevo, esNuevoRegistro: true });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const editarRegistroParametro = dataRow => {
    setModoEdicion(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerParametro(dataRow);
  };

  const seleccionarParametro = dataRow => {
    const { RowIndex } = dataRow;
    setFocusedRowKeyParametro(RowIndex);
  };

  const cancelarEdicionParametro = () => {
    setModoEdicion(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  ///FUNCION PARAMETRO DETALLE:::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const seleccionarParametroModulo = async (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKeyParametroModulo(RowIndex);
  }

  async function agregarParametroDetalle(parametroModulo) {
    setLoading(true);
    const { IdCliente, IdModulo, IdAplicacion, IdParametro, IdSecuencial, Valor, Descripcion, Sp_Antes, Sp_Despues, EditableModulo, Fijo, Activo } = parametroModulo;
    let params = {
      IdCliente: IdCliente
      , IdModulo: isNotEmpty(IdModulo) ? IdModulo : ""
      , IdAplicacion: isNotEmpty(IdAplicacion) ? IdAplicacion : ""
      , IdParametro: isNotEmpty(IdParametro) ? IdParametro : ""
      , IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0
      , Valor: isNotEmpty(Valor) ? Valor.toUpperCase() : ""
      , Descripcion: isNotEmpty(Descripcion) ? Descripcion.toUpperCase() : ""
      , Sp_Antes: isNotEmpty(Sp_Antes) ? Sp_Antes.toUpperCase() : ""
      , Sp_Despues: isNotEmpty(Sp_Despues) ? Sp_Despues.toUpperCase() : ""
      , EditableModulo: isNotEmpty(EditableModulo) ? EditableModulo : ""
      , Fijo: isNotEmpty(Fijo) ? Fijo : ""
      , Activo
      , IdUsuario: usuario.username
    }
    await crearParametroDet(
      params
    ).then(response => {
      if (response) {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        setModoEdicionDetalle(false);
        listarParametro();
      }
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function actualizarParametroDetalle(parametroModulo) {
    setLoading(true);
    const { IdCliente, IdModulo, IdAplicacion, IdParametro, IdSecuencial, Valor, Descripcion, Sp_Antes, Sp_Despues, EditableModulo, Fijo, Activo } = parametroModulo;
    let params = {
      IdCliente: IdCliente
      , IdModulo: isNotEmpty(IdModulo) ? IdModulo : ""
      , IdAplicacion: isNotEmpty(IdAplicacion) ? IdAplicacion : ""
      , IdParametro: isNotEmpty(IdParametro) ? IdParametro : ""
      , IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0
      , Valor: isNotEmpty(Valor) ? Valor.toUpperCase() : ""
      , Descripcion: isNotEmpty(Descripcion) ? Descripcion.toUpperCase() : ""
      , Sp_Antes: isNotEmpty(Sp_Antes) ? Sp_Antes.toUpperCase() : ""
      , Sp_Despues: isNotEmpty(Sp_Despues) ? Sp_Despues.toUpperCase() : ""
      , EditableModulo: isNotEmpty(EditableModulo) ? EditableModulo : ""
      , Fijo: isNotEmpty(Fijo) ? Fijo : ""
      , Activo
      , IdUsuario: usuario.username
    }
    await actualizarParametroDet(params)
      .then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        setModoEdicionDetalle(false);
        listarParametro();
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
  }

  async function eliminarParametroDetalle(parametroModulo) {
    setLoading(true);
    const { IdCliente, IdModulo, IdAplicacion, IdParametro, IdSecuencial } = parametroModulo;
    let params = {
      IdCliente,
      IdModulo,
      IdAplicacion,
      IdParametro,
      IdSecuencial,
      IdUsuario: usuario.username
    }
    await eliminarParametroDet(params)
      .then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
  }

  async function obtenerParametroDetalle(filtro) {
    //setLoading(true);
    const { IdCliente, IdModulo, IdAplicacion, IdParametro, IdSecuencial } = filtro;
    let parametroModulo = await obtenerParametroDet({
      IdCliente,
      IdModulo,
      IdAplicacion,
      IdParametro,
      IdSecuencial
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    });
    setDataRowEditNewDetalle({ ...parametroModulo, esNuevoRegistro: false });
  }

  const nuevoParametroDetalle = async (dataRow) => {
    const { IdCliente, IdModulo, IdAplicacion, IdParametro } = dataRow;
    let parametroModulo = {
      IdCliente,
      IdModulo,
      IdAplicacion,
      IdParametro,
      Activo: "S",
      EditableModulo: "S",
      Fijo: "N"
    };
    setDataRowEditNewDetalle({ ...parametroModulo, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(false);
    setModoEdicionDetalle(true);
  };

  const editarParametroDetalle = dataRow => {
    setModoEdicion(false);
    setModoEdicionDetalle(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerParametroDetalle(dataRow);
  };

  const cancelarParametroDetalle = () => {
    setModoEdicion(false);
    setModoEdicionDetalle(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));

  };


  ///FUNCION REGLA:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarRegla(regla) {
    setLoading(true);
    const { IdModulo, IdAplicacion, IdRegla, Regla, Comentario, Nombre_Procedimiento, Activo } = regla;
    let params = {
      IdCliente: perfil.IdCliente
      , IdModulo
      , IdAplicacion
      , IdRegla: isNotEmpty(IdRegla) ? IdRegla.toUpperCase() : ""
      , Regla: isNotEmpty(Regla) ? Regla.toUpperCase() : ""
      , Comentario: isNotEmpty(Comentario) ? Comentario.toUpperCase() : ""
      , Nombre_Procedimiento: isNotEmpty(Nombre_Procedimiento) ? Nombre_Procedimiento.toUpperCase() : ""
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await crearModRegla(params).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarRegla();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }


  async function actualizarRegla(regla) {
    setLoading(true);
    const { IdCliente, IdModulo, IdAplicacion, IdRegla, Regla, Comentario, Nombre_Procedimiento, Activo } = regla;
    let params = {
      IdCliente
      , IdModulo
      , IdAplicacion
      , IdRegla: isNotEmpty(IdRegla) ? IdRegla.toUpperCase() : ""
      , Regla: isNotEmpty(Regla) ? Regla.toUpperCase() : ""
      , Comentario: isNotEmpty(Comentario) ? Comentario.toUpperCase() : ""
      , Nombre_Procedimiento: isNotEmpty(Nombre_Procedimiento) ? Nombre_Procedimiento.toUpperCase() : ""
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await actualizarModRegla(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarRegla();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistroRegla(regla, confirm) {
    setSelected(regla);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdModulo, IdAplicacion, IdRegla } = regla;
      await eliminarModRegla({
        IdCliente,
        IdModulo,
        IdAplicacion,
        IdRegla,
        IdUsuario: usuario.username
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
      listarRegla();
    }
  }

  async function listarRegla() {
    setLoading(true);
    goTabMenu();
    const { IdModulo, IdAplicacion } = selected;
    setModoEdicion(false);
    await listarModRegla({
      IdCliente: perfil.IdCliente,
      IdModulo,
      IdAplicacion,
      IdRegla: '%',
      NumPagina: 0,
      TamPagina: 0
    }).then(reglas => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(reglas);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function obtenerRegla(filtro) {
    setLoading(true);
    const { IdCliente, IdModulo, IdAplicacion, IdRegla } = filtro;
    await obtenerModRegla({
      IdCliente,
      IdModulo,
      IdAplicacion,
      IdRegla
    }).then(regla => {
      setDataRowEditNew({ ...regla, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });

  }

  const nuevoRegistroRegla = () => {
    let nuevo = { Activo: "S", ...selected };
    setDataRowEditNew({ ...nuevo, esNuevoRegistro: true });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const editarRegistroRegla = dataRow => {

    setModoEdicion(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerRegla(dataRow);

  };


  const cancelarEdicionRegla = () => {
    setModoEdicion(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };


  ///FUNCION JOB::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarJob(job) {
    setLoading(true);
    const { IdModulo, IdAplicacion, IdJob, Job, Comentario, Nombre_Procedimiento, Activo } = job;
    let params = {
      IdCliente: perfil.IdCliente
      , IdModulo
      , IdAplicacion
      , IdJob: isNotEmpty(IdJob) ? IdJob.toUpperCase() : ""
      , Job: isNotEmpty(Job) ? Job.toUpperCase() : ""
      , Comentario: isNotEmpty(Comentario) ? Comentario.toUpperCase() : ""
      , Nombre_Procedimiento: isNotEmpty(Nombre_Procedimiento) ? Nombre_Procedimiento.toUpperCase() : ""
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await crearModJob(params).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarJob();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function actualizarJob(job) {
    setLoading(true);
    const { IdCliente, IdModulo, IdAplicacion, IdJob, Job, Comentario, Nombre_Procedimiento, Activo } = job;
    let params = {
      IdCliente
      , IdModulo
      , IdAplicacion
      , IdJob: isNotEmpty(IdJob) ? IdJob.toUpperCase() : ""
      , Job: isNotEmpty(Job) ? Job.toUpperCase() : ""
      , Comentario: isNotEmpty(Comentario) ? Comentario.toUpperCase() : ""
      , Nombre_Procedimiento: isNotEmpty(Nombre_Procedimiento) ? Nombre_Procedimiento.toUpperCase() : ""
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await actualizarModJob(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarJob();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistroJob(job, confirm) {
    setSelected(job);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdModulo, IdAplicacion, IdJob } = job;
      await eliminarModJob({
        IdCliente,
        IdModulo,
        IdAplicacion,
        IdJob,
        IdUsuario: usuario.username
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
      listarJob();
    }
  }

  async function listarJob() {
    setLoading(true);
    goTabMenu();
    const { IdModulo, IdAplicacion } = selected;
    setModoEdicion(false);
    await listarModJob({
      IdCliente: perfil.IdCliente,
      IdModulo,
      IdAplicacion,
      IdJob: '%',
      NumPagina: 0,
      TamPagina: 0
    }).then(jobs => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(jobs);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });

  }

  async function obtenerJob(filtro) {
    setLoading(true);
    const { IdCliente, IdModulo, IdAplicacion, IdJob } = filtro;
    await obtenerModJob({
      IdCliente,
      IdModulo,
      IdAplicacion,
      IdJob
    }).then(job => {
      setDataRowEditNew({ ...job, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  const nuevoRegistroJob = () => {
    let nuevo = { Activo: "S", ...selected };
    setDataRowEditNew({ ...nuevo, esNuevoRegistro: true });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const editarRegistroJob = dataRow => {

    setModoEdicion(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerJob(dataRow);

  };

  const cancelarEdicionJob = () => {
    setModoEdicion(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  ///FUNCION AUDIORIA:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarAuditoria(auditoria) {
    setLoading(true);
    const { IdModulo, IdAplicacion, Tabla, Activo } = auditoria;
    let params = {
      IdCliente: perfil.IdCliente
      , IdModulo
      , IdAplicacion
      , Tabla: isNotEmpty(Tabla) ? Tabla.toUpperCase() : ""
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await crearModAuditoria(params).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarAuditoria();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }


  async function actualizarAuditoria(auditoria) {
    setLoading(true);
    const { IdCliente, IdModulo, IdAplicacion, Tabla, Activo } = auditoria;
    let params = {
      IdCliente
      , IdModulo
      , IdAplicacion
      , Tabla: isNotEmpty(Tabla) ? Tabla.toUpperCase() : ""
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await actualizarModAuditoria(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarAuditoria();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }


  async function eliminarRegistroAuditoria(auditoria, confirm) {
    setSelected(auditoria);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdModulo, IdAplicacion, Tabla } = auditoria;
      await eliminarModAuditoria({
        IdCliente,
        Tabla,
        IdAplicacion,
        IdModulo,
        IdUsuario: usuario.username
      }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
      listarAuditoria();
    }
  }


  async function listarAuditoria() {
    setLoading(true);
    goTabMenu();
    const { IdModulo, IdAplicacion } = selected;
    setModoEdicion(false);
    await listarModAuditoria({
      IdCliente: perfil.IdCliente,
      Tabla: '%',
      IdAplicacion,
      IdModulo,
      NumPagina: 0,
      TamPagina: 0
    }).then(auditorias => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(auditorias);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });

  }


  async function obtenerAuditoria(filtro) {
    setLoading(true);
    const { IdCliente, IdModulo, IdAplicacion, Tabla } = filtro;
    await obtenerModAuditoria({
      IdCliente,
      IdModulo,
      IdAplicacion,
      Tabla
    }).then(auditoria => {
      setDataRowEditNew({ ...auditoria, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }


  const nuevoRegistroAuditoria = () => {
    let nuevo = { Activo: "S", ...selected };
    setDataRowEditNew({ ...nuevo, esNuevoRegistro: true });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const editarRegistroAuditoria = dataRow => {

    setModoEdicion(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerAuditoria(dataRow);

  };


  const cancelarEdicionAuditoria = () => {
    setModoEdicion(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }


  const getInfo = () => {
    const { Modulo, Aplicacion } = selected;
    return [
      { text: [intl.formatMessage({ id: "SYSTEM.MODULEAPLICATION.MODULE" })], value: Modulo, colSpan: 2 },
      { text: [intl.formatMessage({ id: "SYSTEM.MODULEAPLICATION.APLICATION" })], value: Aplicacion, colSpan: 4 }
    ];
  }

  async function eliminarListRowTab(selected, confirm) {
    let currentTab = tabIndex;
    switch (currentTab) {
      case 1:
        eliminarRegistroParametro(selected, confirm);
        break;
      case 2:
        eliminarRegistroRegla(selected, confirm);
        break;
      case 3:
        eliminarRegistroJob(selected, confirm);
        break;
      case 4:
        eliminarRegistroAuditoria(selected, confirm);
        break;
    }
  }



  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "", 
      "",
      "SYSTEM.MODULERULES",
      "SYSTEM.MODULEJOBS",
      "SYSTEM.AUDITCONFIGURATION"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`): "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + "  " + sufix;
  }
  const tabsDisabled = () => {
    //return isNotEmpty(varIdModulo) ? false : true;
    //return true;
  }

  const tabContent_ModuloListPage = () => {
    return <>
      {!isVisibleModApp && (
        <ModuloListPage
          modulosData={modulos}
          titulo={titulo}
          showButtons={false}
          showColumnLicense={true}
          showColumnOrder={false}
          //editarRegistro={editarRegistro}
          //eliminarRegistro={eliminarRegistro}
          //nuevoRegistro={nuevoRegistro}
          seleccionarRegistro={seleccionarModulo}
          focusedRowKey={focusedRowKey}
          seleccionarAplicacion={seleccionarAplicacion}
          //focusedRowKeyAplicacion={focusedRowKeyAplicacion}

          expandRow={{ expandRow, setExpandRow }}
          collapsedRow={{ collapsed, setCollapsed }}
        />
      )}
    </>
  }


  const tabContent_ParametroListPage = () => {
    return <>
      {modoEdicion && (
        <>
          <ParametroEditPage
            titulo={titulo}
            dataRowEditNew={dataRowEditNew}
            actualizarParametro={actualizarParametro}
            agregarParametro={agregarParametro}
            cancelarEdicion={cancelarEdicionParametro}
            titulo={tituloTabs}
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
      {modoEdicionDetalle && (
        <>
          <ParametroModuloEditPage
            titulo={titulo}
            modoEdicion={modoEdicionDetalle}
            dataRowEditNew={dataRowEditNewDetalle}
            actualizarParametroDetalle={actualizarParametroDetalle}
            agregarParametroDetalle={agregarParametroDetalle}
            cancelarEdicion={cancelarParametroDetalle}
          />
          <div className="container_only">
            <div className="float-right">
              <ControlSwitch checked={auditoriaSwitch}
                onChange={e => { setAuditoriaSwitch(e.target.checked) }}
              /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
            </div>
          </div>
          {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewDetalle} />)}
        </>
      )}
      {!modoEdicion && !modoEdicionDetalle && (
        <ParametroListPage
          parametros={listarTabs}
          titulo={titulo}
          showButtons={true}
          showColumnOrder={false}
          editarRegistro={editarRegistroParametro}
          eliminarRegistro={eliminarRegistroParametro}
          nuevoRegistro={nuevoRegistroParametro}
          seleccionarRegistro={seleccionarParametro}
          focusedRowKey={focusedRowKeyParametro}
          cancelarEdicion={cancelarEdicion}

          insertarParametroModulo={nuevoParametroDetalle}
          editarParametroModulo={editarParametroDetalle}
          eliminarParametroModulo={eliminarParametroDetalle}
          seleccionarParametroModulo={seleccionarParametroModulo}
          focusedRowKeyParametroModulo={focusedRowKeyParametroModulo}

          expandRow={{ expandRowParametro, setExpandRowParametro }}
          collapsedRow={{ collapsedParametro, setCollapsedParametro }}
          getInfo={getInfo}
        />
      )}
    </>
  }

  const tabContent_ModuloReglaListPage = () => {
    return <>
      {modoEdicion && (
        <>
          <ModuloReglaEditPage
            dataRowEditNew={dataRowEditNew}
            actualizarRegla={actualizarRegla}
            agregarRegla={agregarRegla}
            cancelarEdicion={cancelarEdicionRegla}
            titulo={tituloTabs}
            accessButton={accessButton}
            settingDataField={dataMenu.datos}
            modoEdicion={modoEdicion}
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
          <ModuloReglaListPage
            reglas={listarTabs}
            editarRegistro={editarRegistroRegla}
            eliminarRegistro={eliminarRegistroRegla}
            nuevoRegistro={nuevoRegistroRegla}
            cancelarEdicion={cancelarEdicion}
            getInfo={getInfo}
            accessButton={accessButton}
          />
        </>
      )}
    </>
  }

  const tabContent_ModuloJobListPage = () => {
    return <>
      {modoEdicion && (
        <>
          <ModuloJobEditPage
            dataRowEditNew={dataRowEditNew}
            actualizarJob={actualizarJob}
            agregarJob={agregarJob}
            cancelarEdicion={cancelarEdicionJob}
            titulo={tituloTabs}
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
          <ModuloJobListPage
            jobs={listarTabs}
            editarRegistro={editarRegistroJob}
            eliminarRegistro={eliminarRegistroJob}
            nuevoRegistro={nuevoRegistroJob}
            cancelarEdicion={cancelarEdicion}
            getInfo={getInfo}
            accessButton={accessButton}
          />
        </>
      )}
    </>
  }

  const tabContent_AuditoriaListPage = () => {
    return <>
      {modoEdicion && (
        <>
          <AuditoriaEditPage
            dataRowEditNew={dataRowEditNew}
            actualizarAuditoria={actualizarAuditoria}
            agregarAuditoria={agregarAuditoria}
            cancelarEdicion={cancelarEdicionAuditoria}
            titulo={tituloTabs}
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
          <AuditoriaListPage
            auditorias={listarTabs}
            editarRegistro={editarRegistroAuditoria}
            eliminarRegistro={eliminarRegistroAuditoria}
            nuevoRegistro={nuevoRegistroAuditoria}
            cancelarEdicion={cancelarEdicion}
            getInfo={getInfo}
            accessButton={accessButton}
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
        subtitle={intl.formatMessage({ id: "SYSTEM.MODULE.CONFIGURATION" })}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        //value={''}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
            onclick: ()=>{ }
            //onClick: () => { listarModulos() 
            //},
          },
          {
            label: intl.formatMessage({ id: "SYSTEM.PARAMETERS" }),
            icon: <DynamicFeedIcon fontSize="large" />,
            onClick: (e) => { listarParametro() },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "SYSTEM.MODULERULES" }),
            icon: <VerticalSplitIcon fontSize="large" />,
            onClick: (e) => { listarRegla() },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          },
          {
            label: intl.formatMessage({ id: "SYSTEM.MODULEJOBS" }),
            icon: <WorkIcon fontSize="large" />,
            onClick: () => { listarJob() },
            disabled: !tabsDisabled() && accessButton.Tabs[3] ? false : true
          },
          {
            label: intl.formatMessage({ id: "SYSTEM.AUDITCONFIGURATION" }),
            icon: <FindInPageIcon fontSize="large" />,
            onClick: () => { listarAuditoria() },
            disabled: !tabsDisabled() && accessButton.Tabs[4] ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_ModuloListPage(),
            tabContent_ParametroListPage(),
            tabContent_ModuloReglaListPage(),
            tabContent_ModuloJobListPage(),
            tabContent_AuditoriaListPage()
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



export default injectIntl(WithLoandingPanel(ModuloIndexPage));
