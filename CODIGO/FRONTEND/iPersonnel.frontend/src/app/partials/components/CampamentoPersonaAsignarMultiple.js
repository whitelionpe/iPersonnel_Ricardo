import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import {
  Portlet,
} from "../content/Portlet";

import { getDataTempLocal, isNotEmpty, listarCondicion, listarGrupo, setDataTempLocal } from "../../../_metronic";
import { Item, GroupItem } from "devextreme-react/form";
import { handleInfoMessages } from "../../store/ducks/notify-messages";
import { DoubleLinePersona as DoubleLineLabel, PersonaCondicionLabel } from "../content/Grid/DoubleLineLabel";
import {
  DataGrid,
  Column,
  Scrolling,
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
import { filtrarPersonas as loadUrl } from "../../api/campamento/reserva.api";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
import PersonaTextAreaPopup from './PersonaTextAreaPopup/PersonaTextAreaPopup';


export const initialFilter = {
  IdCliente: "",
  Personas: "",
};

const AccesoPersonaPerfilBuscar = (props) => {
  const { intl, selectionMode, condicion } = props;
  const [selectedRow, setSelectedRow] = useState([]);

  const { IdCliente, IdDivision, IdPerfil } = useSelector(state => state.perfil.perfilActual);
  const IdDivisionPerfil = useSelector(state => state.perfil.perfilActual.IdDivision);

  const [isVisiblePopupPersona, setIsVisiblePopupPersona] = useState(false);
  const [tipoGrupo, setGrupo] = useState([]);
  const [tipoCondicion, setCondicion] = useState([]);

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
  const [isActiveFilters, setIsActiveFilters] = useState(false);////
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdDivision, IdPerfil, IdDivisionPerfil });
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages,] = useState(true);
  //-CustomerDataGrid-Variables-end->


  async function cargarCombos() {

    let tipoGrupo = listarGrupo();
    let tipoCondicion = listarCondicion();

    setGrupo(tipoGrupo);
    setCondicion(tipoCondicion);

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
    //Seleccion multiple
    setSelectedRow(e.selectedRowsData);
  }

  //agregar
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
  }

  const selectPersonas = (data) => {

    if (isNotEmpty(data)) {
      let strPersonas = data.split('|').join(',');
      console.log(strPersonas);
      dataSource.loadDataWithFilter({ data: { Personas: strPersonas } });
    }
  }

  useEffect(() => {
    cargarCombos();
  }, []);

  useEffect(() => {
    if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage])


  useEffect(() => {
    if (refreshData) {
      refresh();
      setRefreshData(false);
    }
  }, [refreshData]);

  //-CustomerDataGrid-Filter
  const keysToGenerateFilter = [
    "IdCliente",
    "IdDivision",
    "IdPersona",
    "NombreCompleto",
    "Documento",
    "Compania",
    "Ruc",
    "Personas",
    "IdPerfil",
    "IdDivisionPerfil"
  ];


  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem colCount={3} labelLocation="top">

        <Item
          dataField="Personas"
          colSpan={2}
          label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.PERSONS" }) }}
          editorOptions={{
            readOnly: true,
            hoverStateEnabled: false,
            inputAttr: { 'style': 'text-transform: uppercase' },
            showClearButton: true,
            buttons: [{
              name: 'search',
              location: 'after',
              useSubmitBehavior: true,
              maxLength: 20,
              options: {
                stylingMode: 'text',
                icon: 'search',
                disabled: false,
                onClick: () => {
                  console.log("popup personas");
                  setIsVisiblePopupPersona(true);
                },
              }
            }]
          }}
        />

        <GroupItem itemType="group" >
          <div style={{ zIndex: +100, position: 'fixed', width: "94px", height: "83px", marginTop: "0px", marginLeft: "140px" }}>
            <Button
              icon="todo" //fa fa-save
              type="default"
              hint={intl.formatMessage({ id: "ACTION.ACCEPT" })}
              onClick={aceptar}
              useSubmitBehavior={true}
            />
            &nbsp;
            <Button
              icon="refresh" //fa fa-broom - //clearformat
              type="default"
              hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
              disabled={customDataGridIsBusy}
              onClick={resetLoadOptions}
            />
          </div>
        </GroupItem>

      </GroupItem>
    );
  }

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
        onRowDblClick={onRowDblClick}
        onFocusedRowChanged={seleccionarRegistro}
        onSelectionChanged={(e => onSelectionChanged(e))}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
      >
        <FilterRow visible={true} showOperationChooser={false} />
        <Selection mode={selectionMode} />

        {(selectionMode !== "multiple") && (
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
          dataField="IdPersona"
          caption={intl.formatMessage({ id: "COMMON.CODE" })}
          allowHeaderFiltering={false}
          allowSorting={true}
          width={"10%"}
          alignment={"center"}
        />
        <Column
          dataField="NombreCompleto"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
          allowSorting={true}
          allowHeaderFiltering={false}
          width={"35%"}
        />
        <Column
          dataField="Documento"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}
          allowHeaderFiltering={false}
          width={"15%"}
          alignment="center"
        />
        <Column
          dataField="Compania"
          caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" })}
          allowHeaderFiltering={false}
          allowSorting={true}
          width="25%"
        />
        <Column
          dataField="Ruc"
          caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.RUC" })}
          allowSorting={true}
          allowHeaderFiltering={false}
          width="15%"
          alignment="center"
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
        width={"800px"}
        title={(
          intl.formatMessage({ id: "ACTION.SEARCH" }) + " " + intl.formatMessage({ id: "ADMINISTRATION.PERSON" })
        ).toUpperCase()}
        onHiding={() =>
          props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)
        }
      >

        <Portlet>

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
              sort: { column: "NombreCompleto", order: "asc" },
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

      <PersonaTextAreaPopup
        isVisiblePopupDetalle={isVisiblePopupPersona}
        setIsVisiblePopupDetalle={setIsVisiblePopupPersona}
        obtenerNumeroDocumento={selectPersonas}
      />
    </>
  );
};

AccesoPersonaPerfilBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
  condicion: PropTypes.string
};
AccesoPersonaPerfilBuscar.defaultProps = {
  showButton: true,
  selectionMode: "row", //['multiple', 'row']
  uniqueId: "campamentoPersonasAsignarMultiple",
  condicion: "TRABAJADOR"
};
export default injectIntl(AccesoPersonaPerfilBuscar);
