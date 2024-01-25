import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";
import {
    ExportarAsistenciaReporte016ListarHHEERITINSA,
    ListarAsistenciaReporte016ListarHHEERITINSA
} from "../../../../../api/asistencia/reporte.api";
import { DynamicReport } from "../../../../../partials/components/DynamicReport";
import { dateFormat, isNotEmpty } from "../../../../../../_metronic";
import { handleErrorMessages } from "../../../../../store/ducks/notify-messages";
import HorasExtrasRitinsaFilterPage from "./HorasExtrasRitinsaFilterPage";
import { useSelector } from "react-redux";
import { serviceCompania } from "../../../../../api/administracion/compania.api";
import { Portlet, PortletBody } from "../../../../../partials/content/Portlet";
import { useStylesEncabezado } from "../../../../../store/config/Styles";

const HorasExtrasRitinsaIndexPage = props => {

    const { intl, setLoading, dataMenu } = props;

    const perfil = useSelector(state => state.perfil.perfilActual);

    const [companiaData, setCompaniaData] = useState([]);

    const [dataSourceGrupos, setDataSourceGrupos] = useState({
        columns: [],
        labels: [],
        data: []
    });

    const classesEncabezado = useStylesEncabezado();

    const initialFilters = {

        IdCompania: "",
        IdUnidadOrganizativa: "",
        IdCentroCosto: "",
        IdPlanilla: "",

        Personas: "",
        Activo: "",
        IdPosicion: "",
        CodigoPlanilla: "",

        IdGrupo: "",
        IdDivision: ""
    };
    const [dataRowEditNew, setDataRowEditNew] = useState({ ...initialFilters, IdDivision: perfil.IdDivision,
        FechaInicio: (new Date()),
        FechaFin: (new Date()),
     });

    async function listarCompanias() {
        console.log("INDEX:>listarCompanias()");
        let data = await serviceCompania.obtenerTodosConfiguracion({
            IdCliente: perfil.IdCliente,
            IdModulo: dataMenu.info.IdModulo,
            IdAplicacion: dataMenu.info.IdAplicacion,
            IdConfiguracion: "ID_COMPANIA"
        }
        ).catch(err => { handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err) });
        setCompaniaData(data);
    }

    const getParameters = () => {
        console.log("*****dataRowEditNew :> ", dataRowEditNew);
        let {
            IdCompania,
            IdUnidadOrganizativa,
            IdCentroCosto,
            IdPlanilla,
            Personas,
            Activo,
            IdPosicion,
            CodigoPlanilla,
            IdGrupo,
            IdDivision,
            FechaInicio,
            FechaFin
        } = dataRowEditNew;

        let parametros = {
            IdCompania: isNotEmpty(IdCompania) ? IdCompania : "",
            IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa : "",
            IdCentroCosto: isNotEmpty(IdCentroCosto) ? IdCentroCosto : "",
            IdPlanilla: isNotEmpty(IdPlanilla) ? IdPlanilla : "",
            Personas: isNotEmpty(Personas) ? Personas : "",
            Activo: isNotEmpty(Activo) ? Activo : "",
            IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion : "",
            CodigoPlanilla: isNotEmpty(CodigoPlanilla) ? CodigoPlanilla : "",
            IdGrupo: isNotEmpty(IdGrupo) ? IdGrupo : "",
            IdDivision: isNotEmpty(IdDivision) ? IdDivision : "",
            FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, "yyyyMMdd") : "",
            FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, "yyyyMMdd") : "",

        };
        return parametros;
    };

    const generarReporte = async e => {
        let result = e.validationGroup.validate();
        if (result.isValid) {
            setLoading(true);
            let parametros = getParameters();
            let data = await ListarAsistenciaReporte016ListarHHEERITINSA(parametros)
                .catch(err => {
                    handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
                });

            console.log("/*:>data", data);
            if (!!data && data.length > 0) {
                let [labels, fields, datasource] = data;
                setDataSourceGrupos({
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
        console.log("***limpiarReporte:>", companiaData);
        const { IdCompania } = companiaData[0];
        setDataRowEditNew({ ...initialFilters, IdDivision: perfil.IdDivision, IdCompania: IdCompania , 
            FechaInicio: (new Date()), FechaFin: (new Date()),
        });
        setDataSourceGrupos(prev => ({ ...prev, data: [] }));
        setLoading(false);
    };

    const exportarReporte = async () => {
        console.log("ejecutar exportar reporte");
        let parametros = getParameters();
        return {
            parameters: parametros,
            event: ExportarAsistenciaReporte016ListarHHEERITINSA
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
                //LSF
                // if (e.data.Estado.toUpperCase() === "INACTIVO") {
                //     e.cellElement.style.color = "red";
                // }
            }
        }
    };


    useEffect(() => {
        listarCompanias();

    }, []);

    return (
        <>
            <DynamicReport
                id={"rptasistenciapersonaxgrupo"}
                menutitle={intl.formatMessage({ id: "ACCESS.MAIN" })}
                submenuTitle={intl.formatMessage({ id: "ACCESS.REPORT.SUBMENU" })}
                menusubtitle={intl.formatMessage({
                    id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}`
                })}
                titleReport={intl.formatMessage({
                    id: "CONFIG.MENU.ASISTENCIA.GRUPO"
                })}
                eventSearch={generarReporte}
                eventRefresh={limpiarReporte}
                eventExport={exportarReporte}
                dataSource={dataSourceGrupos}
                additionalProperties={additionalProperties}
                dataGridProperties={dataGridProperties}
            >
                <HorasExtrasRitinsaFilterPage
                    dataRowEditNew={dataRowEditNew}
                    setDataRowEditNew={setDataRowEditNew}
                    dataMenu={dataMenu}
                />
            </DynamicReport>
        </>
    );

};

export default injectIntl(WithLoandingPanel(HorasExtrasRitinsaIndexPage));
