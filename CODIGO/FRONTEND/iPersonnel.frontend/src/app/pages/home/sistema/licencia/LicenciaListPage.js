import React from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
//import { isNotEmpty } from "../../../../../_metronic";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../partials/components/HeaderInformation";



const LicenciaListPage = props => {
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

    const textEditing = {
        confirmDeleteMessage: '',
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
                                        disabled={!accessButton.nuevo}
                                    //disabled={props.modoEdicion && isNotEmpty(props.idCliente) ? false : true} 
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
                    dataSource={props.licencias}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onCellPrepared={onCellPrepared}
                    repaintChangesOnly={true}
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
                    <Column dataField="Modulo" caption={intl.formatMessage({ id: "SYSTEM.MODULE" })} width={"35%"} />
                    <Column dataField="Licencia" caption={intl.formatMessage({ id: "SYSTEM.LICENSE" })} width={"10%"} alignment={"center"} />
                    <Column dataField="FechaFin" caption={intl.formatMessage({ id: "SYSTEM.LICENSE.ENDDATE" })} dataType="date" format="dd/MM/yyyy" width={"10%"} alignment={"center"} />
                    <Column dataField="LicenciaUsada" caption={intl.formatMessage({ id: "SYSTEM.LICENSES.USED" })} width={"20%"} alignment={"center"} />
                    <Column dataField="Saldo" caption={intl.formatMessage({ id: "SYSTEM.LICENSES.BALANCE" })} width={"10%"} alignment={"center"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />

                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="Modulo"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>
                </DataGrid>
            </PortletBody>
        </>
    );
};

LicenciaListPage.propTypes = {
    showHeaderInformation: PropTypes.bool,
};
LicenciaListPage.defaultProps = {
    showHeaderInformation: true,
};

export default injectIntl(LicenciaListPage);
