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

import { obtener, listar, crear, actualizar, eliminar, } from "../../../../api/sistema/tipoequipo.api";
import {
  eliminar as eliminarTipoEqModelo
  , obtener as obtenerTipoEqModelo
  , listar as listarTipoEqModelo
  , crear as crearTipoEqModelo
  , actualizar as actualizarTipoEqModelo
} from "../../../../api/sistema/tipoequipoModelo.api";

import TipoEquipoListPage from "./TipoEquipoListPage";
import TipoEquipoEditPage from "./TipoEquipoEditPage";
import TipoEquipoModeloListPage from "./TipoEquipoModeloListPage";
import TipoEquipoModeloEditPage from "./TipoEquipoModeloEditPage";

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import PropTypes from 'prop-types';

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import PhonelinkSetupIcon from '@material-ui/icons/PhonelinkSetup';
import FileCopyIcon from '@material-ui/icons/FileCopy';

//import HeaderInformation from "../../../../partials/components/HeaderInformation";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

const TipoEquipoIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);

  const [varIdTipoEquipo, setVarIdTipoEquipo] = useState("");
  const [focusedRowKey, setFocusedRowKey] = useState();
  const [tipoEquipos, setTipoEquipos] = useState([]);

  //Datos principales
  const [selected, setSelected] = useState({});

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);

  const [modoEdicionTabs, setModoEdicionTabs] = useState(false);
  const [dataRowEditNewTabs, setDataRowEditNewTabs] = useState({});
  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [listarTabs, setListarTabs] = useState([]);

  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);

  const [collapsed, setCollapsed] = useState(false);
  const [expandRow, setExpandRow] = useState(0);

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

  const handleChange = (event, newValue) => {
    //Estado cambio de tabs
    setTabIndex(newValue);
  };


  //::::::::::::::::::::::::::::FUNCIONES PARA GESTIÓN TIPO EQUIPO-:::::::::::::::::::::::::::::::::::

  async function agregarTipoEquipo(tipoEquipo) {
    setLoading(true);
    const { IdTipoEquipo, IdTipoEquipoHijo, TipoEquipo, Observacion, EquipoFijo, Activo } = tipoEquipo;
    let params = {
      IdTipoEquipo: IdTipoEquipo.toUpperCase()
      , IdTipoEquipoHijo: isNotEmpty(IdTipoEquipoHijo) ? IdTipoEquipoHijo.toUpperCase() : ""
      , TipoEquipo: isNotEmpty(TipoEquipo) ? TipoEquipo.toUpperCase() : ""
      , Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : ""
      , EquipoFijo: isNotEmpty(EquipoFijo) ? EquipoFijo : ""
      , Activo
      , IdUsuario: usuario.username
    }
    await crear(params).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      listarTipoEquipos();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }


  async function actualizarTipoEquipo(tipoEquipo) {
    setLoading(true);
    const { IdTipoEquipo, IdTipoEquipoHijo, TipoEquipo, Observacion, EquipoFijo, Activo, messageDelete } = tipoEquipo;
    let params = {
      IdTipoEquipo: isNotEmpty(IdTipoEquipo) ? IdTipoEquipo.toUpperCase() : ""
      , IdTipoEquipoHijo: isNotEmpty(IdTipoEquipoHijo) ? IdTipoEquipoHijo.toUpperCase() : ""
      , TipoEquipo: isNotEmpty(TipoEquipo) ? TipoEquipo.toUpperCase() : ""
      , Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : ""
      , EquipoFijo: isNotEmpty(EquipoFijo) ? EquipoFijo : ""
      , Activo
      , IdUsuario: usuario.username
    }
    await actualizar(params).then(response => {
      if (isNotEmpty(messageDelete)) {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      } else {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      }
      setModoEdicion(false);
      listarTipoEquipos();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro(tipoEquipo, confirm) {
    setSelected(tipoEquipo);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdTipoEquipo } = tipoEquipo;
      await eliminar({
        IdTipoEquipo,
        IdUsuario: usuario.username
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
      listarTipoEquipos();
    }
  }


  async function listarTipoEquipos() {
    setLoading(true);
    await listar(
      {
        IdTipoEquipo: "%"
        , TipoEquipo: "%"
        , NumPagina: 0
        , TamPagina: 0
      }).then(tipoEquipos => {
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setTipoEquipos(tipoEquipos);
        changeTabIndex(0);
      }
      ).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });

  }


  async function obtenerTipoEquipo(filtro) {
    setLoading(true);
    const { IdTipoEquipo } = selected;
    await obtener({
      IdTipoEquipo
    }).then(tipoEquipo => {
      setDataRowEditNew({ ...tipoEquipo, esNuevoRegistro: false, asignarHijo: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  const nuevoRegistro = (dataRow) => {
    changeTabIndex(1);
    const { IdTipoEquipo, IdTipoEquipoHijo, TipoEquipo, Observacion, EquipoFijo, Activo } = dataRow;
    let tipoEquipo = {};
    if (isNotEmpty(IdTipoEquipo)) {
      //Actualizar-Hijo
      setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
      tipoEquipo = { IdTipoEquipo, IdTipoEquipoHijo, TipoEquipo, Observacion, EquipoFijo, Activo, esNuevoRegistro: false, asignarHijo: true };
    } else {
      setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
      //setVarIdTipoEquipo("");
      tipoEquipo = { Activo: "S", IdTipoEquipoHijo: "", esNuevoRegistro: true, asignarHijo: false };
    }
    setDataRowEditNew({ ...tipoEquipo });
    setModoEdicion(true); 

  };


  const editarRegistro = async (dataRow) => {
    changeTabIndex(1);
    const { IdTipoEquipo } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setVarIdTipoEquipo(IdTipoEquipo);
    await obtenerTipoEquipo(dataRow);
  };


  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    setDataRowEditNewTabs({});
    //setVarIdTipoEquipo("");
  };


  const seleccionarRegistro = async (dataRow) => {
    //const { RowIndex } = dataRow;
    const { IdTipoEquipo, RowIndex } = dataRow;
    console.log("seleccionarRegistro", dataRow);
    //Datos Principales       
    setModoEdicion(false);
    if (IdTipoEquipo != varIdTipoEquipo) {
      setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
      setVarIdTipoEquipo(IdTipoEquipo);
      //await obtenerTipoEquipo(dataRow);

      setFocusedRowKey(RowIndex);
      setSelected(dataRow);

      setExpandRow(RowIndex);
      setCollapsed(false);
    }
  };

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerTipoEquipo(dataRow.IdTipoEquipo);
  };

  /**Configuración Botones**************************************** */
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 3; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  /*********************************************************** */



  useEffect(() => {
    listarTipoEquipos();
    loadControlsPermission();
  }, []);


  //::::::::::::::::::::::FUNCION TIPO EQUIPO MODELO:::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarTipoEquipoModelo(tipoEquipoModelo) {
    setLoading(true);
    const { IdTipoEquipo, IdModelo, Modelo, Observacion, Foto, Activo } = tipoEquipoModelo;
    let params = {
      IdTipoEquipo
      , IdModelo: isNotEmpty(IdModelo) ? IdModelo.toUpperCase() : ""
      , Modelo: isNotEmpty(Modelo) ? Modelo.toUpperCase() : ""
      , Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : ""
      , Foto: isNotEmpty(Foto) ? Foto : ""
      , Activo
      , IdUsuario: usuario.username
    };
    await crearTipoEqModelo(params).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarTipoEquipoModelo();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }


  async function actualizarTipoEquipoModelo(tipoequipoModelo) {
    setLoading(true);
    const { IdTipoEquipo, IdModelo, Modelo, Observacion, Foto, Activo } = tipoequipoModelo;
    let params = {
      IdTipoEquipo
      , IdModelo: isNotEmpty(IdModelo) ? IdModelo.toUpperCase() : ""
      , Modelo: isNotEmpty(Modelo) ? Modelo.toUpperCase() : ""
      , Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : ""
      , Foto: isNotEmpty(Foto) ? Foto : ""
      , Activo
      , IdUsuario: usuario.username
    };
    await actualizarTipoEqModelo(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarTipoEquipoModelo();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }


  async function eliminarRegistroTipoEquipoModelo(tipoequipoModelo, confirm) {
    setSelected(tipoequipoModelo);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdTipoEquipo, IdModelo } = tipoequipoModelo;
      await eliminarTipoEqModelo({ IdTipoEquipo, IdModelo, IdUsuario: usuario.username }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
      listarTipoEquipoModelo();
    }
  }


  async function listarTipoEquipoModelo() {
    setLoading(true);
    setModoEdicionTabs(false);
    await listarTipoEqModelo({
      IdTipoEquipo: varIdTipoEquipo, NumPagina: 0, TamPagina: 0
    }).then(tipoequipoModelos => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(tipoequipoModelos);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }


  async function obtenerTipoEquipoModelo(filtro) {
    setLoading(true);
    const { IdTipoEquipo, IdModelo } = filtro;
    await obtenerTipoEqModelo({
      IdTipoEquipo, IdModelo
    }).then(tipoequipoModelo => {
      setDataRowEditNewTabs({ ...tipoequipoModelo, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }


  const editarRegistroTipoEquipoModelo = dataRow => {
    setModoEdicionTabs(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerTipoEquipoModelo(dataRow);
  };


  const nuevoRegistroTabs = () => {
    let nuevo = { Activo: "S", IdTipoEquipo: varIdTipoEquipo };
    setDataRowEditNewTabs({ ...nuevo, esNuevoRegistro: true });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicionTabs(true);
  };


  const cancelarEdicionTabs = () => {
    setModoEdicionTabs(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNewTabs({});
  };


  //Datos Principales
  const changeTabIndex = (index) => {
    handleChange(null, index);
  }


  const getInfo = () => {
    const { IdTipoEquipo, TipoEquipo } = selected;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdTipoEquipo, colSpan: 2 },
      { text: [intl.formatMessage({ id: "SYSTEM.TEAM.TEAMTYPE" })], value: TipoEquipo, colSpan: 4 }
    ];

  }

  async function eliminarListRowTab(selected, confirm) {
    let currentTab = tabIndex;
    switch (currentTab) {
      case 0:
        eliminarRegistro(selected, confirm);
        break;
      case 2:
        eliminarRegistroTipoEquipoModelo(selected, confirm);
        break;
    }
  }


  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "", 
      "",
      "SYSTEM.TEAM.MODEL"
    ];
   
    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`): "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + "  " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdTipoEquipo) ? false : true;
    //return true;
  }

  const tabContent_TipoEquipoListPage = () => {
    return <TipoEquipoListPage
      tipoEquipos={tipoEquipos}
      titulo={titulo}
      editarRegistro={editarRegistro}
      eliminarRegistro={eliminarRegistro}
      nuevoRegistro={nuevoRegistro}
      insertarRegistro={nuevoRegistro}
      actualizarRegistro={actualizarTipoEquipo}
      seleccionarRegistro={seleccionarRegistro}
      //verRegistroDblClick={verRegistroDblClick}
      focusedRowKey={focusedRowKey}

      expandRow={{ expandRow, setExpandRow }}
      collapsedRow={{ collapsed, setCollapsed }}
      accessButton={accessButton}
    />
  }


  const tabContent_TipoEquipoEditPage = () => {
    return <>
      <TipoEquipoEditPage
        titulo={titulo}
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        actualizarTipoEquipo={actualizarTipoEquipo}
        agregarTipoEquipo={agregarTipoEquipo}
        cancelarEdicion={cancelarEdicion}
        idTipoEquipo={varIdTipoEquipo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
      />
      <div className="container_only">
        <div className="float-right">
          <ControlSwitch
            checked={auditoriaSwitch}
            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
          /><b> {intl.formatMessage({ id: "AUDIT.DATA" })} </b>
        </div>
      </div>
      {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
    </>
  }

  const tabContent_TipoEquipoModeloListPage = () => {
    return <>
      {modoEdicionTabs && (
        <>
          <TipoEquipoModeloEditPage
            modoEdicion={modoEdicionTabs}
            dataRowEditNew={dataRowEditNewTabs}
            actualizarTipoEquipoModelo={actualizarTipoEquipoModelo}
            agregarTipoEquipoModelo={agregarTipoEquipoModelo}
            cancelarEdicion={cancelarEdicionTabs}
            titulo={tituloTabs}
            accessButton={accessButton}
            settingDataField={dataMenu.datos}
          />
          <div className="container_only">
            <div className="float-right">
              <ControlSwitch checked={auditoriaSwitch}
                onChange={e => { setAuditoriaSwitch(e.target.checked) }}
              /><b>{intl.formatMessage({ id: "AUDIT.DATA" })} </b>
            </div>
          </div>
          {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewTabs} />)}
        </>

      )}
      {!modoEdicionTabs && (
        <>
          <TipoEquipoModeloListPage
            tipoequipoModelos={listarTabs}
            editarRegistro={editarRegistroTipoEquipoModelo}
            eliminarRegistro={eliminarRegistroTipoEquipoModelo}
            nuevoRegistro={nuevoRegistroTabs}
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
        submenu={intl.formatMessage({ id: "SYSTEM.TYPE.DEVICE.CONFIGURATION" })}
        subtitle={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}        
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        //value={''}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
            onClick: () => { listarTipoEquipos() },
          },
          {
            label: intl.formatMessage({ id: "SYSTEM.TEAM.TEAMTYPE" }),
            icon: <PhonelinkSetupIcon fontSize="large" />,
            onClick: (e) => { obtenerTipoEquipo(selected) },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "SYSTEM.TEAM.MODEL" }),
            icon: <FileCopyIcon fontSize="large" />,
            onClick: (e) => { listarTipoEquipoModelo() },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_TipoEquipoListPage(),
            tabContent_TipoEquipoEditPage(),
            tabContent_TipoEquipoModeloListPage()
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

export default injectIntl(WithLoandingPanel(TipoEquipoIndexPage));
