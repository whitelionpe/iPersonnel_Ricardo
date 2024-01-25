
import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { DataGrid, Column, Editing,Summary, TotalItem } from "devextreme-react/data-grid";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";

const CredencialListPage = props => {
    const { intl, accessButton } = props;

    const editarRegistro = evt => {
      props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
      evt.cancel = true;
      props.eliminarRegistro(evt.data);
    };
  

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
    }


    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    };

    const obtenerCampoImpreso = rowData => {
        return rowData.Impreso === "S";
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
            
                <div className="row">
                    <DataGrid
                        dataSource={props.vehiculosCredencial}
                        showBorders={true}
                        keyExpr="RowIndex"
                        focusedRowEnabled={true}
                        //onRowClick={seleccionarRegistro}
                        //focusedRowKey={props.focusedRowKey}
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

                        <Column
                            dataField="Credencial"
                            caption={intl.formatMessage({ id: "IDENTIFICATION.MANAGEMENT.CREDENTIAL" })}
                            allowSorting={true}
                            allowHeaderFiltering={false}
                            width={"20%"}

                        />
                        <Column
                            dataField="TipoCredencial"
                            caption={intl.formatMessage({ id: "IDENTIFICATION.MANAGEMENT.TYPECREDENTIAL" })}
                            allowSorting={true}
                            allowFiltering={false}
                            allowHeaderFiltering={true}
                            alignment={"center"}
                            width={"20%"}
                        >
                        </Column>
                        <Column dataField="FechaInicio"
                            caption={intl.formatMessage({ id: "IDENTIFICATION.MANAGEMENT.STARTDATE" })}
                            dataType="date" format="dd/MM/yyyy"
                            allowHeaderFiltering={false}
                            width={"20%"}
                            alignment={"center"}
                        />
                        <Column
                            dataField="FechaFin"
                            caption={intl.formatMessage({ id: "IDENTIFICATION.MANAGEMENT.ENDDATE" })}
                            dataType="date" format="dd/MM/yyyy"
                            allowSorting={true}
                            allowFiltering={false}
                            allowHeaderFiltering={true}
                            alignment={"center"}
                            width={"20%"}
                        >
                        </Column>

                        <Column dataField="Impreso"
                            caption={intl.formatMessage({ id: "IDENTIFICATION.MANAGEMENT.PRINTED" })}
                            calculateCellValue={obtenerCampoImpreso}
                            allowSorting={true}
                            allowFiltering={false}
                            allowHeaderFiltering={false}
                            width={"10%"}
                        />

                        <Column dataField="Activo"
                            caption={intl.formatMessage({ id: "COMMON.ACTIVE" })}
                            calculateCellValue={obtenerCampoActivo}
                            allowSorting={true}
                            allowFiltering={false}
                            allowHeaderFiltering={false}
                            width={"10%"}
                        />

                        <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="Credencial"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>

                    </DataGrid>
                </div>
            </PortletBody>
        </>
    );
};



export default injectIntl(CredencialListPage);
