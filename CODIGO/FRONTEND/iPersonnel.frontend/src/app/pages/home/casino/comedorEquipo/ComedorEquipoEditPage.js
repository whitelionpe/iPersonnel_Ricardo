import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl"; 
import { useSelector } from "react-redux";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { listarEstadoSimple, isRequired, isModified, listarEstado } from "../../../../../_metronic";
import { serviceEquipoAsignado } from "../../../../api/sistema/equipoAsignado.api";

const ComedorEquipoEditPage = props => {
  const { intl, modoEdicion, dataMenu , accessButton} = props;
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estados, setEstados] = useState([]);

  const classesEncabezado = useStylesEncabezado();
  const [cmbEquipo, setCmbEquipo] = useState([]);
  const [comboPrinters, setComboPrinters] = useState([]);

  async function cargarCombos() {
    let cmbEquipo = await serviceEquipoAsignado.listar({ IdCliente: perfil.IdCliente });
    let printers = await serviceEquipoAsignado.listarPrinters({ IdCliente: perfil.IdCliente });
    let estadoSimple = listarEstadoSimple();
    let estadosLista = listarEstado();

    setCmbEquipo(cmbEquipo);
    setComboPrinters(printers);
    setEstadoSimple(estadoSimple);
    setEstados(estadosLista);

    //console.log("cargarCombos|props.dataRowEditNew",props.dataRowEditNew);
     // Si es cado editar se setea el valor por defecto IdEquipo Asignado.
    if(!props.dataRowEditNew.esNuevoRegistro){
      setCmbEquipo([{ IdEquipo:props.dataRowEditNew.IdEquipo, Equipo:props.dataRowEditNew.Equipo }]);
      setComboPrinters([{ IdEquipo:props.dataRowEditNew.IdEquipoPrinter, Equipo:props.dataRowEditNew.EquipoPrinter }]);
    }

  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarComedorEquipo(props.dataRowEditNew);
      } else {
        props.actualizarComedorEquipo(props.dataRowEditNew);
      }
    }
  }

  useEffect(() => {
    cargarCombos();
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
      <PortletBody >
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
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
              <Item
                dataField="IdEquipo"
                label={{ text: intl.formatMessage({ id: "SYSTEM.DEVICE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  items: cmbEquipo,
                  valueExpr: "IdEquipo",
                  displayExpr: "Equipo",
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
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
                  readOnly: !(modoEdicion? props.dataRowEditNew.esNuevoRegistro? false : true: false),
                }}
              />

              <Item
                dataField="IdEquipoPrinter"
                label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.DEVICE.PRINTER.NAME" }) }}
                editorType="dxSelectBox"
                //isRequired={modoEdicion}
                editorOptions={{
                  items: comboPrinters,
                  valueExpr: "IdEquipo",
                  displayExpr: "Equipo",
                  readOnly: !props.dataRowEditNew.esNuevoRegistro
                }}
              />

              <Item
                dataField="PermiteSeleccionarServicio"
                label={{ text: intl.formatMessage({ id: "CASINO.EQUIPO.SELECCIONARSERVICIO" }) }}
                editorType="dxSelectBox"
                //isRequired={modoEdicion}
                editorOptions={{
                  items: estados,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  //readOnly: !(modoEdicion? !props.dataRowEditNew.esNuevoRegistro: false),
                }}
              />

               <Item dataField="IdComedor" visible={false} />
            </GroupItem>
          </Form>
        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(ComedorEquipoEditPage);
