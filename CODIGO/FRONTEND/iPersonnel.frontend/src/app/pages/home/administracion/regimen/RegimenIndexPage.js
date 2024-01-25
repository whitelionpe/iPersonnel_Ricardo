import React, { useEffect, useState, Fragment } from "react";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import { Portlet } from "../../../../partials/content/Portlet";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabPanel from '../../../../partials/content/TabPanel';
import Confirm from "../../../../partials/components/Confirm";

import ScatterPlotIcon from '@material-ui/icons/ScatterPlot';
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import PersonIcon from '@material-ui/icons/Person';
import Assignment from '@material-ui/icons/Assignment';
import Security from '@material-ui/icons/Security';
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";

import { handleErrorMessages, handleInfoMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";

import RegimenEditPage from './RegimenEditPage';
import RegimenListPage from './RegimenListPage';
import RegimenGuardiaDiaEditPage from './RegimenGuardiaDiaEditPage';
import RegimenGuardiaDiaListPage from './RegimenGuardiaDiaListPage';
import RegimenGuardiaEditPage from './RegimenGuardiaEditPage';
import RegimenGuardiaListPage from './RegimenGuardiaListPage';

//import PersonaRegimenesListPage from "../persona/PersonaRegimenesListPage";
import RegimenPersonaListPage from "./RegimenPersonaListPage";
import RegimenPersonaEditPage from "./RegimenPersonaEditPage";

import { useSelector } from "react-redux";
import { dateFormat, isNotEmpty } from "../../../../../_metronic";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

import {
  eliminar, obtener, listar, crear, actualizar
} from "../../../../api/administracion/regimen.api";

import {
  eliminar as eliminarGuardia,
  obtener as obtenerGuardia,
  listar as listarGuardia,
  crear as crearGuardia,
  actualizar as actualizarGuardia
} from "../../../../api/administracion/regimenGuardia.api";

import {
  listar as listarDia,
  crear as crearDia,
  actualizar as actualizarDia
} from "../../../../api/administracion/regimenGuardiaDia.api";

import {
  //listarPersona as listarGrupo,
  listarRegimenPersona as listarPRegimen,
  obtener as obtenerPRegimen,
  crear as crearPRegimen,
  actualizar as actualizarPRegimen,
  eliminar as eliminarPRegimen,
} from "../../../../api/administracion/personaRegimen.api";
import { storeListar as buscarPersona } from "../../../../api/administracion/persona.api";

//-customerDataGrid Star
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { LightAsync } from "react-syntax-highlighter";


export const initialFilter = {

  IdCliente: "",
  IdDivision: "",
  IdRegimen: "",
  Regimen: "",
  Activo: "S",
};

const RegimenIndexPage = (props) => {

  const { intl, setLoading, dataMenu } = props;

  const usuario = useSelector(state => state.auth.user);
  //const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const [instance, setInstance] = useState({});


  const [listarTabs, setListarTabs] = useState([]);
  const [listarDias, setListarDias] = useState([]);
  //const [selected, setSelected] = useState({});
  const [selected, setSelected] = useState({
    IdCliente: perfil.IdCliente,
    IdDivision: perfil.IdDivision
  });
  const [selectedGuardia, setSelectedGuardia] = useState({});

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const [modoEdicion, setModoEdicion] = useState(false);
  // const [modoEdicionHijo, setModoEdicionHijo] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [tabIndex, setTabIndex] = useState(0);

  const [varIdRegimen, setVarIdRegimen] = useState("");
  const [varIdGuardia, setVarIdGuardia] = useState("");
  const [numeroGuardias, setNumeroGuardias] = useState();

  const [focusedRowKey, setFocusedRowKey] = useState();
  const [focusedRowKeyRegimenGuardia, setFocusedRowKeyRegimenGuardia] = useState();

  const [isVisibleConfirm, setIsVisibleConfirm] = useState(false);

  const handleChange = (event, newValue) => { setTabIndex(newValue); };

  //const [diasTrabajo, setDiasTrabajo] = useState(15);
  //const [diasDescanso, setDiasDescanso] = useState(5);
  const [guardiaDias, setGuardiaDias] = useState([]);


  //FILTRO- CustomerDataGrid
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);

  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();

  /************--Configuración de acceso de botones*************/
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 4; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }
  /***********************************************************************/

  const [gridBoxValue, setGridBoxValue] = useState([]);
  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [focusedRowKeyRegimen, setFocusedRowKeyRegimen] = useState();
  //const perfil = useSelector(state => state.perfil.perfilActual);
  const [grillaPersonaRegimen, setGrillaPersonaRegimen] = useState([]);
  let arr_mensajes = [];

  //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
  const [totalRowIndex, setTotalRowIndex] = useState(0);



  //::::::::::::::::::::::::::::FUNCIONES REGIMEN-:::::::::::::::::::::::::::::::::::

  async function agregarRegimen(data) {
    setLoading(true);
    const { IdRegimen, Regimen, DiasTrabajo, DiasDescanso, Activo } = data;
    let params = {
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdRegimen: isNotEmpty(IdRegimen) ? IdRegimen.toUpperCase() : "",
      Regimen: isNotEmpty(Regimen) ? Regimen.toUpperCase() : "",
      DiasTrabajo: DiasTrabajo,
      DiasDescanso: DiasDescanso,
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await crear(params)
      .then(response => {
        if (response)
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        listarRegimen()
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }


  async function actualizarRegimen(dataRow) {
    setLoading(true);
    const { IdCliente, IdDivision, IdRegimen, Regimen, DiasTrabajo, DiasDescanso, Activo } = dataRow;
    let params = {
      IdCliente: IdCliente,
      IdDivision: IdDivision,
      IdRegimen: isNotEmpty(IdRegimen) ? IdRegimen.toUpperCase() : "",
      Regimen: isNotEmpty(Regimen) ? Regimen.toUpperCase() : "",
      DiasTrabajo: DiasTrabajo,
      DiasDescanso: DiasDescanso,
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await actualizar(params)
      .then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        listarRegimen();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function obtenerRegimen() {
    setLoading(true);
    const { IdCliente, IdDivision, IdRegimen } = selected;

    await obtener({
      IdCliente,
      IdDivision,
      IdRegimen
    }).then(compania => {
      setDataRowEditNew({ ...compania, esNuevoRegistro: false });

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro(dataRow, confirm) {
    //setSelected(, DiasTrabajo: selected.DiasTrabajo, DiasDescanso: selected.DiasDescanso );
    setSelected({ ...dataRow, DiasTrabajo: selected.DiasTrabajo, DiasDescanso: selected.DiasDescanso });
    setIsVisibleConfirm(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdDivision, IdRegimen } = dataRow
      await eliminar({
        IdCliente,
        IdDivision,
        IdRegimen
      })
        .then(response => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
          setVarIdRegimen("");
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
      listarRegimen();
    }
  }


  async function listarRegimen() {

    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    changeTabIndex(0);
    setModoEdicion(false);
    setRefreshData(true);

  }


  const nuevoRegistro = () => {
    changeTabIndex(1);
    const { IdCliente, IdDivision } = selected;
    let compania = { Activo: "S", IdCliente, IdDivision };
    setDataRowEditNew({ ...compania, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setNumeroGuardias(0);
  };

  const editarRegistro = dataRow => {

    changeTabIndex(1);
    const { RowIndex } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerRegimen();
    setFocusedRowKey(RowIndex);
  };

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    setVarIdRegimen("");

  };

  const seleccionarRegistro = dataRow => {
    const { IdRegimen, RowIndex, NumeroGuardias } = dataRow;
    setModoEdicion(false);
    setSelected(dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    if (IdRegimen != varIdRegimen) {
      setVarIdRegimen(IdRegimen);
      setFocusedRowKey(RowIndex);
      setNumeroGuardias(NumeroGuardias);
    }
  }


  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerRegimen(dataRow);
  };


  //::::::::::::::::::::::FUNCIONES REGIMEN GUARDIA :::::::::::::::::::::::::::::::::::::::::::::::::


  async function agregarRegimenGuardia(data, dias) {
    try {
      setLoading(true);
      const { IdGuardia, Guardia } = data;
      let param = {
        IdCliente: perfil.IdCliente,
        IdDivision: perfil.IdDivision,
        IdRegimen: varIdRegimen,
        IdGuardia: isNotEmpty(IdGuardia) ? IdGuardia.toUpperCase() : "",
        Guardia: isNotEmpty(Guardia) ? Guardia.toUpperCase() : "",
        IdUsuario: usuario.username
      };
      //Agregar Guardía.
      await crearGuardia(param);
      //Agregar régimen guardia Día.

      console.log("dias a guardar-->", listarDias);

      let dias = Object.keys(listarDias[0]).map(x => {
        if (!isNaN(x)) {
          return { IdDia: x, Turno: listarDias[0][x] };
        }
      }).filter(x => x != undefined);

      console.log("dias a guardar 2 -->", dias);

      await Promise.all(
        dias.map(async (item) => {
          await crearDia({ ...param, ...item });
        })
      ).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        listarRegimenGuardia();
      }).finally(() => { setLoading(false); });

      // await crearGuardia(param)
      //     .then(response => {
      //         if (response)
      //             handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      //         listarRegimenGuardia()
      //     }).catch(err => {
      //         handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      //     }).finally(() => { setLoading(false); });
    } catch (error) {
      setLoading(false);
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.ERROR" }), error);
    }
  }

  async function actualizarRegimenGuardia(dataRow) {
    setLoading(true);
    const { IdCliente, IdDivision, IdRegimen, IdGuardia, Guardia } = dataRow;
    let params = {
      IdCliente: IdCliente,
      IdDivision: IdDivision,
      IdRegimen: IdRegimen,
      IdGuardia: isNotEmpty(IdGuardia) ? IdGuardia.toUpperCase() : "",
      Guardia: isNotEmpty(Guardia) ? Guardia.toUpperCase() : "",
      IdUsuario: usuario.username
    };
    await actualizarGuardia(params)
      .then(async () => {

        console.log("listarDias", listarDias);
        let dias = Object.keys(listarDias[0]).map(x => {
          if (!isNaN(x) && (listarDias[0][x] === 'D' || listarDias[0][x] === 'N')) {
            return { IdDia: x, Turno: listarDias[0][x] };
          }
        }).filter(x => x != undefined);
        console.log("dias", dias);

        await Promise.all(
          dias.map(async (item) => {
            await actualizarDia({ ...params, ...item });
          })
        ).finally(() => { setLoading(false); });

        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        listarRegimenGuardia();

      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });




  }

  async function obtenerRegimenGuardia(dataRow) {
    setLoading(true);
    const { IdCliente, IdDivision, IdRegimen, IdGuardia } = dataRow;
    await obtenerGuardia({
      IdCliente,
      IdDivision,
      IdRegimen,
      IdGuardia
    }).then(data => {
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegimenGuardia(dataRow, confirm) {
    setSelected({ ...dataRow, DiasTrabajo: selected.DiasTrabajo, DiasDescanso: selected.DiasDescanso });
    setIsVisibleConfirm(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdDivision, IdRegimen, IdGuardia } = dataRow;
      await eliminarGuardia({
        IdCliente,
        IdDivision,
        IdRegimen,
        IdGuardia
      }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarRegimenGuardia();
    }
  }

  async function listarRegimenGuardia() {
    setLoading(true);
    const { IdCliente, IdDivision, IdRegimen, DiasTrabajo, DiasDescanso } = selected;
    await listarGuardia({
      IdCliente,
      IdDivision,
      IdRegimen,
      NumPagina: 0,
      TamPagina: 0
    }).then(data => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(data);
      setModoEdicion(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
    //Generar Campos GuardiaDia.
    configuracionDia(DiasTrabajo, DiasDescanso);
  }

  const seleccionarRegimenGuardia = dataRow => {
    const { RowIndex } = dataRow;
    setSelectedGuardia(dataRow);
    //setVarIdGuardia(IdGuardia);
    setFocusedRowKeyRegimenGuardia(RowIndex);
  };

  const editarRegimenGuardia = dataRow => {
    const { RowIndex } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setDataRowEditNew({ ...dataRow, esNuevoRegistro: false });
    obtenerRegimenGuardia(dataRow);
    listarGuardiaDia();
    setFocusedRowKeyRegimenGuardia(RowIndex);
  };

  const nuevoRegimenGuardia = (e) => {
    let nuevo = { Activo: "S" };
    setDataRowEditNew({ ...nuevo, esNuevoRegistro: true });
    listarGuardiaTemporal();
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);

    console.log("guardiaDias", guardiaDias);
    console.log("listarDias", listarDias);
  };

  //::::::::::::::::::::::::: Guadia Día ::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const configuracionDia = (diasTrabajo, diasDescanso) => {
    //console.log('configuracion', props.titulo);
    //if (props.titulo === intl.formatMessage({ id: "ACTION.NEW" })) {
    const guardias = [];
    for (let i = 0; i < diasTrabajo; i++) {
      guardias.push({ IdDia: (i + 1).toString(), Turno: 'D' });
    }
    for (let i = diasTrabajo; i < diasDescanso + diasTrabajo; i++) {
      guardias.push({ IdDia: (i + 1).toString(), Turno: 'L' });
    }
    setGuardiaDias(guardias);
    // console.log("configuracion", guardias);
    //}
  }

  async function listarGuardiaDia() {

    const { IdCliente, IdDivision, IdRegimen, IdGuardia } = selectedGuardia;
    if (isNotEmpty(IdGuardia)) {
      setLoading(true);
      await listarDia({
        IdCliente,
        IdDivision,
        IdRegimen,
        IdGuardia
      }).then(data => {
        setListarDias(data);
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    } else {
      setListarDias([]);
    }

  }

  function listarGuardiaTemporal() {
    let array = [];
    array.push({ IdGuardia: 0 });
    for (let i = 0; i < guardiaDias.length; i++) {
      let x = guardiaDias[i];
      array[0][x.IdDia] = x.Turno;
    }
    setListarDias(array);
  }



  //:::PERSONA-REGIMÉN:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  /*  async function listarPersonaRegimen() {
     setLoading(true);
     let hoy = new Date();
     let fecInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
     await listarPRegimen({
       IdCliente: perfil.IdCliente,
       IdDivision: perfil.IdDivision,
       IdRegimen: varIdRegimen,
       Filtro: JSON.stringify({
         FechaInicio: fecInicio,
         FechaFin: hoy,
       }),
       NumPagina: 0, TamPagina: 0
     }).then(regimen => {
       setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
       setListarTabs(regimen);
       setModoEdicion(false);
     }).catch(err => {
       handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
     }).finally(() => { setLoading(false); });
   } */

  async function listarPersonaRegimen() {
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    changeTabIndex(3);
    setModoEdicion(false);
    //setRefreshData(true);
  }


  async function obtenerPersonaRegimen(filtro) {
    setGrillaPersonaRegimen([]);
    //console.log("filtro:",filtro);
    const { IdCliente, IdDivision, IdPersona, IdRegimen, IdSecuencial } = filtro;
    if (IdCliente && IdDivision && IdPersona && IdRegimen) {
      let personaRegimen = await obtenerPRegimen({
        IdCliente: IdCliente,
        IdDivision: IdDivision,
        IdSecuencial,
        IdPersona: IdPersona,
        IdRegimen: IdRegimen

      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
      let persona = await buscarPersona({
        skip: "0",
        take: "100",
        sort: JSON.stringify([{ selector: "RowIndex", desc: false }]),
        filter: JSON.stringify([
          ["IdCliente", "=", perfil.IdCliente],
          "AND",
          ["IdPersona", "=", IdPersona],])
      });

      let { NombreCompleto, TipoDocumento, Documento, Activo } = persona.data[0];
      setGrillaPersonaRegimen([{ RowIndex: 1, IdPersona, NombreCompleto, TipoDocumento, Documento, Activo }]);
      setDataRowEditNew({ ...personaRegimen, esNuevoRegistro: false });
    }
  }

  async function agregarPersonaRegimen(personas) {
    let funcArray = [];
    let str_Ok = '';
    let str_Errores = '';
    let int_Errores = 0;
    for (let index = 0; index < personas.length; index++) {
      await registrarPersonaRegimenItem(personas[index]);
    }

    str_Ok = arr_mensajes.map(x => (x.Id == 0 ? x.Mensaje : "")).join('');
    str_Errores = arr_mensajes.map(x => (x.Id == 1 ? x.Mensaje : "")).join('');
    int_Errores = arr_mensajes.filter(x => x.Id == 1).length;

    // Evaluar si presenta errores
    if (int_Errores > 0) {
      if (int_Errores === 1) {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.ERROR" }), str_Errores, true);  //str_Errores 
      } else {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.ERROR" }), `No se pudo realizar el registro para ${int_Errores.toString()} personas.`, true);  //str_Errores  
      }
    } else {
      if (arr_mensajes.length === 1) {
        handleSuccessMessages(str_Ok);
      } else {
        handleSuccessMessages(intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.REGISTRATION" }));
      }
    }


    /* if (str_Errores.length > 1) {
      handleErrorMessages({ response: { data: str_Errores, status: 400 } });
    } */
    arr_mensajes = [];
    listarPersonaRegimen();
    setRefreshData(true);
  }



  const registrarPersonaRegimenItem = async (data) => {
    setLoading(true);
    const { IdPersona, FechaInicio, FechaFin, IdGuardia, Activo, NombreCompleto } = data;
    let params = {
      IdPersona: isNotEmpty(IdPersona) ? IdPersona : 0
      , IdRegimen: varIdRegimen
      , IdGuardia
      , FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : ""
      , FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : ""
      , Activo: Activo
      , IdCliente: perfil.IdCliente
      , IdDivision: perfil.IdDivision
      , IdUsuario: usuario.username
      , IdSecuencial: 0
    };
    await crearPRegimen(params).then(response => {
      // console.log("response : ",response);
      if (response) {

        let respuesta = intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" });
        arr_mensajes.push({ Id: 0, Mensaje: `${respuesta} - ${NombreCompleto}.\r\n` });

      } else {
        arr_mensajes.push({ Id: 1, Mensaje: `No se pudo registrar para la persona ${NombreCompleto}.\r\n` });
      }
    }).catch(err => {
      arr_mensajes.push({ Id: 1, Mensaje: `No se pudo registrar para la persona ${NombreCompleto}.\r\n` });
      //arr_mensajes.push({ Id: 1, Mensaje: `${err} - ${NombreCompleto}.\r\n` });
    }).finally(() => { setLoading(false); });
  };

  async function actualizarPersonaRegimen(personaRegimen) {
    setLoading(true);
    //debugger;
    const { IdRegimen, Regimen, IdPersona, IdGuardia, FechaInicio, FechaFin, Activo, IdSecuencial } = personaRegimen;
    let params = {
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdSecuencial,
      IdPersona,
      IdRegimen: isNotEmpty(IdRegimen) ? IdRegimen.toUpperCase() : "",
      IdGuardia: isNotEmpty(IdGuardia) ? IdGuardia.toUpperCase() : "",
      Regimen: isNotEmpty(Regimen) ? Regimen.toUpperCase() : "",
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : "",
      Activo: Activo,
      IdUsuario: usuario.username
    };

    await actualizarPRegimen(params)
      .then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        listarPersonaRegimen();
        setRefreshData(true);
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }


  async function eliminarPersonaRegimen(personaRegimen, confirm = false) {
    setSelected(personaRegimen);
    setIsVisibleConfirm(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdSecuencial, IdPersona } = personaRegimen;
      await eliminarPRegimen({
        IdCliente: IdCliente,
        //IdDivision: IdDivision,
        IdSecuencial,
        IdPersona: IdPersona,
        IdUsuario: usuario.username
      })
        .then(() => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
          listarPersonaRegimen();
          setRefreshData(true);
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });

    }
  }


  const nuevoRegistroPersonaRegimen = () => {
    let hoy = new Date();
    let fecInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    let fecFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
    fecFin = fecFin.setMinutes(-1);

    let nuevo = { Activo: "S", FechaInicio: fecInicio, FechaFin: fecFin };

    let currentUsers = dataSource._items;

    setDataRowEditNew({
      ...nuevo, esNuevoRegistro: true, currentUsers
    });
    setGrillaPersonaRegimen([]);
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);

  };

  const editarRegistroPersonaRegimen = dataRow => {
    const { RowIndex, IdPersona } = dataRow;
    setModoEdicion(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    //  obtenerPersonaRegimen(dataRow);
    setDataRowEditNew({
      ...dataRow, esNuevoRegistro: false
    })
    setFocusedRowKeyRegimen(RowIndex);
    setGridBoxValue([IdPersona]);
  };


  const cancelarEdicionRegimen = () => {
    setModoEdicion(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };


  const seleccionarRegistroPersonaRegimen = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKeyRegimen(RowIndex);
  };


  const cargaListaPersonasRegimen = async (filtro) => {
    setLoading(true);
    let personasRegimen = await listarPRegimen({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdRegimen: varIdRegimen,
      NumPagina: 0, TamPagina: 0,
      Filtro: JSON.stringify(filtro),
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    })
      .finally(() => { setLoading(false); });
    setListarTabs(personasRegimen);
  };

  //  ::::::::::::::::::::::::: Datos Principales ::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const cancelarEdicionTabs = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const changeTabIndex = (index) => { handleChange(null, index); }

  async function eliminarListRowTab(selected, confirm) {
    let currentTab = tabIndex;
    switch (currentTab) {
      case 0:
        eliminarRegistro(selected, confirm);
        break;
      case 2:
        eliminarRegimenGuardia(selected, confirm);
        break;
      case 3:
        eliminarPersonaRegimen(selected, confirm);
        break;
    }
  }

  useEffect(() => {
    loadControlsPermission();
  }, []);


  const getInfo = () => {
    const { IdRegimen, Regimen } = selected;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdRegimen, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ADMINISTRATION.REGIME" })], value: Regimen, colSpan: 4 }
    ];
  }



  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "ADMINISTRATION.REGIME.GUARD.TAB",
      "ADMINISTRATION.PERSON.REGIME.PERSON"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + "  " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdRegimen) ? false : true;
  }

  const tabContent_RegimenListPage = () => {
    return <RegimenListPage
      titulo={titulo}
      editarRegistro={editarRegistro}
      eliminarRegistro={eliminarRegistro}
      nuevoRegistro={nuevoRegistro}
      seleccionarRegistro={seleccionarRegistro}
      verRegistroDblClick={verRegistroDblClick}
      focusedRowKey={focusedRowKey}
      setFocusedRowKey={setFocusedRowKey}
      //::::::::::::::::::::::::::::::::::::::::
      isFirstDataLoad={isFirstDataLoad}
      setIsFirstDataLoad={setIsFirstDataLoad}
      dataSource={dataSource}
      refresh={refresh}
      resetLoadOptions={resetLoadOptions}
      refreshData={refreshData}
      setRefreshData={setRefreshData}
      showButtons={true}
      uniqueId={"regimentListRegimenIndexPage"}
      //::::::::::::::::::::::::::::::::::::::::
      setVarIdRegimen={setVarIdRegimen}
      totalRowIndex={totalRowIndex}
      setTotalRowIndex={setTotalRowIndex}
    />
  }


  const tabContent_RegimenEditPage = () => {
    return <>
      <RegimenEditPage
        titulo={titulo}
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        numeroGuardias={numeroGuardias}
        actualizar={actualizarRegimen}
        agregar={agregarRegimen}
        cancelarEdicion={cancelarEdicion}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}

      />
      <div className="container_only">
        <div className="float-right">
          <ControlSwitch
            checked={auditoriaSwitch}
            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
          /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
        </div>
      </div>
      {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
    </>
  }

  const tabContent_RegimenGuardiaListPage = () => {
    return <>
      {modoEdicion && (
        <>
          <RegimenGuardiaEditPage
            dataRowEditNew={dataRowEditNew}
            titulo={titulo}
            modoEdicion={modoEdicion}
            guardiaDias={guardiaDias}
            dataSourceDias={listarDias}
            setDataSourceDias={setListarDias}
            //diasTrabajo={diasTrabajo}
            //diasDescanso={diasDescanso}
            agregar={agregarRegimenGuardia}
            actualizar={actualizarRegimenGuardia}
            cancelarEdicion={cancelarEdicionTabs}
            listarGuardiaDia={listarGuardiaDia}
            accessButton={accessButton}
            settingDataField={dataMenu.datos}
          />

          <div className="container_only">
            <div className="float-right">
              <ControlSwitch checked={auditoriaSwitch}
                onChange={e => { setAuditoriaSwitch(e.target.checked) }}
              /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
            </div>
          </div>
          {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
        </>
      )}
      {!modoEdicion && (
        <>
          <RegimenGuardiaListPage
            modoEdicion={modoEdicion}
            regimenGuardia={listarTabs}
            editarRegistro={editarRegimenGuardia}
            eliminarRegistro={eliminarRegimenGuardia}
            nuevoRegistro={nuevoRegimenGuardia}
            cancelarEdicion={cancelarEdicion}
            seleccionarRegistro={seleccionarRegimenGuardia}
            focusedRowKey={focusedRowKeyRegimenGuardia}
            getInfo={getInfo}
            accessButton={accessButton}
          />
        </>
      )}
    </>
  }

  const tabContent_RegimenPersonaListPage = () => {
    return <>
      {modoEdicion && (
        <>
          <RegimenPersonaEditPage
            dataRowEditNew={dataRowEditNew}
            actualizarPersonaRegimen={actualizarPersonaRegimen}
            agregarPersonaRegimen={agregarPersonaRegimen}
            cancelarEdicion={cancelarEdicionRegimen}
            gridBoxValue={gridBoxValue}
            setGridBoxValue={setGridBoxValue}
            titulo={tituloTabs}
            grillaPersona={grillaPersonaRegimen}
            setGrillaPersona={setGrillaPersonaRegimen}
            getInfo={getInfo}
            modoEdicion={modoEdicion}
            accessButton={accessButton}
            settingDataField={dataMenu.datos}
            IdRegimenes={varIdRegimen}
          />

          <div className="container_only">
            <div className="float-right">
              <ControlSwitch checked={auditoriaSwitch}
                onChange={e => { setAuditoriaSwitch(e.target.checked) }}
              /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
            </div>
          </div>
          {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
        </>
      )}
      {!modoEdicion && (
        <>
          <RegimenPersonaListPage
            personasRegimen={listarTabs}
            editarRegistro={editarRegistroPersonaRegimen}
            eliminarRegistro={eliminarPersonaRegimen}
            cargaListaPersonasRegimen={cargaListaPersonasRegimen}
            nuevoRegistro={nuevoRegistroPersonaRegimen}
            cancelarEdicion={cancelarEdicion}
            seleccionarRegistro={seleccionarRegistroPersonaRegimen}
            focusedRowKey={focusedRowKeyRegimen}
            getInfo={getInfo}
            allowUpdating={false}
            accessButton={accessButton}

            //customerDataGrid
            showHeaderInformation={true}
            uniqueId={"regimenPersonasList"}
            isFirstDataLoad={isFirstDataLoad}
            setIsFirstDataLoad={setIsFirstDataLoad}
            dataSource={dataSource}
            refresh={refresh}
            resetLoadOptions={resetLoadOptions}
            refreshData={refreshData}
            setRefreshData={setRefreshData}
            selected={selected}
          />
        </>
      )}
    </>
  }

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "ADMINISTRATION.REGIME.PATHNAME" })}
        subtitle={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
            // onClick: () => { listarRegimen() },
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.REGIME.TAB" }),
            icon: <Assignment fontSize="large" />,
            onClick: (e) => { obtenerRegimen(selected) },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.REGIME.GUARD.TAB" }),
            icon: <Security fontSize="large" />,
            onClick: (e) => { listarRegimenGuardia() },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.PERSON" }),
            icon: <PeopleAltOutlinedIcon fontSize="large" />,
            //onClick: () => { listarPersonaRegimen() },
            disabled: !tabsDisabled() && accessButton.Tabs[3] ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_RegimenListPage(),
            tabContent_RegimenEditPage(),
            tabContent_RegimenGuardiaListPage(),
            tabContent_RegimenPersonaListPage()
          ]
        }
      />


      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisibleConfirm}
        setIsVisible={setIsVisibleConfirm}
        setInstance={setInstance}
        onConfirm={() => eliminarListRowTab(selected, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />
    </>
  );
};

export default injectIntl(WithLoandingPanel(RegimenIndexPage));
