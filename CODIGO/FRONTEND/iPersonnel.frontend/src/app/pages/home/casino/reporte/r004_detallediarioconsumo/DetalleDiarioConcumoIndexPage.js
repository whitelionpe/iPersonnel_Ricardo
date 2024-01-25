import React, { useState, useEffect } from "react";
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
import DetalleDiarioConcumoFilterPage from "./DetalleDiarioConcumoFilterPage";
import { dateFormat, isNotEmpty, getStartAndEndOfMonthByDay } from "../../../../../../_metronic";
import DetalleDiarioConcumoLitPage from "./DetalleDiarioConcumoLitPage";

import { exportarPersonalSinHorario } from "../../../../../api/asistencia/reporte.api"
import { listar_r004_DetalleDiarioConsumo } from "../../../../../api/casino/reporte.api"



export const initialFilter = {
  IdCliente: '',
  IdDivision: '',

  IdCompania: '',
  IdUnidadOrganizativa: '',
  IdPosicion: '',
  Personas: '',
  IdCentroCosto: '',
  IdPlanilla: '',
  Estado: '',
  FechaInicio: '',
  FechaFin: '',
  //TipoReporte: 'S',

};

const DetalleDiarioConcumoIndexPage = (props) => {

  const { intl, setLoading, dataMenu } = props;
  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const [dataIdCompania, setDataIdCompania] = useState(null);//ADD
  const perfil = useSelector((state) => state.perfil.perfilActual);
  const { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay();
  const [dataResult_, setdataResult_] = useState([]);

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

    IdCompania: '',
    IdUnidadOrganizativa: '',
    IdPosicion: '',
    Personas: '',
    IdCentroCosto: '',
    IdPlanilla: '',
    Estado: '',
    FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd'),
    FechaFin: dateFormat(FechaFin, 'yyyyMMdd'),

  });


  const filtrarReporte = async (filtro) => {
    let dataResult = await searchHeaderColumns(filtro); //Pagina 1 de [0 a 20]
    setdataResult_(dataResult)

  }

  const searchHeaderColumns = async (filtro) => {

    let dataResult;
    try {
      dataResult = await listar_r004_DetalleDiarioConsumo(filtro);
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      //console.log(err);
      return { IdErro: 1, reservas: [] };
    } finally {
      setLoading(false);
    }

    if (typeof dataResult === "object" && dataResult !== null) {
      dataResult.IdError = 0;
      return dataResult;
    } else {
      return { IdErro: 1, reservas: [] };
    }

  };


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
        IdPlanilla,
        Estado,
        FechaInicio,
        FechaFin

      } = dataRowEditNew;


      let params = {
        IdCliente: perfil.IdCliente,
        IdDivision: perfil.IdDivision,

        IdCompania: isNotEmpty(IdCompania) ? IdCompania : "",
        IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa : "",
        IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion : "",
        Personas: isNotEmpty(Personas) ? Personas : "",
        IdCentroCosto: isNotEmpty(IdCentroCosto) ? IdCentroCosto : "",
        IdPlanilla: isNotEmpty(IdPlanilla) ? IdPlanilla : "",
        Estado: isNotEmpty(Estado) ? Estado : "",
        FechaInicio: isNotEmpty(FechaInicio) ? (dateFormat(FechaInicio, 'yyyyMMdd') == "NaNaNaN" ? FechaInicio : dateFormat(FechaInicio, 'yyyyMMdd')) : "",
        FechaFin: isNotEmpty(FechaFin) ? (dateFormat(FechaFin, 'yyyyMMdd') == "NaNaNaN" ? FechaFin : dateFormat(FechaFin, 'yyyyMMdd')) : "",
        TipoReporte: "S",//S: SIN HORARIO

        tituloHoja: intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.PERSONAL_SIN_HORARIO" }),
        nombreHoja: intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.PERSONAL_SIN_HORARIO" }),
        arrayNombresCabecera,
        arrayNombresData
      };

      console.log(params)

      await exportarPersonalSinHorario(params).then(resp => {
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
      <a id="iddescarga" ></a>
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
              <DetalleDiarioConcumoFilterPage
                dataRowEditNew={dataRowEditNew}
                setDataRowEditNew={setDataRowEditNew}
                setDataIdCompania={setDataIdCompania}
                filtrarReporte={filtrarReporte}
                clearDataGrid={clearDataGrid}
                exportReport={exportReport}
                dataGridRef={dataGridRef}
                dataMenu={dataMenu}
              />

              <div className="container__" style={{ padding: '24px', maxWidth: '116rem' }}>

                <DetalleDiarioConcumoLitPage
                  uniqueId={"ReportaccesoRequisitoList"}
                  dataIdCompania={dataIdCompania}
                  isFirstDataLoad={isFirstDataLoad}
                  setIsFirstDataLoad={setIsFirstDataLoad}
                  refresh={refresh}
                  resetLoadOptions={resetLoadOptions}
                  refreshData={refreshData}
                  setRefreshData={setRefreshData}
                  setDataGridRef={setDataGridRef}
                  dataResult={dataResult_}
                />

              </div>
            </TabPanel>

          </div>
        </>
      </Portlet>
    </>
  );
};


export default injectIntl(WithLoandingPanel(DetalleDiarioConcumoIndexPage));
