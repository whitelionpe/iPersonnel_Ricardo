import React, { useEffect, useState, useRef } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { Portlet, PortletHeaderPopUp, PortletHeaderToolbar } from "../content/Portlet";

import { isNotEmpty } from "../../../_metronic";
import { handleInfoMessages } from "../../store/ducks/notify-messages";
import { DataGrid, Column, Paging, Pager, FilterRow, HeaderFilter, FilterPanel, Selection, Editing, } from "devextreme-react/data-grid";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";
//import { obtenerTodos as obtenerTodosHorarioDia } from "../../api/asistencia/horarioDia.api";



const AsistenciaHorarioDiaBuscar = props => {
  const { intl } = props;
  const [selectedRow, setSelectedRow] = useState([]);
  //const [listHorarioDia, setListHorarioDia] = useState([]);
  //const [selected, setSelected] = useState({});
  const dataGrid = useRef();

  /*  async function cargarCombos() {
     let listHorarioDia = await obtenerTodosHorarioDia();
     setListHorarioDia(listHorarioDia);
   } */
  //const [clearSelection, setClearSelection] = useState([]);


  function aceptar() {
    const { IdHorario, IdDia } = selectedRow;

    if (selectedRow.length > 0) {
      props.copiar(selectedRow);
      props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);

    } else {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }));
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


  function onClearSelection() {
    // console.log("onClearSelection",dataGrid);
    dataGrid.current.instance.clearSelection();
    //setClearSelection(e.selectedRowsData);
  }


  useEffect(() => {
    //cargarCombos();
  }, []);



  return (
    <>
      <Popup
        visible={props.showPopup.isVisiblePopUp}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={"450px"}
        width={"300px"}
        title={(intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.POPUP" }).toUpperCase())}
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
                    &nbsp;
                  <Button
                    id="btnClearSelection"
                    style={{ display: 'none' }}
                    onClick={onClearSelection}
                    text="Clear"
                  />

                </PortletHeaderToolbar>
              }
            />
          )}

          <DataGrid
            dataSource={props.listHorarioDia}
            showBorders={true}
            ref={dataGrid}
            keyExpr="IdDia"
            focusedRowEnabled={true}
            allowColumnReordering={true}
            allowColumnResizing={true}
            onRowDblClick={onRowDblClick}
            onFocusedRowChanged={seleccionarRegistro}
            onSelectionChanged={(e => onSelectionChanged(e))}
            onClearSelection
          >
            <Editing mode="cell" allowUpdating={true} />

            <Selection mode={props.selectionMode} />
            <FilterRow visible={false} />
            <HeaderFilter visible={false} />
            <FilterPanel visible={false} />
            {/* <Column dataField="RowIndex" caption="#" width={"8%"} alignment={"center"} /> */}
            <Column dataField="IdHorario" visible={false} />
            <Column dataField="IdDia" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY" })} width={"10%"} alignment={"center"} visible={false} />
            <Column dataField="Dia" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY" })} width={"80%"} alignment={"left"} allowHeaderFiltering={false} />
            <Paging defaultPageSize={10} enabled={true} />
            <Pager showPageSizeSelector={false} />

          </DataGrid>


        </Portlet>
      </Popup>
    </>
  );
};

AsistenciaHorarioDiaBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
};
AsistenciaHorarioDiaBuscar.defaultProps = {
  showButton: false,
  selectionMode: "row",

};
export default injectIntl(AsistenciaHorarioDiaBuscar);
