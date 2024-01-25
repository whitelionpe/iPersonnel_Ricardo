import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";//Multi-idioma
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { obtenerTodos as obtenerModulos } from "../../../../api/sistema/modulo.api";
import {
    listarEstadoSimple,
   
  } from "../../../../../_metronic";
  import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";

const ModuloAplicacionEditPage = props => {

    const { intl, modoEdicion, settingDataField, accessButton } = props;

    const [modulos, setModulos] = useState([]);
    const [estadoSimple, setEstadoSimple] = useState([]);
    const classesEncabezado = useStylesEncabezado();

    async function cargarCombos() {
        let estadoSimple = listarEstadoSimple();
        let modulos = await obtenerModulos();
        setModulos(modulos);
        setEstadoSimple(estadoSimple);
    }

    function grabar(e) {
        let result = e.validationGroup.validate();
        if (result.isValid) {
            if (props.dataRowEditNew.esNuevoRegistro) {
                props.agregarModuloAplicacion(props.dataRowEditNew);
            } else {
                props.actualizarModuloAplicacion(props.dataRowEditNew);
            }
        }
    }

    useEffect(() => {
        cargarCombos();
    }, []);


    return (
        <>
            <PortletHeader
                title={props.tituloApp}
                toolbar={
                    <PortletHeaderToolbar>

                        <Button
                            icon="fa fa-save"
                            type="default"
                            hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                            onClick={grabar}
                            useSubmitBehavior={true}
                            validationGroup="FormEdicion"
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

                            <Item dataField="IdModulo" visible={false} />
                            <Item
                                dataField="IdModulo"
                                label={{ text: intl.formatMessage({ id: "SYSTEM.MODULEAPLICATION.MODULE" }) }}
                                editorType="dxSelectBox"
                                isRequired={ modoEdicion  ? isRequired("IdModulo", settingDataField): false}
                                editorOptions={{
                                    items: modulos,
                                    valueExpr: "IdModulo",
                                    displayExpr: "Modulo",
                                    readOnly: !props.dataRowEditNew.esNuevoRegistro
                                }}
                            />

                            <Item
                                dataField="Activo"
                                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                                editorType="dxSelectBox"
                                isRequired={ modoEdicion  ? isRequired("Activo", settingDataField): false}
                                editorOptions={{
                                    items: estadoSimple,
                                    valueExpr: "Valor",
                                    displayExpr: "Descripcion",
                                    disabled: props.dataRowEditNew.esNuevoRegistro ? true : false,
                                    readOnly: !(modoEdicion ? isModified("Activo", settingDataField) : false),
                                }}
                            />
                        </GroupItem>
                    </Form>
                </React.Fragment>
            </PortletBody>
        </>
    );
};

export default injectIntl(ModuloAplicacionEditPage);
