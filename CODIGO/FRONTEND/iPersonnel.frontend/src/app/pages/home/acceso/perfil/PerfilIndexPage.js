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

import { eliminar, obtener, listar, crear, actualizar } from "../../../../api/acceso/perfil.api";
import { eliminar as eliminarPerfilReq, obtener as obtenerPerfilReq, listar as listarPerfilReq, crear as crearPerfilReq, actualizar as actualizarPerfilReq } from "../../../../api/acceso/perfilRequisito.api";
import PerfilListPage from "./PerfilListPage";
import PerfilEditPage from "./PerfilEditPage";
import PerfilRequisitoListPage from "./PerfilRequisitoListPage";
import PerfilRequisitoEditPage from "./PerfilRequisitoEditPage";

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import PropTypes from 'prop-types';

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import PersonIcon from '@material-ui/icons/Person';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";

import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

import PerfilPersonaIndexPage from "./persona/PerfilPersonaIndexPage";


//import HeaderInformation from "../../../../partials/components/HeaderInformation";

const PerfilIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [varIdPerfil, setVarIdPerfil] = useState("");
  const [focusedRowKey, setFocusedRowKey] = useState();
  const [focusedRowKeyRequisito, setFocusedRowKeyRequisito] = useState();
  const [perfiles, setPerfiles] = useState([]);
  //Datos principales
  const [selected, setSelected] = useState({});

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  //const [modoEdicion, setModoEdicion] = useState(false);
  //const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [listarTabs, setListarTabs] = useState([]);

  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (event, newValue) => {
    //Estado cambio de tabs
    setTabIndex(newValue);
  };

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

  //::::::::::::::::::::::::::::FUNCIONES PARA GESTION PERFIL-:::::::::::::::::::::::::::::::::::

  async function agregarPerfil(data) {
    setLoading(true);
    const { IdPerfil, Perfil, IdEntidad, Activo } = data;
    let param = {
      IdPerfil: isNotEmpty(IdPerfil) ? IdPerfil.toUpperCase() : "",
      Perfil: isNotEmpty(Perfil) ? Perfil.toUpperCase() : "",
      IdEntidad: isNotEmpty(IdEntidad) ? IdEntidad.toUpperCase() : "",
      IdCliente: perfil.IdCliente,
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await crear(param)
      .then(response => {
        if (response)
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        setModoEdicion(false);
        listarPerfiles();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }


  async function actualizarPerfil(perfil) {
    setLoading(true);
    const { IdPerfil, Perfil, IdEntidad, Activo } = perfil;
    let params = {
      IdPerfil: isNotEmpty(IdPerfil) ? IdPerfil.toUpperCase() : "",
      Perfil: isNotEmpty(Perfil) ? Perfil.toUpperCase() : "",
      IdEntidad: isNotEmpty(IdEntidad) ? IdEntidad.toUpperCase() : "",
      IdCliente: perfil.IdCliente,
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await actualizar(params)
      .then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        setModoEdicion(false);
        listarPerfiles();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }


  async function eliminarRegistro(perfil, confirm) {
    setSelected(perfil);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdPerfil, IdCliente } = perfil;
      await eliminar({
        IdPerfil: IdPerfil,
        IdCliente: IdCliente,
        IdUsuario: usuario.username
      })
        .then(response => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
      listarPerfiles();
    }
  }


  async function listarPerfiles() {
    setLoading(true);
    await listar({
      IdCliente: perfil.IdCliente,
      NumPagina: 0,
      TamPagina: 0
    }).then(perfiles => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setPerfiles(perfiles);
      changeTabIndex(0);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }


  async function obtenerPerfil() {
    setLoading(true);
    const { IdPerfil, IdCliente } = selected;
    await obtener({
      IdPerfil,
      IdCliente,
    }).then(perfil => {
      setDataRowEditNew({ ...perfil, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }


  const nuevoRegistro = () => {
    changeTabIndex(1);
    let perfil = {
      Activo: "S",
      FechaRegistro: new Date().toJSON().slice(0, 10)
    };
    setDataRowEditNew({ ...perfil, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setVarIdPerfil("");

  };


  const editarRegistro = async (dataRow) => {
    changeTabIndex(1);
    const { IdPerfil, RowIndex } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setVarIdPerfil(IdPerfil);
    await obtenerPerfil(dataRow);
  };


  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    //setDataRowEditNew({});
    setVarIdPerfil("");
  };


  const seleccionarRegistro = dataRow => {

    const { IdPerfil, RowIndex } = dataRow;
    setModoEdicion(false);
    //Datos Principales
    setSelected(dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    if (IdPerfil != varIdPerfil) {
      setVarIdPerfil(IdPerfil);
      setFocusedRowKey(RowIndex);
    }
  }

  const verRegistroDblClick = async (dataRow) => {
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerPerfil(dataRow);
  };


  /*********************************************************** */
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 4; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }
  /*********************************************************** */

  useEffect(() => {
    listarPerfiles();
    loadControlsPermission();
  }, []);

  //::::::::::::::::::::::FUNCION PERFIL REQUISITO:::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarPerfilRequisito(dataPerfilRequisito) {
    setLoading(true);
    const { IdPerfil, IdRequisito, Activo, Warning } = dataPerfilRequisito;
    let params = {
      IdPerfil: varIdPerfil
      , IdRequisito: IdRequisito.toUpperCase()
      , IdCliente: perfil.IdCliente
      , Activo: Activo
      , Warning: Warning
      , IdUsuario: usuario.username
    };
    await crearPerfilReq(params).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarPerfilRequisito();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function actualizarPerfilRequisito(perfilRequisito) {
    setLoading(true);
    const { IdPerfil, IdRequisito, Activo, Warning } = perfilRequisito;
    let params = {
      IdPerfil: varIdPerfil
      , IdRequisito: IdRequisito
      , IdCliente: perfil.IdCliente
      , Activo: Activo
      , Warning: Warning
      , IdUsuario: usuario.username
    };
    await actualizarPerfilReq(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarPerfilRequisito();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function eliminarRegistroPerfilRequisito(perfilRequisito, confirm) {
    setSelected(perfilRequisito);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdPerfil, IdRequisito, IdCliente } = perfilRequisito;
      await eliminarPerfilReq({
        IdPerfil: IdPerfil,
        IdRequisito: IdRequisito,
        IdCliente: IdCliente,
        IdUsuario: usuario.username
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarPerfilRequisito();
    }
  }

  async function listarPerfilRequisito() {
    setLoading(true);
    setModoEdicion(false);
    await listarPerfilReq({
      IdPerfil: varIdPerfil,
      IdCliente: perfil.IdCliente,
      NumPagina: 0, TamPagina: 0
    }).then(perfilesRequisito => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(perfilesRequisito);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  async function obtenerPerfilRequisito(filtro) {
    setLoading(true);
    const { IdPerfil, IdRequisito, IdCliente } = filtro;
    await obtenerPerfilReq({
      IdPerfil: IdPerfil,
      IdRequisito: IdRequisito,
      IdCliente: IdCliente,
    }).then(perfilRequisito => {
      setDataRowEditNew({ ...perfilRequisito, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  const editarRegistroPerfilRequisito = dataRow => {
    const { RowIndex } = dataRow;
    setModoEdicion(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerPerfilRequisito(dataRow);
    setFocusedRowKeyRequisito(RowIndex);
  };

  const seleccionarRegistroRequisito = dataRow => {
    const { RowIndex } = dataRow;
    setFocusedRowKeyRequisito(RowIndex);
  };

  const nuevoRegistroTabs = () => {
    let nuevo = { Activo: "S" };
    setDataRowEditNew({ ...nuevo, esNuevoRegistro: true });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };


  const cancelarEdicionTabs = () => {
    setModoEdicion(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  //Datos Principales
  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  const getInfo = () => {
    const { IdPerfil, Perfil } = selected;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdPerfil, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ACCESS.PROFILE" })], value: Perfil, colSpan: 4 }
    ];

  }

  async function eliminarListRowTab(selected, confirm) {
    let currentTab = tabIndex;
    switch (currentTab) {
      case 0:
        eliminarRegistro(selected, confirm);
        break;
      case 2:
        eliminarRegistroPerfilRequisito(selected, confirm);
        break;
    }
  }


  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "ACCESS.REQUIREMENT",
      "CASINO.PERSON.GROUP.PERSON"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdPerfil) ? false : true;
    //return true;
  }

  const tabContent_PerfilListPage = () => {
    return <PerfilListPage
      perfiles={perfiles}
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


  const tabContent_PerfilEditPage = () => {
    return <>
      <PerfilEditPage
        titulo={titulo}
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        actualizarPerfil={actualizarPerfil}
        agregarPerfil={agregarPerfil}
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

  const tabContent_PerfilRequisitoListPage = () => {
    return <>
      {modoEdicion && (
        <>
          <PerfilRequisitoEditPage
            selected={selected}
            dataRowEditNew={dataRowEditNew}
            actualizarPerfilRequisito={actualizarPerfilRequisito}
            agregarPerfilRequisito={agregarPerfilRequisito}
            cancelarEdicion={cancelarEdicionTabs}
            titulo={tituloTabs}
            modoEdicion={modoEdicion}
            settingDataField={dataMenu.datos}
            getInfo={getInfo}
            showHeaderInformation={true}
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
          <PerfilRequisitoListPage
            perfilRequisitos={listarTabs}
            editarRegistro={editarRegistroPerfilRequisito}
            eliminarRegistro={eliminarRegistroPerfilRequisito}
            nuevoRegistro={nuevoRegistroTabs}
            cancelarEdicion={cancelarEdicion}
            seleccionarRegistro={seleccionarRegistroRequisito}
            focusedRowKey={focusedRowKeyRequisito}
            showHeaderInformation={true}
            getInfo={getInfo}
          />
        </>
      )}
    </>
  }


  const tabContent_PerfilPersonaIndexPage = () => {
    return <>
      <PerfilPersonaIndexPage
        varIdPerfil={varIdPerfil}
        //configuracionModulo={selected}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}

        selected={selected}
        dataRowEditNew={dataRowEditNew}
        changeTabIndex={changeTabIndex}
      />
    </>
  }



  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "ACCESS.PROFILE.MENU" })}
        submenu={intl.formatMessage({ id: "CONFIG.MENU.ACCESO.HORARIOS_Y_GRUPOS" })}
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
            label: intl.formatMessage({ id: "ACCESS.PROFILE" }),
            icon: <PersonIcon fontSize="large" />,
            onClick: (e) => {
              setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
              obtenerPerfil(selected)
            },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "ACCESS.REQUIREMENT" }),
            icon: <FileCopyIcon fontSize="large" />,
            onClick: (e) => { listarPerfilRequisito() },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          },
          {
            label: intl.formatMessage({ id: "CASINO.PERSON.GROUP.PERSON" }),
            icon: <PeopleAltOutlinedIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[3] ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_PerfilListPage(),
            tabContent_PerfilEditPage(),
            tabContent_PerfilRequisitoListPage(),
            tabContent_PerfilPersonaIndexPage()
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



export default injectIntl(WithLoandingPanel(PerfilIndexPage));
