import React, { Fragment, useState, useEffect, useRef } from 'react';
import { PaginationSetting } from '../../../../../../_metronic/utils/utils';
import { DataGrid, Column, Button as ColumnButton, Selection } from "devextreme-react/data-grid";
import Pagination from "react-bootstrap-4-pagination";
import './DataGridDynamic.css';
const DataGridDynamic = ({
  dataSource = [],

  staticColumns = [],
  dynamicColumns = [],
  events = {},
  className = "datagrid_sin_sombra",
  isLoadedResults = false,
  setIsLoadedResults = () => { },
  refreshDataSource = () => { },

  dataGridRef = null,
  staticColumnsButtons = [],
  selectionMode = "single"
}) => {


  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMax, setShowMax] = useState(PaginationSetting.SHOW_MAX);
  const [viewPagination, setViewPagination] = useState(false);
  const [summaryCountText, setSummaryCountText] = useState('0 de 0');
  const pageSize = PaginationSetting.TOTAL_RECORDS;

  const onChangePage = async (page) => {
    let newShowMax = showMax;

    setCurrentPage(page);

    let skip = ((page - 1) * pageSize);
    let take = pageSize;
    // refreshDataSource(skip, take);
    if (page === totalPages) { //Estoy en la ultima pagina:
      newShowMax = 2;
    } else {
      //Retorno de ultima pagina:
      if (totalPages - page >= Math.floor(PaginationSetting.SHOW_MAX / 2)) {
        newShowMax = PaginationSetting.SHOW_MAX;
      } else {
        newShowMax = totalPages - page + 1
        //console.log(".................> ", newShowMax);
      }
    }
    if (showMax !== newShowMax) setShowMax(newShowMax);

  }

  //=============================== LLENAN LAS CELDAS =======================
  const cellRenders_Des = (param) => {
    console.log('jorge', param);
    console.log('test', param.column.dataField);

    let fecha = param.column.dataField;
      let columnValid = param.column.dataField.substring(0, 2);
      if (columnValid === 'K_') {
        // console.log('MANUEL data', param.data. eval(fecha));
      }

    // if (param && param.data) {

    //   console.log('MANUEL data', param.data);
        //   let fecha = param.column.dataField;
        //   const arrayOfObjs = Object.keys(param.data)
        //   // let IdCama = param.data.fecha;
        //   // console.log('MANUEL fecha', fecha);
          
        //   arrayOfObjs.forEach( function(valor, indice, array) {
        //     console.log('MANUEL valor', valor);
        //     console.log('MANUEL data', param.data);
        //     if(valor=="K_20221231"){
        //       console.log('MANUEL 111111111111', param.data);
        //     }
            
        // });

          // let [idReserva, turno, estado, idPersona, EstadoCama, CamaExclusiva] = param.text.split('_');
          // let currentIdPersona = 0;
          // let leyenda = getEstadoCeldaDia(currentIdPersona, idReserva, turno, estado, idPersona, EstadoCama, CamaExclusiva);
          // let css_clase = getClassCeldaByEstado(leyenda);
          return (
            <span id={1} >1</span>
          );

  // }

  }

  const cargarColumnasDinamicas = (columnas) => {



    var i = 0;
    return columnas.map(
      x => {
        x.items = x.items || [];
        if (!x.hasOwnProperty('alignment')) {
          x.alignment = "left";
        }

        if (x.items.length > 0 && x.isValues != false) {
          i++;
          return (
            <Column
              key={i}
              caption={x.caption}
              alignment="center"
              {...x.events}
            >
              {
                x.items.map(y => (
                  (y.name && y.name !== "") ? (
                    <Column
                      key={`D1_${y.dataField}`}
                      caption={y.name}
                      alignment={y.hasOwnProperty('alignment') ? y.alignment : 'left'}
                    >
                      < Column
                        key={`D2_${y.dataField}`}
                        dataField={y.dataField}
                        caption={y.caption}
                        width={y.width}
                        alignment={y.hasOwnProperty('alignment') ? y.alignment : 'left'}
                        {...y.events}
                      ></Column>
                    </Column>
                  ) : (
                    // < Column
                    //   key={`D1_${y.dataField}`}
                    //   dataField={y.dataField}
                    //   caption={y.caption}
                    //   width={y.width}
                    //   alignment={y.hasOwnProperty('alignment') ? y.alignment : 'left'}
                    //   {...y.events}
                    // />


                    <Column caption={y.caption} dataField={y.dataField} key={`D10_${y.dataField}`}>
                      <Column
                        key={`D3_${y.dataField}`}
                        dataField={y.dataField}
                        caption="Des"
                        width={50}
                        cellRender={cellRenders_Des}
                      />
                      <Column
                        key={`D4_${y.dataField}`}
                        dataField={y.dataField}
                        caption="Alm"
                        width={50}
                        cellRender={cellRenders_Des}
                      />
                      <Column
                        key={`D5_${y.dataField}`}
                        dataField={y.dataField}
                        caption="Cen"
                        width={50}
                      />
                      <Column
                        key={`D6_${y.dataField}`}
                        dataField={y.dataField}
                        caption="C.Gua"
                        width={50}
                      />
                    </Column>


                  )
                ))
              }
            </Column>
          );
        } else {
          return <Column
            key={x.dataField}
            dataField={x.dataField}
            caption={x.caption}
            width={x.width}
            alignment={x.alignment}
            {...x.events}
          >
            {
              x.items.map(y => (
                (y.name && y.name !== "") ? (
                  <Column
                    key={`D7_${y.dataField}`}
                    caption={y.name}
                    alignment={y.hasOwnProperty('alignment') ? y.alignment : 'left'}
                  >
                    < Column
                      key={`D8_${y.dataField}`}
                      dataField={y.dataField}
                      caption={y.caption}
                      width={y.width}
                      alignment={y.hasOwnProperty('alignment') ? y.alignment : 'left'}
                      {...y.events}
                    ></Column>
                  </Column>
                ) : (
                  < Column
                    key={`D9_${y.dataField}`}
                    dataField={y.dataField}
                    caption={y.caption}
                    width={y.width}
                    alignment={y.hasOwnProperty('alignment') ? y.alignment : 'left'}
                    {...y.events}
                  />

                )
              ))
            }
          </Column>
        }
      }
    )

  }

  const cargarColumnasButtons = (columnas) => {
    if (columnas.length > 0) {
      //console.log("columnas", columnas);
      if (columnas[0].items) {
        return (<Column type="buttons" width={70}  >
          <ColumnButton icon="event" hint={"Ver Marcaciones"}  {...columnas[0].items[0].events} />
        </Column>)
      }
    }

  }


  function calcularPaginacion(resultados) {
    if (resultados.length > 0) {
      let totalRegistros = resultados[0].TotalCount;

      if (totalRegistros > pageSize) {
        let totalRegistroResultado = resultados.length;

        setTotalPages(Math.round(totalRegistros / pageSize));
        setSummaryCountText(`${totalRegistroResultado} de ${totalRegistros} registros`);
        setViewPagination(true);
      } else {
        setViewPagination(false);
      }
    } else {
      setViewPagination(false);
    }
  }

  useEffect(() => {
    if (isLoadedResults) {
      calcularPaginacion(dataSource);
      setIsLoadedResults(false);
    }
  }, [isLoadedResults]);

  return (
    <Fragment>

      <DataGrid
        dataSource={dataSource}
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr={"Campamento"}
        repaintChangesOnly={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
        selectionMod
        //className={className}
        id={0}
        {...events}
        ref={dataGridRef}
        scrolling={{ showScrollbar: 'always' }} // add scroll style blue
        className="tablaScrollHorizontal" // add scroll style blue
      >
        <Selection mode={selectionMode} />
        {cargarColumnasDinamicas(staticColumns)}
        {cargarColumnasDinamicas(dynamicColumns)}
        {cargarColumnasButtons(staticColumnsButtons)}

      </DataGrid>
      {/* *********************************************************** */}
      {viewPagination ? (
        // <div className="vcg-wrapper-pagination">
        <div className="cls_paginado">
          <span className="dx-datagrid-summary-item dx-datagrid-text-content summaryPagination classColorPaginador_" >{summaryCountText}</span>
          <Pagination
            threeDots
            prevNext
            shadow={false}
            size={'md'}
            totalPages={totalPages}
            showMax={showMax}
            color="#337ab7"
            activeBgColor="#337ab7"
            activeBorderColor="#164873"
            currentPage={currentPage}
            onClick={onChangePage}
          />
        </div>) : null}
      {/* *********************************************************** */}


    </Fragment>
  );
};

export default DataGridDynamic;
