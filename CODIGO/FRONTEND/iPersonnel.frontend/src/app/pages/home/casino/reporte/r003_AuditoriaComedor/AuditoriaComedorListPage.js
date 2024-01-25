import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { DataGrid, Column, Editing, FilterRow, HeaderFilter, FilterPanel } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";

import { injectIntl } from "react-intl";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { storeListarAuditoriaComedor as loadUrl } from "../../../../../api/casino/reporte.api";
import { Item, GroupItem } from "devextreme-react/form";
import { convertCustomDateTimeString, convertStringToDate } from "../../../../../partials/components/CustomFilter";
import { DoubleLinePersona as DoubleLineLabel } from "../../../../../partials/content/Grid/DoubleLineLabel";
import { filterAudiroriaComedorMarcas } from "../r003_AuditoriaComedor/AuditoriaComedorIndexPage";
import { isNotEmpty, exportExcelDataGrid } from "../../../../../../_metronic";

import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
import { exportDataGrid } from 'devextreme/excel_exporter';


const MarcacionListPage = (props) => {
  const { intl, accessButton } = props;
  const { IdCliente, IdDivision } = useSelector((state) => state.perfil.perfilActual);
  let dataGridRef = React.useRef();
  // :::::::::::::::::::::::::::::: DataGrid ::::::::::::::::::::::::::::::::::::::::::
  const [isActiveFilters, setIsActiveFilters] = useState(true);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({ ...filterAudiroriaComedorMarcas, IdCliente, IdDivision });

  const [
    ifThereAreNoChangesLoadFromStorage,
    setIfThereAreNoChangesLoadFromStorages,
  ] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;
  // :::::::::::::::::::::::::::::: DataGrid ::::::::::::::::::::::::::::::::::::::::::

  function cellRenderFileMarca(evt) {
    console.log("cellRenderFile", evt);
    return <p style={{ color: "red" }}>{evt.data.FechaMarca}</p>
   
  }

  function cellRenderFileRegistro(evt) {
    console.log("cellRenderFile", evt);
    return <p style={{ color: "red" }}>{evt.data.FechaRegistro}</p>
   
  }




  useEffect(() => {
    //console.log("useEffect:ifThereAreNoChangesLoadFromStorage:", ifThereAreNoChangesLoadFromStorage);

    if (ifThereAreNoChangesLoadFromStorage)
      setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage]);

  /*  useEffect(() => {
   }
   ); */

  useEffect(() => {
    if (props.refreshData) {
      //console.log("props.refreshData:", props.refreshData);

      props.refresh();
      props.setRefreshData(false);
    }
  }, [props.refreshData]);


  const transformData = {
    FechaInicio: (rawValue) => convertCustomDateTimeString(rawValue),
    FechaFin: (rawValue) => convertCustomDateTimeString(rawValue),
  };
  const reverseTransformData = {
    FechaInicio: (value) => convertStringToDate(value),
    FechaFin: (value) => convertStringToDate(value),
  };

  //..Definir Filtro para customerDataGrid
  const keysToGenerateFilter = [
    "IdCliente",
    "IdDivision",
    "FechaInicio",
    "FechaFin",
  ];
  // :::::::::::::::::::::::::::::: DataGrid ::::::::::::::::::::::::::::::::::::::::::

  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      
      <GroupItem >
        <GroupItem itemType="group" colCount={2} colSpan={2}>
          <Item
            dataField="FechaInicio"
            label={{text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.STARTDATE" })}}
            editorType="dxDateBox"
            dataType="datetime"
            isRequired={true}
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy",
              onValueChanged: () => getInstance().filter(),
            }}
          />
          <Item
            dataField="FechaFin"
            label={{text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.ENDDATE" })}}
            editorType="dxDateBox"
            dataType="datetime"
            isRequired={true}
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy",
              onValueChanged: () => getInstance().filter(),
            }}
          />
        </GroupItem>
      </GroupItem>
    );
  };


  const renderDataGrid = ({ gridRef, dataSource }) => {
    dataGridRef = gridRef;
    return (
      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="RowIndex"
      //onCellPrepared={onCellPrepared}

      >
        <FilterRow visible={true} showOperationChooser={false} />
        <HeaderFilter visible={false} />
        <FilterPanel visible={false} />

        {/* <Column
          dataField="RowIndex"
          caption={"#"}
          width={"5%"}
          alignment={"center"}
        /> */}
        <Column
          dataField="Comedor"
          caption={intl.formatMessage({ id: "CASINO.PERSON.GROUP.COMEDOR" })}
          width={"20%"}
          alignment={"left"}
          allowFiltering={false}
        />
        <Column
          dataField="Servicio"
          caption={intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE" })}
          width={"15%"}
          alignment={"center"}
          allowFiltering={false}
        />
        <Column
          dataField="TipoDocumentoAlias"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE" })}
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={true}
          alignment={"center"}
          width={"10%"}
        >
        </Column>
        <Column dataField="Documento"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width={"10%"}
          alignment={"center"}
        />
        <Column
          dataField="NombreCompleto"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
          //cellRender={DoubleLineLabel}
          allowFiltering={false}
          allowSorting={true}
          allowHeaderFiltering={false}
          width={"25%"}
        />

        <Column caption={intl.formatMessage({ id: "AUDITORIA_DE_COMEDORES_ORIGINAL_DATA" })} alignment={"center"}>
          <Column dataField="FechaMarcaOriginal" caption={intl.formatMessage({ id: "ACCESS.REPORT.MARK" })} width={"15%"} alignment={"center"} allowFiltering={false} />
          <Column dataField="FechaRegistroOriginal" caption={intl.formatMessage({ id: "AUDITORIA_DE_COMEDORES_REGISTARTION_DATE" })} width={"15%"} alignment={"center"} allowFiltering={false} />
        </Column>

        <Column caption={intl.formatMessage({ id: "AUDITORIA_DE_COMEDORES_MODIFIED_DATA" })} alignment={"center"}>
          <Column dataField="FechaMarca" caption={intl.formatMessage({ id: "ACCESS.REPORT.MARK" })} width={"15%"} alignment={"center"} allowFiltering={false} cellRender={cellRenderFileMarca} />
          <Column dataField="FechaRegistro" caption={intl.formatMessage({ id: "AUDITORIA_DE_COMEDORES_REGISTARTION_DATE" })} width={"15%"} alignment={"center"} allowFiltering={false} />
        </Column>

      </DataGrid>
    );
  };

  //:::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <HeaderInformation
        //data={props.getInfo()}
        visible={true}
        labelLocation={"left"}
        colCount={6}
        toolbar={
          <PortletHeader
            title={""}
            toolbar={
              <PortletHeaderToolbar>
                {/* <Button
                  icon="fa fa-search"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                  onClick={() => setIsActiveFilters(!isActiveFilters)}
                  //onClick={isActiveFilters}
                  disabled={customDataGridIsBusy}
                />
                &nbsp; */}

                <Button
                  icon="fa fa-file-excel"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
                  onClick={() => {
                    let title = intl.formatMessage({ id: "CONFIG.MENU.COMEDORES.AUDITORIA_COMEDOR" });
                    let refDataGrid = dataGridRef.current.instance;
                    let fileName = intl.formatMessage({ id: "CONFIG.MENU.COMEDORES.AUDITORIA_COMEDOR" });
                    exportExcelDataGrid(title, refDataGrid, fileName);
                  }}
                />
                 &nbsp;

                <Button
                  icon="refresh"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                  disabled={customDataGridIsBusy}
                  onClick={resetLoadOptions}
                />

              </PortletHeaderToolbar>
            }
          />
        }
      />
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
          initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: "FechaMarca", order: "desc" }, }}
          filterRowSize='sm'
          summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW", })} {0} de {1} `}
          //  :::: CUSTOM FILTER ::::
          visibleCustomFilter={isActiveFilters}
          renderFormContentCustomFilter={renderFormContentCustomFilter}
          //  :::: CUSTOM FILTER ::::
          transformData={transformData}
          reverseTransformData={reverseTransformData}
          keysToGenerateFilter={keysToGenerateFilter}
          filterData={filterData}
          // :::: PAGINATION ::::
          paginationSize="md"
          // :::: EVENTS ::::
          onLoading={() => setCustomDataGridIsBusy(true)}
          onError={() => setCustomDataGridIsBusy(false)}
          onLoaded={() => setCustomDataGridIsBusy(false)}

        />
      </PortletBody>
    </>
  );
};

MarcacionListPage.propTypes = {
  uniqueId: PropTypes.string,
};
MarcacionListPage.defaultProps = {
  uniqueId: "AudoriaComedorListPage",
};

export default injectIntl(MarcacionListPage);
