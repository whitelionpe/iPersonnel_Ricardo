import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl"; //Multi-idioma
import { Button } from "devextreme-react";
import {
  Portlet,
  PortletHeader,
  PortletBody,
  PortletHeaderToolbar,
  PortletHeaderPopUp,
} from "../content/Portlet";

import { getDataTempLocal, isNotEmpty, setDataTempLocal } from "../../../_metronic";
import { handleInfoMessages } from "../../store/ducks/notify-messages";
import { DoubleLinePersona as DoubleLineLabel, PersonaCondicionLabel } from "../content/Grid/DoubleLineLabel";
import {
  DataGrid,
  Column,
  FilterRow,
  HeaderFilter,
  FilterPanel,
  Selection,
} from "devextreme-react/data-grid";
import { obtenerTodos as obtenerTiposDocumentos } from "../../api/sistema/tipodocumento.api";
 import { obtenerTodos as obtenerPlanillas } from "../../api/asistencia/planilla.api";

import { Popup } from "devextreme-react/popup";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";

import AdministracionUnidadOrganizativaBuscar from "../../partials/components/AdministracionUnidadOrganizativaBuscar";
import AdministracionCompaniaBuscar from "../../partials/components/AdministracionCompaniaBuscar";
import PersonaTextAreaPopup from '../../partials/components/PersonaTextAreaPopup/PersonaTextAreaPopup';
 
//-CustomerDataGrid-Import>
import CustomDataGrid from "../components/CustomDataGrid";
import { forceLoadTypes } from "../components/CustomDataGrid/CustomDataGridHelper";
import { storeListar as loadUrl } from "../../api/asistencia/justificacionMasiva.api";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
import { Item, GroupItem } from "devextreme-react/form";

export const initialFilter = {
  Activo: "S",
  IdCliente: "",
  IdCompania:""
};

const AsistenciaBuscarPersonaFilter = (props) => {
  const { intl, selectionMode } = props;
  // console.log("AsistenciaBuscarPersonaFilter|props:",props);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [cboPlanillas, setCboPlanillas] = useState([]);

  const [selectedRow, setSelectedRow] = useState([]);

  const [isVisiblePopupPersona, setIsVisiblePopupPersona] = useState(false);
  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);

  const { IdCliente, IdPerfil } = useSelector(state => state.perfil.perfilActual);
  const IdDivisionPerfil = useSelector(state => state.perfil.perfilActual.IdDivision);

  //FILTRO- CustomerDataGrid
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({
    store: new ArrayStore({ data: [], key: "RowIndex" }),
    reshapeOnPush: false,
  });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();

  //-CustomerDataGrid-Variables-ini->
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdPerfil, IdDivisionPerfil, });
  const [
    ifThereAreNoChangesLoadFromStorage,
    setIfThereAreNoChangesLoadFromStorages,
  ] = useState(true);
  //-CustomerDataGrid-Variables-end->

  async function cargar() {
    let tiposDocumento = await obtenerTiposDocumentos();
    setTiposDocumento(tiposDocumento);
  }

   async function listarPlanillas(IdCompania) {
    let data = await obtenerPlanillas({
      IdCliente : IdCliente,
      IdCompania : IdCompania
    });
    setCboPlanillas(data);
  }
  
  //agregar
  function aceptar() {

    let dataSelected = [];
    if (selectionMode === "row" || selectionMode === "single") {
      let getData = getDataTempLocal('selectRowData');
      dataSelected = [{ ...getData }];
    } else {
      dataSelected = selectedRow;
    }

    if (dataSelected.length > 0) {
      //removeDataTempLocal('selectRowData');
      props.agregar(dataSelected);
      props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
    } else {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }));
    }

  }

  const tipoDocumentoFilter = tiposDocumento.map((tipoDocumento) => {
    return {
      text: tipoDocumento.Alias,
      value: ["IdTipoDocumento", "=", tipoDocumento.IdTipoDocumento],
    };
  });

  function onCellPrepared(e) {
    if (e.rowType === "data") {
      if (e.data.Estado === "INACTIVO") {
        e.cellElement.style.color = "red";
      }
    }
  }

  function onSelectionChanged(e) {
    //Seleccion multiple
    setSelectedRow(e.selectedRowsData);
  }
  const onRowDblClick = (evt) => {
    if (evt.rowIndex === -1) return;
    if (selectionMode === "row" || selectionMode === "single") {
      if (isNotEmpty(evt.data)) {
        props.agregar([{ ...evt.data }]);
        props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
      }
    }
  };


  const seleccionarRegistro = (evt) => {
    if (!customDataGridIsBusy) {
      if (selectionMode === "row" || selectionMode === "single") {
        if (isNotEmpty(evt.row.data)) setDataTempLocal('selectRowData', evt.row.data);
      }
    }
  };

  const hidePopover = () => {
    props.showPopup.setisVisiblePopUp(false);
    props.setModoEdicion(false);
  }

  const selectPersonas = (data) => {

    if (isNotEmpty(data)) {
      let strPersonas = data.split('|').join(',');
      // console.log("selectPersonas|strPersonas:",strPersonas);
      dataSource.loadDataWithFilter({ data: { Personas: strPersonas } });
    }
  }

  const selectCompania = dataPopup => {
    const { IdCompania, Compania } = dataPopup[0];
    dataSource.loadDataWithFilter({ data: { IdCompania, Compania } })
    // listarPlanillas(IdCompania);
    setPopupVisibleCompania(false);
   listarPlanillas(IdCompania);
    // props.listarPlanillas(IdCompania);

  }

  const selectUnidadOrganizativa = async (dataPopup) => {
    const { IdUnidadOrganizativa, UnidadOrganizativa } = dataPopup;
    dataSource.loadDataWithFilter({ data: { IdUnidadOrganizativa, UnidadOrganizativa } });
    setPopupVisibleUnidad(false);
  };


  useEffect(() => {
    cargar();
  }, []);

  //-CustomerDataGrid-UseEffect-ini->
  useEffect(() => {
    if (ifThereAreNoChangesLoadFromStorage)
      setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage]);

  useEffect(() => {
    if (refreshData) {
      refresh();
      setRefreshData(false);
    }
  }, [refreshData]);
 
  useEffect(() => {
    if (props.filtro) {
      const { IdCompania} = props.filtro;
      // console.log("AsistenciaBuscarPersonaFilter|IdCompania:",IdCompania);
      dataSource.loadDataWithFilter({ data: { IdCompania } });
    }
  }, [props.filtro]);

  //-CustomerDataGrid-Filter
  const keysToGenerateFilter = [
    "IdCliente",
    "IdCompania",
    "IdUnidadOrganizativa",
    "UnidadOrganizativa",
    "IdPosicion",
    "Posicion",
    "IdTipoPosicion",
    "IdPersona",
    "NombreCompleto",
    "TipoDocumento",
    "Documento",
    "Sexo",
    "Edad",
    "UbigeoNacimiento",
    "Activo",
    'IdPerfil',
    'IdDivisionPerfil',
    'Personas',
    'IdPlanilla',
    'Condicion'
  ];
  //-CustomerDataGrid-DataGrid

  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (

<GroupItem  colCount={14} colSpan={14} labelLocation="top">
        <GroupItem itemType="group" colSpan={11} >
    
<Item
            dataField="UnidadOrganizativa"
            label={{
            text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.ORGANIZATIONALUNIT" }),
            // location:"top"
           }}
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
            dataField="Personas"
            label={{ 
              text: intl.formatMessage({ id: "Tipo Documentos" }),
              // location :"top"
            }}
            editorOptions={{
              readOnly: true,
              hoverStateEnabled: false,
              inputAttr: { 'style': 'text-transform: uppercase' },
              showClearButton: true,
              buttons: [{
                name: 'search',
                location: 'after',
                useSubmitBehavior: true,
                maxLength: 20,
                options: {
                  stylingMode: 'text',
                  icon: 'search',
                  disabled: false,
                  onClick: () => {
                    setIsVisiblePopupPersona(true);
                  },
                }
              }]
            }}
          />

        </GroupItem>

       <GroupItem itemType="group"  colSpan={3}>
       <div  style={{zIndex:+100, position: 'fixed',width: "94px", height:"83px", marginTop:"0px", marginLeft:"50px" }}>

          <Button
          icon="todo" //fa fa-save
          type="default"
          hint={intl.formatMessage({ id: "ACTION.ACCEPT" })}
          onClick={aceptar}
          disabled={customDataGridIsBusy}
          useSubmitBehavior={true}
          />
          &nbsp;
          <Button
          icon="refresh"
          type="default"
          hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
          disabled={customDataGridIsBusy}
          onClick={resetLoadOptions}
          visible={true}
          />
        </div>
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
        onCellPrepared={onCellPrepared}
        repaintChangesOnly={true}
        onSelectionChanged={(e => onSelectionChanged(e))}
        onRowDblClick={onRowDblClick}
        onFocusedRowChanged={seleccionarRegistro}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
      >
        <FilterRow visible={true} showOperationChooser={false} />
        <Selection mode={selectionMode} />
        <HeaderFilter visible={false} />
        <FilterPanel visible={false} />
        {(selectionMode != "multiple") && (
          <Column
            dataField="RowIndex"
            caption="#"
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"5%"}
            alignment={"center"}
          />
        )}

        <Column
          dataField="Condicion"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONDITION" })}
          allowSorting={true}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"15%"}
          cellRender={PersonaCondicionLabel}
        />
        <Column
          dataField="IdPersona"
          caption={intl.formatMessage({ id: "COMMON.CODE" })}
          allowHeaderFiltering={false}
          allowSorting={true}
          width={"10%"}
          alignment={"center"}
        />
        <Column
          dataField="NombreCompleto"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
          cellRender={DoubleLineLabel}
          allowSorting={true}
          allowHeaderFiltering={false}
          width={"45%"}
        />
        <Column
          dataField="TipoDocumento"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE.DOCU" })}
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={true}
          alignment={"center"}
          width={"10%"}
        >
          <HeaderFilter dataSource={tipoDocumentoFilter} />
        </Column>
        <Column
          dataField="Documento"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}
          allowHeaderFiltering={false}
          width={"15%"}
          alignment={"center"}
        />

      </DataGrid>
    );
  };
  //-CustomerDataGrid-DataGrid- end

  return (
    <>
      <Popup
        visible={props.showPopup.isVisiblePopUp}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={"700px"}
        width={"650px"}
        title={(
          intl.formatMessage({ id: "ACTION.SEARCH" }) +
          " " +
          intl.formatMessage({ id: "ADMINISTRATION.PERSON" })
        ).toUpperCase()}
         onHiding={() => props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)}
          // onHiding ={hidePopover} 
        
      >
        <Portlet>

        {/* <PortletHeaderPopUp
                title={""}
                toolbar={
                    <PortletHeaderToolbar>
                    &nbsp;
                    <div id="btnFlotante" style={{zIndex:+100, position: 'fixed' }}>
                    <Button
                    icon="todo" //fa fa-save
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.ACCEPT" })}
                    onClick={aceptar}
                    disabled={customDataGridIsBusy}
                    useSubmitBehavior={true}
                    />
                    &nbsp;
                    <Button
                    icon="refresh"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                    disabled={customDataGridIsBusy}
                    onClick={resetLoadOptions}
                    // visible={false}
                    />
                    </div>
                     
                    </PortletHeaderToolbar>
                }
            /> */}

          <CustomDataGrid
            showLog={false}
            uniqueId={props.uniqueId}
            dataSource={dataSource}
            rowNumberName="RowIndex"
            loadWhenStartingComponent={isFirstDataLoad && !refreshData}
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
              pageSize: 15,
              sort: { column: "NombreCompleto", order: "asc" },
            }}
            filterRowSize="sm"
            summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW", })} {0} de {1} `}
            // CUSTOM FILTER
            visibleCustomFilter={true}
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
        </Portlet>
      </Popup>

      <PersonaTextAreaPopup
        isVisiblePopupDetalle={isVisiblePopupPersona}
        setIsVisiblePopupDetalle={setIsVisiblePopupPersona}
        obtenerNumeroDocumento={selectPersonas}
      />

      {/*******>POPUP DE COMPANIAS>******** */}
      <AdministracionCompaniaBuscar
          selectData={selectCompania}
          showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
          cancelarEdicion={() => setPopupVisibleCompania(false)}
          // selectionMode="multiple"
          uniqueId={"administracionCompaniaBuscar"}
          isControlarAsistencia = {"S"}
        />
        {/*******>POPUP DE UNIDAD ORGA.>******** */}
        <AdministracionUnidadOrganizativaBuscar
          selectData={selectUnidadOrganizativa}
          showPopup={{ isVisiblePopUp: popupVisibleUnidad, setisVisiblePopUp: setPopupVisibleUnidad }}
          cancelarEdicion={() => setPopupVisibleUnidad(false)}
        />


    </>
  );
};

AsistenciaBuscarPersonaFilter.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
};
AsistenciaBuscarPersonaFilter.defaultProps = {
  showButton: true,
  selectionMode: "row", //['multiple', 'row']
  uniqueId: "AdministracionPersonasBuscar",
};
export default injectIntl(AsistenciaBuscarPersonaFilter);
