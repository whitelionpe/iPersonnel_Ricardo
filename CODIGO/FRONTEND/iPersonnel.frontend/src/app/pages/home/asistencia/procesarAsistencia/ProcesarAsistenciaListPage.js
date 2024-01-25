import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { PortletBody } from "../../../../partials/content/Portlet";
import { DataGrid, Column, FilterRow, HeaderFilter, FilterPanel } from "devextreme-react/data-grid";
import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { initialFilter } from "./ProcesarAsistenciaIndexPage";

import { filtrarProcesoAsistencia } from "../../../../api/asistencia/procesaAsistencia.api";

const ProcesarAsistenciaListPage = props => {
  const { intl, setDataGridRef, varIdCompania, varIdProceso } = props;
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
    if (varIdProceso) {
      Object.assign(filterData, { 'IdCompania': varIdCompania, 'IdProceso': varIdProceso });
    }
  }, [varIdProceso]);

  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter =
    [
      'IdCliente',
      'IdDivision',
      'IdCompania',
      'IdProceso',

    ];

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Observacion === 'S') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  function showIcon(rowData) {
    return (
      <div className={rowData.row.data.Observacion === "S" ? 'fa flaticon2-delete text-danger' : 'fa flaticon2-check-mark text-primary'} />
    );
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

          <Column dataField="Observacion" caption={"R"} cellRender={showIcon} width={"5%"} alignment={"center"} />

          <Column
            dataField="FechaProceso"
            caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" })}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"10%"}
            alignment={"center"}
          />

          <Column dataField="IdPersona"
            caption={intl.formatMessage({ id: "COMMON.CODE" })}
            allowHeaderFiltering={false}
            allowSorting={true}
            width={"7%"}
            alignment={"center"} />
          <Column
            dataField="NombreCompleto"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
            allowSorting={true}
            allowHeaderFiltering={false}
            width={"23%"}
          />

          <Column dataField="Documento"
            caption={intl.formatMessage({ id: "CASINO.REPORT.DOCUMENTNUMBER" })}
            allowHeaderFiltering={false}
            width={"9%"}
            alignment={"center"}
          />         

          <Column
            dataField="Mensaje"
            caption={intl.formatMessage({ id: "COMMON.OBSERVATION" })}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"20%"}
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
          loadUrl={filtrarProcesoAsistencia}
          forceLoad={forceLoadTypes.Unforced}
          sendToServerOnlyIfThereAreChanges={true}
          ifThereAreNoChangesLoadFromStorage={ifThereAreNoChangesLoadFromStorage}
          caseSensitiveWhenCheckingForChanges={true}
          uppercaseFilterRow={true}
          initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'FechaProceso', order: 'asc' } }}
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
ProcesarAsistenciaListPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string

}
ProcesarAsistenciaListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  showHeaderInformation: false,
  uniqueId: 'ProcesarAsistenciaListPage'
}

export default injectIntl(ProcesarAsistenciaListPage);
