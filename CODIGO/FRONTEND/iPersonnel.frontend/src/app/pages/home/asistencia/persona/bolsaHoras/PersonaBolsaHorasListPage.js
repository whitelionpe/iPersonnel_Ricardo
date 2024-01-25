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
import { isNotEmpty, getStartAndEndOfMonthByDay, dateFormat, convertyyyyMMddToDate } from "../../../../../../_metronic";
//Multi-idioma
import { injectIntl } from "react-intl";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import {
  handleErrorMessages,
  handleInfoMessages,
  handleSuccessMessages,
} from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { storeFiltrar as loadUrl, exportarExcel } from "../../../../../api/asistencia/bolsaHoras.api";
import { initialFilterMarcas } from "./PersonaBolsaHorasIndexPage";

const PersonaBolsaHorasListPage = (props) => {
  //multi-idioma
  const { intl, setLoading, varIdPersona, varIdCompania, dataMenu } = props;
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  //Variables de CustomerDataGrid
  const [isActiveFilters, setIsActiveFilters] = useState(true);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const {FechaInicio, FechaFin } = getStartAndEndOfMonthByDay();
  const [filterData, setFilterData] = useState({ ...initialFilterMarcas, IdCliente, IdPersona: varIdPersona, IdCompania: varIdCompania,FechaInicio:FechaInicio,FechaFin:FechaFin });
   
  // PAGINATION
  // ------------------------------
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;

  const [estadoSimple, setEstadoSimple] = useState([]);
  let dataGridRef = React.useRef();



  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-:::::::::::::::::::::::::::::::::
  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  }


  const eliminarRegistro = (evt) => {
    // evt.cancel = true;
    let data = evt.row.data;
    let { TipoEvento } = data;
    if (TipoEvento === 'A') {
      props.eliminarRegistro(data);
    }
    else {
      handleInfoMessages(intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.WARNINGDELETE" }));
    }

  };
  
  function onCellPrepared(e) { 
    let saldo = e.data.SaldoFinal;
    let minutos = e.data.MinutosSaldoFinal
    let objDiv = <></>;

    if (minutos < 0) {
      objDiv =
        (<div style={{ color: "red" }}>
          {saldo}
        </div>);
    } else {
      objDiv =
        (<div >
          {saldo}
        </div>);
    }

    return objDiv;
  }

  useEffect(() => {
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
  }
  const reverseTransformData = {
    FechaInicio: (value) => convertyyyyMMddToDate(value),
    FechaFin: (value) => convertyyyyMMddToDate(value), 
  }

  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter = ['IdCliente', 'IdPersona', 'FechaFin', 'FechaInicio', 'IdCompania'];


  function VerDetalle(e) {
    props.VerDetalle(e.row.data);
  }


  const exportReport = async () => {

    let result = JSON.parse(localStorage.getItem('vcg:' + props.uniqueId + ':loadOptions'));
    if (!isNotEmpty(result)) return;
    // Recorremos los filtros usados:
    let filterExport = {
      IdCliente,
      IdCompania,
      IdPersona,
      FechaInicio,
      FechaFin
    };
    for (let i = 0; i < result.filter.length; i++) {
      let currentValue = result.filter[i];

      // Filtramos solo los Array
      if (currentValue instanceof Array) {

        // Recorremos cada uno de los filtros en el array
        for (let j = 0; j < currentValue.length; j++) {

          //Llenamos filterData para decompilarlo en el siguente punto.
          filterExport[currentValue[0]] = currentValue[2];
        }
      }
    }
    //obtener orden para exportar
    const { selector } = result.sort[0];

    // Decompilando filterData
    const { IdCliente, IdPersona, IdCompania, FechaInicio, FechaFin } = filterExport;

    if (dataGridRef.current.props.dataSource._items.length > 0) {

      let ListColumnName = [];
      let ListDataField = [];

      dataGridRef.current._optionsManager._currentConfig.configCollections.columns.map(item => {
        if ((item.options.visible === undefined || item.options.visible === true) && item.options.type != 'buttons') {
          ListColumnName.push(item.options.caption.toUpperCase());
          ListDataField.push(item.options.dataField);
        }
      })
      //Obtener dataGrid titulo columnas + idColumnas para exportar de forma dinamica.
      var ArrayColumnHeader = ListColumnName.join('|');
      var ArrayColumnId = ListDataField.join('|');

      let params = {
        IdCliente: IdCliente,
        IdPersona: isNotEmpty(IdPersona) ? IdPersona : "",
        IdCompania: isNotEmpty(IdCompania) ? IdCompania : "",
        FechaInicio: isNotEmpty(FechaInicio) ? FechaInicio : "",
        FechaFin: isNotEmpty(FechaFin) ? FechaFin : "",
        TituloHoja: (intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.REPORTEBOLSAHORAS" })).toUpperCase(), //intl.formatMessage({ id: isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : "" }),
        NombreHoja: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.TITULO" }),//intl.formatMessage({ id: isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : "" }),
        ArrayColumnHeader,
        ArrayColumnId,
        OrderField: selector
      };
      setLoading(true);
      await exportarExcel(params).then(response => {
        if (isNotEmpty(response.fileBase64)) {
          let download = document.getElementById('iddescarga');
          download.href = `data:application/vnd.ms-excel;base64,${encodeURIComponent(response.fileBase64)}`;
          download.download = response.fileName;
          download.click();
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.DOWNLOAD.SUCESS" }));
        }

      }).catch(err => {
        console.log("err>> ", err);
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => {
        setLoading(false);
      });

    }

  }


  const renderCellEliminar = (e) => {
    let estado = true;
    if (e.row.data.Eliminar === 'S') {
      estado = true;
    } else {
      estado = false;
    }

    return estado;
  }

  const renderCellDetalle = (e) => {
    let estado = true;
    if (e.row.data.VerDetalle === 'S') {
      estado = true;
    } else {
      estado = false;
    }

    return estado;
  }


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

        </GroupItem>
      </GroupItem>
    );
  }
  //>..Definir DataGrid para customerDataGrid
  const renderDataGrid = ({ gridRef, dataSource }) => {
    dataGridRef = gridRef;
    return (

      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        id="marcaciones"
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="RowIndex"
        onFocusedRowChanged={seleccionarRegistro}
        // onCellPrepared={onCellPrepared}
        focusedRowKey={props.focusedRowKey}
        remoteOperations={true}
        // allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
      // repaintChangesOnly={true}
      >
        <FilterRow visible={true} showOperationChooser={false} /> 

        <Column
          dataField="Fecha"
          caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" })}
          width={"10%"}
          alignment={"center"}
          dataType="date"
          format="dd/MM/yyyy"
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={false}
        />
        <Column
          dataField="SaldoInicial"
          caption={intl.formatMessage({
            id: "ASISTENCIA.PERSONA.BOLSAHORAS.SALDOINCIAL",
          })}
          alignment={"center"}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
        />
        <Column
          dataField="Entrada"
          alignment={"center"}
          caption={intl.formatMessage({
            id: "ASISTENCIA.PERSONA.BOLSAHORAS.ENTRADA",
          })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
        />
        <Column
          dataField="Salida"
          alignment={"center"}
          caption={intl.formatMessage({
            id: "ASISTENCIA.PERSONA.BOLSAHORAS.SALIDA",
          })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
        />
        <Column
          dataField="SaldoFinal"
          alignment={"center"}
          caption={intl.formatMessage({
            id: "ASISTENCIA.PERSONA.BOLSAHORAS.SALDOFINAL",
          })}
          cellRender={onCellPrepared}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
        />
        <Column
          dataField="TipoEventoDescripcion"
          caption={intl.formatMessage({
            id: "SYSTEM.PROCESS.EVENT",
          })}
          alignment={"center"}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
        />

        <Column
          dataField="Motivo"
          alignment={"left"}
          caption={intl.formatMessage({
            id: "ACCESS.PERSON.MARK.REASON",
          })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
        />

        <Column type="buttons" width={105}
          caption={intl.formatMessage({
            id: "ASSISTANCE.SCHEDULE.DAY.ACTIONS",
          })}>
          <ColumnButton icon="fa fa-eye" hint={intl.formatMessage({ id: "ACTION.DETAIL", })} onClick={VerDetalle} visible={renderCellDetalle} />
          <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarRegistro} visible={renderCellEliminar} />
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
                  onClick={props.agregarAjuste}
                  disabled={customDataGridIsBusy}
                />
                &nbsp;
                {/* <Button
                  icon="search"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                  onClick={() => setIsActiveFilters(!isActiveFilters)}
                  disabled={customDataGridIsBusy}
                /> */}
                &nbsp;
                <Button icon="refresh"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                  disabled={customDataGridIsBusy}
                  onClick={resetLoadOptions} />
                &nbsp;
                <Button
                  icon="fa fa-file-excel"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
                  // disabled={true}
                  onClick={exportReport}
                />
                &nbsp;
                <Button
                  icon="fa fa-times-circle"
                  type="normal"
                  hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                  onClick={props.cancelarEdicion}
                />
                &nbsp;
                &nbsp;
                &nbsp;

              </PortletHeaderToolbar>
            }
          />

        } />

      <a id="iddescarga" className="" ></a>
      <PortletBody>

        <div >
          {/* className="container" */}
          {/* className="float-right" */}

          <div style={{ display: "flex" }}>
            <div  >
              <b> {intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.SALDOACTUAL" })}</b>
            </div>
            {props.saldoActual.Minutos < 0 && (
              <div style={{ color: "red" }}>
                <b>&nbsp;{props.saldoActual.SaldoActual}&nbsp;</b>
              </div>
            )}
            {props.saldoActual.Minutos >= 0 && (
              <div >
                <b>&nbsp;{props.saldoActual.SaldoActual}&nbsp;</b>
              </div>
            )}
            <div >
              <b> {intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.HORASPUNTO" })}</b>
            </div>
          </div> 
        </div>


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

PersonaBolsaHorasListPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string
};
PersonaBolsaHorasListPage.defaultProps = {
  showHeaderInformation: true,
  uniqueId: 'PersonaBolsaHorasList'
};

export default injectIntl(WithLoandingPanel(PersonaBolsaHorasListPage));
