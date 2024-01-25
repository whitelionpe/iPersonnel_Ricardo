import React, { useEffect, useState } from "react";
import { handleErrorMessages, handleSuccessMessages,handleInfoMessages, confirmAction } from "../../../../store/ducks/notify-messages";

import { useSelector } from "react-redux";
import { isNotEmpty } from "../../../../../_metronic";
import { service } from "../../../../api/transporte/ruta.api";
import RutaListPage from "./RutaListPage";
import RutaEditaPage from "./RutaEditaPage";

import RutaParaderoIndex from "../rutaParadero/RutaParaderoIndex";

import {  useStylesTab } from "../../../../store/config/Styles";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { injectIntl } from "react-intl";

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'

import LineStyleIcon from '@material-ui/icons/LineStyle';
import EmojiTransportationIcon from '@material-ui/icons/EmojiTransportation';

import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

export const initialFilter = {
  Activo: '%',
};

const RutaIndexPage = (props) => {
  const usuario = useSelector(state => state.auth.user);
  const { intl, setLoading, dataMenu } = props;

  const classes = useStylesTab();

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [paraderos, setParaderos] = useState([]);
  const [dataParaderosPorRuta] = useState([]);
  const [idRuta, setIdRuta] = useState("");
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

  /***********************[Función Ruta....]*********************************/
  // const configurarRutaParadero = () => {
  //   changeTabIndex(2);
  //   setModoEdicion(true);
  // }

  const seleccionarRegistro = data => {
    const { IdRuta, RowIndex } = data;
    setSelected(data);
    setFocusedRowKey(RowIndex);
    setIdRuta(IdRuta);
  }

  const verRegistroDblClick = async () => {
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerRuta();
  };

  async function agregarRutas(rutas) {
    const { IdRuta, Ruta, IdTipoRuta, Activo } = rutas;
    await service.crear({
      IdRuta: IdRuta.toUpperCase(), Ruta: Ruta.toUpperCase(), IdTipoRuta, Activo, IdUsuario: usuario.username
    }).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      setIdRuta("");
      listarRutas();
      changeTabIndex(0);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);

    });
  }

  async function actualizarRutas(ruta) {
    const { IdRuta, Ruta, IdTipoRuta, Activo } = ruta;

    //  if (Activo === 'N') {
    //    let dataValidation = await validaEstadoRutas(IdRuta);
    //    if (dataValidation.data.ResponseValue === 1) {
    //      handleInfoMessages(dataValidation.data.MensajeValidacion);
    //      return;
    //    }
    //  }

    await service.actualizar({
      IdRuta: IdRuta.toUpperCase(), Ruta: Ruta.toUpperCase(), IdTipoRuta, Activo, IdUsuario: usuario.username
    }).then(response => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      setIdRuta("");
      listarRutas();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);

    });
  }

  async function eliminarRegistro(rutas) {
    var response = await confirmAction(intl.formatMessage({ id: "ALERT.REMOVE" }),intl.formatMessage({ id: "COMMON.YES" }),intl.formatMessage({ id: "COMMON.NOT" }));
    if(response.isConfirmed){
      const { IdRuta } = rutas;
      await service.eliminar({IdRuta}).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        setIdRuta("");
        setFocusedRowKey();
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      });
      listarRutas();
    }
  }

  async function listarRutas() {
    let data = await service.listar({IdRuta:'%',NumPagina:0 ,TamPagina:0});
    changeTabIndex(0);
    setRefreshData(true);
  }

  async function obtenerRuta() {
    setLoading(true);
    const { IdRuta } = selected;
    await service.obtener({
      IdRuta
    }).then(data => {
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });

  }

  async function nuevoRegistro() {
    let rutas = { Activo: "S" , IdRuta: intl.formatMessage({ id: "COMMON.CODE.AUTO" }).toUpperCase() };
    setDataRowEditNew({...rutas, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setDataParaderosSeleccionados([]);
    changeTabIndex(1);
  };

  
  const editarRegistro = () => {
    changeTabIndex(1);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerRuta();
    setModoEdicion(true);
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    changeTabIndex(0);
    seleccionarRegistro(selected);
  };

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
      intl.formatMessage({ id: "TRANSPORTE.ROUTE.WHEREABOUTS" }),
    ];
    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";
    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }

  const tabsDisabled = () => {
    return isNotEmpty(idRuta) ? true : false;
  }

  useEffect(() => {
    loadControlsPermission();
    listarRutas();
  }, []);

  const tabContent_RutaListPage = () => {
    return <>
      <RutaListPage
        titulo={titulo}
        editarRegistro={editarRegistro}
        eliminarRegistro={eliminarRegistro}
        nuevoRegistro={nuevoRegistro}
        seleccionarRegistro={seleccionarRegistro}
        verRegistroDblClick={verRegistroDblClick}
        // configurarRutaParadero={configurarRutaParadero}
        focusedRowKey={focusedRowKey}
        setFocusedRowKey={setFocusedRowKey}
        isFirstDataLoad={isFirstDataLoad}
        setIsFirstDataLoad={setIsFirstDataLoad}
        dataSource={dataSource}
        refresh={refresh}
        resetLoadOptions={resetLoadOptions}
        refreshData={refreshData}
        setRefreshData={setRefreshData}
        showButtons={true}
        setIdRuta={setIdRuta}
        totalRowIndex = {totalRowIndex}
        setTotalRowIndex={setTotalRowIndex}
      />
    </>
  }

  const tabContent_RutaEditTabPage = () => {
    return <>
        <RutaEditaPage
          modoEdicion={modoEdicion}
          setModoEdicion={setModoEdicion}
          dataRowEditNew={dataRowEditNew}
          setDataParaderosSeleccionados={setDataParaderosSeleccionados}
          dataParaderosSeleccionados={dataParaderosSeleccionados}
          actualizarRutas={actualizarRutas}
          agregarRutas={agregarRutas}
          cancelarEdicion={cancelarEdicion}
          setTitulo={titulo}
          titulo={titulo}
          paraderos={paraderos}
          dataParaderosPorRuta={dataParaderosPorRuta}
          idRuta={idRuta}
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

  const tabContent_RutaParaderoIndex = () => {
    return <>
        <RutaParaderoIndex
          selectedIndex={selected}
          modoEdicion={modoEdicion}
          cancelarEdicion={cancelarEdicion}
          accessButton = {accessButton}
          settingDataField={dataMenu.datos}
        />
    </>
  }

  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "TRANSPORT.MAIN" })}
        submenu={intl.formatMessage({ id: "CONFIG.MENU.TRANSPORTE.CONFIGURACIÓN" })}
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
             label: intl.formatMessage({ id: "CONFIG.MENU.TRANSPORTE.RUTA" }),
             icon: <LineStyleIcon fontSize="large" />,
             onClick: (e) => { obtenerRuta() },
             disabled: !tabsDisabled()
           },
           {
            label: intl.formatMessage({ id: "TRANSPORTE.ROUTE.WHEREABOUTS" }),
            icon: <EmojiTransportationIcon fontSize="large" />,
            onClick: () => { setModoEdicion(false) },
            disabled: !tabsDisabled()
          }           
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_RutaListPage(),
            tabContent_RutaEditTabPage(),
            tabContent_RutaParaderoIndex(),
          ]
        }
      />

    </>
  );

};

export default injectIntl(WithLoandingPanel(RutaIndexPage));
