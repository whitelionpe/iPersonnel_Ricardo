import React, { useState, useEffect } from "react";
import { DataGrid, Column, Editing, FilterRow } from "devextreme-react/data-grid";
import { Button } from 'devextreme-react';
import { PortletBody, PortletHeader, PortletHeaderToolbar, Portlet } from "../../../../partials/content/Portlet";
import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { handleWarningMessages, notificar, handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
// import { loadUrlCargaPasajeros ,exportarExcelCarga } from "../../../../../api/transporte/transporteprogramacion.api";
// import { initialFilter } from "./ProgramacionIndexPage";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { convertyyyyMMddToDate, dateFormat, isNotEmpty } from "../../../../../_metronic";
import TransporteProgramacionCargaExcelPopUp from '../../../../partials/components/transporte/popUps/TransporteProgramacionCargaExcelPopUp';
import { loadUrl, service } from "../../../../api/transporte/programacionPasajero.api";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { injectIntl } from "react-intl";
import HeaderInformation from "../../../../partials/components/HeaderInformation";

export const initialFilter = {
  Activo: '',
  FechaProgramadaDesde: new Date(),
  FechaProgramadaHasta: "",
  IdProgramacion: ""
};

const textEditing = {
  confirmDeleteMessage: "",
  editRow: "Editar Programación",
};

const ManifiestoAsientosListPage = props => {
  const { intl } = props;
  const { IdProgramacion } = props.selected;

  const [isVisiblePopUpCargaExcel, setisVisiblePopUpCargaExcel] = useState(false);
  //  const [filterExport, setfilterExport] = useState({
  //     ...initialFilter,
  //   });

  let dataGridRef = React.useRef();

  // ------------------------------
  // CustomDataGrid
  // ------------------------------

  const [refreshData, setRefreshData] = useState(false);

  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);
  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();
  const onLoadedDataGrid = () => setRefreshData(false);

  const [isActiveFilters, setIsActiveFilters] = useState(false);
  //const [filterData] = useState({ Activo: 1 });

  const [filterData, setFilterData] = useState({ ...initialFilter, IdProgramacion: isNotEmpty(IdProgramacion) ? IdProgramacion : "" });

  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorage] = useState(true);

  // ------------------------------

  const exportReport = async () => {

    let result = JSON.parse(localStorage.getItem('vcg:' + props.uniqueId + ':loadOptions'));
    if (!isNotEmpty(result)) return;
    let filterExport = {};
    // Recorremos los filtros usados:

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
    const { Documento, Nombres } = filterExport;

    //if (!isNotEmpty(result)) {

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
        IdProgramacion: IdProgramacion,
        Documento: isNotEmpty(Documento) ? Documento : "",
        Nombres: isNotEmpty(Nombres) ? Nombres : "",
        //--------------------------------------------------------------------
        TituloHoja: "Pasajeros",
        NombreHoja: "Pasajeros",
        ArrayColumnHeader,
        ArrayColumnId,
        OrderField: selector
      };
      //   setLoading(true);
      await service.exportarExcelPasajeros(params).then(response => {
        if (isNotEmpty(response.fileBase64)) {
          let download = document.getElementById('iddescarga');
          download.href = `data:application/vnd.ms-excel;base64,${encodeURIComponent(response.fileBase64)}`;
          download.download = response.fileName;
          download.click();
          handleSuccessMessages("Se descargó con éxito");
        }

      }).catch(err => {
        handleErrorMessages("Información");
      }).finally(() => {
        // setLoading(false);
      });

    }

    // }

  }

  const onCellPrepared = e => {

    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  const transformData = {
    FechaProgramadaDesde: (rawValue) => dateFormat(rawValue, 'yyyyMMdd hh:mm'), //convertCustomDateTimeString(rawValue),
    FechaProgramadaHasta: (rawValue) => dateFormat(rawValue, 'yyyyMMdd hh:mm'), //convertCustomDateTimeString(rawValue),
  }

  const reverseTransformData = {
    FechaProgramadaDesde: (value) => convertyyyyMMddToDate(value),//convertStringToDate(value),
    FechaProgramadaHasta: (value) => convertyyyyMMddToDate(value),//convertStringToDate(value),
  }

  const keysToGenerateFilter = ['IdProgramacion', 'Documento', 'Nombres', 'IdManifiesto'];

  useEffect(() => {
    if (IdProgramacion) {
      setTimeout(() => {
        dataSource.loadDataWithFilter({ data: { IdProgramacion } });
      }, 500)
    }
  }, [IdProgramacion]);

  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <></>
    );
  }

  const renderDataGrid = ({ gridRef, dataSource }) => {
    dataGridRef = gridRef;
    return (
      <DataGrid
        ref={gridRef}
        dataSource={dataSource}
        showBorders={true}
        focusedRowEnabled={true}
        //focusedRowKey={props.focusedRowKey}
        onCellPrepared={onCellPrepared}
      >
        <Editing
          mode="row"
          useIcons={true}
          allowUpdating={false}
          allowDeleting={false}
          texts={textEditing}
        />
        <FilterRow visible={true} showOperationChooser={false} />
        <Column dataField="RowIndex" caption="#" width={50} visible={true} allowSorting={false} allowFiltering={false} allowHeaderFiltering={false} />
        <Column dataField="FechaProgramacion" caption="Fecha" alignment="center" allowSorting={true} allowFiltering={true} allowHeaderFiltering={false} allowColumnResizing={true} />
        <Column dataField="HoraProgramacion" caption="Hora" alignment="center" allowSorting={true} allowFiltering={true} allowHeaderFiltering={false} />
        <Column dataField="IdManifiesto" caption="Manifiesto" alignment="center" allowSorting={true} allowFiltering={true} allowHeaderFiltering={false} />
        <Column dataField="Placa" caption="Placa" alignment="center" allowSorting={true} allowFiltering={true} allowHeaderFiltering={false} />
        <Column dataField="Unidad" caption="Unidad" alignment="center" visible={true} allowSorting={true} allowFiltering={true} allowHeaderFiltering={false} />
        <Column dataField="Documento" caption="Documento" alignment="center" allowSorting={true} allowFiltering={true} allowHeaderFiltering={false} />
        <Column dataField="Pasajero" caption="Pasajero" width={"15%"} allowSorting={true} allowFiltering={true} allowHeaderFiltering={false} />
        <Column dataField="Asiento" caption="Asiento" alignment="center" visible={true} allowSorting={true} allowFiltering={true} allowHeaderFiltering={false} />
        <Column dataField="ParaderoInicial" caption="Paradero Inicial" width={"15%"} visible={true} allowSorting={true} allowFiltering={true} allowHeaderFiltering={false} />
        <Column dataField="ParaderoFinal" caption="Paradero Final" width={"15%"} visible={true} allowSorting={true} allowFiltering={true} allowHeaderFiltering={false} />
      </DataGrid>
    );
  }

  const onLoaded = () => {
    setIfThereAreNoChangesLoadFromStorage(false);
    setCustomDataGridIsBusy(false);
    props.onLoadedDataGrid();
  }

  return (
    <>
 

      <a id="iddescarga" className="" ></a>
      <Portlet>

      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={3}
        toolbar={
                    <PortletHeader
                    title={""}
                    toolbar={
                      <PortletHeaderToolbar>
                        <Button
                          icon="plus"
                          hint={intl.formatMessage({ id: "TRANSPORTE.MANIFEST.MASIVO.BUTTON.LOAD" })}
                          type="default"
                          disabled={props.selected.NumeroAsientosLibres === 0}
                          onClick={() => { setisVisiblePopUpCargaExcel(true) }}
                        />
                        &nbsp;
                        <Button
                          icon="fa fa-file-excel"
                          hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
                          type="default"
                          disabled={customDataGridIsBusy}
                          onClick={exportReport}
                        />
                        &nbsp;
                        <Button
                          icon="fa fa-times-circle"
                          hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                          type="normal"
                          stylingMode="outlined"
                          onClick={props.cancelarEdicion}
                        />
                      </PortletHeaderToolbar>
                    }
                  />
                }
      />

        <PortletBody>
          <CustomDataGrid
            showLog={false} 
            //storedStateTimeout={{ enabled: true, timeout: 12000 }}
            // GRID
            uniqueId={props.uniqueId}
            dataSource={dataSource}
            rowNumberName='RowIndex'
            //loadWhenStartingComponent={!props.refreshData}
            renderDataGrid={renderDataGrid}
            loadUrl={loadUrl}
            forceLoad={refreshData ? forceLoadTypes.FromServer : forceLoadTypes.Unforced}
            sendToServerOnlyIfThereAreChanges={false}
            ifThereAreNoChangesLoadFromStorage={ifThereAreNoChangesLoadFromStorage}
            caseSensitiveWhenCheckingForChanges={true}
            uppercaseFilterRow={true}
            initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'IdManifiesto', order: 'asc' } }}
            summaryCountFormat='Mostrando {0} de {1} registros'
            // CUSTOM FILTER
            titleCustomFilter='Datos a consultar'
            visibleCustomFilter={isActiveFilters}
            // renderFormContentCustomFilter={renderFormContentCustomFilter}
            keysToGenerateFilter={keysToGenerateFilter}
            filterData={filterData}
            transformData={transformData}
            reverseTransformData={reverseTransformData}
            // PAGINATION
            paginationSize='lg'
            // EVENTS
            onLoading={() => setCustomDataGridIsBusy(true)}
            onError={() => setCustomDataGridIsBusy(false)}
            onLoaded={onLoaded}
          //onLoaded={() => setCustomDataGridIsBusy(false)}
          />
        </PortletBody>
      </Portlet>

      {/*** PopUp -> Buscar Trabajador ****/}
      {isVisiblePopUpCargaExcel && (
        <TransporteProgramacionCargaExcelPopUp
          showPopup={{ isVisiblePopUp: isVisiblePopUpCargaExcel, setisVisiblePopUp: setisVisiblePopUpCargaExcel }}
          cancelarEdicion={() => setisVisiblePopUpCargaExcel(false)}
          IdProgramacion={props.selected.IdProgramacion}
          dataSource={dataSource}
        />
      )}

    </>
  );
};

export default injectIntl(ManifiestoAsientosListPage);
