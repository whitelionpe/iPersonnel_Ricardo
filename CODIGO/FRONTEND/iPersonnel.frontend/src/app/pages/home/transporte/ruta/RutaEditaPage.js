import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { listarEstadoSimple, PatterRuler } from "../../../../../_metronic";

import {
  service
} from "../../../../api/transporte/tipoRuta.api";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";

const RutaEditaPage = props => {

  const { intl, setLoading,accessButton,modoEdicion,settingDataField } = props;

  const [estadoSimple, setEstadoSimple] = useState([]);
  const [listTipoRuta, setListTipoRuta] = useState([]);
  const classesEncabezado = useStylesEncabezado();

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    var tipoRuta = await service.obtenerTodos({ Activo: 'S' });
    setListTipoRuta(tipoRuta)
    setEstadoSimple(estadoSimple);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarRutas(props.dataRowEditNew);
      } else {
        props.actualizarRutas(props.dataRowEditNew);
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
              onClick={props.cancelarEdicion} />

          </PortletHeaderToolbar>
        }
      />

      <PortletBody >
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
            <Item colSpan={2}>
              <AppBar position="static" className={classesEncabezado.secundario}>
                <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                  <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                    {intl.formatMessage({ id: "COMMON.DETAIL" })}
                  </Typography>
                </Toolbar>
              </AppBar>
            </Item>

            <GroupItem
              itemType="group"
              colCount={2}
              colSpan={2}
            >
              <Item 
               dataField="IdRuta"
                isRequired={true}
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                editorOptions={{
                  maxLength: 10,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              />

              <Item 
               dataField="Ruta"
                label={{ text: intl.formatMessage({ id: "TRANSPORTE.ROUTE" }) }}
                isRequired={modoEdicion ? isRequired('Ruta', settingDataField) : false}
                editorOptions={{
                  maxLength: 50,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !(modoEdicion ? isModified('Ruta', settingDataField) : false),
                }}
              />

              <Item
                dataField="IdTipoRuta"
                label={{ text: intl.formatMessage({ id: "TRANSPORTE.ROUTE.TYPE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion ? isRequired('IdTipoRuta', settingDataField) : false}
                editorOptions={{
                  items: listTipoRuta,
                  valueExpr: "IdTipoRuta",
                  displayExpr: "TipoRuta",
                  readOnly: !(modoEdicion ? isModified('IdTipoRuta', settingDataField) : false),
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
                  readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
                }}
              />
            </GroupItem>

          </Form>


        </React.Fragment>
      </PortletBody>
    </>
  );

};

export default injectIntl(RutaEditaPage);
