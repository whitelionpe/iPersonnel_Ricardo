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
import { isNotEmpty, listarEstadoSimple, dateFormat, convertyyyyMMddToDate, getStartOfMonthAndToday } from "../../../../../../_metronic";
//Multi-idioma
import { injectIntl } from "react-intl";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import {
  handleInfoMessages,
  handleWarningMessages,
} from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { convertCustomDateTimeString, convertStringToDate } from "../../../../../partials/components/CustomFilter";
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { storeFiltrar as loadUrl } from "../../../../../api/asistencia/marcacion.api";
import { initialFilterMarcas } from "./PersonaMarcacionIndexPage";

const PersonaMarcacionListPage = (props) => {
  //multi-idioma
  const { intl, varIdPersona } = props;
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  //Variables de CustomerDataGrid
  const [isActiveFilters, setIsActiveFilters] = useState(true);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const { FechaInicio, FechaFin } = getStartOfMonthAndToday();
  const [filterData, setFilterData] = useState({ ...initialFilterMarcas, IdCliente, IdPersona: varIdPersona, FechaInicio: FechaInicio, FechaFin: FechaFin });

  // PAGINATION
  // ------------------------------
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;

  const [estadoSimple, setEstadoSimple] = useState([]);


  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-:::::::::::::::::::::::::::::::::
  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  }


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

  // const eliminarRegistro = (evt) => {
  //   evt.cancel = true;
  //   let data = evt.row.data;
  //   let { Automatico } = data;
  //   if (Automatico == "N") {
  //     props.eliminarRegistro(data);
  //   } else {
  //     handleWarningMessages(
  //       intl.formatMessage({ id: "ACCESS.PERSON.MARK.WARNINGDELETE" })
  //     );
  //   }

  // };

  const eliminarRegistro = (evt) => {
    evt.cancel = true;
    let data = evt.row.data;
    let { OrigenRegistro, Activo } = data;

    // console.log("***eliminarRegistro** data:> ", data );

    if ((OrigenRegistro === 'W' ) && Activo === 'S') {
      props.eliminarRegistro(data);
    } else if (Activo === 'N') {
      handleInfoMessages(intl.formatMessage({ id: "ACCESS.PERSON.MARK.AGAIN.WARNINGDELETE" }));
    }
    else {
      handleInfoMessages(intl.formatMessage({ id: "ACCESS.PERSON.MARK.WARNINGDELETE" }));
    }

    // if (OrigenRegistro === 'W' && Activo === 'S') {
    //   props.eliminarRegistro(data);
    // } else if(OrigenRegistro === 'W' && Activo === 'N'){
    //   handleInfoMessages( intl.formatMessage({ id: "ACCESS.PERSON.MARK.AGAIN.WARNINGDELETE" }));
    // }
    // else {
    //   handleInfoMessages( intl.formatMessage({ id: "ACCESS.PERSON.MARK.WARNINGDELETE" }));
    // }

  };

  function verRegistro(e) {
    props.verRegistro(e.row.data);
  }


  const obtenerOrigenMarcacion = rowData => {
    if (rowData.OrigenRegistro === "W") {
      return "WEB";
    } else if (rowData.OrigenRegistro === "E") {
      return "EQUIPO";
    }
    else if (rowData.OrigenRegistro === "C") {
      return "CARGA";
    }
    else if (rowData.OrigenRegistro === "M") {
      return "MASIVO";
    }
  };

  function onCellPrepared(e) {
    if (e.rowType === "data") {
      if (e.data.Activo === "N") {
        e.cellElement.style.color = "red";
      }
    }
  }

  async function cargarCombos() {
    let estadoSimples = listarEstadoSimple();
    setEstadoSimple(estadoSimples);

  }

  useEffect(() => {
    cargarCombos();
    if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage])

  useEffect(() => {
    if (isNotEmpty(varIdPersona)) {
      props.dataSource.loadDataWithFilter({ data: { ...filterData, IdPersona: varIdPersona } });
    }
  }, [varIdPersona]);

  useEffect(() => {
    if (props.refreshData) {
      props.refresh();
      props.setRefreshData(false);
    }
  }, [props.refreshData]);

  const transformData = {
    FechaInicio: (rawValue) => dateFormat(rawValue, 'yyyyMMdd'),
    FechaFin: (rawValue) => dateFormat(rawValue, 'yyyyMMdd'),
    //FechaMarca: (rawValue) => dateFormat(rawValue, 'yyyyMMdd'),
  }
  const reverseTransformData = {
    FechaInicio: (value) => convertyyyyMMddToDate(value),
    FechaFin: (value) => convertyyyyMMddToDate(value),
    //FechaMarca: (value) => convertyyyyMMddToDateTime(value),
  }

  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter = ['IdCliente', 'IdPersona', 'FechaMarca', 'FechaInicio', 'FechaFin', 'FechaCorta', 'Minutos',
    'Zona', 'Equipo', 'Identificacion', 'Activo'];

  const renderFormContentCustomFilter = ({ getInstance }) => {


    return (
      <GroupItem>
        <GroupItem itemType="group" colCount={3} colSpan={3}>
          <Item dataField="IdCliente" editorOptions={{ value: IdCliente }} visible={false} />
          <Item dataField="IdPersona" editorOptions={{ value: varIdPersona }} visible={false} />
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
              //value: filterData.FechaInicio,
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
              //value: filterData.FechaFin,
              onValueChanged: (e) => {
                getInstance().filter()
              }

            }}
          />

          <Item
            dataField="Activo"
            label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: estadoSimple,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              //value: filterData.Activo,
              showClearButton: true,
              onValueChanged: () => getInstance().filter(),
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
        id="marcaciones"
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="RowIndex"
        onFocusedRowChanged={seleccionarRegistro}
        onCellPrepared={onCellPrepared}
        focusedRowKey={props.focusedRowKey}
        remoteOperations={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
        repaintChangesOnly={true}
      >
        <FilterRow visible={false} showOperationChooser={false} />
        <Column dataField="RowIndex" caption="#" width={"5%"}
          alignment={"center"}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
        />
        <Column
          dataField="DiaMarca"
          caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.DAY" })}
          dataType="date" format="dd/MM/yyyy"
          width={"5%"}
          alignment={"center"}
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={false}
        />
        <Column
          dataField="FechaMarca"
          caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" })}
          dataType="date" format="dd/MM/yyyy"
          width={"10%"}
          alignment={"center"}
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={false}
        />
        <Column
          dataField="FechaMarca"
          caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.HOUR" })}
          dataType="date" format="HH:mm"
          width={"5%"}
          alignment={"center"}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
        />
        <Column
          dataField="TipoIdentificacion"
          caption={intl.formatMessage({
            id: "ASSINTANCE.MARKING.ID",
          })}
          alignment={"center"}
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={true}
        />
        <Column
          dataField="Identificacion"
          caption={intl.formatMessage({
            id: "ASSINTANCE.MARKING.BRAND.CARD",
          })}
          alignment={"center"}
          allowSorting={true}
          allowHeaderFiltering={false}
        />
        <Column
          dataField="Zona"
          caption={intl.formatMessage({
            id: "ACCESS.PERSON.MARK.ZONE",
          })}
          allowSorting={true}
          allowHeaderFiltering={false}
        />
        <Column
          dataField="Equipo"
          caption={intl.formatMessage({
            id: "ACCESS.PERSON.MARK.EQUIPMENT",
          })}
          allowSorting={true}
          allowHeaderFiltering={false}
        />

        <Column
          dataField="OrigenRegistro"
          caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.ORIGIN" })}
          calculateCellValue={obtenerOrigenMarcacion}
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

        <Column type="buttons" width={"7%"}>
          <ColumnButton icon="edit" hint={intl.formatMessage({ id: "ACTION.EDIT", })} onClick={editarRegistro} visible={false} />
          <ColumnButton icon="fa fa-eye" hint={intl.formatMessage({ id: "ACTION.VIEW", })} onClick={verRegistro} />
          <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarRegistro} />
        </Column>

      </DataGrid>
    );
  }

  return (
    <>

      <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title={""}
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
                  icon="search"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                  onClick={() => setIsActiveFilters(!isActiveFilters)}
                  disabled={customDataGridIsBusy}
                />
                &nbsp;
                <Button icon="refresh"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                  disabled={customDataGridIsBusy}
                  onClick={resetLoadOptions} />
                &nbsp;
                &nbsp;
                &nbsp;
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
  uniqueId: 'PersonaMarcacionesList'
};

export default injectIntl(WithLoandingPanel(PersonaMarcacionListPage));
