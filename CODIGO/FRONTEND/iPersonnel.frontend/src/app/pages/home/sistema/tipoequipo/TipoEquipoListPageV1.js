import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Button, MasterDetail } from "devextreme-react/data-grid";

import { Button as ButtonDev } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { obtenerTodos } from "../../../../api/sistema/tipoequipo.api";
import { isNotEmpty } from "../../../../../_metronic";

const TipoEquipoListPage = props => {
    const { intl } = props;

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
        props.eliminarRegistro(evt.data);
    };
    const insertarRegistro = evt => {
        props.insertarRegistro(evt.row.data);
    }
    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    };

    const obtenerCampoEquipoFijo = rowData => {
        return rowData.EquipoFijo === "S";
    };

    const seleccionarRegistro = evt => {
        //props.seleccionarRegistro(evt.data);
        if (evt.rowIndex === -1) return;
        if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);

    };

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
                            <ButtonDev icon="plus"
                                type="default"
                                hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                onClick={props.nuevoRegistro} />
                        </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                }
            />
            <PortletBody>
                <DataGrid
                    dataSource={props.tipoEquipos}
                    showBorders={true}
                    focusedRowEnabled={true}
                    showRowLines={true}
                    //columnAutoWidth={true}
                    rootValue={-1}
                    keyExpr="IdTipoEquipo"
                    parentIdExpr="IdTipoEquipoHijo"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onFocusedRowChanged={seleccionarRegistro}
                    onRowDblClick={seleccionarRegistroDblClick}
                    focusedRowKey={props.focusedRowKey}
                    onCellPrepared = { onCellPrepared }
                >
                    <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={true}
                        allowDeleting={true}
                        texts={textEditing}
                    />
                    {/* <Column dataField="RowIndex" caption="#"  width={"8%"} alignment={"center"} /> */}
                    <Column dataField="IdTipoEquipo" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} alignment={"center"} />
                    <Column dataField="TipoEquipo" caption={intl.formatMessage({ id: "SYSTEM.TEAM.TEAMTYPE" })} width={"55%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "SYSTEM.TYPE.DEVICE.PERMANENT" })} calculateCellValue={obtenerCampoEquipoFijo} width={"10%"} alignment={"center"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.STATE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} alignment={"center"} />
                    <Column type="buttons" width={"15%"} >
                        <Button text="add" icon="share" hint={intl.formatMessage({ id: "ACTION.ADD" })} onClick={insertarRegistro} />
                        <Button name="edit" />
                        <Button name="delete" />
                    </Column>

                    <MasterDetail enabled={true} component={(dta) => TipoEquipoHijo({ data: dta.data, intl })} />

                </DataGrid>

            </PortletBody>
        </>
    );
};
//Definir el hijo que tiene tipo equipo...............................................
const TipoEquipoHijo = props => {
    const { intl } = props;
    const [dataSource, setDataSource] = useState([]);

    async function listar(params) {
        const { IdTipoEquipoHijo } = params;
        if (isNotEmpty(IdTipoEquipoHijo)) {
            let tipoEquipo = await obtenerTodos({ IdTipoEquipo: '%', IdTipoEquipoHijo });
            setDataSource(tipoEquipo);
        }
    }
    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    };

    useEffect(() => {
        listar(props.data.data);
    }, []);

    return (
        <>
            <DataGrid
                dataSource={dataSource}
                showBorders={true}
                columnAutoWidth={true}>
                <Column dataField="IdTipoEquipo" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"20%"} alignment={"center"} />
                <Column dataField="TipoEquipo" caption={intl.formatMessage({ id: "SYSTEM.TYPE.DEVICE.COMPONENTS" })} width={"70%"} />
                <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.STATE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} alignment={"center"} />

            </DataGrid>

        </>
    );
};
//.....................................................................

export default injectIntl(TipoEquipoListPage);
