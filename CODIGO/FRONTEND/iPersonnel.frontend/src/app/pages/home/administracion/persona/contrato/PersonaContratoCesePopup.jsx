import { Button, Popup } from 'devextreme-react';
import { EmptyItem, Form, GroupItem, Item } from 'devextreme-react/form';
import React from 'react';
import { Portlet, PortletHeader, PortletHeaderToolbar } from '../../../../../partials/content/Portlet';
import PersonaContratoMotivoCese from './PersonaContratoMotivoCese';

const PersonaContratoCesePopup = ({
    intl,
    showPopup,
    height = "600px",
    width = "600px",
    dataRowEditNew = {},
    setDataRowEditNew,
    motivosCese = [],
    saveEvent
}) => {

    const optionDefaults = {
        editorOptions: {
            readOnly: true,
            hoverStateEnabled: false,
            inputAttr: { 'style': 'text-transform: uppercase' },
        }
    }

    const aceptar = (e) => {

        console.log("Se actualiza", { dataRowEditNew });
        showPopup.setisVisiblePopUp(false);
        saveEvent(dataRowEditNew);


    }

    return (
        <>
            <Popup
                visible={showPopup.isVisiblePopUp}
                dragEnabled={false}
                closeOnOutsideClick={true}
                showTitle={true}
                height={height}
                width={width}
                title={(intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONTRACT.TITLE.CESE" })).toUpperCase()}
                onHiding={() =>
                    showPopup.setisVisiblePopUp(!showPopup.isVisiblePopUp)
                }
            >
                <Portlet>

                    <PortletHeader
                        title={""}
                        toolbar={
                            <PortletHeaderToolbar>
                                <Button
                                    icon="todo" //icon="fa fa-save"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.ACCEPT" })}
                                    onClick={aceptar}
                                    useSubmitBehavior={true}
                                // disabled={customDataGridIsBusy}
                                />
                                &nbsp;
                                <Button
                                    icon="fa fa-times-circle"
                                    type="normal"
                                    hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                                    onClick={() => showPopup.setisVisiblePopUp(false)}
                                />
                            </PortletHeaderToolbar>
                        }
                    />
                    <Form formData={dataRowEditNew}
                        validationGroup="FormEdicion"
                        id="editFormPCCP"
                        labelLocation="top" >
                        <GroupItem itemType="group" colCount={2} colSpan={2}>
                            <Item
                                dataField="CompaniaContratista"
                                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }) }}
                                // editorOptions={{
                                //     readOnly: true,
                                //     hoverStateEnabled: false,
                                //     inputAttr: { 'style': 'text-transform: uppercase' },
                                // }}
                                {...optionDefaults}
                            />

                            <Item dataField="CompaniaMandante"
                                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CLIENTCOMPANY.ABR" }) }}

                                // editorOptions={{
                                //     readOnly: true,
                                //     hoverStateEnabled: false,
                                //     inputAttr: { 'style': 'text-transform: uppercase' },
                                // }}
                                {...optionDefaults}
                            />

                            <Item
                                dataField="IdContrato"
                                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" }) }}

                                // editorOptions={{
                                //     readOnly: true,
                                //     hoverStateEnabled: false,
                                //     inputAttr: { 'style': 'text-transform: uppercase' },
                                // }}
                                {...optionDefaults}
                            />

                            <Item dataField="Contrato"
                                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBJECT" }) }}

                                // editorOptions={{
                                //     readOnly: true,
                                //     hoverStateEnabled: false,
                                //     inputAttr: { 'style': 'text-transform: uppercase' },
                                // }}
                                {...optionDefaults}
                            />

                            <Item
                                dataField="Division"
                                label={{ text: intl.formatMessage({ id: "SYSTEM.DIVISION" }) }}

                                // editorOptions={{
                                //     readOnly: true,
                                //     hoverStateEnabled: false,
                                //     inputAttr: { 'style': 'text-transform: uppercase' },
                                // }}
                                {...optionDefaults}
                            />

                            <Item
                                dataField="UnidadOrganizativa"
                                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.ORGANIZATIONALUNIT" }) }}

                                // editorOptions={{
                                //     readOnly: true,
                                //     hoverStateEnabled: false,
                                //     inputAttr: { 'style': 'text-transform: uppercase' },
                                // }}
                                {...optionDefaults}
                            />

                            <Item dataField="FechaInicio"
                                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" }) }}
                                dataType="date"
                                editorType="dxDateBox"
                                editorOptions={{
                                    readOnly: true,
                                    hoverStateEnabled: false,
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                    displayFormat: "dd/MM/yyyy",
                                }}
                            />

                            <Item dataField="FechaFin"
                                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" }) }}
                                dataType="date"
                                editorType="dxDateBox"
                                editorOptions={{
                                    readOnly: true,
                                    hoverStateEnabled: false,
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                    displayFormat: "dd/MM/yyyy",
                                }}
                            />
                            <Item />


                        </GroupItem>

                        <GroupItem itemType="group" colCount={2} colSpan={2}>
                            <GroupItem colSpan={2} >
                                <fieldset className="scheduler-border" >
                                    <legend className="scheduler-border" >
                                        <h5>{intl.formatMessage({ id: "ADMINISTRATION.REASONCEASE" })} </h5>
                                    </legend>
                                    <Form formData={dataRowEditNew} validationGroup="FormEdicion">
                                        <Item
                                            dataField="IdMotivoCese"
                                            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.REASONCEASE" }) }}
                                            editorType="dxSelectBox"
                                            isRequired={true}
                                            editorOptions={{
                                                items: motivosCese,
                                                valueExpr: "IdMotivoCese",
                                                displayExpr: "MotivoCese",
                                                readOnly: false
                                            }}
                                        />
                                        <EmptyItem />
                                    </Form>
                                </fieldset>
                            </GroupItem>
                        </GroupItem>
                    </Form>

                </Portlet>
            </Popup>
        </>
    );
};

export default PersonaContratoCesePopup;