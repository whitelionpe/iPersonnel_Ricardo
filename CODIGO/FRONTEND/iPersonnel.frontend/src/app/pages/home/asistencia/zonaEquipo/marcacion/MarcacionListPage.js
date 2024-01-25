import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  DataGrid,
  Column,
  FilterRow,
  Button as ColumnButton
} from "devextreme-react/data-grid";
import { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar
} from "../../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../../_metronic";

//Multi-idioma
import { injectIntl } from "react-intl";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";

import { handleWarningMessages } from "../../../../../store/ducks/notify-messages";

import { listarTipoMarcacion } from "../../../../../../_metronic/utils/utils";
import { custom } from "devextreme/ui/dialog";

import {
  convertCustomDateTimeString,
  convertStringToDate
} from "../../../../../partials/components/CustomFilter";
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { storeFiltrar as loadUrl } from "../../../../../api/asistencia/marcacion.api";
import { initialFilterMarcas } from "./MarcacionIndexPage";

const MarcacionListPage = props => {

 

  //multi-idioma
  const { intl, IdZona, IdEquipo } = props;
  const { IdCliente, IdDivision } = useSelector(
    state => state.perfil.perfilActual
  );

  console.log("MarcacionListPage|IdZona|IdEquipo:",IdZona,IdEquipo);

  //Variables de CustomerDataGrid
  const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({
    ...initialFilterMarcas,
    IdCliente,
    IdZona,
    IdEquipo,
    IdDivision
  });

  // PAGINATION
  // ------------------------------
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-:::::::::::::::::::::::::::::::::

  const seleccionarRegistro = evt => {
    props.seleccionarRegistro(evt.row.data);
  };

  // useEffect(() => {
  //   console.log("useEffect|ifThereAreNoChangesLoadFromStorage:",ifThereAreNoChangesLoadFromStorage);
  //   if (ifThereAreNoChangesLoadFromStorage)
  //     setIfThereAreNoChangesLoadFromStorages(false);
  // }, [ifThereAreNoChangesLoadFromStorage]);

  useEffect(() => {

    document.getElementById("btnRefresh").click();


    //  setTimeout(function () {

      if (isNotEmpty(IdZona) || isNotEmpty(IdEquipo)) {
        props.dataSource.loadDataWithFilter({ data: { IdZona, IdEquipo} });
      }

    // }, 1000);


 
  }, []);
  
  // useEffect(() => {
  //   if (props.refreshData) {      
  //     props.refresh();
  //     props.setRefreshData(false);
  //   }
  // }, [props.refreshData]);

  const transformData = {
    FechaInicio: rawValue => convertCustomDateTimeString(rawValue),
    FechaFin: rawValue => convertCustomDateTimeString(rawValue),
    FechaMarca: rawValue => convertCustomDateTimeString(rawValue)
  };
  const reverseTransformData = {
    FechaInicio: value => convertStringToDate(value),
    FechaFin: value => convertStringToDate(value),
    FechaMarca: value => convertStringToDate(value)
  };

  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter = [
    "IdCliente",
    "IdPersona",
    "FechaMarca",
    "FechaInicio",
    "FechaFin",
    "FechaCorta",
    "Minutos",
    "IdZona",
    "IdEquipo",
    "Zona",
    "Equipo",
    "Identificacion"
  ];

  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem>
        <GroupItem itemType="group" colCount={2} colSpan={2}>
          {/* 
          <Item
            dataField="IdCliente"
            //editorOptions={{ value: IdCliente }}
            visible={false}
          /> 
          */}
          <Item
            dataField="IdZona"
            editorOptions={{ value: IdZona }}
            visible={false}
          />
          <Item
            dataField="IdEquipo"
            editorOptions={{ value: IdEquipo }}
            visible={false}
          />

          <Item
            dataField="FechaInicio"
            label={{
              text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" })
            }}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy",
              onValueChanged: () => getInstance().filter()
            }}
          />
          <Item
            dataField="FechaFin"
            label={{
              text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" })
            }}
            isRequired={true}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy",
              onValueChanged: () => getInstance().filter()
            }}
          />
        </GroupItem>
      </GroupItem>
    );
  };
  //>..Definir DataGrid para customerDataGrid
  const renderDataGrid = ({ gridRef, dataSource }) => {
    return (
      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        id="marcaciones"
        // dataSource={props.marcaciones}
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="RowIndex"
        onFocusedRowChanged={seleccionarRegistro}
        focusedRowKey={props.focusedRowKey}
        // remoteOperations={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
        // repaintChangesOnly={true}
      >
        <FilterRow visible={true} showOperationChooser={false} />
        <Column
          dataField="RowIndex"
          caption="#"
          width={"5%"}
          alignment={"center"}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
        />

        <Column
          dataField="FechaCorta"
          caption={intl.formatMessage({
            id: "ACCESS.PERSON.MARK.DATE"
          })}
          width={"10%"}
          alignment={"center"}
          allowSorting={true}
          allowHeaderFiltering={false}
        />
        <Column
          dataField="Minutos"
          caption={intl.formatMessage({
            id: "ACCESS.PERSON.MARK.HOUR"
          })}
          width={"10%"}
          alignment={"center"}
          allowSorting={true}
          allowHeaderFiltering={false}
        />
        <Column
          dataField="TipoIdentificacion"
          caption={intl.formatMessage({
            id: "ASSINTANCE.MARKING.ID"
          })}
          width={"15%"}
          alignment={"center"}
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={true}
        />
        <Column
          dataField="Identificacion"
          caption={intl.formatMessage({
            id: "ASSINTANCE.MARKING.BRAND.CARD"
          })}
          width={"15%"}
          alignment={"center"}
          allowSorting={true}
          allowHeaderFiltering={false}
        />
        <Column
          dataField="Zona"
          caption={intl.formatMessage({
            id: "ACCESS.PERSON.MARK.ZONE"
          })}
          width={"20%"}
          allowSorting={true}
          allowHeaderFiltering={false}
        />
        <Column
          dataField="Equipo"
          caption={intl.formatMessage({
            id: "ACCESS.PERSON.MARK.EQUIPMENT"
          })}
          width={"20%"}
          allowSorting={true}
          allowHeaderFiltering={false}
        />
        <Column
          dataField="Origen"
          caption={intl.formatMessage({
            id: "ASSISTANCE.JUSTIFICACION.ORIGIN"
          })}
          width={"20%"}
          alignment={"center"}
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={true}
        />

        {/* <Column type="buttons" visible={props.showButtons} >
          <ColumnButton icon="edit" hint={intl.formatMessage({ id: "ACTION.EDIT", })} onClick={editarRegistro} />
          <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarRegistro} />
          <ColumnButton icon="fa fa-eye" hint={intl.formatMessage({ id: "ACTION.VIEW", })} onClick={editarRegistro} visible={props.ocultarEdit} /> 

        </Column> */}
      </DataGrid>
    );
  };

  return (
    <>
      <HeaderInformation
        data={props.getInfo()}
        visible={props.showHeaderInformation}
        labelLocation={"left"}
        colCount={2}
        toolbar={
          <PortletHeader
            title={""}
            toolbar={
              <PortletHeaderToolbar>
                {/* <Button
                  icon="fa fa-plus"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.NEW" })}
                  onClick={props.nuevoRegistro}
                  disabled={customDataGridIsBusy}
                /> */}
                {/* &nbsp; */}
                <Button
                  icon="search"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                  onClick={() => setIsActiveFilters(!isActiveFilters)}
                  disabled={customDataGridIsBusy}
                />
                &nbsp;
                <Button
                  id="btnRefresh"
                  icon="refresh" //fa fa-broom
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                  disabled={customDataGridIsBusy}
                  onClick={resetLoadOptions}
                  // visible={false}
                />
                &nbsp;
                <Button
                  icon="fa fa-times-circle"
                  type="normal"
                  hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                  onClick={props.cancelarEdicion}
                />
                &nbsp;
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
          rowNumberName="RowIndex"
          loadWhenStartingComponent={props.isFirstDataLoad && !props.refreshData }
          renderDataGrid={renderDataGrid}
          loadUrl={loadUrl}
          forceLoad={forceLoadTypes.Unforced}
          sendToServerOnlyIfThereAreChanges={false}
          ifThereAreNoChangesLoadFromStorage={ifThereAreNoChangesLoadFromStorage}
          caseSensitiveWhenCheckingForChanges={true}
          uppercaseFilterRow={true}
          initialLoadOptions={{
            currentPage: 1,
            pageSize: 20,
            sort: { column: "FechaCorta", order: "desc" }
          }}
          filterRowSize="sm"
          summaryCountFormat={`${intl.formatMessage({
            id: "COMMON.TOTAL.ROW"
          })} {0} de {1} `}
          visibleCustomFilter={isActiveFilters}
          renderFormContentCustomFilter={renderFormContentCustomFilter}
          transformData={transformData}
          reverseTransformData={reverseTransformData}
          keysToGenerateFilter={keysToGenerateFilter}
          filterData={filterData}
          // PAGINATION
          paginationSize="md"
          // EVENTS
          onLoading={() => setCustomDataGridIsBusy(true)}
          onError={() => setCustomDataGridIsBusy(false)}
          onLoaded={() => setCustomDataGridIsBusy(false)}
        />
      </PortletBody>
    </>
  );
};

MarcacionListPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string
};
MarcacionListPage.defaultProps = {
  showHeaderInformation: true,
  uniqueId: "MarcacionListPageAsistencia"
};

export default injectIntl(MarcacionListPage);
