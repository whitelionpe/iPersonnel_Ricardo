import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import PropTypes from 'prop-types';
import { isNotEmpty, dateFormat } from "../../../../../_metronic";
import { Portlet } from "../../../../partials/content/Portlet";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import { getButtonPermissions, defaultPermissions } from '../../../../../_metronic/utils/securityUtils'

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import FeaturedPlayListIcon from '@material-ui/icons/FeaturedPlayList';
import BusinessIcon from '@material-ui/icons/Business';
import FormatIndentIncrease from '@material-ui/icons/FormatIndentIncrease';
import DateRange from '@material-ui/icons/DateRange';
import EventAvailableIcon from '@material-ui/icons/EventAvailable';
import PlaylistAddCheck from '@material-ui/icons/PlaylistAddCheck';
import LocalAtmIcon from '@material-ui/icons/LocalAtm';
import AspectRatioIcon from '@material-ui/icons/AspectRatio';
import GroupWorkSharpIcon from '@material-ui/icons/GroupWorkSharp';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import CompaniaListPage from "./CompaniaListPage";
import CompaniaEditPage from "./CompaniaEditPage";

import {
  eliminarAsistencia, obtener, listar, actualizarAsistencia, crearAsistencia
} from "../../../../api/administracion/compania.api";


import PlanillaListPage from "../planilla/PlanillaListPage";
import PlanillaEditPage from "../planilla/PlanillaEditPage";

import {
  servicePlanilla
} from "../../../../api/asistencia/planilla.api";

import JustificacionEditPage from "../justificacion/JustificacionEditPage";
import JustificacionListPage from "../justificacion/JustificacionListPage";

import {
  obtener as obtenerJS, listar as listarJS, crear as crearJS, actualizar as actualizarJS, eliminar as eliminarJS
} from "../../../../api/asistencia/justificacion.api";

import CondicionEspecialEditPage from "../condicionEspecial/CondicionEspecialEditPage";
import CondicionEspecialListPage from "../condicionEspecial/CondicionEspecialListPage";

import {
  obtener as obtenerCE,
  listar as listarCE,
  crear as crearCE,
  actualizar as actualizarCE,
  eliminar as eliminarCE
} from "../../../../api/asistencia/condicionEspecial.api";


import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import HorarioIndexPage from "../horario/HorarioIndexPage";

import TipoAutorizacionCompaniaIndex from "../compania/tipoAutorizacionCompania/TipoAutorizacionCompaniaIndex";
import BonoNocturnoIndexPage from "../bonoNocturno/BonoNocturnoIndexPage";
import CuponeraIndexPage from "../cuponera/CuponeraIndexPage";
import GrupoIndexPage from "../grupo/GrupoIndexPage";

/*****/
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import {
  crear as crearJP,
  eliminar as eliminarJP
} from "../../../../api/asistencia/justificacionPlanilla.api";

import {
  crear as crearDIV,
  eliminar as eliminarDIV
} from "../../../../api/asistencia/justificacionDivision.api";

import { listarAsignados } from "../../../../api/asistencia/justificacionPlanilla.api";
import { listarTreeview } from "../../../../api/asistencia/justificacionDivision.api";


export const initialFilter = {
  Activo: 'S',
  IdCliente: '1',
  ControlarAsistencia: 'S'
};

const CompaniaIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  const classes = useStylesTab();

  const [varIdCompania, setVarIdCompania] = useState("");
  const [focusedRowKey, setFocusedRowKey] = useState();
  const [focusedRowKeyJustificacion, setFocusedRowKeyJustificacion] = useState(0);
  const [focusedRowKeyCondicionEspecial, setFocusedRowKeyCondicionEspecial] = useState(0);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [selected, setSelected] = useState({ IdCliente: IdCliente, IdDivision: IdDivision });
  const [tabIndex, setTabIndex] = useState(0);
  const handleChange = (event, newValue) => { setTabIndex(newValue); };

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});
  const [listarTabs, setListarTabs] = useState([]);

  const [dataPlanilla, setDataPlanilla] = useState([]);

  //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
  const [totalRowIndex, setTotalRowIndex] = useState(0);

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

  const [isVisibleAlert, setIsVisibleAlert] = useState(false);

  const [varIdModulo, setVarIdModulo] = useState("");
  const [varIdAplicacion, setVarIdAplicacion] = useState("");

  const classesEncabezado = useStylesEncabezado();

  //: FILTRO  :::::::::::::::::::::::::::::::::::::::::::::

  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();

  //:::::::::::::::::::: CONFIG TABS :::::::::::::::::::::::::::::::::::

  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "ASSISTANCE.PAYROLL",
      "ASSISTANCE.JUSTIFICACION",
      "ASSISTANCE.SPECIAL.CONDITIONS",
      "ASSISTANCE.SCHEDULE.TAB",
      "ASSISTANCE.AUTHORIZATION.TYPE.TAB",
      "ASSISTANCE.NIGHT.BONUS.TAB",
      "ASSISTANCE.COUPON.TAB",
      "ACCESS.PERSON.GRUPO"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }

  const tabsDisabled = () => {
    return isNotEmpty(varIdCompania) ? false : true;
  }

  //:::::::::::::::::::: FUNCIÓN COMPANIA :::::::::::::::::::::::::::::::::::

  async function agregarCompania(compania) {
    setLoading(true);
    const { IdCliente, IdCompania, Compania, Alias, Direccion, Contratista, IdPais, Documento, IdTipoDocumento, IdCategoria, ControlarAsistencia, Activo } = compania;
    let params = {
      IdCliente
      , IdCompania: isNotEmpty(IdCompania) ? IdCompania : ""
      , Compania: isNotEmpty(Compania) ? Compania.toUpperCase() : ""
      , Alias: isNotEmpty(Alias) ? Alias.toUpperCase() : ""
      , Direccion: isNotEmpty(Direccion) ? Direccion.toUpperCase() : ""
      , Contratista: isNotEmpty(Contratista) ? Contratista : ""
      , IdPais: isNotEmpty(IdPais) ? IdPais : ""
      , IdTipoDocumento: isNotEmpty(IdTipoDocumento) ? IdTipoDocumento : ""
      , Documento: isNotEmpty(Documento) ? Documento : ""
      , IdCategoria: isNotEmpty(IdCategoria) ? IdCategoria : ""
      , Activo
      , ControlarAsistencia
      , IdUsuario: usuario.username
    };
    await crearAsistencia(params).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      //listarCompanias();
      setRefreshData(true);
      listarCompanias();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });

  }

  async function actualizarCompania(compania) {
    setLoading(true);
    const { IdCliente, IdCompania, Compania, Alias, Direccion, Contratista, IdPais, Documento, IdTipoDocumento, IdCategoria, ControlarAsistencia, Activo } = compania;
    let params = {
      IdCliente
      , IdCompania: isNotEmpty(IdCompania) ? IdCompania : ""
      , Compania: isNotEmpty(Compania) ? Compania.toUpperCase() : ""
      , Alias: isNotEmpty(Alias) ? Alias.toUpperCase() : ""
      , Direccion: isNotEmpty(Direccion) ? Direccion.toUpperCase() : ""
      , Contratista: isNotEmpty(Contratista) ? Contratista : ""
      , IdPais: isNotEmpty(IdPais) ? IdPais : ""
      , IdTipoDocumento: isNotEmpty(IdTipoDocumento) ? IdTipoDocumento : ""
      , Documento: isNotEmpty(Documento) ? Documento : ""
      , IdCategoria: isNotEmpty(IdCategoria) ? IdCategoria : ""
      , ControlarAsistencia
      , Activo
      , IdUsuario: usuario.username
    };
    await actualizarAsistencia(params).then(response => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarCompanias();
      setRefreshData(true);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro(compania, confirm) {
    setSelectedDelete(compania);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdCompania } = selectedDelete;
      await eliminarAsistencia({ IdCliente, IdCompania, IdUsuario: usuario.username }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        listarCompanias();
        //setRefreshData(true);
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
    }
  }


  async function listarCompanias() {
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    changeTabIndex(0);
    setModoEdicion(false);
    setRefreshData(true);
  }

  async function obtenerCompania() {
    setLoading(true);
    const { IdCliente, IdCompania } = selected;

    await obtener({
      IdCompania, IdCliente
    }).then(compania => {
      setDataRowEditNew({ ...compania, esNuevoRegistro: false });

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }


  const nuevoRegistro = () => {
    changeTabIndex(1);
    const { IdCliente } = selected;
    let compania = { Activo: "S", IdCliente, ControlarAsistencia: "S" };
    setDataRowEditNew({ ...compania, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const editarRegistro = dataRow => {

    changeTabIndex(1);
    const { IdCompania, RowIndex } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerCompania(IdCompania);
    setFocusedRowKey(RowIndex);
  };

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };


  const seleccionarRegistro = dataRow => {
    const { IdCompania, RowIndex } = dataRow;
    setModoEdicion(false);
    setSelected(dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    if (IdCompania != varIdCompania) {
      setVarIdCompania(IdCompania);
      setFocusedRowKey(RowIndex);
    }
  }


  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerCompania(dataRow);
  };

  // ::::::::::::::::::::::::::::: Funciones Planilla :::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarPlanilla(datarow) {
    setLoading(true);
    const { IdCompania, IdPlanilla, Planilla, PrimeraUltimaMarca, Activo } = datarow;
    let data = {
      IdCliente
      , IdCompania: varIdCompania
      , IdPlanilla: isNotEmpty(IdPlanilla) ? IdPlanilla.toUpperCase() : ""
      , Planilla: isNotEmpty(Planilla) ? Planilla.toUpperCase() : ""
      , PrimeraUltimaMarca: (PrimeraUltimaMarca) ? "S" : "N"
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await servicePlanilla(data).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      listarPlanilla();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarPlanilla(datarow) {
    setLoading(true);
    const { IdCompania, IdPlanilla, Planilla, PrimeraUltimaMarca, Activo } = datarow;
    let data = {
      IdCliente
      , IdCompania
      , IdPlanilla
      , Planilla: isNotEmpty(Planilla) ? Planilla.toUpperCase() : ""
      , PrimeraUltimaMarca: (PrimeraUltimaMarca) ? "S" : "N"
      , Activo: isNotEmpty(Activo) ? Activo.toUpperCase() : ""
      , IdUsuario: usuario.username
    };
    await servicePlanilla.actualizar(data).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarPlanilla();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistroPlanilla(planilla, confirm) {
    setSelectedDelete(planilla);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdCompania, IdPlanilla } = selectedDelete;
      await servicePlanilla.eliminar ({ IdCliente: IdCliente, IdCompania: IdCompania, IdPlanilla: IdPlanilla, IdUsuario: usuario.username }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarPlanilla();
    }
  }

  async function listarPlanilla() {
    setLoading(true);
    await servicePlanilla.listar(
      {
        IdCliente
        , IdCompania: varIdCompania
        , IdPlanilla: '%'
        , NumPagina: 0
        , TamPagina: 0
      }
    ).then(planillas => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(planillas)
      changeTabIndex(2);
      setModoEdicion(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerPlanilla(idCompania, idPlanilla) {
    setLoading(true);
    await servicePlanilla.obtener({
      IdCliente, IdCompania: idCompania, IdPlanilla: idPlanilla
    }).then(planillas => {
      planillas.PrimeraUltimaMarca = planillas.PrimeraUltimaMarca === "S" ? true : false;
      setDataRowEditNew({ ...planillas, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  /* async function obtenerPlanilla(filtro) {
    setLoading(true);
    const { IdCliente, idCompania, idPlanilla } = filtro;
    await obtenerPL({
      IdCliente,
      IdCompania: idCompania,
      IdPlanilla: idPlanilla
    }).then(planillas => {
      planillas.PrimeraUltimaMarca = planillas.PrimeraUltimaMarca === "S" ? true : false;
      setDataRowEditNew({ ...planillas, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  } */


  const nuevoRegistroPlanilla = () => {
    changeTabIndex(2);
    let planilla = { Activo: "S" };
    setDataRowEditNew({ ...planilla, Longitud: 0, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const editarRegistroPlanilla = dataRow => {
    changeTabIndex(2);
    const { IdCompania, IdPlanilla } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerPlanilla(IdCompania, IdPlanilla);

  };

  const cancelarEdicionPlanilla = () => {
    changeTabIndex(2);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const seleccionarRegistroPlanilla = dataRow => {
    const { IdCompania, IdPlanilla, RowIndex } = dataRow;
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    setFocusedRowKey(RowIndex);
  }

  // ::::::::::::::::::::::::::::: FUNCIONES JUSTIFICACION  :::::::::::::::::::::::::::::::::::::::::::::::::::::::::


  async function agregarJustificacion(datarow, selectedRowPlanilla, selectedRowDivision) {
    setLoading(true);
    const { IdJustificacion, Justificacion, OrigenExterno, AplicaFuturo, AplicaPorDia, AplicaPorHora, AplicarDiaDescanso, ConfigurarPorSemana,
      NumeroVecesPorSemana, ConfigurarPorDia, NumeroVecesPorDia, AplicarMaximoMinutos, MaximoMinutos, RequiereObservacion,
      CodigoReferencia, RequiereAutorizacion, Remunerado, Activo } = datarow;
    let data = {
      IdCliente
      , IdCompania: varIdCompania
      , IdJustificacion: isNotEmpty(IdJustificacion) ? IdJustificacion.toUpperCase() : ""
      , Justificacion: isNotEmpty(Justificacion) ? Justificacion.toUpperCase() : ""
      , Activo: Activo
      , Remunerado: Remunerado ? "S" : "N"
      , OrigenExterno: OrigenExterno ? "S" : "N"
      , AplicaFuturo: AplicaFuturo ? "S" : "N"
      , AplicaPorDia: AplicaPorDia ? "S" : "N"
      , AplicaPorHora: AplicaPorHora ? "S" : "N"
      , AplicarDiaDescanso: AplicarDiaDescanso ? "S" : "N"
      , ConfigurarPorSemana: ConfigurarPorSemana ? "S" : "N"
      , NumeroVecesPorSemana: ConfigurarPorSemana ? isNotEmpty(NumeroVecesPorSemana) ? NumeroVecesPorSemana : 0 : 0
      , ConfigurarPorDia: ConfigurarPorDia ? "S" : "N"
      , NumeroVecesPorDia: ConfigurarPorDia ? isNotEmpty(NumeroVecesPorDia) ? NumeroVecesPorDia : 0 : 0
      , AplicarMaximoMinutos: AplicarMaximoMinutos ? "S" : "N"
      , MaximoMinutos: AplicarMaximoMinutos ? isNotEmpty(MaximoMinutos) ? MaximoMinutos : 0.0 : 0.0
      , RequiereObservacion: RequiereObservacion ? "S" : "N"
      , CodigoReferencia: isNotEmpty(CodigoReferencia) ? CodigoReferencia.toUpperCase() : ""
      , RequiereAutorizacion: RequiereAutorizacion ? "S" : "N"
      , IdUsuario: usuario.username
      , ValidSave: 'S'
    };
    await crearJS(data).then(response => {
      agregarJustificacionPlanilla(data, selectedRowPlanilla);
      agregarJustificacionDivision(data, selectedRowDivision);
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      listarJustificacion();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarJustificacion(datarow, selectedRowPlanilla, selectedRowDivision) {
    setLoading(true);
    const { IdCompania, IdJustificacion, Justificacion, OrigenExterno, AplicaFuturo, AplicaPorDia, AplicaPorHora, AplicarDiaDescanso, ConfigurarPorSemana,
      NumeroVecesPorSemana, ConfigurarPorDia, NumeroVecesPorDia, AplicarMaximoMinutos, MaximoMinutos, RequiereObservacion,
      CodigoReferencia, RequiereAutorizacion, Remunerado, Activo } = datarow;
    let data = {
      IdCliente
      , IdCompania: isNotEmpty(IdCompania) ? IdCompania.toUpperCase() : ""
      , IdJustificacion: isNotEmpty(IdJustificacion) ? IdJustificacion.toUpperCase() : ""
      , Justificacion: isNotEmpty(Justificacion) ? Justificacion.toUpperCase() : ""
      , Activo: Activo
      , Remunerado: Remunerado ? "S" : "N"
      , OrigenExterno: OrigenExterno ? "S" : "N"
      , AplicaFuturo: AplicaFuturo ? "S" : "N"
      , AplicaPorDia: AplicaPorDia ? "S" : "N"
      , AplicaPorHora: AplicaPorHora ? "S" : "N"
      , AplicarDiaDescanso: AplicarDiaDescanso ? "S" : "N"
      , ConfigurarPorSemana: ConfigurarPorSemana ? "S" : "N"
      , NumeroVecesPorSemana: ConfigurarPorSemana ? isNotEmpty(NumeroVecesPorSemana) ? NumeroVecesPorSemana : 0 : 0
      , ConfigurarPorDia: ConfigurarPorDia ? "S" : "N"
      , NumeroVecesPorDia: ConfigurarPorDia ? isNotEmpty(NumeroVecesPorDia) ? NumeroVecesPorDia : 0 : 0
      , AplicarMaximoMinutos: AplicarMaximoMinutos ? "S" : "N"
      , MaximoMinutos: AplicarMaximoMinutos ? isNotEmpty(MaximoMinutos) ? MaximoMinutos : 0.0 : 0.0
      , RequiereObservacion: RequiereObservacion ? "S" : "N"
      , CodigoReferencia: isNotEmpty(CodigoReferencia) ? CodigoReferencia.toUpperCase() : ""
      , RequiereAutorizacion: RequiereAutorizacion ? "S" : "N"
      , IdUsuario: usuario.username
    };
    await actualizarJS(data).then(() => {
      agregarJustificacionPlanilla(datarow, selectedRowPlanilla);
      agregarJustificacionDivision(datarow, selectedRowDivision);
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarJustificacion();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function agregarJustificacionPlanilla(datarow, selectedRowPlanilla) {
    try {
      const { IdCliente, IdCompania, IdJustificacion } = datarow;

      await eliminarJP({ IdCliente: IdCliente, IdCompania: IdCompania, IdJustificacion: IdJustificacion, IdPlanilla: '%' }).then(response => { }).catch(err => { }).finally();

      setTimeout(function () {

        if (selectedRowPlanilla.length > 0) {
          selectedRowPlanilla.map(async (data) => {
            const { IdPlanilla } = data;
            let params = {
              IdCliente: IdCliente,
              IdCompania: IdCompania,
              IdJustificacion: IdJustificacion,
              IdPlanilla: IdPlanilla,
              Activo: 'S',
              IdUsuario: usuario.username
            };
            await crearJP(params)
              .then((response) => { })
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


  async function agregarJustificacionDivision(datarow, selectedRowDivision) {
    //console.log("selectedRowDivision:",selectedRowDivision);
    try {
      setLoading(true);
      const { IdCliente, IdCompania, IdJustificacion, IdDivision } = datarow;
      //console.log("datarow:",datarow);
      if (selectedRowDivision != undefined) {
        await eliminarDIV({ IdCliente: IdCliente, IdCompania: IdCompania, IdJustificacion: IdJustificacion, IdDivision: "%" }).then(response => { }).catch(err => { }).finally();
      }

      setTimeout(function () {

        if (selectedRowDivision != undefined) {

          if (selectedRowDivision.length > 0) {
            selectedRowDivision.map(async (data) => {
              const { IdDivision } = data;
              if (isNotEmpty(IdDivision)) {
                let params = {
                  IdCliente: IdCliente,
                  IdCompania: IdCompania,
                  IdJustificacion: IdJustificacion,
                  IdDivision: IdDivision,
                  Activo: 'S',
                  IdUsuario: usuario.username
                };
                await crearDIV(params).catch((err) => {
                  handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
                });
              }
            });
          }

        }


      }, 500);

    } catch (err) {
      setLoading(false);
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }
    setLoading(false);
  }

  async function eliminarRegistroJustificacion(justificaicon, confirm) {
    setSelectedDelete(justificaicon);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdCompania, IdJustificacion } = selectedDelete;
      await eliminarJS({ IdCliente: IdCliente, IdCompania: IdCompania, IdJustificacion: IdJustificacion, IdUsuario: usuario.username }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarJustificacion();
    }
  }

  async function listarJustificacion() {
    setLoading(true);
    await listarJS(
      {
        IdCliente
        , IdCompania: varIdCompania
        , IdJustificacion: '%'
        , NumPagina: 0
        , TamPagina: 0
      }
    ).then(justificaciones => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(justificaciones)
      changeTabIndex(3);
      setModoEdicion(false);

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerJustificacion(idCompania, idJustificacion) {
    setLoading(true);
    await obtenerJS({ IdCliente, IdCompania: idCompania, IdJustificacion: idJustificacion }).then(response => {
      //Pendiente convertir
      response.OrigenExterno = response.OrigenExterno === 'S' ? true : false;
      response.AplicaFuturo = response.AplicaFuturo === 'S' ? true : false;
      response.AplicaPorDia = response.AplicaPorDia === 'S' ? true : false;
      response.AplicaPorHora = response.AplicaPorHora === 'S' ? true : false;
      response.AplicarDiaDescanso = response.AplicarDiaDescanso === 'S' ? true : false;
      response.Remunerado = response.Remunerado === 'S' ? true : false;
      response.ConfigurarPorSemana = response.ConfigurarPorSemana === 'S' ? true : false;
      response.ConfigurarPorDia = response.ConfigurarPorDia === 'S' ? true : false;
      response.AplicarMaximoMinutos = response.AplicarMaximoMinutos === 'S' ? true : false;
      response.RequiereObservacion = response.RequiereObservacion === 'S' ? true : false;
      response.RequiereAutorizacion = response.RequiereAutorizacion === 'S' ? true : false;
      setDataRowEditNew({ ...response, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  const nuevoRegistroJustificacion = () => {
    changeTabIndex(3);
    let justificaicon = { Activo: "S" };
    setDataRowEditNew({
      ...justificaicon, Longitud: 0, esNuevoRegistro: true, OrigenExterno: false, AplicaFuturo: false,
      ConfigurarPorSemana: false, ConfigurarPorDia: false, AplicarMaximoMinutos: false, RequiereObservacion: false, Remunerado: false,
      AplicaPorDia: false, AplicaPorHora: false
    });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    let dataRow = {
      IdCliente: IdCliente,
      IdCompania: varIdCompania,
      IdJustificacion: "%",
    };
    listarTabPlanillas('NUEVO', dataRow);
    listarTabDivisiones('NUEVO', dataRow);
  };

  const editarRegistroJustificacion = async (dataRow) => {
    changeTabIndex(3);
    const { IdCompania, IdJustificacion } = dataRow;
    obtenerJustificacion(IdCompania, IdJustificacion);
    listarTabPlanillas('ACTUALIZAR', dataRow);
    listarTabDivisiones('ACTUALIZAR', dataRow);
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));

  };

  async function listarTabPlanillas(Accion, dataRow) {
    const { IdCliente, IdCompania, IdJustificacion } = dataRow;
    // console.log("listarPlanillas| props.dataRowEditNew:", props.dataRowEditNew);

    let data = await listarAsignados({ Accion: Accion, IdCliente: IdCliente, IdCompania: IdCompania, IdJustificacion: isNotEmpty(IdJustificacion) ? IdJustificacion : "%" });
    setDataPlanilla(data);
    // console.log("listarTabPlanillas|data:",data);
    if (data.length === 0) {
      setIsVisibleAlert(true);
    } else {
      setIsVisibleAlert(false);
    }

  }

  async function listarTabDivisiones(Accion, dataRow) {
    //console.log("listarTabDivisiones", dataRow);
    const { IdCliente, IdJustificacion, IdCompania } = dataRow;
    await listarTreeview({
      Accion: Accion,
      IdCliente: IdCliente,
      IdDivision: '%',
      IdJustificacion: isNotEmpty(IdJustificacion) ? IdJustificacion : "%",
      IdCompania: varIdCompania
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
        // seleccionarNodo([],dataTreeView)
      }
    }).catch(err => {
    }).finally();

  }

  const cancelarEdicionJustificacion = () => {
    changeTabIndex(3);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const seleccionarJustificacion = dataRow => {
    const { IdCompania, IdJustificacion, RowIndex } = dataRow;
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    setFocusedRowKeyJustificacion(RowIndex);
  }

  async function importarJustificaciones(listJustificaciones) {
    //  console.log("importarJustificaciones|listJustificaciones|dataRow:",listJustificaciones);
    try {

      setTimeout(function () {

        if (listJustificaciones.length > 0) {
          listJustificaciones.map(async (data) => {
            const { IdJustificacion, Justificacion, OrigenExterno, AplicaFuturo, AplicaPorDia, AplicaPorHora, AplicarDiaDescanso, ConfigurarPorSemana, NumeroVecesPorSemana,
              ConfigurarPorDia, NumeroVecesPorDia, AplicarMaximoMinutos, MaximoMinutos, RequiereObservacion,
              CodigoReferencia, Remunerado, RequiereAutorizacion, Activo } = data;

            let params = {
              IdCliente: IdCliente
              , IdCompania: varIdCompania
              , IdJustificacion: isNotEmpty(IdJustificacion) ? IdJustificacion.toUpperCase() : ""
              , Justificacion: isNotEmpty(Justificacion) ? Justificacion.toUpperCase() : ""
              , Activo: Activo
              , Remunerado: Remunerado
              , OrigenExterno: OrigenExterno ? "S" : "N"
              , AplicaFuturo: AplicaFuturo ? "S" : "N"
              , AplicaPorDia: AplicaPorDia ? "S" : "N"
              , AplicaPorHora: AplicaPorHora ? "S" : "N"
              , AplicarDiaDescanso: AplicarDiaDescanso ? "S" : "N"
              , ConfigurarPorSemana: ConfigurarPorSemana ? "S" : "N"
              , NumeroVecesPorSemana: ConfigurarPorSemana ? isNotEmpty(NumeroVecesPorSemana) ? NumeroVecesPorSemana : 0 : 0
              , ConfigurarPorDia: ConfigurarPorDia ? "S" : "N"
              , NumeroVecesPorDia: ConfigurarPorDia ? isNotEmpty(NumeroVecesPorDia) ? NumeroVecesPorDia : 0 : 0
              , AplicarMaximoMinutos: AplicarMaximoMinutos ? "S" : "N"
              , MaximoMinutos: AplicarMaximoMinutos ? isNotEmpty(MaximoMinutos) ? MaximoMinutos : 0.0 : 0.0
              , RequiereObservacion: RequiereObservacion ? "S" : "N"
              , CodigoReferencia: isNotEmpty(CodigoReferencia) ? CodigoReferencia.toUpperCase() : ""
              , RequiereAutorizacion: RequiereAutorizacion ? "S" : "N"
              , IdUsuario: usuario.username
              , ValidSave: 'N'
            };
            await crearJS(params)
              .then((response) => {
                // handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.IMPORT" }));
                listarJustificacion();
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

  // ::::::::::::::::::::::::::::: FUNCIONES CONDICION ESPECIAL  :::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarCondicionEspecial(datarow) {
    setLoading(true);
    const { IdCompania, IdCondicionEspecial, CondicionEspecial, DerechoLaboral, Descripcion, NombreProcedimiento, Activo } = datarow;
    let data = {
      IdCliente: IdCliente
      , IdCompania: varIdCompania
      , IdCondicionEspecial: isNotEmpty(IdCondicionEspecial) ? IdCondicionEspecial.toUpperCase() : ""
      , CondicionEspecial: isNotEmpty(CondicionEspecial) ? CondicionEspecial.toUpperCase() : ""
      , DerechoLaboral: isNotEmpty(DerechoLaboral) ? DerechoLaboral.toUpperCase() : ""
      , Descripcion: isNotEmpty(Descripcion) ? Descripcion.toUpperCase() : ""
      , NombreProcedimiento: isNotEmpty(NombreProcedimiento) ? NombreProcedimiento.toUpperCase() : ""
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await crearCE(data).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      listarCondicionEspecial();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarCondicionEspecial(datarow) {
    setLoading(true);
    const { IdCliente, IdCompania, IdCondicionEspecial, CondicionEspecial, DerechoLaboral, Descripcion, NombreProcedimiento, Activo } = datarow;
    let data = {
      IdCliente: IdCliente
      , IdCompania: isNotEmpty(IdCompania) ? IdCompania.toUpperCase() : ""
      , IdCondicionEspecial: isNotEmpty(IdCondicionEspecial) ? IdCondicionEspecial.toUpperCase() : ""
      , CondicionEspecial: isNotEmpty(CondicionEspecial) ? CondicionEspecial.toUpperCase() : ""
      , DerechoLaboral: isNotEmpty(DerechoLaboral) ? DerechoLaboral.toUpperCase() : ""
      , Descripcion: isNotEmpty(Descripcion) ? Descripcion.toUpperCase() : ""
      , NombreProcedimiento: isNotEmpty(NombreProcedimiento) ? NombreProcedimiento.toUpperCase() : ""
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await actualizarCE(data).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarCondicionEspecial();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistroCondicionEspecial(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdCompania, IdCondicionEspecial } = selectedDelete;
      await eliminarCE({ IdCliente: IdCliente, IdCompania: IdCompania, IdCondicionEspecial: IdCondicionEspecial, IdUsuario: usuario.username }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarCondicionEspecial();
    }
  }

  async function listarCondicionEspecial() {
    setLoading(true);
    await listarCE(
      {
        IdCliente
        , IdCompania: varIdCompania
        , IdCondicionEspecial: '%'
        , NumPagina: 0
        , TamPagina: 0
      }
    ).then(data => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(data);
      changeTabIndex(4);
      setModoEdicion(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerCondicionEspecial(idCompania, IdCondicionEspecial) {
    setLoading(true);
    await obtenerCE({ IdCliente, IdCompania: idCompania, IdCondicionEspecial: IdCondicionEspecial }).then(data => {
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const nuevoRegistroCondicionEspecial = () => {
    changeTabIndex(4);
    let data = { Activo: "S" };
    setDataRowEditNew({ ...data, Longitud: 0, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const editarRegistroCondicionEspecial = async (dataRow) => {
    changeTabIndex(4);
    const { IdCompania, IdCondicionEspecial } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerCondicionEspecial(IdCompania, IdCondicionEspecial);

  };

  const cancelarEdicionCondicionEspecial = () => {
    changeTabIndex(4);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const seleccionarCondicionEspecial = dataRow => {
    const { IdCompania, IdCondicionEspecial, RowIndex } = dataRow;
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    setFocusedRowKeyCondicionEspecial(RowIndex);
  }


  /************--Configuración de acceso de botones*************/
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    setAccessButton({ ...accessButton, ...buttonsPermissions });
  }
  /***********************************************************************/

  useEffect(() => {
    loadControlsPermission();
  }, []);

  //::::::::::::::::::::::::::::::::::::::::::::::::: Datos Principales ::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const goTabMenu = () => {
    //Leer localStoreage.
    let dataRow = JSON.parse(localStorage.getItem('dataRowAplication'));
    if (isNotEmpty(dataRow)) {
      const { IdAplicacion, IdModulo } = dataRow;
      setVarIdAplicacion(IdAplicacion);
      setVarIdModulo(IdModulo);
    }

  }

  const getInfo = () => {

    const { IdCompania, Compania } = selected;
    return [

      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdCompania, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" })], value: Compania, colSpan: 4 }

    ];
  }

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  async function eliminarListRowTab(rowData, confirm) {
    let currentTab = tabIndex;
    // console.log("eliminarListRowTab|currentTab:",currentTab);
    switch (currentTab) {
      case 0:
        eliminarRegistro(rowData, confirm)
        break;
      case 2:
        eliminarRegistroPlanilla(rowData, confirm)
        break;
      case 3:
        eliminarRegistroJustificacion(rowData, confirm);
        break;
      case 4:
        eliminarRegistroCondicionEspecial(rowData, confirm);
        break;
    }
  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::-Configuración - Tabs::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


  const tabContent_CompaniaListPage = () => {
    return <>
      <CompaniaListPage
        titulo={titulo}
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
        setVarIdCompania={setVarIdCompania}
        totalRowIndex = {totalRowIndex}
        setTotalRowIndex={setTotalRowIndex}
      //::::::::::::::::::::::::::::::::::::::::
      />
    </>
  }

  const tabContent_CompaniaEditPage = () => {
    return <>
      <CompaniaEditPage
        titulo={titulo}
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        agregarCompania={agregarCompania}
        actualizarCompania={actualizarCompania}
        cancelarEdicion={cancelarEdicion}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}

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

  const tabContent_CompaniaPlanillaListPage = () => {
    return <>
      {modoEdicion && (
        <>
          <PlanillaEditPage
            modoEdicion={modoEdicion}
            dataRowEditNew={dataRowEditNew}
            actualizarPlanilla={actualizarPlanilla}
            agregarPlanilla={agregarPlanilla}
            cancelarEdicion={cancelarEdicionPlanilla}
            titulo={titulo}
            accessButton={accessButton}
            settingDataField={dataMenu.datos}
            getInfo={getInfo}

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
          <PlanillaListPage
            planillas={listarTabs}
            editarRegistro={editarRegistroPlanilla}
            eliminarRegistro={eliminarRegistroPlanilla}
            nuevoRegistro={nuevoRegistroPlanilla}
            seleccionarRegistro={seleccionarRegistroPlanilla}
            focusedRowKey={focusedRowKey}
            accessButton={accessButton}
            getInfo={getInfo}
            cancelarEdicion={cancelarEdicion}
          />
        </>
      )}
    </>
  }


  const tabContent_CompaniaJustificacionListPage = () => {
    return <>
      {modoEdicion && (
        <>
          <JustificacionEditPage
            dataRowEditNew={dataRowEditNew}
            actualizarJustificacion={actualizarJustificacion}
            agregarJustificacion={agregarJustificacion}
            cancelarEdicion={cancelarEdicionJustificacion}
            titulo={titulo}
            modoEdicion={modoEdicion}
            settingDataField={dataMenu.datos}
            accessButton={accessButton}
            getInfo={getInfo}
            dataPlanilla={dataPlanilla}
            unidadOrganizativaTreeView={unidadOrganizativaTreeView}
            isVisibleAlert={isVisibleAlert}

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
          <JustificacionListPage
            justificaciones={listarTabs}
            seleccionarRegistro={seleccionarJustificacion}
            editarRegistro={editarRegistroJustificacion}
            eliminarRegistro={eliminarRegistroJustificacion}
            nuevoRegistro={nuevoRegistroJustificacion}
            getInfo={getInfo}
            accessButton={accessButton}
            focusedRowKey={focusedRowKeyJustificacion}
            cancelarEdicion={cancelarEdicion}
            selected={selected}
            dataRowEditNew={dataRowEditNew}
            importarJustificaciones={importarJustificaciones}

          />
        </>
      )}
    </>
  }

  const tabContent_CompaniaCondicionEspecialListPage = () => {
    return <>
      {modoEdicion && (
        <>
          <CondicionEspecialEditPage
            dataRowEditNew={dataRowEditNew}
            actualizarCondicionEspecial={actualizarCondicionEspecial}
            agregarCondicionEspecial={agregarCondicionEspecial}
            cancelarEdicion={cancelarEdicionCondicionEspecial}
            titulo={titulo}
            modoEdicion={modoEdicion}
            settingDataField={dataMenu.datos}
            accessButton={accessButton}
            getInfo={getInfo}
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
          <CondicionEspecialListPage
            condicionEspecial={listarTabs}
            seleccionarRegistro={seleccionarCondicionEspecial}
            editarRegistro={editarRegistroCondicionEspecial}
            eliminarRegistro={eliminarRegistroCondicionEspecial}
            nuevoRegistro={nuevoRegistroCondicionEspecial}
            getInfo={getInfo}
            accessButton={accessButton}
            focusedRowKey={focusedRowKeyCondicionEspecial}
            cancelarEdicion={cancelarEdicion}

          />
        </>
      )}
    </>
  }

  const tabContent_CompaniaHorarioListPage = () => {
    return <>

      <HorarioIndexPage
        varIdCompania={varIdCompania}
        moduloCompania={selected}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
      />

    </>
  }

  const tabContent_TipoAutorizacionCompaniaListPage = () => {
    return <>

      <TipoAutorizacionCompaniaIndex
        varIdCompania={varIdCompania}
        moduloCompania={selected}
        cancelarEdicionPrincipal={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
      />

    </>
  }

  const tabContent_BonoNocturnoListPage = () => {
    return <>

      <BonoNocturnoIndexPage
        varIdCompania={varIdCompania}
        moduloCompania={selected}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
      />

    </>
  }


  const tabContent_CuponeraListPage = () => {
    return <>

      <CuponeraIndexPage
        varIdCompania={varIdCompania}
        moduloCompania={selected}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        varIdModulo={varIdModulo}
        varIdAplicacion={varIdAplicacion}
      />

    </>
  }

  const tabContent_GrupoListPage = () => {
    return <>
      <GrupoIndexPage
        varIdCompania={varIdCompania}
        moduloCompania={selected}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        idModulo= {dataMenu.info.IdModulo}
      />
    </>
  }





  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return <>
    <input type="hidden" value={varIdCompania} id="hIdCompania" name="hidIdPersona" />

    <TabNavContainer
      title={intl.formatMessage({ id: "ASSISTANCE.SPECIAL.CONDITIONS.ASSISTANCE" })}
      submenu={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}
      subtitle=''
      nombrebarra={titleHeaderToolbar()}
      tabIndex={tabIndex}
      handleChange={handleChange}
      componentTabsHeaders={[
        {
          label: intl.formatMessage({ id: "ACTION.LIST" }),
          icon: <FormatListNumberedIcon fontSize="large" />,
          disabled: false,
        },
        {
          label: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }),
          icon: <BusinessIcon fontSize="large" />,
          onClick: () => { obtenerCompania(varIdCompania) },
          disabled: !tabsDisabled() && accessButton.Tabs[1] ? false : true
        },
        {
          label: intl.formatMessage({ id: "ASSISTANCE.PAYROLL" }),
          icon: <FeaturedPlayListIcon fontSize="large" />,
          onClick: () => { listarPlanilla() },
          disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
        },
        {
          label: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION" }),
          icon: <DateRange fontSize="large" />,
          onClick: () => { listarJustificacion() },
          disabled: !tabsDisabled() && accessButton.Tabs[3] ? false : true
        },
        {
          label: intl.formatMessage({ id: "ASSISTANCE.SPECIAL.CONDITIONS" }),
          icon: <FormatIndentIncrease fontSize="large" />,
          onClick: () => { listarCondicionEspecial() },
          disabled: !tabsDisabled() && accessButton.Tabs[4] ? false : true
        },
        {
          label: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.TAB" }),
          icon: <EventAvailableIcon fontSize="large" />,
          disabled: !tabsDisabled() && accessButton.Tabs[5] ? false : true
        },
        {
          label: intl.formatMessage({ id: "ASSISTANCE.AUTHORIZATION.TYPE.TAB" }),
          icon: <PlaylistAddCheck fontSize="large" />,
          disabled: !tabsDisabled() && accessButton.Tabs[6] ? false : true
        },
        {
          label: intl.formatMessage({ id: "ASSISTANCE.NIGHT.BONUS.TAB" }),
          icon: <LocalAtmIcon fontSize="large" />,
          disabled: !tabsDisabled() && accessButton.Tabs[7] ? false : true
        },
        {
          label: intl.formatMessage({ id: "ASSISTANCE.COUPON.TAB" }),
          icon: <AspectRatioIcon fontSize="large" />,
          onClick: () => { goTabMenu() },
          disabled: !tabsDisabled() && accessButton.Tabs[8] ? false : true
        },
        {
          label: intl.formatMessage({ id: "ACCESS.PERSON.GRUPOS" }),
          icon: <GroupWorkSharpIcon fontSize="large" />,
          onClick: () => { goTabMenu() },
          disabled: !tabsDisabled() && accessButton.Tabs[9] ? false : true
        },

      ]}
      className={classes.tabContent}
      componentTabsBody={
        [
          tabContent_CompaniaListPage(),
          tabContent_CompaniaEditPage(),
          tabContent_CompaniaPlanillaListPage(),
          tabContent_CompaniaJustificacionListPage(),
          tabContent_CompaniaCondicionEspecialListPage(),
          tabContent_CompaniaHorarioListPage(),
          tabContent_TipoAutorizacionCompaniaListPage(),
          tabContent_BonoNocturnoListPage(),
          tabContent_CuponeraListPage(),
          tabContent_GrupoListPage(),
        ]
      }

    />

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

  </>

};

export default injectIntl(WithLoandingPanel(CompaniaIndexPage));
