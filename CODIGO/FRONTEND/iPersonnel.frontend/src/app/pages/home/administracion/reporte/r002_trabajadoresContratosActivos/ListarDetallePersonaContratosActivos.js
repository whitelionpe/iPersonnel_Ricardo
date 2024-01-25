import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { PortletBody } from "../../../../../partials/content/Portlet";
import { DataGrid, Column, Editing, FilterRow, HeaderFilter, FilterPanel } from "devextreme-react/data-grid";

import { isNotEmpty } from "../../../../../../_metronic";
import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";

import { storeReportePersonasActivosDetalle as loadUrl } from "../../../../../api/administracion/reporte.api";
import { initialFilter } from "./TrabajadoresContratosActivosIndexPage";

const ListarDetallePersonaContratosActivos = props => {
  const { intl, focusedRowKey } = props;
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);

  //Variables de CustomerDataGrid
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const  { IdCompaniaMandante, IdCompaniaContratista,IdContrato} = props.filtroLocal;
  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente,IdCompaniaMandante, IdCompaniaContratista,IdContrato});
  // PAGINATION
  // ------------------------------
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);

  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  }

  useEffect(() => {
    const  { IdCompaniaMandante, IdCompaniaContratista,IdContrato} = props.filtroLocal;
   setTimeout(function() {
     props.dataSource.loadDataWithFilter({ data: {IdCliente: IdCliente, IdCompaniaMandante,IdCompaniaContratista,IdContrato } });
   }, 500);
  }, [props.filtroLocal]);


  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter = [
        'IdCliente',
        'IdCompaniaMandante',
        'IdCompaniaContratista',
        'IdContrato',
        'RucSubContratista',
        'CompaniaSubContratista',
        'Documento',
        'NombreCompleto',
      ];
 
  const renderDataGrid = ({ gridRef, dataSource }) => {
    props.setDataGridRefDetail(gridRef);
    return (
      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        focusedRowEnabled={true}
        focusedRowKey={focusedRowKey}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
      >
        <Editing mode="row"
          useIcons={false}
          allowUpdating={false}
          allowDeleting={false}
          texts={textEditing} 
        />

        <FilterRow visible={true} showOperationChooser={false} />
        <HeaderFilter visible={false} />
        <FilterPanel visible={false} />
          <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}  />
          <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })} />
          <Column dataField="RucSubContratista" caption={intl.formatMessage({ id: "ADMINISTRATION.RUC.SUB.CONTRACTOR" })} alignment={"center"} />
          <Column dataField="CompaniaSubContratista" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBCONTRACTOR" })}  />
          <Column dataField="UnidadOrganizativa" caption={intl.formatMessage({ id: "ADMINISTRATION.POSITION.ORGANIZATIONALUNIT" })}  />
          <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
          <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} />

      </DataGrid>
    );
  }

  return (
    <>
   
      <PortletBody>
        <CustomDataGrid
         showLog={false} 
          uniqueId={props.uniqueId} //'personaList'
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
          // CUSTOM FILTER
          //cssClassAppBar={classesEncabezado.secundario}
          //cssClassToolbar={classesEncabezado.toolbar}
          //renderFormTitleCustomFilter={renderFormTitleCustomFilter}
          //titleCustomFilter='Datos a consultar'
          // visibleCustomFilter={isActiveFilters}
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
ListarDetallePersonaContratosActivos.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string,
  selected: PropTypes.object,

}
ListarDetallePersonaContratosActivos.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  showHeaderInformation: false,
  uniqueId: 'personaListReport',
  selected: { IdDivision: "" }
}

export default injectIntl(ListarDetallePersonaContratosActivos);
