import React, { useEffect, useState } from "react";
import { useStylesTab } from "../../../../store/config/Styles";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import { injectIntl } from "react-intl";
import WithLoandingPanel from "../../../../partials/content/withLoandingPanel";
import {
  dateFormat,
  getStartAndEndOfMonthByDay,
  isNotEmpty
} from "../../../../../_metronic";
import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
import AssignmentTurnedInOutlinedIcon from "@material-ui/icons/AssignmentTurnedInOutlined";
import BallotOutlinedIcon from "@material-ui/icons/BallotOutlined";
import "./SolicitudIndexPage.css";
import SolicitudListPage from "./SolicitudListPage";
import SolicitudEditPage from "./SolicitudEditPage";
import { useSelector } from "react-redux";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
import { serviceCompania } from "../../../../api/administracion/compania.api";
import { obtener as obtenerSolicitud } from "../../../../api/asistencia/solicitudhhee.api";
import { listar as listarSolicitud } from "../../../../api/asistencia/solicitudhheedetalledia.api";
import { listarxnivel as listaraprobadores } from "../../../../api/asistencia/aprobacionhhee.api";
import { handleErrorMessages } from "../../../../store/ducks/notify-messages";
import { servicePlanilla } from "../../../../api/asistencia/planilla.api";

const SolicitudIndexPage = ({ intl, setLoading, dataMenu }) => {
  const classes = useStylesTab();
  const { IdCliente, IdDivision } = useSelector(
    state => state.perfil.perfilActual
  );
  const [tabIndex, setTabIndex] = useState(0);
  const [loadDefaultCompany, setLoadDefaultCompany] = useState(false);
  /***************************************** */
  const ds = new DataSource({
    store: new ArrayStore({ data: [], key: "RowIndex" }),
    reshapeOnPush: false
  });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();
  const { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay();
  const initialFilter = {
    IdDivision,
    IdCompania: "",
    IdPlanilla: "",
    ListaPersonaView: "",
    FechaInicio,
    FechaFin
  };
  const [refreshDataHeader, setRefreshDataHeader] = useState(false);
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [selectedRow, setSelectedRow] = useState({});
  const [dataSourceDatalle, setDataSourceDatalle] = useState([]);
  const [dataSourceAprobadores, setDataSourceAprobadores] = useState([]);
  const [enableTabRequest, setEnableTabRequest] = useState(false);
  const [companiaData, setCompaniaData] = useState([]);
  const [planillas, setPlanilla] = useState([]);
  // const { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay();
  const [filterData, setFilterData] = useState({
    ...initialFilter
  });
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const keysToGenerateFilter = [
    "IdUsuario",
    "IdCliente",
    "IdDivision",
    "Estado",
    "FechaInicio",
    "FechaFin",
    "IdCompania",
    "IdPlanilla",
    "Personas"
  ];
  /***************************************** */

  const titleHeaderToolbar = () => {
    return `${intl.formatMessage({
      id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}`
    })} `;
  };

  useEffect(() => {
    listarCompanias();
   
  }, []);

  async function listarCompanias() {
    let data = await serviceCompania
      .obtenerTodosConfiguracion({
        IdCliente: IdCliente,
        IdModulo: dataMenu.info.IdModulo,
        IdAplicacion: dataMenu.info.IdAplicacion,
        IdConfiguracion: "ID_COMPANIA"
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      });
    setCompaniaData(data);

    if (data.length > 0) {
      const { IdCompania } = data[0];
      console.log("Se carga por defecto", { data, IdCompania });

      setFilterData(prev => ({
        ...prev,
        IdCompania,
        FechaInicio,
        FechaFin
      }));

      listarPlanilla(IdCompania);
    }
    setLoadDefaultCompany(true);
    setRefreshDataHeader(true);
  }

  async function listarPlanilla(strIdCompania) {
    setLoading(true);
    if (!isNotEmpty(strIdCompania)) return;
    await servicePlanilla
      .listar({
        IdCliente,
        IdCompania: strIdCompania,
        IdPlanilla: "%",
        NumPagina: 0,
        TamPagina: 0
      })
      .then(planillas => {
        setPlanilla(planillas);
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const visualizarRegistro = async data => {
    setLoading(true);

    let { IdCompania, IdSolicitudHHEE, IdPersona, Documento, Nombres } = data;
    //Listar([FromQuery] string fechaInicio, string fechaFin,string estado,int idSolicitud)
    // int idSolicitud)
    await Promise.all([
      obtenerSolicitud({ IdSolicitud: IdSolicitudHHEE, IdPersona }),
      listarSolicitud({ IdSolicitud: IdSolicitudHHEE, IdPersona }),
      listaraprobadores({
        IdCompania: IdCompania,
        IdSolicitud: IdSolicitudHHEE,
        IdPersona
      })
    ])
      .then(resp => {
        let [cabecera, detalle, aprobadores] = resp;
        setSelectedRow({
          ...cabecera,
          Documento,
          IdPersona,
          NombresTrabajador: Nombres,
          FechaInicio: dateFormat(cabecera.FechaInicio, "dd/MM/yyyy"),
          FechaFin: dateFormat(cabecera.FechaFin, "dd/MM/yyyy")
        });

        let tmpDataSource = detalle.reduce((oldItem, item) => {
          let {
            IdPersona,
            FechaAprobacion,
            Nombres,
            EstadoAprobacion,
            Fecha,
            Minutos,
            MinutosCompensados,
            MinutosExcluidos,
            MinutosPagados,
            Documento
          } = item;

          let itemDetalle = {
            Fecha,
            Minutos,
            MinutosCompensados,
            MinutosExcluidos,
            MinutosPagados
          };

          let currentIndex = oldItem.findIndex(x => x.IdPersona === IdPersona);

          if (currentIndex >= 0) {
            oldItem[currentIndex].Detalle.push(itemDetalle);
            oldItem[currentIndex].Minutos += Minutos;
            oldItem[currentIndex].MinutosCompensados += MinutosCompensados;
            oldItem[currentIndex].MinutosExcluidos += MinutosExcluidos;
            oldItem[currentIndex].MinutosPagados += MinutosPagados;
          } else {
            //Nuevo:
            oldItem.push({
              IdPersona,
              FechaAprobacion,
              Nombres,
              EstadoAprobacion,
              Documento,
              Minutos,
              MinutosCompensados,
              MinutosExcluidos,
              MinutosPagados,
              Detalle: [itemDetalle]
            });
          }
          return oldItem;
        }, []);
        setDataSourceDatalle(tmpDataSource);
        setDataSourceAprobadores(aprobadores);
        setEnableTabRequest(true);
        changeTabIndex(1);
      })
      .catch(err => {});
    setLoading(false);
  };

  const changeTabIndex = index => {
    handleChange(null, index);
  };

  const handleChange = (event, newValue) => {
    //Estado cambio de tabs
    setTabIndex(newValue);
  };

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setEnableTabRequest(false);
    // setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataSourceDatalle([]);
    setDataSourceAprobadores([]);
    setSelectedRow({});
  };

  const getInfo = () => {
    const { Documento, NombresTrabajador } = selectedRow;
    return [
      {
        text: [intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })],
        value: Documento,
        colSpan: 2
      },
      {
        text: [intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })],
        value: NombresTrabajador,
        colSpan: 4
      }
    ];
  };

  return loadDefaultCompany ? (
    <TabNavContainer
      title={intl.formatMessage({ id: "ASSISTANCE.MAIN" })}
      submenu={intl.formatMessage({
        id: "CONFIG.MENU.ASISTENCIA.GESTIÓN_DE_INCIDENCIAS"
      })}
      subtitle={`${intl.formatMessage({
        id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}`
      })} `}
      nombrebarra={titleHeaderToolbar()}
      tabIndex={tabIndex}
      componentTabsHeaders={[
        {
          label: intl.formatMessage({ id: "SECURITY.PROFILE.MENU.LIST" }),
          icon: <FormatListNumberedIcon fontSize="large" />,
          onClick: () => {
            //onChangeTab(0);
            setEnableTabRequest(true);
          },
          disabled: false
        },
        {
          label: intl.formatMessage({
            id: "ACCREDITATION.REQUEST"
          }),
          icon: <AssignmentTurnedInOutlinedIcon fontSize="large" />,
          onClick: () => {
            //onChangeTab(1);
          },
          disabled: !enableTabRequest
        }
      ]}
      className={classes.tabContent}
      handleChange={handleChange}
    >
      <SolicitudListPage
        intl={intl}
        IdDivision={IdDivision}
        dataSource={dataSource}
        isFirstDataLoad={isFirstDataLoad}
        refreshData={refreshDataHeader}
        keysToGenerateFilter={keysToGenerateFilter}
        filterData={filterData}
        setCustomDataGridIsBusy={setCustomDataGridIsBusy}
        customDataGridIsBusy={customDataGridIsBusy}
        refresh={refresh}
        setRefreshData={setRefreshDataHeader}
        resetLoadOptions={resetLoadOptions}
        setFilterData={setFilterData}
        setLoading={setLoading}
        visualizarRegistro={visualizarRegistro}
        dataMenu={dataMenu}
        IdCliente={IdCliente}
        companiaData={companiaData}
        planillas={planillas}
        listarPlanilla={listarPlanilla}
      />
      <SolicitudEditPage
        intl={intl}
        dataRowEditNew={selectedRow}
        dataSource={dataSourceDatalle}
        dataSourceAprobadores={dataSourceAprobadores}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
      />
    </TabNavContainer>
  ) : null;
};

export default injectIntl(WithLoandingPanel(SolicitudIndexPage));
