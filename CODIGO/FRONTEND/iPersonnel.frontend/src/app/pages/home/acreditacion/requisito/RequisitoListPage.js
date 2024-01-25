import React, { useState } from "react";
import {
  DataGrid, Column, Editing, Button as ColumnButton, MasterDetail,
  FilterRow, HeaderFilter, FilterPanel, Summary, TotalItem,
} from "devextreme-react/data-grid";

import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";

import { isNotEmpty } from "../../../../../_metronic";

import { listarTipoRequisito } from "../../../../../_metronic/utils/utils";

const RequisitoListPage = props => {
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
      let lstTipos = listarTipoRequisito();
      let filtro = lstTipos.find(x => x.Valor == param.data.TipoRequisito);

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
            <PortletHeaderToolbar>
              <Button icon="plus" type="default" hint={intl.formatMessage({ id: "ACTION.NEW" })} onClick={props.nuevoRegistro} />
            </PortletHeaderToolbar>
          </PortletHeaderToolbar>
        }
      />

      <PortletBody>
        <DataGrid
          dataSource={props.datosEvaluar}
          showBorders={true}
          focusedRowEnabled={true}
          repaintChangesOnly={true}
          keyExpr="RowIndex"
          onCellPrepared={onCellPrepared}
          onRowDblClick={seleccionarRegistroDblClick}
          onFocusedRowChanged={seleccionarRegistro}
          focusedRowKey={props.focusedRowKey}

        >
          <FilterRow visible={true} showOperationChooser={false} />
          <HeaderFilter visible={false} />
          <FilterPanel visible={false} />
          <Column dataField="RowIndex" caption="#" width={"5%"} alignment={"center"} allowSorting={false} allowFiltering={false} allowHeaderFiltering={false} />
          <Column dataField="IdRequisito" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"15%"} alignment={"left"} />
          <Column dataField="Requisito" caption={intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT" })} width={"30%"} alignment={"left"} />
          <Column dataField="Entidad" caption={intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.ENTITY" })} width={"20%"} alignment={"left"} />
          <Column dataField="TipoRequisito" caption={intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.TYPE" })} cellRender={obtenerDescripcionTipo} width={"20%"} alignment={"left"} />
          <Column dataField="Orden" caption={intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.ORDER" })} width={"10%"} alignment={"center"} />
          <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />
          <Column type="buttons" width={95} visible={props.showButtons} >
            <ColumnButton icon="edit" hint={intl.formatMessage({ id: "ACTION.EDIT", })} onClick={editarRegistro} />
            <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarRegistro} />
          </Column>

          <Summary>
            <TotalItem
            cssClass="classColorPaginador_"
              column="IdRequisito"
              summaryType="count"
              displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
            />
          </Summary>

        </DataGrid>
      </PortletBody>
    </>
  );

};

export default injectIntl(RequisitoListPage);
