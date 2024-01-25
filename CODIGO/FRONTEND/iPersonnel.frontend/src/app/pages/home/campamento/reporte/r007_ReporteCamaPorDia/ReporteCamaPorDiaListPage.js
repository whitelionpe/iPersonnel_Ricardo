import React, { useEffect, useState } from 'react';
import { injectIntl } from "react-intl";
import { DataGrid, Column } from "devextreme-react/data-grid";
import { useSelector } from "react-redux";
import { PortletBody } from "../../../../../partials/content/Portlet";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import PropTypes from 'prop-types';
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { dateFormat, isNotEmpty } from "../../../../../../_metronic";
import { rpt_007_CamasPorDia as loadUrl } from '../../../../../api/campamento/reporte.api';
import { initialFilter } from "./ReporteCamaPorDiaIndexPage";
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";

const ReporteCamaPorDiaListPage = (props) => {

  const { intl, setDataGridRef,dataRowEditNew } = props;
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);
  const [, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({
    ...initialFilter,
    IdCliente,
    IdDivision: isNotEmpty(IdDivision) ? IdDivision : "",
    Fecha: dateFormat(dataRowEditNew.Fecha, 'yyyyMMdd'),
    Inactivas: 'N'
  });
  // PAGINATION
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);


  useEffect(() => {
    if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage])
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
      'Fecha',
      'IdCampamento',
      'IdTipoModulo',
      'IdModulo',
      'IdHabitacion',
      'Inactivas'
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
            dataField="Fecha"
            caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" })}
            allowSorting={false}
            allowHeaderFiltering={false}
            alignment={"center"}
            width={"100px"}
          />
          <Column dataField="Campamento"
            caption={intl.formatMessage({ id: "CAMP.RESERVATION.CAMPAMENT" })}
            allowHeaderFiltering={false}
            width={"150px"}
            alignment={"left"}
          />

          <Column dataField="Modulo"
            caption={intl.formatMessage({ id: "CAMP.MODULE" })}
            allowHeaderFiltering={false}
            allowSorting={false}
            width={"100px"}
          />

          <Column dataField="Habitacion"
            caption={intl.formatMessage({ id: "CAMP.ROOM" })}
            allowHeaderFiltering={false}
            allowSorting={false}
            alignment="center"
            width={"100px"}
          />

          <Column dataField="Cama"
            caption={intl.formatMessage({ id: "CAMP.ROOM.BED" })}
            allowHeaderFiltering={false}
            allowSorting={false}
            alignment="center"
            width={"100px"}
          />

          <Column dataField="Estatus"
            caption={intl.formatMessage({ id: "COMMON.STATUS" })}
            allowHeaderFiltering={false}
            width={"80px"}
            alignment={"center"}
          />

          <Column
            dataField="EstadoCama"
            caption={intl.formatMessage({ id: "COMMON.STATE" })}
            allowSorting={false}
            alignment="center"
            allowHeaderFiltering={false}
            width={"100px"}

          />
          <Column dataField="Compania"
            caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" })}
            allowHeaderFiltering={false}
            width={"250px"}
            alignment={"left"}
          />

          <Column
            dataField="Subcontratista"
            caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBCONTRACTOR" })}
            alignment={"left"}
            allowHeaderFiltering={false}
            allowFiltering={false}
            width="250px"
          />
          <Column
            dataField="Contrato"
            caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" })}
            alignment={"left"}
            allowHeaderFiltering={false}
            allowFiltering={false}
            width="150px"
          />
          <Column
            dataField="NombreCompleto"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
            alignment={"left"}
            allowHeaderFiltering={false}
            allowFiltering={false}
            width="350px"
          />

          <Column
            dataField="Genero"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.GENDER" })}
            allowHeaderFiltering={false}
            allowSorting={false}
            width={"80px"}
            alignment={"center"}
          />
          <Column
            dataField="IdPersona"
            caption={intl.formatMessage({ id: "COMMON.CODE" })}
            allowHeaderFiltering={false}
            allowSorting={false}
            width={"100px"}
            alignment={"center"}
          />

          <Column
            dataField="Documento"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}
            allowHeaderFiltering={false}
            allowSorting={false}
            width={"100px"}
            alignment={"center"}
          />
          <Column
            dataField="Cargo"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.POSITION" })}
            allowHeaderFiltering={false}
            allowSorting={true}
            width={"250px"}
            alignment={"left"}
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
          initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'Fecha', order: 'asc' } }}
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


ReporteCamaPorDiaListPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string

}
ReporteCamaPorDiaListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  showHeaderInformation: false,
  uniqueId: 'camaPorDiaList'
}

export default injectIntl(WithLoandingPanel(ReporteCamaPorDiaListPage));
