import React from "react";
import { DataGrid, Column, Editing } from "devextreme-react/data-grid";

const MenuListPage = props => {


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
        <DataGrid
            dataSource={props.menus}
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
            />
            <Column dataField="RowIndex" caption="#" width={40} />
            <Column dataField="Modulo" caption="Modulo" />
            <Column dataField="MenuPadre" caption="Menú Padre" width={80} />
            <Column dataField="Menu" caption="Menú" />
            <Column dataType="boolean" caption="Estado" calculateCellValue={obtenerCampoActivo} width={80} />

        </DataGrid>
    );
};

export default MenuListPage;


