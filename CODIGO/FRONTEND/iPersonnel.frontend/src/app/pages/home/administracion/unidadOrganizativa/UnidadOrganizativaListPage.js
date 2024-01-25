import React from "react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { Button } from "devextreme-react";
import { injectIntl } from "react-intl"; 
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";

const textEditing = {
    confirmDeleteMessage: "¿Seguro de eliminar grupo?",
    editRow: "Editar grupo",
    deleteRow: "Eliminar grupo",
};

const UnidadOrganizativaListPage = props => {

    const { intl } = props;

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
        props.eliminarRegistro(evt.data);
    };

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    };

    const seleccionarRegistro = evt => {
        props.seleccionarRegistro(evt.data);
    };

    return (
        <>
            <PortletHeader
                title={ intl.formatMessage({ id: "ACTION.LIST" }) }
                toolbar={
                    <PortletHeaderToolbar>
                        <PortletHeaderToolbar>
                            <Button icon="plus" type="default" hint={intl.formatMessage({ id: "ACTION.NEW" })} onClick={props.nuevoRegistro} />
                        </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                }
            />
            <PortletBody>


                <DataGrid 
                    dataSource={props.unidadOrganizativas}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    //onEditingStart={editarRegistro}
                    //onRowRemoving={eliminarRegistro}
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
                    <Column dataField="RowIndex" caption="#" width={"8%"} alignment={"center"} />
                    <Column dataField="IdCliente" caption="IdCliente"  visible ={false} width={"24%"} alignment={"center"} />
                    <Column dataField="IdUnidadOrganizativa" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"24%"} alignment={"center"} />
                    <Column dataField="UnidadOrganizativa" caption={intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.SUBTITLE" })} width={"60%"} />                 
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"8%"} alignment={"center"} />

                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="RowIndex"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>

                </DataGrid>
            </PortletBody>
        </>
    );
};

export default injectIntl(UnidadOrganizativaListPage);
