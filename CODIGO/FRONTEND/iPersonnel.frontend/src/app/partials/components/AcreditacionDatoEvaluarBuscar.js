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
//import { obtenerTodos as obtenerRequisitos } from "../../api/acceso/requisito.api";
import { listarDatoEvaluarPersonas as listarDatoEvaluar } from "../../api/acreditacion/datosEvaluar.api";
import { listarTipoDatoEvaluar } from "../../../_metronic/utils/utils";


const AcreditacionDatoEvaluar = props => {
  const { intl, varIdRequisito } = props;
  const [selectedRow, setSelectedRow] = useState([]);
  const [datosEvaluar, setDatosEvaluar] = useState([]);

  //const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const { IdDatoEvaluar, IdEntidad } = props.filtro;

  async function cargarCombos() {

    let datosEvaluar = await listarDatoEvaluar({ IdCliente: perfil.IdCliente, IdEntidad, IdRequisito: varIdRequisito, IdDatoEvaluar: isNotEmpty(IdDatoEvaluar) ? IdDatoEvaluar : "" });
    setDatosEvaluar(datosEvaluar);
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
      console.log("onRowDblClick|evt", evt);
      if (isNotEmpty(evt.data)) {
        props.selectData([{ ...evt.data }]);
        props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
      }
    }
  }

  const obtenerDescripcionTipo = (param) => {
    if (param && param.data) {
      let lstTipos = listarTipoDatoEvaluar();
      let filtro = lstTipos.find(x => x.Valor == param.data.Tipo);

      if (filtro != undefined) {
        return (isNotEmpty(filtro.Descripcion) ? filtro.Descripcion : "");
      }
      return "";
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
        width={"500px"}
        title={(intl.formatMessage({ id: "ACTION.SEARCH" }) + ' ' + intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE.MAINTENANCE" })).toUpperCase()}
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
            dataSource={datosEvaluar}
            showBorders={true}
            keyExpr="IdDatoEvaluar"
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
            <FilterRow visible={true} showOperationChooser={false} />
            <HeaderFilter visible={false} />
            <FilterPanel visible={false} />
            <Column dataField="IdDatoEvaluar" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"20%"} alignment={"left"} />
            <Column dataField="DatoEvaluar" caption={intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE" })} width={"70%"} alignment={"left"} />
            <Column dataField="Tipo" caption={intl.formatMessage({ id: "ACCREDITATION.DATEEVALUATE.TYPE" })} width={"10%"} alignment={"center"} cellRender={obtenerDescripcionTipo} />
            <Paging defaultPageSize={15} />
            <Pager showPageSizeSelector={false} />


          </DataGrid>


        </Portlet>
      </Popup>
    </>
  );
};

AcreditacionDatoEvaluar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
};
AcreditacionDatoEvaluar.defaultProps = {
  showButton: true,
  selectionMode: "row", //['multiple', 'row','single]

};
export default injectIntl(AcreditacionDatoEvaluar);
