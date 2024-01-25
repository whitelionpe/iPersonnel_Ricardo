import React from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem,Button as ColumnButton} from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../_metronic";
import HeaderInformation from "../../../../partials/components/HeaderInformation";

const ComedorServicioCostoListPage = props => {

    const { intl, accessButton } = props;

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
        evt.cancel = true;
        props.eliminarRegistro(evt.data);
    };
    const obtenerCampoEspecial = rowData => {
        return rowData.Especial === "S";
    }
    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    }

    const textEditing = {
        confirmDeleteMessage:'',
        editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
        deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
    };

    // function onCellPrepared(e) {
    //     if (e.rowType === 'data') {
    //         if (e.data.Activo === 'N') {
    //             e.cellElement.style.color = 'red';
    //         }
    //     }
    // }

    return (
        <>
            <HeaderInformation data={props.getInfo()}  visible={true}  labelLocation={'left'} colCount={6}
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
                    dataSource={props.comedoresServicio}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    // onCellPrepared={onCellPrepared}
                    repaintChangesOnly={true}
                >
                    <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={accessButton.editar}
                        allowDeleting={accessButton.eliminar}
                        texts={textEditing}
                    />
                    
                    <Column dataField="IdCategoriaCosto" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"15%"} alignment={"center"}/>
                    <Column dataField="PorcentajeAsumidoEmpresa" caption={intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE" })} width={"30%"} />
                    <Column dataField="PorcentajeAsumidoTrabajador" caption={intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.COST" })} width={"15%"}  alignment={"center"} />
   

                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="IdCategoriaCosto"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({id:"COMMON.TOTAL.ROW"}) } {0}`}
                        />                      
                    </Summary>


                </DataGrid>
            </PortletBody>
        </>
    );
};

export default injectIntl(ComedorServicioCostoListPage);
