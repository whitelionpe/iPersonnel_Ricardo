import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";

import { isNotEmpty } from "../../../../../_metronic";
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

import { Button, TabPanel } from "devextreme-react";
import { PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";

import { useSelector } from "react-redux";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";

import AccountTreeIcon from '@material-ui/icons/AccountTree';
import DragDropTreeViewPage from "../../../../partials/content/TreeView/DragDropTreeViewPage";

import {
  listarTreeview, obtener, listarUsuarios, listar, actualizarPerfilPadre,
  listarUnidadesOrganizativas, listarDivisiones
} from "../../../../api/asistencia/perfil.api";

//-customerDataGrid Star
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import AprobadorHHEEEditPage from "./AprobadorHHEEEditPage";


const AprobadorHHEEIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);


  const [varIdUnidadOrganizativa, setVarIdUnidadOrganizativa] = useState("");
  const [varIdPerfil, setVarIdPerfil] = useState("");
  const [focusedRowKey, setFocusedRowKey] = useState(0);
  const [selected, setSelected] = useState({});
  const [Filtros, setFiltros] = useState({ FlRepositorio: "1", IdUnidadOrganizativa: varIdUnidadOrganizativa });


  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(true);
  const [titulo, setTitulo] = useState("");

  const [listarTabs, setListarTabs] = useState([]);

  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);

  const [dataFilter, setDataFilter] = useState({ IdModulo: "05" }); //modulo asistencia
  const [isSubMenu, setIsSubMenu] = useState(false);
  const [idModulo, setIdModulo] = useState("");
  const [idMenu, setIdMenu] = useState("");
  const [selectedNode, setSelectedNode] = useState();
  const [listaPerfilCombo, setListaPerfilCombo] = useState([]);
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

  const [listadoUsuarios, setListadoUsuarios] = useState([]);
  const [listadoUnidadOrganizativa, setListadoUnidadOrganizativa] = useState([]);
  const [listadoDivision, setListadoDivision] = useState([]);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  /**Configuración Botones**************************************** */
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 4; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  
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

  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      // "ADMINISTRATION.ORGANIZATIONALUNIT.COSTCENTER.TAB",
      // "ADMINISTRATION.ORGANIZATIONALUNIT.POSITIONS.TAB",
      // "ADMINISTRATION.ORGANIZATIONALUNIT.PERSONS.TAB"
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
            {/* <Button
              icon="fa fa-plus"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.NEW" })}
              // onClick={nuevoRegistro}
              disabled={!actionButton.new}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
            /> */}
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
            {/* <Button
              icon="fa fa-trash"
              type="default"
              hint="Eliminar"
              // onClick={eliminarRegistro}
              disabled={!actionButton.delete}
            /> */}
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


      {/* justify="flex-start" */}
      <Paper className={classes.paper}>
        <Grid container spacing={1} direction="row" alignItems="stretch" >
          <Grid item xs={6} style={{ borderRight: "1px solid #ebedf2" }} >
            {/*******************MenuTreeViewPage*************************************/}
            <DragDropTreeViewPage
              menus={menus}
              modoEdicion={modoEdicion}
              dataFilter={dataFilter}
              setDataFilter={setDataFilter}
              isSubMenu={isSubMenu}
              setIsSubMenu={setIsSubMenu}
              seleccionarNodo={seleccionarNodo}
              showModulo={false}
              showButton={false}
            />
          </Grid>
          <Grid item xs={6} style={{ borderRight: "1px solid #ebedf2" }} >
            <Paper className={classes.paper}>
              <>
                {/**************************Perfil******************************/}

                <AprobadorHHEEEditPage
                  modoEdicion={modoEdicion}
                  dataRowEditNew={dataRowEditNew}
                  listaPerfilCombo={listaPerfilCombo}
                  cancelarEdicion={cancelarEdicion}
                  actualizar={actualizar}
                  titulo={titulo}
                  perfilesUsuarios={listadoUsuarios}
                  unidadOrganizativa={listadoUnidadOrganizativa}
                  division={listadoDivision} 
                />
                {/* <AprobadorHHEEListPage
                    />  */}
              </>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

    </div>

  }

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  //::::::::::::::::::::::::::::FUNCIONES PARA LOS PERFILES-:::::::::::::::::::::::::::::::::::

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "SYSTEM.MENU.VIEW" }));
    setVarIdPerfil("");
    setListarTabs([]);
    setActionButton({ new: true, edit: true, save: false, cancel: false });
    setIsSubMenu(false);
    setDataFilter({ IdModulo: idModulo });
  };

  const seleccionarNodo = (dataRow) => {
    // console.log("dataRow : " , dataRow);
    const { IdMenu, IdPerfil } = dataRow;
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    if (IdMenu != idMenu) {
      obtenerPerfil(dataRow);
      listarUsuariosxPerfil(dataRow);
      listarUnidadesOrganizativasxPerfil(dataRow);
      listarDivisionesxPerfil(dataRow);
      listarPerfilesCombo(dataRow);
      setVarIdPerfil(IdPerfil);
      setSelectedNode(dataRow);
      setActionButton({
        new: isNotEmpty(IdPerfil) ? true : false,
        delete: isNotEmpty(IdPerfil) ? true : false,
        edit: isNotEmpty(IdPerfil) ? true : false
      });
    }
  }

  useEffect(() => {
    listarPerfilesAprobadores();
    //listar_CentroCostos();
    // loadControlsPermission();
  }, []);

  async function obtenerPerfil(filtro) {
    const { IdPerfil, CantidadHijos } = filtro;
    if (IdPerfil) {
      setLoading(true);
      let perfilSel = await obtener({
        IdCliente: perfil.IdCliente,
        IdPerfil,
        //Activo: "%"
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
      setDataRowEditNew({ ...perfilSel, esNuevoRegistro: false, CantidadHijos });
      setLoading(false);
    }
    else {
      handleInfoMessages(intl.formatMessage({ id: "SYSTEM.MENU.MESSAGE.SELECTIONMENU" }));
    }
  }

  async function listarUnidadesOrganizativasxPerfil(filtro) {
    const { IdPerfil } = filtro;
    if (IdPerfil) {
      setLoading(true);
      let uoPerfil = await listarUnidadesOrganizativas({
        IdCliente: perfil.IdCliente,
        IdDivision: perfil.IdDivision, //"%"
        IdPerfil,
        Activo: "%",
        NumPagina: 0, TamPagina: 0
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
      setListadoUnidadOrganizativa(uoPerfil);
      setLoading(false);
    }
    else {
      handleInfoMessages(intl.formatMessage({ id: "SYSTEM.MENU.MESSAGE.SELECTIONMENU" }));
    }
  }


  async function listarDivisionesxPerfil(filtro) {
    const { IdPerfil } = filtro;
    if (IdPerfil) {
      setLoading(true);
      let division = await listarDivisiones({
        IdCliente: perfil.IdCliente,
        ///IdDivision: perfil.IdDivision, //"%"
        IdPerfil,
        Activo: "%",
        NumPagina: 0, TamPagina: 0
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
      setListadoDivision(division);
      setLoading(false);
    }
    else {
      handleInfoMessages(intl.formatMessage({ id: "SYSTEM.MENU.MESSAGE.SELECTIONMENU" }));
    }
  }



  async function listarUsuariosxPerfil(filtro) {
    const { IdPerfil } = filtro;
    if (IdPerfil) {
      setLoading(true);
      let perfilUsu = await listarUsuarios({
        IdCliente: perfil.IdCliente,
        IdDivision: perfil.IdDivision,
        IdPerfil,
        NumPagina: 0, TamPagina: 0
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
      setListadoUsuarios(perfilUsu);
      setLoading(false);
    }
    else {
      handleInfoMessages(intl.formatMessage({ id: "SYSTEM.MENU.MESSAGE.SELECTIONMENU" }));
    }
  }

  async function listarPerfilesAprobadores() {
    setLoading(true);

    let perfilesAprobadores =
      await listarTreeview({
        IdCliente: perfil.IdCliente
        , Activo: "%"
        , IdPerfil: "%"
        , IdDivision: perfil.IdDivision //"%" // 
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });

    if (!isNotEmpty(perfilesAprobadores)) {

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
      // console.log("perfilesAprobadores : ", perfilesAprobadores);
      setMenus(perfilesAprobadores);
      setLoading(false);
    }
    setModoEdicion(false);

  }

  async function listarPerfilesCombo(dataRow) {
    setLoading(true);
    const { IdPerfil } = dataRow;

    let perfilesCombo =
      await listar({
        IdCliente: perfil.IdCliente
        , Activo: "%"
        , IdPerfil: IdPerfil // "%"
        , IdDivision: perfil.IdDivision //"%" // 
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });

    if (!isNotEmpty(perfilesCombo)) {
      setListaPerfilCombo([]);
    } else {
      // console.log("ListaPerfilCombo : ", perfilesCombo);
      setListaPerfilCombo(perfilesCombo);
      setLoading(false);
    }
    setModoEdicion(false);

  }

  async function actualizar(perfil) {
    setLoading(true);
    const { IdCliente, IdPerfil, IdPerfilPadre } = perfil;
    let params = {
      IdCliente,
      IdPerfil: isNotEmpty(IdPerfil) ? IdPerfil.toUpperCase() : "",
      IdPerfilPadre: isNotEmpty(IdPerfilPadre) ? IdPerfilPadre.toUpperCase() : "",
      IdUsuario: usuario.username
    };
    await actualizarPerfilPadre(params)
      .then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        listarPerfilesAprobadores();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }


  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "ASSISTANCE.MAIN" })}
        submenu={intl.formatMessage({ id: "SYSTEM.CONFIGURATION" })}
        subtitle={intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.APROBADORES_HHEE" })}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "CONFIG.MENU.SEGURIDAD.PERFILES" }),
            icon: <AccountTreeIcon fontSize="large" />,
            //onClick: () => { listarUsuarios() },
          },
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_MenuTreeViewPage(),
          ]
        }
      />

    </>
  );
};







export default injectIntl(WithLoandingPanel(AprobadorHHEEIndexPage));
