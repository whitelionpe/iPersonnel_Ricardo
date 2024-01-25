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
import Alerts from "../components/Alert/Alerts";
import { obtenerTodos as obtenerTodosCliente } from "../../../app/api/sistema/cliente.api";
import { obtenerTodos as obtenerTodosCM } from "../../../app/api/sistema/configuracionModulo.api";

const SistemaConfiguracionModuloImportar = props => {
  //debugger;
  const { intl, varIdModulo, varIdAplicacion } = props;
  const { Modulo, Aplicacion } = props.selected;
  //console.log("props.selected", props.selected);
  const { IdCliente, Cliente } = useSelector(state => state.perfil.perfilActual);

  const [selectedRow, setSelectedRow] = useState([]);
  const [dataConfiguraciones, setDataConfiguraciones] = useState([]);
  const [isVisibleAlert, setIsVisibleAlert] = useState(false);
  const [clientes, setClientes] = useState([]);

  async function cargarCombos() {
    let clientes = await obtenerTodosCliente({IdCliente});
    setClientes(clientes);

  }

  function aceptar() {
    //debugger;
    if (selectedRow.length > 0) {
      props.importarConfiguracionModulo(selectedRow);
    } else {
      // handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }));
      setIsVisibleAlert(true);
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


  async function onValueChangedConfigModulo(value) {
   // debugger;
    await obtenerTodosCM({ IdCliente: value, IdModulo: varIdModulo, IdAplicacion: varIdAplicacion }).then(listConfigModulo => {
      setDataConfiguraciones(listConfigModulo);
    }).finally(() => { });

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
        width={"650px"}
        title={(intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS.IMPORT" }).toUpperCase())}
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
             {/*    &nbsp;
                  <Button
                    icon="fa fa-times-circle"
                    type="normal"
                    hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                    onClick={() => props.setisVisiblePopUpImportar(false)}
                  /> */}

                </PortletHeaderToolbar>
              }
            />
          )}

          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" id="editForm" labelLocation="top" >
            <GroupItem itemType="group" colCount={2} colSpan={2}>

              <Item
                dataField="IdCliente"
                label={{ text: intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS.ORIGEN" }) }}
                editorType="dxSelectBox"
                //isRequired={modoEdicion ? isRequired('IdCliente', settingDataField) : false}
                editorOptions={{
                  items: clientes,
                  valueExpr: "IdCliente",
                  displayExpr: "Cliente",
                  searchEnabled: true,
                  onValueChanged: (e => onValueChangedConfigModulo(e.value))
                }}
              />
              <Item
                dataField="Cliente"
                label={{ text: intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS.DESTINO" }), }}
                editorOptions={{
                  value: Cliente,
                  readOnly: true,
                  hoverStateEnabled: false,
                  inputAttr: { style: "text-transform: uppercase" }
                }}
              />

              <Item
                dataField="IdModulo"
                visible={false}

              />
              <Item
                dataField="IdAplicacion"
                visible={false}
              />



            </GroupItem>
          </Form>
          <br></br>



          <DataGrid
            dataSource={dataConfiguraciones}
            showBorders={true}
            keyExpr="IdConfiguracion"
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
            <Column dataField="IdConfiguracion" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"30%"} alignment={"left"} />
            <Column dataField="Configuracion" caption={intl.formatMessage({ id: "SYSTEM.CONFIGURATION" })} width={"70%"} />
            <Paging defaultPageSize={15} enabled={true} />
            <Pager showPageSizeSelector={false} />
          </DataGrid>

          {isVisibleAlert && (
            <Alerts
              severity={"info"}
              msg1={intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS.IMPORT.MSG" })}
            />
          )}

        </Portlet>


      </Popup>

    </>
  );
};

SistemaConfiguracionModuloImportar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
};
SistemaConfiguracionModuloImportar.defaultProps = {
  showButton: false,
  selectionMode: "row", //['multiple', 'row','single]

};
export default injectIntl(SistemaConfiguracionModuloImportar);
