import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

// import AppBar from "@material-ui/core/AppBar";
// import Toolbar from "@material-ui/core/Toolbar";
// import Typography from "@material-ui/core/Typography";
// import Tabs from '@material-ui/core/Tabs';
// import Tab from '@material-ui/core/Tab';

import PropTypes from 'prop-types';
import { isNotEmpty } from "../../../../../_metronic";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import { Portlet } from "../../../../partials/content/Portlet";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesTab } from "../../../../store/config/Styles";
//import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import LockIcon from '@material-ui/icons/Lock';
import PersonIcon from '@material-ui/icons/Person';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import { serviceConfiguracionLogeo } from "../../../../api/seguridad/configuracionLogeo.api";
import ConfiguracionLogeoListPage from "./ConfiguracionLogeoListPage";
import ConfiguracionLogeoEditPage from "./ConfiguracionLogeoEditPage";

import UsuarioIndexPage from "./usuario/UsuarioIndexPage";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";


const ConfiguracionLogeoIndexPage = ({ intl, setLoading, dataMenu }) => {
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [configuraciones, setConfiguraciones] = useState([]);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(true);
  const [titulo, setTitulo] = useState();
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [focusedRowKey, setFocusedRowKey] = useState();

  const [tabIndex, setTabIndex] = useState(0);
  const classes = useStylesTab();
  const [varIdConfiguracionLogeo, setvarIdConfiguracionLogeo] = useState("");
  const handleChange = (event, newValue) => { setTabIndex(newValue); };
  const [selected, setSelected] = useState({ IdCliente: perfil.IdCliente });
  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

  const [filtroLocal, setFiltroLocal] = useState({
    IdCliente: perfil.IdCliente, IdConfiguracionLogeo: ""
  });


  async function agregarConfiguracionLogeo(configuracionLogeo) {

    const { IdCliente, IdConfiguracionLogeo, ConfiguracionLogeo, NivelSeguridadClave, PeriodoClave, CaducaClave, CambiarPrimeraClave, NumeroIntentosClave, TiempoDesbloqueoUsuario, PeriodoInactivacion, LongitudClave
      , Principal, DobleAutenticacion, DobleAutenticacionEmail, DobleAutenticacionTelefono } = configuracionLogeo;
    let params = {
      IdCliente
      , IdConfiguracionLogeo: isNotEmpty(IdConfiguracionLogeo) ? IdConfiguracionLogeo.toUpperCase() : ""
      , ConfiguracionLogeo: isNotEmpty(ConfiguracionLogeo) ? ConfiguracionLogeo.toUpperCase() : ""
      , NivelSeguridadClave: isNotEmpty(NivelSeguridadClave) ? NivelSeguridadClave : ""
      , PeriodoClave: isNotEmpty(PeriodoClave) ? PeriodoClave : 0
      , CaducaClave: CaducaClave ? "S" : "N"
      , CambiarPrimeraClave: CambiarPrimeraClave ? "S" : "N"
      , NumeroIntentosClave: isNotEmpty(NumeroIntentosClave) ? NumeroIntentosClave : 0
      , TiempoDesbloqueoUsuario: isNotEmpty(TiempoDesbloqueoUsuario) ? TiempoDesbloqueoUsuario : 0
      , PeriodoInactivacion: isNotEmpty(PeriodoInactivacion) ? PeriodoInactivacion : 0
      , LongitudClave: isNotEmpty(LongitudClave) ? LongitudClave : 0
      , Principal: Principal ? "S" : "N"
      , DobleAutenticacion: DobleAutenticacion ? "S" : "N"
      , DobleAutenticacionEmail: DobleAutenticacionEmail ? "S" : "N"
      , DobleAutenticacionTelefono: DobleAutenticacionTelefono ? "S" : "N"
      , IdUsuario: usuario.username
    };
    setLoading(true);
    await serviceConfiguracionLogeo.crear(params).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      listarConfiguracionLogeo();
      setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarConfiguracionLogeo(dataRow) {

    const { IdCliente, IdConfiguracionLogeo, ConfiguracionLogeo, NivelSeguridadClave, PeriodoClave, CaducaClave, CambiarPrimeraClave, NumeroIntentosClave, TiempoDesbloqueoUsuario, PeriodoInactivacion, LongitudClave
      , Principal, DobleAutenticacion, DobleAutenticacionEmail, DobleAutenticacionTelefono } = dataRow;
    let params = {
      IdCliente
      , IdConfiguracionLogeo: isNotEmpty(IdConfiguracionLogeo) ? IdConfiguracionLogeo.toUpperCase() : ""
      , ConfiguracionLogeo: isNotEmpty(ConfiguracionLogeo) ? ConfiguracionLogeo.toUpperCase() : ""
      , NivelSeguridadClave: isNotEmpty(NivelSeguridadClave) ? NivelSeguridadClave : ""
      , PeriodoClave: isNotEmpty(PeriodoClave) ? PeriodoClave : 0
      , CaducaClave: CaducaClave ? "S" : "N"
      , CambiarPrimeraClave: CambiarPrimeraClave ? "S" : "N"
      , NumeroIntentosClave: isNotEmpty(NumeroIntentosClave) ? NumeroIntentosClave : 0
      , TiempoDesbloqueoUsuario: isNotEmpty(TiempoDesbloqueoUsuario) ? TiempoDesbloqueoUsuario : 0
      , PeriodoInactivacion: isNotEmpty(PeriodoInactivacion) ? PeriodoInactivacion : 0
      , LongitudClave: isNotEmpty(LongitudClave) ? LongitudClave : 0
      , Principal: Principal ? "S" : "N"
      , DobleAutenticacion: DobleAutenticacion ? "S" : "N"
      , DobleAutenticacionEmail: DobleAutenticacionEmail ? "S" : "N"
      , DobleAutenticacionTelefono: DobleAutenticacionTelefono ? "S" : "N"
      , IdUsuario: usuario.username
    };
    setLoading(true);
    await serviceConfiguracionLogeo.actualizar(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarConfiguracionLogeo();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro(dataRow, confirm) {
    setSelected(dataRow);
    setIsVisible(true);
    if (confirm) {
      const { IdCliente, IdConfiguracionLogeo } = dataRow;
      await serviceConfiguracionLogeo.eliminar({
        IdCliente,
        IdConfiguracionLogeo,
        IdUsuario: usuario.username
      }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        setFocusedRowKey();
        setvarIdConfiguracionLogeo("");
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
      listarConfiguracionLogeo();
    }
  }


  async function listarConfiguracionLogeo() {
    setLoading(true);
    setModoEdicion(false);
    //console.log("listarConfiguracionLogeo")
    const { IdCliente } = selected;
    await serviceConfiguracionLogeo.listar({
      IdCliente,
      NumPagina: 0,
      TamPagina: 0
    }).then(configuraciones => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setConfiguraciones(configuraciones);
      changeTabIndex(0);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function obtenerConfiguracionLogeo() {
    const { IdCliente, IdConfiguracionLogeo } = selected;

    setLoading(true);
    await serviceConfiguracionLogeo.obtener({ IdCliente, IdConfiguracionLogeo })
      .then(logeo => {
        //>.Cambiar tipo de datos booleano. 
        logeo.CaducaClave = logeo.CaducaClave === "S" ? true : false;
        logeo.CambiarPrimeraClave = logeo.CambiarPrimeraClave === "S" ? true : false;
        logeo.Principal = logeo.Principal === "S" ? true : false;
        logeo.DobleAutenticacion = logeo.DobleAutenticacion === "S" ? true : false;
        logeo.DobleAutenticacionEmail = logeo.DobleAutenticacionEmail === "S" ? true : false;
        logeo.DobleAutenticacionTelefono = logeo.DobleAutenticacionTelefono === "S" ? true : false;

        setDataRowEditNew({ ...logeo, esNuevoRegistro: false });

      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false) });

  }



  const nuevoRegistro = () => {
    changeTabIndex(1);
    const { IdCliente } = selected;
    let configuracionLogeo = { Activo: "S", IdCliente, NumeroIntentosClave: 3, CaducaClave: false, CambiarPrimeraClave: false, Principal: false, DobleAutenticacion: false, DobleAutenticacionEmail: false, DobleAutenticacionTelefono: false };
    setDataRowEditNew({ ...configuracionLogeo, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const editarRegistro = async (dataRow) => {
    changeTabIndex(1);
    const { IdConfiguracionLogeo, RowIndex } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    await obtenerConfiguracionLogeo(IdConfiguracionLogeo);
    setFocusedRowKey(RowIndex);
  };

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerConfiguracionLogeo(dataRow);
  };

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
  };

  const seleccionarRegistro = dataRow => {
    const { IdConfiguracionLogeo, RowIndex } = dataRow;
    setModoEdicion(false);
    setSelected(dataRow);
    setFiltroLocal({ IdCliente: perfil.IdCliente, IdConfiguracionLogeo: IdConfiguracionLogeo });
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    if (IdConfiguracionLogeo != varIdConfiguracionLogeo) {
      setvarIdConfiguracionLogeo(IdConfiguracionLogeo);
      setFocusedRowKey(RowIndex);
    }
  }

  /************--Configuración de acceso de botones***********************/
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 3;
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }
  /***********************************************************************/

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  //Datos Principales
  const getInfo = () => {

    const { IdConfiguracionLogeo, ConfiguracionLogeo } = selected;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdConfiguracionLogeo, colSpan: 2 },
      { text: [intl.formatMessage({ id: "COMMON.DESCRIPTION" })], value: ConfiguracionLogeo, colSpan: 4 }
    ];
  }


  useEffect(() => {
    listarConfiguracionLogeo();
    loadControlsPermission();
  }, []);


  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "SECURITY.USER.USERS"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}` + " " + sufix;

  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdConfiguracionLogeo) ? false : true;
    //return true;
  }

  //0
  const tabContent_PerfilesListPage = () => {
    return <ConfiguracionLogeoListPage
      configuraciones={configuraciones}
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
  //1
  const tabContent_ConfiguracionLogeoEditPage = () => {
    return <>
      <ConfiguracionLogeoEditPage
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        setDataRowEditNew={setDataRowEditNew}
        actualizarConfiguracionLogeo={actualizarConfiguracionLogeo}
        agregarConfiguracionLogeo={agregarConfiguracionLogeo}
        cancelarEdicion={cancelarEdicion}
        titulo={titulo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}

      />
      <div className="float-right mr-5">
        <div className="float-right">
          <ControlSwitch checked={auditoriaSwitch}
            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
          /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
        </div>
      </div>
      {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
    </>
  }
  //2
  const tabContent_UsuariosListPage = () => {
    return <>
      <UsuarioIndexPage
        varIdConfiguracionLogeo={varIdConfiguracionLogeo}
        selected={selected}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        dataMenu={dataMenu}
        cancelarEdicion={cancelarEdicion}
        filtroLocal={filtroLocal}
      />
    </>
  }



  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "SECURITY.SETTING.LOGING.MENU" })}
        submenu={intl.formatMessage({ id: "COMMON.CONFIGURATION" })}
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
            label: intl.formatMessage({ id: "SECURITY.SETTING.LOGING.MENU" }),
            icon: <LockIcon fontSize="large" />,
            onClick: (e) => { obtenerConfiguracionLogeo(selected) },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "SECURITY.USER.USERS" }),
            icon: <PersonIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_PerfilesListPage(),
            tabContent_ConfiguracionLogeoEditPage(),
            tabContent_UsuariosListPage()
          ]
        }
      />

      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        onConfirm={() => eliminarRegistro(selected, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />
    </>
  );
};



//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <Portlet
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </Portlet>
  );
}
TabPanel.propTypes =
{
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};
function tabPropsIndex(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}
export default injectIntl(WithLoandingPanel(ConfiguracionLogeoIndexPage));
