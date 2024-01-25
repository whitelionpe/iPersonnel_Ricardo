import React from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import PropTypes from "prop-types";
import { isNotEmpty } from "../../../../../../_metronic";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";

const CompanyCharacteristicListPage = props => {
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

    function onCellPrepared(e) {
        if (e.rowType === "data") {
            if (e.data.Activo === "N") {
                e.cellElement.style.color = "red";
            }
        }
    }

    const textEditing = {
        confirmDeleteMessage: '',
        editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
        deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
    };

    return (
        <>
            <HeaderInformation
                data={props.getInfo()}
                visible={props.showHeaderInformation}
                labelLocation={'left'}
                colCount={6}
                toolbar={
                    <PortletHeader
                        title={""}
                        toolbar={
                            <PortletHeaderToolbar>
                                <Button icon="plus" type="default"
                                    hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                    onClick={props.nuevoRegistro}
                                    disabled={!accessButton.nuevo} />
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
                }
            />

            <PortletBody>

                <DataGrid
                    dataSource={props.personaCaracteristicas}
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
                    <Column dataField="Caracteristica" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.CHARACTERISTIC" })} width={"30%"} />
                    <Column dataField="CaracteristicaDetalle" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.VALUE" })} width={"20%"} />
                    <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })} width={"15%"} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
                    <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })} width={"15%"} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} width={"10%"} calculateCellValue={obtenerCampoActivo} />

                    <Summary>
                        <TotalItem
                            cssClass="classColorPaginador_"
                            column="Caracteristica"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>

                </DataGrid>

            </PortletBody>

        </>
    );
};
CompanyCharacteristicListPage.propTypes = {
    showHeaderInformation: PropTypes.bool,
};
CompanyCharacteristicListPage.defaultProps = {
    showHeaderInformation: true,
};

export default injectIntl(CompanyCharacteristicListPage);
