import React, { useEffect, useState } from "react";
import { handleErrorMessages, handleSuccessMessages,handleInfoMessages, confirmAction } from "../../../../store/ducks/notify-messages";
import { useSelector } from "react-redux";
import { isNotEmpty } from "../../../../../_metronic";
import { service } from "../../../../api/transporte/manifiestoReservacionCupoSemanal.api";
import ManifiestoCupoListPage from "./ManifiestoCupoListPage";
import ManifiestoCupoEditPage from "./ManifiestoCupoEditPage";
import {  useStylesTab } from "../../../../store/config/Styles";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { injectIntl } from "react-intl";
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import PeopleAltRounded from '@material-ui/icons/PeopleAltRounded';
import EmojiTransportationIcon from '@material-ui/icons/EmojiTransportation';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';


export const initialFilter = {
  IdCompania: '',
  NombreCompania: '',
  CuposDesde: 0,
  CuposHasta: 0,
  Configurado: 'T',
  Activo: 'S',
  EsUrbanito: 'T',
};

const ManifiestoCupoIndexPage = (props) => {
  const usuario = useSelector(state => state.auth.user);
  const { intl, setLoading, dataMenu } = props;

  const classes = useStylesTab();

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [paraderos, setParaderos] = useState([]);
  const [dataParaderosPorRuta] = useState([]);
  const [varIdCompania, setVarIdCompania] = useState("");
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataParaderosSeleccionados, setDataParaderosSeleccionados] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [selected, setSelected] = useState({});

  const [listarTabs, setListarTabs] = useState([]);
  const handleChange = (event, newValue) => { setTabIndex(newValue); };
  const [focusedRowKey, setFocusedRowKey] = useState();
    //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
    const [totalRowIndex, setTotalRowIndex] = useState(0);

    //::::::::::::::::::::: FILTRO ::::::::::::::::::::::::::::::::
    const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
    const [refreshData, setRefreshData] = useState(false);
    const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
    const [dataSource] = useState(ds);
  
    const refresh = () => dataSource.refresh();
    const resetLoadOptions = () => dataSource.resetLoadOptions();
   //:::::::::::::::::::::  ::::::::::::::::::::::::::::::::

   const generarConfiguracionAMostrar = (configuracionRaw) => {
    if (configuracionRaw) {
      const {
        Lunes,
        Martes,
        Miercoles,
        Jueves,
        Viernes,
        Sabado,
        Domingo,
      } = configuracionRaw;
      return {
        ...configuracionRaw,
        Lunes: { seleccionado: (Lunes > 0), cupos: Lunes },
        Martes: { seleccionado: (Martes > 0), cupos: Martes },
        Miercoles: { seleccionado: (Miercoles > 0), cupos: Miercoles },
        Jueves: { seleccionado: (Jueves > 0), cupos: Jueves },
        Viernes: { seleccionado: (Viernes > 0), cupos: Viernes },
        Sabado: { seleccionado: (Sabado > 0), cupos: Sabado },
        Domingo: { seleccionado: (Domingo > 0), cupos: Domingo },
      };
    }
    return configuracionRaw;
  }

    async function obtenerConfiguracion() {
     const { IdCompania } = selected;
    if (IdCompania) {
      await service.obtener({ IdCompania: IdCompania }).then(response => {
        if (response) {
          const obj = generarConfiguracionAMostrar(response);
          setDataRowEditNew(obj);
        } else {
          const obj = generarConfiguracionAMostrar({
            Lunes: 0,
            Martes: 0,
            Miercoles: 0,
            Jueves: 0,
            Viernes: 0,
            Sabado: 0,
            Domingo: 0,
            Activo: 'S',
            EsUrbanito: "N",
            Cupos: 0
          });
          setDataRowEditNew(obj);
        }
      });
    }

    changeTabIndex(1);
    setModoEdicion(false);
  }

   const configurarCupones = (params) => {
    setLoading(true);
     const { IdCompania, Activo, Configuracion, EsUrbanito } = params;
     service.crear({ 
        IdCompania : IdCompania,
        Configuracion, 
        EsUrbanito, 
        Activo
      })
       .then(response => {
         setTimeout(function () {
          listarManifiestoCupos();
         },500)
         handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "TRANSPORTE.COUPONS.CONFIGURATION.SUCCESSFULLY.MSG" }));

       }).catch(err => {
         handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
       });
    setLoading(false);
   }
   
  const editarRegistro = async (dataRow) => {
    setSelected(dataRow);
    await obtenerConfiguracion();
    changeTabIndex(1);
    setModoEdicion(true);
  };

  async function eliminarRegistro(dataRow) { // Actualiza registro para resetear Cupos
    var response = await confirmAction(intl.formatMessage({ id: "ALERT.REMOVE" }),intl.formatMessage({ id: "COMMON.YES" }),intl.formatMessage({ id: "COMMON.NOT" }));
    if(response.isConfirmed){
      const { IdCompania, Activo, EsUrbanito } = dataRow;
     service.crear({ 
        IdCompania : IdCompania,
        Configuracion : [0, 0, 0, 0, 0, 0, 0],
        EsUrbanito, 
        Activo
      }).then(response => {
         handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "TRANSPORTE.COUPONS.CONFIGURATION.SUCCESSFULLY.MSG" }));
       }).catch(err => {
         handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
       });
       setRefreshData(true);
    }
  }

  const seleccionarRegistro = data => {
    const { IdCompania, RowIndex } = data;
    setSelected(data);
    setFocusedRowKey(RowIndex);
    setVarIdCompania(IdCompania);
  }

  const cancelarEdicion = () => {
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setModoEdicion(false);
    changeTabIndex(0);
  };

  function listarManifiestoCupos() {
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    changeTabIndex(0);
  }


  const getInfo = () => {
    const { IdCompania, NombreCompania, ActivoDescripcion } = selected;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdCompania, colSpan: 1 },
      { text: [intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" })], value: NombreCompania, colSpan: 1 },
      { text: [intl.formatMessage({ id: "COMMON.STATE" })], value: ActivoDescripcion, colSpan: 1 },
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
    ];
    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";
    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }

  const tabsDisabled = () => {
    return isNotEmpty(varIdCompania) ? true : false;
  }

 
  useEffect(() => {
    loadControlsPermission();
  }, []);

  const tabContent_ManifiestoCupoListPage = () => {
    return <>
      <ManifiestoCupoListPage
        titulo={titulo}
        dataRowEditNew={dataRowEditNew}
        setDataRowEditNew = {setDataRowEditNew}
        editarRegistro={editarRegistro}
        seleccionarRegistro={seleccionarRegistro}
        eliminarRegistro ={eliminarRegistro}
        focusedRowKey={focusedRowKey}
        setFocusedRowKey={setFocusedRowKey}
        // --------------------------
        isFirstDataLoad={isFirstDataLoad}
        setIsFirstDataLoad={setIsFirstDataLoad}
        dataSource={dataSource}
        refresh={refresh}
        resetLoadOptions={resetLoadOptions}
        refreshData={refreshData}
        setRefreshData={setRefreshData}
        showButtons={true}
        uniqueId={"ManifiestoCupoListPage"}
        setVarIdCompania={setVarIdCompania}
        totalRowIndex = {totalRowIndex}
        setTotalRowIndex={setTotalRowIndex}
      />
    </>
  }

  const tabContent_RutaEditTabPage = () => {
    return <>
        <ManifiestoCupoEditPage
          modoEdicion={modoEdicion}
          setModoEdicion={setModoEdicion}
          dataRowEditNew={dataRowEditNew}
          setDataRowEditNew = {setDataRowEditNew}
          obtenerConfiguracion={obtenerConfiguracion}
          actualizarConfiguracion={configurarCupones}
          cancelarEdicion={cancelarEdicion}
          varIdCompania={varIdCompania}
          getInfo = {getInfo}
          accessButton = {accessButton}
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
             label: intl.formatMessage({ id: "COMMON.CONFIGURATION" }),
             icon: <PeopleAltRounded fontSize="large" />,
             onClick: (e) => { obtenerConfiguracion() },
             disabled: !tabsDisabled()
           }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_ManifiestoCupoListPage(),
            tabContent_RutaEditTabPage(),
          ]
        }
      />

    </>
  );

};

export default injectIntl(WithLoandingPanel(ManifiestoCupoIndexPage));
