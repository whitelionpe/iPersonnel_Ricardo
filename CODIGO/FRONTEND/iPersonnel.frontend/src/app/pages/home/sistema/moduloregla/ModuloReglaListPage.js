import React from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing , Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../partials/components/HeaderInformation";


const ModuloReglaListPage = props => {

    const { intl,accessButton } = props;

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
    const seleccionarRegistro = evt => {
        props.seleccionarRegistro(evt.data);
    };
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
                    dataSource={props.reglas}
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
                    {/* <Column dataField="RowIndex" caption="#" width={"8%"} alignment={"center"} /> */}
                    <Column dataField="Modulo" caption={intl.formatMessage({ id: "SYSTEM.MODULERULES" })} width={"20%"} visible={false} />
                    <Column dataField="IdAplicacion" width={"20%"} visible={false} />
                    <Column dataField="IdRegla" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"20%"} />
                    <Column dataField="Regla" caption={intl.formatMessage({ id: "SYSTEM.MODULERULE.RULE" })} width={"70%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />

                    <Summary>
                        <TotalItem
                         cssClass="classColorPaginador_"
                            column="IdRegla"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>

                </DataGrid>
            </PortletBody>
        </>
    );
};
ModuloReglaListPage.propTypes = {
    showHeaderInformation: PropTypes.bool,
};
ModuloReglaListPage.defaultProps = {
    showHeaderInformation: true,
};

export default injectIntl(ModuloReglaListPage);
