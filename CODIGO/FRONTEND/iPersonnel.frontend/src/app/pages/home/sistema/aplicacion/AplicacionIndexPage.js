import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import PropTypes from 'prop-types';
import { isNotEmpty } from "../../../../../_metronic";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import { Portlet } from "../../../../partials/content/Portlet";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import DynamicFeedIcon from '@material-ui/icons/DynamicFeed';
import ViewModuleIcon from '@material-ui/icons/ViewModule';
import WebIcon from '@material-ui/icons/Web';


import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import {
  obtener, listar, crear, actualizar, eliminar
} from "../../../../api/sistema/aplicacion.api";
import AplicacionListPage from "./AplicacionListPage";
import AplicacionEditPage from "./AplicacionEditPage";

import {
  obtener as obtenerMA,
  crear as crearMA,
  actualizar as actualizarMA,
  eliminar as eliminarMA,
  listar as listarMA
} from "../../../../api/sistema/moduloAplicacion.api";

import ModuloAplicacionEditPage from "./ModuloAplicacionEditPage";
import ModuloAplicacionListPage from "./ModuloAplicacionListPage";


import {
  obtener as obtenerAO,
  listar as listarAO,
  crear as crearAO,
  actualizar as actualizarAO,
  eliminar as eliminarAO
} from "../../../../api/sistema/aplicacionObjeto.api";
import AplicacionObjetoEditPage from "./AplicacionObjetoEditPage";
import AplicacionObjetoListPage from "./AplicacionObjetoListPage";

import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

const AplicacionIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();

  const [aplicacionData, setAplicacionData] = useState([]);
  const [varIdAplicacion, setVarIdAplicacion] = useState("");

  const [focusedRowKey, setFocusedRowKey] = useState();
  const [focusedRowKeyModuloAplicacion, setFocusedRowKeyModuloAplicacion] = useState();
  const [focusedRowKeyAplicacionObjeto, setFocusedRowKeyAplicacionObjeto] = useState();

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [selected, setSelected] = useState({});
  const [tabIndex, setTabIndex] = useState(0);
  const handleChange = (event, newValue) => { setTabIndex(newValue); };

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});
  const [listarTabs, setListarTabs] = useState([]);
  const [selectedDelete, setSelectedDelete] = useState({});


  async function agregarAplicacion(dataRow) {
    setLoading(true);
    const { IdAplicacion, Aplicacion, IdTipoAplicacion, UsoExterno, Activo } = dataRow;
    let params = {
      IdAplicacion: IdAplicacion.toUpperCase()
      , Aplicacion: Aplicacion.toUpperCase()
      , IdTipoAplicacion: IdTipoAplicacion
      , UsoExterno
      , Activo: Activo
      , IdUsuario: usuario.username
    }
    await crear(params).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      listarAplicacion();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function actualizarAplicacion(dataRow) {
    setLoading(true);
    const { IdAplicacion, Aplicacion, IdTipoAplicacion, UsoExterno, Activo } = dataRow;
    let params = {
      IdAplicacion: IdAplicacion.toUpperCase()
      , Aplicacion: Aplicacion.toUpperCase()
      , IdTipoAplicacion: IdTipoAplicacion
      , UsoExterno
      , Activo: Activo
      , IdUsuario: usuario.username
    }
    await actualizar(params).then(response => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarAplicacion();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdAplicacion } = dataRow;
      await eliminar({
        IdAplicacion
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        setVarIdAplicacion("");
        setFocusedRowKey(0);
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
      listarAplicacion();
    }
  }

  async function listarAplicacion() {
    setLoading(true);
    await listar(
      {
        NumPagina: 0
        , TamPagina: 0
      }
    ).then(aplicacion => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setAplicacionData(aplicacion);
      changeTabIndex(0);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function obtenerAplicacion() {
    setLoading(true);
    const { IdAplicacion } = selected;
    await obtener({
      IdAplicacion
    }).then(Aplicacion => {
      setDataRowEditNew({ ...Aplicacion, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }


  const nuevoRegistro = () => {
    changeTabIndex(1);
    let Aplicacion = { Activo: "S", UsoExterno: "N" };
    setDataRowEditNew({ ...Aplicacion, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const editarRegistro = async (dataRow) => {
    changeTabIndex(1);
    const { IdAplicacion, RowIndex } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    await obtenerAplicacion(IdAplicacion);
    setFocusedRowKey(RowIndex);
  };

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const seleccionarRegistro = dataRow => {
    const { IdAplicacion, RowIndex } = dataRow;
    setModoEdicion(false);
    setSelected(dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    // if (IdAplicacion != varIdAplicacion) {

    setVarIdAplicacion(IdAplicacion);
    setFocusedRowKey(RowIndex);
    setFocusedRowKeyModuloAplicacion(0);
    // }
    //console.log("seleccionarRegistro|IdAplicacion:",IdAplicacion);
  }

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerAplicacion(dataRow);
  };

  ///::::::::::::::::::::::::::::::: FUNCION APLICACIÓN MÓDULO :::::::::::::::::::::::::::::::::::::

  async function agregarModuloAplicacion(dataRow) {
    setLoading(true);
    const { IdModulo, IdAplicacion, Activo } = dataRow;
    let params = {
      IdModulo: isNotEmpty(IdModulo) ? IdModulo.toUpperCase() : ""
      , IdAplicacion: varIdAplicacion
      , Activo: Activo
      , IdUsuario: usuario.username
    }
    await crearMA(params).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarAplicacionModulo();
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
    await actualizarMA(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarAplicacionModulo();
      setModoEdicion(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarModuloAplicacion(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdModulo, IdAplicacion } = dataRow;
      await eliminarMA({
        IdModulo, IdAplicacion
      }).then((result) => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        listarAplicacionModulo();
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    }
  }

  async function listarAplicacionModulo() {
    setLoading(true);
    let modulos = await listarMA({
      IdModulo: "%"
      , IdAplicacion: varIdAplicacion
      , NumPagina: 0
      , TamPagina: 0
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setListarTabs(modulos);
    //changeTabIndex(2);
  }

  async function obtenerModuloAplicacion(dataRow) {
    setLoading(true);
    const { IdModulo } = dataRow;
    await obtenerMA({
      IdModulo: IdModulo,
      IdAplicacion: varIdAplicacion
    }).then(modulo => {
      //console.log("obtenerModuloAplicacion data:", modulo);
      setDataRowEditNew({ ...modulo, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const seleccionarModuloAplicacion = dataRow => {
    const { RowIndex } = dataRow;
    setFocusedRowKeyModuloAplicacion(RowIndex);
  };

  const editarModuloAplicacion = async (dataRow) => {
    //changeTabIndex(2);
    const { IdModulo, IdAplicacion, RowIndex } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setFocusedRowKeyModuloAplicacion(RowIndex);
    await obtenerModuloAplicacion(dataRow);
  };

  const cancelarEdicionModuloAplicacion = () => {
    //changeTabIndex(2);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});

  };

  const nuevoModuloAplicacion = (e) => {
    //changeTabIndex(2);
    let nuevo = { Activo: "S" };
    setDataRowEditNew({ ...nuevo, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);

  };


  //::::::::::::::::::::::::::::::::::::::::::::: Funciones Aplicacion Objeto  ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarAplicacionObjeto(listObjetos) {

    setLoading(true);
    const { IdAplicacion } = selected
    if (listObjetos.length > 0) {
      listObjetos.map(async (data) => {
        const { IdObjeto } = data;
        let params = {
          IdAplicacion: IdAplicacion
          , IdObjeto: IdObjeto
          , Activo: 'S'
          , IdUsuario: usuario.username
        };
        await crearAO(params)
          .then((response) => {
            listarAplicacionObjeto();
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
          })
          .catch((err) => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
          });
      });
    }

    setLoading(false);
  }

  async function actualizarAplicacionObjeto(datarow) {
    setLoading(true);
    const { IdAplicacion, IdObjeto, Activo, } = datarow;
    let data = {
      IdAplicacion: IdAplicacion
      , IdObjeto: IdObjeto
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await actualizarAO(data).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarAplicacionObjeto();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistroAplicacionObjeto(data, confirm) {
    setSelectedDelete(data);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdAplicacion, IdObjeto } = data;
      await eliminarAO({IdAplicacion, IdObjeto}).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarAplicacionObjeto();
    }
  }

  async function listarAplicacionObjeto() {
    setLoading(true);

    const { IdAplicacion } = selected;
    await listarAO(
      {
        IdAplicacion: IdAplicacion
        , IdObjeto: '%'
        , NumPagina: 0
        , TamPagina: 0
      }
    ).then(data => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      //changeTabIndex(3);
      setListarTabs(data)
      //console.log("listarAplicacionObjeto|data", data);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerAplicacionObjeto(dataRow) {
    setLoading(true);
    const { IdAplicacion, IdObjeto } = dataRow;
    await obtenerAO({ IdAplicacion, IdObjeto }).then(data => {
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }
  const seleccionarAplicacionObjeto = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKeyAplicacionObjeto(RowIndex);
  };


  const nuevoRegistroAplicacionObjeto = () => {
    //changeTabIndex(3);
    let data = { Activo: "S" };
    setDataRowEditNew({ ...data, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const editarRegistroAplicacionObjeto = async (dataRow) => {
    //changeTabIndex(3);
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerAplicacionObjeto(dataRow);

  };

  const cancelarAplicacionObjeto = () => {
    //changeTabIndex(3);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };


  /****************************** PRINCIPALES *****************************************/

  async function eliminarListRowTab(rowData, confirm) {
    let currentTab = tabIndex;
    
    switch (currentTab) {
      case 0:
        eliminarRegistro(rowData, confirm);
        break;
      case 2:
        eliminarModuloAplicacion(rowData, confirm);
        break;
      case 3:
        eliminarRegistroAplicacionObjeto(rowData, confirm);
        break;
    }
  }

  const getInfo = () => {
    const { IdAplicacion, Aplicacion } = selected;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdAplicacion, colSpan: 2 },
      { text: [intl.formatMessage({ id: "SYSTEM.MODULEAPLICATION.APLICATION" })], value: Aplicacion, colSpan: 4 }
    ];
  }

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  /************--Configuración de acceso de botones*************/
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 4;
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }
  /***********************************************************************/


  useEffect(() => {
    listarAplicacion();
    loadControlsPermission();
  }, []);



  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "SYSTEM.MODULE",
      "SYSTEM.OBJECT.TAB"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + "  " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdAplicacion) ? false : true;
    //return true;
  }

  const tabContent_AplicacionListPage = () => {
    return <AplicacionListPage
      titulo={titulo}
      aplicacionData={aplicacionData}
      editarRegistro={editarRegistro}
      eliminarRegistro={eliminarRegistro}
      nuevoRegistro={nuevoRegistro}
      seleccionarRegistro={seleccionarRegistro}
      verRegistroDblClick={verRegistroDblClick}
      focusedRowKey={focusedRowKey}
      accessButton={accessButton}
    />
  }
  const tabContent_AplicacionEditPage = () => {
    return <>
      <AplicacionEditPage
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        actualizarAplicacion={actualizarAplicacion}
        agregarAplicacion={agregarAplicacion}
        cancelarEdicion={cancelarEdicion}
        titulo={titulo}
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
  const tabContent_ModuloAplicacionIndexPage = () => {
    return <>
      {modoEdicion && (
        <>
          <ModuloAplicacionEditPage
            tituloApp={titulo}
            modoEdicion={modoEdicion}
            dataRowEditNew={dataRowEditNew}
            agregarModuloAplicacion={agregarModuloAplicacion}
            actualizarModuloAplicacion={actualizarModuloAplicacion}
            cancelarEdicion={cancelarEdicionModuloAplicacion}
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
          <ModuloAplicacionListPage
            modulos={listarTabs}
            seleccionarRegistro={seleccionarModuloAplicacion}
            editarRegistro={editarModuloAplicacion}
            eliminarRegistroMA={eliminarModuloAplicacion}
            nuevoRegistro={nuevoModuloAplicacion}
            cancelarEdicion={cancelarEdicion}
            focusedRowKey={focusedRowKeyModuloAplicacion}
            getInfo={getInfo}
            accessButton={accessButton}
          />
        </>
      )}
    </>
  }

  const tabContent_AplicacionObjetoIndexPage = () => {
    return <>
      {modoEdicion && (
        <>
          <AplicacionObjetoEditPage
            titulo={titulo}
            modoEdicion={modoEdicion}
            dataRowEditNew={dataRowEditNew}
            agregarAplicacionObjeto={agregarAplicacionObjeto}
            actualizarAplicacionObjeto={actualizarAplicacionObjeto}
            cancelarAplicacionObjeto={cancelarAplicacionObjeto}
            accessButton={accessButton}
            settingDataField={dataMenu.datos}
            getInfo={getInfo}
            setModoEdicion={setModoEdicion}
            IdAplicacion={varIdAplicacion}

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
          <AplicacionObjetoListPage
            aplicacionObjeto={listarTabs}
            seleccionarRegistro={seleccionarAplicacionObjeto}
            editarRegistro={editarRegistroAplicacionObjeto}
            eliminarRegistro={eliminarRegistroAplicacionObjeto}
            nuevoRegistro={nuevoRegistroAplicacionObjeto}
            cancelarEdicion={cancelarEdicion}
            focusedRowKey={focusedRowKeyAplicacionObjeto}
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
        submenu={intl.formatMessage({ id: "COMMON.CONFIGURATION" })}
        subtitle={ `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` }
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
            onClick: () => { listarAplicacion() },
          },
          {
            label: intl.formatMessage({ id: "SYSTEM.APLICATION.TAB" }),
            icon: <DynamicFeedIcon fontSize="large" />,
            onClick: (e) => { obtenerAplicacion(selected) },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "SYSTEM.MODULE" }),
            icon: <ViewModuleIcon fontSize="large" />,
            onClick: (e) => { listarAplicacionModulo() },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          },
          {
            label: intl.formatMessage({ id: "SYSTEM.OBJECT.TAB" }),
            icon: <WebIcon fontSize="large" />,
            onClick: (e) => { listarAplicacionObjeto() },
            disabled: !tabsDisabled() && accessButton.Tabs[3] ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_AplicacionListPage(),
            tabContent_AplicacionEditPage(),
            tabContent_ModuloAplicacionIndexPage(),
            tabContent_AplicacionObjetoIndexPage()
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

//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

export default injectIntl(WithLoandingPanel(AplicacionIndexPage));
