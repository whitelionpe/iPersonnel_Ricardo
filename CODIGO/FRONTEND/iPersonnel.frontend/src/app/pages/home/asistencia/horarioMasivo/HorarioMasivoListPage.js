import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button, Form } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { dateFormat, isNotEmpty } from "../../../../../_metronic";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
//import AsistenciaHorarioMasivoHistorial from "../../../../partials/components/AsistenciaHorarioMasivoHistorial";

import { DataGrid, Column, Editing, Summary, TotalItem, Button as ColumnButton } from "devextreme-react/data-grid";
import { GroupItem, Item } from "devextreme-react/form";

const HorarioMasivoListPage = props => {

    const { intl, dataRowEditNew, varIdCompania, companiaData, getCompanySeleccionada } = props;

    //const [isVisiblePopDetalleRequisito, setisVisiblePopDetalleRequisito] = useState(false);

    const seleccionarRegistro = evt => {
        if (evt.rowIndex === -1) return;
        if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
    }

    const seleccionarRegistroDblClick = evt => {
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
            if (e.data.CantidadPersonas === 0) {
                e.cellElement.style.color = 'red';
            }
        }
    }

    // function MostrarHistorial(e) {
    //     props.listarHistorialRequisito(e.row.data);
    //     setisVisiblePopDetalleRequisito(true);
    // }

    const getFiltrar = async () => {

        let parameterFilter = {
            FechaInicio: dateFormat(dataRowEditNew.FechaInicio, 'yyyyMMdd'),
            FechaFin: dateFormat(dataRowEditNew.FechaFin, 'yyyyMMdd'),
        }
        props.listarCargaMasivoHorario(parameterFilter);

    }

    useEffect(() => {

        if (isNotEmpty(varIdCompania)) {
            //Filtrar cambio de compania
            let parameterFilter = {
                FechaInicio: dateFormat(dataRowEditNew.FechaInicio, 'yyyyMMdd'),
                FechaFin: dateFormat(dataRowEditNew.FechaFin, 'yyyyMMdd'),
            }
            props.listarCargaMasivoHorario(parameterFilter);
        }
    }, [varIdCompania]);

    return (
        <>
            <HeaderInformation
                visible={true} labelLocation={'left'} colCount={6}
                toolbar={
                    <PortletHeader
                        title={""}
                        toolbar={
                            <PortletHeaderToolbar>
                                <Button
                                    icon="fa fa-search"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                                    onClick={getFiltrar}
                                    useSubmitBehavior={true}
                                    validationGroup="FormEdicion"
                                />
                                &nbsp;
                                <Button
                                    icon="fa flaticon2-files-and-folders"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.NEW" }) + " " + intl.formatMessage({ id: "ACTION.USED.WIZARD" })}
                                    onClick={props.nuevaAsginacionConAsistente}
                                //disabled={!accessButton.nuevo}
                                />
                                &nbsp;
                                <Button
                                    icon="fa flaticon2-clip-symbol"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.NEW" }) + " " + intl.formatMessage({ id: "ACTION.IMPORT" })}
                                    onClick={props.nuevaAsginacionImportar}
                                //disabled={!accessButton.nuevo}
                                />
                            </PortletHeaderToolbar>
                        }
                    />
                }
            />
            {/* {modoEdicion ? ( */}
            <PortletBody>
                {/*->Agregar filtro. Fecha desde to fecha hasta */}
                <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
                    <GroupItem itemType="group" colCount={4} colSpan={2}>
                        <Item colSpan={2}
                            dataField="IdCompania"
                            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }) }}
                            editorType="dxSelectBox"
                            isRequired={true}
                            editorOptions={{
                                items: companiaData,
                                valueExpr: "IdCompania",
                                displayExpr: "Compania",
                                //showClearButton: true,
                                searchEnabled: true,
                                value: varIdCompania,
                                onValueChanged: (e) => {
                                    if (isNotEmpty(e.value)) {
                                        var company = companiaData.filter(x => x.IdCompania === e.value);
                                        getCompanySeleccionada(e.value, company);
                                    }
                                }
                            }}
                        />
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
                    </GroupItem>
                </Form>
                <br />

                {/*->Mostrar resultado */}
                <DataGrid
                    dataSource={props.horarioMasivoData}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onFocusedRowChanged={seleccionarRegistro}
                    onRowDblClick={seleccionarRegistroDblClick}
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
                        allowUpdating={false}
                        allowDeleting={false}
                        texts={textEditing}
                    />
                    <Column dataField="IdProcesoMasivo" caption={intl.formatMessage({ id: "ASSISTANCE.MASSIVE.SCHEDULES.IDPROCESS" })} alignment={"center"} width={"10%"} allowSorting={false} />
                    <Column dataField="Compania" caption={intl.formatMessage({ id: "ASSISTANCE.MASSIVE.SCHEDULES.COMPANY" })} alignment={"left"} allowSorting={false} />
                    <Column dataField="Horario" caption={intl.formatMessage({ id: "ASSISTANCE.MASSIVE.SCHEDULES" })} alignment={"left"} allowSorting={false} />
                    <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} allowSorting={false} />
                    <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} allowSorting={false} />
                    <Column dataField="CantidadPersonas" caption={"# " + intl.formatMessage({ id: "ADMINISTRATION.REPORT.PEOPLES" })} width={"10%"} alignment={"center"} allowSorting={false} />
                    {/* <Column type="buttons"  >
                            <ColumnButton text="historial"
                                icon="menu"
                                hint={intl.formatMessage({ id: "ACCESS.PERSON.REQUIREMENTS.RECORD" })}
                                onClick={MostrarHistorial}
                            />
                            <ColumnButton name="edit" />
                            <ColumnButton name="delete" />
                        </Column> */}

                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="Compania"
                            alignment="left"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>
                </DataGrid>
            </PortletBody>

          
            
        </>
    );
};

export default injectIntl(HorarioMasivoListPage);
