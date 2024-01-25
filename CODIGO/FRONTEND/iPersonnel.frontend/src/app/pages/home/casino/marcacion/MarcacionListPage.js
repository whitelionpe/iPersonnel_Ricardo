import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  DataGrid,
  Column,
  Editing,
  FilterRow,
  HeaderFilter,
  FilterPanel,
  Button as ColumnButton
} from "devextreme-react/data-grid";

import { Button } from "devextreme-react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar,
} from "../../../../partials/content/Portlet";

//Multi-idioma
import { injectIntl } from "react-intl";
import PropTypes from "prop-types";

import HeaderInformation from "../../../../partials/components/HeaderInformation";
import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { storeListar as loadUrl } from "../../../../api/casino/marcacion.api";
import { Item, GroupItem } from "devextreme-react/form";

import { initialFilterMarcas } from "../personaGrupo/PersonaIndexPage";
import { convertyyyyMMddToDate, dateFormat, isNotEmpty } from "../../../../../_metronic";
import { handleInfoMessages } from "../../../../store/ducks/notify-messages";

const MarcacionListPage = (props) => {
  const { intl, accessButton, varIdPersona, fechaInicio, fechaFin, focusedRowKey } = props;
  const { IdCliente, IdDivision } = useSelector(
    (state) => state.perfil.perfilActual
  );

  // :::::::::::::::::::::::::::::: DataGrid ::::::::::::::::::::::::::::::::::::::::::
  const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({
    ...initialFilterMarcas,
    IdCliente,
    IdDivision,
    IdPersona: varIdPersona,
    FechaInicio: fechaInicio,
    FechaFin: fechaFin
  });

  const [
    ifThereAreNoChangesLoadFromStorage,
    setIfThereAreNoChangesLoadFromStorages,
  ] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;
  // :::::::::::::::::::::::::::::: DataGrid ::::::::::::::::::::::::::::::::::::::::::

  const editarRegistro = (evt) => {
    props.editarRegistro(evt.data);
  };


  const eliminarRegistro = (evt) => {
    evt.cancel = true;
    let data = evt.row.data;
    let { OrigenRegistro, Activo } = data;
    if (OrigenRegistro === 'WEB' && Activo === 'S') {
      props.eliminarRegistro(data);
    } else if (OrigenRegistro === 'WEB' && Activo === 'N') {
      handleInfoMessages(intl.formatMessage({ id: "ACCESS.PERSON.MARK.AGAIN.WARNINGDELETE" }));
    }
    else {
      handleInfoMessages(intl.formatMessage({ id: "ACCESS.PERSON.MARK.WARNINGDELETE" }));
    }
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

  function verRegistro(e) {
    props.verRegistro(e.row.data);
  }

  const textEditing = {
    confirmDeleteMessage: "",
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  };

  useEffect(() => {
    if (ifThereAreNoChangesLoadFromStorage)
      setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage]);

  useEffect(() => {
    if (varIdPersona) {
      props.dataSource.loadDataWithFilter({
        data: { IdCliente, IdDivision, IdPersona: varIdPersona, FechaInicio: fechaInicio, FechaFin: fechaFin },
      });
    }
  }, [varIdPersona]);

  useEffect(() => {
    if (props.refreshData) {
      props.refresh();
      props.setRefreshData(false);
    }
  }, [props.refreshData]);

  // const obtenerCampoConsumoNegado = rowData => {
  //   return rowData.ConsumoNegado === 'S' ? 'SI' : 'NO';
  // };

  // const obtenerCampoAutomatico = rowData => {
  //   if (rowData.OrigenRegistro === "W") {
  //     return "WEB";
  //   } else if (rowData.OrigenRegistro === "E") {
  //     return "EQUIPO";
  //   }
  //   else if (rowData.OrigenRegistro === "C") {
  //     return "CARGA";
  //   }
  // };

  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  }

  const transformData = {
    FechaInicio: (rawValue) => dateFormat(rawValue, 'yyyyMMdd'),
    FechaFin: (rawValue) => dateFormat(rawValue, 'yyyyMMdd'),
  }
  const reverseTransformData = {
    FechaInicio: (value) => convertyyyyMMddToDate(value),
    FechaFin: (value) => convertyyyyMMddToDate(value),
  }

  //..Definir Filtro para customerDataGrid
  const keysToGenerateFilter = [
    "IdCliente",
    "IdDivision",
    "IdPersona",
    "Comedor",
    "Servicio",
    "Equipo",
    "FechaInicio",
    "FechaFin",
  ];
  // :::::::::::::::::::::::::::::: DataGrid ::::::::::::::::::::::::::::::::::::::::::

  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem>
        <GroupItem itemType="group" colCount={2} colSpan={2}>
          <Item
            dataField="FechaInicio"
            label={{
              text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.STARTDATE" }),
            }}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy",
              onValueChanged: (e) => {
                props.setFechaInicio(e.value);
                getInstance().filter()
              }
            }}
          />
          <Item
            dataField="FechaFin"
            label={{
              text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.ENDDATE" }),
            }}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy",
              onValueChanged: (e) => {
                props.setFechaFin(e.value);
                getInstance().filter()
              }
            }}
          />
        </GroupItem>
      </GroupItem>
    );
  };

  const renderDataGrid = ({ gridRef, dataSource }) => {
    return (
      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="RowIndex"
        focusedRowKey={focusedRowKey}
        onFocusedRowChanged={seleccionarRegistro}
        onCellPrepared={onCellPrepared}
        remoteOperations={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
      >
        <Editing
          mode="row"
          useIcons={true}
          allowUpdating={false}
          allowDeleting={true}
          texts={textEditing}
        />
        <FilterRow visible={true} showOperationChooser={false} />
        <HeaderFilter visible={false} />
        <FilterPanel visible={false} />

        <Column
          dataField="RowIndex"
          caption={"#"}
          width={"3%"}
          alignment={"center"}
        />
        <Column
          dataField="FechaMarca"
          caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" }) + " " + intl.formatMessage({ id: "ACCESS.PERSON.MARK" })}
          width={"15%"}
          alignment={"center"}
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={true}
        />
        {/* <Column
          dataField="TipoIdentificacion"
          caption={intl.formatMessage({
            id: "ASSINTANCE.MARKING.ID",
          })}
          alignment={"center"}
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={true}
        /> */}
        <Column
          dataField="Comedor"
          caption={intl.formatMessage({ id: "CASINO.PERSON.GROUP.COMEDOR" })}
          alignment={"left"}
          width={"15%"}
        />
        <Column
          dataField="Servicio"
          caption={intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE" })}
          alignment={"left"}
          width={"10%"}
        />
        <Column
          dataField="Equipo"
          caption={intl.formatMessage({ id: "ACCESS.GROUP.DEVICE" })}
          alignment={"left"}
          width={"20%"}
        />
        <Column
          dataField="OrigenRegistro"
          caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.ORIGIN" })}
          //calculateCellValue={obtenerCampoAutomatico}
          alignment={"center"}
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={true}
          width={"10%"}
        />
        <Column
          dataField="ConsumoNegado"
          caption={intl.formatMessage({ id: "CASINO.MARKING.CONSUMTIONDENIED" })}
          //calculateCellValue={obtenerCampoConsumoNegado}
          alignment={"center"}
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={true}
          width={"15%"}
        />
        <Column
          dataField="TipoMarcacion"
          caption={intl.formatMessage({ id: "COMMON.OBSERVATION" })}
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={true}
          width={"20%"}
        />
        <Column
          dataField="MotivoEliminacion"
          caption={intl.formatMessage({ id: "CASINO.MARKING.REASONDELETE" })}
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={true}
          width={"15%"}
        />
        <Column type="buttons" width={"70px"}>
          <ColumnButton icon="fa fa-eye" hint={intl.formatMessage({ id: "ACTION.VIEW", })} onClick={verRegistro} />
          <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarRegistro} />
        </Column>
      </DataGrid>
    );
  };

  //:::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <HeaderInformation
        data={props.getInfo()}
        visible={true}
        labelLocation={"left"}
        colCount={6}
        toolbar={
          <PortletHeader
            title={""}
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
                  icon="filter"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                  onClick={() => setIsActiveFilters(!isActiveFilters)}
                  disabled={customDataGridIsBusy}
                />
                &nbsp;
                <Button
                  icon="refresh"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                  disabled={customDataGridIsBusy}
                  onClick={() => {
                    // props.setFechaInicio(new Date());
                    // props.setFechaFin(new Date());
                    props.dataSource.resetLoadOptions()
                  }}
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
  uniqueId: "CasinoMarcacionListPage",
};

export default injectIntl(MarcacionListPage);
