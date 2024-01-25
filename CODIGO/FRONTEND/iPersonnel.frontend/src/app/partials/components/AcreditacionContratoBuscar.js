import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import {
    Portlet,
    PortletHeader,
    PortletHeaderToolbar,
} from "../content/Portlet";
import { getStartAndEndOfMonthByDay, isNotEmpty, dateFormat, getDataTempLocal, removeDataTempLocal, setDataTempLocal } from "../../../_metronic";
import { handleInfoMessages } from "../../store/ducks/notify-messages";
import {
    DataGrid,
    Column,
    FilterRow,
    HeaderFilter,
    FilterPanel,
    Selection,
} from "devextreme-react/data-grid";
import { Popup } from "devextreme-react/popup";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
//-CustomerDataGrid-Import>
import CustomDataGrid from "../components/CustomDataGrid";
import { forceLoadTypes } from "../components/CustomDataGrid/CustomDataGridHelper";
import { storeListar as loadUrl2, storeListarContratista as loadUrl } from "../../api/administracion/contratoDivision.api";

import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";

import Form, {
    Item,
    GroupItem,
    PatternRule,
    RequiredRule,
    EmailRule,
    NumericRule,
    StringLengthRule,
    ButtonItem,
    EmptyItem
} from "devextreme-react/form";



const AcreditacionContratoBuscar = (props) => {

    const { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay();
    const { selectionMode, intl, IdCompaniaMandante, noContratista, refreshParameters } = props;
    const { IdCliente, IdDivision } = useSelector((state) => state.perfil.perfilActual);
    const NAME_ROW = `${props.uniqueId}_SDR`;

    const initialFilter = {
        IdCliente: props.FiltroPadre.IdCliente,
        Activo: "S",
        IdDivision: IdDivision,
        IdCompaniaContratista: props.FiltroPadre.IdCompaniaContratista,
        FechaInicio,
        FechaFin,
        IdCompaniaMandante: props.FiltroPadre.IdCompaniaMandante,
        IdEntidad: props.FiltroPadre.IdEntidad
    };

    //console.log("AcreditacionContratoBuscar => props:",props);


    const [selectedRow, setSelectedRow] = useState([]);
    //const { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay();
    //FILTRO- CustomerDataGrid
    const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
    const [refreshData, setRefreshData] = useState(false);
    const ds = new DataSource({
        store: new ArrayStore({ data: [], key: "RowIndex" }),
        reshapeOnPush: false,
    });
    const [dataSource] = useState(ds);

    const refresh = () => dataSource.refresh();
    const resetLoadOptions = () => dataSource.resetLoadOptions();
    //const { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay();

    //-CustomerDataGrid-Variables-ini->
    const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
    const [filterData, setFilterData] = useState({
        ...initialFilter/*, IdCliente, IdDivision,
        FechaInicio, FechaFin*/
    });

    const [
        ifThereAreNoChangesLoadFromStorage,
        setIfThereAreNoChangesLoadFromStorages,
    ] = useState(true);
    //-CustomerDataGrid-Variables-end->

    function aceptar() {
        let dataSelected = [];
        if (selectionMode === "row" || selectionMode === "single") {
            let getData = getDataTempLocal(NAME_ROW);
            dataSelected = [{ ...getData }];
        } else {
            dataSelected = selectedRow;
        }

        if (dataSelected.length > 0) {
            props.selectData(dataSelected);
            props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
        } else {
            handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }));
        }
    }

    function onCellPrepared(e) {
        if (e.rowType === "data") {
            if (e.data.Estado === "INACTIVO") {
                e.cellElement.style.color = "red";
            }
        }
    }

    const seleccionarRegistro = (evt) => {
        if (!customDataGridIsBusy) {
            if (selectionMode === "row" || selectionMode === "single") {
                if (isNotEmpty(evt.row.data)) setDataTempLocal(NAME_ROW, evt.row.data);
            }
        }
    };


    const onRowDblClick = (evt) => {
        if (evt.rowIndex === -1) return;
        if (props.selectionMode === "row" || props.selectionMode === "single") {
            if (isNotEmpty(evt.data)) {
                props.selectData([{
                    IdContrato: evt.data.IdContrato,
                    Asunto: evt.data.Asunto
                }]);
                props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
            }
        }
    };

    //-CustomerDataGrid-UseEffect-ini->
    useEffect(() => {
        if (ifThereAreNoChangesLoadFromStorage)
            setIfThereAreNoChangesLoadFromStorages(false);
    }, [ifThereAreNoChangesLoadFromStorage]);

    useEffect(() => {
        if (refreshData) {
            refresh();
            setRefreshData(false);
        }
    }, [refreshData]);


    useEffect(() => {
        if (IdCompaniaMandante) {
            dataSource.loadDataWithFilter({ data: { IdCompaniaMandante: IdCompaniaMandante } });
        }
    }, [IdCompaniaMandante]);

    useEffect(() => {
        if (refreshParameters) {
            let strFechaInicio = dateFormat(props.FiltroPadre.FechaInicio, "yyyyMMdd");
            let strFechaFin = dateFormat(props.FiltroPadre.FechaFin, "yyyyMMdd");
            dataSource.loadDataWithFilter({
                data: {
                    ...props.FiltroPadre,
                    FechaInicio: strFechaInicio,
                    FechaFin: strFechaFin
                }
            });
        }
    }, [refreshParameters]);


    //-CustomerDataGrid-Filter
    const keysToGenerateFilter = [
        "IdCliente",
        "IdDivision",
        "IdPerfil",
        "Perfil",
        "Activo",
        'IdCompaniaMandante',
        'IdCompaniaContratista',
        'FechaInicio',
        'FechaFin',
        'Asunto',
        'IdContrato',
        'IdEntidad'
    ];
    //-CustomerDataGrid-DataGrid

    function onSelectionChanged(e) {
        //Seleccion multiple
        setSelectedRow(e.selectedRowsData);
    }

    const renderDataGrid = ({ gridRef, dataSource }) => {
        return (
            <DataGrid
                dataSource={dataSource}
                ref={gridRef}
                showBorders={true}
                focusedRowEnabled={true}
                keyExpr="RowIndex"
                onCellPrepared={onCellPrepared}
                repaintChangesOnly={true}
                onSelectionChanged={(e => onSelectionChanged(e))}
                onRowDblClick={onRowDblClick}
                onFocusedRowChanged={seleccionarRegistro}
                allowColumnReordering={true}
                allowColumnResizing={true}
                columnAutoWidth={true}

            // onRowDblClick={onRowDblClick}
            // onSelectionChanged={(e => onSelectionChanged(e))}
            // onFocusedRowChanged={seleccionarRegistro}
            >
                <FilterRow visible={true} showOperationChooser={false} />
                <Selection mode={props.selectionMode} />
                <HeaderFilter visible={false} />
                <FilterPanel visible={false} />
                <Column
                    dataField="RowIndex"
                    caption="#"
                    allowSorting={false}
                    allowFiltering={false}
                    allowHeaderFiltering={false}
                    width={"7%"}
                    alignment={"center"}
                />
                <Column
                    dataField="IdContrato"
                    caption={intl.formatMessage({ id: "COMMON.CODE" })}
                    width={"25%"}
                    allowHeaderFiltering={false}
                    allowSorting={true}
                    alignment={"center"}
                />
                <Column
                    dataField="Asunto"
                    caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBJECT" })}
                    width={"40%"}
                    allowHeaderFiltering={false}
                    allowSorting={true}
                    alignment={"center"}
                />
                <Column
                    caption={"INICIO"}
                    dataField="FechaInicio" width={"15%"} alignment={"left"} allowSorting={true} allowFiltering={false} allowHeaderFiltering={false} dataType="datetime" format="dd/MM/yyyy" />
                <Column
                    caption={"FIN"}
                    dataField="FechaFin" width={"15%"} alignment={"left"} allowSorting={true} allowFiltering={false} allowHeaderFiltering={false} dataType="datetime" format="dd/MM/yyyy" />

            </DataGrid>
        );
    };
    //-CustomerDataGrid-DataGrid- end

    const renderFormContentCustomFilter = ({ getInstance }) => {

        return (
            <GroupItem itemType="group" colCount={2} colSpan={2}>

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
                        onValueChanged: () => getInstance().filter()


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
                        onValueChanged: () => getInstance().filter()

                    }}
                />

            </GroupItem>
        );

    }



    return (
        <>
            <Popup
                visible={props.showPopup.isVisiblePopUp}
                dragEnabled={false}
                closeOnOutsideClick={true}
                showTitle={true}
                height={"600px"}
                width={"600px"}
                title={(
                    intl.formatMessage({ id: "ACTION.SEARCH" }) +
                    " " +
                    "CONTRATOS"
                ).toUpperCase()}
                onHiding={() =>
                    props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)
                }
            >
                <Portlet>
                    {props.showButton && (
                        <PortletHeader
                            title={""}
                            toolbar={
                                <PortletHeaderToolbar>
                                    <Button
                                        icon="todo" //icon="fa fa-save"
                                        type="default"
                                        hint={intl.formatMessage({ id: "ACTION.ACCEPT" })}
                                        onClick={aceptar}
                                        useSubmitBehavior={true}
                                        disabled={customDataGridIsBusy}
                                    />
                                    &nbsp;
                                    <Button
                                        icon="refresh" //fa fa-broom
                                        type="default"
                                        hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                                        disabled={customDataGridIsBusy}
                                        onClick={resetLoadOptions}
                                    />
                                </PortletHeaderToolbar>
                            }
                        />
                    )}
                    {!props.showButton && (
                        <PortletHeader
                            title={""}
                            toolbar={
                                <PortletHeaderToolbar>
                                    <Button
                                        icon="refresh" //fa fa-broom
                                        type="default"
                                        hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                                        disabled={customDataGridIsBusy}
                                        onClick={resetLoadOptions}
                                    />
                                    &nbsp;
                                </PortletHeaderToolbar>
                            }
                        />
                    )}

                    {/* <PortletBody> */}

                    <CustomDataGrid
                        showLog={false}
                        uniqueId={`${props.uniqueId}_GRID`}
                        dataSource={dataSource}
                        rowNumberName="RowIndex"
                        loadWhenStartingComponent={isFirstDataLoad && !refreshData}
                        renderDataGrid={renderDataGrid}
                        loadUrl={noContratista ? loadUrl2 : loadUrl}
                        forceLoad={forceLoadTypes.Unforced}
                        sendToServerOnlyIfThereAreChanges={true}
                        ifThereAreNoChangesLoadFromStorage={
                            ifThereAreNoChangesLoadFromStorage
                        }
                        caseSensitiveWhenCheckingForChanges={true}
                        uppercaseFilterRow={true}
                        initialLoadOptions={{
                            currentPage: 1,
                            pageSize: 15,
                            sort: { column: "IdContrato", order: "asc" },
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

                        renderFormContentCustomFilter={renderFormContentCustomFilter}
                        visibleCustomFilter={true}
                    />

                    {/* </PortletBody> */}
                </Portlet>
            </Popup>
        </>
    );
};

AcreditacionContratoBuscar.propTypes = {
    showButton: PropTypes.bool,
    selectionMode: PropTypes.string,
    uniqueId: PropTypes.string,
    IdCompaniaMandante: PropTypes.string,
    IdEntidad: PropTypes.string
};
AcreditacionContratoBuscar.defaultProps = {
    showButton: false,
    selectionMode: "row", //['multiple', 'row','single]
    uniqueId: "AcreditacionContratoBuscar",
    IdCompaniaMandante: "",
    IdEntidad: ""
};
export default injectIntl(AcreditacionContratoBuscar);
