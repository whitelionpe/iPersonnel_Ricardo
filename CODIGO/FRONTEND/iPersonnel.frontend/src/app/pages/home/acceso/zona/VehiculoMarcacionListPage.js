import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  DataGrid,
  Column,
  Button as ColumnButton,
  MasterDetail,

} from "devextreme-react/data-grid";
import { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar,
} from "../../../../partials/content/Portlet";

//import VehiculoMarcacionFilterPage from "./VehiculoMarcacionFilterPage";
import { isNotEmpty } from "../../../../../_metronic";


//Multi-idioma
import { injectIntl } from "react-intl";
//import { connect } from "react-redux";

// import {
//   handleErrorMessages,
//   handleSuccessMessages,
//   handleWarningMessages,
// } from "../../../../store/ducks/notify-messages";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../partials/components/HeaderInformation";

import { listarTipoMarcacion, getDateOfDay } from "../../../../../_metronic/utils/utils";
import PersonaMarcacionPorVehiculo from '../vehiculo/marcacion/PersonaMarcacionPorVehiculo';

//Custom grid: ::::::::::::::::::::::::::::::::
// import { Item, GroupItem } from "devextreme-react/form";
// import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
// import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
// import ArrayStore from 'devextreme/data/array_store';
// import DataSource from 'devextreme/data/data_source';

//-CustomerDataGrid-Import>
import { convertCustomDateTimeString, convertStringToDate } from "../../../../partials/components/CustomFilter";
import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
//import { storeFiltrar as loadUrl } from "../../../../api/administracion/posicion.api";
import { storeListarbyZona as loadUrl } from "../../../../api/acceso/vehiculoMarcacion.api";

import { initialFilterMarcas } from "../../administracion/zona/ZonaIndexPage";



//:::::::::::::::::::::::::::::::::::::::::::::
//import { } from "../../../../../_metronic/utils/utils";

const VehiculoMarcacionListPage = (props) => {
  //multi-idioma
  const { intl } = props;
  const [activarFiltros, setactivarFiltros] = useState(false);
  const { IdCliente } = useSelector((state) => state.perfil.perfilActual);
  const { IdDivision, IdZona, IdPuerta, IdEquipo, FechaInicio, FechaFin } = props.filter;


  // const [dataFilter, setDataFilter] = useState({
  //   FechaInicio: "",
  //   FechaFin: "",
  // });



  //Custom grid: ::::::::::::::::::::::::::::::::
  const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;
  const [filterData, setFilterData] = useState({ ...initialFilterMarcas, IdCliente, IdDivision, IdZona, IdPuerta, IdEquipo, FechaInicio, FechaFin });

  const keysToGenerateFilter = ['IdCliente', 'IdSecuencial', 'IdDivision', 'IdVehiculo', 'FechaInicio', 'FechaFin', 'Compania', 'Placa', 'Funcion', 'FechaCorta', 'Minutos', 'TipoMarcacion', 'ChoferDatos', 'IdZona', 'IdPuerta', 'IdEquipo'];
  //:::::::::::::::::::::::::::::::::::::::::::::



  //: FILTRO  :::::::::::::::::::::::::::::::::::::::::::::
  // const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  // const [refreshData, setRefreshData] = useState(false);
  // const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  // const [dataSource] = useState(ds);

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::

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

  //Custom grid: ::::::::::::::::::::::::::::::::
  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem>
        <GroupItem itemType="group" colCount={2} colSpan={2}>
          <Item dataField="IdCliente" editorOptions={{ value: IdCliente }} visible={false} />
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
        id="gridVehiculoMarcacion"
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
      >
        <Column dataField="IdCliente" caption="" visible={false} />
        <Column dataField="IdSecuencial" caption="" visible={false} />
        <Column dataField="IdDivision" caption="" visible={false} />
        <Column dataField="IdVehiculo" caption="" visible={false} />
        <Column dataField="Compania" caption={intl.formatMessage({ id: "ACCESS.VEHICLE.COMPANY", })} width={"10%"} />
        <Column dataField="Placa" caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.LICENSEPLATE", })} width={"10%"} />
        <Column dataField="Funcion" caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.FUNCTION", })} alignment={"center"} width={"10%"} />
        <Column dataField="FechaCorta" caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE", })} alignment={"center"} width={"7%"} />
        <Column dataField="Minutos" caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.HOUR", })} alignment={"center"} width={"7%"} />
        <Column dataField="TipoMarcacion" caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.RESULT", })} width={"25%"} />
        <Column dataField="ChoferDatos" caption={intl.formatMessage({ id: "ACCESS.VEHICLE.MARK.DRIVER", })} alignment={"left"} width={"25%"} />
        <Column dataField="CantPasajeros" caption={intl.formatMessage({ id: "ACCESS.VEHICLE.NUMBEROFPASSENGERS" })} alignment={"center"} width={"15%"} />
        <Column dataField="TiempoControl" caption={intl.formatMessage({ id: "ACCESS.VEHICLE.CONTROLTIME" })} alignment={"center"} width={"15%"} />
        <Column type="buttons" width={30} visible={props.showButtons} >
          <ColumnButton icon="fa fa-eye" hint={intl.formatMessage({ id: "ACCESS.VEHICLE.VIEW", })} onClick={verDetalleMarca} />
        </Column>


        <MasterDetail enabled={true} component={PersonaMarcacionPorVehiculo} />


      </DataGrid>




    );
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
    if (props.filter) {
      //console.log("Filter.useEffect", props.filter);      
      props.dataSource.loadDataWithFilter({ data: { IdDivision, IdZona, IdPuerta, IdEquipo } });
    }
  }, [props.filter]);

  //console.log("Filter.Page-->", props.filter);

  //Cambios de filtro

  //:::::::::::::::::::::::::::::::::::::::::::::


  // const editarRegistro = (evt) => {
  //   let { Automatico } = evt.data;

  //   if (Automatico == "N") {
  //     props.editarRegistro(evt.data, true);
  //   } else {
  //     //evt.cancel = true;
  //     handleWarningMessages(
  //       intl.formatMessage({ id: "ACCESS.PERSON.MARK.WARNINGEDIT" })
  //     );
  //     props.editarRegistro(evt.data, false);
  //   }
  // };

  // const eliminarRegistro = (evt) => {
  //   props.eliminarRegistro(evt.data);
  // };

  // const onRowRemoving = (evt) => {
  //   let { Automatico } = evt.data;

  //   if (Automatico == "N") {
  //     evt.cancel = false;
  //   } else {
  //     evt.cancel = true;
  //     handleWarningMessages(
  //       intl.formatMessage({ id: "ACCESS.PERSON.MARK.WARNINGDELETE" })
  //     );
  //   }
  // };

  // const seleccionarRegistro = (evt) => {
  //   props.seleccionarRegistro(evt.data);
  // };


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

  //   // setDataFilter({
  //   //   FechaInicio,
  //   //   FechaFin: new Date(FechaFin),
  //   // });

  //   // setactivarFiltros(!activarFiltros ? true : false);

  //   // let hoy = new Date();
  //   // let FechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  //   // let FechaFin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);
  //   // FechaFin = FechaFin.setMinutes(-1);
  //   // setDataFilter({
  //   //   FechaInicio,
  //   //   FechaFin: new Date(FechaFin),
  //   // });

  //   // setactivarFiltros(!activarFiltros ? true : false);
  //   //setactivarFiltros(!activarFiltros ? true : false);
  // }

  // async function generarFiltro(data) {
  //   const { FechaInicio, FechaFin } = data;

  //   if (isNotEmpty(FechaInicio) && isNotEmpty(FechaFin)) {
  //     dataSource.loadDataWithFilter({ data: { FechaInicio: FechaInicio.toLocaleString(), FechaFin: FechaFin.toLocaleString() } })
  //     //props.consultarPersonas(filtros); //EGSC
  //   }
  //   // const { FechaInicio, FechaFin } = dataFilter;
  //   // if (isNotEmpty(FechaInicio) && isNotEmpty(FechaFin)) {
  //   //   let filtros = {
  //   //     FechaInicio,
  //   //     FechaFin,
  //   //   };

  //   //   props.consultarRegistro(filtros);
  //   // }
  // }

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
  };

  return (
    <>
      <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={2}
        toolbar={
          <PortletHeader
            title=""
            toolbar={

              <PortletHeaderToolbar>
                <Button
                  icon="search"
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
                  icon="fa fa-times-circle"
                  type="normal"
                  hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                  onClick={props.cancelarEdicion}

                />
                &nbsp;
                      </PortletHeaderToolbar>

            }
          />

        } />

      <PortletBody>
        <React.Fragment>
          {/* {activarFiltros ? (
            <VehiculoMarcacionFilterPage
              generarFiltro={generarFiltro}
              dataFilter={dataFilter}
              setDataFilter={setDataFilter}
            />
          ) : null} */}
          <div className="row">
            <CustomDataGrid
              showLog={false}
              uniqueId='vehiculoMarcacionList'
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
              initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'FechaCorta', order: 'asc' } }}
              filterRowSize='sm'
              summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}
              visibleCustomFilter={isActiveFilters}
              renderFormContentCustomFilter={renderFormContentCustomFilter}
              transformData={transformData}
              reverseTransformData={reverseTransformData}
              keysToGenerateFilter={keysToGenerateFilter}
              filterData={filterData}
              paginationSize='md'
              onLoading={() => setCustomDataGridIsBusy(true)}
              onError={() => setCustomDataGridIsBusy(false)}
              onLoaded={() => setCustomDataGridIsBusy(false)}
            />
          </div>
        </React.Fragment>
      </PortletBody>
    </>
  );
};

VehiculoMarcacionListPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
};
VehiculoMarcacionListPage.defaultProps = {
  showHeaderInformation: true,
};

export default injectIntl(VehiculoMarcacionListPage);
