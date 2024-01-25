import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl"; //Multi-idioma
import { Button } from "devextreme-react";
import {
  Portlet,
  PortletHeaderPopUp,
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
import CustomDataGrid from "./CustomDataGrid";
import { forceLoadTypes } from "./CustomDataGrid/CustomDataGridHelper";
import { storeListar as loadUrl } from "../../api/sistema/entidadDato.api";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
import { Item, GroupItem } from "devextreme-react/form";

export const initialFilter = {
  IdEntidad: "",
  IdDato: "",
  Dato:""
}; 

const AcreditacionPerfilEntidadDatoBuscar = (props) => {
  const { intl, selectionMode } = props;
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
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdPerfil, IdDivisionPerfil, });
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages,] = useState(true);
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

  function onSelectionChanged(e) {
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
  };


  const seleccionarRegistro = (evt) => {
    if (!customDataGridIsBusy) {
      if (selectionMode === "row" || selectionMode === "single") {
        if (isNotEmpty(evt.row.data)) setDataTempLocal('selectRowData', evt.row.data);
      }
    }
  };

  const hidePopover = () => {
    props.showPopup.setisVisiblePopUp(false);
    props.setModoEdicion(false);
  }


  useEffect(() => {

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

  useEffect(() => {
    if (props.filtro) {
      const { IdPerfil, IdEntidad } = props.filtro;
      dataSource.loadDataWithFilter({ data: { IdPerfil, IdEntidad } });
    }
  }, [props.filtro]);

  //-CustomerDataGrid-Filter
  const keysToGenerateFilter = [
    "IdEntidad",
    "IdDato",
    "Dato",
    "Entidad",
    "IdPerfil"
  ];
  //-CustomerDataGrid-DataGrid

  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (

      <GroupItem colCount={11} colSpan={10} labelLocation="top">

      </GroupItem>
    );
  }
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

        <Column
          dataField="IdDato"
          caption={intl.formatMessage({ id: "COMMON.CODE" })}
          allowSorting={true}
          allowHeaderFiltering={false}
        />
        <Column
          dataField="Dato"
          caption={intl.formatMessage({ id: "COMMON.DESCRIPTION" })}
          allowSorting={true}
          allowHeaderFiltering={false}
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
        height={"700px"}
        width={"650px"}
        title={(
          intl.formatMessage({ id: "ACTION.SEARCH" }) +
          " " +
          intl.formatMessage({ id: "ACCREDITATION.PROFILE.ENTITY.DATA" })
        ).toUpperCase()}
          onHiding ={hidePopover} 
        
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
                  {/* &nbsp;
                  <Button
                  icon="refresh"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                  disabled={customDataGridIsBusy}
                  onClick={resetLoadOptions}
                  /> */}
                  &nbsp;
                  <Button
                  icon="fa fa-times-circle"
                  type="normal"
                  hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                  onClick={props.cancelarEdicion}
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
            sendToServerOnlyIfThereAreChanges={false}
            // ifThereAreNoChangesLoadFromStorage={ ifThereAreNoChangesLoadFromStorage}
            ifThereAreNoChangesLoadFromStorage={ true}
            caseSensitiveWhenCheckingForChanges={true}
            uppercaseFilterRow={true}
            initialLoadOptions={{
              currentPage: 1,
              pageSize: 15,
              sort: { column: "Dato", order: "asc" },
            }}
            filterRowSize="sm"
            summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW", })} {0} de {1} `}
            // CUSTOM FILTER
            visibleCustomFilter={true}
            renderFormContentCustomFilter={renderFormContentCustomFilter}

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

AcreditacionPerfilEntidadDatoBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
};
AcreditacionPerfilEntidadDatoBuscar.defaultProps = {
  showButton: true,
  selectionMode: "row", //['multiple', 'row']
  uniqueId: "AcreditacionPerfilEntidadDatoBuscar",
};
export default injectIntl(AcreditacionPerfilEntidadDatoBuscar);
