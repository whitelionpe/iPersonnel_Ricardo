import React from "react";
import {
  DataGrid, Column, Button as ColumnButton, Summary, TotalItem
} from "devextreme-react/data-grid";

import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import { isNotEmpty } from "../../../../../_metronic";

const PerfilListPage = props => {
  const { intl } = props;

  const editarRegistro = evt => {
    props.editarRegistro(evt.row.data);
  };

  const eliminarRegistro = (evt) => {
    props.eliminarRegistro(evt.row.data, false, 0);
  };

  const obtenerCampoActivo = rowData => {
    return rowData.Activo === "S";
  };


  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  const seleccionarRegistroDblClick = evt => {
    if (evt.data === undefined) return;
    if (isNotEmpty(evt.data)) {
      props.verRegistroDblClick(evt.data);
    };
  }

  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data)

  }
  // //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  return (
    <>

      <PortletHeader
        title={intl.formatMessage({ id: "ACTION.LIST" })}
        toolbar={
          <PortletHeaderToolbar>
            <PortletHeaderToolbar>
              <Button icon="plus" type="default" hint={intl.formatMessage({ id: "ACTION.NEW" })} onClick={props.nuevoRegistro} />
            </PortletHeaderToolbar>
          </PortletHeaderToolbar>
        }
      />

      <PortletBody>
        <DataGrid
          id="datagrid-perfil"
          keyExpr="RowIndex"
          dataSource={props.perfiles}
          showBorders={true}
          focusedRowEnabled={true}
          repaintChangesOnly={true}
          allowColumnReordering={true}
          allowColumnResizing={true}
          columnAutoWidth={true}
          focusedRowKey={props.focusedRowKey}
          onFocusedRowChanged={seleccionarRegistro}
          onCellPrepared={onCellPrepared}
          onRowDblClick={seleccionarRegistroDblClick}
        >

          <Column dataField="RowIndex" caption="#" width={"5%"} alignment={"center"} allowSorting={false} allowFiltering={false} allowHeaderFiltering={false} />
          <Column dataField="IdPerfil" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"15%"} />
          <Column dataField="Perfil" caption={intl.formatMessage({ id: "ACCREDITATION.PROFILE.MAINTENANCE" })} width={"30%"} />
          <Column dataField="Alias" caption={intl.formatMessage({ id: "SYSTEM.CUSTOMER.NICKNAME" })} width={"15%"} alignment={"center"} />
          <Column dataField="Entidad" caption={intl.formatMessage({ id: "ACCREDITATION.PROFILE.ENTITY" })} width={"15%"} />
          <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />
          <Column type="buttons" width={105} visible={props.showButtons} >
            <ColumnButton icon="edit" hint={intl.formatMessage({ id: "ACTION.EDIT", })} onClick={editarRegistro} />
            <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarRegistro} />
          </Column>
          <Summary>
            <TotalItem
            cssClass="classColorPaginador_"
              column="IdPerfil"
              summaryType="count"
              displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
            />
          </Summary>
        </DataGrid>
      </PortletBody>
    </>
  );

};

export default injectIntl(PerfilListPage);
