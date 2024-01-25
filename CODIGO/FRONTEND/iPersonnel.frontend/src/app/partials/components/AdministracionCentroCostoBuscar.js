import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";//Multi-idioma
import { Button } from "devextreme-react";
import { Portlet, PortletHeaderPopUp, PortletHeaderToolbar } from "../content/Portlet";
import { getDataTempLocal, isNotEmpty, setDataTempLocal } from "../../../_metronic";
import { handleInfoMessages } from "../../store/ducks/notify-messages";
import { DataGrid, Column, Paging, Pager, FilterRow, HeaderFilter, FilterPanel, Selection, Editing, } from "devextreme-react/data-grid";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";

//:: CUSTOM DATAGRID    ::::::::::::::::::::::::::::::::::::::::::::::::::::

import { useSelector } from "react-redux";

import CustomDataGrid from "../components/CustomDataGrid";
import { forceLoadTypes } from "../components/CustomDataGrid/CustomDataGridHelper";
import { storeListar as loadUrl } from "../../api/administracion/centroCosto.api";

import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";

export const initialFilter = {
  Activo: "S",
  IdCliente: "",
  IdCentroCosto: "",
  FlRepositorio: "1",
  IdUnidadOrganizativa: ""
};

const AdministracionCentroCostoBuscar = props => {
  const { intl, selectionMode } = props;
  const { IdCliente } = useSelector((state) => state.perfil.perfilActual);
  const [selectedRow, setSelectedRow] = useState([]);

  //:: CUSTOM DATAGRID    ::::::::::::::::::::::::::::::::::::::::::::::::::::

  //FILTRO- CustomerDataGrid
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({
    store: new ArrayStore({ data: [], key: "IdCentroCosto" }),
    reshapeOnPush: false,
  });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();


  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const { IdUnidadOrganizativa,FlRepositorio }  = props.Filtros
  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente,IdUnidadOrganizativa : isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa:""  ,FlRepositorio : isNotEmpty(FlRepositorio) ? FlRepositorio:""  });
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages,] = useState(true);

  const keysToGenerateFilter = [
    "IdCliente",
    "IdCentroCosto",
    "CentroCosto",
    "Activo",
    "FlRepositorio",
    "IdUnidadOrganizativa"
  ];

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

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
      props.selectData(dataSelected);
      props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
    } else {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }));
    }

  }

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Estado === 'INACTIVO') {
        e.cellElement.style.color = 'red';
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

  //:: CUSTOM DATAGRID    ::::::::::::::::::::::::::::::::::::::::::::::::::::
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
    if (props.Filtros) {
      dataSource.loadDataWithFilter({ data: { ...props.Filtros } });
    }
  }, [props.Filtros]);


  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


  //:: CUSTOM DATAGRID    ::::::::::::::::::::::::::::::::::::::::::::::::::::
  const renderDataGrid = ({ gridRef, dataSource }) => {
    return (
      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="IdCentroCosto"
        onCellPrepared={onCellPrepared}
        repaintChangesOnly={true}
        onRowDblClick={onRowDblClick}
        onFocusedRowChanged={seleccionarRegistro}
        showButton={true}
        onSelectionChanged={(e => onSelectionChanged(e))}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}

      >
        <Editing mode="cell" allowUpdating={true} >
        </Editing>

        <Selection mode={props.selectionMode} />
        <FilterRow visible={true} />
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
        <Column dataField="IdCentroCosto"
          caption={intl.formatMessage({ id: "COMMON.CODE" })}
          width={"20%"}
          editorOptions={false}
          allowEditing={false}
          alignment={"center"} allowHeaderFiltering={false} allowSorting={true} />
        <Column dataField="CentroCosto"
          caption={intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.COSTCENTER" })}
          width={"70%"}
          editorOptions={false}
          allowEditing={false}
          allowHeaderFiltering={false} allowSorting={true} />
        <Paging defaultPageSize={18} />
        <Pager showPageSizeSelector={false} />

      </DataGrid>
    );
  };
  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


  return (
    <>
      <Popup
        visible={props.showPopup.isVisiblePopUp}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={"600px"}
        width={"600px"}
        title={(intl.formatMessage({ id: "ACTION.SEARCH" }) + ' ' + intl.formatMessage({ id: "ADMINISTRATION.PERSON.COSTCENTER" })).toUpperCase()}
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
                  disabled={customDataGridIsBusy}
                /> &nbsp;
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
            ifThereAreNoChangesLoadFromStorage={ifThereAreNoChangesLoadFromStorage}
            caseSensitiveWhenCheckingForChanges={true}
            uppercaseFilterRow={true}
            initialLoadOptions={{
              currentPage: 1,
              pageSize: 15,
              sort: { column: "IdCentroCosto", order: "asc" },
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

AdministracionCentroCostoBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
  contratista: PropTypes.string
};
AdministracionCentroCostoBuscar.defaultProps = {
  showButton: false,
  selectionMode: "row",
  uniqueId: "administracionCentroCosto",
  contratista: ""

};
export default injectIntl(AdministracionCentroCostoBuscar);
