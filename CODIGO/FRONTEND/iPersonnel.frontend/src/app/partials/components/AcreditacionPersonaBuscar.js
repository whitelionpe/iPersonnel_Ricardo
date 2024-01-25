import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import {
    Portlet,
    PortletHeader,
    PortletHeaderToolbar,
} from "../content/Portlet";

import { getDataTempLocal, isNotEmpty, listarCondicion, listarGrupo, setDataTempLocal } from "../../../_metronic";
import { Item, GroupItem } from "devextreme-react/form";
import { handleInfoMessages } from "../../store/ducks/notify-messages";
import { DoubleLinePersona as DoubleLineLabel } from "../content/Grid/DoubleLineLabel";
import {
    DataGrid,
    Column,
    ColumnChooser,
    ColumnFixing,
    Scrolling,
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
import { filtraracreditacion as loadUrl } from "../../api/administracion/personaContrato.api";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";


export const initialFilter = {
    Activo: "S",
    IdCliente: "",
    Condicion: "TRABAJADOR",
    MostrarGrupo: "TODOS",
    Personas: "",
    IdCompaniaMandante: "",
};

const AcreditacionPersonaBuscar = ({
    uniqueId,
    intl,
    selectionMode,
    agregar,
    showPopup,
    IdCompaniaMandante = "",
}) => {


    const [selectedRow, setSelectedRow] = useState([]);

    const { IdCliente, IdPerfil } = useSelector(state => state.perfil.perfilActual);
    const IdDivisionPerfil = useSelector(state => state.perfil.perfilActual.IdDivision);

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

    //-CustomerDataGrid-Variables-ini->
    const [isActiveFilters, setIsActiveFilters] = useState(false);////
    const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
    const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdPerfil, IdDivisionPerfil });
    const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages,] = useState(true);
    //-CustomerDataGrid-Variables-end->


    useEffect(() => {
        if (IdCompaniaMandante !== "") {
            setFilterData({ IdCompaniaMandante });
        }
    }, [])


    function aceptar() {

        let dataSelected = [];
        if (selectionMode === "row" || selectionMode === "single") {
            let getData = getDataTempLocal('selectRowData');
            dataSelected = [{ ...getData }];
        } else {
            dataSelected = selectedRow;
        }

        if (dataSelected.length > 0) {
            //removeDataTempLocal('selectRowData');
            agregar(dataSelected);
            showPopup.setisVisiblePopUp(!showPopup.isVisiblePopUp);
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

    function onSelectionChanged(e) {
        //Seleccion multiple
        setSelectedRow(e.selectedRowsData);
    }

    //agregar
    const onRowDblClick = (evt) => {
        if (evt.rowIndex === -1) return;
        if (selectionMode === "row" || selectionMode === "single") {
            if (isNotEmpty(evt.data)) {
                agregar([{ ...evt.data }]);
                showPopup.setisVisiblePopUp(!showPopup.isVisiblePopUp);
            }
        }
    };

    const seleccionarRegistro = (evt) => {
        if (!customDataGridIsBusy) {
            if (selectionMode === "row" || selectionMode === "single") {
                if (isNotEmpty(evt.row.data)) setDataTempLocal('selectRowData', evt.row.data);
            }
        }
    }


    const selectPersonas = (data) => {

        if (isNotEmpty(data)) {
            let strPersonas = data.split('|').join(',');
            //console.log(strPersonas);
            dataSource.loadDataWithFilter({ data: { Personas: strPersonas } });
        }
    }

    useEffect(() => {
        if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
    }, [ifThereAreNoChangesLoadFromStorage])


    useEffect(() => {
        if (refreshData) {
            refresh();
            setRefreshData(false);
        }
    }, [refreshData]);

    //-CustomerDataGrid-Filter
    const keysToGenerateFilter = [
        "IdCliente",
        "IdPersona",
        "Condicion",
        "NombreCompleto",
        "TipoDocumentoAlias",
        "Documento",
        "Activo",
        'IdPerfil',
        'IdDivisionPerfil',
        "MostrarGrupo",
        "Personas",
        "IdCompaniaMandante"
    ];


    //-CustomerDataGrid-DataGrid

    const renderDataGrid = ({ gridRef, dataSource }) => {
        return (

            <DataGrid
                id="gridContainer"
                dataSource={dataSource}
                ref={gridRef}
                showBorders={true}
                focusedRowEnabled={true}
                keyExpr="RowIndex"
                onCellPrepared={onCellPrepared}
                repaintChangesOnly={true}
                onRowDblClick={onRowDblClick}
                onFocusedRowChanged={seleccionarRegistro}
                onSelectionChanged={(e => onSelectionChanged(e))}

                allowColumnReordering={false}
                allowColumnResizing={false}
                columnAutoWidth={false}
            >
                <FilterRow visible={true} showOperationChooser={false} />
                <Selection mode={selectionMode} />
                <HeaderFilter visible={false} />
                <FilterPanel visible={false} />
                <Scrolling visible={false} />

                <ColumnChooser enabled={false} />
                <ColumnFixing enabled={true} />

                <Column
                    dataField="IdPersona"
                    caption={intl.formatMessage({ id: "COMMON.CODE" })}
                    allowHeaderFiltering={false}
                    allowSorting={true}
                    width={"10%"}
                    alignment={"center"}
                    fixed={true}
                />
                <Column
                    dataField="NombreCompleto"
                    caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
                    cellRender={DoubleLineLabel}
                    allowSorting={true}
                    allowHeaderFiltering={false}
                    width={"50%"}
                    fixed={true}
                />
                <Column
                    dataField="TipoDocumento"
                    caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE" })}
                    /* allowSorting={true}
                    allowFiltering={false} */
                    allowHeaderFiltering={false}
                    alignment={"center"}
                    width={"20%"}
                >
                    {/* <HeaderFilter dataSource={tipoDocumentoFilter} /> */}
                </Column>
                <Column
                    dataField="Documento"
                    caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}
                    allowHeaderFiltering={false}
                    width={"20%"}
                />
            </DataGrid>

        );

    };

    //-CustomerDataGrid-DataGrid- end

    return (
        <>
            <Popup
                visible={showPopup.isVisiblePopUp}
                dragEnabled={false}
                closeOnOutsideClick={false}
                showTitle={true}
                height={"600px"}
                width={"550px"}
                title={(
                    intl.formatMessage({ id: "ACTION.SEARCH" }) + " " + intl.formatMessage({ id: "ADMINISTRATION.PERSON" })
                ).toUpperCase()}
                onHiding={() =>
                    showPopup.setisVisiblePopUp(!showPopup.isVisiblePopUp)
                }
            >

                <Portlet>
                    <PortletHeader
                        title={""}
                        toolbar={
                            <PortletHeaderToolbar>
                                <Button
                                    //icon="fa fa-save"
                                    icon="todo"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.ACCEPT" })}
                                    onClick={aceptar}
                                    useSubmitBehavior={true}
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
                    <CustomDataGrid
                        showLog={false}
                        uniqueId={uniqueId}
                        dataSource={dataSource}
                        rowNumberName="RowIndex"
                        loadWhenStartingComponent={isFirstDataLoad && !refreshData}
                        renderDataGrid={renderDataGrid}
                        loadUrl={loadUrl}
                        forceLoad={forceLoadTypes.FromServer}
                        sendToServerOnlyIfThereAreChanges={true}
                        ifThereAreNoChangesLoadFromStorage={
                            ifThereAreNoChangesLoadFromStorage
                        }
                        caseSensitiveWhenCheckingForChanges={true}
                        uppercaseFilterRow={true}
                        initialLoadOptions={{
                            currentPage: 1,
                            pageSize: 15,
                            sort: { column: "NombreCompleto", order: "asc" },
                        }}
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

AcreditacionPersonaBuscar.propTypes = {
    showButton: PropTypes.bool,
    selectionMode: PropTypes.string,
    uniqueId: PropTypes.string,
};
AcreditacionPersonaBuscar.defaultProps = {
    showButton: true,
    selectionMode: "row", //['multiple', 'row']
    uniqueId: "AcreditacionPersonaBuscarGrid",
};

export default injectIntl(AcreditacionPersonaBuscar);
