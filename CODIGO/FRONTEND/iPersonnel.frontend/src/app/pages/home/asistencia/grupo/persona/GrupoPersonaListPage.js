import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { Button, DataGrid } from "devextreme-react";
import { Column, Editing, FilterRow, Selection, Summary, TotalItem } from "devextreme-react/data-grid";
import AdministracionPersonaBuscar from "../../../../../partials/components/AdministracionPersonaBuscar";
import { isNotEmpty, setDataTempLocal } from "../../../../../../_metronic";
import { useSelector } from "react-redux";
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid";
import { storeFiltrar as loadUrl } from "../../../../../api/asistencia/personaGrupo.api";


export const initialFilter = {
    IdCliente: "1",
    IdDivision: "",
    IdGrupo: "",
    IdCompania: "",
    Activo: "S", 
  };

const GrupoPersonaListPage = (props) => { 
    const { intl, accessButton } = props;
    const { IdCliente, IdDivision } = useSelector((state) => state.perfil.perfilActual);
    const { IdGrupo,IdCompania } = props.selected;
    const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
    const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdDivision, IdCompania, IdGrupo }); 
    const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
    const resetLoadOptions = props.resetLoadOptions;
    const [selectedRow, setSelectedRow] = useState([]);
    const [activarFiltros, setactivarFiltros] = useState(false);
    const [btnBotonEliminar, setBtnBotonEliminar] = useState(false);
 

    let dataGridRef = React.useRef();

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    }

    const eliminarRegistro = evt => {
        evt.cancel = true;
        props.eliminarRegistro(evt.data);
    }

    //-CustomerDataGrid-Filter
    const keysToGenerateFilter = [
        'IdCliente',
        'IdDivision',
        'IdCompania',
        'IdGrupo',
        'IdPersona',
        'NombreCompleto',
        'Documento',
        'TipoDocumentoAlias',
        // 'FechaInicio',
        // 'FechaFin',
        'Activo'];


    //========================ADD============================
    const seleccionarRegistro = evt => {
        if (evt.rowIndex === -1) return;
        if (isNotEmpty(evt.row.data)) setDataTempLocal('selectRowData', evt.row.data);
    }

    function onSelectionChanged(e) {
        //Seleccion multiple
        setSelectedRow(e.selectedRowsData);

    }

    function eliminarRegistroMasivo() {
        props.eliminarRegistroMasivo(selectedRow)
    }


  //====================================================
  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
    // if (dataGridRef.current.props.dataSource._items.length > 0) {
    //   setBtnBotonEliminar(false)
    // } else {
    //   setBtnBotonEliminar(true)
    // }
  }

  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  }

  async function generarFiltro(data) {
    const { FechaInicio, FechaFin } = data;
    if (isNotEmpty(FechaInicio) && isNotEmpty(FechaFin)) {
      let filtros = {
        FechaInicio,
        FechaFin,
      };
      props.cargaListaPersonasRegimen(filtros);
    }
  }



  //-CustomerDataGrid-UseEffect-ini->
  useEffect(() => {
    if (ifThereAreNoChangesLoadFromStorage) {
      setIfThereAreNoChangesLoadFromStorages(false);

    }
  }, [ifThereAreNoChangesLoadFromStorage])

  useEffect(() => {
    if (props.refreshData) {
      props.refresh();
      props.setRefreshData(false);

    }
  }, [props.refreshData]);

  useEffect(() => {
    if (IdGrupo) {

      props.dataSource.loadDataWithFilter({ data: { ...filterData,IdGrupo:IdGrupo } });
    }
  }, [IdGrupo]);


  const renderDataGrid = ({ gridRef, dataSource }) => {
    if (dataSource._storeLoadOptions.filter !== undefined) {
      if (props.totalRowIndex === 0) {
        props.setTotalRowIndex(dataSource._totalCount);

      }
      if (dataSource._totalCount != props.totalRowIndex) {
        if (dataSource._totalCount != -1) {
          props.setFocusedRowKey();
          props.setTotalRowIndex(dataSource._totalCount);

        }
      }
    }

    // if (gridRef)
    //   if (gridRef.current)
    //     if (gridRef.current.props.dataSource)
    //       console.log('%c [ dataGridRef ]-test-127', 'font-size:13px; background:pink; color:#bf2c9f;', gridRef.current.props.dataSource)

    dataGridRef = gridRef;
    return (
      <DataGrid
        id="gridContainer_"
        keyExpr="RowIndex"
        ref={gridRef}
        dataSource={dataSource}
        showBorders={true}

        onEditingStart={editarRegistro}
        onRowRemoving={eliminarRegistro}
        eliminarRegistroMasivo={eliminarRegistroMasivo}

        repaintChangesOnly={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}

        focusedRowEnabled={true}
        onSelectionChanged={(e => onSelectionChanged(e))}
        onFocusedRowChanged={seleccionarRegistro}



        onCellPrepared={onCellPrepared}
      >
        <Editing
          mode="row"
          useIcons={props.showButtons}
          allowUpdating={false}//{props.showButtons}
          allowDeleting={props.showButtons}
          texts={textEditing}
        />
        <FilterRow visible={true} showOperationChooser={false} />

        <Selection mode={"multiple"} width={"5px"} showCheckBoxesMode={'always'} selectAllMode={'page'} />
        <Column
          dataField="RowIndex"
          caption="#"
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          width={"5%"}
          alignment={"center"}
        />
        <Column
          dataField="IdPersona"
          caption={intl.formatMessage({ id: "COMMON.CODE" })}
          width={"15%"}
          alignment={"center"}
          allowSorting={true}
          allowSearch={true}
          allowFiltering={true}
        />
        <Column
          dataField="NombreCompleto"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
          width={"45%"}
          //cellRender={DoubleLineLabel}
          allowSorting={true}
          allowSearch={true}
          allowFiltering={true}
        />
        <Column
          dataField="TipoDocumentoAlias"
          caption={intl.formatMessage({
            id: "COMMON.TYPE",
          })}
          width={"15%"}
          alignment={"center"}
          allowSearch={false}
          allowFiltering={false}
          visible={true}
        />
        <Column
          dataField="Documento"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}
          allowSorting={true}
          allowFiltering={true}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"20%"}
          visible={true}
        />
        {/* <Column
          dataField="FechaInicio"
          caption={intl.formatMessage({
            id: "CASINO.PERSON.GROUP.STARTDATE",
          })}
          dataType="date" format="dd/MM/yyyy"
          width={"20%"}
          alignment={"center"}
          allowSorting={true}
          allowSearch={true}
          allowFiltering={true}
        />
        <Column
          dataField="FechaFin"
          caption={intl.formatMessage({
            id: "CASINO.PERSON.GROUP.ENDDATE",
          })}
          dataType="date" format="dd/MM/yyyy"
          width={"20%"}
          alignment={"center"}
          allowSorting={true}
          allowSearch={true}
          allowFiltering={true}
        /> */}

      </DataGrid>
    );
  }


    return (
        <>
            {props.showHeaderInformation && (
                <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
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
                                    />
                                    &nbsp;
                                    <Button icon="refresh" //fa fa-broom
                                        type="default"
                                        hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                                        disabled={customDataGridIsBusy}
                                        onClick={resetLoadOptions} />
                                    &nbsp;
                                    <Button
                                        icon="fa fa-trash"
                                        type="default"
                                        hint={intl.formatMessage({ id: "ACTION.REMOVE" })}
                                        useSubmitBehavior={true}
                                        validationGroup="FormEdicion"
                                        onClick={eliminarRegistroMasivo}
                                        disabled={btnBotonEliminar}
                                    />
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
            )}

            <PortletBody>
                {/* {activarFiltros ? (
                    <PersonaGrupoFilterPage
                        generarFiltro={generarFiltro}
                        dataFilter={dataFilter}
                    />
                ) : null} */}
                <CustomDataGrid  
                    /*  dataSource={props.personasRegimen}*/
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
                    initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'FechaFin', order: 'desc' } }}
                    filterRowSize='sm'
                    summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}

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


            {/* 
            {isVisiblePopUpPersona && (
                <AdministracionPersonaBuscar
                    uniqueId={"AsistenciaGrupoPersonaBuscar"}
                    showPopup={{ isVisiblePopUp: isVisiblePopUpPersona, setisVisiblePopUp: setisVisiblePopUpPersona }}
                    cancelar={() => setisVisiblePopUpPersona(false)}
                    agregar={agregarPersona}
                    //Filtros={Filtros}
                    selectionMode={"single"}
                />
            )} */}

        </>
    );
};

export default injectIntl(WithLoandingPanel(GrupoPersonaListPage));