import React from "react";
import { DataGrid, Column, Editing, Selection, MasterDetail } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";

import Form, { Item, GroupItem } from "devextreme-react/form";
// import PersonaRequisitosPorPerfil from './PersonaRequisitosPorPerfil.js';
import { injectIntl } from "react-intl";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../partials/components/HeaderInformation";


const PersonaPerfilListPage = props => {

    const { intl, accessButton } = props;

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
        props.eliminarRegistro(evt.data);
    };
    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    }

    const seleccionarRegistro = evt => {
        props.seleccionarRegistro(evt.data);
    }

    function onCellPrepared(e) {
        if (e.rowType === 'data') {
            if (e.data.Activo === 'N') {
                e.cellElement.style.color = 'red';
            }
        }
    }


    // function onRowExpanding(e) {
    //     //e.component.collapseAll(-1);
    //     setIdPerfil(e.key);
    //     setFilterValue(['IdPerfil', '=', e.key]);
    // }

    var dsPerfil = props.personaPerfilData;

    const textEditing = {
        confirmDeleteMessage: '',
        editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
        deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
    }

    return (
        <>

            <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
                toolbar={

                    <PortletHeader
                        title={intl.formatMessage({ id: "ACCESS.PERSON.PROFILE.LIST" })}
                        toolbar={
                            <PortletHeaderToolbar>
                                <PortletHeaderToolbar>
                                    <Button icon="plus"
                                        type="default"
                                        hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                        onClick={props.nuevoRegistro}
                                    // disabled={!accessButton.nuevo}
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
                                    id="gridPersonaPerfil"
                                    dataSource={dsPerfil}
                                    showBorders={true}
                                    focusedRowEnabled={true}
                                    keyExpr="RowIndex"
                                    onEditingStart={editarRegistro}
                                    onRowRemoving={eliminarRegistro}
                                    onRowClick={seleccionarRegistro}
                                    focusedRowKey={props.focusedRowKey}
                                    onCellPrepared={onCellPrepared}
                                >

                                    <Editing
                                        mode="row"
                                        useIcons={true}
                                        /*   allowUpdating={true}
                                          allowDeleting={true} */
                                        // allowUpdating={accessButton.editar}
                                        // allowDeleting={accessButton.eliminar}
                                        texts={textEditing}
                                    />

                                    <Selection mode="single" />
                                    <Column dataField="RowIndex" caption="#" width={40} />
                                    <Column dataField="IdPerfil" caption={intl.formatMessage({ id: "COMMON.CODE" })} visible={true} width={150} />
                                    <Column dataField="Perfil" caption={intl.formatMessage({ id: "ACCESS.PERSON.PROFILE" })} />
                                    <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
                                    <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
                                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={170} />

                                    {/* <MasterDetail enabled={true} component={PersonaRequisitosPorPerfil} /> */}

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

