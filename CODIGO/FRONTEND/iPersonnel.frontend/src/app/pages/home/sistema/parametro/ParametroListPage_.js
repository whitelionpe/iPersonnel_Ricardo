import React from "react";
import { injectIntl } from "react-intl";
import { TreeList, Column, Editing, Button } from "devextreme-react/data-grid";

import { Button as ButtonParametro} from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";

const ParametroListPage = props => {
    const { intl } = props;

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
        props.eliminarRegistro(evt.data);
    };
    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    };
    const seleccionarRegistro = evt => {
        props.seleccionarRegistro(evt.data);
    };
    const insertarRegistro = evt => {       
        props.insertarRegistro(evt.row.data);
    }
    
    const textEditing = {
        confirmDeleteMessage:'',
        editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
        deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
    };

    return (
        <>
           <PortletHeader
                title={intl.formatMessage({ id: "ACTION.LIST" })}
                toolbar={
                    <PortletHeaderToolbar>
                        <PortletHeaderToolbar>
                            <ButtonParametro
                                icon="plus"
                                type="default"
                                hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                onClick={props.nuevoRegistro} 
                                disabled={props.modoEdicion}
                            />
                           {/*} &nbsp;
                            <Button
                                icon="fa fa-times-circle"
                                type="normal"
                                hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                                onClick={props.cancelarEdicion}
                             />*/}
                        </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                }
            />
            <PortletBody>
                <TreeList
                    dataSource={props.parametros}
                    showBorders={true}
                    focusedRowEnabled={true}
                    rootValue={-1}
                    //keyExpr="RowIndex"
                    keyExpr="IdParametro"
                    parentIdExpr="IdParametro"
                    showRowLines={true}
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onRowClick={seleccionarRegistro}
                    focusedRowKey={props.focusedRowKey}
                >
                    <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={true}
                        allowDeleting={true}
                        texts={textEditing}
                    />
                    {/*<Column dataField="RowIndex" caption="#" width={"8%"} alignment={"center"} />*/}
                    <Column dataField="IdCliente" visible={false}/>
                    <Column dataField="Modulo" caption={intl.formatMessage({ id: "SYSTEM.MODULE" })}  visible={false}/>
                    <Column dataField="IdAplicacion" caption="Cód.Aplicación" width={"14%"} visible={false}  />
                    <Column dataField="IdParametro" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} alignment={"center"}/>
                    <Column dataField="Parametro" caption={intl.formatMessage({ id: "SYSTEM.PARAMETER" })} width={"60%"}/>
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"8%"} />
                    <Column type="buttons" width={"15%"}>
                        <Button text="Agregar" icon="share" hint={intl.formatMessage({ id: "ACTION.ADD"})} onClick={insertarRegistro} />
                        <Button name="edit" />
                        <Button name="delete" />
                    </Column>
                </TreeList>
            </PortletBody>
        </>
    );
};

export default injectIntl (ParametroListPage);
