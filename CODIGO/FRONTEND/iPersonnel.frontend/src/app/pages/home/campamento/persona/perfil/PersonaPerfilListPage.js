import React from "react";
import { DataGrid, Column, Editing, Selection, MasterDetail, Button as ColumnButton, } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { injectIntl } from "react-intl";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";

const PersonaPerfilListPage = props => {

    const { intl, accessButton } = props;

    const editarRegistro = evt => {
        props.editarRegistro(evt.row.data);
    };

    const eliminarRegistro = evt => {
        // evt.cancel = true;
        props.eliminarRegistro(evt.row.data);
    };
    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    }

    const seleccionarRegistro = evt => { 
        props.seleccionarRegistro(evt.row.data);
    }

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

    const visibleButtons = (e) => {
        if (e.row !== undefined && e.row.data !== null) {
            let { FlReadOnly } = e.row.data;

            if (!!FlReadOnly && FlReadOnly === "S") {
                return false;
            }
        }
        return true;
    }

    const visibleReadOnly = (e) => {
        if (e.row !== undefined && e.row.data !== null) {
            let { FlReadOnly } = e.row.data;

            if (!!FlReadOnly && FlReadOnly === "S") {
                return true;
            }
        }
        return false;
    }


    return (
        <>

            <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
                toolbar={

                    <PortletHeader
                        title={''}
                        toolbar={
                            <PortletHeaderToolbar>
                                <PortletHeaderToolbar>
                                    <Button icon="plus"
                                        type="default"
                                        hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                        onClick={props.nuevoRegistro}
                                        disabled={false}
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
                <React.Fragment>
                    <Form>
                        <GroupItem>
                            <Item>
                                <DataGrid
                                    dataSource={props.dsPerfil}
                                    showBorders={true}
                                    focusedRowEnabled={true}
                                    keyExpr="RowIndex"
                                    // onEditingStart={editarRegistro}
                                    // onRowRemoving={eliminarRegistro}
                                    // onRowClick={seleccionarRegistro}
                                    focusedRowKey={props.focusedRowKey}
                                    onCellPrepared={onCellPrepared}
                                >
                                    {/* <Editing
                                        mode="row"
                                        useIcons={true}
                                        allowUpdating={true}
                                        allowDeleting={true}
                                        texts={textEditing}
                                    /> */}
                                    <Selection mode="single" />
                                    <Column dataField="RowIndex" caption="#" width={40} />
                                    <Column dataField="IdPerfil" caption={intl.formatMessage({ id: "COMMON.CODE" })} visible={true} width={150} />
                                    <Column dataField="Perfil" caption={intl.formatMessage({ id: "ACCESS.PERSON.PROFILE" })} />
                                    <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
                                    <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
                                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={170} />

                                    <Column type="buttons" width={85} visible={true}>

                                        <ColumnButton
                                            icon={"info"}
                                            hint={intl.formatMessage({ id: "CASINO.BUTTON.INFO.COMPANYPROFILE" })}
                                            onClick={() => { }}
                                            visible={visibleReadOnly}
                                        />

                                        <ColumnButton
                                            icon="edit"
                                            hint={intl.formatMessage({ id: "ACTION.EDIT" })}
                                            onClick={editarRegistro}
                                            visible={visibleButtons}
                                        />

                                        <ColumnButton
                                            icon="trash"
                                            hint={intl.formatMessage({ id: "ACTION.REMOVE" })}
                                            onClick={eliminarRegistro}
                                            visible={visibleButtons}
                                        />

                                    </Column>

                                </DataGrid>

                            </Item>
                        </GroupItem>
                    </Form>
                </React.Fragment>
            </PortletBody>
        </>
    );
};

PersonaPerfilListPage.propTypes = {
    showHeaderInformation: PropTypes.bool,
};
PersonaPerfilListPage.defaultProps = {
    showHeaderInformation: true,
};
export default injectIntl(PersonaPerfilListPage);

