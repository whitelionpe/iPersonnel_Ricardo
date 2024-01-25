import {injectIntl} from "react-intl";
import {Portlet, PortletBody, PortletHeader, PortletHeaderToolbar} from "../../../../../partials/content/Portlet";
import {Button} from "devextreme-react";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import React, {useEffect, useState} from "react";
import Form, {GroupItem, Item} from "devextreme-react/form";
import {isNotEmpty} from "../../../../../../_metronic";
import {useSelector} from "react-redux";
import Paper from "@material-ui/core/Paper";
import {useStylesTab} from "../../../../../store/config/Styles";
import Grid from '@material-ui/core/Grid';
import {serviceContratoUnidad} from "../../../../../api/administracion/contratoUnidadOrganizativa.api";
import {handleErrorMessages, handleSuccessMessages} from "../../../../../store/ducks/notify-messages";
import MenuTreeViewPage from "../../../../../partials/content/TreeView/MenuTreeViewPage";
import Tabs from "@material-ui/core/Tabs";
import DynamicFeedIcon from "@material-ui/icons/DynamicFeed";
import Tab from "@material-ui/core/Tab";
import ContratoUnidadOrganizativaEditPage from "./ContratoUnidadOrganizativaEditPage";
import {defaultPermissions} from "../../../../../../_metronic/utils/securityUtils";
import {makeStyles} from "@material-ui/core/styles";
import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";

const ContratoUnidadOrganizativaListPage_v2 = props => {

  const { intl, contratoActual, setLoading } = props;

  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);

  const classes = useStyles();

  const [modoEdicion, setModoEdicion] = useState(false);
  const [puedeEditar, setPuedeEditar] = useState(false)
  const [modoAgregarEliminar, setModoAgregarEliminar] = useState(false);
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);

  const [tabsVisible, setTabsVisible] = useState(false);
  const [tabHorIndex, setTabHorIndex] = useState(0);
  const [titulo, setTitulo] = useState(
    intl.formatMessage({ id: "ACTION.VIEW" })
  );
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const [modoSeleccionTreeview, setModoSeleccionTreeview] = useState("single");
  const [modoCheckBoxes, setModoCheckBoxes] = useState("none");

  const [listaUnidadesRegistrar, setListaUnidadesRegistrar] = useState([]);

  const [menusUnidadesOrg, setMenusUnidadesOrg] = useState([{
    Icon: "flaticon2-expand"
    , IdMenu: null
    , IdModulo: null
    , IdMenuPadre: null
    , Menu: intl.formatMessage({ id: "SYSTEM.MENU.OPTIONS" })
    , MenuPadre: null
    , Nivel: 0
    , Orden: 0
    , expanded: true
  }]);

  async function listarUnidadOrganizativas() {
    setLoading(true);
    let unidadOrganizativas =
      await serviceContratoUnidad.listarTreeview({
        IdCliente: perfil.IdCliente
        , IdContrato: contratoActual.IdContrato
        , IdMandante: contratoActual.IdCompaniaMandante
        , IdContratista: contratoActual.IdCompaniaContratista
        ,
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
    if (!isNotEmpty(unidadOrganizativas)) {
      setMenusUnidadesOrg([{
        Activo: "S"
        , icon: "flaticon2-expand"
        , IdMenu: null
        , IdMenuPadre: null
        , IdModulo: ""
        , Menu: "-SIN DATOS-"
        , MenuPadre: null
        , expanded: true
      }])
    } else {
      setMenusUnidadesOrg(unidadOrganizativas);

      const unidades = unidadOrganizativas.filter(u => u.Asignado === 'S').map(u => {
        return { IdUnidadOrganizativa: u.IdUnidadOrganizativa, Activo: 'S' }
      });
      setListaUnidadesRegistrar(unidades);

      setLoading(false);
    }
  }

  const agregarContratoUndOrganizativa = async (unidadesOrganizativas) => {

    const unidades = unidadesOrganizativas.map(unidad => {
      return { IdUnidadOrganizativa: unidad.IdUnidadOrganizativa, Activo: 'S' }
    });

    let params = {
      IdCliente: perfil.IdCliente,
      IdContrato: contratoActual.IdContrato,
      IdCompaniaMandante: contratoActual.IdCompaniaMandante,
      IdCompaniaContratista: contratoActual.IdCompaniaContratista,
      IdUsuario: usuario.username,
      IdsUnidadOrganizativas: unidades
    };

    setLoading(true);

    await serviceContratoUnidad.crear(params)
      .then(response => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
        );
        setModoEdicion(false);

        setModoAgregarEliminar(false);
        setModoCheckBoxes("none");
        setModoSeleccionTreeview("single");
        setDataRowEditNew({});
        setTabsVisible(false);
        setPuedeEditar(false);

      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
      .finally(() => {
        setLoading(false);
      });

    await listarUnidadOrganizativas();
  };

  const obtenerDatosContratoUnidadOrganizativa = async (idUnidadOrganizativa) =>{
    let params = {
      IdCliente: perfil.IdCliente,
      IdContrato: contratoActual.IdContrato,
      IdCompaniaMandante: contratoActual.IdCompaniaMandante,
      IdCompaniaContratista: contratoActual.IdCompaniaContratista,
      idUnidadOrganizativa
    };

    setLoading(true);
    let undOrganizativa = await serviceContratoUnidad.obtener(params)
      .finally(
      () => {
        setLoading(false);
      }
    );

    if(isNotEmpty(undOrganizativa)){
      setDataRowEditNew({ ...undOrganizativa, esNuevoRegistro: false });

      setPuedeEditar(true);
      //setTabsVisible(true);
    }
    else{
      setDataRowEditNew({});
      setPuedeEditar(false);
      //setTabsVisible(false);
    }

  };

  const actualizarContratoUndOrganizativa = async dataRow => {
    const { IdUnidadOrganizativa, Activo, Dotacion, IdGrupoAcceso } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdContrato: contratoActual.IdContrato,
      IdCompaniaMandante: contratoActual.IdCompaniaMandante,
      IdCompaniaContratista: contratoActual.IdCompaniaContratista,
      IdUsuario: usuario.username,
      IdUnidadOrganizativa,
      Activo,
      Dotacion,
      IdGrupoAcceso
    };

    ///************************************************** */
    setLoading(true);
    await serviceContratoUnidad.actualizar(params)
      .then(response => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
        );
        setModoEdicion(false);
        //setDataRowEditNew({});
        //setTabsVisible(false);
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
      .finally(() => {
        setLoading(false);
      });

    await listarUnidadOrganizativas();
    //*************************************************** */
  };

  const guardar = async () => {

    if(!modoEdicion){//agrega / elimina
      await agregarContratoUndOrganizativa(listaUnidadesRegistrar);
    }
    else{//actualiza
      document.getElementById("idButtonFrmEditar").click();
      setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    }

  }

  const seleccionarNodo = (nodoInfo) => {
    if(Array.isArray(nodoInfo)){
      setListaUnidadesRegistrar(nodoInfo);
    }
    else{
      if(nodoInfo.Nivel === 1) {
        setTabsVisible(false);

        setPuedeEditar(false);
      }
      else{
        if(!modoAgregarEliminar) {
          obtenerDatosContratoUnidadOrganizativa(nodoInfo.IdUnidadOrganizativa);
        }
        setTabsVisible(true);
      }
    }
  }

  function editarClickHandler(){
    setModoEdicion(true);
    setModoAgregarEliminar(false);

    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
  }

  function btnCheckClickHandler(){
    listarUnidadOrganizativas();
    setModoAgregarEliminar(true);
    setModoEdicion(false);
    setModoSeleccionTreeview("multiple");
    setModoCheckBoxes("normal");
  }

  function btnCancelarClickHandler(){
    setModoEdicion(false);
    setModoAgregarEliminar(false);

    setModoSeleccionTreeview("single");
    setModoCheckBoxes("none");

    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
  }

  function tabPropsIndex(index) {
    return {
      id: `vertical-tab-${index}`,
      'aria-controls': `vertical-tabpanel-${index}`,
    };
  }

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

  const getInfo = () => {
    return [
      {
        text: intl.formatMessage({
          id: "ADMINISTRATION.CONTRACT.CLIENTCOMPANY.ABR"
        }),
        value: contratoActual.CompaniaMandante,
        colSpan: 1
      },
      {
        text: intl.formatMessage({
          id: "ADMINISTRATION.CONTRACT.CONTRACTORCOMPANY.ABR"
        }),
        value: contratoActual.CompaniaContratista,
        colSpan: 1
      },
      {
        text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" }),
        value: contratoActual.IdContrato,
        colSpan: 1
      }
    ];
  };

  useEffect( () => {
    listarUnidadOrganizativas();
  }, [])

  return(
    <>
      <HeaderInformation
        data={props.getInfo()}
        visible={true}
        labelLocation={'left'}
        colCount={3}
        toolbar={
          <PortletHeader
            title=""
            toolbar={
              <PortletHeaderToolbar>
                <PortletHeaderToolbar>
                  <Button
                    icon="fa fa-check"
                    type={"normal"}
                    hint={"Agregar/Eliminar Unid. Org."}
                    onClick={btnCheckClickHandler}
                    disabled={modoEdicion || modoAgregarEliminar}
                  />
                  <Button
                    icon="fa fa-edit"
                    type={"normal"}
                    hint={"Editar Contrato Unidad Org."}
                    onClick={editarClickHandler}
                    disabled={(modoAgregarEliminar || modoEdicion) || !puedeEditar}
                  />
                  <Button
                    icon="fa fa-save"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                    onClick={guardar}
                    disabled={!modoEdicion && !modoAgregarEliminar}
                  />
                  &nbsp;
                  <Button
                    icon="fa fa-times-circle"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                    disabled={!modoEdicion && !modoAgregarEliminar}
                    onClick={btnCancelarClickHandler}
                  />
                </PortletHeaderToolbar>
              </PortletHeaderToolbar>
            }
          />
        }
      />

      <PortletBody>
        <Paper className={classes.paper}>
          <Grid container spacing={1} direction="row" justify="flex-start" alignItems="stretch" >
            <Grid item xs={5} style={{ borderRight: "1px solid #ebedf2" }} >
              <MenuTreeViewPage
                id={"treeViewContratoUndOrg"}
                menus={menusUnidadesOrg}
                modoEdicion={modoEdicion}
                seleccionarNodo={seleccionarNodo}
                selectionMode={modoSeleccionTreeview}
                showCheckBoxesModes={modoCheckBoxes}
                showModulo={false}
                showButton={false}
                selectNodesRecursive={false}
              />
            </Grid>

            { (tabsVisible && !modoAgregarEliminar) && (
                <Grid item xs={7} >
                  <>
                    {/*<Paper square className={classes.root}>
                      <Tabs
                        value={tabHorIndex}
                        //onChange={handleChange}
                        variant="fullWidth"
                        indicatorColor="primary"
                        textColor="primary">

                        <Tab
                          label={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.ORGANIZATIONALUNIT" })}
                          icon={<DynamicFeedIcon fontSize="large" />}
                          onClick={(e) => {
                          }}
                          {...tabPropsIndex(0)}
                          className={classes.tabContent}
                          disabled={false}
                        />

                      </Tabs>
                    </Paper>*/}

                    <TabPanel value={tabHorIndex} className={classes.TabPanel} index={0}>
                      <ContratoUnidadOrganizativaEditPage
                        titulo={titulo}
                        modoEdicion={modoEdicion}
                        dataRowEditNew={dataRowEditNew}
                        setDataRowEditNew={setDataRowEditNew}
                        actualizarContratoUndOrganizativa={
                         actualizarContratoUndOrganizativa
                        }
                        IdCliente={perfil.IdCliente}
                        getInfo={getInfo}
                        accessButton={accessButton}

                      />

                      <div className="container_only">
                        <div className="float-right">
                          <ControlSwitch
                            checked={auditoriaSwitch}
                            onChange={e => {
                              setAuditoriaSwitch(e.target.checked);
                            }}
                          />
                          <b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
                        </div>
                      </div>
                      {auditoriaSwitch && (
                        <AuditoriaPage dataRowEditNew={dataRowEditNew} />
                      )}
                    </TabPanel>
                  </>
                </Grid>
              )
            }
          </Grid>
        </Paper>
      </PortletBody>

    </>
  );
};

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
  tabContent: {
    '&.Mui-selected': {
      color: '#337ab7',
    },
  },
  gridRoot: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(0),
    //textAlign: 'left',
    //backgroundColor: theme.palette.background.paper,
  }

}));

export default injectIntl(ContratoUnidadOrganizativaListPage_v2);
