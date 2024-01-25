import React from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import HeaderInformation from "../../../../partials/components/HeaderInformation";

const GrupoServicioListPage = props => {

    const { intl, accessButton} = props;

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
        evt.cancel = true;
        props.eliminarRegistro(evt.data);
    };
    const obtenerCampoLunes = rowData => {
        return rowData.Lunes === "S";
    }
    const obtenerCampoMartes = rowData => {
        return rowData.Martes === "S";
    }
    const obtenerCampoMiercoles = rowData => {
        return rowData.Miercoles === "S";
    }
    const obtenerCampoJueves = rowData => {
        return rowData.Jueves === "S";
    }
    const obtenerCampoViernes = rowData => {
        return rowData.Viernes === "S";
    }
    const obtenerCampoSabado = rowData => {
        return rowData.Sabado === "S";
    }
    const obtenerCampoDomingo = rowData => {
        return rowData.Domingo === "S";
    }
    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
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

    return (
        <>

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
                    dataSource={props.grupoServicios}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onCellPrepared={onCellPrepared}
                    // repaintChangesOnly={true}
                >
                    <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={accessButton.editar}
                        allowDeleting={accessButton.eliminar}
                        texts={textEditing}
                    />
                    
                    
                    <Column dataField="Comedor" caption={intl.formatMessage({ id: "CASINO.DINNINGROOM" })} width={"10%"}  alignment={"center"}/>
                    <Column dataField="Servicio" caption={intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE" })} width={"10%"}   />
                    <Column dataField="Grupo" caption={intl.formatMessage({ id: "ACCESS.PERSON.GRUPO" })} visible={false} />

                    <Column caption={intl.formatMessage({ id: "CASINO.GROUP.SERVICE.SCHEDULE" })} alignment={"center"}>
                        <Column dataField="HoraInicio" caption={intl.formatMessage({ id: "ACCESS.PERSON.GRUPO.STARTTIME" })} width={"8%"} alignment={"center"} />
                        <Column dataField="HoraFin" caption={intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.ENDTIME" })} width={"8%"} alignment={"center"} />
                    </Column>

                    <Column dataType="boolean" caption={intl.formatMessage({ id: "CASINO.GROUP.SERVICE.MONDAY" })} calculateCellValue={obtenerCampoLunes} width={"6%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "CASINO.GROUP.SERVICE.TUESDAY" })} calculateCellValue={obtenerCampoMartes} width={"7%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "CASINO.GROUP.SERVICE.WEDNESDAY" })} calculateCellValue={obtenerCampoMiercoles} width={"8%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "CASINO.GROUP.SERVICE.THURSDAY" })} calculateCellValue={obtenerCampoJueves} width={"7%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "CASINO.GROUP.SERVICE.FRIDAY" })} calculateCellValue={obtenerCampoViernes} width={"7%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "CASINO.GROUP.SERVICE.SATURDAY" })} calculateCellValue={obtenerCampoSabado} width={"7%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "CASINO.GROUP.SERVICE.SUNDAY" })} calculateCellValue={obtenerCampoDomingo} width={"9%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"7%"} />

                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="Comedor"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({id:"COMMON.TOTAL.ROW"}) } {0}`}
                        />                      
                    </Summary>

                </DataGrid>
            </PortletBody>
        </>
    );
};

export default injectIntl(GrupoServicioListPage);
