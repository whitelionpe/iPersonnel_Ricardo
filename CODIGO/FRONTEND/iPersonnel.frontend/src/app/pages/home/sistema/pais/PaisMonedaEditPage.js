import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, {
  Item,
  GroupItem,
  SimpleItem,
  ButtonItem,
  RequiredRule,
  StringLengthRule,
  PatternRule
} from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { obtenerTodos as obtenerCmbMoneda } from "../../../../api/sistema/moneda.api";

import { listarEstadoSimple, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";


const PaisMonedaEditPage = props => {
  const { intl, modoEdicion, accessButton, settingDataField } = props;

  const [estadoSimple, setEstadoSimple] = useState([]);

  const classesEncabezado = useStylesEncabezado();
  const [cmbMoneda, setCmbMoneda] = useState([]);
  const [cmbMonedaActiva, setCmbMonedaActiva] = useState([]);

  async function cargarCombos() {
    let cmbMoneda = await obtenerCmbMoneda({ Activo: '%' });
    let cmbMonedaActiva = await obtenerCmbMoneda({ Activo: 'S' });
    let estadoSimple = listarEstadoSimple();

    //debugger;
    setCmbMoneda(cmbMoneda);
    setEstadoSimple(estadoSimple);
    setCmbMonedaActiva(cmbMonedaActiva);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarPaisMoneda(props.dataRowEditNew);
      } else {
        props.actualizarPaisMoneda(props.dataRowEditNew);
      }
    }
  }

  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
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
              visible={props.modoEdicion}
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
                  dataField="IdMoneda"
                  label={{ text: intl.formatMessage({ id: "CONFIG.MENU.SISTEMA.MONEDA" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion}
                  editorOptions={{
                    items: props.dataRowEditNew.esNuevoRegistro ? cmbMonedaActiva : cmbMoneda,
                    valueExpr: "IdMoneda",
                    displayExpr: "Moneda",
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
                    readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
                  }}
                />
                <Item dataField="IdPais" visible={false} />
              </GroupItem>
            </Form>
         
        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(PaisMonedaEditPage);
