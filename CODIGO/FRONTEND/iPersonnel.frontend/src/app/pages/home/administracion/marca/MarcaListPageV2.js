import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Button as ColumnButton, Column, Editing, MasterDetail, Selection } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../_metronic";
import PropTypes from "prop-types"

import { listar as listarMarcaDetalle } from '../../../../api/administracion/marcaModelo.api';


const MarcaListPage = props => {

    const { intl } = props;

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
        props.eliminarRegistro(evt.data);
    };

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    };

    const seleccionarRegistro = evt => {
        if (evt.rowIndex === -1) return;
        if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
    }

    const textEditing = {
        confirmDeleteMessage:'',
        editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
        deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
    };

    function onCellPrepared(e) {
        if (e.rowType === 'data') {
            if (e.data.Activo === 'N') {
                e.cellElement.style.color = 'red';
            }
        }
    }


    function onRowExpanding(e) {
        props.expandRow.setExpandRowMarca(e.key);
        props.collapsedRow.setCollapsedMarca(false);

        if (e.key !== 0 && e.expanded) {
            e.component.collapseAll(-1);
        }
        return;
    }

    function onRowCollapsed(e) {
        props.collapsedRow.setCollapsedMarca(true);
        e.component.collapseRow(e.key);
        return;
    }

    function contentReady(e) {
        if (!props.collapsedRow.collapsedMarca) {
            e.component.expandRow(props.expandRow.expandRowMarca);
        }
        return;
    }

    //::Marca Detalle:::::::::::::::::::::::::::::::::::::::::::::

    const seleccionarMarcaModelo = evt => {
        props.seleccionarMarcaModelo(evt);
    };

    const editarMarcaModelo = evt => {
        props.editarMarcaModelo(evt);
    };

    const eliminarMarcaModelo = evt => {
        props.eliminarMarcaModelo(evt);
    };

    const insertarMarcaModelo = evt => {
        props.insertarMarcaModelo(evt.row.data);
    }



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
                                onClick={props.nuevoRegistro} />
                        </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                }
            />
            <PortletBody>
                <DataGrid
                    id={"datagrid-marca"}
                    dataSource={props.marcas}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onFocusedRowChanged={seleccionarRegistro}
                    onCellPrepared={onCellPrepared}
                    focusedRowKey={props.focusedRowKey}

                    onRowExpanding={onRowExpanding}
                    onRowCollapsed={onRowCollapsed}
                    onContentReady={contentReady}
                >
                    <Editing
                        mode="row"
                        useIcons={props.showButtons}
                        allowUpdating={props.showButtons}
                        allowDeleting={props.showButtons}
                        texts={textEditing}
                    />
                    <Column dataField="RowIndex" caption="#" width={"8%"} alignment={"center"} />
                    <Column dataField="IdMarca" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"24%"} alignment={"center"} />
                    <Column dataField="Marca" caption={intl.formatMessage({ id: "ADMINISTRATION.BRAND.BRAND" })} width={"50%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"8%"} alignment={"center"} />
                    <Column type="buttons" width={"10%"} visible={props.showButtons} >
                        <ColumnButton icon="share" hint={intl.formatMessage({ id: "Agregar Modelo" })} onClick={insertarMarcaModelo} />
                        <ColumnButton name="edit" />
                        <ColumnButton name="delete" />
                    </Column>

                    <MasterDetail enabled={true} component={(dta) => (MarcaModeloListPage({
                        data: dta.data,
                        intl,
                        seleccionarMarcaModelo,
                        editarMarcaModelo,
                        eliminarMarcaModelo,
                        focusedRowKeyMarcaModelo: props.focusedRowKeyMarcaModelo,
                        showButtons: props.showButtons
                    }))} />

                </DataGrid>
            </PortletBody>
        </>
    );
};


MarcaListPage.prototype = {
    showButtons: PropTypes.bool,
    modoEdicion: PropTypes.bool,

}
MarcaListPage.defaultProps = {
    showButtons: true,
    modoEdicion: true,
}


//*******************************************/

const MarcaModeloListPage = props => {

    const { intl } = props;
    const [dataSource, setDataSource] = useState([]);

    const editarMarcaModelo = evt => {
        props.editarMarcaModelo(evt.data);
    };

    const eliminarMarcaModelo = evt => {
        props.eliminarMarcaModelo(evt.data);
    };

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    };

    const seleccionarMarcaModelo = evt => {
        if (evt.rowIndex === -1) return;
        if (isNotEmpty(evt.row.data)) props.seleccionarMarcaModelo(evt.row.data);
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

    async function listarMarcaModelo(dataRow) {
        const { IdMarca, IdModelo } = dataRow;
        if (isNotEmpty(IdMarca)) {
            let params = { IdMarca, IdModelo };
            let marcaDetalle = await listarMarcaDetalle(params);
            setDataSource(marcaDetalle);
        }
    }

    useEffect(() => {
        listarMarcaModelo(props.data.data);
    }, []);

    return (

        <>
            <DataGrid
                id="datagrid-detalle"
                dataSource={dataSource}
                showBorders={true}
                focusedRowEnabled={true}
                focusedRowKey={props.focusedRowKeyMarcaModelo}
                keyExpr="RowIndex"
                onCellPrepared={onCellPrepared}
                onEditingStart={editarMarcaModelo}
                onRowRemoving={eliminarMarcaModelo}
                onFocusedRowChanged={seleccionarMarcaModelo}

            >
                <Editing
                    mode="row"
                    useIcons={props.showButtons}
                    allowUpdating={props.showButtons}
                    allowDeleting={props.showButtons}
                    texts={textEditing}
                />
                <Column dataField="RowIndex" caption="#" width={"10%"} />
                <Column dataField="IdModelo" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"15%"} />
                <Column dataField="Modelo" caption={intl.formatMessage({ id: "ADMINISTRATION.MODELBRAND.MODEL" })} width={"50%"} />
                <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"25%"} />
                <Column type="buttons" visible={props.showButtons} width={"10%"} >
                    <ColumnButton name="edit" />
                    <ColumnButton name="delete" />
                </Column>
            </DataGrid>

        </>
    );
};


export default injectIntl(MarcaListPage);
