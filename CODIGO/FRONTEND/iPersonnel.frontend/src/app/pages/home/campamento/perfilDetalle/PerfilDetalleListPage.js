import React from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";


const PerfilDetalleListPage = props => {

    const { intl } = props;

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
    const seleccionarRegistro = evt => {
        props.seleccionarRegistro(evt.data) 
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
                       
                            <Button
                                icon="plus"
                                type="default"
                                hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                onClick={props.nuevoRegistro} 
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
            <PortletBody>
                <DataGrid
                    dataSource={props.campamentosPerfilDetalle}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onRowClick={seleccionarRegistro}
                    focusedRowKey={props.focusedRowKey}
                >
                    <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={true}
                        allowDeleting={true}
                        texts={textEditing}
                    />
                    {/* <Column dataField="RowIndex" caption="#" width={"10%"} alignment={"center"} /> */}
                    {/*<Column dataField="IdSecuencial" caption={intl.formatMessage({ id: "CAMP.PROFILE.DETAIL.SEQUENTIAL" })} width={"12%"}/>*/}
                    <Column dataField="Campamento" caption={intl.formatMessage({ id: "CAMP.PROFILE.DETAIL.CAMP" })} width={"20%"}/>
                    <Column dataField="Modulo" caption={intl.formatMessage({ id: "CAMP.PROFILE.DETAIL.MODULE" })} width={"20%"} />
                    <Column dataField="Habitacion" caption={intl.formatMessage({ id: "CAMP.PROFILE.DETAIL.ROOM" })} width={"20%"} />
                    <Column dataField="Cama" caption={intl.formatMessage({ id: "CAMP.PROFILE.DETAIL.BED" })} width={"30%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />
                    <Column dataField="IdPerfil" visible={false}/>
                </DataGrid>
            </PortletBody>
        </>
    );
};

export default injectIntl(PerfilDetalleListPage);
