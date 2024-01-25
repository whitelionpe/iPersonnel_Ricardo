import React from "react";
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import { isNotEmpty } from "../../../../../_metronic";


const TipoContratoListPage = props => {

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
        //console.log("evento",evt);
        if (evt.rowIndex === -1) return;
        if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
    }


    const seleccionarRegistroDblClick = evt => {
        if (evt.data === undefined) return;
        if (isNotEmpty(evt.data)) {
            props.verRegistroDblClick(evt.data);
        };
    }

    function onCellPrepared(e) {
        if (e.rowType === 'data') {
            if (e.data.Activo === 'N') {
                e.cellElement.style.color = 'red';
            }
        }
    }

    const textEditing = {
        confirmDeleteMessage:'',
        editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
        deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
    }

    return (
        <>
            <PortletHeader
                title={intl.formatMessage({ id: "ACTION.LIST" })}
                toolbar={
                    <PortletHeaderToolbar>
                        <PortletHeaderToolbar>
                            <Button icon="plus" type="default" hint={intl.formatMessage({ id: "ACTION.NEW" })} onClick={props.nuevoRegistro}     disabled={!accessButton.nuevo} />
                        </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                }
            />
            <PortletBody>
                <DataGrid
                    dataSource={props.tipoContrato}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onFocusedRowChanged={seleccionarRegistro}
                    onRowDblClick={seleccionarRegistroDblClick}
                    focusedRowKey={props.focusedRowKey}
                    onCellPrepared={onCellPrepared}
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
                    <Column dataField="IdTipoContrato" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACTTYPE.CODE" })} width={"24%"} alignment={"center"} />
                    <Column dataField="TipoContrato" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACTTYPE.NAME" })} width={"60%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"8%"} alignment={"center"} />


                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="IdTipoContrato"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>

                </DataGrid>
            </PortletBody>
        </>
    );
};

export default injectIntl(TipoContratoListPage);
