import React, { useEffect,  useRef } from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Button as ColumnButton, Column, Editing, Selection, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";

import { isNotEmpty } from "../../../../../_metronic";
import PropTypes from "prop-types";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";

const AutorizadorListPage = props => {

  const { intl } = props;
  //const dataGridRef = useRef(null);
 
  const editarRegistro = evt => {
    props.editarRegistro(evt.data);
  };

  const eliminarRegistro = evt => {
    evt.cancel = true;
    props.eliminarRegistro(evt.data);
  };

  const obtenerCampoActivo = rowData => {
    return rowData.Activo === "S";
  };

  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);

  };

  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  };

  
  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }


  useEffect(() => {

  }, []);

  return (
    <>
      <PortletHeader
        title={intl.formatMessage({ id: "ACTION.LIST" })}
        toolbar={
          <PortletHeaderToolbar>
            <PortletHeaderToolbar>
              {props.showButtons && (
                <Button
                  icon="plus"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.NEW" })}
                  onClick={props.nuevoRegistro}
                />
              )}

            </PortletHeaderToolbar>
          </PortletHeaderToolbar>
        }
      />
      <PortletBody>
        <DataGrid
          id="datagrid-autorizador"
          keyExpr="RowIndex"
          //ref={dataGridRef}
          dataSource={props.autorizadores}
          showBorders={true}
          focusedRowEnabled={true}
          focusedRowKey={props.focusedRowKey}
          onFocusedRowChanged={seleccionarRegistro}
          onEditingStart={editarRegistro}
          onRowRemoving={eliminarRegistro}

        onCellPrepared={onCellPrepared}

        >
          <Editing
            mode="row"
            useIcons={props.showButtons}
            allowUpdating={props.showButtons}
            allowDeleting={props.showButtons}
            texts={textEditing}
          />
          <Selection mode="single" />

          <Column dataField="IdAutorizador" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"15%"} alignment={"center"} />
          <Column dataField="Autorizador" caption={intl.formatMessage({ id: "ACCREDITATION.AUTHORIZER.ROLE" })} width={"60%"} />
          <Column dataField="NumeroUsuarioTotal" caption={intl.formatMessage({ id: "SECURITY.USER.USERS" })} width={"15%"} alignment={"center"} format="#,###" />
          <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} alignment={"center"} />

          <Column type="buttons" width={"10%"} visible={props.showButtons} >
            <ColumnButton name="edit" />
            <ColumnButton name="delete" />
          </Column>


          <Summary>
            <TotalItem
            cssClass="classColorPaginador_"
              column="IdAutorizador"
              summaryType="count"
              displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
            />
          </Summary>

        </DataGrid>

      </PortletBody>
    </>
  );
};
AutorizadorListPage.prototype = {
  showButtons: PropTypes.bool,
  modoEdicion: PropTypes.bool,
  showColumnLicense: PropTypes.bool,
  showColumnOrder: PropTypes.bool,
}
AutorizadorListPage.defaultProps = {
  showButtons: true,
  modoEdicion: true,
  showColumnLicense: false,
  showColumnOrder: true,

}


export default injectIntl(WithLoandingPanel(AutorizadorListPage));
