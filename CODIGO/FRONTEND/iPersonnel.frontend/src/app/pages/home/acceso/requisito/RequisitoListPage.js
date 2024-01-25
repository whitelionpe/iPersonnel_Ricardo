import React from "react";
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { injectIntl } from "react-intl"; 
import { isNotEmpty } from "../../../../../_metronic";

const RequisitoListPage = props => {

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
    }

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
    }

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
                            <Button icon="plus" type="default" hint={intl.formatMessage({ id: "ACTION.NEW" })} onClick={props.nuevoRegistro}  disabled={!accessButton.nuevo}/>
                        </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                }
            />
            <PortletBody>
                <DataGrid
                    dataSource={props.requisitoData}
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
                    {/* <Column dataField="RowIndex" caption="#" width={"10%"} alignment={"center"} /> 
                    <Column dataField="IdCliente"  width={"5%"} visible={false} />
                    <Column dataField="IdDivision" width={"5%"} visible={false}  />*/}
                    <Column dataField="IdRequisito" caption={intl.formatMessage({ id: "ACCESS.REQUIREMENTS.CODE" })}  width={"20%"} alignment={"center"} />
                    <Column dataField="Requisito" caption={intl.formatMessage({ id: "ACCESS.REQUIREMENTS.REQUIREMENT" })} width={"35%"}/> 
                    <Column dataField="Entidad" caption={intl.formatMessage({ id: "ACCESS.REQUIREMENTS.ENTITY" })} width={"20%"} />
                    <Column dataField="DiasNotificacion" caption={intl.formatMessage({ id: "ACCESS.REQUIREMENTS.NUMBERDAYS" })} width={"15%"} alignment={"center"}/>
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"8%"} />
                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="IdRequisito"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({id:"COMMON.TOTAL.ROW"}) } {0}`}
                            width={150}
                        />                      
                    </Summary>
                </DataGrid>
            </PortletBody>
        </>
    );
};

export default injectIntl(RequisitoListPage);
