import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl"; //Multi-idioma
import { Button } from "devextreme-react";
import {
  Portlet,
  PortletHeader,
  PortletHeaderToolbar,
  PortletHeaderPopUp
} from "../content/Portlet";

import { getDataTempLocal, isNotEmpty, setDataTempLocal } from "../../../_metronic";
import { Item, GroupItem } from "devextreme-react/form";
// import { handleInfoMessages } from "../../store/ducks/notify-messages";
// import { DoubleLinePersona as DoubleLineLabel } from "../content/Grid/DoubleLineLabel";
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
import { storeListar as loadUrl } from "../../api/campamento/camaExclusiva.api";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";

import { obtenerTodos as listarCampamentos } from "../../api/campamento/campamento.api";
import { listar as listarServicios } from "../../api/campamento/servicio.api";

import SimpleDropDownBoxGrid from '../components/SimpleDropDownBoxGrid/SimpleDropDownBoxGrid';
import { handleInfoMessages } from "../../store/ducks/notify-messages";

export const initialFilter = {
  IdCliente: "",
  IdDivision: "",
  IdCampamento: "",
  Servicios: "",
  TipoModulo: "",
  Modulo: "",
  TipoHabitacion: "",
  Habitacion: "",
  Cama: "",
  Activo: "S"
};

const CampamentoCamaExclusivaBuscar = (props) => {
  const { intl, IdCampamento, selectionMode } = props;

  const [selectedRow, setSelectedRow] = useState([]);
  const [campamentos, setCampamentos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [servicioSeleccionados, setServiciosSeleccionados] = useState([]);
  // console.log("CampamentoCamaExclusivaBuscar,IdCampamento:",IdCampamento);

  const { IdCliente, IdDivision, IdPerfil } = useSelector(state => state.perfil.perfilActual);
  const [isActiveFilters, setIsActiveFilters] = useState(false);

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
  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdCampamento, IdDivision, });
  const [
    ifThereAreNoChangesLoadFromStorage,
    setIfThereAreNoChangesLoadFromStorages,
  ] = useState(true);
  //-CustomerDataGrid-Variables-end->

  async function cargar() {

    let [
      tmp_campamentos,
      tmp_Servicios] = await Promise.all([
        listarCampamentos({ IdCliente, IdDivision }),
        listarServicios({ IdCliente, IdDivision, numPagina: 0, tamPagina: 0 })])
        .finally(() => { });

    setCampamentos(tmp_campamentos);
    setServicios(tmp_Servicios.map(x => ({ IdServicio: x.IdServicio, Servicio: x.Servicio, Check: true })));

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

  function aceptar() {

    let dataSelected = [];
    if (selectionMode === "row" || selectionMode === "single") {
      let getData = getDataTempLocal('selectRowData');
      dataSelected = [{ ...getData }];
    } else {
      dataSelected = selectedRow;
    }

    if (dataSelected.length > 0) {
      props.agregar(dataSelected);
      props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
    } else {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }));
    }

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

  const seleccionarRegistro = (evt) => {
    if (!customDataGridIsBusy) {
      if (selectionMode === "row" || selectionMode === "single") {
        if (isNotEmpty(evt.row.data)) setDataTempLocal('selectRowData', evt.row.data);
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

  useEffect(() => {
    if (IdCampamento) {
      let strServicios = servicioSeleccionados.filter(x => x.Check).map(x => (x.IdServicio)).join('|');
      dataSource.loadDataWithFilter({ data: { IdCliente, IdDivision, IdCampamento, Servicios: strServicios } });
    }
  }, [IdCampamento]);


  useEffect(() => {
    let strServicios = servicioSeleccionados.filter(x => x.Check).map(x => (x.IdServicio)).join('|');
    if (strServicios) {
      dataSource.loadDataWithFilter({ data: { IdCliente, IdDivision, IdCampamento, Servicios: strServicios } });
    }
  }, [servicioSeleccionados]);


  //-CustomerDataGrid-Filter
  const keysToGenerateFilter = [
    "IdCliente",
    "IdDivision",
    "IdCampamento",
    "Servicios",
    "TipoModulo",
    "Modulo",
    "TipoHabitacion",
    "Habitacion",
    "Cama",
    "Activo"
  ];


  const renderFormContentCustomFilter = ({ getInstance }) => {

    return (
      <GroupItem>
        <GroupItem itemType="group" colCount={2} colSpan={2}>

          <Item
            dataField="Servicios"
          >
            <SimpleDropDownBoxGrid
              ColumnDisplay={"Servicio"}
              placeholder={"Select a value.."}
              SelectionMode="multiple"
              dataSource={servicios}
              Columnas={[{ dataField: "Servicio", caption: intl.formatMessage({ id: "CAMP.RESERVATION.SERVICES" }), width: '100%' }]}
              setSeleccionados={setServiciosSeleccionados}
              Seleccionados={servicioSeleccionados}
              pageSize={10}
              pageEnabled={true}
            />

          </Item>
        </GroupItem>
      </GroupItem>
    );
  }

  //-CustomerDataGrid-DataGrid
  const renderDataGrid = ({ gridRef, dataSource }) => {
    return (
      <>

        <Item
          dataField="Servicios"
        >
          <SimpleDropDownBoxGrid
            ColumnDisplay={"Servicio"}
            placeholder={"Select a value.."}
            SelectionMode="multiple"
            dataSource={servicios}
            Columnas={[{ dataField: "Servicio", caption: intl.formatMessage({ id: "CAMP.RESERVATION.SERVICES" }), width: '100%' }]}
            setSeleccionados={setServiciosSeleccionados}
            Seleccionados={servicioSeleccionados}
            pageSize={10}
            pageEnabled={true}
          />

        </Item>

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
            allowFiltering={true}
            allowHeaderFiltering={false}
            alignment={"center"}
            width={"20%"}
          >
            {/* <HeaderFilter dataSource={tipoDocumentoFilter} /> */}
          </Column>
          <Column
            dataField="Habitacion"
            caption={intl.formatMessage({ id: "CAMP.RESERVATION.ROOM" })}
            allowHeaderFiltering={false}
            width={"25%"}
            alignment={"center"}
          />
          <Column
            dataField="Cama"
            caption={intl.formatMessage({ id: "CAMP.RESERVATION.BED" })}

          />
          {/* </Column> */}
        </DataGrid>
      </>
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
        height={"650px"}
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

          <PortletHeaderPopUp
            title={""}
            toolbar={
              <PortletHeaderToolbar>
                <Button
                  icon="filter"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                  onClick={() => setIsActiveFilters(!isActiveFilters)}
                  disabled={customDataGridIsBusy}
                />
                &nbsp;
                <Button
                icon="todo" //fa fa-save
                type="default"
                hint={intl.formatMessage({ id: "ACTION.ACCEPT" })}
                onClick={aceptar}
                disabled={customDataGridIsBusy}
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
              sort: { column: "Cama", order: "asc" },
            }}
            filterRowSize="sm"
            summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW", })} {0} de {1} `}
            // FILTER OPTIONS
            visibleCustomFilter={isActiveFilters}
            renderFormContentCustomFilter={renderFormContentCustomFilter}
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

CampamentoCamaExclusivaBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
};
CampamentoCamaExclusivaBuscar.defaultProps = {
  showButton: true,
  selectionMode: "row", //['multiple', 'row']
  uniqueId: "camoanentoCamaExclusivaBuscar",
};
export default injectIntl(CampamentoCamaExclusivaBuscar);
