import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import {
  DataGrid,
  Column,
  Editing,
  FilterRow,
} from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar,
} from "../../../../partials/content/Portlet";
import { DoubleLinePosicion as DoubleLineLabel } from "../../../../partials/content/Grid/DoubleLineLabel";

import { isNotEmpty } from "../../../../../_metronic";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import HeaderInformation from "../../../../partials/components/HeaderInformation";

//-CustomerDataGrid-Import>
import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { storeFiltrar as loadUrl } from "../../../../api/administracion/posicion.api";
import { initialFilter } from "./ContratistaPosicionIndexPage";


const ContratistaPosicionListPage = (props) => {

  const { intl, selected } = props;
  const { IdCliente } = useSelector((state) => state.perfil.perfilActual);
  const { IdUnidadOrganizativa, IdFuncion, Funcion } = selected;

  //-CustomerDataGrid-Variables-ini->
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdUnidadOrganizativa, IdFuncion, Funcion });
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;
  //-CustomerDataGrid-Variables-end->

  const editarRegistro = (evt) => {
    props.editarRegistro(evt.data);
  };

  const eliminarRegistro = (evt) => {
    evt.cancel = true;
    props.eliminarRegistro(evt.data);
  };


  const seleccionarRegistro = (evt) => {

    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  };

  const seleccionarRegistroDblClick = evt => {
    if (evt.data === undefined) return;
    if (isNotEmpty(evt.data)) {
      props.verRegistroDblClick(evt.data);
    };
  }

  function onCellPrepared(e) {
    if (e.rowType === "data") {
      if (e.data.Activo === "N") {
        e.cellElement.style.color = "red";
      }
    }
  }

  const textEditing = {
    confirmDeleteMessage:'',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
};

  //-CustomerDataGrid-UseEffect-ini->
  useEffect(() => {
    if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage])

  useEffect(() => {
    if (props.refreshData) {
      props.refresh();
      props.setRefreshData(false);
    }
  }, [props.refreshData]);

  useEffect(() => {

    if (IdUnidadOrganizativa) {
      props.dataSource.loadDataWithFilter({ data: { IdCliente, IdUnidadOrganizativa } });
    }
    if (IdFuncion) {
      const { Funcion } = selected;
      props.dataSource.loadDataWithFilter({ data: { IdCliente, IdFuncion, Funcion } });
    }
  }, [IdUnidadOrganizativa, IdFuncion]);
  //-CustomerDataGrid-UseEffect-end->

  //-CustomerDataGrid-Filter
  const keysToGenerateFilter = ['IdCliente', 'IdUnidadOrganizativa', 'Division', 'IdPosicion', 'Posicion', 'IdFuncion', 'Funcion', 'PosicionPadre', 'UnidadOrganizativa', 'Activo', 'Contratista'];

  const renderDataGrid = ({ gridRef, dataSource }) => {
    if(dataSource._storeLoadOptions.filter !== undefined ){
      if(props.totalRowIndex === 0){ 
      props.setTotalRowIndex(dataSource._totalCount);
      }
      if(dataSource._totalCount != props.totalRowIndex){
        if(dataSource._totalCount != -1){
        props.setIdPosicion("")
        props.setFocusedRowKey();
        props.setTotalRowIndex(dataSource._totalCount);
        }
      }
    }
    return (
      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="RowIndex"
        onEditingStart={editarRegistro}
        onRowRemoving={eliminarRegistro}
        onFocusedRowChanged={seleccionarRegistro}
        focusedRowKey={props.focusedRowKey}
        onRowDblClick={seleccionarRegistroDblClick}
        onCellPrepared={onCellPrepared}
        repaintChangesOnly={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
      >
        <Editing
          mode="row"
          useIcons={props.showButtons}
          allowUpdating={props.showButtons}
          allowDeleting={props.showButtons}
          texts={textEditing}
        />
        <FilterRow visible={true} showOperationChooser={false} />

        <Column
          dataField="RowIndex"
          caption="#"
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          width={"5%"}
          alignment={"center"}
        />
        <Column
          dataField="IdPosicion"
          caption={intl.formatMessage({ id: "COMMON.CODE" })}
          width={"14%"}
          allowSorting={true}
          allowSearch={true}
          allowFiltering={true}
        />
        <Column
          dataField="Posicion"
          caption={intl.formatMessage({ id: "ADMINISTRATION.POSITION" })}
          width={"24%"}
          allowSorting={true}
          allowSearch={true}
          allowFiltering={true}
        />
        <Column
          dataField="Funcion"
          caption={intl.formatMessage({
            id: "ADMINISTRATION.POSITION.FUNCTION",
          })}
          width={"14%"}
        />
        <Column
          dataField="TipoPosicion"
          caption={intl.formatMessage({ id: "ADMINISTRATION.POSITION.POSITIONTYPE" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          width={"31%"}
        />
        <Column
          dataField="Division"
          caption={intl.formatMessage({
            id: "SYSTEM.DIVISION",
          })}
          width={"19%"}
          allowSorting={true}
          allowSearch={true}
          allowFiltering={true}
        />
        {/* <Column
          dataField="UnidadOrganizativa"
          caption={intl.formatMessage({
            id: "ADMINISTRATION.POSITION.ORGANIZATIONALUNIT",
          })}
          width={"20%"}
          allowSorting={true}
          allowSearch={true}
          allowFiltering={true}
        /> */}
      </DataGrid>
    );
  }
  //-CustomerDataGrid-DataGrid- end
  return (
    <>

      {props.showHeaderInformation && (
        <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
          toolbar={
            <PortletHeader
              title=""
              toolbar={
                <PortletHeaderToolbar>
                  <Button
                    icon="fa fa-times-circle"
                    type="normal"
                    hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                    onClick={props.cancelarEdicion}
                  />
                </PortletHeaderToolbar>
              }
            />

          } />
      )}
      {!props.showHeaderInformation && (
        <PortletHeader
          title={intl.formatMessage({ id: "ACTION.LIST" })}
          toolbar={
            <PortletHeaderToolbar>
              <Button
                icon="plus"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.NEW" })}
                onClick={props.nuevoRegistro}
                disabled={customDataGridIsBusy}
              />
              &nbsp;
              <Button icon="refresh" //fa fa-broom
                type="default"
                hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                disabled={customDataGridIsBusy}
                onClick={resetLoadOptions} />
            </PortletHeaderToolbar>
          }
        />)}

      <PortletBody>

        <CustomDataGrid
          showLog={false}
          uniqueId={props.uniqueId} //'posicionesList'
          dataSource={props.dataSource}
          rowNumberName='RowIndex'
          loadWhenStartingComponent={props.isFirstDataLoad && !props.refreshData}
          renderDataGrid={renderDataGrid}
          loadUrl={loadUrl}
          forceLoad={forceLoadTypes.Unforced}
          sendToServerOnlyIfThereAreChanges={true}
          ifThereAreNoChangesLoadFromStorage={ifThereAreNoChangesLoadFromStorage}
          caseSensitiveWhenCheckingForChanges={true}
          uppercaseFilterRow={true}
          initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'Posicion', order: 'asc' } }}
          filterRowSize='sm'
          summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}
          // CUSTOM FILTER
          keysToGenerateFilter={keysToGenerateFilter}
          filterData={filterData}
          // PAGINATION
          paginationSize='md'
          // EVENTS
          onLoading={() => setCustomDataGridIsBusy(true)}
          onError={() => setCustomDataGridIsBusy(false)}
          onLoaded={() => setCustomDataGridIsBusy(false)}
        />

      </PortletBody>
    </>
  );
};

ContratistaPosicionListPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  uniqueId: PropTypes.string,

};
ContratistaPosicionListPage.defaultProps = {
  showHeaderInformation: true,
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  uniqueId: "posicionesList"

};

export default injectIntl(ContratistaPosicionListPage);
