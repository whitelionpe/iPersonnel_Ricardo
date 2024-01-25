import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { PortletBody } from "../../../../../partials/content/Portlet";
import { DataGrid, Column, FilterRow, HeaderFilter, FilterPanel } from "devextreme-react/data-grid";
import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { initialFilter } from "./PersonalConHorarioIndexPage";

import { filtrarPersonalConHorario } from "../../../../../api/asistencia/reporte.api";

const PersonalConHorarioListPage = props => {
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
    if (dataIdCompania) {
      Object.assign(filterData, { 'IdCompania': dataIdCompania[0].IdCompania });

    }

  }, [dataIdCompania]);

  useEffect(() => {
    if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage])

  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter =
    [
      'IdCliente',
      'IdDivision',
      'IdCompania',
      'IdUnidadOrganizativa',
      'IdPosicion',
      'Personas',
      'IdCentroCosto',
      'IdPlanilla',
      'CodigoPlanilla',
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
          <Column
            dataField="TipoDocumentoAlias"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE.DOCU" })}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            alignment={"center"}
            width={"5%"}
          />

          <Column
            dataField="Documento"
            caption={intl.formatMessage({ id: "CASINO.REPORT.DOCUMENTNUMBER" })}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            alignment={"center"}
            width={"10%"}
          />

        <Column
            dataField="Estado"
            caption={intl.formatMessage({ id: "CASINO.REPORT.WORKINGSTATUS" })}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            alignment={"center"}
            width={"8%"}
          />

          <Column
            dataField="UnidadOrganizativa"
            caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.UNIDADORGANIZATIVA" })}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"12%"}
          />

          <Column
            dataField="Division"
            caption={intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.VENUES" })}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={true}
            alignment={"left"}
            width={"10%"}
          />

          <Column
            dataField="CentroCosto"
            caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CENTROCOSTO" })}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"10%"}
          />           

          <Column
            dataField="Horario"
            caption={intl.formatMessage({ id: "ACCESS.SCHEDULE.SCHEDULE" })}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"15%"}
          />
          <Column
            dataField="DiasDescanso"
            caption={intl.formatMessage({ id: "ADMINISTRATION.REGIME.DAYSOFF.REST" })}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            alignment={"center"}
            width={"15%"}
          />
          <Column
            dataField="FechaInicio"
            caption={intl.formatMessage({ id: "COMMON.STARTDATE.SHORT" })}
            alignment={"center"}
            allowHeaderFiltering={true}
            allowFiltering={false}
            width={"10%"}
          />
          <Column
            dataField="FechaFin"
            caption={intl.formatMessage({ id: "COMMON.ENDDATE.SHORT" })}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            alignment={"center"}
            width={"10%"}
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
          loadUrl={filtrarPersonalConHorario}
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
PersonalConHorarioListPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string

}
PersonalConHorarioListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  showHeaderInformation: false,
  uniqueId: 'Reporte_R002_PersonalConHorarioListPage'
}

export default injectIntl(PersonalConHorarioListPage);
