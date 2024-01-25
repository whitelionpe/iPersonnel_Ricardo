import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { PortletBody, } from "../../../../../partials/content/Portlet";
import { DataGrid, Column, Editing, FilterRow, HeaderFilter, FilterPanel } from "devextreme-react/data-grid";
import { isNotEmpty } from "../../../../../../_metronic";
import PropTypes from 'prop-types';
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";
import { storeListarR001 as loadUrl } from "../../../../../api/identificacion/reporte.api";

const ReporteHistogramaDetalleListPage = props => {
  const { intl, setLoading } = props;
  const { IdCompania,IdMotivo,IdTipoCredencial,FechaInicio,FechaFin} = props.filtro;

  //Variables de CustomerDataGrid
  const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({
      //...initialFilter,
     IdCompania: isNotEmpty(IdCompania) ? IdCompania : "",
     IdMotivo: isNotEmpty(IdMotivo) ? IdMotivo : "",
     IdTipoCredencial: isNotEmpty(IdTipoCredencial) ? IdTipoCredencial : "",
     FechaInicio: FechaInicio,
     FechaFin: FechaFin,
  });

  // ------------------------------
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-:::::::::::::::::::::::::::::::::
  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  }

    useEffect(() => {
      if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
    }, [ifThereAreNoChangesLoadFromStorage])

    useEffect(() => {
      if (props.refreshData) {
        props.refresh();
        props.setRefreshData(false);
      }
    }, [props.refreshData,]);

    useEffect(() => {
      if (props.filtro) {
        const { IdCompania,IdMotivo,IdTipoCredencial,FechaInicio,FechaFin} = props.filtro;
         setTimeout(() => {
          props.dataSource.loadDataWithFilter({ data: { IdCompania,IdMotivo,IdTipoCredencial,FechaInicio,FechaFin } });
         }, 500)
      }
    }, [props.filtro]);

  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter = [
    'IdCliente',
    'IdCompania',
    'IdMotivo', 
    'IdTipoCredencial',
    'FechaInicio',
    'FechaFin',
  ];


  const renderDataGrid = ({ gridRef, dataSource }) => {
    props.setDataGridRef(gridRef);
    return (
      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        keyExpr="RowIndex"
        showBorders={true}
        remoteOperations={true}
        focusedRowEnabled={true}
        repaintChangesOnly={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
      >
        <Editing mode="row"
          useIcons={props.showButtons}
          allowUpdating={props.showButtons}
          allowDeleting={props.showButtons}
          texts={textEditing} />
        <FilterRow visible={false} showOperationChooser={false} />
        <HeaderFilter visible={false} />
        <FilterPanel visible={false} />
       
        <Column dataField="Compania"
            caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" })}
            allowHeaderFiltering={false}
            allowSorting={true}
            width={"15%"}
            alignment={"left"}
          />
          <Column
            dataField="FechaRegistro"
            caption={intl.formatMessage({ id: "AUDITORIA_DE_COMEDORES_REGISTARTION_DATE" })}
            dataType="date"
            format="dd/MM/yyyy"
            alignment={"center"}
            allowHeaderFiltering={false}
            allowFiltering={false}
            width={"10%"}
          />

          <Column
            dataField="TipoDocumentoAlias"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE.DOCU" })}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={true}
            alignment={"center"}
            width={"10%"}
          />
          <Column dataField="Documento"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}
            allowHeaderFiltering={false}
            width={"10%"}
            alignment={"center"}
          />
          <Column
            dataField="NombreCompleto"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
            allowSorting={true}
            allowHeaderFiltering={false}
            width={"20%"}
          />
          <Column dataField="Motivo"
            caption={intl.formatMessage({ id: "IDENTIFICATION.REASON" })}
            allowHeaderFiltering={false}
            width={"15%"}
            alignment={"left"}
          />
          <Column dataField="TipoCredencial"
            caption={intl.formatMessage({ id: "SYSTEM.TEAM.MODEL" })}
            allowHeaderFiltering={false}
            width={"10%"}
            alignment={"left"}
          />
          <Column
            dataField="FechaInicio"
            caption={intl.formatMessage({ id: "COMMON.STARTDATE" })}
            dataType="date"
            format="dd/MM/yyyy"
            alignment={"center"}
            allowHeaderFiltering={false}
            allowFiltering={false}
            width={"8%"}
          />
          <Column
            dataField="FechaFin"
            caption={intl.formatMessage({ id: "COMMON.ENDDATE" })}
            dataType="date"
            format="dd/MM/yyyy"
            alignment={"center"}
            allowHeaderFiltering={false}
            allowFiltering={false}
            width={"8%"}
          />

      </DataGrid>
    );
  }

  return (
    <>
      <a id="iddescarga" className="" ></a>
      <PortletBody>
        <CustomDataGrid
        showLog={false} 
          uniqueId={props.uniqueId}
          dataSource={props.dataSource}
          rowNumberName='RowIndex'
          loadWhenStartingComponent={props.isFirstDataLoad && !props.refreshData}
          renderDataGrid={renderDataGrid}
          loadUrl={loadUrl}
          forceLoad={forceLoadTypes.Unforced}
          sendToServerOnlyIfThereAreChanges={false}
          ifThereAreNoChangesLoadFromStorage={ifThereAreNoChangesLoadFromStorage}
          caseSensitiveWhenCheckingForChanges={true}
          uppercaseFilterRow={true}
          initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'NombreCompleto', order: 'asc' } }}
          filterRowSize='sm'
          summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}
          // CUSTOM FILTER
          //cssClassAppBar={classesEncabezado.secundario}
          //cssClassToolbar={classesEncabezado.toolbar}
          //renderFormTitleCustomFilter={renderFormTitleCustomFilter}
          //titleCustomFilter='Datos a consultar'
          visibleCustomFilter={isActiveFilters}
          // renderFormContentCustomFilter={renderFormContentCustomFilter}
          //transformData={transformData}
          //reverseTransformData={reverseTransformData}
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

ReporteHistogramaDetalleListPage.propTypes = {
  titulo: PropTypes.string,
  showButtons: PropTypes.bool,
  uniqueId: PropTypes.string,
  filtro: PropTypes.object,
}
ReporteHistogramaDetalleListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  uniqueId: 'ReporteHistogramaDetalleListPage',
  filtro: { 
    IdCompania: "",
    IdMotivo: "",
    IdTipoCredencial: "",
    FechaInicio:"",
    FechaFin:"",
  }
     
}

export default injectIntl(WithLoandingPanel(ReporteHistogramaDetalleListPage));
