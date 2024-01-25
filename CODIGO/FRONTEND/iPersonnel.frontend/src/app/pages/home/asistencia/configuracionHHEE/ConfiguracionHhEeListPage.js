import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../_metronic";
//import AsistenciaJustificacionImportar from "../../../../partials/components/AsistenciaJustificacionImportar";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";


const ConfiguracionHhEeListPage = props => {
    const { intl, accessButton, companiaData, changeValueCompany, varIdCompania, setVarIdCompania, setFocusedRowKey } = props;
    //const [isVisiblePopUpImportar, setisVisiblePopUpImportar] = useState(false);

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

    const seleccionarRegistro = evt => {
        if (evt.rowIndex === -1) return;
        if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
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

    function onCellPrepared(e) {
        if (e.rowType === 'data') {
            if (e.data.Activo === 'N') {
                e.cellElement.style.color = 'red';
            }
        }
    }

    // function showPopUp() {
    //     setisVisiblePopUpImportar(true);
    // }

    // function importarJustificaciones(listJustificaciones) {
    //     props.importarJustificaciones(listJustificaciones);
    //     setisVisiblePopUpImportar(false);
    //     handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.IMPORT" }));
    // }

    async function getCompanySeleccionada(idCompania, company) {
        if (isNotEmpty(idCompania)) {
            setVarIdCompania(idCompania);
            changeValueCompany(company[0]);
        } else {
            changeValueCompany(null);
        }
    }

    useEffect(() => {
        if (!isNotEmpty(varIdCompania)) {
            if (companiaData.length > 0) {
                const { IdCompania } = companiaData[0];
                var company = companiaData.filter(x => x.IdCompania === IdCompania);
                getCompanySeleccionada(IdCompania, company);
            }
        }
    }, [companiaData]);


    return (
        <>
            <PortletHeader
                title={
                    <Form >
                        <GroupItem itemType="group" colSpan={2}>
                            <Item
                                dataField="IdCompania"
                                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }) }}
                                editorType="dxSelectBox"
                                editorOptions={{
                                    items: companiaData,
                                    valueExpr: "IdCompania",
                                    displayExpr: "Compania",
                                    showClearButton: true,
                                    value: varIdCompania,
                                    onValueChanged: (e) => {
                                        if (isNotEmpty(e.value)) {
                                            var company = companiaData.filter(x => x.IdCompania === e.value);
                                            getCompanySeleccionada(e.value, company);
                                            setFocusedRowKey();
                                        } else {
                                            setVarIdCompania("");
                                            getCompanySeleccionada(null, "");
                                            setFocusedRowKey();
                                        }
                                    },
                                }}
                            />
                        </GroupItem>

                    </Form>}
                toolbar={
                    <PortletHeaderToolbar>
                        <Button
                            icon="plus"
                            type="default"
                            hint={intl.formatMessage({ id: "ACTION.NEW" })}
                            onClick={props.nuevoRegistro}
                            disabled={isNotEmpty(varIdCompania) ? false : true}

                        />
                        &nbsp;
                        {/* <Button
                            icon="movetofolder"
                            type="default"
                            hint={intl.formatMessage({ id: "ACTION.IMPORT" })}
                            onClick={showPopUp}
                            disabled={isNotEmpty(varIdCompania) ? false : true}
                        /> */}
                    </PortletHeaderToolbar>
                }
            />


            <PortletBody>
                <DataGrid
                    dataSource={props.justificaciones}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onFocusedRowChanged={seleccionarRegistro}
                    focusedRowKey={props.focusedRowKey}
                    onCellPrepared={onCellPrepared}
                    repaintChangesOnly={true}
                    allowColumnReordering={true}
                    allowColumnResizing={true}
                    columnAutoWidth={true}
                    onRowDblClick={seleccionarRegistroDblClick}
                >
                    <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={accessButton.editar}
                        allowDeleting={accessButton.eliminar}
                        texts={textEditing}
                    />
                    <Column dataField="IdConfiguracionHHEE" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} alignment={"center"} />
                    <Column dataField="TipoHoraExtra" caption={intl.formatMessage({ id: "ASSISTANCE.OVERTIME.TYPE" })} width={"17%"} />
                    <Column dataField="DiaLaborable" caption={intl.formatMessage({ id: "ASSISTANCE.WEEKDAY" })} width={"9%"} alignment={"center"} />
                    <Column dataField="Feriado" caption={intl.formatMessage({ id: "ADMINISTRATION.HOLIDAY" })} width={"6%"} alignment={"center"} />
                    <Column dataField="HorarioSemanal" caption={intl.formatMessage({ id: "ASSISTANCE.DAY.ACTIVITY" })} width={"12%"} alignment={"center"} />
                    <Column dataField="Domingo" caption={intl.formatMessage({ id: "ASSISTANCE.DAY.ACTIVITY.SUNDAY" })} width={"7%"} alignment={"center"} />
                    <Column dataField="RangoInicio" caption={intl.formatMessage({ id: "ASSISTANCE.RANGE.START" })} width={"10%"} alignment={"center"} />
                    <Column dataField="RangoFin" caption={intl.formatMessage({ id: "ASSISTANCE.RANGE.END" })} width={"10%"} alignment={"center"} />
                    <Column dataField="Orden" caption={intl.formatMessage({ id: "SYSTEM.MODULE.ORDER" })} width={"6%"} alignment={"center"} />

                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"5%"} />
                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="TipoHoraExtra"
                            alignment="left"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>
                </DataGrid>
            </PortletBody>
            {/* 
            {isVisiblePopUpImportar && (
                <AsistenciaJustificacionImportar
                    showPopup={{ isVisiblePopUp: isVisiblePopUpImportar, setisVisiblePopUp: setisVisiblePopUpImportar }}
                    cancelar={() => setisVisiblePopUpImportar(false)}
                    importarJustificaciones={importarJustificaciones}
                    selectionMode={"multiple"}
                    showButton={true}
                    selected={props.selectedCompany}
                    dataRowEditNew={props.dataRowEditNew}
                    setisVisiblePopUpImportar={setisVisiblePopUpImportar}
                    companiaData={companiaData}
                />
            )} */}

        </>
    );
};





export default injectIntl(WithLoandingPanel(ConfiguracionHhEeListPage));
