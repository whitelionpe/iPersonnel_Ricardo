import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";//Multi-idioma
import { Button } from "devextreme-react";
import { Portlet, PortletHeader, PortletHeaderToolbar } from "../content/Portlet";

import { getDataTempLocal, isNotEmpty, setDataTempLocal } from "../../../_metronic";
import { handleInfoMessages } from "../../store/ducks/notify-messages";
import { DataGrid, Column, FilterRow, HeaderFilter, FilterPanel, Selection } from "devextreme-react/data-grid";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";
import { useSelector } from "react-redux";

//-CustomerDataGrid-Import>
import CustomDataGrid from "../components/CustomDataGrid";
import { forceLoadTypes } from "../components/CustomDataGrid/CustomDataGridHelper";
import { storeFiltrar as loadUrl } from "../../api/sistema/repositorio.api";

import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";

export const initialFilter = {

  IdCliente: "",
  IdRepositorio: "",
  Repositorio: "",
  Activo: "S",
};

const SistemaRepositorioBuscar = props => {
  const { intl, selectionMode } = props;
  const [selectedRow, setSelectedRow] = useState([]);
  const { IdCliente } = useSelector((state) => state.perfil.perfilActual);

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
  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente });
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
        if (isNotEmpty(evt.row.data)) setDataTempLocal('selectRowData', evt.row.data);
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
  }, [refreshData]);

 
   /*  useEffect(() => {
      if (props.filtro) {
        const {  Repositorio } = props.filtro;
        dataSource.loadDataWithFilter({ data: {  Repositorio } });
      }
    }, [props.filtro]); */


  //-CustomerDataGrid-Filter
  const keysToGenerateFilter = [
    'IdCliente',
    'IdRepositorio',
    'Repositorio',
    'Descripcion',
    'Activo'];


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
        <Column dataField="IdRepositorio"
          caption={intl.formatMessage({ id: "ACCESS.PERSON.GRUPO.CODE" })}
          editorOptions={false} allowEditing={false}
          alignment={"center"} visible={false} />
        <Column dataField="Repositorio"
          caption={intl.formatMessage({ id: "SYSTEM.REPOSITORY" })}
          editorOptions={false} allowEditing={false}
          width={"50%"} />
        <Column dataField="Descripcion"
          caption={intl.formatMessage({ id: "COMMON.DESCRIPTION" })}
          editorOptions={false} allowEditing={false}
          width={"36%"} />
        <Column dataField="TamanoMax"
          caption={intl.formatMessage({ id: "SYSTEM.REPOSITORY.SIZE" })}
          editorOptions={false} allowEditing={false}
          width={"8%"} 
          alignment={"center"} />
        <Column dataField="UnidadMedida"
          caption={intl.formatMessage({ id: "SYSTEM.REPOSITORY.UNIT" })}
          editorOptions={false} allowEditing={false}
          width={"6%"} 
          alignment={"center"} />

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
        width={"700px"}
        title={(intl.formatMessage({ id: "ACTION.SEARCH" }) + ' ' + intl.formatMessage({ id: "SYSTEM.REPOSITORY" })).toUpperCase()}
        onHiding={() => props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)}
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
            initialLoadOptions={{ currentPage: 1, pageSize: 15, sort: { column: 'Descripcion', order: 'asc' } }}
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

SistemaRepositorioBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
  filtro: PropTypes.object,


};
SistemaRepositorioBuscar.defaultProps = {
  showButton: false,
  selectionMode: "row", //['multiple', 'row','single]
  uniqueId: "sistemaRepositorioBuscar",
  //filtro: { IdDivision: "", IdUnidadOrganizativa: "", IdFuncion: "", IdTipoPosicion: "" },


};
export default injectIntl(SistemaRepositorioBuscar);
