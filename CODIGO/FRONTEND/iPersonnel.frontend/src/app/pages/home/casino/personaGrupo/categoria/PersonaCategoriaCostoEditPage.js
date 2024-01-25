import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";

import { listarEstadoSimple } from "../../../../../../_metronic";
import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";

import { obtenerTodos as obtenerCmbCategoriaCosto } from "../../../../../api/casino/casinoCategoriaCosto.api";

const PersonaCategoriaCostoEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton,fechasContrato} = props;
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [estadoSimple, setEstadoSimple] = useState([]);

  const classesEncabezado = useStylesEncabezado();
  const [cmbCategoriaCosto, setCmbCasinoGrupo] = useState([]);

  async function cargarCombos() {
    let cmbCategoriaCosto = await obtenerCmbCategoriaCosto({ IdCliente: perfil.IdCliente });
    let estadoSimple = listarEstadoSimple();

    setCmbCasinoGrupo(cmbCategoriaCosto);
    setEstadoSimple(estadoSimple);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarCategoriaCosto(props.dataRowEditNew);
      } else {
        props.actualizarCategoriaCosto(props.dataRowEditNew);
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
              <Item dataField="IdPersona" visible={false} />
              <Item dataField="IdSecuencial" visible={false} />
              <Item
                dataField="IdCategoriaCosto"
                label={{ text: intl.formatMessage({ id: "CASINO.PERSON.CATEGORY_COST.CATEGORYCOST" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                colSpan={1}
                editorOptions={{
                  items: cmbCategoriaCosto,
                  valueExpr: "IdCategoriaCosto",
                  displayExpr: "CategoriaCosto",
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              />
              <Item />
              <Item
                dataField="FechaInicial"
                label={{ text: intl.formatMessage({ id: "CASINO.PERSON.CATEGORY_COST.INITIALDATE" }) }}
                editorType="dxDateBox"
                dataType="date"
                isRequired={modoEdicion ? isRequired('FechaInicial', settingDataField) : false}
                editorOptions={{
                  displayFormat: "dd/MM/yyyy",
                  readOnly: !(modoEdicion ? isModified('FechaInicial', settingDataField) : false),
                  min: fechasContrato.FechaInicioContrato,
                  max: fechasContrato.FechaFinContrato
                }}
              />
              <Item
                dataField="FechaFinal"
                label={{ text: intl.formatMessage({ id: "CASINO.PERSON.CATEGORY_COST.FINALDATE" }) }}
                editorType="dxDateBox"
                dataType="date"
                isRequired={modoEdicion ? isRequired('FechaFinal', settingDataField) : false}
                editorOptions={{
                  displayFormat: "dd/MM/yyyy",
                  readOnly: !(modoEdicion ? isModified('FechaFinal', settingDataField) : false),
                  min: fechasContrato.FechaInicioContrato,
                  max: fechasContrato.FechaFinContrato
                }}
              />
              <Item />
              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                colSpan={1}
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

export default injectIntl(PersonaCategoriaCostoEditPage);
