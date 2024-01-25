import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar
} from "../../../../partials/content/Portlet";
import { Button } from "devextreme-react";
import { Item, GroupItem } from "devextreme-react/form";
import {
  DataGrid,
  Column,
  Editing,
  FilterRow,
  HeaderFilter,
  FilterPanel
} from "devextreme-react/data-grid";

import {
  isNotEmpty,
  listarEstado,
  listarTipoCama,
  listarEstadosCama
} from "../../../../../_metronic";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";

import { storeListar as loadUrl } from "../../../../api/campamento/cama.api";
import { initialFilter } from "./CamaIndexPage";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
import SimpleDropDownBoxGrid from "../../../../partials/components/SimpleDropDownBoxGrid/SimpleDropDownBoxGrid";

//import { obtenerTodos as listarCamaExclusiva } from "../../../../api/campamento/camaExclusiva.api";
import { obtenerTodos as listarCampamentos } from "../../../../api/campamento/campamento.api";
import { listar as listarServicios } from "../../../../api/campamento/servicio.api";
import CampamentoPerfilBuscar from "../../../../partials/components/CampamentoPerfilBuscar";

import Tooltip from "@material-ui/core/Tooltip";
import Badge from "@material-ui/core/Badge";

const CamaListPage = props => {
  const { intl } = props;
  const { IdCliente, IdDivision } = useSelector(
    state => state.perfil.perfilActual
  );

  //const [selectedRow, setSelectedRow] = useState([]);
  const [camasExclusiva, setCamaExclusiva] = useState([]);
  const [campamentos, setCampamentos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [servicioSeleccionados, setServiciosSeleccionados] = useState([]);
  const [estadoSimple, setEstadoSimple] = useState([]);

  /* const { IdDivision } = props.selected; */

  //Variables de CustomerDataGrid
  const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);

  const { filterData, setFilterData } = props;
  // const [refreshData, setRefreshData] = useState(false);
  // const ds = new DataSource({
  //   store: new ArrayStore({ data: [], key: "RowIndex" }),
  //   reshapeOnPush: false,
  // });

  // const [dataSource] = useState(ds);

  // const refresh = () => dataSource.refresh();
  //const resetLoadOptions = () => dataSource.resetLoadOptions();
  // PAGINATION
  // ------------------------------
  const [
    ifThereAreNoChangesLoadFromStorage,
    setIfThereAreNoChangesLoadFromStorages
  ] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;
  //Filtros
  const [
    popupVisibleCampamentoPerfil,
    setPopupVisibleCampamentoPerfil
  ] = useState(false);

  async function cargarCombos() {
    let estadoSimples = listarEstado();
    setEstadoSimple(estadoSimples);

    let [camaExclusiva, tmp_campamentos, tmp_Servicios] = await Promise.all([
      listarEstadosCama(),
      listarCampamentos({ IdCliente, IdDivision }),
      listarServicios({ IdCliente, IdDivision, numPagina: 0, tamPagina: 0 })
    ]).finally(() => {});

    setCamaExclusiva(camaExclusiva);
    setCampamentos(tmp_campamentos);
    setServicios(
      tmp_Servicios.map(x => ({
        IdServicio: x.IdServicio,
        Servicio: x.Servicio,
        Check: true
      }))
    );
  }

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
  };

  const seleccionarRegistroDblClick = evt => {
    if (isNotEmpty(evt.data)) {
      props.verRegistroDblClick(evt.data);
    }
  };

  const obtenerCampoActivo = rowData => {
    return rowData.Activo === "S";
  };

  const selectCampamentoPerfil = dataPopup => {
    const { IdCliente, IdDivision, IdPerfil, Perfil } = dataPopup[0];
    //console.log("selectCampamentoPerfil",IdPerfil, Perfil);
    props.dataSource.loadDataWithFilter({ data: { IdPerfil, Perfil } });
    /*       dataFilter.IdPerfil = IdPerfil;
          dataFilter.Perfil = Perfil; */
    setPopupVisibleCampamentoPerfil(false);
  };

  function onCellPrepared(e) {
    if (e.rowType === "data") {
      if (e.data.Activo === "N") {
        e.cellElement.style.color = "red";
      }
    }
  }

  const textEditing = {
    confirmDeleteMessage: "",
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" })
  };

  useEffect(() => {
    cargarCombos();
    if (ifThereAreNoChangesLoadFromStorage)
      setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage]);
  useEffect(() => {
    if (props.refreshData) {
      props.refresh();
      props.setRefreshData(false);
    }
  }, [props.refreshData]);

  useEffect(() => {
    if (IdDivision) {
      props.dataSource.loadDataWithFilter({ data: { IdDivision } });
    }
  }, [IdDivision]);

  useEffect(() => {
    if (servicioSeleccionados) {
      // console.log("servicioSeleccionados:",servicioSeleccionados);
      let strServicios = servicioSeleccionados
        .filter(x => x.Check)
        .map(x => x.IdServicio)
        .join("|");
      //console.log("servicioSeleccionados:strServicios", strServicios);
      props.dataSource.loadDataWithFilter({
        data: { IdServicio: strServicios }
      });
    }
  }, [servicioSeleccionados]);

  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter = [
    "IdCliente",
    "IdDivision",
    "TipoModulo",
    "Modulo",
    "TipoHabitacion",
    "Habitacion",
    "Cama",
    "IdServicio",
    "IdPerfil",
    "IdCampamento",
    "Activo",
    "IdModulo",
    "IdHabitacion",
    "IdCama",
    "EstadoCamaFiltro",
    "EstadoCama",
    "Campamento"
  ];

  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem>
        <GroupItem itemType="group" colCount={2} colSpan={2}>
          <Item dataField="IdPerfil" visible={false} />

          <Item
            dataField="IdCampamento"
            label={{
              text: intl.formatMessage({ id: "CAMP.RESERVATION.CAMP" })
            }}
            editorType="dxSelectBox"
            editorOptions={{
              items: campamentos,
              valueExpr: "IdCampamento",
              displayExpr: "Campamento",
              placeholder: "Seleccione..",
              onValueChanged: () => getInstance().filter()
            }}
          />

          <Item
            dataField="Perfil"
            label={{ text: intl.formatMessage({ id: "ACCESS.PROFILE" }) }}
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
                    onClick: () => {
                      setPopupVisibleCampamentoPerfil(true);
                    }
                  }
                }
              ]
            }}
          />

          <Item
            dataField="IdServicio"
            label={{
              text: intl.formatMessage({ id: "CASINO.REPORT.SERVICE" })
            }}
            //value={servicioSeleccionados}
            //editorOptions={{
            //    onValueChanged: () => getInstance().filter(),
            //}}
          >
            <SimpleDropDownBoxGrid
              ColumnDisplay={"Servicio"}
              placeholder={"Select a value.."}
              SelectionMode="multiple"
              dataSource={servicios}
              Columnas={[
                {
                  dataField: "Servicio",
                  caption: intl.formatMessage({
                    id: "CAMP.RESERVATION.SERVICES"
                  }),
                  width: "100%"
                }
              ]}
              setSeleccionados={setServiciosSeleccionados}
              Seleccionados={servicioSeleccionados}
              pageSize={10}
              pageEnabled={true}
            />
          </Item>

          <Item
            dataField="EstadoCamaFiltro"
            label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: camasExclusiva,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              showClearButton: true,
              onValueChanged: () => {
                getInstance().filter();
              }
            }}
          />
          <Item />

          <Item
            dataField="Activo"
            label={{ text: intl.formatMessage({ id: "COMMON.ACTIVE" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: estadoSimple,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              onValueChanged: () => getInstance().filter()
            }}
          />
        </GroupItem>
      </GroupItem>
    );
  };

  const css_caja_estado = {
    color: "white",
    padding: "5px 10px 5px 10px",
    textAlign: "center"
  };

  const css_caja_estado_negro = {
    color: "black",
    padding: "5px 10px 5px 10px",
    textAlign: "center"
  };

  const cellEstadoCamaRender = e => {
    let estado = "";
    let css = "";
    switch (e.text) {
      case "L":
        estado = "Libre";
        break;
      case "A":
        estado = "Asignado";
        break;
      case "R":
        css = "item_reservado";
        estado = "Reservado";
        break;
      case "O":
        css = "item_ocupado";
        estado = "Ocupado";
        break;
    }

    return css === "" ? (
      <span className={css} style={css_caja_estado_negro}>
        {estado}
      </span>
    ) : (
      <span className={css} style={css_caja_estado}>
        {estado}
      </span>
    );
  };

  const renderDataGrid = ({ gridRef, dataSource }) => {
    if(dataSource._storeLoadOptions.filter !== undefined ){
      if(props.totalRowIndex === 0){ 
      props.setTotalRowIndex(dataSource._totalCount);
      }
      if(dataSource._totalCount != props.totalRowIndex){
        if(dataSource._totalCount != -1){
        props.setVarIdHabitacionCama("")
        props.setFocusedRowKey();
        props.setTotalRowIndex(dataSource._totalCount);
        }
      }
    }
    return (
      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        // onEditingStart={editarRegistro}
        // onRowRemoving={eliminarRegistro}
        onFocusedRowChanged={seleccionarRegistro}
        onRowDblClick={seleccionarRegistroDblClick}
        onCellPrepared={onCellPrepared}
        focusedRowEnabled={true}
        focusedRowKey={props.focusedRowKey}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
        keyExpr={"RowIndex"}
      >
        <Editing
          mode="row"
          useIcons={props.showButtons}
          allowUpdating={false}
          allowDeleting={false}
          texts={textEditing}
        />
        <FilterRow visible={true} showOperationChooser={false} />
        <HeaderFilter visible={false} />
        <FilterPanel visible={false} />
        <Column
          dataField="RowIndex"
          caption="#"
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          width={"7%"}
          alignment={"center"}
        />

        <Column
          dataField="Campamento"
          caption={intl.formatMessage({ id: "CAMP.RESERVATION.CAMP" })}
          // allowSorting={true}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"10%"}
          allowSorting={false}
        />

        <Column
          dataField="TipoModulo"
          caption={intl.formatMessage({ id: "CAMP.TYPEMODULE" })}
          allowHeaderFiltering={false}
          allowSorting={true}
          width={"12%"}
          alignment={"center"}
        />

        <Column
          dataField="Modulo"
          caption={intl.formatMessage({ id: "SYSTEM.MODULE" })}
          allowSorting={true}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"20%"}
        />
        <Column
          dataField="TipoHabitacion"
          caption={intl.formatMessage({ id: "CAMP.ROOMTYPE" })}
          allowSorting={true}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"20%"}
        />
        <Column
          dataField="Habitacion"
          caption={intl.formatMessage({ id: "CAMP.ROOM" })}
          allowSorting={true}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"20%"}
        />
        <Column
          dataField="Cama"
          caption={intl.formatMessage({ id: "CAMP.ROOM.BED" })}
          allowSorting={true}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"20%"}
        />

        <Column
          dataField="EstadoCama"
          caption={intl.formatMessage({ id: "COMMON.STATE" })}
          allowSorting={true}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"20%"}
          cellRender={cellEstadoCamaRender}
        />

        <Column
          dataField="Activo"
          caption={intl.formatMessage({ id: "COMMON.ACTIVE" })}
          calculateCellValue={obtenerCampoActivo}
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"8%"}
        />
        <Column dataField="IdPerfil" visible={false} />
        <Column dataField="IdModulo" visible={false} />
        <Column dataField="IdHabitacion" visible={false} />
        <Column dataField="IdCama" visible={false} />
      </DataGrid>
    );
  };

  return (
    <>
      {props.showHeaderInformation && (
        <HeaderInformation
          data={props.getInfo()}
          visible={props.showHeaderInformation}
          labelLocation={"left"}
          colCount={6}
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
                      //disabled={customDataGridIsBusy}
                      disabled={true}
                    />
                    &nbsp;
                    <Button
                      icon="refresh" //fa fa-broom
                      type="default"
                      hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                      disabled={customDataGridIsBusy}
                      onClick={resetLoadOptions}
                    />
                    &nbsp;
                    <Button
                      icon="fa fa-file-excel"
                      type="default"
                      hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
                      disabled={true}
                    />
                  </PortletHeaderToolbar>
                </PortletHeaderToolbar>
              }
            />
          }
        />
      )}

      {!props.showHeaderInformation && (
        <PortletHeader
          title={intl.formatMessage({ id: "ACTION.LIST" })}
          toolbar={
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
                icon="refresh" //fa fa-broom
                type="default"
                hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                disabled={customDataGridIsBusy}
                onClick={resetLoadOptions}
              />
              &nbsp;
            </PortletHeaderToolbar>
          }
        />
      )}

      <PortletBody>
        {/* <CustomDataGrid {...propsCustomDataGrid} />*/}
        <CustomDataGrid
          showLog={false}
          uniqueId={props.uniqueId}
          dataSource={props.dataSource}
          rowNumberName="RowIndex"
          loadWhenStartingComponent={
            props.isFirstDataLoad && !props.refreshData
          }
          renderDataGrid={renderDataGrid}
          loadUrl={loadUrl}
          forceLoad={forceLoadTypes.Unforced}
          sendToServerOnlyIfThereAreChanges={true}
          ifThereAreNoChangesLoadFromStorage={
            ifThereAreNoChangesLoadFromStorage
          }
          caseSensitiveWhenCheckingForChanges={true}
          uppercaseFilterRow={true}
          initialLoadOptions={{
            currentPage: 1,
            pageSize: 20,
            sort: { column: "TipoModulo", order: "asc" }
          }}
          filterRowSize="sm"
          summaryCountFormat={`${intl.formatMessage({
            id: "COMMON.TOTAL.ROW"
          })} {0} de {1} `}
          visibleCustomFilter={isActiveFilters}
          renderFormContentCustomFilter={renderFormContentCustomFilter}
          keysToGenerateFilter={keysToGenerateFilter}
          filterData={filterData}
          // PAGINATION
          paginationSize="md"
          // EVENTS
          onLoading={() => setCustomDataGridIsBusy(true)}
          onError={() => setCustomDataGridIsBusy(false)}
          onLoaded={() => setCustomDataGridIsBusy(false)}
        />

        {/* Popup Campamento Perfil */}
        <CampamentoPerfilBuscar
          selectData={selectCampamentoPerfil}
          showPopup={{
            isVisiblePopUp: popupVisibleCampamentoPerfil,
            setisVisiblePopUp: setPopupVisibleCampamentoPerfil
          }}
          cancelarEdicion={() => setPopupVisibleCampamentoPerfil(false)}
          uniqueId={"campamentoPerfilCamaListPage"}
        />
      </PortletBody>
    </>
  );
};
CamaListPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string,
  selected: PropTypes.object
};
CamaListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  showHeaderInformation: false,
  uniqueId: "camaList",
  selected: { IdDivision: "" }
};

export default injectIntl(CamaListPage);
