import React from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../../_metronic";
import PropTypes from "prop-types";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";


const ProgramacionListPage = props => {
    const { intl } = props;

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
        evt.cancel = true;
        props.eliminarRegistro(evt.data);
    };

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    };

    const obtenerCampoUnaEjecucion = rowData => {
        return rowData.UnaEjecucion === "S";
    }

    const seleccionarRegistro = evt => {
        if (evt.rowIndex === -1) return;
        if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);

    };

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
            <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
                toolbar={
                    <PortletHeader
                        title={""}
                        toolbar={
                            <PortletHeaderToolbar>
                                <PortletHeaderToolbar>
                                    <Button
                                        icon="plus"
                                        type="default"
                                        hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                        onClick={props.nuevoRegistro}
                                        disabled={!props.accessButton.nuevo} />
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
                    dataSource={props.programaciones}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    focusedRowKey={props.focusedRowKey}
                    onCellPrepared={onCellPrepared}
                    onFocusedRowChanged={seleccionarRegistro}
                    repaintChangesOnly={true}
                >
                    <Editing
                        mode="row"
                        useIcons={props.showButtons}
                        allowUpdating={props.showButtons}
                        allowDeleting={props.showButtons}
                        texts={textEditing}
                    />

                    <Column dataField="IdProgramacion" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} alignment={"center"} />
                    <Column dataField="Programacion" caption={intl.formatMessage({ id: "SYSTEM.PROCESS.PROGRAMMING" })} width={"40%"} />
                    {/* <Column dataField="Frecuencia" caption={intl.formatMessage({ id: "SYSTEM.PROCESS.FRECUENCY" })} width={"20%"} /> */}
                    <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "CASINO.PERSON.GROUP.STARTDATE" })} dataType="date" format="dd/MM/yyyy" width={"10%"} alignment={"center"} />
                    <Column dataField="FechaFin" caption={intl.formatMessage({ id: "CASINO.PERSON.GROUP.ENDDATE" })} dataType="date" format="dd/MM/yyyy" width={"10%"} alignment={"center"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "SYSTEM.PROCESS.PERFORMANCE" })} calculateCellValue={obtenerCampoUnaEjecucion} width={"15%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />
                    <Summary>
                        <TotalItem
                         cssClass="classColorPaginador_"
                            column="IdProgramacion"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>

                </DataGrid>

            </PortletBody>
        </>
    );
};
ProgramacionListPage.prototype = {
    showButtons: PropTypes.bool,
    showHeaderInformation: PropTypes.bool,
}
ProgramacionListPage.defaultProps = {
    showButtons: true,
    showHeaderInformation: true,
}


export default injectIntl(WithLoandingPanel(ProgramacionListPage));
