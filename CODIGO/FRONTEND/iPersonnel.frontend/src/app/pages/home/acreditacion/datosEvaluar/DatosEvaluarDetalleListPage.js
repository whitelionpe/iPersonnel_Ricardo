import React, { useState } from "react";
import { DataGrid, Column, Editing, Button as ColumnButton, Summary, TotalItem } from "devextreme-react/data-grid";

import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";

import HeaderInformation from "../../../../partials/components/HeaderInformation";

const DatosEvaluarDetalleListPage = props => {
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

  const obtenerAdjuntarArchivo = rowData => {
    return rowData.AdjuntarArchivo === "S";
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
        <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={2}
          toolbar={
            <PortletHeader
              title=""
              toolbar={

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
              }
            />

          } />)}

      <PortletBody>
        <DataGrid
          dataSource={props.datosEvaluarDetalle}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          onCellPrepared={onCellPrepared}

        >
          <Column dataField="RowIndex" caption="#" width={"5%"} alignment={"center"} />
          <Column dataField="IdDato" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"25%"} alignment={"left"} />
          <Column dataField="Dato" caption={intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE.DATA" })} width={"40%"} alignment={"left"} />
          <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.FILE" })} calculateCellValue={obtenerAdjuntarArchivo} width={"15%"} />
          <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"15%"} />
          <Column type="buttons" width={"7%"} visible={props.showButtons} >
            <ColumnButton icon="edit" hint={intl.formatMessage({ id: "ACTION.EDIT" })} onClick={editarRegistro} />
            <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE" })} onClick={eliminarRegistro} />
          </Column>
          <Summary>
            <TotalItem
            cssClass="classColorPaginador_"
              column="IdDato"
              summaryType="count"
              displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
            />
          </Summary>
        </DataGrid>
      </PortletBody>

    </>
  );

};

export default injectIntl(DatosEvaluarDetalleListPage);
