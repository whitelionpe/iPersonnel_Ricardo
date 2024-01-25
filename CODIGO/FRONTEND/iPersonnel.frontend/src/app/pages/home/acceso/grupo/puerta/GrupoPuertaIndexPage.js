import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";

import { useSelector } from "react-redux";
import { isNotEmpty } from "../../../../../../_metronic";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../../_metronic/utils/securityUtils'

import HeaderInformation from "../../../../../partials/components/HeaderInformation";

import { serviceAccesoGrupoPuerta } from "../../../../../api/acceso/grupoPuerta.api";
import { obtener as obtenerPuertaService, serviceAccesoPuerta } from "../../../../../api/acceso/puerta.api";
import PuertaListPage from "../puerta/PuertaListPage";


//TreeView   
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import MenuTreeViewPage from "../../../../../partials/content/TreeView/MenuTreeViewPage";

import { Button } from "devextreme-react";
import { PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import Alert from '@material-ui/lab/Alert';

const GrupoPuertaIndexPage = (props) => {
  const { intl, setLoading, dataMenu, selected, varIdGrupo, getInfo, cancelarEdicion } = props;
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const [varIdZona, setvarIdZona] = useState("");


  const [selectedNodos, setSelectedNodos] = useState([]);

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);


  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();

  const [isVisibleAlert, setIsVisibleAlert] = useState(false);


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
  //************************************************************* */
  const [selectedNode, setSelectedNode] = useState();
  const [dataPuertaGrupo, setDataPuertaGrupo] = useState([]);
  const [customTree, setCustomTree] = useState();
  const [nombreSelect, setNombreSelect] = useState();


  /************--Configuración de acceso de botones***********************/
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 1; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  //::::::::::::::::::::::::::::::::::::::::-Obtener Puerta-::::::::::::::::::::::::::::::::::::::::::::::::::://
  // async function obtenerGrupoPuerta(filtro) {
  //   const { IdPuerta, IdGrupo, IdZona, IdCliente, IdDivision } = filtro;
  //   if (isNotEmpty(IdPuerta)) {
  //     let puerta = await obtenerPuertaService({
  //       IdPuerta,
  //       IdGrupo,
  //       IdZona,
  //       IdCliente,
  //       IdDivision
  //     }).catch(err => {
  //       handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
  //     });;
  //     //setDataRowEditNewSection({ ...puerta, esNuevoRegistro: false });
  //   }
  // }


  //:::::-FUNCIÓN PUERTA-:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  //LISTAR ZONAS
  async function listarTreeView() {
    setLoading(true);

    await serviceAccesoGrupoPuerta.listarTreeView({
      IdCliente: perfil.IdCliente
      , IdDivision: perfil.IdDivision
      , IdGrupo: varIdGrupo
      , IdModulo: isNotEmpty(dataMenu.info.IdModulo) ? dataMenu.info.IdModulo : ""
      , numPagina: 0
      , tamPagina: 0
    }).then(grupoPuerta => {
      setCustomTree(grupoPuerta);
      setMenus(grupoPuerta);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  //SELECCIONAR ZONAS
  const seleccionarNodo = (dataRow) => {

    setSelectedNodos(dataRow);
    const { IdDivision, IdZona, IdModulo } = dataRow;

    if (isNotEmpty(IdDivision) && isNotEmpty(IdZona)) {

      listarGrupoPuerta(dataRow);
      setvarIdZona(IdZona);

      let names = customTree.filter(s => s.IdMenu == dataRow.IdMenu).map(s => s.Menu);
      setNombreSelect("-" + " " + names);
    }
    else {

      setNombreSelect("-");
      setvarIdZona("");
      setDataPuertaGrupo([]);     

    }
    //Módulo  con permiso...
    if (!isNotEmpty(IdModulo)) {
      setIsVisibleAlert(true);
    } else {
      setIsVisibleAlert(false);
    }

    setSelectedNode(dataRow);
   
  }


  //LISTA PUERTAS SELECCIONADAS
  async function listarGrupoPuerta(filtro) {

    const { IdCliente, IdDivision, IdZona } = filtro;
    setLoading(true);
    if (isNotEmpty(IdZona) && isNotEmpty(varIdGrupo)) {
      //setModoEdicionSection(false);

      let puertas = await serviceAccesoGrupoPuerta.listar({
        IdCliente
        , IdDivision
        , IdZona
        , IdGrupo: varIdGrupo

      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      //console.log("puertas:::>", puertas);
      setDataPuertaGrupo(puertas);
      //setTotalPuertas(puertas.length);
    }
  }

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  // IdGrupo: varIdGrupo
  async function agregarGrupoPuerta(grupoPuertas) {
    grupoPuertas.IdGrupo = varIdGrupo;
    //console.log("grupoPuertas:::>", grupoPuertas);
    await serviceAccesoGrupoPuerta.crearMultiple({ ...grupoPuertas, IdGrupo: varIdGrupo }).then(response => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));

      listarTreeView();
      setvarIdZona("");

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  useEffect(() => {
    loadControlsPermission();
    listarTreeView();

  }, []);

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <div className={classes.gridRoot}>
        <HeaderInformation data={getInfo()} visible={true} labelLocation={'left'} colCount={6}
          toolbar={

            <PortletHeader
              title={""}
              toolbar={
                <PortletHeaderToolbar>

                  <Button
                    icon="fa fa-times-circle"
                    type="normal"
                    hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                    onClick={cancelarEdicion}
                  />
                </PortletHeaderToolbar>
              }>

            </PortletHeader>

          } />
        <Paper className={classes.paper}>
          <Grid container spacing={1} direction="row" justify="flex-start" alignItems="stretch" >
            <Grid item xs={6} style={{ borderRight: "1px solid #ebedf2" }} >

              <MenuTreeViewPage
                id="MenuTreeViewPage"
                menus={menus}
                modoEdicion={modoEdicion}
                seleccionarNodo={seleccionarNodo}
              />
            </Grid>

            <Grid item xs={6} >
              {/*##########.-Asignar componente --GrupoPuerta-##################################################*/}

              <AppBar position="static" className={classesEncabezado.secundario}>
                <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                  <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                    {intl.formatMessage({ id: "ACCESS.GROUP.RESTRICTION.DOORS" })}  {nombreSelect}
                  </Typography>
                </Toolbar>
              </AppBar>

              {isVisibleAlert && (
                <Alert severity="warning" variant="outlined">
                  <div style={{ color: 'red' }} >
                    {intl.formatMessage({ id: "ACCESS.GROUP.MESSAGE" })}
                  </div>
                </Alert>
              )}
              {/*##########################################-PuertaListPage-####################################################*/}
              {varIdZona !== "" && (
                <PuertaListPage
                  dataRowEditNew={dataRowEditNew}
                  //cancelarEdicion={cancelarEdicion}
                  accessButton={accessButton}
                  agregarGrupoPuerta={agregarGrupoPuerta}
                  listarPuerta={listarGrupoPuerta}
                  puertas={dataPuertaGrupo}
                  showButton={true}
                  selectedNodos={selectedNodos}
                  setSelectedNodos={setSelectedNodos}
                  isVisibleAlert={isVisibleAlert}
                />
              )}

            </Grid>

          </Grid>
        </Paper>
      </div>


    </>
  );
};

export default injectIntl(WithLoandingPanel(GrupoPuertaIndexPage));
