import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar,
} from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import Form, {
  Item,
  GroupItem,
  RequiredRule,
  StringLengthRule,
  PatternRule
} from "devextreme-react/form";
import { isNotEmpty, listarTurno } from "../../../../../_metronic";
import { TreeList, Selection, Column, Editing, Summary, TotalItem } from "devextreme-react/tree-list";
import { listarEstadoSimple, listarEstado, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";

const ComedorServicioEditPage = (props) => {

  const { intl, modoEdicion, settingDataField, accessButton, setDataRowEditNew } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estadoRegistro, setEstadoRegistro] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [selectedRow, setSelectedRow] = useState([]);
  const [dataGrid, setDataGrid] = useState(null);
  const [isVisibleExcluyente, setIsVisibleExcluyente] = useState(false);
  const listaTurnos = listarTurno();
  let datacheck = [];
  let dataSelectRow = [];

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    let estadoRegistro = listarEstado();

    setEstadoSimple(estadoSimple);
    setEstadoRegistro(estadoRegistro);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarComedorServicio(props.dataRowEditNew);
      } else {
        props.actualizarComedorServicio(props.dataRowEditNew, dataSelectRow);
      }
    }
  }

  function onSelectionChanged(e) {
    // if (!e.component.getSelectedRowKeys().length) {
    //   e.component.selectRowsByIndexes();
    //   setSelectedRow(e.selectedRowsData);
    //   SelectRow.push(e.selectedRowsData[i]);
    // }
    dataSelectRow = [];
    for (let i = 0; i < e.selectedRowsData.length; i++) {
      if (!dataSelectRow.find(x => x.IdHijo === e.selectedRowsData[i].IdHijo))
        dataSelectRow.push(e.selectedRowsData[i]);
    }
  }

  function onEditorPrepared(e) {
    if (e.row != undefined) {
      if (e.row.data.Checked === 1) {
        datacheck.push(e.row.data.IdHijo);
      }
      //  e.showInColumnChooser = false; 
    }
    dataGrid.instance.selectRows(datacheck);
    dataSelectRow = [];
  }

  function onValueChanged(e) {
    (e.value === "S") ? setIsVisibleExcluyente(true) : setIsVisibleExcluyente(false);
  }

  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  };

  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }

  async function onValueChangedEspecial(e) {
    if (isNotEmpty(e.value)) {
      if (e.value) {
        setDataRowEditNew({
          ...props.dataRowEditNew,
          Especial: e.value,
        });
      } else {
        setDataRowEditNew({
          ...props.dataRowEditNew,
          Especial: e.value,
          NumeroConsumos: 1,
        });
      }
    }
  }

  useEffect(() => {
    cargarCombos();
    (props.dataRowEditNew.Excluyente === "S") ? setIsVisibleExcluyente(true) : setIsVisibleExcluyente(false);

  }, []);

  return (
    <>
      <PortletHeader
        title={props.titulo}
        toolbar={
          <PortletHeaderToolbar>
            <Button
              icon="fa fa-save"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.RECORD" })}
              onClick={grabar}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
              visible={modoEdicion}
              disabled={!accessButton.grabar}
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
      <PortletBody>
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2}>
                <AppBar
                  position="static"
                  className={classesEncabezado.secundario}
                >
                  <Toolbar
                    variant="dense"
                    className={classesEncabezado.toolbar}
                  >
                    <Typography
                      variant="h6"
                      color="inherit"
                      className={classesEncabezado.title}
                    >
                      {intl.formatMessage({ id: "COMMON.DETAIL" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

              <Item
                dataField="IdServicio"
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                isRequired={modoEdicion}
                editorOptions={{
                  maxLength: 10,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !props.dataRowEditNew.esNuevoRegistro
                    ? true
                    : false,
                }}
              >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>


              <Item
                dataField="Servicio"
                label={{
                  text: intl.formatMessage({
                    id: "CASINO.DINNINGROOM.SERVICE",
                  }),
                }}
                isRequired={
                  modoEdicion ? isRequired("Servicio", settingDataField) : false
                }
                colSpan={2}
                editorOptions={{
                  maxLength: 100,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !(modoEdicion
                    ? isModified("Servicio", settingDataField)
                    : false),
                }}
              >
                {(isRequiredRule("Servicio")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>
              <Item
                dataField="HoraInicio"
                label={{
                  text: intl.formatMessage({
                    id: "ACCESS.PERSON.GRUPO.STARTTIME",
                  }),
                }}
                isRequired={
                  modoEdicion
                    ? isRequired("HoraInicio", settingDataField)
                    : false
                }
                editorType="dxDateBox"
                editorOptions={{
                  showClearButton: true,
                  useMaskBehavior: true,
                  maxLength: 5,
                  displayFormat: "HH:mm",
                  type: "time",
                  readOnly: !(modoEdicion
                    ? isModified("HoraInicio", settingDataField)
                    : false),
                }}
              />

              <Item
                dataField="HoraFin"
                label={{
                  text: intl.formatMessage({
                    id: "CASINO.DINNINGROOM.SERVICE.ENDTIME",
                  }),
                }}
                isRequired={
                  modoEdicion ? isRequired("HoraFin", settingDataField) : false
                }
                editorType="dxDateBox"
                editorOptions={{
                  showClearButton: true,
                  useMaskBehavior: true,
                  maxLength: 5,
                  displayFormat: "HH:mm",
                  type: "time",
                  readOnly: !(modoEdicion
                    ? isModified("HoraFin", settingDataField)
                    : false),
                }}
              />

              <Item
                dataField="Costo"
                label={{
                  text: intl.formatMessage({
                    id: "CASINO.DINNINGROOM.SERVICE.COST",
                  }),
                }}
                isRequired={
                  modoEdicion ? isRequired("Costo", settingDataField) : false
                }
                editorType="dxNumberBox"
                dataType="number"
                editorOptions={{
                  readOnly: !(modoEdicion
                    ? isModified("Costo", settingDataField)
                    : false),
                  inputAttr: {
                    style: "text-transform: uppercase; text-align: right",
                  },
                  showSpinButtons: true,
                  showClearButton: true,
                  format: props.formatCurrency,
                  min: 0
                }}
              ></Item>

              <Item
                dataField="Orden"
                label={{
                  text: intl.formatMessage({
                    id: "CASINO.DINNINGROOM.SERVICE.ORDER",
                  }),
                }}
                isRequired={
                  modoEdicion ? isRequired("Orden", settingDataField) : false
                }
                editorType="dxNumberBox"
                dataType="number"
                editorOptions={{
                  readOnly: !(modoEdicion
                    ? isModified("Orden", settingDataField)
                    : false),
                  inputAttr: {
                    style: "text-transform: uppercase; text-align: right",
                  },
                  showSpinButtons: true,
                  showClearButton: true,
                  min: 0
                }}
              >
                <PatternRule
                  pattern={/[0-9]/}
                  message={intl.formatMessage({
                    id: "COMMON.ENTER.NUMERIC.DATA",
                  })}
                />
              </Item>

              <Item
                dataField="NumeroConsumos"
                label={{ text: intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.CONSUMPTION.NUMBER", }), }}
                isRequired={modoEdicion ? isRequired("NumeroConsumos", settingDataField) : false}
                editorType="dxNumberBox"
                dataType="number"
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified("NumeroConsumos", settingDataField) : false),
                  inputAttr: { style: "text-transform: uppercase; text-align: right", },
                  showSpinButtons: true,
                  showClearButton: false,
                  readOnly: props.dataRowEditNew.Especial ? false : true,
                  min: 1,
                  max: 999
                }}
              >
                <PatternRule
                  pattern={/[0-9]/}
                  message={intl.formatMessage({
                    id: "COMMON.ENTER.NUMERIC.DATA",
                  })}
                />
              </Item>

              <Item
                dataField="AplicaDiaSiguiente"
                label= "Aplica Día Siguiente"
                editorType="dxSelectBox"
                /*isRequired={
                  modoEdicion
                    ? isRequired("AplicaDiaSiguiente", settingDataField)
                    : false
                }*/
                editorOptions={{
                  items: estadoRegistro,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  //readOnly: !(modoEdicion ? isModified("AplicaDiaSiguiente", settingDataField) : false),

                }}
              />

              <Item
                dataField="Excluyente"
                label={{ text: intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.EXCLUDING" }) }}
                editorType="dxSelectBox"
                isRequired={
                  modoEdicion
                    ? isRequired("Excluyente", settingDataField)
                    : false
                }
                editorOptions={{
                  items: estadoRegistro,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !(modoEdicion ? isModified("Excluyente", settingDataField) : false),
                  onValueChanged: onValueChanged,

                }}
              />

              <Item
                dataField="Especial"
                isRequired={
                  modoEdicion ? isRequired("Especial", settingDataField) : false
                }
                editorType="dxCheckBox"
                label={{
                  text: "Check",
                  visible: false
                }}
                editorOptions={{
                  readOnly: !(modoEdicion
                    ? isModified("Especial", settingDataField)
                    : false),
                  text: intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.SPECIAL" }),
                  width: "100%",
                  onValueChanged: (e) => onValueChangedEspecial(e)
                }}
              />


              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !(modoEdicion
                    ? props.dataRowEditNew.esNuevoRegistro
                      ? false
                      : true
                    : false),
                }}
              />

              <Item dataField="IdComedor" visible={false} />
            </GroupItem>
          </Form>
          <br>
          </br>
          <br>
          </br>

          {isVisibleExcluyente && (
            <>
              <AppBar
                position="static"
                className={classesEncabezado.secundario}
              >
                <Toolbar
                  variant="dense"
                  className={classesEncabezado.toolbar}
                >
                  <Typography
                    variant="h6"
                    color="inherit"
                    className={classesEncabezado.title}
                  >
                    {intl.formatMessage({ id: "CASINO.SERVICE.EXCLUSIVE" })}
                  </Typography>
                </Toolbar>
              </AppBar>
              <PortletBody>

                <TreeList
                  id="ComedorServicios"
                  width={"49%"}
                  dataSource={props.servicioExcluyente}
                  showRowLines={true}
                  showBorders={true}
                  columnAutoWidth={true}
                  // defaultExpandedRowKeys={expandedRowKeys}
                  // selectedRowKeys={selectedRowKeys}
                  // rootValue={-1}
                  keyExpr="IdHijo"
                  parentIdExpr="IdPadre"
                  ref={(ref) => { setDataGrid(ref); }}
                  onSelectionChanged={onSelectionChanged}
                  onEditorPrepared={onEditorPrepared}
                  allowColumnReordering={true}
                  allowColumnResizing={true}
                >
                  <Selection recursive={false} mode="multiple" />
                  <Column dataField="Comedor"
                    caption={intl.formatMessage({ id: "CASINO.SERVICE.EXCLUSIVE.DINNINGROOM" })}
                    alignment={"center"}
                    width={"40%"}
                  />

                  <Column dataField="Servicio"
                    caption={intl.formatMessage({ id: "CASINO.SERVICE.EXCLUSIVE.SERVICE" })}
                    width={"60%"}
                  />

                </TreeList>

              </PortletBody>

            </>

          )}




        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(ComedorServicioEditPage);
