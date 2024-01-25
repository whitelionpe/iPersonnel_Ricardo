import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { useSelector } from "react-redux";
import Alert from '@material-ui/lab/Alert';


import { Portlet } from "../../../../partials/content/Portlet";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import TabPanel from "../../../../partials/content/TabPanel";

import { dateFormat, isNotEmpty, getStartAndEndOfMonthByDay, getDateOfDay } from "../../../../../_metronic";

import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import ProcesarAsistenciaFilterPage from "./ProcesarAsistenciaFilterPage";
import ProcesarAsistenciaListPage from "./ProcesarAsistenciaListPage";

import { ServiceProceso } from "../../../../api/asistencia/procesaAsistencia.api"


export const initialFilter = {
  IdCliente: '',
  IdDivision: '',
  IdUnidadOrganizativa: '',
  IdPosicion: '',
  Personas: '',
  IdCentroCosto: '',
  IdPlanilla: '',
  Activo: '',
  FechaInicio: '',
  FechaFin: '',

};

const ProcesarAsistenciaIndexPage = (props) => {

  const { intl, setLoading, dataMenu } = props;
  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  //const [dataIdCompania, setDataIdCompania] = useState(null);//ADD
  const [varIdCompania, setVarIdCompania] = useState("");
  const [varIdProceso, setVarIdProceso] = useState("");
  const [varEnabledButton, setVarEnabledButton] = useState(false);
  const [procesoLog, setProcesoLog] = useState({});

  const perfil = useSelector((state) => state.perfil.perfilActual);

  //ADD-> INTERVALOS DE FECHA 1 A 30
  const { FechaInicio, FechaFin } = getDateOfDay();
  const [time, setTime] = useState(Date.now());

  //FILTRO
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();
  const [dataGridRef, setDataGridRef] = useState(null);


  const [dataRowEditNew, setDataRowEditNew] = useState({
    IdCliente: perfil.IdCliente,
    IdDivision: perfil.IdDivision,
    IdUnidadOrganizativa: '',
    IdPosicion: '',
    Personas: '',
    IdCentroCosto: '',
    IdPlanilla: '',
    Activo: '',
    FechaInicio: FechaInicio,
    FechaFin: FechaFin,

  });

  const procesarAsistencia = async (filtro) => {

    const {
      IdCliente,
      IdDivision,
      IdCompania,
      IdUnidadOrganizativa,
      Personas,
      IdPlanilla,
      FechaInicio,
      FechaFin

    } = filtro;

    let params = {
      IdCliente,
      IdDivision,
      IdCompania,
      IdUnidadOrganizativa,
      Personas,
      IdPlanilla,
      FechaInicio,
      FechaFin
    }

    //setLoading(true);

    //Enviar mensaje que se está ejecutandose
    handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.RUN.PROCESS.SUCESS" }));
    //Llamar al evento de obtener proceso

    ServiceProceso.procesar(params).then(resp => {
      //obtener proceso      
      obtenerProceso(varIdCompania);
      filtrarLog();
      //handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.DOWNLOAD.SUCESS" }));
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => {
      setLoading(false);
    });

  }

  async function obtenerProceso(idCompania) {
    var process = { Estado: "" };
    // console.log("obtenerProceso->varIdCompania", varIdCompania);
    console.log("obtenerProceso->varIdCompania.parameter", idCompania);
    if (!isNotEmpty(idCompania)) return process;

    await ServiceProceso.obtener({ IdCliente: "", IdCompania: idCompania }).then(proceso => {
      //console.log("obtenerProceso.API", proceso);
      const { IdProceso, Estado } = proceso;
      setVarIdProceso(IdProceso);
      //setVarIdCompania(IdCompania);
      setProcesoLog({ ...proceso });
      setVarEnabledButton(Estado == "I" ? true : false);
      process = proceso;
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => {
      setLoading(false);
    });

    return process;

  }

  const filtrarLog = async () => {

    //Obtener Proceso ultimo ejecutandose...
    //console.log("filtrarLog.dataRowEditNew", dataRowEditNew);
    const {
      IdCliente,
      IdDivision,
      IdCompania } = dataRowEditNew;

    if (!isNotEmpty(varIdCompania) && isNotEmpty(varIdProceso)) return;

    //console.log("filtro", IdCliente, IdDivision, IdCompania);
    //comunicarnos con customerDataGrid.
    dataSource.loadDataWithFilter({
      data: {
        IdCliente,
        IdDivision,
        IdCompania,
        IdProceso: isNotEmpty(varIdProceso) ? varIdProceso.toString() : "0",
        IdValue: new Date()
      }
    });

  }


  const clearDataGrid = () => {
    resetLoadOptions();
  }

  const exportReport = async () => {

    //console.log("exporrReport", { dataGridRef });

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

      const { IdCompania } = dataRowEditNew;

      let params = {
        IdCliente: perfil.IdCliente,
        IdDivision: perfil.IdDivision,
        IdCompania: isNotEmpty(IdCompania) ? IdCompania : "",
        IdProceso: varIdProceso.toString(),

        tituloHoja: intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.PROCESAMIENTO" }),
        nombreHoja: intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.PROCESAMIENTO" }),
        arrayNombresCabecera,
        arrayNombresData
      };

      setLoading(true);

      //console.log("exportarProcesoLog..inicio");
      await ServiceProceso.exportarProcesoLog(params).then(resp => {
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
  // const showInforUltimoProceso = () => {
  //   return <>
  //     &nbsp;
  //     {(isNotEmpty(varIdProceso)) ? (
  //       <Alert severity="info" variant="outlined">
  //         <div className="row" style={{ color: 'blue' }} >
  //           <div className="col-4"> </div>
  //           <div className="col-4"> </div>
  //           <div className="col-4"> </div>
  //           <div className="col-4"> </div>
  //         </div>
  //       </Alert>
  //     ) : (<></>)
  //     }
  //   </>
  // }

  useEffect(() => {

    if (isNotEmpty(varIdCompania)) obtenerProceso(varIdCompania);
    if (isNotEmpty(varIdCompania) && isNotEmpty(varIdProceso)) filtrarLog();

    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //->Cada 10 segundos se ejecutará obtener proceso
    //->Si proceso tiene estado I entonces llamará al metodo listar para refrescar lista.
    const interval = setInterval(function (idCompania) {
      setTime(Date.now());
      console.log("parameter->", idCompania);
      //obtener proceso
      obtenerProceso(idCompania).then(response => {
        const { IdProceso, Estado } = response;
        if (Estado == "I" && isNotEmpty(IdProceso)) {
          //Listar log cuando estado del proceso está incompleto
          console.log("listar log->", { Estado, IdProceso });
          filtrarLog();
        }
      });

    }, 10000, varIdCompania);
    return () => {
      clearInterval(interval);
    };
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  }, [varIdCompania])

  useEffect(() => {

    if (isNotEmpty(varIdProceso)) filtrarLog();

  }, [varIdProceso])



  return (
    <>
      <a id="iddescarga" className="" ></a>
      <CustomBreadcrumbs
        Title={intl.formatMessage({ id: "ASSISTANCE.MAIN" })}
        SubMenu={intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.GESTIÓN_DE_INCIDENCIAS" })}
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
              {/* <div className="row">
                <div className="col-12">
                  {showInforUltimoProceso()}
                </div>
              </div> */}

              <ProcesarAsistenciaFilterPage
                dataRowEditNew={dataRowEditNew}
                setDataRowEditNew={setDataRowEditNew}
                //setDataIdCompania={setDataIdCompania}
                procesarAsistencia={procesarAsistencia}
                clearDataGrid={clearDataGrid}
                exportReport={exportReport}
                dataGridRef={dataGridRef}
                dataMenu={dataMenu}

                varIdCompania={varIdCompania}
                setVarIdCompania={setVarIdCompania}
                varIdProceso={varIdProceso}
                procesoLog={procesoLog}
                varEnabledButton={varEnabledButton}
              />

              <ProcesarAsistenciaListPage
                //uniqueId={"ReportaccesoRequisitoList"}
                //dataIdCompania={dataIdCompania}
                varIdCompania={varIdCompania}
                varIdProceso={varIdProceso}
                isFirstDataLoad={isFirstDataLoad}
                setIsFirstDataLoad={setIsFirstDataLoad}
                dataSource={dataSource}
                refresh={refresh}
                resetLoadOptions={resetLoadOptions}
                refreshData={refreshData}
                setRefreshData={setRefreshData}
                setDataGridRef={setDataGridRef}
              />




            </TabPanel>

          </div>
        </>
      </Portlet>
    </>
  );
};


export default injectIntl(WithLoandingPanel(ProcesarAsistenciaIndexPage));
