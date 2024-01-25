import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
//import { listarEstado, listarEstadoSimple } from "../../../../api/sistema/entidad.api";
import { obtenerTodos as listarTipoPuerta } from "../../../../api/acceso/tipoPuerta.api";
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux';
import { listarEstado, listarEstadoSimple } from "../../../../../_metronic";

const PuertaEditPage = props => {
  const perfil = useSelector(state => state.perfil.perfilActual);
  const { intl } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estadoSiNo, setEstadoSiNo] = useState([]);

  const [tipoPuerta, setTipoPuerta] = useState([]);

  const classesEncabezado = useStylesEncabezado();

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    let estadoSiNo = listarEstado();

    let tipoPuerta = await listarTipoPuerta({ IdCliente: perfil.IdCliente });
    setEstadoSimple(estadoSimple);
    setTipoPuerta(tipoPuerta);
    setEstadoSiNo(estadoSiNo);
  }

  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarPuerta(props.dataRowEditNew);
      } else {
        props.actualizarPuerta(props.dataRowEditNew);
      }
    }
  }

  useEffect(() => {
    cargarCombos();
  }, []);

  return (
    <>
      {props.showButton && (
        <PortletHeader
          title={props.titulo}
          toolbar={
            <PortletHeaderToolbar>

              <Button
                id="idButtonGrabarTview"
                icon="fa fa-save"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                disabled={!props.modoEdicion}
                onClick={grabar}
                useSubmitBehavior={true}
                validationGroup="FormEdicion" 
                visible={false}
                />
                &nbsp;
              <Button
                icon="fa fa-times-circle"
                type="normal"
                hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                disabled={!props.modoEdicion}
                onClick={props.cancelarEdicion} 
                visible={false}
                />

            </PortletHeaderToolbar>
          }
        />
      )}
      <PortletBody >
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2} visible={props.showAppBar}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "ACCESS.DOOR" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>
              <Item dataField="IdPuerta"
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                isRequired={props.modoEdicion}
                colSpan={2}
                editorOptions={{
                  readOnly: !props.modoEdicion,
                  maxLength: 10,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  disabled: !props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              />
              <Item dataField="Puerta"
                isRequired={props.modoEdicion}
                label={{ text: intl.formatMessage({ id: "ACCESS.DOOR" }) }}
                colSpan={2}
                editorOptions={{
                  readOnly: !props.modoEdicion,
                  maxLength: 100,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                }}
              />
              <Item
                dataField="PuertaCalle"
                label={{ text: intl.formatMessage({ id: "ACCESS.DOOR.STREET" }) }}
                editorType="dxSelectBox"
                isRequired={props.modoEdicion}
                editorOptions={{
                  readOnly: !props.modoEdicion,
                  items: estadoSiNo,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                }}
              />
              <Item
                dataField="IdTipoPuerta"
                label={{ text: intl.formatMessage({ id: "ACCESS.DOOR.TYPE" }) }}
                editorType="dxSelectBox"
                isRequired={props.modoEdicion}
                editorOptions={{
                  readOnly: !props.modoEdicion,
                  items: tipoPuerta,
                  valueExpr: "IdTipoPuerta",
                  displayExpr: "TipoPuerta",
                }}
              />
              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={props.modoEdicion}
                editorOptions={{
                  readOnly: !props.modoEdicion,
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  disabled: props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              />
              <Item dataField="IdCliente" visible={false} />
              <Item dataField="IdDivision" visible={false} />
              <Item dataField="IdZona" visible={false} />

            </GroupItem>
          </Form>
        </React.Fragment>
      </PortletBody>
    </>
  );
}
PuertaEditPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButton: PropTypes.bool,
  showAppBar: PropTypes.bool,

}
PuertaEditPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButton: true,
  showAppBar: true,

}

export default injectIntl(PuertaEditPage);
