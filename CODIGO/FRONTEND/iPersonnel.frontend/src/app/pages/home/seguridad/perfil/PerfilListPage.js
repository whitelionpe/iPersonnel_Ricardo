import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { useSelector } from "react-redux";
import { DataGrid, Column, Editing, Summary, TotalItem, FilterRow } from "devextreme-react/data-grid";

import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../_metronic";
import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { storeFiltrar as loadUrl } from "../../../../api/seguridad/perfil.api";
import PropTypes from "prop-types";
import { initialFilter } from "./PerfilIndexPage";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";

const PerfilListPage = props => {
    const { intl, accessButton } = props;
    const { IdPerfil } = props.selected;
    const { IdCliente, IdDivision } = useSelector((state) => state.perfil.perfilActual);
    const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdPerfil });
    const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);

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
        if (isNotEmpty(evt.row.data)) {
            props.seleccionarRegistro(evt.row.data);
        }

    }

    const seleccionarRegistroDblClick = evt => {
        if (evt.data === undefined) return;
        if (isNotEmpty(evt.data)) {
            props.verRegistroDblClick(evt.data);
        };
    }

    function onCellPrepared(e) {
        if (e.rowType === 'data') {
            if (e.data.Activo === 'N') {
                e.cellElement.style.color = 'red';
            }
        }
    }
    //========== ACTUALIZA LA TABLA
    useEffect(() => {
        if (props.refreshData) {
          props.refresh();
          props.setRefreshData(false);
        }
      }, [props.refreshData]);
    
      useEffect(() => {
        if (isNotEmpty(IdPerfil)) {
          setTimeout(() => {
            props.dataSource.loadDataWithFilter({ data: { IdPerfil, IdCliente } });
          }, 500)
        }
      }, [IdPerfil]);
      //============================
    const textEditing = {
        confirmDeleteMessage: '',
        editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
        deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
    };

    const renderDataGrid = ({ gridRef, dataSource }) => {

        if (dataSource._storeLoadOptions.filter !== undefined) {
            if (props.totalRowIndex === 0) {
                props.setTotalRowIndex(dataSource._totalCount);
            }
            if (dataSource._totalCount != props.totalRowIndex) {
                if (dataSource._totalCount != -1) {
                    props.setVarIdPerfil("")
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
                onFocusedRowChanged={seleccionarRegistro}
                focusedRowKey={props.focusedRowKey}
                onRowDblClick={seleccionarRegistroDblClick}
                onCellPrepared={onCellPrepared}
                repaintChangesOnly={true}
                allowColumnReordering={true}
                allowColumnResizing={true}
                columnAutoWidth={true}
            >
                <Editing
                    mode="row"
                    useIcons={true}
                    allowUpdating={accessButton.editar}
                    allowDeleting={accessButton.eliminar}
                    texts={textEditing}
                />
                <FilterRow visible={true} showOperationChooser={false} />

                <Column
                    dataField="IdPerfil"
                    caption={intl.formatMessage({ id: "COMMON.CODE" })}
                    width={"20%"}
                    allowSorting={true}
                    allowSearch={true}
                    allowFiltering={true}
                />
                <Column
                    dataField="Perfil"
                    caption={intl.formatMessage({ id: "ACCESS.PROFILE" })}
                    width={"40%"}
                    allowSorting={true}
                    allowSearch={true}
                    allowFiltering={true}
                />
                <Column
                    dataField="Caracteristica"
                    caption={intl.formatMessage({ id: "SECURITY.CHARACTERISTIC.CHARACTERISTIC" })}
                    width={"30%"}
                    allowSorting={true}
                    allowSearch={true}
                    allowFiltering={true}
                />
                <Column
                    dataType="boolean"
                    caption={intl.formatMessage({ id: "COMMON.ACTIVE" })}
                    calculateCellValue={obtenerCampoActivo}
                    width={"10%"}
                    allowSorting={false}
                    allowSearch={false}
                    allowFiltering={false}
                />

            </DataGrid>
        );
    }

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
                                disabled={!accessButton.nuevo} />
                        </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                }
            />
            <PortletBody>

                <CustomDataGrid
                    showLog={false} 
                    uniqueId={props.uniqueId} //'posicionesList'
                    dataSource={props.dataSource}
                    rowNumberName='RowIndex'
                    loadWhenStartingComponent={props.isFirstDataLoad && !props.refreshData}
                    renderDataGrid={renderDataGrid}
                    loadUrl={loadUrl}
                    forceLoad={forceLoadTypes.Unforced}
                    sendToServerOnlyIfThereAreChanges={true}
                    // ifThereAreNoChangesLoadFromStorage={ifThereAreNoChangesLoadFromStorage}
                    caseSensitiveWhenCheckingForChanges={true}
                    uppercaseFilterRow={true}
                    initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'Perfil', order: 'asc' } }}
                    filterRowSize='sm'
                    summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}
                    // CUSTOM FILTER
                    // visibleCustomFilter={isActiveFilters}
                    // renderFormContentCustomFilter={renderFormContentCustomFilter}
                    // keysToGenerateFilter={keysToGenerateFilter}
                    filterData={filterData}
                    // PAGINATION
                    paginationSize='md'
                    // EVENTS
                    // onLoading={() => setCustomDataGridIsBusy(true)}
                    // onError={() => setCustomDataGridIsBusy(false)}
                    // onLoaded={() => setCustomDataGridIsBusy(false)}
                />

            </PortletBody>
        </>
    );
};


export default injectIntl(PerfilListPage);
