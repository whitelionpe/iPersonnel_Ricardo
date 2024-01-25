import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";

import { isNotEmpty } from "../../../../../_metronic";
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { Button } from "devextreme-react";
import { PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";

import { useSelector } from "react-redux";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";

import ContactsIcon from '@material-ui/icons/Contacts';
import PeopleIcon from '@material-ui/icons/People';
import MenuTreeViewPage from "../../../../partials/content/TreeView/MenuTreeViewPage";
import Confirm from "../../../../partials/components/Confirm";

import { listarTreeview } from "../../../../api/administracion/unidadOrganizativa.api";

import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

import { eliminar, obtener, listarTreeview as listarTreeviewPosicion, crear, actualizar } from "../../../../api/administracion/posicion.api";
import PopupPosicionEditPage from "./PosicionEditPage";
import PersonaPosicionListPage from "../persona/posicion/PersonaPosicionListOtroPage";
import { servicioPersonaPosicion } from "../../../../api/administracion/personaPosicion.api";

const Posicionv3IndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdDivision, Division } = useSelector(state => state.perfil.perfilActual);
  

  const [varIdUnidadOrganizativa, setVarIdUnidadOrganizativa] = useState("");

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  //const [modoEdicionUO, setModoEdicionUO] = useState(true);
  const [titulo, setTitulo] = useState("");
  const [showPositionTree, setShowPositionTree] = useState(false);

  //const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);

  const [dataFilterUO, setDataFilterUO] = useState({});
  //const [isSubMenuUO, setIsSubMenuUO] = useState(false);
  const [varIdMenu, setVarIdMenu] = useState("");
  //const [selectedNodeUO, setSelectedNodeUO] = useState();

  const [modoEdicion, setModoEdicion] = useState(true);
  const [dataFilter, setDataFilter] = useState({});
  //const [isSubMenu, setIsSubMenu] = useState(false);
  const [selectedNodePosicion, setSelectedNodePosicion] = useState({});
  const [selectedNodeUnidadOrg, setSelectedNodeUnidadOrg] = useState({});

  const [varIdPosicion, setVarIdPosicion] = useState("");
  const [isVisiblePopUpPosicion, setisVisiblePopUpPosicion] = useState(false);
  const [isVisibleConfirm, setIsVisibleConfirm] = useState(false);

  const [modoEdicionTabs, setModoEdicionTabs] = useState(false);
  // const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [listarTabs, setListarTabs] = useState([]);
  const [focusedRowKey, setFocusedRowKey] = useState(0);

  const [menusUO, setMenusUO] = useState([{
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


  const [menus, setMenus] = useState([{
    Icon: "flaticon2-expand"
    , IdMenu: null
    , IdMenuPadre: null
    , Menu: intl.formatMessage({ id: "SYSTEM.MENU.OPTIONS" })
    , MenuPadre: null
    , Nivel: 0
    , Orden: 0
    , expanded: true
  }]);

  const [actionButton, setActionButton] = useState({
    new: false,
    edit: false,
    delete: false,
    view: false
  });

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };


  //const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  // const [dataSource] = useState(ds);
  const [instance, setInstance] = useState({});

  /**Configuración Botones**************************************** */
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 2; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }


  //::::::::::::::::::::::::::::FUNCIONES PARA UNIDAD ORGANIZATIVA-:::::::::::::::::::::::::::::::::::

  async function getUnidadOrganizativaTreeView() {
    setLoading(true);
    let unidadOrganizativas =
      await listarTreeview({
        IdCliente: IdCliente
        , ShowIconAction: 1
        , Activo: "%"
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
    if (!isNotEmpty(unidadOrganizativas)) {

      setMenusUO([{
        Activo: "S"
        , icon: "flaticon2-expand"
        , IdMenu: null
        , IdMenuPadre: null
        , Menu: "-SIN DATOS-"
        , MenuPadre: null
        , expanded: true
      }])
    } else {
      setMenusUO(unidadOrganizativas);
      setLoading(false);
    }
    //setModoEdicionUO(false);

  }

  async function getPosicionTreeView(idUnidadOrganizativa) {
    // console.log('posiciontreeview')
    setLoading(true);
    let posiciones = await listarTreeviewPosicion({
      IdCliente
      , ShowIconAction: 1
      , IdDivision
      , IdUnidadOrganizativa: idUnidadOrganizativa
      , Activo: "%"
      , NombrePosicion: '%'
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });
    if (posiciones.length === 0) {
      setMenus([])
    } else {
      setMenus(posiciones);
      setLoading(false);
    }

  }

  const seleccionarNodoUnidadOrg = async (dataRow) => {
    const { IdMenu, IdUnidadOrganizativa } = dataRow;
    if (IdUnidadOrganizativa != varIdUnidadOrganizativa) {
      setShowPositionTree(true);
      setVarIdUnidadOrganizativa(IdUnidadOrganizativa);
      setSelectedNodeUnidadOrg(dataRow);
      await getPosicionTreeView(IdUnidadOrganizativa);

    }
  }

  /*+++++++++++++++++++++++++++++++++++-Posición-+++++++++++++++++++++++++++++++++++++++++++*/

  async function agregarPosicion(data) {
    setLoading(true);
    const {
      IdCliente
      , IdPosicion
      , Posicion
      , IdTipoPosicion
      , IdDivision
      , IdUnidadOrganizativa
      , IdFuncion
      , IdPosicionPadre
      , Confianza
      , Fiscalizable
      , JefeUnidadOrganizativa
      , Activo
    } = data;

    let params = {
      IdCliente,
      IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa.toUpperCase() : "",
      IdTipoPosicion: isNotEmpty(IdTipoPosicion) ? IdTipoPosicion.toUpperCase() : "",
      IdDivision: isNotEmpty(IdDivision) ? IdDivision : "",
      IdFuncion: isNotEmpty(IdFuncion) ? IdFuncion.toUpperCase() : "",
      IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion.toUpperCase() : "",
      Posicion: isNotEmpty(Posicion) ? Posicion.toUpperCase() : "",
      Confianza: Confianza ? "S" : "N",
      Fiscalizable: Fiscalizable ? "S" : "N",
      Contratista: "N",
      IdPosicionPadre: isNotEmpty(IdPosicionPadre) ? IdPosicionPadre : "",
      JefeUnidadOrganizativa,
      Activo,
      IdUsuario: usuario.username,
    };

    await crear(params).then(response => {
      if (response) {
        //if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        setisVisiblePopUpPosicion(false);
        getPosicionTreeView(varIdUnidadOrganizativa);
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      }
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  async function actualizarPosicion(posicion) {
    setLoading(true);
    const {
      IdCliente
      , IdPosicion
      , Posicion
      , IdTipoPosicion
      , IdDivision
      , IdUnidadOrganizativa
      , IdFuncion
      , IdPosicionPadre
      , Confianza
      , Fiscalizable
      , JefeUnidadOrganizativa
      , Activo
    } = posicion;
    let params = {
      IdCliente,
      IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa.toUpperCase() : "",
      IdTipoPosicion: isNotEmpty(IdTipoPosicion) ? IdTipoPosicion.toUpperCase() : "",
      IdDivision: isNotEmpty(IdDivision) ? IdDivision : "",
      IdFuncion: isNotEmpty(IdFuncion) ? IdFuncion.toUpperCase() : "",
      IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion.toUpperCase() : "",
      Posicion: isNotEmpty(Posicion) ? Posicion.toUpperCase() : "",
      Confianza: Confianza ? "S" : "N",
      Fiscalizable: Fiscalizable ? "S" : "N",
      Contratista: "N",
      IdPosicionPadre: isNotEmpty(IdPosicionPadre) ? IdPosicionPadre : "",
      JefeUnidadOrganizativa,
      Activo,
      IdUsuario: usuario.username,
    };
    await actualizar(params).then(response => {
      //if (response) {
      //getPosicionTreeView();
      setisVisiblePopUpPosicion(false);
      getPosicionTreeView(varIdUnidadOrganizativa)
      //setActionButton({ new: false, edit: false });//save: false,cancel: true
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      //}
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => {
      setLoading(false);
    });
    //handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));

  }

  async function obtenerPosicion(filtro) {
    console.log('filtro', filtro);
    const { IdPosicion } = selectedNodePosicion;
    //debugger;
    if (IdPosicion) {
      setLoading(true);
      await obtener({ IdCliente, IdPosicion }).then(response => {
        const { Contratista, Fiscalizable, Confianza } = response;
        response.Contratista = Contratista === "S" ? true : false;
        response.Fiscalizable = Fiscalizable === "S" ? true : false;
        response.Confianza = Confianza === "S" ? true : false;
        setDataRowEditNew({ ...response, esNuevoRegistro: false });
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => {
        setLoading(false);
      });
    }
    // else {
    //   //handleInfoMessages(intl.formatMessage({ id: "SYSTEM.MENU.MESSAGE.SELECTIONMENU" }));
    //   setLoading(true);
    //   let posicionesObjx = await obtener({ IdCliente, IdPosicion: '', IdUnidadOrganizativa, UnidadOrganizativa }).catch(err => {
    //     //handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    //   });
    //   setDataRowEditNew({ ...posicionesObjx, esNuevoRegistro: false });
    //   setLoading(false);
    // }
  }

  const seleccionarNodoPosicion = (dataRow) => {
    const { IdMenu, IdPosicion } = dataRow;
      setVarIdMenu(IdMenu);
      setVarIdPosicion(IdPosicion);
      setSelectedNodePosicion(dataRow);
      //activar/desactivar botones de acción de acuerdo treeview seleccionado..
      setActionButton({
        new: isNotEmpty(IdMenu) ? true : false,
        delete: isNotEmpty(IdPosicion) ? true : false,
        edit: isNotEmpty(IdPosicion) ? true : false,
        view: isNotEmpty(IdPosicion) ? true : false
      });
      //listarPersonaPosicion();
  }

  const editarRegistro = () => {
    setisVisiblePopUpPosicion(true);
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ADMINISTRATION.POSITION" }) + " " + intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerPosicion(selectedNodePosicion);
  };

  const nuevoRegistro = () => {
    setisVisiblePopUpPosicion(true);
    const { IdUnidadOrganizativa, UnidadOrganizativa } = selectedNodeUnidadOrg;
    const { IdMenu, IdMenuPadre, Menu, IdPosicion } = selectedNodePosicion;
    //console.log("nuevoselectedNode",selectedNode);
    let posicion = {};
    if (isNotEmpty(IdPosicion)) {
      //POSICIÓN padre........
      posicion = {
        IdPosicion: "", IdPosicionPadre: IdPosicion, IdCliente, IdUnidadOrganizativa, UnidadOrganizativa, JefeUnidadOrganizativa:"N", Activo: "S", 
        PosicionPadre: Menu,
        IdDivision, Division,
        Fiscalizable: true,
        Contratista: false,
        Confianza: false
      };
    } else {
      //POSICIÓN hijo........
      posicion = {
        IdPosicion: "", IdPosicionPadre: "", IdCliente, IdUnidadOrganizativa, UnidadOrganizativa, JefeUnidadOrganizativa:"N", Activo: "S",
        IdDivision, Division,
        Fiscalizable: true,
        Contratista: false,
        Confianza: false
      };
    }
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ADMINISTRATION.POSITION" }) + " " + intl.formatMessage({ id: "ACTION.NEW" }));
    setDataRowEditNew({ ...posicion, esNuevoRegistro: true });
    //Desactivar botones de accion nuevo y editar
    setActionButton({
      new: false,
      edit: false
    });
  };

  async function eliminarRegistro(dataRow, confirm) {

    setIsVisibleConfirm(true);
    if (confirm) {
      setLoading(true);
      const { IdPosicion } = dataRow
      await eliminar({
        IdPosicion,
        IdCliente,
        IdUsuario: usuario.username
      }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        getPosicionTreeView(varIdUnidadOrganizativa);
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });

    }
  }

  const cancelarEdicion = () => {
    //console.log("cancelarEdicion...");
    setisVisiblePopUpPosicion(false);
    setVarIdUnidadOrganizativa(varIdUnidadOrganizativa);
    setModoEdicion(false);
    //Activar botones de accion nuevo y editar

    setActionButton({
      new: isNotEmpty(varIdMenu) ? true : false,
      edit: isNotEmpty(varIdPosicion) ? true : false
    });

  }

  const getInfo = () => {
    const { IdPosicion, Menu } = selectedNodePosicion;
    const { UnidadOrganizativa } = selectedNodeUnidadOrg;
    return [
      { text: [intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.COSTCENTER.UO.TAB" })], value: UnidadOrganizativa, colSpan: 3 },
      { text: [intl.formatMessage({ id: "ADMINISTRATION.POSITION" })], value: Menu, colSpan: 3 }
    ];
  }



  async function listarPersonaPosicion() {
    setLoading(true);
    setTabIndex(1);
    const { IdPosicion } = selectedNodePosicion;
    const { IdUnidadOrganizativa } = selectedNodeUnidadOrg;
    setModoEdicionTabs(false);
    await servicioPersonaPosicion.listar({
      IdCliente: IdCliente,
      IdCompania: '%',
      IdPersona: 0,
      IdUnidadOrganizativa,
      IdPosicion,
      NumPagina: 0,
      TamPagina: 0
    }).then(personaPosicions => {
      //setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(personaPosicions);
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  const seleccionarRegistroPosicion = dataRow => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };

  const tabsDisabled = () => {
    //console.log("tabsDisabled|",isNotEmpty(varIdUnidadOrganizativa) ? false : true);
    return isNotEmpty(varIdUnidadOrganizativa) ? false : true;
  }

  const cancelarPersonaPosicion = () => {
    setTabIndex(0);
  }

  useEffect(() => {
    loadControlsPermission();
    getUnidadOrganizativaTreeView();
  }, []);


  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::

  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "ADMINISTRATION.POSITION.WORKER"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";
    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + "  " + sufix;

  }


  const tabContent_MenuTreeViewPage = () => {
    return <div className={classes.gridRoot}>

      <PortletHeader
        title={""}
        toolbar={
          <PortletHeaderToolbar>
            <Button
              icon="fa fa-plus"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.NEW" })}
              onClick={nuevoRegistro}
              disabled={!actionButton.new}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
            />
            &nbsp;
            <Button
              icon="fa fa-edit"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.EDIT" })}
              onClick={editarRegistro}
              disabled={!actionButton.edit}
            />
            &nbsp;
            <Button
              icon="fa fa-trash"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.REMOVE" })}
              onClick={eliminarRegistro}
              disabled={!actionButton.delete}
            />
            &nbsp;
            &nbsp;
            &nbsp;
            &nbsp;
            <Button
              icon="fa fa-users"
              type="default"
              hint={intl.formatMessage({ id: "ADMINISTRATION.POSITION.VIEW.WORKERS" })}
              onClick={listarPersonaPosicion}
              disabled={!actionButton.view}
            />
          </PortletHeaderToolbar>
        }>

      </PortletHeader>

      <Paper className={classes.paper}>
        <Grid container spacing={1} direction="row" justify="flex-start" alignItems="stretch" >
          <Grid item xs={6} style={{ borderRight: "1px solid #ebedf2" }} >
            {/*******************TV Unidad Organizativa*************************************/}
            <div className="col-12 d-inline-block">
              <div className="float-left">
                <b> {intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.MAINTENANCE" }).toUpperCase()} </b>
              </div>
            </div>

            <MenuTreeViewPage
              menus={menusUO}
              modoEdicion={false}
              dataFilter={dataFilterUO}
              setDataFilter={setDataFilterUO}
              //isSubMenu={isSubMenuUO}
              //setIsSubMenu={setIsSubMenuUO}
              seleccionarNodo={seleccionarNodoUnidadOrg}
              //showModulo={false}
              showButton={false}
            />
          </Grid>
          <Grid item xs={6} style={{ borderRight: "1px solid #ebedf2" }} >
            <Paper className={classes.paper}>

              {/**************************---Posiciones--******************************/}

              <div className="col-12 d-inline-block">
                <div className="float-left">
                  <b> {intl.formatMessage({ id: "CONFIG.MENU.ADMINISTRACION.POSICIONES" }).toUpperCase()} </b>
                </div>
              </div>

              {showPositionTree && (
                <MenuTreeViewPage
                  menus={menus}
                  modoEdicion={false}
                  dataFilter={dataFilter}
                  setDataFilter={setDataFilter}
                  //isSubMenu={isSubMenu}
                  //setIsSubMenu={setIsSubMenu}
                  seleccionarNodo={seleccionarNodoPosicion}
                  //showModulo={false}
                  showButton={false}
                  searchEnabled={false}
                  editarRegistro={editarRegistro}
                />
              )}

              <div className="col-12 d-inline-block">
                <div className="float-left">
                  <h6>{intl.formatMessage({ id: "ADMINISTRATION.POSITION.MAINTENANCE" }).toUpperCase()}: {menus.filter(x => x.Nivel > 0).length}</h6>
                </div>
              </div>

              {/* <h6>Posiciones:{menus.filter(x => x.Nivel > 0).length}</h6> */}


              <PopupPosicionEditPage
                showPopup={{ isVisiblePopUp: isVisiblePopUpPosicion, setisVisiblePopUp: setisVisiblePopUpPosicion }}
                modoEdicion={modoEdicion}
                cancelar={() => { cancelarEdicion(); setisVisiblePopUpPosicion(false); }}
                actualizar={actualizarPosicion}
                agregar={agregarPosicion}
                showButton={true}
                dataRowEditNew={dataRowEditNew}
                titulo={titulo}
                setDataRowEditNew={setDataRowEditNew}
                cancelarEdicion={cancelarEdicion}
              />

            </Paper>

          </Grid>

        </Grid>
      </Paper>
    </div>
  }


  const tabContent_PersonaPosicionListPage = () => {
    return <>
      {!modoEdicionTabs && (
        <>
          <PersonaPosicionListPage
            personaPosicions={listarTabs}
            focusedRowKey={focusedRowKey}
            seleccionarRegistro={seleccionarRegistroPosicion}
            cancelarEdicion={cancelarPersonaPosicion}
            getInfo={getInfo}
          />
        </>
      )}
    </>
  }


  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.MENU" })}
        submenu={intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.SUBMENU" })}
        subtitle={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.POSITION.MAINTENANCE" }),
            icon: <ContactsIcon fontSize="large" />
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.POSITION.WORKER" }),
            icon: <PeopleIcon fontSize="large" />,
            onClick: () => { listarPersonaPosicion() },
            disabled: tabsDisabled()
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_MenuTreeViewPage(),
            tabContent_PersonaPosicionListPage()
          ]
        }
      />

      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisibleConfirm}
        setIsVisible={setIsVisibleConfirm}
        setInstance={setInstance}
        onConfirm={() => eliminarRegistro(selectedNodePosicion, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />

    </>
  );
};

export default injectIntl(WithLoandingPanel(Posicionv3IndexPage));
