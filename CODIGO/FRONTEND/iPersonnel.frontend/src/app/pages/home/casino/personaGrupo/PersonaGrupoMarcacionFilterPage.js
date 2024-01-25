import React, { useEffect } from "react";
import Form, { Item, GroupItem, ButtonItem } from "devextreme-react/form";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import { useStylesEncabezado } from "../../../../store/config/Styles";
import { injectIntl } from "react-intl";

const PersonaGrupoMarcacionFilterPage = (props) => {
  const { intl } = props;

  const classesEncabezado = useStylesEncabezado();

  const onBuscarFiltros = () => {
    props.generarFiltro(props.dataFilter);
  };

  useEffect(() => {
  }, []);

  return (
    <React.Fragment>
      <Form formData={props.dataFilter}>
        <GroupItem itemType="group" colCount={2} colSpan={2}>
          {/* <Item colSpan={3}>
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
          </Item> */}
          <Item
            dataField="FechaInicio"
            // isRequired={true}
            label={{
              text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.STARTDATE" }),
            }}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy",
              onKeyUp: (evt) => {
                if (evt.event.keyCode === 13) {
                  onBuscarFiltros();
                }
              },
              onClosed: (evt) => {
                onBuscarFiltros();
              },
            }}

          />
          <Item
            dataField="FechaFin"
            // isRequired={true}
            label={{
              text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.ENDDATE" }),
            }}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy",
              onKeyUp: (evt) => {
                if (evt.event.keyCode === 13) {
                  onBuscarFiltros();
                }
              },
              onClosed: (evt) => {
                onBuscarFiltros();
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
                  onClick: function () {
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

export default injectIntl(PersonaGrupoMarcacionFilterPage);
