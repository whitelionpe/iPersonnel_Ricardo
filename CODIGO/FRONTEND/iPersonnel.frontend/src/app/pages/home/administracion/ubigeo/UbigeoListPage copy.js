import React ,{useEffect,useState} from "react";
//import { useSelector } from "react-redux";
import { DataGrid, Column, Editing ,FilterRow, HeaderFilter,FilterPanel} from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { injectIntl } from "react-intl"; 
import { isNotEmpty } from "../../../../../_metronic";
import PropTypes from "prop-types";

// .::: Filtro CustonDataGrid Ini :::.
import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { storeListar as loadUrl } from "../../../../api/administracion/ubigeo.api";
import { initialFilter } from "./UbigeoIndexPage"
// .::: Filtro CustonDataGrid End :::.

const UbigeoListPage = props => {

    const { intl, accessButton } = props;

    // .::: Filtro CustonDataGrid Ini :::.
    const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
    const [filterData, setFilterData] = useState({ ...initialFilter });
    // --PAGINATION--
    const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
    const resetLoadOptions = props.resetLoadOptions;

    const keysToGenerateFilter = [
        "IdUbigeo",
        "Pais",
        "Departamento",
        "Provincia",
        "Distrito",
        "Activo"
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
    }

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
        confirmDeleteMessage:'',
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

      if(dataSource._storeLoadOptions.filter !== undefined ){
        if(props.totalRowIndex === 0){ 
           props.setTotalRowIndex(dataSource._totalCount);
        }
        if(dataSource._totalCount != props.totalRowIndex){
         if(dataSource._totalCount != -1){
           props.setVarIdUbigeo("")
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
                //keyExpr="IdUbigeo"
                onCellPrepared={onCellPrepared}
                onEditingStart={editarRegistro}
                onRowRemoving={eliminarRegistro}
                onFocusedRowChanged={seleccionarRegistro}
                onRowDblClick={seleccionarRegistroDblClick}
                focusedRowKey={props.focusedRowKey}
                allowColumnReordering={true}
                allowColumnResizing={true}
                columnAutoWidth={true}
                // repaintChangesOnly={true}
            >
                   <Editing mode="row"
                    useIcons={true}
                    allowUpdating={true}
                    allowDeleting={true}
                    /* allowUpdating={accessButton.editar}
                    allowDeleting={accessButton.eliminar} */
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
                    width={"7%"}
                    alignment={"center"} /> 
               
                    <Column dataField="IdUbigeo"  
                    caption={intl.formatMessage({ id: "COMMON.CODE" })}  
                    width={"8%"} 
                    alignment={"center"}
                    allowSorting={true}
                    allowHeaderFiltering={false}
                    />
                    <Column dataField="Departamento"
                     caption={intl.formatMessage({ id: "ADMINISTRATION.UBIGEO.DEPARTAMENT" })}
                      width={"20%"}
                      allowSorting={true}
                      allowHeaderFiltering={false}
                      />
                    <Column dataField="Provincia"
                     caption={intl.formatMessage({ id: "ADMINISTRATION.UBIGEO.PROVINCE" })}
                     width={"20%"}
                     allowSorting={true}
                     allowHeaderFiltering={false}
                     />
                    <Column dataField="Distrito"
                     caption={intl.formatMessage({ id: "ADMINISTRATION.UBIGEO.DISTRIC" })}
                      width={"20%"}
                      allowSorting={true}
                      allowHeaderFiltering={false}
                      />
                    <Column dataType="boolean"
                     caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} 
                     calculateCellValue={obtenerCampoActivo}
                      width={"10%"} 
                      allowSorting={false}
                      allowHeaderFiltering={false}
                      />
                    <Column dataField="Pais" 
                     caption={intl.formatMessage({ id: "ADMINISTRATION.UBIGEO.COUNTRY" })} 
                     width={"18%"} 
                     visible={false} 
                     allowSorting={true}
                     allowHeaderFiltering={false}
                     />   

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
                            <Button 
                            icon="plus" 
                            type="default" 
                            hint={intl.formatMessage({ id: "ACTION.NEW" })}  
                            onClick={props.nuevoRegistro} 
                            //disabled={!accessButton.nuevo}
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
                            sort: { column: "Departamento", order: "asc" },
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

UbigeoListPage.propTypes = {
    uniqueId: PropTypes.string,
};
UbigeoListPage.defaultProps = {
    uniqueId: "ListarUbigeo",
};

export default injectIntl(UbigeoListPage);
