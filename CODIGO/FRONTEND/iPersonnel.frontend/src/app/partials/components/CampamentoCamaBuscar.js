import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl"; //Multi-idioma
import { Button } from "devextreme-react";
import {
  Portlet,
  PortletHeader,
  PortletHeaderToolbar,
} from "../content/Portlet";

import { getDataTempLocal, isNotEmpty, setDataTempLocal } from "../../../_metronic";
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
import { storeListar as loadUrl } from "../../api/campamento/cama.api";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";

export const initialFilter = {
  Activo: "S",
  IdCliente: "",
  IdDivision: ""
};

const CampamentoCamaBuscar = (props) => {
  const { intl, selectionMode } = props;
  const [selectedRow, setSelectedRow] = useState([]);

  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

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
  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdDivision });
  const [
    ifThereAreNoChangesLoadFromStorage,
    setIfThereAreNoChangesLoadFromStorages,
  ] = useState(true);
  //-CustomerDataGrid-Variables-end->


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
      props.agregar(dataSelected);
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
        if (isNotEmpty(evt.row.data)) setDataTempLocal('selectRowData', evt.row.data);
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
        props.agregar([{ ...evt.data }]);
        props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
      }
    }
  }

  useEffect(() => {
    cargar();
  }, []);

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

  //-CustomerDataGrid-Filter
  const keysToGenerateFilter = [
    "IdCliente",
    "TipoModulo",
    "Modulo",
    "TipoHabitacion",
    "Habitacion",
    "Cama",
    "IdCampamento",
    "IdPerfil",
    "IdServicio",
    "IdDivision",
    "IdModulo",
    "IdHabitacion",
    "IdCama",
    "Activo"
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

        <Column
          dataField="TipoModulo"
          caption={intl.formatMessage({ id: "CAMP.TYPEMODULE" })}
          allowHeaderFiltering={false}
          allowSorting={true}
          width={"20%"}
          alignment={"center"}
        />
        <Column
          dataField="Modulo"
          caption={intl.formatMessage({ id: "CAMP.MODULE" })}
          allowSorting={true}
          allowHeaderFiltering={false}
          width={"20%"}
        />
        <Column
          dataField="TipoHabitacion"
          caption={intl.formatMessage({ id: "CAMP.RESERVATION.ROOMTYPE" })}
          allowSorting={true}
          allowHeaderFiltering={false}
          width={"20%"}
        />
        <Column
          dataField="Habitacion"
          caption={intl.formatMessage({ id: "CAMP.RESERVATION.ROOM" })}
          allowSorting={true}
          allowHeaderFiltering={false}
          width={"20%"}
        />
        <Column
          dataField="Cama"
          caption={intl.formatMessage({ id: "CAMP.RESERVATION.BED" })}
          allowSorting={true}
          allowHeaderFiltering={false}
          width={"10%"}
        />

        <Column
          dataField="Activo"
          caption={intl.formatMessage({ id: "COMMON.STATE" })}
          width={"10%"}
        //visible={false}
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
        closeOnOutsideClick={false}
        showTitle={true}
        height={"600px"}
        width={"650px"}
        title={(
          intl.formatMessage({ id: "ACTION.SEARCH" }) +
          " " +
          intl.formatMessage({ id: "CAMP.BED_MANAGEMENT.BED" })
        ).toUpperCase()}
        onHiding={() =>
          props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)
        }
      >
        <Portlet>

          <PortletHeader
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
            initialLoadOptions={{
              currentPage: 1,
              pageSize: 15,
              sort: { column: "TipoModulo", order: "asc" },
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

CampamentoCamaBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
};
CampamentoCamaBuscar.defaultProps = {
  showButton: true,
  selectionMode: "row", //['multiple', 'row']
  uniqueId: "camasBuscar",
};
export default injectIntl(CampamentoCamaBuscar);
