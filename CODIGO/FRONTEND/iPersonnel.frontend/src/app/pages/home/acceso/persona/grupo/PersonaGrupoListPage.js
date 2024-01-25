import React, { useState } from "react";
import { DataGrid, Column, Editing, Button as ColumnButton } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { injectIntl } from "react-intl";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { isNotEmpty } from "../../../../../../_metronic";
import { Popup } from 'devextreme-react/popup';
import AccesoGrupoPuertaBuscar from "../../../../../partials/components/AccesoGrupoPuertaBuscar";
import HorarioDetalleListPage from "./../../../acceso/horario/HorarioDetalleListPage";



const PersonaAccesoGrupoListPage = props => {

    const { intl, accessButton } = props;
    const [isVisiblePopupGrupoPuerta, setisVisiblePopupGrupoPuerta] = useState(false);
    const [varIdGrupo, setVarIdGrupo] = useState("");
    const [varGrupo, setVarGrupo] = useState("");
    const [isVisibleDetalleHorario, setisVisibleDetalleHorario] = useState(false);
   // const [varIdHorario, setVarIdHorario] = useState("");

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
        evt.cancel = true;
        props.eliminarRegistro(evt.data);
    };

    const seleccionarRegistro = evt => {
        props.seleccionarRegistro(evt.data);
    }

    const textEditing = {
        confirmDeleteMessage: '',
        editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
        deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
    }

    function verPopupGrupoPuerta(e) {
        const { IdGrupo, Grupo } = e.row.data;
        setVarIdGrupo(IdGrupo);
        setVarGrupo(Grupo);
        if (isNotEmpty(IdGrupo)) setisVisiblePopupGrupoPuerta(true);
    }


    function verDetalleHorario(e) {
        props.verDetalleHorario(e.row.data);
        setisVisibleDetalleHorario(true);
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
                                        disabled={!accessButton.nuevo} />
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
                                    dataSource={props.personaGrupos}
                                    showBorders={true}
                                    focusedRowEnabled={true}
                                    keyExpr="RowIndex"
                                    onEditingStart={editarRegistro}
                                    onRowRemoving={eliminarRegistro}
                                    onRowClick={seleccionarRegistro}
                                    focusedRowKey={props.focusedRowKey}
                                    repaintChangesOnly={true}
                                >
                                    <Editing
                                        mode="row"
                                        useIcons={true}
                                        allowUpdating={accessButton.editar}
                                        allowDeleting={accessButton.eliminar}
                                        texts={textEditing}
                                    />
                                    <Column dataField="RowIndex" caption="#" width={40} />
                                    <Column dataField="Grupo" caption={intl.formatMessage({ id: "ACCESS.PERSON.GRUPO" })} />
                                    <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
                                    <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
                                    <Column type="buttons">
                                        <ColumnButton
                                            icon="pinleft"
                                            hint={intl.formatMessage({ id: "ADMINISTRATION.ZONE.MAINTENANCE" })}
                                            onClick={verPopupGrupoPuerta}
                                        />
                                        <ColumnButton
                                            icon="clock"
                                            hint={intl.formatMessage({ id: "ACCES.GROUP.SEESCHEDULE" })}
                                            onClick={verDetalleHorario}
                                        />
                                        <ColumnButton name="edit" />
                                        <ColumnButton name="delete" />
                                    </Column>
                                </DataGrid>
                            </Item>
                        </GroupItem>
                    </Form>

                    {isVisiblePopupGrupoPuerta && (
                        <AccesoGrupoPuertaBuscar
                            showPopup={{ isVisiblePopUp: isVisiblePopupGrupoPuerta, setisVisiblePopUp: setisVisiblePopupGrupoPuerta }}
                            cancelarEdicion={() => setisVisiblePopupGrupoPuerta(false)}
                            varIdGrupo={varIdGrupo}
                            varGrupo={varGrupo}
                        />
                    )}

                    {isVisibleDetalleHorario && (
                        <Popup
                            visible={isVisibleDetalleHorario}
                            onHiding={() => setisVisibleDetalleHorario(!isVisibleDetalleHorario)}
                            dragEnabled={false}
                            closeOnOutsideClick={false}
                            showTitle={true}
                            title={intl.formatMessage({ id: "ACCESS.GROUP.POPUP.SCHEDULES" })}
                            width={"80%"}
                            height={"70%"}
                        >

                            <div style={{ overflowY: "auto", height: "99%" }}>

                                <HorarioDetalleListPage
                                    showHeaderInformation={false}
                                    horarioDias={props.dataDetalleHorarios}
                                    showButtons={false}
                                    getInfo={props.getInfo}
                                    cancelarEdicion={() => setisVisibleDetalleHorario(false)}
                                />
                            </div>
                        </Popup>

                    )}

                </React.Fragment>
            </PortletBody>


        </>
    );
};


PersonaAccesoGrupoListPage.propTypes = {
    showHeaderInformation: PropTypes.bool,
};
PersonaAccesoGrupoListPage.defaultProps = {
    showHeaderInformation: true,
};
export default injectIntl(PersonaAccesoGrupoListPage);
