import React from "react";
import { DataGrid, Column, Editing } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";

const PersonaExoneracionListPage = props => {

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
    }

    const seleccionarRegistro = evt => {
        props.seleccionarRegistro(evt.data);
    }

    const textEditing = {
        confirmDeleteMessage:'',
        editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
        deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
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
                                    <Button icon="plus"
                                        type="default"
                                        hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                        onClick={props.nuevoRegistro}
                                        disabled={!accessButton.nuevo}  />
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
                    dataSource={props.personaExoneracionData}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onRowClick={seleccionarRegistro}
                    focusedRowKey={props.focusedRowKey}
                >
                    <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={accessButton.editar}
                        allowDeleting={accessButton.eliminar}
                        texts={textEditing}
                    />
                    <Column dataField="RowIndex" caption="#" width={40} />

                    <Column dataField="IdSecuencial" caption="IdSecuencial" visible={false} />
                    <Column dataField="IdExoneracion" caption={intl.formatMessage({ id: "COMMON.CODE" })} visible={false} />
                    <Column dataField="Motivo" caption={intl.formatMessage({ id: "ACCESS.PERSON.EXONERACION.REASON" })} />
                    <Column dataField="Observacion" caption={intl.formatMessage({ id: "ACCESS.PERSON.EXONERACION.OBSERVATION" })} />
                    <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
                    <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
                </DataGrid>

            </PortletBody>

        </>
    );
};

PersonaExoneracionListPage.propTypes = {
    showHeaderInformation: PropTypes.bool,
};
PersonaExoneracionListPage.defaultProps = {
    showHeaderInformation: true,
};

export default injectIntl(PersonaExoneracionListPage);
