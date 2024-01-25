import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { listarEstadoSimple } from "../../../../api/sistema/entidad.api";
import { obtenerTodos } from "../../../../api/acceso/grupo.api";


const GrupoPuertaEditPage = props => {
    const [estadoSimple, setEstadoSimple] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const classesEncabezado = useStylesEncabezado();


    async function cargarCombos() {
        let estadoSimple = listarEstadoSimple();
        let grupos = await obtenerTodos({ IdCliente: props.dataRowEditNew.IdCliente, IdDivision: props.dataRowEditNew.IdDivision })
        setEstadoSimple(estadoSimple);
        setGrupos(grupos)
    }


    function grabar(e) {
        let result = e.validationGroup.validate();
        if (result.isValid) {
            if (props.dataRowEditNew.esNuevoRegistro) {
                props.agregarGrupoPuerta(props.dataRowEditNew);
            } else {
                props.actualizarGrupoPuerta(props.dataRowEditNew);
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


                                <Item dataField="IdPuerta"
                                    visible={false}
                                    label={{ text: "Código" }}
                                    isRequired={true}
                                    editorOptions={{
                                        maxLength: 10,
                                        inputAttr: { 'style': 'text-transform: uppercase' }
                                    }}
                                />

                                <Item dataField="IdGrupo"
                                    isRequired={true}
                                    label={{ text: "Grupo" }}
                                    editorType="dxSelectBox"
                                    editorOptions={{
                                        items: grupos,
                                        valueExpr: "IdGrupo",
                                        displayExpr: "Grupo",
                                    }}
                                />
                                <Item
                                    dataField="Activo"
                                    label={{ text: "Estado" }}
                                    editorType="dxSelectBox"
                                    isRequired={true}
                                    editorOptions={{
                                        items: estadoSimple,
                                        valueExpr: "Valor",
                                        displayExpr: "Descripcion",
                                        disabled: props.dataRowEditNew.esNuevoRegistro
                                    }}
                                />
                                <Item dataField="IdZona" visible={false} />
                                <Item dataField="IdCliente" visible={false} />
                                <Item dataField="IdDivision" visible={false} />

                            </GroupItem>
                        </Form>
                   
                </React.Fragment>
            </PortletBody>
        </>
    );

};

export default GrupoPuertaEditPage;
