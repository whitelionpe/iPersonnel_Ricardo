import React, { useEffect, useState } from "react";
//import { handleErrorMessages } from "../../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../../partials/content/withLoandingPanel";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../../../_metronic/utils/securityUtils'

import { useSelector } from "react-redux";

//import { obtener } from "../../../../../../api/acreditacion/solicitud.api";

import VisitaListPage from "./VisitaListPage";
import DetalleIndexPage from "../visita/detalle/DetalleIndexPage";

import { isNotEmpty } from "../../../../../../../_metronic";
import TabNavContainer from "../../../../../../partials/components/Tabs/TabNavContainer";
import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
import Assignment from "@material-ui/icons/Assignment";
//import Timeline from "@material-ui/icons/Timeline";

import {
  useStylesTab,
} from "../../../../../../store/config/Styles";

//Multi-idioma
import { injectIntl } from "react-intl";
import { obtener as obtenerConfigModulo } from "../../../../../../api/sistema/configuracionModulo.api";

import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

export const initialFilter = {
  IdCliente: '',
  Activo: 'S',
  FechaInicio: new Date().setDate(new Date().getDate() - 60),
  FechaFin: new Date()
};

const VisitaIndexPage = (props) => {

  const perfil = useSelector((state) => state.perfil.perfilActual);
  const { intl, setLoading, dataMenu } = props;
  const [focusedRowKey, setFocusedRowKey] = useState();
  const [varIdSolicitud, setVarIdSolicitud] = useState("");
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [colorRojo, setColorRojo] = useState(3);
  const [colorVerde, setColorVerde] = useState(1);
  const classes = useStylesTab();
  const [value, setValue] = useState(0);
  //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
  const [totalRowIndex, setTotalRowIndex] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setTabIndex(newValue);
  };

  //Datos principales
  const [selected, setSelected] = useState({});
  const [tabIndex, setTabIndex] = useState(0);

  //FILTRO
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [filterData, setFilterData] = useState({ ...initialFilter });
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
  };

  const seleccionarRegistro = async (dataRow) => {
    const { IdSolicitud, RowIndex } = dataRow;
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    setSelected(dataRow);
    setVarIdSolicitud(IdSolicitud);
    setFocusedRowKey(RowIndex);
  }

  const abrirSolicitudDetalle = async (data) => {;
    setSelected(data);
    changeTabIndex(1);

  };

 
  async function obtenerConfiguracionRojo() {
    setLoading(true);
    await obtenerConfigModulo({
      IdCliente: perfil.IdCliente,
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdConfiguracion: "ACREDITACION_ROJO"
    }).then(data => {
      const { Valor1 } = data;
      setColorRojo(Valor1);
    }).catch(err => { }).finally(() => { setLoading(false); });
  }

  async function obtenerConfiguracionVerde() {
    setLoading(true);
    await obtenerConfigModulo({
      IdCliente: perfil.IdCliente,
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdConfiguracion: "ACREDITACION_VERDE"
    }).then(data => {
      const { Valor1 } = data;
      setColorVerde(Valor1);
    }).catch(err => { }).finally(() => { setLoading(false); });
  }


  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 2; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  useEffect(() => {
    obtenerConfiguracionRojo();
    obtenerConfiguracionVerde();
    loadControlsPermission();
  }, []);

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const changeTabIndex = (index) => {
    handleChange(null, index);
  };

  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "ACCIONES",
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdSolicitud) ? false : true;
    //return true;
  }

  const tabContent_VisitaListPage = () => {
    return <VisitaListPage
      titulo={titulo}
      seleccionarRegistro={seleccionarRegistro}
      abrirSolicitudDetalle={abrirSolicitudDetalle}
      focusedRowKey={focusedRowKey}
      setFocusedRowKey={setFocusedRowKey}
      showButtons={false}
      uniqueId={"acreditacionDesmovilizacionPersonaList"}
      //=>..CustomerDataGrid
      filterData={filterData}
      setFilterData={setFilterData}
      isFirstDataLoad={isFirstDataLoad}
      setIsFirstDataLoad={setIsFirstDataLoad}
      dataSource={dataSource}
      refresh={refresh}
      resetLoadOptions={resetLoadOptions}
      refreshData={refreshData}
      setRefreshData={setRefreshData}
      accessButton={accessButton}
      colorRojo={colorRojo}
      colorVerde={colorVerde}
      setVarIdSolicitud={setVarIdSolicitud}
      totalRowIndex = {totalRowIndex}
      setTotalRowIndex={setTotalRowIndex}

    />
  }

  const tabContent_VisitaIndexPage = () => {
    return <>
      <DetalleIndexPage
        cancelarEdicion={cancelarEdicion}
        selected={selected}
        colorRojo={colorRojo}
        colorVerde={colorVerde}
      />
    </>
  }

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "ACCREDITATION.MAIN" })}
        submenu={intl.formatMessage({ id: "CONFIG.MENU.ACREDITACION.GESTIÓN_DE_ACREDITACIÓN" }) + '  /  ' + intl.formatMessage({ id: "CONFIG.MENU.ACREDITACION.MOVILIZACIÓN" })}
        subtitle={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />
          }
          // {
          //   label: intl.formatMessage({ id: "ACCREDITATION.MAIN" }),
          //   icon: <Assignment fontSize="large" />,
          //   //onClick: (e) => { obtenerSolicitud() },
          //   disabled: tabsDisabled()
          // }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_VisitaListPage()
            // tabContent_VisitaIndexPage()
          ]
        }
      />

    </>
  );
};


export default injectIntl(WithLoandingPanel(VisitaIndexPage));
