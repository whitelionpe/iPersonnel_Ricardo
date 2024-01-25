import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem, PatternRule, RequiredRule, StringLengthRule } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { isNotEmpty, listarEstadoSimple, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import { obtenerTodos as obtenerCmbModulo } from "../../../../api/sistema/modulo.api";
import { handleInfoMessages } from "../../../../store/ducks/notify-messages";

const EquipoEditAsignacionPage = props => {

  const { intl, modoEdicion, settingDataField, accessButton } = props;
  const classesEncabezado = useStylesEncabezado();

  function grabar(e) {
    props.actualizarEquipoAsignar(props.dataRowEditNew);
  }


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
                      {intl.formatMessage({ id: "SYSTEM.TEAM.ASSIGNMENT.DEVICE" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

              <Item dataField="Modulo"
                label={{ text: intl.formatMessage({ id: "CAMP.RESERVATION.MODULE" }) }}
                editorOptions={{
                  readOnly: true,
                  maxLength: 50,
                  inputAttr: { 'style': 'text-transform: uppercase', 'style': 'background: gainsboro' },
                }}
              />

              <Item dataField="Zona"
                label={{ text: intl.formatMessage({ id: "ACCESS.GROUP.RESTRICTION.ZONE" }) }}
                editorOptions={{
                  readOnly: true,
                  maxLength: 50,
                  inputAttr: { 'style': 'text-transform: uppercase', 'style': 'background: gainsboro' },
                }}
              />

              <Item
                dataField="IdModuloAlternativo"
                label={{ text: intl.formatMessage({ id: "SECURITY.PROFILE.MENU.MODULE" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: props.moduloData,
                  valueExpr: "IdModuloAlternativo",
                  displayExpr: "ModuloAlternativo",
                  showClearButton: true,
                  searchEnabled: true,
                }}
              />

              <Item dataField="IdCliente" visible={false} />
            </GroupItem>

          </Form>
        </React.Fragment>

      </PortletBody>
    </>
  );

};

export default injectIntl(EquipoEditAsignacionPage);
