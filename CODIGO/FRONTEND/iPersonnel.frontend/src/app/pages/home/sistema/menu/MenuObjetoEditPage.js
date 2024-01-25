import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button, SelectBox } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import PropTypes from 'prop-types'
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../store/ducks/notify-messages";

import { listarEstadoSimple } from "../../../../../_metronic";
import { obtenerTodos as obtenerCmbObjeto } from "../../../../api/sistema/objeto.api";


const MenuObjetoEditPage = props => {

  const { intl } = props;
  const [estado, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [cmbObjeto, setCmbObjeto] = useState([]);

  async function cargarCombos() {
    let estadoActivo = listarEstadoSimple();
    setEstadoSimple(estadoActivo);

    let cmbObjeto = await obtenerCmbObjeto();
    setCmbObjeto(cmbObjeto);
  }


  const eliminar = evt => {
    props.eliminarMenuObjeto(evt.data);
  };

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarMenuObjeto(props.dataRowEditNew);
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));

      } else {
        props.actualizarMenuObjeto(props.dataRowEditNew);
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
        

            <Form formData={props.dataRowEditNew} validationGroup="FormEdicion"  >
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
                  dataField="IdObjeto"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.MENU.OBJECT.OBJECT" }) }}
                  editorType="dxSelectBox"
                  isRequired={true}
                  colSpan={1}
                  editorOptions={{
                    items: cmbObjeto,
                    valueExpr: "IdObjeto",
                    displayExpr: function (item) {
                      if (item) {
                        return item.IdObjeto + " - " + item.Objeto;
                      }
                    },
                    disabled: !props.dataRowEditNew.esNuevoRegistro ? true : false
                  }}
                />

                <Item dataField="Identificador"
                  isRequired={true}
                  label={{ text: intl.formatMessage({ id: "SYSTEM.MENU.OBJECT.IDENTIFIER" }) }}
                  colSpan={1}
                  editorOptions={{
                    items: cmbObjeto,
                    readOnly: !props.modoEdicion,
                    maxLength: 100,
                    disabled: !props.dataRowEditNew.esNuevoRegistro ? true : false
                  }}
                />

                <Item dataField="TipoObjeto"
                  isRequired={true}
                  label={{ text: intl.formatMessage({ id: "SYSTEM.MENU.OBJECT.OBJECTTYPE" }) }}
                  colSpan={1}
                  editorOptions={{
                    items: cmbObjeto,
                    readOnly: !props.modoEdicion,
                    maxLength: 100,
                    disabled: !props.dataRowEditNew.esNuevoRegistro ? true : false
                  }}
                />

                <Item
                  dataField="Activo"
                  label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                  editorType="dxSelectBox"
                  isRequired={true}
                  colSpan={1}
                  editorOptions={{
                    items: estado,
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

export default injectIntl(MenuObjetoEditPage);