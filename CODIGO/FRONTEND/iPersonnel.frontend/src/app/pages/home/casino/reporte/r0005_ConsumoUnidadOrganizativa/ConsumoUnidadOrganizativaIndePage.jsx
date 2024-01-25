import React, { useState } from "react";
import ConsumoUnidadOrganizativaFilterPage from "./ConsumoUnidadOrganizativaFilterPage";
import { injectIntl } from "react-intl";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";
import { DynamicReport } from "../../../../../partials/components/DynamicReport";
import {
  dateFormat,
  getStartAndEndOfMonthByDay,
  isNotEmpty
} from "../../../../../../_metronic";
import { handleErrorMessages } from "../../../../../store/ducks/notify-messages";
import { serviceCasinoReporte } from "../../../../../api/casino/reporte.api";

const ConsumoUnidadOrganizativaIndePage = props => {
  const { intl, setLoading, dataMenu } = props;

  const [dataSourceFotoCheck, setDataSourceFotoCheck] = useState({
    columns: [],
    labels: [],
    data: []
  });

  const { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay();
  const initialFilters = {
    IdDivision: "",
    IdComedor: "",
    IdServicios: "",
    IdCompania: "",
    FechaInicio,
    FechaFin,
    UnidadesOrganizativas: ""
  };
  const [dataRowEditNew, setDataRowEditNew] = useState(initialFilters);

  const getParameters = () => {
    let {
      IdDivision,
      IdComedor,
      IdServicio,
      IdCompania,
      FechaInicio: FInicio,
      FechaFin: FFin,
      UnidadesOrganizativas
    } = dataRowEditNew;

    let parametros = {
      IdDivision: isNotEmpty(IdDivision) ? IdDivision : "",
      IdComedor: isNotEmpty(IdComedor) ? IdComedor : "",
      IdServicios: isNotEmpty(IdServicio) ? IdServicio : "",
      IdCompania: isNotEmpty(IdCompania) ? IdCompania : "",
      FechaInicio: dateFormat(FInicio, "yyyyMMdd"),
      FechaFin: dateFormat(FFin, "yyyyMMdd"),
      UnidadesOrganizativas: isNotEmpty(UnidadesOrganizativas)
        ? UnidadesOrganizativas
        : ""
    };
    return parametros;
  };

  const generarReporte = async e => {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      setLoading(true);
      let parametros = getParameters();
      let data = await serviceCasinoReporte
        .ListarReporte005ConsumoXUnidadorganizativa(parametros)
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
        });
 
      if (!!data && data.length > 0) {
        let [labels, fields, datasource] = data;
        setDataSourceFotoCheck({
          columns: fields,
          labels: labels,
          data: datasource
        });
      }

      setLoading(false);
    }
  };

  const limpiarReporte = () => {
    setLoading(true);
    setDataRowEditNew(initialFilters);
    setDataSourceFotoCheck(prev => ({ ...prev, data: [] }));
    setLoading(false);
  };

  const exportarReporte = async () => { 
    let parametros = getParameters();
    return {
      parameters: parametros,
      event: serviceCasinoReporte.ExportarReporte005ConsumoXUnidadorganizativa
    };
  };

  const additionalProperties = [];
  const dataGridProperties = {};

  return (
    <DynamicReport
      id={"rptconsolidadoconsumoxundorg"}
      menutitle={intl.formatMessage({ id: "CONFIG.MODULE.COMEDORES" })}
      submenuTitle={intl.formatMessage({ id: "CONFIG.MENU.COMEDORES.REPORTE" })}
      menusubtitle={intl.formatMessage({
        id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}`
      })}
      titleReport={intl.formatMessage({
        id: "CONFIG.MENU.COMEDORES.RP005_RCUG"
      })}
      eventSearch={generarReporte}
      eventRefresh={limpiarReporte}
      eventExport={exportarReporte}
      dataSource={dataSourceFotoCheck}
      additionalProperties={additionalProperties}
      dataGridProperties={dataGridProperties}
    >
      <ConsumoUnidadOrganizativaFilterPage
        intl={intl}
        dataRowEditNew={dataRowEditNew}
        setDataRowEditNew={setDataRowEditNew}
      />
    </DynamicReport>
  );
};

export default injectIntl(WithLoandingPanel(ConsumoUnidadOrganizativaIndePage));
