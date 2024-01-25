import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { dateFormat, isNotEmpty } from "../../../../../_metronic";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import { serviceGrupo } from "../../../../api/asistencia/grupo.api";

import GrupoListPage from "./GrupoListPage";
import GrupoEditPage from "./GrupoEditPage";
import GrupoZonaEquipoIndexPage from "./equipo/GrupoZonaEquipoIndexPage";

import { useStylesTab } from "../../../../store/config/Styles";
import { serviceCompania } from "../../../../api/administracion/compania.api";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import GroupWorkSharpIcon from '@material-ui/icons/GroupWorkSharp';
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom'; 
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";
import GrupoPersonaEditPage from "./persona/GrupoPersonaEditPage";
import GrupoPersonaListPage from "./persona/GrupoPersonaListPage";
import DataSource from "devextreme/data/data_source";
import ArrayStore from "devextreme/data/array_store";

import {
  // listarPersona as listarGrupo,
  // obtener as obtenerPGrupo,
  // crear as crearGrupo,
  servicePersonaGrupo
  // actualizar as actualizarPGrupo,
  // eliminar as eliminarGrupo,
  // eliminarMasivo,
} from "../../../../api/asistencia/personaGrupo.api";




const GrupoIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const [grupo, setGrupo] = useState([]);
  const [focusedRowKey, setFocusedRowKey] = useState(0);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [listarTabs, setListarTabs] = useState([]);
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.LIST" }));

  const [varIdGrupo, setVarIdGrupo] = useState("");
  const [selected, setSelected] = useState({});
  const [selectedCompany, setSelectedCompany] = useState({});

  const [focusedRowKeyGrupo, setFocusedRowKeyGrupo] = useState();
  const [selectedGrupo, setSelectedGrupo] = useState({});

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});

  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };
  const [companiaData, setCompaniaData] = useState([]);
  const [varIdCompania, setVarIdCompania] = useState("");

  //FILTRO- CustomerDataGrid
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);
  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();
  //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
  const [totalRowIndex, setTotalRowIndex] = useState(0);

  const [resetChecksRows, setResetChecksRows] = useState([]);
  const [tabIndexMasivo, setTabIndexMasivo] = useState(0);
  const [grillaPersona, setGrillaPersona] = useState([]);
  let arr_mensajes = [];


  async function agregarGrupo(datarow) {
    setLoading(true);
    const { IdGrupo, Grupo, Activo } = datarow;
    let data = {
      IdCliente: IdCliente
      , IdCompania: varIdCompania
      , IdGrupo: isNotEmpty(IdGrupo) ? IdGrupo.toUpperCase() : ""
      , Grupo: isNotEmpty(Grupo) ? Grupo.toUpperCase() : ""
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await serviceGrupo.crear(data).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }),
        intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      listarGrupo(varIdCompania);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
    }).finally(() => { setLoading(false); });
  }


  async function actualizarGrupo(datarow) {
    setLoading(true);
    const { IdGrupo, Grupo, Activo } = datarow;
    let data = {
      IdCliente: IdCliente
      , IdCompania: varIdCompania
      , IdGrupo: isNotEmpty(IdGrupo) ? IdGrupo.toUpperCase() : ""
      , Grupo: isNotEmpty(Grupo) ? Grupo.toUpperCase() : ""
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await serviceGrupo.actualizar(data).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }),
        intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarGrupo(varIdCompania);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarListRowTab(selected, confirm) { 
    let currentTab = tabIndexMasivo === 5 ? tabIndexMasivo : tabIndex;
    switch (currentTab) {
      case 0:
        eliminarRegistro(selected, confirm);
        break; 
      case 3:
        eliminarPersonaGrupo(selected, confirm);
        break;
      case 5:
        eliminarPersonaGrupoMasivo(selected, confirm);
        break;
    }
  }

  async function eliminarRegistro(data, confirm) {
    setSelected(data);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdCompania, IdGrupo } = selected;
      await serviceGrupo.eliminar({
        IdCliente: IdCliente,
        IdCompania: IdCompania,
        IdGrupo: IdGrupo,
        IdUsuario: usuario.username
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        listarGrupo(varIdCompania);
        setFocusedRowKey();
        setVarIdGrupo("");
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    }
  }

  async function listarGrupo(idCompania) {
    setLoading(true);
    await serviceGrupo.listar(
      {
        IdCliente
        , IdCompania: idCompania
        , IdGrupo: '%'
        , NumPagina: 0
        , TamPagina: 0
      }
    ).then(data => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setGrupo(data);
      changeTabIndex(0);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function obtenergrupo() {
    const { IdCliente, IdCompania, IdGrupo } = selected;
    setLoading(true);
    await serviceGrupo.obtener({
      IdCliente,
      IdCompania,
      IdGrupo
    }).then(data => {
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  const nuevoRegistro = () => {
    changeTabIndex(1);
    let data = { Activo: "S", IdCompania: varIdCompania };
    setDataRowEditNew({ ...data, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };


  const editarRegistro = dataRow => {
    changeTabIndex(1);
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenergrupo();
  };


  const cancelarEdicionGrupo = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };


  const seleccionarRegistro = dataRow => { 
    const { IdGrupo, RowIndex } = dataRow;
    setModoEdicion(false);
    setSelected(dataRow);
    setSelectedGrupo(dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    setVarIdGrupo(IdGrupo);
    setFocusedRowKey(RowIndex);
  }

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(true);
    await obtenergrupo();
  };



  //ZONA EQUIPO:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


  const nuevoZonaEquipo = (dataRow) => {
    const { IdCliente, IdCompania, IdGrupo } = dataRow;
    setDataRowEditNew({
      IdCliente: IdCliente,
      IdDivision: IdDivision,
      IdCompania: IdCompania,
      IdGrupo: IdGrupo,
      Activo: 'S',
      esNuevoRegistro: true
    });
    //setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    //setModoEdicion(true);
    //setModoEdicionZonaEquipo(true);
  };


  async function listarCompanias() {
    let data = await serviceCompania.obtenerTodosConfiguracion({
      IdCliente: IdCliente,
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdConfiguracion: "ID_COMPANIA"
    }
    ).catch(err => { handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err) });
    setCompaniaData(data);
  }


  const getInfo = () => {
    const { IdCompania, Compania } = selectedCompany;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdCompania, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" })], value: Compania, colSpan: 4 }
    ];
  }

  const getInfoGrupo = () => {
    const { IdCompania, Grupo } = selectedGrupo;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdCompania, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ACCESS.PERSON.GRUPO" })], value: Grupo, colSpan: 2 }
    ];
  }

  const getInfoGrupoPersona = () => {
    const { IdGrupo, Grupo } = selectedGrupo;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdGrupo, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ACCESS.PERSON.GRUPO" })], value: Grupo, colSpan: 2 }
    ];
  }


  //GRUPO PERSONA - FUNCIONES :::::::::::::::::::::::::::::::::

  async function listarPersonaGrupo() {
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    changeTabIndex(3);
    setModoEdicion(false);
    //setRefreshData(true);
  }

  const cancelarEdicionTabs = () => {
    setModoEdicion(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const seleccionarPersonaGrupo = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKeyGrupo(RowIndex);
  };


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
      , IdCompania: varIdCompania
      // , FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : ""
      // , FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : ""
      , Activo: Activo
      , IdCliente: perfil.IdCliente
      , IdDivision: perfil.IdDivision
      , IdUsuario: usuario.username
      // , IdSecuencial: 0
    };
    // console.log("params>", params);
    await servicePersonaGrupo.crear(params).then(response => {
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
      // IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0,
      // FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : "",
      // FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : "",
      IdCompania:varIdCompania,
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdGrupo: varIdGrupo,
      IdUsuario: usuario.username,
    };
    await servicePersonaGrupo.actualizar(params)
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
      const { IdCliente,  IdCompania, IdPersona } = grupo;
      const { IdGrupo } = selected;
      await servicePersonaGrupo.eliminar({
        IdCliente, 
        IdCompania,
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

  async function eliminarPersonaGrupoMasivo(grupo, confirm) {  
    setSelected(grupo);
    setIsVisible(true);
    setTabIndexMasivo(5)
    if (confirm) {
      setLoading(true);
      await servicePersonaGrupo.eliminarMasivo({
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


  const nuevoPersonaGrupo = () => {
    // let hoy = new Date();
    // let fecInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    // let fecFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
    //fecFin = fecFin.setMinutes(-1);

    let nuevo = { Activo: "S", IdCompania: varIdCompania };

    let currentUsers = dataSource._items;

    setDataRowEditNew({
      ...nuevo, esNuevoRegistro: false, currentUsers
    });
    setGrillaPersona([]);
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);

  };

  /************--Configuración de acceso de botones***********************/

  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 3;
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }


  const changeValueCompany = (company) => {
    if (isNotEmpty(company)) {
      const { IdCompania } = company;
      setSelectedCompany(company);
      setVarIdCompania(IdCompania);
      listarGrupo(IdCompania);
      setVarIdGrupo("");
    } else {
      setSelectedCompany("");
      setVarIdCompania("");
      setGrupo([]);
    }
  }

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  useEffect(() => {
    listarCompanias();
    loadControlsPermission();
  }, []);


  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "ACCESS.GROUP.DEVICES",
      "ACCESS.REPORT.PEOPLE"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }

  const tabsDisabled = () => {
    return (isNotEmpty(varIdGrupo) && isNotEmpty(varIdGrupo)) ? true : false;
  }


  const tabContent_GrupoListPage = () => {
    return <GrupoListPage
      grupoData={grupo}
      editarRegistro={editarRegistro}
      eliminarRegistro={eliminarRegistro}
      nuevoRegistro={nuevoRegistro}
      seleccionarRegistro={seleccionarRegistro}
      focusedRowKey={focusedRowKey}
      nuevoZonaEquipo={nuevoZonaEquipo}
      accessButton={accessButton}
      settingDataField={dataMenu.datos}
      companiaData={companiaData}
      changeValueCompany={changeValueCompany}
      verRegistroDblClick={verRegistroDblClick}
      varIdCompania={varIdCompania}
      setVarIdCompania={setVarIdCompania}
      setFocusedRowKey={setFocusedRowKey}
    />

  }

  const tabContent_GrupoEditTabPage = () => {
    return <>
      <GrupoEditPage
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        actualizarGrupo={actualizarGrupo}
        agregarGrupo={agregarGrupo}
        cancelarEdicion={cancelarEdicionGrupo}
        titulo={titulo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        varIdCompania={varIdCompania}
        getInfo={getInfo}
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

  const tabContent_GrupoZonaEquipoIndexPage = () => {
    return <>

      <GrupoZonaEquipoIndexPage
        dataMenu={dataMenu}
        getInfo={getInfoGrupo}
        selected={selected}
        varIdGrupo={varIdGrupo}
        varIdCompania={varIdCompania}
        cancelarEdicion={cancelarEdicionGrupo}
      />
    </>
  }

  const tabContent_GrupoPersonasListPage = () => {
    return <>

      {modoEdicion && (
        <>
          <GrupoPersonaEditPage
            dataRowEditNew={dataRowEditNew}
            actualizarPersonaGrupo={actualizarPersonaGrupo}
            agregarPersonaGrupo={agregarPersonaGrupo}
            cancelarEdicion={cancelarEdicionTabs}
            // gridBoxValue={gridBoxValue}
            // setGridBoxValue={setGridBoxValue}
            titulo={titulo}

            getInfo={getInfoGrupoPersona}
            grillaPersona={grillaPersona}
            setGrillaPersona={setGrillaPersona}
            modoEdicion={modoEdicion}
            settingDataField={dataMenu.datos}
          />
        </>
      )}

      {!modoEdicion && (
        <GrupoPersonaListPage
          personaGrupos={listarTabs}
          // editarRegistro={editarPersonaGrupo}

          eliminarRegistro={eliminarPersonaGrupo}
          eliminarRegistroMasivo={eliminarPersonaGrupoMasivo}


          nuevoRegistro={nuevoPersonaGrupo}
          cancelarEdicion={cancelarEdicionGrupo}

          getInfo={getInfoGrupoPersona}

          allowUpdating={false}
          //customerDataGrid
          showHeaderInformation={true}
          uniqueId={"asistenciaGrupoPersonasList"}
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
      )}


    </>
  }


  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "ASSISTANCE.MAIN" })}
        submenu={intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.CONFIGURACIÓN" })}
        subtitle={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />
          },
          {
            label: intl.formatMessage({ id: "ACCESS.PERSON.GRUPO" }),
            icon: <GroupWorkSharpIcon fontSize="large" />,
            onClick: (e) => {
              setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
              obtenergrupo()
            },
            disabled: !tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "ACCESS.R001.INTERVALCONSULTATION.CHECK.POINT" }),
            icon: <MeetingRoomIcon fontSize="large" />,
            disabled: !tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.PERSONS" }),
            icon: <PeopleAltOutlinedIcon fontSize="large" />,
            disabled: !tabsDisabled()
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_GrupoListPage(),
            tabContent_GrupoEditTabPage(),
            tabContent_GrupoZonaEquipoIndexPage(),
            tabContent_GrupoPersonasListPage()
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
