import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Button, MasterDetail, Summary, TotalItem } from "devextreme-react/data-grid";

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
        evt.cancel = true;
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

    function onRowExpanding(e) {
       // console.log("onRowExpanding", e);
        props.expandRow.setExpandRow(e.key);
        props.collapsedRow.setCollapsed(false);
        //e.component.collapseAll(-1);
        return;
    }

    function onRowCollapsed(e) {
        props.collapsedRow.setCollapsed(true);
        e.component.collapseRow(e.key);
        return;
    }

    function contentReady(e) {
        if (!props.collapsedRow.collapsed) {
            //props.setCollapsed( props.collapsed );
            e.component.expandRow(props.expandRow.expandRow);
        }
        return;
    }
    //*******************-Eventos de tipo equipo Hijo-**************************/

    const actualizarTipoEquipo = data => {
        props.actualizarRegistro(data);

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
                                onClick={props.nuevoRegistro} />
                        </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                }
            />
            <PortletBody>
                <DataGrid
                    id="datagrid-tipoEquipo_XX"
                    keyExpr="RowIndex"
                    dataSource={props.tipoEquipos}
                    showBorders={true}
                    focusedRowEnabled={true}
                    //showRowLines={true}
                    //columnAutoWidth={true}
                    //rootValue={-1}
                    //keyExpr="IdTipoEquipo"
                    //parentIdExpr="IdTipoEquipoHijo"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onFocusedRowChanged={seleccionarRegistro}
                    focusedRowKey={props.focusedRowKey}
                   // onRowDblClick={seleccionarRegistroDblClick}

                    onCellPrepared={onCellPrepared}

                    onRowExpanding={onRowExpanding}
                    onRowCollapsed={onRowCollapsed}
                    onContentReady={contentReady}
                >
                    <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={true}
                        allowDeleting={true}
                        texts={textEditing}
                    />
                    {/* <Column dataField="RowIndex" caption="#"  width={"8%"} alignment={"center"} /> */}
                    <Column dataField="IdTipoEquipo" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"15%"} alignment={"center"} />
                    <Column dataField="TipoEquipo" caption={intl.formatMessage({ id: "SYSTEM.TEAM.TEAMTYPE" })} width={"50%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "SYSTEM.TYPE.DEVICE.PERMANENT" })} calculateCellValue={obtenerCampoEquipoFijo} width={"10%"} alignment={"center"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} alignment={"center"} />
                    
                    <Column type="buttons" width={"15%"} >
                        <Button text="add" icon="share" hint={intl.formatMessage({ id: "ACTION.ADD" })} onClick={insertarRegistro} />
                        <Button name="edit" />
                        <Button name="delete" />
                    </Column>

                    <MasterDetail enabled={true} component={(dta) => TipoEquipoHijo({ data: dta.data, intl, actualizarTipoEquipo })} />

                    <Summary>
                        <TotalItem
                         cssClass="classColorPaginador_"
                            column="IdTipoEquipo"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>
                </DataGrid>

            </PortletBody>
        </>
    );
};
//Definir el hijo que tiene tipo equipo...............................................
const TipoEquipoHijo = props => {
    const { intl } = props;
    const [dataSource, setDataSource] = useState([]);
    const splashScreen = document.getElementById("splash-screen");

    async function listar(params) {
        const { IdTipoEquipoHijo } = params;
        if (isNotEmpty(IdTipoEquipoHijo)) {
            splashScreen.classList.remove("hidden");
            await obtenerTodos({ IdTipoEquipo: '%', IdTipoEquipoHijo })
                .then(tipoEquipo => {
                    setDataSource(tipoEquipo);
                }).finally(() => { splashScreen.classList.add("hidden"); });

        }
    }
    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    };

    const eliminarRegistroHijo = evt => {
        //Con este metodo se actualiza campo IdTipoEquipoHijo, no se elimina el registro de la tabla.
        const { Activo
            , EquipoFijo
            , IdTipoEquipo
            , Observacion
            , TipoEquipo
            , TipoEquipoHijo } = props.data.data;

        var data = {
            Activo
            , EquipoFijo
            , IdTipoEquipo
            , IdTipoEquipoHijo: ""
            , Observacion
            , TipoEquipo
            , TipoEquipoHijo
            , messageDelete: true
        }
        props.actualizarTipoEquipo(data);
    }

    const textEditing = {
        confirmDeleteMessage:'',
        deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
    };

    useEffect(() => {
        listar(props.data.data);
    }, []);

    return (
        <>
            <DataGrid
                dataSource={dataSource}
                showBorders={true}
                columnAutoWidth={true}

            //onRowRemoving={eliminarRegistros}
            >
                <Editing
                    mode="row"
                    useIcons={true}
                    allowDeleting={true}
                    texts={textEditing}
                />
                <Column dataField="IdTipoEquipo" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"20%"} alignment={"center"} />
                <Column dataField="TipoEquipo" caption={intl.formatMessage({ id: "SYSTEM.TYPE.DEVICE.COMPONENTS" })} width={"70%"} />
                <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} alignment={"center"} />
                <Column type="buttons" width={"15%"} >
                    <Button name="delete" onClick={eliminarRegistroHijo} />
                </Column>
            </DataGrid>

        </>
    );
};
//.....................................................................

export default injectIntl(TipoEquipoListPage);
