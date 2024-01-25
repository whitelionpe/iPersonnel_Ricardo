import React, { useEffect, useState } from "react";
import { Portlet } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useSelector } from "react-redux";
import { isNotEmpty } from "../../../../../_metronic";

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import GroupWorkOutlinedIcon from '@material-ui/icons/GroupWorkOutlined';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import MenuTreeViewPage from "../../../../partials/content/TreeView/MenuTreeViewPage";

import {
  eliminar,
  obtener,
  listar,
  crear,
  actualizar
} from "../../../../api/sistema/division.api";
import DivisionEditPage from "./DivisionEditPage";
import ClienteEditPage from "../cliente/ClienteEditPage";
import { obtener as obtenerCli } from "../../../../api/sistema/cliente.api";

import {
  listar as listarLi,
  obtener as obtenerLi,
  eliminar as eliminarLi,
  crear as crearLi,
  actualizar as actualizarLi
} from "../../../../api/sistema/licencia.api";
import LicenciaListPage from "../licencia/LicenciaListPage";
import LicenciaEditPage from "../licencia/LicenciaEditPage";

const DivisionIndexPage = () => {
  const usuario = useSelector(state => state.auth.user);

  const [idMenu, setIdMenu] = useState("PE");
  const [idCliente, setIdCliente] = useState("");
  const [idDivision, setIdDivision] = useState("");
  //const [divisiones, setDivisiones] = useState([]);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState("Editar");
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [showClient, setShowClient] = useState(false);
  const [dataRowEditNewCliente, setDataRowEditNewCliente] = useState({});

  const classesEncabezado = useStylesEncabezado();

  const [menus, setMenus] = useState([{
    Icon: "flaticon2-expand"
    , IdMenu: null
    , IdMenuPadre: null
    , Menu: "-OPCIONES DE MENÚ-"
    , MenuPadre: null
    , Nivel: 0
    , expanded: true
  }]);
  const [dataFilter, setDataFilter] = useState({ IdModulo: "" });
  const [isSubMenu, setIsSubMenu] = useState(false);
  //const [modulos, setModulos] = useState([]);

  const [dataRowEditNewSection, setDataRowEditNewSection] = useState({});
  const [modoEdicionSection, setModoEdicionSection] = useState(false);
  const [tituloSection, setTituloSection] = useState("Listado");
  const [listarSection, setListarSection] = useState([]);

  //Configuración de tabs
  const classes = useStyles();
  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {
    //Estado cambio de tabs
    setValue(newValue);
  };

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones para administrar división-:::::::::::::::::::::::::::::::::
  async function agregarDivision(division) {

    const { IdCliente, IdDivision, IdClientePadre, IdDivisionPadre, Division, Activo } = division;
    let data = {
      IdCliente
      , IdDivision: isNotEmpty(IdDivision) ? IdDivision.toUpperCase() : ""
      , IdClientePadre: isNotEmpty(IdClientePadre) ? IdClientePadre : ""
      , IdDivisionPadre: isNotEmpty(IdDivisionPadre) ? IdDivisionPadre : ""
      , Division: isNotEmpty(Division) ? Division.toUpperCase() : ""
      , Activo
      , IdUsuario: usuario.username
    };
    await crear(data).then(response => {
      if (response) handleSuccessMessages("Se registró con éxito!");
      //setModoEdicion(false);
      cancelarEdicion();
      listarDivisiones();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
    });
  }

  async function actualizarDivision(division) {

    const { IdCliente, IdDivision, IdClientePadre, IdDivisionPadre, Division, Activo } = division;
    let data = {
      IdCliente
      , IdDivision: isNotEmpty(IdDivision) ? IdDivision.toUpperCase() : ""
      , IdClientePadre: isNotEmpty(IdClientePadre) ? IdClientePadre : ""
      , IdDivisionPadre: isNotEmpty(IdDivisionPadre) ? IdDivisionPadre : ""
      , Division: isNotEmpty(Division) ? Division.toUpperCase() : ""
      , Activo
      , IdUsuario: usuario.username
    };
    await actualizar(data).then(response => {
      handleSuccessMessages("Se actualizó con éxito!");
      cancelarEdicion();
      //setModoEdicion(false);
      listarDivisiones();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
    });
  }

  async function eliminarDivision(division) {
    const { IdDivision, IdCliente } = division;
    await eliminar({ IdDivision: IdDivision, IdCliente: IdCliente, IdUsuario: usuario.username }).then(response => {
      handleSuccessMessages("Se eliminó con éxito!");
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
    });
    listarDivisiones();
  }

  async function listarDivisiones() {

    let divisiones = await listar({
      IdCliente: "%"
      , IdDivisionPadre: "%"
      , numPagina: 0
      , tamPagina: 0
    });
    setMenus(divisiones);
  }

  async function obtenerDivision(filtro) {
    const { IdDivision, IdCliente } = filtro;
    if (IdDivision && IdCliente) {
      let division = await obtener({ IdDivision, IdCliente });
      setDataRowEditNew({ ...division, esNuevoRegistro: false });
    }
  }

  const nuevoRegistro = () => {
    let division = { Activo: "S", IdCliente: idCliente };
    setDataRowEditNew({ ...division, esNuevoRegistro: true });
    setTitulo("Nuevo");
    setModoEdicion(true);
  };

  const treeViewSetFocusNodo = (data, idMenu) => {
    let menus = [];
    let objIndex = data.findIndex((obj => obj.IdMenu === idMenu));
    if (objIndex >= 0) data[objIndex].selected = true;
    menus.push(...data);
    return menus;
  }

  const seleccionarNodo = (dataRow) => {

    const { IdCliente, IdDivision, IdMenu } = dataRow;
    setModoEdicion(false);
    setTitulo("Ver");
    if (isNotEmpty(IdCliente) && isNotEmpty(IdDivision)) {
      if (IdDivision !== idDivision) {
        setIdDivision(IdDivision)
        obtenerDivision(dataRow);
        setShowClient(false);
      }
    } else {
      //setDataRowEditNew({});
      //>Listar licencia cuando seleccione una compañia.
      if (isNotEmpty(IdCliente) && !isNotEmpty(IdDivision)) {
        setShowClient(true);
        if (IdCliente !== idCliente) {
          setIdCliente(IdCliente);
          listarLicencias(dataRow);
          obtenerCliente(IdCliente);
        }
      } else {
        setListarSection([]);
      }
    }
    //IdMenu
    if (IdMenu !== idMenu) setIdMenu(IdMenu);
  }

  const editarRegistro = (dataRow) => {
    //const { Menu } = dataRow;
    setModoEdicion(true);
    setTitulo(`Editar`);

  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setTitulo("Ver");
    setIdCliente("");
    setIdDivision("");
    //setDataRowEditNew({});
    //setDataRowEditNewCliente({})
    //setListarSection([]);
    cancelarEdicionSection();
    setShowClient(false);
    //Treeview: Comportamiento para agregar nuevo menu
    setIsSubMenu(false);
    setDataFilter({ IdModulo: "" });
  };

  async function obtenerCliente(idCliente) {
    if (isNotEmpty(idCliente)) {
      let cliente = await obtenerCli({ IdCliente: idCliente });
      setDataRowEditNewCliente({ ...cliente });
    }
  }

  useEffect(() => {
    listarDivisiones();
  }, []);

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones para administrar licenia-:::::::::::::::::::::::::::::::::
  async function listarLicencias(filtro) {
    const { IdCliente } = filtro;
    if (isNotEmpty(IdCliente)) {
      setModoEdicionSection(false);
      let licencias = await listarLi({
        IdModulo: "%"
        , IdCliente
        , NumPagina: 0
        , TamPagina: 0
      });
      setTituloSection("Listado");
      setListarSection(licencias);
    }
  }

  async function agregarLicencia(licencia) {

    const { IdModulo, IdCliente, Licencia, FechaFin, Clave, Activo } = licencia;
    let data = {
      IdModulo: isNotEmpty(IdModulo) ? IdModulo : ""
      , IdCliente: isNotEmpty(IdCliente) ? IdCliente : ""
      , Licencia: isNotEmpty(Licencia) ? Licencia : ""
      , FechaFin: isNotEmpty(FechaFin) ? FechaFin : ""
      , Clave: isNotEmpty(Clave) ? Clave : ""
      , Activo
      , IdUsuario: usuario.username
    };
    await crearLi(data).then(response => {
      if (response) handleSuccessMessages("Se registró con éxito!");
      setModoEdicionSection(false);
      listarLicencias(licencia);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
    });

  }

  async function actualizarLicencia(licencia) {

    const { IdModulo, IdCliente, Licencia, FechaFin, Clave, Activo } = licencia;
    let data = {
      IdModulo: isNotEmpty(IdModulo) ? IdModulo : ""
      , IdCliente: isNotEmpty(IdCliente) ? IdCliente : ""
      , Licencia: isNotEmpty(Licencia) ? Licencia : ""
      , FechaFin: isNotEmpty(FechaFin) ? FechaFin : ""
      , Clave: isNotEmpty(Clave) ? Clave : ""
      , Activo
      , IdUsuario: usuario.username
    };
    await actualizarLi(data).then(response => {
      handleSuccessMessages("Se actualizó con éxito!");
      setModoEdicionSection(false);
      listarLicencias(licencia);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
    });
  }

  async function eliminarLicencia(licencia) {
    const { IdCliente, IdModulo } = licencia;
    await eliminarLi({ IdModulo, IdCliente, IdUsuario: usuario.username }).then(response => {
      handleSuccessMessages("Se eliminó con éxito!");
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
    });
    listarLicencias(licencia);
  }

  async function obtenerLicencia(filtro) {
    const { IdModulo, IdCliente } = filtro;
    if (IdModulo && IdCliente) {
      let licencia = await obtenerLi({ IdModulo, IdCliente });
      setDataRowEditNewSection({ ...licencia, esNuevoRegistro: false });
    }
  }

  const nuevoRegistroLicencia = () => {
    let licencia = { Activo: "S", IdCliente: idCliente };
    setDataRowEditNewSection({ ...licencia, esNuevoRegistro: true });
    setTituloSection("Nuevo");
    setModoEdicionSection(true);
  };

  const editarRegistroLicencia = dataRow => {
    setModoEdicionSection(true);
    setTituloSection("Editar");
    obtenerLicencia(dataRow);
  };

  const cancelarEdicionSection = () => {
    setModoEdicionSection(false);
    setTituloSection("Listado");
    setDataRowEditNewSection({});
  };

  return (
    <>
      <div className="row">

        <div className="col-md-12">

          <Portlet className={classesEncabezado.border}>
            <AppBar position="static" className={classesEncabezado.principal}>
              <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                  {("Gestión de División").toUpperCase()}
                </Typography>
              </Toolbar>
            </AppBar>
            <>
              <div className={classes.root}>
                <Tabs orientation="vertical"
                  value={value}
                  onChange={handleChange}
                  aria-label="Vertical tabs"
                  className={classes.tabs}
                  variant="fullWidth"
                  indicatorColor="primary"
                  textColor="primary">
                  <Tab label="División"
                    icon={<GroupWorkOutlinedIcon fontSize="large" />}
                    //onClick={listadoPersonas} 
                    {...tabPropsIndex(0)} />
                </Tabs>
                <TabPanel value={value} className={classes.TabPanel} index={0}>
                  <>
                    <div className={classes.gridRoot}>
                      <Grid container spacing={1} direction="row" justify="flex-start" alignItems="stretch" >
                        <Grid item xs={5} >
                          <br />
                          {/*##########.-Asignar componente MenuTreeViewPage-##################################################*/}
                          <Paper className={classes.paper}>
                            <>
                              <AppBar position="static" className={classesEncabezado.secundario}>
                                <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                  <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {"CLiente - División".toUpperCase()}
                                  </Typography>
                                </Toolbar>
                              </AppBar>

                              <MenuTreeViewPage
                                menus={treeViewSetFocusNodo(menus, idMenu)}
                                //modulos={modulos}
                                modoEdicion={modoEdicion}
                                dataFilter={dataFilter}
                                setDataFilter={setDataFilter}
                                isSubMenu={isSubMenu}
                                setIsSubMenu={setIsSubMenu}
                                nuevoRegistro={nuevoRegistro}
                                editarRegistro={editarRegistro}
                                eliminarRegistro={eliminarDivision}
                                seleccionarNodo={seleccionarNodo}
                                listarMenu={listarDivisiones}
                                showModulo={false} />

                            </>
                          </Paper>
                        </Grid>
                        <Grid item xs={7} >
                          <br />
                          {/*##########.-Asignar componente DivisionEditPage-##################################################*/}
                          <Paper className={classes.paper}>
                            <>
                              <AppBar position="static" className={classesEncabezado.secundario}>
                                <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                  <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {showClient && ("Cliente".toUpperCase())}
                                    {!showClient && ("División".toUpperCase())}
                                  </Typography>
                                </Toolbar>
                              </AppBar>
                              {!showClient && (
                                <DivisionEditPage
                                  modoEdicion={modoEdicion}
                                  dataRowEditNew={dataRowEditNew}
                                  actualizarDivision={actualizarDivision}
                                  agregarDivision={agregarDivision}
                                  cancelarEdicion={cancelarEdicion}
                                  titulo={titulo}
                                />
                              )}
                              {showClient && (
                                <ClienteEditPage
                                  //clientes={clientes}
                                  modoEdicion={modoEdicion}
                                  dataRowEditNew={dataRowEditNewCliente}
                                  titulo={titulo}
                                  showHeader={false}
                                />
                              )}

                              {/* <div className="container_only">
                                <div className="float-right">
                                  <ControlSwitch checked={auditoriaSwitch}
                                    onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                                  /><b> Datos de auditoría</b>
                                </div>
                              </div>
                              {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)} */}

                            </>
                            <>
                              {/*##########.-Asignar componente Licencia-##################################################*/}
                              <AppBar position="static" className={classesEncabezado.secundario}>
                                <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                  <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {"Lincencias".toUpperCase()}
                                  </Typography>
                                </Toolbar>
                              </AppBar>
                              {modoEdicionSection && (
                                <>
                                  <LicenciaEditPage
                                    modoEdicion={modoEdicion}
                                    dataRowEditNew={dataRowEditNewSection}
                                    actualizarLicencia={actualizarLicencia}
                                    agregarLicencia={agregarLicencia}
                                    cancelarEdicion={cancelarEdicionSection}
                                    titulo={tituloSection}
                                  />
                                  {/* <div className="container_only">
                                    <div className="float-right">
                                      <ControlSwitch checked={auditoriaSwitch}
                                        onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                                      /><b> Datos de auditoría</b>
                                    </div>
                                  </div>
                                  {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewSection} />)} */}

                                </>
                              )}
                              {!modoEdicionSection && (
                                <>
                                  <LicenciaListPage
                                    licencias={listarSection}
                                    editarRegistro={editarRegistroLicencia}
                                    eliminarRegistro={eliminarLicencia}
                                    nuevoRegistro={nuevoRegistroLicencia}
                                    cancelarEdicion={cancelarEdicion}
                                    modoEdicion={modoEdicion}
                                    idCliente={idCliente}
                                  />

                                </>
                              )}
                            </>
                          </Paper>
                        </Grid>
                      </Grid>
                    </div>
                  </>
                </TabPanel>
              </div>
            </>
          </Portlet>
        </div>
      </div>
    </>
  );
};
//->Configuracion tabs.
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },
  TabPanel: {
    order: 0,
    flex: '1 3 50%'
  },
  gridRoot: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(0),
  }

}));

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
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

export default DivisionIndexPage;
