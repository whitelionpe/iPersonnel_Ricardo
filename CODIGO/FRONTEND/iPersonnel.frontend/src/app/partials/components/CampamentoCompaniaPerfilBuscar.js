import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl"; //Multi-idioma
import { Button } from "devextreme-react";
import {
  Portlet,
  PortletHeaderPopUp,
  PortletHeaderToolbar,
} from "../content/Portlet";
import { isNotEmpty } from "../../../_metronic";
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
import { storeListar as loadUrl } from "../../api/campamento/companiaPerfil.api";

import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";

import { initialFilter } from "../../pages/home/campamento/perfil/PerfilIndexPage";
import ControlSwitch from "../../store/ducks/componente/componenteSwitch";

// export const initialFilter = {

//   IdCliente: "",
//   Contratista: "",
//    Activo: "S",
// };

const CampamentoCompaniaPerfilBuscar = (props) => {
  const { intl, modoEdicion, settingDataField, accessButton, varIdPerfil } = props;
  const { IdCliente, IdDivision } = useSelector((state) => state.perfil.perfilActual);
  const [selectedRow, setSelectedRow] = useState([]);
  const [vizualizarTodasSwitch, setVizualizarTodasSwitch] = useState(false);

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
  // const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente });
  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdDivision, IdPerfil: varIdPerfil });

  const [
    ifThereAreNoChangesLoadFromStorage,
    setIfThereAreNoChangesLoadFromStorages,
  ] = useState(true);
  //-CustomerDataGrid-Variables-end->

  function aceptar() {
    if (selectedRow.length > 0) {
      props.selectData(selectedRow);
      props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
    } else {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }));
    }
  }

  function onSelectionChanged(e) {
    //Seleccion multiple
    setSelectedRow(e.selectedRowsData);
    // props.selectData(e.selectedRowsData);

  }

  const cleanEvent = () => {
    setVizualizarTodasSwitch(false);
    dataSource.resetLoadOptions();
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
    }else{
      dataSource.loadDataWithFilter({ data: { IdDivision } });
    }
  }, [refreshData]);


  //-CustomerDataGrid-Filter
  const keysToGenerateFilter = [
    "IdCliente",
    "IdDivision",
    "IdCompania",
    "Compania",
    "TipoDocumento",
    "Documento",
    "Pais",
    "Contratista",
    "Activo",
    "IdPerfil"
  ];
  //-CustomerDataGrid-DataGrid
  //-CustomerDataGrid-DataGrid

  const renderDataGrid = ({ gridRef, dataSource }) => {
    return (
      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="RowIndex"
        repaintChangesOnly={true}
        // onRowDblClick={onRowDblClick}
        onSelectionChanged={onSelectionChanged}
      >
        <FilterRow visible={true} showOperationChooser={false} />
        <Selection mode={props.selectionMode} />
        <HeaderFilter visible={false} />
        <FilterPanel visible={false} />
        <Column
          dataField="RowIndex"
          caption="#"
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          width={"7%"}
          alignment={"center"}
          visible={false}
        />
        <Column
          dataField="IdCompania"
          caption={intl.formatMessage({ id: "COMMON.CODE" })}
          width={"30%"}
          allowHeaderFiltering={false}
          allowSorting={true}
          alignment={"center"}
        />
        <Column
          dataField="Compania"
          caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" })}
          width={"63%"}
          allowHeaderFiltering={false}
          allowSorting={true}
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
        width={"600px"}
        title={(intl.formatMessage({ id: "CAMP.MANAGE.PROFILE.COMPANY.ADD" })).toUpperCase()}
        onHiding={() =>
          props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp),
          props.cancelarEdicion
        }
      >
        <Portlet>
          {props.showButton && (
            <PortletHeaderPopUp
              title={""}
              toolbar={
                <PortletHeaderToolbar>

                  <div className="switch-left">
                    {intl.formatMessage({ id: "ADMINISTRATION.COMPANY.ALL" })}
                    <ControlSwitch checked={vizualizarTodasSwitch}
                      onChange={e => {

                        setVizualizarTodasSwitch(e.target.checked);
                        if (e.target.checked) { //on
                          dataSource.loadDataWithFilter({ data: { IdDivision: "" } });
                        } else { //off
                          dataSource.loadDataWithFilter({ data: { IdDivision } });
                        }

                      }}
                    />
                  </div>

                  <Button
                    icon="todo"//icon="fa fa-save"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.ACCEPT" })}
                    onClick={aceptar}
                    useSubmitBehavior={true}
                    disabled={customDataGridIsBusy}
                  />

                  &nbsp;
                  <Button
                    icon="refresh" //fa fa-broom
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                    disabled={customDataGridIsBusy}
                    onClick={ () => cleanEvent()}
                  />

                </PortletHeaderToolbar>
              }
            />
          )}
          {!props.showButton && (
            <PortletHeaderPopUp
              title={""}
              toolbar={
                <PortletHeaderToolbar>
                  <Button
                    icon="refresh" //fa fa-broom
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                    disabled={customDataGridIsBusy}
                    onClick={resetLoadOptions}
                  />
                  &nbsp;
                </PortletHeaderToolbar>
              }
            />
          )}

          {/* <PortletBody> */}

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
            ifThereAreNoChangesLoadFromStorage={
              ifThereAreNoChangesLoadFromStorage
            }
            caseSensitiveWhenCheckingForChanges={true}
            uppercaseFilterRow={true}
            initialLoadOptions={{
              currentPage: 1,
              pageSize: 15,
              sort: { column: "Compania", order: "asc" },
            }}
            filterRowSize="sm"
            summaryCountFormat={`${intl.formatMessage({
              id: "COMMON.TOTAL.ROW",
            })} {0} de {1} `}
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

          {/* </PortletBody> */}
        </Portlet>
      </Popup>
    </>
  );
};

CampamentoCompaniaPerfilBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
  contratista: PropTypes.string
};
CampamentoCompaniaPerfilBuscar.defaultProps = {
  showButton: false,
  selectionMode: "row", //['multiple', 'row','single]
  uniqueId: "CampamentoCompaniaPerfilBuscar",
  contratista: "N"
};
export default injectIntl(CampamentoCompaniaPerfilBuscar);
