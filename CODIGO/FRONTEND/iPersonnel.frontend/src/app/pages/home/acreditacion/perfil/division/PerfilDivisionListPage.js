import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { DataGrid, Column, Button as ColumnButton, Summary, TotalItem } from "devextreme-react/data-grid";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";

import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { isNotEmpty } from "../../../../../../_metronic";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";


const PerfilDivisionListPage = props => {

  const { intl, showEditForm, setLoading } = props;

  const editarRegistro = evt => {
    props.editarRegistro(evt.row.data);

  };
  const editarRegistroRequisito = evt => {
    props.editarRegistroRequisito(evt.row.data);

  };
  const eliminarRegistro = (evt) => {
    props.eliminarRegistro(evt.row.data);
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

  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  }

  useEffect(() => {
    //obtenerDivisiones();
  }, []);


  return (
    <>
      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={3}
        toolbar={
          <PortletHeader
            title=""
            toolbar={
              <PortletHeaderToolbar>
                <Button icon="plus"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.NEW" })}
                  onClick={props.nuevoRegistro} />
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
        } />
      <PortletBody>

        <DataGrid
          dataSource={props.dataSource}
          showBorders={true}
          focusedRowEnabled={true}
          repaintChangesOnly={true}
          keyExpr="RowIndex"
          onCellPrepared={onCellPrepared}
          onFocusedRowChanged={seleccionarRegistro}
          focusedRowKey={props.focusedRowKey}
        >

          <Column dataField="RowIndex" caption="#" width={"5%"} alignment={"center"} />
          <Column dataField="IdDivision" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"30%"} alignment={"left"} />
          <Column dataField="Division" caption={intl.formatMessage({ id: "ACCREDITATION.PROFILE.DIVISION" })} width={"30%"} alignment={"left"} />
          <Column dataField="DiasPermanencia" caption={intl.formatMessage({ id: "ACCREDITATION.PROFILE.DIAPERMANECIA" })} width={"30%"} alignment={"center"} />
          <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />
          <Column type="buttons" width={105} visible={props.showButtons} >
            <ColumnButton icon="exportselected" hint={intl.formatMessage({ id: "SYSTEM.CONFIGURATION" }) + " " + intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.MAINTENANCE" })} onClick={editarRegistroRequisito} />
            <ColumnButton icon="edit" hint={intl.formatMessage({ id: "ACTION.EDIT" }) + " " + intl.formatMessage({ id: "SYSTEM.DIVISION" })} onClick={editarRegistro} />
            <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE" }) + " " + intl.formatMessage({ id: "SYSTEM.DIVISION" })} onClick={eliminarRegistro} />
          </Column>
          <Summary>
            <TotalItem
            cssClass="classColorPaginador_"
              column="IdDivision"
              summaryType="count"
              displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
            />
          </Summary>

        </DataGrid>
      </PortletBody>
    </>
  );

};

export default injectIntl(WithLoandingPanel(PerfilDivisionListPage));
