import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { PortletBody } from "../../../../../partials/content/Portlet";
import { DataGrid, Column, FilterRow, HeaderFilter, FilterPanel,Scrolling } from "devextreme-react/data-grid";
import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { initialFilter } from "./EmpleadosIndexPage";

import { filtrarEmpleados } from "../../../../../api/asistencia/reporte.api";

const EmpleadosListPage = props => {
  const { intl, setDataGridRef, dataIdCompania } = props;
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  //Variables de CustomerDataGrid
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({
    ...initialFilter,
    IdCliente,
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
      'IdCliente',
      'IdDivision',
      'CodigoPlanilla',
      'IdCompania',
      'IdUnidadOrganizativa',
      'IdPosicion',
      'Personas',
      'IdCentroCosto',
      'IdPlanilla',
      'Estado',
      'FechaInicio',
      'FechaFin'

    ];

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Estado === 'INACTIVO') {
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
          <Scrolling columnRenderingMode="virtual"/> 

          <Column dataField="IdPersona"
            caption={intl.formatMessage({ id: "COMMON.CODE" })}
            allowHeaderFiltering={false}
            allowSorting={true}
            width={"90"}
            alignment={"center"} />
          <Column
            dataField="NombreCompleto"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
            allowSorting={true}
            allowHeaderFiltering={false}
            width={"230"}
          />

        <Column dataField="TipoDocumentoAlias"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE.DOCU" })}
            allowHeaderFiltering={false}
            width={"65"}
            alignment={"center"}
          />

          <Column dataField="Documento"
            caption={intl.formatMessage({ id: "CASINO.REPORT.DOCUMENTNUMBER" })}
            allowHeaderFiltering={false}
            width={"100"}
            alignment={"center"}
          />

          <Column
            dataField="Estado"
            caption={intl.formatMessage({ id: "CASINO.REPORT.WORKINGSTATUS" })}
            alignment={"center"}
            allowHeaderFiltering={true}
            allowFiltering={false}
            width={"90"}
          />

          <Column
            dataField="UnidadOrganizativa"
            caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.UNIDADORGANIZATIVA" })}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"150"}
          />

          <Column
            dataField="Division"
            caption={intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.VENUES" })}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"100"}
          />

          <Column
            dataField="CentroCosto"
            caption={intl.formatMessage({ id: "CASINO.REPORT.COSTCENTER" })}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"120"}
          />

        <Column
            dataField="Planilla"
            caption={intl.formatMessage({ id: "ASSISTANCE.PAYROLL" })}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"90"}
          />
          <Column
            dataField="CodigoPlanilla"
            caption={intl.formatMessage({ id: "CASINO.REPORT.SPREADCODE" })}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"90"}
          />
          <Column
            dataField="Grupo"
            caption={intl.formatMessage({ id: "ACCESS.GROUP" })}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"90"}
          />
        <Column
            dataField="FechaIngreso"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENTRYDATE" })}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            alignment={"center"}
            width={"120"}
          />
      <Column
            dataField="FechaFin"
            caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.DATE" })}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            alignment={"center"}
            width={"120"}
          />

        <Column
            dataField="Funcion"
            caption={intl.formatMessage({ id: "ADMINISTRATION.POSITION.FUNCTION" })}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"120"}
          />

          <Column
            dataField="Posicion"
            caption={intl.formatMessage({ id: "ACCREDITATION.COMPANY.DATA.POSITION" })}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            //alignment={"center"}
            width={"120"}
          />

          <Column
            dataField="Fiscalizable"
            caption={intl.formatMessage({ id: "ADMINISTRATION.POSITION.CONTROLLABLE" })}
            alignment={"center"}
            allowHeaderFiltering={true}
            allowFiltering={false}
            width={"90"}
          />          

          <Column
            dataField="Confianza"
            caption={intl.formatMessage({ id: "ADMINISTRATION.POSITION.TRUST" })}
            alignment={"center"}
            allowHeaderFiltering={true}
            allowFiltering={false}
            width={"90"}
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
          loadUrl={filtrarEmpleados}
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
EmpleadosListPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string

}
EmpleadosListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  showHeaderInformation: false,
  uniqueId: 'reporte_r010_EmpleadosListPage'
}

export default injectIntl(EmpleadosListPage);
