import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  DataGrid,
  Column,
  FilterRow,
  Button as ColumnButton,
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
import PropTypes from "prop-types";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import {
  handleWarningMessages,handleInfoMessages
} from "../../../../../store/ducks/notify-messages";
import { convertyyyyMMddToDate, dateFormat, listarTipoMarcacion } from "../../../../../../_metronic/utils/utils";
//import { convertCustomDateTimeString, convertStringToDate } from "../../../../../partials/components/CustomFilter";
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { storeFiltrar as loadUrl } from "../../../../../api/acceso/marcacion.api";
import { initialFilterMarcas } from "./PersonaMarcacionIndexPage";

const PersonaMarcacionListPage = (props) => {
  //multi-idioma
  const { intl, varIdPersona, focusedRowKey} = props;
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);

  //Variables de CustomerDataGrid
  const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({ ...initialFilterMarcas,  IdPersona: varIdPersona });
  // ------------------------------
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-:::::::::::::::::::::::::::::::::

  const editarRegistro = (evt) => {
    let { Automatico } = evt.row.data;
    if (Automatico === "N") {
      props.editarRegistro(evt.row.data, true);
    } else {
      handleInfoMessages(intl.formatMessage({ id: "ACCESS.PERSON.MARK.WARNINGEDIT" }));
      props.editarRegistro(evt.row.data, false);
    }
  };


  const eliminarRegistro = (evt) => {
    evt.cancel = true;
    let data = evt.row.data;
    let { OrigenRegistro, Activo } = data;
    if (OrigenRegistro === 'WEB' && Activo === 'S') {
      props.eliminarRegistro(data);
    } else if(OrigenRegistro === 'WEB' && Activo === 'N'){
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

  function cellRender(param) {
    if (param && param.data) {
      let lstTipos = listarTipoMarcacion();
      let filtro = lstTipos.find(x => x.Valor == param.data.Tipo);

      if (filtro != undefined) {
        return (isNotEmpty(filtro.Descripcion) ? filtro.Descripcion : "");
      }
      return "";
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
    if (varIdPersona) {      
      props.dataSource.loadDataWithFilter({ data: { IdPersona: varIdPersona, ...initialFilterMarcas } });
    }
  }, [varIdPersona]);

  useEffect(() => {
    if (props.refreshData) {
      props.refresh();
      props.setRefreshData(false);
    }
  }, [props.refreshData]);


  const transformData = {
    FechaInicio: (rawValue) =>dateFormat(rawValue, 'yyyyMMdd'),
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
          <Item dataField="IdPersona" editorOptions={{ value: props.IdPersona }} visible={false} />
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
              onValueChanged: (e) => {
                getInstance().filter()
              }
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
              onValueChanged: (e) => {
                getInstance().filter()
              }

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
        onFocusedRowChanged={seleccionarRegistro}
        focusedRowKey={focusedRowKey}
        onCellPrepared={onCellPrepared}
        remoteOperations={true}
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
          caption={intl.formatMessage({
            id: "ACCESS.PERSON.MARK.RESULT",
          })}
          width={"14%"}
          allowSorting={true}
          allowHeaderFiltering={false}
        />
        <Column
          dataField="Zona"
          caption={intl.formatMessage({
            id: "ACCESS.PERSON.MARK.ZONE",
          })}
          width={"14%"}
          allowSorting={true}
          allowHeaderFiltering={false}
        />
        <Column
          dataField="Puerta"
          caption={intl.formatMessage({
            id: "ACCESS.PERSON.MARK.DOOR",
          })}
          width={"12%"}
          allowSorting={true}
          allowHeaderFiltering={false}
        />
        <Column
          dataField="Tipo"
          caption={intl.formatMessage({
            id: "ACCESS.PERSON.MARK.TYPE",
          })}
          cellRender={cellRender}
          width={"10%"}
          allowSorting={true}
          allowHeaderFiltering={false}
        />
        <Column
          dataField="Placa"
          caption={intl.formatMessage({
            id: "ACCESS.PERSON.MARK.LICENSEPLATE",
          })}
          width={"10%"}
          allowSorting={true}
          allowHeaderFiltering={false}
        />

      <Column
          dataField="OrigenRegistro"
          caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.ORIGIN" })}
          width="8%"
          //calculateCellValue={obtenerCampoAutomatico}
          alignment={"center"}
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={true}
        />

        <Column
          dataField="Funcion"
          caption={intl.formatMessage({
            id: "ACCESS.PERSON.MARK.FUNCTION",
          })}
          width={"9%"}
          alignment={"center"}
          allowSorting={true}
          allowHeaderFiltering={false}
        />

        <Column
          dataField="MotivoEliminacion"
          caption={intl.formatMessage({ id: "CASINO.MARKING.REASONDELETE" })}
          width="12%"
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={true}
        />

      <Column type="buttons" width={"10%"}>
           <ColumnButton icon="edit" hint={intl.formatMessage({ id: "ACTION.EDIT", })} onClick={editarRegistro} visible={false} /> 
          <ColumnButton icon="fa fa-eye" hint={intl.formatMessage({ id: "ACTION.VIEW", })} onClick={verRegistro} />
          <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })}  onClick={eliminarRegistro} />
        </Column>

      </DataGrid>
    );
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
                  icon="fa fa-plus"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.NEW" })}
                  onClick={props.nuevoRegistro}
                  disabled={customDataGridIsBusy}
                />
                  &nbsp;
                  <Button
                  icon="filter"
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

PersonaMarcacionListPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string
};
PersonaMarcacionListPage.defaultProps = {
  showHeaderInformation: true,
  uniqueId: 'personaMarcacionesList'
};

export default injectIntl(PersonaMarcacionListPage);
