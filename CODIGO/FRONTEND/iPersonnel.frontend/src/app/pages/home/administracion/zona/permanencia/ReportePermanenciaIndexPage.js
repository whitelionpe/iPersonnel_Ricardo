import React, { useEffect, useState } from "react";
import {
  handleErrorMessages,
  handleSuccessMessages
} from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
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
import { serviceReporte } from "../../../../../api/acceso/reporte.api"
import { PortletBody, PortletHeader, PortletHeaderToolbar, Portlet } from "../../../../../partials/content/Portlet";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import PropTypes from 'prop-types';

import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { Button } from "devextreme-react";
import { DataGrid, Column, Paging, Pager, Editing, Summary, TotalItem, Button as ColumnButton } from "devextreme-react/data-grid";

import ReportePermanenciaDetalleListPage from "./ReportePermanenciaDetalleListPage";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';


export const initialFilter = {
  IdCliente: '',
  Activo: 'S',
};


const ReportePermanenciaIndexPage = (props) => {

  const perfil = useSelector((state) => state.perfil.perfilActual);
  const { intl, setLoading, varIdZona } = props;

  const [focusedRowKey, setFocusedRowKey] = useState();
  const [dataRowEditNew, setDataRowEditNew] = useState({});

  const classes = useStylesTab();
  const classesEncabezado = useStylesEncabezado();
  const [value, setValue] = useState(0);

  const [dataReporte, setDataReporte] = useState([]);

  const [enabledTabDetail, setEnabledTabDetail] = useState(true);
  const [dataGridRef, setDataGridRef] = useState(null);
  const [dataGridRefDetail, setDataGridRefDetail] = useState(null);

  const [selected, setSelected] = useState({});

  const [filtroLocal, setFiltroLocal] = useState({
    IdCliente: "",
    IdDivision: "",
    IdZona: "",
    IdCompania: ""
  });

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setTabIndex(newValue);
  };

  //Datos principales
  const [tabIndex, setTabIndex] = useState(0);

  //FILTRO
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [filterData, setFilterData] = useState({ ...initialFilter });
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);
  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();


  async function listarReportePermanencia() {
    setLoading(true);
    await serviceReporte.R003ReportePermanencia({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdZona: isNotEmpty(varIdZona) ? varIdZona : ""
    }).then(data => {
      setDataReporte(data);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => {
      setLoading(false);
    });
  }


  const exportAllData = async () => {
    //debugger;
    if (dataGridRef.props.dataSource.length > 0) {

      let ListColumnName = [];
      let ListDataField = [];

      let ListColumnName2 = [];
      let ListDataField2 = [];

      dataGridRef._optionsManager._currentConfig.configCollections.columns.map(item => {
        if ((item.options.visible === undefined || item.options.visible === true) && item.options.type != 'buttons') {
          ListColumnName.push(item.options.caption.toUpperCase());
          ListDataField.push(item.options.dataField);
        }
      })

      dataGridRefDetail.current._optionsManager._currentConfig.configCollections.columns.map(item => {
        if ((item.options.visible === undefined || item.options.visible === true) && item.options.type != 'buttons') {
          ListColumnName2.push(item.options.caption.toUpperCase());
          ListDataField2.push(item.options.dataField);
        }
      })

      var arrayNombresCabecera = ListColumnName.join('|');
      var arrayNombresData = ListDataField.join('|');

      var arrayNombresCabecera2 = ListColumnName2.join('|');
      var arrayNombresData2 = ListDataField2.join('|');

      const { IdCompania } = dataRowEditNew;

      setLoading(true);
      
      await serviceReporte.R003ExportarReportePermanenciaTodo({
        IdCliente: perfil.IdCliente,
        IdDivision: perfil.IdDivision,
        IdZona: isNotEmpty(varIdZona) ? varIdZona : "",
        //IdCompania: isNotEmpty(IdCompania) ? IdCompania : "",
        tituloHoja: intl.formatMessage({ id: "ACCESS.REPORT.LIST" }),
        nombreHoja: intl.formatMessage({ id: "ACCESS.REPORT.LIST" }),
        arrayNombresCabecera,
        arrayNombresData,
        // --- Hoja 2
        tituloHoja2: intl.formatMessage({ id: "ACCESS.REPORT.DET" }),
        nombreHoja2: intl.formatMessage({ id: "ACCESS.REPORT.DET" }),
        arrayNombresCabecera2,
        arrayNombresData2,
        onlyDetail: false

      }).then(resp => {
       // debugger;
        if (resp.error === 0) {
          let temp = `data:application/vnd.ms-excel;base64,${encodeURIComponent(resp.fileBase64)}`;
          let download = document.getElementById('iddescarga');
          download.href = temp;
          download.download = `${resp.nombre}.xlsx`;
          download.click();
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.DOWNLOAD.SUCESS" }));
        }
      })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => {
          setLoading(false);
        });

    }
  }

  const exportarPorFila = async evt => {
    setLoading(true);
    //debugger;
    if (evt.row.data === undefined) return;
    if (isNotEmpty(evt.row.data)) {

      if (dataGridRef.props.dataSource.length > 0) {
        let ListColumnName = [];
        let ListDataField = [];

        let ListColumnName2 = [];
        let ListDataField2 = [];

        dataGridRef._optionsManager._currentConfig.configCollections.columns.map(item => {
          if ((item.options.visible === undefined || item.options.visible === true) && item.options.type != 'buttons') {
            ListColumnName.push(item.options.caption.toUpperCase());
            ListDataField.push(item.options.dataField);
          }
        })

        dataGridRefDetail.current._optionsManager._currentConfig.configCollections.columns.map(item => {
          if ((item.options.visible === undefined || item.options.visible === true) && item.options.type != 'buttons') {
            ListColumnName2.push(item.options.caption.toUpperCase());
            ListDataField2.push(item.options.dataField);
          }
        })

        var arrayNombresCabecera = ListColumnName.join('|');
        var arrayNombresData = ListDataField.join('|');

        var arrayNombresCabecera2 = ListColumnName2.join('|');
        var arrayNombresData2 = ListDataField2.join('|');

        const { IdDivision, IdZona, IdCompania } = evt.row.data

        await serviceReporte.R003ExportarReportePermanenciaTodo({
          IdCliente: perfil.IdCliente,
          IdDivision: isNotEmpty(IdDivision) ? IdDivision : "",
          IdZona: isNotEmpty(IdZona) ? IdZona : "",
          IdCompania: isNotEmpty(IdCompania) ? IdCompania : "",
          tituloHoja: intl.formatMessage({ id: "ACCESS.REPORT.LIST" }),
          nombreHoja: intl.formatMessage({ id: "ACCESS.REPORT.LIST" }),
          arrayNombresCabecera,
          arrayNombresData,
          // --- Hoja 2
          tituloHoja2: intl.formatMessage({ id: "ACCESS.REPORT.DET" }),
          nombreHoja2: intl.formatMessage({ id: "ACCESS.REPORT.DET" }),
          arrayNombresCabecera2,
          arrayNombresData2,
          onlyDetail: true

        }).then(resp => {

          //debugger;
          if (resp.error === 0) {
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
      /* else {
        handleInfoMessages(intl.formatMessage({ id: "" }))
      } */

    };
    setLoading(false);
  };

  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    const { RowIndex } = evt.row.data;
    setFocusedRowKey(RowIndex);
    setSelected(evt.row.data);
    handleChange(null, 0);
  }


  const mostrarDetalle = evt => {
    setLoading(true);
    if (evt.row.data === undefined) return;
    if (isNotEmpty(evt.row.data)) {
      setFocusedRowKey(evt.row.data.RowIndex);
      const { IdCliente, IdDivision, IdZona, IdCompania } = evt.row.data;
      setFiltroLocal({ IdCliente: perfil.IdCliente, IdDivision: IdDivision, IdZona: IdZona, IdCompania: IdCompania })
      handleChange(null, 1);
    };
    setLoading(false);
  };

  useEffect(() => {
    listarReportePermanencia();
  }, []);


  
  const textEditing = {
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" })
  }



  return (
    <>
      <a id="iddescarga" className="" ></a>

      <Portlet>
        <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={2}
          toolbar={
            <PortletHeader
              title={''}
              toolbar={
                <PortletHeaderToolbar>
                  <Button
                    icon="fa fa-file-excel"
                    type="default"
                    hint={intl.formatMessage({ id: "ADMINISTRATION.REPORT.TOTALWORKER.EXPORTALL" })}
                    onClick={exportAllData}
                    disabled={tabIndex === 0 ? false : true}
                  />
                  &nbsp;
                  <Button
                    icon="fa fa-times-circle"
                    type="normal"
                    hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                    onClick={props.cancelarEdicion}
                  />
                </PortletHeaderToolbar>
              }
            />
          }
        />

        <PortletBody>

          <AppBar position="static">
            <Tabs
              orientation="horizontal"
              value={tabIndex}
              onChange={handleChange}
              aria-label="Vertical tabs"
              className={classes.tabs}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label={intl.formatMessage({ id: "ACCESS.REPORT.PERMANENCE" })}
                icon={<InsertDriveFile fontSize="large" />}
                className={classes.tabContent}
                {...tabPropsIndex(0)}
              />
              <Tab label={intl.formatMessage({ id: "COMMON.DETAIL" })}
                icon={<FormatListNumberedRtl fontSize="large" />}
                className={classes.tabContent}
                {...tabPropsIndex(1)}
                disabled={enabledTabDetail}
              />
            </Tabs>
          </AppBar>


          <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
            <>
              <br></br>
              <DataGrid
                id="gridReporteGeneral"
                dataSource={dataReporte}
                ref={ref => { setDataGridRef(ref); }}
                showBorders={true}
                keyExpr="RowIndex"
                focusedRowEnabled={true}
                onFocusedRowChanged={seleccionarRegistro}
                focusedRowKey={focusedRowKey}
                repaintChangesOnly={true}
              >
                <Editing
                  mode="row"
                  useIcons={true}
                  texts={textEditing}
                />
                <Column dataField="IdCompania" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.RUC" })} width={"20%"} />
                <Column dataField="Compania" caption={intl.formatMessage({ id: "ACCESS.PERSON.POSITION.COMPANY" })} alignment={"left"} width={"50%"} columnHeaderFilter={true}/>
                <Column dataField="Personas" caption={intl.formatMessage({ id: "CONFIG.MENU.ACCESO.PERSONAS" })} alignment={"center"} width={"20%"} />

                <Column type="buttons" width={"10%"} >
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
                    column="Personas"
                    summaryType="sum"
                    displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL" })} {0}`}
                  />
                </Summary>

                <Paging defaultPageSize={15} />
                <Pager showPageSizeSelector={false} />
              </DataGrid>

              <div id="listHidden" style={{ display: 'none' }}>
                <ReportePermanenciaDetalleListPage
                  uniqueId={"permanenciaDetalleList"}
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
          </TabPanel>
          <TabPanel value={tabIndex} className={classes.TabPanel} index={1}>
            <>
              <br></br>

              <ReportePermanenciaDetalleListPage
                uniqueId={"permanenciaDetalleList"}
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
          </TabPanel>

        </PortletBody>

      </Portlet>


    </>
  );
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <Portlet
      component="div"
      role="tabpanel"
      hidden={value !== index}
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

function tabPropsIndex(index) {
  return {
    id: `simple-tabpanel-${index}`,
    'aria-controls': `simple-tab-${index}`,
  };
}

export default injectIntl(WithLoandingPanel(ReportePermanenciaIndexPage));
