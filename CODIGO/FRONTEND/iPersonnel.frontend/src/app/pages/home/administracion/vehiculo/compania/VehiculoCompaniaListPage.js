import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Paging, Pager, FilterRow, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../../_metronic";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";


const VehiculoCompaniaListPage = (props) => {

    const { intl,accessButton } = props;
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

    return <>

        <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
            toolbar={
                <PortletHeader
                    title={""}
                    toolbar={
                        <PortletHeaderToolbar>
                            <Button
                                icon="plus"
                                type="default"
                                hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                onClick={props.nuevoRegistro}
                                disabled={!accessButton.nuevo} 
                            />
                            &nbsp;
                            <Button
                                icon="fa fa-times-circle"
                                type="normal"
                                hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                                onClick={props.cancelarEdicion}
                            />
                        </PortletHeaderToolbar>
                    }
                />
            } />

        <PortletBody>
            <DataGrid
                dataSource={props.vehiculoCompania}
                showBorders={true}
                focusedRowEnabled={true}
                keyExpr="RowIndex"
                onEditingStart={editarRegistro}
                onRowRemoving={eliminarRegistro}
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
                    allowUpdating={accessButton.editar}
                    allowDeleting={accessButton.eliminar}
                    texts={textEditing}
                />
                <FilterRow visible={false} />
                <Column dataField="IdSecuencial" caption="IdSecuencial" visible={false} />
                <Column dataField="IdCompania" caption="IdCompania" visible={false} />
                <Column dataField="Compania" caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.COMPANY" })} alignment={"left"} width={"55%"} allowSorting={false} allowSearch={false} allowFiltering={false} />
                <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.STARTDATE" })} width={"15%"} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
                <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.ENDDATE" })} width={"15%"} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
                <Column dataType="boolean" caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.STATE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />
                <Paging defaultPageSize={10} />
                <Pager showPageSizeSelector={false} />

                <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="Compania"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>

            </DataGrid>
        </PortletBody>
    </>
}


export default injectIntl(VehiculoCompaniaListPage);
