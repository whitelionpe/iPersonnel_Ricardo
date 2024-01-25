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
import { storeListar as loadUrl } from "../../api/acceso/personaPerfil.api";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
import PersonaTextAreaPopup from './PersonaTextAreaPopup/PersonaTextAreaPopup';


export const initialFilter = {
  Activo: "S",
  IdCliente: "",
  Condicion: "TRABAJADOR",
  MostrarPerfil: "SINASIG",
  Personas: "",
};

const AccesoPersonaPerfilBuscar = (props) => {
  const { intl, selectionMode, condicion } = props;
  const [selectedRow, setSelectedRow] = useState([]);

  const { IdCliente, IdPerfil } = useSelector(state => state.perfil.perfilActual);
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
  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdPerfil, IdDivisionPerfil, Condicion: condicion });
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
      //console.log(strPersonas);
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
    "IdPersona",
    "Condicion",
    "NombreCompleto",
    "TipoDocumentoAlias",
    "Documento",
    "Activo",
    'IdPerfil',
    'IdDivisionPerfil',
    "MostrarPerfil",
    "Personas"
  ];


  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem colCount={3} labelLocation="top">
       
        <Item
          dataField="Personas"
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
      
        <Item
          dataField="MostrarPerfil"
          label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.PROFILE" }) }}
          editorType="dxSelectBox"
          editorOptions={{
            items: tipoGrupo,
            valueExpr: "Valor",
            displayExpr: "Descripcion",
            onValueChanged: () => getInstance().filter(),
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
        <HeaderFilter visible={false} />
        <FilterPanel visible={false} />
        <Scrolling visible={false} />

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
          dataField="IdPersona"
          caption={intl.formatMessage({ id: "COMMON.CODE" })}
          allowHeaderFiltering={false}
          allowSorting={true}
          width={"10%"}
          alignment={"center"}
          fixed={true}
        />
        <Column
          dataField="NombreCompleto"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
          cellRender={DoubleLineLabel}
          allowSorting={true}
          allowHeaderFiltering={false}
          width={"40%"}
          fixed={true}
        />
        <Column
          dataField="Condicion"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONDITION" })}
          allowSorting={true}
          allowHeaderFiltering={false}
          //allowFiltering={false}
          alignment={"center"}
          width={"15%"}
          cellRender={PersonaCondicionLabel}
        />
        <Column
          dataField="TipoDocumentoAlias"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE" })}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"10%"}
        >
          {/* <HeaderFilter dataSource={tipoDocumentoFilter} /> */}
        </Column>
        <Column
          dataField="Documento"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}
          allowHeaderFiltering={false}
          width={"15%"}
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
        width={"700px"}
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
  uniqueId: "adminpersonasPerfilBuscar",
  condicion: "TRABAJADOR"
};
export default injectIntl(AccesoPersonaPerfilBuscar);
