import React, { useState, useEffect } from "react";
import Form, { Item, GroupItem, ButtonItem } from "devextreme-react/form";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import { Button } from "devextreme-react";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { injectIntl } from "react-intl";

const PersonaGrupoFilterPage = (props) => {
  const { intl } = props;

  const classesEncabezado = useStylesEncabezado();

  const onBuscarFiltros = (e) => {
    let { FechaInicio, FechaFin } = props.dataFilter;

    let flF1 = FechaInicio instanceof Date && !isNaN(FechaInicio.valueOf()) && FechaInicio > new Date(1970, 1, 1);
    let flF2 = FechaFin instanceof Date && !isNaN(FechaFin.valueOf()) && FechaFin > new Date(1970, 1, 1);

    if (flF1 && flF2) {
      props.generarFiltro(props.dataFilter);
    }
  };


  useEffect(() => {
    //cargarCombos();
  }, []);

  return (
    <React.Fragment>
      <Form formData={props.dataFilter}>
        <GroupItem itemType="group" colCount={2} colSpan={2}>
          <Item
            dataField="FechaInicio"
            label={{
              text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" }),
            }}
            //isRequired={true}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy",
              onKeyUp: (evt) => {
                if (evt.event.keyCode === 13) {
                  onBuscarFiltros(evt);
                }
              },
              onClosed: (evt) => {
                onBuscarFiltros(evt);
              },
            }}
          />
          <Item
            dataField="FechaFin"
            label={{
              text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" }),
            }}
            //isRequired={true}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy",
              onKeyUp: (evt) => {
                if (evt.event.keyCode === 13) {
                  onBuscarFiltros(evt);
                }
              },
              onClosed: (evt) => {
                onBuscarFiltros(evt);
              },
            }}
          />
        </GroupItem>
      </Form>
      <br />
    </React.Fragment>
  );
};

export default injectIntl(PersonaGrupoFilterPage);
