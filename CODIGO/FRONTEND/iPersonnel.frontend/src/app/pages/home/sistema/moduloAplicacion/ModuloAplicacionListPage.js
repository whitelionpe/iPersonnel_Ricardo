import React, { useEffect, useState } from "react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { DataGrid, Column, Editing, Selection, Summary, TotalItem } from "devextreme-react/data-grid";
import { listar } from '../../../../api/sistema/moduloAplicacion.api';
import { injectIntl } from "react-intl";
import { isNotEmpty } from "../../../../../_metronic";

const ModuloAplicacionListPage = props => {

    const { intl } = props;
    const [dataSource, setDataSource] = useState([]);

    const editarRegistroAplicacion = evt => {
        props.editarRegistroAplicacion(evt.data);
    };

    const eliminarRegistroAplicacion = evt => {
        evt.cancel = true;
        props.eliminarRegistroAplicacion(evt.data);
    };

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    };

    /*const seleccionarRegistroAplicacion = evt => {
        props.seleccionarRegistroAplicacion(evt.data);
    };*/

    const seleccionarRegistroAplicacion = evt => {

        if (evt.rowIndex === -1) return;
        if (isNotEmpty(evt.row.data)) props.seleccionarRegistroAplicacion(evt.row.data);

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

    async function listarModuloAplicacion(dataRow) {
        const { IdModulo } = dataRow;
        let params = { IdModulo, IdAplicacion: "%" };
        let moduloAplicacion = await listar(params);
        setDataSource(moduloAplicacion);
    }

    useEffect(() => {
        listarModuloAplicacion(props.data.data);
    }, []);

    return (

        <>
            <DataGrid
                dataSource={dataSource}
                showBorders={true}
                columnAutoWidth={true}
                focusedRowEnabled={true}
                focusedRowKey={props.focusedRowKeyAplicacion}
                keyExpr="RowIndex"
                onCellPrepared={onCellPrepared}
                onEditingStart={editarRegistroAplicacion}
                onRowRemoving={eliminarRegistroAplicacion}
                onFocusedRowChanged={seleccionarRegistroAplicacion}

            >
                <Editing
                    mode="row"
                    useIcons={true}
                    allowUpdating={true}
                    allowDeleting={true}
                    texts={textEditing}
                />
                <Selection mode="single" />
                {/*  <Column dataField="RowIndex" caption="#" width={40} /> */}
                <Column dataField="IdModulo" caption="IdModulo" visible={false} />
                <Column dataField="IdAplicacion" caption={intl.formatMessage({ id: "COMMON.CODE" })} visible={true} />
                <Column dataField="Aplicacion" caption={intl.formatMessage({ id: "SYSTEM.MODULEAPLICATION.APLICATION" })} visible={true} />
                <Column dataField="Modulo" caption={intl.formatMessage({ id: "SYSTEM.MODULEAPLICATION.MODULE" })} visible={false} />
                <Column dataType="boolean" caption={intl.formatMessage({ id: "SYSTEM.MODULEAPLICATION.MENU.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"8%"} />


                <Summary>
                    <TotalItem
                    cssClass="classColorPaginador_"
                        column="IdAplicacion"
                        summaryType="count"
                        displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                    />
                </Summary>

            </DataGrid>

        </>
    );
};

export default injectIntl(ModuloAplicacionListPage);
