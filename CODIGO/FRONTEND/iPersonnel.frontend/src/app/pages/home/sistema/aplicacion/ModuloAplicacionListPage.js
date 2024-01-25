import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl"; //Multi-idioma /, useIntl
import { DataGrid, Button as ColumnButton, Column, Editing, MasterDetail, Selection, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";

import { exportExcelDataGrid, isNotEmpty } from "../../../../../_metronic";
import PropTypes from "prop-types";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import HeaderInformation from "../../../../partials/components/HeaderInformation";


const ModuloAplicacionListPage = props => {
    const { intl } = props;
  
    /***********-Eventos del Modulo Aplicación************************/
    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
      evt.cancel = true;
        props.eliminarRegistroMA(evt.data);
    };

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    };

    const seleccionarRegistro = evt => {
        if (evt.rowIndex === -1) return;
        if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);

    };

    function onCellPrepared(e) {
        if (e.rowType === 'data') {
            if (e.data.Activo === 'N') {
                e.cellElement.style.color = 'red';
            }
        }
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



    return (
        <>
            <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
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
                                        disabled={!props.accessButton.nuevo} />
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
                <DataGrid
                 dataSource={props.modulos}
                 showBorders={true}
                 focusedRowEnabled={true}
                 keyExpr="RowIndex"
                 onEditingStart={editarRegistro}
                 onRowRemoving={eliminarRegistro}                  
                 focusedRowKey={props.focusedRowKey}
                 onCellPrepared={onCellPrepared}
                 onFocusedRowChanged={seleccionarRegistro}
                 repaintChangesOnly={true}
                >
                    <Editing
                        mode="row"
                        useIcons={props.showButtons}
                        allowUpdating={props.showButtons}
                        allowDeleting={props.showButtons}
                        texts={textEditing}
                    />

                    <Column dataField="IdModulo" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"15%"} alignment={"center"} />
                    <Column dataField="Modulo" caption={intl.formatMessage({ id: "SYSTEM.MODULE" })} width={"70%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"15%"} />
                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="IdModulo"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>

                </DataGrid>

            </PortletBody>
        </>
    );
};
ModuloAplicacionListPage.prototype = {
    showButtons: PropTypes.bool,
     showHeaderInformation: PropTypes.bool,
}
ModuloAplicacionListPage.defaultProps = {
    showButtons: true,
    showHeaderInformation: true,
}


export default injectIntl(WithLoandingPanel(ModuloAplicacionListPage));
