import React from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../_metronic";
import PropTypes from 'prop-types';

const ClienteListPage = props => {
    const { intl, accessButton } = props;

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
        evt.cancel = true;
        props.eliminarRegistro(evt.data);
    };

    const obtenerCampoCorporativo = rowData => {
        return rowData.Corporativo === "S";
    }

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    }

    /* const seleccionarRegistro = evt => {
        props.seleccionarRegistro(evt.data);
    } */

    const seleccionarRegistro = evt => {
        if (evt.rowIndex === -1) return;
        if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);

    };

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

    function cellRenderFile(data) {
        return isNotEmpty(data.value) && (
            <span
                title={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.LOGO" })}
            >
                <i class="flaticon2-image-file icon-sm text-sucess" ></i>
            </span>
        )
    }


    return (
        <>

            <PortletHeader
                title={intl.formatMessage({ id: "ACTION.LIST" })}
                toolbar={
                    <PortletHeaderToolbar>
                        <PortletHeaderToolbar>
                            {props.showButton && (
                                <Button
                                    icon="plus"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                    onClick={props.nuevoRegistro}
                                //disabled={!accessButton.nuevo}
                                />
                            )}
                        </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                }
            />

            <PortletBody>
                <DataGrid
                    dataSource={props.clientes}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onFocusedRowChanged={seleccionarRegistro}
                    onRowDblClick={seleccionarRegistroDblClick}
                    focusedRowKey={props.focusedRowKey}
                    onCellPrepared={onCellPrepared}
                    repaintChangesOnly={true}
                >
                    <Editing
                        mode="row"
                        useIcons={props.showButton}
                        allowUpdating={props.showButton}
                        allowDeleting={props.showButton}
                        texts={textEditing}
                    />
                    {/* <Column dataField="RowIndex" caption="#"  width={"8%"} alignment={"center"} /> */}
                    <Column dataField="Logo" caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.LOGO" })} cellRender={cellRenderFile} width={"5%"} alignment="center" />
                    <Column dataField="IdCliente" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} alignment={"center"} />
                    <Column dataField="Cliente" caption={intl.formatMessage({ id: "SYSTEM.CUSTOMER" })} width={"30%"} />
                    <Column dataField="Documento" caption={intl.formatMessage({ id: "SYSTEM.CUSTOMER.DOCUMENT" })} width={"15%"} />
                    <Column dataField="Alias" caption={intl.formatMessage({ id: "SYSTEM.CUSTOMER.NICKNAME" })} width={"20%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "SYSTEM.CUSTOMER.COORPORATION" })} calculateCellValue={obtenerCampoCorporativo} width={"10%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />

                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="IdCliente"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>

                </DataGrid>
            </PortletBody>

        </>
    );
};



ClienteListPage.propTypes = {
    showButton: PropTypes.bool,
    showHeaderInformation: PropTypes.bool
}
ClienteListPage.defaultProps = {
    showButton: true,
    showHeaderInformation: true
}

export default injectIntl(ClienteListPage);
