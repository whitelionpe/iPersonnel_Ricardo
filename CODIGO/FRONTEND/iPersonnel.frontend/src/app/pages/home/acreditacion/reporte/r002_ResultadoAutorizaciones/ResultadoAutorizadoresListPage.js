import React, { useEffect, useState } from "react";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import { dateFormat, isNotEmpty, exportExcelDataGrid } from "../../../../../../_metronic";
import DataGrid, { Column, Editing, Selection, Summary, SortByGroupSummaryInfo, TotalItem } from 'devextreme-react/data-grid';
import { Doughnut, Bar } from "react-chartjs-2";
import Form, {
  Item,
  GroupItem,
  PatternRule
} from "devextreme-react/form";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";

const ResultadoAutorizadoresListPage = props => {

  const { intl, accessButton } = props;

  const [viewFilter, setViewFilter] = useState(true);
  const [dataGridRef, setDataGridRef] = useState(null);
  const [dataHistogramaAutorizadores, setDataHistogramaAutorizadores] = useState([]);

  const editarRegistro = evt => {
    props.editarRegistro(evt.data);
  };

  const eliminarRegistro = evt => {
    evt.cancel = true;
    props.eliminarRegistro(evt.data);
  };

  const obtenerCampoActivo = rowData => {
    return rowData.Activo === "S";
  }

  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  }

  const seleccionarRegistroDblClick = evt => {
    if (evt.data === undefined) return;
    if (isNotEmpty(evt.data)) {
      props.verRegistroDblClick(evt.data);
    };
  }


  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  }

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
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
    title = intl.formatMessage({ id: "ASSISTANCE.AUTHORIZER" });
    fileName = intl.formatMessage({ id: "ASSISTANCE.AUTHORIZER" }) + "_" + dateFormat(new Date(), "yyyyMMdd");

    if (dataGridRef != undefined) {
      refDataGrid = dataGridRef.instance;
      exportExcelDataGrid(title, refDataGrid, fileName);
    }
    else {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.NO.DATA" }) + " " + intl.formatMessage({ id: "ACTION.EXPORT" }));
    }

  }

  const filtrar = () => {
    const { FechaInicio, FechaFin } = props.dataRowEditNew;
    props.dataRowEditNew.FechaInicio = FechaInicio;
    props.dataRowEditNew.FechaFin = FechaFin;
    props.listarResultadoAutorizadores();
  }


  const getEstadisticaAutorizadores = () => {
    var responseBd = props.dataEstadisticoAutorizadores;

    // console.log("getEstadisticaAutorizadores|responseBd:",responseBd);

    if (responseBd.length > 0) {

      let values = [];
      let backgroundColor = [];
      let borderColor = [];
      let labels = [];

      responseBd.map(item => {
        labels.push(isNotEmpty(item.Autorizador) ? item.Autorizador : "");
        values.push(isNotEmpty(item.PromedioHoras) ? item.PromedioHoras : 0);
        backgroundColor.push(isNotEmpty(item.BackgroundColor) ? item.BackgroundColor : "");
        borderColor.push(isNotEmpty(item.BorderColor) ? item.BorderColor : "");
      });

      // let ColumNamesAutorizador = responseBd.map((x) => x.Autorizador);

      let data = {
        labels: labels,
        datasets: [
          {
            label: '# Promedio Atención',
            data: values,
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            borderWidth: 1,
          },
        ],
      };

      setDataHistogramaAutorizadores(data);
    } else {
      setDataHistogramaAutorizadores([]);
    }
  };


  const data = {
    labels: ['AREA MÉDICA', 'RECURSOS HUMANOS', 'ADMIN', 'SEGURIDAD'],
    datasets: [
      {
        label: '# of Votes',
        data: [12, 19, 3, 5],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    // Elements options apply to all of the options unless overridden in a dataset
    // In this case, we are setting the border of each horizontal bar to be 2px wide
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Chart.js Horizontal Bar Chart',
      },
    },
  };


  useEffect(() => {
    getEstadisticaAutorizadores();
  }, [props.dataEstadisticoAutorizadores]);


  return (
    <>
      {/* <PortletHeader
                title={intl.formatMessage({ id: "ACTION.LIST" })}
                toolbar={
                    <PortletHeaderToolbar>
                        <PortletHeaderToolbar>
                            <Button icon="plus" type="default" hint={intl.formatMessage({ id: "ACTION.NEW" })} onClick={props.nuevoRegistro}  disabled={!accessButton.nuevo}/>
                        </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                }
            /> */}
      <PortletHeader
        title={''}
        toolbar={
          <PortletHeaderToolbar>
            <Button
              icon={viewFilter ? "chevronup" : "chevrondown"}
              type="default"
              hint={viewFilter ? intl.formatMessage({ id: "COMMON.HIDE" }) : intl.formatMessage({ id: "COMMON.SHOW" })}
              onClick={hideFilter}
            />
            &nbsp;
            <Button
              icon="fa fa-search"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.FILTER" })}
              onClick={filtrar}
              disabled={viewFilter ? false : true}
            />

            &nbsp;
            <Button
              icon="fa fa-file-excel"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
              disabled={(props.tabIndex === 0) ? true : false}
              onClick={exportarDatos}
            />
            {/* &nbsp;
            <Pdf targetRef={props.refPdf} filename="Reporte_Estadistico.pdf" options={optionsPDF} x={.1} y={.1}>
              {({ toPdf }) => <Button
                icon="file"
                type="default"
                onClick={toPdf}
                hint={intl.formatMessage({ id: "ACTION.DOWNLOAD" })}
                disabled={(props.tabIndex === 0) ? false : true} />}
            </Pdf> */}

          </PortletHeaderToolbar>
        }

      />

      <PortletBody>

        <Form id="FormFilter" formData={props.dataRowEditNew} validationGroup="FormEdicion" >
          <GroupItem itemType="group" colCount={2} colSpan={2}>

            <Item dataField="FechaInicio"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" }) }}
              isRequired={true}
              editorType="dxDateBox"
              editorOptions={{
                type: "date",
                inputAttr: { 'style': 'text-transform: uppercase' },
                displayFormat: "dd/MM/yyyy",
              }}
            />

            <Item dataField="FechaFin"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" }) }}
              isRequired={true}
              editorType="dxDateBox"
              editorOptions={{
                type: "date",
                inputAttr: { 'style': 'text-transform: uppercase' },
                displayFormat: "dd/MM/yyyy",
              }}
            />

          </GroupItem>
        </Form>

        <br />

        <DataGrid
          dataSource={props.resultadoAutorizadores}
          ref={ref => { setDataGridRef(ref); }}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          // onEditingStart={editarRegistro}
          // onRowRemoving={eliminarRegistro}
          // onFocusedRowChanged={seleccionarRegistro}
          // focusedRowKey={props.focusedRowKey}
          // onRowDblClick={seleccionarRegistroDblClick}
          onCellPrepared={onCellPrepared}
          repaintChangesOnly={true}
        >
          <Editing
            mode="row"
            useIcons={true}
            allowUpdating={false}
            allowDeleting={false}
            texts={textEditing}
          />

          <Column caption={intl.formatMessage({ id: "ASSISTANCE.AUTHORIZER" })} alignment={"center"} >
            <Column dataField="Autorizador" caption={intl.formatMessage({ id: "ASSISTANCE.AUTHORIZER" })} width={"10%"} alignment={"center"} groupIndex={0} />
            <Column dataField="Nombres" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })} width={"20%"} />
            <Column dataField="Alias" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE.DOCU" })} width={"10%"} alignment={"center"} />
            <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })} width={"10%"} alignment={"center"} />
          </Column>

          <Column caption={intl.formatMessage({ id: "COMMON.PENDING" })} alignment={"center"} >
            <Column dataField="Pendiente" caption={intl.formatMessage({ id: "CASINO.CONSOLIDATED.REPORT.CANTIDAD" })} width={"10%"} alignment={"center"} />
            <Column dataField="PorcentajePendientes" format="##'%'" caption="%" width={"10%"} alignment={"center"} />
          </Column>

          <Column caption={intl.formatMessage({ id: "ACREDITATION.REQUEST.ANSWERED" })} alignment={"center"}>
            <Column dataField="Aprobado" caption={intl.formatMessage({ id: "COMMON.APPROVED" })} width={"10%"} alignment={"center"} />
            <Column dataField="Observado" caption={intl.formatMessage({ id: "COMMON.OBSERVED" })} width={"10%"} alignment={"center"} />
            <Column dataField="Rechazado" caption={intl.formatMessage({ id: "COMMON.REJECTED" })} width={"10%"} alignment={"center"} />
            <Column dataField="TotalAtendidas" caption={intl.formatMessage({ id: "COMMON.TOTAL" })} width={"10%"} alignment={"center"} />
            <Column dataField="PorcentajeAtendidos" format="##'%'" caption="%" width={"10%"} alignment={"center"} />
          </Column>

          <Column caption={intl.formatMessage({ id: "COMMON.AVERAGE" })} alignment={"center"}>
            <Column dataField="PromedioHoras" caption={intl.formatMessage({ id: "ACREDITATION.HOUR.ANSWERED" })} width={"10%"} alignment={"center"} />
          </Column>
          {/* <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="IdRequisito"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({id:"COMMON.TOTAL.ROW"}) } {0}`}
                            width={150}
                        />                      
                    </Summary> */}
        </DataGrid>

        <br />

        <div
          id={"ContenedorEstadistico"}
        // ref={props.refPdf} 
        >

          {/*##################################- I- HISTOGRAMA-################################## */}
          {/*+++++++++++++++++++++++++++++++++- TITULO (1)-+++++++++++++++++++++++++++++++++ */}
          <div className="row" style={{ boxShadow: "rgb(38 57 77) 4px 3px 13px -7px" }} >

            <div className="col-md-6"   >
              <h6 style={{ marginTop: "10px" }} > {intl.formatMessage({ id: "ACREDITATION.STATUS.AREA" }).toUpperCase() + "-" + dateFormat(new Date(), "yyyy")} </h6>
            </div>
            {/* <div className="col-md-6"  >
            <h6 style={{ marginTop: "10px", color: '#337ab7' }} > {intl.formatMessage({ id: "COMMON.REPORT" }).toUpperCase() + " " + props.dataRowEditNew.CompaniaMandante + "-" + props.dataRowEditNew.Anio} </h6>
          </div> */}
          </div>

          <div className="row" style={{ width: "100%", height: "10%", marginTop: "13px" }}>

            <div style={{ width: "70%" }}>
              {/*+++++++++++++++++++++++++++++++++- HISTOGRAMA (1)-+++++++++++++++++++++++++++++++++ */}
              <Bar
                data={dataHistogramaAutorizadores}
                width={100}
                height={300}
                // options={options}
                options={{
                  indexAxis: 'y',
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
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
              // getElementAtEvent={getElementAtEvent}
              />

            </div>


          </div>

        </div>



      </PortletBody>
    </>
  );
};

export default injectIntl(ResultadoAutorizadoresListPage);
