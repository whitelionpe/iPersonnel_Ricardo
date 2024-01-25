import React, { useEffect, useState, Fragment } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages, handleWarningMessages } from "../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import HotelIcon from '@material-ui/icons/Hotel';
import LocalMallOutlinedIcon from '@material-ui/icons/LocalMallOutlined';
import AirlineSeatFlatAngled from "@material-ui/icons/AirlineSeatFlatAngled";

import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

import { dateFormat, isNotEmpty } from "../../../../../_metronic";

import HabitacionExclusivaEditPage from './HabitacionExclusivaEditPage';
import HabitacionExclusivaListPage from './HabitacionExclusivaListPage';
import HabitacionListPage from "./HabitacionListPage";
import { servicePersona } from "../../../../api/administracion/persona.api";

import {
  crear ,
  actualizar ,
  obtener ,
  eliminar ,
  listar,
} from "../../../../api/campamento/habitacionExclusiva.api";

import {
   listar as listarCampHabitacion
} from "../../../../api/campamento/habitacion.api";

import {
  obtener as obtenerConfigM
} from "../../../../api/sistema/configuracionModulo.api";


export const initialFilter = {
  Activo: 'S',
  IdCliente: '1',
  IdDivision: '',
  MostrarCamaExclusiva: "N"
};

const HabitacionExclusivaIndexPage = (props) => {
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);
  const { intl, setLoading, dataMenu } = props;

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [focusedRowKey, setFocusedRowKey] = useState();

  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);

  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [modoEdicion, setModoEdicion] = useState(false);

  const [selected, setSelected] = useState({});

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

 // limpio
  const [focusedRowKeyHabitacion, setFocusedRowKeyHabitacion] = useState();
  const [varIdHabitacion, setVarIdHabitacion] = useState("");
  const [selectedDelete, setSelectedDelete] = useState({});
  const [listarTabs, setListarTabs] = useState([]);
  const [campamentosHabitacion, setCampamentosHabitacion] = useState([]);
  const [maxPersonasPorCama, setMaxPersonasPorCama] = useState(0);
  const [fechasContrato, setFechasContrato] = useState({FechaInicioContrato:null,FechaFinContrato:null});
  const [disabledSave, setDisabledSave] = useState(false);
  //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
  const [totalRowIndex, setTotalRowIndex] = useState(0);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };
  //FILTRO
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();
  //----------------------------------------------------------

  /***Configuración Tabs*************************************** */
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 2; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  //:::::::::::::::::::::::::::::::::: :::::::: Funciones Habitacion ::::::::::::::::::::::::::::::::::::::::::::::::
  async function listarCampamentoHabitacion() {
    setLoading(true);
    setModoEdicion(false);
    await listarCampHabitacion({
      IdCliente,
      IdDivision,
      IdCampamento: '%',
      IdModulo: '%',
      NumPagina: 0,
      TamPagina: 0
    }).then(campamentosHabitacion => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setCampamentosHabitacion(campamentosHabitacion);
      setRefreshData(true);

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const seleccionarRegistroHabitacion = dataRow => {
    const { IdHabitacion, RowIndex } = dataRow;
    setFocusedRowKeyHabitacion(RowIndex);
    setVarIdHabitacion(IdHabitacion);
    setSelected(dataRow);
  }

  //::::::::::::::::::::::::::::::::: Funciones Habitacion Exclusiva :::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function listarHabitacionExclusiva() {
    setLoading(true);
    await listar({
      IdCliente :IdCliente ,
      IdPersona :0 ,
      IdHabitacion : varIdHabitacion,
      NumPagina: 0,
      TamPagina: 0
    }).then(data => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(data);
      setModoEdicion(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function agregarHabitacionExclusiva(dataHabitacionExclusiva) {
    setLoading(true);
    let { FechaInicio, FechaFin, Activo, IdPersona } = dataHabitacionExclusiva;
    let { IdCampamento, IdModulo, IdHabitacion, CantidadCamasAsignadas} = selected;

    let params = {
        IdCliente: IdCliente
      , IdPersona : IdPersona
      , IdSecuencial: 0
      , IdCampamento: isNotEmpty(IdCampamento) ? IdCampamento : ""
      , IdDivision: IdDivision
      , IdModulo: isNotEmpty(IdModulo) ? IdModulo : ""
      , IdHabitacion: isNotEmpty(IdHabitacion) ? IdHabitacion : ""
      , FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd')
      , FechaFin: dateFormat(FechaFin, 'yyyyMMdd')
      , Activo: Activo
      , IdUsuario: usuario.username
      , MaxPersonasPorCama : CantidadCamasAsignadas * maxPersonasPorCama
    };
    await crear(params).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarHabitacionExclusiva();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });
  }

  const actualizarHabitacionExclusiva = async (dataRow) => {
    setLoading(true);
    let { CantidadCamasAsignadas} = selected;
    const { IdCliente, IdPersona, IdSecuencial, IdDivision, IdCampamento, IdModulo, IdHabitacion, FechaInicio, FechaFin, Activo } = dataRow;
    let params = {
      IdCliente: IdCliente
      , IdPersona : IdPersona
      , IdSecuencial: IdSecuencial
      , IdCampamento: isNotEmpty(IdCampamento) ? IdCampamento : ""
      , IdDivision: IdDivision
      , IdModulo: isNotEmpty(IdModulo) ? IdModulo : ""
      , IdHabitacion: isNotEmpty(IdHabitacion) ? IdHabitacion : ""
      , FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd')
      , FechaFin: dateFormat(FechaFin, 'yyyyMMdd')
      , Activo: Activo
      , IdUsuario: usuario.username
      , MaxPersonasPorCama : CantidadCamasAsignadas * maxPersonasPorCama

    };
    await actualizar(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarHabitacionExclusiva();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });
  }
 
  const editarRegistroHabitacionExclusiva = async (dataRow) => {

    const { IdPersona } = dataRow;

    await servicePersona.obtenerPeriodo({
      IdPersona: IdPersona,
      FechaInicio: dateFormat(new Date(), 'yyyyMMdd'),
      FechaFin: dateFormat(new Date(), 'yyyyMMdd')
   }).then(response => {
    //  console.log("editarRegistroHabitacionExclusiva|response:",response);
       if(response){
         if(!isNotEmpty(response.MensajeValidacion)){
             setDisabledSave(false);
             setFechasContrato({FechaInicioContrato: response.FechaInicio,FechaFinContrato: response.FechaFin});
         }else
         {
           setFechasContrato({FechaInicioContrato: null,FechaFinContrato: null});
           setDisabledSave(true);
           handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), response.MensajeValidacion);
         }
       }
   })

    setDataRowEditNew({ esNuevoRegistro: false });
    obtenerHabitacionExclusiva(dataRow);
    setModoEdicion(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
  };

  async function obtenerHabitacionExclusiva(dataRow) {
    setLoading(true);
    const { IdCliente, IdPersona, IdSecuencial } = dataRow;
    await obtener({
      IdCliente : IdCliente ,
      IdPersona : IdPersona,
      IdSecuencial : IdSecuencial,
    }).then(HabitacionExclusiva => {
      setDataRowEditNew({ ...HabitacionExclusiva, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });
  }


  async function eliminarRegistroHabitacionExclusiva(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const {IdCliente,IdPersona ,IdSecuencial} = selectedDelete;
      await eliminar({
       IdCliente : IdCliente,
       IdPersona : IdPersona,
       IdSecuencial : IdSecuencial
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarHabitacionExclusiva();
    }
  }

  const nuevoRegistroTabsHabitacionExclusiva = (e) => {

    let nuevo = { Activo: "S" };
    setFechasContrato({FechaInicioContrato:null,FechaFinContrato: null});
    setDataRowEditNew({ ...nuevo, esNuevoRegistro: true,FechaInicio:new Date()  });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);

  };

  const cancelarEdicionHabitacionExclusiva = () => {
    setModoEdicion(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  }

 
  // ::::: Datos Principales  ::::::

  async function obtenerConfiguracionParameters() {
    setLoading(true);
    await obtenerConfigM({
      IdCliente:IdCliente,
      // IdModulo: varIdModulo,
      // IdAplicacion: varIdAplicacion,
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdConfiguracion :"MAXPERSONASXCAMA"
    }).then(data => {
      const { Valor1 } = data;
      console.log("")
      setMaxPersonasPorCama(parseInt(Valor1));
    }).catch(err => { }).finally(() => { setLoading(false); });
  }

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }
  async function eliminarListRowTab(selected, confirm) {
    let currentTab = tabIndex;
    switch (currentTab) {
      case 1:
        eliminarRegistroHabitacionExclusiva(selected, confirm);
        break;
    }
  }

  const getInfo = () => {
    const { Campamento, Habitacion, Cama, Modulo } = selected;
    return [
      { text: [intl.formatMessage({ id: "CAMP.RESERVATION.CAMP" })], value: Campamento },
      { text: [intl.formatMessage({ id: "CAMP.BED_MANAGEMENT.MODULE" })], value: Modulo },
      { text: [intl.formatMessage({ id: "CAMP.BED_MANAGEMENT.ROOM" })], value: Habitacion },
    ];
  };

  useEffect(() => {
    loadControlsPermission();
    listarCampamentoHabitacion();
     obtenerConfiguracionParameters();
  }, []);

 //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    return `${intl.formatMessage({ id: "CAMP.RESERVATION.CAMPMANAGEMENT" })}  -          
     ${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `;
  }

  const tabsDisabled = () => {
    return isNotEmpty(varIdHabitacion) ? false : true;
  }

  const tabContent_HabitacionListPage = () => {
    return <HabitacionListPage
            campamentosHabitacion={campamentosHabitacion}
            seleccionarRegistro={seleccionarRegistroHabitacion}
            cancelarEdicion={ cancelarEdicion}
            getInfo={getInfo}
            titulo={titulo}
            showButtons={true}
            focusedRowKey={focusedRowKeyHabitacion}
            setFocusedRowKey={setFocusedRowKeyHabitacion}
            isFirstDataLoad={isFirstDataLoad}
            setIsFirstDataLoad={setIsFirstDataLoad}
            dataSource={dataSource}
            refresh={refresh}
            resetLoadOptions={resetLoadOptions}
            refreshData={refreshData}
            setRefreshData={setRefreshData}
            setVarIdHabitacion={setVarIdHabitacion}
            totalRowIndex = {totalRowIndex}
            setTotalRowIndex={setTotalRowIndex}
  />
  }

  const tabContent_HabitacionExclusivaListPage = () => {
    return <>
      {modoEdicion ? (
        <>
          <HabitacionExclusivaEditPage
            dataRowEditNew={dataRowEditNew}
            setDataRowEditNew={setDataRowEditNew}
            agregarHabitacionExclusiva={agregarHabitacionExclusiva}
            actualizarHabitacionExclusiva={actualizarHabitacionExclusiva}
            cancelarEdicion={cancelarEdicionHabitacionExclusiva}
            getInfo={getInfo}
            titulo={tituloTabs} 
            modoEdicion={modoEdicion}
            settingDataField={dataMenu.datos}
            accessButton={accessButton}
            fechasContrato = { fechasContrato }
            setFechasContrato = { setFechasContrato }
            disabledSave = { disabledSave }
            setDisabledSave = { setDisabledSave }
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
       )
        :
        <HabitacionExclusivaListPage
          camaExclusiva={listarTabs}
          editarRegistro={editarRegistroHabitacionExclusiva}
          eliminarRegistro={eliminarListRowTab}
          nuevoRegistro={nuevoRegistroTabsHabitacionExclusiva}
          cancelarEdicion={cancelarEdicion}
          getInfo={getInfo}
          accessButton={accessButton}
        />
      }
    </>
  }

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "CAMP.BED_MANAGEMENT.MENU" })}
        submenu={intl.formatMessage({ id: "CAMP.CAMP.MANAGEMENT" })}
        subtitle={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} 
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
            // onClick: () => { listarCampamentoHabitacion() },
          },
          {
            label: intl.formatMessage({ id: "CAMP.BED_MANAGEMENT.TAB.EXCLUSIVE" }),
            icon: <AirlineSeatFlatAngled fontSize="large" />,
            onClick: (e) => { listarHabitacionExclusiva()},
            disabled: !tabsDisabled() && accessButton.Tabs[1] ? false : true
          },

        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_HabitacionListPage(),
            tabContent_HabitacionExclusivaListPage(),
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

export default injectIntl(WithLoandingPanel(HabitacionExclusivaIndexPage));
