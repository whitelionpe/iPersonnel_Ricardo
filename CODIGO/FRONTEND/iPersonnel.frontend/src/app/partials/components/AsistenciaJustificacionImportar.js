import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { Portlet, PortletHeader, PortletHeaderToolbar } from "../content/Portlet";
import Form, { Label, Item, GroupItem, RequiredRule, PatternRule, StringLengthRule } from "devextreme-react/form";

import { isNotEmpty } from "../../../_metronic";
import { handleInfoMessages } from "../../store/ducks/notify-messages";
import { DataGrid, Column, Paging, Pager, FilterRow, HeaderFilter, FilterPanel, Selection, Editing, } from "devextreme-react/data-grid";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";

import { obtenerTodos as obtenerCmbObjeto } from "../../api/sistema/objeto.api";
import AdministracionCompaniaBuscar from "../components/AdministracionCompaniaBuscar"

import { obtenerTodos as obtenerTodosJS } from "../../../app/api/asistencia/justificacion.api";
import Alerts from "../components/Alert/Alerts";


const AsistenciaJustificacionImportar = props => {
  const { intl, companiaData} = props;
  const { Compania } = props.selected;
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);

  const [selectedRow, setSelectedRow] = useState([]);
  const [dataJustificaciones, setDataJustificaciones] = useState([]);
  const [isVisibleAlert, setIsVisibleAlert] = useState(false);
  const [varIdCompania, setVarIdCompania] = useState("");

  function aceptar() {
    if (selectedRow.length > 0) {
      props.importarJustificaciones(selectedRow);
    } else {
      // handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }));
      setIsVisibleAlert(true);
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

  async function obtnerJustificacion(IdCompania) {
    await obtenerTodosJS(
      {
        IdCliente: IdCliente
        , IdCompania: IdCompania

      }
    ).then(justificaciones => {
      setDataJustificaciones(justificaciones)
    }).catch(err => {
    }).finally(() => { });
  }


  async function getCompanySelec(idCompania) {
    if (isNotEmpty(idCompania)) {
        setVarIdCompania(idCompania);
        obtnerJustificacion(idCompania);
    }
  }

  useEffect(() => {
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
        title={(intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.IMPORT" }).toUpperCase())}
        onHiding={() => props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)}
      >
        <Portlet>
          {props.showButton && (
            <PortletHeader
              title={""}
              toolbar={
                <PortletHeaderToolbar>
                  <Button
                    icon="increaseindent"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.IMPORT" })}
                    onClick={aceptar}
                    useSubmitBehavior={true}
                  />
                  &nbsp;
                  <Button
                    icon="fa fa-times-circle"
                    type="normal"
                    hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                    onClick={() => props.setisVisiblePopUpImportar(false)}
                  />
                </PortletHeaderToolbar>
              }
            />
          )}

          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" id="editForm" labelLocation="top" >
            <GroupItem itemType="group" colCount={2} colSpan={2}>

              <Item
                dataField="CompaniaDestino"
                label={{ text: intl.formatMessage({ id: "Compañía Origen" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: companiaData,
                  valueExpr: "IdCompania",
                  displayExpr: "Compania",
                  showClearButton: true,
                  value: varIdCompania,
                  onValueChanged: (e) => {
                    if (isNotEmpty(e.value)) {
                      getCompanySelec(e.value);
                    }
                  },

                }}
              />

              <Item
                dataField="CompaniaOrigen"
                label={{ text: intl.formatMessage({ id: "Compañía Destino" }), }}
                editorOptions={{
                  value: Compania,
                  readOnly: true,
                  hoverStateEnabled: false,
                  inputAttr: { style: "text-transform: uppercase" },
                }}
              />
            </GroupItem>
          </Form>
          <br></br>



          <DataGrid
            dataSource={dataJustificaciones}
            showBorders={true}
            keyExpr="IdJustificacion"
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
            <FilterRow visible={true} />
            <HeaderFilter visible={false} />
            <FilterPanel visible={false} />
            <Column dataField="IdJustificacion" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} alignment={"center"} />
            <Column dataField="Justificacion" caption={intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION" })} width={"45%"} />
            <Paging defaultPageSize={15} enabled={true} />
            <Pager showPageSizeSelector={false} />
          </DataGrid>

          {isVisibleAlert && (
            <Alerts
              severity={"info"}
              msg1={intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.IMPORT.MSG" })}
            />
          )}

        </Portlet>
      </Popup>

    </>
  );
};

AsistenciaJustificacionImportar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
};
AsistenciaJustificacionImportar.defaultProps = {
  showButton: false,
  selectionMode: "row", //['multiple', 'row','single]

};
export default injectIntl(AsistenciaJustificacionImportar);
