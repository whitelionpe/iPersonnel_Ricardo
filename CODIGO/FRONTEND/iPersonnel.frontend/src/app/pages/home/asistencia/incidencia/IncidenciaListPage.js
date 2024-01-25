import React from "react";
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import { isNotEmpty } from "../../../../../_metronic";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    circle: {
        width: "20%",
        height: "20%",
        background: "red",
        borderRadius: "50%",
    },
}));

const IncidenciaListPage = props => {

    const { intl, accessButton } = props;
    const classes = useStyles();

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

    const celRenderColor = ({ data }) => {
        if (isNotEmpty(data.Color)) {
            return (
                <div align="center">
                    <div
                        style={{
                            width: "11px",
                            height: "11px",
                            background: data.Color,
                            borderRadius: "50%"
                        }}
                    ></div>
                </div>

            );
        } else {
            return (
                <div align="center">
                    <div align="center"
                        style={{
                            width: "11px",
                            height: "11px",
                            background: "#ffffff",
                            borderRadius: "50%"
                        }}
                    ></div>
                </div>
            );
        }
    };


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
                                visible={false}
                            />
                        </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                }
            />
            <PortletBody>
                <DataGrid
                    dataSource={props.incidencias}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onFocusedRowChanged={seleccionarRegistro}
                    focusedRowKey={props.focusedRowKey}
                    onCellPrepared={onCellPrepared}
                    repaintChangesOnly={true}
                    allowColumnReordering={true}
                    allowColumnResizing={true}
                    columnAutoWidth={true}
                >
                    <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={true}
                        allowDeleting={false}
                        texts={textEditing}
                    />
                    <Column dataField="IdIncidencia" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} alignment={"center"} />
                    <Column dataField="Incidencia" caption={intl.formatMessage({ id: "COMMON.DESCRIPTION" })} width={"30%"} />
                    <Column dataField="TipoIncidencia" caption={intl.formatMessage({ id: "ASSISTANCE.INCIDENTS.TYPE" })} width={"20%"} />
                    <Column dataField="EsJustificable" caption={intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION" })} width={"20%"} />
                    <Column
                        dataField="Color"
                        caption={intl.formatMessage({ id: "ASSISTANCE.INCIDENCE.COLOR" })}
                        width={"10%"}
                        alignment={"center"}
                        cellRender={celRenderColor}
                        allowSorting={false}
                        allowFiltering={false}
                        allowHeaderFiltering={false}
                    />
                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="Incidencia"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>
                </DataGrid>
            </PortletBody>
        </>
    );
};

export default injectIntl(IncidenciaListPage);
