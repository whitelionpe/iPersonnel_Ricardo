import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import {
  DataGrid,
  Column,
  Editing,
  FilterRow,
  HeaderFilter,
  FilterPanel,
} from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar,
} from "../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../_metronic";
import PropTypes from "prop-types";

//Custom grid: ::::::::::::::::::::::::::::::::
import { Item, GroupItem } from "devextreme-react/form";
import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { storeListar as loadUrl } from "../../../../api/administracion/regimen.api";
import { initialFilter } from "./RegimenIndexPage";
//:::::::::::::::::::::::::::::::::::::::::::::


const RegimenListPage = (props) => {
  const { intl } = props;

  const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({ ...initialFilter });
  const [
    ifThereAreNoChangesLoadFromStorage,
    setIfThereAreNoChangesLoadFromStorages,
  ] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;

  const editarRegistro = (evt) => {
    props.editarRegistro(evt.data);
  };

  const eliminarRegistro = (evt) => {
    evt.cancel = true;
    props.eliminarRegistro(evt.data);
  };

  const obtenerCampoContratista = (rowData) => {
    return rowData.Contratista === "S";
  };

  const obtenerCampoActivo = (rowData) => {
    return rowData.Activo === "S";
  };

  const seleccionarRegistro = (evt) => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  };

  const seleccionarRegistroDblClick = (evt) => {
    if (evt.data === undefined) return;
    if (isNotEmpty(evt.data)) {
      props.verRegistroDblClick(evt.data);
    }
  };

  const textEditing = {
    confirmDeleteMessage: "",
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  };

  function onCellPrepared(e) {
    if (e.rowType === "data") {
      if (e.data.Activo === "N") {
        e.cellElement.style.color = "red";
      }
    }
  }

  //:::::::::::::::::::::::::::::::::::::::::::::::

  useEffect(() => {
    if (ifThereAreNoChangesLoadFromStorage)
      setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage]);

  useEffect(() => {
    if (props.refreshData) {
      props.refresh();
      props.setRefreshData(false);
    }
  }, [props.refreshData]);

  //Filter:
  const keysToGenerateFilter = [
    "IdCliente",
    "IdDivision",
    "IdRegimen",
    "Regimen",
    "Activo",
  ];
  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem>
        <GroupItem itemType="group" colCount={2} colSpan={2}></GroupItem>
      </GroupItem>
    );
  };

  //DataGrid:
  const renderDataGrid = ({ gridRef, dataSource }) => {
    
  if(dataSource._storeLoadOptions.filter !== undefined ){
    if(props.totalRowIndex === 0){ 
    props.setTotalRowIndex(dataSource._totalCount);
    }
    if(dataSource._totalCount != props.totalRowIndex){
      if(dataSource._totalCount != -1){
      props.setVarIdRegimen("")
      props.setFocusedRowKey();
      props.setTotalRowIndex(dataSource._totalCount);
      }
    }
  }
    return (
      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="RowIndex"
        onEditingStart={editarRegistro}
        onRowRemoving={eliminarRegistro}
        onCellPrepared={onCellPrepared}
        onFocusedRowChanged={seleccionarRegistro}
        onRowDblClick={seleccionarRegistroDblClick}
        focusedRowKey={props.focusedRowKey}
      >
        <Editing
          mode="row"
          useIcons={props.showButtons}
          allowUpdating={props.showButtons}
          allowDeleting={props.showButtons}
          texts={textEditing}
        />
        <FilterRow visible={true} showOperationChooser={false} />
        <HeaderFilter visible={false} />
        <FilterPanel visible={false} />

        <Column
          dataField="IdCliente"
          visible={false}
        />
        <Column
          dataField="IdDivision"
          visible={false}
        />

        <Column
          dataField="IdRegimen"
          caption={intl.formatMessage({ id: "COMMON.CODE" })}
          width={"20%"}
          allowHeaderFiltering={false}
          allowSorting={true}
          alignment={"center"}
        />
        <Column
          dataField="Regimen"
          caption={intl.formatMessage({ id: "ADMINISTRATION.REGIME" })}
          width={"35%"}
          allowHeaderFiltering={false}
          allowSorting={true}
        />
        <Column
          dataField="DiasTrabajo"
          caption={intl.formatMessage({
            id: "ADMINISTRATION.REGIME.WORK.DAYS",
          })}
          width={"15%"}
          allowHeaderFiltering={false}
          allowSorting={true}
          alignment={"center"}
        />
        <Column
          dataField="DiasDescanso"
          caption={intl.formatMessage({
            id: "ADMINISTRATION.REGIME.DAYSOFF.REST",
          })}
          width={"15%"}
          allowHeaderFiltering={false}
          allowSorting={true}
          alignment={"center"}
        />

        <Column
          dataType="boolean"
          caption={intl.formatMessage({ id: "COMMON.ACTIVE" })}
          calculateCellValue={obtenerCampoActivo}
          width={"10%"}
          alignment={"center"}
          allowHeaderFiltering={false}
          allowSorting={false}
        />
      </DataGrid>
    );
  };

  //:::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <PortletHeader
        title={intl.formatMessage({ id: "ACTION.LIST" })}
        toolbar={
          <PortletHeaderToolbar>
            <PortletHeaderToolbar>
              <Button
                icon="plus"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.NEW" })}
                onClick={props.nuevoRegistro}
                visible={props.showButtons}
              />
              &nbsp;
              <Button
                icon="refresh"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                disabled={customDataGridIsBusy}
                onClick={resetLoadOptions}
              />
            </PortletHeaderToolbar>
          </PortletHeaderToolbar>
        }
      />
      <PortletBody>
        <CustomDataGrid
          showLog={false}
          uniqueId={props.uniqueId}
          dataSource={props.dataSource}
          rowNumberName="RowIndex"
          loadWhenStartingComponent={
            props.isFirstDataLoad && !props.refreshData
          }
          renderDataGrid={renderDataGrid}
          loadUrl={loadUrl}
          forceLoad={forceLoadTypes.Unforced}
          sendToServerOnlyIfThereAreChanges={true}
          ifThereAreNoChangesLoadFromStorage={
            ifThereAreNoChangesLoadFromStorage
          }
          caseSensitiveWhenCheckingForChanges={true}
          uppercaseFilterRow={true}
          initialLoadOptions={{
            currentPage: 1,
            pageSize: 20,
            sort: { column: "Regimen", order: "asc" },
          }}
          filterRowSize="sm"
          visibleCustomFilter={isActiveFilters}
          renderFormContentCustomFilter={renderFormContentCustomFilter}
          keysToGenerateFilter={keysToGenerateFilter}
          filterData={filterData}
          // PAGINATION
          paginationSize="md"
          // EVENTS
          onLoading={() => setCustomDataGridIsBusy(true)}
          onError={() => setCustomDataGridIsBusy(false)}
          onLoaded={() => setCustomDataGridIsBusy(false)}
        />
      </PortletBody>
    </>
  );
};

RegimenListPage.propTypes = {
  showButtons: PropTypes.bool,
  uniqueId: PropTypes.string,
};
RegimenListPage.defaultProps = {
  showButtons: true,
  uniqueId: "regimentList",

};

export default injectIntl(RegimenListPage);
