import React, { useEffect, useState, Fragment } from "react";
import { injectIntl } from "react-intl";

import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar,
} from "../../../../partials/content/Portlet";
import { Button } from "devextreme-react";
import {
  DataGrid,
  Column,
  Editing,
  FilterRow,
  HeaderFilter,
  FilterPanel
} from "devextreme-react/data-grid";
import { isNotEmpty, listarEstadoSimple, listarEstado } from "../../../../../_metronic";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";

import { GroupItem, Item } from "devextreme-react/form";
import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { storeFiltrar as loadUrl, serviceVehiculo } from "../../../../api/administracion/vehiculo.api";
import { initialFilter } from "./VehiculoIndexPage";

import WithLoandingPanel from "../../../../partials/content/withLoandingPanel";
import AdministracionUnidadOrganizativaBuscar from "../../../../partials/components/AdministracionUnidadOrganizativaBuscar";
import AdministracionCompaniaBuscar from "../../../../partials/components/AdministracionCompaniaBuscar";
import AdministracionContratoBuscar from "../../../../partials/components/AdministracionContratoBuscar";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";


const VehiculoListPage = (props) => {
  const { intl, setLoading } = props;
  const { IdCliente } = useSelector((state) => state.perfil.perfilActual);
  const { TransportePasajeros } = props.filtroLocal;

  //Variables customerDataGrid
  const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, TransportePasajeros: isNotEmpty(TransportePasajeros) ? TransportePasajeros : "" });
  // PAGINATION
  // ------------------------------
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;

  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [popupVisibleContrato, setPopupVisibleContrato] = useState(false);
  let dataGridRef = React.useRef();

  async function cargarCombos() {

    let estadoSimples = listarEstadoSimple();

    setEstadoSimple(estadoSimples);

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

  /*const seleccionarRegistroDblClick = evt => {
    if (evt.data === undefined) return;
    if (isNotEmpty(evt.data)) {
        props.verRegistroDblClick(evt.data);
    };
}*/

  const selectCompania = dataPopup => {
    //console.log("datapopup: ", dataPopup);
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
    //console.log("datapopup: ", dataPopup);
    const { IdContrato } = dataPopup[0];
    props.dataSource.loadDataWithFilter({ data: { IdContrato } })
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
      IdUnidadOrganizativa, UnidadesOrganizativas, IdContrato, Activo } = filterData;


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
      //var Order = Placa();

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
        TituloHoja: intl.formatMessage({ id: "ADMINISTRATION.EXPORT_VEHICLES" }),
        NombreHoja: intl.formatMessage({ id: "ADMINISTRATION.EXPORT_VEHICLES" }),
        ArrayColumnHeader,
        ArrayColumnId,
        OrderField: selector
      };
      setLoading(true);
      await serviceVehiculo.exportarExcel(params).then(response => {
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

  useEffect(() => {
    if (TransportePasajeros) {
      setTimeout(() => {
        props.dataSource.loadDataWithFilter({ data: { TransportePasajeros } });
      }, 500)
    }
  }, [TransportePasajeros]);

  function onCellPrepared(e) {
    if (e.rowType === "data") {
      if (e.data.Activo === "N") {
        e.cellElement.style.color = "red";
      }
    }
  }

  //Filter
  const keysToGenerateFilter = ['IdCliente', 'IdVehiculo', 'Placa', 'TipoVehiculo', 'Modelo', 'Marca', 'Color', 'Serie',
    'IdCompania', 'IdUnidadOrganizativa', 'UnidadesOrganizativas', 'IdContrato', 'Activo', 'TransportePasajeros'];
  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem>
        <GroupItem itemType="group" colCount={2} colSpan={2}>
          <Item dataField="IdCompania" visible={false} />
          <Item dataField="IdUnidadOrganizativa" visible={false} />

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
            dataField="IdContrato"
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
            dataField="TransportePasajeros"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.PASSENGER.TRANSPORTATION" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: listarEstado(),
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              showClearButton: true,
              onValueChanged: () => getInstance().filter(),
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
              showClearButton: true,
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
        //onRowDblClick={seleccionarRegistroDblClick}
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
        />

        <Column
          dataField="NumAsientos"
          caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.NUMBEROFSEATS", })}
          allowSorting={true}
          allowHeaderFiltering={false}
          alignment={"center"}
          visible={props.isModuloEmbarque}
        />

        <Column
          dataField="Configurado"
          caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.CONFIGURED", })}
          allowSorting={true}
          allowHeaderFiltering={false}
          alignment={"center"}
          visible={props.isModuloEmbarque}
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
          dataField="Modelo"
          caption={intl.formatMessage({
            id: "ADMINISTRATION.VEHICLE.MODEL",
          })}
          allowSorting={true}
          allowHeaderFiltering={false}
          visible={false}
        />

        <Column
          dataField="Color"
          caption={intl.formatMessage({
            id: "ADMINISTRATION.VEHICLE.COLOR",
          })}
          allowSorting={true}
          allowHeaderFiltering={false}
          visible={false}
        />

        <Column
          dataField="Serie"
          caption={intl.formatMessage({
            id: "ADMINISTRATION.VEHICLE.SERIE",
          })}
          allowSorting={true}
          allowHeaderFiltering={false}
          visible={false}
        />

        <Column dataField="CompaniaContratista"
          caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.COMPANY" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          width={"12%"}
        />
        <Column dataField="IdContrato"
          caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          width={"10%"}
        />
        <Column
          dataField="FechaInicio"
          caption={intl.formatMessage({ id: "COMMON.STARTDATE.SHORT" })}
          dataType="date"
          format="dd/MM/yyyy"
          alignment={"center"}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width="7%"
        />
        <Column dataField="FechaFin"
          dataType="datetime"
          format="dd/MM/yyyy"
          caption={intl.formatMessage({ id: "COMMON.ENDDATE.SHORT" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          width={"7%"}
          alignment={"center"}
        />

        <Column
          dataField="Activo"
          caption={intl.formatMessage({
            id: "COMMON.STATE",
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
          //cssClassAppBar={classesEncabezado.secundario}
          //cssClassToolbar={classesEncabezado.toolbar}
          //renderFormTitleCustomFilter={renderFormTitleCustomFilter}
          //titleCustomFilter='Datos a consultar'
          visibleCustomFilter={isActiveFilters}
          renderFormContentCustomFilter={renderFormContentCustomFilter}
          //transformData={transformData}
          //reverseTransformData={reverseTransformData}
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
        {popupVisibleCompania && (
          <AdministracionCompaniaBuscar
            selectData={selectCompania}
            showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
            cancelarEdicion={() => setPopupVisibleCompania(false)}
            // selectionMode="multiple"
            uniqueId={"administracionCompaniaBuscar"}
          />
        )}

        {/*******>POPUP DE UNIDAD ORGA.>******** */}
        {popupVisibleUnidad && (
          <AdministracionUnidadOrganizativaBuscar
            selectData={selectUnidadOrganizativa}
            showPopup={{ isVisiblePopUp: popupVisibleUnidad, setisVisiblePopUp: setPopupVisibleUnidad }}
            cancelarEdicion={() => setPopupVisibleUnidad(false)}
            selectionMode={"multiple"}
            showCheckBoxesModes={"normal"}
          />
        )}


        {/*******>POPUP DE CONTRATO>****************************** */}
        {popupVisibleContrato && (
          <AdministracionContratoBuscar
            selectData={agregarContrato}
            showPopup={{ isVisiblePopUp: popupVisibleContrato, setisVisiblePopUp: setPopupVisibleContrato }}
            cancelar={() => setPopupVisibleContrato(false)}
          />
        )}



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
  filtroLocal: PropTypes.object,
  isModuloEmbarque: PropTypes.bool,


}
VehiculoListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  uniqueId: 'vehiculoList',
  filtroLocal: { TransportePasajeros: "" },
  isModuloEmbarque: false

}


export default injectIntl(WithLoandingPanel(VehiculoListPage));
