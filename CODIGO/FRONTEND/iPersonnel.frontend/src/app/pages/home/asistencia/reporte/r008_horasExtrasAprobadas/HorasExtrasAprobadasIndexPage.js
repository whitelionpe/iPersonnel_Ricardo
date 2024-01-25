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
import { exportarHorasExtrasAprobadas, horasExtrasAprobadas } from '../../../../../api/asistencia/reporte.api';
import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import DataGridDynamic from '../../../../../partials/components/DataGridDynamic/DataGridDynamic';
import { Portlet, PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { Button } from 'devextreme-react';
import { dateFormat, getStartOfMonthAndToday, isNotEmpty, listarEstadoSimple, PaginationSetting } from '../../../../../../_metronic';
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


export const initialFilter = {
  IdCompania: '',
  IdCliente: '',
  IdDivision: '',
  FechaDesde: '',
  FechaHasta: '',
  Activo: 'S',
};

const HorasExtrasAprobadasIndexPage = (props) => {
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);
  const { intl, setLoading, dataMenu } = props;
  const dataGridRef = useRef(null);
  const dataGridRefDetail = useRef(null);

  const [listarTiempoAdicional, setListarTiempoAdicional] = useState([]);
  const [listarTiempoAdicionalDetalle, setListarTiempoAdicionalDetalle] = useState([]);

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
    TrabajadorHorasExtra: true
  });

  const [columnasDinamicas, setColumnasDinamicas] = useState([]);
  const [viewPagination, setViewPagination] = useState(false);
  const classesEncabezado = useStylesEncabezado();

  //ADD

  const [viewFilter, setViewFilter] = useState(true);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const [companiaData, setCompaniaData] = useState([]);
  const [varIdCompania, setVarIdCompania] = useState("");
  const [popupVisiblePosicion, setPopupVisiblePosicion] = useState(false);
  const [isVisibleCentroCosto, setisVisibleCentroCosto] = useState(false);
  const [Filtros, setFiltros] = useState({ FlRepositorio: "1", IdUnidadOrganizativa: "" });
  const [planillas, setPlanilla] = useState([]);
  const [popupVisiblePersonas, setPopupVisiblePersonas] = useState(false);

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
      dataField: "Documento",
      caption: intl.formatMessage({ id: "CASINO.REPORT.DOCUMENTNUMBER" }),
      width: 100,
      alignment: "center"
    },
    {
      dataField: "UnidadOrganizativa",
      caption: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.UNIDADORGANIZATIVA" }),
      width: 150,
    },
    {
      dataField: "Division",
      caption: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.VENUES" }),
      width: 100,
    },
    {
      dataField: "CentroCosto",
      caption: intl.formatMessage({ id: "CASINO.REPORT.COSTCENTER" }),
      width: 110,
    },
    {
      dataField: "Posicion",
      caption: intl.formatMessage({ id: "ACCREDITATION.COMPANY.DATA.POSITION" }),
      width: 180,
    },
    
    {
      dataField: "TotalTiempoAdicional",
      caption: intl.formatMessage({ id: "CASINO.CONSOLIDATED.REPORT.TOTAL" }) + " " + intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.TIEMPO" }),
      width: 120,
      alignment: "center"
    },
   
    {
      dataField: "TotalCompensados",
      caption: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.TIEMPOCOMPENSADO" }),
      width: 130,
      alignment: "center"
    },
    {
      dataField: "TotalExcluidos",
      caption: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.TIEMPOEXCLUIDO" }),
      width: 120,
      alignment: "center"
    },
    // {
    //   dataField: "TotalSolicitudAprobada",
    //   caption: intl.formatMessage({ id: "COMMON.APPROVED" }),
    //   width: 120,
    //   alignment: "center"
    // },
    {
      dataField: "TotalPagados",
      caption: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.TIEMPOPAGADO" }),
      width: 120,
      alignment: "center"
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
      dataField: "Division",
      caption: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.VENUES" }),
      width: 90,
    },
    {
      dataField: "Posicion",
      caption: intl.formatMessage({ id: "ACCREDITATION.COMPANY.DATA.POSITION" }),
      width: 150,
    },
    {
      dataField: "IdPlanilla",
      caption: intl.formatMessage({ id: "ASSISTANCE.PAYROLL" }),
      width: 80,
    },
    {
      dataField: "Horario",
      caption: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE" }),
      width: 150,
    },
    {
      dataField: "HorarioSemanal",
      caption: intl.formatMessage({ id: "ASSISTANCE.DAY.ACTIVITY" }),
      width: 120,
      alignment: "center"
    },
    {
      dataField: "DiaSemana",
      caption: intl.formatMessage({ id: "SYSTEM.COUNTRY.HOLIDAY.DAY" }),
      width: 100,
      //alignment: "Left"
    },
    {
      dataField: "FechaAsistencia",
      caption: intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" }),
      width: 100,
      alignment: "center"
    },
    {
      dataField: "Feriado",
      caption: intl.formatMessage({ id: "ADMINISTRATION.HOLIDAY" }),
      width: 80,
      alignment: "center"
    },
    {
      dataField: "Laborable",
      caption: intl.formatMessage({ id: "ASSISTANCE.WEEKDAY" }),
      width: 100,
      alignment: "center"
    },
    {
      dataField: "TiempoAdicional",
      caption: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.TIEMPO" }),
      width: 120,
      alignment: "center"
    },
    // {
    //   dataField: "SolicitudAprobada",
    //   caption: intl.formatMessage({ id: "COMMON.APPROVED" }),
    //   width: 120,
    //   alignment: "center"
    // },
    {
      dataField: "MinutosCompensados",
      caption: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.TIEMPOCOMPENSADO" }),
      width: 130,
      alignment: "center"
    },
    {
      dataField: "MinutosExcluidos",
      caption: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.TIEMPOEXCLUIDO" }),
      width: 120,
      alignment: "center"
    },
    // {
    //   dataField: "Estado",
    //   caption: intl.formatMessage({ id: "COMMON.STATE" }),
    //   width: 100,
    //   alignment: "center"
    // },
    {
      dataField: "MinutosPagados",
      caption: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.TIEMPOPAGADO" }),
      width: 100,
      alignment: "center"
    },


  ]

  const columnasDetalleSummary = [

    {
      column: "TiempoAdicional",
      summaryType: "custom",
      displayFormat: " {0}"
    },
    // {
    //   column: "SolicitudAprobada",
    //   summaryType: "custom",
    //   displayFormat: intl.formatMessage({ id: "COMMON.APPROVED" }) + " {0}"
    // },
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
    } else if (options.name === "SummarySolicitudAprobada") {
      if (options.summaryProcess === 'calculate') {
        options.totalValue = options.value.TotalSolicitudAprobada;
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
        setListarTiempoAdicional(resultReport[0]);
        if (resultReport.length > 1) {

          let columns = resultReport[1];//Second List for columns dynamic 
          if (columns) setColumnasDinamicas(crearArregloColumnasHeader(columns));

          setTimeout(() => {
            setViewPagination(true);
          }, 500);
        }
      } else {
        setViewPagination(false);
        setColumnasDinamicas([]);
      }
    } catch (error) {
      console.log(error);
      setViewPagination(false);
      setColumnasDinamicas([]);
    }
  };

  const buscarReporteDetalle = async (skip, take, documento) => {

    try {
      let resultReport = await consultaInforme(skip, take, "N", documento);

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

    array_header.map(row => {
      header_json.push({
        dataField: row.IdConceptoHoraExtra,
        caption: row.TipoHoraExtra,
        key: row.IdConceptoHoraExtra,
        alignment: "center",
        width: 120
      });
    });

    return header_json;
  };

  const consultaInforme = async (skip, take, listarResumen = "S", documento = "") => {

    const { FechaInicio, FechaFin, Activo, IdUnidadOrganizativa, IdPosicion, Personas, IdCentroCosto, IdPlanilla, TrabajadorHorasExtra } = dataRowEditNew;
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
      trabajadorHorasExtra: isNotEmpty(TrabajadorHorasExtra) ? (TrabajadorHorasExtra ? 'S' : "N") : "N",
      resumen: listarResumen,//Mostrar en resumen datos del reporte 
      skip,
      take,
      orderField: "NombreCompleto",
      orderDesc: 1
    };

    setLoading(true);

    let datos = await horasExtrasAprobadas(params)
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

      //-> Export first dataGrid - Resumen
      dataGridRef.current._optionsManager._currentConfig.configCollections.columns.forEach(item => {
        let { caption, visible, type, dataField } = item.options;
        if (!!caption) {
          if ((visible === undefined || visible === true) && type !== 'buttons') {
            ListColumnName.push(caption.toUpperCase().replace("_", " "));
            ListDataField.push(dataField);
          }
        }
      });
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
        Activo, FechaInicio, FechaFin, TrabajadorHorasExtra } = dataRowEditNew;

      var FirstTitleSheet = intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.TIEMPO_ADICIONAL" }) + " " + intl.formatMessage({ id: "COMMON.SUMMARY" }) + ": " +
        intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.DATE.FROM" }) + " " + dateFormat(FechaInicio, 'dd/MM/yyyy') + " " +
        intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.DATE.UNTIL" }) + " " + dateFormat(FechaFin, 'dd/MM/yyyy');

      var SecondTitleSheet = intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.TIEMPO_ADICIONAL" }) + " " + intl.formatMessage({ id: "COMMON.DETAIL" }) + ": " +
        intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.DATE.FROM" }) + " " + dateFormat(FechaInicio, 'dd/MM/yyyy') + " " +
        intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.DATE.UNTIL" }) + " " + dateFormat(FechaFin, 'dd/MM/yyyy');

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

        TitleSheet: FirstTitleSheet,
        NameSheet: intl.formatMessage({ id: "COMMON.SUMMARY" }),
        ArrayDataField: arrayNombresData,
        ArrayTitleHeader: arrayNombresCabecera,

        TitleSheetTwo: SecondTitleSheet,
        NameSheetTwo: intl.formatMessage({ id: "COMMON.DETAIL" }),
        ArrayDataFieldTwo: arrayNombresData2,
        ArrayTitleHeaderTwo: arrayNombresCabecera2,

        FileName: intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })

      };
      setLoading(true);
      await exportarHorasExtrasAprobadas(params).then(response => {
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
      TrabajadorHorasExtra: true
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
    }
  }

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
    //limpiar();
    setTimeout(() => {

      if (isNotEmpty(varIdCompania)) buscarReporte(0, PaginationSetting.TOTAL_RECORDS);

    }, 500);
  }, []);


  const datosGenerales = (e) => {
    return (
      <>
        <Form formData={dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >
            <Item dataField="IdUnidadOrganizativa" visible={false} />
            <Item dataField="IdPerfil" visible={false} />

            <Item
              dataField="IdCompania"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }) }}
              editorType="dxSelectBox"
              colSpan={2}
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
              dataField="UnidadesOrganizativas"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.ORGANIZATIONALUNIT" }) }}
              colSpan={2}
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
              dataField="CentroCosto"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CENTROCOSTO" }), }}
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
                        setFiltros({ FlRepositorio: "1", IdUnidadOrganizativa: "" })
                        setisVisibleCentroCosto(true);
                      },
                    },
                  },
                ],
              }}
            />
            <Item
              dataField="IdPlanilla"
              label={{ text: intl.formatMessage({ id: "ASSISTANCE.PAYROLL" }) }}
              colSpan={2}
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


          </GroupItem>
        </Form>
      </>
    );
  }

  const grupoControl = (e) => {
    return (
      <>
        <Form formData={dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >
          <Item              
              dataField="Posicion"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION" }) }}
              colSpan={2}
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
              dataField="PersonasView"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.PERSON" }) }}
              colSpan={2}
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
            <Item dataField="CodigoPlanilla" colSpan={2} ></Item>
            <Item
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
    const { RowIndex, Documento } = dataRow;
    localStorage.setItem("xDocumento", Documento);
    //setSelected(dataRow);
    //setFocusedRowKey(RowIndex);

  }

  const openTabDetail = async () => {
    //const { Documento } = selected;
    //console.log("openTabDetail", selected);
    var Documento = localStorage.getItem("xDocumento");
    //console.log("Documento", Documento);
    if (isNotEmpty(Documento)) {
      await buscarReporteDetalle(0, PaginationSetting.TOTAL_RECORDS, Documento);
    }

  }
  const onRowDblClick = async (e) => {

    if (isNotEmpty(e.data.Documento)) {
      setTabIndex(1)
      await buscarReporteDetalle(0, PaginationSetting.TOTAL_RECORDS, e.data.Documento);
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

  

  const fechas = (e) => {
    return (
      <>

        <Form formData={dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >

            <Item
              dataField="FechaInicio"
              label={{ text: intl.formatMessage({ id: "ACREDITATION.R001.REPORT.PERIOD" }) }}
              isRequired={true}
              editorType="dxDateBox"
              dataType="date"
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                displayFormat: "dd/MM/yyyy",
              }}
            />

            <Item
              dataField="FechaFin"
              label={{ text: intl.formatMessage({ id: "COMMON.DATE_TO" }) }}
              isRequired={true}
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
        id='dg_Reporte04_TiempoAdicional'
        intl={intl}
        dataSource={listarTiempoAdicional}
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
          id='dg_Reporte04_TiempoAdicionalDetalleEx'
          intl={intl}
          //dataSource={listarTiempoAdicionalDetalle}
          staticColumns={columnasEstaticasDetail}
          dynamicColumns={columnasDinamicas}
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
        id='dg_Reporte04_TiempoAdicionalDetalle'
        intl={intl}
        dataSource={listarTiempoAdicionalDetalle}
        staticColumns={columnasEstaticasDetail}
        dynamicColumns={columnasDinamicas}
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

                <div className="col-md-6">
                  <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" >
                      <h5>{intl.formatMessage({ id: "ADMINISTRATION.POSITION.WORKER" })} </h5>
                    </legend>
                    {grupoControl()}
                  </fieldset>
                </div>

                

                <div className="col-md-6">
                  <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" >   <h5>-</h5></legend>
                    {fechas()}
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

export default injectIntl(WithLoandingPanel(HorasExtrasAprobadasIndexPage));
