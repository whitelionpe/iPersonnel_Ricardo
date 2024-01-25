import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl"
import { useSelector } from "react-redux";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { listarEstadoSimple, listarEstado } from "../../../../api/sistema/entidad.api";
import { obtenerTodos as obtenerCmbUnidadOrganizativa } from "../../../../api/administracion/unidadOrganizativa.api";
import { obtenerTodos as obtenerCmbTipoPosicion } from "../../../../api/administracion/tipoPosicion.api";
import { obtenerTodos as obtenerCmbFuncion } from "../../../../api/administracion/funcion.api";

const PosicionEditPage = props => {
  const { intl } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estadoRegistro, setEstadoRegistro] = useState([]);

  const classesEncabezado = useStylesEncabezado();
  const [cmbUnidadOrganizativa, setCmbUnidadOrganizativa] = useState([]);
  const [cmbTipoPosicion, setCmbTipoPosicion] = useState([]);
  const [cmbFuncion, setCmbFuncion] = useState([]);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    let estadoRegistro = listarEstado();

    //console.log("cmbUnidadOrganizativa", perfil.IdCliente)
    let cmbUnidadOrganizativa = await obtenerCmbUnidadOrganizativa({ IdCliente: perfil.IdCliente, IdDivision: '%' });
    //console.log("cmbUnidadOrganizativa", cmbUnidadOrganizativa);
    let cmbTipoPosicion = await obtenerCmbTipoPosicion({ IdCliente: perfil.IdCliente });
    let cmbFuncion = await obtenerCmbFuncion({ IdCliente: perfil.IdCliente });

    setEstadoSimple(estadoSimple);
    setEstadoRegistro(estadoRegistro);
    
    setCmbUnidadOrganizativa(cmbUnidadOrganizativa);
    setCmbTipoPosicion(cmbTipoPosicion);
    setCmbFuncion(cmbFuncion);
  }

  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarPosicion(props.dataRowEditNew);
      } else {
        props.actualizarPosicion(props.dataRowEditNew);
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
                     {intl.formatMessage({ id: "ADMINISTRATION.POSITION.ADD" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>
              <Item dataField="IdPosicion"
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                isRequired={true}
                editorOptions={{
                  maxLength: 10,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  disabled: !props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              />

              <Item dataField="Posicion"
                isRequired={true}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION" }) }}
                colSpan={2}
                editorOptions={{
                  maxLength: 100,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                }}
              />
              <Item
                dataField="IdUnidadOrganizativa"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.ORGANIZATIONALUNIT" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  items: cmbUnidadOrganizativa,
                  valueExpr: "IdUnidadOrganizativa",
                  displayExpr: "UnidadOrganizativa",
                  //enabled: props.dataRowEditNew.esNuevoRegistro ? false : true
                }}
              />
              <Item
                dataField="IdTipoPosicion"
                label={{ text:  intl.formatMessage({ id: "ADMINISTRATION.POSITION.POSITIONTYPE" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  items: cmbTipoPosicion,
                  valueExpr: "IdTipoPosicion",
                  displayExpr: "TipoPosicion",
                }}
              />
              <Item
                dataField="IdFuncion"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.FUNCTION" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  items: cmbFuncion,
                  valueExpr: "IdFuncion",
                  displayExpr: "Funcion",
                  //enabled: props.dataRowEditNew.esNuevoRegistro ? false : true
                }}
              />
              <Item
                dataField="Confianza"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.TRUST" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  items: estadoRegistro,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  enabled: props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              />
              <Item
                dataField="Fiscalizable"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.CONTROLLABLE" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  items: estadoRegistro,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  enabled: props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              />
              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  disabled: props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              />
            </GroupItem>
          </Form>
        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(PosicionEditPage);
