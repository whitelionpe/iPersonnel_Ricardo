import React from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Paging, Pager, FilterRow, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { isNotEmpty } from "../../../../../_metronic";

const UsuarioCompaniaListPage = props => {

  const { intl, accessButton } = props;

  const editarRegistro = evt => {
    props.editarRegistro(evt.data);
  };

  const eliminarRegistro = evt => {
    evt.cancel = true;
    props.eliminarRegistro(evt.data);
  };

  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  }


  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }

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

        } />


      <PortletBody>
        <DataGrid
          dataSource={props.usuarioCompaniaData}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          onEditingStart={editarRegistro}
          onRowRemoving={eliminarRegistro}
          onFocusedRowChanged={seleccionarRegistro}
          focusedRowKey={props.focusedRowKey}
          onCellPrepared={onCellPrepared}
          allowColumnReordering={true}
          allowColumnResizing={true}
          columnAutoWidth={true}
        >
          <Editing
            mode="row"
            useIcons={true}
            allowUpdating={accessButton.editar}
            allowDeleting={accessButton.eliminar}
            texts={textEditing}
          />

          <FilterRow visible={false} />
          <Column dataField="IdCompania" width={"20%"}
            caption={intl.formatMessage({ id: "COMMON.CODE" })} allowSorting={false} allowSearch={false} allowFiltering={false} />
          <Column dataField="Compania" width={"40%"}
            caption={intl.formatMessage({ id: "SECURITY.USER.COMPANY" })} allowSorting={false} />

          <Column
            dataField="FechaInicio"
            caption={intl.formatMessage({
              id: "ACCESS.PERSON.MARK.STARTDATE",
            })}
            dataType="date" format="dd/MM/yyyy"
            width={"20%"}
            alignment={"center"}
            allowSorting={true}
            allowHeaderFiltering={false}
          />

          <Column
            dataField="FechaFin"
            caption={intl.formatMessage({
              id: "ACCESS.PERSON.MARK.ENDDATE",
            })}
            dataType="date" format="dd/MM/yyyy"
            width={"20%"}
            alignment={"center"}
            allowSorting={true}
            allowHeaderFiltering={false}
          />

          <Paging defaultPageSize={10} />
          <Pager showPageSizeSelector={false} />

          <Summary>
            <TotalItem
            cssClass="classColorPaginador_"
              column="IdCompania"
              summaryType="count"
              displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
            />
          </Summary>

        </DataGrid>

      </PortletBody>
    </>
  );
};

UsuarioCompaniaListPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
};
UsuarioCompaniaListPage.defaultProps = {
  showHeaderInformation: true,
};

export default injectIntl(UsuarioCompaniaListPage);
