import React, { useEffect, useState, createRef, useRef } from "react";
import { useSelector } from "react-redux";
import { Button } from "devextreme-react";
import Form, { Item, GroupItem, SimpleItem } from "devextreme-react/form";
import { PortletBody, PortletHeader, PortletHeaderToolbar, Portlet } from "../../../../partials/content/Portlet";
import { DataGrid, Column, Paging, Pager, FilterRow, HeaderFilter, FilterPanel, Selection, Editing, } from "devextreme-react/data-grid";
import { Popup } from 'devextreme-react/popup';
import { Popover } from 'devextreme-react/popover';
import PropTypes from "prop-types";
import { handleInfoMessages, handleErrorMessages } from "../../../../store/ducks/notify-messages";
import { service } from "../../../../api/transporte/manifiestoResponsable.api";
// import { filtrarMultiple } from "../../../../api/personnel/man.api";
import { DoubleLinePersona as DoubleLineLabel } from "../../../../partials/content/Grid/DoubleLineLabel";
import { storeListarTrabajadores as loadUrl } from "../../../../api/transporte/manifiesto.api";

// import BoxStyleList from "../../../../partials/components/BoxStyleList";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import PersonaTextAreaPopup from "../../../../partials/components/PersonaTextAreaPopup/PersonaTextAreaPopup";

import { dateFormat, isNotEmpty, getDataTempLocal, setDataTempLocal } from "../../../../../_metronic";
import { injectIntl } from "react-intl";

//-CustomerDataGrid-Import>
import CustomDataGrid from "../../../components/CustomDataGrid";
import { forceLoadTypes } from "../../../components/CustomDataGrid/CustomDataGridHelper";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";

const TIPO_PARADERO = {
  Origen: 'ORI',
  Destino: 'DES',
};

const animationConfig = {
  show: {
    type: 'pop',
    from: {
      scale: 0
    },
    to: {
      scale: 1
    }
  },
  hide: {
    type: 'fade',
    from: 1,
    to: 0
  }
};


const bgColors = {
  "V": "success",
  "A": "warning",
  "R": "danger",
};

const frColors = {
  "V": "text-success",
  "A": "text-success",
  "R": "text-danger",
};

const leyendaTrabajadores = [
  { Color: 'V', Desc: 'El trabajador está habilitado para ser asignado.' },
  { Color: 'R', Desc: 'El trabajador no está habilitado, tiene al menos una Validación de Acceso vencida.' },
];

const leyendaValidacionesAcceso = [
  { Color: 'V', Desc: 'Validación de Acceso vigente.' },
  { Color: 'A', Desc: 'Validación de Acceso vigente, pero vence durante la siguiente semana.' },
  { Color: 'R', Desc: 'Validación de Acceso vencida.' },
];

const TransporteManifiestoAsignacionMultiple = props => {
  const { intl, IdManifiesto, FechaProgramacion, selectionMode } = props;

  const initialFilter = { Activo: "S" };
  const nameDataTemporal = `${props.uniqueId}_SDR`;

  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState({});
  const [isVisiblePopoverEstatus, setIsVisiblePopoverEstatus] = useState(false);
  const [popoverEstatusTarget, setPopoverEstatusTarget] = useState('');
  const [validacionesAcceso, setValidacionesAcceso] = useState([]);
  const [soloHabilitados, setSoloHabilitados] = useState(true);

  const [selectedRow, setSelectedRow] = useState([]);
  const [requisitos, setRequisitos] = useState([]);

  const [listParaderosOrigen, setListParaderosOrigen] = useState([]);
  const [listParaderosDestino, setListParaderosDestino] = useState([]);

  const [isVisiblePopupPersona, setIsVisiblePopupPersona] = useState(false);
  const [arrayDocumentoTrabajadores, setArrayDocumentoTrabajadores] = useState("");

  const [dataPersonas, setDataPersonas] = useState([]);


  //FILTRO- CustomerDataGrid
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({
    store: new ArrayStore({ data: [], key: "RowIndex" }),
    reshapeOnPush: false,
  });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();

  const resetLoadOptions = () => {
    props.setDataRowEditNew({});
    dataSource.resetLoadOptions();
  }

  //-CustomerDataGrid-Variables-ini->
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({
    ...initialFilter,
    //  IdRuta : isNotEmpty(IdRuta) ? IdRuta : ""
  });
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages,] = useState(true);


  async function cargarCombos() {

    let listOrigen = [];
    let listDestino = [];

    if (IdManifiesto) {
      listOrigen = await service.listarParaderos({ IdManifiesto, Tipo: TIPO_PARADERO.Origen });
      listDestino = await service.listarParaderos({ IdManifiesto, Tipo: TIPO_PARADERO.Destino });

    }
    console.log("cargarCombos|listOrigen:", listOrigen);
    console.log("cargarCombos|listDestino:", listDestino);

    // const fechaProgramacion = FechaProgramacion !== null && FechaProgramacion !== undefined ? (dateFormat(FechaProgramacion, "yyyyMMdd")) : null;

    // let dataPersonas = await loadUrl({
    //   DocumentoTrabajadores: '',
    //   FechaConsulta: fechaProgramacion,
    //   IdManifiesto: IdManifiesto,
    //   soloHabilitados: soloHabilitados
    // });

    console.log("cargarCombos|dataPersonas:", dataPersonas);

    setListParaderosOrigen(listOrigen.result);
    setListParaderosDestino(listDestino.result);
    setDataPersonas([]);
    //setDataPersonas([dataPersonas]);


  }

  //-CustomerDataGrid-Variables-end->
  function aceptar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      let dataSelected = [];
      if (selectionMode === "row" || selectionMode === "single") {
        let getData = getDataTempLocal(nameDataTemporal);
        dataSelected = [{ ...getData }];
      } else {
        dataSelected = selectedRow;
      }

      if (dataSelected.length > 0 && isNotEmpty(props.dataRowEditNew.IdParaderoOrigen) && isNotEmpty(props.dataRowEditNew.IdParaderoDestino)) {
        props.selectData(dataSelected);
      } else {
        // handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }));
        handleInfoMessages("Seleccione las personas un origen y destino");
      }
    }
  }

  // function aceptar(e) {
  //   let result = e.validationGroup.validate();
  //   if (result.isValid) {

  //     if (selectedRow.length > 0 && isNotEmpty(props.dataRowEditNew.IdParaderoOrigen) && isNotEmpty(props.dataRowEditNew.IdParaderoDestino)) {
  //       props.selectData(selectedRow);
  //       props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
  //     } else {
  //       props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
  //       handleInfoMessages("Seleccione las personas un origen y destino");
  //     }
  //   }
  // }

  function onSelectionChanged(e) {
    //Seleccion multiple
    setSelectedRow(e.selectedRowsData);
  }

  const celRenderEstatusTrabajadores = ({ data }) => {
    if (data.Estatus > 0) {
      return (
        <i className="fas fa-circle  text-success" style={{ fontSize: "15px" }} />
      );
    } else {
      return (
        <a id="link1" className="fas fa-circle  text-danger" style={{ fontSize: "15px" }} onClick={() => showPopoverEstatus(data)}></a>
      );
    }
  };


  const celRenderEstatusValidacionesAcceso = ({ data }) => {
    return (
      <div className={"fas fa-circle  text-" + bgColors[data.Estatus.toString().toUpperCase()]} />
    );
  };

  const showPopoverEstatus = (data) => {
    console.log("showPopoverEstatus|data:", data);
    cargarValidacionesAcceso(data);
    setIsVisiblePopoverEstatus(true);
  }

  const hidePopoverEstatus = () => {
    setIsVisiblePopoverEstatus(false);
  }

  const cargarValidacionesAcceso = async (data) => {

    console.log("cargarValidacionesAcceso|data:", data);

    setValidacionesAcceso([]);
    const { IdPersona } = data;
    if (data && IdPersona) {
      setTrabajadorSeleccionado(data);
      await service.listarValidacionesAcceso({ IdPersona }).then((response) => {
        console.log("cargarValidacionesAcceso|response:", response);
        setValidacionesAcceso(response.result);
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      });
    }
  }


  const contentRenderPopoverEstatus = () => {
    return (
      <>
        {listRenderLeyenda(leyendaValidacionesAcceso)}
        <DataGrid
          dataSource={validacionesAcceso}
          keyExpr="Codigo"
          showBorders={true}
          focusedRowEnabled={true}
          repaintChangesOnly={true}
          allowColumnReordering={true}
          allowColumnResizing={true}
          columnAutoWidth={true}
        >
          <Column caption="Código" dataField="Codigo" width={"15%"} />
          <Column caption="Descripción" dataField="Descripcion" width={"50%"} />
          <Column caption="Vencimiento" dataField="FechaVencimiento" width={"20%"} />
          <Column caption="Estatus" dataField="Estatus" width={"10%"} alignment={"center"} cellRender={celRenderEstatusValidacionesAcceso} />
        </DataGrid>
      </>
    );
  }

  const itemRenderLeyenda = (item) => {
    return (
      <div className="row">
        <div className="col-md-1">
          <i className={"fas fa-circle  text-" + bgColors[item.Color]} style={{ fontSize: "15px" }} />
        </div>
        <div className="col-md-10">
          <em className={frColors[item.Color]}>{item.Desc}</em>
        </div>
      </div>
    );
  }

  const listRenderLeyenda = (list) => {
    return (
      <ul className="leyenda">
        {
          list.map(item => {
            if (item) {
              return (
                <li key={item.Color}>
                  {itemRenderLeyenda(item)}
                </li>
              );
            }
          })
        }
      </ul>
    );
  }

  const onCellClick = (e) => {
    if (e.column.dataField === 'Estatus') {
      setPopoverEstatusTarget(e.cellElement.firstChild);
      setTrabajadorSeleccionado(e.data);
    }
  }

  // const toggleSoloHabilitados = () => {
  //   setSoloHabilitados(!soloHabilitados);
  //   InvokeRemoteGria('');
  // } 
  // const toggleSoloHabilitados = () => setSoloHabilitados(!soloHabilitados);

  const toggleSoloHabilitados = (e) => {
    setSoloHabilitados(!soloHabilitados);
    setTimeout(function () {
      dataSource.loadDataWithFilter({ data: { SoloHabilitados: soloHabilitados } });
    }, 500);
  }

  const renderSoloHabilitados = () => {
    return (
      <div className="text-left" style={{ 'left': '-8px', 'position': 'relative' }}>
        <ControlSwitch
          checked={soloHabilitados}
          onChange={toggleSoloHabilitados}
        />
        <span onClick={toggleSoloHabilitados}>
          {
            soloHabilitados ?
              intl.formatMessage({ id: "TRANSPORTE.MANIFEST.SHOW_ALL_WORKERS" }) :
              intl.formatMessage({ id: "TRANSPORTE.MANIFEST.SHOW_ENABLED_ONLY" })
          }
        </span>
      </div>
    );
  }

  const selectPersonas = (data) => {
    if (isNotEmpty(data)) {
      let strPersonas = data.split('|').join(',');
      props.dataRowEditNew.Personas = strPersonas;
      dataSource.loadDataWithFilter({ data: { Personas: strPersonas } });
    }
  }



  const seleccionarRegistro = (evt) => {
    if (!customDataGridIsBusy) {
      if (selectionMode === "row" || selectionMode === "single") {
        if (isNotEmpty(evt.row.data)) setDataTempLocal(nameDataTemporal, evt.row.data);
      }
    }
  };


  const onRowDblClick = (evt) => {
    if (evt.rowIndex === -1) return;
    if (selectionMode === "row" || selectionMode === "single") {
      if (isNotEmpty(evt.data)) {
        props.selectData([{ ...evt.data }]);
      }
    }
  };

  function onSelectionChanged(e) {
    //Seleccion multiple
    setSelectedRow(e.selectedRowsData);
  }

  function onCellPrepared(e) {
    if (e.rowType === "data") {
      if (e.data.Estado === "INACTIVO") {
        e.cellElement.style.color = "red";
      }
    }
  }


  useEffect(() => {
    cargarCombos();
  }, [soloHabilitados]);

  //-CustomerDataGrid-Filter
  //-CustomerDataGrid-Filter
  const keysToGenerateFilter = [
    'IdCliente',
    'IdPersona',
    'NombreCompleto',
    'Documento',
    'IdCompania',
    'Compania',
    'Ruc',
    'Activo',
    'Personas',
    'SoloHabilitados'
  ];


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

  //-CustomerDataGrid-DataGrid
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
        //  onCellClick={onCellClick}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
      >
        <FilterRow visible={true} showOperationChooser={false} />
        <Selection mode={selectionMode} />
        <HeaderFilter visible={false} />
        <FilterPanel visible={false} />

        <Column
          dataField="RowIndex"
          caption="#"
          width="5%"
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={false}
          visible={false}
        />
        <Column
          dataField="IdPersona"
          caption={intl.formatMessage({ id: "COMMON.CODE" })}
          width="8%"
          allowSorting={true}
          allowFiltering={true}
          allowHeaderFiltering={false}
          alignment={"center"}
        />
        <Column
          dataField="NombreCompleto"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
          width="28%"
          cellRender={DoubleLineLabel}
          allowSorting={true}
          allowFiltering={true}
          allowHeaderFiltering={false}
        />
        <Column
          dataField="Documento"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}
          width="10%"
          allowSorting={true}
          allowFiltering={true}
          allowHeaderFiltering={false}
          alignment={"center"}
        />

        <Column
          dataField="Compania"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" })}
          width="28%"
          allowSorting={true}
          allowFiltering={true}
          allowHeaderFiltering={false}
        />

        <Column
          dataField="Ruc"
          caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.RUC" })}
          width="11%"
          allowSorting={true}
          allowFiltering={true}
          allowHeaderFiltering={false}
        />

        {/* <Column
                dataField="Grupo"
                caption="Grupo"
                allowSorting={false}
                allowFiltering={true}
                allowHeaderFiltering={false}
                width={"20%"}
                /> */}

        <Column
          dataField="Estatus"
          width="10%"
          caption="Estatus"
          cellRender={celRenderEstatusTrabajadores}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          alignment={"center"}
        />

      </DataGrid>

    );
  };


  return (
    <>
      <Popup
        visible={props.showPopup.isVisiblePopUp}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={600}
        width={900}
        title={"Buscar Personas".toUpperCase()}
        onHiding={() => props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)}
      >
        <Portlet>


          <div className="pb-3">
            <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" id="editForm" className="pl-5"  >

              <GroupItem itemType="group" colCount={4} >
                <Item
                  dataField="Personas"
                  label={{
                    text: "Tipo Documentos"
                  }}
                  colSpan={2}
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
                <Item label={{ visible: false }} colSpan={2}
                  render={renderSoloHabilitados}
                />
              </GroupItem>

              <GroupItem itemType="group" colCount={16} >

                <Item dataField="IdParaderoOrigen"
                  label={{ text: "Origen" }}
                  editorType="dxSelectBox"
                  isRequired={true}
                  colSpan={8}
                  editorOptions={{
                    items: listParaderosOrigen,
                    valueExpr: "IdParadero",
                    displayExpr: "Paradero",
                    searchEnabled: true,
                    placeholder: "Seleccione..",
                    showClearButton: true,
                    inputAttr: { style: "text-transform: uppercase" },
                  }}
                />
                <Item dataField="IdParaderoDestino"
                  label={{ text: "Destino" }}
                  editorType="dxSelectBox"
                  isRequired={true}
                  colSpan={8}
                  editorOptions={{
                    items: listParaderosDestino,
                    valueExpr: "IdParadero",
                    displayExpr: "Paradero",
                    searchEnabled: true,
                    placeholder: "Seleccione..",
                    showClearButton: true,
                    inputAttr: { style: "text-transform: uppercase" },
                  }}
                />

              </GroupItem>

              <GroupItem itemType="group" colSpan={3}>
                <div style={{ zIndex: +100, position: 'fixed', width: "110px", height: "35px", marginTop: "-84px", marginLeft: "718px" }}>

                  <Button
                    icon="todo"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.ACCEPT" })}
                    onClick={aceptar}
                    useSubmitBehavior={true}
                    disabled={customDataGridIsBusy}
                  />
                  &nbsp;
                  <Button
                    icon="refresh"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                    disabled={customDataGridIsBusy}
                    onClick={resetLoadOptions}
                  />
                  &nbsp;
                  <Button
                    icon="fa fa-times-circle"
                    type="normal"
                    hint={"Cancelar"}
                    onClick={() => props.showPopup.setisVisiblePopUp(false)}
                  />

                </div>
              </GroupItem>
            </Form>
          </div>

          <CustomDataGrid
            showLog={false}
            uniqueId={`${props.uniqueId}_GRID`}
            dataSource={dataSource}
            rowNumberName="RowIndex"
            loadWhenStartingComponent={isFirstDataLoad && !refreshData}
            renderDataGrid={renderDataGrid}
            loadUrl={loadUrl}
            forceLoad={forceLoadTypes.Unforced}
            sendToServerOnlyIfThereAreChanges={false}
            ifThereAreNoChangesLoadFromStorage={ifThereAreNoChangesLoadFromStorage}
            caseSensitiveWhenCheckingForChanges={true}
            uppercaseFilterRow={true}
            initialLoadOptions={{ currentPage: 1, pageSize: 10, sort: { column: "NombreCompleto", order: "asc" }, }}
            filterRowSize="sm"
            summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW", })} {0} de {1} `}
            // CUSTOM FILTER
            visibleCustomFilter={false}
            keysToGenerateFilter={keysToGenerateFilter}
            filterData={filterData}
            // PAGINATION
            paginationSize="md"
            // EVENTS
            onLoading={() => setCustomDataGridIsBusy(true)}
            onError={() => setCustomDataGridIsBusy(false)}
            onLoaded={() => setCustomDataGridIsBusy(false)}
          />

          <div style={{ marginLeft: "2px" }} >
            {listRenderLeyenda(leyendaTrabajadores)}
          </div>

          <Popover
            target="#link1"
            position="left"
            width={600}
            showTitle={true}
            title={"Estatus de : " + (trabajadorSeleccionado && trabajadorSeleccionado.NombreCompleto)}
            visible={isVisiblePopoverEstatus}
            onHiding={hidePopoverEstatus}
            shading={true}
            shadingColor="rgba(0, 0, 0, 0.5)"
            animation={animationConfig}
            contentRender={contentRenderPopoverEstatus}
          >
          </Popover>

          {/* <div style={{ zIndex: +100, position: 'fixed', width: "650px", height: "83px", marginTop: "595px", marginLeft: "-37px" }}>
            {listRenderLeyenda(leyendaTrabajadores)}
          </div> */}

        </Portlet>
      </Popup>
      {isVisiblePopupPersona && (
        <PersonaTextAreaPopup
          isVisiblePopupDetalle={isVisiblePopupPersona}
          setIsVisiblePopupDetalle={setIsVisiblePopupPersona}
          obtenerNumeroDocumento={selectPersonas}
        />
      )}

    </>
  );
};

TransporteManifiestoAsignacionMultiple.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
};
TransporteManifiestoAsignacionMultiple.defaultProps = {
  showButton: true,
  selectionMode: "multiple", //['multiple', 'row','single]

};
// export default TransporteManifiestoAsignacionMultiple;
export default injectIntl(TransporteManifiestoAsignacionMultiple);
