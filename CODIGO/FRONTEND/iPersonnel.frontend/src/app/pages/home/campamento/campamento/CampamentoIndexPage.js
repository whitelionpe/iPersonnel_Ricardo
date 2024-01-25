import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleInfoMessages, handleSuccessMessages, handleWarningMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import { useSelector } from "react-redux";
import { isNotEmpty, dateFormat, base64ToArrayBuffer, saveByteArray } from "../../../../../_metronic";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

import { eliminar, obtener, listar, crear, actualizar, exportarExcel } from "../../../../api/campamento/campamento.api";
import CampamentoListPage from "./CampamentoListPage";
import CampamentoEditPage from "./CampamentoEditPage";

import {
  eliminar as eliminarCampModulo, obtener as obtenerCampModulo, listar as listarCampModulo, crear as crearCampModulo, actualizar as actualizarCampModulo, exportarExcel as exportarModuloExcel
} from "../../../../api/campamento/modulo.api";
import ModuloListPage from "../modulo/ModuloListPage";
import ModuloEditPage from "../modulo/ModuloEditPage";

import {
  eliminar as eliminarCampHabitacion, obtener as obtenerCampHabitacion, listar as listarCampHabitacion, crear as crearCampHabitacion, actualizar as actualizarCampHabitacion, exportarExcel as exportarHabitacionExcel
} from "../../../../api/campamento/habitacion.api";
import HabitacionListPage from "../habitacion/HabitacionListPage";
import HabitacionEditPage from "../habitacion/HabitacionEditPage";

import { obtener as obtenerHabServicio, crear as crearHabServicio, actualizar as actualizarHabServicio, eliminar as eliminarHabServicio } from "../../../../api/campamento/habitacionServicio.api";
import HabitacionServicioEditPage from "../habitacionServicio/HabitacionServicioEditPage";

import {
  eliminar as eliminarHabCama, obtener as obtenerHabCama, listar as listarHabCama, crear as crearHabCama, actualizar as actualizarHabCama
} from "../../../../api/campamento/habitacionCama.api";
import HabitacionCamaListPage from "../habitacionCama/HabitacionCamaListPage";
import HabitacionCamaEditPage from "../habitacionCama/HabitacionCamaEditPage";

import EquipoIndexPage from "../equipo/EquipoIndexPage";

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import LocalConvenienceStoreIcon from '@material-ui/icons/LocalConvenienceStore';
import ApartmentIcon from '@material-ui/icons/Apartment';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import LocalHotelIcon from '@material-ui/icons/LocalHotel';
import PersonIcon from '@material-ui/icons/Person';
import KitchenIcon from '@material-ui/icons/Kitchen';

//:::::::   Administrador   ::::::::::::::::::::::::::::::::::::::::::::
import {
  eliminar as eliminarAdministrador, obtener as obtenerAdministrador, listar as listarAdministrador, crear as crearAdministrador, actualizar as actualizarAdministrador
} from "../../../../api/campamento/administrador.api";

import AdministradorEditPage from "../administrador/AdministradorEditPage";
import AdministradorListPage from "../administrador/AdministradorListPage";
import AdministracionPersonaBuscar from "../../../../partials/components/AdministracionPersonaBuscar";
import CampamentoTreeViewPage from "./CampamentoTreeviewPage";
import ModuloTreeviewPage from "../modulo/ModuloTreeviewPage";
import HabitacionTreeviewPage from "../habitacion/HabitacionTreeviewPage";
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

const CampamentoIndexPage = ({ intl, setLoading, dataMenu }) => {
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  const IndexTab = { Listado: 0, Hoteles: 1, Modulo: 2, Habitacion: 3, Cama: 4, Equipo: 5 };
  const [varIdCampamento, setVarIdCampamento] = useState("");
  const [varIdModulo, setVarIdModulo] = useState("");
  const [varIdHabitacion, setVarIdHabitacion] = useState("");
  const [varIdCama, setVarIdCama] = useState("");

  const [focusedRowKey, setFocusedRowKey] = useState();
  const [focusedRowKeyModulo, setFocusedRowKeyModulo] = useState();
  const [focusedRowKeyHabitacion, setFocusedRowKeyHabitacion] = useState();

  const [campamentos, setCampamentos] = useState([]);

  // const [modulos, setModulos] = useState([]);
  //Datos principales
  const [selected, setSelected] = useState({});

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [modoEdicionTabs, setModoEdicionTabs] = useState(false);
  const [dataRowEditNewTabs, setDataRowEditNewTabs] = useState({});
  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [listarTabs, setListarTabs] = useState([]);

  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);
  const [isVisiblePopUpPersonas, setisVisiblePopUpPersonas] = useState(false);
  const [isVisiblePopup, setIsVisiblePopup] = useState(false);
  const [isVisiblePopupModulo, setIsVisiblePopupModulo] = useState(false);
  const [isVisiblePopupHabitacion, setIsVisiblePopupHabitacion] = useState(false);
  const [cambiaIndexHabitacion, setCambiaIndexHabitacion] = useState(0);
  const [cambiaIndexCama, setCambiaIndexCama] = useState(0);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

  const [collapsed, setCollapsed] = useState(false);
  const [expandRow, setExpandRow] = useState(0);

  const [modoEdicionDetalle, setModoEdicionDetalle] = useState(false);
  const [dataRowEditNewDetalle, setDataRowEditNewDetalle] = useState({});



  //::::::::::::::::::::::::::::FUNCIONES PARA CAMPAMENTO-:::::::::::::::::::::::::::::::::::

  async function agregarCampamento(data) {
    setLoading(true);
    const { IdCampamento, Campamento, LiberarReserva, DiasLiberarReserva, DiasPermanencia, HoraCheckOut, IdZona, Activo } = data;
    let param = {
      IdCliente,
      IdDivision,
      IdCampamento: isNotEmpty(IdCampamento) ? IdCampamento.toUpperCase() : "",
      Campamento: isNotEmpty(Campamento) ? Campamento.toUpperCase() : "",
      LiberarReserva: LiberarReserva ? "S" : "N",
      DiasLiberarReserva: isNotEmpty(DiasLiberarReserva) ? DiasLiberarReserva : 0,
      DiasPermanencia: isNotEmpty(DiasPermanencia) ? DiasPermanencia : 0,
      HoraCheckOut: isNotEmpty(HoraCheckOut) ? dateFormat(HoraCheckOut, "hh:mm") : "",
      IdZona: isNotEmpty(IdZona) ? IdZona.toUpperCase() : "",
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await crear(param)
      .then(response => {
        if (response) {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
          setModoEdicion(false);
          listarCampamentos();
          setTabIndex(0);
        }

      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }


  async function actualizarCampamento(campamento) {
    setLoading(true);
    const { IdCampamento, Campamento, LiberarReserva, DiasLiberarReserva, DiasPermanencia, HoraCheckOut, IdZona, Activo } = campamento;
    let params = {
      IdCliente,
      IdDivision,
      IdCampamento: isNotEmpty(IdCampamento) ? IdCampamento.toUpperCase() : "",
      Campamento: isNotEmpty(Campamento) ? Campamento.toUpperCase() : "",
      LiberarReserva: LiberarReserva ? "S" : "N",
      DiasLiberarReserva: isNotEmpty(DiasLiberarReserva) ? DiasLiberarReserva : 0,
      DiasPermanencia: isNotEmpty(DiasPermanencia) ? DiasPermanencia : 0,
      HoraCheckOut: isNotEmpty(HoraCheckOut) ? dateFormat(HoraCheckOut, "hh:mm") : "",
      IdZona: isNotEmpty(IdZona) ? IdZona.toUpperCase() : "",
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await actualizar(params)
      .then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        setModoEdicion(false);
        listarCampamentos();
        setTabIndex(0);
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }


  async function eliminarRegistro(campamento, confirm) {
    setSelected(campamento);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdDivision, IdCampamento } = campamento;
      await eliminar({
        IdCliente,
        IdDivision,
        IdCampamento,
        IdUsuario: usuario.username
      })
        .then(response => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
      listarCampamentos();
    }
  }

  async function listarCampamentos() {
    setLoading(true);

    await listar({
      IdCliente,
      IdDivision,
      IdUsuario: usuario.username,
      NumPagina: 0,
      TamPagina: 0
    }).then(campamentos => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setCampamentos(campamentos);
      disabledDynamicTabs(IndexTab.Listado);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerCampamento() {
    const { IdCliente, IdDivision, IdCampamento } = selected;

    setLoading(true);
    await obtener({ IdCliente, IdDivision, IdCampamento })
      .then(campamento => {
        campamento.LiberarReserva = campamento.LiberarReserva === "S" ? true : false;

        setDataRowEditNew({ ...campamento, esNuevoRegistro: false });
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }


  const nuevoRegistro = () => {
    changeTabIndex(IndexTab.Hoteles);
    var dateTimeMidDay = new Date(Date.parse("03/01/2022 12:00"))
    let campamento = {
      Activo: "S",
      FechaRegistro: new Date().toJSON().slice(0, 10),
      DiasLiberarReserva: 1,
      DiasPermanencia: 15,
      HoraCheckOut: dateTimeMidDay // dateFormat(dateTime, "hh:mm")

    };
    setDataRowEditNew({ ...campamento, esNuevoRegistro: true, IdUsuario: usuario.username });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setVarIdCampamento("");

  };

  const editarRegistro = dataRow => {
    changeTabIndex(IndexTab.Hoteles);
    //const { IdCampamento } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    //setVarIdCampamento(IdCampamento);
    obtenerCampamento(dataRow);
  };

  const cancelarEdicion = () => {
    // if (modoEdicion) {
    //   changeTabIndex(IndexTab.Hoteles);
    //   setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    //   setModoEdicion(false);
    // } else {
      changeTabIndex(IndexTab.Listado);
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      disabledDynamicTabs(IndexTab.Listado);
      setDataRowEditNew({});
      setDataRowEditNewTabs({});
   // }
  };

  const seleccionarRegistro = dataRow => {
    const { IdCampamento, RowIndex } = dataRow;
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    setVarIdCampamento(IdCampamento);
    setFocusedRowKey(RowIndex);
    setModoEdicion(false);
    //Datos Principales
    setSelected(dataRow);
    disabledDynamicTabs(IndexTab.Hoteles);

  }

  const verRegistroCampamentoDblClick = async (dataRow) => {
    changeTabIndex(IndexTab.Hoteles);
    setModoEdicion(false);
    await obtenerCampamento(dataRow);
  };

  const listarCampamentoTreeView = () => {
    if (selected.IdCampamento === undefined) return;
    setIsVisiblePopup(true);
  }

  const exportExcel = async () => {
    const { IdDivision, IdCampamento, Campamento } = selected;
    const param = {
      IdDivision,
      IdCampamento,
      Campamento
    };
    setLoading(true);
    try {
      const response = await exportarExcel(param);
      if (response) {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.DOWNLOAD.SUCESS" }));
        const { fileName, fileBase64 } = response;
        var base64String = base64ToArrayBuffer(fileBase64);
        saveByteArray(fileName, base64String, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,");
      }
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadControlsPermission();
    listarCampamentos();
  }, []);

  //::::::::::::::::::::::FUNCION CAMPAMENTO MÓDULO:::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarCampamentoModulo(dataCampamentoModulo) {
    setLoading(true);
    const { IdCampamento, IdModulo, Modulo, IdTipoModulo, Activo } = dataCampamentoModulo;
    let params = {
      IdCampamento: varIdCampamento
      , IdModulo: isNotEmpty(IdModulo) ? IdModulo.toUpperCase() : ""
      , Modulo: isNotEmpty(Modulo) ? Modulo.toUpperCase() : ""
      , IdTipoModulo: isNotEmpty(IdTipoModulo) ? IdTipoModulo.toUpperCase() : ""
      , Activo
      , IdCliente
      , IdDivision
      , IdUsuario: usuario.username
    };
    await crearCampModulo(params).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarCampamentoModulo();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function actualizarCampamentoModulo(campamentoModulo) {
    setLoading(true);
    const { IdCampamento, IdModulo, Modulo, IdTipoModulo, Activo } = campamentoModulo;
    let params = {
      IdCampamento: varIdCampamento
      , IdModulo: isNotEmpty(IdModulo) ? IdModulo.toUpperCase() : ""
      , Modulo: isNotEmpty(Modulo) ? Modulo.toUpperCase() : ""
      , IdTipoModulo: isNotEmpty(IdTipoModulo) ? IdTipoModulo.toUpperCase() : ""
      , Activo
      , IdCliente
      , IdDivision
      , IdUsuario: usuario.username
    };
    await actualizarCampModulo(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarCampamentoModulo();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function eliminarRegistroCampamentoModulo(campamentoModulo, confirm) {
    setSelected(campamentoModulo);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCampamento, IdModulo, IdCliente, IdDivision } = campamentoModulo;
      await eliminarCampModulo({
        IdCampamento: IdCampamento,
        IdModulo: IdModulo,
        IdCliente: IdCliente,
        IdDivision: IdDivision,
        IdUsuario: usuario.username
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarCampamentoModulo();
    }
  }

  async function listarCampamentoModulo() {
    setLoading(true);
    setListarTabs([]);
    await listarCampModulo({
      IdCampamento: varIdCampamento,
      IdCliente,
      IdDivision,
      NumPagina: 0, TamPagina: 0
    }).then(campamentosModulo => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(campamentosModulo);
      changeTabIndex(IndexTab.Modulo);
      disabledTabs(true);
      setModoEdicionTabs(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function obtenerCampamentoModulo(filtro) {
    setLoading(true);
    const { IdCampamento, IdModulo, IdCliente, IdDivision } = filtro;
    await obtenerCampModulo({
      IdCampamento: IdCampamento,
      IdModulo: IdModulo,
      IdCliente: IdCliente,
      IdDivision: IdDivision
    }).then(campamentoModulos => {
      setDataRowEditNewTabs({ ...campamentoModulos, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    })
      .finally(() => { setLoading(false); });
  }


  const editarRegistroCampamentoModulo = dataRow => {
    setModoEdicionTabs(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerCampamentoModulo(dataRow);
  };


  const nuevoCampamentoModulo = () => {
    let nuevo = { Activo: "S", HoraInicio: "00:00", HoraFin: "00:00" };
    setDataRowEditNewTabs({ ...nuevo, esNuevoRegistro: true });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicionTabs(true);
  };


  const seleccionarRegistroModulo = dataRow => {
    const { IdModulo } = dataRow;
    setVarIdModulo(IdModulo);
    setFocusedRowKeyModulo(IdModulo);
    disabledTabs(false);
    setModoEdicion(false);
    //Datos Principales
    setSelected(dataRow);
    disabledDynamicTabs(IndexTab.Modulo);
  }

  const listarModuloTreeView = () => {
    if (selected.IdModulo === undefined) return;
    setIsVisiblePopupModulo(true);
  }

  const exportModuloExcel = async () => {
    const { IdDivision, IdCampamento, IdModulo, Modulo } = selected;
    const param = {
      IdDivision,
      IdCampamento,
      IdModulo,
      Modulo
    };
    setLoading(true);
    try {
      const response = await exportarModuloExcel(param);
      if (response) {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.DOWNLOAD.SUCESS" }));
        const { fileName, fileBase64 } = response;
        var base64String = base64ToArrayBuffer(fileBase64);
        saveByteArray(fileName, base64String, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,");
      }
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    } finally {
      setLoading(false);
    }
  }




  // const cancelarEdicionTabsModulo = () => {
  //     changeTabIndex(2);
  //     setModoEdicionTabs(false);
  //     setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
  //     setDataRowEditNewTabs({});
  // };


  //Datos Principales
  const changeTabIndex = (index) => {
    handleChange(null, index);
  }


  //::::::::::::::::::::::FUNCION HABITACION:::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarCampamentoHabitacion(dataCampamentoHabitacion) {
    setLoading(true);
    const { IdCliente, IdDivision, IdCampamento, IdModulo, IdHabitacion, Habitacion, IdTipoHabitacion, Activo } = dataCampamentoHabitacion;
    let params = {
      IdCliente
      , IdDivision
      , IdCampamento: varIdCampamento
      , IdModulo: varIdModulo
      , IdHabitacion: isNotEmpty(IdHabitacion) ? IdHabitacion.toUpperCase() : ""
      , Habitacion: isNotEmpty(Habitacion) ? Habitacion.toUpperCase() : ""
      , IdTipoHabitacion: isNotEmpty(IdTipoHabitacion) ? IdTipoHabitacion.toUpperCase() : ""
      , Activo
      , IdUsuario: usuario.username
    };
    await crearCampHabitacion(params).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarCampamentoHabitacion();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function actualizarCampamentoHabitacion(campamentoHabitacion) {
    setLoading(true);
    const { IdCliente, IdDivision, IdCampamento, IdModulo, IdHabitacion, Habitacion, IdTipoHabitacion, Activo } = campamentoHabitacion;
    let params = {
      IdCampamento: varIdCampamento
      , IdModulo: isNotEmpty(IdModulo) ? IdModulo.toUpperCase() : ""//varIdModulo
      , IdHabitacion: isNotEmpty(IdHabitacion) ? IdHabitacion.toUpperCase() : ""
      , Habitacion: isNotEmpty(Habitacion) ? Habitacion.toUpperCase() : ""
      , IdTipoHabitacion: isNotEmpty(IdTipoHabitacion) ? IdTipoHabitacion.toUpperCase() : ""
      , Activo
      , IdCliente
      , IdDivision
      , IdUsuario: usuario.username
    };
    await actualizarCampHabitacion(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarCampamentoHabitacion();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function eliminarRegistroCampamentoHabitacion(campamentoHabitacion, confirm) {
    setSelected(campamentoHabitacion);
    setIsVisible(true);
    if (confirm) {
      setFocusedRowKeyHabitacion();
      setLoading(true);
      const { IdCampamento, IdModulo, IdHabitacion, IdCliente, IdDivision } = campamentoHabitacion;
      await eliminarCampHabitacion({
        IdCampamento: IdCampamento,
        IdModulo: IdModulo,
        IdHabitacion: IdHabitacion,
        IdCliente: IdCliente,
        IdDivision: IdDivision,
        IdUsuario: usuario.username
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarCampamentoHabitacion();
      document.getElementById(`vertical-tab-${IndexTab.Modulo}`).click()
    }
  }

  async function listarCampamentoHabitacion() {
    setLoading(true);
    setListarTabs([]);
    goTabMenu();
    setModoEdicionTabs(false);
    await listarCampHabitacion({
      IdCampamento: varIdCampamento,
      IdCliente,
      IdDivision,
      IdModulo: varIdModulo,
      IdHabitacion: '%',
      NumPagina: 0,
      TamPagina: 0
    }).then(campamentosHabitacion => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(campamentosHabitacion);
      disabledDynamicTabs(IndexTab.Habitacion)
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }


  async function obtenerCampamentoHabitacion(filtro) {
    setLoading(true);
    const { IdCampamento, IdModulo, IdHabitacion, IdCliente, IdDivision } = filtro;
    await obtenerCampHabitacion({
      IdCampamento: IdCampamento,
      IdModulo: IdModulo,
      IdHabitacion: IdHabitacion,
      IdCliente: IdCliente,
      IdDivision: IdDivision
    }).then(campamentoHabitacion => {
      setDataRowEditNewTabs({ ...campamentoHabitacion, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  const editarRegistroCampamentoHabitacion = dataRow => {

    const { IdCliente, IdDivision, IdCampamento, IdModulo, IdHabitacion } = dataRow;
    let filtro = {
      IdCliente: IdCliente,
      IdDivision: IdDivision,
      IdCampamento: IdCampamento,
      IdModulo: IdModulo,
      IdHabitacion: IdHabitacion
    };
    setModoEdicionTabs(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerCampamentoHabitacion(dataRow);
  };


  const nuevoRegistroTabsHabitacion = () => {
    let nuevo = { Activo: "S", IdCliente, IdDivision };
    setDataRowEditNewTabs({ ...nuevo, esNuevoRegistro: true });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicionTabs(true);
  };


  const seleccionarRegistroHabitacion = dataRow => {
    localStorage.setItem('dataRowHabServicio', JSON.stringify(dataRow));
    const { IdHabitacion, RowIndex } = dataRow;

    setVarIdHabitacion(IdHabitacion);
    setFocusedRowKeyHabitacion(IdHabitacion);

    //Control externo.
    setExpandRow(RowIndex);
    disabledTabs(false);
    setModoEdicion(false);
    setCollapsed(false);
    setSelected(dataRow);
    disabledDynamicTabs(IndexTab.Habitacion);

  }

  const listarHabitacionTreeView = () => {
    if (selected.IdHabitacion === undefined) return;
    setIsVisiblePopupHabitacion(true);
  }

  const exportHabitacionExcel = async () => {
    const { IdDivision, IdCampamento, IdModulo, IdHabitacion, Habitacion } = selected;
    const param = {
      IdDivision,
      IdCampamento,
      IdModulo,
      IdHabitacion,
      Habitacion
    };
    setLoading(true);
    try {
      const response = await exportarHabitacionExcel(param);
      if (response) {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.DOWNLOAD.SUCESS" }));
        const { fileName, fileBase64 } = response;
        var base64String = base64ToArrayBuffer(fileBase64);
        saveByteArray(fileName, base64String, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,");
      }
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    } finally {
      setLoading(false);
    }
  }



  //::::::::::::::::::::::::::::: HABITACION SERVICIO  :::::::::::::::::::::::::::::::::::::::::::::::::::::

  const seleccionarHabitacionServicio = async (dataRow) => {
    //localStorage.setItem('dataRowHabServicio', JSON.stringify(dataRow));
    disabledTabs(false);
  }

  async function agregarHabitacionServicio(dataRow) {

    setLoading(true);
    const { IdHabitacion, IdServicio, Activo } = dataRow;
    let params = {
      IdCliente
      , IdDivision
      , IdCampamento: varIdCampamento
      , IdModulo: varIdModulo
      , IdHabitacion: isNotEmpty(IdHabitacion) ? IdHabitacion : ""
      , IdServicio: isNotEmpty(IdServicio) ? IdServicio.toUpperCase() : ""
      , Activo
      , IdUsuario: usuario.username
    }
    await crearHabServicio(params).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));

      setModoEdicionDetalle(false);
      listarCampamentoHabitacion();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarHabitacionServicio(data) {
    setLoading(true);
    const { IdCampamento, IdModulo, IdHabitacion, IdServicio, Activo } = data;
    let params = {
      IdCliente
      , IdDivision
      , IdCampamento
      , IdModulo
      , IdHabitacion
      , IdServicio: isNotEmpty(IdServicio) ? IdServicio : ""
      , Activo
      , IdUsuario: usuario.username
    }
    await actualizarHabServicio(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));

      setModoEdicionDetalle(false);
      listarCampamentoHabitacion();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function eliminarHabitacionServicio(dataRow) {

    setLoading(true);
    const { IdCampamento, IdModulo, IdHabitacion, IdServicio, IdCliente, IdDivision } = dataRow;
    let params = {
      IdCampamento,
      IdModulo,
      IdHabitacion,
      IdServicio,
      IdCliente: IdCliente,
      IdDivision: IdDivision,
      IdUsuario: usuario.username
    }
    await eliminarHabServicio(params)
      .then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function obtenerHabitacionServicio(filtro) {
    const { IdCampamento, IdModulo, IdHabitacion, IdServicio, IdCliente, IdDivision } = filtro;
    let hservicio = await obtenerHabServicio({
      IdCampamento,
      IdModulo,
      IdHabitacion,
      IdServicio,
      IdCliente,
      IdDivision
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });
    setDataRowEditNewDetalle({ ...hservicio, esNuevoRegistro: false });
  }

  const nuevoHabitacionServicio = async (dataRow) => {
    const { IdCampamento, IdModulo, IdHabitacion, IdCliente, IdDivision } = dataRow;
    let nuevo = {
      IdCampamento,
      IdModulo,
      IdHabitacion,
      IdCliente,
      IdDivision,
      Activo: "S"
    };
    setDataRowEditNewDetalle({ ...nuevo, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(false);
    setModoEdicionDetalle(true);
  };


  const editarHabitacionServicio = async (dataRow) => {
    const { IdServicio, RowIndex } = dataRow;
    setModoEdicionDetalle(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerHabitacionServicio(dataRow);
    //await obtenerHabServicio(IdServicio);

  };


  const cancelarHabitacionServicio = () => {
    setModoEdicion(false);
    setModoEdicionDetalle(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));

  };

  //::::::::::::::::::::::FUNCION HABITACIÓN CAMA:::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarHabitacionCama(dataHabitacionCama) {
    setLoading(true);
    const { IdCliente, IdDivision, IdCampamento, IdModulo, IdHabitacion, IdCama, Cama, IdTipoCama, Activo } = dataHabitacionCama;
    let params = {
      IdCampamento: varIdCampamento
      , IdModulo: varIdModulo
      , IdHabitacion: varIdHabitacion
      , IdCama: isNotEmpty(IdCama) ? IdCama.toUpperCase() : ""
      , Cama: isNotEmpty(Cama) ? Cama.toUpperCase() : ""
      , IdTipoCama: isNotEmpty(IdTipoCama) ? IdTipoCama.toUpperCase() : ""
      , Activo
      , IdCliente
      , IdDivision
      , IdUsuario: usuario.username
    };
    await crearHabCama(params).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarHabitacionCama();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function actualizarHabitacionCama(habitacionCama) {
    setLoading(true);
    const { IdCliente, IdDivision, IdCampamento, IdModulo, IdHabitacion, IdCama, Cama, IdTipoCama, Activo } = habitacionCama;
    let params = {
      IdCliente
      , IdDivision
      , IdCampamento: varIdCampamento
      , IdModulo: varIdModulo
      , IdHabitacion: varIdHabitacion
      , IdCama: isNotEmpty(IdCama) ? IdCama.toUpperCase() : ""
      , Cama: isNotEmpty(Cama) ? Cama.toUpperCase() : ""
      , IdTipoCama: isNotEmpty(IdTipoCama) ? IdTipoCama.toUpperCase() : ""
      , Activo
      , IdUsuario: usuario.username
    };
    await actualizarHabCama(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarHabitacionCama();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function eliminarRegistroHabitacionCama(habitacionCama, confirm) {
    setSelected(habitacionCama);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCampamento, IdModulo, IdHabitacion, IdCama, IdCliente, IdDivision } = habitacionCama;
      await eliminarHabCama({
        IdCampamento: IdCampamento,
        IdModulo: IdModulo,
        IdHabitacion: IdHabitacion,
        IdCama: IdCama,
        IdCliente: IdCliente,
        IdDivision: IdDivision,
        IdUsuario: usuario.username
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarHabitacionCama();
    }
  }

  async function listarHabitacionCama() {
    setLoading(true);
    setListarTabs([]);

    await listarHabCama({
      IdCampamento: varIdCampamento,
      IdCliente,
      IdDivision,
      IdModulo: varIdModulo,
      IdHabitacion: varIdHabitacion,
      IdCama: '%',
      NumPagina: 0, TamPagina: 0
    }).then(habitacionesCama => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(habitacionesCama);
      setModoEdicionTabs(false);
      disabledDynamicTabs(IndexTab.Cama);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }


  async function obtenerHabitacionCama(filtro) {
    setLoading(true);
    const { IdCampamento, IdModulo, IdHabitacion, IdCama, IdCliente, IdDivision } = filtro;
    await obtenerHabCama({
      IdCampamento: IdCampamento,
      IdModulo: IdModulo,
      IdHabitacion: IdHabitacion,
      IdCama: IdCama,
      IdCliente: IdCliente,
      IdDivision: IdDivision
    }).then(campamentoHabitacionCama => {
      setDataRowEditNewTabs({ ...campamentoHabitacionCama, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const editarRegistroHabitacionCama = dataRow => {

    setModoEdicionTabs(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerHabitacionCama(dataRow);
  };


  const nuevoRegistroTabsHabitacionCama = () => {
    let nuevo = { Activo: "S", IdCliente, IdDivision };
    setDataRowEditNewTabs({ ...nuevo, esNuevoRegistro: true });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicionTabs(true);
  };


  const cancelarEdicionTabs = (indice) => {
    changeTabIndex(indice);
    setModoEdicionTabs(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    let current_tab_id = `vertical-tab-${indice}`;
    switch (indice) {

      case IndexTab.Listado:
        listarCampamentos();
        if (document.getElementById(current_tab_id)) {
          document.getElementById(`vertical-tab-${IndexTab.Hoteles}`).classList.add("Mui-disabled");
          document.getElementById(`vertical-tab-${IndexTab.Modulo}`).classList.add("Mui-disabled");
          document.getElementById(`vertical-tab-${IndexTab.Habitacion}`).classList.add("Mui-disabled");
          document.getElementById(`vertical-tab-${IndexTab.Cama}`).classList.add("Mui-disabled");
          //document.getElementById(`vertical-tab-${IndexTab.Equipo}`).classList.add("Mui-disabled");
        }
        break;
      case IndexTab.Modulo:
        listarCampamentoModulo();
        if (document.getElementById(current_tab_id)) {
          document.getElementById(`vertical-tab-${IndexTab.Modulo}`).classList.add("Mui-disabled");
        }
        break;
      case IndexTab.Habitacion:
        listarCampamentoHabitacion();
        if (document.getElementById(current_tab_id)) {
          document.getElementById(`vertical-tab-${IndexTab.Habitacion}`).classList.add("Mui-disabled");
        }
        break;
      case IndexTab.Cama:
        listarHabitacionCama();
        break;
      default:
        break;
    }
  };



  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  const getInfo = () => {
    const { Campamento, Modulo, Habitacion } = selected;
    let respuesta = [
      { text: [intl.formatMessage({ id: "CAMP.CAMP" })], value: Campamento, colSpan: 2 }
    ];
    if (isNotEmpty(Modulo)) {
      respuesta.push({ text: [intl.formatMessage({ id: "CAMP.MODULE" })], value: Modulo, colSpan: 2 });
    }
    if (isNotEmpty(Habitacion)) {
      respuesta.push({ text: [intl.formatMessage({ id: "CAMP.ROOM" })], value: Habitacion, colSpan: 2 });
    }
    return respuesta;
  }
  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function eliminarListRowTab(selected, confirm) {
    let currentTab = tabIndex;
    switch (currentTab) {
      case 0:
        eliminarRegistro(selected, confirm);
        break;
      case 3:
        eliminarRegistroCampamentoModulo(selected, confirm);
        break;
      case 4:
        eliminarRegistroCampamentoHabitacion(selected, confirm);
        break;
      case 5:
        eliminarRegistroHabitacionCama(selected, confirm);
        break;
      case 2:
        eliminarRegistroAdministrador(selected, confirm);
        break;
    }
  }

  //:::::::   Administrador   ::::::::::::::::::::::::::::::::::::::::::::
  const listarAdministradores = async () => {
    setLoading(true);
    setModoEdicionTabs(false);
    await listarAdministrador({
      IdCliente,
      IdDivision,
      IdCampamento: varIdCampamento,
    }).then(administradores => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(administradores);
      disabledDynamicTabs(IndexTab.Administradores);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  const actualizarAdministradores = async (dataRow) => {

    setLoading(true);
    const { IdPersona, Activo } = dataRow;

    let params = {
      IdCliente,
      IdDivision,
      IdCampamento: varIdCampamento,
      IdPersona,
      Activo,
      IdUsuario: usuario.username
    };

    await actualizarAdministrador(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarAdministradores();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  const agregarAdministrador = async () => { }


  const editarRegistroAdministrador = (dataRow) => {

    obtenerPersonaAdministrador(dataRow);
    setModoEdicionTabs(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
  }

  // const seleccionarRegistroAdministrador = dataRow => {
  //   const { RowIndex } = dataRow;
  //   setFocusedRowKeyAdministrador(RowIndex);
  // }

  async function obtenerPersonaAdministrador(filtro) {
    setLoading(true);
    const { IdPersona } = filtro;
    await obtenerAdministrador({
      IdCliente,
      IdDivision,
      IdCampamento: varIdCampamento,
      IdPersona
    }).then(administrador => {
      setDataRowEditNewTabs({ ...administrador, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const eliminarRegistroAdministrador = async (dataRow, confirm) => {

    if (!confirm) {
      let { Campamento } = selected;
      dataRow.Campamento = Campamento;
    }
    setSelected(dataRow);
    setIsVisible(true);

    if (confirm) {
      setLoading(true);
      const { IdPersona } = dataRow;
      await eliminarAdministrador({
        IdCliente,
        IdDivision,
        IdCampamento: varIdCampamento,
        IdPersona
      }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarAdministradores();
    }

  }

  const nuevoRegistroTabsAdministrador = async () => {
    setisVisiblePopUpPersonas(true);
  }

  async function agregarPersonaAdministrador(personas) {
    setLoading(true);

    let tot_row = 0;
    let msj_error = '';
    for (let i = 0; i < personas.length; i++) {
      let data = personas[i];
      const { IdPersona } = data;
      let params = {
        IdCliente,
        IdDivision,
        IdCampamento: varIdCampamento,
        IdPersona,
        Activo: "S",
        IdUsuario: usuario.username
      };
      await crearAdministrador(params)
        .then((response) => {
          tot_row++;
        })
        .catch((err) => {
          msj_error = msj_error + `Error al registrar persona: ${IdPersona} <br/>`;
        });

    }
    setLoading(false);

    if (tot_row === 0) {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.ERROR" }), msj_error);
    }
    if (tot_row > 0) {
      handleSuccessMessages(
        intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
      );
      listarAdministradores();
    }
  }



  /************--Configuración de acceso de botones***********************/
  const [accessButton, setAccessButton] = useState(defaultPermissions);


  const loadControlsPermission = async () => {
    const numeroTabs = Object.keys(IndexTab).length; //Nùmero de tab del formulario.
    let superAdministrador = usuario.superAdministrador;
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos, superAdministrador);
    //let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const removeAllTabs = (tabs) => {
    for (let i = 0; i < tabs.length; i++) {
      if (!!tabs[i]) tabs[i].classList.remove("Mui-disabled");
    }
  }

  const disabledMultipleTabs = (tabs) => {
    for (let i = 0; i < tabs.length; i++) {
      if (!!tabs[i]) tabs[i].classList.add("Mui-disabled");
    }
  }

  const disabledDynamicTabs = (selected) => {

    let listado = document.getElementById(`vertical-tab-${IndexTab.Listado}`);
    let hoteleria = document.getElementById(`vertical-tab-${IndexTab.Hoteles}`);
    let modulo = document.getElementById(`vertical-tab-${IndexTab.Modulo}`);
    let habitacion = document.getElementById(`vertical-tab-${IndexTab.Habitacion}`);
    let cama = document.getElementById(`vertical-tab-${IndexTab.Cama}`);
    //let equipo = document.getElementById(`vertical-tab-${IndexTab.Equipo}`);

    removeAllTabs([listado, hoteleria, modulo, habitacion, cama]);//EGSC

    if (selected === IndexTab.Listado) {
      if (focusedRowKey) {
        disabledMultipleTabs([habitacion, cama]);
      } else {
        changeTabIndex(IndexTab.Listado);;
        disabledMultipleTabs([hoteleria, modulo, habitacion, cama]);
      }
    } else if (selected === IndexTab.Hoteles) {
      disabledMultipleTabs([habitacion, cama]);
    } else if (selected === IndexTab.Modulo) {
      if (focusedRowKeyModulo) {
        disabledMultipleTabs([cama]);
      } else {
        disabledMultipleTabs([habitacion, cama]);
      }
    } else if (selected === IndexTab.Habitacion) {
      if (focusedRowKeyHabitacion) {
        disabledMultipleTabs([hoteleria, modulo]);
      } else {
        disabledMultipleTabs([hoteleria, modulo, cama]);
      }
    } else if (selected === IndexTab.Cama) {
      disabledMultipleTabs([hoteleria, modulo, habitacion]);
    }
  }

  const disabledTabs = (value) => {

    if (value) {
      //Eliminar LocalStorage
      localStorage.removeItem('dataRowHabServicio');
      //bloquear tab-Menu
      if (document.getElementById("vertical-tab-2")) {
      }

    } else { }
  }


  const goTabMenu = () => {
    //Leer localStoreage.
    let dataRow = JSON.parse(localStorage.getItem('dataRowHabServicio'));
    if (isNotEmpty(dataRow)) {
      const { IdModulo } = dataRow;
      setSelected(dataRow);
      setVarIdModulo(IdModulo);
    }
  }

  //::::::::::::::::::::::::::::::::::::::::::::::-CAMBIAR DE TAB DESDE TREEVIEW-::::::::::::::::::::::::

  const cambiarTab = (data, desde) => {
    const { IdMenu, Nivel, Menu, MenuPadre } = data;
    switch (desde) {
      case "campamento":
        setIsVisiblePopup(false);
        const [, IdModulo, IdHabitacion] = IdMenu.split('|');
        setFocusedRowKeyModulo(IdModulo);
        setVarIdModulo(IdModulo);
        if (Nivel === 1) {
          setSelected({ ...selected, IdModulo, Modulo: Menu });
          actualizarVariablesHabitacion(3, IndexTab.Habitacion, setCambiaIndexHabitacion);
        } else if (Nivel === 2) {
          setSelected({ ...selected, IdModulo, IdHabitacion, Modulo: MenuPadre, Habitacion: Menu });
          actualizarVariablesHabitacion(4, IndexTab.Cama, setCambiaIndexCama, IdHabitacion);
        }
        break;
      case "modulo":
        setIsVisiblePopupModulo(false);
        const [, IdHabitacion2] = IdMenu.split('|');
        if (Nivel === 0) actualizarVariablesHabitacion(3, IndexTab.Habitacion, setCambiaIndexHabitacion);
        else if (Nivel === 1) {
          setSelected({ ...selected, IdHabitacion: IdHabitacion2, Habitacion: Menu });
          actualizarVariablesHabitacion(4, IndexTab.Cama, setCambiaIndexCama, IdHabitacion2);
        }
        break;
      case "habitacion":
        setIsVisiblePopupHabitacion(false);
        actualizaDatosTab(4, IndexTab.Cama, setCambiaIndexCama);
        break;
      default:
        return;
    }
  }

  const actualizaDatosTab = (tab, disableTabs, setter) => {
    changeTabIndex(tab);
    disabledDynamicTabs(disableTabs);
    setter(index => index + 1);
  }

  const actualizarVariablesHabitacion = (tab, disableTabs, setter, id = undefined) => {
    setFocusedRowKeyHabitacion(id);
    setVarIdHabitacion(id ?? "");
    actualizaDatosTab(tab, disableTabs, setter);
  }

  useEffect(() => {
    if (cambiaIndexHabitacion !== 0) listarCampamentoHabitacion();
  }, [cambiaIndexHabitacion]);

  useEffect(() => {
    if (cambiaIndexCama !== 0) listarHabitacionCama();
  }, [cambiaIndexCama]);


  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "ASSISTANCE.AUTHORIZER",
      "CAMP.MODULE",
      "CAMP.ROOM",
      "CAMP.ROOM.BED",
      "CASINO.DINNINGROOM.SERVICE.TEAMS"
    ];
    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";
    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }


  const tabsDisabled = () => {
    return isNotEmpty(varIdCampamento) ? true : false;
  }

  const tabContent_CampamentoListPage = () => {
    return <CampamentoListPage
      campamentos={campamentos}
      titulo={titulo}
      editarRegistro={editarRegistro}
      eliminarRegistro={eliminarRegistro}
      nuevoRegistro={nuevoRegistro}
      seleccionarRegistro={seleccionarRegistro}
      focusedRowKey={focusedRowKey}
      verRegistroDblClick={verRegistroCampamentoDblClick}
      accessButton={accessButton}
      listarCampamentoTreeView={listarCampamentoTreeView}
      exportExcel={exportExcel}
    />
  }


  const tabContent_CampamentoEditPage = () => {
    return <>

      <CampamentoEditPage
        titulo={titulo}
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        actualizarCampamento={actualizarCampamento}
        agregarCampamento={agregarCampamento}
        cancelarEdicion={cancelarEdicion}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        dataMenu={dataMenu}
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

  const tabContent_ModuloListPage = () => {
    return <>
      {modoEdicionTabs && (
        <>
          <ModuloEditPage
            dataRowEditNew={dataRowEditNewTabs}
            actualizarCampamentoModulo={actualizarCampamentoModulo}
            agregarCampamentoModulo={agregarCampamentoModulo}
            cancelarEdicion={() => cancelarEdicionTabs(IndexTab.Hoteles)}
            titulo={tituloTabs}
            modoEdicion={modoEdicionTabs}
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
          {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewTabs} />)}
        </>
      )}
      {!modoEdicionTabs && (
        <>
          <ModuloListPage
            campamentosModulo={listarTabs}
            editarRegistro={editarRegistroCampamentoModulo}
            eliminarRegistro={eliminarRegistroCampamentoModulo}
            nuevoRegistro={nuevoCampamentoModulo}
            seleccionarRegistro={seleccionarRegistroModulo}
            cancelarEdicion={() => cancelarEdicionTabs(IndexTab.Hoteles)}
            getInfo={getInfo}
            focusedRowKey={focusedRowKeyModulo}
            listarModuloTreeView={listarModuloTreeView}
            exportModuloExcel={exportModuloExcel}
          />
          {
            isVisiblePopupModulo && (
              <ModuloTreeviewPage
                intl={intl}
                data={selected}
                isVisiblePopup={isVisiblePopupModulo}
                setIsVisiblePopup={setIsVisiblePopupModulo}
                getInfo={getInfo}
                cambiarTab={cambiarTab}
              />
            )
          }
        </>
      )}
    </>
  }

  const tabContent_HabitacionListPage = () => {
    return <>
      {modoEdicionTabs && (
        <>
          <HabitacionEditPage
            dataRowEditNew={dataRowEditNewTabs}
            actualizarCampamentoHabitacion={actualizarCampamentoHabitacion}
            agregarCampamentoHabitacion={agregarCampamentoHabitacion}
            cancelarEdicion={() => cancelarEdicionTabs(IndexTab.Modulo)}
            titulo={tituloTabs}
            modoEdicion={modoEdicionTabs}
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
          {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewTabs} />)}
        </>
      )}
      {modoEdicionDetalle && (
        <>
          <HabitacionServicioEditPage
            titulo={titulo}
            modoEdicion={modoEdicionDetalle}
            dataRowEditNew={dataRowEditNewDetalle}
            actualizarHabitacionServicio={actualizarHabitacionServicio}
            agregarHabitacionServicio={agregarHabitacionServicio}
            cancelarEdicion={() => setModoEdicionDetalle(false)}

            settingDataField={dataMenu.datos}

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

      {!modoEdicionTabs && !modoEdicionDetalle && (

        <>
          <HabitacionListPage
            campamentosHabitacion={listarTabs}
            editarRegistro={editarRegistroCampamentoHabitacion}
            eliminarRegistro={eliminarRegistroCampamentoHabitacion}
            nuevoRegistro={nuevoRegistroTabsHabitacion}
            seleccionarRegistro={seleccionarRegistroHabitacion}
            cancelarEdicion={() => cancelarEdicionTabs(IndexTab.Modulo)} //egsc
            getInfo={getInfo}

            titulo={titulo}
            showButtons={true}
            focusedRowKey={focusedRowKeyHabitacion}
            seleccionarHabitacionServicio={seleccionarHabitacionServicio}
            insertarHabitacionServicio={nuevoHabitacionServicio}
            editarHabitacionServicio={editarHabitacionServicio}
            eliminarHabitacionServicio={eliminarHabitacionServicio}
            expandRow={{ expandRow, setExpandRow }}
            collapsedRow={{ collapsed, setCollapsed }}
            listarHabitacionTreeView={listarHabitacionTreeView}
            exportHabitacionExcel={exportHabitacionExcel}
          />
          {
            isVisiblePopupHabitacion && (
              <HabitacionTreeviewPage
                intl={intl}
                data={selected}
                isVisiblePopup={isVisiblePopupHabitacion}
                setIsVisiblePopup={setIsVisiblePopupHabitacion}
                getInfo={getInfo}
                cambiarTab={cambiarTab}
              />
            )
          }
        </>
      )}
    </>
  }

  const tabContent_HabitacionCamaListPage = () => {
    return <>
      {modoEdicionTabs && (
        <>
          <HabitacionCamaEditPage
            dataRowEditNew={dataRowEditNewTabs}
            actualizarHabitacionCama={actualizarHabitacionCama}
            agregarHabitacionCama={agregarHabitacionCama}
            cancelarEdicion={() => cancelarEdicionTabs(IndexTab.Habitacion)}
            titulo={tituloTabs}
            modoEdicion={modoEdicionTabs}
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
          {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewTabs} />)}
        </>
      )}
      {!modoEdicionTabs && (
        <>
          <HabitacionCamaListPage
            habitacionesCama={listarTabs}
            editarRegistro={editarRegistroHabitacionCama}
            eliminarRegistro={eliminarRegistroHabitacionCama}
            nuevoRegistro={nuevoRegistroTabsHabitacionCama}
            cancelarEdicion={() => cancelarEdicionTabs(IndexTab.Habitacion)} //EGSC
            getInfo={getInfo}
          />
        </>
      )}
    </>
  }

  const tabContent_EquipoListPage = () => {
    return <>
      <EquipoIndexPage
        varIdCampamento={varIdCampamento}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        IdZona={selected.IdZona}
        IdModulo={dataMenu.info.IdModulo}
      />
    </>
  }
  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "CAMP.PROFILE.MENU" })}
        submenu={intl.formatMessage({ id: "CAMP.TYPEMODULE.SUBMENU" })}
        subtitle={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
          },
          {
            label: intl.formatMessage({ id: "CAMP.CAMP" }),
            icon: <LocalConvenienceStoreIcon fontSize="large" />,
            onClick: (e) => {
              disabledDynamicTabs(IndexTab.Hoteles);
              obtenerCampamento(selected);
            },
            disabled: !tabsDisabled()
          },
          // {
          //   label: intl.formatMessage({ id: "ASSISTANCE.AUTHORIZER" }),
          //   icon: <PersonIcon fontSize="large" />,
          //   onClick: () => { listarAdministradores(); },
          //   disabled: true //JDL->2022-10-10->PENDIENTE POR HABILITAR..
          //   //disabled: tabsDisabled() && accessButton.Tabs[2] ? false : true
          // },
          {
            label: intl.formatMessage({ id: "CAMP.MODULE" }),
            icon: <ApartmentIcon fontSize="large" />,
            onClick: (e) => {
              listarCampamentoModulo();
              disabledDynamicTabs(IndexTab.Modulo);
            },
            // disabled: accessButton.Tabs[3] ? false : true
          },
          {
            label: intl.formatMessage({ id: "CAMP.ROOM" }),
            icon: <LocalOfferIcon fontSize="large" />,
            onClick: (e) => { listarCampamentoHabitacion(); },
            // disabled: accessButton.Tabs[4] ? false : true
          },
          {
            label: intl.formatMessage({ id: "CAMP.ROOM.BED" }),
            icon: <LocalHotelIcon fontSize="large" />,
            onClick: (e) => { listarHabitacionCama(); disabledDynamicTabs(IndexTab.Cama); },
            // disabled: accessButton.Tabs[5] ? false : true
          },
          {
            label: intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.TEAMS" }),
            icon: <KitchenIcon fontSize="large" />,
            disabled: !tabsDisabled() //&& accessButton.Tabs[IndexTab.Equipo] ? false : true
          }

        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_CampamentoListPage(),
            tabContent_CampamentoEditPage(),
            // tabContent_AdministradorListPage(),
            tabContent_ModuloListPage(),
            tabContent_HabitacionListPage(),
            tabContent_HabitacionCamaListPage(),
            tabContent_EquipoListPage()
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

      {isVisiblePopup && (
        <CampamentoTreeViewPage
          intl={intl}
          data={selected}
          isVisiblePopup={isVisiblePopup}
          setIsVisiblePopup={setIsVisiblePopup}
          getInfo={getInfo}
          cambiarTab={cambiarTab}
        />)
      }
    </>
  );
};




export default injectIntl(WithLoandingPanel(CampamentoIndexPage));
