import React, { useEffect, useState } from 'react';
import { injectIntl } from "react-intl";
import { DataGrid, Column, Summary, TotalItem } from "devextreme-react/data-grid";
import { useSelector } from "react-redux";
import { PortletBody } from "../../../../../partials/content/Portlet";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import PropTypes from 'prop-types';
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { dateFormat } from "../../../../../../_metronic";
import { rpt_001_ConsumoComedoresNegado as loadUrl } from '../../../../../api/casino/reporte.api';
import './ConsumoComedoresPage.css';
//import { initialFilter } from "./ConsumoComedoresIndexPage";
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";

const ConsumoComedoresListPage = (props) => {
  const { intl, setDataGridRef, dataRowEditNew } = props;
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({
    ...dataRowEditNew,
    IdCliente,
    IdDivision: IdDivision, //isNotEmpty(IdDivision) ? IdDivision : "",
    FechaInicio: dateFormat(dataRowEditNew.FechaInicio, 'yyyyMMdd'),
    FechaFin: dateFormat(dataRowEditNew.FechaFin, 'yyyyMMdd')
  });
  // PAGINATION
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);


  useEffect(() => {
    if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage]);

  useEffect(() => {
    if (props.refreshData) {
      props.refresh();
      props.setRefreshData(false);
    }
  }, [props.refreshData]);


  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter =
    [
      'IdCliente',
      'IdDivision',
      'IdUnidadOrganizativa',
      'UnidadOrganizativa',
      'UnidadesOrganizativas',
      'IdComedor',
      'IdServicio',
      'IdCompania',
      'IdCentroCosto',
      'IdPersona',
      'FechaInicio',
      'FechaFin',
      'Personas'
    ];

  const renderDataGrid = ({ gridRef, dataSource }) => {
    setDataGridRef(gridRef);
    return (
      <>
        <DataGrid
          dataSource={dataSource}
          showBorders={true}
          repaintChangesOnly={true}
          allowColumnReordering={true}
          allowColumnResizing={true}
          columnAutoWidth={true}
          ref={gridRef}
          scrolling={{ showScrollbar: 'always' }}
          className="tablaScrollHorizontal"
        >

          <Column
            dataField="Comedor"
            caption={intl.formatMessage({ id: "CASINO.DINNINGROOM" })}
            allowSorting={true}
            allowHeaderFiltering={false}
            alignment={"left"}
            width={"200px"}
          />
          <Column dataField="Ruc"
            caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.RUC" })}
            allowHeaderFiltering={false}
            width={"100px"}
            alignment={"center"}
          />

          <Column dataField="Compania"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" })}
            allowHeaderFiltering={false}
            allowSorting={true}
            width={"200px"}
          />

          <Column dataField="UnidadOrganizativa"
            caption={intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.ORGANIZATIONALUNIT" })}
            allowHeaderFiltering={false}
            allowSorting={true}
            width={"200px"}
          />

          <Column dataField="CompaniaSubContratista"
            caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBCONTRACTOR" })}
            allowHeaderFiltering={false}
            allowSorting={true}
            width={"200px"}
          />

          <Column dataField="Documento"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}
            allowHeaderFiltering={false}
            width={"150px"}
            alignment={"center"}
          />

          <Column
            dataField="NombreCompleto"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
            allowSorting={true}
            allowHeaderFiltering={false}
            width={"250px"}

          />
          <Column dataField="Servicio"
            caption={intl.formatMessage({ id: "CAMP.CAMP.ROOMSERVICE.SERVICE" })}
            allowHeaderFiltering={false}
            width={"100px"}
            alignment={"left"}
          />

          <Column
            dataField="FechaMarca"
            caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" })}
            dataType="date"
            format="dd/MM/yyyy"
            alignment={"center"}
            allowHeaderFiltering={false}
            allowFiltering={false}
            width="80px"
          />
          <Column
            dataField="Hora"
            caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.HOUR" })}
            alignment={"center"}
            allowHeaderFiltering={false}
            allowFiltering={false}
            width="50px"
          />
          <Column
            dataField="IdEquipo"
            caption={intl.formatMessage({ id: "ADMINISTRATION.ZONE.DEVICE" })}
            alignment={"center"}
            allowHeaderFiltering={false}
            allowFiltering={false}
            width="80px"
          />
          <Column
            dataField="TipoMarcacion"
            caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.REASON" })}
            alignment={"left"}
            allowHeaderFiltering={false}
            allowFiltering={false}
            width="350px"
          />
        </DataGrid>
      </>
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
          initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'Comedor', order: 'asc' } }}
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


ConsumoComedoresListPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string

}
ConsumoComedoresListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  showHeaderInformation: false,
  uniqueId: 'consumoComedoresNegadoList'
}

export default injectIntl(WithLoandingPanel(ConsumoComedoresListPage));
