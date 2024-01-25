import React, { useState } from "react";
import { injectIntl } from "react-intl";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { useSelector } from "react-redux";

import { Portlet } from "../../../../../partials/content/Portlet";
import { useStylesEncabezado, useStylesTab } from "../../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import TabPanel from "../../../../../partials/content/TabPanel";

import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import PermanenciaTrabajdorFilterPage from "./PermanenciaTrabajdorFilterPage";
import { dateFormat, isNotEmpty, getStartAndEndOfMonthByDay } from "../../../../../../_metronic";
import PermanenciaTrabajadorListPage from "./PermanenciaTrabajadorListPage";

import { serviceReporte } from "../../../../../api/acceso/reporte.api"


export const initialFilter = {
  //IdCliente: '',
  IdDivision: '',
  IdCompania: '',
  IdUnidadOrganizativa: '',
  IdPosicion: '',
  Personas: '',
  IdCentroCosto: '',
  Activo: '',
  FechaInicio: '',
  FechaFin: '',

};

const PermanenciaTrabajadorIndexPage = (props) => {

  const { intl, setLoading, dataMenu } = props;
  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const [dataIdCompania, setDataIdCompania] = useState(null);//ADD

  const perfil = useSelector((state) => state.perfil.perfilActual);

  //ADD-> INTERVALOS DE FECHA 1 A 30
  const { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay();

  //FILTRO
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();
  const [dataGridRef, setDataGridRef] = useState(null);

  //ADD-> SETEAMOS LAS FECHAS
  initialFilter.FechaInicio = dateFormat(FechaInicio, 'yyyyMMdd');
  initialFilter.FechaFin = dateFormat(FechaFin, 'yyyyMMdd');

  const [dataRowEditNew, setDataRowEditNew] = useState({
    IdCliente: perfil.IdCliente,
    IdDivision: perfil.IdDivision,
    IdUnidadOrganizativa: '',
    IdPosicion: '',
    Personas: '',
    IdCentroCosto: '',
    //IdPlanilla: '',
    Activo: '',
    FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd'),
    FechaFin: dateFormat(FechaFin, 'yyyyMMdd'),

  });

  const filtrarReporte = (filtro) => {
    const {
      IdCompania,
      IdUnidadOrganizativa,
      IdPosicion,
      Personas,
      IdCentroCosto,
      Estado,
      FechaInicio,
      FechaFin } = filtro;

    //comunicarnos con customerDataGrid.
    dataSource.loadDataWithFilter({
      data: {
        IdDivision: perfil.IdDivision,
        IdCompania,
        IdUnidadOrganizativa,
        IdPosicion,
        Personas,
        IdCentroCosto,
        Estado,
        FechaInicio,
        FechaFin
      }
    });
  }

  const clearDataGrid = () => {
    resetLoadOptions();
  }

  const exportReport = async () => {

    if (dataGridRef.current.props.dataSource._items.length > 0) {

      let ListColumnName = [];
      let ListDataField = [];

      dataGridRef.current._optionsManager._currentConfig.configCollections.columns.map(item => {
        if ((item.options.visible === undefined || item.options.visible === true) && item.options.type != 'buttons') {
          ListColumnName.push(item.options.caption.toUpperCase());
          ListDataField.push(item.options.dataField);
        }
      })
      var arrayNombresCabecera = ListColumnName.join('|');
      var arrayNombresData = ListDataField.join('|');

      const {
        IdCompania,
        IdUnidadOrganizativa,
        IdPosicion,
        Personas,
        IdCentroCosto,
        Estado,
        FechaInicio,
        FechaFin } = dataRowEditNew;

      let params = {
        IdCliente: perfil.IdCliente,
        IdDivision: perfil.IdDivision,
        IdCompania: isNotEmpty(IdCompania) ? IdCompania : "",
        IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa : "",
        IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion : "",
        Personas: isNotEmpty(Personas) ? Personas : "",
        IdCentroCosto: isNotEmpty(IdCentroCosto) ? IdCentroCosto : "",
        Estado: isNotEmpty(Estado) ? Estado : "",
        FechaInicio: isNotEmpty(FechaInicio) ? (dateFormat(FechaInicio, 'yyyyMMdd') == "NaNaNaN" ? FechaInicio : dateFormat(FechaInicio, 'yyyyMMdd')) : "",
        FechaFin: isNotEmpty(FechaFin) ? (dateFormat(FechaFin, 'yyyyMMdd') == "NaNaNaN" ? FechaFin : dateFormat(FechaFin, 'yyyyMMdd')) : "",

        tituloHoja: intl.formatMessage({ id: "CONFIG.MENU.ACCESO.REPORTE.PERMANENCIA" }),
        nombreHoja: intl.formatMessage({ id: "CONFIG.MENU.ACCESO.REPORTE.PERMANENCIA" }),
        arrayNombresCabecera,
        arrayNombresData
      };

      await serviceReporte.exportarExcelTrabajadorPermanencia(params).then(resp => {

        if (isNotEmpty(resp.fileBase64)) {
          let download = document.getElementById('iddescarga');
          download.href = `data:application/vnd.ms-excel;base64,${encodeURIComponent(resp.fileBase64)}`;
          download.download = resp.fileName;
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
      <CustomBreadcrumbs
        Title={intl.formatMessage({ id: "ACCESS.MAIN" })}
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
        <>
          <div className={classes.root}>

            <TabPanel value={0} className={classes.TabPanel} index={0}>
              <PermanenciaTrabajdorFilterPage
                dataRowEditNew={dataRowEditNew}
                setDataRowEditNew={setDataRowEditNew}
                setDataIdCompania={setDataIdCompania}
                filtrarReporte={filtrarReporte}
                clearDataGrid={clearDataGrid}
                exportReport={exportReport}
                dataGridRef={dataGridRef}
                dataMenu={dataMenu}
              />
              <div className="row">
                <div className="col-12">
                  <PermanenciaTrabajadorListPage
                    //uniqueId={"ReportaccesoRequisitoList"}
                    dataIdCompania={dataIdCompania}
                    isFirstDataLoad={isFirstDataLoad}
                    setIsFirstDataLoad={setIsFirstDataLoad}
                    dataSource={dataSource}
                    refresh={refresh}
                    resetLoadOptions={resetLoadOptions}
                    refreshData={refreshData}
                    setRefreshData={setRefreshData}
                    setDataGridRef={setDataGridRef}
                  />
                </div>
              </div>
            </TabPanel>

          </div>
        </>
      </Portlet>
    </>
  );
};


export default injectIntl(WithLoandingPanel(PermanenciaTrabajadorIndexPage));