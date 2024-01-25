import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { Portlet } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import {
  useStylesEncabezado,
  useStylesTab,
} from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";

import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

import PersonIcon from "@material-ui/icons/Person";
import LockIcon from '@material-ui/icons/Lock';

import {   obtener } from "../../../../api/seguridad/usuarioLogin.api";

import UsuarioLoginViewPage from "./UsuarioLoginViewPage";
import UsuarioLoginEditPage from "./UsuarioLoginEditPage";

import { useSelector } from "react-redux";
import { handleSuccessMessages, handleErrorMessages } from "../../../../store/ducks/notify-messages";
import PropTypes from "prop-types";
// import Constants from "../../../../store/config/Constants";
// import { loadScriptByURL } from "../../../../../_metronic/utils/securityUtils";
import { serviceUsuarioClave } from "../../../../api/seguridad/usuarioClave.api";
import { isNotEmpty } from "../../../../../_metronic";
// import { isNotEmpty } from "../../../../../_metronic";

const UsuarioLoginIndex = (props) => {
  const classes = useStylesTab();
  const { intl, setLoading } = props;
  const { username } = useSelector((state) => state.auth.user);
  const { IdCliente } = useSelector((state) => state.perfil.perfilActual);

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  //const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(
    intl.formatMessage({ id: "ACTION.VIEW" })
  );

  const [tabIndex, setTabIndex] = useState(0);
  const classesEncabezado = useStylesEncabezado();
  const handleChange = (event, newValue) => { setTabIndex(newValue); };
  const [MessageServer, setMessageServer] = useState("");

  async function obtenerUsuario(filtro) {
    setLoading(true);
    const { IdCliente, IdUsuario } = filtro;
    await obtener({
      IdCliente,
      IdUsuario,
    }).then(usuario => {
      //console.log("datos usuario->",usuario);
      setDataRowEditNew({ ...usuario, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  async function cambiarClaveUsuario(datarow) {

    setLoading(true);
    setMessageServer("");
    const { ClaveAnterior,Clave } = datarow;
    let data = {
      IdCliente
      ,ClaveAnterior
      , Clave      
    };
    await serviceUsuarioClave.cambiarClave(data).then(() => {

      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "AUTH.CHANGE.PASSWORD.SUCCESS" }));
      cancelarEdicion();
      //setModoEdicion(false);
    }).catch(err => {
      if (isNotEmpty(err.response)) {
        const { responseException } = err.response.data;
        setMessageServer(responseException.exceptionMessage.message);
      } else {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      }

    }).finally(() => { setLoading(false); });
  }

  const cancelarEdicion = () => {
    changeTabIndex(0);
    obtenerUsuario({ IdCliente, IdUsuario: username });
    //setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    setDataRowEditNew({});
  };

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  useEffect(() => {

    obtenerUsuario({ IdCliente, IdUsuario: username });
    

  }, []);

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <React.Fragment>
     
      <div className="row">
        <div className="col-md-12">
          <CustomBreadcrumbs Title={intl.formatMessage({ id: "SECURITY.SETTING.LOGING.MENU" })}
            SubMenu={intl.formatMessage({ id: "SECURITY.SETTING.LOGING.SUBMENU" })}
            Subtitle={intl.formatMessage({ id: "SECURITY.SETTING.LOGING.MENU" })} />
          <Portlet className={classesEncabezado.border}>
            <AppBar position="static" className={classesEncabezado.principal}>
              <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                  {intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.MAINTENANCE" }).toUpperCase()}
                </Typography>
              </Toolbar>
            </AppBar>
            <React.Fragment>
              <div className={classes.root}>
                <Tabs
                  orientation="vertical"
                  value={tabIndex}
                  onChange={handleChange}
                  aria-label="Vertical tabs"
                  className={classes.tabs}
                  variant="fullWidth"
                  indicatorColor="primary"
                  textColor="primary" >
                  <Tab
                    label={intl.formatMessage({ id: "COMMON.DATA" })}
                    icon={<PersonIcon fontSize="large" />}
                    {...tabPropsIndex(0)}
                    className={classes.tabContent}
                  />
                  <Tab
                    label={intl.formatMessage({ id: "SECURITY.SETTING.LOGING.USERLOGIN.PASSWORD" })}
                    icon={<LockIcon fontSize="large" />}
                    {...tabPropsIndex(1)}
                    className={classes.tabContent}
                  />
                </Tabs>
                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
                  <UsuarioLoginViewPage
                    titulo={titulo}
                    dataRowEditNew={dataRowEditNew}
                    modoEdicion={false}
                    showButtons={false}
                  />
                </TabPanel>
                <TabPanel value={tabIndex} className={classes.TabPanel} index={1}>
                  <UsuarioLoginEditPage
                    dataRowEditNew={dataRowEditNew}
                    cambiarClaveUsuario={cambiarClaveUsuario}
                    setMessageServer={setMessageServer}
                    MessageServer ={MessageServer}
                    // modoEdicion={true}
                    // cancelarEdicion={cancelarEdicion}
                  />

                </TabPanel>
              </div>
            </React.Fragment>
          </Portlet>
        </div>
      </div>
    </React.Fragment>
  )
}

//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

//Configuración inicial de tabs.

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
TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};
function tabPropsIndex(index) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

export default injectIntl(WithLoandingPanel(UsuarioLoginIndex));
