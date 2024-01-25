import React from "react";
import { TreeList, Column, Editing, Button as ColumnButton, Paging, Pager } from "devextreme-react/tree-list";

import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";

import { confirm, custom } from "devextreme/ui/dialog";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";

const ContratoSubcontratoListPage = props => {

    const { intl ,accessButton} = props;

    const editarRegistro = evt => {
        props.editarRegistro(evt.row.data);
    };

    const eliminarRegistro = evt => {
        let data = evt.row.data;
        props.eliminarRegistro(data);
    };

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    };


    function onCellPrepared(e) {
        if (e.rowType === 'data') {
            if (e.data.Activo === 'N') {
                e.cellElement.style.color = 'red';
            }
        }
    }


    return (
        <>

            {props.showButton && (
                <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={3}
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
                                            //disabled={!accessButton.nuevo}// 2023-06-26->DESHABILITADO-> SOLICUD JORGE-> ADEMAS SE SOLICITA AGREGAR CONFIGURAR TAB CON SUS RESPECTIVO BOTTON. 
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

                    } />)}


            <PortletBody>
                <TreeList
                    dataSource={props.Subcontratistas}
                    showBorders={true}
                    focusedRowEnabled={true}
                    rootValue={-1}
                    keyExpr="IdCompaniaSubContratista"
                    parentIdExpr="IdCompaniaSubContratistaPadre"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onCellPrepared={onCellPrepared}
                >

                    <Column dataField="IdCompaniaSubContratista" visible={false} />
                    <Column dataField="IdCompaniaSubContratistaPadre" visible={false} />
                    <Column dataField="CompaniaSubContratista" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBCONTRACTOR" })} width={"40%"} />
                    <Column dataField="TipoDocumento" caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.DOCUMENTTYPE" })} width={"25%"} />
                    <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.DOCUMENT" })} width={"25%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} alignment={"center"} />

                    <Column type="buttons" width={105} visible={props.showButtons} >
                        <ColumnButton icon="fa fa-file-contract" hint={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBCONTRACTOR.ADD", })} onClick={props.agregarSubcontratista} />
                        <ColumnButton icon="edit" hint={intl.formatMessage({ id: "ACTION.EDIT", })} 
                        onClick={editarRegistro}
                        visible={accessButton.editar}
                         />
                        <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} 
                        onClick={eliminarRegistro} 
                        visible={accessButton.eliminar}
                        />
                    </Column>

                    <Paging
                        enabled={true}
                        defaultPageSize={10} />

                </TreeList>


            </PortletBody>
        </>
    );
};


export default injectIntl(ContratoSubcontratoListPage);
