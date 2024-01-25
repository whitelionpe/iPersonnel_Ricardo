import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesTab } from "../../../../store/config/Styles";
import Confirm from "../../../../partials/components/Confirm";
import { useSelector } from "react-redux";
import { isNotEmpty } from "../../../../../_metronic";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { obtener, listar, crear, actualizar, eliminar } from "../../../../api/sistema/modulo.api";
import ModuloListPage from "../modulo/ModuloListPage";
import ModuloEditPage from "../modulo/ModuloEditPage";
import {
  obtener as obtenerAplicacion,
  crear as crearAplicacion,
  actualizar as actualizarAplicacion,
  eliminar as eliminarAplicacion
} from "../../../../api/sistema/moduloAplicacion.api";
import ModuloAplicacionEditPage from "./ModuloAplicacionEditPage";
import MenuIndexPage from "../menu/MenuIndexPage";
import {
  eliminar as eliminarModAppReporte,
  crear as crearModAppReporte,
  actualizar as actualizarModAppReporte,
  obtener as obtenerModAppReporte,
  listar as listarModAppReporte
} from "../../../../api/sistema/moduloAplicacionReporte.api";
import ModuloAplicacionReporteEditPage from "./ModuloAplicacionReporteEditPage";
import ModuloAplicacionReporteListPage from "./ModuloAplicacionReporteListPage";
import ConfiguracionModuloIndexPage from "../configuracionModulo/ConfiguracionModuloIndexPage";
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import ViewModuleIcon from '@material-ui/icons/ViewModule';
import WebIcon from '@material-ui/icons/Web';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import BuildIcon from '@material-ui/icons/Build';
import SettingsIcon from '@material-ui/icons/Settings';
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import ProcesoIndexPage from "./proceso/ProcesoIndexPage";

const ModuloAplicacionIndexPage = (props) => {

  const usuario = useSelector(state => state.auth.user);
  const { intl, setLoading, dataMenu } = props;
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);

  const [varIdModulo, setVarIdModulo] = useState("");
  const [varIdAplicacion, setVarIdAplicacion] = useState("");
  const [focusedRowKey, setFocusedRowKey] = useState();
  const [focusedRowKeyAplicacion, setFocusedRowKeyAplicacion] = useState();
  const [modulosData, setModulosData] = useState([]);

  const [selected, setSelected] = useState({});
  const [selectedReporte, setSelectedReporte] = useState({});


  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);


  //const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);

  const [collapsed, setCollapsed] = useState(false);
  const [expandRow, setExpandRow] = useState(0);


  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

  const [varIdReporte, setVarIdReporte] = useState("");
  const [modoEdicionTabs, setModoEdicionTabs] = useState(false);
  const [dataRowEditNewTabs, setDataRowEditNewTabs] = useState({});
  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [listarTabs, setListarTabs] = useState([]);
  const [focusedRowKeyReporte, setFocusedRowKeyReporte] = useState(0);
  const [isDeleteMasterDetail, setIsDeleteMasterDetail] = useState(false);

  const [varIdCliente, setVarIdCliente] = useState();
 // const [dataSource, setDataSource] = useState([]);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  ///FUNCION MODULO::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  async function agregarModulo(modulo) {
    setLoading(true);
    const { IdModulo, Modulo, Orden, Activo } = modulo;
    let params = {
      IdModulo: isNotEmpty(IdModulo) ? IdModulo.toUpperCase() : ""
      , Modulo: isNotEmpty(Modulo) ? Modulo.toUpperCase() : ""
      , Orden: isNotEmpty(Orden) ? Orden : 0
      , Activo: Activo
      , IdUsuario: usuario.username
    }
    await crear(params).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      listarModulos();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarModulo(modulo) {
    setLoading(true);
    const { IdModulo, Modulo, Orden, Activo } = modulo;
    let params = {
      IdModulo: isNotEmpty(IdModulo) ? IdModulo.toUpperCase() : ""
      , Modulo: isNotEmpty(Modulo) ? Modulo.toUpperCase() : ""
      , Orden: isNotEmpty(Orden) ? Orden : 0
      , Activo: Activo
      , IdUsuario: usuario.username
    }
    await actualizar(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarModulos();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro(modulo, confirm) {
    setIsDeleteMasterDetail(false);
    setSelected(modulo);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdModulo } = modulo;
      await eliminar({
        IdModulo: IdModulo,
        IdUsuario: usuario.username
      }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarModulos();
    }
  }

  async function listarModulos() {
    setLoading(true);
    //bloquear tab.
    disabledTabs(true);
    let modulos = await listar({
      IdModulo: "%"
      , Modulo: "%"
      , NumPagina: 0
      , TamPagina: 0
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setModulosData(modulos);
    changeTabIndex(0);

  }

  async function obtenerModulo(IdModulo) {
    setLoading(true);
    await obtener({
      IdModulo: IdModulo
    }).then(modulo => {
      setDataRowEditNew({ ...modulo, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  const nuevoRegistro = () => {
    changeTabIndex(1);
    let modulo = {
      Activo: "S",
      FechaRegistro: new Date().toJSON().slice(0, 10)
    };
    setDataRowEditNew({ ...modulo, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setVarIdModulo("");
    setVarIdAplicacion("");
  };

  const editarRegistro = async (dataRow) => {
    changeTabIndex(1);
    const { IdModulo, RowIndex } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    //setFocusedRowKey(RowIndex);
    //setVarIdModulo(IdModulo);
    await obtenerModulo(IdModulo);
  };

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  }

  const cancelarEdicionPrincipal = async () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setDataRowEditNew({});

  }

  const seleccionarModulo = dataRow => {
    const { IdModulo, RowIndex } = dataRow;

    if (IdModulo !== varIdModulo) {
      setVarIdCliente(IdCliente);
      setVarIdModulo(IdModulo);
      setFocusedRowKey(RowIndex);
      //Control externo.
      disabledTabs(true);
      setExpandRow(RowIndex);
      setCollapsed(false);
    }
  }

  //Botones
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 6;
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  //::::::::::::::::::::::::::::: useEffect :::::::::::::::::::::::::::::::::::::::::::::::::::::
  useEffect(() => {
    listarModulos();
    //listarModuloAplicacion();
    //setLoading(false);
    loadControlsPermission();
  }, []);
  //::::::::::::::::::::::::::::: MODULO APLICACION  :::::::::::::::::::::::::::::::::::::::::::::::::::::
  const disabledTabs = (value) => {
    if (value) {
      //Eliminar LocalStorage
      localStorage.removeItem('dataRowAplication');
      //bloquear tab-Menu
      //document.getElementById("vertical-tab-1").classList.add("Mui-disabled");
      document.getElementById("vertical-tab-2").classList.add("Mui-disabled");
      document.getElementById("vertical-tab-3").classList.add("Mui-disabled");
      document.getElementById("vertical-tab-4").classList.add("Mui-disabled");
      document.getElementById("vertical-tab-5").classList.add("Mui-disabled");
    } else {
      //desbloquear tab-Menu
      //document.getElementById("vertical-tab-1").classList.remove("Mui-disabled");
      document.getElementById("vertical-tab-2").classList.remove("Mui-disabled");
      document.getElementById("vertical-tab-3").classList.remove("Mui-disabled");
      document.getElementById("vertical-tab-4").classList.remove("Mui-disabled");
      document.getElementById("vertical-tab-5").classList.remove("Mui-disabled");
    }
  }
  const goTabMenu = () => {
    //Leer localStoreage.
    let dataRow = JSON.parse(localStorage.getItem('dataRowAplication'));
    // console.log("goTabMenu|dataRow:",dataRow);
    if (isNotEmpty(dataRow)) {
      const { IdAplicacion } = dataRow;
      setSelected(dataRow);
      setVarIdAplicacion(IdAplicacion);
      disabledTabs(false);
    } else {
      disabledTabs(true);
    }
  }


  const seleccionarAplicacion = async (dataRow) => {
    localStorage.setItem('dataRowAplication', JSON.stringify(dataRow));
    disabledTabs(false);
  }

  async function agregarModuloAplicacion(dataRow) {
    setLoading(true);
    const { IdModulo, IdAplicacion, Activo } = dataRow;
    let params = {
      IdModulo: isNotEmpty(IdModulo) ? IdModulo.toUpperCase() : ""
      , IdAplicacion: isNotEmpty(IdAplicacion) ? IdAplicacion.toUpperCase() : ""
      , Activo: Activo
      , IdUsuario: usuario.username
    }
    await crearAplicacion(params).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));

      setModoEdicion(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarModuloAplicacion(dataRow) {
    setLoading(true);
    const { IdModulo, IdAplicacion, Activo } = dataRow;
    let params = {
      IdModulo: isNotEmpty(IdModulo) ? IdModulo.toUpperCase() : ""
      , IdAplicacion: isNotEmpty(IdAplicacion) ? IdAplicacion.toUpperCase() : ""
      , Activo: Activo
      , IdUsuario: usuario.username
    }
    await actualizarAplicacion(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));

      setModoEdicion(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarModuloAplicacion(dataRow, confirm) {
    setIsDeleteMasterDetail(true);
    setSelected(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdModulo, IdAplicacion } = dataRow;
      await eliminarAplicacion({
        IdModulo,
        IdAplicacion
      }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      //setFocusedRowKeyAplicacion();
      setVarIdAplicacion("");
    }
  }

  async function obtenerModuloAplicacion(IdModulo, IdAplicacion) {
    setLoading(true);
    await obtenerAplicacion({
      IdModulo: IdModulo,
      IdAplicacion: IdAplicacion
    }).then(modulo => {
      setDataRowEditNew({ ...modulo, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const editarModuloAplicacion = async (dataRow) => {
    const { IdModulo, IdAplicacion, RowIndex } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    //setFocusedRowKeyAplicacion(RowIndex);
    await obtenerModuloAplicacion(IdModulo, IdAplicacion);
  };

  const cancelarEdicionApp = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});

  };

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //Módulo Aplicación Reporte

  async function listarModuloAplicacionReporte(filtro) {
    setLoading(true);
    setModoEdicionTabs(false);
    await listarModAppReporte({
      IdCliente,
      IdModulo: varIdModulo,
      IdAplicacion: varIdAplicacion,
      IdReporte: "%",
      NumPagina: 0,
      TamPagina: 0
    }).then(reportes => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(reportes);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function agregarModuloAplicacionReporte(dataReporte) {
    setLoading(true);
    const { IdModulo, IdAplicacion, IdReporte, Reporte, Descripcion, Objeto, Orden, Activo } = dataReporte;
    let params = {
      IdCliente
      , IdModulo: varIdModulo
      , IdAplicacion: varIdAplicacion
      , IdReporte: isNotEmpty(IdReporte) ? IdReporte.toUpperCase() : ""
      , Reporte: isNotEmpty(Reporte) ? Reporte.toUpperCase() : ""
      , Descripcion: isNotEmpty(Descripcion) ? Descripcion.toUpperCase() : ""
      , Orden: isNotEmpty(Orden) ? Orden : 0
      , Objeto: isNotEmpty(Objeto) ? Objeto.toUpperCase() : ""
      , Activo
      , IdUsuario: usuario.username
    };
    await crearModAppReporte(params).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarModuloAplicacionReporte();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarModuloAplicacionReporte(dataRow) {
    setLoading(true);
    const { IdModulo, IdAplicacion, IdReporte, Reporte, Descripcion, Objeto, Orden, Activo } = dataRow;
    let params = {
      IdCliente
      , IdModulo
      , IdAplicacion
      , IdReporte: isNotEmpty(IdReporte) ? IdReporte.toUpperCase() : ""
      , Reporte: isNotEmpty(Reporte) ? Reporte.toUpperCase() : ""
      , Descripcion: isNotEmpty(Descripcion) ? Descripcion.toUpperCase() : ""
      , Objeto: isNotEmpty(Objeto) ? Objeto.toUpperCase() : ""
      , Orden: isNotEmpty(Orden) ? Orden : 0
      , Activo
      , IdUsuario: usuario.username
    };
    await actualizarModAppReporte(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarModuloAplicacionReporte();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarModuloAplicacionReporte(reporte, confirm) {
    setSelectedReporte(reporte);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdModulo, IdAplicacion, IdReporte } = reporte;
      await eliminarModAppReporte({
        IdCliente,
        IdModulo,
        IdAplicacion,
        IdReporte,
        IdUsuario: usuario.username
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarModuloAplicacionReporte();
    }
  }

  async function obtenerModuloAplicacionReporte(filtro) {
    setLoading(true);
    const { IdCliente, IdModulo, IdAplicacion, IdReporte } = filtro;
    await obtenerModAppReporte({
      IdCliente,
      IdModulo,
      IdAplicacion,
      IdReporte
    }).then(reportes => {
      setDataRowEditNewTabs({ ...reportes, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    })
      .finally(() => { setLoading(false); });
  }

  const editarModuloAplicacionReporte = async (dataRow) => {
    setModoEdicionTabs(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerModuloAplicacionReporte(dataRow);
  };

  const nuevoModuloAplicacionReporte = async (dataRow) => {
    const { IdCliente, IdModulo, IdAplicacion } = dataRow;
    let nuevo = {
      IdCliente,
      IdModulo,
      IdAplicacion,
      Activo: "S"
    };
    setDataRowEditNewTabs({ ...nuevo, IdModulo: IdModulo, IdAplicacion: IdAplicacion, esNuevoRegistro: true });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicionTabs(true);
  };

  const cancelarEdicionModuloAplicacionReporte = () => {
    changeTabIndex(3);
    setModoEdicionTabs(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNewTabs({});
  };

  const seleccionarRegistroModuloAplicacionReporte = dataRow => {
    const { IdReporte, RowIndex } = dataRow;
    setModoEdicion(false);
    setSelectedReporte(dataRow);
    if (IdReporte != varIdReporte) {
      setVarIdReporte(IdReporte);
      setFocusedRowKeyReporte(RowIndex);
      disabledTabs(false);
    }
  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
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

  const nuevoModuloAplicacion = (dataRow) => {
    const { IdModulo } = dataRow;
    let nuevo = { Activo: "S" };
    setDataRowEditNew({ ...nuevo, IdModulo: IdModulo, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  async function eliminarListRowTab(selected, confirm) {
    let currentTab = tabIndex;
    switch (currentTab) {
      case 0:
        isDeleteMasterDetail ? eliminarModuloAplicacion(selected, confirm) : eliminarRegistro(selected, confirm);
        break;
      // case 2:
      //     eliminarModuloAplicacion(selected, confirm);
      //     break;
      case 3:
        eliminarModuloAplicacionReporte(selectedReporte, confirm);
        break;
    }
  }

  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "SYSTEM.MODULEAPLICATION.MENU.SCREEN",
      "CONFIG.MENU.ACCESO.REPORTES",
      "SYSTEM.CONFIGURATIONS",
      "SYSTEM.PROCESS.PROCESSES"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + "  " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdModulo) ? false : true;
    //return true;
  }
  const tabContent_ModuloListPage = () => {
    return <>
      {!modoEdicion && (

        <ModuloListPage
          modulosData={modulosData}
          titulo={titulo}
          editarRegistro={editarRegistro}
          eliminarRegistro={eliminarRegistro}
          nuevoRegistro={nuevoRegistro}
          seleccionarRegistro={seleccionarModulo}
          focusedRowKey={focusedRowKey}

          seleccionarAplicacion={seleccionarAplicacion}
          focusedRowKeyAplicacion={focusedRowKeyAplicacion}
          insertarRegistro={nuevoModuloAplicacion}
          editarModuloAplicacion={editarModuloAplicacion}
          eliminarModuloAplicacion={eliminarModuloAplicacion}
          expandRow={{ expandRow, setExpandRow }}
          collapsedRow={{ collapsed, setCollapsed }}
        />
      )}
      {modoEdicion && (
        <>
          <ModuloAplicacionEditPage
            tituloApp={titulo}
            modoEdicion={modoEdicion}
            dataRowEditNewApp={dataRowEditNew}
            actualizarModuloAplicacion={actualizarModuloAplicacion}
            agregarModuloAplicacion={agregarModuloAplicacion}
            cancelarEdicionApp={cancelarEdicionApp}
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
      )}
    </>
  }

  const tabContent_ModuloEditPage = () => {
    return <>
      <ModuloEditPage
        titulo={titulo}
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        actualizarModulo={actualizarModulo}
        agregarModulo={agregarModulo}
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

  const tabContent_MenuPage = () => {
    return <>
      <MenuIndexPage
        varIdModulo={varIdModulo}
        varIdAplicacion={varIdAplicacion}
        moduloAplicacion={selected}
        cancelarIndex={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        TipoAplicacion = { selected.TipoAplicacion }
      />
    </>
  }

  const tabContent_ModuloAplicacionReporte = () => {
    return <>
      {modoEdicionTabs && (
        <>
          <ModuloAplicacionReporteEditPage
            dataRowEditNew={dataRowEditNewTabs}
            actualizarModuloAplicacionReporte={actualizarModuloAplicacionReporte}
            agregarModuloAplicacionReporte={agregarModuloAplicacionReporte}
            cancelarEdicion={cancelarEdicionModuloAplicacionReporte}
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
          <ModuloAplicacionReporteListPage
            reportes={listarTabs}
            editarRegistro={editarModuloAplicacionReporte}
            eliminarRegistro={eliminarModuloAplicacionReporte}
            nuevoRegistro={nuevoModuloAplicacionReporte}
            seleccionarRegistro={seleccionarRegistroModuloAplicacionReporte}
            cancelarEdicion={cancelarEdicion}
            getInfo={getInfo}
            focusedRowKey={focusedRowKeyReporte}
            varIdModulo={varIdModulo}
            varIdAplicacion={varIdAplicacion}
          />
        </>
      )}
    </>
  }

  const tabContent_ConfiguracionModulo = () => {
    return <>
      <ConfiguracionModuloIndexPage
        varIdModulo={varIdModulo}
        varIdAplicacion={varIdAplicacion}
        configuracionModulo={selected}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        selected={selected}
        varIdCliente={varIdCliente}
        dataRowEditNew={dataRowEditNew}
      />
    </>
  }


  
  const tabContent_ProcesoIndexPage = () => {
    return <>
      <ProcesoIndexPage
        varIdModulo={varIdModulo}
        varIdAplicacion={varIdAplicacion}
        configuracionModulo={selected}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        selected={selected}
        varIdCliente={varIdCliente}
        dataRowEditNew={dataRowEditNew}
      />
    </>
  }


  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "SYSTEM" })}
        submenu={intl.formatMessage({ id: "COMMON.CONFIGURATION" })}
        subtitle={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}

        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        //value={''}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />
          },
          {
            label: intl.formatMessage({ id: "SYSTEM.MODULE" }),
            icon: <ViewModuleIcon fontSize="large" />,
            onClick: (e) => { obtenerModulo(varIdModulo) },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "SYSTEM.MODULEAPLICATION.MENU.SCREEN" }),
            icon: <WebIcon fontSize="large" />,
            onClick: (e) => { goTabMenu(); },
          },
          {
            label: intl.formatMessage({ id: "CONFIG.MENU.ACCESO.REPORTES" }),
            icon: <InsertDriveFileIcon fontSize="large" />,
            onClick: () => { goTabMenu(); listarModuloAplicacionReporte(); },
          },
          {
            label: intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS" }),
            icon: <BuildIcon fontSize="large" />,
            onClick: () => { goTabMenu(); },
          },
          {
            label: intl.formatMessage({ id: "SYSTEM.PROCESS.PROCESSES" }),
            icon: <SettingsIcon fontSize="large" />,
            onClick: () => { goTabMenu(); },
          },
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_ModuloListPage(),
            tabContent_ModuloEditPage(),
            tabContent_MenuPage(),
            tabContent_ModuloAplicacionReporte(),
            tabContent_ConfiguracionModulo(),
            tabContent_ProcesoIndexPage()
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

export default injectIntl(WithLoandingPanel(ModuloAplicacionIndexPage));
