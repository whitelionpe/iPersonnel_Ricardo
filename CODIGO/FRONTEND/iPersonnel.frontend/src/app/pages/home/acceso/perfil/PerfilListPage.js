import React  from "react";
import { injectIntl } from "react-intl"; 
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../_metronic";

const PerfilListPage = props => {
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
                                onClick={props.nuevoRegistro} 
                                disabled={!accessButton.nuevo}/>
                        </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                }
            />
            <PortletBody>
                <DataGrid
                    dataSource={props.perfiles}
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
                    {/* <Column dataField="RowIndex" caption="#" width={"7%"} alignment={"center"} /> */}
                    <Column dataField="IdPerfil" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"20%"} />
                    <Column dataField="Perfil" caption={intl.formatMessage({ id: "ACCESS.PROFILE" })} width={"40%"} />
                    <Column dataField="Entidad" caption={intl.formatMessage({ id: "ACCESS.PROFILE.ENTITY" })} width={"30%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />

                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="IdPerfil"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({id:"COMMON.TOTAL.ROW"}) } {0}`}
                        />                      
                    </Summary>

                </DataGrid>
            </PortletBody>
        </>
    );
};

export default injectIntl(PerfilListPage);
