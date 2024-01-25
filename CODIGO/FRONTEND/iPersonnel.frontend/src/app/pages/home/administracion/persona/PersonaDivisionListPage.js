import React from "react";
import { DataGrid, Column, Editing } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";

import Form, { Item, GroupItem } from "devextreme-react/form";

const textEditing = {
    confirmDeleteMessage: "¿Seguro de eliminar división?",
    editRow: "Editar división",
    deleteRow: "Eliminar división",
};

const PersonaDivisionListPage = props => {


    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
        props.eliminarRegistro(evt.data);
    };
    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    }

    return (
        <>
            <PortletHeader
                title="Listado de División"
                toolbar={
                    <PortletHeaderToolbar>
                        <PortletHeaderToolbar>
                            <Button icon="plus" type="default" text="Nuevo" onClick={props.nuevoRegistro} />
                            &nbsp;
                        <Button
                                icon="fa fa-times-circle"
                                type="normal"
                                text="Cancelar"
                                onClick={props.cancelarEdicion}
                            />
                        </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                }
            />
            <PortletBody>
                <React.Fragment>
                    <Form>
                        <GroupItem>
                            <Item>
                                <DataGrid
                                    dataSource={props.personaDivisions}
                                    showBorders={true}
                                    focusedRowEnabled={true}
                                    keyExpr="RowIndex"
                                    onEditingStart={editarRegistro}
                                    onRowRemoving={eliminarRegistro}
                                >
                                    <Editing
                                        mode="row"
                                        useIcons={true}
                                        allowUpdating={true}
                                        allowDeleting={true}
                                        texts={textEditing}
                                    />
                                    <Column dataField="RowIndex" caption="#" width={40} />
                                    <Column dataField="Division" caption="División" />
                                    <Column dataField="FechaInicio" caption="Fecha.Inicio" dataType="date" format="dd/MM/yyyy"  alignment={"center"} />
                                    <Column dataField="FechaFin" caption="Fecha.Fin" dataType="date" format="dd/MM/yyyy"  alignment={"center"} />
                                    <Column dataType="boolean" caption="Activo" calculateCellValue={obtenerCampoActivo} width={100} />

                                </DataGrid>
                            </Item>
                        </GroupItem>
                    </Form>
                </React.Fragment>
            </PortletBody>
        </>
    );
};

export default PersonaDivisionListPage;
