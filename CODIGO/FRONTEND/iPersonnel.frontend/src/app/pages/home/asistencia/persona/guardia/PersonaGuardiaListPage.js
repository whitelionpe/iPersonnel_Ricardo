import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import {
    DataGrid,
    Column,
    FilterRow,
    Button as ColumnButton,
    Editing,
} from "devextreme-react/data-grid";
import { Button } from "devextreme-react";

import { useSelector } from "react-redux"; 
// import { storeFiltrarRegimenPersona as loadUrl } from "../../../../../api/administracion/regimen.api";
import { storeFiltrar as loadUrl } from "../../../../../api/administracion/personaRegimen.api";

import PropTypes from "prop-types";
import CustomDataGrid, { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid";

import { GroupItem, Item } from "devextreme-react/form";
import { convertyyyyMMddToDate, dateFormat, getMinusDaysBeforeAndToday, getStartOfMonthAndToday, isNotEmpty } from "../../../../../../_metronic";

import { initialFilter } from "./PersonaGuardiaIndexPage";

const PersonaGuardiaListPage = (props) => {
    const { intl, varIdPersona } = props;
    const { IdDivision, IdCliente } = useSelector(state => state.perfil.perfilActual);
    const [isActiveFilters, setIsActiveFilters] = useState(true);
    const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);

    const { FechaInicio, FechaFin } = getMinusDaysBeforeAndToday(15);
    const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdPersona: varIdPersona, IdDivision: IdDivision, FechaInicio: FechaInicio, FechaFin: FechaFin });
    

    const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
    const resetLoadOptions = props.resetLoadOptions;


    //:::::::::::::::::::::::::::::::::::::::::::::-funciones-:::::::::::::::::::::::::::::::::
    const seleccionarRegistro = evt => {
        if (evt.rowIndex === -1) return;
        if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
    }

    function onCellPrepared(e) {
        if (e.rowType === "data") {
            if (e.data.Observado === "S") {
                e.cellElement.style.color = "red";
            }
        }
    }

    // function verRegistro(e) {
    //     props.verRegistro(e.row.data);
    // }

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


    const textEditing = {
        confirmDeleteMessage: '',
        editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
        deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
    };

    //>..Definir Filtro para customerDataGrid
    // const keysToGenerateFilter = ['IdCliente', 'IdPersona', 'FechaInicio', 'FechaFin'];

    const keysToGenerateFilter = [
        'IdCliente',
        'IdPersona',
        'IdDivision',
        'FechaInicio',
        'FechaFin',
        'IdRegimen',
        'IdGuardia',
        'NombreCompleto',
        'Documento',
        'TipoDocumentoAlias',
        'Activo'];

    const renderFormContentCustomFilter = ({ getInstance }) => {

        return (
            <GroupItem>
                <GroupItem itemType="group" colCount={3} colSpan={3}>
                    <Item dataField="IdCliente" editorOptions={{ value: IdCliente }} visible={false} />
                    <Item dataField="IdPersona" editorOptions={{ value: varIdPersona }} visible={false} />
                    <Item
                        dataField="FechaInicio"
                        label={{
                            text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" }),
                        }}
                        editorType="dxDateBox"
                        dataType="datetime"
                        editorOptions={{
                            inputAttr: { style: "text-transform: uppercase" },
                            displayFormat: "dd/MM/yyyy",
                            //value: filterData.FechaInicio,
                            onValueChanged: (e) => {
                                getInstance().filter()
                            }
                        }}
                    />
                    <Item
                        dataField="FechaFin"
                        label={{
                            text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" }),
                        }}
                        isRequired={true}
                        editorType="dxDateBox"
                        dataType="datetime"
                        editorOptions={{
                            inputAttr: { style: "text-transform: uppercase" },
                            displayFormat: "dd/MM/yyyy",
                            //value: filterData.FechaFin,
                            onValueChanged: (e) => {
                                getInstance().filter()
                            }

                        }}
                    />
                    <Column
                        dataType="boolean"
                        caption={intl.formatMessage({ id: "COMMON.ACTIVE" })}
                        calculateCellValue={obtenerCampoActivo}
                        width={"10%"}
                        allowSorting={false}
                        allowFiltering={false}
                    />

                </GroupItem>
            </GroupItem>
        );
    }
    //>..Definir DataGrid para customerDataGrid
    const renderDataGrid = ({ gridRef, dataSource }) => {
        return (

            <DataGrid
                dataSource={dataSource}
                ref={gridRef}
                showBorders={true}
                focusedRowEnabled={true}
                id="resultado"
                keyExpr="RowIndex"
                onEditingStart={editarRegistro}
                onRowRemoving={eliminarRegistro}
                onFocusedRowChanged={seleccionarRegistro}
                onCellPrepared={onCellPrepared}
                focusedRowKey={props.focusedRowKey}
                remoteOperations={true}
                allowColumnReordering={true}
                allowColumnResizing={true}
                columnAutoWidth={true}
            // repaintChangesOnly={true}
            >
                <Editing
                    mode="row"
                    useIcons={props.showButtons}
                    allowUpdating={props.showButtons}//{false}//{props.showButtons}//{false}//{props.showButtons}
                    allowDeleting={props.showButtons}
                    texts={textEditing}
                />
                <FilterRow visible={false} showOperationChooser={false} />
                <Column dataField="RowIndex" caption="#"
                    width={"5%"}
                    alignment={"center"}
                    allowSorting={false}
                    allowFiltering={false}
                    allowHeaderFiltering={false}
                />

                {/* <Column
                    dataField="NombreCompleto"
                    caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
                    width={"25%"}
                    //cellRender={DoubleLineLabel}
                    allowSorting={true}
                    allowSearch={true}
                    allowFiltering={true}
                />

                <Column
                    dataField="Documento"
                    caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}
                    allowSorting={true}
                    allowFiltering={true}
                    allowHeaderFiltering={false}
                    alignment={"center"}
                    width={"10%"}
                /> */}
                <Column
                    dataField="Regimen"
                    caption={intl.formatMessage({ id: "ADMINISTRATION.REGIME" })}
                    width={"25%"}
                    allowSorting={true}
                    allowSearch={true}
                    allowFiltering={true}
                />
                <Column
                    dataField="Guardia"
                    caption={intl.formatMessage({ id: "ADMINISTRATION.REGIME.GUARD.TAB" })}
                    width={"25%"}
                    allowSorting={true}
                    allowSearch={true}
                    allowFiltering={true}
                />

                <Column
                    dataField="FechaInicio"
                    caption={intl.formatMessage({
                        id: "CASINO.PERSON.GROUP.STARTDATE",
                    })}
                    dataType="date" format="dd/MM/yyyy"
                    width={"20%"}
                    alignment={"center"}
                    allowSorting={true}
                    allowSearch={true}
                    allowFiltering={false}
                />
                <Column
                    dataField="FechaFin"
                    caption={intl.formatMessage({
                        id: "CASINO.PERSON.GROUP.ENDDATE",
                    })}
                    dataType="date" format="dd/MM/yyyy"
                    width={"20%"}
                    alignment={"center"}
                    allowSorting={true}
                    allowSearch={true}
                    allowFiltering={false}
                />
                <Column
                    dataType="boolean"
                    caption={intl.formatMessage({ id: "COMMON.ACTIVE" })}
                    calculateCellValue={obtenerCampoActivo}
                    width={"10%"}
                    allowSorting={false}
                    allowFiltering={false}
                />

                {/* <Column type="buttons" width={"7%"}>
                    <ColumnButton icon="fa fa-eye" hint={intl.formatMessage({ id: "ACTION.VIEW", })} onClick={verRegistro} />
                </Column> */}

            </DataGrid>
        );
    }

    const transformData = {
        FechaInicio: (rawValue) => dateFormat(rawValue, 'yyyyMMdd'),
        FechaFin: (rawValue) => dateFormat(rawValue, 'yyyyMMdd'),
    }
    const reverseTransformData = {
        FechaInicio: (value) => convertyyyyMMddToDate(value),
        FechaFin: (value) => convertyyyyMMddToDate(value),
    }



    useEffect(() => {
        if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
    }, [ifThereAreNoChangesLoadFromStorage])

    useEffect(() => {
        if (isNotEmpty(varIdPersona)) {
            props.dataSource.loadDataWithFilter({ data: { ...filterData, IdPersona: varIdPersona, IdDivision: IdDivision, } });
        }
    }, [varIdPersona]);

    useEffect(() => {
        if (props.refreshData) {
            props.refresh();
            props.setRefreshData(false);
        }
    }, [props.refreshData]);


    return (
        <>


            <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
                toolbar={
                    <PortletHeader
                        title={""}
                        toolbar={
                            <PortletHeaderToolbar>
                                &nbsp;
                                {/* <Button
                                    icon="search"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                                    onClick={() => setIsActiveFilters(!isActiveFilters)}
                                    disabled={customDataGridIsBusy}
                                /> */}
                                <Button
                                    icon="plus"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                    onClick={props.nuevoRegistro}
                                />
                                &nbsp;
                                <Button icon="refresh"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                                    disabled={customDataGridIsBusy}
                                    onClick={resetLoadOptions}
                                />
                                &nbsp;
                                <Button
                                    icon="fa fa-times-circle"
                                    type="normal"
                                    hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                                    onClick={props.cancelarEdicion}
                                />
                                &nbsp;

                            </PortletHeaderToolbar>
                        }
                    />

                } />

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
                    initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'NombreCompleto', order: 'desc' } }}
                    filterRowSize='sm'
                    summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}
                    visibleCustomFilter={false}//{isActiveFilters}
                    renderFormContentCustomFilter={renderFormContentCustomFilter}
                    transformData={transformData}
                    reverseTransformData={reverseTransformData}
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

PersonaGuardiaListPage.propTypes = {
    showHeaderInformation: PropTypes.bool,
    uniqueId: PropTypes.string
};
PersonaGuardiaListPage.defaultProps = {
    showHeaderInformation: true,
    uniqueId: 'PersonaGuardiaList'
};
export default injectIntl(WithLoandingPanel(PersonaGuardiaListPage));
