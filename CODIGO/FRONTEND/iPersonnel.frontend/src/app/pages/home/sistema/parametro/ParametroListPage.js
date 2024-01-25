import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Button as ColumnButton, Column, Editing, MasterDetail, Selection, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { listar as listarParametroDetalle } from '../../../../api/sistema/parametroModulo.api';

import { isNotEmpty } from "../../../../../_metronic";
import PropTypes from "prop-types"
import HeaderInformation from "../../../../partials/components/HeaderInformation";


const ParametroListPage = props => {
    const { intl, accessButton } = props;


    //*************Evento-Parametro****************************/

    const editarRegistro = evt => {
        //console.log("editarRegistro...>", evt.data);
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
        evt.cancel = true;
        props.eliminarRegistro(evt.data);
    };

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    };

    const seleccionarRegistro = evt => {
        if (evt.rowIndex === -1) return;
        if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
        //props.seleccionarRegistro(evt.data);
    };

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
        props.expandRow.setExpandRowParametro(e.key);
        props.collapsedRow.setCollapsedParametro(false);
        //console.log("onRowExpanding", e);
        //console.log("onRowExpanding.component", e.component);

        if (e.key !== 0 && e.expanded) {
            //console.log("Listar Key", e.key);
            e.component.collapseAll(-1);
        }
        return;
    }

    function onRowCollapsed(e) {
        //console.log("onRowCollapsed", e);
        //console.log("focusedRowKey", props.focusedRowKey);
        props.collapsedRow.setCollapsedParametro(true);
        e.component.collapseRow(e.key);
        //e.component.collapseRow(props.focusedRowKey);
        return;
    }

    function contentReady(e) {
        if (!props.collapsedRow.collapsedParametro) {
            //props.setCollapsed( props.collapsed );
            e.component.expandRow(props.expandRow.expandRowParametro);
        }
        return;
    }


    //***************Eventos de Parametro-detalle***************************/
    const seleccionarParametroModulo = evt => {
        props.seleccionarParametroModulo(evt);
    };

    const editarParametroModulo = evt => {
        props.editarParametroModulo(evt);
    };

    const eliminarParametroModulo = evt => {
        props.eliminarParametroModulo(evt);
    };

    const insertarParametroModulo = evt => {
        props.insertarParametroModulo(evt.row.data);
    }

    useEffect(() => {

    }, []);

    return (
        <>

            <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
                toolbar={
                    <PortletHeader
                        title=""
                        toolbar={
                            <PortletHeaderToolbar>
                                <PortletHeaderToolbar>
                                    <Button
                                        icon="plus"
                                        type="default"
                                        hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                        onClick={props.nuevoRegistro}
                                        //disabled={!accessButton.nuevo} 
                                    />
                            &nbsp;
                            <Button
                                        icon="fa fa-times-circle"
                                        type="normal"
                                        hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                                        onClick={props.cancelarEdicion}
                                    />
                                </PortletHeaderToolbar>
                            </PortletHeaderToolbar>
                        }
                    />

                } />



            <PortletBody>
                <DataGrid
                    id={"datagrid-parametro"}
                    dataSource={props.parametros}
                    showBorders={true}
                    focusedRowEnabled={true}
                    focusedRowKey={props.focusedRowKey}
                    keyExpr="RowIndex"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onFocusedRowChanged={seleccionarRegistro}
                    onCellPrepared={onCellPrepared}

                    onRowExpanding={onRowExpanding}
                    onRowCollapsed={onRowCollapsed}
                    onContentReady={contentReady}
                >
                    <Editing
                        mode="row"
                        useIcons={props.showButtons}
                        allowUpdating={props.showButtons}
                        allowDeleting={props.showButtons}
                        /*allowUpdating={accessButton.editar}
                        allowDeleting={accessButton.eliminar}*/
                        texts={textEditing}
                    />
                    <Column dataField="IdParametro" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} alignment={"center"} />
                    <Column dataField="Parametro" caption={intl.formatMessage({ id: "SYSTEM.PARAMETER" })} width={"60%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"8%"} />
                    <Column type="buttons" width={"10%"} visible={props.showButtons} >
                        <ColumnButton icon="share" hint={intl.formatMessage({ id: "SYSTEM.APLICATION.ADD" })} onClick={insertarParametroModulo} />
                        <ColumnButton name="edit" />
                        <ColumnButton name="delete" />
                    </Column>

                    <Summary>
                        <TotalItem
                         cssClass="classColorPaginador_"
                            column="IdParametro"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>

                    <MasterDetail enabled={true} component={(dta) => (ParametroModuloListPage({ data: dta.data, intl, seleccionarParametroModulo, editarParametroModulo, eliminarParametroModulo, focusedRowKeyParametroModulo: props.focusedRowKeyParametroModulo, showButtons: props.showButtons }))} />

                </DataGrid>
            </PortletBody>
        </>
    );
};

ParametroListPage.prototype = {
    showButtons: PropTypes.bool,
    modoEdicion: PropTypes.bool,

}
ParametroListPage.defaultProps = {
    showButtons: true,
    modoEdicion: true,

}

//*******************************************/

const ParametroModuloListPage = props => {

    const { intl } = props;
    const [dataSource, setDataSource] = useState([]);

    const editarParametroModulo = evt => {
        props.editarParametroModulo(evt.data);
    };

    const eliminarParametroModulo = evt => {
        props.eliminarParametroModulo(evt.data);
    };

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    };

    const obtenerCampoFijo = rowData => {
        return rowData.Fijo === "S";
    }

    const seleccionarParametroModulo = evt => {
        if (evt.rowIndex === -1) return;
        if (isNotEmpty(evt.row.data)) props.seleccionarParametroModulo(evt.row.data);
        //props.seleccionarParametroModulo(evt.data);
    };


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

    async function listarParametroModulo(dataRow) {
        const { IdModulo, IdAplicacion, IdParametro } = dataRow;
        if (isNotEmpty(IdParametro)) {
            let params = { IdModulo, IdAplicacion, IdParametro, IdSecuencial: "0" };
            let parametroModulo = await listarParametroDetalle(params);
            setDataSource(parametroModulo);
        }
    }

    useEffect(() => {
        listarParametroModulo(props.data.data);
    }, []);

    return (

        <>
            <DataGrid
                id="datagrid-detalle"
                dataSource={dataSource}
                showBorders={true}
                focusedRowEnabled={true}
                focusedRowKey={props.focusedRowKeyParametroModulo}
                keyExpr="RowIndex"
                onCellPrepared={onCellPrepared}
                onEditingStart={editarParametroModulo}
                onRowRemoving={eliminarParametroModulo}
                onFocusedRowChanged={seleccionarParametroModulo}

            >
                <Editing
                    mode="row"
                    useIcons={props.showButtons}
                    allowUpdating={props.showButtons}
                    allowDeleting={props.showButtons}
                    texts={textEditing}
                />
                <Column dataField="RowIndex" caption="#" width={"10%"} alignment={"center"} />
                <Column dataField="Valor" caption={intl.formatMessage({ id: "SYSTEM.PARAMETERMODULE.VALUE" })} width={"20%"} />
                <Column dataField="Descripcion" caption={intl.formatMessage({ id: "COMMON.DESCRIPTION" })} width={"40%"} />
                <Column dataType="boolean" caption={intl.formatMessage({ id: "SYSTEM.PARAMETERMODULE.PERMANENT" })} calculateCellValue={obtenerCampoFijo} width={"10%"} />
                <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />
                <Column type="buttons" visible={props.showButtons} width={"10%"} >
                    <ColumnButton name="edit" />
                    <ColumnButton name="delete" />
                </Column>
            </DataGrid>

        </>
    );
};
ParametroListPage.propTypes = {
    showHeaderInformation: PropTypes.bool,
};
ParametroListPage.defaultProps = {
    showHeaderInformation: true,
};

export default injectIntl(ParametroListPage);
