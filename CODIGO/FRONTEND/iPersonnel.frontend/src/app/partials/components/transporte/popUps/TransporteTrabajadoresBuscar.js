import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import {
    Portlet,
    PortletHeaderPopUp,
    PortletHeaderToolbar,
} from "../../../content/Portlet";
import { isNotEmpty, getDataTempLocal, setDataTempLocal } from "../../../../../_metronic";
import { handleInfoMessages,handleErrorMessages } from "../../../../store/ducks/notify-messages";

import {
    DataGrid,
    Column,
    FilterRow,
    HeaderFilter,
    FilterPanel,
    Selection,
} from "devextreme-react/data-grid";
import { Popup } from "devextreme-react/popup";
import PropTypes from "prop-types";
//-CustomerDataGrid-Import>
import CustomDataGrid from "../../../components/CustomDataGrid";
import { forceLoadTypes } from "../../../components/CustomDataGrid/CustomDataGridHelper";
import { storeListarTrabajadores as  loadUrl } from "../../../../api/transporte/manifiesto.api";
import { service } from "../../../../api/transporte/manifiestoResponsable.api";
import { Popover } from 'devextreme-react/popover';
import BoxStyleList from "../../../components/BoxStyleList";
import Form, { GroupItem,Item, SimpleItem } from "devextreme-react/form";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";

const TransporteTrabajadoresBuscar = (props) => {

  const { selectionMode, intl, IdRuta } = props;
    const initialFilter = { Activo: "S"};
    const nameDataTemporal = `${props.uniqueId}_SDR`;

    const [selectedRow, setSelectedRow] = useState([]);
    //FILTRO- CustomerDataGrid
    const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
    const [refreshData, setRefreshData] = useState(false);

    const [validacionesAcceso, setValidacionesAcceso] = useState([]);
    const [isVisiblePopoverEstatus, setIsVisiblePopoverEstatus] = useState(false);
    const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState({});
    const [soloHabilitados, setSoloHabilitados] = useState(true);

    const leyendaTrabajadores = [
      { Color: 'V', Desc: 'El trabajador está habilitado para ser asignado.' },
      { Color: 'R', Desc: 'El trabajador no está habilitado, tiene al menos una Validación de Acceso vencida.' },
    ];
    
    const leyendaValidacionesAcceso = [
      { Color: 'V', Desc: 'Validación de Acceso vigente.' },
      { Color: 'A', Desc: 'Validación de Acceso vigente, pero vence durante la siguiente semana.' },
      { Color: 'R', Desc: 'Validación de Acceso vencida.' },
    ];

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
    

    const ds = new DataSource({
        store: new ArrayStore({ data: [], key: "RowIndex" }),
        reshapeOnPush: false,
    });
    const [dataSource] = useState(ds);

    const refresh = () => dataSource.refresh();
    const resetLoadOptions = () => dataSource.resetLoadOptions();

    //-CustomerDataGrid-Variables-ini->
    const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
    const [filterData, setFilterData] = useState({...initialFilter , IdRuta : isNotEmpty(IdRuta) ? IdRuta : "" });
    const [ ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages,] = useState(true);

    //-CustomerDataGrid-Variables-end->
    function aceptar() {
        let dataSelected = [];
        if (selectionMode === "row" || selectionMode === "single") {
            let getData = getDataTempLocal(nameDataTemporal);
            dataSelected = [{ ...getData }];
        } else {
            dataSelected = selectedRow;
        }

        if (dataSelected.length > 0) {
            props.selectData(dataSelected);
        } else {
            handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }));
        }
    }

    function onCellPrepared(e) {
        if (e.rowType === "data") {
            if (e.data.Estado === "INACTIVO") {
                e.cellElement.style.color = "red";
            }
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

  // Metodos Detalle PopOVer
  const toggleSoloHabilitados = (e) =>{
     setSoloHabilitados(!soloHabilitados);
     setTimeout(function() {
       dataSource.loadDataWithFilter({ data: {SoloHabilitados: soloHabilitados} });
     }, 500);
  }

  const renderSoloHabilitados = () => {
    return (
      <div className="text-left" style={{ 'left': '-8px', 'position': 'relative',width:'500px' }}>
        <ControlSwitch checked={soloHabilitados}
          onChange={toggleSoloHabilitados}
        />
        <span  onClick={toggleSoloHabilitados}>{soloHabilitados ? 'Mostrar todos los trabajadores.' : 'Mostrar solo trabajadores sin validación de accesos vencidos.'}</span>
      </div>
    );
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
    cargarValidacionesAcceso(data);
    setIsVisiblePopoverEstatus(true);
  }

  const hidePopoverEstatus = () => {
    setIsVisiblePopoverEstatus(false);
  }

  const cargarValidacionesAcceso = async (data) => {
    setValidacionesAcceso([]);
    const { IdPersona } = data;
    if (data && IdPersona) {
      setTrabajadorSeleccionado(data);
      await service.listarValidacionesAcceso({ IdPersona }).then((response) => {
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



    //-CustomerDataGrid-Filter
      const keysToGenerateFilter = [
        'IdCliente',
        'IdPersona',
        'NombreCompleto',
        'Documento',
        'Activo',
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
                allowColumnReordering={true}
                allowColumnResizing={true}
                columnAutoWidth={true}
            >
                <FilterRow visible={true} showOperationChooser={false} />
                <Selection mode={props.selectionMode} />
                <HeaderFilter visible={false} />
                <FilterPanel visible={false} />

                <Column
                    dataField="RowIndex"
                    caption="#"
                    allowSorting={false}
                    allowFiltering={false}
                    allowHeaderFiltering={false}
                    width={"10%"}
                    alignment={"center"}
                    visible={false}
                />

                <Column
                dataField="IdPersona"
                caption={intl.formatMessage({ id: "COMMON.CODE" })}
                allowHeaderFiltering={false}
                allowSorting={true}
                width={"15%"}
                alignment={"center"}
                />

                <Column
                dataField="NombreCompleto"
                caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
                allowHeaderFiltering={false}
                allowSorting={true}
                />

                <Column
                dataField="Documento"
                caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}
                allowHeaderFiltering={false}
                allowSorting={true}
                />

              <Column
                dataField="Estatus"
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

    //-CustomerDataGrid-DataGrid- end
    return (
        <>
            <Popup
                visible={props.showPopup.isVisiblePopUp}
                dragEnabled={false}
                closeOnOutsideClick={true}
                showTitle={true}
                height={"750px"}
                width={"750px"}
                title={( intl.formatMessage({ id: "ACTION.SEARCH" }) +" "+ intl.formatMessage({ id: "ACCESS.REPORT.PEOPLE" })).toUpperCase()} 
                onHiding={() =>
                    props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)
                }
            >
                <Portlet>

                 {/* {props.showButton && (
                       <PortletHeaderPopUp
                           title={""}
                           toolbar={
                               <PortletHeaderToolbar>
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
                               </PortletHeaderToolbar>
                           }
                       />
                    )} 

                    <div className="pb-3">
                      <Form className="pl-5">
                        <GroupItem colCount={10}>
                          <SimpleItem colSpan={7}
                            label={{ visible: false }}
                            render={renderSoloHabilitados}
                          />
                        </GroupItem>
                      </Form>
                    </div> */}

   <div className="pb-3">
            <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" id="editForm" className="pl-5"  >

              <GroupItem itemType="group" colCount={4} >
            
                <Item 
                  label={{ visible: false }} colSpan={2}
                  render={renderSoloHabilitados}
                />
              </GroupItem>

              <GroupItem itemType="group" colSpan={3}>
                <div style={{ zIndex: +100, position: 'fixed', width: "110px", height: "35px", marginTop: "-46px", marginLeft: "564px" }}>

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
                        initialLoadOptions={{currentPage: 1,pageSize: 15,sort: { column: "NombreCompleto", order: "asc" },}}
                        filterRowSize="sm"
                        summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW",})} {0} de {1} `}
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

                      <div style={{ marginLeft:"2px" }} >
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
        </>
    );
};

TransporteTrabajadoresBuscar.propTypes = {
    showButton: PropTypes.bool,
    selectionMode: PropTypes.string,
    uniqueId: PropTypes.string,
    IdCompaniaMandante: PropTypes.string,
    IdEntidad: PropTypes.string
};
TransporteTrabajadoresBuscar.defaultProps = {
    showButton: false,
    selectionMode: "row", //['multiple', 'row','single]
    uniqueId: "TransporteTrabajadoresBuscar",
    IdCompaniaMandante: "",
    IdEntidad: ""
};

export default injectIntl(TransporteTrabajadoresBuscar);
