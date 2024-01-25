import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";//Multi-idioma
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
//import { listarEstado } from "../../../../api/sistema/entidad.api";
import { obtenerTodos as obtenerTodosRequisito } from "../../../../api/acceso/requisito.api";
import { useSelector } from "react-redux";
import PropTypes from 'prop-types'
import { listarEstadoSimple, listarEstado } from "../../../../../_metronic/utils/utils";

const ZonaRequisitoEditPage = props => {
  const perfil = useSelector(state => state.perfil.perfilActual);
  const { intl } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estados, setEstados] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [requisitos, setRequisitos] = useState([]);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    let estados = listarEstado();
    let requisitos = await obtenerTodosRequisito({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision });

    setEstadoSimple(estadoSimple);
    setEstados(estados);
    setRequisitos(requisitos);
  }

  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregar(props.dataRowEditNew);
      } else {
        props.actualizar(props.dataRowEditNew);
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
        />)}
      <PortletBody >
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2} visible={props.showAppBar}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "COMMON.DETAIL" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

              <Item
                dataField="IdRequisito"
                label={{ text: intl.formatMessage({ id: "ACCESS.REQUIREMENT" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                colSpan={2}
                editorOptions={{
                  items: requisitos,
                  valueExpr: "IdRequisito",
                  displayExpr: "Requisito",
                  disabled: !props.dataRowEditNew.esNuevoRegistro
                }}
              />
              <Item
                dataField="Warning"
                label={{ text: intl.formatMessage({ id: "ACCESS.REQUIREMENT.WARNING" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  items: estados,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  //disabled: props.dataRowEditNew.esNuevoRegistro ? true : false
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
              <Item dataField="IdCliente" visible={false} />
              <Item dataField="IdDivision" visible={false} />
              <Item dataField="IdZona" visible={false} />
            </GroupItem>
          </Form>
        </React.Fragment>
      </PortletBody>
    </>
  );
};
ZonaRequisitoEditPage.propTypes = {
  showButton: PropTypes.bool,
  showAppBar: PropTypes.bool
}
ZonaRequisitoEditPage.defaultProps = {
  showButton: true,
  showAppBar: true
}
export default injectIntl(ZonaRequisitoEditPage);
