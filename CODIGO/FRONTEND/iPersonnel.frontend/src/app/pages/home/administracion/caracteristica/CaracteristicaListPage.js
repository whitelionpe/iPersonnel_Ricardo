import React, { useEffect, useState } from "react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { Button } from "devextreme-react";
import { injectIntl } from "react-intl";
import { isNotEmpty,listarEstadoSimple } from "../../../../../_metronic";
//Custom grid: ::::::::::::::::::::::::::::::::
import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { storeListar as loadUrl } from "../../../../api/administracion/caracteristica.api";
import { DataGrid, Column, Editing, FilterRow, HeaderFilter, FilterPanel } from "devextreme-react/data-grid";
import PropTypes from "prop-types";
import { Item, GroupItem } from "devextreme-react/form";

export const initialFilter = {
    IdCliente: "1",
    IdCaracteristica: "",
    Caracteristica: "",
    Alias: "",
    IdEntidad: "",
    Entidad: "",
    Activo: "S"
};
// .::: Filtro CustonDataGrid End :::.

//:::::::::::::::::::::::::::::::::::::::::::::

const CaracteristicaListPage = props => {

    // .::: Filtro CustonDataGrid Ini :::.
    const [isActiveFilters, setIsActiveFilters] = useState(false);

    const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
    const [filterData, setFilterData] = useState({ ...initialFilter });
 
    // --PAGINATION--
    const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
    const resetLoadOptions = props.resetLoadOptions;

    const { intl, accessButton } = props;
    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
        evt.cancel = true;
        props.eliminarRegistro(evt.data);
    };

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
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


    const textEditing = {
        confirmDeleteMessage: '',
        editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
        deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
    };

    function onCellPrepared(e) {
        if (e.rowType === 'data') {
            if (e.data.Activo === 'N') {
                e.cellElement.style.color = 'red';
            }
        }
    }

    //:::::::::::::::::::::::::::::::::::::::::::::::

    useEffect(() => {
        if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
    }, [ifThereAreNoChangesLoadFromStorage])

    useEffect(() => {
        if (props.refreshData) {
            props.refresh();
            props.setRefreshData(false);
        }
    }, [props.refreshData]);

    //Filter:
    const keysToGenerateFilter = ['IdCliente', 'IdCaracteristica', 'Caracteristica', 'Alias', 'IdEntidad', 'Entidad', 'Activo'];

    const renderFormContentCustomFilter = ({ getInstance }) => {
      return (
        <GroupItem>
          <GroupItem itemType="group" colCount={6} colSpan={2}>
            <Item
              dataField="Activo"
              label={{ text: intl.formatMessage({ id: "COMMON.ACTIVE" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: listarEstadoSimple(),
                valueExpr: "Valor",
                displayExpr: "Descripcion",
                showClearButton: true,
                onValueChanged: () => getInstance().filter(),
              }}
            />
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
          props.setVarIdCaracteristica("")
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

                <Column dataField="IdCaracteristica" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"20%"} alignment={"center"} />
                <Column dataField="Caracteristica" caption={intl.formatMessage({ id: "IDENTIFICATION.ADDITIONAL.DATA" })} width={"40%"} />
                <Column dataField="Alias" caption={intl.formatMessage({ id: "ADMINISTRATION.CHARACTERISTIC.ALIAS" })} width={"15%"} alignment={"center"} />
                <Column dataField="Entidad" caption={intl.formatMessage({ id: "ADMINISTRATION.CHARACTERISTIC.ENTITY" })} width={"15%"} alignment={"center"} />
                <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} alignment={"center"} />

            </DataGrid>
        );
    }

    //:::::::::::::::::::::::::::::::::::::::::::::::
    return (
        <>
            <PortletHeader
                title={intl.formatMessage({ id: "ACTION.LIST" })}
                toolbar={
                    <PortletHeaderToolbar>
                        <PortletHeaderToolbar>
                            <Button
                            icon="filter"
                            type="default"
                            hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                            onClick={() => setIsActiveFilters(!isActiveFilters)}
                            disabled={customDataGridIsBusy}
                            />
                            &nbsp;
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
                    loadWhenStartingComponent={props.isFirstDataLoad && !props.refreshData}
                    renderDataGrid={renderDataGrid}
                    loadUrl={loadUrl}
                    forceLoad={forceLoadTypes.Unforced}
                    sendToServerOnlyIfThereAreChanges={true}
                    ifThereAreNoChangesLoadFromStorage={ifThereAreNoChangesLoadFromStorage}
                    caseSensitiveWhenCheckingForChanges={true}
                    uppercaseFilterRow={true}
                    initialLoadOptions={{
                        currentPage: 1,
                        pageSize: 20,
                        sort: { column: "Caracteristica", order: "asc" },
                    }}
                    filterRowSize="sm"
                    summaryCountFormat={`${intl.formatMessage({
                        id: "COMMON.TOTAL.ROW",
                    })} {0} de {1} `}
                    visibleCustomFilter={isActiveFilters}
                    renderFormContentCustomFilter={renderFormContentCustomFilter}
                    // CUSTOM FILTER
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

CaracteristicaListPage.propTypes = {
    uniqueId: PropTypes.string,
    showButtons: PropTypes.bool
};
CaracteristicaListPage.defaultProps = {
    uniqueId: "ListarCaracteristica",
    showButtons: true
};

export default injectIntl(CaracteristicaListPage);
