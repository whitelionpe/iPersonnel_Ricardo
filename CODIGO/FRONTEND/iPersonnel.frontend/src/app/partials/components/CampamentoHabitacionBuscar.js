import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";//Multi-idioma
import { Button } from "devextreme-react";
import { Portlet, PortletHeaderPopUp, PortletHeaderToolbar } from "../content/Portlet";

import { getDataTempLocal, isNotEmpty, setDataTempLocal } from "../../../_metronic";
import { handleInfoMessages } from "../../store/ducks/notify-messages";
import { DataGrid, Column, FilterRow, Selection } from "devextreme-react/data-grid";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";

//-CustomerDataGrid-Import>
import CustomDataGrid from "../components/CustomDataGrid";
import { forceLoadTypes } from "../components/CustomDataGrid/CustomDataGridHelper";
import { storeFiltrar as loadUrl } from "../../api/campamento/habitacion.api";

import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";

export const initialFilter = {
    IdDivision: "",
    IdCampamento: "",
    IdModulo: "",
    IdTipoHabitacion: ""
};

const CampamentoHabitacionBuscar = props => {
    const { intl, selectionMode, idDivision, dataRowEditNew } = props;
    const [, setSelectedRow] = useState([]);

    //FILTRO- CustomerDataGrid
    const [isFirstDataLoad] = useState(true);
    const [refreshData, setRefreshData] = useState(false);
    const ds = new DataSource({
        store: new ArrayStore({ data: [], key: "RowIndex" }),
        reshapeOnPush: false,
    });
    const [dataSource] = useState(ds);

    const refresh = () => dataSource.refresh();
    const resetLoadOptions = () => dataSource.resetLoadOptions();

    //-CustomerDataGrid-Variables-ini->
    const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);

    const [filterData] = useState({
        IdDivision: isNotEmpty(idDivision) ? idDivision : ""
        , IdCampamento: isNotEmpty(dataRowEditNew.IdCampamento) ? dataRowEditNew.IdCampamento : ""
        , IdModulo: isNotEmpty(dataRowEditNew.IdModulo) ? dataRowEditNew.IdModulo : ""
        , IdTipoHabitacion: isNotEmpty(dataRowEditNew.IdTipoHabitacion) ? dataRowEditNew.IdTipoHabitacion : ""
    });
    const [
        ifThereAreNoChangesLoadFromStorage,
        setIfThereAreNoChangesLoadFromStorages,
    ] = useState(true);
    //-CustomerDataGrid-Variables-end->

    function aceptar() {
        let dataSelected = [];
        if (selectionMode === "row" || selectionMode === "single") {
            let getData = getDataTempLocal('selectRowDataHabitacion');
            dataSelected = [{ ...getData }];
        }
        console.log('dataSelected', dataSelected);
        if (dataSelected.length > 0) {
            if (dataSelected[0] && Object.keys(dataSelected[0]).length === 0 && Object.getPrototypeOf(dataSelected[0]) === Object.prototype){
                handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }));
                return;
            }
            //removeDataTempLocal('selectRowData');
            props.selectData(dataSelected);
            props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
        } else {
            handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }));
        }

    }

    function onCellPrepared(e) {
        if (e.rowType === 'data') {
            if (e.data.Activo === 'INACTIVO') {
                e.cellElement.style.color = 'red';
            }
        }
    }

    function onSelectionChanged(e) {
        //Seleccion multiple
        setSelectedRow(e.selectedRowsData);
    }

    const onRowDblClick = (evt) => {
        if (evt.rowIndex === -1) return;
        if (selectionMode === "row" || selectionMode === "single") {
            if (isNotEmpty(evt.data)) {
                props.selectData([{ ...evt.data }]);
                props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
            }
        }
    };

    const seleccionarRegistro = (evt) => {
        if (!customDataGridIsBusy) {
            if (selectionMode === "row" || selectionMode === "single") {
                if (isNotEmpty(evt.row.data)) setDataTempLocal('selectRowDataHabitacion', evt.row.data);
            }
        }
    }

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
    }, [refreshData, setRefreshData]);

    //JDL-> 
    useEffect(() => {
        if (dataRowEditNew) {
            const { IdCampamento, IdModulo, IdTipoHabitacion } = dataRowEditNew;
            dataSource.loadDataWithFilter({ data: { IdDivision: idDivision, IdCampamento, IdModulo, IdTipoHabitacion } });
        }
    }, [dataRowEditNew, dataSource, idDivision]);


    //-CustomerDataGrid-Filter
    const keysToGenerateFilter = [
        'IdDivision',
        'IdCampamento',
        'IdModulo',
        'IdTipoHabitacion',
        'IdHabitacion',
        'Habitacion'
    ];

    //-CustomerDataGrid-DataGrid
    const renderDataGrid = ({ gridRef, dataSource }) => {
        return (
            <DataGrid
                dataSource={dataSource}
                ref={gridRef}
                showBorders={true}
                focusedRowEnabled={true}
                keyExpr="RowIndex"
                onCellPrepared={onCellPrepared}
                onSelectionChanged={(e => onSelectionChanged(e))}
                onRowDblClick={onRowDblClick}
                onFocusedRowChanged={seleccionarRegistro}
                repaintChangesOnly={true}
                allowColumnReordering={true}
                allowColumnResizing={true}
                columnAutoWidth={true}
            >
                <FilterRow visible={true} showOperationChooser={false} />
                <Selection mode={selectionMode} />

                <Column dataField="Modulo"
                    caption={intl.formatMessage({ id: "CAMP.RESERVATION.MODULE" })}
                    editorOptions={false} allowEditing={false} width={"25%"} allowFiltering={false}
                />
                <Column dataField="IdHabitacion"
                    caption={intl.formatMessage({ id: "ACCESS.PERSON.GRUPO.CODE" })}
                    editorOptions={false} allowEditing={false} width={"20%"}
                    alignment={"center"} />
                <Column dataField="Habitacion"
                    caption={intl.formatMessage({ id: "CAMP.RESERVATION.ROOM" })}
                    editorOptions={false} allowEditing={false}
                    width={"20%"} />
                <Column dataField="TipoHabitacion"
                    caption={intl.formatMessage({ id: "CAMP.RESERVATION.ROOMTYPE" })}
                    editorOptions={false} allowEditing={false} allowFiltering={false}
                    width={"35%"} />
            </DataGrid>
        );
    };

    //-CustomerDataGrid-DataGrid- end
    return (
        <>
            <Popup
                visible={props.showPopup.isVisiblePopUp}
                dragEnabled={false}
                closeOnOutsideClick={false}
                showTitle={true}
                height={"600px"}
                width={"600px"}
                title={(intl.formatMessage({ id: "ACTION.SEARCH" }) + ' ' + intl.formatMessage({ id: "CAMP.RESERVATION.ROOM" })).toUpperCase()}
                onHiding={() => props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)}
            >
                <Portlet>

                    <PortletHeaderPopUp
                        title={""}
                        toolbar={
                            <PortletHeaderToolbar>
                                <Button
                                    icon="todo"//icon="fa fa-save"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.ACCEPT" })}
                                    onClick={aceptar}
                                    useSubmitBehavior={true}
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


                    <CustomDataGrid
                        showLog={false}
                        uniqueId={props.uniqueId}
                        dataSource={dataSource}
                        rowNumberName="RowIndex"
                        loadWhenStartingComponent={isFirstDataLoad && !refreshData}
                        renderDataGrid={renderDataGrid}
                        loadUrl={loadUrl}
                        forceLoad={forceLoadTypes.Unforced}
                        sendToServerOnlyIfThereAreChanges={true}
                        ifThereAreNoChangesLoadFromStorage={
                            ifThereAreNoChangesLoadFromStorage
                        }
                        caseSensitiveWhenCheckingForChanges={true}
                        uppercaseFilterRow={true}
                        initialLoadOptions={{ currentPage: 1, pageSize: 15, sort: { column: 'Habitacion', order: 'asc' } }}
                        filterRowSize="sm"
                        summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW", })} {0} de {1} `}
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


                </Portlet>
            </Popup>
        </>
    );
};

CampamentoHabitacionBuscar.propTypes = {
    showButton: PropTypes.bool,
    selectionMode: PropTypes.string,
    uniqueId: PropTypes.string,
    filtro: PropTypes.object,


};
CampamentoHabitacionBuscar.defaultProps = {
    showButton: false,
    selectionMode: "row", //['multiple', 'row','single]
    uniqueId: "campamentoHabitacionBuscar",
    filtro: { IdDivision: "", IdCampamento: "", IdModulo: "", IdHabitacion: "", Habitacion: "", IdTipoHabitacion: "" },


};
export default injectIntl(CampamentoHabitacionBuscar);
