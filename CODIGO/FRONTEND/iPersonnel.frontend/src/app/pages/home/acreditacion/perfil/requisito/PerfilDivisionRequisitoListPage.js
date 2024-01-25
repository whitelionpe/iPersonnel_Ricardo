import React, { useState, useEffect } from "react";
import { DataGrid, Column, Button as ColumnButton, MasterDetail, Paging, Pager, } from "devextreme-react/data-grid";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { isNotEmpty, TYPE_TIPO_REQUISITO } from "../../../../../../_metronic";
import PerfilDivisionRequisitoDatoEvaluarListPage from "./PerfilDivisionRequisitoDatoEvaluarListPage";
import Tooltip from '@material-ui/core/Tooltip';
import Badge from '@material-ui/core/Badge';


const PerfilDivisionRequisitoListPage = props => {
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


  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt[0]);
  }

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


  function cellRenderImage(param) {
    if (param && param.data) {
      const { TipoRequisito } = param.data;

      if (TipoRequisito === TYPE_TIPO_REQUISITO.AUTORIZADOR) {
        return <Tooltip title={<span style={{ fontSize: "15px" }}> {intl.formatMessage({ id: "ACCREDITATION.PROFILE.ENTITY.AUTHORIZER" })} </span>} >
          <Badge badgeContent={""} overlap="circle" color="secondary" />
        </Tooltip>
      }
      else if (TipoRequisito === TYPE_TIPO_REQUISITO.SOLICITANTE) {
        return <Tooltip title={<span style={{ fontSize: "15px" }}> {intl.formatMessage({ id: "ACCREDITATION.PROFILE.ENTITY.APPLICANT" })} </span>} >
          <Badge badgeContent={""} overlap="circle" color="primary" />
        </Tooltip>
      }
    }
  }

  useEffect(() => {
    // props.cargarInformacion();
  }, []);

  return (
    <>
      {props.showButton && (
        <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={4}
          toolbar={
            <PortletHeader
              title=""
              toolbar={
                <PortletHeaderToolbar>
                  <PortletHeaderToolbar>
                    <Button icon="plus" type="default" hint={intl.formatMessage({ id: "ACTION.NEW" })} onClick={props.nuevoRegistro} />
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
          dataSource={props.dataSource}
          showBorders={true}
          focusedRowEnabled={true}
          repaintChangesOnly={true}

          keyExpr="RowIndex"
          onCellPrepared={onCellPrepared}
          onSelectionChanged={seleccionarRegistro}

        >
          <Column
            dataField=""
            // caption={intl.formatMessage({ id: "" })} 
            width={50}
            alignment="center"
            cellRender={cellRenderImage}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false} />
          <Column dataField="RowIndex" caption="#" width={"5%"} alignment={"center"} />
          <Column dataField="IdRequisito" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"20%"} alignment={"left"} />
          <Column dataField="Requisito" caption={intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT" })} alignment={"left"} />
          <Column dataField="Orden" caption={intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.ORDER" })} width={"10%"} alignment={"center"} />
          <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />
          <Column type="buttons" width={105} visible={props.showButtons} >
            {/* <ColumnButton icon="rowfield" hint={intl.formatMessage({ id: "ACCREDITATION.PROFILE.REQUIREMENT.DATAEVALUATE.ADD", })} onClick={nuevoRegistroDivision} /> */}
            <ColumnButton icon="edit" hint={intl.formatMessage({ id: "ACTION.EDIT", })} onClick={editarRegistro} />
            <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarRegistro} />
          </Column>


          <Pager showPageSizeSelector={true} />
          <Paging defaultPageSize={20} />

        </DataGrid>
      </PortletBody>
    </>
  );
};

export default injectIntl(WithLoandingPanel(PerfilDivisionRequisitoListPage));
