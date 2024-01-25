import React, { useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { Portlet ,PortletBody} from "../../../../../partials/content/Portlet";
import { useStylesEncabezado, useStylesTab } from "../../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import TabPanel from "../../../../../partials/content/TabPanel";
import {  getDateOfDay } from '../../../../../../_metronic/utils/utils';

import ReporteFilterPage from "./ReporteFilterPage";
import { isNotEmpty } from "../../../../../../_metronic";
import { getStartAndEndOfMonthByDay} from "../../../../../../_metronic";

const ConsultaPorIntervaloIndexPage = (props) => {

  const { intl, setLoading, dataMenu } = props;

  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const { FechaInicio } = getStartAndEndOfMonthByDay();
  const { FechaFin } = getDateOfDay();
  

  const [dataRowEditNew, setDataRowEditNew] = useState({
    esNuevoRegistro: true,
    TipoConsulta: 'T',
    Compania: "",
    Persona: "",
    TipoVehiculo: "",
    Zona: "",
    IdEntidad: 'T',
    IntervaloControl: '2',
    TipoAcceso: 'S',
    IdTipoMarcacion: '',
    FechaInicio,
    FechaFin
  });
  

  return (
    <>
      <CustomBreadcrumbs
        Title={intl.formatMessage({ id: "ACCESS.MAIN" })}
        SubMenu={intl.formatMessage({ id: "ACCESS.REPORT.SUBMENU" })}
        Subtitle={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
      />
      <Portlet>
      <PortletBody>
        <AppBar position="static" className={classesEncabezado.principal}>
          <Toolbar variant="dense" className={classesEncabezado.toolbar}>
            <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
              {intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
            </Typography>
          </Toolbar>
        </AppBar>

              <ReporteFilterPage
                dataMenu={dataMenu}
                dataRowEditNew={dataRowEditNew}
                setDataRowEditNew={setDataRowEditNew}
              />

        </PortletBody>
      </Portlet>
    </>
  );
};


export default injectIntl(WithLoandingPanel(ConsultaPorIntervaloIndexPage));
