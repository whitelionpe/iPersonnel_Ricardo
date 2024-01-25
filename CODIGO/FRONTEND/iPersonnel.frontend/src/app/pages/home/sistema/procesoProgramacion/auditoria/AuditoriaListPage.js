import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem, Button as ColumnButton, FilterRow } from "devextreme-react/data-grid";

import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { isNotEmpty, getDateOfDay } from "../../../../../../_metronic";
//import { getStartAndEndOfMonthByDay, truncateDate } from '../../../../../../_metronic/utils/utils';
import PropTypes from "prop-types";
import { Button } from "devextreme-react";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";

import { useSelector } from "react-redux";
import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";
//Custom grid: 
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { storeListar as loadUrl, service as serviceAuditoria } from "../../../../../api/sistema/procesoAuditoria.api";

import { obtenerTodos as obtenerTipoProceso } from "../../../../../api/sistema/tipoProceso.api";
import { obtenerTodos as obtenerCmbModulo } from "../../../../../api/sistema/modulo.api";
import { obtenerTodos as listaAplicacion } from "../../../../../api/sistema/aplicacion.api";
import { service } from "../../../../../api/sistema/proceso.api";

import { Item, GroupItem } from "devextreme-react/form";
import { convertCustomDateTimeString, convertStringToDate } from "../../../../../partials/components/CustomFilter";
import { initialFilter } from "./AuditoriaIndexPage";

const AuditoriaListPage = props => {
  const { intl, varIdCliente, setLoading } = props;
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);

  const [tipoProceso, setTipoProceso] = useState([]);
  const [modulo, setModulo] = useState([]);
  const [aplicaciones, setAplicaciones] = useState([]);
  const [proceso, setProceso] = useState([]);
  //const { FechaInicio } = getStartAndEndOfMonthByDay();

  let dataGridRef = React.useRef();

  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;
  const [filterData, setFilterData] = useState({
    ...initialFilter
  });

  async function cargarCombos() {
    let dataTipoProceso = await obtenerTipoProceso({ IdTipoProceso: "%" });
    setTipoProceso(dataTipoProceso);

    let cmbModulo = await obtenerCmbModulo();
    setModulo(cmbModulo);

    let dataAplicacion = await listaAplicacion();
    setAplicaciones(dataAplicacion);

    let dataProceso = await service.obtenerTodos();
    //console.log("cargarCombos|dataProceso:", dataProceso);
    setProceso(dataProceso);


  }


  const editarRegistro = evt => {
    props.editarRegistro(evt.data);
  };

  const verRegistro = (evt) => {
    props.editarRegistro(evt.row.data);
  };

  const eliminarRegistro = evt => {
    evt.cancel = true;
    props.eliminarRegistro(evt.data);
  };

  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  }

  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  };

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }


  const [filterDatax, setFilterDatax] = useState({ ...initialFilter, IdCliente });

  const exportReport = async () => {
    let result = JSON.parse(localStorage.getItem('vcg:' + props.uniqueId + ':loadOptions'));
    if (!isNotEmpty(result)) return;
    for (let i = 0; i < result.filter.length; i++) {
      let currentValue = result.filter[i];

      if (currentValue instanceof Array) {

        for (let j = 0; j < currentValue.length; j++) {

          filterDatax[currentValue[0]] = currentValue[2];
        }
      }
    }
    //obtener orden para exportar
    const { selector } = result.sort[0];

    const { IdCliente, IdTipoProceso, IdModulo, IdAplicacion, IdProceso, FechaInicio, FechaFin } = filterDatax;

    if (dataGridRef.current.props.dataSource._items.length > 0) {

      let ListColumnName = [];
      let ListDataField = [];

      dataGridRef.current._optionsManager._currentConfig.configCollections.columns.map(item => {
        if ((item.options.visible === undefined || item.options.visible === true) && item.options.type != 'buttons') {
          ListColumnName.push(item.options.caption.toUpperCase());
          ListDataField.push(item.options.dataField);
        }
      })
      var ArrayColumnHeader = ListColumnName.join('|');
      var ArrayColumnId = ListDataField.join('|');

      let params = {
        IdCliente: IdCliente,
        IdTipoProceso: isNotEmpty(IdTipoProceso) ? IdTipoProceso : "",
        IdModulo: isNotEmpty(IdModulo) ? IdModulo : "",
        IdAplicacion: isNotEmpty(IdAplicacion) ? IdAplicacion : "",
        IdProceso: isNotEmpty(IdProceso) ? IdProceso : "",
        FechaInicio: isNotEmpty(FechaInicio) ? FechaInicio : "",
        FechaFin: isNotEmpty(FechaFin) ? FechaFin : "",
        TituloHoja: intl.formatMessage({ id: "ACTION.EXPORT" }) + ' ' + intl.formatMessage({ id: "CONFIG.MENU.SISTEMA.GESTIÓN_DE_ALERTAS_Y_AC" }),
        NombreHoja: intl.formatMessage({ id: "CONFIG.MENU.SISTEMA.GESTIÓN_DE_ALERTAS_Y_AC" }),
        ArrayColumnHeader,
        ArrayColumnId,
        OrderField: selector
      };
      setLoading(true);
      await serviceAuditoria.exportarExcel(params).then(response => {
        if (isNotEmpty(response.fileBase64)) {
          let download = document.getElementById('iddescarga');
          download.href = `data:application/vnd.ms-excel;base64,${encodeURIComponent(response.fileBase64)}`;
          download.download = response.fileName;
          download.click();
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.DOWNLOAD.SUCESS" }));
        }

      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => {
        setLoading(false);
      });

    }
  }





  useEffect(() => {
    cargarCombos();
    if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage])

  useEffect(() => {
    // console.log("useEffect2|props.filtro:");
    if (props.refreshData) {
      props.refresh();
      props.setRefreshData(false);
    }
  }, [props.refreshData]);

  useEffect(() => {
    //const { IdCliente } = props.filtro;
    if (varIdCliente) {
      props.dataSource.loadDataWithFilter({ data: { IdCliente: varIdCliente } });
    }
  }, [varIdCliente]);

  const transformData = {
    FechaInicio: (rawValue) => convertCustomDateTimeString(rawValue),
    FechaFin: (rawValue) => convertCustomDateTimeString(rawValue),
  };
  const reverseTransformData = {
    FechaInicio: (value) => convertStringToDate(value),
    FechaFin: (value) => convertStringToDate(value),
  };


  //-CustomerDataGrid-Filter
  const keysToGenerateFilter = [
    "IdCliente",
    "IdTipoProceso",
    "IdModulo",
    "IdAplicacion",
    "IdProceso",
    "FechaInicio",
    "FechaFin"
  ];

  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem >
        <GroupItem itemType="group" colCount={6} colSpan={6} >

          <Item
            dataField="IdTipoProceso"
            label={{ text: intl.formatMessage({ id: "Tipo Proceso" }) }}
            editorType="dxSelectBox"
            colSpan={2}
            editorOptions={{
              items: tipoProceso,
              valueExpr: "IdTipoProceso",
              displayExpr: "TipoProceso",
              showClearButton: true,
              onValueChanged: () => getInstance().filter(),
            }}
          />

          <Item
            dataField="IdModulo"
            label={{ text: intl.formatMessage({ id: "Modulo" }) }}
            colSpan={2}
            editorType="dxSelectBox"
            editorOptions={{
              items: modulo,
              valueExpr: "IdModulo",
              displayExpr: "Modulo",
              showClearButton: true,
              onValueChanged: () => getInstance().filter(),
            }}
          />

          <Item
            dataField="IdAplicacion"
            label={{ text: intl.formatMessage({ id: "Aplicación" }) }}
            colSpan={2}
            editorType="dxSelectBox"
            editorOptions={{
              items: aplicaciones,
              valueExpr: "IdAplicacion",
              displayExpr: "Aplicacion",
              showClearButton: true,
              onValueChanged: () => getInstance().filter(),
            }}
          />

          <Item
            dataField="IdProceso"
            label={{ text: intl.formatMessage({ id: "Proceso" }) }}
            colSpan={2}
            editorType="dxSelectBox"
            editorOptions={{
              items: proceso,
              valueExpr: "IdProceso",
              displayExpr: "Proceso",
              showClearButton: true,
              onValueChanged: () => getInstance().filter(),
            }}
          />

          <Item
            dataField="FechaInicio"
            label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.STARTDATE" }) }}
            colSpan={2}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy",
              onValueChanged: () => getInstance().filter(),
            }}
          />
          <Item
            dataField="FechaFin"
            label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.ENDDATE" }) }}
            colSpan={2}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy",
              onValueChanged: () => getInstance().filter(),
            }}
          />

        </GroupItem>
      </GroupItem>
    );
  }

  const renderDataGrid = ({ gridRef, dataSource }) => {
    dataGridRef = gridRef;
    return (
      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="RowIndex"
        //onEditingStart={editarRegistro}
        //onRowRemoving={eliminarRegistro}
        onCellPrepared={onCellPrepared}
        onFocusedRowChanged={seleccionarRegistro}
        focusedRowKey={props.focusedRowKey}
        repaintChangesOnly={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
      >
        <FilterRow visible={false} showOperationChooser={false} />
        <Column dataField="RowIndex"caption="-" visible={false} />
        <Column dataField="IdProceso" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} alignment={"center"} allowHeaderFiltering={false} allowSorting={true} />
        <Column dataField="Proceso" caption={intl.formatMessage({ id: "SYSTEM.PROCESS" })} width={"25%"} allowHeaderFiltering={false} allowSorting={true} />
        <Column dataField="Programacion" caption={intl.formatMessage({ id: "SYSTEM.PROCESS.PROGRAMMING" })} width={"25%"} allowHeaderFiltering={false} allowSorting={true} />
        <Column dataField="Evento" caption={intl.formatMessage({ id: "SYSTEM.PROCESS.EVENT" })} width={"25%"} allowHeaderFiltering={false} allowSorting={true} />
        <Column dataField="FechaEjecucion" caption={intl.formatMessage({ id: "SYSTEM.PROCESS.DATE" })} width={"15%"} alignment={"center"} dataType="date" format="dd/MM/yyyy HH:mm" allowHeaderFiltering={false} allowSorting={true} />
        <Column type="buttons" visible={props.showButtons} width={"5%"} >
          <ColumnButton icon="fa fa-eye" hint={intl.formatMessage({ id: "ASSISTANCE.PERSON.SCHEDULE.VIEW" })} width={"10%"} alignment={"left"} onClick={verRegistro} />
        </Column>
      </DataGrid>
    );
  }


  return (
    <>
      <a id="iddescarga" className="" ></a>
      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title={""}
            toolbar={
              <PortletHeaderToolbar>
                <PortletHeaderToolbar>
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
                    onClick={resetLoadOptions}
                    visible={true}
                  />
                  &nbsp;
                  <Button
                    icon="fa fa-file-excel"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
                    disabled={customDataGridIsBusy}
                    onClick={exportReport}
                  />
                  &nbsp;
                  <Button
                    icon="fa fa-times-circle"
                    type="normal"
                    hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                    onClick={props.cancelarEdicion}
                  />

                </PortletHeaderToolbar>
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
          initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'IdProceso', order: 'desc' } }}
          filterRowSize='sm'
          summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}
          visibleCustomFilter={isActiveFilters}
          renderFormContentCustomFilter={renderFormContentCustomFilter}
          //  :::: CUSTOM FILTER ::::
          transformData={transformData}
          reverseTransformData={reverseTransformData}
          keysToGenerateFilter={keysToGenerateFilter}
          filterData={filterData}
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

AuditoriaListPage.propTypes = {
  showButton: PropTypes.bool,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  uniqueId: PropTypes.string
};
AuditoriaListPage.defaultProps = {
  showButton: true,
  modoEdicion: false,
  showButtons: true,
  uniqueId: "ProcesoAuditoriaList"
};

export default injectIntl(WithLoandingPanel(AuditoriaListPage));
