import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../../partials/components/Confirm";

import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";
import { useStylesTab } from "../../../../../store/config/Styles";

import {
  obtener,
  listar,
  crear,
  actualizar,
  eliminar
} from "../../../../../api/asistencia/tipoAutorizacionCompania.api";
import TipoAutorizacionCompaniaEditPage from "./TipoAutorizacionCompaniaEditPage";
import TipoAutorizacionCompaniaListPage from "./TipoAutorizacionCompaniaListPage"
  
import {
  obtener as obtenerAUT,
  listar as listarAUT,
  crear as crearAUT,
  actualizar as actualizarAUT,
  eliminar as eliminarAUT
} from "../../../../../api/asistencia/autorizador.api";
import AutorizadorEditPage from '../autorizador/AutorizadorEditPage'

import {
  listarAutorizadoresJustificacionAsignados,
  crear as crearAJ,
  eliminar as eliminarAJ
} from "../../../../../api/asistencia/autorizadorJustificacion.api";


import { isNotEmpty } from "../../../../../../_metronic";

import {
  listarTreeview as listarTreeviewDivisiones,
  crear as crearAD,
  eliminar as eliminarAD
} from "../../../../../api/asistencia/autorizadorDivision.api";

import {
  listarTreeview as listarTreeviewUnidadOrganizativa,
  crear as crearUO,
  eliminar as eliminarUO
} from "../../../../../api/asistencia/autorizadorUnidadOrganizativa.api";

const TipoAutorizacionCompaniaIndex = (props) => {

  const usuario = useSelector(state => state.auth.user);
  const { IdDivision, IdCliente } = useSelector(state => state.perfil.perfilActual);
  const perfil = useSelector(state => state.perfil.perfilActual);

  const { intl, setLoading, settingDataField, getInfo, accessButton, varIdCompania, selectedIndex } = props;

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
    listarTipoAutorizacionCompania();   //Inicializa Listado
  }, []);

  //::::::::::::::::::::::::::::::::::::::::::::: Funciones  ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

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
      listarTipoAutorizacionCompania();
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
      listarTipoAutorizacionCompania();
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
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarTipoAutorizacionCompania();
    }
  }

  async function listarTipoAutorizacionCompania() {
    setLoading(true);
    await listar(
      {
        IdCliente: IdCliente,
        IdCompania: varIdCompania,
        IdTipoAutorizacion: '%',
        NumPagina: 0,
        TamPagina: 0
      }
    ).then(data => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(data)
      // console.log("listarTipoAutorizacionCompania|data:",data);

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerTipoAutorizacionCompania(dataRow) {
    setLoading(true);
    const { IdCliente, IdCompania, IdTipoAutorizacion } = dataRow;
    await obtener({ IdCliente, IdCompania, IdTipoAutorizacion }).then(data => {
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  // const seleccionarTipoAutorizacionCompania = (dataRow) => {
  //   // console.log("seleccionarTipoAutorizacionCompania|dataRow:",dataRow);
  //   const { RowIndex,NivelAprobacion } = dataRow;
  //   setNivelMax(NivelAprobacion);
  //   setFocusedRowKey(RowIndex);

  //   //Control externo.
  //    setExpandRow(RowIndex);
  //    setCollapsed(false);
  // };


  const seleccionarTipoAutorizacionCompania = async (dataRow) => {
    const { RowIndex, NivelAprobacion } = dataRow;

    //Datos Principales   
    disabledTabs(true);    
    setFocusedRowKey(RowIndex);
    setNivelMax(NivelAprobacion);
    // disabledTabs(true);
    setExpandRow(RowIndex);
    // setCollapsed(false);

  };

  const nuevoRegistroTipoAutorizacionCompania = () => {
    let data = { Activo: "S" };
    setDataRowEditNew({ ...data, NivelAprobacion: 0, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setisVisibleFrmAutorizador(false);
    SetInvokeContentReady(collapsed ? false : true);

  };

  const editarRegistroTipoAutorizacionCompania = async (dataRow) => {
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerTipoAutorizacionCompania(dataRow);
    setisVisibleFrmAutorizador(false);
    SetInvokeContentReady(collapsed ? false : true);
  };

  const cancelarEdicionTabsTipoAutorizacionCompania = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    // console.log("cancelarEdicionTabsTipoAutorizacionCompania|collapsed:",collapsed);
    SetInvokeContentReady(collapsed ? false : true);

  };

  //:::::::::::::::::::::: Funciones  Autorizador ( MasterDetail ) :::::::::::::::::::::::::::::::::::::::::::::::::

  const nuevoAutorizador = (dataRow) => {
    // console.log("TipoAutorizacionIdex|nuevoAutorizador|dataRow:",dataRow);
    const { IdCliente, IdCompania, IdTipoAutorizacion, NivelAprobacion } = dataRow;
    setDataRowEditNew({ IdCliente: IdCliente, IdCompania: IdCompania, IdTipoAutorizacion: IdTipoAutorizacion, Activo: 'S', GeneraSolicitud: 'N', NivelMax: NivelAprobacion, esNuevoRegistro: true, Nivel:0 });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));

    //Lista Tabs
    listarTabJustificaciones('NUEVO', dataRow);
    listarTabDivisiones('NUEVO', dataRow);
    listarTabUnidadOrganizativa('NUEVO', dataRow);

    setisVisibleFrmAutorizador(true);
    setModoEdicion(true);

  };
  // setDataJustificaciones

  const goTabMenu = () => {
    //Leer localStoreage.
    let dataRow = JSON.parse(localStorage.getItem('dataRowAutorizador'));
    /*  if (isNotEmpty(dataRow)) {
       const { IdTipoAutorizacion } = dataRow;
       setSelected(dataRow);
       setVarIdAutorizador(IdTipoAutorizacion);
     } */
  }

  const disabledTabs = (value) => {
    if (value) {
      //Eliminar LocalStorage
      localStorage.removeItem('dataRowAutorizador');

    }
  }

  const seleccionarAutorizador = async (dataRow) => {
    //Crear un registro en el navegador
    // console.log("seleccionarAutorizador|dataRow:",dataRow);
    localStorage.setItem('dataRowAutorizador', JSON.stringify(dataRow));
    disabledTabs(false);
  }



  const editarAutorizador = async (dataRow) => {
    // setFocusedRowKeyAutorizador(RowIndex);
    await obtenerAutorizador(dataRow);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    setModoEdicion(true);
    //Lista Tabs
    listarTabJustificaciones('ACTUALIZAR', dataRow);
    listarTabDivisiones('ACTUALIZAR', dataRow);
    listarTabUnidadOrganizativa('ACTUALIZAR', dataRow);
    SetInvokeContentReady(collapsed ? false : true);
  };

  async function eliminarAutorizador(dataRow, confirm) {
    setisDeleteAutorizador(true);
    setSelectedDelete(dataRow);
    // console.log("eliminarAutorizador|dataRow",dataRow);
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
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setModoEdicion(false);
    SetInvokeContentReady(collapsed ? false : true);
  }

  async function obtenerAutorizador(dataRow) {
    // console.log("obtenerAutorizador|dataRow",dataRow);
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
  };

  const cancelarAutorizador = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    SetInvokeContentReady(collapsed ? false : true);
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
        //Sin data , mostrar por defecto.
        // console.log("listarTreeviewDivisiones|dataTreeView Sin data:",dataTreeView);
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
        // console.log("listarTreeviewDivisiones|dataTreeView:",dataTreeView);
        setDivisionesTreeView(dataTreeView);
        // seleccionarNodo([],dataTreeView)
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
        //Sin data , mostrar por defecto.
        // console.log("listarTreeviewDivisiones|dataTreeView Sin data:",dataTreeView);
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
        // console.log("listarTreeviewDivisiones|dataTreeView:",dataTreeView);
        setUnidadOrganizativaTreeView(dataTreeView);
        // seleccionarNodo([],dataTreeView)
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



  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function eliminarListRowTab(selected, confirm) {
    isDeleteAutorizador ? eliminarAutorizador(selected, confirm) : eliminarRegistroTipoAutorizacionCompania(selected, confirm);
  }

  return <>

    {modoEdicion && (
      <>

        {isVisibleFrmAutorizador === true ? (
          <AutorizadorEditPage
            dataRowEditNew={dataRowEditNew}
            actualizarAutorizador={actualizarAutorizador}
            agregarAutorizador={agregarAutorizador}
            cancelarEdicion={cancelarEdicion}
            titulo={tituloTabs}
            modoEdicion={modoEdicion}
            accessButton={accessButton}
            settingDataField={props.settingDataField}
            // formatCurrency={formatCurrency}
            IdCliente={IdCliente}
            dataJustificaciones={dataJustificaciones}
            divisionesTreeView={divisionesTreeView}
            unidadOrganizativaTreeView={unidadOrganizativaTreeView}
            isVisibleAlert={isVisibleAlert}
            nivelMax={nivelMax}
            cancelarAutorizador={cancelarAutorizador}

          />
        ) :
          (
            <TipoAutorizacionCompaniaEditPage
              dataRowEditNew={dataRowEditNew}
              actualizarTipoAutorizacionCompania={actualizarTipoAutorizacionCompania}
              agregarTipoAutorizacionCompania={agregarTipoAutorizacionCompania}
              cancelarEdicion={cancelarEdicionTabsTipoAutorizacionCompania}
              titulo={tituloTabs}
              modoEdicion={modoEdicion}
              settingDataField={props.settingDataField}
              accessButton={accessButton}
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

    {!modoEdicion && (
      <>
        <TipoAutorizacionCompaniaListPage
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

        />
      </>
    )}

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

export default injectIntl(WithLoandingPanel(TipoAutorizacionCompaniaIndex));
