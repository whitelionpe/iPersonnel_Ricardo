import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { Portlet } from "../content/Portlet";

import { getDataTempLocal, isNotEmpty, listarEstadoSimple, setDataTempLocal } from "../../../_metronic";
import { handleInfoMessages } from "../../store/ducks/notify-messages";
import { DataGrid, Column, FilterRow, HeaderFilter, FilterPanel, Selection } from "devextreme-react/data-grid";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import CustomDataGrid from "../components/CustomDataGrid";
import { storeFiltrar as loadUrl } from "../../api/administracion/contrato.api";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
import { Item, GroupItem } from "devextreme-react/form";
import { forceLoadTypes } from "../components/CustomDataGrid/CustomDataGridHelper";
import AdministracionDivisionBuscar from "./AdministracionDivisionBuscar";
import AdministracionCompaniaBuscar from "../components/AdministracionCompaniaBuscar";
import AdministracionUnidadOrganizativaBuscar from "../components/AdministracionUnidadOrganizativaBuscar";

export const initialFilter = {
 
  IdCliente: "",
  IdCompaniaMandante: "",
  IdCompaniaContratista: "",
  Documento:"",
  IdDivision: "",
  IdUnidadOrganizativa: "",
  CompaniaMandante: "",
  CompaniaContratista: "",
  UnidadesOrganizativasDescripcion: "",
  Division: "",
  IdContrato : "",
  Asunto: "",
  Activo: "S",
};

const AdministracionContratoBuscar = props => {
  const { intl, selectionMode, height } = props;
  const { IdCliente } = useSelector((state) => state.perfil.perfilActual);

  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const [isVisiblePopUpDivision, setisVisiblePopUpDivision] = useState(false);

  //FILTRO- CustomerDataGrid
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(true);
  const ds = new DataSource({
    store: new ArrayStore({ data: [], key: "RowIndex" }),
    reshapeOnPush: false,
  });
  const [dataSource] = useState(ds);
  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente });
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages,] = useState(true);

  function aceptar() {
    let dataSelected = [];
    if (selectionMode === "row" || selectionMode === "single") {
      let getData = getDataTempLocal('selectRowData');
      dataSelected = [{ ...getData }];
    }

    if (dataSelected.length > 0) {
        //console.log("JDL->aceptar->selectd data", dataSelected);
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

  const onRowDblClick = (evt) => {
    if (evt.rowIndex === -1) return;
    if (selectionMode === "row" || selectionMode === "single") {
      if (isNotEmpty(evt.data)) {
        props.selectData([{ ...evt.data }]);
        props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
      }
    }
  }


  const selectUnidadOrganizativa = async (selectedRow) => {
    let strUnidadesOrganizativas = selectedRow.map(x => x.IdUnidadOrganizativa).join('|');
    let UnidadesOrganizativasDescripcion = selectedRow.map(x => x.Menu).join(',');
    dataSource.loadDataWithFilter({ data: { UnidadesOrganizativas: strUnidadesOrganizativas, UnidadesOrganizativasDescripcion } });
    setPopupVisibleUnidad(false);
  };

  const agregarDivision = (divsion) => {
    const { IdDivision, Division } = divsion
    dataSource.loadDataWithFilter({
      data: { IdDivision, Division: `${IdDivision} - ${Division}` }
    });
    setisVisiblePopUpDivision(false);
  };

  const startFilter = () => {
    const { IdCompaniaMandante, IdCompaniaContratista, Activo } = props.filtro;
    setTimeout(function () {
      dataSource.loadDataWithFilter({ data: { IdCompaniaMandante, IdCompaniaContratista, Activo, CompaniaMandante: "", CompaniaContratista: "", UnidadesOrganizativas: "", UnidadesOrganizativasDescripcion: "", IdDivision: "", Division: "" } });
    }, 500);
  }
  const refrestComponent = () => {
    resetLoadOptions();
    startFilter();
  }

  useEffect(() => {
    if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage]);

  useEffect(() => {
    if (refreshData) {
      refresh();
      setRefreshData(false);
    }
  }, [refreshData]);

  useEffect(() => {
    if (props.filtro) {
      startFilter();
    }
  }, [props.filtro]);

  //-CustomerDataGrid-Filter
  const keysToGenerateFilter = [
    'IdCliente',
    'CompaniaMandante',
    "CompaniaContratista",
    'Documento',
    'IdCompaniaMandante',
    "IdCompaniaContratista",
    "IdContrato",
    "Asunto",
    "IdDivision",
    "IdUnidadOrganizativa",
    "UnidadesOrganizativas",
    'Activo'
  ];

  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (

      <GroupItem colCount={12} colSpan={10} labelLocation="top">
        <GroupItem itemType="group" colSpan={4} labelLocation="top">

          <Item
            dataField="Division"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.DIVISION.NAME" }), }}
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
                  options: {
                    stylingMode: "text",
                    icon: "search",
                    disabled: false,
                    onClick: (evt) => {
                      setisVisiblePopUpDivision(true);
                    },
                  },
                },
              ],
              onValueChanged: () => getInstance().filter(),
            }}
          />

        </GroupItem>
        <GroupItem itemType="group" colSpan={5} >

          <Item
            dataField="UnidadesOrganizativasDescripcion"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.ORGANIZATIONALUNIT" }) }}
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
                  options: {
                    stylingMode: "text",
                    icon: "search",
                    disabled: false,
                    onClick: () => {
                      setPopupVisibleUnidad(true);
                    }
                  }
                }
              ],
              onValueChanged: () => getInstance().filter(),
            }}
          />

        </GroupItem>       


        <GroupItem itemType="group" colSpan={1} >
          <div style={{ zIndex: +100, position: 'fixed', height: "83px", marginTop: "0px", marginLeft: "50px" }}>
            <Button
              icon="todo"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.ACCEPT" })}
              onClick={aceptar}
              useSubmitBehavior={true}
            />
            &nbsp;
            <Button
              icon="refresh"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
              disabled={customDataGridIsBusy}
              onClick={refrestComponent}
            />
          </div>
        </GroupItem>

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
        onRowDblClick={onRowDblClick}
        onFocusedRowChanged={seleccionarRegistro}
        repaintChangesOnly={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
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
        <Column dataField="CompaniaMandante" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CLIENTCOMPANY" })} width={"18%"} editorOptions={false} allowEditing={false} alignment={"left"} />
        <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.RUC" })} width={"10%"} editorOptions={false} allowEditing={false} alignment={"center"}  />
        <Column dataField="CompaniaContratista" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACTORCOMPANY.ABR" })} width={"20%"} editorOptions={false} allowEditing={false} alignment={"left"} />
        <Column dataField="IdContrato" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" })} width={"15%"} editorOptions={false} allowEditing={false} alignment={"left"} />
        <Column dataField="Asunto" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBJECT" })} width={"20%"} editorOptions={false} allowEditing={false} alignment={"left"} />
        <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.STARTDATE" })} width={"11%"} alignment="center" allowFiltering={false}  dataType="date" format="dd/MM/yyyy"/>
        <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.ENDDATE" })} width={"10%"} alignment="center" allowFiltering={false}  dataType="date"  format="dd/MM/yyyy" />

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
        height={height}
        width={"990px"}
        title={(intl.formatMessage({ id: "ACTION.SEARCH" }) + ' ' + intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" })).toUpperCase()}
        onHiding={() => props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)}
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
            sendToServerOnlyIfThereAreChanges={false}
            ifThereAreNoChangesLoadFromStorage={ifThereAreNoChangesLoadFromStorage}
            caseSensitiveWhenCheckingForChanges={true}
            uppercaseFilterRow={true}
            initialLoadOptions={{
              currentPage: 1,
              pageSize: 15,
              sort: { column: "FechaInicio", order: "desc" },
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


      

      {/*******>POPUP DE UNIDAD ORGA.>******** */}
      {popupVisibleUnidad && (
        <AdministracionUnidadOrganizativaBuscar
          selectData={selectUnidadOrganizativa}
          showPopup={{ isVisiblePopUp: popupVisibleUnidad, setisVisiblePopUp: setPopupVisibleUnidad }}
          cancelarEdicion={() => setPopupVisibleUnidad(false)}
          selectionMode={"multiple"}
          showCheckBoxesModes={"normal"}
        />
      )}
      {/*******>POPUP DIVISION.>******** */}
      {isVisiblePopUpDivision && (
        <AdministracionDivisionBuscar
          showPopup={{ isVisiblePopUp: isVisiblePopUpDivision, setisVisiblePopUp: setisVisiblePopUpDivision }}
          cancelar={() => setisVisiblePopUpDivision(false)}
          selectData={agregarDivision}
          selectionMode={"row"}
        />
      )}

    </>
  );
};

AdministracionContratoBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
  filtro: PropTypes.object,
  height: PropTypes.string

};
AdministracionContratoBuscar.defaultProps = {
  showButton: false,
  selectionMode: "row",
  uniqueId: "administracioncontratoBuscar",
  filtro: { IdCompaniaContratista: "", IdCompaniaMandante: "", Activo: "S", CompaniaMandante: "" },
  height: "590px"
};
export default injectIntl(AdministracionContratoBuscar);
