import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { Button } from "devextreme-react";
import { Item, GroupItem } from "devextreme-react/form";
import { DataGrid, Column, Editing, FilterRow, HeaderFilter, FilterPanel } from "devextreme-react/data-grid";
import { DoubleLinePersona as DoubleLineLabel, PersonaCondicionLabel } from "../../../../../partials/content/Grid/DoubleLineLabel";

import { isNotEmpty, listarEstadoSimple, listarCondicion, PersonaCondicion } from "../../../../../../_metronic";
import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";

import { storeListar as loadUrl } from "../../../../../api/administracion/persona.api";
import { initialFilter } from "./ReporteMovimientoIndexPage";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { obtenerTodos as obtenerTodosTipoPosicion } from "../../../../../api/administracion/tipoPosicion.api";

import AdministracionUnidadOrganizativaBuscar from "../../../../../partials/components/AdministracionUnidadOrganizativaBuscar";
import AdministracionPosicionBuscar from "../../../../../partials/components/AdministracionPosicionBuscar";
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";
import PersonaTextAreaPopup from '../../../../../partials/components/PersonaTextAreaPopup/PersonaTextAreaPopup';
import { stubFalse } from "lodash-es";

const ReporteMovimientoListPage = props => {
  const { intl, focusedRowKey } = props;
  const { IdCliente, IdPerfil } = useSelector(state => state.perfil.perfilActual);
  const IdDivisionPerfil = useSelector(state => state.perfil.perfilActual.IdDivision);

  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const [popupVisiblePosicion, setPopupVisiblePosicion] = useState(false);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const [popupVisiblePersonas, setPopupVisiblePersonas] = useState(false);

  const [tipoPosiciones, setTipoPosiciones] = useState([]);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [condicion, setCondicion] = useState([]);

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
  // PAGINATION
  // ------------------------------
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-:::::::::::::::::::::::::::::::::

  async function cargarCombos() {

    let estadoSimples = listarEstadoSimple();
    let condicion = listarCondicion();
    await obtenerTodosTipoPosicion({ IdCliente }).then(tipoPosiciones => {
      setTipoPosiciones(tipoPosiciones);
    });
    setEstadoSimple(estadoSimples);
    setCondicion(condicion);

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

  const obtenerCampoActivo = rowData => {    return rowData.Estado === "S";  };

  const selectCompania = dataPopup => {

    const { IdCompania, Compania } = dataPopup[0];
    props.dataSource.loadDataWithFilter({ data: { IdCompania, Compania } })
    setPopupVisibleCompania(false);
  }

  const selectUnidadOrganizativa = async (selectedRow) => {
  let strUnidadesOrganizativas = selectedRow.map(x => x.IdUnidadOrganizativa ).join('|');
  let UnidadesOrganizativasDescripcion = selectedRow.map(x => x.Menu).join(',');
   props.dataSource.loadDataWithFilter({ data: { UnidadesOrganizativas :strUnidadesOrganizativas,UnidadesOrganizativasDescripcion } });
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

  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter = ['IdCliente', 'IdCompania', 'Condicion', 'Personas', 'IdUnidadOrganizativa', 'UnidadOrganizativa', 'IdPosicion', 'Posicion', 'IdTipoPosicion',
    'IdPersona', 'NombreCompleto', 'TipoDocumento', 'Documento', 'Sexo', 'Edad', 'UbigeoNacimiento', 'IdDivision', 'Activo'
    , 'IdPerfil', 'IdDivisionPerfil','UnidadesOrganizativas'];

  // const renderFormContentCustomFilter = ({ getInstance }) => {
  //   return (
  //     <GroupItem>
  //       <GroupItem itemType="group" colCount={2} colSpan={2}>
  //         <Item dataField="IdCompania" visible={false} />
  //         <Item dataField="IdUnidadOrganizativa" visible={false} />
  //         <Item dataField="IdPosicion" visible={false} />
  //         <Item
  //           dataField="Compania"
  //           label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" }) }}
  //           editorOptions={{
  //             readOnly: true,
  //             hoverStateEnabled: false,
  //             inputAttr: { 'style': 'text-transform: uppercase' },
  //             showClearButton: true,
  //             buttons: [{
  //               name: 'search',
  //               location: 'after',
  //               useSubmitBehavior: true,
  //               options: {
  //                 stylingMode: 'text',
  //                 icon: 'search',
  //                 disabled: false,
  //                 onClick: () => {
  //                   setPopupVisibleCompania(true);
  //                 },
  //               }
  //             }]
  //           }}
  //         />
  //         <Item
  //           dataField="UnidadesOrganizativasDescripcion" 
  //           label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.ORGANIZATIONALUNIT" }) }}
  //           editorOptions={{
  //             readOnly: true,
  //             hoverStateEnabled: false,
  //             inputAttr: { 'style': 'text-transform: uppercase' },
  //             showClearButton: true,
  //             buttons: [{
  //               name: 'search',
  //               location: 'after',
  //               useSubmitBehavior: true,
  //               options: {
  //                 stylingMode: 'text',
  //                 icon: 'search',
  //                 disabled: false,
  //                 onClick: () => {
  //                   setPopupVisibleUnidad(true);
  //                 },
  //               }
  //             }]
  //           }}
  //         />
  //         <Item
  //           dataField="IdTipoPosicion"
  //           label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITIONTYPE" }) }}
  //           editorType="dxSelectBox"
  //           editorOptions={{
  //             items: tipoPosiciones,
  //             valueExpr: "IdTipoPosicion",
  //             displayExpr: "TipoPosicion",
  //             searchEnabled: true,
  //             onValueChanged: () => getInstance().filter(),
  //           }}
  //         />
  //         <Item
  //           dataField="Posicion"
  //           label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION" }) }}
  //           editorOptions={{
  //             readOnly: true,
  //             hoverStateEnabled: false,
  //             inputAttr: { 'style': 'text-transform: uppercase' },
  //             showClearButton: true,
  //             buttons: [{
  //               name: 'search',
  //               location: 'after',
  //               useSubmitBehavior: true,
  //               options: {
  //                 stylingMode: 'text',
  //                 icon: 'search',
  //                 disabled: false,
  //                 onClick: () => {
  //                   setPopupVisiblePosicion(true);
  //                 },
  //               }
  //             }]
  //           }}
  //         />
  //         <Item dataField="Condicion"
  //           label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONDITION" }) }}
  //           editorType="dxSelectBox"
  //           editorOptions={{
  //             items: condicion,
  //             valueExpr: "Valor",
  //             displayExpr: "Descripcion",
  //             showClearButton: true,
  //             onValueChanged: () => getInstance().filter(),
  //           }} />
            
  //         <Item dataField="Personas"
  //           label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.PERSONS" }) }}
  //           editorOptions={{
  //             readOnly: true,
  //             hoverStateEnabled: false,
  //             inputAttr: { 'style': 'text-transform: uppercase' },
  //             showClearButton: true,
  //             buttons: [{
  //               name: 'search',
  //               location: 'after',
  //               useSubmitBehavior: true,
  //               options: {
  //                 stylingMode: 'text',
  //                 icon: 'search',
  //                 disabled: false,
  //                 onClick: () => {
  //                   setPopupVisiblePersonas(true);
  //                 },
  //               }
  //             }]
  //           }} />
  //         <Item />
  //         <Item
  //           dataField="Activo"
  //           label={{ text: intl.formatMessage({ id: "COMMON.ACTIVE" }) }}
  //           editorType="dxSelectBox"
  //           editorOptions={{
  //             items: estadoSimple,
  //             valueExpr: "Valor",
  //             displayExpr: "Descripcion",
  //             showClearButton: true,
  //             onValueChanged: () => getInstance().filter(),
  //           }}
  //         />
  //       </GroupItem>
  //     </GroupItem>
  //   );
  // }


  const renderDataGrid = ({ gridRef, dataSource }) => {
    return (
      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        //keyExpr="RowIndex"
        //remoteOperations={true}
        //filterValue={filterValue}
        onEditingStart={editarRegistro}
        onRowRemoving={eliminarRegistro}
        //onRowClick={seleccionarRegistro}
        onFocusedRowChanged={seleccionarRegistro}
        onRowDblClick={seleccionarRegistroDblClick}
        onCellPrepared={onCellPrepared}
        focusedRowEnabled={true}
        focusedRowKey={focusedRowKey}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
      //onOptionChanged={onOptionChanged}
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
        <Column
          dataField="Condicion"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONDITION" })}
          allowSorting={true}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"10%"}
          cellRender={PersonaCondicionLabel}
        />
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
        <Column
          dataField="FechaIngreso"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DATE" })}
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
        >
          {/* <HeaderFilter dataSource={tipoDocumentoFilter} /> */}
        </Column>
        <Column dataField="Documento"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}
          allowHeaderFiltering={false}
          width={"10%"}
          alignment={"center"}
        />
        <Column
          dataField="Sexo"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.GENDER" })}
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={true}
          alignment={"center"}
          width={"10%"}
        >
          {/* <HeaderFilter dataSource={sexoFilter} /> */}
        </Column>

        <Column
          dataField="Edad"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.AGE" })}
          allowHeaderFiltering={false}
          allowSorting={true}
          width={"8%"}
          alignment={"center"}
        />
        <Column
          dataField="UbigeoNacimiento"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONTRY.OF.BIRTH" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"10%"}
        />

        <Column dataField="Estado"
          //dataType="boolean"
          caption={intl.formatMessage({ id: "COMMON.ACTIVE" })}
          calculateCellValue={obtenerCampoActivo}
          //cellRender={StatusLabel}
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={false}
          width={"7%"}
        />
        <Column dataField="IdCompania" visible={false} />
        <Column dataField="IdGrupo" visible={false} />
        <Column dataField="IdTipoTrabajador" visible={false} />
        <Column dataField="IdCargo" visible={false} />
        <Column dataField="IdUbigeoResidencia" visible={false} />
        <Column dataField="Activo" visible={false} />


      </DataGrid>
    );
  }

  return (
    <>
      {/* {props.showHeaderInformation && (
        <HeaderInformation
          // data={ props.getInfo()}
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
      )}


      {!props.showHeaderInformation && (
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
            <Button icon="refresh" //fa fa-broom
                type="default"
                hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                disabled={customDataGridIsBusy}
                onClick={resetLoadOptions} />
              &nbsp;

            </PortletHeaderToolbar>
          }
        />)} */}



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
          //cssClassAppBar={classesEncabezado.secundario}
          //cssClassToolbar={classesEncabezado.toolbar}
          //renderFormTitleCustomFilter={renderFormTitleCustomFilter}
          //titleCustomFilter='Datos a consultar'
          // visibleCustomFilter={isActiveFilters}
          // renderFormContentCustomFilter={renderFormContentCustomFilter}
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
        {/*******>POPUP DE COMPANIAS>******** */}
        <AdministracionCompaniaBuscar
          selectData={selectCompania}
          showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
          cancelarEdicion={() => setPopupVisibleCompania(false)}
          // selectionMode="multiple"
          uniqueId={"administracionCompaniaBuscar"}

        />
        {/*******>POPUP DE UNIDAD ORGA.>******** */}
        <AdministracionUnidadOrganizativaBuscar
          selectData={selectUnidadOrganizativa}
          showPopup={{ isVisiblePopUp: popupVisibleUnidad, setisVisiblePopUp: setPopupVisibleUnidad }}
          cancelarEdicion={() => setPopupVisibleUnidad(false)}
          selectionMode = {"multiple"}       
          showCheckBoxesModes = {"normal"}
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


      </PortletBody>
    </>
  );
};
ReporteMovimientoListPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string,
  selected: PropTypes.object,

}
ReporteMovimientoListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  showHeaderInformation: false,
  uniqueId: 'personaList',
  selected: { IdDivision: "" }
}

export default injectIntl(ReporteMovimientoListPage);
