import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { AppBar, Toolbar, Typography } from "@material-ui/core";
import { Portlet } from "../../../../partials/content/Portlet";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import TabPanel from "../../../../partials/content/TabPanel";
import { base64ToArrayBuffer, dateFormat, getStartAndEndOfMonthByDay, isNotEmpty, saveByteArray, truncateDate, } from "../../../../../_metronic";
import ReporteIncidenciaEditPage from "./ReporteIncidenciaEditPage";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { serviceCompania } from "../../../../api/administracion/compania.api";

import { obtenerTodos as obtenerPlanillas } from "../../../../api/asistencia/planilla.api";
import { serviceZonaModulo } from "../../../../api/administracion/zonaModulo.api";
import { obtenerTodos as obtenerIncidencias, exportarExcel as exportarIncidenciaExcel } from "../../../../api/asistencia/incidencia.api";



const ReporteIncidenciaIndex = props => {
  const { intl, setLoading, dataMenu } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);
  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const [initDataRowEdit, setInitDataRowEdit] = useState({});
  const [dataRowEditNew, setDataRowEditNew] = useState({
    esNuevoRegistro: true,
    IdCompanias: "" 
  });
  const [filterDataRow, setFilterDataRow] = useState({
    esNuevoRegistro: true,
    IdCompanias: "" 
  });

  /************************************************** */
  const [flagLoaded, setFlagLoaded] = useState(false);
  const [companiaData, setCompaniaData] = useState([]);
  const [cmbPlanilla, setcmbPlanilla] = useState([]);
  const [lstZona, setlstZona] = useState([]);
  const [cmbIncidencia, setcmbIncidencia] = useState([]);
  const [cmbLeyenda, setcmbLeyenda] = useState([]);

  /************************************************** */

  const [cabeceraReporte, setCabeceraReporte] = useState(["", ""]);


  useEffect(() => {
    cargarCombos();
  }, []);

  const cargarCombos = async () => {
    setLoading(true);
    await Promise.all([
      serviceCompania.obtenerTodosConfiguracion({
        IdCliente: perfil.IdCliente,
        IdModulo: dataMenu.info.IdModulo,
        IdAplicacion: dataMenu.info.IdAplicacion,
        IdConfiguracion: "ID_COMPANIA"
      }),
      serviceZonaModulo.obtenerTodos({
        IdCliente: perfil.IdCliente,
        IdDivision: perfil.IdDivision,
        IdZona: '',
        IdModulo: dataMenu.info.IdModulo
      }),
      obtenerIncidencias({ IdIncidencia: "%", Adicional: "S" }),
    ])
      .then(resp => {
        let listaIncidencias = resp[2].filter(x => x.Listar == 'S');
        let listaLeyenda = [];
        listaLeyenda.push(...resp[2]);

        setCompaniaData(resp[0]);
        setlstZona(resp[1]);
        setcmbIncidencia(listaIncidencias);
        setcmbLeyenda(listaLeyenda);

        /********************** */
        let idCompania = resp[0].length > 0 ? resp[0][0].IdCompania || "" : "";
        let Compania = resp[0].length > 0 ? resp[0][0].Compania || "" : "";
        let { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay(new Date(), 1);
        FechaFin = truncateDate(new Date());

        setDataRowEditNew({
          ...dataRowEditNew,
          FechaInicio,
          FechaFin,

          IdCompania: idCompania,
          Compania: Compania,
          EnfermedadInicio: FechaInicio,
          EnfermedadFin: FechaFin,
          CertificadoInicio: FechaInicio
        });
        setInitDataRowEdit({
          ...dataRowEditNew,
          FechaInicio,
          FechaFin,
          IdCompania: idCompania,
          Compania: Compania
        })
        setFilterDataRow({
          ...dataRowEditNew,
          FechaInicio,
          FechaFin,
          IdCompania: idCompania,
          Compania: Compania
        })
        /********************** */
        CargarPlanilla(idCompania);
        setFlagLoaded(true);
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      })
      .finally(resp => {
        setLoading(false);
      });
  };

  const CargarPlanilla = async (IdCompany) => {
    setLoading(true);
    await obtenerPlanillas({
      IdCliente: perfil.IdCliente,
      IdCompania: IdCompany
    }).then((response) => {
      setcmbPlanilla(response);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  const CargarIncidencia = async () => {
    setLoading(true);
    await obtenerIncidencias({
      IdIncidencia: '%',
    }).then((response) => {
      setcmbIncidencia(response);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  const exportIncidenciaExcel = async () => {
    const {
      IdCompania,
      IdUnidadOrganizativa,
      IdPlanilla,
      IdZona,
      Personas,
      FechaInicio,
      FechaFin,
      IdIncidencia,
      Incidencias } = dataRowEditNew;

    const param = {
      IdCompania: isNotEmpty(IdCompania) ? IdCompania : "",
      IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa : "",
      IdPlanilla: isNotEmpty(IdPlanilla) ? IdPlanilla : "",
      IdZona: isNotEmpty(IdZona) ? IdZona : "",
      Personas: isNotEmpty(Personas) ? Personas : "",
      FechaInicio: dateFormat(FechaInicio, "yyyyMMdd"),
      FechaFin: dateFormat(FechaFin, "yyyyMMdd"),
      //IdIncidencia: isNotEmpty(IdIncidencia) ? IdIncidencia : "",
      Incidencias: isNotEmpty(Incidencias) ? Incidencias : "",
      IdPerfil: perfil.IdPerfil,
      OrderField: "NombreCompleto",
      OrderDesc: "0",
      Skip: "0",
      Take: "0",

      Titulo: intl.formatMessage({ id: "CONFIG.MENU.ASSISTANCE.REPORT_INCIDENCE" }),//"REPORTE GESTIÓN INCIDENCIAS",
      Plantilla: intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.INCIDENCIAS" }),
      NombreArchivo: "GestionIncidencias",
      CabeceraReporte: cabeceraReporte[0],
      CabeceraFieldReporte: cabeceraReporte[1],


      TituloDos: intl.formatMessage({ id: "ASSISTANCE.INCIDENCE.INCIDENCE_LEYEND" }),
      PlantillaDos: intl.formatMessage({ id: "COMMON.LEGEND" }),
      CabeceraReporteDos: "Alias|Incidencia|Color",
      CabeceraFieldReporteDos: "Alias|Incidencia|Color",
    }

    setLoading(true);
    try {
      const response = await exportarIncidenciaExcel(param);
      if (response) {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.DOWNLOAD.SUCESS" }));
        const { fileName, fileBase64 } = response;
        var base64String = base64ToArrayBuffer(fileBase64);
        saveByteArray(fileName, base64String, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,");
      }
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    } finally {
      setLoading(false);
    }
  }


  return (
    <>
      <a id="iddescarga" className=""></a>
      <div className="row">
        <div className="col-md-12">
          <CustomBreadcrumbs
            Title={intl.formatMessage({ id: "ASSISTANCE.MAIN" })}
            SubMenu={intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.GESTIÓN_DE_INCIDENCIAS" })}
            Subtitle={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}
          />
          <Portlet className={classesEncabezado.border}>
            <AppBar position="static" className={classesEncabezado.principal}>
              <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                <Typography
                  variant="h6"
                  color="inherit"
                  className={classesEncabezado.title}
                >
                  {`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}
                </Typography>
              </Toolbar>
            </AppBar>
            <>

              <TabPanel value={0} className={classes.TabPanel} index={0}>
                {flagLoaded && (
                  <ReporteIncidenciaEditPage
                    dataRowEditNew={dataRowEditNew}
                    initDataRowEdit={initDataRowEdit}
                    setDataRowEditNew={setDataRowEditNew}
                    dataMenu={dataMenu}
                    companiaData={companiaData}
                    cmbPlanilla={cmbPlanilla}
                    lstZona={lstZona}
                    cmbIncidencia={cmbIncidencia}
                    CargarPlanilla={CargarPlanilla}
                    exportIncidenciaExcel={exportIncidenciaExcel}
                    setCabeceraReporte={setCabeceraReporte}
                    cmbLeyenda={cmbLeyenda}
                    CargarIncidencia={CargarIncidencia}
                    setLoading={setLoading}

                    filterDataRow={filterDataRow}
                    setFilterDataRow={setFilterDataRow}
                  />
                )}
              </TabPanel>

              {/* </div> */}
            </>
          </Portlet>
        </div>
      </div>
    </>
  );
};

export default injectIntl(WithLoandingPanel(ReporteIncidenciaIndex));
