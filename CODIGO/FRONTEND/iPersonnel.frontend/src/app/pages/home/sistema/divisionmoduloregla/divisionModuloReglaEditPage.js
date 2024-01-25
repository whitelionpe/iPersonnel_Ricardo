import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { listarEstadoSimple } from "../../../../../_metronic";


const DivisionModuloReglaEditPage = props => {
    const { intl } = props;
    const [estadoSimples, setEstadoSimples] = useState([]);
    const classesEncabezado = useStylesEncabezado();


    async function cargarCombos() {
        let estadoSimples = listarEstadoSimple();
        setEstadoSimples(estadoSimples);
    }

    function grabar(e) {
        let result = e.validationGroup.validate();
        if (result.isValid) {
            if (props.dataRowEditNew.esNuevoRegistro) {
                props.agregarReglaModulo(props.dataRowEditNew);
            } else {
                props.actualizarReglaModulo(props.dataRowEditNew);
            }
        }
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
                            text="Grabar"
                            onClick={grabar}
                            useSubmitBehavior={true}
                            validationGroup="FormEdicion"
                        />
                        &nbsp;
                        <Button
                            icon="fa fa-times-circle"
                            type="normal"
                            text="Cancelar"
                            onClick={props.cancelarEdicion}
                        />

                    </PortletHeaderToolbar>
                }
            />
            <PortletBody >
             
                    <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
                        <GroupItem itemType="group" colCount={2} colSpan={2}>
                        <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                    {intl.formatMessage({ id: "SYSTEM.DIVISIONMODULERULE.ADD" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>
                            <Item dataField="IdModulo" visible={false} ></Item>
                            <Item dataField="IdRegla" visible={false} ></Item>
                            <Item dataField="IdSecuencial" visible={false} ></Item>

                            <Item
                                dataField="Nombre_Procedimiento"
                                isRequired={true}
                                label={{ text: intl.formatMessage({ id: "SYSTEM.DIVISIONMODULERULE.PROCEDURE" }) }}
                                colSpan={2}
                                editorOptions={{
                                    maxLength: 100,
                                    inputAttr: { style: "text-transform: uppercase" }
                                }}
                            />
                            <Item
                                dataField="Activo"
                                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                                editorType="dxSelectBox"
                                isRequired={true}
                                editorOptions={{
                                    items: estadoSimples,
                                    valueExpr: "Valor",
                                    displayExpr: "Descripcion",
                                    disabled: true
                                }}
                            />
                        </GroupItem>
                    </Form>
              
            </PortletBody>
        </>
    );
};

export default injectIntl(DivisionModuloReglaEditPage);
