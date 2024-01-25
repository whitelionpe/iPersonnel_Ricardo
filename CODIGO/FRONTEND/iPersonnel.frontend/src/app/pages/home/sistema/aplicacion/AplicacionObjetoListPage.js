import React, { useState } from "react";
import { injectIntl } from "react-intl";
// import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../_metronic";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { DataGrid, Column, Editing, Summary, TotalItem, Button as ColumnButton, Paging, Selection, FilterRow } from "devextreme-react/data-grid";
import { Popup } from 'devextreme-react/popup';

const AplicacionObjetoListPage = props => {

  const { intl, accessButton } = props;

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

  /*  const seleccionarRegistro = evt => {
     props.seleccionarRegistro(evt.data);
   } */

  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);

  };

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
      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
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
          dataSource={props.aplicacionObjeto}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          focusedRowKey={props.focusedRowKey}
          onEditingStart={editarRegistro}
          onRowRemoving={eliminarRegistro}
          onFocusedRowChanged={seleccionarRegistro}
          onCellPrepared={onCellPrepared}
        >
          <Editing
            mode="row"
            useIcons={true}
            allowUpdating={true}
            allowDeleting={accessButton.eliminar}
            texts={textEditing}
          />

          <Column dataField="IdObjeto" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} alignment={"center"} />
          <Column dataField="Objeto" caption={intl.formatMessage({ id: "SYSTEM.APLICATION.OBJECT" })} width={"70%"} />
          <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />
          <Summary>
            <TotalItem
            cssClass="classColorPaginador_"
              column="IdObjeto"
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

export default injectIntl(AplicacionObjetoListPage);
