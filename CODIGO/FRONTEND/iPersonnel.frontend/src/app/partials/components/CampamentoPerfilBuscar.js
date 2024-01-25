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
import CustomDataGrid from "../components/CustomDataGrid";
import { forceLoadTypes } from "../components/CustomDataGrid/CustomDataGridHelper";
import { storeListarPerfil as loadUrl } from "../../api/campamento/perfil.api";

import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";

export const initialFilter = {

  IdCliente: "1",
  Perfil: "",
  Activo: "S",
};

const CampamentoPerfilBuscar = (props) => {
  //console.log("CampamentoPerfilBuscar => props:",props);
  const { intl, perfil } = props;
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
    //const { IdCliente, IdPersona, Documento } = selectedRow;
    let dataSelected = [];
    if (props.selectionMode === "row" || props.selectionMode === "single") {
      let getData = getDataTempLocal('selectRowData');
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
      if (props.selectionMode === "row" || props.selectionMode === "single") {
        if (isNotEmpty(evt.row.data)) setDataTempLocal('selectRowData', evt.row.data);
      }
    }
  }

  
  function onSelectionChanged(e) {
    setSelectedRow(e.selectedRowsData);
  }

  const onRowDblClick = (evt) => {
    if (evt.rowIndex === -1) return;
    if (props.selectionMode === "row" || props.selectionMode === "single") {
      if (isNotEmpty(evt.data)) {
        //console.log(evt.data);
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
    if (perfil) {
      dataSource.loadDataWithFilter({ data: { Perfil: perfil } });
    }
  }, [perfil]);



  //-CustomerDataGrid-Filter
  const keysToGenerateFilter = [
    "IdCliente",
    "IdDivision",
    "IdPerfil",
    "Perfil",
    "Activo",
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
        visible={props.showPopup.isVisiblePopUp}
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
          props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)
        }
      >
        <Portlet>
        {/*   {props.showButton && ( */}
            <PortletHeaderPopUp
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
          {/* )}
          {!props.showButton && (
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
                  &nbsp;
                </PortletHeaderToolbar>
              }
            />
          )} */}

          {/* <PortletBody> */}

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

CampamentoPerfilBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string
};
CampamentoPerfilBuscar.defaultProps = {
  showButton: false,
  selectionMode: "row", //['multiple', 'row','single]
  uniqueId: "CampamentoPerfilBuscar"
};
export default injectIntl(CampamentoPerfilBuscar);
