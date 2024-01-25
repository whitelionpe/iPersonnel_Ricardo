import React, { useEffect, useState } from "react";
import {
  handleErrorMessages, handleInfoMessages,
} from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../../_metronic/utils/securityUtils'
import { useSelector } from "react-redux";
import ReporteMovimientoEstadisticas from "./ReporteMovimientoEstadisticas";
import { isNotEmpty, dateFormat, getStartAndEndOfMonthByDay } from "../../../../../../_metronic";
import TabNavContainer from "../../../../../partials/components/Tabs/TabNavContainer";
import TrackChanges from "@material-ui/icons/TrackChanges";
import FormatListNumberedRtl from "@material-ui/icons/FormatListNumberedRtl";
import {
  useStylesEncabezado,
  useStylesTab,
} from "../../../../../store/config/Styles";

//Multi-idioma
import { injectIntl } from "react-intl";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
//Aditional
import { listarEstadisticas } from "../../../../../api/administracion/reporte.api"
import {  Portlet,PortletBody } from "../../../../../partials/content/Portlet";
import AppBar from '@material-ui/core/AppBar';
import PropTypes from 'prop-types';
import ReporteMovimientoFiltros from "./ReporteMovimientoFiltros";
import CustomBreadcrumbs from "../../../../../partials/layout/CustomBreadcrumbs";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import ReporteMovimientoEstadisticasDetalleListPage from "./ReporteMovimientoEstadisticasDetalleListPage"

export const initialFilter = {
  IdCliente: '',
  Activo: 'S',
};

const ReporteMovimientoIndexPage = (props) => {

  const perfil = useSelector((state) => state.perfil.perfilActual);
  const { intl, setLoading, dataMenu } = props;
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [condicion, setCondicion] = useState("");
  const [dataRowEditNewTabs, setDataRowEditNewTabs] = useState({});
  const [tituloTabs, setTituloTabs] = useState(
    intl.formatMessage({ id: "ACTION.LIST" })
  );

  const classes = useStylesTab();
  const classesEncabezado = useStylesEncabezado();
  const [value, setValue] = useState(0);
  const [condicionPersona_x_Mes, setCondicionPersona_x_Mes] = useState([]);
  const [condicionPersona_x_Mes_Palette, setCondicionPersona_x_Mes_Palette] = useState([]);
  const [funcione_x_Mes, setFuncione_x_Mes] = useState([]);
  const [enabledTabDetail, setEnabledTabDetail] = useState(true);

  const [dataGridRef, setDataGridRef] = useState(null);
  const refPdf = React.createRef();

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
    //FILTRO

  const [filtroLocal, setFiltroLocal] = useState({
    IdCompania: "",
    UnidadesOrganizativas: "",
    IdDivision: "",
    IdPosicion: "",
    Condicion:"",
    Activo:"",
    FechaInicio:"",
    FechaFin:"",
    Funcion:"",
  });

 
  async function ObtenerListas() {
    setLoading(true);
    if (Date.parse(new Date(dataRowEditNew.FechaInicio)) > Date.parse(new Date(dataRowEditNew.FechaFin))) {
      handleInfoMessages(intl.formatMessage({ id: "ACCESS.PERSON.STARTDATE.VALID" }));
      setLoading(false);
      return;
    }
    obtenerEstadisticas();
    setLoading(false);
  }

  async function listarDetalleEstadistico(mes, condicion, funcion) {
    setLoading(true);
    setCondicion(condicion);
    const { IdCompania, UnidadesOrganizativas, IdPosicion, Activo } = dataRowEditNew;
    let startDate = new Date(dataRowEditNew.FechaInicio.getFullYear(), mes, 1);
    const { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay(startDate, 1);
    setFiltroLocal({
      IdCompania: isNotEmpty(IdCompania) ? IdCompania : "",
      UnidadesOrganizativas: isNotEmpty(UnidadesOrganizativas) ? UnidadesOrganizativas : "",
      IdDivision: perfil.IdDivision,
      IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion : "",
      Condicion: isNotEmpty(condicion) ? condicion : "",
      Activo: isNotEmpty(Activo) ? Activo : "",
      FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd'),
      FechaFin: dateFormat(FechaFin, 'yyyyMMdd'),
      Funcion: isNotEmpty(funcion) ? funcion : "",
   });

    handleChange(null, 1);
    setLoading(false);
  }

  async function obtenerEstadisticas() {
    setLoading(true);
    const { IdCompania, UnidadesOrganizativas, IdPosicion, Condicion, Activo, FechaInicio, FechaFin } = dataRowEditNew;
    await listarEstadisticas({
      IdCliente: perfil.IdCliente,
      IdCompania: isNotEmpty(IdCompania) ? IdCompania : "",
      UnidadesOrganizativas: isNotEmpty(UnidadesOrganizativas) ? UnidadesOrganizativas : "",
      IdDivision: perfil.IdDivision,
      IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion : "",
      Condicion: isNotEmpty(Condicion) ? Condicion : "",
      Activo: isNotEmpty(Activo) ? Activo : "",
      FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd'),
      FechaFin: dateFormat(FechaFin, 'yyyyMMdd'),
    }).then(data => {

      if (data.length > 0) {
        if (data[0]) {
          setCondicionPersona_x_Mes(data[0]);
        } else {
          setCondicionPersona_x_Mes([]);
        }
        if (data[1]) {
          setCondicionPersona_x_Mes_Palette(data[1])
        } else {
          setCondicionPersona_x_Mes_Palette([])
        }
        if (data[2]) {
          setFuncione_x_Mes(data[2]);
        } else {
          setFuncione_x_Mes([])
        }
      } else {
        setCondicionPersona_x_Mes([]);
        setCondicionPersona_x_Mes_Palette([]);
        setFuncione_x_Mes([]);
      }
      if (data[0].length === 0) handleInfoMessages(intl.formatMessage({ id: "MESSAGES.NO.DATA" }));
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => {
      setLoading(false);
    });
  }

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    setDataRowEditNewTabs({});
  };

  const [accessButton, setAccessButton] = useState(defaultPermissions);
   const loadControlsPermission = () => {
    const numeroTabs = 9; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  useEffect(() => {
    loadControlsPermission();
  }, []);
  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  }

  const changeTabIndex = (index) => {
    handleChange(null, index);
  };

  const getInfo = () => { };

  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const tabContent_ReporteMovimientoEstadisticas = () => {
    return <>
      <ReporteMovimientoEstadisticas
        dataRowEditNew={dataRowEditNew}
        setDataRowEditNew={setDataRowEditNew}
        cancelarEdicion={cancelarEdicion}
        settingDataField={dataMenu.datos}
        accessButton={accessButton}
        getInfo={getInfo}
        history={props.history}
        selected={selected}
        condicionPersona_x_Mes={condicionPersona_x_Mes}
        condicionPersona_x_Mes_Palette={condicionPersona_x_Mes_Palette}
        funcione_x_Mes={funcione_x_Mes}
        listarDetalleEstadistico={listarDetalleEstadistico}
        refPdf={refPdf}
      />
    </>
  }

  const tabContent_DetalleHistograma = () => {
    return <>
     <ReporteMovimientoEstadisticasDetalleListPage
      uniqueId={"ReporteMovimientoEstadisticasDetalleListPage"}
      isFirstDataLoad={isFirstDataLoad}
      setIsFirstDataLoad={setIsFirstDataLoad}
      dataSource={dataSource}
      refresh={refresh}
      resetLoadOptions={resetLoadOptions}
      refreshData={refreshData}
      setRefreshData={setRefreshData}
      showButtons={false}
      filtro={filtroLocal}
      setDataGridRef ={setDataGridRef}
      condicion ={condicion}
    />
    </>
  }

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>

      <CustomBreadcrumbs
        Title={intl.formatMessage({ id: "ACCREDITATION.MAIN" })}
        SubMenu={intl.formatMessage({ id: "ACCESS.REPORT.SUBMENU" })}
        Subtitle={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
      />

      <Portlet>
        <AppBar position="static" className={classesEncabezado.principal}>
          <Toolbar variant="dense" className={classesEncabezado.toolbar}>
            <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
              {intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
            </Typography>
          </Toolbar>
        </AppBar>

        <PortletBody>
        <div id={"ContenedorEstadistico"} ref={refPdf}>

        <ReporteMovimientoFiltros
          dataRowEditNew={dataRowEditNew}
          setDataRowEditNew={setDataRowEditNew}
          resetLoadOptions={resetLoadOptions}
          dataSource={dataSource}
          ObtenerListas={ObtenerListas}
          dataGridRef={dataGridRef}
          tabIndex={tabIndex}
          getInfo={getInfo}
          refPdf={refPdf}
        />

        <TabNavContainer
          isVisibleCustomBread={false}
          isVisibleAppBar={false}
          tabIndex={tabIndex}
          handleChange={handleChange}
          orientation={"horizontal"}
          componentTabsHeaders={[
            {
              label: intl.formatMessage({ id: "ACREDITATION.R001.STADISTIC.DATA" }),
              icon: <TrackChanges fontSize="large" />,
              disabled: (isNotEmpty(dataRowEditNew.FechaInicio) && isNotEmpty(dataRowEditNew.FechaFin)) ? false : true,
              onClick: (e) => (ObtenerListas(), setEnabledTabDetail(true))
            },
            {
              label: intl.formatMessage({ id: "COMMON.DETAIL" }),
              icon: <FormatListNumberedRtl fontSize="large" />,
              className: classes.tabContent,
              onClick: (e) => setEnabledTabDetail(false),
              disabled: enabledTabDetail
            },
          ]}
          className={classes.tabContent}
          componentTabsBody={
            [
              tabContent_ReporteMovimientoEstadisticas(),
              tabContent_DetalleHistograma(),
            ]
          }

        />
        </div>
      </PortletBody>
      </Portlet>

    </>
  );
};


function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <Portlet
      component="div"
      role="tabpanel"
      hidden={value !== index} //view
      //id={`wrapped-tabpanel-${index}`}
      //aria-labelledby={`wrapped-tab-${index}`}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </Portlet>
  );
}

TabPanel.propTypes =
{
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function tabPropsIndex(index) {
  return {
    id: `simple-tabpanel-${index}`,
    'aria-controls': `simple-tab-${index}`,
  };
}

export default injectIntl(WithLoandingPanel(ReporteMovimientoIndexPage));
