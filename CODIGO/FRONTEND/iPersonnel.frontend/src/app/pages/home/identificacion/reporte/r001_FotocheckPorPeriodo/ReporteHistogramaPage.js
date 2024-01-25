import React, { useEffect, useState } from "react";
import { PortletBody } from "../../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import { isNotEmpty, } from "../../../../../../_metronic";
import { Doughnut, Bar } from "react-chartjs-2";
import { Chart } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);

const ReporteHistogramaPage = props => {

  const { intl } = props;
  const [dataMotivo, setDataMotivo] = useState([]);
  const [dataModelo, setDataModelo] = useState([]);
  const [dataDonutMotivo, setDataDonutMotivo] = useState({ labels: [], datasets: [{ data: [], backgroundColor: [], borderColor: [] }] });
  const [dataDonutModelo, setDataDonutModelo] = useState({ labels: [], datasets: [{ data: [], backgroundColor: [], borderColor: [] }] });

  const getProfileMotivo = () => {
    //debugger;
    var responseBd = props.identificacionPeriodoMotivo;

    if (responseBd.length > 0) {
      let meses = [];
      meses = responseBd[0].ColumnName.split(',');
      let datasets = [];

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
          labelId: isNotEmpty(item.IdMotivo) ? item.IdMotivo : "",
          label: isNotEmpty(item.Alias) ? item.Alias.toUpperCase() : "",
          data: values,
          backgroundColor: item.BackgroundColor
        });

      });

      let data = {
        labels: meses,
        datasets: datasets
      };
      setDataMotivo(data);
    } else {
      setDataMotivo([]);

    }
  };

  const getProfileModelo = () => {
    var responseBd = props.identificacionPeriodoModelo;
    //debugger;

    if (responseBd.length > 0) {
      let meses = [];
      meses = responseBd[0].ColumnName.split(',');
      let datasets = [];

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
          labelId: isNotEmpty(item.IdModelo) ? item.IdModelo : "",
          label: isNotEmpty(item.Alias) ? item.Alias.toUpperCase() : "",
          data: values,
          backgroundColor: item.BackgroundColor
        });

      });

      let data = {
        labels: meses,
        datasets: datasets
      };
      setDataModelo(data);
    } else {
      setDataModelo([]);

    }
  };


  const getElementAtEventProfile = e => {
    //debugger;
    if (!e.length) return;
    const { datasetIndex, index } = e[0];
    let month = parseInt(props.dataRowEditNew.MesInicio) > 0 ? index + parseInt(props.dataRowEditNew.MesInicio) - 1 : index;
    //let motivo = dataMotivo.datasets[datasetIndex].label;
    let motivo = dataMotivo.datasets[datasetIndex].labelId;
    props.obtenerHistogramaDetalle(month, motivo, '');
  };

  const getElementAtEventProfileModelo = e => {
    if (!e.length) return;
    const { datasetIndex, index } = e[0];
    let month = parseInt(props.dataRowEditNew.MesInicio) > 0 ? index + parseInt(props.dataRowEditNew.MesInicio) - 1 : index;
    //let modelo = dataModelo.datasets[datasetIndex].label;
    let modelo = dataModelo.datasets[datasetIndex].labelId;
    props.obtenerHistogramaDetalle(month, '', modelo);
  };

  function ConfigurarDonutMotivo() {

    var responseBd = props.identificacionPeriodoMotivo;

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

      setDataDonutMotivo({
        labels,
        datasets: [{
          data,
          label: '',
          backgroundColor: backgroundColor,
          borderColor: borderColor,
        }]
      })

    } else {
      setDataDonutMotivo({});
    }
  }

  function initializerIfEmpty() {

    if (props.dataRowEditNew.Anio == null) {
      props.dataRowEditNew.Anio = "";
    }

    if (props.dataRowEditNew.CompaniaMandante == null) {
      props.dataRowEditNew.CompaniaMandante = "";
    }

  }

  function ConfigurarDonutModelo() {

    var responseBd = props.identificacionPeriodoModelo;

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

      setDataDonutModelo({
        labels,
        datasets: [{
          data,
          label: '',
          backgroundColor: backgroundColor,
          borderColor: borderColor,
        }]
      })

    } else {
      setDataDonutModelo({});
    }
  }

  useEffect(() => {
    getProfileMotivo();
    getProfileModelo();
    ConfigurarDonutMotivo();
    ConfigurarDonutModelo();
    initializerIfEmpty();
  }, [
    props.identificacionPeriodoMotivo,
    props.identificacionPeriodoModelo
  ]);


  return (

  
      <PortletBody>

        <div className="row" style={{ boxShadow: "rgb(38 57 77) 4px 3px 13px -7px" }} >

          <div className="col-md-6"   >
            <h6 style={{ marginTop: "10px" }} > {intl.formatMessage({ id: "IDENTIFICATION.REPORT.REASON" }).toUpperCase() + " " + props.dataRowEditNew.Anio} </h6>
          </div>
          <div className="col-md-6"  >
            <h6 style={{ marginTop: "10px", color: '#337ab7' }} > {intl.formatMessage({ id: "COMMON.REPORT" }).toUpperCase() + " " + props.dataRowEditNew.CompaniaMandante + "-" + props.dataRowEditNew.Anio} </h6>
          </div>
          <div className="row" style={{ width: "100%", height: "10%", marginTop: "13px" }}>
            <div style={{ width: "75%" }}>
              <Bar data={dataMotivo}
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
              <Doughnut
                data={dataDonutMotivo}
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


        <div className="row" style={{ boxShadow: "rgb(38 57 77) 4px 3px 13px -7px" }} >
          <div className="col-md-12"   >
            <h6 style={{ marginTop: "10px" }} > {intl.formatMessage({ id: "IDENTIFICATION.REPORT.MODEL" }).toUpperCase() + " " + props.dataRowEditNew.Anio} </h6>
          </div>
        </div>

        <div className="row" style={{ width: "100%", height: "10%", marginTop: "13px" }}>
          <div style={{ width: "75%" }}>
            <Bar data={dataModelo}
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
              getElementAtEvent={getElementAtEventProfileModelo}
            />
          </div>
          <div style={{ width: "25%" }}>
            <Doughnut
              data={dataDonutModelo}
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

      </PortletBody>
   
  );
};

export default injectIntl(ReporteHistogramaPage);
