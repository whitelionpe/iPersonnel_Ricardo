import React, { useState } from "react";
import { DataGrid, Column, Editing, Button as ColumnButton, MasterDetail, Summary, TotalItem } from "devextreme-react/data-grid";

import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";

import { confirm, custom } from "devextreme/ui/dialog";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { isNotEmpty } from "../../../../../../_metronic";

import { handleErrorMessages, handleInfoMessages } from "../../../../../store/ducks/notify-messages";

import ContratoCentroCostoListPage from "../centroCosto/ContratoCentroCostoListPage";

const ContratoUnidadOrganizativaListPage = props => {
  console.log("**ContratoUnidadOrganizativaListPage - props.UnidadesOrganizativas :> ",props.UnidadesOrganizativas);
  const { intl,accessButton} = props;

  const editarRegistro = evt => {
    console.log("+++++ editarRegistro - evt.row.data :> ",evt.row.data);
    props.editarRegistro(evt.row.data);
  };

  const eliminarRegistro = evt => {
    let data = evt.row.data;
    props.eliminarRegistro(data, false, 0);
  };

  const obtenerCampoActivo = rowData => {
    return rowData.Activo === "S";
  };

  const getAddedFromAccreditation = rowData => {
    return rowData.AgregadoPorAcreditacion === 'S' ? 'SI' : 'NO';
  };


  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  const nuevoRegistroCentroCosto = evt => {
    props.nuevoRegistroCentroCosto(evt.row.data);
  };

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  return (
    <>

      {props.showButton && (
        <HeaderInformation
          data={props.getInfo()} visible={true} labelLocation={'left'} colCount={3}
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
                </PortletHeaderToolbar>
              }
            />

          } />)}


      <PortletBody>
        <DataGrid
          dataSource={props.UnidadesOrganizativas}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          onCellPrepared={onCellPrepared}
        >
          <Column dataField="RowIndex" caption="#" width={25} alignment={"center"} />
          <Column dataField="UnidadOrganizativa" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.UNIDADORGANIZATIVA" })} width={"30%"} alignment={"left"} />
          <Column dataField="GrupoAcceso" caption={intl.formatMessage({ id: "ACCESS.PERSON.GRUPO.TAB" })} width={"20%"} alignment={"left"} />
          <Column dataField="DescripcionDotacion" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.ENDOWMENT" })} width={"15%"} alignment={"center"} />
          <Column caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.ORGANIZATIONALUNIT.ADDED_FROM_ACCREDITATION"})} width="20%" calculateCellValue={getAddedFromAccreditation} alignment={"center"} />
          <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />
          <Column type="buttons" width={95} visible={props.showButtons} >
            <ColumnButton icon="toolbox" hint={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CENTROCOSTO.ADD", })} onClick={nuevoRegistroCentroCosto} />
            <ColumnButton icon="edit" hint={intl.formatMessage({ id: "ACTION.EDIT", })}
                          onClick={editarRegistro}
                          visible={accessButton.editar}
            />
            <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })}
                          onClick={eliminarRegistro}
                          visible={accessButton.eliminar}
            />
          </Column>

          <MasterDetail enabled={true} component={(opt) => ContratoCentroCostoListPage({
            ContratoUnidadOrganizativa: opt.data.data,
            intl,
            //showButtons: false,
            editarRegistro: props.editarRegistroCentroCosto,
            eliminarRegistro: props.eliminarRegistroCentroCosto,
            showButtons: true
          })} />

          <Summary>
            <TotalItem
              cssClass="classColorPaginador_"
              column="UnidadOrganizativa"
              summaryType="count"
              displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
            />
          </Summary>

        </DataGrid>
      </PortletBody>


    </>
  );
};


export default injectIntl(ContratoUnidadOrganizativaListPage);
