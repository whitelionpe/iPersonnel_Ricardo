import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { Portlet, PortletHeaderPopUp, PortletHeaderToolbar } from "../content/Portlet";

import { isNotEmpty } from "../../../_metronic";
import { handleInfoMessages } from "../../store/ducks/notify-messages";
import { DataGrid, Column, Paging, Pager, FilterRow, HeaderFilter, FilterPanel, Selection, Editing, Button as ColumnButton } from "devextreme-react/data-grid";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";
import { serviceGrupo } from "../../api/asistencia/grupo.api";
import AsistenciaGrupoZonaEquipoBuscar from "./AsistenciaGrupoZonaEquipoBuscar";

const AsistenciaGrupoBuscar = props => {
  const { intl, varIdCompania, dataMenu } = props;
  const [selectedRow, setSelectedRow] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [varIdGrupo, setVarIdGrupo] = useState("");
  const [varGrupo, setVarGrupo] = useState("");
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  const [isVisiblePopupGrupoZonaEquipo, setisVisiblePopupGrupoZonaEquipo] = useState(false);

  async function cargarCombos() {
    let grupos = await serviceGrupo.obtenerTodos({ IdCliente: IdCliente, IdCompania: varIdCompania });
    setGrupos(grupos);
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


  function verPopupGrupoZonaEquipo(e) {

    const { IdGrupo, Grupo } = e.row.data;
    setVarIdGrupo(IdGrupo);
    setVarGrupo(Grupo);
    if (isNotEmpty(IdGrupo)) setisVisiblePopupGrupoZonaEquipo(true);

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
        title={(intl.formatMessage({ id: "ACTION.SEARCH" }) + ' ' + intl.formatMessage({ id: "ACCESS.PERSON.GRUPOS" })).toUpperCase()}
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
            dataSource={grupos}
            showBorders={true}
            keyExpr="IdGrupo"
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
            <Column dataField="IdGrupo" caption={intl.formatMessage({ id: "COMMON.CODE" })} editorOptions={false} allowEditing={false} visible={true} width={"30%"} />
            <Column dataField="Grupo" caption={intl.formatMessage({ id: "ACCESS.PERSON.DESCRIPTION" })} editorOptions={false} allowEditing={false} width={"50%"} />
            <Column type="buttons" width={"10%"}>
              <ColumnButton
                icon="pinleft"
                hint={intl.formatMessage({ id: "ACTION.VIEW" }) + ' ' + intl.formatMessage({ id: "ACCESS.GROUP.DEVICES" })}
                onClick={verPopupGrupoZonaEquipo}
              />
            </Column>
            <Paging defaultPageSize={15} />
            <Pager showPageSizeSelector={false} />

          </DataGrid>


        </Portlet>
      </Popup>

      <AsistenciaGrupoZonaEquipoBuscar
        showPopup={{ isVisiblePopUp: isVisiblePopupGrupoZonaEquipo, setisVisiblePopUp: setisVisiblePopupGrupoZonaEquipo }}
        cancelarEdicion={() => setisVisiblePopupGrupoZonaEquipo(false)}
        varIdGrupo={varIdGrupo}
        varGrupo={varGrupo}
        dataMenu={dataMenu}
        varIdCompania={varIdCompania}
      />
    </>
  );
};

AsistenciaGrupoBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
};
AsistenciaGrupoBuscar.defaultProps = {
  showButton: true,
  selectionMode: "row", //['multiple', 'row','single]

};
export default injectIntl(AsistenciaGrupoBuscar);
