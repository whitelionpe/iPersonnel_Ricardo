import React from "react";
import { injectIntl } from "react-intl"; //Multi-idioma
import { DataGrid, Column, Editing } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import PropTypes from 'prop-types'
import StatusLabel from "../../../../partials/content/Grid/StatusLabel";

const PuertaEquipoListPage = props => {
    const { intl } = props;

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
        props.eliminarRegistro(evt.data);
    };

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    }

    /*const seleccionarRegistro = evt => {
        props.seleccionarRegistro(evt.data);
    }*/

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
            {props.showButton && (
                <PortletHeader
                    title={intl.formatMessage({ id: "ACTION.LIST" })}
                    toolbar={
                        <PortletHeaderToolbar>
                            <PortletHeaderToolbar>
                                <Button
                                    icon="plus"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                    onClick={props.nuevoRegistro} />
                            </PortletHeaderToolbar>
                        </PortletHeaderToolbar>
                    }
                />
            )}
            <PortletBody>
                <DataGrid
                    dataSource={props.puertaEquipos}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    //onRowClick={seleccionarRegistro}
                    focusedRowKey={props.focusedRowKey}
                    onCellPrepared = { onCellPrepared }
                >
                    <Editing
                        mode="row"
                        useIcons={props.showButton}
                        allowUpdating={props.showButton}
                        allowDeleting={props.showButton}
                        texts={textEditing}
                    />
                    <Column dataField="RowIndex" caption="#" width={"10%"} alignment={"center"} />
                    <Column dataField="Puerta" caption={intl.formatMessage({ id: "ACCESS.DOOR.EQUIPMENT.DOOR" })} width={"15%"} />
                    <Column dataField="CodNombreEquipo" caption={intl.formatMessage({ id: "ACCESS.DOOR.EQUIPMENT.EQUIPMENT" })} width={"30%"} />
                    <Column dataField="TipoEntradaSalida" caption={intl.formatMessage({ id: "ACCESS.DOOR.EQUIPMENT.TYPE" })} width={"15%"} />
                    <Column dataField="IP" caption={intl.formatMessage({ id: "ACCESS.DOOR.EQUIPMENT.IP" })} width={"14%"} alignment={"center"}/>
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"8%"} />
                    <Column cellRender={StatusLabel} caption={intl.formatMessage({ id: "ACCESS.DOOR.EQUIPMENT.STATUS" })} width={"8%"} alignment={"center"}/>
                    
                    <Column dataField="IdEquipo" caption="Equipo" visible={false} />
                    <Column dataField="MacAddress" caption="MacAddress" visible={false}/>
                    <Column dataField="TipoEquipo" caption="Tipo Equipo" visible={false}/>
                    <Column dataField="Modelo" caption="Modelo" width={"15%"} alignment={"center"} visible={false}/>
                </DataGrid>
            </PortletBody>
        </>
    );
};
PuertaEquipoListPage.propTypes = {
    showButton: PropTypes.bool,
}
PuertaEquipoListPage.defaultProps = {
    showButton: true,
}

export default injectIntl(PuertaEquipoListPage);
