import { Form } from 'devextreme-react';
import { GroupItem, Item } from 'devextreme-react/form';
import React from 'react';

const PersonaContratoPosicionDetalle = ({
    dataRowEditNew,
    intl
}) => {
    return (
        <Form formData={dataRowEditNew} validationGroup="FormEdicion">
            <GroupItem itemType="group" colCount={2} >

                <GroupItem itemType="group" colCount={2} colSpan={2}>

                    <Item dataField="PersonaPosicionPadre"
                        label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.POSITION.FATHER" }) }}
                        colSpan={1}
                        editorOptions={{
                            readOnly: true,
                            inputAttr: { 'style': 'text-transform: uppercase' }
                        }}
                    />

                    <Item dataField="PosicionPadre"
                        label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.POSITION.FATHER.POSITION" }) }}
                        colSpan={1}
                        editorOptions={{
                            readOnly: true,
                            inputAttr: { 'style': 'text-transform: uppercase' }
                        }}
                    />
                </GroupItem>

                <GroupItem itemType="group" colSpan={2}>

                    <Item
                        dataField="Contratista"
                        label={{
                            text: "Check",
                            visible: false
                        }}
                        editorType="dxCheckBox"
                        editorOptions={{
                            value:
                                dataRowEditNew.Contratista === "S" ? true : false,
                            readOnly: true,
                            text: intl.formatMessage({ id: "ACCESS.PERSON.POSITION.CONTRACTOR" }),
                            width: "100%"
                        }}
                    />

                    <Item
                        dataField="Fiscalizable"
                        label={{
                            text: "Check",
                            visible: false
                        }}
                        editorType="dxCheckBox"
                        editorOptions={{
                            value:
                                dataRowEditNew.Fiscalizable === "S" ? true : false,
                            readOnly: true,
                            text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.CONTROLLABLE" }),
                            width: "100%"
                        }}
                    />

                    <Item
                        dataField="Confianza"
                        label={{
                            text: "Check",
                            visible: false
                        }}
                        editorType="dxCheckBox"
                        editorOptions={{
                            value: dataRowEditNew.Confianza === "S" ? true : false,
                            readOnly: true,
                            text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.TRUST" }),
                            width: "100%"
                        }}
                    />

                </GroupItem>

            </GroupItem>
        </Form>
    );
};

export default PersonaContratoPosicionDetalle;