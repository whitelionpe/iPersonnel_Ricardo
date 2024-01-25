import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { Portlet, PortletHeaderPopUp, PortletHeaderToolbar } from "../content/Portlet";

import { isNotEmpty } from "../../../_metronic";
import { handleInfoMessages } from "../../store/ducks/notify-messages";
import { DataGrid, Column, Paging, Pager, FilterRow, HeaderFilter, FilterPanel, Selection, Editing, } from "devextreme-react/data-grid";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";
import { obtenerTodos as obtenerCmbObjeto } from "../../api/sistema/objeto.api";



const SistemaObjetoBuscar = props => {
  const { intl } = props;
  const [selectedRow, setSelectedRow] = useState([]);
  const [cmbObjeto, setCmbObjeto] = useState([]);
  const [selected, setSelected] = useState({});

  async function cargarCombos() {
    let cmbObjeto = await obtenerCmbObjeto();
    setCmbObjeto(cmbObjeto);
  }

  async function cargar() {

  }


  function aceptar() {
    const { IdObjeto, Objeto } = selectedRow;
    //console.log("aceptar", selectedRow);
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
    //console.log("seleccionarRegistro", evt);
    if (props.selectionMode === "row" || props.selectionMode === "single") {
      if (isNotEmpty(evt.data)) setSelectedRow([{ ...evt.data }]);
    }
  }

  function onSelectionChanged(e) {
    //Seleccion multiple
    setSelectedRow(e.selectedRowsData);
  }

  useEffect(() => {
    cargar();
    cargarCombos();
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
        title={(intl.formatMessage({ id: "SYSTEM.MENU.OBJECT.MAINTENANCE.ACTION.SEARCH" }).toUpperCase())}
        onHiding={() => props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)}
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
            //dataSource={props.dataSource}
            dataSource={cmbObjeto}
            showBorders={true}
            keyExpr="IdObjeto"
            // remoteOperations={true}
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
            <FilterRow visible={true} />
            <HeaderFilter visible={false} />
            <FilterPanel visible={false} />
            {/* <Column dataField="RowIndex" caption="#" width={"8%"} alignment={"center"} /> */}
            <Column dataField="IdObjeto" visible={false} />
            <Column dataField="Identificador" caption="Código" editorOptions={false} allowEditing={false} width={"40%"} />
            <Column dataField="Objeto" caption="Objeto" editorOptions={false} allowEditing={false} width={"60%"} />
            <Column dataField="TipoObjetoDesc" caption="Tipo" editorOptions={false} allowEditing={false} width={"60%"} />
            <Paging defaultPageSize={15} enabled={true} />
            <Pager showPageSizeSelector={false} />


          </DataGrid>


        </Portlet>
      </Popup>
    </>
  );
};

SistemaObjetoBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
};
SistemaObjetoBuscar.defaultProps = {
  showButton: false,
  selectionMode: "row", //['multiple', 'row','single]

};
export default injectIntl(SistemaObjetoBuscar);
