import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import {
  isNotEmpty,  
} from "../../../../../../_metronic";
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);

const ReporteMovimientoEstadisticas = props => {
  const [estadoSimple, setEstadoSimple] = useState([]);
  const { intl, settingDataField, accessButton } = props;
  const [condicionPorMes, setCondicionPorMes] = useState([]);
  const [funcionesPorMes, setFuncionesPorMes] = useState([]);
  const [dataDonut, setDataDonut] = useState({ labels: [], datasets: [{ data: [], backgroundColor: [], borderColor: [] }] });
  /*+++++++++++++++++++++++++++++++++++++++-Histograma-++++++++++++++++++++++++++++++++++++++++++++++*/
  function returnSecondaryColor(params) {
    let color = "";

    if (params === 0) {
      color = "rgb(60, 186, 178)";
    } else if (params === 1) {
      color = "rgb(142, 217, 98)";
    } else if (params === 2) {
      color = "green";
    } else if (params === 3) {
      color = "black";
    } else if (params === 4) {
      color = "red";
    } else if (params === 5) {
      color = "yellow";
    }
    return color;
  }

  const getConditionByMonth = () => {
  var responseBd = isNotEmpty(props.condicionPersona_x_Mes) ? props.condicionPersona_x_Mes : [];

    if (responseBd.length > 0) {
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
          label: item.Condicion,
          data: valuesAcreditacion,
          backgroundColor: item.BackgroundColor
        });

      });

      let data = {
        labels: responseBd[0].ColumnName.split(','),
        datasets: datasets
      };

      setCondicionPorMes(data);
    } else {
      setCondicionPorMes([]);
    }
  };

  const getFunctionByMonth = () => {
    var responseBd = props.funcione_x_Mes;

    if (responseBd.length > 0) {
      let meses = [];
      let datasets = [];
      var RowId = 0;

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
          label: item.Funcion,
          data: values,
          backgroundColor: returnSecondaryColor(RowId)
        });

        RowId++;
      });

      let data = {
        labels: responseBd[0].ColumnName.split(','),
        datasets: datasets
      };
      setFuncionesPorMes(data);
    } else {
      setFuncionesPorMes([]);

    }
  };

  function ConfigurarPaletteCondicion(){

    var responseBd = props.condicionPersona_x_Mes_Palette;
 
     if (responseBd.length > 0) {

          let labels = [];
          let data = [];
          let backgroundColor = [];
          let borderColor = [];

          responseBd.map(item => {

            labels.push(item.Condicion);

          if (item.Condicion === "ALTAS"){
            data.push(isNotEmpty(item.Cantidad) ? item.Cantidad : 0);
            backgroundColor.push( item.BackgroundColor );
            borderColor.push( item.BorderColor );

          }
            if (item.Condicion === "BAJAS"){
              data.push(isNotEmpty(item.Cantidad) ? item.Cantidad : 0);
              backgroundColor.push( item.BackgroundColor );
              borderColor.push( item.BorderColor );

            }
         
          });

          setDataDonut({ 
            labels,
            datasets: [{ 
              data,
              label: '',
              backgroundColor: backgroundColor,
              borderColor :borderColor
              }] 
        })

        }else
        {
          setDataDonut({});
        }
    }

// obtener resumen datos Estadisticos
  const getElementAtEvent = e => {
  if (!e.length) return;
  const { datasetIndex, index } = e[0];
    let month = parseInt(props.dataRowEditNew.MesInicio) > 0 ? index + parseInt(props.dataRowEditNew.MesInicio) - 1 : index;
    let condicion = condicionPorMes.datasets[datasetIndex].label;
    props.listarDetalleEstadistico(month, condicion,'');
  };

  const getElementAtEventProfile = e => {
    if (!e.length) return;
    const { datasetIndex, index } = e[0];
      let month = index;
      let funcion  = funcionesPorMes.datasets[datasetIndex].label;
      props.listarDetalleEstadistico(month, '', funcion);
    };
  

    const optionsPDF = {
      orientation: 'landscape',
      unit: 'in',
      format: [20, 20] //height, width
  };

  useEffect(() => {
    getConditionByMonth(); 
    ConfigurarPaletteCondicion();
    getFunctionByMonth();

  }, [
    props.condicionPersona_x_Mes,
    props.condicionPersona_x_Mes_Palette,
    props.funcione_x_Mes
  ]);

  return (
    <>

  
  <br></br>
    <div className="col-12">
        {/*+++++++++++++++++++++++++++++++++- TITULO (1)-+++++++++++++++++++++++++++++++++ */}
        <div className="row" style={{ boxShadow: "rgb(38 57 77) 4px 3px 13px -7px" }} >

        <div className="col-md-6"   >
          <h6 style={{ marginTop: "10px" }} > {intl.formatMessage({ id: "ADMINISTRATION.R001.STADISTIC.DATA.CONDITION" }).toUpperCase() + "-" + props.dataRowEditNew.Anio} </h6>
        </div>
        <div className="col-md-6"  >
          <h6 style={{ marginTop: "10px", color: '#337ab7' }} > {intl.formatMessage({ id: "COMMON.REPORT" }).toUpperCase() + "-" + props.dataRowEditNew.Anio} </h6>
        </div>
        </div>
        
        <div className="row" style={{ width: "100%", marginLeft: "15px" }}>
          <div  style={{ width: "70%" }}>
            <Bar
              data={condicionPorMes}
              width={100}
              height={415}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend:{ 
                    position :'left', 
                  },
                  title: {
                    display: true,
                    text: intl.formatMessage({ id: "ADMINISTRATION.R001.STADISTIC.DATA.CONDITION" })
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

          <div style={{ width: "28%" }}>
              <Doughnut 
              data={dataDonut}
              width={100}
              height={415}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend:{ 
                    position :'left', 
                  },
                  title: {
                    display: true,
                    text: intl.formatMessage({ id: "ADMINISTRATION.R001.STADISTIC.DATA.CONDITION" }),
                    align: "center"
                  },

                  datalabels: {
                    formatter: (value, ctx) => {
                      let  percentage = 0;
                        if (value > 0 ) {
                          percentage = Math.round(value) + "%";
                          return percentage;
                        } else {
                          return percentage;
                        }
                    },
                    color: "black",
                  },
                  tooltips: {
                    backgroundColor: "#5a6e7f",
                  },
                }
              }}
              />
          </div>

        </div>

    </div>
  {/* </div> */}


    </>
  );
};

export default injectIntl(ReporteMovimientoEstadisticas);
