import React from "react";
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import { isNotEmpty } from "../../../../../_metronic";

const TipoCredencialListPage = props => {

    const { intl, accessButton } = props;


    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
        evt.cancel = true;
        props.eliminarRegistro(evt.data);
    };

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    };

    const seleccionarRegistro = evt => {
        if (evt.rowIndex === -1) return;
        if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
    }


    const seleccionarRegistroDblClick = evt => {
        if (evt.data === undefined) return;
        if (isNotEmpty(evt.data)) {
            props.verRegistroDblClick(evt.data);
        };
    }



    const textEditing = {
        confirmDeleteMessage: '',
        editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
        deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
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
            <PortletHeader
                title={intl.formatMessage({ id: "ACTION.LIST" })}
                toolbar={
                    <PortletHeaderToolbar>
                        <PortletHeaderToolbar>
                            <Button icon="plus" type="default" hint={intl.formatMessage({ id: "ACTION.NEW" })} onClick={props.nuevoRegistro} disabled={!accessButton.nuevo} />
                            &nbsp;
                            <Button icon="download" type="default" hint={intl.formatMessage({ id: "ACTION.DOWNLOAD.FOTOCHECK" })} onClick={props.downloadFileDesign} />
                        </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                }
            />
            <PortletBody>
                <DataGrid
                    dataSource={props.tipoCredenciales}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onFocusedRowChanged={seleccionarRegistro}
                    focusedRowKey={props.focusedRowKey}
                    onRowDblClick={seleccionarRegistroDblClick}
                    onCellPrepared={onCellPrepared}
                    repaintChangesOnly={true}
                >
                    <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={accessButton.editar}
                        allowDeleting={accessButton.eliminar}
                        texts={textEditing}
                    />
                    {/*  <Column dataField="RowIndex" caption="#" width={"7%"} alignment={"center"} /> */}
                    <Column dataField="IdTipoCredencial" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"15%"} alignment={"center"} />
                    <Column dataField="TipoCredencial" caption={intl.formatMessage({ id: "COMMON.DESCRIPTION" })} width={"25%"} />
                    <Column dataField="Entidad" caption={intl.formatMessage({ id: "IDENTIFICATION.CREDENTIALTYPE.ENTITY" })} width={"15%"} alignment={"center"} />
                    <Column dataField="Archivo" caption={intl.formatMessage({ id: "COMMON.FILE" })} width={"10%"} alignment={"center"} />
                    <Column
                        dataField="FechaArchivo"
                        caption={intl.formatMessage({
                            id: "AUDIT.MODIFICATIONDATE"
                        })}
                        width={"15%"}
                        dataType="date"
                        format="dd/MM/yyyy HH:mm"
                        alignment="center"
                    />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />

                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="IdTipoCredencial"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>

                </DataGrid>

                <br />
                {/* <div className="col-12">
                    <div className="row mt-3">
                        <div className="col-12 col-md-6">
                            <fieldset className="scheduler-border">
                                <legend className="scheduler-border" >
                                    <h5> {intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.ACTIONS" })}</h5>
                                </legend>
                                <div className="row">
                                    <div className="col-12">
                                        <i className="dx-icon dx-icon-download" />: {intl.formatMessage({ id: "ACTION.DOWNLOAD.FOTOCHECK" })}
                                    </div>
                                    <div className="col-12">
                                    
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                        <div className="col-12 col-md-6" />

                    </div>
                </div> */}
            </PortletBody>
        </>
    );
};

export default injectIntl(TipoCredencialListPage);
