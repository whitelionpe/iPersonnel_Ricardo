import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import {
  DataGrid,
  Column,
  Editing,
  FilterRow,
  HeaderFilter,
  FilterPanel,
  Selection,
  Scrolling
} from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import Form, { Item, GroupItem } from "devextreme-react/form";
import {
  Portlet,
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar
} from "../../../../partials/content/Portlet";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { exportarPersonasPorContrato, storeListarPersonasPorContrato as loadUrl } from "../../../../api/administracion/contrato.api";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";

import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import ScrollView from 'devextreme-react/scroll-view';
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { handleInfoMessages, handleErrorMessages } from "../../../../store/ducks/notify-messages";

import CambiarPersonaContratoEditPage from "./CambiarPersonaContratoEditPage";
import AmpliarPersonaContratoEditPage from "./AmpliarPersonaContratoEditPage";
import { isNotEmpty } from "../../../../../_metronic";
import notify from 'devextreme/ui/notify';
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import AdministracionPersonaBuscar from "../../../../partials/components/AdministracionPersonaBuscar";
import PersonaTextAreaPopup from "../../../../partials/components/PersonaTextAreaPopup/PersonaTextAreaPopup";

export const initialFilter = {
  Activo: "S", //S > Activos , N > Inactivos , "" > Todos  
  IdCliente: "",
  Documento: "",
  IdCompaniaMandante: "",
  IdCompaniaContratista: "",
  IdDivision: "",
  IdUnidadOrganizativa: ""
};

const AdministracionContratoPersonas = props => {
  const { intl, setLoading, selectionMode, accessButton, dataRowEditNew } = props;
  const { IdCliente } = useSelector((state) => state.perfil.perfilActual);
  const [dataGridRef, setDataGridRef] = useState(null);

  //FILTRO- CustomerDataGrid
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({
    store: new ArrayStore({ data: [], key: "RowIndex" }),
    reshapeOnPush: false,
  });

  const [dataSource] = useState(ds);
  //const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const { IdCompaniaMandante, IdCompaniaContratista, IdContrato } = props.filtroLocal;
  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdCompaniaMandante, IdCompaniaContratista, IdContrato, Activo: activeFilterWorkers });
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages,] = useState(true);

  const [activeFilterWorkers, setActiveFilterWorkers] = useState("S"); //Activar el filtro de Trabajadores activos.Por defecto es "S" para mostrar trabajadores activos
  const [activeSwitch, setActiveSwitch] = useState(false); //Swtich para activar la busqueda de trabajadores inactivos
  const [openChangeContract, setOpenChangeContract] = useState(false);
  const [openAmpliarContract, setOpenAmpliarContract] = useState(false);
  const [selectedRow, setSelectedRow] = useState([]);
  const [popupVisiblePersonas, setPopupVisiblePersonas] = useState(false);

  const validarRegistrosSeleccionadosAmpliacion = () => {

    if (selectedRow.length > 0) {
      setOpenAmpliarContract(true);
    }
    else {
      //setOpenChangeContract(false);
      notify(intl.formatMessage({ id: "ADMINISTRATION.PERSON.VALIDATION.MESSAGE.SELECT.WORKER" }), 'error', 1500);
    }

  };

  const validarRegistrosSeleccionados = () => {

    if (selectedRow.length > 0) {
      setOpenChangeContract(true);
    }
    else {
      //setOpenChangeContract(false);
      notify(intl.formatMessage({ id: "ADMINISTRATION.PERSON.VALIDATION.MESSAGE.SELECT.WORKER" }), 'error', 1500);
    }

  };

  //LIMPIAR FORMULARIO
  const clearRefresh = () => {
    dataSource.loadDataWithFilter({
      data: {
        IdCliente,
        IdCompaniaMandante,
        IdCompaniaContratista,
        IdContrato,
        Activo: activeFilterWorkers,
        Documento: ''
      }
    });
    resetLoadOptions();
  }

  async function obtenerDocumentos(data) {

    if (isNotEmpty(data)) {
      let strPersonas = data.split('|').join(',');
      //console.log(strPersonas);
      //props.dataSource.loadDataWithFilter({ data: { Personas: strPersonas } });
      dataSource.loadDataWithFilter({
        data: {
          IdCliente, IdCompaniaMandante,
          IdCompaniaContratista, IdContrato, Activo: activeFilterWorkers, Documento: strPersonas
        }
      });
    }

    setPopupVisiblePersonas(false);
  }


  //Custom grid: ::::::::::::::::::::::::::::::::
  const exportData = async () => {

    if (dataSource._items.length > 0) {

      let ListColumnName = [];
      let ListDataField = [];

      dataGridRef.current._optionsManager._currentConfig.configCollections.columns.map(item => {
        if (item.options.visible === undefined || item.options.visible === true) {
          ListColumnName.push(item.options.caption.toUpperCase());
          ListDataField.push(item.options.dataField);
        }
      })

      var arrayNombresCabecera = ListColumnName.join('|');
      var arrayNombresData = ListDataField.join('|');

      const { IdCompaniaMandante, IdCompaniaContratista, IdContrato, Documento } = props.filtroLocal;

      await exportarPersonasPorContrato({
        IdCliente,
        IdCompaniaMandante,
        IdCompaniaContratista,
        IdContrato,
        Documento,
        NombreCompleto: "",
        UnidadOrganizativa: "",
        CentroCosto: "",
        Funcion: "",
        Posicion: "",
        Activo: activeFilterWorkers,
        tituloHoja: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.REPORT.PEOPLE" }) + "_" + IdContrato.toString(),
        nombreHoja: intl.formatMessage({ id: "ACCESS.REPORT.PEOPLE" }),
        arrayNombresCabecera,
        arrayNombresData,
        skip: 0,
        take: 0,
        OrderField: 'NombreCompleto',
        OrderDesc: 0
      }).then(resp => {
        if (resp.error === 0) {
          //console.log("crear archivo");
          let temp = `data:application/vnd.ms-excel;base64,${encodeURIComponent(resp.fileBase64)}`;
          console.log(temp);
          let download = document.getElementById('iddescarga');
          download.href = temp;
          download.download = `${resp.nombre}.xlsx`;
          download.click();
        } else {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.ERROR" }), resp.mensaje);
        }
      })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => {
          setLoading(false);
        });

    } else {
      handleInfoMessages(intl.formatMessage({ id: "ACREDITATION.R001.STADISTIC.EXPORT.NODATA_MESSAGE" }))
    }
  }

  // useEffect(() => {
  //   const { IdCompaniaMandante, IdCompaniaContratista, IdContrato } = props.filtroLocal;
  //   setTimeout(function () {
  //     dataSource.loadDataWithFilter({ data: { IdCliente: IdCliente, IdCompaniaMandante, IdCompaniaContratista, IdContrato, Activo: activeFilterWorkers } });
  //   }, 500);
  // }, [props.filtroLocal]);

  //openChangeContract
  useEffect(() => {
    if (!openChangeContract) {
      const { IdCompaniaMandante, IdCompaniaContratista, IdContrato } = props.filtroLocal;
      dataSource.loadDataWithFilter({ data: { IdCliente: IdCliente, IdCompaniaMandante, IdCompaniaContratista, IdContrato, Activo: activeFilterWorkers, IdValue: new Date() } });
      //Desactivar seleccioon multiple
      if (dataGridRef !== null && dataGridRef.current !== null) dataGridRef.current.instance.deselectAll();
    }

  }, [openChangeContract]);

  //-CustomerDataGrid-Filter
  const keysToGenerateFilter = [
    "IdCliente",
    "IdCompaniaMandante",
    "IdCompaniaContratista",
    "IdContrato",
    "Documento",
    "NombreCompleto",
    "UnidadOrganizativa",
    "CentroCosto",
    "Funcion",
    "Posicion",
    "Activo"
  ];

  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem colCount={4} colSpan={4} labelLocation="top">
        <Item dataField="Documento"
          label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" }) }}
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
        <Item colSpan={2}
          label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.SHOW.INACTIVES.WORKERS" }) }}
        >
          <ControlSwitch
            checked={activeSwitch}
            onChange={e => {
              setActiveSwitch(e.target.checked); //Activamos la busqueda de personas inactivas
              setActiveFilterWorkers(e.target.checked ? "" : "S"); //Seteamos el filtro de busqueda Activo
              dataSource.loadDataWithFilter({
                data: {
                  IdCliente, IdCompaniaMandante,
                  IdCompaniaContratista, IdContrato, Activo: e.target.checked ? "" : "S"
                }
              });
            }}
          />
        </Item>
      </GroupItem>

    );
  }

  const renderDataGrid = ({ gridRef, dataSource }) => {
    setDataGridRef(gridRef);

    const seleccionarRegistro = (evt) => {
      if (evt.selectedRowsData !== undefined) {
        if (isNotEmpty(evt.selectedRowsData)) {
          setSelectedRow(evt.selectedRowsData);
        };
      }

    }

    function onCellPrepared(e) {
      if (e.rowType === 'data') {
        if (e.data.Estado === 'INACTIVO') {
          e.cellElement.style.color = 'red';
        }
      }
    }


    return (

      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        remoteOperations={true}
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="RowIndex"
        repaintChangesOnly={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
        onSelectionChanged={seleccionarRegistro}
        onCellPrepared={onCellPrepared}
      >
        <Selection
          mode="multiple"
          width={"5px"}
          showCheckBoxesMode={'always'}
          selectAllMode={'page'}
        />
        <Editing
          mode="row"
          useIcons={true}
        />
        <FilterRow visible={true} showOperationChooser={false} />
        <HeaderFilter visible={false} />
        <FilterPanel visible={false} />
        <Scrolling columnRenderingMode="virtual" />

        <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })} width={"230"} />
        <Column dataField="TipoDocumentoAlias" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE" })} width={"60"} alignment={"center"} allowSorting={false} allowFiltering={false} allowHeaderFiltering={false} />
        <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })} width={"85"} alignment={"center"} allowSorting={false} allowFiltering={false} allowHeaderFiltering={false} />
        <Column dataField="CompaniaSubContratista" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBCONTRACTOR" })} width={"150"} allowSorting={false} allowFiltering={false} allowHeaderFiltering={false} />

        <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })} alignment={"center"} width={"90"} allowSorting={false} allowFiltering={false} allowHeaderFiltering={false} />
        <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })} alignment={"center"} width={"90"} allowSorting={false} allowFiltering={false} allowHeaderFiltering={false} />

        <Column dataField="UnidadOrganizativa" caption={intl.formatMessage({ id: "ADMINISTRATION.POSITION.ORGANIZATIONALUNIT" })} width={"150"} />
        <Column dataField="CentroCosto" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CENTROCOSTO" })} width={"130"} />
        <Column dataField="Funcion" caption={intl.formatMessage({ id: "ADMINISTRATION.POSITION.FUNCTION" })} width={"120"} />
        <Column dataField="Posicion" caption={intl.formatMessage({ id: "ADMINISTRATION.POSITION" })} width={"120"} />
        <Column dataField="Estado" caption={intl.formatMessage({ id: "COMMON.STATE" })} alignment={"center"} width={"90"} allowSorting={false} allowFiltering={false} allowHeaderFiltering={false} />


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
        height={"580px"}
        width={"950px"}
        title={(intl.formatMessage({ id: "CONFIG.MENU.ACREDITACION.MOVILIZACIÓN.PERSONAS" })).toUpperCase()}
        onHiding={() => props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)}
      >
        <Portlet>
          <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'top'} colCount={3}
            toolbar={
              <PortletHeader
                title=""
                toolbar={
                  <PortletHeaderToolbar>

                    &nbsp;
                    <Button
                      icon="fas fa-handshake"
                      type="default"
                      hint="Ampliar contrato"
                      //disabled={customDataGridIsBusy}
                      disabled={!accessButton.ampliarContrato}
                      onClick={validarRegistrosSeleccionadosAmpliacion}
                    />
                    &nbsp;
                    <Button
                      icon="columnchooser"
                      type="default"
                      hint={intl.formatMessage({ id: "ADMINISTRATION.PERSON.CHANGE.CONTRACT" })}
                      //disabled={customDataGridIsBusy}
                      disabled={!accessButton.cambiarContrato}
                      onClick={validarRegistrosSeleccionados}
                    />
                    &nbsp;
                    <Button
                      icon="refresh"
                      type="default"
                      hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                      disabled={customDataGridIsBusy}
                      onClick={resetLoadOptions}
                      visible={false}
                    />
                    &nbsp;
                    <Button icon="refresh"
                      type="default"
                      hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                      onClick={clearRefresh} />
                    &nbsp;
                    <Button
                      icon="fa fa-file-excel"
                      type="default"
                      hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
                      onClick={exportData}
                      disabled={!accessButton.exportar}
                    />
                  </PortletHeaderToolbar>
                }
              />
            }
          />

          {/* <div style={{ overflowY: "auto", height: "99%" }}>
            <ScrollView id="scroll"> */}

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
            ifThereAreNoChangesLoadFromStorage={ifThereAreNoChangesLoadFromStorage}
            caseSensitiveWhenCheckingForChanges={true}
            uppercaseFilterRow={true}
            initialLoadOptions={{
              currentPage: 1, pageSize: 11, sort: { column: "NombreCompleto", order: "asc" }
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

          {/* </ScrollView>
          </div> */}

          {popupVisiblePersonas && (
            <PersonaTextAreaPopup
              isVisiblePopupDetalle={popupVisiblePersonas}
              setIsVisiblePopupDetalle={setPopupVisiblePersonas}
              obtenerNumeroDocumento={obtenerDocumentos}
            />
          )}

        </Portlet>

      </Popup>

      {(openChangeContract &&
        <>
          <CambiarPersonaContratoEditPage
            uniqueId={"CambioComntratoPersonas"}
            showPopup={{ isVisiblePopUp: openChangeContract, setisVisiblePopUp: setOpenChangeContract }}
            cancelar={() => {
              setOpenChangeContract(false);
            }
            }
            dataContract={props.dataContract}
            dataWorkers={selectedRow}
            filterData={filterData}
            getInfo={props.getInfo}
          />

        </>
      )};

      {(openAmpliarContract &&
        <>
          <AmpliarPersonaContratoEditPage
            uniqueId={"AmpliarContratoPersonas"}
            showPopup={{ isVisiblePopUp: openAmpliarContract, setisVisiblePopUp: setOpenAmpliarContract }}
            cancelar={() => {
              setOpenAmpliarContract(false);
            }
            }
            dataContract={props.dataContractAux}
            dataWorkers={selectedRow}
            filterData={filterData}
            getInfo={props.getInfo}

          />

        </>
      )};

    </>
  );
};

AdministracionContratoPersonas.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
};
AdministracionContratoPersonas.defaultProps = {
  showButton: false,
  selectionMode: "row", //['multiple', 'row','single]
  uniqueId: "AdministracionContratoPersonas",

};
export default injectIntl(WithLoandingPanel(AdministracionContratoPersonas));

