import React, { useState } from "react";
import { injectIntl } from "react-intl";
import { TreeList, Selection, Column } from 'devextreme-react/tree-list';
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { handleInfoMessages } from "../../../../store/ducks/notify-messages";

const EquipoCheckListPage = props => {

  //console.log("EquipoCheckListPage:props",props);

    const { intl } = props;

    const [equiposSeleccionados, setEquiposSeleccionado] = useState([]);

    function grabar(e) {

        if (equiposSeleccionados.length >= 1) {
            props.agregarEquipos({ ...props.dataRowEditNew, Equipos: equiposSeleccionados });
        } else {
            handleInfoMessages("Debe seleccionar un equipo!");
        }
    }

    function onSelectionChanged(e) {
        setEquiposSeleccionado(e.selectedRowKeys);
    }

    return (
        <>
            <PortletHeader
                title={"Seleccione"}
                toolbar={
                    <PortletHeaderToolbar>
                        <Button
                            id="idButtonGrabarTview"
                            icon="fa fa-save"
                            type="default"
                            hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                            disabled={!props.modoEdicion}
                            onClick={grabar}
                            useSubmitBehavior={true}
                            validationGroup="FormEdicion"
                            visible={false}
                        />
                        &nbsp;
                        <Button
                            icon="fa fa-times-circle"
                            type="normal"
                            hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                            disabled={!props.modoEdicion}
                            onClick={props.cancelarEdicion}
                            visible={false}
                        />
                    </PortletHeaderToolbar>
                }
            />
            <PortletBody >
                <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" disabled={!props.modoEdicion} >
                    <GroupItem itemType="group" colCount={2} colSpan={2}>
                        <Item colSpan={2}>
                            <TreeList
                                dataSource={props.equipos}
                                showBorders={true}
                                focusedRowEnabled={true}
                                rootValue={-1}
                                keyExpr="IdEquipo"
                                parentIdExpr="IdEquipoPadre"
                                showRowLines={true}
                                columnAutoWidth={true}
                                onSelectionChanged={onSelectionChanged}

                            >
                                <Selection recursive={true} mode="multiple" />
                                <Column dataField="IdEquipo" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"25%"} alignment={"center"} />
                                <Column dataField="Equipo" caption={intl.formatMessage({ id: "SYSTEM.DEVICE" })} width={"45%"} />
                                <Column dataField="IP" caption={intl.formatMessage({ id: "SYSTEM.TEAM.IP" })} width={"30%"} alignment={"center"} />

                            </TreeList>
                        </Item>
                        <Item dataField="IdCliente" visible={false} />
                        <Item dataField="IdDivision" visible={false} />
                        <Item dataField="IdZona" visible={false} />
                        <Item dataField="IdPuerta" visible={false} />
                        <Item dataField="IdEquipos" visible={false} />

                    </GroupItem>
                </Form>

            </PortletBody>
        </>
    );

};

export default injectIntl(EquipoCheckListPage);
