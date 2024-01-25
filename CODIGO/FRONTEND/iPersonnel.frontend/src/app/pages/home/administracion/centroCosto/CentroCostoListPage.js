import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, FilterRow, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../_metronic";
import PropTypes from "prop-types";

// .::: Filtro CustonDataGrid Ini :::.
import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { storeListar as loadUrl } from "../../../../api/administracion/centroCosto.api";

export const initialFilter = {
    Activo: "S",
    IdCliente: "",
    IdCentroCosto: "",
    FlRepositorio: "1",
    IdUnidadOrganizativa: ""
};

// .::: Filtro CustonDataGrid End :::.

const CentroCostoListPage = props => {
    const { intl } = props;
    const { IdCliente } = useSelector((state) => state.perfil.perfilActual);

    // .::: Filtro CustonDataGrid Ini :::.
    const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
    const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente });
    // --PAGINATION--
    const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
    const resetLoadOptions = props.resetLoadOptions;

    const keysToGenerateFilter = [
        "IdCliente",
        "IdCentroCosto",
        "CentroCosto",
        "Activo",
        "FlRepositorio",
        "IdUnidadOrganizativa"
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

    //:: CUSTOM DATAGRID    ::::::::::::::::::::::::::::::::::::::::::::::::::::
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
      if(dataSource._storeLoadOptions.filter !== undefined ){
        if(props.totalRowIndex === 0){ 
        props.setTotalRowIndex(dataSource._totalCount);
        }
        if(dataSource._totalCount != props.totalRowIndex){
          if(dataSource._totalCount != -1){
          props.setVarIdCentroCosto("")
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
                keyExpr="IdCentroCosto"
                onCellPrepared={onCellPrepared}
                onEditingStart={editarRegistro}
                onRowRemoving={eliminarRegistro}
                onFocusedRowChanged={seleccionarRegistro}
                onRowDblClick={seleccionarRegistroDblClick}
                focusedRowKey={props.focusedRowKey}
                repaintChangesOnly={true}
            >
                <Editing mode="row"
                    useIcons={true}
                    allowUpdating={true}
                    allowDeleting={true}
                    texts={textEditing} />
                <FilterRow visible={true} showOperationChooser={false} />

                <Column
                    dataField="RowIndex"
                    caption="#"
                    allowSorting={false}
                    allowFiltering={false}
                    allowHeaderFiltering={false}
                    width={"7%"}
                    alignment={"center"} />
                <Column
                    dataField="IdCentroCosto"
                    alignment={"center"}
                    caption={intl.formatMessage({ id: "COMMON.CODE" })}
                    width={"10%"}
                    allowSorting={true}
                    allowHeaderFiltering={false}
                />
                <Column dataField="CentroCosto"
                    caption={intl.formatMessage({ id: "ADMINISTRATION.COSTCENTER.COSTCENTER" })}
                    width={"80%"}
                    allowSorting={true}
                    allowHeaderFiltering={false}
                />
                <Column dataType="boolean"
                    caption={intl.formatMessage({ id: "COMMON.ACTIVE" })}
                    calculateCellValue={obtenerCampoActivo}
                    width={"10%"}
                    alignment={"center"}
                />

            </DataGrid>
        );
    };
    //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


    return (
        <>
            <PortletHeader
                title={intl.formatMessage({ id: "ACTION.LIST" })}
                toolbar={
                    <PortletHeaderToolbar>
                        <PortletHeaderToolbar>
                            <Button icon="plus"
                                type="default"
                                hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                onClick={props.nuevoRegistro}
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
                        sort: { column: "CentroCosto", order: "asc" },
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

CentroCostoListPage.propTypes = {
    uniqueId: PropTypes.string,
};
CentroCostoListPage.defaultProps = {
    uniqueId: "ListarCentroDeCosto",
};

export default injectIntl(CentroCostoListPage);
