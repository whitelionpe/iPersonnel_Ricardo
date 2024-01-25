import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { Portlet, PortletHeader, PortletHeaderToolbar } from "../content/Portlet";
import Form, { Label, Item, GroupItem, RequiredRule, PatternRule, StringLengthRule } from "devextreme-react/form";

import { isNotEmpty } from "../../../_metronic";
import { DataGrid, Column, Paging, Pager, FilterRow, HeaderFilter, FilterPanel, Selection, Editing, } from "devextreme-react/data-grid";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";
import Alerts from "../components/Alert/Alerts";
import { obtenerTodos as obtenerTodosCliente } from "../../../app/api/sistema/cliente.api";
import { obtenerTodos as obtenerTodosConfig } from "../../../app/api/sistema/configuracion.api";
import { WithLoandingPanel } from "../../partials/content/withLoandingPanel";

const SistemaConfiguracionImportar = props => {
  const { intl, setLoading } = props;
  const { IdCliente, Cliente } = props.selected;

  const [selectedRow, setSelectedRow] = useState([]);
  const [dataConfiguraciones, setDataConfiguraciones] = useState([]);
  const [isVisibleAlert, setIsVisibleAlert] = useState(false);
  const [clientes, setClientes] = useState([]);


  async function cargarCombos() {
    setLoading(true);
    let clientes = await obtenerTodosCliente({ IdCliente })
      .finally(() => { setLoading(false); });
    setClientes(clientes);

  }

  function aceptar() {
    //debugger;
    if (selectedRow.length > 0) {
      props.importarConfiguracion(selectedRow);
    } else {
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
    setSelectedRow(e.selectedRowsData);
  }

  async function onValueChangedConfiguraciones(value) {
    setLoading(true);
    await obtenerTodosConfig({ IdCliente: value }).then(listConfiguraciones => {
      setDataConfiguraciones(listConfiguraciones);
    }).finally(() => { setLoading(false) });

  }

  useEffect(() => {
    cargarCombos();
    setClientes(clientes)
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
                editorOptions={{
                  items: clientes,
                  valueExpr: "IdCliente",
                  displayExpr: "Cliente",
                  searchEnabled: true,
                  showClearButton: true,
                  onValueChanged: (e => onValueChangedConfiguraciones(e.value))
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

SistemaConfiguracionImportar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
};
SistemaConfiguracionImportar.defaultProps = {
  showButton: false,
  selectionMode: "row", //['multiple', 'row','single]

};
export default injectIntl(WithLoandingPanel(SistemaConfiguracionImportar));
