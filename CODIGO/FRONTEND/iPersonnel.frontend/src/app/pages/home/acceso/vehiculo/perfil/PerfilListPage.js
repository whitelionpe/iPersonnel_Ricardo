import React from "react";
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { injectIntl } from "react-intl";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { isNotEmpty } from "../../../../../../_metronic";

const PerfilListPage = props => {

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
      if (evt.rowIndex === -1) return;
      if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
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
                                        disabled={!accessButton.nuevo}/>
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
                                    onEditingStart={editarRegistro}
                                    onRowRemoving={eliminarRegistro}
                                    onFocusedRowChanged={seleccionarRegistro}
                                    focusedRowKey={props.focusedRowKey}
                                    onCellPrepared={onCellPrepared}
                                >

                                    <Editing
                                        mode="row"
                                        useIcons={true}
                                        allowUpdating={accessButton.editar}
                                        allowDeleting={accessButton.eliminar}
                                        texts={textEditing}
                                    />
                                    <Column dataField="RowIndex" caption="#" width={40} />
                                    <Column dataField="IdPerfil" caption={intl.formatMessage({ id: "COMMON.CODE" })} visible={true} width={150} />
                                    <Column dataField="Perfil" caption={intl.formatMessage({ id: "ACCESS.PERSON.PROFILE" })} />
                                    <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
                                    <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
                                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={170} />
                                    <Summary>
                                    <TotalItem
                                    cssClass="classColorPaginador_"
                                        column="IdPerfil"
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

PerfilListPage.propTypes = {
    showHeaderInformation: PropTypes.bool,
};
PerfilListPage.defaultProps = {
    showHeaderInformation: true,
};
export default injectIntl(PerfilListPage);

