import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  DataGrid,
  Column,
  Button as ColumnButton,
  Editing,
  Selection,
  MasterDetail,
  Paging, Pager,
  FilterRow,
  HeaderFilter,
  FilterPanel,
  Summary,
  TotalItem
} from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar,
} from "../../../../partials/content/Portlet";

import PersonaMarcacionFilterPage from "./PersonaMarcacionFilterPage";
import { isNotEmpty } from "../../../../../_metronic";

import { obtener as obtenerMarcacion } from "../../../../api/acceso/marcacion.api";

//Multi-idioma
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../partials/components/HeaderInformation";


import {
  handleErrorMessages,
  handleSuccessMessages,
  handleWarningMessages,
} from "../../../../store/ducks/notify-messages";

import { listarTipoMarcacion } from "../../../../../_metronic/utils/utils";
import { confirm, custom } from "devextreme/ui/dialog";


import { convertCustomDateTimeString, convertStringToDate } from "../../../../partials/components/CustomFilter";

//Custom grid: ::::::::::::::::::::::::::::::::
import { Item, GroupItem } from "devextreme-react/form";
import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

import { storeListarbyZona as loadUrl } from "../../../../api/acceso/marcacion.api";
//:::::::::::::::::::::::::::::::::::::::::::::
import { getDateOfDay } from "../../../../../_metronic/utils/utils";
import { indexOf } from "lodash";

const PersonaMarcacionListPage = (props) => {
  const { intl } = props;
  const [activarFiltros, setactivarFiltros] = useState(false);
  const perfil = useSelector((state) => state.perfil.perfilActual);
  // const [dataFilter, setDataFilter] = useState({
  //   FechaInicio: "",
  //   FechaFin: "",
  // });


  //Custom grid: ::::::::::::::::::::::::::::::::
  const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const keysToGenerateFilter = ['FechaInicio', 'FechaFin', 'IdCliente', 'IdSecuencial', 'IdDivision', 'IdVehiculo', 'Compania', 'Placa', 'Funcion', 'FechaCorta', 'Minutos', 'TipoMarcacion', 'ChoferDatos', 'CantPasajeros', 'TiempoControl'];
  //:::::::::::::::::::::::::::::::::::::::::::::

  //: FILTRO  :::::::::::::::::::::::::::::::::::::::::::::
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();
  const { IdDivision, IdZona, IdPuerta, IdEquipo, FechaInicio, FechaFin } = props.filterData;
  //props.filterData
  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::


  const onBuscarFiltros = (e) => {
    let { FechaInicio, FechaFin } = props.dataFilter;

    let flF1 = FechaInicio instanceof Date && !isNaN(FechaInicio.valueOf()) && FechaInicio > new Date(1970, 1, 1);
    let flF2 = FechaFin instanceof Date && !isNaN(FechaFin.valueOf()) && FechaFin > new Date(1970, 1, 1);

    if (flF1 && flF2) {
      props.generarFiltro(props.dataFilter);
    }
  };

  //Custom grid: ::::::::::::::::::::::::::::::::
  const transformData = {
    FechaInicio: (rawValue) => convertCustomDateTimeString(rawValue),
    FechaFin: (rawValue) => convertCustomDateTimeString(rawValue),
    //FechaMarca: (rawValue) => convertCustomDateTimeString(rawValue),
  }
  const reverseTransformData = {
    FechaInicio: (value) => convertStringToDate(value),
    FechaFin: (value) => convertStringToDate(value),
    //FechaMarca: (value) => convertStringToDate(value),
  }
  //:::::::::::::::::::::::::::::::::::::::::::::

  //Custom grid: ::::::::::::::::::::::::::::::::
  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem>
        <GroupItem itemType="group" colCount={2} colSpan={2}>
          <Item dataField="IdCliente" editorOptions={{ value: perfil.IdCliente }} visible={false} />
          <Item dataField="IdVehiculo" editorOptions={{ value: props.IdVehiculo }} visible={false} />
          <Item
            dataField="FechaInicio"
            label={{
              text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" }),
            }}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy",
              onValueChanged: () => getInstance().filter()
            }}
          />
          <Item
            dataField="FechaFin"
            label={{
              text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" }),
            }}
            isRequired={true}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy",
              onValueChanged: () => getInstance().filter()

            }}
          />
        </GroupItem>
      </GroupItem>
    );
  }

  const renderDataGrid = ({ gridRef, dataSource }) => {
    return (
      <DataGrid
        id="gridPersonaMarcacion"
        //Custom grid: ::::::::::::::::::::::::::::::::
        dataSource={dataSource}
        ref={gridRef}
        //:::::::::::::::::::::::::::::::::::::::::::::
        //dataSource={props.personaMarcacionData}
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="RowIndex"
        //focusedRowKey={props.focusedRowKey}
        onCellPrepared={onCellPrepared}
        remoteOperations={true}
      // onRowClick={onRowClickGrid}
      >
        <Column dataField="IdCliente" caption="" visible={false} />
        <Column dataField="IdSecuencial" caption="" visible={false} />
        <Column dataField="IdDivision" caption="" visible={false} />
        <Column dataField="IdPersona" caption="" visible={false} />
        <Column dataField="FechaMarca" caption="" visible={false} />

        <Column dataField="Compania" caption={intl.formatMessage({ id: "ACCESS.VEHICLE.COMPANY", })} width={"15%"} />
        <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "ACCESS.VEHICLE.NAMES", })} width={"15%"} />
        <Column dataField="Funcion" caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.FUNCTION", })} alignment={"center"} width={"10%"} />
        <Column dataField="FechaCorta" caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE", })} alignment={"center"} width={"10%"} />
        <Column dataField="Minutos" caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.HOUR", })} alignment={"center"} width={"10%"} />
        <Column dataField="TipoMarcacion" caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.RESULT", })} width={"15%"} />
        <Column dataField="Placa" caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.LICENSEPLATE", })} width={"10%"} />
        <Column type="buttons" visible={props.showButtons} width={"5%"} >
          <ColumnButton icon="fa fa-eye" hint={intl.formatMessage({ id: "ACCESS.VEHICLE.VIEW", })} onClick={verDetalleMarca} />
        </Column>

        {/* <FilterRow visible={true} />
        <HeaderFilter visible={true} />
        <FilterPanel visible={false} />

        <Summary>
          <TotalItem
          cssClass="classColorPaginador_"
            column="Compania"
            summaryType="count"
            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
          />
        </Summary> */}

      </DataGrid>


    );
  }

  useEffect(() => {
    if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage])

  useEffect(() => {
    if (refreshData) {
      refresh();
      setRefreshData(false);
    }
  }, [refreshData]);

  useEffect(() => {
    if (props.filter) {
      //console.log("Filter.useEffect", props.filter);      
      props.dataSource.loadDataWithFilter({ data: { IdDivision, IdZona, IdPuerta, IdEquipo } });
    }
  }, [props.filterData]);


  //:::::::::::::::::::::::::::::::::::::::::::::


  const editarRegistro = (evt) => {
    let { Automatico } = evt.row.data;

    if (Automatico == "N") {
      props.editarRegistro(evt.row.data, true);
    } else {
      //evt.cancel = true;
      handleWarningMessages(
        intl.formatMessage({ id: "ACCESS.PERSON.MARK.WARNINGEDIT" })
      );
      props.editarRegistro(evt.row.data, false);
    }
  };

  const eliminarRegistro = (evt) => {
    let data = evt.row.data;
    let { Automatico } = data;

    if (Automatico == "N") {

      let dialog = custom({
        showTitle: false,
        messageHtml: intl.formatMessage({ id: "ALERT.REMOVE" }),
        buttons: [
          {
            text: "Yes",
            onClick: (e) => {
              props.eliminarRegistro(data);
            }
          },
          { text: "No", },
        ]
      });
      dialog.show();
    } else {
      handleWarningMessages(
        intl.formatMessage({ id: "ACCESS.PERSON.MARK.WARNINGDELETE" })
      );
    }

  };

  const onRowRemoving = (evt) => {

  };

  function onCellPrepared(e) {
    if (e.rowType === "data") {
      if (e.data.AccesoNegado === "S") {
        e.cellElement.style.color = "red";
      }
    }
  }



  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  };

  // function onActivarFiltroMarcacion() {

  //   let { FechaInicio, FechaFin } = getDateOfDay();

  //   setDataFilter({
  //     FechaInicio,
  //     FechaFin: new Date(FechaFin),
  //   });

  //   setactivarFiltros(!activarFiltros ? true : false);
  // }

  async function generarFiltro(data) {
    const { FechaInicio, FechaFin } = data;

    if (isNotEmpty(FechaInicio) && isNotEmpty(FechaFin)) {
      dataSource.loadDataWithFilter({ data: { FechaInicio: FechaInicio.toLocaleString(), FechaFin: FechaFin.toLocaleString() } })
      //props.consultarPersonas(filtros); //EGSC
    }
  }

  function cellRender(param) {
    if (param && param.data) {
      let lstTipos = listarTipoMarcacion();
      let filtro = lstTipos.find(x => x.Valor == param.data.Tipo);

      if (filtro != undefined) {
        return (isNotEmpty(filtro.Descripcion) ? filtro.Descripcion : "");
      }
      return "";
    }
  }

  const verDetalleMarca = (evt) => {

    props.verRegistro(evt.row.data);
  }

  return (
    <>
      <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={2}
        toolbar={
          <PortletHeader
            title=""
            toolbar={
              <PortletHeaderToolbar>
                <PortletHeaderToolbar>

                  {/* <Button
                    icon={activarFiltros ? "search" : "search"}
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                    onClick={onActivarFiltroMarcacion}
                    disabled={customDataGridIsBusy}
                  /> */}

                  <Button
                    icon="search"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                    onClick={() => setIsActiveFilters(!isActiveFilters)}
                    disabled={customDataGridIsBusy}
                  />

                  {/* <Button
                    icon="fa fa-search"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                    onClick={() => setIsActiveFilters(!isActiveFilters)}
                    disabled={customDataGridIsBusy}
                  /> */}
                             &nbsp;
                  <Button icon="refresh" //fa fa-broom
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
                        &nbsp;
                      </PortletHeaderToolbar>
              </PortletHeaderToolbar>
            }
          />

        } />


      <PortletBody>
        <React.Fragment>
          {/* {activarFiltros ? (
            <PersonaMarcacionFilterPage
              generarFiltro={generarFiltro}
              dataFilter={dataFilter}
            />
          ) : null} */}
          <div className="row">

            <CustomDataGrid
              showLog={false}
              uniqueId='personaMarcacionList'
              dataSource={dataSource}
              rowNumberName='RowIndex'
              loadWhenStartingComponent={isFirstDataLoad && !refreshData}
              renderDataGrid={renderDataGrid}
              loadUrl={loadUrl}
              forceLoad={forceLoadTypes.Unforced}
              sendToServerOnlyIfThereAreChanges={true}
              ifThereAreNoChangesLoadFromStorage={ifThereAreNoChangesLoadFromStorage}
              caseSensitiveWhenCheckingForChanges={true}
              uppercaseFilterRow={true}
              initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'IdDivision', order: 'asc' } }}
              filterRowSize='sm'
              summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}
              visibleCustomFilter={isActiveFilters}
              renderFormContentCustomFilter={renderFormContentCustomFilter}
              keysToGenerateFilter={keysToGenerateFilter}
              filterData={props.filterData}
              paginationSize='md'
              onLoading={() => setCustomDataGridIsBusy(true)}
              onError={() => setCustomDataGridIsBusy(false)}
              onLoaded={() => setCustomDataGridIsBusy(false)}

              transformData={transformData}
              reverseTransformData={reverseTransformData}
            />

          </div>
        </React.Fragment>
      </PortletBody>
    </>
  );
};


PersonaMarcacionListPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
};
PersonaMarcacionListPage.defaultProps = {
  showHeaderInformation: true,
};

export default injectIntl(PersonaMarcacionListPage);
