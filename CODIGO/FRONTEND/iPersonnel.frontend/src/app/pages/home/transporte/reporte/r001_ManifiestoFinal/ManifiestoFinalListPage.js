import {injectIntl} from "react-intl";
import PropTypes from "prop-types";
import React, {useEffect, useState} from "react";
import {initialFilter} from "./ManifiestoFinalIndexPage";
import {Column, DataGrid, FilterPanel, FilterRow, HeaderFilter, Scrolling} from "devextreme-react/data-grid";
import CustomDataGrid, {forceLoadTypes} from "../../../../../partials/components/CustomDataGrid";

import {PortletBody} from "../../../../../partials/content/Portlet";
import {filtrarReporteManifiestoFinal} from "../../../../../api/transporte/reporte.api";
import {CalendarToday, Reorder} from "@material-ui/icons";
import TabNavContainer from "../../../../../partials/components/Tabs/TabNavContainer";
import {useStylesTab} from "../../../../../store/config/Styles";

const ManifiestoFinalListPage = (props) => {
  const { intl, setDataGridRef } = props;

  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({
    ...initialFilter
  });

  // PAGINATION
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;

  const classes = useStylesTab();

  const [tabIndex, setTabIndex] = useState(0);

  const handleChangeTabIndex = (event, newValue) => {
    setTabIndex(newValue);
  };

  useEffect(() => {
    if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage])

  const keysToGenerateFilter =
    [
      'Fecha',
      'IdRuta'
    ];

  const renderDataGrid = ({ gridRef, dataSource }) => {
    setDataGridRef(gridRef);

    return (
      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        focusedRowEnabled={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
      >
        <FilterRow visible={false} showOperationChooser={false} />
        <HeaderFilter visible={false} />
        <FilterPanel visible={false} />
        <Scrolling columnRenderingMode="virtual"/>

        <Column
          dataField="Ruta"
          caption={intl.formatMessage({ id: "TRANSPORTE.ROUTE" })}
          allowHeaderFiltering={false}
          //width={"100"}
          alignment={"center"}
          allowSorting={true}
        />

        <Column
          dataField="Fecha"
          caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          alignment={"center"}
          //width={"100"}
        />

        <Column
          dataField="Hora"
          caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.HOUR" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          alignment={"center"}
          //width={"100"}
        />

        <Column
          dataField="Placa"
          caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.LICENSEPLATE" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          alignment={"center"}
          //width={"100"}
        />

        <Column
          dataField="Unidad"
          caption={intl.formatMessage({ id: "SYSTEM.REPOSITORY.UNIT" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          alignment={"center"}
          //width={"100"}
        />

        <Column
          dataField="Reservados"
          caption={intl.formatMessage({ id: "TRANSPORTE.MANIFEST.RESERVED" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          alignment={"center"}
          //width={"100"}
        />

        <Column
          dataField="Piloto"
          caption={intl.formatMessage({ id: "TRANSPORTE.MANIFEST.PILOT" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          alignment={"center"}
          //width={"100"}
        />

        <Column
          dataField="Copiloto"
          caption={"Copiloto"}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          alignment={"center"}
          //width={"100"}
        />

      </DataGrid>
    );
  }

  const tabContent_Resumen = () => {
    return (
      <CustomDataGrid
        showLog={false}
        uniqueId={props.uniqueId}
        dataSource={props.dataSource}
        rowNumberName='RowIndex'
        loadWhenStartingComponent={false}
        renderDataGrid={renderDataGrid}
        loadUrl={filtrarReporteManifiestoFinal}
        forceLoad={forceLoadTypes.Unforced}
        sendToServerOnlyIfThereAreChanges={true}
        ifThereAreNoChangesLoadFromStorage={ifThereAreNoChangesLoadFromStorage}
        caseSensitiveWhenCheckingForChanges={true}
        uppercaseFilterRow={true}
        initialLoadOptions={{ currentPage: 1, pageSize: 15, sort: { column: 'Ruta', order: 'asc' } }}
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
    );
  }

  const tabContent_Detalle = () => {
    return <>
    </>
  }

  return (
    <PortletBody>
      <TabNavContainer
        isVisibleCustomBread={false}
        isVisibleAppBar={false}
        tabIndex={tabIndex}
        handleChange={handleChangeTabIndex}
        orientation={"horizontal"}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "COMMON.SUMMARY" }),
            icon: <CalendarToday fontSize="medium" />,
            className: classes.tabContent
          },
          {
            label: intl.formatMessage({ id: "COMMON.DETAIL" }),
            icon: <Reorder fontSize="medium" />,
            className: classes.tabContent,
            //onClick: openTabDetail
          },
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_Resumen(),
            tabContent_Detalle(),
          ]
        }

      />
    </PortletBody>
  );

}

ManifiestoFinalListPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string

}
ManifiestoFinalListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  showHeaderInformation: false,
  uniqueId: 'reporte_r01_ManifiestoFinal'
}

export default injectIntl(ManifiestoFinalListPage);
