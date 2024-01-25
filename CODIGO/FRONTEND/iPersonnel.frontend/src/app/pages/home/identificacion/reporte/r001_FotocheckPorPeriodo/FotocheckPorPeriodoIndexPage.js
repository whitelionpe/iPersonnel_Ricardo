import React, { useEffect, useState } from "react";
import { handleErrorMessages, handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../../_metronic/utils/securityUtils'
import { useSelector } from "react-redux";
import { isNotEmpty, dateFormat, getStartAndEndOfMonthByDay } from "../../../../../../_metronic";
import FormatListNumberedRtl from "@material-ui/icons/FormatListNumberedRtl";
import { useStylesEncabezado, useStylesTab, } from "../../../../../store/config/Styles";
import { injectIntl } from "react-intl";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { PortletBody, Portlet } from "../../../../../partials/content/Portlet";
import AppBar from '@material-ui/core/AppBar';
import PropTypes from 'prop-types';
import CustomBreadcrumbs from "../../../../../partials/layout/CustomBreadcrumbs";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import BarChartIcon from '@material-ui/icons/BarChart';
import ReporteHistogramaPage from "./ReporteHistogramaPage";
import { serviceReporte } from "../../../../../api/identificacion/reporte.api"
import ReporteFiltros from "./ReporteFiltros";
import TabNavContainer from "../../../../../partials/components/Tabs/TabNavContainer";
import ReporteHistogramaDetalleListPage from "./ReporteHistogramaDetalleListPage";

export const initialFilter = {
  IdCliente: ''
};

const ReporteIndexPage = (props) => {

  const perfil = useSelector((state) => state.perfil.perfilActual);
  const { intl, setLoading, dataMenu } = props;
  const [dataRowEditNew, setDataRowEditNew] = useState({});

  const classes = useStylesTab();
  const classesEncabezado = useStylesEncabezado();
  const [value, setValue] = useState(0);
  const [identificacionPeriodoMotivo, setIdentificacionPeriodoMotivo] = useState([]);
  const [identificacionPeriodoModelo, setIdentificacionPeriodoModelo] = useState([]);;
  const [varCompaniaMandanteDefault, setVarCompaniaMandanteDefault] = useState({ IdCompaniaMandante: "", CompaniaMandante: "" });

  //Datos principales
  const [tabIndex, setTabIndex] = useState(0);

  //FILTRO
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  //const [filterData, setFilterData] = useState({ ...initialFilter });
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);
  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();

  const [dataGridRef, setDataGridRef] = useState(null);
  const refPdf = React.createRef();

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

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setTabIndex(newValue);
  };


  async function ObtenerListas() {
    //debugger;
    setLoading(true);

    if (Date.parse(new Date(dataRowEditNew.FechaInicio)) > Date.parse(new Date(dataRowEditNew.FechaFin))) {
      handleInfoMessages(intl.formatMessage({ id: "ACCESS.PERSON.STARTDATE.VALID" }));
      setLoading(false);
      return;
    }
    obtenerDataHistograma();
    setLoading(false);
  }

  async function obtenerDataHistograma() {
    setLoading(true);
    const { IdCompaniaMandante, IdMotivo, IdTipoCredencial, Devuelto, FechaInicio, FechaFin } = dataRowEditNew;
    //debugger;
    await serviceReporte.listarRFotocheckPorPeriodo({
      IdCliente: perfil.IdCliente,
      IdCompania: isNotEmpty(IdCompaniaMandante) ? IdCompaniaMandante : "",
      IdMotivo: isNotEmpty(IdMotivo) ? IdMotivo : "",
      IdTipoCredencial: isNotEmpty(IdTipoCredencial) ? IdTipoCredencial : "",
      Devuelto: isNotEmpty(Devuelto) ? Devuelto : "",
      FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd'),
      FechaFin: dateFormat(FechaFin, 'yyyyMMdd'),
    }).then(data => {
      //console.log("obtenerDataHistograma|data:", data[0]);
      setIdentificacionPeriodoMotivo(data[0]);
      setIdentificacionPeriodoModelo(data[1]);
      if (data[0].length === 0) handleInfoMessages(intl.formatMessage({ id: "MESSAGES.NO.DATA" }));

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => {
      setLoading(false);
    });
  }

  async function obtenerHistogramaDetalle(Mes, Motivo, TipoCredencial) {
    setLoading(true);
    const { IdCompaniaMandante } = dataRowEditNew;
    let startDate = new Date(dataRowEditNew.FechaInicio.getFullYear(), Mes, 1);
    const { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay(startDate, 1);

    setFiltroLocal({
      IdCompania: isNotEmpty(IdCompaniaMandante) ? IdCompaniaMandante : "",
      IdMotivo: isNotEmpty(Motivo) ? Motivo : "",
      IdTipoCredencial: isNotEmpty(TipoCredencial) ? TipoCredencial : "",
      FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd'),
      FechaFin: dateFormat(FechaFin, 'yyyyMMdd'),
   });
    handleChange(null, 1);
    setLoading(false);
  }

  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 2;
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  useEffect(() => {
    loadControlsPermission();
  }, []);

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const tabContent_ReporteHistogramaPage = () => {
    return <>
      <ReporteHistogramaPage
        dataRowEditNew={dataRowEditNew}
        setDataRowEditNew={setDataRowEditNew}
        settingDataField={dataMenu.datos}
        accessButton={accessButton}
        identificacionPeriodoMotivo={identificacionPeriodoMotivo}
        identificacionPeriodoModelo={identificacionPeriodoModelo}
        obtenerHistogramaDetalle={obtenerHistogramaDetalle}
        refPdf={refPdf}
      />
    </>
  }

  const tabContent_DetalleHistograma = () => {
    return <>
      <ReporteHistogramaDetalleListPage
      uniqueId={"ReporteHistogramaDetalleListPage"}
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

    />
    </>
  }

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
        <div id={"CredencialPeriodo"} ref={refPdf} >
          <React.Fragment>
            <ReporteFiltros
              dataRowEditNew={dataRowEditNew}
              setDataRowEditNew={setDataRowEditNew}
              resetLoadOptions={resetLoadOptions}
              dataSource={dataSource}
              ObtenerListas={ObtenerListas}
              dataGridRef={dataGridRef}
              tabIndex={tabIndex}
              refPdf={refPdf}
              varCompaniaMandanteDefault={varCompaniaMandanteDefault}
            />

            
    <TabNavContainer
      isVisibleCustomBread = {false}
      isVisibleAppBar = {false}
      tabIndex={tabIndex}
      handleChange={handleChange}
      orientation ={"horizontal"}
      componentTabsHeaders={[
        {
          label: intl.formatMessage({ id: "ACCESS.HISTOGRAM" }),
          icon: <BarChartIcon fontSize="large" />,
          className:classes.tabContent,
          disabled :(isNotEmpty(dataRowEditNew.MesInicio) && isNotEmpty(dataRowEditNew.MesFin)) ? false : true

        },
        {
          label: intl.formatMessage({ id: "COMMON.DETAIL" }),
          icon: <FormatListNumberedRtl fontSize="large" />,
          className: classes.tabContent,
        },
      ]}
      className={classes.tabContent}
      componentTabsBody={
        [
          tabContent_ReporteHistogramaPage(),
          tabContent_DetalleHistograma(),
        ]
      }

    />

          </React.Fragment>
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
      hidden={value !== index}
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

export default injectIntl(WithLoandingPanel(ReporteIndexPage));
