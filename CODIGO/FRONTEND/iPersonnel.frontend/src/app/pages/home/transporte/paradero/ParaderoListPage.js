import React, { useState, useEffect } from "react";
import { Button } from 'devextreme-react';
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { storeListar as loadUrl } from "../../../../api/transporte/paradero.api";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { initialFilter } from "./ParaderoIndexPage";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { Item, GroupItem } from "devextreme-react/form";
import { DataGrid, Column, FilterRow, HeaderFilter, FilterPanel, Editing  } from "devextreme-react/data-grid";
import { convertyyyyMMddToDate, dateFormat, isNotEmpty ,listarEstadoSimple} from "../../../../../_metronic";

const ParaderoListPage = props => {

  const { intl, setLoading } = props;

  //Variables de CustomerDataGrid
  const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({
    ...initialFilter , IdCliente:'1'
  });
  const dateWhenOpenDateBoxFechaProgramadaHasta = {};

  // PAGINATION
  // ------------------------------
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;

  const editarRegistro = evt => {
    evt.cancel = true;
    props.editarRegistro(evt.data);
};

  const eliminarRegistro = evt => {
    evt.cancel = true;
    props.eliminarRegistro(evt.data);
};

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

  const obtenerCampoActivo = rowData => {
    return rowData.Activo === "S";
  }

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  const textEditing = {
    confirmDeleteMessage: "",
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
  };

  const transformData = {
    FechaProgramadaDesde: (rawValue) => dateFormat(rawValue, 'yyyyMMdd hh:mm'), //convertCustomDateTimeString(rawValue),
    FechaProgramadaHasta: (rawValue) => dateFormat(rawValue, 'yyyyMMdd hh:mm'), //convertCustomDateTimeString(rawValue),
  }
  const reverseTransformData = {
    FechaProgramadaDesde: (value) => convertyyyyMMddToDate(value),//convertStringToDate(value),
    FechaProgramadaHasta: (value) => convertyyyyMMddToDate(value),//convertStringToDate(value),
  }

   const keysToGenerateFilter = [
    'IdCliente',
    'IdParadero',
    'Paradero',
    'Activo',
];
  
    //-CustomerDataGrid-UseEffect-ini->
  useEffect(() => {
    if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage])

  useEffect(() => {
    if (props.refreshData) {
        props.refresh();
        props.setRefreshData(false);
    }
  }, [props.refreshData]);


  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem>
        <GroupItem itemType="group" colCount={4}>

        </GroupItem>

      </GroupItem>
    );
  }

  const renderDataGrid = ({ gridRef, dataSource }) => {
    if(dataSource._storeLoadOptions.filter !== undefined ){
      if(props.totalRowIndex === 0){ 
      props.setTotalRowIndex(dataSource._totalCount);
      }
      if(dataSource._totalCount != props.totalRowIndex){
        if(dataSource._totalCount != -1){
        props.setVarIdParadero("")
        props.setFocusedRowKey();
        props.setTotalRowIndex(dataSource._totalCount);
        }
      }
    }
    return (
      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        keyExpr="RowIndex"
        showBorders={true}
        focusedRowEnabled={true}
        focusedRowKey={props.focusedRowKey}
        onEditingStart={editarRegistro}
        onRowRemoving={eliminarRegistro}
        onFocusedRowChanged={seleccionarRegistro}
        onRowDblClick={seleccionarRegistroDblClick}
        onCellPrepared={onCellPrepared}
        repaintChangesOnly={true}
        >
        <Editing mode="row"
          useIcons={props.showButtons}
          allowUpdating={props.showButtons}
          allowDeleting={props.showButtons}
          texts={textEditing} />
        <FilterRow visible={true} showOperationChooser={false} />
        <HeaderFilter visible={false} />
        <FilterPanel visible={false} />

        <Column dataField="RowIndex" caption="#" width={50} visible={true} allowSorting={false} allowFiltering={false} allowHeaderFiltering={false} />
        <Column dataField="IdParadero" caption={intl.formatMessage({ id: "COMMON.CODE" })} alignment="center" width={120} allowSorting={true} allowFiltering={true} allowHeaderFiltering={false} />
        <Column dataField="Paradero" caption={intl.formatMessage({ id: "TRANSPORTE.WHEREABOUTS" })} allowSorting={true} allowFiltering={true} allowHeaderFiltering={false} />
        <Column dataField="Activo" visible={false} allowSorting={true} allowFiltering={true} allowHeaderFiltering={false} />
      </DataGrid>
    );
  }

  return (
    <>
        <HeaderInformation
          visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
          toolbar={
            <PortletHeader
              title=""
              toolbar={
                <PortletHeaderToolbar>
                  <PortletHeaderToolbar>

                    <Button icon="fa fa-plus"
                      type="default"
                      hint={intl.formatMessage({ id: "ACTION.NEW" })}
                      visible={props.showButtons}
                      onClick={props.nuevoRegistro}
                      disabled={customDataGridIsBusy}
                    />
                     {/* &nbsp;
                    <Button
                      icon="fa fa-search"
                      type="default"
                      hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                      onClick={() => setIsActiveFilters(!isActiveFilters)}
                      disabled={customDataGridIsBusy}
                    /> */}
                    &nbsp;
                    <Button
                      icon="refresh" //fa fa-broom
                      type="default"
                      hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                      disabled={customDataGridIsBusy}
                      onClick={resetLoadOptions} 
                    />
                 
                  </PortletHeaderToolbar>
                </PortletHeaderToolbar>
              }
            />
          } />
      
      <PortletBody>
        <CustomDataGrid
        showLog={false} 
          uniqueId={'ParaderoListPage'} 
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
          initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'IdProgramacion', order: 'asc' } }}
          filterRowSize='sm'
          summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}
          // CUSTOM FILTER
          visibleCustomFilter={isActiveFilters}
          renderFormContentCustomFilter={renderFormContentCustomFilter}
          keysToGenerateFilter={keysToGenerateFilter}
          filterData={filterData}
          transformData={transformData}
          reverseTransformData={reverseTransformData}
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
export default injectIntl(ParaderoListPage);
