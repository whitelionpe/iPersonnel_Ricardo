import React from "react";
import { injectIntl } from "react-intl";
import { TreeList, Column, Editing, Button, Summary, TotalItem, Paging, FilterRow, Pager, Scrolling } from "devextreme-react/tree-list";

import { Button as ButtonDev } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../_metronic";
import TreeListSummary from "../../../../partials/components/TreeList/Summary";



const EquipoListPage = props => {

    const { intl, accessButton } = props;
    const allowedPageSizes = [20];

    const editarRegistro = evt => {
        props.editarRegistro(evt);
    };

    const eliminarRegistro = evt => {
        evt.cancel = true;
        props.eliminarRegistro(evt);
    };
    const insertarRegistro = evt => {
        props.insertarRegistro(evt);
    }
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
    // const expandedRowKeys = [1];

    function onCellPrepared(e) {
        if (e.rowType === 'data') {
            if (e.data.Activo === 'N') {
                e.cellElement.style.color = 'red';
            }
        }
    }
    const textEditing = {
        confirmDeleteMessage: '',
        editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
        deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
    };

    function buttonRender(row) {
        const { IdEquipoPadre } = row.data;
        return (

            <>
                {IdEquipoPadre === "-1" && (
                    <a href="#"
                        className="dx-link dx-link-share dx-icon-share dx-link-icon"
                        title={intl.formatMessage({ id: "ACTION.ADD" })}
                        aria-label={intl.formatMessage({ id: "ACTION.ADD" })}
                        onClick={(e) => insertarRegistro(row.data)}
                    />
                )}
                &nbsp;
                <a href="#"
                    className="dx-link dx-link-edit dx-icon-edit dx-link-icon"
                    title={intl.formatMessage({ id: "ACTION.EDIT" })}
                    aria-label={intl.formatMessage({ id: "ACTION.EDIT" })}
                    onClick={(e) => editarRegistro(row.data)}
                />
                &nbsp;
                <a href="#"
                    className="dx-link dx-link-trash dx-icon-trash dx-link-icon"
                    title={intl.formatMessage({ id: "ACTION.REMOVE" })}
                    aria-label={intl.formatMessage({ id: "ACTION.REMOVE" })}
                    onClick={(e) => eliminarRegistro(row.data)}
                />
            </>

        )
    }

    return (
        <>
            <PortletHeader
                title={intl.formatMessage({ id: "ACTION.LIST" })}
                toolbar={
                    <PortletHeaderToolbar>
                        <PortletHeaderToolbar>
                            <ButtonDev icon="plus"
                                type="default"
                                hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                onClick={props.nuevoRegistro}
                                //disabled={props.modoEdicion}
                                disabled={!accessButton.nuevo} />
                            &nbsp;

                        </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                }
            />
            <PortletBody>
                <TreeList
                    dataSource={props.equipos}
                    showBorders={true}
                    focusedRowEnabled={true}
                    //defaultExpandedRowKeys={expandedRowKeys}
                    rootValue={-1}
                    keyExpr="IdEquipo"
                    parentIdExpr="IdEquipoPadre"
                    showRowLines={true}
                    //columnAutoWidth={true}
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onFocusedRowChanged={seleccionarRegistro}
                    onRowDblClick={seleccionarRegistroDblClick}
                    onCellPrepared={onCellPrepared}
                    focusedRowKey={props.focusedRowKey}

                >
                    <Scrolling
                        mode="standard" />
                    <Paging
                        enabled={true}
                        defaultPageSize={10} />
                    <Pager
                        showPageSizeSelector={true}
                        allowedPageSizes={allowedPageSizes}
                        showInfo={true} />

                    <FilterRow visible={true} />

                    <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={accessButton.editar}
                        allowDeleting={accessButton.eliminar}
                        texts={textEditing} />

                    <Column dataField="IdEquipo" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"15%"} />
                    <Column dataField="Equipo" caption={intl.formatMessage({ id: "SYSTEM.DEVICE" })} width={"20%"} />
                    <Column dataField="TipoEquipo" caption={intl.formatMessage({ id: "SYSTEM.TEAM.TEAMTYPE" })} width={"15%"} />
                    <Column dataField="Modelo" caption={intl.formatMessage({ id: "SYSTEM.TEAM.MODEL" })} width={"15%"} />
                    {/* <Column dataField="MacAddress" caption={intl.formatMessage({ id: "SYSTEM.TEAM.MACADDRESS" })}  width={"15%"} /> */}
                    <Column dataField="IP" caption={intl.formatMessage({ id: "SYSTEM.TEAM.IP" })} width={"15%"} alignment={"center"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />
                    <Column type="buttons" width={"15%"} cellRender={buttonRender}>
                        {/* <Button text="Agregar" icon="share" hint={intl.formatMessage({ id: "ACTION.ADD" })} onClick={insertarRegistro} />
                        <Button name="IdShare" icon="share" hint={intl.formatMessage({ id: "ACTION.ADD" })} onClick={insertarRegistro} style={{ "display": "none" }} />

                        <Button name="edit" />
                        <Button name="delete" /> */}
                    </Column>

                </TreeList>
                <TreeListSummary TotalItem={isNotEmpty(props.equipos[0]) ? props.equipos[0].TotalItem : 0} />

            </PortletBody>
        </>
    );
};

export default injectIntl(EquipoListPage);
