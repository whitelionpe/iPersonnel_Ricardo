import React, { useEffect } from "react";
import { DataGrid, Column, Editing, Summary, TotalItem, FilterRow, HeaderFilter, FilterPanel } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import { isNotEmpty } from "../../../../../_metronic";
import Form, { Item, GroupItem } from "devextreme-react/form";

const IntegracionInfotipoListPage = props => {
    const { intl, accessButton, companiaData, changeValueCompany,varIdCompania, setVarIdCompania, setFocusedRowKey } = props;

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
        evt.cancel = true;
        props.eliminarRegistro(evt.data);
    };

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    };

    const seleccionarRegistro = evt => {
        if (evt.rowIndex === -1) return;
        if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
    };

    /*const seleccionarRegistroDblClick = evt => {
        if (evt.data === undefined) return;
        if (isNotEmpty(evt.data)) {
            props.verRegistroDblClick(evt.data);
        };
    };*/

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

    async function getCompanySeleccionada(idCompania, company) {
        if (isNotEmpty(idCompania)) {
            setVarIdCompania(idCompania);
            changeValueCompany(company[0]);
        }else
        {
          changeValueCompany(null);
        }
    }
    
     useEffect(() => {
        if(!isNotEmpty(varIdCompania)){
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
                    <GroupItem itemType="group" colSpan={4}>
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
                                }else{
                                    setVarIdCompania("");
                                    getCompanySeleccionada(null, "");
                                    setFocusedRowKey();
                                }
                            },
                        }}
                    />
                    </GroupItem>

                    </Form>

                }
                toolbar={
                    <PortletHeaderToolbar>
                        <PortletHeaderToolbar>
                            <Button
                                icon="plus"
                                type="default"
                                hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                onClick={props.nuevoRegistro}
                                visible={true}
                            />
                        </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                }
            />

            <PortletBody>
                <DataGrid
                    dataSource={props.infotipos}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onFocusedRowChanged={seleccionarRegistro}
                    focusedRowKey={props.focusedRowKey}
                    //onRowDblClick={seleccionarRegistroDblClick}
                    onCellPrepared={onCellPrepared}
                    repaintChangesOnly={true}
                    allowColumnReordering={true}
                    allowColumnResizing={true}
                    columnAutoWidth={true}
                >
                    <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={true}
                        allowDeleting={false}
                        texts={textEditing}
                    />
                    <FilterRow visible={true} showOperationChooser={false} />
                    <HeaderFilter visible={false} />
                    <FilterPanel visible={false} />
                    <Column dataField="Tipo" caption= "Tipo" width={"10%"} alignment={"center"} />
                    <Column dataField="IdInfotipo" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} allowFiltering={true}/>
                    <Column dataField="Descripcion" caption={intl.formatMessage({ id: "COMMON.DESCRIPTION" })} width={"30%"} />
                    <Column dataField="Alias" caption="Alias" width={"30%"} />
                    <Column dataField="Unidad" caption="Unidad" width={"10%"} />
                    <Column dataType="boolean" dataField="Activo" caption="Activo" calculateCellValue={obtenerCampoActivo} width={"10%"} allowFiltering={false} />
                    
                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="Incidencia"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>
                </DataGrid>
            </PortletBody>

        </>
    );

};

export default injectIntl(IntegracionInfotipoListPage);