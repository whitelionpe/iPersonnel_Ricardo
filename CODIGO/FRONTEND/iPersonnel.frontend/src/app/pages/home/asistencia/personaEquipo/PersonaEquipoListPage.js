import React, { useState } from "react";
import { injectIntl } from "react-intl";
// import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../_metronic";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { DataGrid, Column, Editing,Summary, TotalItem, Button as ColumnButton, Paging, Selection, FilterRow } from "devextreme-react/data-grid";
import { Popup } from 'devextreme-react/popup';

const PersonaEquipoListPage = props => {

    const { intl, accessButton } = props;
    const [isVisiblePopUpEquipos, setisVisiblePopUpEquipos] = useState(false);

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

    const obtenerCampoDerechoLaboral= rowData => {
      return rowData.DerechoLaboral === "S";
  }

    // const seleccionarRegistro = evt => {
    //     if (evt.rowIndex === -1) return;
    //     if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);

    // }

    const seleccionarRegistro = evt => {
      props.seleccionarRegistro(evt.data);
    }
  

    // const seleccionarRegistroDblClick = evt => {
    //     if (evt.data === undefined) return;
    //     if (isNotEmpty(evt.data)) {
    //         props.verRegistroDblClick(evt.data);
    //     };
    // }

    function VerEquipos(e) {
      props.listarEquiposPorPersona(e.row.data);
      setTimeout(function () {
        setisVisiblePopUpEquipos(true);    
      }, 300);
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
    return (
        <>
          <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={2}
                toolbar={
                    <PortletHeader
                        title={""}
                        toolbar={
                            <PortletHeaderToolbar>
                                <Button
                                    icon="plus"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                    onClick={props.nuevoRegistro}
                                    disabled={!accessButton.nuevo}
                                />
                            &nbsp;
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
                <DataGrid
                    dataSource={props.personaEquipo}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onRowClick={seleccionarRegistro}
                    // onRowDblClick={seleccionarRegistroDblClick}
                    // focusedRowKey={props.focusedRowKey}
                    // onCellPrepared={onCellPrepared}
                    // repaintChangesOnly={true}
                >
                    <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={false}
                        allowDeleting={accessButton.eliminar}
                        texts={textEditing}
                    />

                    <Column dataField="IdPersona" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} alignment={"center"} />
                    <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.NAME" })} width={"60%"} />
                    <Column dataType="boolean" visible={false} caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />
                
                <Column type="buttons"  >
                <ColumnButton 
                icon="menu"
                hint={intl.formatMessage({ id: "ACCESS.GROUP.DEVICE.VIEW" })}
                onClick={VerEquipos}
                />
                <ColumnButton name="edit" />
                <ColumnButton name="delete" />
                </Column>

                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="IdPersona"
                            alignment="left"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>


                </DataGrid>
            </PortletBody>

   <Popup
        visible={isVisiblePopUpEquipos}
        dragEnabled={false}
        closeOnOutsideClick={true}
        showTitle={true}
        title={intl.formatMessage({ id: "ACCESS.GROUP.DEVICES" })}
        height={"550px"}
        width={"600px"}
        onHiding={() => setisVisiblePopUpEquipos(!isVisiblePopUpEquipos)}
      >
        <DataGrid
          dataSource={props.equiposPersona}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          showBorders={true}
        >
          <Editing
            mode="row"
            useIcons={false}
            allowUpdating={false}
            allowDeleting={false}
          />

          <Paging enabled={true} defaultPageSize={15} />
          <FilterRow visible={true} />
          <Column dataField="RowIndex" caption="#" width={"7%"} alignment="center" allowSearch={false} allowFiltering={false} visible={false} />
          <Column dataField="Zona" caption={intl.formatMessage({ id: "ADMINISTRATION.ZONE" })} width={"50%"} allowSearch={false} allowFiltering={false} />
          <Column dataField="Equipo" caption={intl.formatMessage({ id: "ADMINISTRATION.ZONE.DEVICE" })} width={"50%"} allowSearch={false} allowFiltering={false} />
        </DataGrid>

      </Popup>

        </>
    );
};

export default injectIntl(PersonaEquipoListPage);
