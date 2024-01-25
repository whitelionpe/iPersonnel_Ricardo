import React from "react";
import { injectIntl } from "react-intl";

import { DataGrid, Column, Editing } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../_metronic";

import Form, { Item, GroupItem } from "devextreme-react/form";

const MenuDatosPersonalizadoListPage = props => {

    const { intl } = props;

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
        evt.cancel = true;
        props.eliminarRegistro(evt.data);
    };

    const obtenerCampoObligatorio = rowData => {
        return rowData.Obligatorio === "S";
    };

    const obtenerCampoModificable = rowData => {
        return rowData.Modificable === "S";
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
                                    dataSource={props.menuDatos}
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
                                        /*allowUpdating={props.modoEdicion}
                                        allowDeleting={props.modoEdicion}*/
                                        texts={textEditing}
                                    />
                                    <Column dataField="RowIndex" caption="#" width={40} />
                                    <Column dataField="Campo" caption={intl.formatMessage({ id: "SYSTEM.MENUDATA.CONTRYSITE" })} alignment={"center"} />
                                    <Column dataField="Descripcion" caption={intl.formatMessage({ id: "SYSTEM.MENUDATA.DESCRIPTION" })} />
                                    <Column dataType="boolean" caption={intl.formatMessage({ id: "SYSTEM.MENUDATA.MANDATORY" })} calculateCellValue={obtenerCampoObligatorio} width={100} />
                                    <Column dataType="boolean" caption={intl.formatMessage({ id: "SYSTEM.MENUDATA.MODIFIABLE" })} calculateCellValue={obtenerCampoModificable} width={100} />

                                </DataGrid>
                            </Item>
                        </GroupItem>
                    </Form>


                </React.Fragment>
            </PortletBody>
        </>
    );
};

export default injectIntl(MenuDatosPersonalizadoListPage);
