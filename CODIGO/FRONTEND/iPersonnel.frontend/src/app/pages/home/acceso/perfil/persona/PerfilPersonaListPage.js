import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, FilterRow, Button as ColumnButton, Paging } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../../_metronic";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import PropTypes from "prop-types";
import { DoubleLinePersona as DoubleLineLabel } from "../../../../../partials/content/Grid/DoubleLineLabel";
//import PersonaGrupoFilterPage from "./PersonaGrupoFilterPage";

import { useSelector } from "react-redux";
//-CustomerDataGrid-Import>
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { storeListar as loadUrl } from "../../../../../api/acceso/perfil.api";
import { initialFilter } from "./PerfilPersonaIndexPage";
import { Popup } from 'devextreme-react/popup';

const PerfilPersonaListPage = props => {

  const { intl, accessButton } = props;
  const { IdCliente } = useSelector((state) => state.perfil.perfilActual);
  const { IdPerfil } = props.selected;
  //const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdPerfil: isNotEmpty(IdPerfil) ? IdPerfil : "" });
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;
  const [isVisiblePopHistorial, setisVisiblePopHistorial] = useState(false);


  const [activarFiltros, setactivarFiltros] = useState(false);
  const [dataFilter, setDataFilter] = useState({
    FechaInicio: "",
    FechaFin: ""
  });


  const editarRegistro = evt => {
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
  };

  //-CustomerDataGrid-UseEffect-ini->
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
    if (IdPerfil) {
      props.dataSource.loadDataWithFilter({ data: { IdPerfil } });
    }
  }, [IdPerfil]);
  //-CustomerDataGrid-UseEffect-end->


  function onActivarFiltro() {

    let hoy = new Date();
    let fecInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    setDataFilter({
      FechaInicio: fecInicio,
      FechaFin: hoy,
    });
    setactivarFiltros(!activarFiltros ? true : false);
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


  function MostrarHistorial(e) {
    props.listarHistorialPersona(e.row.data);
    setisVisiblePopHistorial(true);
  }

  function onCellPreparedHistorial(e) {
    if (e.rowType === "data") {
      if (e.data.Color === "S") {
        e.cellElement.style.color = "green";
      }
    }
  }



  //-CustomerDataGrid-Filter
  const keysToGenerateFilter = [
    'IdCliente',
    'IdPerfil',
    'IdPersona',
    'NombreCompleto',
    'Documento',
    'TipoDocumentoAlias',
    'FechaInicio',
    'FechaFin',
    'Activo'];

  const renderDataGrid = ({ gridRef, dataSource }) => {
    return (
      <PortletBody>
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
            //allowUpdating={false}//{props.showButtons}
            allowDeleting={props.showButtons}
            texts={textEditing}
          />
          <FilterRow visible={true} showOperationChooser={false} />

          <Column dataField="RowIndex" caption="#" allowSorting={false} allowFiltering={false} allowHeaderFiltering={false} width={"5%"} alignment={"center"} />
          <Column dataField="IdPersona" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} alignment={"center"} allowSorting={true} allowSearch={true} allowFiltering={true} />
          <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })} width={"45%"} allowSorting={true} allowSearch={true} allowFiltering={true} /> {/* cellRender={DoubleLineLabel} */}
          <Column dataField="TipoDocumentoAlias" caption={intl.formatMessage({ id: "COMMON.TYPE" })} width={"10%"} alignment={"center"} allowSearch={false} allowFiltering={false} visible={false} />
          <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })} allowSorting={true} allowFiltering={true} allowHeaderFiltering={false} alignment={"center"} width={"10%"} visible={false} />
          <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "CASINO.PERSON.GROUP.STARTDATE" })} dataType="date" format="dd/MM/yyyy" width={"20%"} alignment={"center"} allowSorting={true} allowSearch={false} allowFiltering={false} />
          <Column dataField="FechaFin" caption={intl.formatMessage({ id: "CASINO.PERSON.GROUP.ENDDATE" })} dataType="date" format="dd/MM/yyyy" width={"20%"} alignment={"center"} allowSorting={true} allowSearch={false} allowFiltering={false} />

          <Column type="buttons"  >
            <ColumnButton text="historial"
              icon="menu"
              hint={intl.formatMessage({ id: "ACCESS.PERSON.REQUIREMENTS.RECORD" })}
              onClick={MostrarHistorial}
            />
            <ColumnButton name="edit" />
            <ColumnButton name="delete" />
          </Column>

        </DataGrid>

        <Popup
          visible={isVisiblePopHistorial}
          dragEnabled={false}
          closeOnOutsideClick={true}
          showTitle={true}
          title={intl.formatMessage({ id: "ACCESS.PERSON.PROFILE.HISTORY" }).toUpperCase()}
          height={"550px"}
          width={"600px"}
          onHiding={() => setisVisiblePopHistorial(!isVisiblePopHistorial)}
        >
          <DataGrid
            dataSource={props.historialPersona}
            showBorders={true}
            focusedRowEnabled={true}
            keyExpr="RowIndex"
            onCellPrepared={onCellPreparedHistorial}
          >
            <Editing
              mode="row"
              useIcons={false}
              allowUpdating={false}
              allowDeleting={false}
            />

            <Paging enabled={true} defaultPageSize={15} />
            <FilterRow visible={true} />
            <Column dataField="RowIndex" caption="#" width={"7%"} alignment="center" allowSearch={false} allowFiltering={false} visible={false} />
            <Column dataField="Perfil" caption={intl.formatMessage({ id: "ACCESS.PROFILE" })} width={"50%"} allowSearch={false} allowFiltering={false} />
            <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })} dataType="date" format="dd/MM/yyyy" width={"15%"} alignment={"center"} allowSearch={false} allowFiltering={false} />
            <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })} dataType="date" format="dd/MM/yyyy" width={"15%"} alignment={"center"} allowSearch={false} allowFiltering={false} />

          </DataGrid>

        </Popup>

      </PortletBody>




    );
  }
  //-CustomerDataGrid-DataGrid- end


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
                  <Button icon="refresh"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                    disabled={customDataGridIsBusy}
                    onClick={resetLoadOptions} />
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
        {activarFiltros ? (
          {/* <PersonaGrupoFilterPage
            generarFiltro={generarFiltro}
            dataFilter={dataFilter}
          />  */}
        ) : null}
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
    </>
  );
};

PerfilPersonaListPage.propTypes = {
  allowUpdating: PropTypes.bool,
  allowDeleting: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  titulo: PropTypes.string,
  showButtons: PropTypes.bool,
  uniqueId: PropTypes.string,
};
PerfilPersonaListPage.defaultProps = {
  allowUpdating: true,
  allowDeleting: true,
  showHeaderInformation: false,
  titulo: "",
  showButtons: true,
  uniqueId: "PersonaPerfilListado"
};

export default injectIntl(PerfilPersonaListPage);
