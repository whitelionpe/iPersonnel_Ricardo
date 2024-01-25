import React from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import HeaderInformation from "../../../../partials/components/HeaderInformation";

const VehiculoDatosListPage = props => {
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

    return (
        <>
            <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
                toolbar={
                    <PortletHeader
                        title={""}
                        toolbar={
                            <PortletHeaderToolbar>
                                <Button
                                    icon="fa fa-plus"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                    onClick={props.nuevoRegistro} 
                                    disabled={!accessButton.nuevo}/>
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
                    dataSource={props.vehiculoDatos}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onCellPrepared={onCellPrepared}
                >
                    <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={accessButton.editar}
                        allowDeleting={accessButton.eliminar}
                        texts={textEditing}
                    />
                    {/* <Column dataField="RowIndex" caption="#" width={"7%"} alignment={"center"} /> */}
                    <Column dataField="TipoDato" caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.DATATYPE" })} width={"20%"} />
                    <Column dataField="Dato" caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.DATA" })} width={"47%"} />
                    <Column dataField="Valor" caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.VALUE" })} width={"20%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} width={"10%"} calculateCellValue={obtenerCampoActivo} width={100} />

                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="TipoDato"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>

                </DataGrid>

            </PortletBody>
        </>
    );
};

export default injectIntl(VehiculoDatosListPage);
