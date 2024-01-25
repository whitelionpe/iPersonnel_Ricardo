import React, { useState } from "react";
import { injectIntl } from "react-intl"; //Multi-idioma /, useIntl
import { DataGrid, Column, Editing, Paging, Pager, Summary, TotalItem, Button as ColumnButton } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { isNotEmpty } from "../../../../../../_metronic";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";

const PerfilTipoVehiculoListPage = props => {

  const { intl, dataSource, focusedRowKey, setLoading } = props;

  const editarRegistro = evt => {
    props.editarRegistro(evt.row.data);
  };

  const eliminarPerfilTipoVehiculo = evt => {
    //console.log("eliminarPerfilTipoVehiculo", evt);
    evt.cancel = true;
    props.eliminarRegistro(evt.row.data);
  };

  const seleccionarPerfilTipoVehiculo = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);

  };

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (

    <>
      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={3}
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

        } />

      <PortletBody>

        <DataGrid
          dataSource={dataSource}
          showBorders={true}
          columnAutoWidth={true}
          focusedRowEnabled={true}
          repaintChangesOnly={true}
          allowColumnReordering={true}
          allowColumnResizing={true}
          columnAutoWidth={true}
          focusedRowKey={focusedRowKey}
          keyExpr="RowIndex"
          //onCellPrepared={onCellPrepared}
          //onRowRemoving={eliminarPerfilTipoVehiculo}
          onFocusedRowChanged={seleccionarPerfilTipoVehiculo}
        >


          <Column dataField="IdTipoVehiculo" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"15%"} alignment={"center"} />
          <Column dataField="TipoVehiculo" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.TYPEVEHICLE" })} width={"60%"} />

          <Column type="buttons" width={"10%"} visible={props.showButton} >
            <ColumnButton icon="edit" hint={intl.formatMessage({ id: "ACTION.EDIT", })} onClick={editarRegistro} />
            <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarPerfilTipoVehiculo} />
          </Column>
          <Summary>
            <TotalItem
            cssClass="classColorPaginador_"
              column="IdTipoVehiculo"
              summaryType="count"
              displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
            />
          </Summary>
          <Pager showPageSizeSelector={true} />
          <Paging defaultPageSize={20} />

        </DataGrid>
        <br />

      </PortletBody>
    </>
  );
};


export default injectIntl(WithLoandingPanel(PerfilTipoVehiculoListPage));
