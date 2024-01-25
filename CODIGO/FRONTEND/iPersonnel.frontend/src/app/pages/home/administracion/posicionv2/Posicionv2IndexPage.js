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
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";

import ContactsIcon from '@material-ui/icons/Contacts';
import PeopleIcon from '@material-ui/icons/People';

import MenuTreeViewPage from "../../../../partials/content/TreeView/MenuTreeViewPage";
import Confirm from "../../../../partials/components/Confirm";

import { eliminar, obtener, listarTreeview as listarTreeviewPosicion, crear, actualizar } from "../../../../api/administracion/posicion.api";
import PosicionEditPage from "./PosicionEditPage";
import PosicionListPage from "./PosicionListPage";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import PersonaPosicionListPage from "../persona/posicion/PersonaPosicionListOtroPage";
import { servicioPersonaPosicion  } from "../../../../api/administracion/personaPosicion.api";


const Posicionv2IndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [varIdPosicion, setIdPosicion] = useState("");
  const [selected, setSelected] = useState({});

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(true);
  const [titulo, setTitulo] = useState("");
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);

  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);

  const [dataFilter, setDataFilter] = useState({ IdModulo: "01" });
  const [isSubMenu, setIsSubMenu] = useState(false);
  const [idModulo, setIdModulo] = useState("");
  const [idMenu, setIdMenu] = useState("");
  const [selectedNode, setSelectedNode] = useState();

  const [modoEdicionTabs, setModoEdicionTabs] = useState(false);
  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [listarTabs, setListarTabs] = useState([]);
  const [focusedRowKey, setFocusedRowKey] = useState(0);

  const [modoEdicionMenu, setModoEdicionMenu] = useState(false);



  const [menus, setMenus] = useState([{
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
  /*   const options = [{ id: 1, name: 'Menú', icon: 'activefolder' },
    { id: 2, name: 'Sub-menú', icon: 'inactivefolder' }]; */

  const [actionButton, setActionButton] = useState({
    new: false,
    edit: false,
    save: false,
    delete: false,
    cancel: false
  });

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  // console.log("CustomerDataGrid => ds", ds);
  const [dataSource] = useState(ds);
  const [isVisible, setIsVisible] = useState(false);
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
      , Contratista
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
      Contratista: Contratista ? "S" : "N",
      IdPosicionPadre: isNotEmpty(IdPosicionPadre) ? IdPosicionPadre : "",
      Activo,
      IdUsuario: usuario.username,
    };
    await crear(params)
      .then(response => {
        if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        listarPosiciones();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function actualizarPosicion(posicion) {
    //setLoading(true);
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
      , Contratista
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
      Contratista: Contratista ? "S" : "N",
      IdPosicionPadre: isNotEmpty(IdPosicionPadre) ? IdPosicionPadre : "",
      Activo,
      IdUsuario: usuario.username,
    };
    await actualizar(params)
      .then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        listarPosiciones();
        setActionButton({ new: false, edit: false, save: false, cancel: true });
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => {// setLoading(false); 
      });
  }

  async function eliminarRegistro() {
    setLoading(true);
    const { IdPosicion, IdCliente } = selectedNode;
    //let data = { IdPosicion, IdCliente };
    await eliminar
      ({
        IdPosicion: IdPosicion,
        IdCliente: IdCliente,
        IdUsuario: usuario.username
      })
      .then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    listarPosiciones();

  }


  async function obtenerPosicion(filtro) {

    const { IdPosicion, IdCliente, UnidadOrganizativa } = filtro;
    //debugger;
    if (IdPosicion) {
      setLoading(true);
      let posicionesObj = await obtener({ IdCliente, IdPosicion, UnidadOrganizativa }).catch(err => {
        //handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
      setDataRowEditNew({ ...posicionesObj, esNuevoRegistro: false, UnidadOrganizativa });
      setLoading(false);
    }
    else {
      //handleInfoMessages(intl.formatMessage({ id: "SYSTEM.MENU.MESSAGE.SELECTIONMENU" }));
      setLoading(true);
      let posicionesObjx = await obtener({ IdCliente, IdPosicion: '', UnidadOrganizativa: '' }).catch(err => {
        //handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
      setDataRowEditNew({ ...posicionesObjx, esNuevoRegistro: false });
      setLoading(false);
    }
  }


  const nuevoRegistro = () => {
    const { IdPosicion, IdCliente, Menu } = selectedNode;
    //console.log("nuevoselectedNode",selectedNode);
    let posicion = {};
    if (isNotEmpty(IdPosicion)) {
      //POSICIÓN padre
      posicion = { IdPosicion: "", IdPosicionPadre: IdPosicion, IdCliente, Activo: "S", Fiscalizable: "S", PosicionPadre: Menu };
    } else {
      //POSICIÓN hijo
      posicion = { IdPosicion: "", IdPosicionPadre: "", IdCliente, Activo: "S", Fiscalizable: "S" };
    }
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setActionButton({
      new: false,
      edit: false,
      save: true,
      cancel: true
    });
    setDataRowEditNew({ ...posicion, esNuevoRegistro: true });
  };


  const editarRegistro = () => {
    setModoEdicion(true);
    setActionButton({
      new: false,
      edit: false,
      save: true,
      cancel: true
    });
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
  };

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "SYSTEM.MENU.VIEW" }));
    setIdPosicion("");
    setListarTabs([]);
    setActionButton({ new: true, edit: false, save: false, cancel: false });
    setIsSubMenu(false);
    setDataFilter({ IdModulo: idModulo });
  };


  const seleccionarNodo = (dataRow) => {
    
    const { IdCliente, IdMenu, IdPosicion } = dataRow;
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    if (IdMenu != idMenu) {
      obtenerPosicion(dataRow);
      setIdPosicion(IdPosicion);
      setSelectedNode(dataRow);
      setActionButton({
        new: isNotEmpty(IdCliente) ? true : false,
        delete: isNotEmpty(IdPosicion) ? true : false,
        edit: isNotEmpty(IdPosicion) ? true : false
      });
    }
  }


  async function listarPosiciones(IdDivision, IdUnidadOrganizativa, NombrePosicion) {
    setLoading(true);
    //const { IdDivision, IdUnidadOrganizativa } = dataRow;
    let d = dataRowEditNew;
    //debugger;
    let posiciones = await listarTreeviewPosicion({
      IdCliente: perfil.IdCliente
      , ShowIconAction: 1
      , IdDivision
      , IdUnidadOrganizativa
      , NombrePosicion
      , Activo: "%"
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });
    if (posiciones.length === 0) {

      setMenus([])
    } else {


      setMenus(posiciones);

    setLoading(false);
    }
    //cancelarEdicion();
    setModoEdicion(false);
  }


  //***************************************************************/


  async function listarPersonaPosicion() {
    setLoading(true);
    const { IdCliente, IdPosicion } = selectedNode;
    setModoEdicionTabs(false);
    await servicioPersonaPosicion.listar({
      IdCliente,
      IdCompania: '%',
      IdPersona: 0,
      IdUnidadOrganizativa: '%',
      IdPosicion,
      NumPagina: 0,
      TamPagina: 0
    }).then(personaPosicions => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(personaPosicions);
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }



  useEffect(() => {
    //listarPosiciones();
    loadControlsPermission();
  }, []);


  const changeTabIndex = (index) => {
    handleChange(null, index);
  }


  const tabsDisabled = () => {
    return isNotEmpty(varIdPosicion) ? false : true;
    //return true;
  }

  const seleccionarRegistroPosicion = dataRow => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };

  const getInfo = () => {
    const { IdPosicion, Menu } = selectedNode;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdPosicion, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ADMINISTRATION.POSITION" })], value: Menu, colSpan: 4 }
    ];
  }


  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "ADMINISTRATION.ORGANIZATIONALUNIT.COSTCENTER.TAB",
      "ADMINISTRATION.ORGANIZATIONALUNIT.POSITIONS.TAB",
      "ADMINISTRATION.ORGANIZATIONALUNIT.PERSONS.TAB"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + "  " + sufix;
  }
  /*  const tabsDisabled = () => {
     return isNotEmpty(varIdPosicion) ? false : true;
     //return true;
   } */

  const tabContent_MenuTreeViewPage = () => {
    return <div className={classes.gridRoot}>

      <PortletHeader
        title={""}
        toolbar={
          <PortletHeaderToolbar>

            <Button
              icon="refresh" //fa fa-broom
              type="default"
              hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
              onClick={() => { document.getElementById("idLimpiar").click() }}
            />
              &nbsp;
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
              hint="Editar"
              onClick={editarRegistro}
              disabled={!actionButton.edit}
            />
                    &nbsp;
                <Button
              icon="fa fa-save"
              type="default"
              hint="Grabar"
              onClick={() => { document.getElementById("idGrabarUO").click() }}
              disabled={!actionButton.save}
            />
                    &nbsp;
                <Button
              icon="fa fa-trash"
              type="default"
              hint="Eliminar"
              onClick={eliminarRegistro}
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
        <PosicionListPage
          dataRowEditNew={dataRowEditNew}
          //modoEdicionMenu={modoEdicionMenu}
          accessButton={accessButton} 
          settingDataField={dataMenu.datos}
          buscarTreeView={listarPosiciones}
        />

        <Grid container spacing={1} direction="row" justify="flex-start" alignItems="stretch" >
          <Grid item xs={6} style={{ borderRight: "1px solid #ebedf2" }} >
            {/*******************MenuTreeViewPage*************************************/}
            <MenuTreeViewPage
              menus={menus}
              modoEdicion={modoEdicion}
              dataFilter={dataFilter}
              setDataFilter={setDataFilter}
              isSubMenu={isSubMenu}
              setIsSubMenu={setIsSubMenu}
              seleccionarNodo={seleccionarNodo}
              showModulo={false}
              showButton={false}
              searchEnabled={false}
            />
          </Grid>
          <Grid item xs={6} style={{ borderRight: "1px solid #ebedf2" }} >
            <Paper className={classes.paper}>
              <>
                <PosicionEditPage
                  modoEdicion={modoEdicion}
                  dataRowEditNew={dataRowEditNew}
                  actualizar={actualizarPosicion}
                  agregar={agregarPosicion}
                  cancelarEdicion={cancelarEdicion}
                  titulo={titulo}
                />
                <div className="col-12 d-inline-block">
                  <div className="float-right">
                    <ControlSwitch
                      checked={auditoriaSwitch}
                      onChange={e => {
                        setAuditoriaSwitch(e.target.checked);
                      }}
                    />
                    <b> {intl.formatMessage({ id: "AUDIT.DATA" })} </b>
                  </div>
                </div>
                {auditoriaSwitch && <AuditoriaPage dataRowEditNew={dataRowEditNew} />}
              </>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

    </div>

  }

  const tabContent_PersonaPosicionListPage = () => {
    return <>
      {modoEdicionTabs && (
        <>

        </>
      )}
      {!modoEdicionTabs && (
        <>
          <PersonaPosicionListPage
            personaPosicions={listarTabs}
            focusedRowKey={focusedRowKey}
            seleccionarRegistro={seleccionarRegistroPosicion}
            cancelarEdicion={cancelarEdicion}
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
        subtitle={intl.formatMessage({ id: "ADMINISTRATION.POSITION.MAINTENANCE" })}
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
            disabled: !tabsDisabled() && accessButton.Tabs[1] ? false : true
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



export default injectIntl(WithLoandingPanel(Posicionv2IndexPage));
