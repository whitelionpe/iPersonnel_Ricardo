import React, { useEffect, useState } from "react";
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import { isNotEmpty } from "../../../../../_metronic";


import Form, {
    Item,
    GroupItem,
    RequiredRule,
    StringLengthRule,
    PatternRule
} from "devextreme-react/form";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { useSelector } from "react-redux";

import FrameReport from '../../../../partials/components/iframeReport/iFrameReport';

const PruebaVerPage = (props) => {
    const perfil = useSelector(state => state.perfil.perfilActual);
    const [parametros, setParametros] = useState({ IdCliente: 0, IdPersona: 0 });
    const [VerFrame, SetVerFrame] = useState(false);
    const { intl, accessButton } = props;

    const cargarReporte = (e) => {

        let result = e.validationGroup.validate();
        if (!result.isValid) {
            return;
        }

        console.log('inicia carga de frame');
        let { IdComedor, FechaInicio, FechaFin } = props.dataRowEditNew;
        setParametros({
            IdCliente: perfil.IdCliente,
            IdComedor,
            FechaInicio: new Date(FechaInicio).toLocaleString(),
            FechaFin: new Date(FechaFin).toLocaleString(),
        });
        SetVerFrame(true);
    }
  
    return (

        <>
            <PortletHeader
                title={intl.formatMessage({ id: "ACTION.LIST" })}
                toolbar={
                    <PortletHeaderToolbar>
                        <PortletHeaderToolbar>
                            <Button
                                icon="search"
                                type="default"
                                hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                onClick={cargarReporte}
                                validationGroup="FormEdicion"
                            />
                        </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                }
            />
            <PortletBody>
                <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
                    <GroupItem itemType="group" colCount={2} colSpan={2}>
                        <Item dataField="IdComedor"
                            label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                            isRequired={true}
                            editorOptions={{
                                maxLength: 100,
                                inputAttr: { 'style': 'text-transform: uppercase' },
                            }}
                        />


                        <Item
                            dataField="FechaInicio"
                            label={{
                                text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" }),
                            }}
                            isRequired={true}
                            editorType="dxDateBox"
                            dataType="datetime"
                            editorOptions={{
                                inputAttr: { style: "text-transform: uppercase" },
                                displayFormat: "dd/MM/yyyy",
                            }}
                        />

                        <Item
                            dataField="FechaFin"
                            label={{
                                text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" }),
                            }}
                            isRequired={true}
                            editorType="dxDateBox"
                            dataType="datetime"
                            editorOptions={{
                                inputAttr: { style: "text-transform: uppercase" },
                                displayFormat: "dd/MM/yyyy",
                            }}
                        />

                    </GroupItem>
                </Form>

                <FrameReport
                    ReportName={'ReporteConsolidadoComedores'}
                    ReportDescription={'Reporte Comedores'}
                    PathReporte={'Comedores/Reports'}
                    Parametros={parametros}
                    Width={100}
                    Height={600}
                    VerFrame={VerFrame}
                    SetVerFrame={SetVerFrame}
                />

            </PortletBody>
        </>
    );
};

export default injectIntl(PruebaVerPage);