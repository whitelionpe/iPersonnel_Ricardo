import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { PortletBody } from "../../../../../partials/content/Portlet";
import { DataGrid, Column, FilterRow, HeaderFilter, FilterPanel, Scrolling } from "devextreme-react/data-grid";
import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { initialFilter } from "./ResultadoCalculoAsistenciaIndexPage";

import { filtrarResultadoCalculoAsistencia } from "../../../../../api/asistencia/reporte.api"; 

const ResultadoCalculoAsistenciaListPage = props => {
  const { intl, setDataGridRef, dataIdCompania } = props;
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);
 
  //Variables de CustomerDataGrid
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({
    ...initialFilter,
    IdCliente,
    IdDivision,
  });

  // PAGINATION
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;
  

  useEffect(() => {
    if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage])

  useEffect(() => {
    if (dataIdCompania) {
      Object.assign(filterData, { 'IdCompania': dataIdCompania[0].IdCompania });
    }
  }, [dataIdCompania]);


  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter =
    [
      'IdCliente',
      'IdDivision',
      'IdPersona',
      'NombreCompleto',
      'Documento',
      'IdCompania',
      'IdUnidadOrganizativa',
      'IdPosicion',
      'Personas',
      'IdCentroCosto',
      'IdPlanilla',
      'CodigoPlanilla',
      'Estado',
      'FechaInicio',
      'FechaFin'

    ];

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'INACTIVO') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  const renderDataGrid = ({ gridRef, dataSource }) => {
    setDataGridRef(gridRef);
    return (
      <>
        <DataGrid
          dataSource={dataSource}
          ref={gridRef} 
          
          focusedRowEnabled={true}
          allowColumnReordering={true}
          allowColumnResizing={true}
          columnAutoWidth={true}
          onCellPrepared={onCellPrepared} 
        >
          <FilterRow visible={false} showOperationChooser={false} />
          <HeaderFilter visible={false} />
          <FilterPanel visible={false} />
          <Scrolling columnRenderingMode="virtual"/> 

          <Column dataField="IdPersona"
            caption={intl.formatMessage({ id: "COMMON.CODE" })}
            allowHeaderFiltering={false}
            allowSorting={true}
            width={"100"}
            alignment={"center"} />

          <Column
            dataField="NombreCompleto"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
            allowSorting={true}
            allowHeaderFiltering={false}
            width={"230"}            
          /> 

        <Column dataField="TipoDocumentoAlias"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE.DOCU" })}
            allowHeaderFiltering={false}
            width={"70"}
            alignment={"center"}
          />

          <Column dataField="Documento"
            caption={intl.formatMessage({ id: "CASINO.REPORT.DOCUMENTNUMBER" })}
            allowHeaderFiltering={false}
            width={"90"}
            alignment={"center"}
          /> 

          <Column
            dataField="FechaAsistencia"
            caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" })}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            alignment={"center"}
            width={"90"} 
          />

        <Column
            dataField="Horario"
            caption={intl.formatMessage({ id: "ACCESS.SCHEDULE.SCHEDULE" })}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"160"} 
          />

        <Column
            dataField="HorarioEntradaSalida"
            caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.ENTRY.OUT" })}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            alignment="center"
            width={"110"} 
          />

          <Column
            dataField="NumeroMarcas"
            caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.PROCESS.NUMBER_MARKS" })}
            alignment={"center"}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"70"}
          />

          <Column
            dataField="Marcas"
            caption={intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.MARCAS" })}
            alignment={"center"}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"120"}
          />
         
         <Column
            dataField="Equipo"
            caption={intl.formatMessage({ id: "ADMINISTRATION.ZONE.DEVICE" })}
            alignment={"center"}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"120"}
          />
          <Column
            dataField="Regimen"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.REGIME" })}
            alignment={"center"}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"120"}
          />
          <Column
            dataField="Guardia"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.GUARD" })}
            alignment={"center"}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"120"}
          />
          
          <Column
            dataField="Turno"
            caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.TURN" })}
            alignment={"center"}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"100"}  
          />

          <Column
            dataField="MinutosFlexible"
            caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.PROCESS.FLEX_MINUTE" })}
            alignment={"center"}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"80"}  
          />
          
          <Column
            dataField="Feriado"
            caption={intl.formatMessage({ id: "SYSTEM.COUNTRY.HOLIDAY" })}
            alignment={"center"}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"80"} 
          />

          <Column
            dataField="Descanso"
            caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.BREAK" })}
            alignment={"center"}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"80"} 
          />

          <Column
            dataField="Inasistencia"
            caption={intl.formatMessage({ id: "ASSISTANCE.INCIDENCE.INCIDENCE.INASISTENCE" })}
            alignment={"center"}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"90"} 
          />

          <Column
            dataField="TieneJustificacion"
            caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.PROCESS.HAS_JUSTIFICATION" })}
            alignment={"center"}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"150"} 
          />
          <Column
            dataField="JustificacionDiaCompleto"
            caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.PROCESS.JUSTIFICATION_COMPLETE_DAY" })}
            alignment={"center"}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"150"} 
          />
          <Column
            dataField="MinutosTardanza"
            caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.PROCESS.MIN_DELAY" })}
            alignment={"center"}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"130"} 
          />
          <Column
            dataField="MinutosTardanzaJustificada"
            caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.PROCESS.MIN_DELAY_JUSTIFICATE" })}
            alignment={"center"}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"130"} 
          />
          <Column
            dataField="MinutosSalidaTemprano"
            caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.PROCESS.MIN_EARLY_RELEASE" })}
            alignment={"center"}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"130"} 
          />
          <Column
            dataField="MinutosSalidaTempranoJustificada"
            caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.PROCESS.MIN_EARLY_RELEASE_JUSTIFICATE" })}
            alignment={"center"}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"130"} 
          />
          <Column
            dataField="MinutosExtrasEntrada"
            caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.PROCESS.EXTRA_HOUR_ENTRY" })}
            alignment={"center"}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"130"} 
          />
          <Column
            dataField="MinutosExtrasSalida"
            caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.PROCESS.EXTRA_HOUR_OUT" })}
            alignment={"center"}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"130"} 
          />
          <Column
            dataField="MinutosTrabajados"
            caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.PROCESS.WORKED_MINUTES" })}
            alignment={"center"}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"130"} 
          />
          <Column
            dataField="Observacion"
            caption={intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.OBS" })}
            alignment={"left"}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"400"}
          />
        </DataGrid>
      </>
    );
  }



  return (
    <>
      <div id="divGridCalculoAsistencia">
        <PortletBody>
          <CustomDataGrid
          showLog={false} 
            uniqueId={props.uniqueId}
            dataSource={props.dataSource}
            rowNumberName='RowIndex'
            loadWhenStartingComponent={props.isFirstDataLoad && !props.refreshData}
            renderDataGrid={renderDataGrid}
            loadUrl={filtrarResultadoCalculoAsistencia}
            forceLoad={forceLoadTypes.Unforced}
            sendToServerOnlyIfThereAreChanges={true}
            ifThereAreNoChangesLoadFromStorage={ifThereAreNoChangesLoadFromStorage}
            caseSensitiveWhenCheckingForChanges={true}
            uppercaseFilterRow={true}
            initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'NombreCompleto', order: 'asc' } }}
            filterRowSize='sm'
            summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}
            visibleCustomFilter={false}
            keysToGenerateFilter={keysToGenerateFilter}
            filterData={filterData}
            // PAGINATION
            paginationSize='md'
            // EVENTS
            onLoading={() => setCustomDataGridIsBusy(true)}
            onError={() => setCustomDataGridIsBusy(false)}
            onLoaded={() => setCustomDataGridIsBusy(false)}
          />
        </PortletBody> 
      </div>
    </>
  );
};
ResultadoCalculoAsistenciaListPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string

}
ResultadoCalculoAsistenciaListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  showHeaderInformation: false,
  uniqueId: 'reporte_r006_ResultadoCalculoAsistenciaListPage'
}

export default injectIntl(ResultadoCalculoAsistenciaListPage);
