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
} from "devextreme-react/data-grid";
import { Button } from "devextreme-react";

import { useSelector } from "react-redux";
import { storeFiltrar as loadUrl } from "../../../../../api/asistencia/resultado.api";

import PropTypes from "prop-types";
import CustomDataGrid, { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid";

import { GroupItem, Item } from "devextreme-react/form";
import { convertyyyyMMddToDate, dateFormat, getMinusDaysBeforeAndToday, getStartOfMonthAndToday, isNotEmpty } from "../../../../../../_metronic";

import { initialFilter } from "./PersonaResultadoIndexPage";

const PersonaResultadoListPage = (props) => {
    const { intl, varIdPersona } = props; 
    const { IdDivision, IdCliente } = useSelector(state => state.perfil.perfilActual);
    const [isActiveFilters, setIsActiveFilters] = useState(true);
    const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);

    const { FechaInicio, FechaFin } = getMinusDaysBeforeAndToday(15);
    const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdPersona: varIdPersona, FechaInicio: FechaInicio, FechaFin: FechaFin });


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

    function verRegistro(e) {
        props.verRegistro(e.row.data);
    }

    //>..Definir Filtro para customerDataGrid
    const keysToGenerateFilter = ['IdCliente', 'IdPersona', 'FechaInicio', 'FechaFin'];

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
                id="resultado"
                showBorders={true}
                focusedRowEnabled={true}
                keyExpr="RowIndex"
                onFocusedRowChanged={seleccionarRegistro}
                onCellPrepared={onCellPrepared}
                focusedRowKey={props.focusedRowKey}
                remoteOperations={true}
                allowColumnReordering={true}
                allowColumnResizing={true}
                columnAutoWidth={true}
                repaintChangesOnly={true}
            >
                <FilterRow visible={false} showOperationChooser={false} />
                <Column dataField="RowIndex" caption="#" 
                    width={"5%"}
                    alignment={"center"}
                    allowSorting={false}
                    allowFiltering={false}
                    allowHeaderFiltering={false}
                />
                <Column
                    dataField="Dia"
                    caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.DAY" })}
                    // dataType="date" format="dd/MM/yyyy"
                    width={"5%"}
                    alignment={"center"}
                    allowSorting={true}
                    allowHeaderFiltering={false}
                />
                <Column
                    dataField="FechaAsistencia"
                    caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" })}
                    dataType="date" format="dd/MM/yyyy"
                    width={"9%"}
                    alignment={"center"}
                    allowSorting={true}
                    allowFiltering={false}
                    allowHeaderFiltering={false}
                />

                <Column
                    dataField="MinutosTrabajados"
                    caption={intl.formatMessage({ id: "ASSISTANCE.RESULT.PERSON.WORKED_MINUTES" })}
                    alignment={"center"}
                    width={"7%"}
                    allowSorting={true}
                    allowFiltering={false}
                    allowHeaderFiltering={true}
                />
                <Column
                    dataField="MinutosRefrigerio"
                    caption={intl.formatMessage({ id: "ASSISTANCE.RESULT.PERSON.BREAKE_MINUTES" })}
                    alignment={"center"}
                    width={"7%"}
                    allowSorting={true}
                    allowHeaderFiltering={false}
                />
                <Column
                    dataField="MinutosTardanza"
                    caption={intl.formatMessage({ id: "ASSISTANCE.RESULT.PERSON.TARDINESS_MINUTES" })}
                    alignment={"center"}
                    width={"7%"}
                    allowSorting={true}
                    allowHeaderFiltering={false}
                />
                <Column
                    dataField="MinutosSalidaTemprano"
                    caption={intl.formatMessage({ id: "ASSISTANCE.RESULT.PERSON.EARLY_DEPARTURE_MINUTES" })}
                    alignment={"center"}
                    width={"9%"}
                    allowSorting={true}
                    allowHeaderFiltering={false}
                />
                <Column
                    dataField="MinutosExtrasEntrada"
                    caption={intl.formatMessage({ id: "ASSISTANCE.RESULT.PERSON.EXTRAHOUR_INIT" })}
                    alignment={"center"}
                    width={"9%"}
                    allowSorting={true}
                    allowHeaderFiltering={false}
                />
                <Column
                    dataField="MinutosExtrasSalida"
                    caption={intl.formatMessage({ id: "ASSISTANCE.RESULT.PERSON.EXTRAHOUR_END" })}
                    alignment={"center"}
                    width={"7%"}
                    allowSorting={true}
                    allowHeaderFiltering={false}
                /> 
                <Column
                    dataField="Intermedio"
                    caption={intl.formatMessage({ id: "ASSISTANCE.RESULT.PERSON.INTERMEDIATE" })}
                    alignment={"center"}
                    width={"7%"}
                    allowSorting={true}
                    allowHeaderFiltering={false}
                />
                <Column
                    dataField="Observacion"
                    caption={intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.OBSERVACION" })}
                    alignment={"center"}
                    width={"20%"}
                    allowSorting={true}
                    allowHeaderFiltering={false}
                />
                {/* <Column
                    dataField="MinutosPermisoPago"
                    caption={intl.formatMessage({ id: "ASSISTANCE.RESULT.PERSON.PAID_PERSON" })}
                    alignment={"center"}
                    allowSorting={true}
                    allowHeaderFiltering={false}
                />
                <Column
                    dataField="MinutosPermisoImpago"
                    caption={intl.formatMessage({ id: "ASSISTANCE.RESULT.PERSON.UNPAID_PERSON" })}
                    alignment={"center"}
                    allowSorting={true}
                    allowHeaderFiltering={false}
                />  */}
                <Column type="buttons" width={"7%"}> 
                    <ColumnButton icon="fa fa-eye" hint={intl.formatMessage({ id: "ACTION.VIEW", })} onClick={verRegistro} /> 
                </Column>

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
            props.dataSource.loadDataWithFilter({ data: { ...filterData, IdPersona: varIdPersona } });
        }
    }, [varIdPersona]);

    useEffect(() => {
        if (props.refreshData) {
            props.refresh();
            props.setRefreshData(false);
        }
    }, [props.refreshData]);


    return <>


        <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
            toolbar={
                <PortletHeader
                    title={""}
                    toolbar={
                        <PortletHeaderToolbar>
                            &nbsp;
                            <Button
                                icon="search"
                                type="default"
                                hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                                onClick={() => setIsActiveFilters(!isActiveFilters)}
                                disabled={customDataGridIsBusy}
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
                initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'FechaAsistencia', order: 'desc' } }}
                filterRowSize='sm'
                summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}
                visibleCustomFilter={isActiveFilters}
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

    </>;
}

PersonaResultadoListPage.propTypes = {
    showHeaderInformation: PropTypes.bool,
    uniqueId: PropTypes.string
};
PersonaResultadoListPage.defaultProps = {
    showHeaderInformation: true,
    uniqueId: 'PersonaResultadoList'
};
export default injectIntl(WithLoandingPanel(PersonaResultadoListPage));






