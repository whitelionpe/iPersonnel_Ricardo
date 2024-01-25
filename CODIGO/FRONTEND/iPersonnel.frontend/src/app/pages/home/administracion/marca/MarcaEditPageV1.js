import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl"; 
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { listarEstadoSimple } from "../../../../api/sistema/entidad.api";

const MarcaEditPage = props => {
    const { intl } = props;

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
                props.agregarMarca(props.dataRowEditNew);
            } else {
                props.actualizarMarca(props.dataRowEditNew);
            }
        }
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
                                        {intl.formatMessage({ id: "ADMINISTRATION.BRAND.ADD" })}
                                    </Typography>
                                    </Toolbar>
                                </AppBar>
                            </Item>


                            <Item dataField="IdMarca"
                                isRequired={true}
                                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                                editorOptions={{
                                    maxLength: 10,
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                    disabled: !props.dataRowEditNew.esNuevoRegistro ? true : false
                                }}
                            />
                            <Item dataField="Marca"
                                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.BRAND.BRAND" }) }}
                                isRequired={true}
                                editorOptions={{
                                    maxLength: 50,
                                    inputAttr: { 'style': 'text-transform: uppercase' },

                                }}
                            />
                            <Item
                                dataField="Activo"
                                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                                editorType="dxSelectBox"
                                isRequired={true}
                                editorOptions={{
                                    items: estadoSimple,
                                    valueExpr: "Valor",
                                    displayExpr: "Descripcion",
                                    disabled: props.dataRowEditNew.esNuevoRegistro ? true : false
                                }}
                            />
                        </GroupItem>
                        <GroupItem itemType="group" colCount={2} colSpan={2}>
                        <Item colSpan={2}>
                            <AppBar position="static" className={classesEncabezado.secundario}>
                                <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "ADMINISTRATION.BRAND.ADDMODEL" })}
                                    </Typography>
                                </Toolbar>
                            </AppBar>
                        </Item>
                       
                        </GroupItem>
                    </Form>

                </React.Fragment>
            </PortletBody >
        </>
    );
};

export default injectIntl (MarcaEditPage);
