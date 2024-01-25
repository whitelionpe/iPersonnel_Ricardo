import React, { useEffect, useState,useRef } from "react";
import { injectIntl } from "react-intl"; //Multi-idioma
import { Button } from "devextreme-react";
import {
  Portlet,
  PortletHeaderPopUp,
  PortletHeaderToolbar,
} from "../content/Portlet";

import { getDataTempLocal, isNotEmpty, setDataTempLocal } from "../../../_metronic";
import { handleInfoMessages } from "../../store/ducks/notify-messages";
import {
  DataGrid,
  Column,
  FilterRow,
  HeaderFilter,
  FilterPanel,
  Selection,
} from "devextreme-react/data-grid";

import { Popup } from "devextreme-react/popup";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";

import { obtenerEntidadDatoPendientes } from "../../api/sistema/entidadDato.api";

export const initialFilter = {
  IdEntidad: "",
  IdDato: "",
  Dato:""
}; 

const AcreditacionPerfilEntidadDatoBuscarMultiple = (props) => {
  const { intl, selectionMode } = props;

  const [selectedRow, setSelectedRow] = useState([]);
  const gridRef = useRef();
  const [dataEntidad, setDataEntidad] = useState([]);

  const { IdCliente, IdPerfil } = useSelector(state => state.perfil.perfilActual);
  const IdDivisionPerfil = useSelector(state => state.perfil.perfilActual.IdDivision);

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
      props.agregar(dataSelected);
      props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
    } else {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }));
    }

  }

  function onCellPrepared(e) {
    if (e.rowType === "data") {
      if (e.data.Estado === "INACTIVO") {
        e.cellElement.style.color = "red";
      }
    }
  }

  function onSelectionChanged(e) {
    setSelectedRow(e.selectedRowsData);
  }
  const onRowDblClick = (evt) => {
    if (evt.rowIndex === -1) return;
    if (selectionMode === "row" || selectionMode === "single") {
      if (isNotEmpty(evt.data)) {
        props.agregar([{ ...evt.data }]);
        props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
      }
    }
  };


   const seleccionarRegistro = (evt) => {
       if (selectionMode === "row" || selectionMode === "single") {
         if (isNotEmpty(evt.row.data)) setDataTempLocal('selectRowData', evt.row.data);
       }
     
   };

  const hidePopover = () => {
    props.showPopup.setisVisiblePopUp(false);
    props.setModoEdicion(false);
  }


  async function initial() {
      let data = await obtenerEntidadDatoPendientes({ IdCliente:IdCliente, IdEntidad : props.filtro.IdEntidad, IdPerfil: props.filtro.IdPerfil });
      setDataEntidad(data);
  }

  useEffect(() => {
    initial();
  }, []);


  return (
    <>
      <Popup
        visible={props.showPopup.isVisiblePopUp}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={"700px"}
        width={"650px"}
        title={(
          intl.formatMessage({ id: "ACTION.SEARCH" }) +
          " " +
          intl.formatMessage({ id: "ACCREDITATION.PROFILE.ENTITY.DATA" })
        ).toUpperCase()}
          onHiding ={hidePopover} 
        
      >
        <Portlet>
           
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


    <DataGrid
        ref={gridRef}
        dataSource={dataEntidad}
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="IdDato"
        onCellPrepared={onCellPrepared}
        repaintChangesOnly={true}
        onSelectionChanged={(e => onSelectionChanged(e))}
        onRowDblClick={onRowDblClick}
        // onFocusedRowChanged={seleccionarRegistro}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
      >

        <Selection  mode={"multiple"} />
        <FilterRow visible={true} showOperationChooser={false} />
        <HeaderFilter visible={false} />
        <FilterPanel visible={false} />

        <Column
          dataField="IdDato"
          caption={intl.formatMessage({ id: "COMMON.CODE" })}
          allowSorting={true}
          allowHeaderFiltering={false}
        />
        <Column
          dataField="Dato"
          caption={intl.formatMessage({ id: "COMMON.DESCRIPTION" })}
          allowSorting={true}
          allowHeaderFiltering={false}
        />
        <Column
          dataField="Orden"
          caption={intl.formatMessage({ id: "SYSTEM.MENU.ORDER" })}
          alignment={"center"}
          allowSorting={true}
          allowHeaderFiltering={false}
        />
      </DataGrid>

        </Portlet>
      </Popup>

    </>
  );
};

AcreditacionPerfilEntidadDatoBuscarMultiple.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
};
AcreditacionPerfilEntidadDatoBuscarMultiple.defaultProps = {
  showButton: true,
  selectionMode: "row", //['multiple', 'row']
  uniqueId: "AcreditacionPerfilEntidadDatoBuscarMultiple",
};
export default injectIntl(AcreditacionPerfilEntidadDatoBuscarMultiple);
