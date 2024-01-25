
import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { DataGrid, Column, Editing, Summary, TotalItem, Button as ColumnButton } from "devextreme-react/data-grid";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import Confirm from "../../../../../partials/components/Confirm";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";

const IdentificacionCredencialListPage = props => {
    const { intl, accessButton } = props;
    const [confirmarDevolucion, setConfirmarDevolucion] = useState(false);
    const [instance, setInstance] = useState({});
    const [selectedData, setSelectedData] = useState({});

    useEffect(() => {

    }, []);

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
        evt.cancel = true;
        props.eliminarRegistro(evt.data);
    };

    const devolverFotocheck = evt => {
        const { Impreso } = evt.row.data;
        if (Impreso === 'S') {
            setSelectedData(evt.row.data);
            setConfirmarDevolucion(true);
        } else {
            handleInfoMessages(intl.formatMessage({ id: "IDENTIFICATION.RETURNED.CONDITION" }));
        }
    };

    const callDevolverFotocheck = (data) => {
        if (data) props.devolverFotocheck(data);
    };

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

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    };

    const obtenerCampoImpreso = rowData => {
        return rowData.Impreso === "S";
    };

    const obtenerDevuelto = rowData => {
        return rowData.Devuelto === "S";
    };


    return (
        <>

            <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
                toolbar={
                    <PortletHeader
                        title={""}
                        toolbar={
                            <PortletHeaderToolbar>

                                <Button
                                    icon="plus"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                    onClick={props.nuevoRegistro}
                                    disabled={!accessButton.nuevo}
                                />
                                &nbsp;
                                <Button
                                    icon="fa fa-times-circle"
                                    type="normal"
                                    hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                                    onClick={props.cancelarEdicion}
                                />

                            </PortletHeaderToolbar>
                        }
                    />
                } />

            <PortletBody>

                <DataGrid
                    dataSource={props.credencialData}
                    showBorders={true}
                    keyExpr="RowIndex"
                    focusedRowEnabled={true}
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onCellPrepared={onCellPrepared}
                >
                    <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={accessButton.editar}
                        allowDeleting={accessButton.eliminar}
                        texts={textEditing}
                    />
                    <Column dataField="IdCliente" visible={false} />
                    <Column dataField="IdPersona" visible={false} />
                    <Column dataField="IdSecuencial" visible={false} />
                    <Column
                        dataField="Credencial"
                        caption={intl.formatMessage({ id: "IDENTIFICATION.MANAGEMENT.CREDENTIAL" })}
                        allowSorting={true}
                        allowHeaderFiltering={false}
                        width={"20%"}
                    />
                    <Column
                        dataField="TipoCredencial"
                        caption={intl.formatMessage({ id: "IDENTIFICATION.MANAGEMENT.TYPECREDENTIAL" })}
                        allowSorting={true}
                        allowFiltering={false}
                        allowHeaderFiltering={true}
                        alignment={"center"}
                        width={"20%"}
                    >
                    </Column>
                    <Column dataField="FechaInicio"
                        caption={intl.formatMessage({ id: "IDENTIFICATION.MANAGEMENT.STARTDATE" })}
                        dataType="date" format="dd/MM/yyyy"
                        allowHeaderFiltering={false}
                        width={"20%"}
                        alignment={"center"}
                    />
                    <Column
                        dataField="FechaFin"
                        caption={intl.formatMessage({ id: "IDENTIFICATION.MANAGEMENT.ENDDATE" })}
                        dataType="date" format="dd/MM/yyyy"
                        allowSorting={true}
                        allowFiltering={false}
                        allowHeaderFiltering={true}
                        alignment={"center"}
                        width={"20%"}
                    >
                    </Column>

                    <Column dataField="Impreso"
                        caption={intl.formatMessage({ id: "IDENTIFICATION.MANAGEMENT.PRINTED" })}
                        calculateCellValue={obtenerCampoImpreso}
                        allowSorting={true}
                        allowFiltering={false}
                        allowHeaderFiltering={false}
                        width={"10%"}
                    />

                    <Column dataField="Devuelto"
                        caption={intl.formatMessage({ id: "IDENTIFICATION.RETURNED.QUESTION" })}
                        calculateCellValue={obtenerDevuelto}
                        allowSorting={true}
                        allowFiltering={false}
                        allowHeaderFiltering={false}
                        width={"10%"}
                    />

                    <Column dataField="Activo"
                        caption={intl.formatMessage({ id: "COMMON.ACTIVE" })}
                        calculateCellValue={obtenerCampoActivo}
                        allowSorting={true}
                        allowFiltering={false}
                        allowHeaderFiltering={false}
                        width={"10%"}
                    />

                    <Column type="buttons"  >
                        <ColumnButton
                            icon="redo"
                            hint={intl.formatMessage({ id: "IDENTIFICATION.GIVE.BACK" })}
                            onClick={devolverFotocheck}
                        />
                        <ColumnButton name="edit" />
                        <ColumnButton name="delete" />
                    </Column>

                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="Credencial"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>



                </DataGrid>
            </PortletBody>

            <Confirm
                message={intl.formatMessage({ id: "IDENTIFICATION.PHOTOCHECK.CONFIRM" })}
                isVisible={confirmarDevolucion}
                setIsVisible={setConfirmarDevolucion}
                setInstance={setInstance}
                onConfirm={() => callDevolverFotocheck(selectedData)}
                title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
                confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
                cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
            />

        </>
    );
};



export default injectIntl(IdentificacionCredencialListPage);
