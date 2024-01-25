import React from "react";
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { injectIntl } from "react-intl"; 
import { isNotEmpty } from "../../../../../_metronic";

const CategoriaListPage = props => {

    const { intl, accessButton } = props;

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {  
        evt.cancel = true;
        props.eliminarRegistro(evt.data);
    };

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    };

    const seleccionarRegistro = evt => {
        if (evt.rowIndex === -1) return;
        if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
    }

    const seleccionarRegistroDblClick = evt => {
        if (evt.data === undefined) return;
        if (isNotEmpty(evt.data)) {
            props.verRegistroDblClick(evt.data);
        };
    }

    const textEditing = {
        confirmDeleteMessage:'',
        editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
        deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
    };

    function onCellPrepared(e) {
        if (e.rowType === 'data') {
            if (e.data.Activo === 'N') {
                e.cellElement.style.color = 'red';
            }
        }
    }

    return (
        <>
            <PortletHeader
                title={intl.formatMessage({ id: "ACTION.LIST" })}
                toolbar={
                    <PortletHeaderToolbar>
                        <PortletHeaderToolbar>
                            <Button icon="plus" type="default" hint={intl.formatMessage({ id: "ACTION.NEW" })} onClick={props.nuevoRegistro}   disabled={!accessButton.nuevo}/>
                        </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                }
            />
            <PortletBody>

                <DataGrid
                    dataSource={props.categorias}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onFocusedRowChanged={seleccionarRegistro}
                    focusedRowKey={props.focusedRowKey}
                    onRowDblClick={seleccionarRegistroDblClick}
                    onCellPrepared = { onCellPrepared }
                    repaintChangesOnly={true}
                >
                    <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={accessButton.editar}
                        allowDeleting={accessButton.eliminar}
                        texts={textEditing}
                    />
                    {/* <Column dataField="RowIndex" caption="#" width={"8%"} alignment={"center"} /> */}
                    <Column dataField="IdCategoria" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"20%"} />
                    <Column dataField="Categoria" caption={intl.formatMessage({ id: "COMMON.DESCRIPTION" })} width={"70%"}/>
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} alignment={"center"}/>

                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="IdCategoria"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>
                </DataGrid>

            </PortletBody>
        </>
    );
};

export default injectIntl(CategoriaListPage);
