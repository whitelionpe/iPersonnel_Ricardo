import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl"; //Multi-idioma
import { Button } from "devextreme-react";
import { PortletHeaderPopUp, PortletHeaderToolbar, Portlet } from "../../../content/Portlet";
import { getDataTempLocal, isNotEmpty, setDataTempLocal } from "../../../../../_metronic";
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
import CustomDataGrid from "../../CustomDataGrid";
import { forceLoadTypes } from "../../CustomDataGrid/CustomDataGridHelper";
import { storeListarChofer as loadUrl } from "../../../../api/transporte/manifiesto.api";
import { convertCustomDateTimeString, convertStringToDate } from "../../CustomFilter";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";

export const initialFilter = {
  Activo: "S",
  IdCliente: "",
};

const TransporteChoferBuscar = (props) => {
  const { intl, selectionMode } = props;

  const [selectedRow, setSelectedRow] = useState([]);
  //FILTRO - CustomerDataGrid
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
  const [filterData, setFilterData] = useState({ ...initialFilter });
  const [
    ifThereAreNoChangesLoadFromStorage,
    setIfThereAreNoChangesLoadFromStorages,
  ] = useState(true);

  // ------------------------------
  // CustomDataGrid
  // ------------------------------
  const [isActiveFilters, setIsActiveFilters] = useState(false);

  const transformData = {
    FechaProgramadaDesde: (rawValue) => convertCustomDateTimeString(rawValue),
    FechaProgramadaHasta: (rawValue) => convertCustomDateTimeString(rawValue),
  }
  const reverseTransformData = {
    FechaProgramadaDesde: (value) => convertStringToDate(value),
    FechaProgramadaHasta: (value) => convertStringToDate(value),
  }

  //agregar
  function aceptar() {
    let dataSelected = [];
    if (selectionMode === "row" || selectionMode === "single") {
      let getData = getDataTempLocal('selectRowData');
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

  function onSelectionChanged(e) {
    //Seleccion multiple
    setSelectedRow(e.selectedRowsData);
  }

  // const onRowDblClick = (evt) => {
  //   if (evt.rowIndex === -1) return;
  //   if (selectionMode === "row" || selectionMode === "single") {
  //     if (isNotEmpty(evt.data)) {
  //       props.agregar([{ ...evt.data }]);
  //       props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
  //     }
  //   }
  // };

  const onRowDblClick = (evt) => {
    if (evt.rowIndex === -1) return;
    if (selectionMode === "row" || selectionMode === "single") {
      if (isNotEmpty(evt.data)) {
        props.selectData([{ ...evt.data }]);
      }
    }
  };

  const seleccionarRegistro = (evt) => {
    if (!customDataGridIsBusy) {
      if (evt.rowIndex === -1) return;
      if (selectionMode === "row" || selectionMode === "single") {
        if (isNotEmpty(evt.row.data)) setDataTempLocal('selectRowData', evt.row.data);
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


  const renderDataGrid = ({ gridRef, dataSource }) => {
    return (
      <DataGrid
        ref={gridRef}
        dataSource={dataSource}
        showBorders={true}
        focusedRowEnabled={true}
        onFocusedRowChanged={seleccionarRegistro}
        keyExpr="RowIndex"
        onCellPrepared={onCellPrepared}
        repaintChangesOnly={true}
        onSelectionChanged={(e => onSelectionChanged(e))}
        onRowDblClick={onRowDblClick}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
      >
        <FilterRow visible={true} showOperationChooser={false} />
        <Selection mode={selectionMode} />
        <HeaderFilter visible={false} />
        <FilterPanel visible={false} />
         {(selectionMode != "multiple") && (
          <Column
            dataField="RowIndex"
            caption="#"
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"5%"}
            alignment={"center"}
          />
        )} 
        <Column dataField="IdPersona" 
        caption={intl.formatMessage({ id: "COMMON.CODE" })}
         />
        <Column dataField="NombreCompleto"
         caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
         allowSorting={true} 
         allowFiltering={true}
          />
        <Column dataField="Documento"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}
          allowSorting={true} 
          allowFiltering={true} 
         />
        <Column dataField="NumeroLicencia" 
        caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.LICENSE" })}
        allowSorting={true} 
        allowFiltering={true} 
        />
        <Column dataField="Activo" dataType="boolean"   caption={intl.formatMessage({ id: "COMMON.ACTIVE" })}  allowSorting={true} allowFiltering={false} />
      </DataGrid>
    );
  };

  const keysToGenerateFilter = [
    'IdCliente',
    'IdPersona',
    'NombreCompleto',
    'Documento',
    'NumeroLicencia',
    'Activo'
];

  return (
    <>
      <Popup
        visible={props.showPopup.isVisiblePopUp}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={"600px"}
        width={"650px"}
        title={(intl.formatMessage({ id: "ACTION.SEARCH" }) +" "+ intl.formatMessage({ id: "ACCESS.VEHICLE.MARK.DRIVER" })).toUpperCase()}
        onHiding={() => props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)}
      >
        
        <Portlet>

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
            // storedStateTimeout={{ enabled: true, timeout: 12000 }}
            //GRID
            uniqueId={props.uniqueId}
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
            initialLoadOptions={{ currentPage: 1, pageSize: 15, sort: { column: "NombreCompleto", order: "asc" }, }}
            summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW", })} {0} de {1} `}
            // CUSTOM FILTER
            titleCustomFilter='Datos a consultar'
            visibleCustomFilter={isActiveFilters}
            //renderFormContentCustomFilter={renderFormContentCustomFilter}
            keysToGenerateFilter={keysToGenerateFilter}
            filterData={filterData}
            transformData={transformData}
            reverseTransformData={reverseTransformData}
            // PAGINATION
            paginationSize='lg'
            // EVENTS
            onLoading={() => setCustomDataGridIsBusy(true)}
            onError={() => setCustomDataGridIsBusy(false)}
            onLoaded={() => setCustomDataGridIsBusy(false)}

            filterRowSize="sm"

          />
        </Portlet>
      </Popup>
    </>
  );
};

TransporteChoferBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
};
TransporteChoferBuscar.defaultProps = {
  showButton: true,
  selectionMode: "row", //['multiple', 'row']
  uniqueId: "AdministracionPersonasBuscar",
};
export default injectIntl(TransporteChoferBuscar);

