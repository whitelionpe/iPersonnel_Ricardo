import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  DataGrid,
  Column,
  Editing,
  Paging,
  Pager,
  FilterRow,
  HeaderFilter,
  FilterPanel,
  Summary,
  TotalItem,
  Button as ColumnButton
} from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar
} from "../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import FileViewer from "../../../../partials/content/FileViewer";
import { downloadFile } from "../../../../api/helpers/fileBase64.api";
import {
  handleErrorMessages,
  handleSuccessMessages
} from "../../../../store/ducks/notify-messages";
import { listar as listarTipoContrato } from "../../../../api/administracion/tipoContrato.api";
import { isNotEmpty, listarEstadoSimple, listarEstado } from "../../../../../_metronic";
import { obtenerTodos as listarServicio } from "../../../../api/administracion/servicio.api";
import { obtenerTodos as obtenerTodosDivision } from "../../../../api/sistema/division.api";
import AdministracionUnidadOrganizativaBuscar from "../../../../partials/components/AdministracionUnidadOrganizativaBuscar";
import AdministracionDivisionBuscar from "../../../../partials/components/AdministracionDivisionBuscar";
import AdministracionContratoDivisionOPeradorBuscar from "../../../../partials/components/AdministracionContratoDivisionOPeradorBuscar";
import SimpleDropDownBoxGrid from "../../../../partials/components/SimpleDropDownBoxGrid/SimpleDropDownBoxGrid";

//Custom grid: ::::::::::::::::::::::::::::::::
import { Item, GroupItem } from "devextreme-react/form";
import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { storeListar as loadUrl, serviceContrato } from "../../../../api/administracion/contrato.api";
import WithLoandingPanel from "../../../../partials/content/withLoandingPanel";

const ContratoListPage = props => {
  const { intl, setLoading, accessButton, showButtons } = props;


  const perfil = useSelector(state => state.perfil.perfilActual);

  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const [isVisiblePopUpDivision, setisVisiblePopUpDivision] = useState(false);
  const [isVisiblePopUpPersonas, setisVisiblePopUpPersonas] = useState(false);


  const [estado, setEstado] = useState([]);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [servicioSeleccionados, setServiciosSeleccionados] = useState([]);
  const [tipoContrato, settipoContrato] = useState([]);
  const [divisiones, setDivisiones] = useState([]);


  //Custom grid: ::::::::::::::::::::::::::::::::
  const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({
    Activo: "S",
    IdCliente: perfil.IdCliente,
    IdDivision: perfil.IdDivision,
    Division: perfil.Division
  });
  //const [filterData, setFilterData] = useState({ ...initialFilter });
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;
  let dataGridRef = React.useRef();

  const keysToGenerateFilter = [
    "IdCliente",
    "CompaniaMandante",
    "CompaniaContratista",
    "IdContrato",
    "Asunto",
    "FechaInicio",
    "FechaFin",
    "NombreArchivo",
    "Servicios",
    "IdTipoContrato",
    "Dotacion",
    "IdUnidadOrganizativa",
    "FlgVehiculos",
    "FlgAdendas",
    "Activo",
    "IdDivision",
    "Division",
    "IdOperador",
    "FlgSubContratista",
    "UnidadesOrganizativas",
    "Documento"
  ];
  //:::::::::::::::::::::::::::::::::::::::::::::
  const [fileBase64, setFileBase64] = useState();
  const [fileName, setFileName] = useState();
  const [isVisiblePopUpFile, setisVisiblePopUpFile] = useState(false);



  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem>
        <GroupItem itemType="group" colCount={2} colSpan={2}>

          <Item
            dataField="Division"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.DIVISION.NAME" }), }}
            editorOptions={{
              //valueExpr:perfil.IdDivision,
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
                    onClick: (evt) => {
                      setisVisiblePopUpDivision(true);
                    },
                  },
                },
              ],
            }}
          />

          <Item
            dataField="UnidadesOrganizativasDescripcion"
            label={{
              text: intl.formatMessage({
                id: "ADMINISTRATION.POSITION.ORGANIZATIONALUNIT"
              })
            }}
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
                      setPopupVisibleUnidad(true);
                    }
                  }
                }
              ]
            }}
          />

          <Item
            dataField="IdTipoContrato"
            label={{
              text: intl.formatMessage({
                id: "ADMINISTRATION.CONTRACT.CONTRACTTYPE"
              })
            }}
            editorType="dxSelectBox"
            editorOptions={{
              items: tipoContrato,
              valueExpr: "IdTipoContrato",
              displayExpr: "TipoContrato",
              onValueChanged: () => getInstance().filter()
            }}
          />

          <Item
            dataField="Operadores"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATOR.CONTRACT.OPERATOR" }), }}
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
                    onClick: (evt) => {
                      setisVisiblePopUpPersonas(true);
                    },
                  },
                },
              ],
            }}
          />


          <Item
            dataField="FlgSubContratista"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATOR.CONTRACT.SUBCONTRACTOR" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: estado,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              onValueChanged: () => getInstance().filter()
            }}
          />


          <Item
            dataField="Servicios"
            label={{
              text: intl.formatMessage({
                id: "ADMINISTRATION.CONTRACT.SERVICES"
              })
            }}
          >
            <SimpleDropDownBoxGrid
              ColumnDisplay={"Servicio"}
              placeholder={"Select a value..."}
              SelectionMode="multiple"
              dataSource={servicios}
              Columnas={[
                {
                  dataField: "Servicio",
                  caption: intl.formatMessage({
                    id: "CAMP.RESERVATION.SERVICES"
                  }),
                  width: "100%"
                }
              ]}
              setSeleccionados={setServiciosSeleccionados}
              Seleccionados={servicioSeleccionados}
              pageSize={10}
              pageEnabled={true}
            />
          </Item>


          <Item
            dataField="FlgVehiculos"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATOR.CONTRACT.VEHICLE" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: estado,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              onValueChanged: () => getInstance().filter()
            }}
          />

          <Item
            dataField="Activo"
            label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: estadoSimple,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              onValueChanged: () => getInstance().filter()
            }}
          />


          <Item
            dataField="Dotacion"
            label={{
              text: intl.formatMessage({
                id: "ADMINISTRATION.CONTRACT.ENDOWMENT"
              })
            }}
            visible={false}
            editorType="dxNumberBox"
            editorOptions={{
              maxLength: 5,
              onValueChanged: () => getInstance().filter()
            }}
          />


          <Item
            dataField="FlgAdendas"
            label={{ text: intl.formatMessage({ id: "¿Manejan Adendas?" }) }}
            visible={false}
            editorType="dxSelectBox"
            editorOptions={{
              items: estado,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              onValueChanged: () => getInstance().filter()
            }}
          />



        </GroupItem>
      </GroupItem>
    );
  };

  const renderDataGrid = ({ gridRef, dataSource }) => {
    if (dataSource._storeLoadOptions.filter !== undefined) {
      if (props.totalRowIndex === 0) {
        props.setTotalRowIndex(dataSource._totalCount);
      }
      if (dataSource._totalCount != props.totalRowIndex) {
        if (dataSource._totalCount != -1) {
          props.setVarIdContrato("")
          props.setFocusedRowKey();
          props.setTotalRowIndex(dataSource._totalCount);
        }
      }
    }
    dataGridRef = gridRef;
    return (
      <DataGrid
        //Custom grid: ::::::::::::::::::::::::::::::::
        dataSource={dataSource}
        ref={gridRef}
        //:::::::::::::::::::::::::::::::::::::::::::::
        remoteOperations={true}
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="RowIndex"
        onFocusedRowChanged={seleccionarRegistro}
        onRowDblClick={seleccionarRegistroDblClick}
        focusedRowKey={props.focusedRowKey}
        onCellPrepared={onCellPrepared}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
      >
        <Editing
          mode="row"
          useIcons={true}
        />

        <FilterRow visible={true} showOperationChooser={false} />
        <HeaderFilter visible={false} />
        <FilterPanel visible={false} />

        <Column
          dataField="RowIndex"
          caption="#"
          width={25}
          alignment={"center"}
        />
        <Column
          dataField="CompaniaMandante"
          caption={intl.formatMessage({
            id: "ADMINISTRATION.CONTRACT.CLIENTCOMPANY.NAME"
          })}
          width={"20%"}
          alignment={"left"}
        />

        <Column
          dataField="CompaniaContratista"
          caption={intl.formatMessage({
            id: "ADMINISTRATION.CONTRACT.CONTRACTORCOMPANY.ABR"
          })}
          width={"15%"}
          alignment={"left"}
        />
        <Column
          dataField="Documento"
          caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.RUC" })}
          alignment={"center"}
          width={"9%"}
        />

        <Column
          dataField="IdContrato"
          caption={intl.formatMessage({
            id: "ADMINISTRATION.CONTRACT.CONTRACT"
          })}
          width={"15%"}
        />
        <Column
          dataField="Asunto"
          caption={intl.formatMessage({
            id: "ADMINISTRATION.CONTRACT.SUBJECT"
          })}
          width={"15%"}
        />
        <Column
          dataField="FechaInicio"
          caption={intl.formatMessage({
            id: "ADMINISTRATION.CONTRACT.STARTDATE"
          })}
          width={"10%"}
          dataType="date"
          format="dd/MM/yyyy"
          alignment="center"
          allowSearch={false}
          allowFiltering={false}
        />
        <Column
          dataField="FechaFin"
          caption={intl.formatMessage({
            id: "ADMINISTRATION.CONTRACT.ENDDATE"
          })}
          width={"10%"}
          dataType="date"
          format="dd/MM/yyyy"
          alignment="center"
          allowSearch={false}
          allowFiltering={false}
        />
        <Column
          dataField="FechaCreacion"
          caption={intl.formatMessage({
            id: "AUDIT.CREATIONDATE"
          })}
          dataType="date"
          format="dd/MM/yyyy"
          alignment="center"
          visible={false}
        />
        <Column
          dataField="Activo"
          dataType="boolean"
          caption={intl.formatMessage({ id: "COMMON.ACTIVE" })}
          calculateCellValue={obtenerCampoActivo}
          width={"7%"}
          alignment={"center"}
          allowSorting={false}
          allowSearch={false}
          allowFiltering={false}
        />

        <Column type="buttons" visible={true}>
          <ColumnButton
            icon="edit"
            hint={intl.formatMessage({ id: "ACTION.EDIT" })}
            onClick={editarRegistro}
            visible={(showButtons && accessButton.editar) ? true : false}
          />
          <ColumnButton
            icon="trash"
            hint={intl.formatMessage({ id: "ACTION.REMOVE" })}
            onClick={eliminarRegistro}
            visible={((showButtons && accessButton.eliminar) ? true : false) ? true : false}
          />
          <ColumnButton
            icon="group"
            hint={intl.formatMessage({ id: "CASINO.PERSON.GROUP.PERSONS" })}
            onClick={mostrarPersonas}
          />
        </Column>
      </DataGrid>
    );
  };

  async function cargarCombos() {
    let estado = listarEstado();
    let estadoSimples = listarEstadoSimple();

    let divisiones = await obtenerTodosDivision({ IdCliente: perfil.IdCliente })
    let tmp_Servicios = await listarServicio({});
    let tipoContrato = await listarTipoContrato({
      IdCliente: perfil.IdCliente,
      NumPagina: 0,
      TamPagina: 0
    });

    setEstadoSimple(estadoSimples);
    setEstado(estado);
    setDivisiones(divisiones);
    setServicios(
      tmp_Servicios.map(x => ({
        IdServicio: x.IdServicio,
        Servicio: x.Servicio,
        Check: true
      }))
    );
    settipoContrato(tipoContrato);
  }

  const selectUnidadOrganizativa = async (selectedRow) => {
    let strUnidadesOrganizativas = selectedRow.map(x => x.IdUnidadOrganizativa).join('|');
    let UnidadesOrganizativasDescripcion = selectedRow.map(x => x.Menu).join(',');
    props.dataSource.loadDataWithFilter({ data: { UnidadesOrganizativas: strUnidadesOrganizativas, UnidadesOrganizativasDescripcion } });
    setPopupVisibleUnidad(false);
  };

  const agregarDivision = (division) => {
    const { IdDivision, Division } = division
    props.dataSource.loadDataWithFilter({
      data: { IdDivision, Division: `${IdDivision} - ${Division}` }
    });
  };

  async function agregarPersonaGrupo(personas) {
    const { IdPersona, NombreCompleto } = personas[0];
    props.dataSource.loadDataWithFilter({
      data: { IdOperador: IdPersona, NombreCompleto }
    });

    setisVisiblePopUpPersonas(false);
  }

  //Custom grid: ::::::::::::::::::::::::::::::::
  useEffect(() => {
    let strServicios = servicioSeleccionados.filter(x => x.Check).map(x => (x.IdServicio)).join('|');
    if (strServicios) {
      props.dataSource.loadDataWithFilter({ data: { Servicios: strServicios } });
    }
  }, [servicioSeleccionados]);

  useEffect(() => {
    cargarCombos();
    if (ifThereAreNoChangesLoadFromStorage)
      setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage]);

  useEffect(() => {
    if (props.refreshData) {
      props.refresh();
      props.setRefreshData(false);
    }
  }, [props.refreshData]);

  const editarRegistro = evt => {
    props.editarRegistro(evt.row.data);
  };

  const eliminarRegistro = evt => {
    let data = evt.row.data;
    props.eliminarRegistro(data);
  };

  const mostrarPersonas = evt => {
    props.mostrarPopUpPersonas(evt.row.data);
  };

  const obtenerCampoActivo = rowData => {
    return rowData.Activo === "S";
  };

  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  };

  const seleccionarRegistroDblClick = evt => {
    if (evt.data === undefined) return;
    if (isNotEmpty(evt.data)) {
      props.verRegistroDblClick(evt.data);
    }
  };

  function onCellPrepared(e) {
    if (e.rowType === "data") {
      if (e.data.Activo === "N") {
        e.cellElement.style.color = "red";
      }
    }
  }

  const exportReport = async () => {

    let result = JSON.parse(localStorage.getItem('vcg:contratoList:loadOptions'));
    if (!isNotEmpty(result)) return;
    for (let i = 0; i < result.filter.length; i++) {
      let currentValue = result.filter[i];

      if (currentValue instanceof Array) {

        for (let j = 0; j < currentValue.length; j++) {

          filterData[currentValue[0]] = currentValue[2];
        }
      }
    }
    //obtener orden para exportar
    const { selector } = result.sort[0];

    const { IdCliente, CompaniaMandante, CompaniaContratista, IdContrato, Contrato, Asunto, FechaInicio, FechaFin,
      NombreArchivo, Servicios, IdTipoContrato, Dotacion, IdUnidadOrganizativa, FlgVehiculos, FlgAdendas, Activo, IdDivision, IdOperador,
      FlgSubContratista, UnidadesOrganizativas, IdCompaniaContratista, Documento } = filterData;


    if (dataGridRef.current.props.dataSource._items.length > 0) {

      let ListColumnName = [];
      let ListDataField = [];

      dataGridRef.current._optionsManager._currentConfig.configCollections.columns.map(item => {
        if ((item.options.visible === undefined || item.options.visible === true) && item.options.type != 'buttons') {
          ListColumnName.push(item.options.caption.toUpperCase());
          ListDataField.push(item.options.dataField);
        }
      })
      var ArrayColumnHeader = ListColumnName.join('|');
      var ArrayColumnId = ListDataField.join('|');

      let params = {
        IdCliente: IdCliente,
        IdDivision: IdDivision,
        CompaniaMandante: isNotEmpty(CompaniaMandante) ? CompaniaMandante : "",
        Documento: isNotEmpty(Documento) ? Documento : "",
        CompaniaContratista: isNotEmpty(CompaniaContratista) ? CompaniaContratista : "",
        IdContrato: isNotEmpty(IdContrato) ? IdContrato : "",
        Contrato: isNotEmpty(Contrato) ? Contrato : "",
        Asunto: isNotEmpty(Asunto) ? Asunto : "",
        FechaInicio: isNotEmpty(FechaInicio) ? FechaInicio : "",
        FechaFin: isNotEmpty(FechaFin) ? FechaFin : "",
        NombreArchivo: isNotEmpty(NombreArchivo) ? NombreArchivo : "",
        IdItemSharepoint: "",
        Servicios: isNotEmpty(Servicios) ? Servicios : "",
        IdTipoContrato: isNotEmpty(IdTipoContrato) ? IdTipoContrato : "",
        Dotacion: isNotEmpty(Dotacion) ? Dotacion : "",
        IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa : "",
        FlgVehiculos: isNotEmpty(FlgVehiculos) ? FlgVehiculos : "",
        FlgAdendas: isNotEmpty(FlgAdendas) ? FlgAdendas : "",
        Activo: isNotEmpty(Activo) ? Activo : "",
        IdOperador: isNotEmpty(IdOperador) ? IdOperador : "",
        FlgSubContratista: isNotEmpty(FlgSubContratista) ? FlgSubContratista : "",
        UnidadesOrganizativas: isNotEmpty(UnidadesOrganizativas) ? UnidadesOrganizativas : "",
        IdCompaniaContratista: isNotEmpty(IdCompaniaContratista) ? IdCompaniaContratista : "",
        TituloHoja: intl.formatMessage({ id: "ADMINISTRATION.EXPORT_CONTRACTS" }),
        NombreHoja: intl.formatMessage({ id: "ADMINISTRATION.EXPORT_CONTRACTS" }),
        ArrayColumnHeader,
        ArrayColumnId,
        OrderField: selector
      };
      setLoading(true);
      await serviceContrato.exportarExcel(params).then(response => {
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


  return (
    <>
      <a id="iddescarga" className="" ></a>
      <PortletHeader
        title={intl.formatMessage({ id: "ACTION.LIST" })}
        toolbar={
          <PortletHeaderToolbar>

            <Button
              icon="plus"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.NEW" })}
              onClick={props.nuevoRegistro}
              disabled={!accessButton.nuevo}
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
              icon="refresh"
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
              onClick={exportReport}
              disabled={!accessButton.exportar}
            />

          </PortletHeaderToolbar>
        }
      />
      <PortletBody>
        <CustomDataGrid
          showLog={false}
          uniqueId="contratoList"
          dataSource={props.dataSource}
          rowNumberName="RowIndex"
          loadWhenStartingComponent={
            props.isFirstDataLoad && !props.refreshData
          }
          renderDataGrid={renderDataGrid}
          loadUrl={loadUrl}
          forceLoad={forceLoadTypes.Unforced}
          sendToServerOnlyIfThereAreChanges={true}
          ifThereAreNoChangesLoadFromStorage={
            ifThereAreNoChangesLoadFromStorage
          }
          caseSensitiveWhenCheckingForChanges={true}
          uppercaseFilterRow={true}
          initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: "FechaInicio", order: "desc" } }}
          filterRowSize="sm"
          summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}
          visibleCustomFilter={isActiveFilters}
          renderFormContentCustomFilter={renderFormContentCustomFilter}
          keysToGenerateFilter={keysToGenerateFilter}
          filterData={filterData}
          paginationSize="md"
          onLoading={() => setCustomDataGridIsBusy(true)}
          onError={() => setCustomDataGridIsBusy(false)}
          onLoaded={() => setCustomDataGridIsBusy(false)}
        />
      </PortletBody>

      {isVisiblePopUpFile && (
        <FileViewer
          showPopup={{
            isVisiblePopUp: isVisiblePopUpFile,
            setisVisiblePopUp: setisVisiblePopUpFile
          }}
          fileBase64={fileBase64}
          fileName={fileName}
          cancelar={() => setisVisiblePopUpFile(false)}
        //openNewTab={ openNewTab}
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


      {/* POPUP-> Buscar Divisiòn */}
      {isVisiblePopUpDivision && (
        <AdministracionDivisionBuscar
          dataSource={divisiones}
          showPopup={{ isVisiblePopUp: isVisiblePopUpDivision, setisVisiblePopUp: setisVisiblePopUpDivision }}
          cancelar={() => setisVisiblePopUpDivision(false)}
          selectData={agregarDivision}
          selectionMode={"row"}
        />
      )}


      {/* POPUP-> Buscar Persona */}
      {isVisiblePopUpPersonas && (
        <AdministracionContratoDivisionOPeradorBuscar
          showPopup={{ isVisiblePopUp: isVisiblePopUpPersonas, setisVisiblePopUp: setisVisiblePopUpPersonas }}
          cancelar={() => setisVisiblePopUpPersonas(false)}
          agregar={agregarPersonaGrupo}
          selectionMode={"row"}
        />
      )}

    </>
  );
};

export default injectIntl(WithLoandingPanel(ContratoListPage));
