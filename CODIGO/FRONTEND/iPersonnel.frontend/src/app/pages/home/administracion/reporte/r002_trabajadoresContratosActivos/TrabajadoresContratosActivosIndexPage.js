import React, { useEffect, useState } from "react";
import {
  handleErrorMessages,
  handleInfoMessages,
  handleSuccessMessages
} from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../../_metronic/utils/securityUtils'
import { useSelector } from "react-redux";
import { isNotEmpty } from "../../../../../../_metronic";
import FormatListNumberedRtl from "@material-ui/icons/FormatListNumberedRtl";
import InsertDriveFile from "@material-ui/icons/InsertDriveFile";

import {
  useStylesEncabezado,
  useStylesTab,
} from "../../../../../store/config/Styles";

//Multi-idioma
import { injectIntl } from "react-intl";

//Aditional
import { listarReportePersonasActivos, exportarReportePersonasTodos } from "../../../../../api/administracion/reporte.api"
import { storeListarR002 as loadUrl } from "../../../../../api/administracion/reporte.api";
import { PortletBody, PortletHeader, PortletHeaderToolbar, Portlet } from "../../../../../partials/content/Portlet";
import { AppBar } from '@material-ui/core';
import PropTypes from 'prop-types';

import CustomBreadcrumbs from "../../../../../partials/layout/CustomBreadcrumbs";
import { Toolbar } from "@material-ui/core";
import { Typography } from "@material-ui/core";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { Button } from "devextreme-react";
import { DataGrid, Column, Summary, TotalItem, Button as ColumnButton, } from "devextreme-react/data-grid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";


import Form, {
  Item,
  GroupItem,
} from "devextreme-react/form";
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";

import ListarDetallePersonaContratosActivos from "./ListarDetallePersonaContratosActivos";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import TabNavContainer from "../../../../../partials/components/Tabs/TabNavContainer";
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";


export const initialFilter = {
  IdCliente: '1',
  Activo: 'S',
};


const ReporteMovimientoIndexPage = (props) => {

  const perfil = useSelector((state) => state.perfil.perfilActual);
  const { intl, setLoading, dataMenu } = props;

  const [focusedRowKey, setFocusedRowKey] = useState();
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [, setCustomDataGridIsBusy] = useState(false);

  const classes = useStylesTab();
  const classesEncabezado = useStylesEncabezado();
  const [, setValue] = useState(0);

  const [, setDataReporte] = useState([]);
  const [totalRowIndex, setTotalRowIndex] = useState(0);

  const [enabledTabDetail] = useState(true);
  // const [dataGridRef, setDataGridRef] = useState(null);
  const [dataGridRefDetail, setDataGridRefDetail] = useState(null);
  const [ifThereAreNoChangesLoadFromStorage] = useState(true);

  const [isActiveFilters, setIsActiveFilters] = useState(true);
  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const [popupVisibleCompaniaContratista, setPopupVisibleCompaniaContratista] = useState(false);
  const [, setSelected] = useState({});
  let dataGridRef = React.useRef();

  const [filtroLocal, setFiltroLocal] = useState({
    IdCliente: "",
    IdCompaniaMandante: "",
    IdCompaniaContratista: "",
    IdContrato: ""
  });

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setTabIndex(newValue);
  };

  //Datos principales
  const [tabIndex, setTabIndex] = useState(0);

  //FILTRO
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [isFirstDataLoadContratos] = useState(true);
  const [filterData] = useState({ ...initialFilter });
  const [refreshData, setRefreshData] = useState(false);
  const [refreshDataContratos] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const dsContratos = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);
  const [dataSourceContratos] = useState(dsContratos);
  const resetLoadOptionsContratos = () => dataSourceContratos.resetLoadOptions();

  async function listarReporteTrabajadores() {
    setLoading(true);
    const { IdCompaniaMandante, IdCompaniaContratista } = dataRowEditNew;
    await listarReportePersonasActivos({
      IdCliente: perfil.IdCliente,
      IdCompaniaMandante: isNotEmpty(IdCompaniaMandante) ? IdCompaniaMandante : "",
      IdCompaniaContratista: isNotEmpty(IdCompaniaContratista) ? IdCompaniaContratista : "",
    }).then(data => {
      setDataReporte(data);

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => {
      setLoading(false);
    });
  }

  const [accessButton, setAccessButton] = useState(defaultPermissions);
  const loadControlsPermission = () => {
    const numeroTabs = 9; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  const selectCompaniaMandante = dataPopup => {
    const { IdCompania, Compania } = dataPopup[0];
    dataRowEditNew.IdCompaniaMandante = IdCompania;
    dataRowEditNew.CompaniaMandante = Compania;
    setPopupVisibleCompania(false);
  }

  const selectCompaniaContratista = dataPopup => {
    const { IdCompania, Compania } = dataPopup[0];
    dataRowEditNew.IdCompaniaContratista = IdCompania;
    dataRowEditNew.CompaniaContratista = Compania;
    setPopupVisibleCompaniaContratista(false);
  }

  const filtrarOptions = () => {
    handleChange(null, 0);
    const { IdCompaniaMandante, IdCompaniaContratista } = dataRowEditNew;
    dataSourceContratos.loadDataWithFilter({
      data: {
        IdCliente: '1',
        IdCompaniaMandante,
        IdCompaniaContratista
      }
    });
    // listarReporteTrabajadores();
  }

  const limpiar = () => {
    setDataRowEditNew({
      IdCliente: '',
      IdCompaniaMandante: '',
      CompaniaMandante: '',
      IdCompaniaContratista: '',
      CompaniaContratista: ''
    });
    resetLoadOptionsContratos();
  };

  const exportAllData = async () => {
    if (dataGridRef.current.props.dataSource._items.length > 0 && dataGridRefDetail.current.props.dataSource._items.length > 0) {
      let ListColumnName = [];
      let ListDataField = [];

      let ListColumnName2 = [];
      let ListDataField2 = [];



      dataGridRef.current._optionsManager._currentConfig.configCollections.columns.forEach(item => {
        if ((item.options.visible === undefined || item.options.visible === true) && item.options.type !== 'buttons') {
          ListColumnName.push(item.options.caption.toUpperCase());
          ListDataField.push(item.options.dataField);
        }
      })

      dataGridRefDetail.current._optionsManager._currentConfig.configCollections.columns.forEach(item => {
        if ((item.options.visible === undefined || item.options.visible === true) && item.options.type !== 'buttons') {
          ListColumnName2.push(item.options.caption.toUpperCase());
          ListDataField2.push(item.options.dataField);
        }
      })

      var arrayNombresCabecera = ListColumnName.join('|');
      var arrayNombresData = ListDataField.join('|');

      var arrayNombresCabecera2 = ListColumnName2.join('|');
      var arrayNombresData2 = ListDataField2.join('|');

      const { IdCompaniaMandante, IdCompaniaContratista, IdContrato } = dataRowEditNew;

      setLoading(true);

      await exportarReportePersonasTodos({
        IdCliente: perfil.IdCliente,
        IdCompaniaMandante: isNotEmpty(IdCompaniaMandante) ? IdCompaniaMandante : "",
        IdCompaniaContratista: isNotEmpty(IdCompaniaContratista) ? IdCompaniaContratista : "",
        IdContrato: isNotEmpty(IdContrato) ? IdContrato : "",
        tituloHoja: intl.formatMessage({ id: "ADMINISTRATION.REPORT.GENERAL" }),
        nombreHoja: intl.formatMessage({ id: "ADMINISTRATION.REPORT.CONTRACT" }),
        arrayNombresCabecera,
        arrayNombresData,
        // --- Hoja 2
        tituloHoja2: intl.formatMessage({ id: "ADMINISTRATION.REPORT.DETAILPEOPLE" }),
        nombreHoja2: intl.formatMessage({ id: "ADMINISTRATION.REPORT.PEOPLES" }),
        arrayNombresCabecera2,
        arrayNombresData2,
        onlyDetail: false

      }).then(resp => {
        // console.log("exportData|respuesta->",resp);
        if (resp.error === 0) {
          //  console.log("crear archivo");
          let temp = `data:application/vnd.ms-excel;base64,${encodeURIComponent(resp.fileBase64)}`;
          console.log(temp);
          let download = document.getElementById('iddescarga');
          download.href = temp;
          download.download = `${resp.nombre}.xlsx`;
          download.click();
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.DOWNLOAD.SUCESS" }));

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

  const exportarPorFila = async evt => {

    setLoading(true);
    if (evt.row.data === undefined) return;
    if (isNotEmpty(evt.row.data)) {
      
      if (dataGridRef.current.props.dataSource._items.length > 0 && dataGridRefDetail.current.props.dataSource._items.length > 0) {
        let ListColumnName = [];
        let ListDataField = [];

        let ListColumnName2 = [];
        let ListDataField2 = [];

        dataGridRef.current._optionsManager._currentConfig.configCollections.columns.forEach(item => {
          if ((item.options.visible === undefined || item.options.visible === true) && item.options.type !== 'buttons') {
            ListColumnName.push(item.options.caption.toUpperCase());
            ListDataField.push(item.options.dataField);
          }
        })

        dataGridRefDetail.current._optionsManager._currentConfig.configCollections.columns.forEach(item => {
          if ((item.options.visible === undefined || item.options.visible === true) && item.options.type !== 'buttons') {
            ListColumnName2.push(item.options.caption.toUpperCase());
            ListDataField2.push(item.options.dataField);
          }
        })

        var arrayNombresCabecera = ListColumnName.join('|');
        var arrayNombresData = ListDataField.join('|');

        var arrayNombresCabecera2 = ListColumnName2.join('|');
        var arrayNombresData2 = ListDataField2.join('|');

        const { IdCompaniaMandante, IdCompaniaContratista, IdContrato } = evt.row.data

        await exportarReportePersonasTodos({
          IdCliente: perfil.IdCliente,
          IdCompaniaMandante: isNotEmpty(IdCompaniaMandante) ? IdCompaniaMandante : "",
          IdCompaniaContratista: isNotEmpty(IdCompaniaContratista) ? IdCompaniaContratista : "",
          IdContrato: isNotEmpty(IdContrato) ? IdContrato : "",
          tituloHoja: intl.formatMessage({ id: "ADMINISTRATION.REPORT.GENERAL" }),
          nombreHoja: intl.formatMessage({ id: "ADMINISTRATION.REPORT.CONTRACT" }),
          arrayNombresCabecera,
          arrayNombresData,
          // --- Hoja 2
          tituloHoja2: intl.formatMessage({ id: "ADMINISTRATION.REPORT.DETAILPEOPLE" }),
          nombreHoja2: intl.formatMessage({ id: "ADMINISTRATION.REPORT.PEOPLES" }),
          arrayNombresCabecera2,
          arrayNombresData2,
          onlyDetail: true

        }).then(resp => {
          // console.log("exportData|respuesta->",resp);
          if (resp.error === 0) {
            // console.log("crear archivo");
            let temp = `data:application/vnd.ms-excel;base64,${encodeURIComponent(resp.fileBase64)}`;
            console.log(temp);
            let download = document.getElementById('iddescarga');
            download.href = temp;
            download.download = `${resp.nombre}.xlsx`;
            download.click();
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.DOWNLOAD.SUCESS" }));

          } else {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.ERROR" }), resp.mensaje);
          }
        })
          .catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
          }).finally(() => {
            setLoading(false);
          });

      }
      else {
        handleInfoMessages(intl.formatMessage({ id: "ACREDITATION.R001.STADISTIC.EXPORT.NODATA_MESSAGE" }))
      }

    };
    setLoading(false);
  };

  const seleccionarRegistro = evt => {
    console.log(evt);
    if (evt.rowIndex === -1) return;
    const { RowIndex } = evt.row.data;
    setFocusedRowKey(RowIndex);
    setSelected(evt.row.data);
    handleChange(null, 0);
  }

  const keysToGenerateFilter = ['IdCliente', 'IdDivision', 'IdCompaniaMandante', 'IdCompaniaContratista'];

  const mostrarDetalle = evt => {
    setLoading(true);
    if (evt.row.data === undefined) return;
    if (isNotEmpty(evt.row.data)) {
      setFocusedRowKey(evt.row.data.RowIndex);
      const { IdCompaniaMandante, IdCompaniaContratista, IdContrato } = evt.row.data;
      setFiltroLocal({ IdCliente: perfil.IdCliente, IdCompaniaMandante: IdCompaniaMandante, IdCompaniaContratista: IdCompaniaContratista, IdContrato: IdContrato })
      handleChange(null, 1);
    };
    setLoading(false);
  };

  useEffect(() => {
    loadControlsPermission();
    listarReporteTrabajadores();
  }, []);

  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::

  const datosMandante = (e) => {
    return (
      <>

        <Form formData={dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >

            <Item
              colSpan={2}
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


          </GroupItem>
        </Form>
      </>
    );
  }

  const datosContratista = (e) => {
    return (
      <>

        <Form formData={dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >

            <Item
              colSpan={2}
              dataField="CompaniaContratista"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACTORCOMPANY" }) }}
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
                      setPopupVisibleCompaniaContratista(true);
                    },
                  }
                }]
              }}
            />

          </GroupItem>
        </Form>
      </>
    );
  }

  const renderDataGrid = ({ gridRef, dataSource }) => {
    if (dataSource._storeLoadOptions.filter !== undefined) {
      if (totalRowIndex === 0) {
        setTotalRowIndex(dataSource._totalCount);
      }
      if (dataSource._totalCount !== totalRowIndex) {
        if (dataSource._totalCount !== -1) {
          setFocusedRowKey();
          setTotalRowIndex(dataSource._totalCount);
        }
      }
    }
    dataGridRef = gridRef;
    return (
      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        showBorders={true}
        keyExpr="RowIndex"
        focusedRowEnabled={true}
        onFocusedRowChanged={seleccionarRegistro}
        focusedRowKey={focusedRowKey}
        repaintChangesOnly={true}
        allowColumnResizing={true}
        allowColumnReordering={true}
        // remoteOperations={true}
        columnAutoWidth={true}
      >
        <Column dataField="CompaniaMandante" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CLIENTCOMPANY" })} width={"15%"} />
        <Column dataField="DocumentoContratista" caption={intl.formatMessage({ id: "ADMINISTRATION.RUC.CONTRACTOR" })} alignment={"center"} />
        <Column dataField="CompaniaContratista" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACTORCOMPANY" })} width={"15%"} />
        <Column dataField="IdContrato" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" })} alignment={"center"} />
        <Column dataField="Asunto" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBJECT" })} width={"15%"} />
        <Column dataField="Dotacion" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.ENDOWMENT" })} alignment={"center"} width={"5%"} />
        <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
        <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
        <Column dataField="TotalTrabajadoresActivos" caption={intl.formatMessage({ id: "ADMINISTRATION.REPORT.CONTRACT.ACTIVE_WORKERS" })} alignment={"center"} />
        <Column dataField="TotalTrabajadoresInactivos" caption={intl.formatMessage({ id: "ADMINISTRATION.REPORT.CONTRACT.INACTIVE_WORKERS" })} alignment={"center"} />

        <Column type="buttons" width={"5%"} >
          <ColumnButton
            icon="contentlayout"
            hint={intl.formatMessage({ id: "COMMON.DETAIL" })}
            onClick={mostrarDetalle}
            visible={true}
          />
          <ColumnButton
            icon="fa fa-file-excel"
            hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
            onClick={exportarPorFila}
            visible={true}
          />
        </Column>

        <Summary>
          <TotalItem
          cssClass="classColorPaginador_"
            column="Dotacion"
            summaryType="sum"
            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL" })} {0}`}
          />
          <TotalItem
          cssClass="classColorPaginador_"
            column="TotalTrabajadoresActivos"
            summaryType="max"
            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL" })} {0}`}
          />
          <TotalItem
          cssClass="classColorPaginador_"
            column="TotalTrabajadoresInactivos"
            summaryType="sum"
            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL" })} {0}`}
          />
        </Summary>
      </DataGrid>
    );
  }

  const tabContent_ReporteContratosActivos = () => {
    return <>
      <br></br>
      <CustomDataGrid
      showLog={false} 
        uniqueId="r002TrabajadoresConContratoActivoList"
        dataSource={dataSourceContratos}
        rowNumberName='RowIndex'
        loadWhenStartingComponent={isFirstDataLoadContratos && !refreshDataContratos}
        renderDataGrid={renderDataGrid}
        loadUrl={loadUrl}
        forceLoad={forceLoadTypes.Unforced}
        sendToServerOnlyIfThereAreChanges={true}
        ifThereAreNoChangesLoadFromStorage={ifThereAreNoChangesLoadFromStorage}
        caseSensitiveWhenCheckingForChanges={true}
        uppercaseFilterRow={true}
        initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'CompaniaMandante', order: 'asc' } }}
        filterRowSize='sm'
        summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}
        // CUSTOM FILTER
        keysToGenerateFilter={keysToGenerateFilter}
        filterData={filterData}
        // PAGINATION
        paginationSize='md'
        // EVENTS
        onLoading={() => setCustomDataGridIsBusy(true)}
        onError={() => setCustomDataGridIsBusy(false)}
        onLoaded={() => setCustomDataGridIsBusy(false)}
      />

      {/* DataGrid Hidden | Se usa para poder recuperar las cabeceras de la segunda gria */}
      <div id="listHidden" style={{ display: 'none' }}>

        <ListarDetallePersonaContratosActivos
          uniqueId={"personaListReport"}
          //=>..CustomerDataGrid
          isFirstDataLoad={isFirstDataLoad}
          setIsFirstDataLoad={setIsFirstDataLoad}
          dataSource={dataSource}
          refreshData={refreshData}
          setRefreshData={setRefreshData}
          filtroLocal={filtroLocal}
          setDataGridRefDetail={setDataGridRefDetail}
        />
      </div>


    </>
  }

  const tabContent_DetallePersonasContrato = () => {
    return <>
      <br></br>
      <ListarDetallePersonaContratosActivos
        uniqueId={"personaListReport"}
        //=>..CustomerDataGrid
        isFirstDataLoad={isFirstDataLoad}
        setIsFirstDataLoad={setIsFirstDataLoad}
        dataSource={dataSource}
        refreshData={refreshData}
        setRefreshData={setRefreshData}
        filtroLocal={filtroLocal}
        setDataGridRefDetail={setDataGridRefDetail}
      />
    </>
  }


  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <a id="iddescarga" className="" ></a>
      <CustomBreadcrumbs
        Title={intl.formatMessage({ id: "ADMINISTRATION.PERSON.MENU" })}
        SubMenu={intl.formatMessage({ id: "ACCESS.REPORT.SUBMENU" })}
        Subtitle={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
      />

      <Portlet>

        <AppBar position="static" className={classesEncabezado.principal}>
          <Toolbar variant="dense" className={classesEncabezado.toolbar}>
            <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
              {intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
            </Typography>
          </Toolbar>
        </AppBar>


        <HeaderInformation
          visible={true}
          labelLocation={'left'}
          colCount={1}
          toolbar={
            <PortletHeader
              title={''}
              toolbar={
                <PortletHeaderToolbar>

                  <Button
                    icon={isActiveFilters ? "chevronup" : "chevrondown"}
                    type="default"
                    hint={isActiveFilters ? intl.formatMessage({ id: "COMMON.HIDE" }) : intl.formatMessage({ id: "COMMON.SHOW" })}
                    onClick={() => setIsActiveFilters(!isActiveFilters)}
                    disabled={false}
                  />
                  &nbsp;
                  <Button
                    icon="fa fa-search"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                    onClick={filtrarOptions}
                    disabled={isActiveFilters ? false : true}
                  />
                  &nbsp;
                  <Button
                    icon="clearformat"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                    onClick={limpiar}
                    visible={true}
                  />
                  &nbsp;
                  <Button
                    icon="fa fa-file-excel"
                    type="default"
                    hint={intl.formatMessage({ id: "ADMINISTRATION.REPORT.TOTALWORKER.EXPORTALL" })}
                    onClick={exportAllData}
                    disabled={tabIndex === 0 ? false : true}
                  />


                </PortletHeaderToolbar>
              }
            />
          }
        />

        <PortletBody>

          {isActiveFilters && (
            <Form formData={dataRowEditNew} validationGroup="FormEdicion" >
              <GroupItem itemType="group" colCount={2} colSpan={2}>
                <div className="row">
                  <div className="col-md-6">
                    <fieldset className="scheduler-border" >
                      <legend className="scheduler-border" >   <h5>{intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CLIENTCOMPANY" })} </h5></legend>
                      {datosMandante()}
                    </fieldset>
                  </div>

                  <div className="col-md-6">
                    <fieldset className="scheduler-border" >
                      <legend className="scheduler-border" >
                        <h5>{intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACTORCOMPANY" })} </h5>
                      </legend>
                      {datosContratista()}
                    </fieldset>


                  </div>
                </div>
              </GroupItem>
            </Form>
          )}


          <TabNavContainer
            isVisibleCustomBread={false}
            isVisibleAppBar={false}
            tabIndex={tabIndex}
            handleChange={handleChange}
            orientation={"horizontal"}
            componentTabsHeaders={[
              {
                label: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.MAINTENANCE" }),
                icon: <InsertDriveFile fontSize="large" />,
                className: classes.tabContent
              },
              {
                label: intl.formatMessage({ id: "COMMON.DETAIL" }),
                icon: <FormatListNumberedRtl fontSize="large" />,
                className: classes.tabContent,
                disabled: enabledTabDetail
              },
            ]}
            className={classes.tabContent}
            componentTabsBody={
              [
                tabContent_ReporteContratosActivos(),
                tabContent_DetallePersonasContrato(),
              ]
            }

          />

        </PortletBody>

      </Portlet>

      {/*******>POPUP DE COMPANIAS MANDANTES>******** */}
      <AdministracionCompaniaBuscar
        selectData={selectCompaniaMandante}
        showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
        cancelarEdicion={() => setPopupVisibleCompania(false)}
        uniqueId={"administracionCompaniaBuscar"}
        isContratista={"N"}
      />

      {/*******>POPUP DE COMPANIAS CONTRATISTAS>******** */}
      <AdministracionCompaniaBuscar
        selectData={selectCompaniaContratista}
        showPopup={{ isVisiblePopUp: popupVisibleCompaniaContratista, setisVisiblePopUp: setPopupVisibleCompaniaContratista }}
        cancelarEdicion={() => setPopupVisibleCompaniaContratista(false)}
        uniqueId={"administracionCompaniaBuscar"}
        isContratista={"S"}
      />

    </>
  );
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <Portlet
      component="div"
      role="tabpanel"
      hidden={value !== index} //view
      //id={`wrapped-tabpanel-${index}`}
      //aria-labelledby={`wrapped-tab-${index}`}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </Portlet>
  );
}

TabPanel.propTypes =
{
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

export default injectIntl(WithLoandingPanel(ReporteMovimientoIndexPage));
