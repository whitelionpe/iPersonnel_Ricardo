import React, { useState } from "react";
import {
  DataGrid, Column, Editing, Button as ColumnButton,
  FilterRow, HeaderFilter, FilterPanel,
  Summary, TotalItem,
} from "devextreme-react/data-grid";

import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import { isNotEmpty } from "../../../../../_metronic";
import { listarTipoDatoEvaluar } from "../../../../../_metronic/utils/utils";

const DatosEvaluarListPage = props => {
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

  const obtenerDescripcionTipo = (param) => {
    if (param && param.data) {
      let lstTipos = listarTipoDatoEvaluar();
      let filtro = lstTipos.find(x => x.Valor == param.data.Tipo);

      if (filtro != undefined) {
        return (isNotEmpty(filtro.Descripcion) ? filtro.Descripcion : "");
      }
      return "";
    }
  }

  const seleccionarRegistroDblClick = evt => {
    if (evt.data === undefined) return;
    if (isNotEmpty(evt.data)) {
      props.verRegistroDblClick(evt.data);
    };
  }


  const seleccionarRegistro = evt => {
    ////console.log("evento",evt);
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  }

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  return (
    <>

      <PortletHeader
        title={intl.formatMessage({ id: "ACTION.LIST" })}
        toolbar={
          <PortletHeaderToolbar>
           
              <Button icon="plus" type="default" hint={intl.formatMessage({ id: "ACTION.NEW" })} onClick={props.nuevoRegistro} />
           
          </PortletHeaderToolbar>
        }
      />

      <PortletBody>
        <DataGrid
          dataSource={props.datosEvaluar}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          onCellPrepared={onCellPrepared}
          onRowDblClick={seleccionarRegistroDblClick}
          onFocusedRowChanged={seleccionarRegistro}
          //remoteOperations={true}
          focusedRowKey={props.focusedRowKey}
          repaintChangesOnly={true}
        >
          <FilterRow visible={true} showOperationChooser={false} />
          <HeaderFilter visible={false} />
          <FilterPanel visible={false} />
          <Column dataField="RowIndex" caption="#" width={"5%"} alignment={"center"} />
          <Column dataField="IdDatoEvaluar" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"20%"} alignment={"left"} />
          <Column dataField="DatoEvaluar" caption={intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE" })} width={"37%"} alignment={"left"} />
          <Column dataField="Tipo" caption={intl.formatMessage({ id: "ACCREDITATION.DATEEVALUATE.TYPE" })} width={"15%"} alignment={"left"} cellRender={obtenerDescripcionTipo} />
          <Column dataField="Entidad" caption={intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.ENTITY" })} width={"20%"} alignment={"left"} />
          <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"8%"} />
          <Column type="buttons" width={"7%"} visible={props.showButtons} >
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

        </DataGrid>
      </PortletBody>
    </>
  );

};

export default injectIntl(DatosEvaluarListPage);
