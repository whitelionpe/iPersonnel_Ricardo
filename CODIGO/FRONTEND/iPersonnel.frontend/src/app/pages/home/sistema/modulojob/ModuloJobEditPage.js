import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, {
    Item,
    GroupItem,
    SimpleItem,
    ButtonItem,
    RequiredRule,
    StringLengthRule,
    PatternRule
} from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { listarEstadoSimple, listarEstado, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";


const ModuloJobEditPage = props => {
    const { intl, modoEdicion, settingDataField, accessButton } = props;
    const [estadoSimple, setEstadoSimple] = useState([]);
    const classesEncabezado = useStylesEncabezado();

    async function cargarCombos() {
        let estadoSimple = listarEstadoSimple();

        setEstadoSimple(estadoSimple);

    }

    function grabar(e) {
        let result = e.validationGroup.validate();
        if (result.isValid) {
            if (props.dataRowEditNew.esNuevoRegistro) {
                props.agregarJob(props.dataRowEditNew);
            } else {
                props.actualizarJob(props.dataRowEditNew);
            }
        }
    }

    const isRequiredRule = (id) => {
        return modoEdicion ? false : isRequired(id, settingDataField);
    }

    useEffect(() => {
        cargarCombos();
    }, []);


    return (
        <>
            <PortletHeader
                title={props.titulo}
                toolbar={
                    <PortletHeaderToolbar>

                        <Button
                            icon="fa fa-save"
                            type="default"
                            onClick={grabar}
                            useSubmitBehavior={true}
                            validationGroup="FormEdicion"
                            visible={modoEdicion}
                            disabled={!accessButton.grabar}
                        />
                        &nbsp;
                        <Button
                            icon="fa fa-times-circle"
                            type="normal"
                            onClick={props.cancelarEdicion}
                        />

                    </PortletHeaderToolbar>
                }
            />
            <PortletBody >
                <React.Fragment>
                  
                        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
                            <GroupItem itemType="group" colCount={2} colSpan={2}>
                            <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                    {intl.formatMessage({ id: "COMMON.DETAIL" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

                                <Item dataField="IdJob"
                                    isRequired={modoEdicion}
                                    label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                                    editorOptions={{
                                        maxLength: 20,
                                        inputAttr: { 'style': 'text-transform: uppercase' },
                                        disabled: !props.dataRowEditNew.esNuevoRegistro ? true : false
                                    }}
                                >
                                    <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                                    <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                                </Item>

                                <Item colSpan={1} />
                                <Item dataField="Job"
                                    label={{ text: intl.formatMessage({ id: "SYSTEM.MODULEJOB" }) }}
                                    isRequired={true}
                                    colSpan={2}
                                    editorOptions={{
                                        maxLength: 100,
                                        inputAttr: { 'style': 'text-transform: uppercase' },
                                        readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false

                                    }}
                                />
                                <Item dataField="Comentario"
                                    label={{ text: intl.formatMessage({ id: "SYSTEM.MODULERULE.COMMENTARY" }) }}
                                    isRequired={modoEdicion ? isRequired('Comentario', settingDataField) : false}
                                    editorType="dxTextArea"
                                    colSpan={2}
                                    editorOptions={{
                                        maxLength: 8000,
                                        inputAttr: { 'style': 'text-transform: uppercase' },
                                        readOnly: !(modoEdicion ? isModified('Comentario', settingDataField) : false)
                                    }}
                                />
                                <Item dataField="Nombre_Procedimiento"
                                    label={{ text: intl.formatMessage({ id: "SYSTEM.DIVISIONMODULERULE.PROCEDURE" }) }}
                                    isRequired={modoEdicion ? isRequired('Nombre_Procedimiento', settingDataField) : false}
                                    editorOptions={{
                                        maxLength: 100,
                                        inputAttr: { 'style': 'text-transform: uppercase' },
                                        readOnly: !(modoEdicion ? isModified('Nombre_Procedimiento', settingDataField) : false)
                                    }}
                                />
                                <Item
                                    dataField="Activo"
                                    label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                                    editorType="dxSelectBox"
                                    editorOptions={{
                                        items: estadoSimple,
                                        valueExpr: "Valor",
                                        displayExpr: "Descripcion",
                                        readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
                                    }}
                                />
                                <Item dataField="IdModulo" visible={false} />
                                <Item dataField="IdAplicacion" visible={false} />
                                <Item dataField="IdCliente" visible={false} />
                            </GroupItem>

                        </Form>
                    
                </React.Fragment>
            </PortletBody>
        </>
    );
};

export default injectIntl(ModuloJobEditPage);
