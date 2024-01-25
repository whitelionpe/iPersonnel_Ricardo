import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";//Multi-idioma
import { Button } from "devextreme-react";
import { Portlet, PortletHeaderPopUp, PortletHeaderToolbar } from "../content/Portlet";

import { isNotEmpty } from "../../../_metronic";
import { handleInfoMessages } from "../../store/ducks/notify-messages";
import { DataGrid, Column, Paging, Pager, FilterRow, HeaderFilter, FilterPanel, Selection, Editing, } from "devextreme-react/data-grid";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";
import { obtenerTodos as obtenerRequisitos } from "../../api/acceso/requisito.api";


const AccesoRequisitoBuscar = props => {
  const { intl } = props;
  const [selectedRow, setSelectedRow] = useState([]);
  const [requisitos, setRequisitos] = useState([]);

  const {IdCliente , IdDivision } = useSelector(state => state.perfil.perfilActual);
  const { IdEntidad } = props.filtro;

  async function cargarCombos() {
    let requisitos = await obtenerRequisitos({ IdDivision: IdDivision, IdCliente: IdCliente,  IdEntidad : isNotEmpty(IdEntidad) ? IdEntidad  : "" });
    setRequisitos(requisitos);
}

  function aceptar() {
    if (selectedRow.length > 0) {
      props.selectData(selectedRow);
      props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
    } else {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }));
    }
  }

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Estado === 'INACTIVO') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  const seleccionarRegistro = evt => {
    if (props.selectionMode === "row" || props.selectionMode === "single") {
      if (isNotEmpty(evt.row.data)) setSelectedRow([{ ...evt.row.data }]);
    }
  }

  const onRowDblClick = evt => {
    if (evt.rowIndex === -1) return;
    if (props.selectionMode === "row" || props.selectionMode === "single") {
      console.log("onRowDblClick|evt",evt);
      if (isNotEmpty(evt.data)) {
        props.selectData([{ ...evt.data }]);
        props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
      }
    }
  }

  useEffect(() => {
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
        width={"600px"}
        title={(intl.formatMessage({ id: "ACTION.SEARCH" }) + ' ' + intl.formatMessage({ id: "ACCESS.PERSON.REQUIREMENTS" })).toUpperCase()}
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
            dataSource={requisitos}
            showBorders={true}
            keyExpr="IdRequisito"
            onCellPrepared={onCellPrepared}
            focusedRowEnabled={true}
            allowColumnReordering={true}
            allowColumnResizing={true}
            onRowDblClick={onRowDblClick}
            onFocusedRowChanged={seleccionarRegistro}
          >
            <Editing mode="cell" allowUpdating={true} >
            </Editing>

            <Selection mode={props.selectionMode} />
            <FilterRow visible={true}  showOperationChooser={false}  />
            <HeaderFilter visible={false} />
            <FilterPanel visible={false} />
            <Column dataField="IdRequisito" caption={intl.formatMessage({ id: "COMMON.CODE" })} editorOptions={false} allowEditing={false} visible={true} width={"30%"} />
            <Column dataField="Requisito" caption={intl.formatMessage({ id: "ACCESS.PERSON.DESCRIPTION" })} editorOptions={false} allowEditing={false} width={"40%"} />
            <Column dataField="DiasNotificacion" caption={intl.formatMessage({ id: "ACCESS.REQUIREMENTS.NUMBERDAYS" })} alignment={"center"} editorOptions={false} allowEditing={false} width={"30%"} />
            <Paging defaultPageSize={15} />
            <Pager showPageSizeSelector={false} />


          </DataGrid>


        </Portlet>
      </Popup>
    </>
  );
};

AccesoRequisitoBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
};
AccesoRequisitoBuscar.defaultProps = {
  showButton: true,
  selectionMode: "row", //['multiple', 'row','single]

};
export default injectIntl(AccesoRequisitoBuscar);
