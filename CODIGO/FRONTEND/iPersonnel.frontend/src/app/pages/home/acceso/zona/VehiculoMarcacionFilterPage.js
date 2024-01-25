import React, { useState, useEffect } from "react";
import Form, { Item, GroupItem, ButtonItem } from "devextreme-react/form";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import { Button } from "devextreme-react";
import { useStylesEncabezado } from "../../../../store/config/Styles";
//import { useSelector } from "react-redux";

//Multi-idioma
import { injectIntl } from "react-intl";
//import { connect } from "react-redux";

const VehiculoMarcacionFilterPage = (props) => {
  //multi-idioma
  const { intl } = props;

  //const perfil = useSelector((state) => state.perfil.perfilActual);

  const classesEncabezado = useStylesEncabezado();

  const onBuscarFiltros = (e) => {
    let { FechaInicio, FechaFin } = props.dataFilter;

    let flF1 = FechaInicio instanceof Date && !isNaN(FechaInicio.valueOf()) && FechaInicio > new Date(1970, 1, 1);
    let flF2 = FechaFin instanceof Date && !isNaN(FechaFin.valueOf()) && FechaFin > new Date(1970, 1, 1);

    if (flF1 && flF2) {
      props.setDataFilter({
        ...props.dataFilter, FechaInicio, FechaFin
      });
      props.generarFiltro(props.dataFilter);
    }
  };



  useEffect(() => {
    //cargarCombos();
  }, []);

  return (
    <React.Fragment>
      <Form formData={props.dataFilter}>
        <GroupItem itemType="group" colCount={3} colSpan={2}>
          <Item colSpan={3}>
            <AppBar
              position="static"
              className={classesEncabezado.secundario}
            >
              <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                  {intl.formatMessage({ id: "ACCESS.PERSON.FILTER" })}
                </Typography>
              </Toolbar>
            </AppBar>
          </Item>
          <Item
            dataField="FechaInicio"
            label={{
              text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" }),
            }}
            isRequired={true}
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
              text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" }),
            }}
            isRequired={true}
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

          {/* <ButtonItem
                horizontalAlignment="left"
                buttonOptions={{
                  text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.SEARCH" }),
                  type: "default",
                  icon: "search",
                  useSubmitBehavior: true,
                  onClick: function() { 
                    onBuscarFiltros();
                  },
                }}
              /> */}
        </GroupItem>
      </Form>
      <br />
    </React.Fragment>
  );
};

export default injectIntl(VehiculoMarcacionFilterPage);
