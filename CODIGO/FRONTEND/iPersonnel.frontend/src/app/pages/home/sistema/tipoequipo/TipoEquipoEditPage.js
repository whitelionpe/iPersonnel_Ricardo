import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl"
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
import { obtenerTodos } from "../../../../api/sistema/tipoequipo.api";

import { listarEstadoSimple, listarEstado, PatterRuler, isNotEmpty } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";


const TipoEquipoEditPage = props => {
    const { intl, modoEdicion, settingDataField, accessButton } = props;
    const [tipoEquipos, setTipoEquipos] = useState([]);
    const [estadoSimple, setEstadoSimple] = useState([]);
    const [estados, setEstado] = useState([]);
    const classesEncabezado = useStylesEncabezado();

    async function cargarCombos() {
        let estadoSimple = listarEstadoSimple();
        let estados = listarEstado();
        let tipoEquipos = [];
        if (isNotEmpty(props.idTipoEquipo)) {
            tipoEquipos = await obtenerTodos({ IdTipoEquipo: props.idTipoEquipo, IdTipoEquipoHijo: '%' })
        }
        setEstadoSimple(estadoSimple);
        setEstado(estados)
        setTipoEquipos(tipoEquipos);
    }

    function grabar(e) {
        let result = e.validationGroup.validate();
        if (result.isValid) {
            if (props.dataRowEditNew.esNuevoRegistro) {
                props.agregarTipoEquipo(props.dataRowEditNew);
            } else {
                props.actualizarTipoEquipo(props.dataRowEditNew);
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

                                <Item dataField="IdTipoEquipoHijo"
                                    colSpan={2}
                                    visible={props.dataRowEditNew.asignarHijo ? true : false}
                                    editorType="dxSelectBox"
                                    label={{ text: intl.formatMessage({ id: "SYSTEM.TYPE.DEVICE.COMPONENTS" }) }}
                                    isRequired={modoEdicion}
                                    editorOptions={{
                                        readOnly: !props.modoEdicion,
                                        items: tipoEquipos,
                                        valueExpr: "IdTipoEquipo",
                                        displayExpr: "TipoEquipo",
                                        searchEnabled: true,
                                    }}

                                />
                                <Item dataField="IdTipoEquipo"
                                    isRequired={modoEdicion ? isRequired('IdTipoEquipo', settingDataField) : false}
                                    visible={!props.dataRowEditNew.asignarHijo ? true : false}
                                    label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                                    editorOptions={{
                                        maxLength: 10,
                                        inputAttr: { 'style': 'text-transform: uppercase' },
                                        readOnly: !(modoEdicion ? isModified('IdTipoEquipo', settingDataField) : false),

                                    }}
                                >
                                    <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                                    <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                                </Item>

                                <Item
                                    dataField="EquipoFijo"
                                    label={{ text: intl.formatMessage({ id: "SYSTEM.TYPE.DEVICE.PERMANENT" }) }}
                                    editorType="dxSelectBox"
                                    isRequired={modoEdicion ? isRequired('EquipoFijo', settingDataField) : false}
                                    visible={!props.dataRowEditNew.asignarHijo ? true : false}
                                    editorOptions={{
                                        items: estados,
                                        valueExpr: "Valor",
                                        displayExpr: "Descripcion",
                                        readOnly: !(modoEdicion ? isModified('EquipoFijo', settingDataField) : false)
                                    }}
                                />

                                <Item dataField="TipoEquipo"
                                    label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.TEAMTYPE" }) }}
                                    isRequired={modoEdicion ? isRequired('TipoEquipo', settingDataField) : false}
                                    visible={!props.dataRowEditNew.asignarHijo ? true : false}
                                    colSpan={2}
                                    editorOptions={{
                                        maxLength: 100,
                                        inputAttr: { 'style': 'text-transform: uppercase' },
                                        readOnly: !(modoEdicion ? isModified('TipoEquipo', settingDataField) : false)
                                    }}
                                >
                                    {(isRequiredRule("TipoEquipo")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                                    <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
                                </Item>

                                <Item dataField="Observacion"
                                    label={{ text: intl.formatMessage({ id: "COMMON.OBSERVATION" }) }}
                                    isRequired={modoEdicion ? isRequired('Observacion', settingDataField) : false}
                                    colSpan={2}
                                    visible={!props.dataRowEditNew.asignarHijo ? true : false}
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
                                    visible={!props.dataRowEditNew.asignarHijo ? true : false}
                                    editorOptions={{
                                        items: estadoSimple,
                                        valueExpr: "Valor",
                                        displayExpr: "Descripcion",
                                        readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
                                    }}
                                />
                            </GroupItem>
                        </Form>
                    
                </React.Fragment>
            </PortletBody>
        </>
    );

};

export default injectIntl(TipoEquipoEditPage);
