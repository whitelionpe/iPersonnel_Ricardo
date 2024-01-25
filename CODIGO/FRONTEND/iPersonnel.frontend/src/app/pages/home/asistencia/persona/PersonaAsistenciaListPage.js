import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { Button } from "devextreme-react";
import { Item, GroupItem } from "devextreme-react/form";
import { DataGrid, Column, Editing, FilterRow, HeaderFilter, FilterPanel } from "devextreme-react/data-grid";
import { DoubleLinePersona as DoubleLineLabel, PersonaCondicionLabel } from "../../../../partials/content/Grid/DoubleLineLabel";
import { isNotEmpty, listarEstadoSimple, listarCondicion, PersonaCondicion, listarTipoPersonas } from "../../../../../_metronic";
import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import WithLoandingPanel from "../../../../partials/content/withLoandingPanel";
import { storeListarPersonas as loadUrl, servicePersona } from "../../../../api/asistencia/persona.api";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { obtenerTodos as obtenerTodosTipoPosicion } from "../../../../api/administracion/tipoPosicion.api";
import AdministracionUnidadOrganizativaBuscar from "../../../../partials/components/AdministracionUnidadOrganizativaBuscar";
import AdministracionPosicionBuscar from "../../../../partials/components/AdministracionPosicionBuscar";
import AdministracionCompaniaBuscar from "../../../../partials/components/AdministracionCompaniaBuscar";
import PersonaTextAreaPopup from '../../../../partials/components/PersonaTextAreaPopup/PersonaTextAreaPopup';
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { initialFilter } from "./PersonaAsistenciaIndexPage";

const PersonaAsistenciaListPage = props => {

  const { intl, focusedRowKey, setLoading, dataMenu, companiaData, setVarIdCompania, varIdCompania } = props;
  const { IdCliente, IdPerfil } = useSelector(state => state.perfil.perfilActual);
  const IdDivisionPerfil = useSelector(state => state.perfil.perfilActual.IdDivision);

  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const [popupVisiblePosicion, setPopupVisiblePosicion] = useState(false);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const [popupVisiblePersonas, setPopupVisiblePersonas] = useState(false);

  const [tipoPosiciones, setTipoPosiciones] = useState([]);

  //Variables de CustomerDataGrid
  const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);

//console.log("IdDivisionPerfil",IdDivisionPerfil);

  const [filterData, setFilterData] = useState({
    ...initialFilter,
    IdCliente,
    IdPerfil,
    IdDivisionPerfil,
    // IdCliente : IdCliente, //--->LSF, descomentar para validar cambio de BOORO
    // IdPerfil : IdPerfil,
    // IdDivisionPerfil : IdDivisionPerfil,
    //IdCompania: varIdCompania
  });
  // PAGINATION
  // ------------------------------
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  // const resetLoadOptions = props.resetLoadOptions;
  let dataGridRef = React.useRef();
 
  const resetLoadOptions =  () => {  
    props.resetLoadOptions(); 

    if (isNotEmpty(varIdCompania)) {
      props.dataSource.loadDataWithFilter({ data: { ...initialFilter, IdCompania: varIdCompania, IdValue: new Date(), IdDivisionPerfil } });
    }

  }
  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-:::::::::::::::::::::::::::::::::

  async function cargarCombos() {

    await obtenerTodosTipoPosicion({ IdCliente }).then(tipoPosiciones => {
      setTipoPosiciones(tipoPosiciones);
    });

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

  const obtenerCampoActivo = rowData => { return rowData.Activo === "S"; };

  const selectCompania = dataPopup => {

    const { IdCompania, Compania } = dataPopup[0];
    props.dataSource.loadDataWithFilter({ data: { IdCompania, Compania } })
    setPopupVisibleCompania(false);
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
    if (isNotEmpty(data)) {
      let strPersonas = data.split('|').join(',');
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


  const exportReport = async () => {

    let result = JSON.parse(localStorage.getItem('vcg:' + props.uniqueId + ':loadOptions'));
    if (!isNotEmpty(result)) return;
    // Recorremos los filtros usados:
    let filterExport = {
      IdCliente,
      IdPerfil,
      IdDivisionPerfil,
      IdDivision: isNotEmpty(IdDivision) ? IdDivision : ""
    };
    for (let i = 0; i < result.filter.length; i++) {
      let currentValue = result.filter[i];

      // Filtramos solo los Array
      if (currentValue instanceof Array) {

        // Recorremos cada uno de los filtros en el array
        for (let j = 0; j < currentValue.length; j++) {

          //Llenamos filterData para decompilarlo en el siguente punto.
          filterExport[currentValue[0]] = currentValue[2];
        }
      }
    }
    //obtener orden para exportar
    const { selector } = result.sort[0];

    // Decompilando filterData
    const { IdCliente, IdCompania, Personas, Condicion, IdUnidadOrganizativa, UnidadOrganizativa,
      IdPosicion, Posicion, IdTipoPosicion, IdPersona, NombreCompleto, IdTipoDocumento, IdEstadoCivil, Documento, Sexo, Edad,
      IdUbigeoResidencia, IdDivision, Activo, IdPerfil, IdDivisionPerfil, MostrarPersonas, UnidadesOrganizativas } = filterExport;

    if (dataGridRef.current.props.dataSource._items.length > 0) {

      let ListColumnName = [];
      let ListDataField = [];

      dataGridRef.current._optionsManager._currentConfig.configCollections.columns.map(item => {
        if ((item.options.visible === undefined || item.options.visible === true) && item.options.type != 'buttons') {
          ListColumnName.push(item.options.caption.toUpperCase());
          ListDataField.push(item.options.dataField);
        }
      })
      //Obtener dataGrid titulo columnas + idColumnas para exportar de forma dinamica.
      var ArrayColumnHeader = ListColumnName.join('|');
      var ArrayColumnId = ListDataField.join('|');

      let params = {
        IdCliente: IdCliente,
        IdPersona: isNotEmpty(IdPersona) ? IdPersona : "",
        Condicion: isNotEmpty(Condicion) ? Condicion : "",
        Personas: isNotEmpty(Personas) ? Personas : "",
        NombreCompleto: isNotEmpty(NombreCompleto) ? NombreCompleto : "",
        Documento: isNotEmpty(Documento) ? Documento : "",
        IdEstadoCivil: isNotEmpty(IdEstadoCivil) ? IdEstadoCivil : "",
        Sexo: isNotEmpty(Sexo) ? Sexo : "",
        Edad: isNotEmpty(Edad) ? Edad : "",
        IdCompania: isNotEmpty(IdCompania) ? IdCompania : "",
        IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa : "",
        IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion : "",
        IdTipoPosicion: isNotEmpty(IdTipoPosicion) ? IdTipoPosicion : "",
        IdUbigeoResidencia: isNotEmpty(IdUbigeoResidencia) ? IdUbigeoResidencia : "",
        IdDivision: IdDivision,
        Activo: isNotEmpty(Activo) ? Activo : "",
        IdPerfil: isNotEmpty(IdPerfil) ? IdPerfil : "",
        IdDivisionPerfil: isNotEmpty(IdDivisionPerfil) ? IdDivisionPerfil : "",
        MostrarPersonas: isNotEmpty(MostrarPersonas) ? MostrarPersonas.toString() : "",
        UnidadesOrganizativas: isNotEmpty(UnidadesOrganizativas) ? UnidadesOrganizativas : "",
        TituloHoja: intl.formatMessage({ id: isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : "" }),
        NombreHoja: intl.formatMessage({ id: isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : "" }),
        ArrayColumnHeader,
        ArrayColumnId,
        OrderField: selector
      };
      setLoading(true);
      await servicePersona.exportarExcel(params).then(response => {
        if (isNotEmpty(response.fileBase64)) {
          let download = document.getElementById('iddescarga');
          download.href = `data:application/vnd.ms-excel;base64,${encodeURIComponent(response.fileBase64)}`;
          download.download = response.fileName;
          download.click();
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.DOWNLOAD.SUCESS" }));
        }

      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => {
        setLoading(false);
      });

    }

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
    if (isNotEmpty(varIdCompania)) {
      props.dataSource.loadDataWithFilter({ data: { ...initialFilter, IdCompania: varIdCompania,IdDivisionPerfil, IdValue: new Date() } });
    }
  }, [varIdCompania]);

  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter = ['IdCliente', 'IdCompania', 'Condicion', 'Personas', 'IdUnidadOrganizativa', 'UnidadOrganizativa', 'IdPosicion', 'Posicion', 'IdTipoPosicion',
    'IdPersona', 'NombreCompleto', 'TipoDocumento', 'Documento', 'Sexo', 'Edad', 'UbigeoNacimiento', 'IdDivision', 'Activo'
    , 'IdPerfil', 'IdDivisionPerfil', 'MostrarPersonas', 'UnidadesOrganizativas'];

  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem>
        <GroupItem itemType="group" colCount={2} colSpan={2}>

          <Item dataField="IdUnidadOrganizativa" visible={false} />
          <Item dataField="IdPosicion" visible={false} />

          <Item
            dataField="IdCompania"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: companiaData,
              valueExpr: "IdCompania",
              displayExpr: "Compania",
              showClearButton: false,
              value: varIdCompania,
              onValueChanged: (e) => {
                if (isNotEmpty(e.value)) {
                  setVarIdCompania(e.value);
                  //getInstance().filter();
                }
                // else {
                //   setVarIdCompania("");
                //   getInstance().filter();
                // }
              },
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
            dataField="IdTipoPosicion"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITIONTYPE" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: tipoPosiciones,
              valueExpr: "IdTipoPosicion",
              displayExpr: "TipoPosicion",
              searchEnabled: true,
              onValueChanged: () => getInstance().filter(),
            }}
          />
          <Item
            dataField="Posicion"
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
          <Item dataField="Condicion"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONDITION" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: listarCondicion(),
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              showClearButton: true,
              onValueChanged: () => getInstance().filter(),
            }} />

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

          <Item
            dataField="MostrarPersonas"
            label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.FILTER" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: listarTipoPersonas(),
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              onValueChanged: () => getInstance().filter(),
            }}
          />

          <Item
            dataField="Activo"
            label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: listarEstadoSimple(),
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              showClearButton: true,
              onValueChanged: () => getInstance().filter(),
            }}
          />
        </GroupItem>
      </GroupItem>
    );
  }


  const renderDataGrid = ({ gridRef, dataSource }) => {
    if (dataSource._storeLoadOptions.filter !== undefined) {
      if (props.totalRowIndex === 0) {
        props.setTotalRowIndex(dataSource._totalCount);
      }
      if (dataSource._totalCount != props.totalRowIndex) {
        if (dataSource._totalCount != -1) {
          props.setVarIdPersona("")
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
        keyExpr="RowIndex"
        remoteOperations={true}
        onEditingStart={editarRegistro}
        onRowRemoving={eliminarRegistro}
        onFocusedRowChanged={seleccionarRegistro}
        onRowDblClick={seleccionarRegistroDblClick}
        onCellPrepared={onCellPrepared}
        focusedRowEnabled={true}
        focusedRowKey={focusedRowKey}
        repaintChangesOnly={true}
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
          width={"7%"}
          alignment={"center"} />
        <Column
          dataField="NombreCompleto"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
          cellRender={DoubleLineLabel}
          allowSorting={true}
          allowHeaderFiltering={false}
          width={"21%"}

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
        </Column>
        <Column dataField="Documento"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}
          allowHeaderFiltering={false}
          width={"10%"}
          alignment={"center"}
        />
        <Column dataField="Compania"
          caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.COMPANY" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          width={"12%"}
        />
        <Column dataField="IdContrato"
          caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          width={"10%"}
        />
        <Column
          dataField="FechaInicio"
          caption={intl.formatMessage({ id: "COMMON.STARTDATE.SHORT" })}
          //dataType="date"
          //format="dd/MM/yyyy"
          alignment={"center"}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width="9%"
        />
        <Column dataField="FechaFin"
          //dataType="datetime"
          //format="dd/MM/yyyy"
          caption={intl.formatMessage({ id: "COMMON.ENDDATE.SHORT" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          width={"9%"}
          alignment={"center"}
        />
        <Column dataField="UnidadOrganizativa"
          caption={intl.formatMessage({ id: "ADMINISTRATION.POSITION.ORGANIZATIONALUNIT" })}
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={false}
          width={"10%"}
        />
        <Column dataField="Activo"
          caption={intl.formatMessage({ id: "COMMON.ACTIVE" })}
          calculateCellValue={obtenerCampoActivo}
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={false}
          width={"7%"}
        />

      </DataGrid>
    );
  }

  return (
    <>
      <a id="iddescarga" className="" ></a>
      {props.showHeaderInformation && (
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
                onClick={resetLoadOptions}
              />
              &nbsp;
              <Button
                icon="fa fa-file-excel"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
                disabled={customDataGridIsBusy}
                onClick={exportReport}
              />

            </PortletHeaderToolbar>
          }
        />)}



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
          initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'NombreCompleto', order: 'asc' } }}
          filterRowSize='sm'
          summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}
          // CUSTOM FILTER
          //cssClassAppBar={classesEncabezado.secundario}
          //cssClassToolbar={classesEncabezado.toolbar}
          //renderFormTitleCustomFilter={renderFormTitleCustomFilter}
          //titleCustomFilter='Datos a consultar'
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
        {/*******>POPUP DE COMPANIAS>******** */}
        {popupVisibleCompania && (
          <AdministracionCompaniaBuscar
            selectData={selectCompania}
            showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
            cancelarEdicion={() => setPopupVisibleCompania(false)}
            // selectionMode="multiple"
            uniqueId={"administracionCompaniaBuscar"}
          />

        )}

        {/*******>POPUP DE UNIDAD ORGA.>******** */}
        {popupVisibleUnidad && (
          <AdministracionUnidadOrganizativaBuscar
            selectData={selectUnidadOrganizativa}
            showPopup={{ isVisiblePopUp: popupVisibleUnidad, setisVisiblePopUp: setPopupVisibleUnidad }}
            cancelarEdicion={() => setPopupVisibleUnidad(false)}
            selectionMode={"multiple"}
            showCheckBoxesModes={"normal"}
          />
        )}

        {/*******>POPUP DE UNIDAD ORGA. CON POSICIONES>******** */}
        {popupVisiblePosicion && (
          <AdministracionPosicionBuscar
            selectData={selectPosicion}
            showPopup={{ isVisiblePopUp: popupVisiblePosicion, setisVisiblePopUp: setPopupVisiblePosicion }}
            cancelarEdicion={() => setPopupVisiblePosicion(false)}
            uniqueId={"posionesBuscarPersonaList"}

          />
        )}

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
PersonaAsistenciaListPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string,
  selected: PropTypes.object,

}
PersonaAsistenciaListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  showHeaderInformation: false,
  uniqueId: 'AsistenciaPersonaListPage',
  selected: { IdDivision: "" }
}

export default injectIntl(WithLoandingPanel(PersonaAsistenciaListPage));
