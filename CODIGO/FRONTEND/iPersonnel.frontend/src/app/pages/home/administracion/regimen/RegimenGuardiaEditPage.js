import React, { Fragment, useEffect, useState } from "react";
import { injectIntl } from "react-intl"; //Multi-idioma
import { useSelector } from "react-redux";
import Form, { 
  Item,
  GroupItem,
  SimpleItem,
  ButtonItem,
  RequiredRule,
  StringLengthRule,
  PatternRule
  } from "devextreme-react/form";
  import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { DataGrid, Column } from "devextreme-react/data-grid";
import './RegimenGuardiaEditPage.css';

import { listarEstadoSimple, PatterRuler , isNotEmpty} from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";


const RegimenGuardiaEditPage = props => {
  const { intl, modoEdicion, dataRowEditNew, settingDataField, accessButton, guardiaDias, dataSourceDias } = props;


  const classesEncabezado = useStylesEncabezado();

  let selectedRange = {};
  let isSelectionStopped = true;

  async function cargarCombos() {
    // let estadoSimple = listarEstadoSimple();
    // setEstadoSimple(estadoSimple);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (dataRowEditNew.esNuevoRegistro) {
        props.agregar(dataRowEditNew, guardiaDias);
      } else {
        props.actualizar(dataRowEditNew, guardiaDias);
      }
    }
  }

  const selectedCell = (e) => {
    if (e.column.dataField.length > 0) {
      let columnValid = e.column.dataField;
      //console.log("selectedCell.Columvalid", columnValid);
      let estadoCeldActual = e.cellElement.childNodes[0].innerText;
      if (isNotEmpty(estadoCeldActual)) {
        let flCambio = false;
       // console.log("selectedCell", estadoCeldActual);
        if (estadoCeldActual === 'D' || estadoCeldActual === 'N') {
          let nuevoEstado = estadoCeldActual === 'D' ? 'N' : 'D';
          pinterElementoSeleccionado(e.cellElement, nuevoEstado);
          let filas = dataSourceDias;
          filas[0][columnValid] = nuevoEstado;
          props.setDataSourceDias(filas);
          console.log(filas);
        }
      }

    }
  }

  function pinterElementoSeleccionado(elemento, estado) {
    elemento.children[0].innerHTML = estado;
    elemento.children[0].classList.remove((estado === 'D' ? 'celda_N' : 'celda_D'));
    elemento.children[0].classList.add((estado === 'D' ? 'celda_D' : 'celda_N'));
  }

  const getClassCeldaByEstado = (estadoCelda) => {
    let str_css = 'celda_Hijo_General ';
    switch (estadoCelda) {
      case 'D': str_css += 'celda_D'; break;
      case 'N': str_css += 'celda_N'; break;
    }
    return str_css;
  }

  // const ReservaEstados = () => {
  //   return [
  //     { text: "Día", Id: "D", color: "white", },
  //     { text: "Noche", Id: "N", color: "white", },
  //   ];
  // }

  const onCellPrepared = (e) => {
    if (e.rowType === 'data') {
      let columnValid = e.column.dataField;
      if (columnValid) {
        e.cellElement.classList.add("celda_Padre");
      }

    }
  }

  const cellRenderDay = (param) => {

    if (param && param.data) {

      let columnId = param.column.dataField;
      let columnValue = param.value;

      if (param.text != '') {

        if (param.text != 'L') {
          let css_clase = getClassCeldaByEstado(columnValue);

          return <Fragment>
            <span id={`${columnId.toString()}_${columnValue}`} className={css_clase}>{columnValue}</span>
            <input type="hidden" value={columnValue} />
          </Fragment>
        } else {
          return <Fragment>
            <span className="celda_Hijo_General" >{param.text}</span>
          </Fragment>
        }

      }
    }

  }

  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }

  useEffect(() => {
    cargarCombos();
  }, []);

  const onCellClick = (e) => {
    selectedRange.startRowIndex = e.rowIndex;
    selectedRange.endRowIndex = e.rowIndex;
    selectedRange.startColumnIndex = e.columnIndex;
    selectedRange.endColumnIndex = e.columnIndex;
    isSelectionStopped = false;
    showSelection(e, selectedRange);
  }
  /***************************************** */
  function showSelection(e, selectedRange) {
    let elems = document.querySelectorAll(".cell-selected");

    [].forEach.call(elems, function (el) {
      el.classList.remove("cell-selected");
    });

    foreachRange(selectedRange, function (rowIndex, columnIndex) {
      e.component.getCellElement(rowIndex, columnIndex).classList.add("cell-selected");
    });
  }

  function foreachRange(selectedRange, func) {
    if (selectedRange.startRowIndex >= 0) {
      var minColumnIndex = Math.min(selectedRange.startColumnIndex, selectedRange.endColumnIndex);
      var maxColumnIndex = Math.max(selectedRange.startColumnIndex, selectedRange.endColumnIndex);

      let rowIndex = selectedRange.startRowIndex;
      for (var columnIndex = minColumnIndex; columnIndex <= maxColumnIndex; columnIndex++) {
        func(rowIndex, columnIndex);
      }
    }
  }
  /***************************************** */

  const onCellHoverChanged = (e) => {
    var event = e.event;

    if (event.buttons === 1) {

      if (isSelectionStopped) {
        isSelectionStopped = false;
        selectedRange = {};
      }
      if (selectedRange.startRowIndex === undefined) {
        selectedRange.startRowIndex = e.rowIndex;
      }
      if (selectedRange.startColumnIndex === undefined) {
        selectedRange.startColumnIndex = e.columnIndex;
      }

      selectedRange.endRowIndex = e.rowIndex;
      selectedRange.endColumnIndex = e.columnIndex;
      showSelection(e, selectedRange);

    }
    else {
      isSelectionStopped = true;
    }
  }

  function agregarDias(estado) {
    console.log("agregarDias", estado);
    let elems = document.querySelectorAll(".cell-selected");
    console.log(elems);
    let filas = dataSourceDias;
    for (let i = 0; i < elems.length; i++) {
      if (elems[i].children.length > 0) {
        let estadoCeldActual = elems[i].children[0].innerHTML;
        if (estadoCeldActual === 'D' || estadoCeldActual === 'N') {
          let dia = elems[i].children[0].id.split('_')[0];
          pinterElementoSeleccionado(elems[i], estado);
          filas[0][dia] = estado;
        }
      }
    }
    props.setDataSourceDias(filas);
    console.log(filas);
  }

  const onContextMenuPreparing = (e) => {

    e.items = [
      { id: "1", text: 'Seleccionar turno día', onItemClick: (e) => { agregarDias('D'); } },
      { id: "2", text: 'Seleccionar turno noche', onItemClick: (e) => { agregarDias('N'); } }
    ];

  }

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
      <PortletBody >
        <React.Fragment>
          <Form formData={dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={2} colSpan={2}>

              <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "COMMON.DETAIL" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

              <Item dataField="IdGuardia"
                isRequired={modoEdicion}
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                editorOptions={{
                  maxLength: 10,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !dataRowEditNew.esNuevoRegistro ? true : false
                }}
                >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item dataField="Guardia"
                label={{ text: intl.formatMessage({ id: "ADMINISTRACION.GUARD" }) }}
                isRequired={modoEdicion ? isRequired('Guardia', settingDataField) : false}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('Guardia', settingDataField) : false),
                  maxLength: 100,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                }}
              							>
							{(isRequiredRule("Guardia")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
							<PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
						</Item>

            </GroupItem>
          </Form>
          <br />
          <DataGrid
            id="gridRegimenGuardiaDias"
            dataSource={dataSourceDias}
            showBorders={true}
            keyExpr="IdGuardia"
            onCellDblClick={selectedCell}
            onCellPrepared={onCellPrepared}

            onCellClick={onCellClick}
            onCellHoverChanged={onCellHoverChanged}
            onContextMenuPreparing={onContextMenuPreparing}
          >
            <Column caption="DIAS DE TRABAJO" alignment="center"  >
              {guardiaDias.filter(b => b.Turno === "D").map((x, i) => (
                <Column dataField={x.IdDia} caption={x.IdDia} alignment="center" width={"5%"}
                  cellRender={cellRenderDay}
                />

              ))}
            </Column>
            <Column caption="DESCANSO" alignment="center"   >
              {guardiaDias.filter(b => b.Turno === "L").map((x, i) => (
                <Column dataField={x.IdDia} caption={x.IdDia} alignment="center" width={"5%"} cellRender={cellRenderDay} />
              ))}

            </Column>
            <Column alignment="center" width={"100%"} >
              <Column alignment="center" width={"100%"} />
            </Column>
          </DataGrid>


        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(RegimenGuardiaEditPage);
