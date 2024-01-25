import React, { useEffect, useState } from 'react';
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { Portlet, PortletHeader, PortletHeaderToolbar, } from "../content/Portlet";
import { isNotEmpty } from "../../../_metronic";
import { handleInfoMessages } from "../../store/ducks/notify-messages";
import { TreeList, Column, FilterRow, HeaderFilter, FilterPanel, Selection, } from 'devextreme-react/tree-list';
import { Popup } from "devextreme-react/popup";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
//-CustomerDataGrid-Import>
import CustomDataGrid from "../components/CustomDataGrid";
import { forceLoadTypes } from "../components/CustomDataGrid/CustomDataGridHelper";
import { storeListar as loadUrl } from "../../api/campamento/campamento.api"

import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";

export const initialFilter = {
  Activo: "S",
  IdCliente: "",
  IdDivision: "",
  IdCampamento: "",
  Campamento: "",
};



const CampamentoCampamentoBuscar = (props) => {
  const { intl } = props;

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
  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdDivision });
  const [
    ifThereAreNoChangesLoadFromStorage,
    setIfThereAreNoChangesLoadFromStorages,
  ] = useState(true);
  //-CustomerDataGrid-Variables-end->

  function aceptar() {
    if (selectedRow.length > 0) {
      props.selectData(selectedRow);
      props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
    } else {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }));
    }
  }


  function onCellPrepared(e) {
    if (e.rowType === "data") {
      if (e.data.Activo === "N") {
        e.cellElement.style.color = "red";
      }
    }
  }

  const seleccionarRegistro = (evt) => {
    if (props.selectionMode === "row" || props.selectionMode === "single") {
      if (isNotEmpty(evt.data)) setSelectedRow([{ ...evt.data }]);
    }
  };

  const onRowDblClick = (evt) => {
    if (evt.rowIndex === -1) return;
    if (props.selectionMode === "row" || props.selectionMode === "single") {
      if (isNotEmpty(evt.data)) {
        props.selectData([{ ...evt.data }]);
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
    console.log("inicia carga de filtros:", IdCliente, IdDivision);
    dataSource.loadDataWithFilter({ data: { IdCliente, IdDivision } });
  }, []);

  // useEffect(() => {
  //     debugger;
  //     console.log("inicia carga de filtros:", IdCliente, IdDivision);
  //     dataSource.loadDataWithFilter({ data: { IdCliente, IdDivision } });
  // }, [props.filtros]);

  //-CustomerDataGrid-Filter
  const keysToGenerateFilter = [
    "IdCliente",
    "IdDivision",
    "IdCampamento",
    "Campamento",
    "Activo",
  ];
  //-CustomerDataGrid-DataGrid
  const renderDataGrid = ({ gridRef, dataSource }) => {
    return (
      <TreeList
        dataSource={dataSource}
        ref={gridRef}
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="RowIndex"
        onCellPrepared={onCellPrepared}
        repaintChangesOnly={true}
        onRowDblClick={onRowDblClick}
        onFocusedRowChanged={seleccionarRegistro}
      >
        <FilterRow visible={true} showOperationChooser={false} />
        <Selection mode={props.selectionMode} />
        <HeaderFilter visible={false} />
        <FilterPanel visible={false} />

        <Column
          dataField="IdCampamento"
          caption={intl.formatMessage({ id: "COMMON.CODE" })}
          width={"20%"}
          allowHeaderFiltering={false}
          allowSorting={true}
          alignment={"center"}
        />
        <Column
          dataField="Campamento"
          caption={intl.formatMessage({ id: "COMMON.DESCRIPTION" })}
          width={"80%"}
          allowHeaderFiltering={false}
          allowSorting={true}
        />
      </TreeList>
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
        title={(
          intl.formatMessage({ id: "ACTION.SEARCH" }) +
          " " +
          intl.formatMessage({ id: "CAMP.PROFILE.MENU" })
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

          {/* </PortletBody> */}
        </Portlet>
      </Popup>
    </>
  );
};

CampamentoCampamentoBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
};
CampamentoCampamentoBuscar.defaultProps = {
  showButton: false,
  selectionMode: "row", //['multiple', 'row','single]
  uniqueId: "CampamentoCampamentoBuscar",
};



export default injectIntl(CampamentoCampamentoBuscar);
