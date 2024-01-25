import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { isNotEmpty } from "../../../../../_metronic";
import PropTypes from "prop-types";

const MenuObjetoListPage = props => {

    const { intl } = props;

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
        evt.cancel = true;
        props.eliminarRegistro(evt.data);
    };

    const seleccionarRegistro = evt => {
        if (evt.rowIndex === -1) return;
        if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
    }

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
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
                            <Button icon="plus"
                                type="default"
                                hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                //disabled={!props.modoEdicion}
                                onClick={props.nuevoRegistro} />
                        </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                }
            />
            <PortletBody>
                <React.Fragment>
                    <Form>
                        <GroupItem>
                            <Item>
                                <DataGrid
                                    dataSource={props.menuObjetos}
                                    showBorders={true}
                                    focusedRowEnabled={true}
                                    keyExpr="RowIndex"
                                    onEditingStart={editarRegistro}
                                    onRowRemoving={eliminarRegistro}

                                    emoteOperations={true}
                                    onFocusedRowChanged={seleccionarRegistro}
                                    focusedRowKey={props.focusedRowKey}
                                    onCellPrepared={onCellPrepared}
                                    allowColumnReordering={true}
                                    allowColumnResizing={true}
                                    columnAutoWidth={true}
                                >
                                    <Editing
                                        mode="row"
                                        useIcons={true}
                                        allowUpdating={true}
                                        allowDeleting={true}
                                        /*allowUpdating={props.modoEdicion}
                                        allowDeleting={props.modoEdicion}*/
                                        texts={textEditing}
                                    />
                                    {/* <Column dataField="RowIndex" caption="#" width={40} /> */}
                                    <Column dataField="IdObjeto" visible={false}/>
                                    <Column dataField="Identificador" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"25%"}/>
                                    <Column dataField="Objeto" caption={intl.formatMessage({ id: "SYSTEM.MENU.OBJECT.OBJECT" })} width={"40%"}/>
                                    <Column dataField="TipoObjeto" caption={intl.formatMessage({ id: "SYSTEM.MENU.OBJECT.OBJECTTYPE" })} width={"20%"}/>
                                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"15%"} />

                                    <Summary>
                                    <TotalItem
                                    cssClass="classColorPaginador_"
                                        column="Identificador"
                                        summaryType="count"
                                        displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                                    />
                                </Summary>
                                </DataGrid>
                            </Item>
                        </GroupItem>
                    </Form>


                </React.Fragment>
            </PortletBody>
        </>
    );
};

export default injectIntl (MenuObjetoListPage);


