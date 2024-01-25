import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { Button } from "devextreme-react";
import { Item, GroupItem } from "devextreme-react/form";
import { DataGrid, Column, Editing, FilterRow, HeaderFilter, FilterPanel } from "devextreme-react/data-grid";
import { DoubleLinePersona as DoubleLineLabel } from "../../../../partials/content/Grid/DoubleLineLabel";
import { isNotEmpty, listarEstadoSimple, listarCondicion } from "../../../../../_metronic";
import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { storeListarHoraExtra as loadUrl } from "../../../../api/asistencia/persona.api";
import { initialFilter } from "./HoraExtraIndexPage";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import AdministracionUnidadOrganizativaBuscar from "../../../../partials/components/AdministracionUnidadOrganizativaBuscar";
import AdministracionPosicionesBuscar from "../../../../partials/components/AdministracionPosicionesBuscar";
import AdministracionCompaniaBuscar from "../../../../partials/components/AdministracionCompaniaBuscar";
import AsistenciaBuscarPersonaFilter from "../../../../partials/components/AsistenciaBuscarPersonaFilter";
//import PersonaTextAreaPopup from '../../../../partials/components/PersonaTextAreaPopup/PersonaTextAreaPopup';


const HoraExtraListPage = props => {
  const { intl, focusedRowKey } = props;
  const { IdCliente, IdPerfil } = useSelector(state => state.perfil.perfilActual);
  const IdDivisionPerfil = useSelector(state => state.perfil.perfilActual.IdDivision);

  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const [popupVisiblePosicion, setPopupVisiblePosicion] = useState(false);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const [popupVisiblePersonas, setPopupVisiblePersonas] = useState(false);
  //const [estadoSimple, setEstadoSimple] = useState([]);
  const { IdDivision } = props.selected;
  //Variables de CustomerDataGrid
  const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({
    ...initialFilter, IdCliente,
    IdPerfil,
    IdDivisionPerfil,
    IdDivision: isNotEmpty(IdDivision) ? IdDivision : ""
  });

  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;
  //const [isVisiblePopUpPersonas, setisVisiblePopUpPersonas] = useState(false);
  const [strPersonas, setStrPersonas] = useState("");


  /*   async function cargarCombos() {
      let estadoSimples = listarEstadoSimple();
      setEstadoSimple(estadoSimples);
    } */


  const editarRegistro = evt => {
    evt.cancel = true;
    props.editarRegistro(evt.data);
  };

  const eliminarRegistro = evt => {
    evt.cancel = true;
    props.eliminarRegistro(evt.data);
  };


//   const seleccionarRegistro = evt => {
//     if (evt.rowIndex === -1) return;
//     if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
// }


  const seleccionarRegistroDblClick = evt => {
    if (isNotEmpty(evt.data)) {
      props.verRegistroDblClick(evt.data);
    };
  }

  const selectCompania = dataPopup => {
    const { IdCompania, Compania } = dataPopup[0];
    props.dataSource.loadDataWithFilter({ data: { IdCompania, Compania } })
    setPopupVisibleCompania(false);
  }

  // const selectUnidadOrganizativa = async (dataPopup) => {
  //   debugger;
  //   const { IdUnidadOrganizativa, UnidadOrganizativa } = dataPopup;
  //   props.dataSource.loadDataWithFilter({ data: { IdUnidadOrganizativa, UnidadOrganizativa } });
  //   setPopupVisibleUnidad(false);
  // };

  const selectUnidadOrganizativa = async (selectedRow) => {
    let strUnidadesOrganizativas = selectedRow.map(x => x.IdUnidadOrganizativa).join('|');
    let UnidadesOrganizativasDescripcion = selectedRow.map(x => x.Menu).join(',');
    props.dataSource.loadDataWithFilter({ data: { UnidadesOrganizativas: strUnidadesOrganizativas, UnidadesOrganizativasDescripcion } });
    setPopupVisibleUnidad(false);
  };

  /*   const selectPosicion = async (dataPopup) => {
      const { IdPosicion, Posicion } = dataPopup[0];
      props.dataSource.loadDataWithFilter({ data: { IdPosicion, Posicion } });
      setPopupVisiblePosicion(false);
    } */


  const selectPosicion = async (selectedRow) => {
    let strPosiciones = selectedRow.map(x => x.IdPosicion).join('|');
    let Posicion = selectedRow.map(x => x.Posicion).join(',');
    props.dataSource.loadDataWithFilter({ data: { Posiciones: strPosiciones, Posicion } });
    setPopupVisiblePosicion(false);
  };

  /*   const selectPersonas = (data) => {
      //console.log("selectPersonas", data, IdTipoDocumento);
      if (isNotEmpty(data)) {
        let strPersonas = data.split('|').join(',');
        //console.log(strPersonas);
        props.dataSource.loadDataWithFilter({ data: { Personas: strPersonas } });
      }
    } */


  const selectPersonas = (personas) => {
    let arrayIdPersonas = [];
    personas.map(x => {
      arrayIdPersonas.push(x.IdPersona);
    })

    let strPersonas = arrayIdPersonas.join(',');
    setStrPersonas(strPersonas);
    props.dataSource.loadDataWithFilter({ data: { Personas: strPersonas } });
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


  /* async function generarFiltro(data) {
    const { FechaInicio, FechaFin } = data;
    if (isNotEmpty(FechaInicio) && isNotEmpty(FechaFin)) {
      let filtros = {
        FechaInicio,
        FechaFin,
      };
      //props.cargaListaPersonasRegimen(filtros);
    }
  } */

  const onBuscarFiltros = (e) => {
    let { FechaInicio, FechaFin } = props.dataFilter;

    let flF1 = FechaInicio instanceof Date && !isNaN(FechaInicio.valueOf()) && FechaInicio > new Date(1970, 1, 1);
    let flF2 = FechaFin instanceof Date && !isNaN(FechaFin.valueOf()) && FechaFin > new Date(1970, 1, 1);

    if (flF1 && flF2) {
      props.generarFiltro(props.dataFilter);
    }
  };

  useEffect(() => {
    //cargarCombos();
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


  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter = ['IdCliente', 'IdPersona', 'Personas', 'NombreCompleto', 'TipoDocumento', 'Documento',
    'IdCompania', 'IdUnidadOrganizativa', 'IdPosicion', 'IdDivision', 'Activo',
    'IdPerfil', 'IdDivisionPerfil', 'UnidadesOrganizativas', 'Posiciones'];
  //'Posicion','UnidadOrganizativa',




  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem>
        <GroupItem itemType="group" colCount={4} colSpan={4}>
          <Item dataField="IdCompania" visible={false} />
          <Item dataField="IdUnidadOrganizativa" visible={false} />
          <Item dataField="IdPosicion" visible={false} />
          <Item
            dataField="Compania"
            colSpan={2}
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
          <Item
            dataField="UnidadesOrganizativasDescripcion"
            colSpan={2}
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
            dataField="Posicion"
            colSpan={2}
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION" }) }}
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
                    setPopupVisiblePosicion(true);
                  },
                }
              }]
            }}
          />

          <Item dataField="Personas"
            colSpan={2}
            label={{ text: intl.formatMessage({ id: "Empleado" }) }}
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

          <Item
            dataField="FechaInicio"
            colSpan={1}
            label={{
              text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" }),
            }}
            //isRequired={true}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy",
              onKeyUp: (evt) => {
                if (evt.event.keyCode === 13) {
                  onBuscarFiltros(evt);
                }
              },
              onClosed: (evt) => {
                onBuscarFiltros(evt);
              },
            }}
          />

          <Item
            dataField="FechaFin"
            colSpan={1}
            label={{
              text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" }),
            }}
            //isRequired={true}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy",
              onKeyUp: (evt) => {
                if (evt.event.keyCode === 13) {
                  onBuscarFiltros(evt);
                }
              },
              onClosed: (evt) => {
                onBuscarFiltros(evt);
              },
            }}
          />

          <Item dataField="HoraExtra"
            colSpan={2}
            label={{
              text: "Check",
              visible: false
            }}
            editorType="dxCheckBox"
            editorOptions={{
              text: intl.formatMessage({ id: "Mostrar Horas Extras Totales por Día" }),
              width: "100%"
            }}
          />


          {/* <Item
            dataField="Activo"
            label={{ text: intl.formatMessage({ id: "COMMON.ACTIVE" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: estadoSimple,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              showClearButton: true,
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
        // onEditingStart={editarRegistro}
        // onRowRemoving={eliminarRegistro}
        // onFocusedRowChanged={seleccionarRegistro}
        // onRowDblClick={seleccionarRegistroDblClick}
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
        <Column
          dataField="RowIndex"
          caption="#"
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          width={"5%"}
          alignment={"center"} />
        <Column dataField="IdPersona"
          caption={intl.formatMessage({ id: "COMMON.CODE" })}
          allowHeaderFiltering={false}
          allowSorting={true}
          width={"10%"}
          alignment={"center"} />
        <Column
          dataField="NombreCompleto"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
          cellRender={DoubleLineLabel}
          allowSorting={true}
          allowHeaderFiltering={false}
          width={"30%"}

        />
        {/*     

        <Column dataField="Estado"
          //dataType="boolean"
          caption={intl.formatMessage({ id: "COMMON.ACTIVE" })}
          calculateCellValue={obtenerCampoActivo}
          //cellRender={StatusLabel}
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={false}
          width={"7%"}
        /> */}
        <Column dataField="IdCompania" visible={false} />
        {/*   <Column dataField="Activo" visible={false} /> */}


      </DataGrid>
    );
  }

  return (
    <>
      {props.showHeaderInformation && (
        <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
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
            <Button icon="refresh" //fa fa-broom
                type="default"
                hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                disabled={customDataGridIsBusy}
                onClick={resetLoadOptions} />
              &nbsp;

            </PortletHeaderToolbar>
          }
        />)}



      <PortletBody>
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
          initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'NombreCompleto', order: 'asc' } }}
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
        {/*******>POPUP DE COMPANIAS>******** */}
        <AdministracionCompaniaBuscar
          selectData={selectCompania}
          showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
          cancelarEdicion={() => setPopupVisibleCompania(false)}
          // selectionMode="multiple"
          isControlarAsistencia="S"
          uniqueId={"AsistenciaCompaniaBuscar"}

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
        <AdministracionPosicionesBuscar
          selectData={selectPosicion}
          showPopup={{ isVisiblePopUp: popupVisiblePosicion, setisVisiblePopUp: setPopupVisiblePosicion }}
          cancelarEdicion={() => setPopupVisiblePosicion(false)}
          //uniqueId={"posionesBuscarPersonaList"}
          selectionMode={"multiple"}

        />

        {/* <PersonaTextAreaPopup
          isVisiblePopupDetalle={popupVisiblePersonas}
          setIsVisiblePopupDetalle={setPopupVisiblePersonas}
          obtenerNumeroDocumento={selectPersonas}
        // datosReservaDetalle={datosReservaDetalle}
        /> */}

        {/* POPUP-> buscar persona */}
        <AsistenciaBuscarPersonaFilter
          showPopup={{ isVisiblePopUp: popupVisiblePersonas, setisVisiblePopUp: setPopupVisiblePersonas }}
          cancelar={() => setPopupVisiblePersonas(false)}
          agregar={selectPersonas}
          selectionMode={"multiple"}
          uniqueId={"PersonaJustificacionEditPage_"}
        //filtro={filtroLocal}
        />


      </PortletBody>
    </>
  );
};
HoraExtraListPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string,
  selected: PropTypes.object,

}
HoraExtraListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  showHeaderInformation: false,
  uniqueId: 'personaAsistenciaList',
  selected: { IdDivision: "" }
}

export default injectIntl(HoraExtraListPage);
