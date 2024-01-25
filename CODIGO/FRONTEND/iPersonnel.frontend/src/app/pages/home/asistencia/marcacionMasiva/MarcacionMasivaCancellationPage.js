import React, { useEffect, useState } from 'react';
import { injectIntl } from "react-intl";
import { Button, DataGrid, Form } from "devextreme-react";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import WithLoandingPanel from "../../../../partials/content/withLoandingPanel";
import { Column, Editing, Selection, Summary, TotalItem } from 'devextreme-react/data-grid';
import { GroupItem, Item } from 'devextreme-react/form';
import { isNotEmpty, listarEstadoSimple } from '../../../../../_metronic';
import PersonaTextAreaPopup from '../../../../partials/components/PersonaTextAreaPopup/PersonaTextAreaPopup';
import AdministracionPersonaBuscar from '../../../../partials/components/AdministracionPersonaBuscar';

const MarcacionMasivaCancellationPage = props => {

    const { intl, setLoading, dataMenu } = props;
    const [estadoSimple, setEstadoSimple] = useState([]);
    const [isVisiblePopUpPersonas, setisVisiblePopUpPersonas] = useState(false);

    const [selectedRow, setSelectedRow] = useState([]);


    async function cargarCombos() {
        //let estado = listarEstado();
        //setEstado(estado);
        let estadoSimple = listarEstadoSimple();
        setEstadoSimple(estadoSimple);
    }

    async function agregarPersonaAdministrador(personas) {
        //setLoading(true);
        props.dataRowEditNew.ListaPersona = personas.map(x => ({ IdPersona: x.IdPersona, NombreCompleto: x.NombreCompleto }));
        let cadenaMostrar = personas.map(x => (x.NombreCompleto)).join(', ');

        if (cadenaMostrar.length > 100) {
            cadenaMostrar = cadenaMostrar.substring(0, 100) + '...';
        }
        props.dataRowEditNew.ListaPersonaView = cadenaMostrar;
        setisVisiblePopUpPersonas(false);
    }


    const seleccionarRegistro = (evt) => {
        if (evt.selectedRowsData !== undefined) {
            console.log("evt.selectedRowsData:> ", evt.selectedRowsData);
            if (isNotEmpty(evt.selectedRowsData)) setSelectedRow(evt.selectedRowsData);
        }
    }

    const cancelarJustificacion =() =>{
        props.grabarCancelacionMarcacion(selectedRow);

    }

    useEffect(() => {
        cargarCombos();
    }, []);


    return (
        <>
            <HeaderInformation
                visible={true} labelLocation={'left'} colCount={6}
                data={props.getInfo()} 
                toolbar={
                    <PortletHeader
                        title={""}
                        toolbar={
                            <PortletHeaderToolbar>
                                <Button
                                    icon="fa fa-search"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                                    onClick={props.buscarMarcacionCancelacion}
                                    useSubmitBehavior={true}
                                    validationGroup="FormEdicion"
                                />
                                &nbsp;
                                <Button icon="refresh"
                                  type="default"
                                  hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                                  onClick={props.eventoRefrescar} 
                                />
                                &nbsp;
                                <Button
                                    icon="fa fa-trash"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACCREDITATION.REQUEST.BUTTON.GRID.CANCEL" }) + " "
                                        + intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.MARCAS" })}
                                    onClick={cancelarJustificacion}
                                />
                                &nbsp;
                                {/* <Button
                                    icon="fa fa-file-excel"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
                                // onClick={exportExcel}
                                /> */} 
                                <Button
                                    icon="fa fa-times-circle"
                                    type="normal"
                                    hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                                    onClick={props.cancelarEdicion}
                                />
                            </PortletHeaderToolbar>
                        }
                    />
                }
            />

            <PortletBody>


                <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
                    <GroupItem itemType="group" colCount={4} colSpan={2}>

                        <Item
                            dataField="FechaInicio"
                            label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" }), }}
                            isRequired={true}
                            editorType="dxDateBox"
                            dataType="datetime"
                            editorOptions={{
                                displayFormat: "dd/MM/yyyy",
                            }}
                        />
                        <Item
                            dataField="FechaFin"
                            label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" }), }}
                            isRequired={true}
                            editorType="dxDateBox"
                            dataType="datetime"
                            editorOptions={{
                                displayFormat: "dd/MM/yyyy",
                            }}
                        />
                        <Item
                            dataField="Activo"
                            label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                            editorType="dxSelectBox"
                            isRequired={true}
                            editorOptions={{
                                items: estadoSimple,
                                valueExpr: "Valor",
                                displayExpr: "Descripcion",
                            }}
                        />

                        <Item
                            dataField="ListaPersonaView"
                            label={{ text: intl.formatMessage({ id: "ACCESS.REPORT.PEOPLE" }) }}
                            editorOptions={{
                                hoverStateEnabled: false,
                                inputAttr: { style: "text-transform: uppercase" },
                                showClearButton: true,
                                buttons: [
                                    {
                                        name: "search",
                                        location: "after",
                                        useSubmitBehavior: true,
                                        options: {
                                            stylingMode: "text",
                                            icon: "search",
                                            readOnly: false,
                                            onClick: (evt) => {
                                                setisVisiblePopUpPersonas(true);
                                            },
                                        },
                                    },
                                ],
                            }}
                        />

                    </GroupItem>
                </Form>
                <br />


                <DataGrid
                    dataSource={props.justificacionesData}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    repaintChangesOnly={true}
                    allowColumnReordering={true}
                    allowColumnResizing={true}
                    columnAutoWidth={true}
                    noDataText={intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.NO_DATA" })} 

                    onSelectionChanged={seleccionarRegistro}
                >

                    <Selection mode={"multiple"} />
                    {/* <Column dataField="RowIndex" caption="#" width={"5%"} alignment={"center"} /> */}
                    <Column dataField="IdPersona" caption={intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.CODIGO" })} width={"5%"} alignment={"center"} />
                    <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })} width={"20%"} alignment={"left"} />
                    <Column dataField="Documento" caption={intl.formatMessage({ id: "CASINO.REPORT.DOCUMENTNUMBER" })} width={"10%"} alignment={"center"} />
                    <Column dataField="FechaMarca" caption={intl.formatMessage({ id: "CASINO.MARKING.DATEMARKING" })} dataType="date" format="dd/MM/yyyy HH:mm"  width={"16%"} alignment={"center"} /> 
                    <Column dataField="Observacion" caption={intl.formatMessage({ id: "COMMON.OBSERVATION" })}  width={"15%"} alignment={"left"} /> 
                    <Column dataField="Estado" caption={intl.formatMessage({ id: "COMMON.STATE" })} width={"7%"} alignment={"center"} />
                    <Column dataField="IdProcesoMasivo" caption={intl.formatMessage({ id: "SYSTEM.PROCESS" })} width={"7%"} alignment={"center"} />
                    <Column dataField="FechaCreacion" caption={intl.formatMessage({ id: "ASSISTANCE.MASSIVE.JUSTIFICATION.DATE_UPLOAD" })} dataType="date" format="dd/MM/yyyy hh:mm" width={"10%"} alignment={"center"} />
                    <Column dataField="IdUsuarioCreacion" caption={intl.formatMessage({ id: "ASSISTANCE.MASSIVE.JUSTIFICATION.USER_UPLOAD" })} width={"10%"} alignment={"center"} />
                    <Summary>
                        <TotalItem
                            cssClass="classColorPaginador_"
                            column="NombreCompleto"
                            alignment="left"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>
                </DataGrid>
            </PortletBody>


            {/* POPUP-> buscar persona */}
            {isVisiblePopUpPersonas && (
                <AdministracionPersonaBuscar
                    showPopup={{ isVisiblePopUp: isVisiblePopUpPersonas, setisVisiblePopUp: setisVisiblePopUpPersonas }}
                    cancelar={() => setisVisiblePopUpPersonas(false)}
                    agregar={agregarPersonaAdministrador}
                    selectionMode={"multiple"}
                    uniqueId={"CancelacionJustificacionPersonasBuscarAdministrador"}
                />
            )}



        </>
    );

};

export default injectIntl(WithLoandingPanel(MarcacionMasivaCancellationPage));







