import React, { Fragment, useEffect, useState, useRef } from 'react';
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";

import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar, Portlet } from "../../../../../partials/content/Portlet";
import { useStylesTab } from "../../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { handleErrorMessages, handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import PropTypes from 'prop-types';
import BarChartIcon from '@material-ui/icons/BarChart';
import TouchAppIcon from "@material-ui/icons/TouchApp";
import {
  isNotEmpty, dateFormat, getStartAndEndOfMonthByDay, listarTipoConsulta,
  listarEntidadControl, listarIntervaloControl, getDateOfDay, exportExcelDataGrid
} from "../../../../../../_metronic";
import { serviceReporte } from '../../../../../api/acceso/reporte.api';
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";
import AdministracionPersonaBuscar from "../../../../../partials/components/AdministracionPersonaBuscar";
import AdministracionTipoVehiculoBuscar from "../../../../../partials/components/AdministracionTipoVehiculoBuscar";
import AdministracionZonaBuscar from "../../../../../partials/components/AdministracionZonaBuscar";
import ReporteListPage from "./ReporteListPage";
import Pdf from "react-to-pdf";

import { obtenerTodos as obtenerTodosRequisitos } from '../../../../../api/acceso/requisito.api';
import { obtenerTodos as obtenerTodosRestriccion } from '../../../../../api/acceso/restriccion.api';
import { obtenerTodos as obtenerTodosExoneracion } from '../../../../../api/acceso/exoneracion.api';
import TabNavContainer from "../../../../../partials/components/Tabs/TabNavContainer";

import { Doughnut, Bar } from "react-chartjs-2";
import { Chart } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);


const ReporteFilterPage = (props) => {

  const { intl, setLoading, dataMenu } = props;
  const { IdCliente, IdPerfil, IdDivision } = useSelector(state => state.perfil.perfilActual);
  const [viewFilter, setViewFilter] = useState(true);

  const [cmbTipoConsulta, setcmbTipoConsulta] = useState([]);
  const [cmbRequisitos, setcmbRequisitos] = useState([]);
  const [cmbRestricciones, setcmbRestricciones] = useState([]);
  const [cmbExoneracion, setcmbExoneracion] = useState([]);

  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const [isVisiblePopUpPersonas, setisVisiblePopUpPersonas] = useState(false);
  const [isVisibleTipoVehiculo, setisVisibleTipoVehiculo] = useState(false);
  const [popupVisibleZona, setPopupVisibleZona] = useState(false);

  //const [dataHistograma, setDataHistograma] = useState({});
  const [dataHistograma, setDataHistograma] = useState({ labels: [], datasets: [] });

  const [dataDonut, setDataDonut] = useState({ labels: [], datasets: [{ data: [], backgroundColor: [], borderColor: [] }] });
  const [dataListaMarcaciones, setDataListaMarcaciones] = useState({});
  const [dataGridRefDetail, setDataGridRefDetail] = useState(null);

  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);
  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const refPdf = React.createRef();

  function onClickBotton(e) {
    let idZona = e.row.data.idZona;
    obtenerListaMarcaciones(idZona, "");
    handleChange(null, 1);
  }

  async function cargarCombos() {
    let dataTipoConsulta = listarTipoConsulta();
    setcmbTipoConsulta(dataTipoConsulta);

    let dataRequisitos = await obtenerTodosRequisitos({ IdCliente });
    let dataRestriccion = await obtenerTodosRestriccion({ IdCliente, IdEntidad: '%' });
    let dataExoneracion = await obtenerTodosExoneracion({ IdCliente, IdExoneracion: '%' });
    setcmbRequisitos(dataRequisitos);
    setcmbRestricciones(dataRestriccion);
    setcmbExoneracion(dataExoneracion);
  }

  const selectCompania = (dataPopup) => {
    var companias = dataPopup.map(x => (x.IdCompania)).join(',');
    props.dataRowEditNew.IdCompania = companias;

    let cadenaMostrar = dataPopup.map(x => (x.Compania)).join(', ');
    if (cadenaMostrar.length > 100) {
      cadenaMostrar = cadenaMostrar.substring(0, 100) + '...';
    }
    props.dataRowEditNew.Compania = cadenaMostrar
    setPopupVisibleCompania(false);
  }


  const agregarPersonaAdministrador = (dataPopup) => {
    var personas = dataPopup.map(x => (x.IdPersona)).join(',');
    props.dataRowEditNew.IdPersona = personas;

    let cadenaMostrar = dataPopup.map(x => (x.NombreCompleto)).join(', ');
    if (cadenaMostrar.length > 100) {
      cadenaMostrar = cadenaMostrar.substring(0, 100) + '...';
    }
    props.dataRowEditNew.NombreCompleto = cadenaMostrar
    setisVisiblePopUpPersonas(false);
  }


  const agregarTipoVehiculo = (dataPopup) => {
    var tipoVehiculos = dataPopup.map(x => (x.IdTipoVehiculo)).join(',');
    props.dataRowEditNew.IdTipoVehiculo = tipoVehiculos;

    let cadenaMostrar = dataPopup.map(x => (x.TipoVehiculo)).join(', ');
    if (cadenaMostrar.length > 100) {
      cadenaMostrar = cadenaMostrar.substring(0, 100) + '...';
    }
    props.dataRowEditNew.TipoVehiculo = cadenaMostrar
    setisVisibleTipoVehiculo(false);
  };


  const selectZona = (dataPopup) => {
    var zonas = dataPopup.map(x => (x.IdZona)).join(',');
    props.dataRowEditNew.IdZona = zonas;

    let cadenaMostrar = dataPopup.map(x => (x.Zona)).join(', ');
    if (cadenaMostrar.length > 100) {
      cadenaMostrar = cadenaMostrar.substring(0, 100) + '...';
    }
    props.dataRowEditNew.Zona = cadenaMostrar
    setPopupVisibleZona(false);
  }


  useEffect(() => {
    cargarCombos();
  }, []);


  const eventRefresh = () => {
    let { FechaInicio } = getStartAndEndOfMonthByDay();
    const { FechaFin } = getDateOfDay();
    props.setDataRowEditNew({
      esNuevoRegistro: true,
      TipoConsulta: 'T',
      IntervaloControl: '2',
      IdEntidad: 'T',
      TipoAcceso: 'S',
      IdTipoMarcacion: '',
      FechaInicio,
      FechaFin
    });
  }

  const datosGenerales = (e) => {
    return (
      <>

        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >
            <Item dataField="IdCompania" visible={false} />
            <Item dataField="IdPersona" visible={false} />
            <Item dataField="IdZona" visible={false} />
            <Item dataField="IdEquipo" visible={false} />

            <Item
              colSpan={2}
              dataField="TipoConsulta"
              label={{ text: intl.formatMessage({ id: "ACCESS.R001.INTERVALCONSULTATION.CONSULTATION.TYPE" }) }}
              visible={false}
              editorType="dxSelectBox"
              editorOptions={{
                items: cmbTipoConsulta,
                valueExpr: "Valor",
                displayExpr: "Descripcion"
              }}
            />

            <Item
              colSpan={2}
              dataField="Compania"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" }) }}
              editorOptions={{
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
                    onClick: () => {
                      setPopupVisibleCompania(true);
                    },
                  }
                }]
              }}
            />

            <Item
              colSpan={2}
              dataField="IdEntidad"
              label={{ text: intl.formatMessage({ id: "ACCESS.R001.INTERVALCONSULTATION.CONTROL.ENTITY" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: listarEntidadControl(),
                valueExpr: "Valor",
                displayExpr: "Descripcion",
                onValueChanged: (e) => props.setDataRowEditNew({ ...props.dataRowEditNew, IdEntidad: e.value }),
              }}
            />

            <Item
              colSpan={2}
              dataField="NombreCompleto"
              label={{ text: intl.formatMessage({ id: "ACCESS.REPORT.PEOPLE" }) }}
              editorOptions={{
                hoverStateEnabled: false,
                inputAttr: { style: "text-transform: uppercase" },
                showClearButton: true,
                readOnly: true,
                buttons: [
                  {
                    name: "search",
                    location: "after",
                    useSubmitBehavior: true,
                    options: {
                      stylingMode: "text",
                      icon: "search",
                      disabled: props.dataRowEditNew.IdEntidad === 'V' ? true : false,
                      onClick: (evt) => {
                        setisVisiblePopUpPersonas(true);
                      },
                    },
                  },
                ],
              }}
            />


            <Item
              colSpan={2}
              dataField="TipoVehiculo"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.TYPEVEHICLE" }) }}
              editorOptions={{
                hoverStateEnabled: false,
                inputAttr: { style: "text-transform: uppercase" },
                showClearButton: true,
                readOnly: true,
                buttons: [
                  {
                    name: "search",
                    location: "after",
                    useSubmitBehavior: true,
                    options: {
                      stylingMode: "text",
                      icon: "search",
                      disabled: props.dataRowEditNew.IdEntidad === 'V' ? false : true,
                      onClick: () => {
                        setisVisibleTipoVehiculo(true);
                      },
                    },
                  },
                ],
              }}
            />


            <Item
              colSpan={2}
              dataField="Placa"
              label={{ text: intl.formatMessage({ id: "ACCESS.R001.INTERVALCONSULTATION.VEHICLE.PLATE" }) }}
              editorOptions={{
                maxLength: 100,
                inputAttr: { style: "text-transform: uppercase" },
                disabled: props.dataRowEditNew.IdEntidad === 'V' ? false : true,
              }}
            />


          </GroupItem>
        </Form>
      </>
    );
  }

  const control = (e) => {
    return (
      <>

        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >

            <Item
              colSpan={2}
              dataField="Zona"
              label={{ text: intl.formatMessage({ id: "ACCESS.R001.INTERVALCONSULTATION.CHECK.POINT" }) }}
              editorOptions={{
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
                    onClick: () => {
                      setPopupVisibleZona(true);
                    },
                  }
                }]
              }}
            />

            <Item
              colSpan={1}
              dataField="TipoAcceso"
              label={{ text: intl.formatMessage({ id: "ACCESS.REPORT.MARK" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: [{ valor: "S", descripcion: "Otorgado" }, { valor: "N", descripcion: "Negado" }],
                valueExpr: "valor",
                displayExpr: "descripcion",
                onValueChanged: (e) => {
                  if (e.value === 'S') {
                    props.dataRowEditNew.IdRestriccion = ''
                    props.dataRowEditNew.IdRequisito = ''
                  } else {
                    props.dataRowEditNew.IdExoneracion = ''
                  }
                  props.setDataRowEditNew({ ...props.dataRowEditNew, TipoAcceso: e.value })
                }

              }}
            />

            <Item
              colSpan={1}
              dataField="IdTipoMarcacion" //Funcion
              label={{ text: intl.formatMessage({ id: "ACCESS.R001.INTERVALCONSULTATION.CONTROL.TYPE" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: [{ valor: "", descripcion: "Todo" }, { valor: "S", descripcion: "Entrada" }, { valor: "N", descripcion: "Salida" }],
                valueExpr: "valor",
                displayExpr: "descripcion",
              }}
            />

            <Item
              colSpan={1}
              dataField="IdRequisito"
              isRequired={false}
              label={{ text: intl.formatMessage({ id: "ACCESS.R001.INTERVALCONSULTATION.REQUIREMENTS" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: cmbRequisitos,
                valueExpr: "IdRequisito",
                displayExpr: "Requisito",
                disabled: props.dataRowEditNew.TipoAcceso === 'S' ? true : false,
                showClearButton: true,
              }}
            />

            <Item
              colSpan={1}
              dataField="IdRestriccion"
              isRequired={false}
              label={{ text: intl.formatMessage({ id: "ACCESS.R001.INTERVALCONSULTATION.RESTRICTIONS" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: cmbRestricciones,
                valueExpr: "IdRestriccion",
                displayExpr: "Restriccion",
                disabled: props.dataRowEditNew.TipoAcceso === 'S' ? true : false,
                showClearButton: true,
              }}
            />

            <Item
              colSpan={1}
              dataField="IdExoneracion"
              isRequired={false}
              label={{ text: intl.formatMessage({ id: "ACCESS.R001.INTERVALCONSULTATION.EXONERATION" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: cmbExoneracion,
                valueExpr: "IdExoneracion",
                displayExpr: "Motivo",
                disabled: props.dataRowEditNew.TipoAcceso === 'S' ? false : true,
                showClearButton: true,
              }}
            />

            <Item
              colSpan={1}
              dataField="IntervaloControl"
              isRequired={true}
              label={{ text: intl.formatMessage({ id: "ACCESS.R001.INTERVALCONSULTATION.CONTRL.INTERVALS" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: listarIntervaloControl(),
                valueExpr: "valor",
                displayExpr: "descripcion",
              }}
            />


          </GroupItem>
        </Form>
      </>
    );
  }


  const fechas = (e) => {
    return (
      <>

        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >

            <Item
              dataField="FechaInicio"
              label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" }) }}
              isRequired={true}
              editorType="dxDateBox"
              dataType="datetime"
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                displayFormat: "dd/MM/yyyy",
              }}
            />

            <Item
              dataField="FechaFin"
              label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" }) }}
              isRequired={true}
              editorType="dxDateBox"
              dataType="datetime"
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


  const options = {
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
    responsive: true,
    plugins: {
      legend: {
        position: 'top',

      },
      title: {
        display: false,
        text: 'Chart.js Bar Chart'
      }
    }
  };

  /*Lista de Marcaciones por intervalos*********************************/
  async function obtenerListaMarcaciones(idZona, range) {
    setLoading(true);
    setDataListaMarcaciones([]);
    let params = {
      IdCliente: IdCliente,
      IdDivision: isNotEmpty(IdDivision) ? IdDivision : "%",
      IdPerfil: isNotEmpty(IdPerfil) ? IdPerfil : "%",
      TipoConsulta: isNotEmpty(props.dataRowEditNew.TipoConsulta) ? props.dataRowEditNew.TipoConsulta : "",
      IdCompania: isNotEmpty(props.dataRowEditNew.IdCompania) ? props.dataRowEditNew.IdCompania : "",
      IdPersona: isNotEmpty(props.dataRowEditNew.IdPersona) ? props.dataRowEditNew.IdPersona : "",
      IdTipoVehiculo: isNotEmpty(props.dataRowEditNew.IdTipoVehiculo) ? props.dataRowEditNew.IdTipoVehiculo : "",
      Placa: isNotEmpty(props.dataRowEditNew.Placa) ? props.dataRowEditNew.Placa : "",
      IdZona: idZona,
      IdEntidad: isNotEmpty(props.dataRowEditNew.IdEntidad) ? props.dataRowEditNew.IdEntidad : "",
      IntervaloControl: isNotEmpty(props.dataRowEditNew.IntervaloControl) ? props.dataRowEditNew.IntervaloControl : "",
      AccesoNegado: isNotEmpty(props.dataRowEditNew.TipoAcceso) ? props.dataRowEditNew.TipoAcceso : "",
      IdTipoMarcacion: isNotEmpty(props.dataRowEditNew.IdTipoMarcacion) ? props.dataRowEditNew.IdTipoMarcacion : "",
      FechaInicio: isNotEmpty(props.dataRowEditNew.FechaInicio) ? dateFormat(props.dataRowEditNew.FechaInicio, 'yyyyMMdd') : "19700101",
      FechaFin: isNotEmpty(props.dataRowEditNew.FechaFin) ? dateFormat(props.dataRowEditNew.FechaFin, 'yyyyMMdd') : "20501231",
      Range: range
    }
    //  console.log("obtenerListaMarcaciones|params:",params);
    await serviceReporte.listaMarcaciones(params).then(data => {
      setDataListaMarcaciones(data);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => {
      setLoading(false);
    });
  }


  /*DON GRAFICA********************************/

  const getElementAtEvent = element => {

    if (!element.length) return;

    const { datasetIndex, index } = element[0];

    let rangeSelected = dataHistograma.labels[index];
    let idZona = dataHistograma.datasets[datasetIndex].idZona;

    obtenerListaMarcaciones(idZona, rangeSelected);

    handleChange(null, 1);
  };

  const filtrar = async () => {

    setLoading(true);

    let params = {
      IdCliente: IdCliente,
      IdDivision: isNotEmpty(IdDivision) ? IdDivision : "%",
      IdPerfil: isNotEmpty(IdPerfil) ? IdPerfil : "%",
      TipoConsulta: isNotEmpty(props.dataRowEditNew.TipoConsulta) ? props.dataRowEditNew.TipoConsulta : "",
      IdCompania: isNotEmpty(props.dataRowEditNew.IdCompania) ? props.dataRowEditNew.IdCompania : "",
      IdPersona: isNotEmpty(props.dataRowEditNew.IdPersona) ? props.dataRowEditNew.IdPersona : "", //props.dataRowEditNew.ListaPersona.map(x => (x.IdPersona)).join(',') ? props.dataRowEditNew.IdPersona : "",
      IdTipoVehiculo: isNotEmpty(props.dataRowEditNew.IdTipoVehiculo) ? props.dataRowEditNew.IdTipoVehiculo : "",
      Placa: isNotEmpty(props.dataRowEditNew.Placa) ? props.dataRowEditNew.Placa : "",
      IdZona: isNotEmpty(props.dataRowEditNew.IdZona) ? props.dataRowEditNew.IdZona : "",
      IdEntidad: isNotEmpty(props.dataRowEditNew.IdEntidad) ? props.dataRowEditNew.IdEntidad : "",
      IntervaloControl: isNotEmpty(props.dataRowEditNew.IntervaloControl) ? props.dataRowEditNew.IntervaloControl : "",
      AccesoNegado: isNotEmpty(props.dataRowEditNew.TipoAcceso) ? props.dataRowEditNew.TipoAcceso : "",
      IdTipoMarcacion: isNotEmpty(props.dataRowEditNew.IdTipoMarcacion) ? props.dataRowEditNew.IdTipoMarcacion : "",
      IdRestriccion: isNotEmpty(props.dataRowEditNew.IdRestriccion) ? props.dataRowEditNew.IdRestriccion : "",
      IdRequisito: isNotEmpty(props.dataRowEditNew.IdRequisito) ? props.dataRowEditNew.IdRequisito : "",
      IdExoneracion: isNotEmpty(props.dataRowEditNew.IdExoneracion) ? props.dataRowEditNew.IdExoneracion : "",
      FechaInicio: isNotEmpty(props.dataRowEditNew.FechaInicio) ? dateFormat(props.dataRowEditNew.FechaInicio, 'yyyyMMdd') : "19700101",
      FechaFin: isNotEmpty(props.dataRowEditNew.FechaFin) ? dateFormat(props.dataRowEditNew.FechaFin, 'yyyyMMdd') : "20501231"
    }

    //Recibimos la nueva estructura
    await serviceReporte.c001Intervalo(params).then(dataResponse => {
      if (dataResponse.datasets.length === 0) handleInfoMessages(intl.formatMessage({ id: "MESSAGES.NO.DATA" }));
      // Seteamos la data para el reporte histograma
      setDataHistograma(dataResponse);
      //+++++++++++++++++++++++++++++++++++++START+++++++++++++++++++++++++++++++++++
      //GENERAR DATA PARA: Doughnut
      //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

      //Donas, configuración
      let labels = [];
      let data = [];
      let backgroundColor = [];
      let borderColor = [];
      let totalDataSets = 0;
      //Total
      dataResponse.datasets.map(item => {
        totalDataSets = + item.total;
      })
      dataResponse.datasets.map(item => {
        labels.push(item.label);
        data.push((item.total / totalDataSets) * 100);
        //debugger;
        backgroundColor.push(item.backgroundColor);
        borderColor.push(item.borderColor);
      });
      setDataDonut({ labels, datasets: [{ data, label: '', backgroundColor, borderColor }] })
      //+++++++++++++++++++++++++++++++++++++END+++++++++++++++++++++++++++++++++++
      setDataListaMarcaciones([]);

      handleChange(null, 0);

    }).finally(() => {
      setLoading(false);
    });
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

  const exportarDatos = () => {

    let title = "";
    let refDataGrid = null;
    let fileName = "";

    if (tabIndex === 1) {
      title = intl.formatMessage({ id: "COMMON.REPORT" }) + "-" + intl.formatMessage({ id: "ACCESS.PERSON.MARK.TAB" });
      fileName = intl.formatMessage({ id: "COMMON.REPORT" }) + "-" + intl.formatMessage({ id: "ACCESS.PERSON.MARK.TAB" }) + "_" + dateFormat(new Date(), "yyyyMMdd");;

      if (dataGridRefDetail.current != undefined) {
        refDataGrid = dataGridRefDetail.current.instance;
        //Export data
        exportExcelDataGrid(title, refDataGrid, fileName);
      } else {
        handleInfoMessages(intl.formatMessage({ id: "MESSAGES.NO.DATA" }) + " " + intl.formatMessage({ id: "ACTION.EXPORT" }));
      }
    }

  }

  const optionsPDF = {
    orientation: 'landscape',
    unit: 'in',
    format: [20, 20] //height, width
  };

  const tabContent_ReporteHistogramaPage = () => {
    return <>

      <div ref={refPdf} >

        <br></br>
        <div className="row" style={{ width: "95%", marginLeft: "1%", marginRight: "10%" }}>

          <div style={{ width: "100%" }}>
            <Bar data={dataHistograma}
              width={100}
              height={415}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'left',
                  },
                  datalabels: {
                    formatter: (value, ctx) => {
                      if (value > 0) {
                        return value;
                      } else {
                        return '';
                      }
                    },
                    color: "black",
                    align: "end",
                  }
                },
                scales: {
                  yAxes: [
                    {
                      ticks: {
                        beginAtZero: true
                      }
                    }
                  ]
                }
              }}
              getElementAtEvent={getElementAtEvent}
            />
          </div>


        </div>

        <br></br>
        <br></br>
        <br></br>
        <div className="row" style={{ width: "50%", marginLeft: "1%" }}>

          <div style={{ width: "100%" }}>
            <Doughnut data={dataDonut}
              width={100}
              height={415}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'left',
                  },
                  datalabels: {
                    formatter: (value, ctx) => {
                      let datasets = ctx.chart.data.datasets;
                      let percentage = 0;
                      if (datasets.indexOf(ctx.dataset) === datasets.length - 1) {
                        let sum = datasets[0].data.reduce((a, b) => a + b, 0);
                        percentage = Math.round((value / sum) * 100) + "%";
                        return percentage;
                      } else {
                        return percentage;
                      }
                    },
                    color: "black"
                  }
                }
              }}
            />
          </div>

        </div>

      </div>

    </>
  }

  const tabContent_DetalleHistograma = () => {
    return <>
      <ReporteListPage
        listaMarcacionesPV={dataListaMarcaciones}
        setDataGridRef={setDataGridRefDetail}
        dataRowEditNew={props.dataRowEditNew}
      />

    </>
  }



  return (

    <Fragment>

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
              hint={intl.formatMessage({ id: "ACTION.FILTER" })}
              onClick={filtrar}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
            />

            &nbsp;
            <Button icon="refresh" //fa fa-broom
              type="default"
              hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
              onClick={eventRefresh} />

            &nbsp;
            <Button
              icon="fa fa-file-excel"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
              disabled={(tabIndex === 0) ? true : false}
              onClick={exportarDatos}
            />
            &nbsp;
            <Pdf targetRef={refPdf} filename="Reporte_Estadistico.pdf" options={optionsPDF} x={.1} y={.1}>
              {({ toPdf }) => <Button
                icon="file"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.DOWNLOAD.PDF" })}
                onClick={toPdf}
                disabled={(tabIndex === 0) ? false : true} />}
            </Pdf>

          </PortletHeaderToolbar>

        } />

      <PortletBody >
        <React.Fragment>
          <Form id="FormFilter" formData={props.dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={2} colSpan={2}>

              <div className="row">

                <div className="col-md-6">
                  <fieldset className="scheduler-border" style={{ height: "278px" }} >
                    <legend className="scheduler-border" >   <h5>{intl.formatMessage({ id: "ACCREDITATION.PEOPLE.GENERALDATA" })} </h5></legend>
                    {datosGenerales()}
                  </fieldset>
                </div>

                <div className="col-md-6">
                  <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" >
                      <h5>{intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.CONTROL" })} </h5>
                    </legend>
                    {control()}
                  </fieldset>

                  <fieldset className="scheduler-border"  >
                    <legend className="scheduler-border" >
                      <h5>{intl.formatMessage({ id: "ACCESS.DATE" })} </h5>
                    </legend>
                    {fechas()}
                  </fieldset>
                </div>
              </div>

            </GroupItem>
          </Form>

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
                className: classes.tabContent
              },
              {
                label: intl.formatMessage({ id: "ACCESS.PERSON.MARK.TAB" }),
                icon: <TouchAppIcon fontSize="large" />,
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
      </PortletBody>

      <AdministracionCompaniaBuscar
        selectData={selectCompania}
        showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
        cancelarEdicion={() => setPopupVisibleCompania(false)}
        uniqueId={"companiabuscarReporteFilterPage"}
        selectionMode={"multiple"}
      />

      {isVisiblePopUpPersonas && (
        <AdministracionPersonaBuscar
          showPopup={{ isVisiblePopUp: isVisiblePopUpPersonas, setisVisiblePopUp: setisVisiblePopUpPersonas }}
          cancelar={() => setisVisiblePopUpPersonas(false)}
          agregar={agregarPersonaAdministrador}
          selectionMode={"multiple"}
          condicion={"TRABAJADOR"}
          uniqueId={"personasBuscarAdministradorIndexPage"}
        />
      )}


      <AdministracionTipoVehiculoBuscar
        showPopup={{ isVisiblePopUp: isVisibleTipoVehiculo, setisVisiblePopUp: setisVisibleTipoVehiculo }}
        cancelarEdicion={() => setisVisibleTipoVehiculo(false)}
        selectData={agregarTipoVehiculo}
        IdCliente={IdCliente}
        selectionMode={"multiple"}
        showCheckBoxesModes={"normal"}
        uniqueId={"administracionTipoVehiculoIndexPage"}
        showButton={true}
      />

      {popupVisibleZona && (<AdministracionZonaBuscar
        dataMenu={dataMenu}
        selectData={selectZona}
        showPopup={{ isVisiblePopUp: popupVisibleZona, setisVisiblePopUp: setPopupVisibleZona }}
        cancelarEdicion={() => setPopupVisibleZona(false)}
        selectionMode={"multiple"}
        showCheckBoxesModes={"normal"}
        selectNodesRecursive={false}
      />
      )}

    </Fragment >

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


export default injectIntl(WithLoandingPanel(ReporteFilterPage));
