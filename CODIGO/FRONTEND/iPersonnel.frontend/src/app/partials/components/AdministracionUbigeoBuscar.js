import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import {
    Portlet,
    PortletHeaderPopUp,
    PortletHeaderToolbar,
} from "../content/Portlet";
import { isNotEmpty, getDataTempLocal, setDataTempLocal, NivelesUbicacionPais } from "../../../_metronic";
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
//-CustomerDataGrid-Import>
import CustomDataGrid from "../components/CustomDataGrid";
import { forceLoadTypes } from "../components/CustomDataGrid/CustomDataGridHelper";
import { storeListar as loadUrl } from "../../api/administracion/ubigeo.api";

import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";

const AdministracionUbigeoBuscar = (props) => {

    const initialFilter = { Activo: "S" };
    const { selectionMode, intl } = props;
    const nameDataTemporal = `${props.uniqueId}_SDR`;

    const [selectedRow, setSelectedRow] = useState([]);
    //FILTRO- CustomerDataGrid
    const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
    const [refreshData, setRefreshData] = useState(false);
    const [ubicacion, setUbicacion] = useState({
        Nivel1: intl.formatMessage({ id: "ADMINISTRATION.UBIGEO.DEPARTAMENT" }),
        Nivel2: intl.formatMessage({ id: "ADMINISTRATION.UBIGEO.PROVINCE" }),
        Nivel3: intl.formatMessage({ id: "ADMINISTRATION.UBIGEO.DISTRIC" })
    })

    const ds = new DataSource({
        store: new ArrayStore({ data: [], key: "RowIndex" }),
        reshapeOnPush: false,
    });
    const [dataSource] = useState(ds);

    const refresh = () => dataSource.refresh();
    const resetLoadOptions = () => dataSource.resetLoadOptions();

    //-CustomerDataGrid-Variables-ini->
    const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
    console.log("***ESTA LLEGANDO EL PAIS props.idPais :> ", props.idPais);
    const [filterData, setFilterData] = useState({ ...initialFilter, IdPais: isNotEmpty(props.idPais) ? props.idPais : "" });
    const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages,] = useState(true);

    //-CustomerDataGrid-Variables-end->
    function aceptar() {
        let dataSelected = [];
        if (selectionMode === "row" || selectionMode === "single") {
            let getData = getDataTempLocal(nameDataTemporal);
            console.log("***getDataTempLocal(nameDataTemporal) :> ",getData);
            dataSelected = [{ ...getData }];
        } else {
            dataSelected = selectedRow;
        }

        console.log("****dataSelected[0].IdUbigeo:>",dataSelected[0].IdUbigeo);
        //&& isNotEmpty(dataSelected[0].IdUbigeo)
        if (dataSelected.length > 0 ) {
            console.log("****dataSelected:>",dataSelected);
            props.selectData(dataSelected);
            props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
        } else {
            handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }));
            // return;
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
                if (isNotEmpty(evt.row.data)) setDataTempLocal(nameDataTemporal, evt.row.data);
            }
        }
    };


    const onRowDblClick = (evt) => {
        if (evt.rowIndex === -1) return;
        if (selectionMode === "row" || selectionMode === "single") {
            if (isNotEmpty(evt.data)) {
                props.selectData([{ ...evt.data }]);
                props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
            }
        }
    };

    function onSelectionChanged(e) {
        //Seleccion multiple
        setSelectedRow(e.selectedRowsData);
    }


    useEffect(() => {
        if (isNotEmpty(props.idPais)) {
            var ress = NivelesUbicacionPais().find(x => x.Pais == props.idPais);
            setUbicacion({
                Nivel1: ress.Ubicacion.Nivel1,
                Nivel2: ress.Ubicacion.Nivel2,
                Nivel3: ress.Ubicacion.Nivel3
            });
            resetLoadOptions();

        }
    }, [props.idPais])

    //-CustomerDataGrid-Filter
    const keysToGenerateFilter = [
        "IdUbigeo",
        "Pais",
        "Departamento",
        "Provincia",
        "Distrito",
        "Activo",
        "IdPais"
    ];

    //-CustomerDataGrid-UseEffect-ini->
    useEffect(() => {
        if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
    }, [ifThereAreNoChangesLoadFromStorage]);

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
                repaintChangesOnly={true}
                onSelectionChanged={(e => onSelectionChanged(e))}
                onRowDblClick={onRowDblClick}
                onFocusedRowChanged={seleccionarRegistro}
                allowColumnReordering={true}
                allowColumnResizing={true}
                columnAutoWidth={true}
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
                    width={"10%"}
                    alignment={"center"}
                />
                <Column dataField="IdUbigeo" visible={false} />
                <Column
                    dataField="Departamento"
                    caption={ubicacion.Nivel1}
                    allowHeaderFiltering={false}
                    allowSorting={true}
                    width={"30%"}
                />
                <Column
                    dataField="Provincia"
                    caption={ubicacion.Nivel2}
                    allowHeaderFiltering={false}
                    allowSorting={true}
                    width={"30%"}
                />
                <Column
                    dataField="Distrito"
                    caption={ubicacion.Nivel3}
                    allowHeaderFiltering={false}
                    allowSorting={true}
                    width={"30%"}
                />
            </DataGrid>
        );
    };
    //-CustomerDataGrid-DataGrid- end

    return (
        <>
            <Popup
                visible={props.showPopup.isVisiblePopUp}
                dragEnabled={false}
                closeOnOutsideClick={true}
                showTitle={true}
                height={"600px"}
                width={"600px"}
                title={(intl.formatMessage({ id: "ACTION.SEARCH" }) + " " + intl.formatMessage({ id: "ACCESS.PERSON.FILTER.UBIGEO" })).toUpperCase()}
                onHiding={() =>
                    props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)
                }
            >
                <Portlet>
                    {props.showButton && (
                        <PortletHeaderPopUp
                            title={""}
                            toolbar={
                                <PortletHeaderToolbar>
                                    <Button
                                        icon="todo"
                                        type="default"
                                        hint={intl.formatMessage({ id: "ACTION.ACCEPT" })}
                                        onClick={aceptar}
                                        useSubmitBehavior={true}
                                        disabled={customDataGridIsBusy}
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
                            }
                        />
                    )}

                    <CustomDataGrid
                        showLog={false}
                        uniqueId={`${props.uniqueId}_GRID`}
                        dataSource={dataSource}
                        rowNumberName="RowIndex"
                        loadWhenStartingComponent={isFirstDataLoad && !refreshData}
                        renderDataGrid={renderDataGrid}
                        loadUrl={loadUrl}
                        forceLoad={forceLoadTypes.Unforced}
                        sendToServerOnlyIfThereAreChanges={true}
                        ifThereAreNoChangesLoadFromStorage={ifThereAreNoChangesLoadFromStorage}
                        caseSensitiveWhenCheckingForChanges={true}
                        uppercaseFilterRow={true}
                        initialLoadOptions={{ currentPage: 1, pageSize: 15, sort: { column: "Departamento", order: "asc" }, }}
                        filterRowSize="sm"
                        summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW", })} {0} de {1} `}
                        // CUSTOM FILTER
                        visibleCustomFilter={false}
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

AdministracionUbigeoBuscar.propTypes = {
    showButton: PropTypes.bool,
    selectionMode: PropTypes.string,
    uniqueId: PropTypes.string,
    IdCompaniaMandante: PropTypes.string,
    IdEntidad: PropTypes.string
};
AdministracionUbigeoBuscar.defaultProps = {
    showButton: false,
    selectionMode: "row", //['multiple', 'row','single]
    uniqueId: "AdministracionUbigeoBuscar",
    IdCompaniaMandante: "",
    IdEntidad: ""
};

export default injectIntl(AdministracionUbigeoBuscar);
