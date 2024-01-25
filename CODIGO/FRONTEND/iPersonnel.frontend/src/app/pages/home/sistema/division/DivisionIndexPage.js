import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Portlet } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { useSelector } from "react-redux";
import { isNotEmpty } from "../../../../../_metronic";

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import PropTypes from 'prop-types';
import PeopleAlt from '@material-ui/icons/PeopleAlt';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import MenuTreeViewPage from "../../../../partials/content/TreeView/MenuTreeViewPage";

import { Button } from "devextreme-react";
import { PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";


import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

import { eliminar, obtener, listar, listarTreeview, crear, actualizar } from "../../../../api/sistema/division.api";

import DivisionEditPage from "./DivisionEditPage";

import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import Confirm from "../../../../partials/components/Confirm";

import ZonaModuloEditPage from "../../administracion/zonaModulo/ZonaModuloEditPage";
import {
  serviceZonaModulo
} from "../../../../api/administracion/zonaModulo.api";

import {
  obtener as ObtenerZonas
} from "../../../../api/administracion/zona.api";

const DivisionIndexPage = (props) => {

  const { intl, setLoading, dataMenu } = props;

  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const [focusedRowKey, setFocusedRowKey] = useState();
  const [dataCheck, setDatacheck] = useState([]);
  const [modulosSeleccionados, setModulosSeleccionados] = useState([]);
  const [showForm, setShowForm] = useState("");
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(true);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.EDIT" }));
  const [listar, setListar] = useState([]);
  const [listarTabs, setListarTabs] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [selected, setSelected] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});
  const [nivel_popup, setNivel_popup] = useState(0);
  const [messagePopup, setMessagePopup] = useState("");
  const [idMenu, setIdMenu] = useState("");

  const [menus, setMenus] = useState([{
    Icon: "flaticon2-expand"
    , varIdMenu: null
    , varIdMenuPadre: null
    , Menu: intl.formatMessage({ id: "SYSTEM.MENU.OPTIONS" })
    , MenuPadre: null
    , Nivel: 0
    , expanded: true
    , selected: false
  }]);


  const [isSubMenu, setIsSubMenu] = useState(false);
  const [actionButton, setActionButton] = useState({ newDivision: false, newZona: false, edit: false, save: false, delete: false, cancel: false });

  //Configuración de tabs
  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedNode, setSelectedNode] = useState();

  const handleChange = (event, newValue) => {
    //Estado cambio de tabs
    setTabIndex(newValue);
  };


  const [varIdDivision, setVarIdDivision] = useState("");


  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });

  const [dataSource] = useState(ds);

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

  const [isVisibleSecondary, setIsVisibleSecondary] = useState(false);
  const [instanceSecondary, setInstanceSecondary] = useState({});

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones para Sistema División-:::::::::::::::::::::::::::::::::

  async function agregarDivision(datarow) {

    setLoading(true);
    const { IdCliente, IdDivision, IdClientePadre, IdDivisionPadre, Division, IdPais, Activo } = datarow;
    let data = {
      IdCliente
      , IdDivision: isNotEmpty(IdDivision) ? IdDivision.toUpperCase() : ""
      , IdClientePadre: isNotEmpty(IdClientePadre) ? IdClientePadre : ""
      , IdDivisionPadre: isNotEmpty(IdDivisionPadre) ? IdDivisionPadre : ""
      , Division: isNotEmpty(Division) ? Division.toUpperCase() : ""
      , IdPais: isNotEmpty(IdPais) ? IdPais.toUpperCase() : ""
      , Activo
      , IdUsuario: usuario.username
    };
    await crear(data)
      .then(response => {
        if (response)
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));

        listarDivision();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function actualizarDivision(datarow) {

    setLoading(true);
    const { IdCliente, IdDivision, IdClientePadre, IdDivisionPadre, Division, IdPais, Activo } = datarow;
    let data = {
      IdCliente
      , IdDivision: isNotEmpty(IdDivision) ? IdDivision.toUpperCase() : ""
      , IdClientePadre: isNotEmpty(IdClientePadre) ? IdClientePadre : ""
      , IdDivisionPadre: isNotEmpty(IdDivisionPadre) ? IdDivisionPadre : ""
      , Division: isNotEmpty(Division) ? Division.toUpperCase() : ""
      , IdPais: isNotEmpty(IdPais) ? IdPais.toUpperCase() : ""
      , Activo
      , IdUsuario: usuario.username
    };
    await actualizar(data)
      .then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));

        setActionButton({ new: true, edit: true, save: false, cancel: false });
        listarDivision();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }


  async function eliminarNodoTreeview(selected, confirm) {
    setSelectedDelete(selectedNode);
    setIsVisible(true);

    if (confirm) {
      const { IdCliente, IdDivision, IdZona } = selectedNode;
      if (isNotEmpty(IdZona)) {
        //Zona
        await serviceZonaModulo.eliminar({ IdDivision, IdZona }).then(() => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        });

      } else if (isNotEmpty(IdDivision)) {
        //División 
        await eliminar({ IdDivision, IdCliente, IdUsuario: usuario.username }).then(response => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        });
      }
      listarDivision();
    }
  }

  async function listarDivision() {
    setLoading(true);
    let divisiones = await listarTreeview({
      IdCliente: perfil.IdCliente,
      IdDivision: '%',
      verZona: 'S'
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });
    if (!isNotEmpty(divisiones)) {
      setMenus([{
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
      setMenus(divisiones);
      setLoading(false);
    }
    setModoEdicion(false);
  }

  async function obtenerDivision(filtro) {
    setLoading(true);
    //debugger;
    const { IdDivision, IdCliente } = filtro;
    await obtener({
      IdDivision, IdCliente
    }).then(division => {
      setDataRowEditNew({ ...division, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function loadMessagePopUp(p_data, p_confirm, p_cancel, p_nivelPopUp) {

    if (p_confirm) {
      // p_nivelPopUp => -1= ok | -2 = cancel
      switch (nivel_popup) {
        case -2:
        case 2: nuevoRegistroDivisionZona("Division"); break;
        case 3: nuevoRegistroDivisionZona("Zona"); break;
      }


    }
    if (p_cancel) {
      switch (nivel_popup) {
        case 2: callConfirmZona(); break;
      }

    } else {
      //console.log("cargaObjeto", p_confirm, p_cancel, p_nivelPopUp);
      setSelected(p_data);
      setIsVisibleSecondary(true);
      setNivel_popup(p_nivelPopUp)
    }

  }

  const callConfirmZona = () => {
    setTimeout(function () {
      const { IdCliente, IdDivision, IdZona, IdPuerta, Nivel } = selectedNode;
      let objeto = { Activo: "S", IdCliente, IdDivision, IdZona, IdPuerta: "" };
      setMessagePopup(intl.formatMessage({ id: "¿Desea Agregar una Zona?" }));
      loadMessagePopUp(objeto, false, false, 3);
    }, 500);
  }

  const nuevoRegistroDivisionZona = (str_objeto) => {
    nuevoRegistroConfirm(selected, str_objeto);
  }

  const nuevoRegistroConfirm = (objeto, tipo) => {
    setShowForm(tipo);
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    //Activar botones
    setActionButton({ newDivision: false, newZona: false, edit: false, save: true, cancel: true });
    setDataRowEditNew({ ...objeto, esNuevoRegistro: true });
  }

  const callConfirmPuerta = () => {
    //console.log("callConfirmPuerta", selectedNode);

    setTimeout(function () {
      const { IdCliente, IdDivision, IdZona, IdPuerta, Nivel } = selectedNode;
      let objeto = { Activo: "S", IdCliente, IdDivision, IdZona, IdPuerta: "" };
      setMessagePopup(intl.formatMessage({ id: "ADMINISTRATION.ZONE.ADD.DOOR" }));
      loadMessagePopUp(objeto, false, false, 3);
    }, 500);

  }

  const nuevoDivision = () => {

    const { IdCliente, IdDivision, IdDivisionPadre, IdMenu, IdMenuPadre, Nivel, IdPais, IdZona } = selectedNode;

    let objeto = {};
    setDatacheck([]);

    if (Nivel === 2) {
      objeto = { IdPais: IdPais, Activo: "S", IdCliente: perfil.IdCliente, IdClientePadre: IdCliente, IdDivisionPadre: IdDivision, IdDivision: "", };

    }

    if (Nivel === 3 || (Nivel === 4 && !isNotEmpty(IdZona))) {

      objeto = { IdPais: IdPais, Activo: "S", IdCliente: perfil.IdCliente, IdClientePadre: IdCliente, IdDivisionPadre: IdDivision, IdDivision: "", };

    }

    nuevoRegistroConfirm(objeto, "Division");

  };


  const nuevoZona = () => {

    const { IdCliente, IdDivision, IdDivisionPadre, IdMenu, IdMenuPadre, Nivel, IdPais, IdZona } = selectedNode;

    let objeto = {};

    setDatacheck([]);

    if (Nivel === 3 || (Nivel === 4 && !isNotEmpty(IdZona))) {
      objeto = { IdPais: IdPais, Activo: "S", IdCliente: perfil.IdCliente, IdClientePadre: IdCliente, IdDivisionPadre: IdDivision, IdDivision: IdDivision, };

    }

    if (Nivel === 4 && isNotEmpty(IdZona)) {

      objeto = { Activo: "S", IdCliente, IdDivision, IdZonaPadre: IdZona };

    }

    nuevoRegistroConfirm(objeto, "Zona");

  };

  const seleccionarNodo = async (dataRow) => {

    setLoading(true);
    //debugger;
    const { IdCliente, IdDivision, IdDivisionPadre, IdMenu, IdMenuPadre, Menu, Nivel, IdZona } = dataRow;

    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));

    if (IdMenu != idMenu) {

      // if (Nivel === 1) {
      //   setShowForm("");
      //   setSelectedNode(dataRow);
      //   setActionButton({ new: true, delete: false, edit: false });
      if (Nivel === 2) {
        setShowForm("");
        // setActionButton({ new: true, delete: false, edit: false });
        setActionButton({ newDivision: true, newZona: false, edit: false, save: false, delete: false, cancel: false });
      } else if (Nivel === 3) {
        setShowForm("Division");
        setActionButton({ newDivision: true, newZona: true, edit: true, save: false, delete: true, cancel: false });
        await obtenerDivision(dataRow);
        // setActionButton({ new: true, delete: false, edit: false });

      } else if (Nivel === 4 && !isNotEmpty(IdZona)) {
        setShowForm("Division");
        setActionButton({ newDivision: true, newZona: true, edit: true, save: false, delete: true, cancel: false });
        await obtenerDivision(dataRow);
        // setActionButton({ new: true, delete: true, edit: true });

      } else if (Nivel === 4) {
        setShowForm("Zona");
        setActionButton({ newDivision: false, newZona: true, edit: true, save: false, delete: true, cancel: false });
        await obtenerZona(dataRow);
        // setActionButton({ new: true, delete: true, edit: true });

      }


      setVarIdDivision(IdDivision);
      setSelectedNode(dataRow);
    }

    setLoading(false);

  }

  const editarRegistro = (dataRow) => {
    setModoEdicion(true);
    //Activar botones
    setActionButton({ new: false, edit: false, save: true, cancel: true });
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));

  };

  const cancelarEdicion = () => {
    setDatacheck([]);
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    setVarIdDivision("");
    setListarTabs([]);
    setListar([]);
    // setActionButton({ new: true, edit: true, save: false, cancel: false });
    setActionButton({ newDivision: isNotEmpty(selectedNode.IdZona) ? false : true, newZona: true, edit: true, save: false, remove: true, cancel: false });
    setIsSubMenu(false);
    //setDataFilter({ IdModulo: "" });
  };

  useEffect(() => {
    listarDivision();
  }, []);


  //PERSONAS///
  const seleccionarRegistro = dataRow => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };

  //Configuración de Tabs y botones
  const [accessButton, setAccessButton] = useState(defaultPermissions);



  //:::::::::::::::::::::::::::::::::::::::::::::-Funciones para administrar Zona Módulo -:::::::::::::::::::::::::::::::::

  async function agregarZona(zona) {
    setLoading(true);
    const { IdDivision, IdZona, IdZonaPadre, Zona, Modulos, Activo } = zona;
    let data = {
      IdDivision: isNotEmpty(IdDivision) ? IdDivision : ""
      , IdZona: isNotEmpty(IdZona) ? IdZona.toUpperCase() : ""
      , IdZonaPadre: isNotEmpty(IdZonaPadre) ? IdZonaPadre : ""
      , Zona: isNotEmpty(Zona) ? Zona.toUpperCase() : ""
      , Activo
      , Modulos: isNotEmpty(Modulos) ? Modulos : ""
    };
    await serviceZonaModulo.crear(data).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      //setModoEdicion(false);
      setActionButton({ new: false, edit: false, save: false, cancel: true });
      // listarZona();
      listarDivision()
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarZona(zona) {
    setLoading(true);
    const { IdCliente, IdDivision, IdZona, IdZonaPadre, Zona, Modulos, Activo } = zona;
    let data = {
      IdCliente: isNotEmpty(IdCliente) ? IdCliente : ""
      , IdDivision: isNotEmpty(IdDivision) ? IdDivision : ""
      , IdZona: isNotEmpty(IdZona) ? IdZona.toUpperCase() : ""
      , IdZonaPadre: isNotEmpty(IdZonaPadre) ? IdZonaPadre : ""
      , Zona: isNotEmpty(Zona) ? Zona.toUpperCase() : ""
      , Activo
      , Modulos: isNotEmpty(Modulos) ? Modulos : ""

    };
    await serviceZonaModulo.actualizar(data).then(response => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      //setModoEdicion(false);
      setActionButton({ new: false, edit: false, save: false, cancel: true });
      // listarZona();
      listarDivision()
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerZona(filtro) { 
    setLoading(true);

    const { IdDivision, IdZona, IdMenu } = filtro;
    if (isNotEmpty(IdMenu)) {
      // let zona = await serviceZonaModulo.obtener({ IdDivision, IdZona })
      let zona = await ObtenerZonas({ IdZona, IdCliente: perfil.IdCliente, IdDivision })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { });

      // setDataRowEditNew({ ...zona, esNuevoRegistro: false });

      setModulosSeleccionados([]);
      setDatacheck([]);

      let dataModulos = await serviceZonaModulo.obtenerTodos({
        IdDivision: IdDivision,
        IdZona: IdZona,
        IdModulo: '%',
        NumPagina: 0,
        TamPagina: 0
      }).finally(() => {

      });

      // +++++++++++++++++++++++++++++++++++++++++++++ Get Modules  +++++++++++++++++++++++++++++++++++++++++++++ 

      console.log("dataModulos|", dataModulos);

      let strModulos = dataModulos.filter(x => x.Check).map(x => (x.IdModulo)).join('|');

      let dataCheckAux = [];

      if (dataModulos.length > 0) {
        for (let i = 0; i < dataModulos.length; i++) {
          if (!dataCheckAux.find(x => x.IdModulo === dataModulos[i].IdModulo))
            dataCheckAux.push(dataModulos[i].IdModulo);
        }
        setDatacheck(dataCheckAux);

      } else {
        setDatacheck([]);
      }
      // contrato Modulos
      setDataRowEditNew({ ...zona, Modulos: strModulos, esNuevoRegistro: false });
      console.log("obtenerZona|zona:", zona);
      setLoading(false);
    }
    else {
      handleInfoMessages(intl.formatMessage({ id: "SYSTEM.MENU.MESSAGE.SELECTIONMENU" }));
    }

    setLoading(false);
  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function eliminarListRowTab(selected, confirm) {
    let currentTab = tabIndex;
    console.log("eliminarListRowTab|currentTab:", currentTab);
    switch (currentTab) {
      case 0:
        eliminarNodoTreeview(selected, confirm);
        break;
    }
  }

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }



  return (
    <>

      <div className="row">

        <div className="col-md-12">
          <CustomBreadcrumbs
            Title={intl.formatMessage({ id: "ADMINISTRATION.PERSON.MENU" })}
            SubMenu={intl.formatMessage({ id: "CONFIG.MENU.ADMINISTRACION.ESTRUCTURA_EMPRESARIAL" })}
            Subtitle={intl.formatMessage({ id: "SYSTEM.DIVISION.MAINTENANCE" })}
          />
          <Portlet className={classesEncabezado.border}>
            <AppBar position="static" className={classesEncabezado.principal}>
              <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                  {(intl.formatMessage({ id: "SYSTEM.DIVISION.MAINTENANCE" })).toUpperCase()}
                </Typography>
              </Toolbar>
            </AppBar>
            <>
              <div className={classes.root}>

                <Tabs orientation="vertical"
                  value={tabIndex}
                  onChange={handleChange}
                  aria-label="Vertical tabs"
                  className={classes.tabs}
                  variant="fullWidth"
                  indicatorColor="primary"
                  textColor="primary">

                  <Tab label={intl.formatMessage({ id: "SYSTEM.DIVISION.MAINTENANCE" })}
                    icon={<PeopleAlt fontSize="large" />}
                    {...tabPropsIndex(0)}
                    className={classes.tabContent}
                  />

                </Tabs>

                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
                  <>
                    <div className={classes.gridRoot}>

                      <PortletHeader
                        title={""}
                        toolbar={
                          <PortletHeaderToolbar>

                            <Button
                              icon="folder"
                              type="default"
                              hint={intl.formatMessage({ id: "Agregar División" })}
                              onClick={nuevoDivision}
                              disabled={!actionButton.newDivision}
                            />
                            &nbsp;
                            <Button
                              icon="map"
                              type="default"
                              hint={intl.formatMessage({ id: "Agregar Zona" })}
                              onClick={nuevoZona}
                              disabled={!actionButton.newZona}
                            />
                           
                            &nbsp;
                            <Button
                              icon="fa fa-edit"
                              type="default"
                              hint="Editar"
                              disabled={!actionButton.edit}
                              onClick={editarRegistro}
                            />
                            &nbsp;
                            <Button
                              icon="fa fa-save"
                              type="default"
                              hint="Grabar"
                              onClick={() => { document.getElementById("idButtonGrabarTview").click() }}
                              disabled={!actionButton.save}
                            />
                            &nbsp;
                            <Button
                              icon="fa fa-trash"
                              type="default"
                              hint="Eliminar"
                              onClick={eliminarNodoTreeview}
                              disabled={!actionButton.delete}
                            />
                            &nbsp;
                            <Button
                              icon="fa fa-times-circle"
                              type="normal"
                              hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                              onClick={cancelarEdicion}
                              disabled={!actionButton.cancel}
                            />
                          </PortletHeaderToolbar>
                        }>

                      </PortletHeader>

                      <Paper className={classes.paper}>
                        <Grid container spacing={1} direction="row" justify="flex-start" alignItems="stretch" >
                          <Grid item xs={5} style={{ borderRight: "1px solid #ebedf2" }} >

                            <MenuTreeViewPage
                              menus={menus}
                              modoEdicion={modoEdicion}
                              seleccionarNodo={seleccionarNodo}
                            />

                          </Grid>

                          <Grid item xs={7} >
                            <Paper className={classes.paper}>
                              <>

                                {showForm === "Division" && (

                                  <DivisionEditPage
                                    modoEdicion={modoEdicion}
                                    dataRowEditNew={dataRowEditNew}
                                    actualizarDivision={actualizarDivision}
                                    agregarDivision={agregarDivision}
                                    cancelarEdicion={cancelarEdicion}
                                    titulo={titulo}
                                    showButtons={false}
                                    showAppBar={true}
                                    disabledOptionPais={true}
                                    accessButton={accessButton}
                                    settingDataField={dataMenu.datos}
                                  />
                                )}

                                {showForm === "Zona" && (
                                  <ZonaModuloEditPage
                                    modoEdicion={modoEdicion}
                                    dataRowEditNew={dataRowEditNew}
                                    actualizarZona={actualizarZona}
                                    agregarZona={agregarZona}
                                    cancelarEdicion={cancelarEdicion}
                                    titulo={titulo}
                                    showAppBar={true}
                                    settingDataField={dataMenu.datos}
                                    accessButton={accessButton}
                                    dataCheck={dataCheck}
                                    setDatacheck={setDatacheck}
                                    modulosSeleccionados={modulosSeleccionados}
                                    setModulosSeleccionados={setModulosSeleccionados}
                                  />
                                )}

                                {isNotEmpty(showForm) && (
                                  <>
                                    <div className="col-12 d-inline-block">
                                      <div className="float-right">
                                        <ControlSwitch checked={auditoriaSwitch}
                                          onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                                        /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
                                      </div>
                                    </div>
                                    {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
                                  </>
                                )}

                              </>
                            </Paper>
                          </Grid>

                        </Grid>
                      </Paper>

                    </div>

                  </>
                </TabPanel>

              </div>
            </>
          </Portlet>
        </div>

        <Confirm
          message={intl.formatMessage({ id: "ALERT.REMOVE" })}
          isVisible={isVisible}
          setIsVisible={setIsVisible}
          setInstance={setInstance}
          onConfirm={() => eliminarListRowTab(selectedNode, true)}
          title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
          confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
          cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
        />

        <Confirm
          message={messagePopup}
          isVisible={isVisibleSecondary}
          setIsVisible={setIsVisibleSecondary}
          setInstance={setInstanceSecondary}
          onConfirm={() => loadMessagePopUp({}, true, false, -1)}
          onHide={() => loadMessagePopUp({}, false, true, -2,)}
          title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
          confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
          cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
        />

      </div>
    </>
  );
};
//->Configuracion tabs.

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

export default injectIntl(WithLoandingPanel(DivisionIndexPage));
