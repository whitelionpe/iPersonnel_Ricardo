import React, { useEffect, useState } from "react";
import { PortletBody } from "../../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import {
  isNotEmpty,
} from "../../../../../../_metronic";
import { Doughnut, Bar } from "react-chartjs-2";
import { Chart } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
//register dataLabels to chart
Chart.register(ChartDataLabels);

const ReporteHistogramaPage = props => {

  const { intl } = props;
  const [acreditacionesPorMes, setAcreditacionesPorMes] = useState([]);
  const [dataPerfil, setDataPerfil] = useState([]);
  const [dataPromedio, setDataPromedio] = useState([]);
  const [dataDonut, setDataDonut] = useState({ labels: [], datasets: [{ data: [], backgroundColor: [], borderColor: [] }] });
  const [dataDonutPerfil, setDataDonutPerfil] = useState({ labels: [], datasets: [{ data: [], backgroundColor: [], borderColor: [] }] });
  const [dataDonutPromedio, setDataDonutPromedio] = useState({ labels: [], datasets: [{ data: [], backgroundColor: [], borderColor: [] }] });


  const getAcreditacionByMonth = () => {
    var responseBd = isNotEmpty(props.acreditacion_x_Perfil) ? props.acreditacion_x_Perfil : [];

    if (responseBd.length > 0) {
      let meses = [];
      meses = responseBd[0].ColumnName.split(',');
      let datasets = [];

      responseBd.map(item => {
        let valuesAcreditacion = [];
        if (item.Enero || item.Enero === null)
          valuesAcreditacion.push(isNotEmpty(item.Enero) ? item.Enero : 0);
        if (item.Febrero || item.Febrero === null)
          valuesAcreditacion.push(isNotEmpty(item.Febrero) ? item.Febrero : 0);
        if (item.Marzo || item.Marzo === null)
          valuesAcreditacion.push(isNotEmpty(item.Marzo) ? item.Marzo : 0);
        if (item.Abril || item.Abril === null)
          valuesAcreditacion.push(isNotEmpty(item.Abril) ? item.Abril : 0);
        if (item.Mayo || item.Mayo === null)
          valuesAcreditacion.push(isNotEmpty(item.Mayo) ? item.Mayo : 0);
        if (item.Junio || item.Junio === null)
          valuesAcreditacion.push(isNotEmpty(item.Junio) ? item.Junio : 0);
        if (item.Julio || item.Julio === null)
          valuesAcreditacion.push(isNotEmpty(item.Julio) ? item.Julio : 0);
        if (item.Agosto || item.Agosto === null)
          valuesAcreditacion.push(isNotEmpty(item.Agosto) ? item.Agosto : 0);
        if (item.Septiembre || item.Septiembre === null)
          valuesAcreditacion.push(
            isNotEmpty(item.Septiembre) ? item.Septiembre : 0
          );
        if (item.Octubre || item.Octubre === null)
          valuesAcreditacion.push(isNotEmpty(item.Octubre) ? item.Octubre : 0);
        if (item.Noviembre || item.Noviembre === null)
          valuesAcreditacion.push(
            isNotEmpty(item.Noviembre) ? item.Noviembre : 0
          );
        if (item.Diciembre || item.Diciembre === null)
          valuesAcreditacion.push(
            isNotEmpty(item.Diciembre) ? item.Diciembre : 0
          );

        datasets.push({
          label: item.EstadoAprobacionDescripcion,
          data: valuesAcreditacion,
          backgroundColor: item.BackgroundColor
        });

      });

      let data = {
        labels: meses,
        datasets: datasets
      };

      setAcreditacionesPorMes(data);
    } else {
      setAcreditacionesPorMes([]);
    }
  };

  const getProfileTime = () => {
    var responseBd = props.acreditacion_x_Perfil_Mes;

    if (responseBd.length > 0) {
      let meses = [];
      meses = responseBd[0].ColumnName.split(',');
      // let strPersonas = responseBd[0].ColumnName.split(',').join(',');
      let datasets = [];

      responseBd.map(item => {
        let values = [];

        // backgroundColor.push( item.BackgroundColor );
        if (item.Enero || item.Enero === null)
          values.push(isNotEmpty(item.Enero) ? item.Enero : 0);
        if (item.Febrero || item.Febrero === null)
          values.push(isNotEmpty(item.Febrero) ? item.Febrero : 0);
        if (item.Marzo || item.Marzo === null)
          values.push(isNotEmpty(item.Marzo) ? item.Marzo : 0);
        if (item.Abril || item.Abril === null)
          values.push(isNotEmpty(item.Abril) ? item.Abril : 0);
        if (item.Mayo || item.Mayo === null)
          values.push(isNotEmpty(item.Mayo) ? item.Mayo : 0);

        if (item.Junio || item.Junio === null)
          values.push(isNotEmpty(item.Junio) ? item.Junio : 0);
        if (item.Julio || item.Julio === null)
          values.push(isNotEmpty(item.Julio) ? item.Julio : 0);
        if (item.Agosto || item.Agosto === null)
          values.push(isNotEmpty(item.Agosto) ? item.Agosto : 0);

        if (item.Septiembre || item.Septiembre === null)
          values.push(isNotEmpty(item.Septiembre) ? item.Septiembre : 0);
        if (item.Octubre || item.Octubre === null)
          values.push(isNotEmpty(item.Octubre) ? item.Octubre : 0);
        if (item.Noviembre || item.Noviembre === null)
          values.push(isNotEmpty(item.Noviembre) ? item.Noviembre : 0);
        if (item.Diciembre || item.Diciembre === null)
          values.push(isNotEmpty(item.Diciembre) ? item.Diciembre : 0);

        datasets.push({
          label: isNotEmpty(item.Alias) ? item.Alias.toUpperCase() : "",//item.Alias,
          data: values,
          backgroundColor: item.BackgroundColor
        });

        //RowId++;
      });

      let data = {
        labels: meses,
        datasets: datasets
      };
      setDataPerfil(data);
    } else {
      setDataPerfil([]);

    }
  };

  const getAverageByMonth = () => {
    var responseBd = props.acreditacion_Promedio;

    if (responseBd.length > 0) {
      let meses = [];
      meses = responseBd[0].ColumnName.split(',');
      let datasets = [];
      //var RowId = 0;

      responseBd.map(item => {
        let values = [];
        if (item.Enero || item.Enero === null)
          values.push(isNotEmpty(item.Enero) ? item.Enero : 0);
        if (item.Febrero || item.Febrero === null)
          values.push(isNotEmpty(item.Febrero) ? item.Febrero : 0);
        if (item.Marzo || item.Marzo === null)
          values.push(isNotEmpty(item.Marzo) ? item.Marzo : 0);
        if (item.Abril || item.Abril === null)
          values.push(isNotEmpty(item.Abril) ? item.Abril : 0);
        if (item.Mayo || item.Mayo === null)
          values.push(isNotEmpty(item.Mayo) ? item.Mayo : 0);

        if (item.Junio || item.Junio === null)
          values.push(isNotEmpty(item.Junio) ? item.Junio : 0);
        if (item.Julio || item.Julio === null)
          values.push(isNotEmpty(item.Julio) ? item.Julio : 0);
        if (item.Agosto || item.Agosto === null)
          values.push(isNotEmpty(item.Agosto) ? item.Agosto : 0);

        if (item.Septiembre || item.Septiembre === null)
          values.push(isNotEmpty(item.Septiembre) ? item.Septiembre : 0);
        if (item.Octubre || item.Octubre === null)
          values.push(isNotEmpty(item.Octubre) ? item.Octubre : 0);
        if (item.Noviembre || item.Noviembre === null)
          values.push(isNotEmpty(item.Noviembre) ? item.Noviembre : 0);
        if (item.Diciembre || item.Diciembre === null)
          values.push(isNotEmpty(item.Diciembre) ? item.Diciembre : 0);

        datasets.push({
          label: item.Promedio,
          data: values,
          backgroundColor: item.BackgroundColor
        });

        // RowId++;
      });

      let data = {
        labels: meses,
        datasets: datasets
      };
      setDataPromedio(data);
    } else {
      setDataPromedio([]);
    }
  };



  // obtener resumen datos Estadisticos
  const getElementAtEvent = e => {
    if (!e.length) return;
    const { datasetIndex, index } = e[0];
    let month = parseInt(props.dataRowEditNew.MesInicio) > 0 ? index + parseInt(props.dataRowEditNew.MesInicio) - 1 : index;
    let estado = acreditacionesPorMes.datasets[datasetIndex].label;
    props.obtenerHistogramaDetalle(month, estado, '');
  };


  const getElementAtEventProfile = e => {
    if (!e.length) return;
    const { datasetIndex, index } = e[0];
    let month = parseInt(props.dataRowEditNew.MesInicio) > 0 ? index + parseInt(props.dataRowEditNew.MesInicio) - 1 : index;
    let perfil = dataPerfil.datasets[datasetIndex].label;
    props.obtenerHistogramaDetalle(month, '', perfil);
  };

  function ConfigurarPaletteEstados() {

    var responseBd = props.acreditacion_x_Perfil;

    if (responseBd.length > 0) {

      let labels = [];
      let data = [];
      let backgroundColor = [];
      let borderColor = [];

      responseBd.map(item => {

        labels.push(item.EstadoAprobacionDescripcion);
        data.push(isNotEmpty(item.val) ? item.val : 0);
        backgroundColor.push(item.BackgroundColor);
        borderColor.push(item.BorderColor);


      });

      setDataDonut({
        weight: "10px",
        height: "50%",
        labels,
        datasets: [{
          data,
          label: '',
          backgroundColor: backgroundColor,
          borderColor: borderColor
        }]
      })

    } else {
      setDataDonut({});
    }
  }

  function ConfigurarPalettePerfiles() {

    var responseBd = props.acreditacion_x_Perfil_Mes;

    if (responseBd.length > 0) {

      let labels = [];
      let data = [];
      let backgroundColor = [];
      let borderColor = [];

      responseBd.map(item => {

        labels.push(isNotEmpty(item.Alias) ? item.Alias.toUpperCase() : "");
        data.push(isNotEmpty(item.val) ? item.val : 0);
        backgroundColor.push(item.BackgroundColor);
        borderColor.push(item.BorderColor);

      });

      setDataDonutPerfil({
        labels,
        datasets: [{
          data,
          label: '',
          backgroundColor: backgroundColor,
          borderColor: borderColor,
        }]
      })

    } else {
      setDataDonutPerfil({});
    }
  }

  function ConfigurarPalettePromedio() {

    var responseBd = props.promedioPaleteData;
    if (responseBd.length > 0) {

      let labels = [];
      let data = [];
      let backgroundColor = [];
      let borderColor = [];

      responseBd.map(item => {

        labels.push(item.Mes);

        if (item.Mes === "Enero") {
          data.push(isNotEmpty(item.val) ? item.val : 0);
          backgroundColor.push(item.BackgroundColor);
          borderColor.push(item.BorderColor);
        }
        if (item.Mes === "Febrero") {
          data.push(isNotEmpty(item.val) ? item.val : 0);
          backgroundColor.push(item.BackgroundColor);
          borderColor.push(item.BorderColor);
        }
        if (item.Mes === "Marzo") {
          data.push(isNotEmpty(item.val) ? item.val : 0);
          backgroundColor.push(item.BackgroundColor);
          borderColor.push(item.BorderColor);
        }
        if (item.Mes === "Abril") {
          data.push(isNotEmpty(item.val) ? item.val : 0);
          backgroundColor.push(item.BackgroundColor);
          borderColor.push(item.BorderColor);
        }
        if (item.Mes === "Mayo") {
          data.push(isNotEmpty(item.val) ? item.val : 0);
          backgroundColor.push(item.BackgroundColor);
          borderColor.push(item.BorderColor);
        }
        if (item.Mes === "Junio") {
          data.push(isNotEmpty(item.val) ? item.val : 0);
          backgroundColor.push(item.BackgroundColor);
          borderColor.push(item.BorderColor);
        }
        if (item.Mes === "Julio") {
          data.push(isNotEmpty(item.val) ? item.val : 0);
          backgroundColor.push(item.BackgroundColor);
          borderColor.push(item.BorderColor);
        }
        if (item.Mes === "Agosto") {
          data.push(isNotEmpty(item.val) ? item.val : 0);
          backgroundColor.push(item.BackgroundColor);
          borderColor.push(item.BorderColor);
        }
        if (item.Mes === "Septiembre") {
          data.push(isNotEmpty(item.val) ? item.val : 0);
          backgroundColor.push(item.BackgroundColor);
          borderColor.push(item.BorderColor);
        }
        if (item.Mes === "Octubre") {
          data.push(isNotEmpty(item.val) ? item.val : 0);
          backgroundColor.push(item.BackgroundColor);
          borderColor.push(item.BorderColor);
        }
        if (item.Mes === "Noviembre") {
          data.push(isNotEmpty(item.val) ? item.val : 0);
          backgroundColor.push(item.BackgroundColor);
          borderColor.push(item.BorderColor);
        }
        if (item.Mes === "Diciembre") {
          data.push(isNotEmpty(item.val) ? item.val : 0);
          backgroundColor.push(item.BackgroundColor);
          borderColor.push(item.BorderColor);
        }

      });

      setDataDonutPromedio({
        labels,
        datasets: [{
          data,
          label: '',
          backgroundColor: backgroundColor,
          borderColor: borderColor
        }]
      })

    }
    else {
      setDataDonutPromedio({});
    }
  }


  useEffect(() => {
    getAcreditacionByMonth();
    // getAcreditacionByMonth_Palete();
    getProfileTime();
    getAverageByMonth();

    ConfigurarPaletteEstados();
    ConfigurarPalettePerfiles();
    ConfigurarPalettePromedio();
  }, [
    props.acreditacion_x_Perfil,
    props.acreditacion_x_Perfil_Mes,
    props.acreditacion_Promedio,
    props.promedioPaleteData
  ]);


  return (
      <PortletBody>

        {/*##################################- I- HISTOGRAMA-################################## */}
        {/*+++++++++++++++++++++++++++++++++- TITULO (1)-+++++++++++++++++++++++++++++++++ */}
        <div className="row" style={{ boxShadow: "rgb(38 57 77) 4px 3px 13px -7px" }} >

          <div className="col-md-6"   >
            <h6 style={{ marginTop: "10px" }} > {intl.formatMessage({ id: "ACREDITATION.R001.STADISTIC.DATA.STATUS" }).toUpperCase() + "-" + props.dataRowEditNew.Anio} </h6>
          </div>
          <div className="col-md-6"  >
            <h6 style={{ marginTop: "10px", color: '#337ab7' }} > {intl.formatMessage({ id: "COMMON.REPORT" }).toUpperCase() + " " + props.dataRowEditNew.Compania + "-" + props.dataRowEditNew.Anio} </h6>
          </div>
        </div>

        <div className="row" style={{ width: "100%", height: "10%", marginTop: "13px" }}>

          <div style={{ width: "75%" }}>
            {/*+++++++++++++++++++++++++++++++++- HISTOGRAMA (1)-+++++++++++++++++++++++++++++++++ */}
            <Bar
              data={acreditacionesPorMes}
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
                      },
                      display: true,
                      title: {
                        display: true,
                        text: 'value'
                      }
                    }
                  ]
                },
              }}
              getElementAtEvent={getElementAtEvent}
            />

          </div>
          <div style={{ width: "25%" }} >
            {/*+++++++++++++++++++++++++++++++++- DONA (1)-+++++++++++++++++++++++++++++++++ */}
            <Doughnut
              data={dataDonut}
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


        {/*##################################- II - HISTOGRAMA -################################## */}
        {/*+++++++++++++++++++++++++++++++++- TITULO (2)-+++++++++++++++++++++++++++++++++ */}
        <div className="row" style={{ boxShadow: "rgb(38 57 77) 4px 3px 13px -7px" }} >
          <div className="col-md-12"   >
            <h6 style={{ marginTop: "10px" }} > {intl.formatMessage({ id: "ACREDITATION.R001.STADISTIC.DATA.PROFILES" }).toUpperCase() + "-" + props.dataRowEditNew.Anio} </h6>
          </div>
        </div>

        <div className="row" style={{ width: "100%", height: "10%", marginTop: "13px" }}>
          <div style={{ width: "75%" }}>
            {/*+++++++++++++++++++++++++++++++++- HISTOGRAMA (1)-+++++++++++++++++++++++++++++++++ */}
            <Bar data={dataPerfil}
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
              getElementAtEvent={getElementAtEventProfile}
            />
          </div>
          <div style={{ width: "25%" }}>
            {/*+++++++++++++++++++++++++++++++++- Dona (2)-+++++++++++++++++++++++++++++++++ */}
            <Doughnut
              data={dataDonutPerfil}
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

        {/*##################################- III - HISTOGRAMA -################################## */}
        {/*+++++++++++++++++++++++++++++++++- TITULO (3)-+++++++++++++++++++++++++++++++++ */}

        {/* <div className="row" style={{ boxShadow: "rgb(38 57 77) 4px 3px 13px -7px" }} >
          <div className="col-md-12"   >
            <h6 style={{ marginTop: "10px" }} > {intl.formatMessage({ id: "ACREDITATION.R001.STADISTIC.DATA.AVERAGE" }).toUpperCase() + "-" + props.dataRowEditNew.Anio} </h6>
          </div>
        </div>

        <div className="row" style={{ width: "100%", height: "10%", marginTop: "13px" }}>

          <div style={{ width: "75%" }}>
            <Bar
              data={dataPromedio}
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
              }} />
          </div>
          <div style={{ width: "25%" }}>
            <Doughnut
              data={dataDonutPromedio}
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

        </div> */}

      </PortletBody>
  );
};

export default injectIntl(ReporteHistogramaPage);
