import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { Portlet, PortletHeaderPopUp, PortletHeaderToolbar } from "../content/Portlet";

import { isNotEmpty } from "../../../_metronic";
import { handleInfoMessages } from "../../store/ducks/notify-messages";
import { DataGrid, Column, Paging, Pager, FilterRow, HeaderFilter, FilterPanel, Selection, Editing, } from "devextreme-react/data-grid";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";
import { service } from "../../api/sistema/proceso.api";

const SistemaProcesoBuscar = props => {
  const { intl } = props;
  const [selectedRow, setSelectedRow] = useState([]);
  const [cmbProceso, setCmbProceso] = useState([]);

  async function listarProcesosPendientes() {
    let cmbProceso = await service.obtenerPendientes({IdCliente: '1'});
    setCmbProceso(cmbProceso);
  }

  function aceptar() {
    const { IdProceso, Proceso } = selectedRow;
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
    //Seleccion multiple
    setSelectedRow(e.selectedRowsData);
  }

  useEffect(() => {
    listarProcesosPendientes();
  }, []);



  return (
    <>
      <Popup
        visible={props.showPopup.isVisiblePopUp}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={"600px"}
        width={"650px"}
        title={(intl.formatMessage({ id: "SYSTEM.PROCESS.SEARCH" }).toUpperCase())}
        onHiding={() => props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)}
      >
        <Portlet>
          {props.showButton && (
            <PortletHeaderPopUp
              title={""}
              toolbar={
                <PortletHeaderToolbar>
                  <Button
                    icon="todo"
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
            dataSource={cmbProceso}
            showBorders={true}
            keyExpr="IdProceso"
            onCellPrepared={onCellPrepared}
            focusedRowEnabled={true}
            allowColumnReordering={true}
            allowColumnResizing={true}
            onRowDblClick={onRowDblClick}
            onFocusedRowChanged={seleccionarRegistro}
            onSelectionChanged={(e => onSelectionChanged(e))}
          >
            <Editing mode="cell" allowUpdating={true} />

            <Selection mode={props.selectionMode} />
            <FilterRow visible={false} />
            <HeaderFilter visible={false} />
            <FilterPanel visible={false} />
            {/* <Column dataField="RowIndex" caption="#" width={"8%"} alignment={"center"} /> */}
            <Column dataField="IdProceso" visible={false} />
            <Column dataField="Modulo" caption={intl.formatMessage({ id: "SYSTEM.MODULE" })} editorOptions={false} allowEditing={false} width={"25%"} />
            <Column dataField="Aplicacion" caption={intl.formatMessage({ id: "SYSTEM.MODULEAPLICATION.APLICATION" })} editorOptions={false} allowEditing={false} width={"25%"} />
            <Column dataField="Proceso" caption={intl.formatMessage({ id: "SYSTEM.PROCESS" })} editorOptions={false} allowEditing={false} width={"50%"} />
            <Paging defaultPageSize={15} enabled={true} />
            <Pager showPageSizeSelector={false} />


          </DataGrid>


        </Portlet>
      </Popup>
    </>
  );
};

SistemaProcesoBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
};
SistemaProcesoBuscar.defaultProps = {
  showButton: false,
  selectionMode: "row", //['multiple', 'row','single]

};
export default injectIntl(SistemaProcesoBuscar);
