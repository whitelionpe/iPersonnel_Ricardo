import React from "react";
import { DataGrid, Column, Editing, Button as ColumnButton, MasterDetail,  Summary, TotalItem} from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import { isNotEmpty } from "../../../../../../_metronic";
import { confirm, custom } from "devextreme/ui/dialog";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import ContratoDivisionOperadorListPage from "./ContratoDivisionOperadorListPage";
import { Options } from "devextreme-react/autocomplete";

const ContratoSubcontratistaListPage = props => {

    const { intl ,accessButton} = props;

    const editarRegistro = evt => {
        props.editarRegistro(evt.row.data);
    };

    const eliminarRegistro = evt => {
        props.eliminarRegistro(evt.row.data, false, 0);
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

    const textEditing = {
        confirmDeleteMessage: '',
        editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
        deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
    }


    //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

    const editarRegistroOperador = (evt) => {
        props.editarRegistroOperador(evt);
    }
    const eliminarRegistroOperador = (data) => {
        props.eliminarRegistroOperador(data);
    }


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
                    dataSource={props.ContratoDivision}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onCellPrepared={onCellPrepared}
                >

                    <Column dataField="RowIndex" caption="#" width={25} alignment={"center"} />
                    <Column dataField="Division" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.DIVISION.NAME" })} width={"80%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} alignment={"center"} />
                    <Column type="buttons" width={105} visible={props.showButtons} >
                        <ColumnButton icon="fa fa-user-plus" hint={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.OPERATOR.ADD", })} onClick={props.agregarOperador} />
                        <ColumnButton icon="edit" hint={intl.formatMessage({ id: "ACTION.EDIT", })}
                         onClick={editarRegistro} 
                         visible={accessButton.editar}
                         />
                        <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} 
                        onClick={eliminarRegistro} 
                        visible={accessButton.eliminar}
                        />
                    </Column>

                    <MasterDetail enabled={true} component={(opt) => ContratoDivisionOperadorListPage({
                        ContratoDivision: opt.data.data,
                        intl,
                        editarRegistro: editarRegistroOperador,
                        eliminarRegistro: eliminarRegistroOperador,
                    })} />

                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="Division"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>

                </DataGrid>
            </PortletBody>
        </>
    );
};

export default injectIntl(ContratoSubcontratistaListPage);
