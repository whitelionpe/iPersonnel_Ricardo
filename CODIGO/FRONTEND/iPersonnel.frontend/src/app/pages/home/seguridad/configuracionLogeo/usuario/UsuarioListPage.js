import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import {
  DataGrid,
  Column,
  Editing,
  FilterRow,
  Selection,
} from "devextreme-react/data-grid";
import { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar,
} from "../../../../../partials/content/Portlet";
import { DoubleLinePersona } from "../../../../../partials/content/Grid/DoubleLineLabel";

import { isNotEmpty, toAbsoluteUrl,listarEstadoSimple } from "../../../../../../_metronic";

import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";


//-CustomerDataGrid-Import>
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { storeFiltrar as loadUrl } from "../../../../../api/seguridad/usuario.api";
import { initialFilter } from "./UsuarioIndexPage";
import { obtenerTodos as obtenerAplicaciones } from "../../../../../api/sistema/moduloAplicacion.api";


const UsuarioListPage = (props) => {

  const { intl, setLoading} = props;
  const { IdCliente, IdDivision } = useSelector((state) => state.perfil.perfilActual);
  const { IdPerfil } = props.selected;

  //-CustomerDataGrid-Variables-ini->
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const  {IdConfiguracionLogeo}  = props.filtroLocal
  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdPerfil, IdConfiguracionLogeo});

  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;
  //-CustomerDataGrid-Variables-end->

  //Variables de CustomerDataGrid
  const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [cmbAplicacion, setCmbAplicacion] = useState([]);
  const [estadoSimple, setEstadoSimple] = useState([]);

  const [selectedRow, setSelectedRow] = useState([]);


  async function cargarCombos() {
    let cmbAplicacion = [];
    await obtenerAplicaciones({ IdCliente, IdDivision, IdModulo: '%' });
    setCmbAplicacion(cmbAplicacion);
    let estadoSimples = listarEstadoSimple();
    setEstadoSimple(estadoSimples);
  }

  async function onValueChangedModulo(value) {
    //setLoading(true);
    await obtenerAplicaciones({ IdCliente, IdDivision, IdModulo: value }).then(aplicaciones => {
      setCmbAplicacion(aplicaciones);
    });//.finally(() => { setLoading(false) });

  }

  const editarRegistro = (evt) => {
    props.editarRegistro(evt.data);
  };

  const eliminarRegistro = (evt) => {
    evt.cancel = true;
    props.eliminarRegistro(evt.data);
  };

  const obtenerCampoActivo = (rowData) => {
    return rowData.Activo === "S";
  };


  function onSelectionChanged(e) {
    setSelectedRow(e.selectedRowsData);
  }


   const seleccionarRegistroDblClick = evt => {
     if (evt.data === undefined) return;
     if (isNotEmpty(evt.data)) {
       props.verRegistroDblClick(evt.data);
     };
   }

  function onCellPrepared(e) {
    if (e.rowType === "data") {
      if (e.data.Activo === "N") {
        e.cellElement.style.color = "red";
      }
    }
  }

  function cellRender(param) {
    if (param && param.data) {
      const { Foto } = param.data;
      return <img src={isNotEmpty(Foto) ? Foto : toAbsoluteUrl("/media/users/default.jpg")} className="form-avatar-grid" />;
    }
  }

  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  };

  //-CustomerDataGrid-UseEffect-ini->
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
    if (props.filtroLocal) {
      const  {IdConfiguracionLogeo}  = props.filtroLocal
      props.dataSource.loadDataWithFilter({ data: { IdConfiguracionLogeo } });
    }
  }, [props.filtroLocal]);
 
  const keysToGenerateFilter = ['IdCliente', 'IdPerfil', 'IdUsuario', 'NombreCompleto', 'Documento', 'ConfiguracionLogeo', 'Activo', 'IdModulo', 'IdAplicacion','IdConfiguracionLogeo'];

  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem>
        <GroupItem itemType="group" colCount={3} colSpan={3}>

          <Item
            dataField="IdModulo"
            label={{ text: intl.formatMessage({ id: "SECURITY.PROFILE.MENU.MODULE" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: props.moduloData,
              valueExpr: "IdModulo",
              displayExpr: "Modulo",
              searchEnabled: true,
              onValueChanged: (e => { onValueChangedModulo(e.value); getInstance().filter() }),
              //onValueChanged: () => getInstance().filter(),
            }}
          />

          <Item
            dataField="IdAplicacion"
            label={{ text: intl.formatMessage({ id: "SECURITY.PROFILE.MENU.APLICATION" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: cmbAplicacion,
              valueExpr: "IdAplicacion",
              displayExpr: "Aplicacion",
              searchEnabled: true,
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
              onValueChanged: () => getInstance().filter(),
            }}
          />

        </GroupItem>
      </GroupItem>
    );

  }

  const renderDataGrid = ({ gridRef, dataSource }) => {
    return (
      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="RowIndex"
        onEditingStart={editarRegistro}
        onRowRemoving={eliminarRegistro}
        // onFocusedRowChanged={seleccionarRegistro}
        focusedRowKey={props.focusedRowKey}
        // onRowDblClick={seleccionarRegistroDblClick}
        onCellPrepared={onCellPrepared}
        onSelectionChanged={(e => onSelectionChanged(e))}

        repaintChangesOnly={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
      >
        <Editing
          mode="row"
          useIcons={props.showButtons}
          allowUpdating={false}
          allowDeleting={false}
          texts={textEditing}

        />
        <FilterRow visible={true} showOperationChooser={false} />
        {/* <Selection mode={selectionMode} /> */}

        <Column visible={false}
          dataType="boolean"
          caption={intl.formatMessage({ id: "SECURITY.USER.LOCKED" })}
          alignment={"center"}
          calculateCellValue={obtenerCampoActivo}
          width={"5%"} />

        <Column dataField="Foto"
          caption={intl.formatMessage({ id: "SECURITY.USER.PHOTO" })}
          width={"8%"}
          alignment={"center"}
          cellRender={cellRender}
          allowSearch={false}
          allowFiltering={false}
        />
        <Column
          dataField="IdUsuario"
          caption={intl.formatMessage({ id: "SECURITY.USER.IDENTIFIER" })}
          width={"10%"}
          allowSorting={true}
          allowSearch={true}
          allowFiltering={true}
        />
        <Column
          dataField="NombreCompleto"
          caption={intl.formatMessage({ id: "SECURITY.USER.FULLNAME" })}
          width={"25%"}
          cellRender={DoubleLinePersona}
          allowSorting={true}
          allowSearch={true}
          allowFiltering={true}
        />
        <Column
          dataField="TipoDocumento"
          caption={intl.formatMessage({
            id: "COMMON.TYPE",
          })}
          width={"10%"}
          alignment={"center"}
          allowSearch={false}
          allowFiltering={false}
        />
        <Column
          dataField="Documento"
          caption={intl.formatMessage({ id: "SECURITY.USER.DOCUMENTNUMBER" })}
          allowSorting={true}
          allowFiltering={true}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"10%"}
        />
        <Column
          dataField="Correo"
          caption={intl.formatMessage({
            id: "SECURITY.USER.MAIL",
          })}
          width={"20%"}
          allowSorting={true}
          allowSearch={true}
          allowFiltering={true}
        />
        <Column
          dataField="ConfiguracionLogeo"
          caption={intl.formatMessage({ id: "SECURITY.USER.CONFIGURATION", })}
          width={"15%"}
          allowSorting={true}
          allowSearch={true}
          allowFiltering={true}
          alignment={"center"}
        />
        <Column
          dataType="boolean"
          caption={intl.formatMessage({ id: "COMMON.ACTIVE" })}
          calculateCellValue={obtenerCampoActivo}
          width={"10%"}
          allowSorting={false}
          allowFiltering={false}
        />

      </DataGrid>
    );
  }
  //-CustomerDataGrid-DataGrid- end

  return (
    <>

      {props.showHeaderInformation && (
        <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
          toolbar={
            <PortletHeader
              title=""
              toolbar={
                <PortletHeaderToolbar>
                  <Button
                    icon="plus"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.NEW" })}
                    onClick={props.nuevoRegistro}
                    visible ={true}
                  />
                   &nbsp;
                  <Button
                    icon="filter"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                    onClick={() => setIsActiveFilters(!isActiveFilters)}
                    visible={false}
                  />

                  &nbsp;
                  <Button icon="refresh" //fa fa-broom
                    id="btnRefresh"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                    onClick={resetLoadOptions} 
                    disabled={customDataGridIsBusy}
                    visible={true}
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
      {!props.showHeaderInformation && (
          <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
            toolbar={ 
                <PortletHeader
                  title=""
                  toolbar={
                    <PortletHeaderToolbar>
                      <Button
                        icon="plus"
                        type="default"
                        hint={intl.formatMessage({ id: "ACTION.NEW" })}
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

                    </PortletHeaderToolbar>
                  }
                />
            } 
            /> 
      )}

      <PortletBody>

        <CustomDataGrid
          showLog={false}
          uniqueId={props.uniqueId} //'posicionesList'
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
          initialLoadOptions={{ currentPage: 1, pageSize: 10, sort: { column: 'NombreCompleto', order: 'asc' } }}
          filterRowSize='sm'
          summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}
          // CUSTOM FILTER
          //cssClassAppBar={classesEncabezado.secundario}
          //cssClassToolbar={classesEncabezado.toolbar}
          //renderFormTitleCustomFilter={renderFormTitleCustomFilter}
          //titleCustomFilter='xxxx'
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

      </PortletBody>
    </>
  );
};

UsuarioListPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  uniqueId: PropTypes.string,

};
UsuarioListPage.defaultProps = {
  showHeaderInformation: false,
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  uniqueId: "UsuarioListPage"

};

export default injectIntl(UsuarioListPage);
