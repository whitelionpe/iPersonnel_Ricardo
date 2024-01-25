import React, { Fragment, useEffect, useState } from 'react';
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import {
  Portlet,
  PortletBody,
  // PortletHeader,
  PortletHeaderToolbar,
  PortletHeaderPopUp,
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
  Button as ColumnButton
} from "devextreme-react/data-grid";
import { Popup } from "devextreme-react/popup";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import CustomDataGrid from "../components/CustomDataGrid";
import { forceLoadTypes } from "../components/CustomDataGrid/CustomDataGridHelper";
import { storeListar as loadUrl } from "../../api/asistencia/horario.api";

import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
import AsistenciaDetalleBuscar from "../../partials/components/AsistenciaDetalleBuscar";
import { obtenerTodos as obtenerDetalleHorario } from "../../api/asistencia/horarioDia.api";

export const initialFilter = {
  IdCliente: "",
  IdDivision: "",
  IdCompania: "",
  Activo: "S",
};

const AsistenciaHorarioBuscar = (props) => {
  const { intl, selectionMode, setLoading } = props;

  //console.log("AsistenciaHorarioBuscar|props:",props);

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
  const { IdCompania } = props.filtro;
  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdDivision, IdCompania: IdCompania });
  const [
    ifThereAreNoChangesLoadFromStorage,
    setIfThereAreNoChangesLoadFromStorages,
  ] = useState(true);
  //-CustomerDataGrid-Variables-end->

  const [isVisiblePopUpHorarioDia, setisVisiblePopUpHorarioDia] = useState(false);
  const [listarPopUpHorarioDias, setListarPopUpHorarioDias] = useState([]);



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


  function onCellPreparedSemanal(e) {
    const { Semanal } = e.data;
    return (

      <div>
        { Semanal === "S" && (
          <span
            title={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.WEEKLY" })}
          >
            <i className="fas fa-circle  text-success icon-10x" ></i>
          </span>
        )}
      </div>

    );

  }


  //-CustomerDataGrid-UseEffect-ini->
  useEffect(() => {
    // console.log("useEffect|1");
    if (ifThereAreNoChangesLoadFromStorage)
      setIfThereAreNoChangesLoadFromStorages(false);

  }, [ifThereAreNoChangesLoadFromStorage]);

  useEffect(() => {
    // console.log("useEffect|2");
    if (refreshData) {
      refresh();
      setRefreshData(false);

    }
  }, [refreshData]);

  useEffect(() => {
    //  console.log("useEffect|3");
    if (props.filtro) {
      const { IdCliente, IdCompania } = props.filtro;
      //console.log("useEffect|3:IdCliente:", IdCliente);
      dataSource.loadDataWithFilter({ data: { IdCliente, IdCompania } });
    }
  }, [props.filtro]);


  //-CustomerDataGrid-Filter
  const keysToGenerateFilter = [
    "IdCliente",
    "IdDivision",
    "IdCompania",
    "IdHorario",
    "Horario",
    "Activo",
  ];
  //-CustomerDataGrid-DataGrid

  /* const obtenerSemanal = rowData => {
    return rowData.Semanal === "S";
  }; */


  //POPUP DETALLE HORARIO***************************************************************/
  const personaHorarioDetalle = async (evt) => {
    //debugger;
    setLoading(true);
    await obtenerDetalleHorario({
      IdCliente: IdCliente,
      IdDivision: IdDivision,
      IdCompania: evt.row.data.IdCompania,
      IdHorario: evt.row.data.IdHorario
    }).then(data => {
      setListarPopUpHorarioDias(data);
      setisVisiblePopUpHorarioDia(true);
      //console.log("obtenerDetalleHorario", obtenerDetalleHorario);
    }).finally(() => { setLoading(false) });

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
        <Column dataField="IdCompania" visible={false} />
        <Column dataField="Compania" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" })} visible={false} />
        <Column dataField="IdHorario" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"20%"} allowHeaderFiltering={false} allowSorting={true} alignment={"left"} />
        <Column dataField="Horario" caption={intl.formatMessage({ id: "ACCESS.SCHEDULE.SCHEDULE" })} width={"40%"} allowHeaderFiltering={false} allowSorting={true} alignment={"left"} />
        <Column dataField="Regimen" caption={intl.formatMessage({ id: "ADMINISTRATION.REGIME" })} width={"20%"} allowHeaderFiltering={false} allowSorting={true} alignment={"left"} />
        {/* <Column dataField="Semanal" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.WEEKLY" })} calculateCellValue={obtenerSemanal} allowHeaderFiltering={false} allowSorting={false} allowFiltering={false} width={"20%"} /> */}
        <Column dataField="Semanal" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.WEEKLY" })} cellRender={onCellPreparedSemanal} allowHeaderFiltering={false} allowSorting={false} allowFiltering={false} alignment={"center"} width={"20%"} />
        <Column type="buttons" visible={props.showButtons} width={"10%"} >
          <ColumnButton icon="clock" hint={intl.formatMessage({ id: "ASSISTANCE.PERSON.SCHEDULE.VIEW", })} width={"10%"} alignment={"left"} onClick={personaHorarioDetalle} />
        </Column>

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
        width={"800px"}
        title={(
          intl.formatMessage({ id: "ACTION.SEARCH" }) +
          " " +
          intl.formatMessage({ id: "ACCESS.SCHEDULE.SCHEDULE" })
        ).toUpperCase()}
        onHiding={() =>
          props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)
        }
      >
        {/* className="kt-portlet__head" */}
        <Portlet >
          <PortletHeaderPopUp
            title={""}
            toolbar={
              <PortletHeaderToolbar>
                &nbsp;
                      <Button
                  icon="todo"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.ACCEPT" })}
                  onClick={aceptar}
                  useSubmitBehavior={true}
                  disabled={customDataGridIsBusy}
                  style={{ alignment: "left", padding: "0px" }}
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

          {/* <PortletHeader
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
            /> */}

          {/* <PortletBody > */}
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
              sort: { column: "Horario", order: "asc" },
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

      {/*POPUP DETALLE HORARIO------------------------------ */}
      <AsistenciaDetalleBuscar
        listDetalle={listarPopUpHorarioDias}
        showPopup={{ isVisiblePopUp: isVisiblePopUpHorarioDia, setisVisiblePopUp: setisVisiblePopUpHorarioDia }}
        cancelar={() => setisVisiblePopUpHorarioDia(false)}
        showButton={false}
      />

    </>
  );
};

AsistenciaHorarioBuscar
  .propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
};
AsistenciaHorarioBuscar
  .defaultProps = {
  showButton: false,
  selectionMode: "row", //['multiple', 'row','single]
  uniqueId: "asistenciaHorarios",
};
export default injectIntl(AsistenciaHorarioBuscar);
