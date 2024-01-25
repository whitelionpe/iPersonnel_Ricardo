import React from "react";
import { DataGrid, Column, Editing } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";

import Form, { Item, GroupItem } from "devextreme-react/form";

const textEditing = {
    confirmDeleteMessage: "¿Seguro de eliminar compañia?",
    editRow: "Editar compañia",
    deleteRow: "Eliminar compañia",
};

const PersonaCompaniaListPage = props => {


    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
        evt.cancel = true;
        props.eliminarRegistro(evt.data);
    };
    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    }

    return (
        <>
            <PortletHeader
                title="Listado de Compañias"
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
                                    dataSource={props.personaCompanias}
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
                                    <Column dataField="Compania" caption="Compañia" width={"50%"} />
                                    <Column dataField="FechaInicio" caption="Fecha.Inicio" dataType="date" format="dd/MM/yyyy"  alignment={"center"} width={"20%"} />
                                    <Column dataField="FechaFin" caption="Fecha.Fin" dataType="date" format="dd/MM/yyyy"  alignment={"center"} width={"20%"} />
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

export default PersonaCompaniaListPage;
