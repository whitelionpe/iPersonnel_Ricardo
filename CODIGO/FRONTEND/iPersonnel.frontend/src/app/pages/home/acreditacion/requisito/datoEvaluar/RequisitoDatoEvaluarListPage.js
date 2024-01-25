import React, { useState } from "react";
import { DataGrid, Column, Editing, Button as ColumnButton, Summary, TotalItem, Paging, Pager } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";

const RequisitoDatoEvaluarListPage = props => {
  const { intl } = props;

  const editarRegistro = evt => {
    props.editarRegistro(evt.row.data);
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


  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  return (
    <>

      {props.showButton && (
        <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={3}
          toolbar={
            <PortletHeader
              title=""
              toolbar={
                <PortletHeaderToolbar>
                  <PortletHeaderToolbar>
                    <Button
                      icon="plus"
                      type="default"
                      hint={intl.formatMessage({ id: "ACTION.NEW" })}
                      onClick={props.nuevoRegistro}
                    />
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

          } />)}

      <PortletBody>
        <DataGrid
          dataSource={props.datosEvaluarDetalle}
          showBorders={true}
          focusedRowEnabled={true}
          repaintChangesOnly={true}
          allowColumnReordering={true}
          allowColumnResizing={true}
          columnAutoWidth={true}
          keyExpr="RowIndex"
          onCellPrepared={onCellPrepared}
       
        >
          {/* <Column dataField="RowIndex" caption="#" width={"5%"} alignment={"center"} /> */}
          <Column dataField="IdDatoEvaluar" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"25%"} alignment={"left"} />
          <Column dataField="DatoEvaluar" caption={intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE" })} width={"35%"} alignment={"left"} />
          <Column dataField="Activo" dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} width={"10%"} calculateCellValue={obtenerCampoActivo} />
          <Column dataField="Orden" caption={intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.ORDER" })} width={"7%"} alignment={"center"} />
          <Column type="buttons" width={"10%"} visible={props.showButton} >
            <ColumnButton icon="edit" hint={intl.formatMessage({ id: "ACTION.EDIT", })} onClick={editarRegistro} />
            <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarRegistro} />
          </Column>
          <Summary>
            <TotalItem
            cssClass="classColorPaginador_"
              column="IdDatoEvaluar"
              summaryType="count"
              displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
            />
          </Summary>
          <Pager showPageSizeSelector={true} />
          <Paging defaultPageSize={20} />
        </DataGrid>
      </PortletBody>
    </>
  );

};

export default injectIntl(RequisitoDatoEvaluarListPage);
