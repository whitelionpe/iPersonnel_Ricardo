import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { PortletBody, } from "../../../../../partials/content/Portlet";
import { DataGrid, Column, Editing, FilterRow, HeaderFilter, FilterPanel } from "devextreme-react/data-grid";
import { isNotEmpty } from "../../../../../../_metronic";
import PropTypes from 'prop-types';
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";
import { storeListarR001 as loadUrl } from "../../../../../api/administracion/reporte.api";
import { initialFilter } from "./ReporteMovimientoIndexPage";

const ReporteMovimientoEstadisticasDetalleListPage = props => {
   console.log("ReporteMovimientoEstadisticasDetalleListPage|props:",props);
  const { intl, setLoading } = props;
  const { IdCompania,UnidadesOrganizativas,IdDivision,IdPosicion,Condicion,Activo, FechaInicio,FechaFin,Funcion} = props.filtro;

  //Variables de CustomerDataGrid
  const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({
      ...initialFilter,
     IdCompania: isNotEmpty(IdCompania) ? IdCompania : "",
     UnidadesOrganizativas: isNotEmpty(UnidadesOrganizativas) ? UnidadesOrganizativas : "",
     IdDivision: IdDivision,
     IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion : "",
     Condicion: isNotEmpty(Condicion) ? Condicion : "",
     Activo: isNotEmpty(Activo) ? Activo : "",
     FechaInicio: FechaInicio,
     FechaFin: FechaFin,
     Funcion: isNotEmpty(Funcion) ? Funcion : "",
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
        const { IdCompania,UnidadesOrganizativas,IdDivision,IdPosicion,Condicion,Activo, FechaInicio,FechaFin,Funcion} = props.filtro;
         setTimeout(() => {
          props.dataSource.loadDataWithFilter({ data: { IdCompania,UnidadesOrganizativas,IdDivision,IdPosicion,Condicion,Activo,FechaInicio,FechaFin,Funcion } });
         }, 500)
      }
    }, [props.filtro]);

  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter = [
    'IdCliente',
    'IdCompania',
    'UnidadesOrganizativas', 
    'IdDivision',
    'IdPosicion',
    'Condicion',
    'Activo',
    'FechaInicio',
    'FechaFin',
    'Funcion'
  ];

  const renderDataGrid = ({ gridRef, dataSource }) => {
    // dataGridRef = gridRef;
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
       
        <Column
          dataField="RowIndex"
          caption="#"
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          width={"5%"}
          alignment={"center"}
          visible={false}
        />

        <Column dataField="IdPersona"
          caption={intl.formatMessage({ id: "COMMON.CODE" })}
          allowHeaderFiltering={false}
          allowSorting={true}
          width={"10%"}
          alignment={"center"} 
          />

        <Column dataField="NombreCompleto"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
          // cellRender={DoubleLineLabel}
          allowSorting={true}
          allowHeaderFiltering={false}
          width={"15%"}
        />

      <Column dataField="Compania"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" })}
          allowHeaderFiltering={false}
          allowSorting={true}
        />

        <Column dataField="IdContrato" 
          caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" })} 
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
            />

        <Column dataField="Posicion"
          caption={intl.formatMessage({ id: "ADMINISTRATION.POSITION" })}
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={true}
        />

        <Column dataField="FechaInicio" 
        caption={intl.formatMessage({ id: "ACCESS.GROUP.RESTRICTION.STARTDATE" })}
        dataType="date" format="dd/MM/yyyy" 
        alignment={"center"}
        allowHeaderFiltering={false}
        allowFiltering={false}
        />

        <Column dataField="FechaFin" 
        caption={intl.formatMessage({ id: "ACCESS.GROUP.RESTRICTIONS.ENDDATE" })} 
        dataType="date" format="dd/MM/yyyy" 
        alignment={"center"}
        allowHeaderFiltering={false}
        allowFiltering={false}
        />

        <Column
          dataField="Condicion"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONDITION" })}
          allowSorting={true}
          allowHeaderFiltering={false}
          allowFiltering={false}
          alignment={"center"} 
        />

        <Column
          dataField="FechaFiltro"
          caption={props.condicion === 'ALTAS' ? intl.formatMessage({ id: "CASINO.PERSON.GROUP.DATE" }) + " " + intl.formatMessage({ id: "ADMINISTRATION.REPORT.MOVEMENT.HIGH" }) : intl.formatMessage({ id: "CASINO.PERSON.GROUP.DATE" }) + " " + intl.formatMessage({ id: "ADMINISTRATION.REPORT.MOVEMENT.COMEDOWN" })}
          dataType="date"
          format="dd/MM/yyyy"
          alignment={"center"}
          allowHeaderFiltering={false}
          allowFiltering={false}
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

ReporteMovimientoEstadisticasDetalleListPage.propTypes = {
  titulo: PropTypes.string,
  showButtons: PropTypes.bool,
  uniqueId: PropTypes.string,
  filtro: PropTypes.object,
}
ReporteMovimientoEstadisticasDetalleListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  uniqueId: 'ReporteMovimientoEstadisticasDetalleListPage',
  filtro: { 
    IdCompania: "",
    UnidadesOrganizativas: "",
    IdDivision: "",
    IdPosicion: "",
    Condicion:"",
    Activo:"",
    FechaInicio:"",
    FechaFin:"",
    Funcion:"",
  }
     
}

export default injectIntl(WithLoandingPanel(ReporteMovimientoEstadisticasDetalleListPage));
