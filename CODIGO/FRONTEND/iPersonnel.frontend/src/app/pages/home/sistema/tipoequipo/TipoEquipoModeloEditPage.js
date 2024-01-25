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

import { listarEstadoSimple, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";


const TipoEquipoModeloEditPage = props => {
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
                props.agregarTipoEquipoModelo(props.dataRowEditNew);
            } else {
                props.actualizarTipoEquipoModelo(props.dataRowEditNew);
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
        <><PortletHeader
            title={props.titulo}
            toolbar={
                <PortletHeaderToolbar>

                    <Button
                        icon="fa fa-save"
                        type="default"
                        hint={intl.formatMessage({ id: "ACTION.RECORD" })}
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
                        hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
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

                                <Item dataField="IdModelo"
                                    isRequired={modoEdicion}
                                    label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                                    editorOptions={{
                                        maxLength: 10,
                                        inputAttr: { 'style': 'text-transform: uppercase' },
                                        readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                                    }}
                                >
                                    <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                                    <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                                </Item>

                                <Item dataField="Modelo"
                                    isRequired={modoEdicion ? isRequired('Modelo', settingDataField) : false}
                                    label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.MODEL" }) }}
                                    editorOptions={{
                                        maxLength: 100,
                                        inputAttr: { 'style': 'text-transform: uppercase' },
                                        readOnly: !(modoEdicion ? isModified('Modelo', settingDataField) : false)
                                    }}
                                >
                                    {(isRequiredRule("Modelo")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                                    <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                                </Item>

                                <Item dataField="Observacion"
                                    label={{ text: intl.formatMessage({ id: "COMMON.OBSERVATION" }) }}
                                    colSpan={2}
                                    isRequired={modoEdicion ? isRequired('Observacion', settingDataField) : false}
                                    editorOptions={{
                                        maxLength: 500,
                                        inputAttr: { 'style': 'text-transform: uppercase' },
                                        readOnly: !(modoEdicion ? isModified('Observacion', settingDataField) : false)
                                    }}
                                >
                                    {(isRequiredRule("Observacion")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                                    <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
                                </Item>

                                <Item
                                    dataField="Activo"
                                    label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                                    editorType="dxSelectBox"
                                    isRequired={modoEdicion}
                                    editorOptions={{
                                        items: estadoSimple,
                                        valueExpr: "Valor",
                                        displayExpr: "Descripcion",
                                        readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
                                    }}
                                />
                                <Item dataField="IdTipoEquipo" visible={false} />
                                <Item dataField="Foto" visible={false} />
                            </GroupItem>
                        </Form>
                     
                </React.Fragment>
            </PortletBody>
        </>
    );

};

export default injectIntl(TipoEquipoModeloEditPage);