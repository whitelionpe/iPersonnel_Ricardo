import React from "react";
import { injectIntl } from "react-intl";
import { TreeList, Column, Editing, Button ,Summary , TotalItem  } from "devextreme-react/tree-list";
import { Button as ButtonDev } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import TreeListSummary from "../../../../partials/components/TreeList/Summary";
import { isNotEmpty } from "../../../../../_metronic";

const DivisionListPage = props => {
    const { intl, accessButton } = props;

    // console.log("DivisionListPage-props:",props);
    // console.log("DivisionListPage-props.divisiones.:", isNotEmpty(props.divisiones[0])  ?  props.divisiones[0].TotalItem : 0  );

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
      evt.cancel = true;
        props.eliminarRegistro(evt.data);
    };

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    }
    const insertarRegistro = evt => {
        props.insertarRegistro(evt.row.data);
    }

    const textEditing = {
        confirmDeleteMessage:'',
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
            <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
                toolbar={

                    <PortletHeader
                        title=""
                        toolbar={
                            <PortletHeaderToolbar>
                                <PortletHeaderToolbar>
                                    <ButtonDev icon="plus"
                                        type="default"
                                        hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                        onClick={props.nuevoRegistro}
                                        disabled={!accessButton.nuevo}
                                    />
                                &nbsp;
                                <ButtonDev
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
                <TreeList
                    dataSource={props.divisiones}
                    showBorders={true}
                    focusedRowEnabled={true}
                    rootValue={-1}
                    keyExpr="IdDivision"
                    parentIdExpr="IdDivisionPadre"
                    // showRowLines={true}
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onCellPrepared={onCellPrepared}
                    //onRowClick={seleccionarRegistro}
                    //focusedRowKey={props.focusedRowKey}
                >
                    <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={accessButton.editar}
                        allowDeleting={accessButton.eliminar}
                        texts={textEditing}
                    />
                    <Column dataField="IdDivision" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"20%"} />
                    <Column dataField="Division" caption={intl.formatMessage({ id: "SYSTEM.DIVISION" })} width={"40%"} />
                    <Column dataField="Pais" caption={intl.formatMessage({ id: "SYSTEM.DIVISION.COUNTRY" })} width={"30%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />
                    <Column type="buttons">
                        <Button text="Agregar" icon="share" hint={intl.formatMessage({ id: "SYSTEM.DIVISION.ADD" })} onClick={insertarRegistro} />
                        <Button name="edit" />
                        <Button name="delete" />
                        <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="Division"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>
                    </Column>
                </TreeList>
                 <TreeListSummary TotalItem = { isNotEmpty(props.divisiones[0])  ?  props.divisiones[0].TotalItem : 0 } /> 

            </PortletBody>
        </>
    );
};


DivisionListPage.propTypes = {
    showHeaderInformation: PropTypes.bool,
};
DivisionListPage.defaultProps = {
    showHeaderInformation: true,
};
export default injectIntl(DivisionListPage);
