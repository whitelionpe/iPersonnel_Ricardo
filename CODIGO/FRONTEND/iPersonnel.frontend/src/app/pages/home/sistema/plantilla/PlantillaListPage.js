import React from "react";
import { injectIntl } from "react-intl"; 
import { DataGrid, Column, Editing, Summary, TotalItem,FilterRow  } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { isNotEmpty } from "../../../../../_metronic";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";

const PlantillaListPage = props => {

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
                                disabled={!accessButton.nuevo} />
                        </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                }
            />
            <PortletBody>
                <DataGrid
                    dataSource={props.objetoData}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}                  
                    focusedRowKey={props.focusedRowKey}
                    onCellPrepared={onCellPrepared}
                    onFocusedRowChanged={seleccionarRegistro}
                    onRowDblClick={seleccionarRegistroDblClick}
                    repaintChangesOnly={true}
                >
                    <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={accessButton.editar}
                        allowDeleting={accessButton.eliminar}
                        texts={textEditing}
                    />
                    <FilterRow visible={true} showOperationChooser={false} />
                    <Column dataField="IdObjeto" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"20%"} visible={true} alignment={"center"}  allowFiltering={false} />
                    <Column dataField="Objeto" caption={intl.formatMessage({ id: "COMMON.DESCRIPTION" })} width={"30%"} visible={true} />
                    <Column dataField="Identificador" caption={intl.formatMessage({ id: "SYSTEM.OBJECT.IDENTIFIER" })} width={"25%"} visible={true} />
                    <Column dataField="TipoObjetoDesc" caption={intl.formatMessage({ id: "SYSTEM.OBJECT.OBJECTTYPE" })} width={"25%"} visible={true} allowFiltering={false} />
                    <Column dataType="boolean" dataField="Activo" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} allowFiltering={false} />

                    <Summary>
                        <TotalItem
                         cssClass="classColorPaginador_"
                            column="IdObjeto"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>

                </DataGrid>
            </PortletBody>
        </>
    );
};

export default injectIntl(PlantillaListPage);
