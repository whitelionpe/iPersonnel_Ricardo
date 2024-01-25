import React from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { isNotEmpty } from "../../../../../_metronic";


const UnidadOrganizativaCentroCostoListPage = props => {

  const { intl } = props;

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
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  }


  // function onCellPrepared(e) {
  //   if (e.rowType === 'data') {
  //     if (e.data.Activo === 'N') {
  //       e.cellElement.style.color = 'red';
  //     }
  //   }
  // }


  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  };


  return (
    <>

      <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
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

        } />

      <PortletBody>

        <DataGrid
          dataSource={props.uoCentroCostos}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          onEditingStart={editarRegistro}
          onRowRemoving={eliminarRegistro}
          onFocusedRowChanged={seleccionarRegistro}
        // focusedRowKey={props.focusedRowKey}
        // onCellPrepared = { onCellPrepared }
        >
          <Editing
            mode="row"
            useIcons={true}
            allowUpdating={false}
            allowDeleting={true}
            texts={textEditing}
          />
          {/* <Column dataField="RowIndex" caption="#" width={"10%"} alignment={"center"} visible={false} />*/}
          <Column dataField="IdCentroCosto" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"20%"} allowSorting={false} allowSearch={false} allowFiltering={false} />
          <Column dataField="CentroCosto" caption="Centro Costo" width={"70%"} allowSorting={false} />
          <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} alignment={"center"} />
          <Summary>
            <TotalItem
            cssClass="classColorPaginador_"
              column="IdCentroCosto"
              summaryType="count"
              displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
              width={150}
            />
          </Summary>
        </DataGrid>

      </PortletBody>
    </>
  );
};

UnidadOrganizativaCentroCostoListPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
};
UnidadOrganizativaCentroCostoListPage.defaultProps = {
  showHeaderInformation: true,
};
export default injectIntl(UnidadOrganizativaCentroCostoListPage);



