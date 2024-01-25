import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { DataGrid, Column, Editing, Lookup, Export } from "devextreme-react/data-grid";

import { obtenerTodos as obtenerTodosCliente } from "../../../../api/sistema/cliente.api";
import {
    listarPorCliente as listarDivisionPorCliente,
    obtenerTodos as obtenerTodosDivisiones
} from "../../../../api/sistema/division.api";
import { listarCrud } from "../../../../api/sistema/divisionModuloRegla.api";

import { listarEstadoSimple } from "../../../../api/sistema/entidad.api";

const textEditing = {
    saveAllChanges: "Guardar Cambios",
    cancelAllChanges: "Cancelar Cambios",
    export: "Exportar Excel"
};

const DivisionModuloReglaEditPage = props => {
    const [clientes, setClientes] = useState([]);
    const [divisiones, setDivisiones] = useState([]);
    const [moduloReglas, setModuloReglas] = useState([]);
    const [estadoSimples, setEstadoSimples] = useState([]);

    const [idCliente, setIdCliente] = useState("");
    const classesEncabezado = useStylesEncabezado();

    async function cargarCombos() {
        let clientes = await obtenerTodosCliente();
        let divisiones = await obtenerTodosDivisiones();
        let estadoSimples = listarEstadoSimple();

        setClientes(clientes);
        setDivisiones(divisiones);
        setEstadoSimples(estadoSimples);
    }

    //--->Filtrar divisiones por  cliente.
    async function onValueChangedCliente(idCliente) {
        try {
            if (idCliente) {
                let divisiones = await listarDivisionPorCliente({ IdCliente: idCliente });
                setDivisiones(divisiones);
                setIdCliente(idCliente);
                setModuloReglas([]);
            }
        } catch (err) {
            console.log(err);
        }
    }
    async function listarModuloReglas(idDivision) {

        if (idCliente && idDivision) {
            let moduloReglas = await listarCrud(idCliente, idDivision, 0, 0);
            setModuloReglas(moduloReglas.data);
        }
    }


    const onRowUpdatingRegla = e => {
        const { IdCliente, IdDivision, IdRegla, IdModulo, Activo, Accion } = e.oldData;
        const { Nombre_Procedimiento } = e.newData;
        const reglaModulo = ({ IdCliente: IdCliente, IdDivision: IdDivision, IdRegla: IdRegla, IdModulo: IdModulo, Nombre_Procedimiento: Nombre_Procedimiento, Activo: Activo });
        if (Accion === 'Nuevo') {
            props.agregarReglaModulo(reglaModulo);
        } else {
            props.actualizarReglaModulo(reglaModulo);
        }

    }
    const onEditorPreparing = (e) => {
        if (e.dataField === "RowIndex" && e.parentType === "dataRow") {
            e.editorOptions.disabled = true;
        }
        if (e.dataField === "Modulo" && e.parentType === "dataRow") {
            e.editorOptions.disabled = true;
        }
        if (e.dataField === "Regla" && e.parentType === "dataRow") {
            e.editorOptions.disabled = true;
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
                                        Agregar regla módulo
                                    </Typography>
                                </Toolbar>
                            </AppBar>
                        </Item>
                        <Item
                            dataField="IdCliente"
                            label={{ text: "Cliente" }}
                            editorType="dxSelectBox"
                            isRequired={true}
                            editorOptions={{
                                items: clientes,
                                valueExpr: "IdCliente",
                                displayExpr: "Cliente",
                                onValueChanged: (e => onValueChangedCliente(e.value)),
                                searchEnabled: true,
                                disabled: !props.dataRowEditNew.esNuevoRegistro
                                    ? true
                                    : false
                            }}
                        />
                        <Item
                            dataField="IdDivision"
                            label={{ text: "División" }}
                            editorType="dxSelectBox"
                            isRequired={true}
                            editorOptions={{
                                items: divisiones,
                                valueExpr: "IdDivision",
                                displayExpr: "Division",
                                onValueChanged: (e => listarModuloReglas(e.value)),
                                searchEnabled: true,
                                disabled: !props.dataRowEditNew.esNuevoRegistro
                                    ? true
                                    : false
                            }}
                        />

                    </GroupItem>

                    <GroupItem itemType="group" colCount={2} colSpan={2}>
                        <Item colSpan={2}>
                            <AppBar position="static" className={classesEncabezado.secundario}>
                                <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                        Agregar regla
                                    </Typography>
                                </Toolbar>
                            </AppBar>
                        </Item>
                        <Item colSpan={2} >
                            <DataGrid
                                colSpan={2}
                                dataSource={moduloReglas.length===0 ? props.dataRowEditNew.listarCrud : moduloReglas}
                                showBorders={true}
                                focusedRowEnabled={true}
                                keyExpr="RowIndex"
                                onRowUpdating={onRowUpdatingRegla}
                                onEditorPreparing={onEditorPreparing}

                            >
                                <Export enabled={true} fileName="ModuloReglas" allowExportSelectedData={true} />
                                <Editing
                                    mode="batch"
                                    useIcons={true}
                                    allowUpdating={true}
                                    texts={textEditing}

                                />
                                <Column dataField="RowIndex" caption="#" width={40} />
                                <Column dataField="Modulo" caption="Módulo" />
                                <Column dataField="Regla" caption="Regla" />
                                <Column dataField="Nombre_Procedimiento" caption="Procedimiento" />
                                <Column dataField="Activo" caption="Estado" width={80} >
                                    <Lookup dataSource={estadoSimples} valueExpr="Valor" displayExpr="Descripcion" />
                                </Column>
                            </DataGrid>
                        </Item>
                    </GroupItem>

                </Form>
            </PortletBody>
        </>
    );
};

export default DivisionModuloReglaEditPage;
