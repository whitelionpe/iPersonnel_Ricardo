import React from "react";
import { DataGrid, Column, Editing, Summary, TotalItem  } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../partials/components/HeaderInformation";

const CaracteristicaDetalleListPage = props => {

    const { intl } = props;

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
        console.log("editarRegistro", evt.data);
    };

    const eliminarRegistro = evt => {      
         evt.cancel = true;
        props.eliminarRegistro(evt.data);
    };

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    }

    const seleccionarRegistro = evt => {
        console.log("seleccionarRegistro", evt.data);
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
                                    <Button icon="plus" type="default"  onClick={props.nuevoRegistro} />
                                </PortletHeaderToolbar>
                            </PortletHeaderToolbar>
                        }
                    />

                } />

            <PortletBody>
                <DataGrid
                    dataSource={props.caracteristicaDetalles}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onRowClick={seleccionarRegistro}
                    onCellPrepared={onCellPrepared}
                    focusedRowKey={props.focusedRowKey}
                    repaintChangesOnly={true}
                >
                    <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={true}
                        allowDeleting={true}
                        texts={textEditing}
                    />
                    {/* <Column dataField="RowIndex" caption="#" width={40} /> */}
                    <Column dataField="IdCaracteristicaDetalle" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"20%"} />
                    <Column dataField="CaracteristicaDetalle" caption={intl.formatMessage({ id: "ADMINISTRATION.CHARACTERISTIC.DETAIL" })}  width={"70%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo}  width={"10%"} />


                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="IdCaracteristicaDetalle"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>

                </DataGrid>
            </PortletBody>
        </>
    );
};

CaracteristicaDetalleListPage.propTypes = {
    showHeaderInformation: PropTypes.bool,
};
CaracteristicaDetalleListPage.defaultProps = {
    showHeaderInformation: true,
};
export default injectIntl(CaracteristicaDetalleListPage);
