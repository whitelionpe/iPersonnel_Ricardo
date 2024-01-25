import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  DataGrid,
  Column,
  Button as ColumnButton,
  MasterDetail,
  FilterRow,
} from "devextreme-react/data-grid";
import { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar,
} from "../../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../../_metronic";
//Multi-idioma
import { injectIntl } from "react-intl";
import {
  handleInfoMessages,
  handleWarningMessages,
} from "../../../../../store/ducks/notify-messages";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { convertyyyyMMddToDate, dateFormat, getDateOfDay } from "../../../../../../_metronic/utils/utils";
import { convertCustomDateTimeString, convertStringToDate } from "../../../../../partials/components/CustomFilter";
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { storeFiltrar as loadUrl } from "../../../../../api/acceso/marcacion.api";
import { initialFilterMarcas } from "./VehiculoMarcacionIndexPage";

const VehiculoMarcacionListPage = (props) => {
  //multi-idioma
  const { intl, accessButton, varIdVehiculo } = props;
  const { IdCliente } = useSelector((state) => state.perfil.perfilActual);
  const { FechaInicio, FechaFin } = getDateOfDay();

  //Variables de CustomerDataGrid
  const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({ ...initialFilterMarcas,  IdVehiculo: varIdVehiculo, FechaInicio, FechaFin });
  // PAGINATION
  // ------------------------------
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-:::::::::::::::::::::::::::::::::

  const editarRegistro = (evt) => {
    let { Automatico } = evt.row.data;
    if (Automatico == "N") {
      props.editarRegistro(evt.row.data, true);
    }
    else {
      handleWarningMessages(
        intl.formatMessage({ id: "ACCESS.PERSON.MARK.WARNINGEDIT" })
      );
      props.editarRegistro(evt.row.data, false);
    }
  };

  const eliminarRegistro = (evt) => {
    evt.cancel = true;
    let data = evt.row.data;
    let { OrigenRegistro, Activo } = data;
    if (OrigenRegistro === 'W' && Activo === 'S') {
      props.eliminarRegistro(data);
    } else if(OrigenRegistro === 'W' && Activo === 'N'){
      handleInfoMessages( intl.formatMessage({ id: "ACCESS.PERSON.MARK.AGAIN.WARNINGDELETE" }));
    }
    else {
      handleInfoMessages( intl.formatMessage({ id: "ACCESS.PERSON.MARK.WARNINGDELETE" }));
    }
  };

  function verRegistro(e) {
    props.verRegistro(e.row.data);
  }

  const seleccionarRegistro = (evt) => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  };

  function onCellPrepared(e) {
    if (e.rowType === "data") {
      if (e.data.AccesoNegado === "S") {
        e.cellElement.style.color = "red";
      }
      if (e.data.Activo === "N") {
        e.cellElement.style.color = "red";
      }
    }
  }

  // const obtenerCampoAutomatico = rowData => {
  //   if(rowData.OrigenRegistro === "W"){
  //     return "WEB";
  //   }else if (rowData.OrigenRegistro === "E"){
  //     return "EQUIPO";
  //   }
  //   else if(rowData.OrigenRegistro === "C"){
  //     return "CARGA";
  //   }
  // };

  useEffect(() => {
    if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage])

  useEffect(() => {
    if (varIdVehiculo) {
      props.dataSource.loadDataWithFilter({ data: { IdVehiculo: varIdVehiculo, ...initialFilterMarcas } });
    }
  }, [varIdVehiculo]);

  useEffect(() => {
    if (props.refreshData) {
      props.refresh();
      props.setRefreshData(false);
    }
  }, [props.refreshData]);

  const transformData = {
    FechaInicio: (rawValue) => dateFormat(rawValue, 'yyyyMMdd'),
    FechaFin: (rawValue) => dateFormat(rawValue, 'yyyyMMdd'),
    //FechaMarca: (rawValue) => convertCustomDateTimeString(rawValue),
  }
  const reverseTransformData = {
    FechaInicio: (value) => convertyyyyMMddToDate(value),
    FechaFin: (value) => convertyyyyMMddToDate(value),
    //FechaMarca: (value) => convertStringToDate(value),
  }
  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter = ['IdCliente', 'IdPersona', 'IdVehiculo', 'TipoMarca', 'FlFecha', 'FechaMarca', 'FechaInicio', 'FechaFin', 'FechaCorta', 'Minutos', 'TipoMarcacion', 'Zona', 'Puerta', 'Equipo', 'Funcion', 'Placa'];
  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem>
        <GroupItem itemType="group" colCount={2} colSpan={2}>
          <Item dataField="IdCliente" editorOptions={{ value: IdCliente }} visible={false} />
          <Item dataField="IdVehiculo" editorOptions={{ value: props.IdVehiculo }} visible={false} />
          <Item
            dataField="FechaInicio"
            label={{
              text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" }),
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
              text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" }),
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
  }
  //>..Definir DataGrid para customerDataGrid
  const renderDataGrid = ({ gridRef, dataSource }) => {
    return (

      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        //id="gridPersonaMarcacion"
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="RowIndex"
        onEditingStart={editarRegistro}
        onRowRemoving={eliminarRegistro}
        onFocusedRowChanged={seleccionarRegistro}
        focusedRowKey={props.focusedRowKey}
        onCellPrepared={onCellPrepared}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
      >
        <FilterRow visible={true} showOperationChooser={false} />
        <Column dataField="RowIndex" caption="#" width={"5%"}
          alignment={"center"}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
        />
        <Column
          dataField="FechaMarca"
          caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" }) + " " + intl.formatMessage({ id: "ACCESS.PERSON.MARK" })}
          dataType="date" format="dd/MM/yyyy HH:mm"
          width={"15%"}
          alignment={"center"}
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={false}
        />
      
        <Column
          dataField="TipoMarcacion"
          caption={intl.formatMessage({id: "ACCESS.PERSON.MARK.RESULT" })}
        />
        <Column
          dataField="Zona"
          caption={intl.formatMessage({id: "ACCESS.PERSON.MARK.ZONE"})}
        />
        <Column
          dataField="Puerta"
          caption={intl.formatMessage({id: "ACCESS.PERSON.MARK.DOOR"})}
        />

        <Column
          dataField="Funcion"
          caption={intl.formatMessage({id: "ACCESS.PERSON.MARK.FUNCTION"})}
          alignment={"center"}
        />

        <Column
          dataField="NombreCompleto"
          caption={intl.formatMessage({id: "ACCESS.VEHICLE.MARK.DRIVER" })}
          width={"25%"}
          alignment={"center"}
        />

        <Column
          dataField="CantPasajeros"
          caption={intl.formatMessage({ id: "ACCESS.VEHICLE.NUMBEROFPASSENGERS" })}
          alignment={"center"}
        />

        <Column
          dataField="TiempoControl"
          caption={intl.formatMessage({ id: "ACCESS.VEHICLE.CONTROLTIME" })}
          alignment={"center"}
        />

        <Column
          dataField="OrigenRegistro"
          caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.ORIGIN" })}
          //calculateCellValue={obtenerCampoAutomatico}
          alignment={"center"}
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={true}
        />

        <Column
          dataField="MotivoEliminacion"
          caption={intl.formatMessage({ id: "CASINO.MARKING.REASONDELETE" })}
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={true}
        />

      <Column type="buttons" width={"10%"}>
        <ColumnButton icon="edit" hint={intl.formatMessage({ id: "ACTION.EDIT", })} onClick={editarRegistro} visible={false} /> 
          <ColumnButton icon="fa fa-eye" hint={intl.formatMessage({ id: "ACTION.VIEW", })} onClick={verRegistro} />
          <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarRegistro} />
        </Column>

      </DataGrid>
    )
  }

  return (
    <>
      <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title=""
            toolbar={
              <PortletHeaderToolbar>

                <Button
                  icon="plus"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.NEW" })}
                  onClick={props.nuevoRegistro}
                  disabled={!accessButton.nuevo}
                />
              &nbsp;
                <Button
                  icon="search"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                  onClick={() => setIsActiveFilters(!isActiveFilters)}
                  disabled={customDataGridIsBusy}
                />
                 &nbsp;
                  <Button icon="refresh" //fa fa-broom
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                  disabled={customDataGridIsBusy}
                  onClick={resetLoadOptions} />
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

        } />

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
          initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'FechaMarca', order: 'desc' } }}
          filterRowSize='sm'
          summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}
          // CUSTOM FILTER
          visibleCustomFilter={isActiveFilters}
          renderFormContentCustomFilter={renderFormContentCustomFilter}
          transformData={transformData}
          reverseTransformData={reverseTransformData}
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

VehiculoMarcacionListPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string,
};
VehiculoMarcacionListPage.defaultProps = {
  showHeaderInformation: true,
  uniqueId: 'vehiculoMarcacionesList'
};

export default injectIntl(VehiculoMarcacionListPage);
