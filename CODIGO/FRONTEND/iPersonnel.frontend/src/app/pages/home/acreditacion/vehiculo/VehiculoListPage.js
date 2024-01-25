import React, { useEffect, useState, Fragment } from "react";
import { injectIntl } from "react-intl";

import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar,
} from "../../../../partials/content/Portlet";
import { Button } from "devextreme-react";
import { DataGrid, Column, Editing, FilterRow, HeaderFilter, FilterPanel } from "devextreme-react/data-grid";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { GroupItem, Item } from "devextreme-react/form";

import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { storeFiltrarAcreditacionVehiculos as loadUrl, serviceVehiculo } from "../../../../api/administracion/vehiculo.api";
import { initialFilter } from "./VehiculoIndexPage";
import { isNotEmpty, listarEstadoSimple, listarTipoAcreditacion, STATUS_ACREDITACION_SOLICITUD } from "../../../../../_metronic";
import WithLoandingPanel from "../../../../partials/content/withLoandingPanel";
import AdministracionUnidadOrganizativaBuscar from "../../../../partials/components/AdministracionUnidadOrganizativaBuscar";
import AdministracionCompaniaBuscar from "../../../../partials/components/AdministracionCompaniaBuscar";
import AdministracionContratoBuscar from "../../../../partials/components/AdministracionContratoBuscar";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";

const VehiculoListPage = (props) => {
  const { intl, setLoading } = props;
  const { IdCliente } = useSelector((state) => state.perfil.perfilActual);

  //Variables customerDataGrid
  const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente });
  // PAGINATION
  // ------------------------------
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;

  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [popupVisibleContrato, setPopupVisibleContrato] = useState(false);
  const [tipoFiltro, setTipoFiltro] = useState([]);

  let dataGridRef = React.useRef();

  async function cargarCombos() {

    let estadoSimples = listarEstadoSimple();
    let listarTipoFiltro = listarTipoAcreditacion();

    setEstadoSimple(estadoSimples);
    setTipoFiltro(listarTipoFiltro);
  }

  const obtenerCampoActivo = (rowData) => {
    return rowData.Activo === "S";
  };

  const editarRegistro = (evt) => {
    props.editarRegistro(evt.data);
  };

  const eliminarRegistro = (evt) => {
    evt.cancel = true;
    props.eliminarRegistro(evt.data);
  };

  const seleccionarRegistro = (evt) => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  };

  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  };


  const selectCompania = dataPopup => {
    const { IdCompania, Compania } = dataPopup[0];
    props.dataSource.loadDataWithFilter({ data: { IdCompania, Compania } })
    setPopupVisibleCompania(false);
  }

  const selectUnidadOrganizativa = async (selectedRow) => {
    let strUnidadesOrganizativas = selectedRow.map(x => x.IdUnidadOrganizativa).join('|');
    let UnidadesOrganizativasDescripcion = selectedRow.map(x => x.Menu).join(',');
    props.dataSource.loadDataWithFilter({ data: { UnidadesOrganizativas: strUnidadesOrganizativas, UnidadesOrganizativasDescripcion } });
    setPopupVisibleUnidad(false);
  };

  const agregarContrato = dataPopup => {
    const { IdContrato, Contrato } = dataPopup[0];
    props.dataSource.loadDataWithFilter({ data: { IdContrato, Contrato } })
    setPopupVisibleContrato(false);
  }

  const exportReport = async () => {

    let result = JSON.parse(localStorage.getItem('vcg:' + props.uniqueId + ':loadOptions'));

    if (!isNotEmpty(result)) return;

    for (let i = 0; i < result.filter.length; i++) {
      let currentValue = result.filter[i];

      if (currentValue instanceof Array) {

        for (let j = 0; j < currentValue.length; j++) {

          filterData[currentValue[0]] = currentValue[2];
        }
      }
    }

    //obtener orden para exportar
    const { selector } = result.sort[0];

    const { IdCliente, IdVehiculo, Placa, TipoVehiculo, Modelo, Color, Marca, Serie, IdCompania,
      IdUnidadOrganizativa, UnidadesOrganizativas, IdContrato, MostrarVehiculos, Activo } = filterData;


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
        IdVehiculo: isNotEmpty(IdVehiculo) ? IdVehiculo : "",
        Placa: isNotEmpty(Placa) ? Placa : "",
        TipoVehiculo: isNotEmpty(TipoVehiculo) ? TipoVehiculo : "",
        Modelo: isNotEmpty(Modelo) ? Modelo : "",
        Color: isNotEmpty(Color) ? Color : "",
        Marca: isNotEmpty(Marca) ? Marca : "",
        Serie: isNotEmpty(Serie) ? Serie : "",
        IdCompania: isNotEmpty(IdCompania) ? IdCompania : "",
        IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa : "",
        UnidadesOrganizativas: isNotEmpty(UnidadesOrganizativas) ? UnidadesOrganizativas : "",
        IdContrato: isNotEmpty(IdContrato) ? IdContrato : "",
        Activo: isNotEmpty(Activo) ? Activo : "",
        MostrarVehiculos: isNotEmpty(MostrarVehiculos) ? MostrarVehiculos : "",
        TituloHoja: intl.formatMessage({ id: "ADMINISTRATION.EXPORT_VEHICLES" }),
        NombreHoja: intl.formatMessage({ id: "ADMINISTRATION.EXPORT_VEHICLES" }),
        ArrayColumnHeader,
        ArrayColumnId,
        OrderField: selector
      };
      setLoading(true);
      await serviceVehiculo.exportarExcelAcreditacionVehiculos(params).then(response => {
        if (isNotEmpty(response.fileBase64)) {
          let download = document.getElementById('iddescarga');
          download.href = `data:application/vnd.ms-excel;base64,${encodeURIComponent(response.fileBase64)}`;
          download.download = response.fileName;
          download.click();
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.DOWNLOAD.SUCESS" }));
        }

      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });

    }

  }

  const cellEstadoRender = (e) => {

    if (e.data.UltimoEstado === null) {
      return "";
    }

    let estado = e.data.UltimoEstado;
    let css = '';
    let estado_txt = "";
    if (e.data.UltimoEstado.trim() === "") {
      estado = "I";
    }

    switch (estado) {
      case STATUS_ACREDITACION_SOLICITUD.INCOMPLETA: css = 'estado_item_incompleto'; estado_txt = intl.formatMessage({ id: "COMMON.INCOMPLETE" }); break;
      case STATUS_ACREDITACION_SOLICITUD.PENDIENTE: css = 'estado_item_pendiente'; estado_txt = intl.formatMessage({ id: "COMMON.EARRING" }); break;
      case STATUS_ACREDITACION_SOLICITUD.OBSERVADO: css = 'estado_item_observado'; estado_txt = intl.formatMessage({ id: "COMMON.OBSERVED" }); break;
      case STATUS_ACREDITACION_SOLICITUD.RECHAZADO: css = 'estado_item_rechazado'; estado_txt = intl.formatMessage({ id: "COMMON.REJECTED" }); break;
      case STATUS_ACREDITACION_SOLICITUD.APROBADO: css = 'estado_item_aprobado'; estado_txt = intl.formatMessage({ id: "COMMON.APPROVED" }); break;
    };

    return (css === '') ?
      <div className={"estado_item_general"}>{estado_txt}</div>
      : <div className={`estado_item_general  ${css}`}   >{estado_txt}</div>
  }

  function onCellPrepared(e) {
    if (e.rowType === "data") {
      if (e.data.Activo === "N") {
        e.cellElement.style.color = "red";
      }
    }
  }

  useEffect(() => {
    cargarCombos();
    if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage])

  useEffect(() => {
    if (props.refreshData) {
      props.refresh();
      props.setRefreshData(false);
    }
  }, [props.refreshData]);



  //Filter
  const keysToGenerateFilter = ['IdCliente', 'IdVehiculo', 'Placa', 'TipoVehiculo', 'Modelo', 'Marca', 'Color', 'Serie',
    'IdCompania', 'IdUnidadOrganizativa', 'UnidadesOrganizativas', 'IdContrato', 'MostrarVehiculos', 'Activo'];
  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem>
        <GroupItem itemType="group" colCount={2} colSpan={2}>
          <Item dataField="IdCompania" visible={false} />
          <Item dataField="IdUnidadOrganizativa" visible={false} />
          <Item dataField="IdContrato" visible={false} />

          <Item
            dataField="Compania"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" }) }}
            editorOptions={{
              readOnly: true,
              hoverStateEnabled: false,
              inputAttr: { 'style': 'text-transform: uppercase' },
              showClearButton: true,
              buttons: [{
                name: 'search',
                location: 'after',
                useSubmitBehavior: true,
                options: {
                  stylingMode: 'text',
                  icon: 'search',
                  disabled: false,
                  onClick: () => {
                    setPopupVisibleCompania(true);
                  },
                }
              }],
              onValueChanged: () => getInstance().filter(),
            }}
          />
          <Item
            dataField="UnidadesOrganizativasDescripcion"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.ORGANIZATIONALUNIT" }) }}
            editorOptions={{
              readOnly: true,
              hoverStateEnabled: false,
              inputAttr: { 'style': 'text-transform: uppercase' },
              showClearButton: true,
              buttons: [{
                name: 'search',
                location: 'after',
                useSubmitBehavior: true,
                options: {
                  stylingMode: 'text',
                  icon: 'search',
                  disabled: false,
                  onClick: () => {
                    setPopupVisibleUnidad(true);
                  },
                }
              }],
              onValueChanged: () => getInstance().filter(),
            }}
          />

          <Item
            dataField="Contrato"
            colSpan={1}
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" }) }}
            editorOptions={{
              hoverStateEnabled: false,
              inputAttr: { 'style': 'text-transform: uppercase' },
              showClearButton: true,
              buttons: [{
                name: 'search',
                location: 'after',
                useSubmitBehavior: true,
                options: {
                  stylingMode: 'text',
                  icon: 'search',
                  onClick: (evt) => {
                    setPopupVisibleContrato(true);
                  },
                }
              }],
              onValueChanged: () => getInstance().filter(),
            }}
          />


          <Item
            dataField="Activo"
            label={{ text: intl.formatMessage({ id: "COMMON.ACTIVE" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: estadoSimple,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              showClearButton: true,
              onValueChanged: () => getInstance().filter(),
            }}
          />

          <Item
            dataField="MostrarVehiculos"
            label={{ text: intl.formatMessage({ id: "ACCREDITATION.MAIN" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: tipoFiltro,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              onValueChanged: () => getInstance().filter(),
            }}
          />

        </GroupItem>
      </GroupItem>
    );
  }
  //DataGrid  
  const renderDataGrid = ({ gridRef, dataSource }) => {
    if (dataSource._storeLoadOptions.filter !== undefined) {
      if (props.totalRowIndex === 0) {
        props.setTotalRowIndex(dataSource._totalCount);
      }
      if (dataSource._totalCount != props.totalRowIndex) {
        if (dataSource._totalCount != -1) {
          props.setVarIdVehiculo("")
          props.setFocusedRowKey();
          props.setTotalRowIndex(dataSource._totalCount);
        }
      }
    }
    dataGridRef = gridRef;
    return (
      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        showBorders={true}
        keyExpr="RowIndex"
        remoteOperations={true}
        onEditingStart={editarRegistro}
        onRowRemoving={eliminarRegistro}
        onCellPrepared={onCellPrepared}
        onFocusedRowChanged={seleccionarRegistro}
        focusedRowEnabled={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
        focusedRowKey={props.focusedRowKey}
      >
        <Editing
          mode="row"
          useIcons={props.showButtons}
          allowUpdating={props.showButtons}
          allowDeleting={props.showButtons}
          texts={textEditing}
        />
        <FilterRow visible={true} showOperationChooser={false} />
        <HeaderFilter visible={false} />
        <FilterPanel visible={false} />

        <Column
          dataField="RowIndex"
          caption="#"
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={false}
          width={"5%"}
          alignment={"center"}
        />
        <Column
          dataField="IdVehiculo"
          caption={intl.formatMessage({ id: "COMMON.CODE" })}
          allowHeaderFiltering={false}
          allowSorting={true}
          width={"7%"}
          alignment={"center"}
        />

        <Column
          dataField="Placa"
          caption={intl.formatMessage({
            id: "ADMINISTRATION.VEHICLE.PLATE",
          })}
          allowSorting={true}
          allowHeaderFiltering={false}
          width={"10%"}
        />

        <Column
          dataField="TipoVehiculo"
          caption={intl.formatMessage({
            id: "ADMINISTRATION.VEHICLE.TYPE",
          })}
          allowSorting={true}
          allowHeaderFiltering={false}
          width={"15%"}
        />
        <Column
          dataField="Modelo"
          caption={intl.formatMessage({
            id: "ADMINISTRATION.VEHICLE.MODEL",
          })}
          allowSorting={true}
          allowHeaderFiltering={false}
          width={"15%"}
        />

        <Column
          dataField="Marca"
          caption={intl.formatMessage({
            id: "ADMINISTRATION.VEHICLE.BRAND",
          })}
          allowSorting={true}
          allowHeaderFiltering={false}
          width={"15%"}
        />

        <Column
          dataField="Color"
          caption={intl.formatMessage({
            id: "ADMINISTRATION.VEHICLE.COLOR",
          })}
          allowSorting={true}
          allowHeaderFiltering={false}
          width={"15%"}
        />

        <Column
          dataField="Serie"
          caption={intl.formatMessage({
            id: "ADMINISTRATION.VEHICLE.SERIE",
          })}
          allowSorting={true}
          allowHeaderFiltering={false}
          width={"15%"}
        />
        {/* --------------------------------- */}
        <Column dataField="Compania"
          caption={intl.formatMessage({ id: "ACCREDITATION.REPORT.COMPANY" })}
          allowHeaderFiltering={false} allowSorting={false} allowFiltering={false}
          width={"10%"}
        />
        <Column dataField="TotalAcreditaciones"
          caption={intl.formatMessage({ id: "ACCREDITATION.REPORT.TOTACREDITATION" })}
          allowHeaderFiltering={false} allowSorting={false} allowFiltering={false}
          width={"10%"}
          alignment={"center"}
        />

        <Column dataField="UltimoPerfil"
          caption={intl.formatMessage({ id: "ACCREDITATION.REPORT.PERFIL" })}
          allowHeaderFiltering={false} allowSorting={false} allowFiltering={false}
          width={"10%"}
        />

        <Column dataField="FechaUltimaSolicitud"
          caption={intl.formatMessage({ id: "ACCREDITATION.REPORT.FECSOLICITUD" })}
          allowHeaderFiltering={false} allowSorting={false} allowFiltering={false}
          width={"10%"}
          alignment={"center"}
          dataType="date"
          format="dd/MM/yyyy"
        />

        <Column dataField="UltimoEstado"
          caption={intl.formatMessage({ id: "ACCREDITATION.REPORT.ESTADO" })}
          allowHeaderFiltering={false} allowSorting={false} allowFiltering={false}
          width={"103px"}
          alignment={"center"}
          cellRender={cellEstadoRender}
        />
        {/* --------------------------------- */}
        <Column
          dataField="Activo"
          caption={intl.formatMessage({
            id: "COMMON.ACTIVE",
          })}
          calculateCellValue={obtenerCampoActivo}
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={false}
          width={"7%"}
        />
      </DataGrid>
    );
  }

  return (
    <>
      <a id="iddescarga" className="" ></a>
      <PortletHeader
        title={intl.formatMessage({ id: "ACTION.LIST" })}
        toolbar={
          <PortletHeaderToolbar>
            <Button
              icon="fa fa-plus"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.NEW" })}
              visible={props.showButtons}
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
              icon="fa fa-file-excel"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
              disabled={customDataGridIsBusy}
              onClick={exportReport}
            />
          </PortletHeaderToolbar>
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
          initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: '3', order: 'asc' } }}
          filterRowSize='sm'
          summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}
          // CUSTOM FILTER
          visibleCustomFilter={isActiveFilters}
          renderFormContentCustomFilter={renderFormContentCustomFilter}
          keysToGenerateFilter={keysToGenerateFilter}
          filterData={filterData}
          // PAGINATION
          paginationSize='md'
          // EVENTS
          onLoading={() => setCustomDataGridIsBusy(true)}
          onError={() => setCustomDataGridIsBusy(false)}
          onLoaded={() => setCustomDataGridIsBusy(false)}
        />

        {/*******>POPUP DE COMPANIAS>******** */}
        <AdministracionCompaniaBuscar
          selectData={selectCompania}
          showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
          cancelarEdicion={() => setPopupVisibleCompania(false)}
          uniqueId={"administracionCompaniaBuscar"}

        />
        {/*******>POPUP DE UNIDAD ORGA.>******** */}
        <AdministracionUnidadOrganizativaBuscar
          selectData={selectUnidadOrganizativa}
          showPopup={{ isVisiblePopUp: popupVisibleUnidad, setisVisiblePopUp: setPopupVisibleUnidad }}
          cancelarEdicion={() => setPopupVisibleUnidad(false)}
          selectionMode={"multiple"}
          showCheckBoxesModes={"normal"}
        />

        {/*******>POPUP DE CONTRATO>****************************** */}
        <AdministracionContratoBuscar
          selectData={agregarContrato}
          showPopup={{ isVisiblePopUp: popupVisibleContrato, setisVisiblePopUp: setPopupVisibleContrato }}
          cancelar={() => setPopupVisibleContrato(false)}
        />


      </PortletBody>
    </>
  );
};

VehiculoListPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  uniqueId: PropTypes.string,

}
VehiculoListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  uniqueId: 'acreditacionVehiculoList'
}

export default injectIntl(WithLoandingPanel(VehiculoListPage));
