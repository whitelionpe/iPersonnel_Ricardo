import React, { useState } from 'react';
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { handleErrorMessages } from "../../../../../store/ducks/notify-messages";
import { isNotEmpty } from "../../../../../../_metronic";
import { dateFormat } from '../../../../../../_metronic/utils/utils';
import EmisionFotocheckFilterPage from './EmisionFotocheckFilterPage';
import { serviceReporte } from '../../../../../api/identificacion/reporte.api';
import { DynamicReport } from '../../../../../partials/components/DynamicReport';


const EmisionFotocheckIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const { IdCliente, IdPerfil, IdDivision } = useSelector(state => state.perfil.perfilActual);
  const [dataSourceFotoCheck, setDataSourceFotoCheck] = useState({
    columns: [], labels: [], data: []
  });
  //const { FechaInicio, FechaFin } = getDateOfDay();
  console.log("EmisionFotocheckIndexPage", { dataSourceFotoCheck });
  let hoy = new Date();
  let fecIni = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  let fecFin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  const initialFilters = {
    IdCliente: IdCliente,
    IdPerfil: '',
    IdDivisionPerfil: '',
    IdCompania: '',
    Compania: '',
    UnidadOrganizativa: '',
    IdUnidadOrganizativa: '',
    IdEntidad: '',
    IdCaracteristica: '',
    IdCaracteristicaDetalle: '',
    Condicion: '',
    Devuelto: '',
    IdMotivo: '',
    IdTipoCredencial: '',
    Impreso: '',
    Vigencia: '',
    Activo: '',
    FechaInicio: fecIni,
    FechaFin: fecFin,
    FechaInicioVencimiento: '',
    FechaFinVencimiento: ''
  }
  const [dataRowEditNew, setDataRowEditNew] = useState(initialFilters);

  const getParameters = () => {
    let IdDivisionPerfil = IdDivision;
    let Companias = dataRowEditNew.IdCompania;//dataRowEditNew.ListaCompania.map(x => (x.IdCompania)).join(',');
    let UnidadesOrganizativa = dataRowEditNew.IdUnidadOrganizativa; //dataRowEditNew.ListaUnidadOrganizativa.map(x => (x.IdUnidadOrganizativa)).join(',');
    let IdEntidad = dataRowEditNew.IdEntidad;
    let IdCaracteristica = dataRowEditNew.IdCaracteristica;
    let IdCaracteristicaDetalle = dataRowEditNew.IdCaracteristicaDetalle;
    let Condicion = dataRowEditNew.Condicion;
    let Devuelto = dataRowEditNew.Devuelto;
    let IdMotivo = dataRowEditNew.IdMotivo;
    let IdTipoCredencial = dataRowEditNew.IdTipoCredencial;
    let Impreso = dataRowEditNew.Impreso;
    let Vigencia = dataRowEditNew.Vigencia;
    let Activo = dataRowEditNew.Activo;
    let FechaInicio = dataRowEditNew.FechaInicio;
    let FechaFin = dataRowEditNew.FechaFin;
    let FechaInicioVencimiento = dataRowEditNew.FechaInicioVencimiento;
    let FechaFinVencimiento = dataRowEditNew.FechaFinVencimiento;

    let parametros = {
      IdPerfil: isNotEmpty(IdPerfil) ? IdPerfil : "%",
      IdDivisionPerfil: isNotEmpty(IdDivisionPerfil) ? IdDivisionPerfil : "%",
      Companias: isNotEmpty(Companias) ? Companias : "%",
      UnidadesOrganizativa: isNotEmpty(UnidadesOrganizativa) ? UnidadesOrganizativa : "%",
      IdEntidad: isNotEmpty(IdEntidad) ? IdEntidad : "%",
      IdCaracteristica: isNotEmpty(IdCaracteristica) ? IdCaracteristica : "%",
      IdCaracteristicaDetalle: isNotEmpty(IdCaracteristicaDetalle) ? IdCaracteristicaDetalle : "%",
      Condicion: isNotEmpty(Condicion) ? Condicion : "%",
      Devuelto: isNotEmpty(Devuelto) ? Devuelto : "%",
      IdMotivo: isNotEmpty(IdMotivo) ? IdMotivo : "%",
      IdTipoCredencial: isNotEmpty(IdTipoCredencial) ? IdTipoCredencial : "%",
      Impreso: isNotEmpty(Impreso) ? Impreso : "%",
      Vigencia: isNotEmpty(Vigencia) ? Vigencia : "%",
      Activo: isNotEmpty(Activo) ? Activo : "%",
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyy-MM-dd') : " ",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyy-MM-dd') : " ",
      FechaInicioVencimiento: isNotEmpty(FechaInicioVencimiento) ? dateFormat(FechaInicioVencimiento, 'yyyy-MM-dd') : " ",
      FechaFinVencimiento: isNotEmpty(FechaFinVencimiento) ? dateFormat(FechaFinVencimiento, 'yyyy-MM-dd') : " ",
    }

    return parametros;
  }

  const generarReporte = async (e) => {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      setLoading(true);
      let parametros = getParameters();
      let data = await serviceReporte.listarIdentificacionReporte001EmisionFotochecksDynamic(parametros).catch(err => { handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err) });

      console.log("data", data);
      if (!!data && data.length > 0) {
        let [labels, fields, datasource] = data;
        setDataSourceFotoCheck({
          columns: fields, labels: labels, data: datasource
        })
      }

      setLoading(false);
    }
  }

  const limpiarReporte = () => {
    setLoading(true);
    setDataRowEditNew(initialFilters);
    setDataSourceFotoCheck(prev => ({ ...prev, data: [] }));
    setLoading(false);
  }

  const exportarReporte = async () => {
    console.log("ejecutar exportar reporte");
    let parametros = getParameters();
    return {
      parameters: parametros,
      event: serviceReporte.ExportarIdentificacionReporte001EmisionFotochecksDynamic
    }
  }

  return (
    <DynamicReport
      id={"rptemisionfotocheck"}
      menutitle={intl.formatMessage({ id: "IDENTIFICATION.REASON.MENU" })}
      submenuTitle={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
      menusubtitle={intl.formatMessage({ id: "IDENTIFICATION.REPORT" })}
      titleReport={intl.formatMessage({ id: "CONFIG.MENU.IDENTIFICACION.MARCACIONES" })}
      eventSearch={generarReporte}
      eventRefresh={limpiarReporte}
      eventExport={exportarReporte}
      dataSource={dataSourceFotoCheck}
      additionalProperties={[]}
    >
      <EmisionFotocheckFilterPage
        dataRowEditNew={dataRowEditNew}
        setDataRowEditNew={setDataRowEditNew}
      />
    </DynamicReport>
  );

};

export default injectIntl(WithLoandingPanel(EmisionFotocheckIndexPage));
