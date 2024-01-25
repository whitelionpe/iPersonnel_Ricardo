import React from "react";
import { injectIntl } from "react-intl"; 
import { DataGrid, Column, Editing, Summary, TotalItem,FilterRow  } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { isNotEmpty } from "../../../../../_metronic";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
// import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import HeaderInformation from "../../../../partials/components/HeaderInformation";

const ImportacionDetalleListPage = props => {

    const { intl, accessButton } = props;  

    const editarRegistro = evt => {
        props.editarRegistro(evt.data); 
    };

    const eliminarRegistro = evt => {
        evt.cancel = true;
        props.eliminarRegistro(evt.data);
    };

      const obtenerCampoObligatorio = rowData => {
      return rowData.Obligatorio === "S";
      }

      const obtenerCampoEditable = rowData => {
      return rowData.Editable === "S";
      }

      const obtenerCampoImportar = rowData => {
      return rowData.Importar === "S";
      }

    const seleccionarRegistro = evt => {

        if (evt.rowIndex === -1) return;
        if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
    }

    function onCellPrepared(e) {
        if (e.rowType === 'data') {
            if (e.data.Activo === 'N') {
                e.cellElement.style.color = 'red';
            }
        }
    }
    
    const textEditing = {
        confirmDeleteMessage:'',
        editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
        deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
    };

    return (
        <>

<HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
                toolbar={

                    <PortletHeader
                        title=""
                        toolbar={
                            <PortletHeaderToolbar>
                                <PortletHeaderToolbar>
                                <Button
                                       icon="columnchooser"
                                        type="default"
                                        hint={intl.formatMessage({ id: "Importar desde BD" })}
                                        onClick={props.importarFromBD} 
                                        disabled={!accessButton.nuevo} />
                                  &nbsp;
                                <Button
                                        icon="plus"
                                        type="default"
                                        hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                        onClick={props.nuevoRegistro} 
                                        disabled={!accessButton.nuevo} />
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

                } 
      />

            <PortletBody>
                <DataGrid
                  dataSource={props.importacionDetalleData}
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
                        useIcons={true}
                        allowUpdating={accessButton.editar}
                        allowDeleting={accessButton.eliminar}
                        texts={textEditing}
                    />
                    <FilterRow visible={true} showOperationChooser={false} />
                    <Column dataField="Orden" caption={intl.formatMessage({ id: "SYSTEM.IMPORT.ORDER" })} alignment={"center"} width={'8%'}  />
                    <Column dataField="Titulo" caption={intl.formatMessage({ id: "SYSTEM.IMPORT.TITLE" })} />
                    <Column dataField="Campo" caption={intl.formatMessage({ id: "SYSTEM.IMPORT.FIELD" })}  />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "SYSTEM.IMPORT.IMPORT" })} calculateCellValue={obtenerCampoImportar} width={"10%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "SYSTEM.IMPORT.REQUIRED" })} calculateCellValue={obtenerCampoObligatorio} width={"10%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "SYSTEM.IMPORT.EDITABLE" })} calculateCellValue={obtenerCampoEditable} width={"10%"} />
                    <Column dataField="TipoDato" caption={intl.formatMessage({ id: "SYSTEM.IMPORT.DATATYPE" })} alignment={"center"}  />
                    <Column dataField="TamanioDato" caption={intl.formatMessage({ id: "SYSTEM.IMPORT.DATAZISE" })} alignment={"center"}  />
                    <Column dataField="Formato" caption={intl.formatMessage({ id: "SYSTEM.IMPORT.FORMAT" })} alignment={"center"}  />

                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="Orden"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>

                </DataGrid>
            </PortletBody>
        </>
    );
};

export default injectIntl(ImportacionDetalleListPage);
