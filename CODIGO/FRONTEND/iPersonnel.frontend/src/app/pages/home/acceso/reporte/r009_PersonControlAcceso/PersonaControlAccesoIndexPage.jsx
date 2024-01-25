import React, { useState } from "react";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { handleErrorMessages } from "../../../../../store/ducks/notify-messages";
import { isNotEmpty } from "../../../../../../_metronic";
import { serviceReporte } from "../../../../../api/acceso/reporte.api";
import { DynamicReport } from "../../../../../partials/components/DynamicReport";
import PersonaControlAccesoFilterPage from "./PersonaControlAccesoFilterPage";

const PersonaControlAccesoIndexPage = props => {
  const { intl, setLoading, dataMenu } = props;

  const [dataSourceFotoCheck, setDataSourceFotoCheck] = useState({
    columns: [],
    labels: [],
    data: []
  });

  const initialFilters = {
    Companias: "",
    UnidadesOrganizativa: "",
    DocumentosPersona: "",
    IdTipoEquipo: "",
    Acceso: "",
    NumeroSerie: "",
    IdCaracteristica: "",
    IdCaracteristicaDetalle: "",
    CodigoReferencia: "CodigoReferencia1"
  };
  const [dataRowEditNew, setDataRowEditNew] = useState(initialFilters);

  const getParameters = () => {
    let {
      Companias,
      UnidadesOrganizativa,
      DocumentosPersona,
      IdTipoEquipo,
      Acceso,
      NumeroSerie,
      IdCaracteristica,
      IdCaracteristicaDetalle,
      CodigoReferencia
    } = dataRowEditNew;

    let parametros = {
      Companias: isNotEmpty(Companias) ? Companias : "",
      UnidadesOrganizativa: isNotEmpty(UnidadesOrganizativa)
        ? UnidadesOrganizativa
        : "",
      DocumentosPersona: isNotEmpty(DocumentosPersona) ? DocumentosPersona : "",
      IdTipoEquipo: isNotEmpty(IdTipoEquipo) ? IdTipoEquipo : "",
      Acceso: isNotEmpty(Acceso) ? Acceso : "",
      NumeroSerie: isNotEmpty(NumeroSerie) ? NumeroSerie : "",
      IdCaracteristica: isNotEmpty(IdCaracteristica) ? IdCaracteristica : "",
      IdCaracteristicaDetalle: isNotEmpty(IdCaracteristicaDetalle)
        ? IdCaracteristicaDetalle
        : "",
      CodigoReferencia
    };
    return parametros;
  };

  const generarReporte = async e => {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      setLoading(true);
      let parametros = getParameters();
      let data = await serviceReporte
        .ListarAccesoReporte009ListarPersonaXControlAccesoEquipo(parametros)
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
        });

      // console.log("data", data);
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
    // console.log("ejecutar exportar reporte");
    let parametros = getParameters();
    return {
      parameters: parametros,
      event:
        serviceReporte.ExportarAccesoReporte009ListarPersonaXControlAccesoEquipo
    };
  };

  const additionalProperties = [
    {
      dataField: "Huella",
      properties: {
        calculateCellValue: rowData => {
          return rowData.Huella === "S";
        },
        alignment: "center"
      }
    },
    {
      dataField: "Acceso",
      properties: {
        calculateCellValue: rowData => {
          return rowData.Acceso === "S";
        },
        alignment: "center"
      }
    },
    {
      dataField: "EstadoPersona",
      properties: { alignment: "center" }
    }
  ];

  const dataGridProperties = {
    onCellPrepared: e => {
      if (e.rowType === "data") {
        if (e.data.EstadoPersona.toUpperCase() === "INACTIVO") {
          e.cellElement.style.color = "red";
        }
      }
    }
  };
  return (
    <DynamicReport
      id={"rptcontrolaccesoxequipo"}
      menutitle={intl.formatMessage({ id: "ACCESS.MAIN" })}
      submenuTitle={intl.formatMessage({ id: "ACCESS.REPORT.SUBMENU" })}
      menusubtitle={intl.formatMessage({
        id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}`
      })}
      titleReport={intl.formatMessage({
        id: "CONFIG.MENU.ACCESO.REPORT.RPT009"
      })}
      eventSearch={generarReporte}
      eventRefresh={limpiarReporte}
      eventExport={exportarReporte}
      dataSource={dataSourceFotoCheck}
      additionalProperties={additionalProperties}
      dataGridProperties={dataGridProperties}
    >
      <PersonaControlAccesoFilterPage
        dataRowEditNew={dataRowEditNew}
        setDataRowEditNew={setDataRowEditNew}
      />
    </DynamicReport>
  );
};

export default injectIntl(WithLoandingPanel(PersonaControlAccesoIndexPage));
