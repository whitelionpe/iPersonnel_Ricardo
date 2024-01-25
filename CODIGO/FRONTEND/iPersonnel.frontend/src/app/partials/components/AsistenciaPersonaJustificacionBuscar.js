import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button, TreeView } from "devextreme-react";
import {
  Portlet,
  PortletBody,
  PortletHeaderPopUp,
  PortletHeaderToolbar,
} from "../content/Portlet";
import { getDataTempLocal, isNotEmpty, setDataTempLocal } from "../../../_metronic";
import { handleErrorMessages, handleInfoMessages } from "../../store/ducks/notify-messages";
import {
  DataGrid,
  Column,
  FilterRow,
  HeaderFilter,
  FilterPanel,
  Selection,
  Button as ColumnButton
} from "devextreme-react/data-grid";
import { Popup } from "devextreme-react/popup";
import { Popover } from 'devextreme-react/popover';
import PropTypes from "prop-types";
import { useSelector } from "react-redux";

import Form, { GroupItem, Item } from "devextreme-react/form";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../store/config/Styles";

//-CustomerDataGrid-Import>
import CustomDataGrid from "../components/CustomDataGrid";
import { forceLoadTypes } from "../components/CustomDataGrid/CustomDataGridHelper";
import { storeListar as loadUrl } from "../../api/asistencia/personaJustificacion.api";

import { obtener } from "../../api/asistencia/justificacion.api";
import { listarAsignados } from "../../api/asistencia/justificacionPlanilla.api";
import { listarTreeview } from "../../api/asistencia/justificacionDivision.api";

import Alert from '@material-ui/lab/Alert';
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
import { WithLoandingPanel } from "../../partials/content/withLoandingPanel";//../../../partials/content/withLoandingPanel
import MenuTreeViewPage from "../content/TreeView/MenuTreeViewPage";
import FieldsetAcreditacion from '../content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';
 
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

const AsistenciaPersonaJustificacionBuscar = (props) => {
  const { intl, selectionMode, filtro, varIdCompania, setLoading } = props;
  const classesEncabezado = useStylesEncabezado();

  const { IdCliente } = useSelector((state) => state.perfil.perfilActual);
  const [selectedRow, setSelectedRow] = useState([]);
  const [dataRowInfo, setDataRowInfo] = useState({});
  const [dataPlanilla, setDataPlanilla] = useState([]);

  const [isVisibleAlert, setIsVisibleAlert] = useState(false);
  const [isVisiblePopoverEstatus, setIsVisiblePopoverEstatus] = useState(false);

  const [tituloPopOver, setTituloPopOver] = useState("");

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

  const [filterData, setFilterData] = useState({ IdCliente, IdCompania: isNotEmpty(varIdCompania) ? varIdCompania : "", IdPersona: filtro.IdPersona, Activo: filtro.Activo, AplicaPorDia: filtro.AplicaPorDia });
  const [
    ifThereAreNoChangesLoadFromStorage,
    setIfThereAreNoChangesLoadFromStorages,
  ] = useState(true);
  //-CustomerDataGrid-Variables-end->

  const [unidadOrganizativaTreeView, setUnidadOrganizativaTreeView] = useState([{
    Icon: "flaticon2-expand"
    , IdMenu: null
    , IdModulo: null
    , IdMenuPadre: null
    , Menu: intl.formatMessage({ id: "SYSTEM.MENU.OPTIONS" })
    , MenuPadre: null
    , Nivel: 0
    , Orden: 0
    , expanded: true
  }]);

  const celRenderInformation = ({ data }) => {
    return ( // {"link"+data.RowIndex}
      <a id={"link1"} className="fa fa-info-circle text-primary"
        style={{ fontSize: "15px" }} onClick={() => showPopoverEstatus(data)}></a>
    );
  };

  const showPopoverEstatus = (data) => {
    console.log("showPopoverEstatus|data:", data);
    setTituloPopOver(data.IdJustificacion + " - " + data.Justificacion);
    cargarJustificacion(data);
    setIsVisiblePopoverEstatus(true);
  }

  const hidePopoverEstatus = () => {
    setIsVisiblePopoverEstatus(false);
  }

  const obtenerCampoSeleccionado = rowData => {
    return rowData.selected === 1;
  }

  const cargarJustificacion = async (data) => { 
    obtenerJustificacion(data);
    listarPlanillas('ACTUALIZAR', data);
    listarDivisiones('ACTUALIZAR', data); 
  }

  async function obtenerJustificacion(data) {
    setLoading(true);
    const { IdCompania, IdJustificacion } = data
    await obtener({
      IdCliente,
      IdCompania: IdCompania,
      IdJustificacion: IdJustificacion
    }).then(response => {
      //Pendiente convertir
      response.OrigenExterno = response.OrigenExterno === 'S' ? true : false;
      response.AplicaFuturo = response.AplicaFuturo === 'S' ? true : false;
      response.AplicaPorDia = response.AplicaPorDia === 'S' ? true : false;
      response.AplicaPorHora = response.AplicaPorHora === 'S' ? true : false;
      response.AplicarDiaDescanso = response.AplicarDiaDescanso === 'S' ? true : false;
      response.Remunerado = response.Remunerado === 'S' ? true : false;
      response.ConfigurarPorSemana = response.ConfigurarPorSemana === 'S' ? true : false;
      response.ConfigurarPorDia = response.ConfigurarPorDia === 'S' ? true : false;
      response.AplicarMaximoMinutos = response.AplicarMaximoMinutos === 'S' ? true : false;
      response.RequiereObservacion = response.RequiereObservacion === 'S' ? true : false;
      response.RequiereAutorizacion = response.RequiereAutorizacion === 'S' ? true : false;
      response.EsSubsidio = response.EsSubsidio === 'S' ? true : false;
      setDataRowInfo(response); //{ ...response }
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function listarPlanillas(Accion, data) {
    const { IdCliente, IdCompania, IdJustificacion } = data;
    let resultado = await listarAsignados({ Accion: Accion, IdCliente: IdCliente, IdCompania: IdCompania, IdJustificacion: isNotEmpty(IdJustificacion) ? IdJustificacion : "%" });
    setDataPlanilla(resultado);
    if (resultado.length === 0) {
      setIsVisibleAlert(true);
    } else {
      setIsVisibleAlert(false);
    }
  }

  async function listarDivisiones(Accion, data) {
    const { IdCliente, IdJustificacion, IdCompania } = data;
    await listarTreeview({
      Accion: Accion,
      IdCliente: IdCliente,
      IdDivision: '%',
      IdJustificacion: isNotEmpty(IdJustificacion) ? IdJustificacion : "%",
      IdCompania: varIdCompania
    }).then(dataTreeView => {
      if (!isNotEmpty(dataTreeView)) {
        //Sin data , mostrar por defecto.
        setUnidadOrganizativaTreeView([{
          Activo: "S"
          , icon: "flaticon2-expand"
          , IdMenu: null
          , IdMenuPadre: null
          , IdModulo: ""
          , Menu: "-SIN DATOS-"
          , MenuPadre: null
          , expanded: true
        }])
      } else {
        setUnidadOrganizativaTreeView(dataTreeView);
        // seleccionarNodo([],dataTreeView)
      }

      console.log("unidadOrganizativaTreeView :::::: ", unidadOrganizativaTreeView);
    }).catch(err => {
    }).finally();

  }



  const renderGenerales = (e) => {
    return (
      <>
        <Form formData={dataRowInfo} validationGroup="FormEdicionx"  >
          <GroupItem itemType="group" colCount={2} >
            <Item colSpan={2}
              dataField="EsSubsidio"
              label={{
                text: "Check",
                visible: false
              }}
              editorType="dxCheckBox"
              editorOptions={{
                readOnly: true,
                text: "¿Es Subsidio?",
                width: "100%"
              }}
            />
            <Item colSpan={2}
              dataField="Remunerado"
              label={{
                text: "Check",
                visible: false
              }}
              editorType="dxCheckBox"
              editorOptions={{
                readOnly: true,
                text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.PAID" }),
                width: "100%"
              }}
            />
            <Item colSpan={2}
              dataField="OrigenExterno"
              label={{
                text: "Check",
                visible: false
              }}

              editorType="dxCheckBox"
              editorOptions={{
                readOnly: true,
                text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.EXTERNALORIGIN" }),
                width: "100%"
              }}
            />

            <Item colSpan={2}
              dataField="AplicaFuturo"
              label={{
                text: "Check",
                visible: false
              }}

              editorType="dxCheckBox"
              editorOptions={{
                readOnly: true,
                text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.APPLYFUTURE" }),
                width: "100%"
              }}
            />
            <Item colSpan={2}
              dataField="RequiereObservacion"
              label={{
                text: "Check",
                visible: false
              }}

              editorType="dxCheckBox"
              editorOptions={{
                readOnly: true,
                text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.REQUIRESOBSERVATION" }),
                width: "100%"
              }}
            />

            <Item colSpan={2}
              dataField="RequiereAutorizacion"
              label={{
                text: "Check",
                visible: false
              }}

              editorType="dxCheckBox"
              editorOptions={{
                readOnly: true,
                text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.AUTHORIZATION" }),
                width: "100%"
              }}
            />
            <Item colSpan={2} ></Item>
            <Item colSpan={2}
              dataField="AplicarDiaDescanso"
              label={{ text: "Check", visible: false }}
              editorType="dxCheckBox"
              editorOptions={{
                readOnly: true,
                text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.APPLYDAYOFF" }),
                width: "100%"
              }}
            />
            <Item colSpan={2}
              dataField="AplicaPorDia"
              label={{ text: "Check", visible: false }}
              editorType="dxCheckBox"
              editorOptions={{
                readOnly: true,
                text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.APPLYDAY" }),
                width: "100%"
              }}
            />

            <Item colSpan={2}
              dataField="AplicaPorHora"
              label={{ text: "Check", visible: false }}
              editorType="dxCheckBox"
              editorOptions={{
                readOnly: true,
                text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.APPLYTIME" }),
                width: "100%"
              }}
            />
            <Item colSpan={2} ></Item>
            <Item
              dataField="AplicarMaximoMinutos"
              label={{
                text: "Check",
                visible: false
              }}

              editorType="dxCheckBox"
              editorOptions={{
                readOnly: true,
                text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.APPLYMAXIMUMHOURS" }),
                width: "100%"
              }}
            />
            <Item
              dataField="MaximoMinutos"
              label={{
                text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.NUMBER", }), visible: false
              }}
              editorType="dxNumberBox"
              dataType="number"
              editorOptions={{
                readOnly: true,
                inputAttr: { style: "text-transform: uppercase; text-align: right" },
                showSpinButtons: true,
                showClearButton: true,
                width: "50%",
                min: 1,
                max: 99
              }}
            >
            </Item>

            <Item
              dataField="ConfigurarPorDia"
              label={{ text: "Check", visible: false }}
              editorType="dxCheckBox"
              editorOptions={{
                readOnly: true,
                text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.SETBYDAY" }),
                width: "100%"
              }}
            />

            <Item
              dataField="NumeroVecesPorDia"
              label={{
                text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.NUMBERTIMESPERDAY", }), visible: false
              }}
              editorType="dxNumberBox"
              dataType="number"
              editorOptions={{
                readOnly: true,
                inputAttr: { style: "text-transform: uppercase; text-align: right" },
                showSpinButtons: true,
                showClearButton: true,
                width: "50%",
                min: 1,
                max: 472
              }}
            >
            </Item>

            <Item
              dataField="ConfigurarPorSemana"
              label={{
                text: "Check",
                visible: false
              }}
              editorType="dxCheckBox"
              editorOptions={{
                readOnly: true,
                text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.NUMBEROFTIMESPERWEEK" }),
                width: "100%",
                min: 1,
                max: 99
              }}
            />

            <Item
              dataField="NumeroVecesPorSemana"
              label={{
                text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.SETBYWEEK" }), visible: false
              }}
              editorType="dxNumberBox"
              dataType="number"
              editorOptions={{
                readOnly: true,
                inputAttr: { style: "text-transform: uppercase; text-align: right" },
                showSpinButtons: true,
                showClearButton: true,
                width: "50%",
                min: 1,
                max: 99
              }}
            >
            </Item>



          </GroupItem>
        </Form>
      </>
    );
  }

  const renderPlanillas = (e) => {
    return (
      <>
        {isVisibleAlert && (
          <Alert severity="warning" variant="outlined">
            <div style={{ color: 'red' }} >
              {intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.MSG1" })} {" "} {intl.formatMessage({ id: "ASSISTANCE.PAYROLL.MSG2" })}
            </div>
          </Alert>
        )}
        <br />

        <DataGrid
          dataSource={dataPlanilla}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="IdPlanilla"
        >
          <Column dataType="boolean" caption={""} calculateCellValue={obtenerCampoSeleccionado} width={"20%"} />
          <Column dataField="IdPlanilla" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"40%"} alignment={"center"} />
          <Column dataField="Planilla" caption={intl.formatMessage({ id: "ASSISTANCE.PAYROLL" })} width={"40%"} />
        </DataGrid>

      </>
    );
  }

  const renderSedes = (e) => {
    return (
      <>
        <div id="divTreeViewDivision">
          <MenuTreeViewPage
            menus={unidadOrganizativaTreeView}
            showCheckBoxesModes={"normal"}
            searchEnabled={false}
            modoEdicion={false}
            height={"200"}
            selectionMode={"multiple"}
          //seleccionarNodo={seleccionarNodo} 
          />
        </div>
      </>

    )
  }

  const contentRenderPopoverInformation = () => {
    return (
      <>
        <Portlet> 
          <React.Fragment>  
            <br />
            <div className="row">
              <div className="col-md-6">
                <div className="card mb-3"  >
                <FieldsetAcreditacion title={intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS" })}>
                  <div className="card-body" >
                    {renderGenerales()}
                  </div>
                  </FieldsetAcreditacion>
                </div>

              </div>
              <div className="col-md-6">
                <div className="card mb-3" >
                <FieldsetAcreditacion title={intl.formatMessage({ id: "ASSISTANCE.ASSIGNMENT.PAYROLL" })}>
                  <div className="card-body" >
                    {renderPlanillas()}
                  </div>
                </FieldsetAcreditacion>  
                </div>

                <div className="card mb-3" >
                <FieldsetAcreditacion title={intl.formatMessage({ id: "ASSISTANCE.ASSIGNMENT.VENUES" })}>
                   <div className="card-body" > 
                    {renderSedes()}
                   </div> 
                </FieldsetAcreditacion>
                </div>
              </div>
            </div>

          </React.Fragment> 
        </Portlet>

      </>
    );
  }


  function aceptar() {

    let dataSelected = [];
    if (selectionMode === "row" || selectionMode === "single") {
      let getData = getDataTempLocal('selectRowData');
      dataSelected = [{ ...getData }];
    } else {
      dataSelected = selectedRow;
    }

    if (dataSelected.length > 0) {
      props.selectData(dataSelected);
      props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
    } else {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }));
    }

  }

  function onCellPrepared(e) {
    if (e.rowType === "data") {
      if (e.data.Activo === "N") {
        e.cellElement.style.color = "red";
      }
    }
  }
  const seleccionarRegistro = (evt) => {
    if (!customDataGridIsBusy) {
      if (selectionMode === "row" || selectionMode === "single") {
        if (isNotEmpty(evt.row.data)) setDataTempLocal('selectRowData', evt.row.data);
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
        props.selectData([{ ...evt.data }]);
        props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
      }
    }
  }


  function onCellPreparedPorDia(e) {
    const { AplicaPorDia } = e.data;
    return (

      <div>
        {AplicaPorDia === "S" && (
          <span
            title={intl.formatMessage({ id: "COMMON.ACTIVE" })}
          >
            <i className="fas fa-circle  text-warning icon-10x" ></i>
          </span>
        )}
      </div>

    );

  }

  function onCellPreparedPorHora(e) {
    const { AplicaPorHora } = e.data;
    return (

      <div>
        {AplicaPorHora === "S" && (
          <span
            title={intl.formatMessage({ id: "COMMON.ACTIVE" })}
          >
            <i className="fas fa-circle  text-info icon-10x" ></i>
          </span>
        )}
      </div>

    );

  }

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
    if (filtro) {
      const { IdCliente, IdCompania, Activo,AplicaPorDia ,IdPersona} = filtro; 
      dataSource.loadDataWithFilter({ data: { IdCliente, IdCompania, AplicaPorDia: AplicaPorDia, Activo:Activo,IdPersona } });
    }
  }, [filtro]);

  //-CustomerDataGrid-Filter
  const keysToGenerateFilter = [
    "IdCliente",
    "IdCompania",
    "IdJustificacion",
    "Justificacion",
    "Activo", 
    "IdPersona",
    "AplicaPorDia",
    "AplicaPorHora",
    "RequiereObservacion"
  ];
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
          dataField="Compania"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" })}
          allowHeaderFiltering={false}
          allowSorting={true} alignment={"center"}
          visible={false}
        />
        <Column
          dataField="IdJustificacion"
          caption={intl.formatMessage({ id: "COMMON.CODE" })}
          width={"22%"} allowHeaderFiltering={false}
          allowSorting={true}
          alignment={"center"}
        />
        <Column
          dataField="Justificacion"
          caption={intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION" })}
          width={"38%"}
          allowHeaderFiltering={false}
          allowSorting={true} alignment={"left"}
        />
        <Column
          dataField="EsSubsidio"
          caption= "Subsidio"
          width={"15%"}
          allowHeaderFiltering={false}
          allowSorting={true} 
          alignment={"center"}
        />
        <Column dataField="AplicaPorDia"
          caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY" })}
          cellRender={onCellPreparedPorDia}
          alignment={"center"}
          allowHeaderFiltering={false}
          allowSorting={false}
          allowFiltering={false}
          width={"7%"}
        />

        <Column dataField="AplicaPorHora"
          caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.HOUR" })}
          cellRender={onCellPreparedPorHora}
          alignment={"center"}
          allowHeaderFiltering={false}
          allowSorting={false}
          allowFiltering={false}
          width={"8%"}
        /> 

        <Column
          //dataField="Estatus"
          width="5%"
          //caption="Estatus"
          cellRender={celRenderInformation}
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
        height={"600px"}
        width={"600px"}
        title={(
          intl.formatMessage({ id: "ACTION.SEARCH" }) +
          " " +
          intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION" })
        ).toUpperCase()}
        onHiding={() =>
          props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)
        }
      >
        <Portlet>

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
              sort: { column: "Justificacion", order: "asc" },
            }}
            filterRowSize="sm"
            summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}
            // CUSTOM FILTER
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


      <Popover
        target={"#link1"}
        position="left"
        width={850}
        showTitle={true}
        title={(intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICACION.SEARCH_TITLE" }) + " : " + tituloPopOver).toUpperCase()}
        visible={isVisiblePopoverEstatus}
        onHiding={hidePopoverEstatus}
        shading={true}
        shadingColor="rgba(0, 0, 0, 0.5)"
        animation={animationConfig}
        contentRender={contentRenderPopoverInformation}
      >
      </Popover>

    </>
  );




};

AsistenciaPersonaJustificacionBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
  varIdCompania: PropTypes.string
};
AsistenciaPersonaJustificacionBuscar.defaultProps = {
  showButton: false,
  selectionMode: "row", //['multiple', 'row','single]
  uniqueId: "asistenciaJustificacion",
  varIdCompania: ""
};
export default injectIntl(WithLoandingPanel(AsistenciaPersonaJustificacionBuscar));
