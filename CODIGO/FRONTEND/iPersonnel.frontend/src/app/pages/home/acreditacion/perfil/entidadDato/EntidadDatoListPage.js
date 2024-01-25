import React, { useRef } from "react";
import { injectIntl } from "react-intl";
import {
  DataGrid,
  Column,
  Editing,
  Summary,
  TotalItem
} from "devextreme-react/data-grid";

import { Button } from "devextreme-react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar
} from "../../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../../_metronic";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";

const TipoAutorizacionCompaniaListPage = props => {

  const { intl, accessButton } = props;
  const dataGridRef = useRef(null);

  const editarRegistro = evt => {
    props.editarRegistro(evt.data);
  };

  const eliminarRegistro = evt => {
    evt.cancel = true;
    props.eliminarRegistro(evt.data);
  };

  const obtenerCampoObligatorio = rowData => {
    return rowData.Obligatorio === "S";
  };

  const obtenerCampoEditable = rowData => {
    return rowData.Editable === "S";
  };


  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  };

  const textEditing = {
    confirmDeleteMessage: "",
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" })
  };

  function onCellPrepared(e) {

    if (e.rowType === "data") {
      if (e.data.Activo === "N") {
        e.cellElement.style.color = "red";
      }
    }
  }

  return (
    <>
      <HeaderInformation
        data={props.getInfo()}
        visible={true}
        labelLocation={"left"}
        colCount={3}
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
          id="datagrid-modulo"
          keyExpr="RowIndex"
          ref={dataGridRef}
          dataSource={props.entidadDatos}
          showBorders={true}
          focusedRowEnabled={true}
          repaintChangesOnly={true}
          focusedRowKey={props.focusedRowKey}
          onFocusedRowChanged={seleccionarRegistro}
          onEditingStart={editarRegistro}
          onRowRemoving={eliminarRegistro}

        >
          <Editing
            mode="row"
            useIcons={true}
            allowUpdating={accessButton.editar}
            allowDeleting={accessButton.eliminar}
            texts={textEditing}
          />

          <Column dataField="IdDato" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"20%"} />
          <Column dataField="Dato" caption={intl.formatMessage({ id: "COMMON.DESCRIPTION" })} />
          <Column dataField="Orden" caption={intl.formatMessage({ id: "SYSTEM.MODULE.ORDER" })} width={"5%"} alignment={"center"}  />
          <Column dataType="boolean" caption={intl.formatMessage({ id: "ACCREDITATION.PROFILE.ENTITY.MANDATORY" })} calculateCellValue={obtenerCampoObligatorio} width={"10%"} />
          <Column dataType="boolean" caption={intl.formatMessage({ id: "ACCREDITATION.PROFILE.ENTITY.HABILITADO" })} calculateCellValue={obtenerCampoEditable} width={"10%"} />

          <Summary>
            <TotalItem
            cssClass="classColorPaginador_"
              column="IdDato"
              alignment="left"
              summaryType="count"
              displayFormat={`${intl.formatMessage({
                id: "COMMON.TOTAL.ROW"
              })} {0}`}
            />
          </Summary>
        </DataGrid>
      </PortletBody>
    </>
  );
};

export default injectIntl(WithLoandingPanel(TipoAutorizacionCompaniaListPage));

