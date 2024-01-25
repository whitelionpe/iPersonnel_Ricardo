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
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'

import { eliminar, obtener, listar, crear, actualizar } from "../../../../api/identificacion/licencia.api";
import LicenciaListPage from "./LicenciaListPage";
import LicenciaEditPage from "./LicenciaEditPage";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";


import {
  eliminar as eliminarTipVehiculo,
  obtener as obtenerTipVehiculo,
  listar as listarTipVehiculo,
  crear as crearTipVehiculo,
  actualizar as actualizarTipVehiculo
} from "../../../../api/identificacion/tipoVehiculo.api";
import TipoVehiculoListPage from "../tipoVehiculo/TipoVehiculoListPage";
import TipoVehiculoEditPage from "../tipoVehiculo/TipoVehiculoEditPage";

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import PropTypes from 'prop-types';

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import LocalShippingIcon from '@material-ui/icons/LocalShipping';

const LicenciaIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [varIdLicencia, setVarIdLicencia] = useState("");
  const [varIdTipoVehiculo, setVarIdTipoVehiculo] = useState("");

  const [focusedRowKey, setFocusedRowKey] = useState(0);
  const [tipoVehiculoFocusedRowKey, setTipoVehiculoFocusedRowKey] = useState(0);
  const [licencias, setLicencias] = useState([]);

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

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

  //::::::::::::::::::::::::::::FUNCIONES PARA LICENCIA-:::::::::::::::::::::::::::::::::::

  async function agregarLicencia(data) {
    setLoading(true);
    const { IdLicencia, Licencia, Activo } = data;
    let param = {
      IdLicencia: isNotEmpty(IdLicencia) ? IdLicencia.toUpperCase() : "",
      Licencia: isNotEmpty(Licencia) ? Licencia.toUpperCase() : "",
      IdCliente: perfil.IdCliente,
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await crear(param)
      .then(response => {
        if (response)
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        setModoEdicion(false);
        listarLicencias();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
  }


  async function actualizarLicencia(licencia) {
    setLoading(true);
    const { IdLicencia, Licencia, Activo } = licencia;
    let params = {
      IdLicencia: isNotEmpty(IdLicencia) ? IdLicencia.toUpperCase() : "",
      Licencia: isNotEmpty(Licencia) ? Licencia.toUpperCase() : "",
      IdCliente: perfil.IdCliente,
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await actualizar(params)
      .then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        setModoEdicion(false);
        listarLicencias();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
  }


  async function eliminarRegistro(licencia, confirm) {
    setSelected(licencia);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdLicencia } = licencia;
      await eliminar({
        IdCliente: IdCliente,
        IdLicencia: IdLicencia,
        IdUsuario: usuario.username
      })
        .then(response => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
        }).finally(() => { setLoading(false); });
      listarLicencias();
    }
  }


  async function listarLicencias() {
    setLoading(true);
    await listar({
      IdCliente: perfil.IdCliente,
      NumPagina: 0,
      TamPagina: 0
    }).then(licencias => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setLicencias(licencias);
      changeTabIndex(0);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });

  }


  async function obtenerLicencia() {
    setLoading(true);
    const { IdCliente, IdLicencia } = selected;
    await obtener({
      IdCliente: IdCliente,
      IdLicencia: IdLicencia
    }).then(licencia => {
      setDataRowEditNew({ ...licencia, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }


  const nuevoRegistro = () => {
    changeTabIndex(1);
    let licencia = {
      Activo: "S",
      FechaRegistro: new Date().toJSON().slice(0, 10)
    };
    setDataRowEditNew({ ...licencia, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setVarIdLicencia("");

  };


  const editarRegistro = dataRow => {
    changeTabIndex(1);
    const { IdLicencia } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerLicencia();
  };


  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    setDataRowEditNewTabs({});
  };


  const seleccionarRegistro = dataRow => {
    const { IdLicencia, RowIndex } = dataRow;
    setModoEdicion(false);
    setSelected(dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    if (IdLicencia != varIdLicencia) {
      setVarIdLicencia(IdLicencia);
      setFocusedRowKey(RowIndex);
      setTipoVehiculoFocusedRowKey(0);
    }
  }

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerLicencia();
  };


  //Conf Botones
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 5;
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  useEffect(() => {
    listarLicencias();
    loadControlsPermission();
  }, []);


  //::::::::::::::::::::::FUNCION TIPO VEHÍCULO:::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarTipoVehiculo(dataTipoVehiculo) {
    setLoading(true);
    const { IdLicencia, IdTipoVehiculo, Activo } = dataTipoVehiculo;
    let params = {
      IdLicencia: varIdLicencia
      , IdTipoVehiculo: isNotEmpty(IdTipoVehiculo) ? IdTipoVehiculo.toUpperCase() : ""
      , Activo
      , IdCliente: perfil.IdCliente
      , IdUsuario: usuario.username
    };
    await crearTipVehiculo(params).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarTipoVehiculo();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }


  async function actualizarTipoVehiculo(tipoVehiculo) {
    setLoading(true);
    const { IdLicencia, IdTipoVehiculo, Activo } = tipoVehiculo;
    let params = {
      IdLicencia: varIdLicencia
      , IdTipoVehiculo: isNotEmpty(IdTipoVehiculo) ? IdTipoVehiculo.toUpperCase() : ""
      , Activo
      , IdCliente: perfil.IdCliente
      , IdUsuario: usuario.username
    };
    await actualizarTipVehiculo(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarTipoVehiculo();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }


  async function eliminarRegistroTipoVehiculo(tipoVehiculo, confirm) {
    setSelected(tipoVehiculo);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdLicencia, IdTipoVehiculo, IdCliente } = tipoVehiculo;
      await eliminarTipVehiculo({
        Idlicencia: IdLicencia,
        IdTipoVehiculo: IdTipoVehiculo,
        IdCliente: IdCliente,
        IdUsuario: usuario.username
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
      listarTipoVehiculo();
    }
  }

  async function listarTipoVehiculo() {
    setLoading(true);
    setModoEdicionTabs(false);
    await listarTipVehiculo({
      IdLicencia: varIdLicencia,
      IdCliente: perfil.IdCliente,
      NumPagina: 0, TamPagina: 0
    }).then(tiposVehiculos => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(tiposVehiculos);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });

  }


  async function obtenerTipoVehiculo(filtro) {
    setLoading(true);
    const { IdLicencia, IdTipoVehiculo, IdCliente } = filtro;
       /* if (IdLicencia) {
            let tipoVehiculo =*/ await obtenerTipVehiculo({
      IdLicencia: IdLicencia,
      IdTipoVehiculo: IdTipoVehiculo,
      IdCliente: IdCliente
    }).then(tipoVehiculo => {
      setDataRowEditNewTabs({ ...tipoVehiculo, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }



  const editarRegistroTipoVehiculo = dataRow => {
    setModoEdicionTabs(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerTipoVehiculo(dataRow);
  };


  const nuevoTipoVehiculo = () => {
    let nuevo = { Activo: "S" };
    setDataRowEditNewTabs({ ...nuevo, esNuevoRegistro: true });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicionTabs(true);
  };

  const seleccionarRegistroTipoVehiculo = dataRow => {
    const { RowIndex } = dataRow;
    setTipoVehiculoFocusedRowKey(RowIndex);
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

    const { IdLicencia, Licencia } = selected;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdLicencia, colSpan: 2 },
      { text: [intl.formatMessage({ id: "IDENTIFICATION.LICENSE.LICENSE" })], value: Licencia, colSpan: 4 }
    ];
  }

  async function eliminarListRowTab(selected, confirm) {
    let currentTab = tabIndex;
    switch (currentTab) {
      case 0:
        eliminarRegistro(selected, confirm);
        break;
      case 2:
        eliminarRegistroTipoVehiculo(selected, confirm);
        break;
    }
  }


  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "IDENTIFICATION.LICENSE.TAB.VEHICLETYPE"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdLicencia) ? false : true;
    //return true;
  }

  const tabContent_LicenciaListPage = () => {
    return <LicenciaListPage
      licencias={licencias}
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


  const tabContent_LicenciaEditTabPage = () => {
    return <>
      <LicenciaEditPage
        titulo={titulo}
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        actualizarLicencia={actualizarLicencia}
        agregarLicencia={agregarLicencia}
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

  const tabContent_TipoVehiculoListPage = () => {
    return <>
      {modoEdicionTabs && (
        <>
          <TipoVehiculoEditPage
            dataRowEditNew={dataRowEditNewTabs}
            actualizarTipoVehiculo={actualizarTipoVehiculo}
            agregarTipoVehiculo={agregarTipoVehiculo}
            cancelarEdicion={cancelarEdicionTabs}
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
          <TipoVehiculoListPage
            tiposVehiculos={listarTabs}
            editarRegistro={editarRegistroTipoVehiculo}
            eliminarRegistro={eliminarRegistroTipoVehiculo}
            nuevoRegistro={nuevoTipoVehiculo}
            seleccionarRegistro={seleccionarRegistroTipoVehiculo}
            cancelarEdicion={cancelarEdicion}
            getInfo={getInfo}
            accessButton={accessButton}
            focusedRowKey={tipoVehiculoFocusedRowKey}
          />
        </>
      )}

    </>
  }



  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "IDENTIFICATION.LICENSE.MENU" })}
        submenu={intl.formatMessage({ id: "IDENTIFICATION.LICENSE.SUBMENU" })}
        subtitle={intl.formatMessage({ id: "IDENTIFICATION.LICENSE.MAINTENANCE" })}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />
          },
          {
            label: intl.formatMessage({ id: "IDENTIFICATION.LICENSE.TAB" }),
            icon: <AssignmentTurnedInIcon fontSize="large" />,
            onClick: (e) => { obtenerLicencia() },
            disabled: isNotEmpty(varIdLicencia)  ? false : true
          },
          {
            label: intl.formatMessage({ id: "IDENTIFICATION.LICENSE.TAB.VEHICLETYPE" }),
            icon: <LocalShippingIcon fontSize="large" />,
            onClick: (e) => { listarTipoVehiculo() },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_LicenciaListPage(),
            tabContent_LicenciaEditTabPage(),
            tabContent_TipoVehiculoListPage()
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



export default injectIntl(WithLoandingPanel(LicenciaIndexPage));
