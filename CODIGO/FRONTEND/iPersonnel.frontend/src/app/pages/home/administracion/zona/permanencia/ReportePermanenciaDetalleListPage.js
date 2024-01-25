import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { PortletBody } from "../../../../../partials/content/Portlet";
import { DataGrid, Column, Editing, FilterRow, HeaderFilter, FilterPanel } from "devextreme-react/data-grid";

import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";

import { storeR003Det as loadUrl } from "../../../../../api/acceso/reporte.api";
import { initialFilter } from "./ReportePermanenciaIndexPage";

const ReportePermanenciaDetalleListPage = props => {
  const { intl, focusedRowKey } = props;
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);

  //Variables de CustomerDataGrid
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const { IdDivision, IdZona, IdCompania } = props.filtroLocal;
  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdDivision, IdZona, IdCompania });
  // PAGINATION
  // ------------------------------
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);

  const textEditing = {
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  }

  useEffect(() => {
    const { IdDivision, IdZona, IdCompania } = props.filtroLocal;
    setTimeout(function () {
      props.dataSource.loadDataWithFilter({ data: { IdCliente: IdCliente, IdDivision, IdZona, IdCompania } });
    }, 500);
  }, [props.filtroLocal]);


  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter = [
    'IdCliente',
    'IdDivision',
    'IdZona',
    'IdCompania'
  ];

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.ExcedioDias === 'S') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  const renderDataGrid = ({ gridRef, dataSource }) => {
    props.setDataGridRefDetail(gridRef);
    return (
      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        focusedRowEnabled={true}
        focusedRowKey={focusedRowKey}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
        onCellPrepared={onCellPrepared}
      >
        <Editing mode="row"
          useIcons={false}
          allowDeleting={false}
          texts={textEditing}
        />

        <FilterRow visible={true} showOperationChooser={false} />
        <HeaderFilter visible={false} />
        <FilterPanel visible={false} />
        <Column dataField="RowIndex" caption="#" width={"5%"} visible={false} />
        <Column dataField="IdCompania" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.RUC" })} allowFiltering={false} width={"10%"} alignment={"center"}/>
        <Column dataField="Compania" caption={intl.formatMessage({ id: "ACCESS.PERSON.POSITION.COMPANY" })} allowSorting={false} allowFiltering={false} allowHeaderFiltering={false} width={"15%"} />
        <Column dataField="TipoDocumentoAlias" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE.DOCU" })} allowFiltering={false} alignment={"center"} width={"8%"} />
        <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })} allowFiltering={false} width={"10%"} alignment={"center"} />
        <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })} alignment={"left"} allowSorting={false} allowFiltering={true} allowHeaderFiltering={false} width={"45%"}/>
        <Column dataField="FechaMarca" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} width={"10%"} allowFiltering={false} />
        <Column dataField="Hora" caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.HOUR" })} alignment={"center"} width={"10%"} />
        <Column dataField="Permanencia" caption={intl.formatMessage({ id: "ACCESS.REPORT.PERMANENCE" })} alignment={"center"} width={"10%"} />
      </DataGrid>
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
ReportePermanenciaDetalleListPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string,
  selected: PropTypes.object,

}
ReportePermanenciaDetalleListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  showHeaderInformation: false,
  uniqueId: 'permanenciaDetalleList',
  selected: { IdDivision: "" }
}

export default injectIntl(ReportePermanenciaDetalleListPage);
