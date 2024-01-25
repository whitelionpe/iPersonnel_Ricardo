import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import PropTypes from "prop-types";
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Form, { Item, GroupItem } from "devextreme-react/form";
import { DataGrid, Selection, Column } from "devextreme-react/data-grid";

import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../../store/config/Styles";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";


const AutorizadorDatoEntidadEditPage = props => {
  const { intl, cancelarEdicion } = props;


  const classesEncabezado = useStylesEncabezado();
  const [datosSeleccionados, setDatosSeleccionados] = useState([]);
  const classes = useStylesTab();

  const [listaSolicitudes, setListaSolicitudes] = useState([]);

  async function cargar() {
    /***SOLICITUDES***********/
    setDatosSeleccionados([]);
    let solicitudes = await props.listarAutorizadorSolicitud();
    setListaSolicitudes(solicitudes);
  
    let default_items = solicitudes.filter(x => x.selected === "1").map(x => { return x.IdDato; });
    setDatosSeleccionados(default_items);

    // console.log("test2",default_items)
  }

  useEffect(() => {
    cargar();
  }, []);

  const grabar = () => {
    if (datosSeleccionados.length >= 1) {
      props.agregarAutorizadorSolicitud({ selectData: datosSeleccionados });
    } else {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ITEM" }));
    }
  }

  function onSelectionChanged(e) {
    setDatosSeleccionados(e.selectedRowKeys);
  }

  return (
    <>

      <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title={""}
            toolbar={
              <PortletHeaderToolbar >
                <Button
                  icon="fa fa-save"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                  onClick={grabar}
                  useSubmitBehavior={true}
                  validationGroup="FormEdicion"
                />
                &nbsp;
                <Button
                  icon="fa fa-times-circle"
                  type="normal"
                  hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                  onClick={cancelarEdicion}
                />
              </PortletHeaderToolbar>
            }
          />
        } />

      <Paper className={classes.paper}>
        <AppBar position="static" className={classesEncabezado.secundario}>
          <Toolbar variant="dense" className={classesEncabezado.toolbar}>
            <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
              {intl.formatMessage({ id: "ACCREDITATION.AUTHORIZER.DATA" })}
            </Typography>
          </Toolbar>
        </AppBar>
        <PortletHeader
          title={intl.formatMessage({ id: "ACCREDITATION.AUTHORIZER.SELECTED" })}
          toolbar={
            <PortletHeaderToolbar>
            </PortletHeaderToolbar>
          }
        />
        <PortletBody>

          <Grid container spacing={1} direction="row" justify="flex-start" alignItems="stretch" >
            <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
              <GroupItem itemType="group" colCount={2} colSpan={2}>
                <DataGrid
                  dataSource={listaSolicitudes}
                  showBorders={true}
                  focusedRowEnabled={true}
                  keyExpr="IdDato"
                  onSelectionChanged={(e => onSelectionChanged(e))}
                  selectedRowKeys={datosSeleccionados}
                >
                  <Selection mode={"multiple"} /> 
                  <Column
                    dataField="IsOrden"
                    width={"1%"}
                    visible={false}
                    sortOrder="asc"
                  />

                  <Column dataField="Entidad"
                    caption={intl.formatMessage({ id: "ACCREDITATION.PROFILE.ENTITY" })}
                    alignment={"center"}
                    allowSorting={true}
                    allowHeaderFiltering={false}
                    width={"10%"}

                  />
                  <Column dataField="Orden"
                    caption={intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.ORDER" })}
                    alignment={"center"}
                    allowSorting={true}
                    allowHeaderFiltering={false}
                    width={"9%"}
                    sortOrder="asc"
                  />
                  <Column dataField="IdDato"
                    caption={intl.formatMessage({ id: "COMMON.CODE" })}
                    allowSorting={true}
                    allowHeaderFiltering={false}
                    width={"20%"}
                  />
                  <Column dataField="Dato"
                    caption={intl.formatMessage({ id: "COMMON.DESCRIPTION" })}
                    allowSorting={true}
                    allowHeaderFiltering={false}
                    width={"60%"}
                  />

                </DataGrid>
                <Item dataField="IdCliente" visible={false} />
                <Item dataField="IdAutorizador" visible={false} />
                <Item dataField="Activo" visible={false} />
              </GroupItem>
            </Form>
          </Grid>

        </PortletBody>
      </Paper>

    </>
  );
};

AutorizadorDatoEntidadEditPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
};
AutorizadorDatoEntidadEditPage.defaultProps = {
  showHeaderInformation: true,
};


export default injectIntl(AutorizadorDatoEntidadEditPage);


