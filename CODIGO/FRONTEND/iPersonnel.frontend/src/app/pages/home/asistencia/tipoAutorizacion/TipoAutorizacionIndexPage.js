import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";

import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { useStylesTab } from "../../../../store/config/Styles";

import {
  obtener,
  listar,
  crear,
  actualizar,
  eliminar
} from "../../../../api/asistencia/tipoAutorizacionCompania.api";
import TipoAutorizacionEditPage from "./TipoAutorizacionEditPage";
import TipoAutorizacionListPage from "./TipoAutorizacionListPage"

import {
  obtener as obtenerAUT,
  listar as listarAUT,
  crear as crearAUT,
  actualizar as actualizarAUT,
  eliminar as eliminarAUT
} from "../../../../api/asistencia/autorizador.api";
import AutorizadorEditPage from '../compania/autorizador/AutorizadorEditPage'

import {
  listarAutorizadoresJustificacionAsignados,
  crear as crearAJ,
  eliminar as eliminarAJ
} from "../../../../api/asistencia/autorizadorJustificacion.api";

import { isNotEmpty } from "../../../../../_metronic";

import {
  listarTreeview as listarTreeviewDivisiones,
  crear as crearAD,
  eliminar as eliminarAD
} from "../../../../api/asistencia/autorizadorDivision.api";

import {
  listarTreeview as listarTreeviewUnidadOrganizativa,
  crear as crearUO,
  eliminar as eliminarUO
} from "../../../../api/asistencia/autorizadorUnidadOrganizativa.api";

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import { serviceCompania } from "../../../../api/administracion/compania.api";

const TipoAutorizacionCompaniaIndex = (props) => {

  const usuario = useSelector(state => state.auth.user);
  const { IdDivision, IdCliente } = useSelector(state => state.perfil.perfilActual);
  const perfil = useSelector(state => state.perfil.perfilActual);

  const { intl, setLoading, dataMenu } = props;

  const [isVisible, setIsVisible] = useState(false);
  const [focusedRowKey, setFocusedRowKey] = useState();

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));

  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState({});

  const classes = useStylesTab();
  const [listarTabs, setListarTabs] = useState([]);
  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.EDIT" }));
  const [instance, setInstance] = useState({});

  const [isVisibleFrmAutorizador, setisVisibleFrmAutorizador] = useState(false);
  const [isDeleteAutorizador, setisDeleteAutorizador] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [expandRow, setExpandRow] = useState(0);
  const [invokeContentReady, SetInvokeContentReady] = useState(false);


  const [nivelMax, setNivelMax] = useState(0);

  const [dataJustificaciones, setDataJustificaciones] = useState([]);
  const [isVisibleAlert, setIsVisibleAlert] = useState(false);

  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const [companiaData, setCompaniaData] = useState([]);
  const [selected, setSelected] = useState({});
  const [varIdCompania, setVarIdCompania] = useState("");
  const [selectedCompania, setSelectedCompania] = useState({});

  const [varIdTipoAutorizacion, setVarIdTipoAutorizacion] = useState("");


  const [divisionesTreeView, setDivisionesTreeView] = useState([{
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




  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-Persona-:::::::::::::::::::::::::::::::::
  useEffect(() => {
    listarCompanias();
    loadControlsPermission();
  }, []);

  //::::::::::::::::::::::::::::::::::::::::::::: Funciones Autorizador ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarTipoAutorizacionCompania(datarow) {
    setLoading(true);
    const { IdTipoAutorizacion, NivelAprobacion, Activo } = datarow;
    let data = {
      IdCliente: IdCliente
      , IdCompania: varIdCompania
      , IdTipoAutorizacion: IdTipoAutorizacion
      , NivelAprobacion: NivelAprobacion
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await crear(data).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarTipoAutorizacionCompania(varIdCompania);
      setModoEdicion(false);

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarTipoAutorizacionCompania(datarow) {
    setLoading(true);
    const { IdCliente, IdCompania, IdTipoAutorizacion, NivelAprobacion, Activo } = datarow;
    let data = {
      IdCliente: IdCliente
      , IdCompania: IdCompania
      , IdTipoAutorizacion: IdTipoAutorizacion
      , NivelAprobacion: NivelAprobacion
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await actualizar(data).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarTipoAutorizacionCompania(varIdCompania);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistroTipoAutorizacionCompania(data, confirm) {
    setisDeleteAutorizador(false);
    setSelectedDelete(data);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdCompania, IdTipoAutorizacion } = selectedDelete;
      await eliminar({
        IdCliente: IdCliente,
        IdCompania: IdCompania,
        IdTipoAutorizacion: IdTipoAutorizacion
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        listarTipoAutorizacionCompania(varIdCompania);
        setVarIdTipoAutorizacion("");
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });

    }
  }

  async function listarTipoAutorizacionCompania(idCompania) {
    setLoading(true);
    await listar(
      {
        IdCliente: IdCliente,
        IdCompania: idCompania,
        IdTipoAutorizacion: '%',
        NumPagina: 0,
        TamPagina: 0
      }
    ).then(data => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(data)
      changeTabIndex(0);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerTipoAutorizacion() {
    setLoading(true);
    setModoEdicion(true);
    setisVisibleFrmAutorizador(false);
    obtenerTipoAutorizacionCompania();
    setLoading(false);
  }

  async function obtenerTipoAutorizacionCompania() {
    setLoading(true);
    setModoEdicion(true);
    const { IdCliente, IdCompania, IdTipoAutorizacion } = selected;
    await obtener({ IdCliente, IdCompania, IdTipoAutorizacion }).then(data => {
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  const seleccionarTipoAutorizacionCompania = async (dataRow) => {
    const { RowIndex, NivelAprobacion,IdTipoAutorizacion } = dataRow;
    disabledTabs(true);
    setSelected(dataRow);
    setFocusedRowKey(RowIndex);
    setNivelMax(NivelAprobacion);
    setExpandRow(RowIndex);
    setVarIdTipoAutorizacion(IdTipoAutorizacion);
  };

  const nuevoRegistroTipoAutorizacionCompania = () => {
    changeTabIndex(1);
    let data = { Activo: "S", IdCompania: varIdCompania };
    setDataRowEditNew({ ...data, NivelAprobacion: 0, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setisVisibleFrmAutorizador(false);
    SetInvokeContentReady(collapsed ? false : true);
  };

  const editarRegistroTipoAutorizacionCompania = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerTipoAutorizacionCompania();
    setisVisibleFrmAutorizador(false);
    SetInvokeContentReady(collapsed ? false : true);
  };

  const cancelarEdicionTabsTipoAutorizacionCompania = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    SetInvokeContentReady(collapsed ? false : true);

  };

  //:::::::::::::::::::::: Funciones  Autorizador ( MasterDetail ) :::::::::::::::::::::::::::::::::::::::::::::::::

  const nuevoAutorizador = (dataRow) => {
    changeTabIndex(1);
    const { IdCliente, IdCompania, IdTipoAutorizacion, NivelAprobacion } = dataRow;
    setDataRowEditNew({ IdCliente: IdCliente, IdDivision: IdDivision, IdCompania: IdCompania, IdTipoAutorizacion: IdTipoAutorizacion, Activo: 'S', GeneraSolicitud: 'N', NivelMax: NivelAprobacion, Principal: 'N', esNuevoRegistro: true, Nivel: 0 });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));

    //Lista Tabs
    listarTabJustificaciones('NUEVO', dataRow);
    listarTabDivisiones('NUEVO', dataRow);
    listarTabUnidadOrganizativa('NUEVO', dataRow);

    setisVisibleFrmAutorizador(true);
    setModoEdicion(true);
  };
 
  const disabledTabs = (value) => {
    if (value) {
      localStorage.removeItem('dataRowAutorizador');
    }
  }

  const seleccionarAutorizador = async (dataRow) => {
    localStorage.setItem('dataRowAutorizador', JSON.stringify(dataRow));
    disabledTabs(false);
  }

  const editarAutorizador = async (dataRow) => {
    await obtenerAutorizador(dataRow);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    setModoEdicion(true);
    //Lista Tabs
    listarTabJustificaciones('ACTUALIZAR', dataRow);
    listarTabDivisiones('ACTUALIZAR', dataRow);
    listarTabUnidadOrganizativa('ACTUALIZAR', dataRow);
    SetInvokeContentReady(collapsed ? false : true);
    changeTabIndex(1);
  };

  async function eliminarAutorizador(dataRow, confirm) {
    setisDeleteAutorizador(true);
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdCompania, IdTipoAutorizacion, IdPosicion, Nivel } = selectedDelete;
      await eliminarAUT({
          IdCliente: IdCliente
        , IdCompania: IdCompania
        , IdTipoAutorizacion: IdTipoAutorizacion
        , IdPosicion: IdPosicion
        , Nivel: Nivel
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarAutorizador();
    }

  }


  async function agregarAutorizador(dataRow, selectedRowPlanilla, selectedRowDivision, selectedRowUnidadOrganizativa) {
    setLoading(true);

    const { IdTipoAutorizacion, IdPosicion, Nivel, Principal, GeneraSolicitud, Activo } = dataRow;
    let params = {
      IdCliente: IdCliente
      , IdCompania: varIdCompania
      , IdTipoAutorizacion: IdTipoAutorizacion
      , IdPosicion: IdPosicion
      , Nivel: Nivel
      , Principal: Principal
      , GeneraSolicitud: GeneraSolicitud
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await crearAUT(params).then(response => {
      agregarAutorizadorJustificacion(params, selectedRowPlanilla);
      agregarAutorizadorDivision(params, selectedRowDivision);
      agregarAutorizadorUnidadOrganizativa(params, selectedRowUnidadOrganizativa);
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarAutorizador();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  async function actualizarAutorizador(dataRow, selectedRowPlanilla, selectedRowDivision, selectedRowUnidadOrganizativa) {

    setLoading(true);
    const { IdCliente, IdCompania, IdTipoAutorizacion, IdPosicion, Nivel, Principal, GeneraSolicitud, Activo } = dataRow;
    let params = {
        IdCliente: IdCliente
      , IdCompania: IdCompania
      , IdTipoAutorizacion: IdTipoAutorizacion
      , IdPosicion: IdPosicion
      , Nivel: Nivel
      , Principal: Principal
      , GeneraSolicitud: GeneraSolicitud
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await actualizarAUT(params).then(() => {
      agregarAutorizadorJustificacion(params, selectedRowPlanilla);
      agregarAutorizadorDivision(params, selectedRowDivision);
      agregarAutorizadorUnidadOrganizativa(params, selectedRowUnidadOrganizativa);

      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarAutorizador();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  async function listarAutorizador() {
    changeTabIndex(0);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setModoEdicion(false);
    SetInvokeContentReady(collapsed ? false : true);
  }

  async function obtenerAutorizador(dataRow) {
    setLoading(true);
    setisVisibleFrmAutorizador(true);
    const { IdCliente, IdCompania, IdTipoAutorizacion, IdPosicion, Nivel, NivelAprobacion } = dataRow;
    await obtenerAUT({
      IdCliente: IdCliente
      , IdCompania: IdCompania
      , IdTipoAutorizacion: IdTipoAutorizacion
      , IdPosicion: IdPosicion
      , Nivel: Nivel
    }).then(data => {
      setDataRowEditNew({ ...data, NivelMax: NivelAprobacion, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    })
      .finally(() => { setLoading(false); });
  }

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    SetInvokeContentReady(collapsed ? false : true);
    changeTabIndex(0);
  };

  // ::::::::::::::::::::::::::::::::::::::::::::::::::: FUNCIONES TABS  :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function listarTabJustificaciones(Accion, dataRow) {
    setLoading(true);

    const { IdCliente, IdCompania, IdTipoAutorizacion, IdPosicion, Nivel } = dataRow;
    await listarAutorizadoresJustificacionAsignados({
      Accion: Accion,
      IdCliente: IdCliente,
      IdCompania: IdCompania,
      IdTipoAutorizacion: IdTipoAutorizacion,
      IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion : "%",
      Nivel: isNotEmpty(Nivel) ? Nivel : '0'

    }).then(data => {
      setDataJustificaciones(data);

      if (data.length === 0) {
        setIsVisibleAlert(true);
      } else {
        setIsVisibleAlert(false);
      }

    }).catch(err => {
    }).finally(() => { setLoading(false); });
  }

  async function listarTabDivisiones(Accion, dataRow) {
    setLoading(true);
    const { IdCliente, IdCompania, IdTipoAutorizacion, IdPosicion, Nivel } = dataRow;
    await listarTreeviewDivisiones({
      Accion: Accion,
      IdCliente: IdCliente,
      IdCompania: IdCompania,
      IdTipoAutorizacion: IdTipoAutorizacion,
      IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion : "%",
      Nivel: isNotEmpty(Nivel) ? Nivel : 0,
      IdDivision: '%'
    }).then(dataTreeView => {
      if (!isNotEmpty(dataTreeView)) {
        setDivisionesTreeView([{
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
        setDivisionesTreeView(dataTreeView);
      }
    }).catch(err => {
    }).finally(() => { setLoading(false); });
  }

  async function listarTabUnidadOrganizativa(Accion, dataRow) {
    setLoading(true);
    const { IdCliente, IdCompania, IdTipoAutorizacion, IdPosicion, Nivel } = dataRow;
    await listarTreeviewUnidadOrganizativa({
      Accion: Accion,
      IdCliente: IdCliente,
      IdCompania: IdCompania,
      IdTipoAutorizacion: IdTipoAutorizacion,
      IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion : "%",
      Nivel: isNotEmpty(Nivel) ? Nivel : 0,
    }).then(dataTreeView => {
      if (!isNotEmpty(dataTreeView)) {
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
    }).finally(() => { setLoading(false); });
  }


  async function agregarAutorizadorJustificacion(datarow, selectedRowJustificaciones) {
    try {

      const { IdCliente, IdCompania, IdTipoAutorizacion, IdPosicion, Nivel } = datarow;

      if (selectedRowJustificaciones != undefined) {
        await eliminarAJ({ IdCliente: IdCliente, IdCompania: IdCompania, IdTipoAutorizacion: IdTipoAutorizacion, IdPosicion: IdPosicion, Nivel: Nivel, IdJustificacion: '%' }).then(response => { }).catch(err => { }).finally();
      }

      setTimeout(function () {

        if (selectedRowJustificaciones != undefined) {

          if (selectedRowJustificaciones.length > 0) {
            selectedRowJustificaciones.map(async (data) => {
              const { IdJustificacion } = data;
              let params = {
                IdCliente: IdCliente,
                IdCompania: IdCompania,
                IdTipoAutorizacion: IdTipoAutorizacion,
                IdPosicion: IdPosicion,
                Nivel: Nivel,
                IdJustificacion: IdJustificacion,
                Activo: 'S',
                IdUsuario: usuario.username
              };
              await crearAJ(params)
                .then((response) => { })
                .catch((err) => {
                  handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
                });
            });
          }
        }

      }, 500);

    } catch (err) {
      setLoading(false);
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }
  }

  async function agregarAutorizadorDivision(datarow, selectedRowDivision) {
    try {
      const { IdCliente, IdCompania, IdTipoAutorizacion, IdPosicion, Nivel } = datarow;

      if (selectedRowDivision != undefined) {
        await eliminarAD({ IdCliente: IdCliente, IdCompania: IdCompania, IdTipoAutorizacion: IdTipoAutorizacion, IdPosicion: IdPosicion, Nivel: Nivel, IdDivision: '%' }).then(response => { }).catch(err => { }).finally();
      }

      setTimeout(function () {

        if (selectedRowDivision != undefined) {
          if (selectedRowDivision.length > 0) {
            selectedRowDivision.map(async (data) => {
              const { IdDivision } = data;
              let params = {
                IdCliente: IdCliente,
                IdCompania: IdCompania,
                IdTipoAutorizacion: IdTipoAutorizacion,
                IdPosicion: IdPosicion,
                Nivel: Nivel,
                IdDivision: IdDivision,
                Activo: 'S',
                IdUsuario: usuario.username
              };
              await crearAD(params)
                .then((response) => { })
                .catch((err) => {
                  handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
                });
            });
          }
        }

      }, 500);

    } catch (err) {
      setLoading(false);
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }
  }


  async function agregarAutorizadorUnidadOrganizativa(datarow, selectedRowUnidadOrganizativa) {

    try {
      const { IdCliente, IdCompania, IdTipoAutorizacion, IdPosicion, Nivel } = datarow;

      if (selectedRowUnidadOrganizativa != undefined) {
        await eliminarUO({ IdCliente: IdCliente, IdCompania: IdCompania, IdTipoAutorizacion: IdTipoAutorizacion, IdPosicion: IdPosicion, Nivel: Nivel, IdUnidadOrganizativa: '%' }).then(response => { }).catch(err => { }).finally();
      }

      setTimeout(function () {

        if (selectedRowUnidadOrganizativa != undefined) {
          if (selectedRowUnidadOrganizativa.length > 0) {
            selectedRowUnidadOrganizativa.map(async (data) => {
              const { IdUnidadOrganizativa } = data;
              let params = {
                IdCliente: IdCliente,
                IdCompania: IdCompania,
                IdTipoAutorizacion: IdTipoAutorizacion,
                IdPosicion: IdPosicion,
                Nivel: Nivel,
                IdUnidadOrganizativa: IdUnidadOrganizativa,
                Activo: 'S',
                IdUsuario: usuario.username
              };
              await crearUO(params)
                .then((response) => { })
                .catch((err) => {
                  handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
                });
            });
          }
        }

      }, 500);

    } catch (err) {
      setLoading(false);
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }
  }

  async function listarCompanias() {
    let data = await serviceCompania.obtenerTodosConfiguracion({
      IdCliente: IdCliente,
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdConfiguracion: "ID_COMPANIA"
    }
    ).catch(err => { handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err) });
    setCompaniaData(data);
  }

  const changeValueCompany = (company) => {
    if(isNotEmpty(company)){
      const { IdCompania } = company;
      setSelectedCompania(company);
      setVarIdCompania(IdCompania);
      listarTipoAutorizacionCompania(IdCompania);
      setVarIdTipoAutorizacion("");
    }else
    {
      setSelectedCompania("");
      setVarIdCompania("");
      setListarTabs([]);
    }
  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function eliminarListRowTab(selected, confirm) {
    isDeleteAutorizador ? eliminarAutorizador(selected, confirm) : eliminarRegistroTipoAutorizacionCompania(selected, confirm);
  }


  const getInfo = () => {
    const { IdCompania, Compania } = selectedCompania;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdCompania, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" })], value: Compania, colSpan: 4 }
    ];
  }

  //Conf Botones
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 2;
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }


  const changeTabIndex = (index) => {
    handleChange(null, index);
  }


  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      ""
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }

  const tabContent_AutorizacionListPage = () => {
    return <TipoAutorizacionListPage
      tipoAutorizacionCompaniaData={listarTabs}
      seleccionarRegistro={seleccionarTipoAutorizacionCompania}
      editarRegistro={editarRegistroTipoAutorizacionCompania}
      eliminarRegistro={eliminarRegistroTipoAutorizacionCompania}
      nuevoRegistro={nuevoRegistroTipoAutorizacionCompania}
      cancelarEdicion={props.cancelarEdicionPrincipal}
      getInfo={getInfo}
      accessButton={accessButton}
      focusedRowKey={focusedRowKey}
      //MasterDetail Actions
      nuevoAutorizador={nuevoAutorizador}
      seleccionarAutorizador={seleccionarAutorizador}
      editarAutorizador={editarAutorizador}
      eliminarAutorizador={eliminarAutorizador}
      expandRow={{ expandRow, setExpandRow }}
      collapsedRow={{ collapsed, setCollapsed }}
      invokeMethod={{ invokeContentReady, SetInvokeContentReady }}
      companiaData={companiaData}
      changeValueCompany={changeValueCompany}
      varIdCompania={varIdCompania}
      setVarIdCompania={setVarIdCompania}
      setFocusedRowKey = {setFocusedRowKey}
    />
  }

  const tabContent_AutorizacionEditTabPage = () => {
    return <>
      {modoEdicion && (
        <>
          {isVisibleFrmAutorizador ? (
            <AutorizadorEditPage
              dataRowEditNew={dataRowEditNew}
              actualizarAutorizador={actualizarAutorizador}
              agregarAutorizador={agregarAutorizador}
              cancelarEdicion={cancelarEdicion}
              titulo={tituloTabs}
              modoEdicion={modoEdicion}
              accessButton={accessButton}
              settingDataField={dataMenu.datos}
              IdCliente={IdCliente}
              dataJustificaciones={dataJustificaciones}
              divisionesTreeView={divisionesTreeView}
              unidadOrganizativaTreeView={unidadOrganizativaTreeView}
              isVisibleAlert={isVisibleAlert}
              nivelMax={nivelMax}

            />
          ) :
            (
              <TipoAutorizacionEditPage
                dataRowEditNew={dataRowEditNew}
                actualizarTipoAutorizacionCompania={actualizarTipoAutorizacionCompania}
                agregarTipoAutorizacionCompania={agregarTipoAutorizacionCompania}
                cancelarEdicion={cancelarEdicion}
                titulo={tituloTabs}
                modoEdicion={modoEdicion}
                accessButton={accessButton}
                settingDataField={dataMenu.datos}
                getInfo={getInfo}
                varIdCompania={varIdCompania}
              />
            )

          }

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
    </>
  }


  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "ASSISTANCE.MAIN" })}
        submenu={intl.formatMessage({ id: "SYSTEM.CONFIGURATION" })}
        subtitle={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />
          },
          {
            label: intl.formatMessage({ id: "ASSISTANCE.AUTHORIZATION.TYPE.TAB" }),
            icon: <AssignmentTurnedInIcon fontSize="large" />,
            onClick: (e) => { obtenerTipoAutorizacion() },
            disabled: ( isNotEmpty(varIdCompania) && isNotEmpty(varIdTipoAutorizacion) ) ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_AutorizacionListPage(),
            tabContent_AutorizacionEditTabPage()
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
  );

};


export default injectIntl(WithLoandingPanel(TipoAutorizacionCompaniaIndex));
