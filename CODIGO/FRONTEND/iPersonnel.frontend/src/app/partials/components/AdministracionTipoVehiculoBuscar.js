import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";//Multi-idioma
import { Button } from "devextreme-react";
import { useSelector } from "react-redux";
import { Portlet, PortletHeaderPopUp, PortletHeaderToolbar } from "../content/Portlet";

import { handleInfoMessages } from "../../store/ducks/notify-messages";
import { DataGrid, Column, Paging, Pager, FilterRow, HeaderFilter, FilterPanel, Selection, Editing, LoadPanel } from "devextreme-react/data-grid";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";
import { getDataTempLocal, setDataTempLocal, isNotEmpty } from "../../../_metronic";
import { obtenerTodos as obtenerTodosTipoVehiculos } from "../../api/administracion/tipoVehiculo.api";


const AdministracionTipoVehiculoBuscar = props => {

  // const { viewButtonOk, viewButtonRefresh, viewButtonCancel } = props;

  const { intl, selectionMode, showPopup } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);
  const [selectedRow, setSelectedRow] = useState([]);
  const [TipoVehiculos, setTipoVehiculos] = useState([]);
  const [visibleButton, setVisibleButton] = useState(false);

  const setShowPopup = showPopup.setisVisiblePopUp;
  const showPopupView = showPopup.isVisiblePopUp;

  async function cargar() {
    setVisibleButton(false);
    await obtenerTodosTipoVehiculos({
      IdCliente: perfil.IdCliente
    }).then(res => {
      setTipoVehiculos(res);
    }).finally(res => {
      setVisibleButton(true);
    });
  }

  function aceptar() {
    let dataSelected = [];
    if (selectionMode === "row" || selectionMode === "single") {
      let getData = getDataTempLocal('selectRowData');
      dataSelected = [{ ...getData }];
    } else {
      dataSelected = selectedRow;
    }
    if (dataSelected.length > 0) {
      //removeDataTempLocal('selectRowData');
      props.selectData(dataSelected);
      setShowPopup(!showPopupView);
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

  const seleccionarRegistro = (evt) => {
    if (selectionMode === "row" || selectionMode === "single") {
      if (isNotEmpty(evt.row.data)) setDataTempLocal('selectRowData', evt.row.data);
    }
  }

  const onRowDblClick = evt => {
    if (evt.rowIndex === -1) return;
    if (props.selectionMode === "row" || props.selectionMode === "single") {
      if (isNotEmpty(evt.data)) {
        props.selectData([{ ...evt.data }]);
        setShowPopup(!showPopupView);
      }
    }
  }

  function onSelectionChanged(e) {
    //Seleccion multiple
    setSelectedRow(e.selectedRowsData);
  }

  useEffect(() => {
    cargar();
  }, []);

  useEffect(() => {
    console.log("setVisibleButton :::", visibleButton);
  }, [visibleButton]);

  return (
    <>
      <Popup
        visible={showPopupView}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={"600px"}
        width={"600px"}
        title={(intl.formatMessage({ id: "ACTION.SEARCH" }) + ' ' + intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.TYPEVEHICLE" })).toUpperCase()}
        onHiding={() => {

          setVisibleButton(false);
          setShowPopup(!showPopupView);

        }}
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
                    disabled={!visibleButton}

                  />
                  &nbsp;
                  <Button
                    icon="refresh" //fa fa-broom
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                    disabled={!visibleButton}
                    onClick={cargar}

                  />


                </PortletHeaderToolbar>
              }
            />
          )}
          <DataGrid
            dataSource={TipoVehiculos}
            showBorders={true}
            keyExpr="IdTipoVehiculo"
            onCellPrepared={onCellPrepared}
            focusedRowEnabled={true}
            allowColumnReordering={true}
            allowColumnResizing={true}
            onRowDblClick={onRowDblClick}
            onFocusedRowChanged={seleccionarRegistro}
            onSelectionChanged={(e => onSelectionChanged(e))}
          >
            <LoadPanel enabled={true} />
            <Editing mode="cell" allowUpdating={true} >
            </Editing>
            <Selection mode={props.selectionMode} />
            <FilterRow visible={true} showOperationChooser={false} />
            <HeaderFilter visible={false} />
            {/* <Selection mode={selectionMode} /> */}
            {(selectionMode != "multiple") && (
              <Column
                dataField="RowIndex"
                caption="#"
                allowSorting={false}
                allowFiltering={false}
                allowHeaderFiltering={false}
                width={"5%"}
                alignment={"center"}
              />
            )}
            <FilterPanel visible={false} />
            <Column dataField="IdTipoVehiculo" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"15%"} editorOptions={false} allowEditing={false} alignment={"center"} />
            <Column dataField="TipoVehiculo" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.TYPEVEHICLE" })} width={"70%"} editorOptions={false} allowEditing={false} />
            <Paging defaultPageSize={15} />
            <Pager showPageSizeSelector={false} />

          </DataGrid>


        </Portlet>
      </Popup>
    </>
  );
};

AdministracionTipoVehiculoBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  //showPopup: PropTypes.bool,
  visibleButton: PropTypes.bool,


};
AdministracionTipoVehiculoBuscar.defaultProps = {
  showButton: false,
  selectionMode: "row", //['multiple', 'row','single]
  //showPopup: false,
  visibleButton: false,

};
export default injectIntl(AdministracionTipoVehiculoBuscar);
