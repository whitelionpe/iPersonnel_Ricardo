import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";
import { DataGrid, Column, Paging, Pager, FilterRow, HeaderFilter, FilterPanel, Selection, Editing, } from "devextreme-react/data-grid";

import { Portlet, PortletHeaderPopUp, PortletHeaderToolbar } from "../content/Portlet";
import { isNotEmpty } from "../../../_metronic";
import { handleInfoMessages } from "../../store/ducks/notify-messages";

const SeguridadPerfilBuscar = props => {
  const { intl } = props;
  const [selectedRow, setSelectedRow] = useState([]);

  function aceptar() {
    if (selectedRow.length > 0) {
      props.agregar(selectedRow);
      props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
    } else {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }));
    }
  }

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'INACTIVO') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  const onRowDblClick = evt => {
    if (evt.rowIndex === -1) return;
    if (props.selectionMode === "row" || props.selectionMode === "single") {
      if (isNotEmpty(evt.data)) {
        props.selectData([{ ...evt.data }]);
        props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
      }
    }
  }

  const seleccionarRegistro = evt => {
    if (props.selectionMode === "row" || props.selectionMode === "single") {
      if (isNotEmpty(evt.data)) setSelectedRow([{ ...evt.data }]);
    }
  }

  function onSelectionChanged(e) {
    setSelectedRow(e.selectedRowsData);
  }
  
  const hidePopover = () => {
    props.showPopup.setisVisiblePopUp(false);
    props.setModoEdicion(false);
  }

  return (
    <>
      <Popup
        visible={props.showPopup.isVisiblePopUp}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={"600px"}
        width={"650px"}
        title={(intl.formatMessage({ id: "SYSTEM.MENU.OBJECT.MAINTENANCE.ACTION.SEARCH" }).toUpperCase())}
        onHiding={hidePopover}
      >
        <Portlet>
          {props.showButton && (
            <PortletHeaderPopUp
              title={""}
              toolbar={
                <PortletHeaderToolbar>
                  <Button
                    icon="todo"//"fa fa-save"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.ACCEPT" })}
                    onClick={aceptar}
                    useSubmitBehavior={true}
                  />
                </PortletHeaderToolbar>
              }
            />
          )}

          <DataGrid
            dataSource={props.dataSource}
            showBorders={true}
            keyExpr="IdPerfil"
            onCellPrepared={onCellPrepared}
            focusedRowEnabled={true}
            allowColumnReordering={true}
            allowColumnResizing={true}
            onRowDblClick={onRowDblClick}
            onFocusedRowChanged={seleccionarRegistro}
            onSelectionChanged={(e => onSelectionChanged(e))}
          >
            <Editing mode="cell" allowUpdating={false} />
            <Selection mode={props.selectionMode} />
            <FilterRow visible={true} showOperationChooser={false} />
            <HeaderFilter visible={false} />
            <FilterPanel visible={false} />
            <Column dataField="IdObjeto" visible={false} />
            <Column dataField="IdPerfil" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"30%"} allowHeaderFiltering={true} allowSorting={false} />
            <Column dataField="Perfil" caption={intl.formatMessage({ id: "ACCESS.PROFILE" })} allowHeaderFiltering={true} width={"50%"} allowSorting={false} />
            <Paging defaultPageSize={15} enabled={true} />
            <Pager showPageSizeSelector={false} />
          </DataGrid>
        </Portlet>
      </Popup>
    </>
  );
};


SeguridadPerfilBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
};
SeguridadPerfilBuscar.defaultProps = {
  showButton: false,
  selectionMode: "row", //['multiple', 'row','single]

};
export default injectIntl(SeguridadPerfilBuscar);
