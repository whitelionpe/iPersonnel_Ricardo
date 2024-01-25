import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import {
  DataGrid,
  Column,
  Editing,
  FilterRow,
  Button as ColumnButton
} from "devextreme-react/data-grid";
import { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar,
} from "../../../../../partials/content/Portlet";
import { DoubleLinePersona } from "../../../../../partials/content/Grid/DoubleLineLabel";

import { isNotEmpty, toAbsoluteUrl, listarEstadoSimple, listarContratista } from "../../../../../../_metronic";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";

//-CustomerDataGrid-Import>
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { storeFiltrar as loadUrl } from "../../../../../api/acreditacion/autorizadorUsuario.api";
import { initialFilter } from "./AutorizadorUsuarioIndexPage";


const AutorizadorUsuarioListPage = (props) => {

  const { intl, setLoading } = props;
  const { IdCliente } = useSelector((state) => state.perfil.perfilActual);
  const { IdAutorizador } = props.selected;

  //-CustomerDataGrid-Variables-ini->
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdAutorizador });

  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;
  //-CustomerDataGrid-Variables-end->

  //Variables de CustomerDataGrid
  const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [estadoSimple, setEstadoSimple] = useState([]);

  async function cargarCombos() {
    let estadoSimples = listarEstadoSimple();
    setEstadoSimple(estadoSimples);
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

  const obtenerCampoActivoContratista = (rowData) => {
    return rowData.Contratista === "S";
  };

  const seleccionarRegistro = (evt) => {

    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);

  };

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


  const MostrarPerfil = evt => {
    props.viewPoppupDetalle(evt.row.data);
  };


  function cellRenderFile(data) {
    console.log("data",data);
    return isNotEmpty(data.value) && (
    
      <span
                    className="dx-icon-alignleft"
                    title={intl.formatMessage({ id: "ACCREDITATION.PROFILE.VIEW" })}
                    aria-label={intl.formatMessage({ id: "ACCREDITATION.PROFILE.VIEW" })}
                    onClick={(e) => MostrarPerfil(data)}
                />
     /*  <span
        title={intl.formatMessage({ id: "ACCREDITATION.PROFILE.VIEW" })}
      >
        <i class="flaticon2-list-1 icon-sm text-warning" ></i>
      </span> */

    )
  }

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
    if (isNotEmpty(IdAutorizador)) {

      props.dataSource.loadDataWithFilter({ data: { IdAutorizador, IdCliente } });
      document.getElementById("btnRefresh").click();
      props.setRefreshData(true);
    }
  }, [IdAutorizador]);

  //-CustomerDataGrid-Filter
  const keysToGenerateFilter = [
    'IdCliente',
    'IdAutorizador',
    'IdUsuario',
    'NombreCompleto',
    'Documento',
    'ConfiguracionLogeo',
    'Contratista',
    'Activo'];

  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem>
        <GroupItem itemType="group" colCount={3} colSpan={3}>

          <Item
            dataField="Contratista"
            label={{ text: intl.formatMessage({ id: "SECURITY.USER.CONTRATOR" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: listarContratista,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
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
        onFocusedRowChanged={seleccionarRegistro}
        focusedRowKey={props.focusedRowKey}
        onCellPrepared={onCellPrepared}
        repaintChangesOnly={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
      >
        <Editing
          mode="row"
          useIcons={props.showButtons}
          allowUpdating={props.showButtons}
          allowDeleting={props.showButtons}
          texts={textEditing}

        />
        <FilterRow visible={true} showOperationChooser={false} />

        <Column dataType="boolean" caption={intl.formatMessage({ id: "SECURITY.USER.LOCKED" })} alignment={"center"} calculateCellValue={obtenerCampoActivo} width={"7%"} visible={false} />
        <Column dataField="Foto" caption={intl.formatMessage({ id: "SECURITY.USER.PHOTO" })} width={"8%"} alignment={"center"} cellRender={cellRender} allowSearch={false} allowFiltering={false} visible={false}/>
        <Column dataField="IdUsuario" caption={intl.formatMessage({ id: "SECURITY.USER.IDENTIFIER" })} width={"17%"} allowSorting={true} allowSearch={true} allowFiltering={true} />
        <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "SECURITY.USER.FULLNAME" })} width={"25%"} cellRender={DoubleLinePersona} allowSorting={true} allowSearch={true} allowFiltering={true} />
        <Column dataField="TipoDocumento" caption={intl.formatMessage({ id: "COMMON.TYPE" })} width={"10%"} alignment={"center"} allowSearch={false} allowFiltering={false} />
        <Column dataField="Documento" caption={intl.formatMessage({ id: "SECURITY.USER.DOCUMENTNUMBER" })} allowSorting={true} allowFiltering={true} allowHeaderFiltering={false} alignment={"left"} width={"10%"} />
        <Column dataField="Correo" caption={intl.formatMessage({ id: "SECURITY.USER.MAIL" })} width={"20%"} allowSorting={true} allowSearch={true} allowFiltering={true} />
        <Column dataField="ConfiguracionLogeo" caption={intl.formatMessage({ id: "SECURITY.USER.CONFIGURATION" })} width={"15%"} allowSorting={true} allowSearch={true} allowFiltering={true} alignment={"center"} visible={false}/>
        <Column dataType="boolean" caption={intl.formatMessage({ id: "SECURITY.USER.CONTRATOR" })} calculateCellValue={obtenerCampoActivoContratista} width={"5%"} allowSorting={true} allowSearch={false} allowFiltering={false} visible={false}/>
        <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"8%"} allowSorting={false} allowFiltering={false} />
        <Column dataField="IdPerfilAcreditacion" caption={intl.formatMessage({ id: "ACCREDITATION.PROFILE.VIEW" })} cellRender={cellRenderFile} width={"10%"} alignment="center" />
        
        <Column type="buttons" width={"10%"} >
         {/*  <ColumnButton text={intl.formatMessage({ id: "ACCREDITATION.PROFILE.VIEW" })}
            icon="alignleft"
            hint={intl.formatMessage({ id: "ACCREDITATION.PROFILE.VIEW" })}
            onClick={MostrarPerfil}
            cellRender={cellRenderFile}
          /> */}
          <ColumnButton name="edit" />
          <ColumnButton name="delete" />
        </Column>

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
                  />
                  &nbsp;
                  <Button
                    icon="filter"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                    onClick={() => setIsActiveFilters(!isActiveFilters)}
                  />

                  &nbsp;
                  <Button icon="refresh"
                    id="btnRefresh"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                    onClick={resetLoadOptions}
                    disabled={customDataGridIsBusy} />
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
        /*   <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
            toolbar={ */
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
              <Button icon="refresh"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                disabled={customDataGridIsBusy}
                onClick={resetLoadOptions} />

            </PortletHeaderToolbar>
          }
        />
      )}

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
          initialLoadOptions={{ currentPage: 1, pageSize: 10, sort: { column: 'NombreCompleto', order: 'asc' } }}
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
    </>
  );
};

AutorizadorUsuarioListPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool
};
AutorizadorUsuarioListPage.defaultProps = {
  showHeaderInformation: false,
  titulo: "",
  modoEdicion: false,
  showButtons: true
};

export default injectIntl(AutorizadorUsuarioListPage);
