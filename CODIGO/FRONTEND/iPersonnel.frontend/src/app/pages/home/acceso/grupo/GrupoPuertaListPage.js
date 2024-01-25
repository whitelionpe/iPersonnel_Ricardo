import React from "react";
import { DataGrid, Column, Editing } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";

const GrupoPuertaListPage = props => {

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
        props.eliminarRegistro(evt.data);
    };

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    };

    const textEditing = {
        confirmDeleteMessage: "¿Seguro de eliminar?",
        editRow: "Editar",
        deleteRow: "Eliminar",
    };



    return (
        <>
       
            <PortletHeader
                title="Listado"
                toolbar={
                    <PortletHeaderToolbar>
                        <PortletHeaderToolbar>
                            <Button 
                            icon="plus" 
                            type="default" 
                            text="Nuevo" 
                            onClick={props.nuevoRegistro} />
                        </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                }
            />
            <PortletBody>
                <DataGrid
                    dataSource={props.grupoPuertas}
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
  {/*                   <Column dataField="RowIndex" caption="#" width={"10%"} alignment={"center"} /> */}
                    <Column dataField="IdGrupo" caption= "Código" width={"30%"} visible={false} />   
                    <Column dataField="Grupo" caption= "Grupo" width={"50%"} />               
                    <Column dataType="boolean" caption="Estado" calculateCellValue={obtenerCampoActivo} width={"20%"} />

                </DataGrid>
            </PortletBody>
        </>
    );
};
export default GrupoPuertaListPage;
