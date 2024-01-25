import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { PortletBody } from "../../../../../partials/content/Portlet";
import { DataGrid, Column, FilterRow, HeaderFilter, FilterPanel } from "devextreme-react/data-grid";
import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { initialFilter } from "./PermanenciaTrabajadorIndexPage";

import { filtrarR007 } from "../../../../../api/acceso/reporte.api";

const PermanenciaTrabajadorListPage = props => {
  const { intl, setDataGridRef, dataIdCompania } = props;
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  //Variables de CustomerDataGrid
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({
    ...initialFilter,
    //IdCliente,
    IdDivision,
  });

  // PAGINATION
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;


  useEffect(() => {
    if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage])

  useEffect(() => {
    if (dataIdCompania) {
      Object.assign(filterData, { 'IdCompania': dataIdCompania[0].IdCompania });
    }
  }, [dataIdCompania]);

  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter =
    [
      //'IdCliente',
      'IdDivision',
      'IdCompania',
      'IdUnidadOrganizativa',
      'IdPosicion',
      'Personas',
      'IdCentroCosto',
      //'IdPlanilla',
      'Estado',
      'FechaInicio',
      'FechaFin'

    ];

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'INACTIVO') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  const renderDataGrid = ({ gridRef, dataSource }) => {
    setDataGridRef(gridRef);
    return (
      <>
        <DataGrid
          dataSource={dataSource}
          ref={gridRef}
          focusedRowEnabled={true}
          allowColumnReordering={true}
          allowColumnResizing={true}
          columnAutoWidth={true}
          onCellPrepared={onCellPrepared}
        >
          <FilterRow visible={false} showOperationChooser={false} />
          <HeaderFilter visible={false} />
          <FilterPanel visible={false} />

          <Column
            dataField="CompaniaContratista"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" })}
            allowSorting={true}
            allowHeaderFiltering={false}
            width={"15%"}
          />

          <Column
            dataField="CompaniaSubContratista"
            caption={intl.formatMessage({ id: "ACCREDITATION.PEOPLE.EDIT.COMPANY.SUBCONTRACTOR" })}
            allowSorting={true}
            allowHeaderFiltering={false}
            width={"10%"}
          />

          <Column
            dataField="IdContrato"
            caption={intl.formatMessage({ id: "ACCREDITATION.EDIT.CONTRACT" })}
            allowSorting={true}
            allowHeaderFiltering={false}
            width={"10%"}
          />

          <Column
            dataField="UnidadOrganizativa"
            caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.UNIDADORGANIZATIVA" })}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"10%"}
          />

          <Column dataField="IdPersona"
            caption={intl.formatMessage({ id: "COMMON.CODE" })}
            allowHeaderFiltering={false}
            allowSorting={true}
            width={"7%"}
            alignment={"center"} />
          <Column
            dataField="NombreCompleto"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
            allowSorting={true}
            allowHeaderFiltering={false}
            width={"20%"}
          />

          <Column dataField="TipoDocumento"
            caption={intl.formatMessage({ id: "CASINO.REPORT.DOCUMENTTYPE" })}
            allowHeaderFiltering={false}
            width={"7%"}
            alignment={"center"}
          />

          <Column dataField="Documento"
            caption={intl.formatMessage({ id: "CASINO.REPORT.DOCUMENTNUMBER" })}
            allowHeaderFiltering={false}
            width={"7%"}
            alignment={"center"}
          />

          <Column
            dataField="Posicion"
            caption={intl.formatMessage({ id: "ACCREDITATION.COMPANY.DATA.POSITION" })}
            alignment={"center"}
            allowHeaderFiltering={true}
            allowFiltering={false}
            width={"8%"}
          />

          <Column
            dataField="FechaMarca"
            caption={intl.formatMessage({ id: "CASINO.MARKING.DATEMARKING" })}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            alignment={"center"}
            width={"13%"}
          />

          <Column
            dataField="PermanenciaDias"
            caption={intl.formatMessage({ id: "ACCESS.REPORT.CURRENT.STAYDAYS" })}
            alignment={"center"}
            allowHeaderFiltering={true}
            allowFiltering={false}
            width={"8%"}
          />

          <Column
            dataField="PermanenciaHoras"
            caption={intl.formatMessage({ id: "ACCESS.REPORT.CURRENT.STAYHOURS" })}
            alignment={"center"}
            allowHeaderFiltering={true}
            allowFiltering={false}
            width={"8%"}
          />

        </DataGrid>
      </>
    );
  }

  return (
    <>

      <PortletBody>
        <CustomDataGrid
        showLog={false} 
          uniqueId={props.uniqueId}
          dataSource={props.dataSource}
          rowNumberName='RowIndex'
          loadWhenStartingComponent={props.isFirstDataLoad && !props.refreshData}
          renderDataGrid={renderDataGrid}
          loadUrl={filtrarR007}
          forceLoad={forceLoadTypes.Unforced}
          sendToServerOnlyIfThereAreChanges={true}
          ifThereAreNoChangesLoadFromStorage={ifThereAreNoChangesLoadFromStorage}
          caseSensitiveWhenCheckingForChanges={true}
          uppercaseFilterRow={true}
          initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'NombreCompleto', order: 'asc' } }}
          filterRowSize='sm'
          summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}
          visibleCustomFilter={false}
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
PermanenciaTrabajadorListPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string

}
PermanenciaTrabajadorListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  showHeaderInformation: false,
  uniqueId: 'reporte_r007_NombreReporteListPage'
}

export default injectIntl(PermanenciaTrabajadorListPage);
