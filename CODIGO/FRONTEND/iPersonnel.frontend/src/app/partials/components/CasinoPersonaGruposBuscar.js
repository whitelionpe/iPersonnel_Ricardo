import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import {
  Portlet,
} from "../content/Portlet";
import { getDataTempLocal, isNotEmpty, listarCondicion, listarGrupo, setDataTempLocal } from "../../../_metronic";
import { Item, GroupItem } from "devextreme-react/form";
import ControlSwitch from "../../store/ducks/componente/componenteSwitch";
import { handleErrorMessages, handleInfoMessages } from "../../store/ducks/notify-messages";
import { DoubleLinePersona as DoubleLineLabel } from "../content/Grid/DoubleLineLabel";
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
import { storeListarPersonaGrupo as loadUrl ,listarMasivo} from "../../api/casino/personaGrupo.api";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
import PersonaTextAreaPopup from '../../partials/components/PersonaTextAreaPopup/PersonaTextAreaPopup';

import { initialFilterPersonaGrupo } from "../../pages/home/casino/casinoGrupo/CasinoGrupoIndexPage";

const CasinoPersonaGruposBuscar = (props) => {
  const { intl, selectionMode } = props;
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
  const [filterData, setFilterData] = useState({ ...initialFilterPersonaGrupo, IdCliente, IdPerfil, IdDivisionPerfil });
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages,] = useState(true);
  //-CustomerDataGrid-Variables-end->

  const [vizualizarTodasSwitch, setVizualizarTodasSwitch] = useState(false);

    /* ================================================LISTAR TODOS LAS PERSONAS ======================================= */
    const getParams = () => { 

      const [filter, sort] = [
        { Activo: 'S', IdCliente: IdCliente, Condicion: 'TRABAJADOR', MostrarGrupo: 'TODOS', IdPerfil: IdPerfil, IdDivisionPerfil: IdDivisionPerfil },
        { selector: 'NombreCompleto', desc: false },
      ];
      return { filter, sort };
    }
    const getListarPersonasTodos = async () => {
      let skip = 0;
      let take = 99999;
      const { filter, sort } = getParams();
      return await listarMasivo({ filter, sort, skip, take }).catch(handleErrorMessages);
    }
    /* ================================================================================================================== */
 
    
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

  const seleccionarRegistro = (evt) => {
    if (!customDataGridIsBusy) {
      if (selectionMode === "row" || selectionMode === "single") {
        if (isNotEmpty(evt.row.data)) setDataTempLocal('selectRowData', evt.row.data);
      }
    }
  }

  function onSelectionChanged(e) {
    setSelectedRow(e.selectedRowsData);//Seleccion multiple
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

  const selectPersonas = (data) => {
    if (isNotEmpty(data)) {
      let strPersonas = data.split('|').join(',');
      dataSource.loadDataWithFilter({ data: { Personas: strPersonas } });
    }
  }

  // useEffect(() => {
  //   cargarCombos();
  //   if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
  // }, [ifThereAreNoChangesLoadFromStorage])

  // useEffect(() => {
  //   if (refreshData) {
  //     refresh();
  //     setRefreshData(false);
  //   }
  // }, [refreshData]);


  //-CustomerDataGrid-UseEffect-ini->
  useEffect(() => {
    cargarCombos();
    if (ifThereAreNoChangesLoadFromStorage)
      setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage]);

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
    "MostrarGrupo",
    "Personas"
  ];

  const switchVerTodo = () => {
    return (
      <>
        <div className="switch-filtro">
          <ControlSwitch checked={vizualizarTodasSwitch}
            onChange={e => {
              setVizualizarTodasSwitch(e.target.checked);
              if (e.target.checked) { //on
                aceptarAll();
              } else { //off
                // props.dataSource.loadDataWithFilter({ data: { IdDivision } });
                aceptarAll();
              }

            }}
          />
        </div>
      </>)
  }

  async function aceptarAll() {
    const response = (await getListarPersonasTodos());
    if (response.result.data.length > 0) {
      props.agregar(response.result.data);
      props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
    }
  }

  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (

      <GroupItem colCount={12} colSpan={12} labelLocation="top">
        <GroupItem itemType="group" colSpan={3} labelLocation="top">
          <Item
            dataField="Condicion"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONDITION" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: tipoCondicion,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              onValueChanged: () => getInstance().filter(),
            }}
          />
        </GroupItem>

        <GroupItem itemType="group" colSpan={3} >
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
                    setIsVisiblePopupPersona(true);
                  },
                }
              }]
            }}
          />
        </GroupItem>

        <GroupItem itemType="group" colSpan={2} >

          <Item
            dataField="MostrarGrupo"
            label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.GRUPO" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: tipoGrupo,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              onValueChanged: () => getInstance().filter(),
            }}
          />
        </GroupItem>
        <GroupItem itemType="group" colSpan={2} > 
          <Item render={switchVerTodo}
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.ALL.SELECT" }) }}
            colSpan={2}
          >
          </Item>
        </GroupItem>

        <GroupItem itemType="group" colSpan={2} >
          <div style={{ zIndex: +100, position: 'fixed', height: "83px", marginTop: "0px", marginLeft: "40px" }}>
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
  }
  //-CustomerDataGrid-DataGrid

  const renderDataGrid = ({ gridRef, dataSource }) => {
    return (

      <DataGrid
        id="gridContainer"
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
        <Selection mode={props.selectionMode} width={"5px"} showCheckBoxesMode={'always'} selectAllMode={'page'} />
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
          cellRender={DoubleLineLabel}
          allowSorting={true}
          allowHeaderFiltering={false}
        />
        <Column
          dataField="TipoDocumentoAlias"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE" })}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"20%"}
        >
        </Column>
        <Column
          dataField="Documento"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}
          allowHeaderFiltering={false}
          width={"20%"}
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
          intl.formatMessage({ id: "ACTION.SEARCH" }) +
          " " +
          intl.formatMessage({ id: "ADMINISTRATION.PERSON" })
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

CasinoPersonaGruposBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
};
CasinoPersonaGruposBuscar.defaultProps = {
  showButton: true,
  selectionMode: "row", //['multiple', 'row']
  uniqueId: "casinoPersonaGrupoBuscar",
};
export default injectIntl(CasinoPersonaGruposBuscar);
