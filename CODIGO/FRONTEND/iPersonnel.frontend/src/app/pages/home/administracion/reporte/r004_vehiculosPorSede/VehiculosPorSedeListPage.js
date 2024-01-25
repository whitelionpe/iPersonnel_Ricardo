import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { Button } from "devextreme-react";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { DataGrid, Column, FilterRow, HeaderFilter, FilterPanel } from "devextreme-react/data-grid";

import { isNotEmpty, listarEstadoSimple } from "../../../../../../_metronic";
import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";

import { filtrarR004_VehiculosPorSede, serviceReporte } from "../../../../../api/administracion/reporteVehiculo.api";
import { initialFilter } from "./VehiculosPorSedeIndexPage";

import AdministracionUnidadOrganizativaBuscar from "../../../../../partials/components/AdministracionUnidadOrganizativaBuscar";
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";
import AdministracionDivisionBuscar from "../../../../../partials/components/AdministracionDivisionBuscar";

const VehiculosPorSedeListPage = props => {
  const { intl, focusedRowKey, setLoading } = props;
  const { IdCliente, IdDivision, Division } = useSelector(state => state.perfil.perfilActual);

  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const [isVisiblePopUpDivision, setisVisiblePopUpDivision] = useState(false);

  //Variables de CustomerDataGrid
  const [isActiveFilters, setIsActiveFilters] = useState(true);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdDivision, Division, });
  // PAGINATION
  // ------------------------------
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;
  let dataGridRef = React.useRef();

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-:::::::::::::::::::::::::::::::::

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

  /*** POPUP DIVISIONES ***/
  const selectDataDivisiones = (data) => {
    const { Division, IdDivision } = data;
    props.dataSource.loadDataWithFilter({ data: { IdDivision, Division } })
    setisVisiblePopUpDivision(false);
  }

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  };


  const exportReport = async () => {
    let result = JSON.parse(localStorage.getItem('vcg:' + props.uniqueId + ':loadOptions'));
    if (!isNotEmpty(result)) return;
    let filterExport = {
      IdCliente,
      IdDivision: isNotEmpty(IdDivision) ? IdDivision : ""
    };
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
    const { IdCliente, IdDivision, IdVehiculo, IdCompania, UnidadOrganizativa,
      TipoVehiculo, Marca, Modelo, Placa, Color, UnidadesOrganizativas, Activo } = filterExport;

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
        IdDivision: IdDivision,
        IdCompania: isNotEmpty(IdCompania) ? IdCompania : "",
        IdVehiculo: isNotEmpty(IdVehiculo) ? IdVehiculo : "",
        UnidadOrganizativa: isNotEmpty(UnidadOrganizativa) ? UnidadOrganizativa : "",
        TipoVehiculo: isNotEmpty(TipoVehiculo) ? TipoVehiculo : "",
        Marca: isNotEmpty(Marca) ? Marca : "",
        Modelo: isNotEmpty(Modelo) ? Modelo : "",
        Placa: isNotEmpty(Placa) ? Placa : "",
        Color: isNotEmpty(Color) ? Color : "",
        UnidadesOrganizativas: isNotEmpty(UnidadesOrganizativas) ? UnidadesOrganizativas : "",
        Activo: isNotEmpty(Activo) ? Activo : "",
        TituloHoja: intl.formatMessage({ id: "CONFIG.MENU.ADMINISTRACION.VEHICULOS_POR_SEDE" }),
        NombreHoja: intl.formatMessage({ id: "CONFIG.MENU.ADMINISTRACION.VEHICULOS_POR_SEDE" }),
        ArrayColumnHeader,
        ArrayColumnId,
        OrderField: selector
      };
      setLoading(true);
      await serviceReporte.exportarR004_VehiculosPorSede(params).then(response => {
        //result = response;      
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
    if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage])
  useEffect(() => {
    if (props.refreshData) {
      props.refresh();
      props.setRefreshData(false);
    }
  }, [props.refreshData]);

  useEffect(() => {
    if (IdDivision) {
      setTimeout(() => {
        props.dataSource.loadDataWithFilter({ data: { IdDivision } });
      }, 500)
    }
  }, [IdDivision]);

  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter = ['IdCliente', 'IdDivision', 'IdVehiculo', 'IdCompania',
    'UnidadOrganizativa', 'TipoVehiculo', 'Marca', 'Modelo', 'Placa', 'Color', 'UnidadesOrganizativas', 'Activo'];

  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      isActiveFilters && (
        <GroupItem colSpan={2} colCount={2}>
          <GroupItem itemType="group" >
            <Item
              dataField="Compania"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" }) }}
              colSpan={2}
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
                }]
              }}
            />
            <Item
              dataField="Division"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.DIVISION.NAME" }) }}
              editorOptions={{
                readOnly: true,
                hoverStateEnabled: false,
                inputAttr: { style: "text-transform: uppercase" },
                showClearButton: true,
                buttons: [
                  {
                    name: "search",
                    location: "after",
                    useSubmitBehavior: true,
                    options: {
                      stylingMode: "text",
                      icon: "search",
                      disabled: false,
                      onClick: (evt) => {
                        setisVisiblePopUpDivision(true);
                      },
                    },
                  },
                ],
              }}
            />

          </GroupItem>
          <GroupItem itemType="group" colSpan={2} colCount={2} >

            <Item
              dataField="UnidadesOrganizativasDescripcion"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.ORGANIZATIONALUNIT" }) }}
              colSpan={2}
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
                }]
              }}
            />

            <Item
              dataField="Activo"
              label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: listarEstadoSimple(),
                valueExpr: "Valor",
                displayExpr: "Descripcion",
                showClearButton: true,
                onValueChanged: () => getInstance().filter(),
              }}
            />

          </GroupItem>
        </GroupItem>
      )
    )
  };


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
    dataGridRef = gridRef;
    return (
      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        keyExpr="RowIndex"
        showBorders={true}
        remoteOperations={true}
        onCellPrepared={onCellPrepared}
        onFocusedRowChanged={seleccionarRegistro}
        focusedRowEnabled={true}
        focusedRowKey={focusedRowKey}
        repaintChangesOnly={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
        scrolling={{ showScrollbar: 'always' }}
        className="tablaScrollHorizontal"
      >
        <FilterRow visible={true} showOperationChooser={false} />
        <HeaderFilter visible={false} />
        <FilterPanel visible={false} />
        <Column
          dataField="RowIndex"
          caption="#"
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          width={"35px"}
          alignment={"center"} />

        <Column dataField="IdVehiculo"
          caption={intl.formatMessage({ id: "COMMON.CODE" })}
          allowHeaderFiltering={false}
          allowSorting={true}
          width={"70px"}
          alignment={"center"} />
        <Column
          dataField="Placa"
          caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.PLATE" })}
          allowHeaderFiltering={false}
          allowSorting={true}
          alignment={"center"}
          width={"100px"}
        />
        <Column
          dataField="TipoVehiculo"
          caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.VEHICLETYPE" })}
          allowHeaderFiltering={false}
          allowSorting={true}
          width={"150px"}

        />
        <Column dataField="Modelo"
          caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.MODEL" })}
          allowHeaderFiltering={false}
          allowSorting={true}
          width={"100px"}

        />
        <Column
          dataField="Marca"
          caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.BRAND" })}
          allowSorting={true}
          allowHeaderFiltering={false}
          width={"100px"}
        >
        </Column>

        <Column
          dataField="Color"
          caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.COLOR" })}
          allowHeaderFiltering={false}
          allowSorting={true}
          width={"100px"}

        />

        <Column
          dataField="CompaniaContratista"
          caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" })}
          allowSorting={false}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width={"200px"}
        />

        <Column
          dataField="CompaniaSubContratista"
          caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBCONTRACTOR" })}
          allowSorting={false}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width={"150px"}
        />
        <Column
          dataField="IdContrato"
          caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          width={"150px"}
        />

        <Column
          dataField="FechaInicio"
          caption={intl.formatMessage({ id: "COMMON.STARTDATE.SHORT" })}
          dataType="date"
          format="dd/MM/yyyy"
          alignment={"center"}
          allowSorting={false}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width={"100px"}
        />
        <Column
          dataField="FechaFin"
          caption={intl.formatMessage({ id: "COMMON.ENDDATE.SHORT" })}
          dataType="date"
          format="dd/MM/yyyy"
          alignment={"center"}
          allowSorting={false}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width={"100px"}
        />

        <Column
          dataField="Division"
          caption={intl.formatMessage({ id: "SYSTEM.DIVISION" })}
          allowSorting={false}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width={"100px"}
        />

        <Column
          dataField="UnidadOrganizativa"
          caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.UNIDADORGANIZATIVA" })}
          allowSorting={false}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width={"150px"}
        />

        <Column
          dataField="CentroCosto"
          caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CENTROCOSTO" })}
          allowSorting={false}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width={"150px"}
        />
        <Column
          dataField="Anno"
          caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.YEAR" })}
          allowSorting={false}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width={"70px"}
          alignment={"center"}
        />
        <Column
          dataField="Serie"
          caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.SERIE" })}
          allowSorting={false}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width={"150px"}
        />

        <Column
          dataField="Combustible"
          caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.FUEL" })}
          allowSorting={false}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width={"100px"}
        />

        <Column
          dataField="Potencia"
          caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.POWER" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          width={"100px"}
        />
        <Column
          dataField="NumAsientos"
          caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.NUMBEROFSEATS" })}
          allowSorting={false}
          allowHeaderFiltering={false}
          allowFiltering={false}
          alignment={"center"}
          width={"100px"}
        />
        <Column
          dataField="TransportePasajeros"
          caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.PASSENGER.TRANSPORTATION" })}
          allowSorting={false}
          allowHeaderFiltering={false}
          allowFiltering={false}
          alignment={"center"}
          width={"150px"}
        />


        <Column dataField="Estado"
          caption={intl.formatMessage({ id: "COMMON.ACTIVE" })}
          allowSorting={false}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width={"70px"}
          alignment={"center"}
        />


      </DataGrid>
    );
  }

  return (
    <>
      <a id="iddescarga" className="" ></a>

      <PortletHeader
        title=""
        toolbar={
          <PortletHeaderToolbar>
            <Button
              icon={isActiveFilters ? "chevronup" : "chevrondown"}
              type="default"
              hint={isActiveFilters ? intl.formatMessage({ id: "COMMON.HIDE" }) : intl.formatMessage({ id: "COMMON.SHOW" })}
              onClick={() => setIsActiveFilters(!isActiveFilters)}
              disabled={false}
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
          loadUrl={filtrarR004_VehiculosPorSede}
          forceLoad={forceLoadTypes.Unforced}
          sendToServerOnlyIfThereAreChanges={true}
          ifThereAreNoChangesLoadFromStorage={ifThereAreNoChangesLoadFromStorage}
          caseSensitiveWhenCheckingForChanges={true}
          uppercaseFilterRow={true}
          initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'Placa', order: 'asc' } }}
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
        {popupVisibleCompania && (
          <AdministracionCompaniaBuscar
            selectData={selectCompania}
            showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
            cancelarEdicion={() => setPopupVisibleCompania(false)}
            uniqueId={"administracionCompaniaBuscarR003"}
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

        {/*******>POPUP DIVISIONES>******** */}
        <AdministracionDivisionBuscar
          selectData={selectDataDivisiones}
          showPopup={{ isVisiblePopUp: isVisiblePopUpDivision, setisVisiblePopUp: setisVisiblePopUpDivision }}
          cancelarEdicion={() => setisVisiblePopUpDivision(false)}
        />

      </PortletBody>
    </>
  );
};
VehiculosPorSedeListPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string,
  selected: PropTypes.object,

}
VehiculosPorSedeListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  showHeaderInformation: false,
  uniqueId: 'r004VehiculosPorSedesList',
  selected: { IdDivision: "" }
}

export default injectIntl(WithLoandingPanel(VehiculosPorSedeListPage));
