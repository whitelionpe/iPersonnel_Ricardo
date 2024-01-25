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
import PublicIcon from '@material-ui/icons/Public';
import LocalAtmIcon from '@material-ui/icons/LocalAtm';
import DateRange from '@material-ui/icons/DateRange';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import {
  obtener, listar, crear, actualizar, eliminar
} from "../../../../api/sistema/pais.api";
import PaisListPage from "./PaisListPage";
import PaisEditPage from "./PaisEditPage";
import {
  eliminar as eliminarPMoneda, obtener as obtenerPMoneda, listar as listarPMoneda, crear as crearPMoneda, actualizar as actualizarPMoneda
} from "../../../../api/sistema/paisMoneda.api";
import PaisMonedaListPage from "../pais/PaisMonedaListPage";
import PaisMonedaEditPage from "../pais/PaisMonedaEditPage";

import FeriadoEditPage from "../feriado/FeriadoEditPage";
import FeriadoListPage from "../feriado/FeriadoListPage";

import {
  eliminar as eliminarFeriado, obtener as obtenerFeriado, listar as listarFeriado, crear as crearFeriado, actualizar as actualizarFeriado
} from "../../../../api/sistema/feriado.api";


import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

const PaisIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();

  const [paises, setPaises] = useState([]);
  const [varIdPais, setVarIdPais] = useState("");
  const [focusedRowKey, setFocusedRowKey] = useState(0);
  const [focusedRowKeyFeriado, setFocusedRowKeyFeriado] = useState(0);
  const [diaActualizar, setDiaActualizar] = useState("");

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

  async function agregarPais(pais) {
    setLoading(true);
    const { IdPais, Pais, Activo } = pais;
    let params = {
      IdPais: isNotEmpty(IdPais) ? IdPais.toUpperCase() : ""
      , Pais: isNotEmpty(Pais) ? Pais.toUpperCase() : ""
      , Activo: Activo
      , IdUsuario: usuario.username
    }
    await crear(params).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      listarPaises();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarPais(pais) {
    setLoading(true);
    const { IdPais, Pais, Activo } = pais;
    let params = {
      IdPais: isNotEmpty(IdPais) ? IdPais.toUpperCase() : ""
      , Pais: isNotEmpty(Pais) ? Pais.toUpperCase() : ""
      , Activo: Activo
      , IdUsuario: usuario.username
    }
    await actualizar(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarPaises();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro(pais, confirm) {
    setSelected(pais);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdPais } = pais;
      await eliminar({ IdPais, IdUsuario: usuario.username }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarPaises();
    }
  }

  async function listarPaises() {
    setLoading(true);
    await listar(
      {
        IdPais: "%"
        , Pais: "%"
        , NumPagina: 0
        , TamPagina: 0
      }).then(paises => {
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setPaises(paises);
        changeTabIndex(0);
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function obtenerPais() {
    setLoading(true);
    const { IdPais } = selected;
    await obtener({
      IdPais
    }).then(pais => {
      setDataRowEditNew({ ...pais, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const nuevoRegistro = () => {
    changeTabIndex(1)
    let pais = { Activo: "S" };
    setDataRowEditNew({ ...pais, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const editarRegistro = async (dataRow) => {
    changeTabIndex(1);
    const { IdPais, RowIndex } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    await obtenerPais(IdPais);
    setFocusedRowKey(RowIndex);
  };

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const seleccionarRegistro = dataRow => {
    const { IdPais, RowIndex } = dataRow;
    setModoEdicion(false);
    setSelected(dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    if (IdPais != varIdPais) {
      setVarIdPais(IdPais);
      setFocusedRowKey(RowIndex);
    }
  }

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerPais(dataRow);
  };


  /************--Configuración de acceso de botones*************/
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 4; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  /***********************************************************************/


  //::::::::::::::::::::::PAIS-MONEDAS::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarPaisMoneda(dataPaisMoneda) {
    setLoading(true);
    const { IdPais, IdMoneda, Activo } = dataPaisMoneda;
    let params = {
      IdPais: varIdPais
      , IdMoneda: isNotEmpty(IdMoneda) ? IdMoneda.toUpperCase() : ""
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await crearPMoneda(params).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarPaisMoneda();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function actualizarPaisMoneda(paisMoneda) {
    setLoading(true);
    const { IdPais, IdMoneda, Activo } = paisMoneda;
    let params = {
      IdPais: varIdPais
      , IdMoneda: isNotEmpty(IdMoneda) ? IdMoneda.toUpperCase() : ""
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await actualizarPMoneda(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarPaisMoneda();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function eliminarRegistroPaisMoneda(paisMoneda, confirm) {
    setSelected(paisMoneda);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdPais, IdMoneda } = paisMoneda;
      await eliminarPMoneda({
        IdPais: IdPais,
        IdMoneda: IdMoneda,
        IdUsuario: usuario.username
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarPaisMoneda();
    }
  }

  async function listarPaisMoneda() {
    setLoading(true);

    await listarPMoneda({
      IdPais: varIdPais,
      IdMoneda: '%',
      NumPagina: 0, TamPagina: 0
    }).then(paisMonedas => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(paisMonedas);
      setModoEdicion(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }


  async function obtenerPaisMoneda(filtro) {
    setLoading(true);
    const { IdPais, IdMoneda } = filtro;
    await obtenerPMoneda({
      IdPais: IdPais,
      IdMoneda: IdMoneda,
    }).then(paisMoneda => {
      setDataRowEditNew({ ...paisMoneda, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    })
      .finally(() => { setLoading(false); });
  }




  const editarRegistroTabs = dataRow => {
    const { IdPais, IdMoneda } = dataRow;
    let filtro = {
      IdPais: IdPais,
      IdMoneda: IdMoneda
    };
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerPaisMoneda(dataRow);
  };


  const nuevoRegistroTabs = () => {
    let nuevo = { Activo: "S" };
    setDataRowEditNew({ ...nuevo, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };


  const cancelarEdicionTabs = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  //::::::::::::::::::::::PAIS-FERIADO::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarPaisFeriado(dataRow) {
    setLoading(true);
    const { Mes, Dia, Feriado } = dataRow;
    let params = {
      IdPais: varIdPais
      , Mes
      , Dia
      , DiaActualizar: Dia
      , Feriado: Feriado ? Feriado.toUpperCase() : ""
      , IdUsuario: usuario.username
    };
    await crearFeriado(params).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarPaisFeriado();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarPaisFeriado(dataRow) {
    setLoading(true);
    const { Mes, Dia, Feriado } = dataRow;
    let params = {
      IdPais: varIdPais
      , Mes
      , Dia
      , DiaActualizar: diaActualizar
      , Feriado: Feriado ? Feriado.toUpperCase() : ""
      , IdUsuario: usuario.username
    };
    await actualizarFeriado(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarPaisFeriado();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function eliminarRegistroPaisFeriado(dataRow, confirm) {
    setSelected(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdPais, Mes, Dia } = selected;
      await eliminarFeriado({
        IdPais: IdPais,
        Mes: Mes,
        Dia: Dia,
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarPaisFeriado();
    }
  }

  async function listarPaisFeriado() {
    setLoading(true);

    await listarFeriado({
      IdPais: varIdPais,
      Mes: '%',
      Dia: '%',
      NumPagina: 0,
      TamPagina: 0
    }).then(data => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(data);
      setModoEdicion(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }


  async function obtenerPaisFeriado(dataRow) {
    setLoading(true);
    const { IdPais, Mes, Dia } = dataRow;
    setDiaActualizar(Dia);
    await obtenerFeriado({
      IdPais, Mes, Dia
    }).then(paisMoneda => {
      setDataRowEditNew({ ...paisMoneda, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    })
      .finally(() => { setLoading(false); });
  }

  const editarRegistroPaisFeriado = dataRow => {
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerPaisFeriado(dataRow);
  };


  const nuevoRegistroPaisFeriado = () => {
    setDataRowEditNew({ esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };


  const cancelarEdicionPaisFeriado = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const seleccionarRegistroPaisFeriado = dataRow => {
    const { RowIndex } = dataRow;
    setFocusedRowKeyFeriado(RowIndex);
  }

  // :::::::::::::::::::::::::::::: Datos Principales :::::::::::::::::::::::::::::::::::::::::
  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  async function eliminarListRowTab(selected, confirm) {
    let currentTab = tabIndex;
    switch (currentTab) {
      case 0:
        eliminarRegistro(selected, confirm);
        break;
      case 2:
        eliminarRegistroPaisMoneda(selected, confirm);
        break;
      case 3:
        eliminarRegistroPaisFeriado(selected, confirm);
        break;
    }
  }


  const getInfo = () => {
    const { IdPais, Pais } = selected;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdPais, colSpan: 2 },
      { text: [intl.formatMessage({ id: "PAIS" })], value: Pais, colSpan: 4 }
    ];
  }


  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  useEffect(() => {
    listarPaises();
    loadControlsPermission();
  }, []);


  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "CONFIG.MENU.SISTEMA.MONEDA",
      "SYSTEM.COUNTRY.HOLIDAY"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + "  " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdPais) ? false : true;
    //return true;
  }

  const tabContent_PaisListPage = () => {
    return <PaisListPage
      paises={paises}
      editarRegistro={editarRegistro}
      eliminarRegistro={eliminarRegistro}
      nuevoRegistro={nuevoRegistro}
      seleccionarRegistro={seleccionarRegistro}
      verRegistroDblClick={verRegistroDblClick}
      focusedRowKey={focusedRowKey}
      accessButton={accessButton}
    />
  }


  const tabContent_PaisEditPage = () => {
    return <>
      <PaisEditPage
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        actualizarPais={actualizarPais}
        agregarPais={agregarPais}
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

  const tabContent_PaisMonedaListPage = () => {
    return <>
      {modoEdicion && (
        <>
          <PaisMonedaEditPage
            dataRowEditNew={dataRowEditNew}
            actualizarPaisMoneda={actualizarPaisMoneda}
            agregarPaisMoneda={agregarPaisMoneda}
            cancelarEdicion={cancelarEdicionTabs}
            titulo={titulo}
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
          <PaisMonedaListPage
            paisMonedas={listarTabs}
            editarRegistro={editarRegistroTabs}
            eliminarRegistro={eliminarRegistroPaisMoneda}
            nuevoRegistro={nuevoRegistroTabs}
            cancelarEdicion={cancelarEdicion}
            getInfo={getInfo}
            accessButton={accessButton}
          />
        </>
      )}
    </>
  }

  const tabContent_PaisFeriadoListPage = () => {
    return <>
      {modoEdicion && (
        <>
          <FeriadoEditPage
            dataRowEditNew={dataRowEditNew}
            actualizarPaisFeriado={actualizarPaisFeriado}
            agregarPaisFeriado={agregarPaisFeriado}
            cancelarEdicion={cancelarEdicionPaisFeriado}
            titulo={titulo}
            modoEdicion={modoEdicion}
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
          <FeriadoListPage
            feriados={listarTabs}
            editarRegistro={editarRegistroPaisFeriado}
            eliminarRegistro={eliminarRegistroPaisFeriado}
            nuevoRegistro={nuevoRegistroPaisFeriado}
            seleccionarRegistro={seleccionarRegistroPaisFeriado}
            focusedRowKey={focusedRowKeyFeriado}
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
        title={intl.formatMessage({ id: "SYSTEM" }) + " / " + intl.formatMessage({ id: "COMMON.GENERALS" })}
        subtitle={intl.formatMessage({ id: "SYSTEM.COUNTRY.MAINTENANCE" })}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        //value={''}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
            onClick: () => { listarPaises() },
          },
          {
            label: intl.formatMessage({ id: "SYSTEM.COUNTRY" }),
            icon: <PublicIcon fontSize="large" />,
            onClick: (e) => { obtenerPais(selected) },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "CONFIG.MENU.SISTEMA.MONEDA" }),
            icon: <LocalAtmIcon fontSize="large" />,
            onClick: (e) => { listarPaisMoneda() },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          },
          {
            label: intl.formatMessage({ id: "SYSTEM.COUNTRY.HOLIDAY" }),
            icon: <DateRange fontSize="large" />,
            onClick: (e) => { listarPaisFeriado() },
            disabled: !tabsDisabled() && accessButton.Tabs[3] ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_PaisListPage(),
            tabContent_PaisEditPage(),
            tabContent_PaisMonedaListPage(),
            tabContent_PaisFeriadoListPage()
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

export default injectIntl(WithLoandingPanel(PaisIndexPage));
