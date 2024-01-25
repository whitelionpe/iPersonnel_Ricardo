import React, { useRef } from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem, Paging, Pager, FilterRow, Button as ButtonDataGrid } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { isNotEmpty, exportExcelDataGrid } from "../../../../../_metronic";


const ModuloListPage = props => {

    const { intl, listarModuloTreeView, exportModuloExcel } = props;
    const dataGridRef = useRef(null);

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
        //console.log("seleccionarRegistro.x");
        if (evt.rowIndex === -1) return;
        //console.log("seleccionarRegistro",evt.row.data);
        if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);//props.seleccionarRegistro(evt.data)
    }

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

    const treeView = evt => {
        listarModuloTreeView();
    };

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
                                    />
                                          &nbsp;
                                    <Button
                                        icon="fa fa-file-excel"
                                        type="default"
                                        hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
                                        onClick={exportModuloExcel}
                                        disabled={!props.focusedRowKey}
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
                    dataSource={props.campamentosModulo}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="IdModulo"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onFocusedRowChanged={seleccionarRegistro}
                    focusedRowKey={props.focusedRowKey}
                    onCellPrepared={onCellPrepared}
                    ref={dataGridRef}
                    repaintChangesOnly={true}
                >
                    <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={true}
                        allowDeleting={true}
                        texts={textEditing}
                    />
                    <FilterRow visible={true} showOperationChooser={false} />
                    <Column dataField="IdModulo" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"15%"} alignment={"center"} />
                    <Column dataField="Modulo" caption={intl.formatMessage({ id: "CAMP.MODULE" })} width={"40%"} />
                    <Column dataField="TipoModulo" caption={intl.formatMessage({ id: "CAMP.MODULE.MODULETYPE" })} width={"25%"} alignment={"center"} />
                    <Column dataField="NumeroHabitacion" caption={intl.formatMessage({ id: "CAMP.CAMP.BEDROOMS" })} width={"10%"} format="#,###" alignment={"center"} allowFiltering={false} allowHeaderFiltering={false} />
                    <Column dataField="NumeroHabitacionCama" caption={intl.formatMessage({ id: "CAMP.CAMP.BEDS" })} width={"10%"} format="#,###" alignment={"center"} allowFiltering={false} allowHeaderFiltering={false} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />
                    <Column dataField="IdCampamento" visible={false} />
                    <Column type="buttons" width={110}>
                        <ButtonDataGrid hint={intl.formatMessage({ id: "COMMON.DETAIL" })} icon="info" visible={true} onClick={treeView}/>
                        <ButtonDataGrid name="edit" />
                        <ButtonDataGrid name="delete" />
                    </Column>
                    <Paging defaultPageSize={20} />
                    <Pager showPageSizeSelector={false} />
                    <Summary>
                        <TotalItem cssClass="classColorPaginador_" column="IdModulo" displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL" })}`} />
                        <TotalItem cssClass="classColorPaginador_" column="NumeroHabitacion" summaryType="sum" displayFormat={`{0}`} valueFormat={"#,###"} alignment={"center"} />
                        <TotalItem cssClass="classColorPaginador_" column="NumeroHabitacionCama" summaryType="sum" displayFormat={`{0}`} valueFormat={"#,###"} alignment={"center"} />
                    </Summary>

                </DataGrid>
            </PortletBody>
        </>
    );
};

ModuloListPage.propTypes = {
    showHeaderInformation: PropTypes.bool,
};
ModuloListPage.defaultProps = {
    showHeaderInformation: true,
};

export default injectIntl(ModuloListPage);
