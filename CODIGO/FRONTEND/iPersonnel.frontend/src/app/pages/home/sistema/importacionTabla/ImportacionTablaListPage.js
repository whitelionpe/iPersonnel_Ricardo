import React from "react";
import { injectIntl } from "react-intl"; 
import { DataGrid, Column, Editing, Summary, TotalItem,FilterRow, Button as ColumnButton   } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { isNotEmpty } from "../../../../../_metronic";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";

const ImportacionTablaListPage = props => {

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

    function nextDetail(e) {
      // console.log("nextDetail|e:",e);
      props.nextDetail();
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
                    dataSource={props.importacionData}
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
                    <Column dataField="Tabla" caption={intl.formatMessage({ id: "SYSTEM.IMPORT.TABLE" })} width={"30%"}  />
                    <Column dataField="Descripcion" caption={intl.formatMessage({ id: "SYSTEM.IMPORT.DESCRIPTION" })}  />
                    <Column dataField="Prioridad" caption={intl.formatMessage({ id: "SYSTEM.IMPORT.PRIORITY" })}  alignment={"center"}  />
                    <Column dataField="Importar" caption={intl.formatMessage({ id: "SYSTEM.IMPORT.IMPORT" })} alignment={"center"}  />

                   <Column type="buttons" width={"5%"}> 
                    <ColumnButton
                    icon="chevrondoubleright" //chevrondoubleright
                    hint={intl.formatMessage({ id: "SYSTEM.IMPORT.DETAIL" })}
                    onClick={(e) => nextDetail(e)}
                    />
                    <ColumnButton name="edit" />
                    <ColumnButton name="delete" />
                    </Column>

                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="Tabla"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>

                </DataGrid>
            </PortletBody>
        </>
    );
};

export default injectIntl(ImportacionTablaListPage);
