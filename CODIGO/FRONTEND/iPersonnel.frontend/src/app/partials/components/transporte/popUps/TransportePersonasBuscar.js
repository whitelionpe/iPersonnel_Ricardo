import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import {
    Portlet,
    PortletHeaderPopUp,
    PortletHeaderToolbar,
} from "../../../content/Portlet";
import { isNotEmpty, getDataTempLocal, setDataTempLocal } from "../../../../../_metronic";
import { handleInfoMessages } from "../../../../store/ducks/notify-messages";

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
import CustomDataGrid from "../../../components/CustomDataGrid";
import { forceLoadTypes } from "../../../components/CustomDataGrid/CustomDataGridHelper";
import { storeListarPersonas as loadUrl } from "../../../../api/transporte/manifiesto.api";

import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";

const TransportePersonasBuscar = (props) => {

  const { selectionMode, intl, IdRuta } = props;
    const initialFilter = { Activo: "S"};
    const nameDataTemporal = `${props.uniqueId}_SDR`;

    const [selectedRow, setSelectedRow] = useState([]);
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
    const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
    const [filterData, setFilterData] = useState({...initialFilter , IdRuta : isNotEmpty(IdRuta) ? IdRuta : "" });
    const [ ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages,] = useState(true);

    //-CustomerDataGrid-Variables-end->
    function aceptar() {
        let dataSelected = [];
        if (selectionMode === "row" || selectionMode === "single") {
            let getData = getDataTempLocal(nameDataTemporal);
            dataSelected = [{ ...getData }];
        } else {
            dataSelected = selectedRow;
        }

        if (dataSelected.length > 0) {
            props.selectData(dataSelected);
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
                if (isNotEmpty(evt.row.data)) setDataTempLocal(nameDataTemporal, evt.row.data);
            }
        }
    };


    const onRowDblClick = (evt) => {
      if (evt.rowIndex === -1) return;
      if (selectionMode === "row" || selectionMode === "single") {
        if (isNotEmpty(evt.data)) {
          props.selectData([{ ...evt.data }]);
        }
      }
    };

    function onSelectionChanged(e) {
      //Seleccion multiple
      setSelectedRow(e.selectedRowsData);
  }

    //-CustomerDataGrid-Filter
      const keysToGenerateFilter = [
        'IdCliente',
        'IdPersona',
        'NombreCompleto',
        'Documento',
        'Activo',
    ];

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
                    visible={false}
                />

                <Column
                dataField="IdPersona"
                caption={intl.formatMessage({ id: "COMMON.CODE" })}
                allowHeaderFiltering={false}
                allowSorting={true}
                width={"15%"}
                alignment={"center"}
                />

                <Column
                dataField="NombreCompleto"
                caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
                allowHeaderFiltering={false}
                allowSorting={true}
                />

                <Column
                dataField="Documento"
                caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}
                allowHeaderFiltering={false}
                allowSorting={true}
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
                title={( intl.formatMessage({ id: "ACTION.SEARCH" }) +" "+ intl.formatMessage({ id: "ACCESS.REPORT.PEOPLE" })).toUpperCase()} 
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
                        sendToServerOnlyIfThereAreChanges={false}
                        ifThereAreNoChangesLoadFromStorage={ifThereAreNoChangesLoadFromStorage}
                        caseSensitiveWhenCheckingForChanges={true}
                        uppercaseFilterRow={true}
                        initialLoadOptions={{currentPage: 1,pageSize: 15,sort: { column: "NombreCompleto", order: "asc" },}}
                        filterRowSize="sm"
                        summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW",})} {0} de {1} `}
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

TransportePersonasBuscar.propTypes = {
    showButton: PropTypes.bool,
    selectionMode: PropTypes.string,
    uniqueId: PropTypes.string,
    IdCompaniaMandante: PropTypes.string,
    IdEntidad: PropTypes.string
};
TransportePersonasBuscar.defaultProps = {
    showButton: false,
    selectionMode: "row", //['multiple', 'row','single]
    uniqueId: "TransportePersonasBuscar",
    IdCompaniaMandante: "",
    IdEntidad: ""
};

export default injectIntl(TransportePersonasBuscar);
