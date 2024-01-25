import React, { Fragment, useState, useEffect } from 'react';

import { useSelector } from "react-redux";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { handleErrorMessages, handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../../partials/layout/CustomBreadcrumbs";
import { isNotEmpty } from "../../../../../../_metronic";
import { Portlet } from "../../../../../partials/content/Portlet";
import TabPanel from "../../../../../partials/content/TabPanel";
import { dateFormat, getDateOfDay } from '../../../../../../_metronic/utils/utils';

import CustomTabNav from '../../../../../partials/components/Tabs/CustomTabNav';
import MarcacionesPersonaFilterPage from './MarcacionesPersonaFilterPage';
import Guid from 'devextreme/core/guid';
import FrameReport from '../../../../../partials/components/iframeReport/iFrameReport';
import { DynamicReport } from '../../../../../partials/components/DynamicReport';
import { serviceReporte } from '../../../../../api/acceso/reporte.api';

const MarcacionesPersonaIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const perfil = useSelector((state) => state.perfil.perfilActual);
  const { FechaFin } = getDateOfDay();
  let hoy = new Date();
  let fecIni = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const [dataSourceDynamicGrid, setDataSourceDynamicGrid] = useState({
    columns: [], labels: [], data: []
  });

  const initialFilters = {
    esNuevoRegistro: true,
    Compania: "",
    ListaDivision: [],
    UnidadOrganizativa: "",
    ListaPersona: [],
    FechaInicio: fecIni,
    FechaFin: FechaFin,
    HoraInicio: fecIni,
    HoraFin: FechaFin,
    IdReporte: '',
    IdZona: '',
    IdPuerta: '',
    IdTipoMarcacion: '',
    Funcion: '',
    TipoAcceso: '',
    Reporte: ''
  }

  const [dataRowEditNew, setDataRowEditNew] = useState(initialFilters);


  const getParameters = () => {
    let IdCliente = perfil.IdCliente;
    let Companias = dataRowEditNew.IdCompania;//dataRowEditNew.ListaCompania.map(x => (x.IdCompania)).join(',');
    let UnidadesOrganizativa = dataRowEditNew.IdUnidadOrganizativa;//dataRowEditNew.ListaUnidadOrganizativa.map(x => (x.IdUnidadOrganizativa)).join(',');
    let IdZona = dataRowEditNew.IdZona;
    let IdPuerta = dataRowEditNew.IdPuerta;
    let IdTipoMarcacion = dataRowEditNew.IdTipoMarcacion;
    let Funcion = dataRowEditNew.Funcion;
    let TipoAcceso = dataRowEditNew.TipoAcceso;
    let FechaInicio = dataRowEditNew.FechaInicio;
    let FechaFin = dataRowEditNew.FechaFin;
    let Personas = dataRowEditNew.ListaPersona.map(x => (x.IdPersona)).join(',');
    let HoraInicio = new Date(dataRowEditNew.HoraInicio);//.toLocaleString();
    let HoraFin = new Date(dataRowEditNew.HoraFin);//.toLocaleString();

    let parametros = {
      IdCliente: isNotEmpty(IdCliente) ? IdCliente : "%",
      Companias: isNotEmpty(Companias) ? Companias : "%",
      UnidadesOrganizativa: isNotEmpty(UnidadesOrganizativa) ? UnidadesOrganizativa : "%",
      IdZona: isNotEmpty(IdZona) ? IdZona : "%",
      IdPuerta: isNotEmpty(IdPuerta) ? IdPuerta : "%",
      IdTipoMarcacion: isNotEmpty(IdTipoMarcacion) ? IdTipoMarcacion : "%",
      Funcion: isNotEmpty(Funcion) ? Funcion : "%",
      TipoAcceso: isNotEmpty(TipoAcceso) ? TipoAcceso : "%",
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyy-MM-dd') : " ",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyy-MM-dd') : " ",
      Personas: isNotEmpty(Personas) ? Personas : "%",
      HoraInicio: isNotEmpty(HoraInicio) ? dateFormat(HoraInicio, 'hh:mm:ss') : " ",
      HoraFin: isNotEmpty(HoraFin) ? dateFormat(HoraFin, 'hh:mm:ss') : " "
    }

    return parametros;
  }
  const generarReporte = async (e) => {
    //console.log('hoja -> ', count, tabs.length);
    let result = e.validationGroup.validate();
    if (result.isValid) {
      setLoading(true);
      let parametros = getParameters();
      let data = await serviceReporte.ListarAccesoReporte001MarcacionesPersonaDynamic(parametros)
        .catch(err => { handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err) });

      console.log("data", data);
      if (!!data && data.length > 0) {
        let [labels, fields, datasource] = data;
        setDataSourceDynamicGrid({
          columns: fields, labels: labels, data: datasource
        })
      }

      setLoading(false);

    }
  }

  const limpiarReporte = () => {
    setLoading(true);
    setDataRowEditNew(initialFilters);
    setDataSourceDynamicGrid(prev => ({ ...prev, data: [] }));
    setLoading(false);
  }

  const exportarReporte = async () => {
    let parametros = getParameters();
    return {
      parameters: parametros,
      event: serviceReporte.ExportarAccesoReporte001MarcacionesPersonaDynamic
    }
  }
  return (
    <DynamicReport
      id={"rptemisionfotocheck"}
      menutitle={intl.formatMessage({ id: "ACCESS.REPORT.MENU" })}
      submenuTitle={intl.formatMessage({ id: "ACCESS.REPORT.SUBMENU" })}
      menusubtitle={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
      titleReport={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
      eventSearch={generarReporte}
      eventRefresh={limpiarReporte}
      eventExport={exportarReporte}
      dataSource={dataSourceDynamicGrid}
      additionalProperties={[]}
    ><MarcacionesPersonaFilterPage
        dataRowEditNew={dataRowEditNew}
        setDataRowEditNew={setDataRowEditNew} />
    </DynamicReport>
  );

};

export default injectIntl(WithLoandingPanel(MarcacionesPersonaIndexPage));
