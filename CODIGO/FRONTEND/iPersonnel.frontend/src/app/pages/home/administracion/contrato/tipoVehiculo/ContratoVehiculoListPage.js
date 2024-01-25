import React, { useState } from "react";
import { DataGrid, Column, Editing, Button as ColumnButton, MasterDetail, Summary, TotalItem } from "devextreme-react/data-grid";

import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";

import { confirm, custom } from "devextreme/ui/dialog";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { isNotEmpty } from "../../../../../../_metronic";

import { handleErrorMessages, handleInfoMessages } from "../../../../../store/ducks/notify-messages";


const ContratoVehiculoListPage = props => {

    const { intl,accessButton } = props;

    const editarRegistro = evt => {
        props.editarRegistro(evt.row.data);
    };

    const eliminarRegistro = evt => {
        let data = evt.row.data;
        props.eliminarRegistro(data);
    };

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    };


    function onCellPrepared(e) {
        if (e.rowType === 'data') {
            if (e.data.Activo === 'N') {
                e.cellElement.style.color = 'red';
            }
        }
    }

    //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

    return (
        <>

            {props.showButton && (
                <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={3}
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

                    } />)}


            <PortletBody>
                <DataGrid
                    dataSource={props.UnidadesOrganizativas}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onCellPrepared={onCellPrepared}
                >
                    <Column dataField="RowIndex" caption="#" width={25} alignment={"center"} />
                    <Column dataField="IdTipoVehiculo" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"25%"} alignment={"left"} />
                    <Column dataField="TipoVehiculo" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.TYPEVEHICLE" })} width={"40%"} alignment={"left"} />
                    <Column dataField="Dotacion" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.ENDOWMENT" })} width={"25%"} alignment={"center"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"8%"} />
                    <Column type="buttons" width={95} visible={props.showButtons} >
                        <ColumnButton icon="edit" hint={intl.formatMessage({ id: "ACTION.EDIT", })} 
                        onClick={editarRegistro} 
                        visible={accessButton.editar}
                        />
                        <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} 
                        onClick={eliminarRegistro} 
                        visible={accessButton.eliminar}
                        />
                    </Column>

                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="IdTipoVehiculo"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({id:"COMMON.TOTAL.ROW"}) } {0}`}
                        />                      
                    </Summary>

                </DataGrid>
            </PortletBody>


        </>
    );
};

export default injectIntl(ContratoVehiculoListPage);
