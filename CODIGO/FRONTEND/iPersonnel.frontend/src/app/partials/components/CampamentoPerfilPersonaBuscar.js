import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import {
  Portlet,
  PortletHeaderPopUp,
  PortletHeaderToolbar,
} from "../content/Portlet";
import { isNotEmpty, getDataTempLocal, setDataTempLocal } from "../../../_metronic";
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
import CustomDataGrid from "./CustomDataGrid";
import { forceLoadTypes } from "./CustomDataGrid/CustomDataGridHelper";
import { storeListarPerfil as loadUrl } from "../../api/campamento/personaPerfil.api";

import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";

export const initialFilter = {
  IdCliente: "1",
  Perfil: "",
  Activo: "S",
};

const CampamentoPerfilPersonaBuscar = ({
  intl,
  filtro,
  selectionMode,
  selectData,
  showPopup,
  uniqueId = "key_CampamentoPerfilPersonaBuscar"
}) => {
  // console.log("CampamentoPerfilPersonaBuscar => props:",props); 
  const { IdCliente, IdDivision } = useSelector((state) => state.perfil.perfilActual);
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
  const { IdPersona } = filtro;

  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdDivision, IdPersona: isNotEmpty(IdPersona) ? IdPersona : 0 });
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
      selectData(dataSelected);
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

  const seleccionarRegistro = (evt) => {
    if (!customDataGridIsBusy) {
      if (selectionMode === "row" || selectionMode === "single") {
        if (isNotEmpty(evt.row.data)) setDataTempLocal('selectRowData', evt.row.data);
      }
    }
  }

  function onSelectionChanged(e) {
    setSelectedRow(e.selectedRowsData);
  }

  const onRowDblClick = (evt) => {
    if (evt.rowIndex === -1) return;
    if (selectionMode === "row" || selectionMode === "single") {
      if (isNotEmpty(evt.data)) {
        selectData([{ ...evt.data }]);
        showPopup.setisVisiblePopUp(!showPopup.isVisiblePopUp);
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
    if (filtro) {
      const { IdPersona } = filtro;
      dataSource.loadDataWithFilter({ data: { IdPersona: IdPersona } });
    }
  }, [filtro]);

  //-CustomerDataGrid-Filter
  const keysToGenerateFilter = [
    "IdCliente",
    "IdDivision",
    "IdCompania",
    "IdPerfil",
    "Perfil",
    "IdPersona"
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
      >
        <FilterRow visible={true} showOperationChooser={false} />
        <Selection mode={selectionMode} />
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
          dataField="IdPerfil"
          caption={intl.formatMessage({ id: "COMMON.CODE" })}
          width={"20%"}
          allowHeaderFiltering={false}
          allowSorting={true}
          alignment={"center"}
        />
        <Column
          dataField="Perfil"
          caption={intl.formatMessage({ id: "ACCESS.PROFILE" })}
          width={"80%"}
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
        visible={showPopup.isVisiblePopUp}
        dragEnabled={false}
        closeOnOutsideClick={true}
        showTitle={true}
        height={"600px"}
        width={"600px"}
        title={(
          intl.formatMessage({ id: "ACTION.SEARCH" }) +
          " " +
          intl.formatMessage({ id: "ACCESS.PROFILE" })
        ).toUpperCase()}
        onHiding={() =>
          showPopup.setisVisiblePopUp(!showPopup.isVisiblePopUp)
        }
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

          <CustomDataGrid
            showLog={false}
            uniqueId={uniqueId}
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
              sort: { column: "Perfil", order: "asc" },
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
          />
        </Portlet>
      </Popup>
    </>
  );
};

CampamentoPerfilPersonaBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string
};
CampamentoPerfilPersonaBuscar.defaultProps = {
  showButton: false,
  selectionMode: "row", //['multiple', 'row','single]
  uniqueId: "CampamentoPerfilPersonaBuscar"
};
export default injectIntl(CampamentoPerfilPersonaBuscar);
