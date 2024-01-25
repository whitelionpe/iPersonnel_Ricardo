import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { DataGrid, Column, FilterRow, HeaderFilter, FilterPanel } from "devextreme-react/data-grid";

import { isNotEmpty, listarEstadoAprobacion, dateFormat } from "../../../../../../_metronic";
import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";

import { storeListarR004 as loadUrl, service } from "../../../../../api/campamento/reporte.api";
import { initialFilter } from "./ReporteSolicitudesHabitacionIndexPage";

const ReporteSolicitudesHabitacionListPage = props => {
  const { intl, focusedRowKey, setLoading, setDataGridRef } = props;
  const { IdCliente, IdPerfil, IdDivision, Division } = useSelector(state => state.perfil.perfilActual);
  //const IdDivisionPerfil = useSelector(state => state.perfil.perfilActual.IdDivision);

  const { IdDivisionPerfil } = props.selected;

  //Variables de CustomerDataGrid
  const [isActiveFilters, setIsActiveFilters] = useState(true);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({
    ...initialFilter, IdCliente, IdDivision, Division,
    IdPerfil,
    IdDivisionPerfil

  });
  // PAGINATION
  // ------------------------------
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  let dataGridRef = React.useRef();

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-:::::::::::::::::::::::::::::::::

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  };

  useEffect(() => {
    if (props.refreshData) {
      props.refresh();
      props.setRefreshData(false);
    }
  }, [props.refreshData]);

  useEffect(() => {
    if (IdDivision) {
      setTimeout(() => {
        props.dataSource.loadDataWithFilter({ data: { IdDivision } });
      }, 500)
    }
  }, [IdDivision]);

  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter = ['IdCliente', 'IdDivision', 'IdCompaniaContratista', 'CompaniaContratista',
    'EstadoSolicitud', 'FechaInicio', 'FechaFin'];

  const renderDataGrid = ({ gridRef, dataSource }) => {
    setDataGridRef(gridRef);
    if (dataSource._storeLoadOptions.filter !== undefined) {
      if (props.totalRowIndex === 0) {
        props.setTotalRowIndex(dataSource._totalCount);
      }
      if (dataSource._totalCount != props.totalRowIndex) {
        if (dataSource._totalCount != -1) {
          props.setFocusedRowKey();
          props.setTotalRowIndex(dataSource._totalCount);
        }
      }
    }
    dataGridRef = gridRef;
    return (
      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        keyExpr="RowIndex"
        showBorders={true}
        remoteOperations={true}
        onCellPrepared={onCellPrepared}
        onFocusedRowChanged={seleccionarRegistro}
        focusedRowEnabled={true}
        focusedRowKey={focusedRowKey}
        repaintChangesOnly={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
        scrolling={{ showScrollbar: 'always' }}
        className="tablaScrollHorizontal"
      >
        <FilterRow visible={true} showOperationChooser={false} />
        <HeaderFilter visible={false} />
        <FilterPanel visible={false} />
        <Column
          dataField="RowIndex"
          caption="#"
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          width={"35px"}
          alignment={"center"} />
        <Column
          dataField="IdSolicitud"
          caption={intl.formatMessage({ id: "COMMON.CODE" })}
          allowHeaderFiltering={false}
          alignment={"center"}
          allowFiltering={false}
          width={"80px"}
        />
        <Column dataField="Campamento"
          caption={intl.formatMessage({ id: "CAMP.RESERVATION.CAMPAMENT" })}
          allowHeaderFiltering={false}
          allowSorting={true}
          allowFiltering={false}
          width={"150px"}
        />
        <Column
          dataField="CompaniaContratista"
          caption={intl.formatMessage({ id: "ADMINISTRATION.POSITION.CONTRACTOR" })}
          allowSorting={false}
          allowHeaderFiltering={false}
          allowFiltering={true}
          width={"250px"}
        />
        <Column
          dataField="CompaniaSubcontratista"
          caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBCONTRACTOR" })}
          allowSorting={false}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width={"250px"}
        />
        <Column
          dataField="IdContrato"
          caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" })}
          allowSorting={false}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width={"130px"}
        />
        <Column
          dataField="NombreCompleto"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
          allowFiltering={false}
          allowSorting={true}
          allowHeaderFiltering={false}
          width={"250px"}
        />
        <Column
          dataField="FechaSolicitud"
          caption={intl.formatMessage({ id: "ADMINISTRATION.REQUEST.DATE" })}
          allowSorting={false}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width={"120px"}
        />
        <Column
          dataField="FechaInicio"
          caption={intl.formatMessage({ id: "COMMON.STARTDATE" })}
          allowSorting={false}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width={"100px"}
        />
        <Column
          dataField="FechaFin"
          caption={intl.formatMessage({ id: "COMMON.ENDDATE" })}
          allowSorting={false}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width={"100px"}
        />
        <Column
          dataField="EstadoAprobacionDescrip"
          caption={intl.formatMessage({ id: "COMMON.STATE" })}
          allowSorting={false}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width={"70px"}
        />
        <Column
          dataField="FechaAprobacion"
          caption={intl.formatMessage({ id: "CAMP.RESERVATION.REQUEST_APPROVAL_DENIAL_DATE" })}
          allowSorting={false}
          allowHeaderFiltering={false}
          allowFiltering={false}
          alignment={"center"}
          width={"180px"}
        />
        <Column
          dataField="UsuarioAprobacion"
          caption={intl.formatMessage({ id: "SECURITY.USER.USER" })}
          allowSorting={false}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width={"250px"}
        />
        <Column
          dataField="Observacion"
          caption={intl.formatMessage({ id: "COMMON.OBSERVATION" })}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width={"300px"}
        />
        <Column
          dataField="IdReserva"
          caption={intl.formatMessage({ id: "CONFIG.MENU.CAMPAMENTOS.MASIVO" })}
          alignment={"center"}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width={"80px"}
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
          sendToServerOnlyIfThereAreChanges={true}
          ifThereAreNoChangesLoadFromStorage={ifThereAreNoChangesLoadFromStorage}
          caseSensitiveWhenCheckingForChanges={true}
          uppercaseFilterRow={true}
          initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'IdSolicitud', order: 'asc' } }}
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
ReporteSolicitudesHabitacionListPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string,
  selected: PropTypes.object,

}
ReporteSolicitudesHabitacionListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  showHeaderInformation: false,
  uniqueId: 'r004SolicitudesHabitacionList',
  selected: { IdDivision: "" }
}

export default injectIntl(WithLoandingPanel(ReporteSolicitudesHabitacionListPage));
