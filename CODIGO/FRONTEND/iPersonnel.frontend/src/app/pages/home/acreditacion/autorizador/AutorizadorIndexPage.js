import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { isNotEmpty } from "../../../../../_metronic";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';

import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import AssignmentTurnedInOutlinedIcon from '@material-ui/icons/AssignmentTurnedInOutlined';
import PhonelinkLockOutlinedIcon from '@material-ui/icons/PhonelinkLockOutlined';
import SdCardOutlinedIcon from '@material-ui/icons/SdCardOutlined';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import {
  obtener, listar, crear, actualizar, eliminar
} from "../../../../api/acreditacion/autorizador.api";
import AutorizadorListPage from "./AutorizadorListPage";
import AutorizadorEditPage from "./AutorizadorEditPage";

import AutorizadorDatoEntidadIndexPage from "./autorizadorDatoEntidad/AutorizadorDatoEntidadIndexPage";
import AutorizadorRequisitoIndexPage from "./autorizadorRequisito/AutorizadorRequisitoIndexPage";
import AutorizadorUsuarioIndexPage from "./autorizadorUsuario/AutorizadorUsuarioIndexPage";

const AutorizadorIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();

  const [autorizadores, setAutorizadores] = useState([]);
  const [varIdAutorizador, setVarIdAutorizador] = useState("");
  const [focusedRowKey, setFocusedRowKey] = useState(0);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [selected, setSelected] = useState({ IdCliente: perfil.IdCliente });
  const [selectedDelete, setSelectedDelete] = useState({ IdCliente: perfil.IdCliente });
  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

  const [tabIndex, setTabIndex] = useState(0);
  const handleChange = (event, newValue) => { setTabIndex(newValue); };

  async function listarAutorizador() {
    setLoading(true);
    const { IdCliente } = selected;
    await listar({
      IdCliente
      , NumPagina: 0
      , TamPagina: 0
    }).then(autorizadores => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setAutorizadores(autorizadores);
      changeTabIndex(0);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });

  }

  async function obtenerAutorizador() {
    setLoading(true);
    const { IdCliente, IdAutorizador } = selected;
    if (isNotEmpty(IdAutorizador)) {
      let objAutorizador = await obtener({
        IdCliente,
        IdAutorizador
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
      setDataRowEditNew({ ...objAutorizador, esNuevoRegistro: false });
    }
  }


  async function agregarAutorizador(autorizadorData) {
    setLoading(true);
    const { IdCliente, IdAutorizador, Autorizador, Activo } = autorizadorData;
    let params = {
      IdAutorizador: isNotEmpty(IdAutorizador) ? IdAutorizador.toUpperCase() : ""
      , Autorizador: isNotEmpty(Autorizador) ? Autorizador.toUpperCase() : ""
      , IdCliente
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await crear(params).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      listarAutorizador();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function actualizarAutorizador(autorizadorData) {
    setLoading(true);
    const { IdCliente, IdAutorizador, Autorizador, Activo } = autorizadorData;
    let params = {
      IdAutorizador: isNotEmpty(IdAutorizador) ? IdAutorizador.toUpperCase() : ""
      , Autorizador: isNotEmpty(Autorizador) ? Autorizador.toUpperCase() : ""
      , IdCliente
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await actualizar(params).then(response => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarAutorizador();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function eliminarAutorizador(autorizador, confirm) {
    setSelectedDelete(autorizador);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdAutorizador } = autorizador;
      await eliminar({
        IdCliente,
        IdAutorizador,
        IdUsuario: usuario.username
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
      listarAutorizador();
    }
  }

  const nuevoRegistro = () => {
    changeTabIndex(1);
    const { IdCliente } = selected;
    let newAutorizador = { Activo: "S", IdCliente };
    setDataRowEditNew({ ...newAutorizador, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const editarRegistro = dataRow => {
    changeTabIndex(1);
    const { IdAutorizador, RowIndex } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerAutorizador(IdAutorizador);
    setFocusedRowKey(RowIndex);
  };

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const seleccionarRegistro = dataRow => {
    const { IdAutorizador, RowIndex } = dataRow;
    setModoEdicion(false);
    setSelected(dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    if (IdAutorizador != varIdAutorizador) {
      setVarIdAutorizador(IdAutorizador);
      setFocusedRowKey(RowIndex);

    }
  }

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerAutorizador(dataRow);
  };

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  /************--Configuración de acceso de botones*************/
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 6;
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }


  const getInfoAutorizador = () => {
    const { IdAutorizador, Autorizador } = selected;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdAutorizador, colSpan: 2 },
      { text: [intl.formatMessage({ id: "CONFIG.MENU.ACREDITACION.AUTORIZADOR" })], value: Autorizador, colSpan: 4 },
    ];
  }

  useEffect(() => {
    listarAutorizador();
    loadControlsPermission();
  }, []);

  /*CONFIGURACIÓN TABS*********************************************************************************/

  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "ACCESS.PERSON.REQUIREMENTS",
      "ACCREDITATION.AUTHORIZER.DATA",
      "SECURITY.USER.USERS"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";
    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdAutorizador) ? false : true;
    //return true;
  }

  const tabContent_AutorizadorListPage = () => {
    return <>

      <AutorizadorListPage
        autorizadores={autorizadores}
        editarRegistro={editarRegistro}
        eliminarRegistro={eliminarAutorizador}
        nuevoRegistro={nuevoRegistro}
        seleccionarRegistro={seleccionarRegistro}
        verRegistroDblClick={verRegistroDblClick}
        focusedRowKey={focusedRowKey}
        accessButton={accessButton}
      />

    </>
  }

  const tabContent_AutorizadorEditPage = () => {
    return <>
      <AutorizadorEditPage
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        actualizarAutorizador={actualizarAutorizador}
        agregarAutorizador={agregarAutorizador}
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

  const tabContent_AutorizadorRequisitoIndexPage = () => {
    return <>
      <AutorizadorRequisitoIndexPage
        varIdAutorizador={varIdAutorizador}
        selectedIndex={selected}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfoAutorizador}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
      />
    </>
  }


  
  const tabContent_AutorizadorSolicitudListPage = () => {
    return <>
      <AutorizadorDatoEntidadIndexPage
        varIdAutorizador={varIdAutorizador}
        selected={selected}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfoAutorizador}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
      />
    </>
  }

  const tabContent_AutorizadorUsuarioIndexPage = () => {
    return <>
      <AutorizadorUsuarioIndexPage
        varIdAutorizador={varIdAutorizador}
        selected={selected}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfoAutorizador}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        changeTabIndex={changeTabIndex}
      />
    </>
  }

  /**************************************************************************/
  return (
    <>

      <TabNavContainer
        title={intl.formatMessage({ id: "ACCREDITATION.MAIN" })}
        subtitle={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
            onClick: () => { listarAutorizador() },
          },
          {
            label: intl.formatMessage({ id: "ACCREDITATION.AUTHORIZER.ROLE" }),
            icon: <PhonelinkLockOutlinedIcon fontSize="large" />,
            onClick: (e) => { obtenerAutorizador(varIdAutorizador) },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "ACCESS.PERSON.REQUIREMENTS" }),
            icon: <AssignmentTurnedInOutlinedIcon fontSize="large" />,
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "ACCREDITATION.AUTHORIZER.DATA" }),
            icon: <SdCardOutlinedIcon fontSize="large" />,
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "SECURITY.USER.USERS" }),
            icon: <SupervisedUserCircleIcon fontSize="large" />,
            disabled: tabsDisabled()
          },

        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_AutorizadorListPage(),
            tabContent_AutorizadorEditPage(),
            tabContent_AutorizadorRequisitoIndexPage(),
            tabContent_AutorizadorSolicitudListPage(),
            tabContent_AutorizadorUsuarioIndexPage()
          ]
        }
      />


      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        onConfirm={() => eliminarAutorizador(selectedDelete, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />

    </>
  );
};

export default injectIntl(WithLoandingPanel(AutorizadorIndexPage));
