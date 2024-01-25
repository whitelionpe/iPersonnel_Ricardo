import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem, Button as ColumnButton } from "devextreme-react/data-grid";

import { Button, Form } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../_metronic";
import { Popup } from 'devextreme-react/popup';
//import ScrollView from 'devextreme-react/scroll-view';
import HorarioDetalleListPage from "../horario/HorarioDetalleListPage";

const GrupoListPage = props => {
  const { intl, accessButton } = props;

  const [isVisibleDetalleHorario, setisVisibleDetalleHorario] = useState(false);

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
    //console.log("seleccionarRegistro|evt:",evt);
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  }

  const seleccionarRegistroDblClick = evt => {
    if (evt.data === undefined) return;
    if (isNotEmpty(evt.data)) {
      props.verRegistroDblClick(evt.data);
    };
  }

  function verDetalleHorario(e) {
    props.verDetalleHorario(e.row.data);
    setTimeout(function () { //Start the timer
      setisVisibleDetalleHorario(true);
    }.bind(this), 1500)
  }

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  }

  return (
    <>
      <PortletHeader
        title={intl.formatMessage({ id: "ACTION.LIST" })}
        toolbar={
          <PortletHeaderToolbar>
            <PortletHeaderToolbar>
              <Button
                icon="plus"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.NEW" })}
                onClick={props.nuevoRegistro}
                disabled={!accessButton.nuevo} />
            </PortletHeaderToolbar>
          </PortletHeaderToolbar>
        }
      />
      <PortletBody>

        <DataGrid
          dataSource={props.grupos}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          onEditingStart={editarRegistro}
          onRowRemoving={eliminarRegistro}
          onFocusedRowChanged={seleccionarRegistro}
          focusedRowKey={props.focusedRowKey}
          onRowDblClick={seleccionarRegistroDblClick}
          onCellPrepared={onCellPrepared}
          repaintChangesOnly={true}
        >
          <Editing
            mode="row"
            useIcons={true}
            allowUpdating={true}
            allowDeleting={true}
            texts={textEditing}
          />
          <Column dataField="IdGrupo" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"20%"} alignment={"center"} />
          <Column dataField="Grupo" caption={intl.formatMessage({ id: "ACCESS.GROUP" })} width={"40%"} />

          <Column type="buttons" width={"3%"}>
            <ColumnButton
              icon="clock"
              hint={intl.formatMessage({ id: "ACCES.GROUP.SEESCHEDULE" })}
              onClick={verDetalleHorario}
            />
          </Column>
          <Column dataField="Horario" caption={intl.formatMessage({ id: "ACCESS.GROUP.SCHEDULE" })} />

          <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />
          <Column type="buttons">
            <ColumnButton name="edit" />
            <ColumnButton name="delete" />
          </Column>

          <Summary>
            <TotalItem
            cssClass="classColorPaginador_"
              column="IdGrupo"
              summaryType="count"
              displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
            />
          </Summary>
        </DataGrid>
      </PortletBody>



      <Popup
        visible={isVisibleDetalleHorario}
        onHiding={() => setisVisibleDetalleHorario(!isVisibleDetalleHorario)}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        title={intl.formatMessage({ id: "ACCESS.GROUP.POPUP.SCHEDULES" })}
        width={"80%"}
        height={"70%"}
      >
      
        <div style={{overflowY:"auto", height:"99%" }}>
          
          <HorarioDetalleListPage
            showHeaderInformation={false}
            horarioDias={props.dataDetalleHorarios}
            showButtons={false}
            getInfo={props.getInfo}
            cancelarEdicion={()=>setisVisibleDetalleHorario(false)}
          />
        </div>
      </Popup>


    </>
  );
};

export default injectIntl(GrupoListPage);
