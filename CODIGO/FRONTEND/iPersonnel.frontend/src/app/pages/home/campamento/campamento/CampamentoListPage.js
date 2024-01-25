import React, {useRef} from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem, Button as ButtonDataGrid } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { isNotEmpty, exportExcelDataGrid } from "../../../../../_metronic";

const CampamentoListPage = props => {

    const { intl, accessButton, listarCampamentoTreeView, exportExcel } = props;
    const dataGridRef = useRef(null);

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
        evt.cancel = true;
        props.eliminarRegistro(evt.data);
    };

    /* const obtenerCampoLiberarReserva = rowData => {
        return rowData.LiberarReserva === "S";
    }; */

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

    const seleccionarRegistroDblClick = evt => {
        if (evt.data === undefined) return;
        if (isNotEmpty(evt.data)) {
            props.verRegistroDblClick(evt.data);
        };
    }

    const textEditing = {
        confirmDeleteMessage: '',
        editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
        deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
    };

    const treeView = evt => {
        listarCampamentoTreeView();
    };

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
                                onClick={props.nuevoRegistro}
                                disabled={!accessButton.nuevo}
                            />
                            &nbsp;
                            <Button
                                icon="fa fa-file-excel"
                                type="default"
                                hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
                                onClick={exportExcel}
                                disabled={!props.focusedRowKey}
                            />
                        </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                }
            />
            <PortletBody>
                <DataGrid
                    dataSource={props.campamentos}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onFocusedRowChanged={seleccionarRegistro}
                    focusedRowKey={props.focusedRowKey}
                    onCellPrepared={onCellPrepared}
                    repaintChangesOnly={true}
                    onRowDblClick={seleccionarRegistroDblClick}
                    ref={dataGridRef}
                >
                    <Editing
                        mode="row"
                        useIcons={true}
                        //allowUpdating={true}
                        //allowDeleting={true}
                        allowUpdating={accessButton.editar}
                        allowDeleting={accessButton.eliminar}
                        texts={textEditing}
                    />
                    {/*} <Column dataField="RowIndex" caption="#" width={"10%"} alignment={"center"} />*/}
                    <Column dataField="IdCampamento" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} alignment={"center"} />
                    <Column dataField="Campamento" caption={intl.formatMessage({ id: "CAMP.CAMP.HOTELS" })} width={"20%"} />
                    <Column dataField="NumeroModulo" caption={intl.formatMessage({ id: "CAMP.CAMP.MODULES" })} width={"20%"} format="#,###"  alignment={"center"} />
                    <Column dataField="NumeroHabitacion" caption={intl.formatMessage({ id: "CAMP.CAMP.BEDROOMS" })} width={"20%"} format="#,###"  alignment={"center"} />
                    <Column dataField="NumeroHabitacionCama" caption={intl.formatMessage({ id: "CAMP.CAMP.BEDS" })} width={"20%"} format="#,###"  alignment={"center"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />
                    <Column type="buttons" width={110}>
                        <ButtonDataGrid hint={intl.formatMessage({ id: "COMMON.DETAIL" })} icon="info" visible={true} onClick={treeView}/>
                        <ButtonDataGrid name="edit" />
                        <ButtonDataGrid name="delete" />
                    </Column>
                    {/* <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="IdCampamento"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>  */}
                    <Summary>
                        <TotalItem cssClass="classColorPaginador_" column="IdCampamento" displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL" })}`}/>
                        <TotalItem cssClass="classColorPaginador_" column="NumeroModulo" summaryType="sum" displayFormat={`{0}`} valueFormat={"#,###"} alignment={"center"}/>
                        <TotalItem cssClass="classColorPaginador_" column="NumeroHabitacion" summaryType="sum" displayFormat={`{0}`} valueFormat={"#,###"} alignment={"center"}/>
                        <TotalItem cssClass="classColorPaginador_" column="NumeroHabitacionCama" summaryType="sum" displayFormat={`{0}`} valueFormat={"#,###"} alignment={"center"}/>                   
                    </Summary>


                </DataGrid>
            </PortletBody>
        </>
    );
};

export default injectIntl(CampamentoListPage);
