import React, { useEffect, useRef, useState } from "react";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { useSelector } from "react-redux";
import { useStylesTab } from "../../../../../store/config/Styles";
import './ConfiguracionHorarioIndexPage.css'


import CustomBreadcrumbs from "../../../../../partials/layout/CustomBreadcrumbs";
import { AppBar } from '@material-ui/core';
import { Typography } from "@material-ui/core";
import { Toolbar } from "@material-ui/core";
import { exportarHorarioConfiguracionAsistencia, horarioConfiguracionAsistencia } from '../../../../../api/asistencia/reporte.api';
import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import DataGridDynamic from '../../../../../partials/components/DataGridDynamic/DataGridDynamic';
import { Portlet, PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { Button } from 'devextreme-react';
import { dateFormat, getStartOfMonthAndToday, getStartAndEndOfMonthByDay, isNotEmpty, listarEstadoSimple, PaginationSetting, listarTurno, listarEstado } from '../../../../../../_metronic';
import Form, { Item, GroupItem, EmptyItem, PatternRule } from "devextreme-react/form";

import AdministracionCentroCostoBuscar from '../../../../../partials/components/AdministracionCentroCostoBuscar';
import AdministracionPosicionBuscar from "../../../../../partials/components/AdministracionPosicionBuscar";
import AdministracionUnidadOrganizativaBuscar from "../../../../../partials/components/AdministracionUnidadOrganizativaBuscar";
import AsistenciaPersonaBuscar from '../../../../../partials/components/AsistenciaPersonaBuscar';

// import CalendarToday from '@material-ui/icons/CalendarToday';
// import TouchAppIcon from "@material-ui/icons/TouchApp";

import { serviceCompania } from "../../../../../api/administracion/compania.api";
import { servicePlanilla } from "../../../../../api/asistencia/planilla.api";

import TabNavContainer from "../../../../../partials/components/Tabs/TabNavContainer";
import { Reorder, CalendarToday, FormatColorResetRounded } from "@material-ui/icons";
import MenuTreeViewPage from "../../../../../partials/content/TreeView/MenuTreeViewPage";
import SimpleDropDownBoxGrid from "../../../../../partials/components/SimpleDropDownBoxGrid/SimpleDropDownBoxGrid";

import { obtenerTodos as obtenerIncidencias } from "../../../../../api/asistencia/incidencia.api";
import AdministracionDivisionBuscar from "../../../../../partials/components/AdministracionDivisionBuscar";
import PersonaTextAreaCodigosPopup from "../../../../../partials/components/PersonaTextAreaPopup/PersonaTextAreaCodigosPopup";


export const initialFilter = {
  IdCompania: '',
  IdCliente: '',
  IdDivision: '',
  // FechaDesde: '',
  // FechaHasta: '',
  Activo: 'S',
};

const ConfiguracionHorarioIndexPage = (props) => {
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
    IdCompania: varIdCompania,

    Activo: 'S',
    Flexible: '',
    Semanal: '',
    Turno: '',
    DiasDescanso: '',
    DiasTrabajo: '',
    FechaInicio: FechaInicio,
    FechaFin: FechaFin,
  });

  const [columnasDinamicas, setColumnasDinamicas] = useState([]);
  const [viewPagination, setViewPagination] = useState(false);
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

  const [incidenciasSeleccionados, setIncidenciasSeleccionados] = useState([]);
  const [cmbIncidencia, setcmbIncidencia] = useState([]);
  const [isVisiblePopUpDivision, setisVisiblePopUpDivision] = useState(false);

  const [listaEventosDinamicos, setListaEventosDinamicos] = useState([]);

  const columnasEstaticas = [
    {
      dataField: "IdHorario",
      caption: intl.formatMessage({ id: "COMMON.CODE" }),
      width: 150,
      alignment: "center"
    },
    {
      dataField: "Horario",
      caption: intl.formatMessage({ id: "ASSISTANCE.MASSIVE.SCHEDULES" }),
      width: 270,
      alignment: "left"
    },
    // {
    //   dataField: "Ciclo",
    //   caption: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.CYCLE" }),
    //   width: 120,
    //   alignment: "center"
    // },
    {
      dataField: "Regimen",
      caption: intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.REGIME" }),
      width: 120,
      alignment: "center"
    },
    {
      dataField: "Flexible",
      caption: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.FLEXI" }),
      width: 120,
      alignment: "center"
    },
    {
      dataField: "Semanal",
      caption: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.WEEKLY" }),
      width: 120,
      alignment: "center"
    },
    {
      dataField: "Turno",
      caption: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.TURN" }),
      width: 120,
      alignment: "center"
    },
    {
      dataField: "Activo",
      caption: intl.formatMessage({ id: "COMMON.STATE" }),
      width: 120,
      alignment: "center"
    },
  ]

  const columnasEstaticasDetail = [
    {
      caption: intl.formatMessage({ id: "ADMINISTRATION.REGIME" }),
      // headerCellRender:{renderGridDia}, 
      items: [{
        dataField: "Dia",
        caption: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY" }),
        width: 120,
        alignment: "center",
      },
      {
        dataField: "Turno",
        caption: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.TURN" }),
        width: 120,
        alignment: "center",
      },
      {
        dataField: "Descanso",
        caption: intl.formatMessage({ id: "ASSISTANCE.REQUEST.WEEKDAY" }),
        width: 120,
        alignment: "center",
      }]
    },
    {
      caption: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.ENTRY" }), 
      items: [{
        dataField: "InicioControl",
        caption: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.HOME.CONTROL" }),
        width: 120,
        alignment: "center",
      }, {
        dataField: "HoraEntrada",
        caption: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.ENTRY.TIME" }),
        width: 120,
        alignment: "center",
      }, {
        dataField: "MinutosFlexible",
        caption: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.MINFLEXIBLE" }),
        width: 120,
        alignment: "center",
      }, {
        dataField: "MinutosTolerancia",
        caption: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.TOLERANCES" }),
        width: 120,
        alignment: "center",
      }]
    },
    {
      caption: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.REFRESHMENT" }),
      items: [{
        dataField: "InicioRefrigerio",
        caption: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.START" }),
        width: 120,
        alignment: "center",
      }, {
        dataField: "FinRefrigerio",
        caption: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.END" }),
        width: 120,
        alignment: "center",
      }, {
        dataField: "MinutosRefrigerio",
        caption: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.ALLOCATED.MINUTES" }),
        width: 120,
        alignment: "center",
      }]
    },
    {
      caption: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.DEPARTURE" }),
      items: [{
        dataField: "HoraSalida",
        caption: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.DEPARTURE.TIME" }),
        width: 120,
        alignment: "center",
      }]
    },
    {
      caption: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.START.OVERTIME.CONTROL" }),
      items: [{
        dataField: "ControlHEAntes",
        caption: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.BEFORE.ADMISSION" }),
        width: 150,
        alignment: "center",
      }, {
        dataField: "ControlHEDespues",
        caption: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.AFTER.DEPARTURE" }),
        width: 150,
        alignment: "center",
      }]
    },


  ]
 
  
  const buscarReporte = async (skip, take) => {

    try {
      let resultReport = await consultaInforme(skip, take, "S");

      if (resultReport.IdError === 0) {
        setTabIndex(0);
        setListarReporteIncidencias(resultReport[0])
        if (resultReport.length > 1) {

          setTimeout(() => {
            setViewPagination(true);
          }, 500);
        }
      } else {
        setViewPagination(false); 
      }
    } catch (error) {
      console.log(error);
      setViewPagination(false); 
    }
  };

  const buscarReporteDetalle = async (skip, take, Horario) => {

    try {
      let resultReport = await consultaInforme(skip, take, "N", Horario.toString());

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
        // setColumnasDinamicas([]);
      }
    } catch (error) {
      console.log(error);
      //setViewPagination(false);
      // setColumnasDinamicas([]);
    }
  };
 
  const consultaInforme = async (skip, take, listarResumen = "S", Horario = "") => {

    const { Flexible, Activo, Semanal, Turno, DiasTrabajo, DiasDescanso,IdCompania } = dataRowEditNew; 
// console.log("**consultaInforme**dataRowEditNew:>",dataRowEditNew);
    let params = {
      idDivision: IdDivision,
      idCompania: isNotEmpty(varIdCompania)?varIdCompania:IdCompania,
      estado: isNotEmpty(Activo) ? Activo : "",
      idHorario: listarResumen === "S" ? "" : Horario, 
      flexible: isNotEmpty(Flexible) ? Flexible : "",
      semanal: isNotEmpty(Semanal) ? Semanal : "",
      turno: isNotEmpty(Turno) ? Turno : "",
      diasTrabajo: isNotEmpty(DiasTrabajo) ? DiasTrabajo : "",
      diasDescanso: isNotEmpty(DiasDescanso) ? DiasDescanso : "", 
      resumen: listarResumen,//Mostrar en resumen datos del reporte   
      skip,
      take,
      orderField: "Horario",
      orderDesc: 1
    };

    setLoading(true);

    let datos = await horarioConfiguracionAsistencia(params)
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

      let ListPreColumnName = [];
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

      let arrayNombresCabecera = ListColumnName.join('|');
      let arrayNombresData = ListDataField.join('|');

      //-> Export Second dataGrid - Detail
      ListPreColumnName = [];
      ListColumnName = [];
      ListDataField = [];

      dataGridRefDetail.current._optionsManager._currentConfig.configCollections.columns.forEach(item => {
        let { caption, visible, type, dataField } = item.options;
        let { columns } = item.configCollections;
        console.log("***item.options ::> ", item.options);
        if (!!caption) {
          if ((visible === undefined) && type !== 'buttons') { //|| visible === true

            if (isNotEmpty(columns)) {
              columns.forEach(element => {
                let { caption, visible, type, dataField } = element.options;
                if (!!caption) {
                  if ((visible === undefined || visible === true) && type !== 'buttons') {
                    ListPreColumnName.push(item.options.caption.toUpperCase().replace("_", " "));
                    ListColumnName.push(caption.toUpperCase().replace("_", " "));
                    ListDataField.push(dataField);
                  }
                }
              });
            }

          }
        }
      });
      let arrayNombresPreCabecera2 = ListPreColumnName.join('|');
      let arrayNombresCabecera2 = "HORARIO|"+ListColumnName.join('|');
      let arrayNombresData2 ="Horario|"+ ListDataField.join('|');

      // console.log("arrayNombresPreCabecera2:> ", arrayNombresPreCabecera2);
      // console.log("arrayNombresCabecera2:> ", arrayNombresCabecera2);
      // console.log("arrayNombresData2:> ", arrayNombresData2);

      // console.log("***exportExcel***dataRowEditNew :>", dataRowEditNew);

      const {
        IdCompania,
        Flexible, Semanal, Turno, DiasTrabajo, DiasDescanso,
        Activo, FechaInicio, FechaFin } = dataRowEditNew;


      var FirstTitleSheet = intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.REPORTE.HORARIO" });
      var FirstSubtitleSheet = varCompania.toString().toUpperCase();
      var SecondTitleSheet = intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.REPORTE.HORARIO" }) + " " + intl.formatMessage({ id: "COMMON.DETAIL" });


      let params = {
        idCliente: IdCliente,
        idDivision: IdDivision,
        idCompania: isNotEmpty(IdCompania) ? IdCompania : "",
        estado: isNotEmpty(Activo) ? Activo : "",
        resumen: "",
        idHorario: "",

        turno: isNotEmpty(Turno) ? Turno : "",
        semanal: isNotEmpty(Semanal) ? Semanal : "",
        flexible: isNotEmpty(Flexible) ? Flexible : "",
        diasTrabajo: isNotEmpty(DiasTrabajo) ? DiasTrabajo : "",
        diasDescanso: isNotEmpty(DiasDescanso) ? DiasDescanso : "",


        TitleSheet: FirstTitleSheet,
        NameSheet: intl.formatMessage({ id: "COMMON.SUMMARY" }),
        ArrayDataField: arrayNombresData,
        ArrayTitleHeader: arrayNombresCabecera,
        FirstSubtitleSheet: FirstSubtitleSheet,

        TitleSheetTwo: SecondTitleSheet,
        NameSheetTwo: intl.formatMessage({ id: "COMMON.DETAIL" }),
        ArrayDataFieldTwo: arrayNombresData2,
        ArrayTitleHeaderTwo: arrayNombresCabecera2,
        ArrayPreTitleHeaderTwo: arrayNombresPreCabecera2,

        FileName: intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })

      };
      setLoading(true);
      await exportarHorarioConfiguracionAsistencia(params).then(response => {
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

    localStorage.setItem("xIdHorario", "");
    setListarTiempoAdicionalDetalle([]);

    setDataRowEditNew({
      IdCliente: IdCliente,
      IdDivision: IdDivision,
      IdCompania: varIdCompania,

      Activo: 'S',
      Flexible: '',
      Semanal: '',
      Turno: '',
      DiasDescanso: '',
      DiasTrabajo: '',
      FechaInicio: FechaInicio,
      FechaFin: FechaFin, 
    });
    buscarReporte(0, PaginationSetting.TOTAL_RECORDS)
  };

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

  useEffect(() => {
    if (!isNotEmpty(varIdCompania)) {

      if (companiaData.length > 0) {
        const { IdCompania } = companiaData[0];
        var company = companiaData.filter(x => x.IdCompania === IdCompania);
        getCompanySeleccionada(IdCompania, company);
      }
    }
  }, [companiaData]);


  useEffect(() => {
    listarCompanias(); 
    localStorage.setItem("xIdHorario", "");
    setTimeout(() => {
      buscarReporte(0, PaginationSetting.TOTAL_RECORDS)
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
                  }

                },
              }}
            />

            <Item
              colSpan={2}
              dataField="Activo"
              label={{ text: intl.formatMessage({ id: "COMMON.ACTIVE" }) }}
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
    const { RowIndex, IdHorario } = dataRow;
    localStorage.setItem("xIdHorario", IdHorario);

  }

  const openTabDetail = async () => {
    var IdHorario = localStorage.getItem("xIdHorario");
    console.log("**openTabDetail**IdHorario:> ", IdHorario);
    if (isNotEmpty(IdHorario)) {
      await buscarReporteDetalle(0, PaginationSetting.TOTAL_RECORDS, IdHorario);
    }

  }
  const onRowDblClick = async (e) => {
    if (isNotEmpty(e.data.IdHorario)) {
      setTabIndex(1)
      await buscarReporteDetalle(0, PaginationSetting.TOTAL_RECORDS, e.data.IdHorario);
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
  // function headerCellRender() {
  //   return <div className="card-header-ingreso" >{intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.ENTRY" })}</div>;
  // }
  const dataGridEventsDetail = {
    onCellPrepared,
    // headerCellRender,
  }

  const valueChangedRegime = (data) => {
    const { DiasTrabajo, DiasDescanso } = dataRowEditNew;
    // console.log("***valueChangedRegime :> dataRowEditNew::> ", dataRowEditNew);

    if (isNotEmpty(DiasTrabajo) && isNotEmpty(DiasDescanso)) {

      // console.log("***RESULTADO:> ", (DiasTrabajo > 0 && DiasDescanso > 0) ?
      //   intl.formatMessage({ id: "ASSISTANCE.REPORT.CONFIGURATION_SCHEDULE.COMBINATION" }).toUpperCase() + " "
      //   + DiasTrabajo.toString() + "X" + DiasDescanso.toString() : "");

      setDataRowEditNew({
        ...dataRowEditNew, Regimen: (DiasTrabajo >= 0 && DiasDescanso >= 0) ?
          intl.formatMessage({ id: "ASSISTANCE.REPORT.CONFIGURATION_SCHEDULE.COMBINATION" }).toUpperCase() + " "
          + DiasTrabajo.toString() + "X" + DiasDescanso.toString() : ""
      });
    }
    // else {
    //   dataRowEditNew.Regimen = "";
    // }

    if (!isNotEmpty(data)) {
      setDataRowEditNew({
        ...dataRowEditNew, Regimen: ""
      });
    }

  }

  const grupoHorario = (e) => {
    return (
      <>

        <Form formData={dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={3} >

            <Item
              colSpan={1}
              dataField="Flexible"
              label={{ text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.FLEXIBLE" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: listarEstado(),
                valueExpr: "Valor",
                displayExpr: "Descripcion",
                showClearButton: true,
                //onValueChanged: (e) => { valueChangedEstado(e.value); }
              }}
            />

            <Item
              colSpan={1}
              dataField="Semanal"
              label={{ text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.WEEKLY" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: listarEstado(),
                valueExpr: "Valor",
                displayExpr: "Descripcion",
                showClearButton: true,
                //onValueChanged: (e) => { valueChangedEstado(e.value); }
              }}
            />

            <Item
              colSpan={1}
              dataField="Turno"
              label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.TURN" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: listarTurno(),
                valueExpr: "Valor",
                displayExpr: "Descripcion",
                showClearButton: true,
                //onValueChanged: (e) => { valueChangedEstado(e.value); }
              }}
            />

            <Item
              dataField="DiasTrabajo"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.REGIME.WORK.DAYS" }) }}
              editorType="dxNumberBox"
              dataType="number"
              editorOptions={{
                readOnly: false,
                inputAttr: { style: "text-transform: uppercase; text-align: right" },
                showSpinButtons: true,
                showClearButton: true,
                min: 0,
                onValueChanged: (e) => { valueChangedRegime(e.value); }
              }}
            >
              <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
            </Item>

            <Item
              dataField="DiasDescanso"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.REGIME.DAYSOFF.REST" }) }}
              editorType="dxNumberBox"
              dataType="number"
              editorOptions={{
                readOnly: false,
                inputAttr: { style: "text-transform: uppercase; text-align: right" },
                showSpinButtons: true,
                showClearButton: true,
                min: 0,
                onValueChanged: (e) => { valueChangedRegime(e.value); }
              }}
            >
              <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
            </Item>


            <Item
              colSpan={1}
              dataField="Regimen"
              label={{ text: intl.formatMessage({ id: "ASSISTANCE.REPORT.CONFIGURATION_SCHEDULE.LABEL_REGIME" }) }}
              editorOptions={{
                readOnly: true,
                showClearButton: true,
              }}
            />

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
              colSpan={2}
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
        id='dg_Reporte13_Horario'
        intl={intl}
        dataSource={listarReporteIncidencias}
        staticColumns={columnasEstaticas}
        dynamicColumns={[]}//columnasDinamicas
        isLoadedResults={viewPagination}
        setIsLoadedResults={setViewPagination}
        refreshDataSource={buscarReporte}
        keyExpr="IdHorario"
        dataGridRef={dataGridRef}
        events={{ ...dataGridEvents }}

      />
      <div style={{ display: 'none' }}>
        {/*Se asigna grilla espejo para exportar*/}
        <DataGridDynamic
          id='dg_Reporte13_HOrarioDetalleEx'
          intl={intl}
          staticColumns={columnasEstaticasDetail}
          dynamicColumns={[]}
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
        id='dg_Reporte13_ConfiguracionHorarioDetalle'
        intl={intl}
        dataSource={listarTiempoAdicionalDetalle}
        staticColumns={columnasEstaticasDetail}
        dynamicColumns={[]} //{columnasDinamicas}
        summaryItems={[]}//columnasDetalleSummary
        isLoadedResults={viewPagination}
        setIsLoadedResults={setViewPagination}
        refreshDataSource={buscarReporteDetalle}
        keyExpr="RowIndex"
        dataGridRef={dataGridRefDetail}
        // calculateCustomSummary={calculateCustomSummary}
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

                <div className="col-md-4">
                  <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" >   <h5>{intl.formatMessage({ id: "ACCREDITATION.PEOPLE.GENERALDATA" })} </h5></legend>
                    {datosGenerales()}
                  </fieldset>
                </div>

                <div className="col-md-8" >
                  <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" >   <h5> {intl.formatMessage({ id: "ASSISTANCE.REPORT.CONFIGURATION_SCHEDULE.SCHEDULE_DATA_LABEL" })}   </h5></legend>
                    {grupoHorario()}
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

  </>
};

export default injectIntl(WithLoandingPanel(ConfiguracionHorarioIndexPage));
