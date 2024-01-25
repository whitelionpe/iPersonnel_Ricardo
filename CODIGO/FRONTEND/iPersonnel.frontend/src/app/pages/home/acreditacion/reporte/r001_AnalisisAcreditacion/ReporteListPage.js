import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { Item, GroupItem } from "devextreme-react/form";
import {
  DataGrid,
  Column,
  Editing,
  FilterRow,
  HeaderFilter,
  FilterPanel,

} from "devextreme-react/data-grid";

import { DoubleLinePersona as DoubleLineLabel } from "../../../../../partials/content/Grid/DoubleLineLabel";

import {
  isNotEmpty, listarEstado, listarEstadoAprobacion, STATUS_ACREDITACION_SOLICITUD
  ,getFirstDayAndCurrentlyMonthOfYear
} from "../../../../../../_metronic";
import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";

import { storeReportes as loadUrl } from "../../../../../api/acreditacion/reporte.api";
import { initialFilter } from "./ReporteIndexPage";
//import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { obtenerTodos as obtenerTodosTipoPosicion } from "../../../../../api/administracion/tipoPosicion.api";
import { service } from "../../../../../api/acreditacion/perfil.api";

import AdministracionUnidadOrganizativaBuscar from "../../../../../partials/components/AdministracionUnidadOrganizativaBuscar";
import AdministracionPosicionBuscar from "../../../../../partials/components/AdministracionPosicionBuscar";
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";
import PersonaTextAreaPopup from '../../../../../partials/components/PersonaTextAreaPopup/PersonaTextAreaPopup';
import AdministracionContratoBuscar from "../../../../../partials/components/AdministracionContratoBuscar";

import { convertCustomDateTimeString, convertStringToDate } from "../../../../../partials/components/CustomFilter";

const ReporteListPage = props => {
  const { intl, focusedRowKey } = props;
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  const IdDivisionPerfil = useSelector(state => state.perfil.perfilActual.IdDivision);
  const { FechaInicio, FechaFin } = getFirstDayAndCurrentlyMonthOfYear();

  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const [isVisiblePopUpCompaniaContratista, setisVisiblePopUpCompaniaContratista] = useState(false);
  const [popupVisiblePosicion, setPopupVisiblePosicion] = useState(false);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const [popupVisiblePersonas, setPopupVisiblePersonas] = useState(false);
  const [popupVisibleContrato, setPopupVisibleContrato] = useState(false);

  const [tipoPosiciones, setTipoPosiciones] = useState([]);
  const [estado, setEstado] = useState([]);
  const [perfil, setPerfil] = useState([]);
  //const [companiaContratista, setCompaniaContratista] = useState("");
  const [estadosAprobacion, setEstadosAprobacion] = useState([]);

  const { IdDivision } = props.selected;

  //Variables de CustomerDataGrid
  // const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({
    ...initialFilter, IdCliente,
    IdDivisionPerfil,
    IdDivision: isNotEmpty(IdDivision) ? IdDivision : "",
    FechaInicio,
    FechaFin,
  });
  // PAGINATION
  // ------------------------------
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  //  const resetLoadOptions = props.resetLoadOptions;

  //const [withTitleVisible, setWithTitleVisible] = useState(false);

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-:::::::::::::::::::::::::::::::::

  async function cargarCombos() {
    let dataEstados = listarEstadoAprobacion();
    let estado = listarEstado();

    // let perfil = listarCondicion();
    let perfil = await service.obtenerTodos({ IdCliente });

    await obtenerTodosTipoPosicion({ IdCliente }).then(tipoPosiciones => {
      setTipoPosiciones(tipoPosiciones);
    });
    setEstadosAprobacion(dataEstados);
    setPerfil(perfil);
    setEstado(estado);
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
  }

  const seleccionarRegistroDblClick = evt => {
    if (isNotEmpty(evt.data)) {
      props.verRegistroDblClick(evt.data);
    };
  }


  const selectCompania = dataPopup => {
    const { IdCompania, Compania } = dataPopup[0];
    // console.log("selectCompania|dataPopup[0]",dataPopup[0]);
    props.dataSource.loadDataWithFilter({ data: { IdCompaniaMandante: IdCompania, CompaniaMandante: Compania } })
    setPopupVisibleCompania(false);
  }

  const selectCompaniaContratista = (contratista) => {
    const { IdCompania, Compania } = contratista[0];
    props.dataSource.loadDataWithFilter({ data: { IdCompaniaContratista: IdCompania, CompaniaContratista: Compania } })
  }

  const selectUnidadOrganizativa = async (selectedRow) => {
    let strUnidadesOrganizativas = selectedRow.map(x => x.IdUnidadOrganizativa).join('|');
    let UnidadesOrganizativasDescripcion = selectedRow.map(x => x.Menu).join(',');
    props.dataSource.loadDataWithFilter({ data: { UnidadesOrganizativas: strUnidadesOrganizativas, UnidadesOrganizativasDescripcion } });
    setPopupVisibleUnidad(false);
  };

  const selectPosicion = async (dataPopup) => {

    const { IdPosicion, Posicion } = dataPopup[0];
    props.dataSource.loadDataWithFilter({ data: { IdPosicion, Posicion } });
    setPopupVisiblePosicion(false);
  }

  const selectPersonas = (data) => {
    //console.log("selectPersonas", data, IdTipoDocumento);
    if (isNotEmpty(data)) {
      let strPersonas = data.split('|').join(',');
      //console.log(strPersonas);
      props.dataSource.loadDataWithFilter({ data: { Personas: strPersonas } });
    }
  }


  const agregarContrato = (contrato) => {
    const { IdContrato, Contrato } = contrato[0];
    if (isNotEmpty(IdContrato)) {
      props.dataSource.loadDataWithFilter({ data: { IdContrato: IdContrato, Contrato: Contrato } });
    }
  };


  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }



  const cellEstadoRender = (e) => {
    let estado = e.data.EstadoAprobacion;
    let css = '';
    let estado_txt = "";
    if (e.data.EstadoAprobacion.trim() === "") {
      estado = "I";
    }

    switch (estado) {
      case STATUS_ACREDITACION_SOLICITUD.INCOMPLETA: css = 'estado_item_incompleto'; estado_txt = intl.formatMessage({ id: "COMMON.INCOMPLETE" }).toUpperCase(); break;
      case STATUS_ACREDITACION_SOLICITUD.PENDIENTE: css = 'estado_item_pendiente'; estado_txt = intl.formatMessage({ id: "COMMON.EARRING" }).toUpperCase(); break;
      case STATUS_ACREDITACION_SOLICITUD.OBSERVADO: css = 'estado_item_observado'; estado_txt = intl.formatMessage({ id: "COMMON.OBSERVED" }).toUpperCase(); break;
      case STATUS_ACREDITACION_SOLICITUD.RECHAZADO: css = 'estado_item_rechazado'; estado_txt = intl.formatMessage({ id: "COMMON.REJECTED" }).toUpperCase(); break;
      case STATUS_ACREDITACION_SOLICITUD.APROBADO: css = 'estado_item_aprobado'; estado_txt = intl.formatMessage({ id: "COMMON.APPROVED" }).toUpperCase(); break;
    };


    return (css === '') ?
      <div className={"estado_item_general"}>{estado_txt}</div>
      : <div className={`estado_item_general  ${css}`}   >{estado_txt}</div>
  }


  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
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

  useEffect(() => {
    if (IdDivision) {
      props.dataSource.loadDataWithFilter({ data: { IdDivision } });
    }
  }, [IdDivision]);

  const transformData = {
    FechaInicio: (rawValue) => convertCustomDateTimeString(rawValue),
    FechaFin: (rawValue) => convertCustomDateTimeString(rawValue),
  }
  const reverseTransformData = {
    FechaInicio: (value) => convertStringToDate(value),
    FechaFin: (value) => convertStringToDate(value),
  }


  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter =
    [
      'IdCliente',
      'IdDivision',
      'IdCompaniaContratista',
      'IdSolicitud',
      'Documento',
      'NombreCompleto',
      'EstadoAprobacion',
      'IdCompaniaMandante',
      'IdContrato',
      'EsSubContratista',
      'EstadoSolicitud',
      'IdPerfil',
      'IdUnidadOrganizativa',
      'UnidadesOrganizativas',
      'Personas',
      'Procesado',
      'FechaInicio',
      'FechaFin'
    ];

  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem>
        <GroupItem itemType="group" colCount={2} colSpan={2}>
          <Item dataField="IdCompania" visible={false} />
          <Item dataField="IdUnidadOrganizativa" visible={false} />
          <Item dataField="IdPosicion" visible={false} />
          <Item dataField="IdCompaniaContratista" visible={false} />

          <Item
            dataField="Procesado"
            label={{ text: intl.formatMessage({ id: "ACCREDITATION.MANAGEMENT.PROCESS" }) }}
            editorType="dxSelectBox"
            visible={false}
            editorOptions={{
              items: estado,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              showClearButton: true,
              onValueChanged: () => getInstance().filter(),
            }}
          />

          <Item
            dataField="CompaniaMandante"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CLIENTCOMPANY" }) }}
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
            dataField="CompaniaContratista"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACTORCOMPANY" }), }}
            visible={false}
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
                      setisVisiblePopUpCompaniaContratista(true);
                    },
                  },
                },
              ],
            }}
          />

          <Item
            dataField="IdContrato"
            colSpan={1}
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" }) }}
            isRequired={false}
            visible={false}
            editorOptions={{
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
                  onClick: (evt) => {
                    setPopupVisibleContrato(true);
                  },
                }
              }]
            }}
          />

          <Item dataField="IdPerfil"
            label={{ text: intl.formatMessage({ id: "ACCREDITATION.MANAGEMENT.PROFILE" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: perfil,
              valueExpr: "IdPerfil",
              displayExpr: "Perfil",
              showClearButton: true,
              onValueChanged: () => getInstance().filter(),
            }}
          />

          <Item
            dataField="UnidadesOrganizativasDescripcion"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.ORGANIZATIONALUNIT" }) }}
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
            dataField="EstadoAprobacion"
            label={{ text: intl.formatMessage({ id: "ACCREDITATION.MANAGEMENT.STATUS" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: estadosAprobacion,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              showClearButton: true,
              onValueChanged: () => getInstance().filter(),
            }}
          />

          <Item dataField="Personas"
            label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.PERSONS" }) }}
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
                    setPopupVisiblePersonas(true);
                  },
                }
              }]
            }}
          />

          <Item
            dataField="FechaInicio"
            label={{
              text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" }),
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
    // console.log("renderDataGrid|gridRef:",gridRef);
    props.setDataGridRef(gridRef)

    return (
      <>
        <DataGrid
          dataSource={dataSource}
          ref={gridRef}
          onEditingStart={editarRegistro}
          onRowRemoving={eliminarRegistro}
          onFocusedRowChanged={seleccionarRegistro}
          onRowDblClick={seleccionarRegistroDblClick}
          onCellPrepared={onCellPrepared}
          focusedRowEnabled={true}
          focusedRowKey={focusedRowKey}
          allowColumnReordering={true}
          allowColumnResizing={true}
          columnAutoWidth={true}
        >
          <Editing mode="row"
            useIcons={props.showButtons}
            allowUpdating={props.showButtons}
            allowDeleting={props.showButtons}
            texts={textEditing} />
          <FilterRow visible={true} showOperationChooser={false} />
          <HeaderFilter visible={false} />
          <FilterPanel visible={false} />

          {/* <Column
            dataField=""
            width={"5%"}
            alignment="center"
            cellRender={cellRenderColorTiempoCredencial}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
        />  */}

          <Column
            dataField="RowIndex"
            caption="#"
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"5%"}
            alignment={"center"}
            visible={false}
          />

          <Column
            dataField="IdSolicitud"
            caption={intl.formatMessage({ id: "Solicitud" })}
            allowSorting={true}
            allowHeaderFiltering={false}
            alignment={"center"}
            width={"10%"}
          />
          <Column dataField="CompaniaContratista"
            caption={intl.formatMessage({ id: "Contratista" })}
            allowHeaderFiltering={false}
            allowSorting={true}
            width={"10%"}
            alignment={"center"}
          />
          <Column
            dataField="FechaSolicitud"
            caption={intl.formatMessage({ id: "Fecha Solicitud" })}
            dataType="date"
            format="dd/MM/yyyy"
            alignment={"center"}
            allowHeaderFiltering={false}
            allowFiltering={false}
          />

          <Column
            dataField="TipoDocumento"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE.DOCU" })}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={true}
            alignment={"center"}
            width={"8%"}
          />
          <Column dataField="Documento"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}
            allowHeaderFiltering={false}
            width={"10%"}
            alignment={"center"}
          />
          <Column
            dataField="NombreCompleto"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
            cellRender={DoubleLineLabel}
            allowSorting={true}
            allowHeaderFiltering={false}
            width={"20%"}
          />
          <Column
            dataField="FechaInicio"
            caption={intl.formatMessage({ id: "COMMON.STARTDATE" })}
            dataType="date"
            format="dd/MM/yyyy"
            alignment={"center"}
            allowHeaderFiltering={false}
            allowFiltering={false}
          />
          <Column
            dataField="FechaFin"
            caption={intl.formatMessage({ id: "COMMON.ENDDATE" })}
            dataType="date"
            format="dd/MM/yyyy"
            alignment={"center"}
            allowHeaderFiltering={false}
            allowFiltering={false}
          />
          <Column
            dataField="Perfil"
            caption={intl.formatMessage({ id: "Perfil Acreditación" })}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={true}
            alignment={"center"}
            width={"15%"}
          >
          </Column>


          <Column
            dataField="EstadoAprobacion"
            caption={intl.formatMessage({ id: "COMMON.ACTIVE" })}
            width={"10%"}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={false}
            alignment={"center"}
            cellRender={cellEstadoRender}
          />


          <Column dataField="IdCompania" visible={false} />
          <Column dataField="IdGrupo" visible={false} />
          <Column dataField="IdTipoTrabajador" visible={false} />
          <Column dataField="IdCargo" visible={false} />
          <Column dataField="IdUbigeoResidencia" visible={false} />
          <Column dataField="Activo" visible={false} />

          {/* <Column type="buttons" width={"3%"}>
            <ColumnButton
              icon="doc"
              hint={intl.formatMessage({ id: "ACCREDITATION.REQUEST" })}
              onClick={verSolicitud}
            />
          </Column> */}


        </DataGrid>
      </>
    );
  }

  return (
    <>
      {/* {props.showHeaderInformation && (
        <HeaderInformation
          visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
          toolbar={
            <PortletHeader
              title=""
              toolbar={
                <PortletHeaderToolbar>
                  <PortletHeaderToolbar>

                    <Button icon="fa fa-plus"
                      type="default"
                      hint={intl.formatMessage({ id: "ACTION.NEW" })}
                      visible={props.showButtons}
                      onClick={props.nuevoRegistro}
                      disabled={customDataGridIsBusy}
                    />
                                 &nbsp;
                      <Button
                      icon="fa fa-search"
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
                      onClick={resetLoadOptions} />
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
          } />
      )} */}


      {/* {!props.showHeaderInformation && (
        <PortletHeader
          title={intl.formatMessage({ id: "ACTION.LIST" })}
          toolbar={
            <PortletHeaderToolbar>
              <Button icon="fa fa-plus"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.NEW" })}
                visible={props.showButtons}
                onClick={props.nuevoRegistro}
                disabled={customDataGridIsBusy}
              />
              &nbsp;
              <Button
                icon="fa fa-search"
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
              &nbsp;

            </PortletHeaderToolbar>
          }
        />)} */}


      {/* <PortletBody> */}
      <CustomDataGrid
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
        initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'NombreCompleto', order: 'asc' } }}
        filterRowSize='sm'
        summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}
        // CUSTOM FILTER
        //cssClassAppBar={classesEncabezado.secundario}
        //cssClassToolbar={classesEncabezado.toolbar}
        //renderFormTitleCustomFilter={renderFormTitleCustomFilter}
        //titleCustomFilter='Datos a consultar'
        // visibleCustomFilter={isActiveFilters}
        // renderFormContentCustomFilter={renderFormContentCustomFilter}
        transformData={transformData}
        reverseTransformData={reverseTransformData}
        keysToGenerateFilter={keysToGenerateFilter}
        filterData={filterData}
        // PAGINATION
        paginationSize='md'
        // EVENTS
        onLoading={() => setCustomDataGridIsBusy(true)}
        onError={() => setCustomDataGridIsBusy(false)}
        onLoaded={() => setCustomDataGridIsBusy(false)}
      />

      {/* <div className="dx-field-value-static">
          <p  style={{color:"blue"}}>
          <span id="subject2"></span>
          <RemoveFromQueue/>
          <a
          id="link2"
          style={{color:"blue"}}
          onMouseEnter={() => setWithTitleVisible(!withTitleVisible)}
          onMouseLeave={() => setWithTitleVisible(!withTitleVisible)}
          > {intl.formatMessage({ id: "ACCREDITATION.LEGEND" })}
          </a>

          </p>
          <Popover
          target="#link2"
          position="top"
          width={300}
          showTitle={true}
          title={intl.formatMessage({ id: "ACCREDITATION.LEGEND.TITLE" })}
          visible={withTitleVisible}
          >
          {leyendaGrid()}
          </Popover>
        </div> */}

      {/*******>POPUP DE COMPANIAS>******** */}
      <AdministracionCompaniaBuscar
        selectData={selectCompania}
        showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
        cancelarEdicion={() => setPopupVisibleCompania(false)}
        uniqueId={"administracionCompaniaBuscar"}
        isContratista={"N"}
      />

      <AdministracionCompaniaBuscar
        selectData={selectCompaniaContratista}
        showPopup={{ isVisiblePopUp: isVisiblePopUpCompaniaContratista, setisVisiblePopUp: setisVisiblePopUpCompaniaContratista }}
        cancelarEdicion={() => setisVisiblePopUpCompaniaContratista(false)}
        uniqueId={"administracionCompaniaContratistaBuscar"}
        isContratista={"S"}

      />

      {/*******>POPUP DE UNIDAD ORGA.>******** */}
      <AdministracionUnidadOrganizativaBuscar
        selectData={selectUnidadOrganizativa}
        showPopup={{ isVisiblePopUp: popupVisibleUnidad, setisVisiblePopUp: setPopupVisibleUnidad }}
        cancelarEdicion={() => setPopupVisibleUnidad(false)}
        selectionMode={"multiple"}
        showCheckBoxesModes={"normal"}
      />

      {/*******>POPUP DE UNIDAD ORGA. CON POSICIONES>******** */}
      <AdministracionPosicionBuscar
        selectData={selectPosicion}
        showPopup={{ isVisiblePopUp: popupVisiblePosicion, setisVisiblePopUp: setPopupVisiblePosicion }}
        cancelarEdicion={() => setPopupVisiblePosicion(false)}
        uniqueId={"posionesBuscarPersonaList"}

      />

      <PersonaTextAreaPopup
        isVisiblePopupDetalle={popupVisiblePersonas}
        setIsVisiblePopupDetalle={setPopupVisiblePersonas}
        obtenerNumeroDocumento={selectPersonas}
      />

      {/*******>POPUP DE CONTRATO>****************************** */}
      <AdministracionContratoBuscar
        selectData={agregarContrato}
        showPopup={{ isVisiblePopUp: popupVisibleContrato, setisVisiblePopUp: setPopupVisibleContrato }}
        cancelar={() => setPopupVisibleContrato(false)}
      />



      {/* </PortletBody> */}
    </>
  );
};
ReporteListPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string,
  selected: PropTypes.object,

}
ReporteListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  showHeaderInformation: false,
  uniqueId: 'solicitudList',
  selected: { IdDivision: "" }
}

export default injectIntl(ReporteListPage);
