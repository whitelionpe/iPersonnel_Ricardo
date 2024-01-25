import React, { useEffect, useState } from "react";
import { handleErrorMessages, handleSuccessMessages,handleInfoMessages, confirmAction } from "../../../../store/ducks/notify-messages";

import { useSelector } from "react-redux";
import { dateFormat, isNotEmpty } from "../../../../../_metronic";
import { service } from "../../../../api/transporte/programacion.api";
import { service as serviceTipoProgramacion } from "../../../../api/transporte/tipoProgramacion.api";

import ProgramacionListPage from "./ProgramacionListPage";
import ProgramacionEditPage from "./ProgramacionEditPage";

import ManifiestoListPage from "../manifiesto/ManifiestoListPage";
import ProgramacionPasajeroListPage from "../programacionPasajero/ProgramacionPasajeroListPage";


import {  useStylesTab } from "../../../../store/config/Styles";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { injectIntl } from "react-intl";

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'

import ScheduleIcon from '@material-ui/icons/Schedule';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import AirportShuttle from '@material-ui/icons/AirportShuttle';
import ListAlt from '@material-ui/icons/ListAlt';

export const initialFilter = {
  Activo: 'S',
  IdCliente:'1',
  FechaProgramadaDesde: Date(),
};

const ProgramacionIndexPage = (props) => {
  const usuario = useSelector(state => state.auth.user);
  const { intl, setLoading, dataMenu } = props;

  const classes = useStylesTab();

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [varIdProgramacion, setVarIdProgramacion] = useState("");
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [selected, setSelected] = useState({});

  const handleChange = (event, newValue) => { setTabIndex(newValue); };
  const [focusedRowKey, setFocusedRowKey] = useState();
  const [focusedRowKeyManifiesto, setFocusedRowKeyManifiesto] = useState();
  const [focusedRowKeyManifiestoDetalle, setFocusedRowKeyManifiestoDetalle] = useState();
    //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
    const [totalRowIndex, setTotalRowIndex] = useState(0);

    //::::::::::::::::::::: FILTRO ::::::::::::::::::::::::::::::::
    const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
    const [refreshData, setRefreshData] = useState(false);
    const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
    const [dataSource] = useState(ds);
  
    const refresh = () => dataSource.refresh();
    const resetLoadOptions = () => dataSource.resetLoadOptions();

    const [tipoProgramacionData, setTipoProgramacionData] = useState([]);

   //:::::::::::::::::::::  ::::::::::::::::::::::::::::::::

  const configurarRutaParadero = () => {
    changeTabIndex(2);
    setModoEdicion(true);
  }

  const seleccionarRegistro = data => {
    const { IdProgramacion, RowIndex } = data;
    setSelected(data);
    setFocusedRowKey(RowIndex);
    setVarIdProgramacion(IdProgramacion);
  }

   const verRegistroDblClick = async () => {
     changeTabIndex(1);
     setModoEdicion(false);
     await obtenerProgramacion();
   };

  async function agregarProgramacion(dataRow) {
    setLoading(true);
    const { IdProgramacion, FechaProgramacion, IdRuta, IdTipoProgramacion,Activo } = dataRow;
    await service.crear({
      IdProgramacion:IdProgramacion,
      FechaProgramacion :dateFormat(FechaProgramacion, "yyyyMMdd hh:mm"),
      IdRuta : isNotEmpty(IdRuta) ? IdRuta.toUpperCase() : "",
      IdTipoProgramacion : isNotEmpty(IdTipoProgramacion) ? IdTipoProgramacion.toUpperCase() : "",
      Activo: isNotEmpty(Activo) ? Activo.toUpperCase() : "S",
      IdUsuario : usuario.username
    }
    ).then(response => {
       if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
       listarProgramaciones();
      }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    });
    setModoEdicion(false);
    setLoading(false);
  }

  async function actualizarProgramacion(dataRow) {
    setLoading(true);
    const { IdProgramacion, FechaProgramacion, IdRuta, IdTipoProgramacion,Activo } = dataRow;
    await service.actualizar(
      {
        IdProgramacion:IdProgramacion,
        FechaProgramacion :dateFormat(FechaProgramacion, "yyyyMMdd hh:mm"),
        IdRuta : IdRuta.toUpperCase(),
        IdTipoProgramacion : IdTipoProgramacion.toUpperCase(),
        Activo: Activo,
        IdUsuario : usuario.username
      }
    ).then(response => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarProgramaciones();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    });
    setLoading(false);
  }

  async function eliminarRegistro(dataRow) {
    var response = await confirmAction(intl.formatMessage({ id: "ALERT.REMOVE" }),intl.formatMessage({ id: "COMMON.YES" }),intl.formatMessage({ id: "COMMON.NOT" }));
    if(response.isConfirmed){
      const { IdProgramacion } = dataRow;
      await service.eliminar({IdProgramacion}).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        setVarIdProgramacion("");
        setFocusedRowKey();
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      });
     
    }
    listarProgramaciones();
  }

  async function listarProgramaciones() {
    changeTabIndex(0);
    setRefreshData(true);
  }

   async function obtenerProgramacion() {
     setLoading(true);
     const { IdProgramacion,IdRuta } = selected;
     setDataRowEditNew({esNuevoRegistro: false, IdRuta:IdRuta, IdProgramacion:IdProgramacion});
     await service.obtener({
      IdProgramacion
     }).then(data => {
       setDataRowEditNew({});
       setDataRowEditNew({ ...data, esNuevoRegistro: false ,ReadOnly :false });
     }).catch(err => {
       handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
     }).finally(() => { setLoading(false); });

   }


  async function nuevoRegistro() {
    let rutas = { Activo: "S" , IdProgramacion: intl.formatMessage({ id: "COMMON.CODE.AUTO" }).toUpperCase() };
    setDataRowEditNew({...rutas, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    changeTabIndex(1);
  };

 
  const editarRegistro = async () => {
    await obtenerProgramacion();
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setModoEdicion(true);
    changeTabIndex(1);
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    changeTabIndex(0);
    seleccionarRegistro(selected);
  };


  async function listar_TipoProgramacion() {
    let data = await serviceTipoProgramacion.obtenerTodos({
      IdTipoProgramacion : '%'
    });
    if (data != undefined) setTipoProgramacionData(data);
  }

  // ---------------------------
  // Manifiesto 
  const seleccionarRegistroManifiesto = data => {
     const { RowIndex } = data;
    setFocusedRowKeyManifiesto(RowIndex);
  }

  const verRegistroDblClickManifiesto =  () => {
   return;
  };

  // ---------------------------
  // Manifiesto  Detalle
  const seleccionarRegistroManifiestoDetalle = data => {
    const { RowIndex } = data;
    setFocusedRowKeyManifiestoDetalle(RowIndex);
 }

 

const getInfo = () => {
  const { IdProgramacion, Ruta, Fecha, Hora, Origen, Destino } = selected;
  return [
    { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdProgramacion, colSpan: 1 },
    { text: [intl.formatMessage({ id: "TRANSPORTE.ROUTE" })], value: Ruta, colSpan: 1 },
    { text: [intl.formatMessage({ id: "CASINO.PERSON.GROUP.DATE" })], value: Fecha, colSpan: 1 },
    { text: [intl.formatMessage({ id: "ACCESS.PERSON.MARK.HOUR" })], value: Hora, colSpan: 1 },
    { text: [intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS.ORIGEN" })], value: Origen, colSpan: 1 },
    { text: [intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS.DESTINO" })], value: Destino, colSpan: 1 },
  ];
}

   //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
   const [accessButton, setAccessButton] = useState(defaultPermissions);

   const loadControlsPermission = () => {
     const numeroTabs = 3;
     let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
     let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
     setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
   }

   const changeTabIndex = (index) => {
    handleChange(null, index);
  }

   const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "",
      "",
    ];
    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";
    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }

  const tabsDisabled = () => {
    return isNotEmpty(varIdProgramacion) ? true : false;
  }

  useEffect(() => {
    loadControlsPermission();
    listar_TipoProgramacion();
  }, []);

  const tabContent_ProgramacionListPage = () => {
    return <>
      <ProgramacionListPage
        editarRegistro={editarRegistro}
        eliminarRegistro={eliminarRegistro}
        nuevoRegistro={nuevoRegistro}
        seleccionarRegistro={seleccionarRegistro}
        verRegistroDblClick={verRegistroDblClick}
        focusedRowKey={focusedRowKey}
        setFocusedRowKey={setFocusedRowKey}
        //--------------------------------------
        isFirstDataLoad={isFirstDataLoad}
        setIsFirstDataLoad={setIsFirstDataLoad}
        dataSource={dataSource}
        refresh={refresh}
        resetLoadOptions={resetLoadOptions}
        refreshData={refreshData}
        setRefreshData={setRefreshData}
        showButtons={true}
        setVarIdProgramacion={setVarIdProgramacion}
        totalRowIndex = {totalRowIndex}
        setTotalRowIndex={setTotalRowIndex}
      />
    </>
  }

  const tabContent_ProgramacionEditPage = () => {
    return <>
        <ProgramacionEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarProgramacion={actualizarProgramacion}
          agregarProgramacion={agregarProgramacion}
          cancelarEdicion={cancelarEdicion}
          titulo={titulo}
          varIdProgramacion={varIdProgramacion}
          accessButton = {accessButton}
          settingDataField={dataMenu.datos}
          tipoProgramacionData = {tipoProgramacionData}
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

   const tabContent_ManifiestoListPage = () => {
     return <>
        <ManifiestoListPage
        titulo={titulo}
        // editarRegistro={editarRegistro}
        // eliminarRegistro={eliminarRegistro}
        // nuevoRegistro={nuevoRegistro}
        seleccionarRegistro={seleccionarRegistroManifiesto}
        verRegistroDblClick={verRegistroDblClickManifiesto}
        // configurarRutaParadero={configurarRutaParadero}
        focusedRowKey={focusedRowKeyManifiesto}
        isFirstDataLoad={isFirstDataLoad}
        setIsFirstDataLoad={setIsFirstDataLoad}
        dataSource={dataSource}
        refresh={refresh}
        resetLoadOptions={resetLoadOptions}
        refreshData={refreshData}
        setRefreshData={setRefreshData}
        showButtons={false}
        selected={selected}
        uniqueId ={"ManifiestoListPage2"}
        getInfo ={getInfo}
        showHeaderInformation ={true}
      />
     </>
   }


   const tabContent_ProgramacionPasajeroListPage = () => {
    return <>
       <ProgramacionPasajeroListPage
       titulo={titulo}
       seleccionarRegistro={seleccionarRegistroManifiestoDetalle}
       focusedRowKey={focusedRowKeyManifiestoDetalle}
       cancelarEdicion={cancelarEdicion}
       selected={selected}
       isFirstDataLoad={isFirstDataLoad}
       setIsFirstDataLoad={setIsFirstDataLoad}
       dataSource={dataSource}
       refresh={refresh}
       resetLoadOptions={resetLoadOptions}
       refreshData={refreshData}
       setRefreshData={setRefreshData}
       showButtons={false}
       uniqueId ={"ProgramacionPasajeroListPage1"}
       getInfo ={getInfo}
     />

    </>
  }

  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "TRANSPORT.MAIN" })}
        submenu={intl.formatMessage({ id: "CONFIG.MENU.TRANSPORTE.GESTIÓN" })}
        subtitle={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}        
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
          },
           {
             label: intl.formatMessage({ id: "CONFIG.MENU.TRANSPORTE.PROGRAMACIÓN" }),
             icon: <ScheduleIcon fontSize="large" />,
             onClick: () => { obtenerProgramacion() },
             disabled: !tabsDisabled()
           },
            {
             label: intl.formatMessage({ id: "CONFIG.MENU.TRANSPORTE.MANIFIESTO" }),
             icon: <AirportShuttle fontSize="large" />,
             onClick: () => { setModoEdicion(false) },
             disabled: !tabsDisabled()
           },
           {
            label: intl.formatMessage({ id: "CAMP.PROFILE.ASSIGNMENT" }),
            icon: <ListAlt fontSize="large" />,
            onClick: () => { setModoEdicion(false) },
            disabled: !tabsDisabled()
          }             
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_ProgramacionListPage(),
            tabContent_ProgramacionEditPage(),
            tabContent_ManifiestoListPage(),
            tabContent_ProgramacionPasajeroListPage(),
          ]
        }
      />

    </>
  );

};

export default injectIntl(WithLoandingPanel(ProgramacionIndexPage));
