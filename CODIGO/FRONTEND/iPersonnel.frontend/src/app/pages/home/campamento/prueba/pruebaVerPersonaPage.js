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
import AdministracionPersonaBuscar from "../../../../partials/components/AdministracionPersonaBuscar";

import FrameReport from '../../../../partials/components/iframeReport/iFrameReport';

const PruebaVerPersonaPage = (props) => {
    const perfil = useSelector(state => state.perfil.perfilActual);
    const [parametros, setParametros] = useState({ IdCliente: 0, IdPersona: 0 });
    const [VerFrame, SetVerFrame] = useState(false);
    const { intl, accessButton } = props;
    const [isVisiblePopUpPersonas, setisVisiblePopUpPersonas] = useState(false);

    const cargarReporte = (e) => {

        let result = e.validationGroup.validate();
        if (!result.isValid) {
            return;
        }

        console.log('inicia carga de frame');
        let { IdPersona } = props.dataRowEditNew;
        setParametros({
            IdPersona
        });
        SetVerFrame(true);
    }

    const agregarPersonaCamaExclusiva = (personas) => {
        for (let i = 0; i < personas.length; i++) {
            let {
                IdPersona,
                NombreCompleto,
            } = personas[i];

            props.setDataRowEditNew({ ...props.dataRowEditNew, IdPersona, NombreCompleto });
            break;

        }
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
                        <Item dataField="IdPersona"
                            label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                            isRequired={true}
                            editorOptions={{
                                readOnly: true,
                                maxLength: 20,
                                inputAttr: { 'style': 'text-transform: uppercase' },
                                //disabled: !props.dataRowEditNew.esNuevoRegistro ? true : false,
                                showClearButton: true,
                                buttons: [
                                    {
                                        name: "search",
                                        location: "after",
                                        useSubmitBehavior: true,
                                        options: {
                                            stylingMode: "text",
                                            icon: "search",
                                            disabled: false,
                                            onClick: () => {
                                                setisVisiblePopUpPersonas(true);
                                            },
                                        },
                                    },
                                ],
                            }}
                        />

                    </GroupItem>
                </Form>

                <FrameReport
                    ReportName={'rptMarcas'}
                    ReportDescription={'Reporte Marcas'}
                    PathReporte={'Pruebas/Reportes'}
                    Parametros={parametros}
                    Width={100}
                    Height={600}
                    VerFrame={VerFrame}
                    SetVerFrame={SetVerFrame}
                />


                {/* POPUP-> buscar persona */}
                <AdministracionPersonaBuscar
                    showPopup={{ isVisiblePopUp: isVisiblePopUpPersonas, setisVisiblePopUp: setisVisiblePopUpPersonas }}
                    cancelar={() => setisVisiblePopUpPersonas(false)}
                    agregar={agregarPersonaCamaExclusiva}
                    selectionMode={"row"}
                    uniqueId={"personasBuscarCAAAAAAIndexPage"}
                />

            </PortletBody>
        </>
    );
};

export default injectIntl(PruebaVerPersonaPage);