import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { useSelector } from "react-redux";

import { listarEstadoSimple } from "../../../../api/sistema/entidad.api";
import { obtenerTodos as obtenerTodosGrupo } from "../../../../api/administracion/unidadOrganizativa.api";

const PersonaGrupoEditPage = props => {
    const perfil = useSelector(state => state.perfil.perfilActual);

    const [grupos, setGrupos] = useState([]);
    const [estadoSimple, setEstadoSimple] = useState([]);
    const classesEncabezado = useStylesEncabezado();

    async function cargarCombos() {

        if (perfil.IdCliente) {
            let grupos = await obtenerTodosGrupo({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision });
            let estadoSimple = listarEstadoSimple();

            setGrupos(grupos);
            setEstadoSimple(estadoSimple);
        }
    }

    function grabar(e) {

        let result = e.validationGroup.validate();
        if (result.isValid) {
            if (props.dataRowEditNew.esNuevoRegistro) {
                props.agregarGrupo(props.dataRowEditNew);
            } else {
                props.actualizarGrupo(props.dataRowEditNew);
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
                            <Item dataField="IdPersona" visible={false} />
                            <Item dataField="IdSecuencial" visible={false} />
                            <Item
                                dataField="IdGrupo"
                                label={{ text: "Grupo" }}
                                editorType="dxSelectBox"
                                isRequired={true}
                                colSpan={2}
                                editorOptions={{
                                    items: grupos,
                                    valueExpr: "IdGrupo",
                                    displayExpr: "Grupo",
                                    searchEnabled: true,
                                    disabled: !props.dataRowEditNew.esNuevoRegistro ? true : false,
                                }}
                            >
                            </Item>

                            <Item dataField="FechaInicio"
                                label={{ text: "Fecha Inicio" }}
                                isRequired={true}
                                editorType="dxDateBox"
                                dataType="date"
                                editorOptions={{
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                    displayFormat: "dd/MM/yyyy"
                                }}
                            />

                            <Item dataField="FechaFin"
                                label={{ text: "Fecha Fin" }}
                                isRequired={true}
                                editorType="dxDateBox"
                                dataType="date"
                                editorOptions={{
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                    displayFormat: "dd/MM/yyyy"
                                }}
                            />
                            <Item
                                dataField="Activo"
                                label={{ text: "Activo" }}
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
                    </Form>

                </React.Fragment>
            </PortletBody>
        </>
    );
};

export default PersonaGrupoEditPage;
