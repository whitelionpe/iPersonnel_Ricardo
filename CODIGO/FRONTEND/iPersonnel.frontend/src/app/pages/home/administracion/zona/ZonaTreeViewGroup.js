import React, { useEffect, useState } from "react";
import { Portlet } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { useSelector } from "react-redux";
import { isNotEmpty } from "../../../../../_metronic";

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import GroupWorkOutlinedIcon from '@material-ui/icons/GroupWorkOutlined';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import OnlyTreeViewPage from "../../../../partials/content/TreeView/OnlyTreeViewPage";

import {
  eliminar,
  obtener,
  crear,
  actualizar,
  //listarTreeview
} from "../../../../api/administracion/zona.api";
import ZonaEditPage from "./ZonaEditPage";

 import { listarTreeview } from "../../../../api/acceso/grupoRestriccion.api";


const options = [{ id: 1, name: 'Zona', icon: 'map' }, { id: 2, name: 'Puerta', icon: 'key' }];

const ZonaTreeViewGroup = (props) => {
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);


  const [idMenu, setIdMenu] = useState("PE");
  const [idCliente, setIdCliente] = useState("");
  const [idDivision, setIdDivision] = useState("");
  const [idZona, setIdZona] = useState("");
  const [idPuerta, setIdPuerta] = useState("");
  const [showDoor, setShowDoor] = useState(false);
  //const [divisiones, setDivisiones] = useState([]);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState("Editar");
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);

  const classesEncabezado = useStylesEncabezado();

  const [menus, setMenus] = useState([{
    Icon: "flaticon2-expand"
    , IdMenu: null
    , IdMenuPadre: null
    , Menu: "-OPCIONES DE MENÚ-"
    , MenuPadre: null
    , Nivel: 0
    , expanded: true
    , selected: false
  }]);
  const [dataFilter, setDataFilter] = useState({ IdModulo: "" });
  const [isSubMenu, setIsSubMenu] = useState(false);
  const [modulos, setModulos] = useState([]);

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


  async function listarZona() {
    console.log(" ===> listarZona")
    let zonas = await listarTreeview({
        IdCliente: perfil.IdCliente
      , IdDivision: perfil.IdDivision
      , IdPersona : props.varIdPersona
    });
    console.log("listarZona",zonas);
    setMenus(zonas);

  }


  const treeViewSetFocusNodo = (data, idMenu) => {
    let menus = [];
    let objIndex = data.findIndex((obj => obj.IdMenu === idMenu));
    if (objIndex >= 0) data[objIndex].selected = false;
    menus.push(...data);
    return menus;
  }

  const seleccionarNodo = (dataRow) => {

    console.log("seleccionarNodo", dataRow);
    //Zona
    //Puerta
    const { IdMenu, IdCliente, IdDivision, IdZona, IdPuerta } = dataRow;
    setModoEdicion(false);
    setTitulo("Ver");

    if (isNotEmpty(IdCliente) && isNotEmpty(IdDivision) && isNotEmpty(IdZona) && isNotEmpty(IdPuerta)) {
      //if (IdPuerta !== idPuerta) {
      setIdPuerta(IdPuerta);
      setShowDoor(true);
      //obtenerPuerta(dataRow);
      //listarEquipo({ IdCliente, IdDivision, IdZona, IdPuerta });
      //}
    } else {
      //setDataRowEditNew({});

      if (isNotEmpty(IdCliente) && isNotEmpty(IdDivision) && isNotEmpty(IdZona)) {

        //if (IdZona !== idZona) {
        setIdZona(IdZona);
        setShowDoor(false);
        //obtenerZona(dataRow);
        //}
      } else {
        setDataRowEditNew({});
        setListarSection([]);
      }
      //>Listar licencia cuando seleccione una compañia.
      if (isNotEmpty(IdCliente) && isNotEmpty(IdDivision)) {

        if (IdCliente !== idCliente) {
          setIdCliente(IdCliente);
          //listarLicencias(dataRow);
        }
        if (IdDivision !== idDivision) {
          setIdDivision(IdDivision);
        }
      }
    }
    //IdMenu
    if (IdMenu !== idMenu) setIdMenu(IdMenu);

  }


  useEffect(() => {
    listarZona();
  }, []);



  return (
  
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
                                    {"División - Zona".toUpperCase()}
                                  </Typography>
                                </Toolbar>
                              </AppBar>
                
                              <OnlyTreeViewPage
                                 menus={treeViewSetFocusNodo(menus, idMenu)}
                                 // modulos={modulos}
                                 // modoEdicion={modoEdicion}
                                //dataFilter={dataFilter}
                                // setDataFilter={setDataFilter}
                                  isSubMenu={false}
                                 // setIsSubMenu={setIsSubMenu}
                                  seleccionarNodo={seleccionarNodo}
                                  listarMenu={listarZona}
                                  showModulo={false}
                                  options={options}
                                  showCheckBoxesModes={"normal"}
                                  selectionMode = {"multiple"} 
                                  showButton = {false}
                                  setParentData = { props.setParentData }
                                  setTreeViewRef = { props.setTreeViewRef }
                              />
                            </>

                          </Paper>
                        </Grid>
                        <Grid item xs={7} >
                          <br />
 
                        </Grid>
                      </Grid>
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

export default ZonaTreeViewGroup;
