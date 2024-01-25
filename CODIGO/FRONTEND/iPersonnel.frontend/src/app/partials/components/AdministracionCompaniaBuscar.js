import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl"; //Multi-idioma
import { Button } from "devextreme-react";
import {
  Portlet,
  PortletHeaderPopUp,
  PortletHeaderToolbar,
} from "../content/Portlet";
import { getDataTempLocal, isNotEmpty, removeDataTempLocal, setDataTempLocal } from "../../../_metronic";
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
import { isNullOrUndefined } from "../shared/CommonHelper";
import { storeListar as loadUrl } from "../../api/administracion/compania.api";

import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
import Tooltip from '@material-ui/core/Tooltip';
import ControlSwitch from "../../store/ducks/componente/componenteSwitch";


export const initialFilter = {
  IdCliente: "",
  IdDivision: "",
  Contratista: "S",
  ControlarAsistencia: "",
  Activo: "S",
};

const AdministracionCompaniaBuscar = (props) => {
  const { intl, contratista, selectionMode,  } = props;
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
  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdDivision, ControlarAsistencia: isNullOrUndefined(props.isControlarAsistencia) ? "" : props.isControlarAsistencia, Contratista: isNullOrUndefined(props.isContratista) ? "" : props.isContratista });
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


  function cellRenderColumn(e) {

    if (e && e.data) {
      const { Contratista } = e.data;

      if (Contratista === 'S') {
        return <i className="fas fa-circle  text-info icon-10x" data-toggle="tooltip" data-placement="top" title={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACTORCOMPANY" })} ></i>
      }
      else {
        return <i className="fas fa-circle  text-success icon-10x" data-toggle="tooltip" data-placement="top" title={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CLIENTCOMPANY" })} ></i>
      }
    }

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
    }
    else{
      dataSource.loadDataWithFilter({ data: { IdDivision } });
    }
  }, [refreshData]);

  /*jdl-2020 */
  useEffect(() => {
    if (contratista) {
      //var contratista = props.contratista;
      if (isNotEmpty(contratista)) dataSource.loadDataWithFilter({ data: { Contratista: contratista } });
    }
  }, [contratista]);



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
    "ControlarAsistencia",
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
          dataField="IdCompania"
          caption={intl.formatMessage({ id: "COMMON.CODE" })}
          width={"15%"}
          allowHeaderFiltering={false}
          allowSorting={true}
          alignment={"center"}
        />
        <Column
          dataField="Compania"
          caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" })}
          allowHeaderFiltering={false}
          allowSorting={true}
        />
        <Column
          dataField="Contratista"
          cellRender={cellRenderColumn}
          caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.CONTRACTOR" })}
          width={"22%"}
          allowSorting={true}
          alignment={"center"}
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
        title={(
          intl.formatMessage({ id: "ACTION.SEARCH" }) + " " + intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" })).toUpperCase()}
        onHiding={() =>
          props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)
        }
      >
        <Portlet>
          {/* {props.showButton && ( */}
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
                  id="btnClean"
                  icon="refresh" //fa fa-broom
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                  disabled={customDataGridIsBusy}
                  onClick={ () => cleanEvent()}
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
              sort: { column: "Compania", order: "asc" },
            }}
            filterRowSize="sm"
            summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW", })} {0} de {1} `}
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

AdministracionCompaniaBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
  contratista: PropTypes.string,
  isContratista: PropTypes.string,
  isControlarAsistencia: PropTypes.string
};
AdministracionCompaniaBuscar.defaultProps = {
  showButton: false,
  selectionMode: "row", //['multiple', 'row','single]
  uniqueId: "AdministracionCompaniaBuscar",
  contratista: "",
  isContratista: "",
  isControlarAsistencia: ""
};
export default injectIntl(AdministracionCompaniaBuscar);
