import React, { useState } from "react";
import PersonaTextAreaPopup from "../../../../partials/components/PersonaTextAreaPopup/PersonaTextAreaPopup";
import {
  getDataTempLocal,
  isNotEmpty,
  setDataTempLocal
} from "../../../../../_metronic";
import { Popup } from "devextreme-react/popup";
import { Portlet } from "../../../../partials/content/Portlet";
import CustomDataGrid, {
  forceLoadTypes
} from "../../../../partials/components/CustomDataGrid";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
import { GroupItem, Item } from "devextreme-react/form";
import { storePersonaSinPerfil } from "../../../../api/campamento/personaPerfil.api";
import { Button, DataGrid } from "devextreme-react";
import {
  Column,
  FilterPanel,
  FilterRow,
  HeaderFilter,
  Selection
} from "devextreme-react/data-grid";
import { DoubleLinePersona } from "../../../../partials/content/Grid/DoubleLineLabel";
import { handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { useSelector } from "react-redux";

const PerfilPersonaMasivoBuscar = ({
  intl,
  showPopup,
  uniqueId = "PerfilPersonaMasivoBuscar",
  selectionMode = "multiple",
  agregar = () => {},
  filtro = {}
}) => {
  const [isVisiblePopupPersona, setIsVisiblePopupPersona] = useState(false);
  const [selectedRow, setSelectedRow] = useState([]);
  const keysToGenerateFilter = [
    "IdCliente",
    "NombreCompleto",
    "TipoDocumento",
    "Documento",
    "IdPerfil",
    "IdDivision",
    "Personas"
  ];
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  const IdDivision = useSelector(state => state.perfil.perfilActual.IdDivision);

  const filterData = {
    IdCompania: "",
    IdCliente,
    IdDivision,
    Personas: "",
    ...filtro
  };

  /************************************************** */
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({
    store: new ArrayStore({ data: [], key: "RowIndex" }),
    reshapeOnPush: false
  });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();
  const isFirstDataLoad = true;
  const [
    ifThereAreNoChangesLoadFromStorage,
    setIfThereAreNoChangesLoadFromStorages
  ] = useState(true);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  /************************************************** */

  const selectPersonas = data => {
    if (isNotEmpty(data)) {
      let strPersonas = data.split("|").join(",");
      dataSource.loadDataWithFilter({ data: { Personas: strPersonas } });
    }
  };

  function aceptar() {
    let dataSelected = [];
    if (selectionMode === "row" || selectionMode === "single") {
      let getData = getDataTempLocal("selectRowDataPersona");
      dataSelected = [{ ...getData }];
    } else {
      dataSelected = selectedRow;
    }

    if (dataSelected.length > 0) {
      agregar(dataSelected);
      showPopup.setisVisiblePopUp(!showPopup.isVisiblePopUp);
    } else {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }));
    }
  }

  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem colCount={11} labelLocation="top">
        <GroupItem itemType="group" colSpan={7}>
          <Item
            dataField="Personas"
            label={{
              text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.PERSONS" })
            }}
            editorOptions={{
              readOnly: true,
              hoverStateEnabled: false,
              inputAttr: { style: "text-transform: uppercase" },
              showClearButton: true,
              buttons: [
                {
                  name: "search",
                  location: "after",
                  useSubmitBehavior: true,
                  maxLength: 20,
                  options: {
                    stylingMode: "text",
                    icon: "search",
                    disabled: false,
                    onClick: () => {
                      setIsVisiblePopupPersona(true);
                    }
                  }
                }
              ]
            }}
          />
        </GroupItem>
        <GroupItem itemType="group" colSpan={4}>
          <div
            style={{
              zIndex: +100,
              position: "fixed",
              height: "83px",
              marginTop: "0px",
              marginLeft: "40px"
            }}
          >
            <Button
              icon="todo"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.ACCEPT" })}
              onClick={aceptar}
              disabled={customDataGridIsBusy}
              useSubmitBehavior={true}
            />
            &nbsp;
            <Button
              icon="refresh"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
              disabled={customDataGridIsBusy}
              onClick={resetLoadOptions}
            />
          </div>
        </GroupItem>
      </GroupItem>
    );
  };

  const onRowDblClick = evt => {
    if (evt.rowIndex === -1) return;
    if (selectionMode === "row" || selectionMode === "single") {
      if (isNotEmpty(evt.data)) {
        agregar([{ ...evt.data }]);
        showPopup.setisVisiblePopUp(!showPopup.isVisiblePopUp);
      }
    }
  };

  const seleccionarRegistro = evt => {
    if (!customDataGridIsBusy) {
      if (selectionMode === "row" || selectionMode === "single") {
        if (isNotEmpty(evt.row.data))
          setDataTempLocal("selectRowDataPersona", evt.row.data);
      }
    }
  };
  function onSelectionChanged(e) {
    setSelectedRow(e.selectedRowsData); //Seleccion multiple
  }

  const renderDataGrid = ({ gridRef, dataSource }) => {
    return (
      <DataGrid
        id="gridContainer"
        dataSource={dataSource}
        ref={gridRef}
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="RowIndex"
        // onCellPrepared={onCellPrepared}
        repaintChangesOnly={true}
        onRowDblClick={onRowDblClick}
        onFocusedRowChanged={seleccionarRegistro}
        onSelectionChanged={e => onSelectionChanged(e)}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
      >
        <FilterRow visible={true} showOperationChooser={false} />
        <Selection mode={selectionMode} />
        <HeaderFilter visible={false} />
        <FilterPanel visible={false} />

        {selectionMode !== "multiple" && (
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
          // fixed={true}
        />
        <Column
          dataField="NombreCompleto"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })} 
          allowSorting={true}
          allowHeaderFiltering={false}
        />
        <Column
          dataField="TipoDocumento"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE" })}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"20%"}
        ></Column>
        <Column
          dataField="Documento"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}
          allowHeaderFiltering={false}
          width={"20%"}
        />
      </DataGrid>
    );
  };

  return (
    <>
      <Popup
        visible={showPopup.isVisiblePopUp}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={"600px"}
        width={"700px"}
        title={(
          intl.formatMessage({ id: "ACTION.SEARCH" }) +
          " " +
          intl.formatMessage({ id: "ADMINISTRATION.PERSON" })
        ).toUpperCase()}
        onHiding={() => showPopup.setisVisiblePopUp(!showPopup.isVisiblePopUp)}
      >
        <Portlet>
          <CustomDataGrid
            showLog={false}
            uniqueId={uniqueId}
            dataSource={dataSource}
            rowNumberName="RowIndex"
            loadWhenStartingComponent={isFirstDataLoad && !refreshData}
            renderDataGrid={renderDataGrid}
            loadUrl={storePersonaSinPerfil}
            forceLoad={forceLoadTypes.FromServer}
            sendToServerOnlyIfThereAreChanges={true}
            ifThereAreNoChangesLoadFromStorage={
              ifThereAreNoChangesLoadFromStorage
            }
            caseSensitiveWhenCheckingForChanges={true}
            uppercaseFilterRow={true}
            initialLoadOptions={{
              currentPage: 1,
              pageSize: 15,
              sort: { column: "NombreCompleto", order: "asc" }
            }}
            filterRowSize="sm"
            summaryCountFormat={`${intl.formatMessage({
              id: "COMMON.TOTAL.ROW"
            })} {0} de {1} `}
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

export default PerfilPersonaMasivoBuscar;
