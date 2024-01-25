import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import {
    DataGrid,
    Column,
    Editing,
    FilterRow,
    HeaderFilter,
    FilterPanel
} from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { isNotEmpty, listarEstadoSimple, listarConsultaCompanias } from "../../../../../_metronic";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";

//Custom grid: ::::::::::::::::::::::::::::::::
import { Item, GroupItem } from "devextreme-react/form";
import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { storeListarPerfil as loadUrl } from "../../../../api/campamento/perfil.api";
import { initialFilter } from "./PerfilIndexPage";

//:::::::::::::::::::::::::::::::::::::::::::::

const PerfilListPage = props => {
    const { intl } = props;
    const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

    const [isActiveFilters, setIsActiveFilters] = useState(false);
    const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
    const [filterData, setFilterData] = useState({
        ...initialFilter, IdCliente,
        IdDivision: isNotEmpty(IdDivision) ? IdDivision : ""
    });
    const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
    const resetLoadOptions = props.resetLoadOptions;


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
    const keysToGenerateFilter = [
        "IdCliente",
        "IdDivision",
        "IdPerfil",
        "Perfil",
        "Activo",
        'CompaniaAsignado', 
        'TipoConsultaCompania'];
    const renderFormContentCustomFilter = ({ getInstance }) => {
        return (
            <GroupItem>
                <GroupItem itemType="group" colCount={2} colSpan={2}>

                    <Item
                        dataField="TipoConsultaCompania"
                        label={{ text: intl.formatMessage({ id: "CASINO.COMPANY.GROUP.TOSELECT" }) }}
                        editorType="dxSelectBox"
                        editorOptions={{
                            items: listarConsultaCompanias(),
                            valueExpr: "Valor",
                            displayExpr: "Descripcion",
                            showClearButton: true,
                            onValueChanged: () => getInstance().filter()
                        }}
                    />

                    <Item
                        dataField="Activo"
                        label={{ text: intl.formatMessage({ id: "COMMON.ACTIVE" }) }}
                        editorType="dxSelectBox"
                        editorOptions={{
                            items: listarEstadoSimple(),
                            valueExpr: "Valor",
                            displayExpr: "Descripcion",
                            showClearButton: true,
                            onValueChanged: () => getInstance().filter()
                        }}
                    />

                </GroupItem>
            </GroupItem>
        );
    }

    //DataGrid:
    const renderDataGrid = ({ gridRef, dataSource }) => {
      if(dataSource._storeLoadOptions.filter !== undefined ){
        if(props.totalRowIndex === 0){ 
        props.setTotalRowIndex(dataSource._totalCount);
        }
        if(dataSource._totalCount != props.totalRowIndex){
          if(dataSource._totalCount != -1){
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

                <Column dataField="IdPerfil" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"20%"} allowSorting={true} allowSearch={true} allowFiltering={true} />
                <Column dataField="Perfil" caption={intl.formatMessage({ id: "CAMP.PROFILE.PROFILE" })} width={"55%"} allowSorting={true} allowSearch={true} allowFiltering={true} />
                <Column dataField="NumeroCompanias" caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.TOTAL" })} width={"15%"} allowHeaderFiltering={false} allowSorting={false} alignment={"center"} allowFiltering={false}/>
                <Column dataField="NumeroHabitaciones" caption={intl.formatMessage({ id: "CAMP.PROFILE.DETAIL.ROOMS" })} width={"15%"} allowHeaderFiltering={false} allowSorting={false} alignment={"center"} allowFiltering={false}/>
                <Column dataField="NumeroCamas" caption={intl.formatMessage({ id: "CAMP.PROFILE.DETAIL.BEDS" })} width={"15%"} allowHeaderFiltering={false} allowSorting={false} alignment={"center"} allowFiltering={false}/>
                <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />
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
                            <Button icon="plus" type="default" hint={intl.formatMessage({ id: "ACTION.NEW" })} onClick={props.nuevoRegistro} visible={props.showButtons} />
                            &nbsp;
                            <Button icon="filter" type="default" hint={intl.formatMessage({ id: "ACTION.FILTER" })} onClick={() => setIsActiveFilters(!isActiveFilters)} disabled={customDataGridIsBusy} />
                            &nbsp;
                            <Button icon="refresh" type="default" hint={intl.formatMessage({ id: "ACTION.CLEAN" })} disabled={customDataGridIsBusy} onClick={resetLoadOptions} />
                        </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                }
            />
            <PortletBody>


                <CustomDataGrid
                    showLog={false}
                    uniqueId='campamentoPerfilList'
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
                    initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'Perfil', order: 'asc' } }}
                    filterRowSize='sm'
                    visibleCustomFilter={isActiveFilters}
                    renderFormContentCustomFilter={renderFormContentCustomFilter}
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

PerfilListPage.propTypes = {
    showButton: PropTypes.bool
};
PerfilListPage.defaultProps = {
    showButton: true
};

export default injectIntl(PerfilListPage);
