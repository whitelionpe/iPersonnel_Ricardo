import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { PortletBody } from "../../../../../partials/content/Portlet";
import { DataGrid, Column, FilterRow, HeaderFilter, FilterPanel } from "devextreme-react/data-grid";
import { getStartAndEndOfMonthByDay } from "../../../../../../_metronic";
import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";

import { storeListar as loadUrl } from "../../../../../api/acceso/reporte.api";
import { initialFilter } from "./ReporteRequisitoIndexPage";


const ReporteRequisitoListPage = props => {
  const { intl, setDataGridRef } = props;
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);
  const { FechaInicio } = getStartAndEndOfMonthByDay();

  //Variables de CustomerDataGrid
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({
    ...initialFilter,
    IdCliente,
    IdDivision,
    TipoReporte: 'P',
    FechaInicio
  });

  // PAGINATION
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;


  useEffect(() => {
    if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage])

  // useEffect(() => {
  //   if (IdDivision) {
  //     props.dataSource.loadDataWithFilter({ data: { IdDivision } });
  //   }
  // }, [IdDivision]);

  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter =
    [
      'IdCliente',
      'IdDivision',
      'TipoReporte',
      'IdCompania',
      'IdUnidadOrganizativa',
      'IdPerfil',
      'IdRequisito',
      'VigenciaActual',
      'DiasVencimiento',
      'FechaCorte'
    ];

    function onCellPrepared(e) {
      if (e.rowType === 'data') {
        if (e.data.Vencidos === 'SI') {
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


          {/* <Column
            dataField="IdCompania"
            caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.RUC" })}
            allowSorting={true}
            allowHeaderFiltering={false}
            alignment={"center"}
            width={"10%"}
          /> */}
          <Column dataField="Compania"
            caption={intl.formatMessage({ id: "ACCESS.PERSON.POSITION.COMPANY" })}
            allowHeaderFiltering={false}
            allowSorting={true}
            width={"15%"}
            alignment={"left"} />
          <Column
            dataField="NombreCompleto"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
            allowSorting={true}
            allowHeaderFiltering={false}
            width={"18%"}
          />

          <Column dataField="Documento"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}
            allowHeaderFiltering={false}
            width={"7%"}
            alignment={"center"}
          />

          <Column
            dataField="UnidadOrganizativa"
            caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.UNIDADORGANIZATIVA.ABR" })}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"15%"}
          />

          <Column
            dataField="Requisito"
            caption={intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT" })}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={true}
            alignment={"left"}
            width={"15%"}
          />
          <Column
            dataField="RequisitoAsignado"
            caption={intl.formatMessage({ id: "SYSTEM.TEAM.ASSIGNED" })}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            alignment={"center"}
            width={"6%"}
          />
          <Column
            dataField="FechaFin"
            caption={intl.formatMessage({ id: "IDENTIFICATION.EXPIRATION" })}
            alignment={"center"}
            allowHeaderFiltering={true}
            allowFiltering={false}
            width={"8%"}
          />
          <Column
            dataField="Vencidos"
            caption={intl.formatMessage({ id: "ACCESS.OVERDUE" })}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            alignment={"center"}
            width={"6%"}
          />

          <Column dataField="DiasPorVencer"
            caption={intl.formatMessage({ id: "ACCESS.DAY.SCHEDULE" })}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"8%"}
            alignment={"center"}
          />

        </DataGrid>
      </>
    );
  }

  return (
    <>

      <PortletBody>
        <CustomDataGrid
          showLog={false} 
          uniqueId={props.uniqueId}
          dataSource={props.dataSource}
          rowNumberName='RowIndex'
          loadWhenStartingComponent={props.isFirstDataLoad && !props.refreshData}
          renderDataGrid={renderDataGrid}
          loadUrl={loadUrl}
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
    </>
  );
};
ReporteRequisitoListPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string

}
ReporteRequisitoListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  showHeaderInformation: false,
  uniqueId: 'reporteVencimientoRequisitoList'
}

export default injectIntl(ReporteRequisitoListPage);
