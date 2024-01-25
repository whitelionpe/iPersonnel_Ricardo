import React, { useEffect, useState, useMemo } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";

import { useSelector } from "react-redux";
import { dateFormat, isNotEmpty } from "../../../../../_metronic";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import PanTool from '@material-ui/icons/PanTool';
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";
import BusinessIcon from "@material-ui/icons/Business";

//import HeaderInformation from "../../../../partials/components/HeaderInformation";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import GrupoListPage from "./GrupoListPage";
import GrupoEditPage from "./GrupoEditPage";

import { eliminar, obtener, listar, crear, actualizar } from "../../../../api/acceso/grupo.api";
import {
  listarPersona as listarGrupo,
  obtener as obtenerPGrupo,
  crear as crearGrupo,
  actualizar as actualizarPGrupo,
  eliminar as eliminarGrupo,
  eliminarMasivo,
} from "../../../../api/acceso/personaGrupo.api";

import { listar as listarHorarioDia } from "../../../../api/acceso/horarioDia.api";

import PersonaGruposListPage from "../persona/PersonaGruposListPage";
import PersonaGruposEditPage from "../persona/PersonaGruposEditPage";

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import GroupIcon from '@material-ui/icons/Group';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';

import GrupoRestriccionIndexPage from "./restriccion/GrupoRestriccionIndexPage";
import CompaniaIndexPage from "./compania/CompaniaIndexPage";
import { storeListar as buscarPersona } from "../../../../api/administracion/persona.api";

//-customerDataGrid Star
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

import GrupoPuertaIndexPage from "./puerta/GrupoPuertaIndexPage";

export const initialFilter = {
  IdCliente: "1",
  IdDivision: "",
  IdGrupo: "",
  Activo: "S",
};

const varFechaReferencia = "20200525"; //Fecha de referencia del calendario.

const GrupoIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [gridBoxValue, setGridBoxValue] = useState([]);

  //Datos Tree View
  const [varIdGrupo, setVarIdGrupo] = useState("");
  const [focusedRowKey, setFocusedRowKey] = useState();
  const [focusedRowKeyGrupo, setFocusedRowKeyGrupo] = useState();
  const [grupos, setGrupos] = useState([]);

  const [selected, setSelected] = useState({});

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [listarTabs, setListarTabs] = useState([]);
  const [dataDetalleHorarios, setDataDetalleHorarios] = useState([]);

  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);
  const [tabIndexMasivo, setTabIndexMasivo] = useState(0);
  const [resetChecksRows, setResetChecksRows] = useState([]);

  //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
  const [totalRowIndex, setTotalRowIndex] = useState(0);


  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };


  const [actionButton, setActionButton] = useState({
    save: false
  });


  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});
  const [grillaPersona, setGrillaPersona] = useState([]);
  let arr_mensajes = [];

  //FILTRO- CustomerDataGrid
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);

  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();

  // const [datosSeleccionados, setDatosSeleccionados] = useState([]);
  // const [listarPuertas, setListarPuertas] = useState([]);


  ///FUNCIONES PARA GESTIÓN GRUPO////////////////////////////////////////////////////////
  async function agregarGrupo(data) {
    setLoading(true);
    const { IdHorario, IdGrupo, Grupo, Activo, AsignarAContratoUnidadOrganizativa } = data;
    let param = {
      IdHorario: isNotEmpty(IdHorario) ? IdHorario.toUpperCase() : "",
      IdGrupo: isNotEmpty(IdGrupo) ? IdGrupo.toUpperCase() : "",
      Grupo: isNotEmpty(Grupo) ? Grupo.toUpperCase() : "",
      AsignarAContratoUnidadOrganizativa: AsignarAContratoUnidadOrganizativa,
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await crear(param)
      .then(response => {
        if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        setModoEdicion(false);
        listarGrupos();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }


  async function actualizarGrupo(grupo) {
    setLoading(true);
    const { IdHorario, IdGrupo, Grupo, Activo, AsignarAContratoUnidadOrganizativa } = grupo;
    let params = {
      IdHorario: isNotEmpty(IdHorario) ? IdHorario.toUpperCase() : "",
      IdGrupo: isNotEmpty(IdGrupo) ? IdGrupo.toUpperCase() : "",
      Grupo: isNotEmpty(Grupo) ? Grupo.toUpperCase() : "",
      AsignarAContratoUnidadOrganizativa: AsignarAContratoUnidadOrganizativa,
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await actualizar(params)
      .then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        setModoEdicion(false);
        listarGrupos();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }


  async function eliminarRegistro(grupo, confirm) {
    setSelected(grupo);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdGrupo, IdCliente, IdDivision } = grupo;
      await eliminar({
        IdGrupo: IdGrupo,
        IdCliente: IdCliente,
        IdDivision: IdDivision,
        IdUsuario: usuario.username
      })
        .then(response => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
      listarGrupos();
    }
  }


  async function eliminarPersonaGrupoMasivo(grupo, confirm) {
    setSelected(grupo);
    setIsVisible(true);
    setTabIndexMasivo(5)
    if (confirm) {
      setLoading(true);
      await eliminarMasivo({
        ListaPersonas: selected
      })
        .then(response => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });

      listarPersonaGrupo();
      setRefreshData(true);
      setResetChecksRows([])
    }
  }


  async function listarGrupos() {
    setLoading(true);
    await listar({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      NumPagina: 0,
      TamPagina: 0
    }).then(grupos => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setGrupos(grupos);
      changeTabIndex(0);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }


  async function obtenerGrupo(filtro) {
    setLoading(true);
    const { IdGrupo, IdCliente, IdDivision } = filtro;
    await obtener({
      IdGrupo: IdGrupo,
      IdCliente: IdCliente,
      IdDivision: IdDivision
    }).then(grupo => {
      setDataRowEditNew({ ...grupo, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }


  const nuevoRegistro = () => {
    changeTabIndex(1);
    let grupo = {
      Activo: "S",
      AsignarAContratoUnidadOrganizativa: "N",
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision
    };
    setDataRowEditNew({ ...grupo, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setActionButton({ save: true });
    setModoEdicion(true);
    setVarIdGrupo("");
  };


  const editarRegistro = dataRow => {
    changeTabIndex(1);
    const { IdGrupo } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setVarIdGrupo(IdGrupo);
    obtenerGrupo(dataRow);
  };


  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    setVarIdGrupo("");
  };


  const seleccionarRegistro = dataRow => {
    const { IdGrupo, Grupo, RowIndex } = dataRow;
    setModoEdicion(false);
    setSelected(dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));

    if (IdGrupo != varIdGrupo) {
      setVarIdGrupo(IdGrupo);
      setFocusedRowKey(RowIndex);
    }
  }

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerGrupo(dataRow);
  };

  const verDetalleHorario = async (dataRow) => {
    setSelected(dataRow);
    listar_HorarioDia()
  };

  //Datos Principales
  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  /************--Configuración de acceso de botones***********************/
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 6; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }




  const cancelarEdicionTabs = () => {
    setModoEdicion(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };


  //:::::::::::::::::::::::::::::::::::::::::::::-Funciones-Grupo-Persona-:::::::::::::::::::::::::::::::::


  async function listarPersonaGrupo() {
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    changeTabIndex(4);
    setModoEdicion(false);
    //setRefreshData(true);
  }


  async function obtenerPersonaGrupo(filtro) {
    setGrillaPersona([]);
    //console.log("filtro:",filtro);
    const { IdCliente, IdDivision, IdPersona, IdSecuencial } = filtro;
    if (IdCliente && IdDivision && IdPersona) {
      let personaRegimen = await obtenerPGrupo({
        IdCliente: IdCliente,
        IdDivision: IdDivision,
        IdSecuencial,
        IdPersona: IdPersona

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
      setGrillaPersona([{ RowIndex: 1, IdPersona, NombreCompleto, TipoDocumento, Documento, Activo }]);
      setDataRowEditNew({ ...personaRegimen, esNuevoRegistro: false });
    }
  }


  async function agregarPersonaGrupo(personas) {
    let funcArray = [];
    let str_Ok = '';
    let str_Errores = '';
    for (let index = 0; index < personas.length; index++) {
      await registrarPersonaGrupoItem(personas[index]);
    }
    str_Ok = arr_mensajes.map(x => (x.Id == 0 ? x.Mensaje : "")).join('');
    str_Errores = arr_mensajes.map(x => (x.Id == 1 ? x.Mensaje : "")).join('');

    if (arr_mensajes.length === 1) {
      handleSuccessMessages(str_Ok);
    } else {
      handleSuccessMessages(intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.REGISTRATION" }));
    }

    /* if (str_Errores.length > 1) {
      handleErrorMessages({ response: { data: str_Errores, status: 400 } });
    } */
    arr_mensajes = [];
    listarPersonaGrupo();
    setRefreshData(true);
  }


  const registrarPersonaGrupoItem = async (data) => {
    setLoading(true);
    const { IdPersona, FechaInicio, FechaFin, IdGrupo, Activo, NombreCompleto } = data;
    //console.log("registrarPersonaGrupoItem.data", data);
    let params = {
      IdPersona: isNotEmpty(IdPersona) ? IdPersona : 0
      , IdGrupo: varIdGrupo
      , FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : ""
      , FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : ""
      , Activo: Activo
      , IdCliente: perfil.IdCliente
      , IdDivision: perfil.IdDivision
      , IdUsuario: usuario.username
      , IdSecuencial: 0
    };
    // console.log("params>", params);
    await crearGrupo(params).then(response => {
      // console.log(response);
      if (response) {

        let respuesta = intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" });
        arr_mensajes.push({ Id: 0, Mensaje: `${respuesta} - ${NombreCompleto}.\r\n` });

      } else {
        arr_mensajes.push({ Id: 1, Mensaje: `No se pudo registrar para la persona ${NombreCompleto}.\r\n` });
      }
    }).catch(err => {
      //console.log(err);
      arr_mensajes.push({ Id: 1, Mensaje: `No se pudo registrar para la persona ${NombreCompleto}.\r\n` });
      //arr_mensajes.push({ Id: 1, Mensaje: `${err} - ${NombreCompleto}.\r\n` });
    }).finally(() => { setLoading(false); });
  };

  async function actualizarPersonaGrupo(dataRow) {
    setLoading(true);
    const { IdPersona, IdSecuencial, FechaInicio, FechaFin } = dataRow;
    let params = {
      IdPersona: isNotEmpty(IdPersona) ? IdPersona : "",
      IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0,
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : "",
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdGrupo: varIdGrupo,
      IdUsuario: usuario.username,
    };
    await actualizarPGrupo(params)
      .then(() => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
        );
        listarPersonaGrupo();
        setRefreshData(true);
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function eliminarPersonaGrupo(grupo, confirm) {

    if (confirm) {
      setLoading(true);
      const { IdCliente, IdDivision, IdSecuencial, IdPersona } = grupo;
      const { IdGrupo } = selected;
      await eliminarGrupo({
        IdCliente,
        IdDivision,
        IdSecuencial,
        IdGrupo,
        IdPersona,
        IdUsuario: usuario.username,
      })
        .then(() => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
      listarPersonaGrupo();
      setRefreshData(true);
    } else {
      let { Horario } = selected;
      setSelected({ ...grupo, Horario });
      setIsVisible(true);
    }
  }

  const nuevoPersonaGrupo = () => {
    let hoy = new Date();
    let fecInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    let fecFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
    //fecFin = fecFin.setMinutes(-1);

    let nuevo = { Activo: "S", FechaInicio: fecInicio, FechaFin: fecFin };

    let currentUsers = dataSource._items;

    setDataRowEditNew({
      ...nuevo, esNuevoRegistro: false, currentUsers
    });
    setGrillaPersona([]);
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);

  };


  const editarPersonaGrupo = dataRow => {
    const { RowIndex, IdPersona } = dataRow;
    setModoEdicion(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerPersonaGrupo(dataRow);
    setFocusedRowKeyGrupo(RowIndex);
    setGridBoxValue([IdPersona]);
  };


  const cancelarEdicionGrupo = () => {
    setModoEdicion(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const seleccionarPersonaGrupo = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKeyGrupo(RowIndex);
  };


  //::::::::::::::::::::::::::::::::::::::::-Listar HoraRio-::::::::::::::::::::::::::::::::::::::::::::::::::://

  async function listar_HorarioDia() {

    const { IdCliente, IdDivision, IdHorario } = selected;
    let horarioDia = await listarHorarioDia({ IdCliente, IdDivision, IdHorario, FechaReferencia: varFechaReferencia }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });
    //Construir data del calendario
    let sCheduler = [];
    horarioDia.map(data => {
      var x = new Date(data.HoraInicio);
      var y = new Date(data.HoraFin);
      let row = {
        text: data.Evento,
        startDate: new Date(x.getFullYear(), x.getMonth(), x.getDate(), x.getHours(), x.getMinutes()),
        endDate: new Date(y.getFullYear(), y.getMonth(), y.getDate(), y.getHours(), y.getMinutes()),
        IdHorario: data.IdHorario,
        Dia: data.Dia,
        Intervalo: data.Intervalo,
        allDay: data.TodoDia === 1 ? true : false
      };
      sCheduler.push(row);
    });
    setListarTabs(sCheduler);
    setDataDetalleHorarios(sCheduler);
    //console.log("listar_HorarioDia -> sCheduler: ", sCheduler);
    setModoEdicion(false);
  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const getInfo = () => {
    const { IdGrupo, Grupo, Horario } = selected;

    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdGrupo, colSpan: 1 },
      { text: [intl.formatMessage({ id: "ACCESS.GROUP" })], value: Grupo, colSpan: 3 },
      { text: [intl.formatMessage({ id: "ACCESS.GROUP.SCHEDULE" })], value: Horario, colSpan: 2 }
    ];

  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  async function eliminarListRowTab(selected, confirm) {
    let currentTab = tabIndexMasivo === 5 ? tabIndexMasivo : tabIndex;
    switch (currentTab) {
      case 0:
        eliminarRegistro(selected, confirm);
        break;
      // case 3:
      //   eliminarPersonaRestriccion(selected, confirm);
      //   break;
      case 4:
        eliminarPersonaGrupo(selected, confirm);
        break;
      case 5:
        eliminarPersonaGrupoMasivo(selected, confirm);
        break;
    }
  }
  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  useEffect(() => {
    listarGrupos();
    // obtener_Todos_Restriccion();
    loadControlsPermission();

  }, []);


  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "ACCESS.GROUP.DOOR",
      "ACCESS.PERSON.MENU.RESTRICTION",
      "CASINO.PERSON.GROUP.PERSON",
      "ADMINISTRATION.COMPANY.COMPANY"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdGrupo) ? false : true;
    //return true;
  }

  const tabContent_GrupoListPage = () => {

    return <GrupoListPage
      grupos={grupos}
      titulo={titulo}
      editarRegistro={editarRegistro}
      eliminarRegistro={eliminarRegistro}
      nuevoRegistro={nuevoRegistro}
      seleccionarRegistro={seleccionarRegistro}
      verRegistroDblClick={verRegistroDblClick}
      verDetalleHorario={verDetalleHorario}
      focusedRowKey={focusedRowKey}
      dataDetalleHorarios={dataDetalleHorarios}
      showButtons={false}
      getInfo={getInfo}
      accessButton={accessButton}
    />
  }


  const tabContent_GrupoEditPage = () => {
    return <>
      <GrupoEditPage
        titulo={titulo}
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        actualizarGrupo={actualizarGrupo}
        agregarGrupo={agregarGrupo}
        cancelarEdicion={cancelarEdicion}
        //para obtener id de horario
        idCliente={perfil.IdCliente}
        idDivision={perfil.IdDivision}

        accessButton={accessButton}
        settingDataField={dataMenu.datos}
      />
      <div className="container_only">
        <div className="float-right">
          <ControlSwitch
            checked={auditoriaSwitch}
            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
          /><b> {intl.formatMessage({ id: "AUDIT.DATA" })} </b>
        </div>
      </div>
      {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
    </>
  }

  const tabContent_GrupoPuertaPage = () => {
    return <>
      <GrupoPuertaIndexPage
        dataMenu={dataMenu}
        getInfo={getInfo}
        selected={selected}
        varIdGrupo={varIdGrupo}
        cancelarEdicion={cancelarEdicion}
      />

    </>
  }


  const tabContent_GrupoRestriccionListPage = () => {
    return <>

      <GrupoRestriccionIndexPage
        varIdGrupo={varIdGrupo}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
      />

    </>
  }

  const tabContent_PersonaGruposListPage = () => {
    return <>
      {modoEdicion && (
        <>
          <PersonaGruposEditPage
            dataRowEditNew={dataRowEditNew}
            actualizarPersonaGrupo={actualizarPersonaGrupo}
            agregarPersonaGrupo={agregarPersonaGrupo}
            cancelarEdicion={cancelarEdicionTabs}
            gridBoxValue={gridBoxValue}
            setGridBoxValue={setGridBoxValue}
            titulo={tituloTabs}

            getInfo={getInfo}
            grillaPersona={grillaPersona}
            setGrillaPersona={setGrillaPersona}
            modoEdicion={modoEdicion}
            settingDataField={dataMenu.datos}
          />
          <div className="container_only">
            <div className="float-right">
              <ControlSwitch
                checked={auditoriaSwitch}
                onChange={(e) => {
                  setAuditoriaSwitch(e.target.checked);
                }}
              />
              <b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
            </div>
          </div>
          {auditoriaSwitch && (
            <AuditoriaPage dataRowEditNew={dataRowEditNew} />
          )}
        </>
      )}
      {!modoEdicion && (
        <>
     
          <PersonaGruposListPage
            personaGrupos={listarTabs}
            editarRegistro={editarPersonaGrupo}

            eliminarRegistro={eliminarPersonaGrupo}
            eliminarRegistroMasivo={eliminarPersonaGrupoMasivo}


            nuevoRegistro={nuevoPersonaGrupo}
            cancelarEdicion={cancelarEdicion}

            getInfo={getInfo}

            allowUpdating={false}
            //customerDataGrid
            showHeaderInformation={true}
            uniqueId={"accesoGrupoPersonasList"}
            isFirstDataLoad={isFirstDataLoad}
            setIsFirstDataLoad={setIsFirstDataLoad}
            dataSource={dataSource}
            refresh={refresh}
            resetLoadOptions={resetLoadOptions}
            refreshData={refreshData}
            setRefreshData={setRefreshData}

            //ADD
            seleccionarRegistro={seleccionarPersonaGrupo}
            focusedRowKey={focusedRowKeyGrupo}
            setFocusedRowKey={setFocusedRowKeyGrupo}
            selected={selected}



            totalRowIndex={totalRowIndex}
            setTotalRowIndex={setTotalRowIndex}

          />
        </>
      )}
    </>
  }

  const tabContent_GrupoCompaniaIndexPage = () => {
    return <>

      <CompaniaIndexPage
        selectedIndex={selected}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
      />

    </>
  }


  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>

      <TabNavContainer
        title={intl.formatMessage({ id: "ACCES.GROUP.PATHNAME" })}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />
          },
          {
            label: intl.formatMessage({ id: "ACCESS.GROUP" }),
            icon: <GroupIcon fontSize="large" />,
            onClick: (e) => {
              setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
              obtenerGrupo(selected)
            },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "ACCESS.GROUP.DOOR" }),
            icon: <MeetingRoomIcon fontSize="large" />,
            // onClick: (e) => { listarTreeView() },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ACCESS.PERSON.MENU.RESTRICTION" }),
            icon: <PanTool fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[3] ? false : true
          },
          {
            label: intl.formatMessage({ id: "CASINO.PERSON.GROUP.PERSON" }),
            icon: <PeopleAltOutlinedIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[4] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }),
            icon: <BusinessIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[5] ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_GrupoListPage(),
            tabContent_GrupoEditPage(),
            tabContent_GrupoPuertaPage(),
            tabContent_GrupoRestriccionListPage(),
            tabContent_PersonaGruposListPage(),
            tabContent_GrupoCompaniaIndexPage()
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
    </>
  );
};

export default injectIntl(WithLoandingPanel(GrupoIndexPage));
