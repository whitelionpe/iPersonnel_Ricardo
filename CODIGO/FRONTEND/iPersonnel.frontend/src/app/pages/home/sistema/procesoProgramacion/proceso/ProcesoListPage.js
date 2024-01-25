import React from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem, Button as ColumnButton,FilterRow,HeaderFilter,FilterPanel } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { isNotEmpty } from "../../../../../../_metronic";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";



const ProcesoListPage = props => {

    const { intl, accessButton } = props;

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

    function openProgramacion(evt) {
        if (evt.rowIndex === -1) return;
        if (isNotEmpty(evt.row.data)) props.changeTabIndex(4); //props.abrirProgramacion(evt.row.data);
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
                    dataSource={props.procesoClienteData}
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
                        useIcons={true}
                        allowUpdating={accessButton.editar}
                        allowDeleting={accessButton.eliminar}
                        texts={textEditing}
                    />

                  <FilterRow visible={true} showOperationChooser={false} />
                  <HeaderFilter visible={false} />
                  <FilterPanel visible={false} />

                    <Column dataField="IdProceso"
                     caption={intl.formatMessage({ id: "COMMON.CODE" })}
                      width={"10%"} 
                      visible={true} 
                      alignment={"center"}
                      allowSorting={false}
                      allowFiltering={false}
                      allowHeaderFiltering={false}
                      />
                    <Column dataField="Proceso" caption={intl.formatMessage({ id: "SYSTEM.PROCESS" })} width={"30%"} visible={true}
                      allowSorting={false}
                      allowFiltering={true}
                      allowHeaderFiltering={true} 
                    />
                    <Column dataField="TipoProceso" caption={intl.formatMessage({ id: "SYSTEM.PROCESS.TYPE" })} width={"15%"} alignment={"center"}
                      allowSorting={false}
                      allowFiltering={true}
                      allowHeaderFiltering={true} 
                    />
                    <Column dataField="Modulo" caption={intl.formatMessage({ id: "SYSTEM.MODULE" })} width={"15%"}
                     allowSorting={false}
                     allowFiltering={true}
                     allowHeaderFiltering={true} 
                    />
                    <Column dataField="Aplicacion" caption={intl.formatMessage({ id: "SYSTEM.MODULEAPLICATION.APLICATION" })} width={"15%"}
                     allowSorting={false}
                     allowFiltering={true}
                     allowHeaderFiltering={true}
                    />
                    <Column dataType="boolean" dataField="Activo" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"5%"}
                      allowSorting={false}
                      allowFiltering={false}
                      allowHeaderFiltering={false}
                    />
                    <Column type="buttons"  >
                        <ColumnButton
                            icon="clock"
                            hint={intl.formatMessage({ id: "SYSTEM.PROCESS.VIEW" })}
                            onClick={openProgramacion}
                        />
                        <ColumnButton name="edit" />
                        <ColumnButton name="delete" />
                    </Column>


                    <Summary>
                        <TotalItem
                         cssClass="classColorPaginador_"
                            column="Proceso"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>

                </DataGrid>
            </PortletBody>
        </>
    );
};

export default injectIntl(ProcesoListPage);
