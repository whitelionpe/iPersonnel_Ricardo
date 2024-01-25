import React, { useEffect, useState } from "react";
import { DataGrid, Column, Editing, FilterRow, HeaderFilter, FilterPanel } from "devextreme-react/data-grid";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { Button } from "devextreme-react";
import { injectIntl } from "react-intl";
import { isNotEmpty } from "../../../../../_metronic";
import PropTypes from "prop-types";

// .::: Filtro CustonDataGrid Ini :::.
import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { storeListar as loadUrl } from "../../../../api/administracion/funcion.api";
import { initialFilter } from "./FuncionIndexPage"
// .::: Filtro CustonDataGrid End :::.

const FuncionListPage = props => {

    const { intl, accessButton } = props;

    // .::: Filtro CustonDataGrid Ini :::.
    const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
    const [filterData] = useState({ ...initialFilter });
    // --PAGINATION--
    const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
    const resetLoadOptions = props.resetLoadOptions;

    const keysToGenerateFilter = [
        "IdCliente",
        "IdFuncion",
        "Funcion"
    ];
    // .::: Filtro CustonDataGrid End :::.

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

    // .::: Filtro CustonDataGrid Ini :::.
    useEffect(() => {
        if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
    }, [ifThereAreNoChangesLoadFromStorage])

    useEffect(() => {
        if (props.refreshData) {
            props.refresh();
            props.setRefreshData(false);
        }
    }, [props.refreshData]);

    const renderDataGrid = ({ gridRef, dataSource }) => {
        return (
            <DataGrid
                dataSource={dataSource}
                ref={gridRef}
                showBorders={true}
                focusedRowEnabled={true}
                onCellPrepared={onCellPrepared}
                onEditingStart={editarRegistro}
                onRowRemoving={eliminarRegistro}
                onFocusedRowChanged={seleccionarRegistro}
                onRowDblClick={seleccionarRegistroDblClick}
                focusedRowKey={props.focusedRowKey}
                allowColumnReordering={true}
                allowColumnResizing={true}
                columnAutoWidth={true}
            >
                <Editing mode="row"
                    useIcons={true}
                    allowUpdating={true}
                    allowDeleting={true}
                    texts={textEditing} />
                <FilterRow visible={true} showOperationChooser={false} />
                <HeaderFilter visible={false} />
                <FilterPanel visible={false} />
                <Column
                    dataField="RowIndex"
                    caption="#"
                    allowSorting={false}
                    allowFiltering={false}
                    allowHeaderFiltering={false}
                    width={"5%"}
                    alignment={"center"}
                />

                <Column
                    dataField="IdFuncion"
                    caption={intl.formatMessage({ id: "COMMON.CODE" })}
                    width={"10%"}
                    alignment={"left"}
                    allowSorting={true}
                    allowSearch={true}
                    allowFiltering={true}
                />
                <Column
                    dataField="Funcion"
                    caption={intl.formatMessage({ id: "COMMON.DESCRIPTION" })}
                    width={"70%"}
                    allowSorting={true}
                    allowSearch={true}
                    allowFiltering={true}
                />
                <Column
                    dataField="NumeroPosicion"
                    caption={intl.formatMessage({ id: "ADMINISTRATION.POSITION.MAINTENANCE" })}
                    width={"8%"}
                    alignment={"center"}
                    allowSorting={false}
                    allowSearch={false}
                    allowFiltering={false}
                />
                <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"7%"} alignment={"center"} />
            </DataGrid>
        );
    };
    // .::: Filtro CustonDataGrid End :::.

    return (
        <>
            <PortletHeader
                title={intl.formatMessage({ id: "ACTION.LIST" })}
                toolbar={
                    <PortletHeaderToolbar>
                        <PortletHeaderToolbar>
                            <Button icon="plus" type="default" hint={intl.formatMessage({ id: "ACTION.NEW" })} onClick={props.nuevoRegistro} disabled={!accessButton.nuevo} />
                            &nbsp;
                            <Button icon="refresh" type="default" hint={intl.formatMessage({ id: "ACTION.CLEAN" })} disabled={customDataGridIsBusy} onClick={resetLoadOptions} />
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
                        sort: { column: "Funcion", order: "asc" },
                    }}
                    filterRowSize="sm"
                    summaryCountFormat={`${intl.formatMessage({
                        id: "COMMON.TOTAL.ROW",
                    })} {0} de {1} `}
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

FuncionListPage.propTypes = {
    uniqueId: PropTypes.string,
};
FuncionListPage.defaultProps = {
    uniqueId: "ListarFuncion",
};

export default injectIntl(FuncionListPage);
