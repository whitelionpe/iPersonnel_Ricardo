import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Paging, Pager, FilterRow, Summary, TotalItem, HeaderFilter, FilterPanel } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { isNotEmpty, toAbsoluteUrl } from "../../../../../_metronic";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import PropTypes from "prop-types";
import { DoubleLinePersona as DoubleLineLabel } from "../../../../partials/content/Grid/DoubleLineLabel";
import RegimenPersonaFilterPage from "./RegimenPersonaFilterPage";

import { useSelector } from "react-redux";
//-CustomerDataGrid-Import>
import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
// import { storeFiltrarRegimenPersona as loadUrl } from "../../../../api/administracion/regimen.api";
import { storeFiltrar as loadUrl } from "../../../../api/administracion/personaRegimen.api";
import { initialFilter } from "./RegimenIndexPage";


const RegimenPersonaListPage = props => {

  const { intl, accessButton } = props;
  const { IdCliente, IdDivision } = useSelector((state) => state.perfil.perfilActual);
  const { IdRegimen } = props.selected;
  //const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdDivision, IdRegimen: isNotEmpty(IdRegimen) ? IdRegimen : "" });
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;

  const [activarFiltros, setactivarFiltros] = useState(false);
  const [dataFilter, setDataFilter] = useState({
    FechaInicio: "",
    FechaFin: "",
    IdGuardia: "",
  });


  const editarRegistro = evt => {
    props.editarRegistro(evt.data);
  };

  const eliminarRegistro = evt => {
    evt.cancel = true;
    props.eliminarRegistro(evt.data);
  };
  const obtenerCampoActivo = rowData => {
    return rowData.Activo === "S";
  }

  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  }

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  const textEditing = {
    confirmDeleteMessage: '',
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
    if (IdRegimen) {
      props.dataSource.loadDataWithFilter({ data: { IdRegimen } });
    }
  }, [IdRegimen]);
  //-CustomerDataGrid-UseEffect-end->


  function onActivarFiltro() {

    let hoy = new Date();
    let fecInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    setDataFilter({
      FechaInicio: fecInicio,
      FechaFin: hoy,
    });
    setactivarFiltros(!activarFiltros ? true : false);
  }

  async function generarFiltro(data) {
    const { FechaInicio, FechaFin } = data;
    if (isNotEmpty(FechaInicio) && isNotEmpty(FechaFin)) {
      let filtros = {
        FechaInicio,
        FechaFin,
      };
      props.cargaListaPersonasRegimen(filtros);
    }
  }



  //-CustomerDataGrid-Filter
  const keysToGenerateFilter = [
    'IdCliente',
    'IdDivision',
    'IdRegimen',
    'IdGuardia',
    'NombreCompleto',
    'Documento',
    'TipoDocumentoAlias',
    'FechaInicio',
    'FechaFin',
    'Activo'];

  const renderDataGrid = ({ gridRef, dataSource }) => {
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
        onCellPrepared={onCellPrepared}
        repaintChangesOnly={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
      >
        <Editing
          mode="row"
          useIcons={props.showButtons}
          allowUpdating={true}//{false}//{props.showButtons}//{false}//{props.showButtons}
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
          dataField="NombreCompleto"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
          width={"25%"}
          //cellRender={DoubleLineLabel}
          allowSorting={true}
          allowSearch={true}
          allowFiltering={true}
        />
        {/* <Column
          dataField="TipoDocumentoAlias"
          caption={intl.formatMessage({
            id: "COMMON.TYPE",
          })}
          width={"10%"}
          alignment={"center"}
          allowSearch={false}
          allowFiltering={false}
        /> */}
        <Column
          dataField="Documento"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}
          allowSorting={true}
          allowFiltering={true}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"10%"}
        />
        <Column
          dataField="Guardia"
          caption={intl.formatMessage({ id: "ADMINISTRATION.REGIME.GUARD.TAB" })}
          width={"10%"}
          allowSorting={true}
          allowSearch={true}
          allowFiltering={true}
        />
        <Column
          dataField="FechaInicio"
          caption={intl.formatMessage({
            id: "CASINO.PERSON.GROUP.STARTDATE",
          })}
          dataType="date" format="dd/MM/yyyy"
          width={"20%"}
          alignment={"center"}
          allowSorting={true}
          allowSearch={true}
          allowFiltering={false}
        />
        <Column
          dataField="FechaFin"
          caption={intl.formatMessage({
            id: "CASINO.PERSON.GROUP.ENDDATE",
          })}
          dataType="date" format="dd/MM/yyyy"
          width={"20%"}
          alignment={"center"}
          allowSorting={true}
          allowSearch={true}
          allowFiltering={false}
        />
        <Column
          dataType="boolean"
          caption={intl.formatMessage({ id: "COMMON.ACTIVE" })}
          calculateCellValue={obtenerCampoActivo}
          width={"10%"}
          allowSorting={false}
          allowFiltering={false}
        />

      </DataGrid>
    );
  }
  //-CustomerDataGrid-DataGrid- end


  return (
    <>
      {props.showHeaderInformation && (
        <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
          toolbar={
            <PortletHeader
              title={""}
              toolbar={
                <PortletHeaderToolbar>
                  {/*   <Button
                    icon={activarFiltros ? "search" : "search"}
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                    onClick={onActivarFiltro}
                  />
                  &nbsp; */}
                  <Button
                    icon="plus"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.NEW" })}
                    onClick={props.nuevoRegistro}
                  />
                  &nbsp;
                  <Button icon="refresh" //fa fa-broom
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                    disabled={customDataGridIsBusy}
                    onClick={resetLoadOptions} />
                  &nbsp;
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

      <PortletBody>
        {activarFiltros ? (
          <RegimenPersonaFilterPage
            generarFiltro={generarFiltro}
            dataFilter={dataFilter}
          />
        ) : null}
        <CustomDataGrid
          /*  dataSource={props.personasRegimen}*/
          showLog={false}
          uniqueId={props.uniqueId}
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
          initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'NombreCompleto', order: 'asc' } }}
          filterRowSize='sm'
          summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}

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

RegimenPersonaListPage.propTypes = {
  allowUpdating: PropTypes.bool,
  allowDeleting: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  titulo: PropTypes.string,
  //modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  uniqueId: PropTypes.string,
};
RegimenPersonaListPage.defaultProps = {
  allowUpdating: true,
  allowDeleting: true,
  showHeaderInformation: false,
  titulo: "",
  //modoEdicion: false,
  showButtons: true,
  uniqueId: "RegimenListado"
};

export default injectIntl(RegimenPersonaListPage);
