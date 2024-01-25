import React, { useEffect, useState } from "react";
import {
  handleErrorMessages, handleInfoMessages,
} from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../../_metronic/utils/securityUtils'
import { useSelector } from "react-redux";
import ReporteHistogramaPage from "./ReporteHistogramaPage";
import ReporteHistogramaDetalleListPage from "./ReporteHistogramaDetalleListPage";
import { isNotEmpty, dateFormat, getStartAndEndOfMonthByDay } from "../../../../../../_metronic";
import FormatListNumberedRtl from "@material-ui/icons/FormatListNumberedRtl";
import {
  useStylesEncabezado,
  useStylesTab,
} from "../../../../../store/config/Styles";
//Multi-idioma
import { injectIntl } from "react-intl";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { obtener as obtenerSistemaConfiguracion } from "../../../../../api/sistema/configuracion.api";
//Aditional
import { serviceReporte } from "../../../../../api/acreditacion/reporte.api"
import { PortletBody, Portlet } from "../../../../../partials/content/Portlet";
import AppBar from '@material-ui/core/AppBar';
import PropTypes from 'prop-types';
import ReporteFiltros from "./ReporteFiltros";
import CustomBreadcrumbs from "../../../../../partials/layout/CustomBreadcrumbs";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import BarChartIcon from '@material-ui/icons/BarChart';
import TabNavContainer from "../../../../../partials/components/Tabs/TabNavContainer";

export const initialFilter = {
  IdCliente: '',
  Activo: 'S',
};

const ReporteIndexPage = (props) => {

  const perfil = useSelector((state) => state.perfil.perfilActual);
  const { intl, setLoading, dataMenu } = props;
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const classes = useStylesTab();
  const classesEncabezado = useStylesEncabezado();
  const [value, setValue] = useState(0);
  const [acreditacion_x_Perfil, setAcreditacion_x_Perfil] = useState([]);
  const [acreditacion_x_Perfil_Mes, setAcreditacion_x_Perfil_Mes] = useState([]);
  const [acreditacion_Promedio, setAcreditacion_Promedio] = useState([]);
  const [promedioPaleteData, setPromedioPaleteData] = useState([]);
  const [enabledTabDetail, setEnabledTabDetail] = useState(true);
  const [varCompaniaMandanteDefault, setVarCompaniaMandanteDefault] = useState({ IdCompaniaMandante: "", CompaniaMandante: "" });

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
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);
  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();
  //FILTRO

  const [filtroLocal, setFiltroLocal] = useState({
    IdCompania: "",
    Perfil: "",
    UnidadesOrganizativas: "",
    EstadoAprobacion: "",
    FechaInicio: "",
    FechaFin: ""
  });


  async function ObtenerListas() {
    setLoading(true);

    if (Date.parse(new Date(dataRowEditNew.FechaInicio)) > Date.parse(new Date(dataRowEditNew.FechaFin))) {
      handleInfoMessages(intl.formatMessage({ id: "ACCESS.PERSON.STARTDATE.VALID" }));
      setLoading(false);
      return;
    }
    obtenerDataHistograma();
    setLoading(false);
  }

  async function obtenerHistogramaDetalle(Mes, Estado, Perfil) {
    setLoading(true);

    const { IdCompania, UnidadesOrganizativas } = dataRowEditNew;
    let startDate = new Date(dataRowEditNew.FechaInicio.getFullYear(), Mes, 1);
    const { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay(startDate, 1);

    setFiltroLocal({
      IdCompania: isNotEmpty(IdCompania) ? IdCompania : "",
      Perfil: isNotEmpty(Perfil) ? Perfil : "",
      UnidadesOrganizativas: isNotEmpty(UnidadesOrganizativas) ? UnidadesOrganizativas : "",
      EstadoAprobacion: isNotEmpty(Estado) ? Estado : "",
      FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd'),
      FechaFin: dateFormat(FechaFin, 'yyyyMMdd'),
    });
    handleChange(null, 1);
    setLoading(false);
  }

  async function obtenerDataHistograma() {
    setLoading(true);
    const { IdCompania, IdPerfil, UnidadesOrganizativas, EstadoAprobacion, FechaInicio, FechaFin } = dataRowEditNew;
    await serviceReporte.r001_Analisis({
      IdCliente: perfil.IdCliente,
      IdCompania: isNotEmpty(IdCompania) ? IdCompania : "",
      IdPerfil: isNotEmpty(IdPerfil) ? IdPerfil : "",
      UnidadesOrganizativas: isNotEmpty(UnidadesOrganizativas) ? UnidadesOrganizativas : "",
      EstadoAprobacion: isNotEmpty(EstadoAprobacion) ? EstadoAprobacion : "",
      FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd'),
      FechaFin: dateFormat(FechaFin, 'yyyyMMdd'),
    }).then(data => {
      setAcreditacion_x_Perfil(data[0]);//->Data para histograma estado acreditación
      setAcreditacion_x_Perfil_Mes(data[1]); //->Data para histograma perfil de acreditación
      setAcreditacion_Promedio(data[2]); //->Data Histograma promedio acreditación
      setPromedioPaleteData(data[3]); //
      if (data[0].length === 0) handleInfoMessages(intl.formatMessage({ id: "MESSAGES.NO.DATA" }));

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => {
      setLoading(false);
    });
  }

  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 2; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  async function configurationCompany() {
    await obtenerSistemaConfiguracion({ IdCliente: perfil.IdCliente, IdConfiguracion: "COMPANIAMANDANTE" })//_DEFAULT
      .then(result => {
        setVarCompaniaMandanteDefault({ IdCompaniaMandante: result.Valor1, CompaniaMandante: result.Valor2 })
      }).finally();
  }

  useEffect(() => {
    configurationCompany();
    loadControlsPermission();
  }, []);


  const tabContent_ReporteHistogramaPage = () => {
    return <>
      <ReporteHistogramaPage
        dataRowEditNew={dataRowEditNew}
        setDataRowEditNew={setDataRowEditNew}
        settingDataField={dataMenu.datos}
        accessButton={accessButton}
        acreditacion_x_Perfil={acreditacion_x_Perfil}
        acreditacion_x_Perfil_Mes={acreditacion_x_Perfil_Mes}
        acreditacion_Promedio={acreditacion_Promedio}
        promedioPaleteData={promedioPaleteData}
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
        setDataGridRef={setDataGridRef}
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
                isVisibleCustomBread={false}
                isVisibleAppBar={false}
                tabIndex={tabIndex}
                handleChange={handleChange}
                orientation={"horizontal"}
                componentTabsHeaders={[
                  {
                    label: intl.formatMessage({ id: "ACCESS.HISTOGRAM" }),
                    icon: <BarChartIcon fontSize="large" />,
                    className: classes.tabContent,
                    disabled: (isNotEmpty(dataRowEditNew.MesInicio) && isNotEmpty(dataRowEditNew.MesFin)) ? false : true

                  },
                  {
                    label: intl.formatMessage({ id: "COMMON.DETAIL" }),
                    icon: <FormatListNumberedRtl fontSize="large" />,
                    className: classes.tabContent,
                    onClick: (e) => setEnabledTabDetail(false),
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

function tabPropsIndex(index) {
  return {
    id: `simple-tabpanel-${index}`,
    'aria-controls': `simple-tab-${index}`,
  };
}

export default injectIntl(WithLoandingPanel(ReporteIndexPage));
