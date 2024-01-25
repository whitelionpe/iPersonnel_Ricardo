import React, { useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { handleErrorMessages } from "../../../../../store/ducks/notify-messages";
import { isNotEmpty, dateFormat } from "../../../../../../_metronic";
import { Portlet } from "../../../../../partials/content/Portlet";
import {
  useStylesEncabezado,
  useStylesTab
} from "../../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import TabPanel from "../../../../../partials/content/TabPanel";
import CamasDisponiblesPage from "../CamasDisponiblesPage";
import {
  obtener as obtenerReserva,
  consultareserva as consultareservacama,
  excel
} from "../../../../../api/campamento/reserva.api";

const ReporteIndexPage = props => {
  const { intl, setLoading, dataMenu } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);
  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const [dataRowEditNew, setDataRowEditNew] = useState({
    esNuevoRegistro: true,
    conCamas: 0
  });

  const retornarReserva = async infoData => {
    let objReserva = [];
    let param = {
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdCampamento: infoData.IdCampamento,
      IdReserva: infoData.IdReserva,
      Fecha: infoData.Fecha // dateFormat(new Date(infoData.Fecha), "yyyyMMdd")
    };

    await obtenerReserva(param)
      .then(resp => {
        objReserva = resp;
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
        objReserva = [];
      })
      .finally(() => { });

    return objReserva;
  };

  const getInfo = () => { };

  const consultarDisponibilidadCamas = async (servicios, skip, take) => {
    setLoading(true);
    let {
      IdCampamento,
      IdTipoModulo,
      IdTipoHabitacion,
      IdHabitacion,
      IdModulo,
      FechaInicio,
      FechaFin,
      conCamas,
      IdPerfil
    } = dataRowEditNew;

    let strServicios = servicios
      .filter(x => x.Check)
      .map(x => x.IdServicio)
      .join("|");

    let datosReserva = await consultareservacama({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdCampamento,
      IdTipoModulo,
      IdTipoHabitacion,
      FechaInicio: dateFormat(FechaInicio, "yyyyMMdd"), //new Date(FechaInicio).toLocaleString(),
      FechaFin: dateFormat(FechaFin, "yyyyMMdd"), //new Date(FechaFin).toLocaleString(),
      servicios: strServicios,
      IdModulo: isNotEmpty(IdModulo)?IdModulo:'',
      IdHabitacion: isNotEmpty(IdHabitacion)?IdHabitacion:'',
      conCamas,
      IdPerfil,
      skip,
      take,
      OrderField: "Cama",
      OrderDesc: 0
    })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
        return { IdErro: 1, reservas: [] };
      })
      .finally(() => {
        setLoading(false);
      });

    //console.log("----------->", datosReserva);
    if (typeof datosReserva === "object" && datosReserva !== null) {
      datosReserva.IdError = 0;
      return datosReserva;
    } else {
      return { IdErro: 1, reservas: [] };
    }

    return datosReserva;
  };


  const descargaExcel = async (servicios, skip, take) => {
    setLoading(true);
    let {
      IdCampamento,
      IdTipoModulo,
      IdTipoHabitacion,
      FechaInicio,
      FechaFin,
      conCamas,
      IdPerfil
    } = dataRowEditNew;

    let strServicios = servicios
      .filter(x => x.Check)
      .map(x => x.IdServicio)
      .join("|");

    let datosReserva = await excel({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdCampamento,
      IdTipoModulo,
      IdTipoHabitacion,
      FechaInicio: dateFormat(FechaInicio, "yyyyMMdd"),
      FechaFin: dateFormat(FechaFin, "yyyyMMdd"),
      servicios: strServicios,
      conCamas,
      IdPerfil,
      skip,
      take,
      OrderField: "Cama",
      OrderDesc: 0

    })
      .then(resp => {
        console.log("respuesta->", resp);
        if (resp.error === 0) {
          console.log("crear archivo");
          let temp = `data:application/vnd.ms-excel;base64,${encodeURIComponent(
            resp.fileBase64
          )}`;
          console.log(temp);
          let download = document.getElementById("iddescarga");
          download.href = temp;
          download.download = `${resp.nombre}.xlsx`;
          download.click();
        } else {
          handleErrorMessages(
            intl.formatMessage({ id: "MESSAGES.ERROR" }),
            resp.mensaje
          );
        }
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      })
      .finally(() => {
        setLoading(false);
      });
  };


  return (
    <>
      <a id="iddescarga" className="" ></a>
      <div className="row">
        <div className="col-md-12">
          <Portlet className={classesEncabezado.border}>
            <CustomBreadcrumbs
              Title={intl.formatMessage({ id: "CAMP.REPORT.MENU" })}
              SubMenu={intl.formatMessage({ id: "CAMP.REPORT.SUBMENU" })}
              Subtitle={intl.formatMessage({
                id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}`
              })}
            />

            <AppBar position="static" className={classesEncabezado.principal}>
              <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                <Typography
                  variant="h6"
                  color="inherit"
                  className={classesEncabezado.title}
                >
                  {intl.formatMessage({
                    id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""
                      }`
                  })}
                </Typography>
              </Toolbar>
            </AppBar>
            <>
              {/* <div className={classes.root}> */}
              <TabPanel value={0} className={classes.TabPanel} index={0}>
                <CamasDisponiblesPage
                  getInfo={getInfo}
                  dataRowEditNew={dataRowEditNew}
                  setDataRowEditNew={setDataRowEditNew}
                  consultarDisponibilidadCamas={consultarDisponibilidadCamas}
                  retornarReserva={retornarReserva}
                  descargaExcel={descargaExcel}
                  columnasEstaticasAdicionales={
                    [
                      { dataField: "Habitacion", caption: intl.formatMessage({ id: "CAMP.BED_MANAGEMENT.ROOM" }), width: '90', },
                    ]
                  }
                  forceViewPaginacion={true}
                />
              </TabPanel>

              {/* </div> */}
            </>
          </Portlet>
        </div>
      </div>
    </>
  );
};
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

export default injectIntl(WithLoandingPanel(ReporteIndexPage));
