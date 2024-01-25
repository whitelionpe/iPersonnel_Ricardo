import React, { useRef } from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem, Paging, Pager, FilterRow } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { isNotEmpty, exportExcelDataGrid } from "../../../../../_metronic";


const ModuloAplicacionReporteListPage = props => {
  
  console.log("ModuloAplicacionReporteListPage|props:",props);

    const { intl } = props;
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
        confirmDeleteMessage: '',
        editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
        deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
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
                                        type="normal"
                                        hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
                                        onClick={() => {
                                            let title = intl.formatMessage({ id: "COMMON.REPORT" });
                                            let refDataGrid = dataGridRef.current.instance;
                                            let fileName = intl.formatMessage({ id: "COMMON.REPORT" });
                                            exportExcelDataGrid(title, refDataGrid, fileName);
                                        }}
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
                    dataSource={props.reportes}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onFocusedRowChanged={seleccionarRegistro}
                    focusedRowKey={props.focusedRowKey}
                    repaintChangesOnly={true}
                    onCellPrepared={onCellPrepared}
                    ref={dataGridRef}
                >
                    <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={true}
                        allowDeleting={true}
                        texts={textEditing}
                    />
                    <Column dataField="IdReporte" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} alignment={"center"} />
                    <Column dataField="Reporte" caption={intl.formatMessage({ id: "COMMON.REPORT" })} width={"30%"} />
                    <Column dataField="Objeto" caption={intl.formatMessage({ id: "SYSTEM.MENU.OBJECT.OBJECT" })} width={"40%"} alignment={"left"} />
                    <Column dataField="Orden" caption={intl.formatMessage({ id: "SYSTEM.MENU.ORDER" })} width={"10%"} alignment={"center"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />

                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="IdReporte"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>

                </DataGrid>
            </PortletBody>
        </>
    );
};

ModuloAplicacionReporteListPage.propTypes = {
    showHeaderInformation: PropTypes.bool,
};
ModuloAplicacionReporteListPage.defaultProps = {
    showHeaderInformation: true,
};

export default injectIntl(ModuloAplicacionReporteListPage);
