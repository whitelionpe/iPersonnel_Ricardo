import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
// import { Portlet } from "../../../../partials/content/Portlet";
// import AppBar from "@material-ui/core/AppBar";
// import Toolbar from "@material-ui/core/Toolbar";
// import Typography from "@material-ui/core/Typography";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";

import { isNotEmpty } from "../../../../../_metronic";
// import Tabs from '@material-ui/core/Tabs';
// import Tab from '@material-ui/core/Tab';
// import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

import { Button } from "devextreme-react";
import { PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";

import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
//import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";

import AccountTreeIcon from '@material-ui/icons/AccountTree';
import WorkIcon from '@material-ui/icons/Work';
import ViewWeekIcon from '@material-ui/icons/ViewWeek';
import PeopleIcon from '@material-ui/icons/People';

import MenuTreeViewPage from "../../../../partials/content/TreeView/MenuTreeViewPage";
import Confirm from "../../../../partials/components/Confirm";

import { eliminar, obtener, listarTreeview, crear, actualizar } from "../../../../api/administracion/unidadOrganizativa.api";
import UnidadOrganizativaEditPage from "./UnidadOrganizativaEditPage";

import { serviceUnidadCentroCosto } from "../../../../api/administracion/unidadOrganizativaCentroCosto.api";
import UnidadOrganizativaCentroCostoListPage from "../unidadOrganizativaCentroCosto/UnidadOrganizativaCentroCostoListPage";
import UnidadOrganizativaCentroCostoEditPage from "../unidadOrganizativaCentroCosto/UnidadOrganizativaCentroCostoEditPage";
import { listarMultipleSelection as listarMultipleCentroCosto } from "../../../../api/administracion/centroCosto.api";
import AdministracionCentroCostoBuscar from "../../../../partials/components/AdministracionCentroCostoBuscar";


import { eliminar as eliminarUOPosicion, obtener as obtenerUOPosicion, listar as listarUOPosicion, crear as crearUOPosicion, actualizar as actualizarUOPosicion } from "../../../../api/administracion/posicion.api";
import PosicionListPage from "../posicion/PosicionListPage";
import PosicionEditPage from "../posicion/PosicionEditPage";

//import { eliminar as eliminarUOPersonaPosicion, obtener as obtenerUOPersonaPosicion, listar as listarUOPersonaPosicion, crear as crearUOPersonaPosicion, actualizar as actualizarUOPersonaPosicion } from "../../../../api/administracion/personaPosicion.api";
import PersonaPosicionListPage from "../persona/posicion/PersonaPosicionListOtroPage";

import { obtener as obtenerSistemaConfiguracion } from "../../../../api/sistema/configuracion.api";

//-customerDataGrid Star
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
// export const initialFilter = {
//     Activo: 'S',
//     IdCliente: '',
//     IdUnidadOrganizativa: ''
//     //FechaDesde: new Date((new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDate()),
// };
//-customerDataGrid End


const UnidadOrganizativaIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [isVisibleCentroCosto, setisVisibleCentroCosto] = useState(false);

  //const [centrocostosData, setCentrocostosData] = useState([]);
  const [gridBoxValue, setGridBoxValue] = useState([]);
  const [usuariosData, setUsuariosData] = useState([]);

  const [varIdUnidadOrganizativa, setVarIdUnidadOrganizativa] = useState("");
  const [focusedRowKey, setFocusedRowKey] = useState(0);
  const [selected, setSelected] = useState({});
  const [Filtros, setFiltros] = useState({ FlRepositorio: "1", IdUnidadOrganizativa: varIdUnidadOrganizativa });


  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(true);
  const [titulo, setTitulo] = useState("");
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);

  const [modoEdicionTabs, setModoEdicionTabs] = useState(false);
  const [dataRowEditNewTabs, setDataRowEditNewTabs] = useState({});
  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [listarTabs, setListarTabs] = useState([]);

  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);

  const [dataFilter, setDataFilter] = useState({ IdModulo: "01" });
  const [isSubMenu, setIsSubMenu] = useState(false);
  const [varIdMenu, setVarIdMenu] = useState("");

  const [idDivisionSeleccionada, setIdDivisionSeleccionada] = useState(null);
  const [showForm, setShowForm] = useState("");
  const [idModulo, setIdModulo] = useState("");
  const [idMenu, setIdMenu] = useState("");
  const [selectedNode, setSelectedNode] = useState();
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
  const options = [{ id: 1, name: 'Menú', icon: 'activefolder' },
  { id: 2, name: 'Sub-menú', icon: 'inactivefolder' }];

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
  //FILTRO- CustomerDataGrid
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);

  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  // console.log("CustomerDataGrid => ds", ds);
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

  const [codigoAutogenerado, setCodigoAutogenerado] = useState(true);

  /**Configuración Botones**************************************** */
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 4; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }
  const loadConfiguracion = async () => {

    await obtenerSistemaConfiguracion({ IdCliente: perfil.IdCliente, IdConfiguracion: "IDENTI_UO_AUTO" })//_DEFAULT
      .then(result => {
       console.log("obtenerSistemaConfiguracion",result.Valor1);
       let credencialAuto = result.Valor1 == "S" ? true : false;
        setCodigoAutogenerado(credencialAuto);
      }).finally();
  }




  //::::::::::::::::::::::::::::FUNCIONES PARA UNIDAD ORGANIZATIVA-:::::::::::::::::::::::::::::::::::

  async function agregarUnidadOrganizativa(unidad) {
    setLoading(true);
    const { IdCliente, IdUnidadOrganizativa, IdUnidadOrganizativaPadre, UnidadOrganizativa, Activo } = unidad;

    let params = {
      IdCliente,
      IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa.toUpperCase() : "",
      IdUnidadOrganizativaPadre: isNotEmpty(IdUnidadOrganizativaPadre) ? IdUnidadOrganizativaPadre.toUpperCase() : "",
      UnidadOrganizativa: isNotEmpty(UnidadOrganizativa) ? UnidadOrganizativa.toUpperCase() : "",
      Activo,
      IdUsuario: usuario.username,
      IdDivision: idDivisionSeleccionada
    };
    await crear(params)
      .then(response => {
        if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        listarUnidadOrganizativa();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function actualizarUnidadOrganizativa(unidad) {
    setLoading(true);
    const { IdCliente, IdUnidadOrganizativa, IdUnidadOrganizativaPadre, UnidadOrganizativa, Activo } = unidad;
    let params = {
      IdCliente,
      IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa.toUpperCase() : "",
      IdUnidadOrganizativaPadre: isNotEmpty(IdUnidadOrganizativaPadre) ? IdUnidadOrganizativaPadre.toUpperCase() : "",
      UnidadOrganizativa: isNotEmpty(UnidadOrganizativa) ? UnidadOrganizativa.toUpperCase() : "",
      Activo,
      IdUsuario: usuario.username,
      IdDivision: idDivisionSeleccionada
    };
    await actualizar(params)
      .then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        listarUnidadOrganizativa();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro() {
    setLoading(true);
    const { IdUnidadOrganizativa, IdCliente } = selectedNode;
    let data = { IdUnidadOrganizativa, IdCliente };
    await eliminar(data)
      .then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    listarUnidadOrganizativa();

  }

  async function listarUnidadOrganizativa() {
    setLoading(true);
    let unidadOrganizativas =
      await listarTreeview({
        IdCliente: perfil.IdCliente
        , ShowIconAction: 1
        , Activo: "%"
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
    if (!isNotEmpty(unidadOrganizativas)) {

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
      setMenus(unidadOrganizativas);
      setLoading(false);
    }
    setModoEdicion(false);

  }

  /*async function obtenerUnidadOrganizativa(filtro) {
      const { IdUnidadOrganizativa, IdCliente } = filtro;
      if (IdUnidadOrganizativa) {
          let unidadOrganizativa = await obtener({ IdCliente, IdUnidadOrganizativa }).catch(err => {
              handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
          });
          setDataRowEditNew({ ...unidadOrganizativa, esNuevoRegistro: false });
      }
      else {
          handleInfoMessages(intl.formatMessage({ id: "SYSTEM.MENU.MESSAGE.SELECTIONMENU" }));
             
        }
  }*/

  async function obtenerUnidadOrganizativa(filtro) {
    //console.log("obtenerUnidadOrganizativa", filtro);
    const { IdUnidadOrganizativa } = filtro;
    if (IdUnidadOrganizativa) {
      setLoading(true);
      let unidadOrganizativa = await obtener({ IdCliente: perfil.IdCliente, IdUnidadOrganizativa }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
      setDataRowEditNew({ ...unidadOrganizativa, esNuevoRegistro: false });
      setLoading(false);
    }
    else {
      handleInfoMessages(intl.formatMessage({ id: "SYSTEM.MENU.MESSAGE.SELECTIONMENU" }));
    }
  }

  const nuevoRegistro = () => {
    const { IdUnidadOrganizativa, IdCliente } = selectedNode;

    let unidad = {};
    if (isNotEmpty(IdUnidadOrganizativa)) {
      //UO padre
      unidad = { IdUnidadOrganizativa: "", UnidadOrganizativa: "", IdUnidadOrganizativaPadre: IdUnidadOrganizativa, IdCliente, Activo: "S" };
    } else {
      //UO hijo
      unidad = { IdUnidadOrganizativa: "", UnidadOrganizativa: "", IdUnidadOrganizativaPadre: "", IdCliente: perfil.IdCliente, Activo: "S" };
    }
    
    let credencial=  codigoAutogenerado?intl.formatMessage({ id: "COMMON.CODE.AUTO" }):"";
    console.log("codigoAutogenerado-auot", codigoAutogenerado);
    console.log("credencial",credencial);

    setShowForm("UnidadOrg");
    setModoEdicion(true);
    setTitulo(intl.formatMessage({id: "ACTION.NEW"}));
    setActionButton({
      new: false,
      edit: false,
      save: true,
      cancel: true
    });
    setDataRowEditNew({...unidad, esNuevoRegistro: true, IdUnidadOrganizativa: credencial});
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
    setVarIdUnidadOrganizativa("");
    setListarTabs([]);
    setActionButton({ new: true, edit: true, save: false, cancel: false });
    setIsSubMenu(false);
    setDataFilter({ IdModulo: idModulo });
  };

  const treeViewSetFocusNodo = (data, idMenu) => {

    let menus = [];
    let objIndex = data.findIndex((obj => obj.IdMenu === idMenu));
    if (objIndex >= 0) data[objIndex].selected = true;
    menus.push(...data);
    return menus;
  }

  const seleccionarNodo = (dataRow) => {
    console.log(dataRow)
    const { IdMenu, IdUnidadOrganizativa, Nivel, IdDivision } = dataRow;

    setIdDivisionSeleccionada(IdDivision);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    if (IdMenu != idMenu) {
      if(Nivel === 1){
        setShowForm("");
        setSelectedNode(dataRow);
        setActionButton({ new: true, delete: false, edit: false });
      }
      else{
        setShowForm("UnidadOrg");
        obtenerUnidadOrganizativa(dataRow);
        setVarIdUnidadOrganizativa(IdUnidadOrganizativa);
        setSelectedNode(dataRow);
        setActionButton({
          new: isNotEmpty(IdUnidadOrganizativa) ? true : false,
          delete: isNotEmpty(IdUnidadOrganizativa) ? true : false,
          edit: isNotEmpty(IdUnidadOrganizativa) ? true : false
        });
      }
    }
  }



  useEffect(() => {
    listarUnidadOrganizativa();
    //listar_CentroCostos();
    loadControlsPermission();
    loadConfiguracion();
  }, []);



  //******************UNIDAD ORGANIZATIVA CENTRO DE COSTO*******************************/

  async function agregarUOrgCentroCosto(centrosCosto) {
    setLoading(true);
    const { IdCentroCosto } = centrosCosto;
    const { IdUnidadOrganizativa } = selectedNode;
    // let data = {
    //   IdCliente,
    //   IdUnidadOrganizativa,
    //   IdUsuario: usuario.username
    // };

    let totRows = 0;
    // for (let i = 0; i < centrosCosto.length; i++) {
    //   let { Activo, IdCentroCosto } = centrosCosto[i];
    //console.log("grabar", IdCentroCosto);
    await serviceUnidadCentroCosto.crear({ IdCliente: perfil.IdCliente, IdUnidadOrganizativa, IdCentroCosto, Activo: 'S' })
      .then(response => {
        if (response) {
          //console.log("grabar ok", totRows);
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
          totRows++;
        }
        listarUOrgCentroCosto();

      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });

    //}

    // if (totRows > 0) {
    //   handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
    //   listarUOrgCentroCosto();
    // }
    //props.dataRowEditNew.IdCentroCosto = props.gridBoxValue[i];
    //props.agregarUOrgCentroCosto(props.dataRowEditNew);



  }

  // async function actualizarUOrgCentroCosto(datarow) {
  //   setLoading(true);
  //   const { IdUnidadOrganizativa, IdCentroCosto, Activo } = datarow;
  //   let params = {
  //     IdCliente: perfil.IdCliente,
  //     IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa.toUpperCase() : "",
  //     IdCentroCosto: isNotEmpty(IdCentroCosto) ? IdCentroCosto.toUpperCase() : "",
  //     Activo: Activo,
  //     IdUsuario: usuario.username
  //   };
  //   await serviceUnidadCentroCosto.actualizar(params)
  //     .then(() => {
  //       handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
  //       listarUOrgCentroCosto();
  //     })
  //     .catch(err => {
  //       handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
  //     }).finally(() => { setLoading(false); });
  // }


  async function eliminarRegistroUOrgCentroCosto(uocentrocosto, confirm) {

    setSelected(uocentrocosto);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdUnidadOrganizativa, IdCentroCosto, IdCliente } = uocentrocosto;
      await serviceUnidadCentroCosto.eliminar({
        IdCliente,
        IdUnidadOrganizativa,
        IdCentroCosto,
        IdUsuario: usuario.username
      })
        .then(() => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
      listarUOrgCentroCosto();
    }
  }

  async function listarUOrgCentroCosto() {
    setLoading(true);
    const { IdCliente, IdUnidadOrganizativa } = selectedNode
    setModoEdicionTabs(false);
    await serviceUnidadCentroCosto.listar({
      IdCliente,
      IdUnidadOrganizativa,
      IdCentroCosto: '%',
      NumPagina: 0,
      TamPagina: 0
    }).then(uoCentroCostos => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      // console.log("centro de costos-->",uoCentroCostos)
      setListarTabs(uoCentroCostos);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerUOrgCentroCosto(filtro) {
    const { IdUnidadOrganizativa, IdCentroCosto, IdCliente } = filtro;
    if (IdUnidadOrganizativa) {
      let uoCentroCosto = await serviceUnidadCentroCosto.obtener({
        IdCliente: IdCliente,
        IdUnidadOrganizativa: IdUnidadOrganizativa,
        IdCentroCosto: IdCentroCosto
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
      setDataRowEditNewTabs({ ...uoCentroCosto, esNuevoRegistro: false });
    }
  }

  const seleccionarRegistroUOrgCentroCosto = dataRow => {
    //console.log("seleccionarRegistroUOrgCentroCosto|dataRow:", dataRow);
    // const { RowIndex } = dataRow;
    // setFocusedRowKey(RowIndex);
  };

  const nuevoRegistroTabsCentroCosto = () => {

    //let nuevo = { Activo: "S", ...selected };
    //setDataRowEditNewTabs({ ...nuevo, esNuevoRegistro: true });
    //setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setisVisibleCentroCosto(true);
    // console.log("nuevoRegistroTabs", nuevo);
    //setModoEdicionTabs(true);
  };

  const editarUOrgCentroCosto = dataRow => {
    const { RowIndex, IdCentroCosto } = dataRow;
    setModoEdicionTabs(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerUOrgCentroCosto(dataRow);
    setFocusedRowKey(RowIndex);
    setGridBoxValue([IdCentroCosto]);
  };

  const cancelarEdicionUOrgCentroCosto = () => {
    setModoEdicionTabs(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNewTabs({});
  };


  /*************Listar C.Cost****************/
  // async function listar_CentroCostos() {
  //   setLoading(true);
  //   listarMultipleCentroCosto({
  //     IdCliente: perfil.IdCliente
  //     , NumPagina: 0
  //     , TamPagina: 0
  //   }).then(data => {
  //     setCentrocostosData(data);
  //   }).catch(err => {
  //     handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
  //   }).finally(() => { setLoading(false); });
  //   //console.log("listar_CentroCosto", data);
  // }

  const agregarCentroCosto = (dataPopup) => {
    //console.log("filtroCentroCosto", filtroCentroCosto);
    const { IdCentroCosto, CentroCosto } = dataPopup[0];
    setisVisibleCentroCosto(false);
    if (isNotEmpty(IdCentroCosto)) {
      // props.setDataRowEditNew({
      //   ...props.dataRowEditNew,
      //   IdCentroCosto: IdCentroCosto,
      //   CentroCosto: CentroCosto,
      // });
      agregarUOrgCentroCosto({ IdCentroCosto, CentroCosto, Activo: 'S' });
    }
  };


  //****************POSICIONES************************************************** */

  async function agregarPosicion(data) {
    const { IdUnidadOrganizativa, IdTipoPosicion, IdFuncion, IdPosicion, Posicion, Confianza, Fiscalizable, IdPosicionPadre, Contratista, Activo } = data;
    setLoading(true);
    let param = {
      IdCliente: perfil.IdCliente,
      IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion.toUpperCase() : "",
      Posicion: isNotEmpty(Posicion) ? Posicion.toUpperCase() : "",
      IdTipoPosicion: isNotEmpty(IdTipoPosicion) ? IdTipoPosicion.toUpperCase() : "",
      IdDivision: perfil.IdDivision,
      IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa.toUpperCase() : "",
      IdFuncion: isNotEmpty(IdFuncion) ? IdFuncion.toUpperCase() : "",
      IdPosicionPadre: isNotEmpty(IdPosicionPadre) ? IdPosicionPadre.toUpperCase() : "",
      Confianza: Confianza === true || Confianza === "S" ? "S" : "N",
      Fiscalizable: Fiscalizable === true || Fiscalizable === "S" ? "S" : "N",
      Contratista: Contratista === true || Contratista === "S" ? "S" : "N",
      Activo,
      IdUsuario: usuario.username
    };
    await crearUOPosicion(param)
      .then(response => {
        if (response)
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        listarPosiciones();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }


  async function actualizarPosicion(datarow) {

    const { IdUnidadOrganizativa, IdTipoPosicion, IdFuncion, IdPosicion, Posicion, Confianza, Fiscalizable, IdPosicionPadre, Contratista, IdDivision, IdCliente, Activo } = datarow;

    setLoading(true);
    let params = {
      IdCliente: IdCliente,
      IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion.toUpperCase() : "",
      Posicion: isNotEmpty(Posicion) ? Posicion.toUpperCase() : "",
      IdTipoPosicion: isNotEmpty(IdTipoPosicion) ? IdTipoPosicion.toUpperCase() : "",
      IdDivision: IdDivision,
      IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa.toUpperCase() : "",
      IdFuncion: isNotEmpty(IdFuncion) ? IdFuncion.toUpperCase() : "",
      IdPosicionPadre: isNotEmpty(IdPosicionPadre) ? IdPosicionPadre.toUpperCase() : "",
      Confianza: Confianza === true || Confianza === "S" ? "S" : "N",
      Fiscalizable: Fiscalizable === true || Fiscalizable === "S" ? "S" : "N",
      Contratista: Contratista === true || Contratista === "S" ? "S" : "N",
      Activo,
      IdUsuario: usuario.username
    };
    await actualizarUOPosicion(params)
      .then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        listarPosiciones();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }


  async function eliminarRegistroPosicion(posicion, confirm) {
    setSelected(posicion);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdPosicion, IdCliente } = posicion;
      await eliminarUOPosicion({
        IdPosicion: IdPosicion,
        IdCliente: IdCliente,
        IdUsuario: usuario.username
      })
        .then(response => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
      listarPosiciones();
    }
  }


  async function listarPosiciones() {
    // setLoading(true);
    // const { IdCliente, IdUnidadOrganizativa } = selectedNode;
    // // console.log("listarPosiciones => selectedNode: ",selectedNode);
    // setModoEdicionTabs(false);
    // await listarUOPosicion({
    //     IdCliente,
    //     IdUnidadOrganizativa,
    //     NumPagina: 0,
    //     TamPagina: 0
    // }).then(posiciones => {
    //     setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    //     console.log("listarPosiciones => posiciones: ", posiciones);
    //     setListarTabs(posiciones);
    // }).catch(err => {
    //     handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
    // }).finally(() => { setLoading(false); });
  }


  async function obtenerPosicion(filtro) {
    const { IdPosicion, IdCliente } = filtro;
    if (isNotEmpty(IdPosicion) && isNotEmpty(IdCliente)) {
      let posicion = await obtenerUOPosicion({
        IdPosicion: IdPosicion,
        IdCliente: IdCliente
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
      setDataRowEditNewTabs({ ...posicion, esNuevoRegistro: false });
    }
  }


  const seleccionarRegistroPosicion = dataRow => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };

  const nuevoRegistroTabsPosicion = () => {
    let nuevo = { Activo: "S", ...selected };
    setDataRowEditNewTabs({ ...nuevo, esNuevoRegistro: true });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicionTabs(true);
  };

  const editarRegistroPosicion = (dataRow) => {
    const { RowIndex } = dataRow;
    setModoEdicionTabs(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerPosicion(dataRow);
    setFocusedRowKey(RowIndex);
  };

  const cancelarEdicionPosicion = () => {
    setModoEdicionTabs(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNewTabs({});
  };


  //****************PERSONAS POSICION************************************************** */

  // async function agregarPersonaPosicion(data) {
  //   setLoading(true);
  //   const { IdCompania, IdUnidadOrganizativa, IdPersona, IdPosicion, IdSecuencial, FechaInicio, FechaFin, FechaCese, IdMotivoCese, Activo } = data;
  //   let params = {
  //     IdCliente: perfil.IdCliente
  //     , IdUnidadOrganizativa
  //     , IdCompania: isNotEmpty(IdCompania) ? IdCompania : ""
  //     , IdPersona: isNotEmpty(IdPersona) ? IdPersona : 0
  //     , IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion : ""
  //     , IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0
  //     , FechaInicio: isNotEmpty(FechaInicio) ? FechaInicio : ""
  //     , FechaFin: isNotEmpty(FechaFin) ? FechaFin : ""
  //     , FechaCese: isNotEmpty(FechaCese) ? FechaCese : ""
  //     , IdMotivoCese: isNotEmpty(IdMotivoCese) ? IdMotivoCese : ""
  //     , Activo
  //     , IdUsuario: usuario.username
  //   };
  //   await crearUOPersonaPosicion(params)
  //     .then(response => {
  //       if (response)
  //         handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
  //       listarPersonaPosicion();
  //     }).catch(err => {
  //       handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
  //     }).finally(() => { setLoading(false); });
  // }

  // async function actualizarPersonaPosicion(datarow) {
  //   setLoading(true);
  //   const { IdCompania, IdUnidadOrganizativa, IdPersona, IdPosicion, IdSecuencial, FechaInicio, FechaFin, FechaCese, IdMotivoCese, Activo } = datarow;

  //   let params = {
  //     IdCliente: perfil.IdCliente
  //     , IdUnidadOrganizativa
  //     , IdCompania: isNotEmpty(IdCompania) ? IdCompania : ""
  //     , IdPersona: isNotEmpty(IdPersona) ? IdPersona : 0
  //     , IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion : ""
  //     , IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0
  //     , FechaInicio: isNotEmpty(FechaInicio) ? FechaInicio : ""
  //     , FechaFin: isNotEmpty(FechaFin) ? FechaFin : ""
  //     , FechaCese: isNotEmpty(FechaCese) ? FechaCese : ""
  //     , IdMotivoCese: isNotEmpty(IdMotivoCese) ? IdMotivoCese : ""
  //     , Activo
  //     , IdUsuario: usuario.username
  //   };
  //   await actualizarUOPersonaPosicion(params).then(() => {
  //     handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
  //     listarPersonaPosicion();
  //   }).catch(err => {
  //     handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
  //   }).finally(() => { setLoading(false); });
  // }

  // async function eliminarPersonaPosicion(posicionpersona) {
  //   setLoading(true);
  //   const { IdCliente, IdCompania, IdPersona, IdUnidadOrganizativa, IdPosicion, IdSecuencial } = posicionpersona;
  //   await eliminarUOPersonaPosicion({
  //     IdCliente,
  //     IdCompania,
  //     IdPersona,
  //     IdUnidadOrganizativa,
  //     IdPosicion,
  //     IdSecuencial,
  //     IdUsuario: usuario.username
  //   }).then(response => {
  //     handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
  //   }).catch(err => {
  //     handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
  //   }).finally(() => { setLoading(false); });
  //   listarPersonaPosicion();
  // }

  // async function listarPersonaPosicion() {
  //   setLoading(true);
  //   //const { IdCliente, IdCompania, IdPersona, IdUnidadOrganizativa, IdPosicion } = selected;
  //   const { IdCliente, IdUnidadOrganizativa } = selectedNode;
  //   setModoEdicionTabs(false);
  //   await listarUOPersonaPosicion({
  //     IdCliente,
  //     IdCompania: '%',
  //     IdPersona: 0,
  //     IdUnidadOrganizativa,
  //     IdPosicion: '%',
  //     NumPagina: 0,
  //     TamPagina: 0
  //   }).then(personaPosicions => {
  //     // console.log("listarPersonaPosicion", personaPosicions);
  //     setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
  //     setListarTabs(personaPosicions);
  //   }).catch(err => {
  //     handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
  //   }).finally(() => { setLoading(false); });

  // }

  // async function obtenerPersonaPosicion(filtro) {
  //   const { IdCliente, IdCompania, IdUnidadOrganizativa, IdPersona, IdPosicion, IdSecuencial } = filtro;
  //   if (IdPersona) {
  //     let personaposicion = await obtenerUOPersonaPosicion({
  //       IdCliente,
  //       IdCompania,
  //       IdUnidadOrganizativa,
  //       IdPersona,
  //       IdPosicion,
  //       IdSecuencial
  //     }).catch(err => {
  //       handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
  //     });
  //     setDataRowEditNewTabs({ ...personaposicion, esNuevoRegistro: false });
  //   }
  // }

  // const nuevoRegistroTabsPersonaPosicion = () => {
  //   let nuevo = { Activo: "S", ...selected };
  //   setDataRowEditNewTabs({ ...nuevo, esNuevoRegistro: true });
  //   setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
  //   setModoEdicionTabs(true);

  //   setGridBoxValue([]);
  //   //listar_Usuarios();
  // };

  // const editarPersonaPosicion = dataRow => {
  //   const { RowIndex } = dataRow;
  //   setModoEdicionTabs(true);
  //   setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
  //   obtenerPersonaPosicion(dataRow);
  //   setFocusedRowKey(RowIndex);
  // };

  // const cancelarPersonaPosicion = () => {
  //   setModoEdicionTabs(false);
  //   setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
  //   setDataRowEditNewTabs({});
  // };


  const changeTabIndex = (index) => {
    handleChange(null, index);
  }


  const getInfo = () => {
    const { IdUnidadOrganizativa, Menu } = selectedNode;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdUnidadOrganizativa, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.COSTCENTER.UO.TAB" })], value: Menu, colSpan: 4 }
    ];
  }

  //************************************************************* */

  async function eliminarListRowTab(selected, confirm) {
    let currentTab = tabIndex;
    switch (currentTab) {
      case 1:
        eliminarRegistroUOrgCentroCosto(selected, confirm);
        break;
      case 2:
        eliminarRegistroPosicion(selected, confirm);
        break;
    }
  }
  /*async function listar_Usuarios() {
      let data = await listarMultipleSelection().catch(err => { handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err); });
      setUsuariosData(data);
  }
  useEffect(() => {
      listar_Usuarios();
  }, []);*/


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
  const tabsDisabled = () => {
    return isNotEmpty(varIdUnidadOrganizativa) ? false : true;
    //return true;
  }

  const tabContent_MenuTreeViewPage = () => {
    return <div className={classes.gridRoot}>
      {/*<AppBar position="static" className={classesEncabezado.secundario}>
        <Toolbar variant="dense" className={classesEncabezado.toolbar}>
            <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                MENÚ DE OPCIONES
            </Typography>
        </Toolbar>
        </AppBar>*/}

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
            />
          </Grid>
          <Grid item xs={6} style={{ borderRight: "1px solid #ebedf2" }} >
            <Paper className={classes.paper}>
              <>
                {/**************************Unidad Organizativa******************************/}

                { showForm === "UnidadOrg" && (
                  <UnidadOrganizativaEditPage
                    modoEdicion={modoEdicion}
                    dataRowEditNew={dataRowEditNew}
                    actualizar={actualizarUnidadOrganizativa}
                    agregar={agregarUnidadOrganizativa}
                    cancelarEdicion={cancelarEdicion}
                    //icono={icono}
                    //setIcono={setIcono}
                    titulo={titulo}
                    codigoAutogenerado={codigoAutogenerado}
                  />
                )}

                {isNotEmpty(showForm) && (
                  <>
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
                )}

              </>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

    </div>

  }


  const tabContent_UnidadOrganizativaCentroCostoListPage = () => {
    return <>
      {/* {modoEdicionTabs && (
        <>
          <UnidadOrganizativaCentroCostoEditPage
            dataRowEditNew={dataRowEditNewTabs}
            actualizarUOrgCentroCosto={actualizarUOrgCentroCosto}
            agregarUOrgCentroCosto={agregarUOrgCentroCosto}
            cancelarEdicion={cancelarEdicionUOrgCentroCosto}
            //centrocostosData={centrocostosData}
            gridBoxValue={gridBoxValue}
            setGridBoxValue={setGridBoxValue}
            titulo={tituloTabs}
            setModoEdicionTabs={setModoEdicionTabs}

          />
          <div className="container_only">
            <div className="float-right">
              <ControlSwitch checked={auditoriaSwitch}
                onChange={e => { setAuditoriaSwitch(e.target.checked) }}
              /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
            </div>
          </div>
          {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewTabs} />)}
        </>
      )} */}
      {!modoEdicionTabs && (
        <>
          <UnidadOrganizativaCentroCostoListPage
            uoCentroCostos={listarTabs}
            editarRegistro={editarUOrgCentroCosto}
            eliminarRegistro={eliminarRegistroUOrgCentroCosto}
            nuevoRegistro={nuevoRegistroTabsCentroCosto}
            seleccionarRegistro={seleccionarRegistroUOrgCentroCosto}
            cancelarEdicion={cancelarEdicion}
            focusedRowKey={focusedRowKey}
            getInfo={getInfo}
          />
        </>
      )}
    </>
  }

  const tabContent_PosicionListPage = () => {
    return <>
      {modoEdicionTabs && (
        <>
          <PosicionEditPage
            dataRowEditNew={dataRowEditNewTabs}
            actualizarPosicion={actualizarPosicion}
            agregarPosicion={agregarPosicion}
            cancelarEdicion={cancelarEdicionPosicion}
            titulo={tituloTabs}
            modoEdicion={true}
          />
          <div className="container_only">
            <div className="float-right">
              <ControlSwitch checked={auditoriaSwitch}
                onChange={e => { setAuditoriaSwitch(e.target.checked) }}
              /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
            </div>
          </div>
          {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewTabs} />)}
        </>
      )}
      {!modoEdicionTabs && (
        <>
          <PosicionListPage
            posiciones={listarTabs}
            editarRegistro={editarRegistroPosicion}
            eliminarRegistro={eliminarRegistroPosicion}
            nuevoRegistro={nuevoRegistroTabsPosicion}
            seleccionarRegistro={seleccionarRegistroPosicion}
            cancelarEdicion={cancelarEdicion}
            focusedRowKey={focusedRowKey}
            getInfo={getInfo}

            //Propiedades del customerDataGrid 
            uniqueId={"posicionesUnidadOrganizativaList"}
            isFirstDataLoad={isFirstDataLoad}
            setIsFirstDataLoad={setIsFirstDataLoad}
            dataSource={dataSource}
            refresh={refresh}
            resetLoadOptions={resetLoadOptions}
            refreshData={refreshData}
            setRefreshData={setRefreshData}
            selected={selectedNode}

          />
        </>
      )}
    </>
  }

  const tabContent_PersonaPosicionListPage = () => {
    return <>
      {modoEdicionTabs && (
        <>
          {/*} <PersonaSeleccionMultiplePage personasListado={storePersonasListado}>
                                                </PersonaSeleccionMultiplePage>
                                                <PersonaPosicionEditPage
                                                    dataRowEditNew={dataRowEditNewTabs}
                                                    actualizarPersonaPosicion={actualizarPersonaPosicion}
                                                    agregarPersonaPosicion={agregarPersonaPosicion}
                                                    cancelarEdicion={cancelarPersonaPosicion}
                                                    usuariosData = { usuariosData }
                                                    gridBoxValue = { gridBoxValue }
                                                    setGridBoxValue = { setGridBoxValue } 
                                                    storeUsuariosListado = { storeUsuariosListado }
                                                    titulo={tituloTabs}
                                                />
                                                <div className="container_only">
                                                    <div className="float-right">
                                                        <ControlSwitch checked={auditoriaSwitch}
                                                            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                                                        /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
                                                    </div>
                                                </div>
                                        {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewTabs} />)} */}
        </>
      )}
      {!modoEdicionTabs && (
        <>
          <PersonaPosicionListPage
            personaPosicions={listarTabs}
            //editarRegistro={editarPersonaPosicion}
            //eliminarRegistro={eliminarPersonaPosicion}
            //nuevoRegistro={nuevoRegistroTabsPersonaPosicion}
            seleccionarRegistro={seleccionarRegistroPosicion}
            cancelarEdicion={cancelarEdicion}
            focusedRowKey={focusedRowKey}
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
        subtitle={intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.MAINTENANCE" })}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.COSTCENTER.UO.TAB" }),
            icon: <AccountTreeIcon fontSize="large" />,
            //onClick: () => { listarUsuarios() },
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.COSTCENTER.TAB" }),
            icon: <WorkIcon fontSize="large" />,
            onClick: (e) => { listarUOrgCentroCosto() },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.POSITIONS.TAB" }),
            icon: <ViewWeekIcon fontSize="large" />,
            //onClick: (e) => { obtenerUsuarioFoto() },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.PERSONS.TAB" }),
            icon: <PeopleIcon fontSize="large" />,
            // onClick: () => { listarPersonaPosicion() },
            disabled: !tabsDisabled() && accessButton.Tabs[3] ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_MenuTreeViewPage(),
            tabContent_UnidadOrganizativaCentroCostoListPage(),
            tabContent_PosicionListPage(),
            tabContent_PersonaPosicionListPage()
          ]
        }
      />

      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        onConfirm={() => eliminarListRowTab(selected, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />

      {/*******>POPUP DE CENTRO DE COSTO >******** */}

      <AdministracionCentroCostoBuscar
        selectData={agregarCentroCosto}
        showButton={false}
        showPopup={{ isVisiblePopUp: isVisibleCentroCosto, setisVisiblePopUp: setisVisibleCentroCosto }}
        cancelarEdicion={() => setisVisibleCentroCosto(false)}
        uniqueId={"centrCostoConsumo01Page"}
        selectionMode={"row"}
        // IdUnidadOrganizativa={IdUnidadOrganizativa}
        Filtros={Filtros}
      />

    </>
  );
};







export default injectIntl(WithLoandingPanel(UnidadOrganizativaIndexPage));
