import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { PortletBody } from "../../../../../partials/content/Portlet";
import { DataGrid, Column, FilterRow, HeaderFilter, FilterPanel, Scrolling ,Button as ColumnButton} from "devextreme-react/data-grid";
import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { initialFilter } from "./CalculoBonoNocturnoIndexPage";

import { filtrarCalculoBonoNocturno } from "../../../../../api/asistencia/reporte.api";

const CalculoBonoNocturnoListPage = props => {
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

  //VerDetalle
  function VerDetalle(e) { 
    props.VerDetalle(e.row.data);
    
  }


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
      'IdPersona',
      'NombreCompleto',
      'Documento',
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
          noDataText={intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.NO_DATA" })}  //ASSISTANCE.PERSON.JUSTIFICATION.NO_DATA
        >
          <FilterRow visible={false} showOperationChooser={false} />
          <HeaderFilter visible={false} />
          <FilterPanel visible={false} />
          <Scrolling columnRenderingMode="virtual" />

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
            alignment={"center"}
            width={"100"}
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
            caption={intl.formatMessage({ id: "ADMINISTRATION.POSITION.ORGANIZATIONALUNIT" })}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"150"}
          />
          <Column
            dataField="Division"
            caption={intl.formatMessage({ id: "SYSTEM.DIVISION" })}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"100"}
          />
          <Column
            dataField="CentroCosto"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.COSTCENTER" })}
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
            alignment={"center"}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"90"}
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
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.COSTCENTER.POSITION.POSITION" })}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"150"}
          />
          <Column
            dataField="MinutosBonoNocturno"
            caption={intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.TIEMPO_BONO_NOCTURNO" })}
            alignment={"center"}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"200"}
          />

          <Column type="buttons" width={105} >
            <ColumnButton icon="fa fa-eye" hint={intl.formatMessage({ id: "ACTION.DETAIL", })} onClick={VerDetalle} 
            visible={true} /> 
          </Column>

        </DataGrid>
      </>
    );
  }



  return (
    <>
      <div id="divGridCalculoBonoNocturno">
        <PortletBody>
          <CustomDataGrid
          showLog={false} 
            uniqueId={props.uniqueId}
            dataSource={props.dataSource}
            rowNumberName='RowIndex'
            loadWhenStartingComponent={props.isFirstDataLoad && !props.refreshData}
            renderDataGrid={renderDataGrid}
            loadUrl={filtrarCalculoBonoNocturno}
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
      </div>
    </>
  );
};
CalculoBonoNocturnoListPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string

}
CalculoBonoNocturnoListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  showHeaderInformation: false,
  uniqueId: 'reporte_r007_CalculoBonoNocturnoListPage'
}

export default injectIntl(CalculoBonoNocturnoListPage);
