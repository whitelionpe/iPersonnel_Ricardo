import React from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import PropTypes from 'prop-types';
import HeaderInformation from "../../../../partials/components/HeaderInformation";

const ZonaRequisitoListPage = props => {
    const { intl } = props;

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
      evt.cancel = true;
        props.setMessagePopup(intl.formatMessage({ id: "ALERT.REMOVE" }));
        props.eliminarRegistro(evt.data, false, false, 1);
    };

    const obtenerCampoWarning = rowData => {
        return rowData.Warning === "S";
    }

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    }

    const seleccionarRegistro = evt => {
        props.seleccionarRegistro(evt.data);
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
    };

    return (
        <>{props.showButton && (
            <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={2}
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
            {/*{props.showButton && (
                <PortletHeader
                    title=""
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
                )}*/}
            <PortletBody>
                <DataGrid
                    dataSource={props.zonaRequisitos}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onRowClick={seleccionarRegistro}
                    //focusedRowKey={props.focusedRowKey}
                    onCellPrepared={onCellPrepared}

                >
                    <Editing
                        mode="row"
                        useIcons={props.showButton}
                        allowUpdating={props.showButton}
                        allowDeleting={props.showButton}
                        texts={textEditing}
                    />
                    {/* <Column dataField="RowIndex" caption="#" width={"7%"} alignment={"center"} /> */}
                    <Column dataField="Requisito" caption={intl.formatMessage({ id: "ACCESS.REQUIREMENT" })} width={"77%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "ACCESS.REQUIREMENT.WARNING" })} calculateCellValue={obtenerCampoWarning} width={"10%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />
                    <Column type="buttons">
                        <Button name="edit" />
                        <Button name="delete" />
                    </Column>

                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="Requisito"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>


                </DataGrid>
            </PortletBody>
        </>
    );
};
ZonaRequisitoListPage.propTypes = {
    showButton: PropTypes.bool,
    showHeaderInformation: PropTypes.bool
}
ZonaRequisitoListPage.defaultProps = {
    showButton: true,
    showHeaderInformation: true
}

export default injectIntl(ZonaRequisitoListPage);
