import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
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
import CustomDataGrid from "../components/CustomDataGrid";
import { forceLoadTypes } from "../components/CustomDataGrid/CustomDataGridHelper";
import { storeListar as loadUrl } from "../../api/asistencia/justificacion.api";

import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";

export const initialFilter = {
  IdCliente: "",
  IdCompania: "",
  AplicaFuturo: "",
  Activo: "S",
};

const AsistenciaJustificacionBuscar = (props) => {
  const { intl, selectionMode, filtro, varIdCompania } = props;

  const { IdCliente } = useSelector((state) => state.perfil.perfilActual);
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
  //const { IdPersona, IdCompania } = props.filtro;
  // console.log("props.filtro:",props.filtro);

  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdCompania: isNotEmpty(varIdCompania) ? varIdCompania : "" });
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
      props.selectData(dataSelected);
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
        props.selectData([{ ...evt.data }]);
        props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
      }
    }
  }


  function onCellPreparedPorDia(e) {
    const { AplicaPorDia } = e.data;
    return (

      <div>
        { AplicaPorDia === "S" && (
          <span
            title={intl.formatMessage({ id: "COMMON.ACTIVE" })}
          >
            <i className="fas fa-circle  text-warning icon-10x" ></i>
          </span>
        )}
      </div>

    );

  }

  function onCellPreparedPorHora(e) {
    const { AplicaPorHora } = e.data;
    return (

      <div>
        { AplicaPorHora === "S" && (
          <span
            title={intl.formatMessage({ id: "COMMON.ACTIVE" })}
          >
            <i className="fas fa-circle  text-info icon-10x" ></i>
          </span>
        )}
      </div>

    );

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

  useEffect(() => {
    if (filtro) {
      const {IdCliente ,IdCompania, AplicaFuturo } = filtro;
      dataSource.loadDataWithFilter({ data: { IdCliente, IdCompania, AplicaFuturo } });
    }
  }, [filtro]);

  //-CustomerDataGrid-Filter
  const keysToGenerateFilter = [
    "IdCliente",
    "IdCompania",
    "IdJustificacion",
    "Justificacion",
    "Activo",
    "AplicaFuturo",
    "IdPersona",
    "AplicaPorDia",
    "AplicaPorHora",
    "RequiereObservacion"
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
          dataField="Compania"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" })}
          allowHeaderFiltering={false}
          allowSorting={true} alignment={"center"}
          visible={false}
        />
        <Column
          dataField="IdJustificacion"
          caption={intl.formatMessage({ id: "COMMON.CODE" })}
          width={"20%"} allowHeaderFiltering={false}
          allowSorting={true}
          alignment={"center"}
        />
        <Column
          dataField="Justificacion"
          caption={intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION" })}
          width={"55%"}
          allowHeaderFiltering={false}
          allowSorting={true} alignment={"left"}
        />
        <Column dataField="AplicaPorDia"
          caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY" })}
          cellRender={onCellPreparedPorDia}
          alignment={"center"}
          allowHeaderFiltering={false}
          allowSorting={false}
          allowFiltering={false}
          width={"10%"}
        />

        <Column dataField="AplicaPorHora"
          caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.HOUR" })}
          cellRender={onCellPreparedPorHora}
          alignment={"center"}
          allowHeaderFiltering={false}
          allowSorting={false}
          allowFiltering={false}
          width={"10%"}
        />
        {/* <Column
            dataField="IdCompania"
            visible={false}
          /> */}
      </DataGrid>
    );
  };

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
          intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION" })
        ).toUpperCase()}
        onHiding={() =>
          props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)
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
              sort: { column: "Justificacion", order: "asc" },
            }}
            filterRowSize="sm"
            summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}
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

AsistenciaJustificacionBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
  varIdCompania: PropTypes.string
};
AsistenciaJustificacionBuscar.defaultProps = {
  showButton: false,
  selectionMode: "row", //['multiple', 'row','single]
  uniqueId: "asistenciaJustificacion",
  varIdCompania: ""
};
export default injectIntl(AsistenciaJustificacionBuscar
);
