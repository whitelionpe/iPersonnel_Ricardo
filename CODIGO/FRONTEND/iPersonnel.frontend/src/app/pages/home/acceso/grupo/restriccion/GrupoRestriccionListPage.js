import React from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import Form, { Item, GroupItem } from "devextreme-react/form";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";


const GrupoRestriccionListPage = props => {

    const { intl } = props;

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
        evt.cancel = true;
        props.eliminarRegistro(evt.data);
    };
    const obtenerCampoActivo = rowData => {
        return rowData.FlgDiaCompleto === "S";
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
                        title=""
                        toolbar={
                            <PortletHeaderToolbar>
                                <PortletHeaderToolbar>
                                    <Button icon="plus"
                                        type="default"
                                        hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                        onClick={props.nuevoRegistro} />
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
                                    dataSource={props.grupoRestriccionData}
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
                                        allowUpdating={true}
                                        allowDeleting={true}
                                        texts={textEditing}
                                    />
                                    <Column dataField="IdSecuencial" caption="IdSecuencial" visible={false} />
                                    <Column dataField="IdCliente" caption="IdCliente" visible={false} />
                                    <Column dataField="IdDivision" caption="IdDivision" visible={false} />
                                    <Column dataField="IdGrupo" caption="IdPersona" visible={false} />
                                    <Column dataField="IdRestriccion" caption="IdRestriccion" visible={false} />
                                    <Column dataField="Restriccion" caption={intl.formatMessage({ id: "ACCESS.GROUP.RESTRICTION" })} width={"40%"} />
                                    <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ACCESS.GROUP.RESTRICTION.STARTDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} width={"15%"} />
                                    <Column dataField="HoraInicio" caption={intl.formatMessage({ id: "ACCESS.PERSON.GRUPO.STARTTIME" })} alignment={"center"} width={"10%"} />

                                    <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ACCESS.GROUP.RESTRICTIONS.ENDDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} width={"15%"} />
                                    <Column dataField="HoraFin" caption={intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.ENDTIME" })} alignment={"center"} width={"10%"} />

                                    <Column dataType="boolean" dataField="FlgDiaCompleto" caption={intl.formatMessage({ id: "ACCESS.GROUP.RESTRICTION.COMPLETEDAY" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />

                                    <Summary>
                                        <TotalItem
                                        cssClass="classColorPaginador_"
                                            column="Restriccion"
                                            summaryType="count"
                                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                                        />
                                    </Summary>
                                </DataGrid>
                            </Item>
                        </GroupItem>
                    </Form>


                </React.Fragment>
            </PortletBody>
        </>
    );
};

GrupoRestriccionListPage.propTypes = {
    showHeaderInformation: PropTypes.bool,
};
GrupoRestriccionListPage.defaultProps = {
    showHeaderInformation: true,
};

export default injectIntl(GrupoRestriccionListPage);
