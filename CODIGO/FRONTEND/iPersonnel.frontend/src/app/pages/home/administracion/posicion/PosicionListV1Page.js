import React from "react";
import { injectIntl } from "react-intl"; //Multi-idioma
import { DataGrid, Column, Editing } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";

const PosicionListPage = props => {
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
    const obtenerCampoConfianza = rowData => {
        return rowData.Confianza === "S";
    }
    const obtenerCampoFiscalizable= rowData => {
        return rowData.Fiscalizable === "S";
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
        confirmDeleteMessage:'',
        editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
        deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
    }

    return (
        <>
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
            <PortletBody>
                <DataGrid
                    dataSource={props.posiciones}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onRowClick={seleccionarRegistro}
                    focusedRowKey={props.focusedRowKey}
                    onCellPrepared = { onCellPrepared }
                >
                    <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={true}
                        allowDeleting={true}
                        texts={textEditing}
                    />
                    <Column dataField="RowIndex" caption="#" width={"8%"} alignment={"center"} />
                    <Column dataField="IdPosicion" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"15%"} />
                    <Column dataField="Posicion" caption={intl.formatMessage({ id: "ADMINISTRATION.POSITION" })} width={"30%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "ADMINISTRATION.POSITION.TRUST" })} calculateCellValue={obtenerCampoConfianza} width={"15%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "ADMINISTRATION.POSITION.CONTROLLABLE" })} calculateCellValue={obtenerCampoFiscalizable} width={"20%"} />  
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"14%"} />

                    <Column dataField="TipoPosicion" caption={intl.formatMessage({ id: "ADMINISTRATION.POSITION.POSITIONTYPE" })} width={"18%"} visible={false}/>  
                    <Column dataField="UnidadOrganizativa" caption={intl.formatMessage({ id: "ADMINISTRATION.POSITION.ORGANIZATIONALUNIT" })} width={"13%"} visible={false}/>
                    <Column dataField="Funcion" caption={intl.formatMessage({ id: "ADMINISTRATION.POSITION.FUNCTION" })} width={"15%"} visible={false}/>
                </DataGrid>
            </PortletBody>
        </>
    );
};

export default injectIntl(PosicionListPage);
