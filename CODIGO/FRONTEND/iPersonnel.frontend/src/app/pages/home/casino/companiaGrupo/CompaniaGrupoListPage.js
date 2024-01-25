import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
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
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { isNotEmpty, listarEstadoSimple, listarEstado, listarConsultaGrupos } from "../../../../../_metronic";
import PropTypes from "prop-types";

//Custom grid: ::::::::::::::::::::::::::::::::
import { Item, GroupItem } from "devextreme-react/form";
import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { storeListarComedores as loadUrl } from "../../../../api/administracion/compania.api";
import { initialFilter } from "./CompaniaGrupoIndex";
import { useSelector } from "react-redux";
import { CardContent } from "@material-ui/core";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import AdministracionCompaniaContratos from "../../../../partials/components/AdministracionCompaniaContratos";

//:::::::::::::::::::::::::::::::::::::::::::::

const CompaniaGrupoListPage = props => {
  const { intl } = props;
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdDivision });

  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estado, setEstado] = useState([]);

  const [consultaGrupos, setConsultaGrupos] = useState([]);

  const [isVisiblePopUpMotivoContrato, setisVisiblePopUpMotivoContrato] = useState(false);
  const [vizualizarTodasSwitch, setVizualizarTodasSwitch] = useState(false);

  const editarRegistro = evt => {
    props.editarRegistro(evt.data);
  };

  const eliminarRegistro = evt => {
    evt.cancel = true;
    props.eliminarRegistro(evt.data);
  };

  const obtenerCampoContratista = rowData => {
    return rowData.Contratista === "S";
  };

  const obtenerCampoActivo = rowData => {
    return rowData.Activo === "S";
  };

  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  }

  const seleccionarRegistroDblClick = evt => {
    if (evt.data === undefined) return;
    if (isNotEmpty(evt.data)) {
      props.verRegistroDblClick(evt.data);
    };
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


  async function cargarCombos() {
    let estadoSimples = listarEstadoSimple()
    let estado = listarEstado()

    let lstConsulta = listarConsultaGrupos()

    setEstadoSimple(estadoSimples)
    setEstado(estado);
    setConsultaGrupos(lstConsulta);

  }

  function isVisible(e) {
    return (e.row.data.TieneContrato === 'S');
  }

  const cleanEvent = () => {
    setVizualizarTodasSwitch(false);
    props.resetLoadOptions();
  }

  //:::::::::::::::::::::::::::::::::::::::::::::::

  useEffect(() => {

    cargarCombos();
    if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage])

  useEffect(() => {
    if (props.refreshData) {
      props.refresh();
      props.setRefreshData(false);
    } else {
      props.dataSource.loadDataWithFilter({ data: { IdDivision } });
    }
  }, [props.refreshData]);


  //Filter:
  const keysToGenerateFilter = ['IdCliente', 'IdDivision', 'IdCompania', 'Compania', 'TipoDocumento', 'Documento', 'Pais', 'Activo', 'Contratista', 'GrupoAsignado', 'GrupoVigente', 'TipoConsulta'];
  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem >
        <GroupItem itemType="group" colCount={7} colSpan={7} >

          <Item render={switchVerTodo}
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.ALL" }) }}
            colSpan={1}
          >
          </Item>

          <Item
            dataField="TipoConsulta"
            label={{ text: intl.formatMessage({ id: "CASINO.COMPANY.GROUP.TOSELECT" }) }}
            editorType="dxSelectBox"
            colSpan={2}
            editorOptions={{
              items: consultaGrupos,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              showClearButton: true,
              onValueChanged: () => getInstance().filter(),
            }}
          />

          <Item
            dataField="Contratista"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.ISCONTRACTOR" }) }}
            editorType="dxSelectBox"
            colSpan={2}
            editorOptions={{
              items: estado,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              showClearButton: true,
              onValueChanged: () => getInstance().filter(),
            }}
          />

          <Item
            dataField="Activo"
            label={{ text: intl.formatMessage({ id: "CASINO.COMPANY.GROUP.STATE" }) }}
            editorType="dxSelectBox"
            colSpan={2}
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

  //DataGrid:
  const renderDataGrid = ({ gridRef, dataSource }) => {
    if(dataSource._storeLoadOptions.filter !== undefined ){
      if(props.totalRowIndex === 0){ 
      props.setTotalRowIndex(dataSource._totalCount);
      }
      if(dataSource._totalCount != props.totalRowIndex){
        if(dataSource._totalCount != -1){
        props.setVarIdCompania("")
        props.setFocusedRowKey();
        props.setTotalRowIndex(dataSource._totalCount);
        }
      }
    }
    return (
      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="RowIndex"
        onEditingStart={editarRegistro}
        onRowRemoving={eliminarRegistro}
        onCellPrepared={onCellPrepared}
        onFocusedRowChanged={seleccionarRegistro}
        onRowDblClick={seleccionarRegistroDblClick}
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

        <Column dataField="IdCompania" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"15%"} allowHeaderFiltering={false} allowSorting={true} />
        <Column dataField="Compania" caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" })} width={"35%"} allowHeaderFiltering={false} allowSorting={true} />
        <Column dataField="TipoDocumento" caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.DOCUMENTTYPE" })} width={"15%"} allowHeaderFiltering={false} allowSorting={true} />
        <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.DOCUMENT" })} width={"15%"} allowHeaderFiltering={false} allowSorting={true} />
        <Column dataField="Pais" caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COUNTRY" })} width={"15%"} allowHeaderFiltering={false} allowSorting={true} visible={false} />
        <Column dataType="boolean" caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.CONTRACTOR" })} calculateCellValue={obtenerCampoContratista} width={"10%"} alignment={"center"} allowHeaderFiltering={false} allowSorting={true} />
        <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} alignment={"center"} allowHeaderFiltering={false} allowSorting={false} />

        <Column type="buttons" width={"3%"}>
          <ColumnButton
            icon="doc"
            hint={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.MAINTENANCE" })}
            onClick={() => setisVisiblePopUpMotivoContrato(true)}
            visible={isVisible}
          />
        </Column>

      </DataGrid>

    );
  }

  const switchVerTodo = () => {
    return (
      <>
        <div className="switch-filtro">
          <ControlSwitch checked={vizualizarTodasSwitch}
            onChange={e => {
              setVizualizarTodasSwitch(e.target.checked);
              if (e.target.checked) { //on
                props.dataSource.loadDataWithFilter({ data: { IdDivision: "" } });
              } else { //off
                props.dataSource.loadDataWithFilter({ data: { IdDivision } });
              }

            }}
          />
        </div>
      </>)
  }
  //:::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <PortletHeader
        title={intl.formatMessage({ id: "ACTION.LIST" })}
        toolbar={
          <PortletHeaderToolbar>
            <PortletHeaderToolbar>
              <Button
                icon="plus"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.NEW" })}
                onClick={props.nuevoRegistro}
                visible={props.showButtons}
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
                onClick={() => cleanEvent()}
              />
            </PortletHeaderToolbar>
          </PortletHeaderToolbar>
        }
      />
      <PortletBody>


        <CustomDataGrid
          showLog={false}
          uniqueId={"casinoCompaniaList"}
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
          initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'FechaCreacion', order: 'desc' } }}
          filterRowSize='sm'
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

      {/*** PopUp -> Buscar Rquisitos ****/}
      {isVisiblePopUpMotivoContrato && (
        <AdministracionCompaniaContratos
          showPopup={{ isVisiblePopUp: isVisiblePopUpMotivoContrato, setisVisiblePopUp: setisVisiblePopUpMotivoContrato }}
          cancelarEdicion={() => setisVisiblePopUpMotivoContrato(false)}
          varIdCompania={props.varIdCompania}
        />
      )}
    </>
  );
};

CompaniaGrupoListPage.propTypes = {
  showButton: PropTypes.bool
};
CompaniaGrupoListPage.defaultProps = {
  showButton: true
};

export default injectIntl(CompaniaGrupoListPage);
