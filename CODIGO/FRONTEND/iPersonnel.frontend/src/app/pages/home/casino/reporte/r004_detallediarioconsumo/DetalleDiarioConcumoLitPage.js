import React, { useState, useEffect, useRef } from "react";
import { injectIntl } from "react-intl";
import { PortletBody } from "../../../../../partials/content/Portlet";
import { DataGrid, Column, FilterRow, HeaderFilter, FilterPanel } from "devextreme-react/data-grid";
import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { initialFilter } from "./DetalleDiarioConcumoIndexPage";
//ADD
import DataGridDynamic from "./DataGridDynamic";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { dateFormat, PaginationSetting } from "../../../../../../_metronic/utils/utils";
import { crear as crearReserva, reservas as listarReservas } from "../../../../../api/campamento/reserva.api";
import { filtrarPersonalSinHorario } from "../../../../../api/asistencia/reporte.api";
import {
  esDiaDisponible, crearArregloColumnasHeader, cellRenderReserva,
  cellRenderHabitacion, onCellPreparedDay
} from './ReservasUtil';

const DetalleDiarioConcumoLitPage = props => {
  const { intl, setDataGridRef, dataIdCompania, dataResult } = props;

  const [filterData, setFilterData] = useState({
    ...initialFilter,
    IdCliente,
    IdDivision,
  });


  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [dataViewHtml, setViewHtml] = useState(false);
  const [viewPagination, setViewPagination] = useState(false);
  const dataGridRef = useRef(null);
  const [listaParaReserva, setListaParaReserva] = useState([]);
  const [columnasDinamicas, setColumnasDinamicas] = useState([]);

  // PAGINATION
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;

  useEffect(() => {
    if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage])

  useEffect(() => {
    if (dataIdCompania) {
      Object.assign(filterData, { 'IdCompania': dataIdCompania[0].IdCompania });
      setViewHtml(true)
    }

  }, [dataIdCompania]);


  useEffect(() => {
    if (dataResult) {
      buscarReservas(dataResult)
    }

  }, [dataResult]);

  const columnasEstaticas = [
    {
      dataField: "Columnas",
      isValues: false,
      caption: intl.formatMessage({ id: "CONFIG.MENU.COMEDORES.DETALLE_DIARIO_CONSUMO_STAFF" }),
      items: [
        {
          dataField: "TipoModulo",
          caption: intl.formatMessage({ id: "CONFIG.MENU.COMEDORES.COMPANIA" }),
          width: "140"
        },
        {
          dataField: "Modulo",
          caption: intl.formatMessage({ id: "SECURITY.USER.DOCUMENTNUMBER" }),
          width: "120"
        },
        {
          dataField: "TipoHabitacion",
          caption: intl.formatMessage({ id: "ACCREDITATION.LIST.SURNAMESNAMES" }),
          width: "240"
        },

      ]
    } 
  ];

  // const buscarReservas_onClick = async (e, noValidate) => {
  //   buscarReservas(0, PaginationSetting.TOTAL_RECORDS);
  // };

  const buscarReservas = async (dataResult) => {


    setListaParaReserva(dataResult.resultados)
    //Creando columnas dinamicas:
    let header_json = crearArregloColumnasHeader((dataResult.headerColumns || []), intl, null);
    if (header_json.length > 0) {
      setColumnasDinamicas(header_json);
    }

    /*
    let datosReserva = await buscarDisponibilidadReservas(
      skip,
      take
    ); //Pagina 1 de [0 a 20]

    //Creando columnas dinamicas:
    let header_json = crearArregloColumnasHeader(
      datosReserva.headerColumns || [],
      intl,
      { cellRender: cellRenderReservaDia }
    );

    if (header_json.length > 0) {
      setColumnasDinamicas(header_json);
    }

    */

  };

  //======================================================================

  return (
    <PortletBody >
      <React.Fragment>
        <DataGridDynamic
          intl={intl}
          dataSource={listaParaReserva}
          staticColumns={columnasEstaticas}
          dynamicColumns={columnasDinamicas}//ACCION DE FILTRAR
          isLoadedResults={viewPagination}
          setIsLoadedResults={setViewPagination}
          refreshDataSource={buscarReservas}
          dataGridRef={dataGridRef}
          events={{
            onCellPrepared: onCellPreparedDay,
           
        }}
        />
      </React.Fragment>
    </PortletBody>
  );
};



export default injectIntl(WithLoandingPanel(DetalleDiarioConcumoLitPage));


