import React from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";


import Form, { Item, GroupItem } from "devextreme-react/form";

const MenuControllerListPage = props => {

    const { intl } = props;

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
        evt.cancel = true;
        props.eliminarRegistro(evt.data);
    };

    const textEditing = {
        confirmDeleteMessage: '',
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
                                    dataSource={props.menuController}
                                    showBorders={true}
                                    focusedRowEnabled={true}
                                    keyExpr="RowIndex"
                                    onRowRemoving={eliminarRegistro}
                                >
                                    <Editing
                                        mode="row"
                                        useIcons={true}
                                        allowDeleting={true}
                                        texts={textEditing}
                                    />
                                    <Column dataField="RowIndex" caption="#" width={50} />
                                    <Column dataField="IdController" caption={intl.formatMessage({ id: "COMMON.CODE" })} alignment={"left"} />

                                </DataGrid>
                            </Item>
                        </GroupItem>
                    </Form>


                </React.Fragment>
            </PortletBody>
        </>
    );
};

export default injectIntl(MenuControllerListPage);