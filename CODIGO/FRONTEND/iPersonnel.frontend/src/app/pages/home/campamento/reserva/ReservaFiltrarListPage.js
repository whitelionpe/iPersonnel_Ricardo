import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { Button } from "devextreme-react";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { DataGrid, Column, Editing, Button as ColumnButton } from "devextreme-react/data-grid";

import {
  isNotEmpty,
  dateFormat,
} from "../../../../../_metronic";
import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { handleInfoMessages } from "../../../../store/ducks/notify-messages";
import WithLoandingPanel from "../../../../partials/content/withLoandingPanel";
import { getStartAndEndOfMonthByDay } from "../../../../../_metronic/utils/utils";

import { servicePersona } from "../../../../api/administracion/persona.api";
import { filtrarReservas as loadUrl } from "../../../../api/campamento/reserva.api";

import { initialFilter } from "./MasivoPersonaIndex";
import { obtenerTodos as listarCampamentos } from "../../../../api/campamento/campamento.api";
import { obtenerTodos as listarModulos } from "../../../../api/campamento/tipoModulo.api";
import { obtenerTodos as listarHabitaciones } from "../../../../api/campamento/tipoHabitacion.api";

import AdministracionCompaniaBuscar from "../../../../partials/components/AdministracionCompaniaBuscar";
import PersonaTextAreaPopup from '../../../../partials/components/PersonaTextAreaPopup/PersonaTextAreaPopup';

import '../../acreditacion/persona/solicitud/SolcitudPage.css';
import './ReservaFiltrarListPage.css';
import CampamentoModuloBuscar from "../../../../partials/components/CampamentoModuloBuscar";
import CampamentoHabitacionBuscar from "../../../../partials/components/CampamentoHabitacionBuscar";
const { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay(new Date());

const ReservaFiltrarListPage = props => {
  const { intl, focusedRowKey, setLoading } = props;
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const [popupVisiblePersonas, setPopupVisiblePersonas] = useState(false);
  const [campamentos, setCampamentos] = useState([]);
  const [tipoModulos, setTipoModulos] = useState([]);
  const [tipoHabitaciones, setTipoHabitaciones] = useState([]);
  const [popupVisibleModulo, setPopupVisibleModulo] = useState(false);
  const [popupVisibleHabitacion, setPopupVisibleHabitacion] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({ IdCampamento: "", IdTipoModulo: "", IdTipoHabitacion: "", FechaInicio, FechaFin });
  const [viewFilter, setViewFilter] = useState(true);
  const [tipoFiltro, setTipoFiltro] = useState([]);

  //Variables de CustomerDataGrid
  const [isActiveFilters, setIsActiveFilters] = useState(true);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({
    ...initialFilter,
    IdCliente,
    IdDivision: isNotEmpty(IdDivision) ? IdDivision : "",
    FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd'),
    FechaFin: dateFormat(FechaFin, 'yyyyMMdd')
  });
  // PAGINATION
  // ------------------------------
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;
  let dataGridRef = React.useRef();

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-:::::::::::::::::::::::::::::::::

  const hideFilter = () => {
    let form = document.getElementById("FormFilter");
    if (viewFilter) {
      setViewFilter(false);
      form.classList.add('hidden');
    } else {
      form.classList.remove('hidden');
      setViewFilter(true);
    }
  };

  async function cargarCombos() {
    setLoading(true);
    try {
      let [tmp_campamentos, tmp_tipomodulos, tmp_tipoHabitaciones] = await Promise.all([
        listarCampamentos({ IdDivision }),
        listarModulos({ idCliente: IdCliente, idDivision: IdDivision }),
        listarHabitaciones({ idCliente: IdCliente, idDivision: IdDivision })
      ]);

      if (tmp_campamentos.length > 0) {
        tmp_campamentos.unshift({ IdCampamento: "", Campamento: "-- Todos --" });
        setCampamentos(tmp_campamentos);
      }
      if (tmp_tipoHabitaciones.length > 0) {
        tmp_tipoHabitaciones.unshift({ IdTipoHabitacion: "", TipoHabitacion: "-- Todos --" });
        setTipoModulos(tmp_tipomodulos);
      }
      if (tmp_tipomodulos.length > 0) {
        tmp_tipomodulos.unshift({ IdTipoModulo: "", TipoModulo: "-- Todos --" });
        setTipoHabitaciones(tmp_tipoHabitaciones);
      }

      setFilterData({ ...filterData, FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd'), FechaFin: dateFormat(FechaFin, 'yyyyMMdd') });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    };
  }

  const editarRegistro = evt => {
    evt.cancel = true;
    props.editarRegistro(evt.row.data);
  };

  const checkin = evt => {
    evt.cancel = true;
    props.checkIn(evt.row.data);
  };

  const checkout = evt => {
    evt.cancel = true;
    props.checkOut(evt.row.data);
  };

  const detail = evt => {
    evt.cancel = true;
    props.detail(evt.row.data);
  }

  const eliminarRegistro = evt => {
    evt.cancel = true;
    const { FlagCheckin } = evt.row.data;
    if (FlagCheckin === 'S') {
      handleInfoMessages(intl.formatMessage({ id: "CAMP.RESERVATION.ALERT.DELETE" }));
      return
    }
    props.eliminarRegistro(evt.row.data);

  };

  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  }

  const seleccionarRegistroDblClick = evt => {
    if (isNotEmpty(evt.data)) {
      props.verRegistroDblClick(evt.data);
    };
  }

  const obtenerCampoActivo = rowData => {

    //console.log({ rowData });
    // if (rowData.Estado === "A") return "Activo";
    // if (rowData.Estado === "I") return "Inactivo";
    // if (rowData.Estado === "P") return "Pendiente";
    if (rowData.data.Estado === "I" && rowData.data.EstadoCama === "O") {
      return (<div className="estado_item_general_celda estado_item_finalizado">FINALIZADO</div>);
    }
    if (rowData.data.EstadoCama === "O") {
      return (<div className="estado_item_general_celda estado_item_ocupado">OCUPADO</div>);
    }
    if (rowData.data.EstadoCama === "F") {
      return (<div className="estado_item_general_celda estado_item_finalizado">FINALIZADO</div>);
    };
    if (rowData.data.EstadoCama === "R") {
      return (<div className="estado_item_general_celda estado_item_reservado">RESERVADO</div>);
    };

    return "";
  };

  const selectCompania = dataPopup => {

    const { IdCompania, Compania } = dataPopup[0];
    setDataRowEditNew({ ...dataRowEditNew, IdCompania, Compania });
    setPopupVisibleCompania(false);
  };

  const selectModulo = dataPopup => {
    const { IdModulo, Modulo } = dataPopup[0];
    setDataRowEditNew({ ...dataRowEditNew, IdModulo, Modulo });
    setPopupVisibleModulo(false);
  };

  const selectHabitacion = dataPopup => {
    const { IdHabitacion, Habitacion } = dataPopup[0];
    setDataRowEditNew({ ...dataRowEditNew, IdHabitacion, Habitacion });
    setPopupVisibleHabitacion(false);
  };

  const selectPersonas = (data) => {
    if (isNotEmpty(data)) {
      let strPersonas = data.split('|').join(',');
      setDataRowEditNew({ ...dataRowEditNew, Personas: strPersonas });
    }

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
  }


  // const [filterExport, setfilterExport] = useState({
  //   ...initialFilter, IdCliente,
  //   IdPerfil,
  //   IdDivisionPerfil,
  //   IdDivision: isNotEmpty(IdDivision) ? IdDivision : ""
  // });

  const filtrar = async (e) => {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      let filtro = {
        IdCliente: IdCliente,
        IdDivision: isNotEmpty(IdDivision) ? IdDivision : "",
        IdCampamento: isNotEmpty(dataRowEditNew.IdCampamento) ? dataRowEditNew.IdCampamento : "",
        IdCompania: isNotEmpty(dataRowEditNew.IdCompania) ? dataRowEditNew.IdCompania : "",
        IdTipoModulo: isNotEmpty(dataRowEditNew.IdTipoModulo) ? dataRowEditNew.IdTipoModulo : "",
        IdModulo: isNotEmpty(dataRowEditNew.IdModulo) ? dataRowEditNew.IdModulo : "",
        IdTipoHabitacion: isNotEmpty(dataRowEditNew.IdTipoHabitacion) ? dataRowEditNew.IdTipoHabitacion : "",
        IdHabitacion: isNotEmpty(dataRowEditNew.IdHabitacion) ? dataRowEditNew.IdHabitacion : "",
        Personas: isNotEmpty(dataRowEditNew.Personas) ? dataRowEditNew.Personas : "",
        FechaInicio: dateFormat(dataRowEditNew.FechaInicio, 'yyyyMMdd'),
        FechaFin: dateFormat(dataRowEditNew.FechaFin, 'yyyyMMdd')
      }
      filtrarReporte(filtro);
    }
  };

  const filtrarReporte = (filtro) => {
    const {
      IdCliente,
      IdDivision,
      IdCampamento,
      IdCompania,
      IdTipoModulo,
      IdModulo,
      IdTipoHabitacion,
      IdHabitacion,
      Personas,
      FechaInicio,
      FechaFin
    } = filtro;
    //comunicarnos con customerDataGrid.
    props.dataSource.loadDataWithFilter({
      data: {
        IdCliente,
        IdDivision,
        IdCampamento,
        IdCompania,
        IdTipoModulo,
        IdModulo,
        IdTipoHabitacion,
        IdHabitacion,
        Personas,
        FechaInicio,
        FechaFin
      }
    });

  };

  const eventRefresh = () => {
    setDataRowEditNew({
      IdCliente: '',
      IdDivision: '',
      IdCampamento: '',
      IdCompania: '',
      IdTipoModulo: '',
      IdModulo: '',
      IdTipoHabitacion: '',
      IdHabitacion: '',
      Personas: '',
      FechaInicio,
      FechaFin
    });
    props.resetLoadOptions();
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

  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter = [
    'IdCliente',
    'IdDivision',
    'IdCampamento',
    'IdCompania',
    'IdTipoModulo',
    'IdModulo',
    'IdTipoHabitacion',
    'IdHabitacion',
    'Personas',
    'FechaInicio',
    'FechaFin'
  ];

  const isVisibleEdit = e => e.row.data.FlagCheckout === 'N';
  const isVisibleDelete = e => e.row.data.FlagCheckout === 'N';
  const isCheckinVisible = e => e.row.data.FlagCheckin === 'N';
  const isCheckoutVisible = e => e.row.data.FlagCheckin === 'S' && e.row.data.FlagCheckout === 'N';
  const isDetailVisible = e => e.row.data.Estado === 'I';

  const renderDataGrid = ({ gridRef, dataSource }) => {
    if (dataSource._storeLoadOptions.filter !== undefined) {
      if (props.totalRowIndex === 0) {
        props.setTotalRowIndex(dataSource._totalCount);
      }
      if (dataSource._totalCount != props.totalRowIndex) {
        if (dataSource._totalCount !== -1) {
          props.setVarIdReserva("")
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
        remoteOperations={true}
        //filterValue={filterValue}
        onEditingStart={editarRegistro}
        onRowRemoving={eliminarRegistro}
        //onRowClick={seleccionarRegistro}
        onFocusedRowChanged={seleccionarRegistro}
        onRowDblClick={seleccionarRegistroDblClick}
        onCellPrepared={onCellPrepared}
        focusedRowEnabled={true}
        focusedRowKey={focusedRowKey}
        repaintChangesOnly={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
        scrolling={{ showScrollbar: 'always' }}
        className="tablaScrollHorizontal"
      //onOptionChanged={onOptionChanged}
      >
        <Editing mode="row"
          useIcons={props.showButtons}
          allowUpdating={props.showButtons}
          allowDeleting={props.showButtons}
          texts={textEditing} />
        <Column
          dataType="String"
          dataField="RowIndex"
          caption="#"
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          width="40px"
          alignment={"center"} />
        <Column
          dataType="String"
          dataField="IdReserva"
          caption={intl.formatMessage({ id: "COMMON.CODE" })}
          allowSorting={true}
          alignment={"center"}
          width="90px"
        />
        <Column
          dataType="String" dataField="Documento"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}
          allowHeaderFiltering={false}
          allowSorting={true}
          width="100px"
          alignment={"center"} />

        <Column
          dataType="String"
          dataField="NombreCompleto"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
          allowSorting={true}
          width="250px"
        />
        <Column
          dataType="String" dataField="CompaniaContratista"
          caption={intl.formatMessage({ id: "ACCREDITATION.REPORT.COMPANY" })}
          width="250px"
        />
        <Column
          dataType="String" dataField="CompaniaContratistaSubContratista"
          caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBCONTRACTOR" })}
          width="250px"
        />
        <Column
          dataType="String" dataField="Campamento"
          caption={intl.formatMessage({ id: "CAMP.PROFILE.DETAIL.CAMP" })}
          width="200px"
        />
        <Column
          dataType="String" dataField="Modulo"
          caption={intl.formatMessage({ id: "CAMP.PROFILE.DETAIL.MODULE" })}
          width="100px"
        />
        <Column
          dataType="String" dataField="Habitacion"
          caption={intl.formatMessage({ id: "CAMP.PROFILE.DETAIL.ROOM" })}
          width="100px"
        />
        <Column
          dataType="String" dataField="Cama"
          caption={intl.formatMessage({ id: "CAMP.PROFILE.DETAIL.BED" })}
          width="100px"
        />

        <Column
          dataType="String"
          dataField="FechaInicioReserva"
          caption={intl.formatMessage({ id: "COMMON.STARTDATE.SHORT" })}
          width="100px"
          alignment={"center"}
        />
        <Column
          dataType="String" dataField="FechaFinReserva"
          caption={intl.formatMessage({ id: "COMMON.ENDDATE.SHORT" })}
          width="100px"
          alignment={"center"}
        />
        <Column
          dataType="String"
          dataField="FechaCheckinFormateada"
          caption={`${intl.formatMessage({ id: "CASINO.PERSON.GROUP.DATE" })} ${intl.formatMessage({ id: "CAMP.CAMP.CHECKIN" })}`}
          width="110px"
          alignment={"center"}
        />
        <Column
          dataType="String"
          dataField="FechaCheckoutFormateada"
          caption={`${intl.formatMessage({ id: "CASINO.PERSON.GROUP.DATE" })} ${intl.formatMessage({ id: "CAMP.CAMP.CHECKOUT" })}`}
          width="110px"
          alignment={"center"}
        />
        <Column
          dataType="String" dataField="EstadoCama"
          caption={intl.formatMessage({ id: "COMMON.STATE" })}
          cellRender={obtenerCampoActivo}
          width="100px"
        />
        <Column
          type="buttons"
          width="100px"
        >
          <ColumnButton hint={intl.formatMessage({ id: "CAMP.CAMP.CHECKIN" })} icon="fas fa-person-booth" visible={isCheckinVisible} onClick={checkin} />
          <ColumnButton hint={intl.formatMessage({ id: "CAMP.CAMP.CHECKOUT" })} icon="fas fa-hiking" visible={isCheckoutVisible} onClick={checkout} />
          <ColumnButton hint={intl.formatMessage({ id: "COMMON.DETAIL" })} icon="fas fa-eye" visible={isDetailVisible} onClick={detail} />
          <ColumnButton name="edit" icon="edit" visible={isVisibleEdit} onClick={editarRegistro} />
          <ColumnButton name="delete" icon="trash" visible={isVisibleDelete} onClick={eliminarRegistro} />
        </Column>
      </DataGrid>
    );
  }

  return (
    <>
      <PortletHeader
        title={intl.formatMessage({ id: "ACTION.LIST" })}
        toolbar={
          <PortletHeaderToolbar>
            <Button icon={viewFilter ? "chevronup" : "chevrondown"}
              type="default"
              hint={viewFilter ? intl.formatMessage({ id: "COMMON.HIDE" }) : intl.formatMessage({ id: "COMMON.SHOW" })}
              onClick={hideFilter} />
            &nbsp;
            <Button
              icon="fa fa-plus"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.ADD" })}
              onClick={() => props.setModoEdicion(true)}
            />&nbsp;
            <Button
              icon="fa fa-search"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.FILTER" })}
              onClick={filtrar}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
            />

            &nbsp;
            <Button icon="refresh"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
              onClick={eventRefresh} />
          </PortletHeaderToolbar>
        }
      />
      <PortletBody>
        <div className="pb-4">
          <Form id="FormFilter" formData={dataRowEditNew} validationGroup="FormEdicion">
            <GroupItem itemType="group" colCount={3} colSpan={3}>
              <Item
                dataField="FechaInicio"
                label={{
                  text: intl.formatMessage({ id: "CAMP.RESERVATION.STARTDATE_FROM" })
                }}
                isRequired={true}
                editorType="dxDateBox"
                dataType="datetime"
                editorOptions={{
                  inputAttr: { style: "text-transform: uppercase" },
                  displayFormat: "dd/MM/yyyy",
                  onValueChanged: e => setDataRowEditNew({ ...dataRowEditNew, FechaInicio: e.value })
                }}
              />

              <Item
                dataField="FechaFin"
                label={{
                  text: intl.formatMessage({ id: "CAMP.RESERVATION.STARTDATE_TO" })
                }}
                isRequired={true}
                editorType="dxDateBox"
                dataType="datetime"
                editorOptions={{
                  min: dataRowEditNew.FechaInicio,
                  inputAttr: { style: "text-transform: uppercase" },
                  displayFormat: "dd/MM/yyyy",
                }}
              />
            </GroupItem>
            <GroupItem itemType="group" colCount={2} colSpan={2}>
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
                }}
              />

              <Item
                dataField="IdTipoModulo"
                label={{
                  text: intl.formatMessage({ id: "CAMP.RESERVATION.MODULETYPE" })
                }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: tipoModulos,
                  valueExpr: "IdTipoModulo",
                  displayExpr: "TipoModulo",
                }}
              />

              <Item
                dataField="Modulo"
                label={{ text: intl.formatMessage({ id: "CAMP.RESERVATION.MODULE" }) }}
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
                          setPopupVisibleModulo(true);
                        }
                      }
                    }
                  ]
                }}
              />

              <Item
                dataField="IdTipoHabitacion"
                label={{
                  text: intl.formatMessage({ id: "CAMP.RESERVATION.ROOMTYPE" })
                }}
                editorType="dxSelectBox"
                isRequired={false}
                editorOptions={{
                  items: tipoHabitaciones,
                  valueExpr: "IdTipoHabitacion",
                  displayExpr: "TipoHabitacion"
                }}
              />

              <Item
                dataField="Habitacion"
                label={{ text: intl.formatMessage({ id: "CAMP.RESERVATION.ROOM" }) }}
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
                          setPopupVisibleHabitacion(true);
                        }
                      }
                    }
                  ]
                }}
              />
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
                  }]
                }}
              />
              <Item dataField="Personas"
                label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.PERSONS" }) }}
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
                        setPopupVisiblePersonas(true);
                      },
                    }
                  }]
                }} />
            </GroupItem>
          </Form>
        </div>
        {/* <CustomDataGrid {...propsCustomDataGrid} />*/}
        <CustomDataGrid
         showLog={false} 
          uniqueId={props.uniqueId} //'personaList'
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
          initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'IdReserva', order: 'asc' } }}
          filterRowSize='sm'
          summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}
          // CUSTOM FILTER
          //cssClassAppBar={classesEncabezado.secundario}
          //cssClassToolbar={classesEncabezado.toolbar}
          //renderFormTitleCustomFilter={renderFormTitleCustomFilter}
          //titleCustomFilter='Datos a consultar'
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

        {
          popupVisibleModulo && (
            <CampamentoModuloBuscar
              selectData={selectModulo}
              showPopup={{ isVisiblePopUp: popupVisibleModulo, setisVisiblePopUp: setPopupVisibleModulo }}
              cancelarEdicion={() => setPopupVisibleModulo(false)}
              uniqueId="moduloBuscarList"
              idDivision={IdDivision}
              dataRowEditNew={dataRowEditNew}
            />
          )
        }

        {
          popupVisibleHabitacion && (
            <CampamentoHabitacionBuscar
              selectData={selectHabitacion}
              showPopup={{ isVisiblePopUp: popupVisibleHabitacion, setisVisiblePopUp: setPopupVisibleHabitacion }}
              cancelarEdicion={() => setPopupVisibleHabitacion(false)}
              uniqueId="habitacionBuscarList"
              idDivision={IdDivision}
              dataRowEditNew={dataRowEditNew}
            />
          )
        }

        {/*******>POPUP DE COMPANIAS>******** */}
        <AdministracionCompaniaBuscar
          selectData={selectCompania}
          showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
          cancelarEdicion={() => setPopupVisibleCompania(false)}
          // selectionMode="multiple"
          uniqueId={"administracionCompaniaBuscar"}

        />

        <PersonaTextAreaPopup
          isVisiblePopupDetalle={popupVisiblePersonas}
          setIsVisiblePopupDetalle={setPopupVisiblePersonas}
          obtenerNumeroDocumento={selectPersonas}
        // datosReservaDetalle={datosReservaDetalle}
        />
      </PortletBody>
    </>
  );
};
ReservaFiltrarListPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string,
}
ReservaFiltrarListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  showHeaderInformation: false,
  uniqueId: 'campamentoReservaList',
}
export default injectIntl(WithLoandingPanel(ReservaFiltrarListPage));
