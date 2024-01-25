import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { Button } from "devextreme-react";
import { Item, GroupItem } from "devextreme-react/form";
import { DataGrid, Column, Editing, FilterRow, HeaderFilter, FilterPanel } from "devextreme-react/data-grid";

import { isNotEmpty, listarEstadoSimple, listarEstadoTodos } from "../../../../../_metronic";

import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import WithLoandingPanel from "../../../../partials/content/withLoandingPanel";
import { storeListar as loadUrl } from "../../../../api/transporte/manifiestoReservacionCupoSemanal.api";
import { initialFilter } from "./ManifiestoCupoIndexPage";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import AdministracionCompaniaBuscar from "../../../../partials/components/AdministracionCompaniaBuscar";
import Tooltip from '@material-ui/core/Tooltip';

// import { isNotEmpty ,listarEstadoManifiestoCupos,listarEstadoTodos} from "../../../../../_metronic";

const ManifiestoCupoListPage = props => {
  const { intl, focusedRowKey, setLoading } = props;
  const { IdCliente, IdPerfil } = useSelector(state => state.perfil.perfilActual);
  const IdDivisionPerfil = useSelector(state => state.perfil.perfilActual.IdDivision);

  const { IdDivision } = props.selected;
  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);

  //Variables de CustomerDataGrid
  const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({
    ...initialFilter, IdCliente,
    IdPerfil,
    IdDivisionPerfil,
    IdDivision: isNotEmpty(IdDivision) ? IdDivision : "",

  });
  // PAGINATION
  // ------------------------------
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;


  const editarRegistro = evt => {
    evt.cancel = true;
    props.editarRegistro(evt.data);
  };

  const eliminarRegistro = evt => {
    evt.cancel = true;
    props.eliminarRegistro(evt.data);

  };

  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  }

  const obtenerCampoActivo = rowData => {
    return rowData.Activo === "S";
  };

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  }

  const obtenerCampoUrbanito = rowData => {
    return rowData.EsUrbanito === "S" ? true : false;
  }

  const obtenerCampoDia = (dia, rowData) => {
    switch (dia) {
      case 1: return rowData.Lunes > 0 ? "SI" : "NO";
      case 2: return rowData.Martes > 0 ? "SI" : "NO";
      case 3: return rowData.Miercoles > 0 ? "SI" : "NO";
      case 4: return rowData.Jueves > 0 ? "SI" : "NO";
      case 5: return rowData.Viernes > 0 ? "SI" : "NO";
      case 6: return rowData.Sabado > 0 ? "SI" : "NO";
      case 7: return rowData.Domingo > 0 ? "SI" : "NO";
    }
  }

  const selectCompania = dataPopup => {
    const { IdCompania, Compania } = dataPopup[0];
    if (isNotEmpty(IdCompania)) {
      props.dataRowEditNew.IdCompania = IdCompania;
      props.dataRowEditNew.Compania = Compania;
      setTimeout(function () {
        props.dataSource.loadDataWithFilter({ data: { IdCompania: IdCompania, Compania: Compania } });
      }, 500);
    }

    setPopupVisibleCompania(false);
  }


  function cellRenderColor(param) {
    if (param && param.data) {
      const { Configurado, EstadoCupo } = param.data;

      console.log("cellRenderColor|Configurado:", Configurado);
      console.log("cellRenderColor|EstadoCupo:", EstadoCupo);

      if (Configurado === true && EstadoCupo === 'S') {
        return <Tooltip title={<span style={{ fontSize: "15px" }}> {intl.formatMessage({ id: "TRANSPORTE.COUPONS.SETTING" })} </span>} >
          <i className="fas fa-circle  text-success icon-10x" ></i>
        </Tooltip>
      }
      else if (Configurado === true && EstadoCupo === 'N') {
        return <Tooltip title={<span style={{ fontSize: "15px" }}> {intl.formatMessage({ id: "TRANSPORTE.COUPONS.INACTIVE" })} </span>} >
          <i className="fas fa-circle  text-danger icon-10x" ></i>
        </Tooltip>
      }
      else {
        return <Tooltip title={<span style={{ fontSize: "15px" }}> {intl.formatMessage({ id: "TRANSPORTE.COUPONS.NOSETTING" })} </span>} >
          <i className="fas fa-circle text-warning icon-10x" ></i>
        </Tooltip>
      }
    }
  }

  function btnEliminar(e) {
    return e.row.data.Configurado === true ? true : false;
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


  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter = [
    'IdCompania',
    'NombreCompania',
    'CuposDesde',
    'CuposHasta',
    'Configurado',
    'Lunes',
    'Martes',
    'Miercoles',
    'Jueves',
    'Viernes',
    'Sabado',
    'Domingo',
    'Activo',
    'EsUrbanito',
  ];

  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem>
        <GroupItem itemType="group" colCount={6}>

          <Item
            dataField="Compania"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" }) }}
            visible={false}
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

          <Item dataField="CuposDesde"
            itemType="dxNumberBox"
            label={{ text: intl.formatMessage({ id: "TRANSPORTE.COUPONS.QUOTASFROM" }) }}
            editorOptions={{
              maxLength: 2,
              min: 0,
              showSpinButtons: true,
              onEnterKey: () => getInstance().filter(),
            }}
          />
          <Item dataField="CuposHasta"
            itemType="dxNumberBox"
            label={{ text: intl.formatMessage({ id: "TRANSPORTE.COUPONS.QUOTASUNTIL" }) }}
            editorOptions={{
              maxLength: 2,
              min: 0,
              showSpinButtons: true,
              onEnterKey: () => getInstance().filter(),
            }}
          />


          <Item dataField="Configurado"
            label={{ text: intl.formatMessage({ id: "TRANSPORTE.COUPONS.ISCONFIGURED" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: listarEstadoTodos(),
              showClearButton: false,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              onValueChanged: () => getInstance().filter(),
            }}
          />


          <Item dataField="EsUrbanito"
            label={{ text: intl.formatMessage({ id: "TRANSPORTE.COUPONS.ISURBAN.MSG" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: listarEstadoTodos(),
              showClearButton: false,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              onValueChanged: () => getInstance().filter(),
            }}
          />

          {/* <Item dataField="Activo"
            label={{ text: intl.formatMessage({ id: "COMMON.ACTIVE" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: listarEstadoTodos(),
              showClearButton: false,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              onValueChanged: () => getInstance().filter(),
            }}
          /> */}

        </GroupItem>

      </GroupItem>
    );
  }

  const renderDataGrid = ({ gridRef, dataSource }) => {
    return (
      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        keyExpr="RowIndex"
        showBorders={true}
        remoteOperations={true}
        onEditingStart={editarRegistro}
        onRowRemoving={eliminarRegistro}
        onFocusedRowChanged={seleccionarRegistro}
        onCellPrepared={onCellPrepared}
        focusedRowEnabled={true}
        focusedRowKey={focusedRowKey}
        repaintChangesOnly={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
        
      >
        <Editing mode="row"
          useIcons={props.showButtons}
          allowUpdating={props.showButtons}
          allowDeleting={(e) => btnEliminar(e)}
          texts={textEditing} />
        <FilterRow visible={true} showOperationChooser={false} />
        <HeaderFilter visible={false} />
        <FilterPanel visible={false} />
        <Column
          dataField="RowIndex"
          caption="#"
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          width={"5%"}
          alignment={"center"} />

        <Column dataField="" width={"2%"} alignment="left" cellRender={cellRenderColor} />
        <Column dataField="IdCompania" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} allowSorting={true} allowFiltering={true} />
        <Column dataField="NombreCompania" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" })} width={"20%"} allowSorting={true} allowFiltering={true} />
        <Column dataField="Cupos" caption={intl.formatMessage({ id: "TRANSPORTE.COUPONS" })} width={"4%"} alignment={"center"} allowSorting={true} allowFiltering={false} />
        <Column dataField="Lunes" caption={intl.formatMessage({ id: "CASINO.GROUP.SERVICE.MONDAY" })} calculateCellValue={rowData => obtenerCampoDia(1, rowData)} alignment={"center"} allowSorting={false} allowFiltering={false} />
        <Column dataField="Martes" caption={intl.formatMessage({ id: "CASINO.GROUP.SERVICE.TUESDAY" })} calculateCellValue={rowData => obtenerCampoDia(2, rowData)} alignment={"center"} allowSorting={false} allowFiltering={false} />
        <Column dataField="Miercoles" caption={intl.formatMessage({ id: "CASINO.GROUP.SERVICE.WEDNESDAY" })} calculateCellValue={rowData => obtenerCampoDia(3, rowData)} alignment={"center"} allowSorting={false} allowFiltering={false} />
        <Column dataField="Jueves" caption={intl.formatMessage({ id: "CASINO.GROUP.SERVICE.THURSDAY" })} calculateCellValue={rowData => obtenerCampoDia(4, rowData)} alignment={"center"} allowSorting={false} allowFiltering={false} />
        <Column dataField="Viernes" caption={intl.formatMessage({ id: "CASINO.GROUP.SERVICE.FRIDAY" })} calculateCellValue={rowData => obtenerCampoDia(5, rowData)} alignment={"center"} allowSorting={false} allowFiltering={false} />
        <Column dataField="Sabado" caption={intl.formatMessage({ id: "CASINO.GROUP.SERVICE.SATURDAY" })} calculateCellValue={rowData => obtenerCampoDia(6, rowData)} alignment={"center"} allowSorting={false} allowFiltering={false} />
        <Column dataField="Domingo" caption={intl.formatMessage({ id: "CASINO.GROUP.SERVICE.SUNDAY" })} calculateCellValue={rowData => obtenerCampoDia(7, rowData)} alignment={"center"} allowSorting={false} allowFiltering={false} />
        <Column dataField="EsUrbanito" dataType="boolean" caption={intl.formatMessage({ id: "TRANSPORTE.COUPONS.ISURBAN.MSG" })} calculateCellValue={obtenerCampoUrbanito} width={"7%"} alignment={"center"} allowSorting={false} allowFiltering={false} />
        <Column dataField="Activo" dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} alignment={"center"} allowSorting={true} allowFiltering={false} />

      </DataGrid>
    );
  }

  return (
    <>

      <HeaderInformation
        visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title=""
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
                  />

                </PortletHeaderToolbar>
              </PortletHeaderToolbar>
            }
          />
        }
      />

      <PortletBody>
        <CustomDataGrid
        showLog={false} 
          uniqueId={props.uniqueId} //'personaList'
          dataSource={props.dataSource}
          rowNumberName='RowIndex'
          loadWhenStartingComponent={props.isFirstDataLoad && !props.refreshData}
          renderDataGrid={renderDataGrid}
          loadUrl={loadUrl}
          forceLoad={forceLoadTypes.Unforced}
          sendToServerOnlyIfThereAreChanges={false}
          ifThereAreNoChangesLoadFromStorage={ifThereAreNoChangesLoadFromStorage}
          caseSensitiveWhenCheckingForChanges={true}
          uppercaseFilterRow={true}
          initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'NombreCompania', order: 'asc' } }}
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
      </PortletBody>

      {/*** PopUp -> Buscar Grupo ****/}
      {popupVisibleCompania && (
        <AdministracionCompaniaBuscar
          selectData={selectCompania}
          showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
          cancelarEdicion={() => setPopupVisibleCompania(false)}
          uniqueId={"AdministracionCompaniaBuscar"}
          isContratista={"S"}
        />
      )}
    </>
  );
};
ManifiestoCupoListPage.propTypes = {
  showButtons: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string,
  selected: PropTypes.object,

}
ManifiestoCupoListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  showHeaderInformation: false,
  uniqueId: 'ManifiestoCupoListPage',
  selected: { IdDivision: "" }
}

export default injectIntl(WithLoandingPanel(ManifiestoCupoListPage));
