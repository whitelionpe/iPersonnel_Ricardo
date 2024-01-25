import React, { useEffect, useRef, useState } from "react";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { useSelector } from "react-redux";
import { useStylesTab } from "../../../../../store/config/Styles";


import CustomBreadcrumbs from "../../../../../partials/layout/CustomBreadcrumbs";
import { AppBar } from '@material-ui/core';
import { Typography } from "@material-ui/core";
import { Toolbar } from "@material-ui/core";
import { exportarIncidenciaAsistencia, incidenciaAsistencia } from '../../../../../api/asistencia/reporte.api';
import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import DataGridDynamic from '../../../../../partials/components/DataGridDynamic/DataGridDynamic';
import { Portlet, PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { Button } from 'devextreme-react';
import { dateFormat, getStartOfMonthAndToday, getStartAndEndOfMonthByDay, isNotEmpty, listarEstadoSimple, PaginationSetting,listarEstadoIncidencias } from '../../../../../../_metronic';
import Form, { Item, GroupItem, EmptyItem } from "devextreme-react/form";

import AdministracionCentroCostoBuscar from '../../../../../partials/components/AdministracionCentroCostoBuscar';
import AdministracionPosicionBuscar from "../../../../../partials/components/AdministracionPosicionBuscar";
import AdministracionUnidadOrganizativaBuscar from "../../../../../partials/components/AdministracionUnidadOrganizativaBuscar";
import AsistenciaPersonaBuscar from '../../../../../partials/components/AsistenciaPersonaBuscar';

// import CalendarToday from '@material-ui/icons/CalendarToday';
// import TouchAppIcon from "@material-ui/icons/TouchApp";

import { serviceCompania } from "../../../../../api/administracion/compania.api";
import { servicePlanilla } from "../../../../../api/asistencia/planilla.api";

import TabNavContainer from "../../../../../partials/components/Tabs/TabNavContainer";
import { Reorder, CalendarToday } from "@material-ui/icons";
import MenuTreeViewPage from "../../../../../partials/content/TreeView/MenuTreeViewPage";
import SimpleDropDownBoxGrid from "../../../../../partials/components/SimpleDropDownBoxGrid/SimpleDropDownBoxGrid";

import { obtenerTodos as obtenerIncidencias } from "../../../../../api/asistencia/incidencia.api";
import AdministracionDivisionBuscar from "../../../../../partials/components/AdministracionDivisionBuscar";
import PersonaTextAreaCodigosPopup from "../../../../../partials/components/PersonaTextAreaPopup/PersonaTextAreaCodigosPopup";


export const initialFilter = {
  IdCompania: '',
  IdCliente: '',
  IdDivision: '',
  FechaDesde: '',
  FechaHasta: '',
  Activo: 'S',
  EstadoIncidencia:'T'
};

const IncidenciaAsistenciaAloneIndexPage = (props) => {
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);
  const { intl, setLoading, dataMenu } = props;
  const dataGridRef = useRef(null);
  const dataGridRefDetail = useRef(null);

  const [listarTiempoAdicional, setListarTiempoAdicional] = useState([]);
  const [listarTiempoAdicionalDetalle, setListarTiempoAdicionalDetalle] = useState([]);

  const [listarReporteIncidencias, setListarReporteIncidencias] = useState([]);
  const [listarReporteIncidenciasDetalle, setListarReporteIncidenciasDetalle] = useState([]);
  const [popupVisibleCodigoPlanilla, setPopupVisibleCodigoPlanilla] = useState(false);

  // const [selected, setSelected] = useState({});
  // const [focusedRowKey, setFocusedRowKey] = useState();

  const { FechaInicio, FechaFin } = getStartOfMonthAndToday();

  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);
  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const [dataRowEditNew, setDataRowEditNew] = useState({
    IdCliente: IdCliente,
    IdDivision: IdDivision,
    IdUnidadOrganizativa: '',
    IdPosicion: '',
    Personas: '',
    IdCentroCosto: '',
    IdPlanilla: '',
    Activo: 'S',
    FechaInicio: FechaInicio,
    FechaFin: FechaFin,
    TrabajadorHorasExtra: true,
    EstadoIncidencia:'T'
  });

  const [columnasDinamicas, setColumnasDinamicas] = useState([]);
  const [viewPagination, setViewPagination] = useState(false);
  // const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  //const [popupVisiblePersonas, setPopupVisiblePersonas] = useState(false);
  const classesEncabezado = useStylesEncabezado();

  //ADD

  const [viewFilter, setViewFilter] = useState(true);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const [companiaData, setCompaniaData] = useState([]);
  const [varIdCompania, setVarIdCompania] = useState("");
  const [varCompania, setVarCompania] = useState("");
  const [popupVisiblePosicion, setPopupVisiblePosicion] = useState(false);
  const [isVisibleCentroCosto, setisVisibleCentroCosto] = useState(false);
  const [Filtros, setFiltros] = useState({ FlRepositorio: "1", IdUnidadOrganizativa: "" });
  const [planillas, setPlanilla] = useState([]);
  const [popupVisiblePersonas, setPopupVisiblePersonas] = useState(false);
  //const [dataIdCompania, setDataIdCompania] = useState(null);//ADD
  //const [columnasEstaticas, setColumnasEstaticas] = useState([]);

  const [incidenciasSeleccionados, setIncidenciasSeleccionados] = useState([]);
  const [cmbIncidencia, setcmbIncidencia] = useState([]);
  const [isVisiblePopUpDivision, setisVisiblePopUpDivision] = useState(false);

  const [listaEventosDinamicos, setListaEventosDinamicos] = useState([]);

  const columnasEstaticas = [
    {
      dataField: "IdPersona",
      caption: intl.formatMessage({ id: "COMMON.CODE" }),
      width: 80,
      alignment: "center"
    },
    {
      dataField: "NombreCompleto",
      caption: intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" }),
      width: 220,
    },
    {
      dataField: "UnidadOrganizativa",
      caption: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.UNIDADORGANIZATIVA" }),
      width: 100,
    },
    {
      dataField: "Division",
      caption: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.VENUES" }),
      width: 100,
    },
  ]

  const columnasEstaticasDetail = [
    {
      dataField: "IdPersona",
      caption: intl.formatMessage({ id: "COMMON.CODE" }),
      width: 80,
      alignment: "center"
    },
    {
      dataField: "NombreCompleto",
      caption: intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" }),
      width: 150,
    },
    {
      dataField: "TipoDocumento",
      caption: intl.formatMessage({ id: "SECURITY.PROFILE.USER.DOCUMENTTYPE" }),
      width: 90,
      alignment: "center"
    },
    {
      dataField: "Documento",
      caption: intl.formatMessage({ id: "CASINO.REPORT.DOCUMENTNUMBER" }),
      width: 90,
      alignment: "center"
    },
    {
      dataField: "UnidadOrganizativa",
      caption: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.UNIDADORGANIZATIVA" }),
      width: 100,
    },
    {
      dataField: "Posicion",
      caption: intl.formatMessage({ id: "ACCREDITATION.COMPANY.DATA.POSITION" }),
      width: 150,
    },
    {
      dataField: "CentroCosto",
      caption: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CENTROCOSTO" }),
      width: 150,
    },
    {
      dataField: "Division",
      caption: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.VENUES" }),
      width: 90,
    },
    {
      dataField: "Activo",
      caption: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.ACTIVE" }) + " " + intl.formatMessage({ id: "CASINO.DINING.ROOM.COST.SERVICE.ASSUMED.WORKER" }),
      width: 90,
    },
    {
      dataField: "Tipo",
      caption: intl.formatMessage({ id: "COMMON.TYPE" }),
      width: 90,
    },
    {
      dataField: "Evento",
      caption: intl.formatMessage({ id: "ASSISTANCE.REPORT.INCIDENCE.DETAIL.HEADER_EVENT" }),
      width: 150,
    },
    {
      dataField: "FechaAsistencia",
      caption: intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" }),
      width: 90,
    },
    {
      dataField: "FechaHoraInicio",
      caption: intl.formatMessage({ id: "ACCESS.REPORT.STARTTIME" }),
      width: 90,
    },
    {
      dataField: "FechaHoraFin",
      caption: intl.formatMessage({ id: "ACCESS.REPORT.ENDTIME" }),
      width: 90,
    },

    {
      dataField: "Horas",
      caption: intl.formatMessage({ id: "ACCESS.HOUR" }),
      width: 90,
    },

    {
      dataField: "Comentario",
      caption: intl.formatMessage({ id: "SYSTEM.MODULERULE.COMMENTARY" }),
      width: 120,
    },


  ]

  const columnasDetalleSummary = [
    {
      column: "TiempoAdicional",
      summaryType: "custom",
      displayFormat: intl.formatMessage({ id: "COMMON.TOTAL" }) + " {0}"
    },
    {
      column: "SolicitudRechazada",
      summaryType: "custom",
      displayFormat: intl.formatMessage({ id: "COMMON.REJECTED" }) + " {0}"
    },
    {
      column: "SolicitudPendiente",
      summaryType: "custom",
      displayFormat: intl.formatMessage({ id: "COMMON.EARRING" }) + " {0}"
    },
    {
      column: "SolicitudAprobada",
      summaryType: "custom",
      displayFormat: intl.formatMessage({ id: "COMMON.APPROVED" }) + " {0}"
    },
    {
      column: "SinSolicitud",
      summaryType: "custom",
      displayFormat: intl.formatMessage({ id: "COMMON.NO.REQUEST" }) + " {0}"
    },
    {
      column: "MinutosPagados",
      summaryType: "custom",
      displayFormat: " {0}"
    },
    {
      column: "MinutosCompensados",
      summaryType: "custom",
      displayFormat: " {0}"
    },
    {
      column: "MinutosExcluidos",
      summaryType: "custom",
      displayFormat: " {0}"
    }

  ]

  const calculateCustomSummary = (options) => {

    if (options.name === "SummaryTiempoAdicional") {
      if (options.summaryProcess === 'calculate') {
        options.totalValue = options.value.TotalTiempoAdicional;
      }
    } if (options.name === "SummarySolicitudRechazada") {
      if (options.summaryProcess === 'calculate') {
        options.totalValue = options.value.TotalSolicitudRechazada;
      }
    } else if (options.name === "SummarySolicitudPendiente") {
      if (options.summaryProcess === 'calculate') {
        options.totalValue = options.value.TotalSolicitudPendiente;
      }
    } else if (options.name === "SummarySolicitudAprobada") {
      if (options.summaryProcess === 'calculate') {
        options.totalValue = options.value.TotalSolicitudAprobada;
      }
    } else if (options.name === "SummarySinSolicitud") {
      if (options.summaryProcess === 'calculate') {
        options.totalValue = options.value.TotalSinSolicitud;
      }
    } else if (options.name === "SummaryMinutosPagados") {
      if (options.summaryProcess === 'calculate') {
        options.totalValue = options.value.TotalMinutosPagados;
      }
    } else if (options.name === "SummaryMinutosCompensados") {
      if (options.summaryProcess === 'calculate') {
        options.totalValue = options.value.TotalMinutosCompensados;
      }
    } else if (options.name === "SummaryMinutosExcluidos") {
      if (options.summaryProcess === 'calculate') {
        options.totalValue = options.value.TotalMinutosExcluidos;
      }
    }

  }

  const buscarReporte = async (skip, take) => {

    try {
      let resultReport = await consultaInforme(skip, take, "S");
      //console.log("JDL-2->datosTrabadores", resultReport);
      if (resultReport.IdError === 0) {
        setTabIndex(0);

        //setListarTiempoAdicional(resultReport[0]);
        setListarReporteIncidencias(resultReport[0])
        if (resultReport.length > 1) {

          let columns = resultReport[1];//Second List for columns dynamic 
          if (columns) {
            setColumnasDinamicas(crearArregloColumnasHeader(columns));
            setListaEventosDinamicos(columns);
          }

          setTimeout(() => {
            setViewPagination(true);
          }, 500);
        }
      } else {
        setViewPagination(false);
        setColumnasDinamicas([]);
        setListaEventosDinamicos([])
      }
    } catch (error) {
      console.log(error);
      setViewPagination(false);
      setColumnasDinamicas([]);
      setListaEventosDinamicos([]);
    }
  };

  const buscarReporteDetalle = async (skip, take, IdPersona) => {

    try {
      let resultReport = await consultaInforme(skip, take, "N", IdPersona.toString());

      if (resultReport.IdError === 0) {
        setListarTiempoAdicionalDetalle(resultReport[0]);
        if (resultReport.length > 1) {
          //let columnas = resultReport[1]?.[0]?.Columnas.split(",");
          //if (columnas) setColumnasDinamicas(crearArregloColumnasHeader(columnas));
          // setTimeout(() => {
          //   setViewPagination(true);
          // }, 500);
        }
      } else {
        //setViewPagination(false);
        setColumnasDinamicas([]);
      }
    } catch (error) {
      console.log(error);
      //setViewPagination(false);
      setColumnasDinamicas([]);
    }
  };

  const crearArregloColumnasHeader = (array_header) => {
    let header_json = [];

    let EventoJustificacion = {
      dataField: "Justificaciones",
      caption: "Justificaciones",
      items: []
    };
    let EventoIncidencia = {
      dataField: "Incidencias",
      caption: "Incidencias",
      items: []
    };

    let listaJustificaciones = array_header.filter(x => x.Tipo == "J");
    let listaIncidencias = array_header.filter(x => x.Tipo == "I");

    listaJustificaciones.map(row => {
      EventoJustificacion.items.push({
        dataField: row.IdEvento,
        caption: row.Evento,
        key: row.IdEvento,
        alignment: "center",
        width: 120
      });
    });

    if (EventoJustificacion.items.length > 0)
      header_json.push(EventoJustificacion);

    listaIncidencias.map(row => {
      EventoIncidencia.items.push({
        dataField: row.IdEvento,
        caption: row.Evento,
        key: row.IdEvento,
        alignment: "center",
        width: 120
      });
    });

    if (EventoIncidencia.items.length > 0)
      header_json.push(EventoIncidencia);


    // array_header.map(row => {
    //   header_json.push({
    //     dataField: row.IdEvento,
    //     caption: row.Evento,
    //     key: row.IdEvento,
    //     alignment: "center",
    //     width: 120
    //   });
    // }); 
    return header_json;
  };

  const consultaInforme = async (skip, take, listarResumen = "S", documento = "") => {

    dataRowEditNew.Incidencias = incidenciasSeleccionados.map(x => (x.IdIncidencia)).join(',');

    const { FechaInicio, FechaFin, Activo, IdUnidadOrganizativa, IdPosicion, Personas, IdCentroCosto,
      IdPlanilla, TrabajadorHorasExtra, Incidencias, CodigoPlanilla, EstadoIncidencia } = dataRowEditNew;
    let params = {
      idDivision: IdDivision,
      idCompania: varIdCompania,
      idUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa : "",
      idPosicion: isNotEmpty(IdPosicion) ? IdPosicion : "",
      personas: listarResumen === "S" ? isNotEmpty(Personas) ? Personas : "" : documento,
      idCentroCosto: isNotEmpty(IdCentroCosto) ? IdCentroCosto : "",
      idPlanilla: isNotEmpty(IdPlanilla) ? IdPlanilla : "",
      estado: isNotEmpty(Activo) ? Activo : "",
      fechaInicio: dateFormat(FechaInicio, 'yyyyMMdd'),
      fechaFin: dateFormat(FechaFin, 'yyyyMMdd'),
      //trabajadorHorasExtra: isNotEmpty(TrabajadorHorasExtra) ? (TrabajadorHorasExtra ? 'S' : "N") : "N",
      incidencias: Incidencias,
      resumen: listarResumen,//Mostrar en resumen datos del reporte 
      codigoPlanilla: isNotEmpty(CodigoPlanilla) ? CodigoPlanilla : "", 
      estadoIncidencia: isNotEmpty(EstadoIncidencia) ? EstadoIncidencia : "T",
      skip,
      take,
      orderField: "NombreCompleto",
      orderDesc: 0
    };

    setLoading(true);

    let datos = await incidenciaAsistencia(params)
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
        return { IdErro: 1, trabajadores: [] };
      })
      .finally(() => {
        setLoading(false);
      });

    if (typeof datos === "object" && datos !== null) {
      datos.IdError = 0;
      return datos;
    } else return { IdErro: 1, trabajadores: [] };
  };

  const exportExcel = async () => {

    setTabIndex(0);
    if (dataGridRef.current.props.dataSource.length > 0) {

      let ListColumnName = [];
      let ListDataField = [];
      let listDynamicColumn = [];

      //-> Export first dataGrid - Resumen
      dataGridRef.current._optionsManager._currentConfig.configCollections.columns.forEach(item => {
        let { caption, visible, type, dataField } = item.options;
        let { columns } = item.configCollections;
        if (!!caption) {
          if ((visible === undefined || visible === true) && type !== 'buttons') {
            if (!isNotEmpty(columns)) {
              ListColumnName.push(caption.toUpperCase().replace("_", " "));
              ListDataField.push(dataField);
            }
            else {
              columns.forEach(element => {
                let { caption, visible, type, dataField } = element.options;
                if (!!caption) {
                  if ((visible === undefined || visible === true) && type !== 'buttons') {

                    ListColumnName.push(caption.toUpperCase().replace("_", " "));
                    ListDataField.push(dataField);
                  }
                }
              });
            }
          }
        }
      });

      if (columnasEstaticas.length > 0)
        columnasEstaticas.map(item => { listDynamicColumn.push(""); });

      if (listaEventosDinamicos.length > 0)
        listaEventosDinamicos.map(item => { listDynamicColumn.push(item.Tipo); });

      let arrayNombresPreCabecera = listDynamicColumn.join('|');
      let arrayNombresCabecera = ListColumnName.join('|');
      let arrayNombresData = ListDataField.join('|');

      //-> Export Second dataGrid - Detail
      ListColumnName = [];
      ListDataField = [];

      dataGridRefDetail.current._optionsManager._currentConfig.configCollections.columns.forEach(item => {
        let { caption, visible, type, dataField } = item.options;
        if (!!caption) {
          if ((visible === undefined || visible === true) && type !== 'buttons') {
            ListColumnName.push(caption.toUpperCase().replace("_", " "));
            ListDataField.push(dataField);
          }
        }
      });
      let arrayNombresCabecera2 = ListColumnName.join('|');
      let arrayNombresData2 = ListDataField.join('|');

      const {
        IdCompania, IdUnidadOrganizativa, IdPosicion,
        Personas, IdCentroCosto, IdPlanilla,
        Activo, FechaInicio, FechaFin, TrabajadorHorasExtra, EstadoIncidencia } = dataRowEditNew;


      var FirstTitleSheet = varCompania.toString().toUpperCase();
      var FirstSubTitleSheet = intl.formatMessage({ id: "CONFIG.MENU.ASSISTANCE.REPORT_INCIDENCE" });
      var SecondSubTitleSheet = intl.formatMessage({ id: "ASSISTANCE.REPORT.INCIDENCE.RESUME.SUBTITTLE_FROM" }) + " " + dateFormat(FechaInicio, 'dd/MM/yyyy') + " " +
        intl.formatMessage({ id: "ACCESS.DATE.UNTIL" }) + " " + dateFormat(FechaFin, 'dd/MM/yyyy');

      var SecondTitleSheet = intl.formatMessage({ id: "CONFIG.MENU.ASSISTANCE.REPORT_INCIDENCE" }) + " " + intl.formatMessage({ id: "COMMON.DETAIL" }) + ": " +
        intl.formatMessage({ id: "ASSISTANCE.REPORT.INCIDENCE.RESUME.SUBTITTLE_FROM" }) + " " + dateFormat(FechaInicio, 'dd/MM/yyyy') + " " +
        intl.formatMessage({ id: "ACCESS.DATE.UNTIL" }) + " " + dateFormat(FechaFin, 'dd/MM/yyyy');

      let params = {
        IdCliente: IdCliente,
        IdDivision: IdDivision,
        IdCompania: isNotEmpty(IdCompania) ? IdCompania : "",
        IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa : "",
        IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion : "",
        Personas: isNotEmpty(Personas) ? Personas : "",
        IdCentroCosto: isNotEmpty(IdCentroCosto) ? IdCentroCosto : "",
        IdPlanilla: isNotEmpty(IdPlanilla) ? IdPlanilla : "",
        Estado: isNotEmpty(Activo) ? Activo : "",
        FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd'),
        FechaFin: dateFormat(FechaFin, 'yyyyMMdd'),
        TrabajadorHorasExtra: TrabajadorHorasExtra ? 'S' : "N",
        EstadoIncidencia: isNotEmpty(EstadoIncidencia) ? EstadoIncidencia : "T",

        TitleSheet: FirstTitleSheet,
        FirstSubtitleSheet: FirstSubTitleSheet,
        SecondSubtitleSheet: SecondSubTitleSheet,
        NameSheet: intl.formatMessage({ id: "COMMON.SUMMARY" }),
        ArrayDataField: arrayNombresData,
        ArrayTitleHeader: arrayNombresCabecera,
        ArrayPreTitleHeader: arrayNombresPreCabecera,

        TitleSheetTwo: SecondTitleSheet,
        NameSheetTwo: intl.formatMessage({ id: "COMMON.DETAIL" }),
        ArrayDataFieldTwo: arrayNombresData2,
        ArrayTitleHeaderTwo: arrayNombresCabecera2,

        FileName: intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })

      };
      setLoading(true);
      await exportarIncidenciaAsistencia(params).then(response => {
        if (isNotEmpty(response.fileBase64)) {
          let download = document.createElement('a');
          download.href = `data:application/vnd.ms-excel;base64,${encodeURIComponent(response.fileBase64)}`;
          download.download = response.fileName;
          download.click();
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.DOWNLOAD.SUCESS" }));
        }

      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => {
        setLoading(false);
      })

    }
  }


  const limpiar = () => {
    const { FechaInicio, FechaFin } = getStartOfMonthAndToday();

    setDataRowEditNew({
      IdCliente: IdCliente,
      IdDivision: IdDivision,
      IdCompania: varIdCompania,
      IdUnidadOrganizativa: '',
      IdPosicion: '',
      Personas: '',
      IdCentroCosto: '',
      IdPlanilla: '',
      Activo: 'S',
      FechaInicio: FechaInicio,
      FechaFin: FechaFin,
      TrabajadorHorasExtra: true,
      EstadoIncidencia:'T'
    });
    buscarReporte(0, PaginationSetting.TOTAL_RECORDS)
  };

  const selectUnidadOrganizativa = async (selectedRow) => {
    let strUnidadesOrganizativas = selectedRow.map(x => x.IdUnidadOrganizativa).join('|');
    let UnidadesOrganizativasDescripcion = selectedRow.map(x => x.Menu).join(',');
    dataRowEditNew.IdUnidadOrganizativa = strUnidadesOrganizativas;
    dataRowEditNew.UnidadesOrganizativas = UnidadesOrganizativasDescripcion;
    setPopupVisibleUnidad(false);
  };

  const selectPosicion = async (dataPopup) => {
    const { IdPosicion, Posicion } = dataPopup[0];
    dataRowEditNew.IdPosicion = IdPosicion;
    dataRowEditNew.Posicion = Posicion;
    setPopupVisiblePosicion(false);
  }

  async function selectPersona(personas) {
    dataRowEditNew.ListaPersona = personas.map(x => ({ Documento: x.Documento, NombreCompleto: x.NombreCompleto }));
    let cadenaMostrar = personas.map(x => (x.NombreCompleto)).join(', ');
    if (cadenaMostrar.length > 100) {
      cadenaMostrar = cadenaMostrar.substring(0, 100) + '...';
    }
    dataRowEditNew.PersonasView = cadenaMostrar;
    dataRowEditNew.Personas = personas.map(x => (x.Documento)).join('|');
    setPopupVisiblePersonas(false);

  }

  const agregarCentroCosto = (dataPopup) => {
    const { IdCentroCosto, CentroCosto } = dataPopup[0];
    dataRowEditNew.IdCentroCosto = IdCentroCosto;
    dataRowEditNew.CentroCosto = CentroCosto;
    setisVisibleCentroCosto(false);
  };

  const obtenerCodigoPlanilla = (data) => {
    if (isNotEmpty(data)) {
      let strCodigos = data.split('|').join(',');
      dataRowEditNew.CodigoPlanilla = strCodigos;
    }
  }

  async function listarPlanilla(strIdCompania) {
    setLoading(true);

    if (!isNotEmpty(strIdCompania)) return;

    await servicePlanilla.listar(
      {
        IdCliente
        , IdCompania: strIdCompania
        , IdPlanilla: '%'
        , NumPagina: 0
        , TamPagina: 0
      }
    ).then(planillas => {
      setPlanilla(planillas);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

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

  async function getCompanySeleccionada(idCompania, company) {
    if (isNotEmpty(idCompania)) {
      setVarIdCompania(idCompania);
      setVarCompania(company[0].Compania);
    }
  }

  async function listarIncidencias() {
    setLoading(true);

    await obtenerIncidencias({
      IdIncidencia: "%",
      Adicional: "N"
    }).then(response => {
      setcmbIncidencia(response);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  const selectDivision = (division) => {
    const { IdDivision, Division } = division
    dataRowEditNew.IdDivision = IdDivision;
    dataRowEditNew.Division = Division;
    setisVisiblePopUpDivision(false);
  };


  useEffect(() => {
    if (!isNotEmpty(varIdCompania)) {

      if (companiaData.length > 0) {
        const { IdCompania } = companiaData[0];
        var company = companiaData.filter(x => x.IdCompania === IdCompania);
        getCompanySeleccionada(IdCompania, company);
        //setDataIdCompania(companiaData)

        //JDL-2022-11-25->Se debe seleccionar compania por defecto.
        listarPlanilla(IdCompania);
      }
    }
  }, [companiaData]);


  useEffect(() => {
    listarCompanias();
    listarIncidencias();
    setTimeout(() => {
      //LSF- Carga Inicial
      buscarReporte(0, PaginationSetting.TOTAL_RECORDS)
      //if (isNotEmpty(varIdCompania)) buscarReporte(0, PaginationSetting.TOTAL_RECORDS); 
    }, 500);
  }, []);


  const datosGenerales = (e) => {
    return (
      <>

        <Form formData={dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} colSpan={2} >
            <Item dataField="IdUnidadOrganizativa" visible={false} />
            <Item dataField="IdPerfil" visible={false} />

            <Item
              colSpan={2}
              dataField="IdCompania"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }) }}
              editorType="dxSelectBox"
              isRequired={true}
              editorOptions={{
                items: companiaData,
                valueExpr: "IdCompania",
                displayExpr: "Compania",
                //showClearButton: true,
                searchEnabled: true,
                value: varIdCompania,
                onValueChanged: (e) => {
                  if (isNotEmpty(e.value)) {
                    var company = companiaData.filter(x => x.IdCompania === e.value);
                    getCompanySeleccionada(e.value, company);
                    // props.setFocusedRowKey();
                    //JDL->2022-11-25->Actualizar plantilla por compania.
                    listarPlanilla(e.value);
                  }

                },
              }}
            />

            <Item
              colSpan={2}
              dataField="UnidadesOrganizativas"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.ORGANIZATIONALUNIT" }) }}
              editorOptions={{
                readOnly: true,
                hoverStateEnabled: false,
                inputAttr: { 'style': 'text-transform: uppercase' },
                showClearButton: true,
                buttons: [{
                  name: 'search',
                  location: 'after',
                  useSubmitBehavior: true,
                  options: {
                    stylingMode: 'text',
                    icon: 'search',
                    disabled: false,
                    onClick: () => {
                      setPopupVisibleUnidad(true);
                    },
                  }
                }]
              }}
            />

            <Item
              colSpan={2}
              dataField="CentroCosto"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CENTROCOSTO" }), }}
              editorOptions={{
                readOnly: true,
                hoverStateEnabled: false,
                inputAttr: { style: "text-transform: uppercase" },
                showClearButton: true,
                buttons: [
                  {
                    name: "search",
                    location: "after",
                    useSubmitBehavior: true,
                    options: {
                      stylingMode: "text",
                      icon: "search",
                      disabled: false,
                      onClick: () => {
                        setFiltros({ FlRepositorio: "1", IdUnidadOrganizativa: "" })
                        setisVisibleCentroCosto(true);
                      },
                    },
                  },
                ],
              }}
            />
            <Item
              colSpan={2}
              dataField="IdPlanilla"
              label={{ text: intl.formatMessage({ id: "ASSISTANCE.PAYROLL" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: planillas,
                valueExpr: "IdPlanilla",
                displayExpr: "Planilla",
                searchEnabled: true,
                showClearButton: true,
                //onValueChanged: (e) => { valueChangedTipoPlantilla(e.value); }
              }}
            />

            <Item
              colSpan={2}
              dataField="Division"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.DIVISION.NAME" }), }}
              editorOptions={{
                //valueExpr:perfil.IdDivision,
                readOnly: true,
                hoverStateEnabled: false,
                inputAttr: { style: "text-transform: uppercase" },
                showClearButton: true,
                buttons: [
                  {
                    name: "search",
                    location: "after",
                    useSubmitBehavior: true,
                    options: {
                      stylingMode: "text",
                      icon: "search",
                      disabled: false,
                      onClick: (evt) => {
                        setisVisiblePopUpDivision(true);
                      },
                    },
                  },
                ],
              }}
            />

          </GroupItem>
        </Form>
      </>
    );
  }

  const hideFilter = () => {
    let form = document.getElementById("FormFilter");
    if (viewFilter) {
      setViewFilter(false);
      form.classList.add('hidden');
    } else {
      form.classList.remove('hidden');
      setViewFilter(true);
    }
  }

  const seleccionarRegistro = async (dataRow) => {
    //console.log("seleccionarRegistro", dataRow);
    const { RowIndex, IdPersona } = dataRow;
    localStorage.setItem("xIdPersona", IdPersona);
    //setSelected(dataRow);
    //setFocusedRowKey(RowIndex);

  }

  const openTabDetail = async () => {
    //const { Documento } = selected;
    //console.log("openTabDetail", selected);
    var IdPersona = localStorage.getItem("xIdPersona");
    console.log("xIdPersona", IdPersona);
    if (isNotEmpty(IdPersona)) {
      await buscarReporteDetalle(0, PaginationSetting.TOTAL_RECORDS, IdPersona);
    }

  }
  const onRowDblClick = async (e) => {

    if (isNotEmpty(e.data.IdPersona)) {
      setTabIndex(1)
      await buscarReporteDetalle(0, PaginationSetting.TOTAL_RECORDS, e.data.IdPersona);
    }
  }

  const onFocusedRowChanged = async (e) => {
    if (e.rowIndex === -1) return;
    seleccionarRegistro(e.row.data);

  }

  const dataGridEvents = {
    onFocusedRowChanged,
    onRowDblClick,
  }

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Estado === 'SIN.SOLICITUD') {
        e.cellElement.style.color = 'red';
      }
    }
  }
  const dataGridEventsDetail = {
    onCellPrepared,
  }

  const grupoTrabajador = (e) => {
    return (
      <>

        <Form formData={dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >

            <Item
              colSpan={2}
              dataField="PersonasView"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.PERSON" }) }}
              editorOptions={{
                readOnly: true,
                hoverStateEnabled: false,
                inputAttr: { 'style': 'text-transform: uppercase' },
                showClearButton: true,
                buttons: [{
                  name: 'search',
                  location: 'after',
                  useSubmitBehavior: true,
                  options: {
                    stylingMode: 'text',
                    icon: 'search',
                    disabled: false,
                    onClick: () => {
                      setPopupVisiblePersonas(true);
                    },
                  }
                }]
              }} />
            <Item dataField="Personas" visible={false}></Item>

            <Item
              colSpan={2}
              dataField="Activo"
              label={{ text: intl.formatMessage({ id: "CASINO.REPORT.WORKINGSTATUS" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: listarEstadoSimple(),
                valueExpr: "Valor",
                displayExpr: "Descripcion",
                showClearButton: true,
                //onValueChanged: (e) => { valueChangedEstado(e.value); }
              }}
            />

            <Item
              colSpan={2}
              dataField="Posicion"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION" }) }}
              editorOptions={{
                readOnly: true,
                hoverStateEnabled: false,
                inputAttr: { 'style': 'text-transform: uppercase' },
                showClearButton: true,
                buttons: [{
                  name: 'search',
                  location: 'after',
                  useSubmitBehavior: true,
                  options: {
                    stylingMode: 'text',
                    icon: 'search',
                    disabled: false,
                    onClick: () => {
                      setPopupVisiblePosicion(true);
                    },
                  }
                }]
              }}
            />

            <Item
              dataField="CodigoPlanilla"
              label={{ text: intl.formatMessage({ id: "CASINO.REPORT.SPREADCODE" }), }}
              colSpan={2}
              editorOptions={{
                readOnly: true,
                hoverStateEnabled: false,
                inputAttr: { style: "text-transform: uppercase" },
                showClearButton: true,
                buttons: [
                  {
                    name: "search",
                    location: "after",
                    useSubmitBehavior: true,
                    options: {
                      stylingMode: "text",
                      icon: "search",
                      disabled: false,
                      onClick: () => {
                        setPopupVisibleCodigoPlanilla(true);
                      },
                    },
                  },
                ],
              }}
            />

            <Item colSpan={2} />
            <Item colSpan={2} />
            <Item colSpan={2} />
            <Item colSpan={2} />

          </GroupItem>
        </Form>
      </>
    );
  }

  const incidencias = (e) => {
    return (
      <>

        <Form formData={dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={4} >

            <Item
              dataField="Incidencias"
              colSpan={1}
            >
              <SimpleDropDownBoxGrid
                ColumnDisplay={"Incidencia"}
                placeholder={intl.formatMessage({ id: "ASSISTANCE.INCIDENCE.JUSTIFICATION.MASSIVE.SELECT_TEXT" })}
                SelectionMode="multiple"
                dataSource={cmbIncidencia}
                Columnas={[{ dataField: "Incidencia", caption: intl.formatMessage({ id: "ASSISTANCE.INCIDENCE.INCIDENCE" }), width: '100%' }]}
                setSeleccionados={setIncidenciasSeleccionados}
                Seleccionados={incidenciasSeleccionados}
                pageSize={10}
                pageEnabled={true}
              />
            </Item>

            
            <Item
              colSpan={1}
              dataField="EstadoIncidencia"
              label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: listarEstadoIncidencias(),
                valueExpr: "Valor",
                displayExpr: "Descripcion",
                showClearButton: true,
                //onValueChanged: (e) => { valueChangedEstado(e.value); }
              }}
            />


            <Item
              dataField="FechaInicio"
              label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" }) }}
              isRequired={true}
              colSpan={1}
              editorType="dxDateBox"
              dataType="date"
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                displayFormat: "dd/MM/yyyy",
              }}
            />

            <Item
              dataField="FechaFin"
              label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" }) }}
              isRequired={true}
              colSpan={1}
              editorType="dxDateBox"
              dataType="date"
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                displayFormat: "dd/MM/yyyy",
              }}
            />

          </GroupItem>
        </Form>
      </>
    );
  }
  //++++++++++++++++++++++++++++++++++++++++++++
  const tabContent_Resumen = () => {
    return <>
      <br />
      <DataGridDynamic
        id='dg_Reporte10_Incidencia'
        intl={intl}
        dataSource={listarReporteIncidencias}
        staticColumns={columnasEstaticas}
        dynamicColumns={columnasDinamicas}
        isLoadedResults={viewPagination}
        setIsLoadedResults={setViewPagination}
        refreshDataSource={buscarReporte}
        keyExpr="RowIndex"
        //focusedRowEnabled={true}
        //focusedRowKey={focusedRowKey}
        dataGridRef={dataGridRef}
        events={{ ...dataGridEvents }}

      />
      <div style={{ display: 'none' }}>
        {/*Se asigna grilla espejo para exportar*/}
        <DataGridDynamic
          id='dg_Reporte10_IncidenciaDetalleEx'
          intl={intl}
          //dataSource={listarTiempoAdicionalDetalle}
          staticColumns={columnasEstaticasDetail}
          dynamicColumns={[]}//{columnasDinamicas}
          //isLoadedResults={viewPagination}
          //setIsLoadedResults={setViewPagination}
          //refreshDataSource={buscarReporteDetalle}
          keyExpr="RowIndex"
          dataGridRef={dataGridRefDetail}

        />
      </div>
    </>
  }
  const tabContent_Detalle = () => {
    return <>
      <br />
      <DataGridDynamic
        id='dg_Reporte10_IncidenciaDetalle'
        intl={intl}
        dataSource={listarTiempoAdicionalDetalle}
        staticColumns={columnasEstaticasDetail}
        dynamicColumns={[]} //{columnasDinamicas}
        summaryItems={columnasDetalleSummary}
        isLoadedResults={viewPagination}
        setIsLoadedResults={setViewPagination}
        refreshDataSource={buscarReporteDetalle}
        keyExpr="RowIndex"
        dataGridRef={dataGridRefDetail}
        calculateCustomSummary={calculateCustomSummary}
        events={{ ...dataGridEventsDetail }}
      />
    </>
  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return <>
    <a id="iddescarga" className="" ></a>
    <CustomBreadcrumbs
      Title={intl.formatMessage({ id: "ASSISTANCE.MAIN" })}
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

      <PortletHeader
        title={""}
        toolbar={
          <PortletHeaderToolbar>
            <Button icon={viewFilter ? "chevronup" : "chevrondown"}
              type="default"
              hint={viewFilter ? intl.formatMessage({ id: "COMMON.HIDE" }) : intl.formatMessage({ id: "COMMON.SHOW" })}
              onClick={hideFilter} />
            &nbsp;
            <Button
              icon="fa fa-search"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.SEARCH" })}
              onClick={e => {
                buscarReporte(0, PaginationSetting.TOTAL_RECORDS);
              }}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
            />
            &nbsp;
            <Button
              icon="refresh"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
              onClick={limpiar}
              visible={true}
            />
            &nbsp;
            <Button
              icon="fa fa-file-excel"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
              onClick={exportExcel}
            />
          </PortletHeaderToolbar>
        }
      />

      <PortletBody>
        <React.Fragment>
          <Form id="FormFilter" formData={dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={2} colSpan={2}>

              <div className="row">

                <div className="col-md-6">
                  <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" >   <h5>{intl.formatMessage({ id: "ACCREDITATION.PEOPLE.GENERALDATA" })} </h5></legend>
                    {datosGenerales()}
                  </fieldset>
                </div>

                <div className="col-md-6" >
                  <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" >   <h5> {intl.formatMessage({ id: "ADMINISTRATION.POSITION.WORKER" })}   </h5></legend>
                    {grupoTrabajador()}
                  </fieldset>
                </div>

                <div className="col-md-12" style={{ marginTop: "10px" }}>
                  <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" >   <h5>{intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.INCIDENCIAS" })} </h5></legend>
                    {incidencias()}
                  </fieldset>
                </div>

              </div>

            </GroupItem>
          </Form>

          <br />

          <TabNavContainer
            isVisibleCustomBread={false}
            isVisibleAppBar={false}
            tabIndex={tabIndex}
            handleChange={handleChange}
            orientation={"horizontal"}
            componentTabsHeaders={[
              {
                label: intl.formatMessage({ id: "COMMON.SUMMARY" }),
                icon: <CalendarToday fontSize="medium" />,
                className: classes.tabContent
              },
              {
                label: intl.formatMessage({ id: "COMMON.DETAIL" }),
                icon: <Reorder fontSize="medium" />,
                className: classes.tabContent,
                onClick: openTabDetail
              },
            ]}
            className={classes.tabContent}
            componentTabsBody={
              [
                tabContent_Resumen(),
                tabContent_Detalle(),
              ]
            }

          />


        </React.Fragment>
      </PortletBody>

    </Portlet>

    {/*******>POPUP NUMERO CODIGO PLANILLA>******** */}
    {popupVisibleCodigoPlanilla && (
      <PersonaTextAreaCodigosPopup
        isVisiblePopupDetalle={popupVisibleCodigoPlanilla}
        setIsVisiblePopupDetalle={setPopupVisibleCodigoPlanilla}
        obtenerCodigoIngresado={obtenerCodigoPlanilla}

      />
    )}

    {/*******>POPUP DE UNIDAD ORGA.>******** */}
    {popupVisibleUnidad && (
      <AdministracionUnidadOrganizativaBuscar
        selectData={selectUnidadOrganizativa}
        showPopup={{ isVisiblePopUp: popupVisibleUnidad, setisVisiblePopUp: setPopupVisibleUnidad }}
        cancelarEdicion={() => setPopupVisibleUnidad(false)}
        selectionMode={"multiple"}
        showCheckBoxesModes={"normal"}
      />
    )}

    {/*******>POPUP DE UNIDAD ORGA. CON POSICIONES>******** */}
    {popupVisiblePosicion && (
      < AdministracionPosicionBuscar
        selectData={selectPosicion}
        showPopup={{ isVisiblePopUp: popupVisiblePosicion, setisVisiblePopUp: setPopupVisiblePosicion }}
        cancelarEdicion={() => setPopupVisiblePosicion(false)}
        uniqueId={"posionesBuscarPersonaListR003"}
      />
    )}

    {/*******>POPUP DE DIVISIÓN>******** */}
    {isVisiblePopUpDivision && (
      <AdministracionDivisionBuscar
        showPopup={{ isVisiblePopUp: isVisiblePopUpDivision, setisVisiblePopUp: setisVisiblePopUpDivision }}
        cancelar={() => setisVisiblePopUpDivision(false)}
        selectData={selectDivision}
        selectionMode={"row"}
      />
    )}


    {/*******>POPUP CENTRO DE COSTOS>******** */}
    {isVisibleCentroCosto && (
      <AdministracionCentroCostoBuscar
        selectData={agregarCentroCosto}
        showButton={false}
        showPopup={{ isVisiblePopUp: isVisibleCentroCosto, setisVisiblePopUp: setisVisibleCentroCosto }}
        cancelarEdicion={() => setisVisibleCentroCosto(false)}
        uniqueId={"centrCostoConsumo01Page"}
        selectionMode={"row"}
        Filtros={Filtros}
      />
    )}

    {/*******>POPUP NUMERO DE DOCUMENTOS>******** */}
    {popupVisiblePersonas && (
      <AsistenciaPersonaBuscar
        showPopup={{ isVisiblePopUp: popupVisiblePersonas, setisVisiblePopUp: setPopupVisiblePersonas }}
        cancelar={() => setPopupVisiblePersonas(false)}
        agregar={selectPersona}
        selectionMode={"multiple"}
        uniqueId={"TiempoAdicionalAsistenciaPersonaBuscar"}
        varIdCompania={varIdCompania}
      />
    )}

  </>
};

export default injectIntl(WithLoandingPanel(IncidenciaAsistenciaAloneIndexPage));
