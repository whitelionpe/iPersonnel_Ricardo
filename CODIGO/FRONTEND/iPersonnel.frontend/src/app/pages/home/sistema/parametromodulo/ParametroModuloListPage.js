import React from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";


const ParametroModuloListPage = props => {

    const { intl } = props;

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
        props.eliminarRegistro(evt.data);
    };

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    }
    const obtenerCampoFijo = rowData => {
        return rowData.Fijo === "S";
    }
    const insertarRegistro = evt => {       
        props.insertarRegistro(evt.row.data);
    }
    const textEditing = {
        confirmDeleteMessage:'',
        editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
        deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
    };

    return (
        <>
            <PortletHeader
                title={intl.formatMessage({ id: "ACTION.LIST" })}
                toolbar={
                    <PortletHeaderToolbar>
                        <PortletHeaderToolbar>
                            <Button
                                icon="plus"
                                type="default"
                                hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                onClick={props.nuevoRegistro} />
                        </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                }
            />
            <PortletBody>
                <DataGrid
                    dataSource={props.parametroModulos}
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
                    <Column dataField="RowIndex" caption="#" width={"10%"} alignment={"center"} />
                    <Column dataField="IdSecuencial" caption={intl.formatMessage({ id: "SYSTEM.PARAMETERMODULE.SEQUENTIAL" })} width={"20%"} />
                    <Column dataField="Descripcion" caption={intl.formatMessage({ id: "COMMON.DESCRIPTION" })} width={"30%"} />
                    <Column dataField="Valor" caption={intl.formatMessage({ id: "SYSTEM.PARAMETERMODULE.VALUE" })} width={"20%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "SYSTEM.PARAMETERMODULE.PERMANENT" })} calculateCellValue={obtenerCampoFijo} width={"10%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />
                    <Column type="buttons" width={"15%"}>
                        <Button text="Agregar" icon="share" hint={intl.formatMessage({ id: "ACTION.ADD"})} onClick={insertarRegistro} />
                        <Button name="edit" />
                        <Button name="delete" />
                    </Column>
                </DataGrid>
            </PortletBody>
        </>
    );
};

export default injectIntl(ParametroModuloListPage);
