import React from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../partials/components/HeaderInformation";


const HabitacionCamaListPage = props => {

    const { intl } = props;

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
                    dataSource={props.habitacionesCama}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onCellPrepared = { onCellPrepared }
                >
                    <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={true}
                        allowDeleting={true}
                        texts={textEditing}
                    />
                   {/*  <Column dataField="RowIndex" caption="#" width={"10%"} alignment={"center"} /> */}
                    <Column dataField="IdCama" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"20%"} alignment={"center"} />
                    <Column dataField="Cama" caption={intl.formatMessage({ id: "CAMP.ROOM.BED" })} width={"40%"} />
                    <Column dataField="TipoCama" caption={intl.formatMessage({ id: "CAMP.ROOM.BED.BEDTYPE" })} width={"20%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />
                    
                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="IdCama"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({id:"COMMON.TOTAL.ROW"}) } {0}`}
                        />                      
                    </Summary>

                </DataGrid>
            </PortletBody>
        </>
    );
};

HabitacionCamaListPage.propTypes = {
    showHeaderInformation: PropTypes.bool,
};
HabitacionCamaListPage.defaultProps = {
    showHeaderInformation: true,
};
export default injectIntl(HabitacionCamaListPage);
