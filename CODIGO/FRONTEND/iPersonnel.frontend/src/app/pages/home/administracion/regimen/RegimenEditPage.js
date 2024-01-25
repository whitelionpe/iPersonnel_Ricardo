import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl"; //Multi-idioma
import { useSelector } from "react-redux";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import Form, { 
  Item,
  GroupItem,
  SimpleItem,
  ButtonItem,
  RequiredRule,
  StringLengthRule,
  PatternRule
  } from "devextreme-react/form";

import DataGrid, {
  Column,
  Editing,
  Paging,
  Selection,
  FilterRow,
} from 'devextreme-react/data-grid';
import { Popup } from 'devextreme-react/popup';

import { listar as ObtenerCampamentoPerfil } from "../../../../api/campamento/perfil.api";
import CampamentoCompaniaPerfilBuscar from "../../../../partials/components/CampamentoCompaniaPerfilBuscar";

import { listarEstadoSimple, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";

const RegimenEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton, numeroGuardias } = props;

  const perfil = useSelector(state => state.perfil.perfilActual);

  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();

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

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
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
              visible={modoEdicion}
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

              <Item dataField="IdRegimen"
                isRequired={modoEdicion}
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                editorOptions={{
                  maxLength: 10,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
                >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item dataField="Regimen"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.REGIME" }) }}
                isRequired={modoEdicion ? isRequired('Regimen', settingDataField) : false}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('Regimen', settingDataField) : false),
                  maxLength: 50,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                }}
                >
                {(isRequiredRule("Regimen")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item
                dataField="DiasTrabajo"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.REGIME.WORK.DAYS" }) }}
                isRequired={modoEdicion ? isRequired('DiasTrabajo', settingDataField) : false}
                editorType="dxNumberBox"
                dataType="number"
                editorOptions={{
                  readOnly: !(modoEdicion ? numeroGuardias > 0 ? false : true : false),
                  inputAttr: { style: "text-transform: uppercase; text-align: right" },
                  showSpinButtons: true,
                  showClearButton: true,
                  min: 0
                }}
              >
                <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
              </Item>

              <Item
                dataField="DiasDescanso"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.REGIME.DAYSOFF.REST" }) }}
                isRequired={modoEdicion ? isRequired('DiasDescanso', settingDataField) : false}
                editorType="dxNumberBox"
                dataType="number"
                editorOptions={{
                  readOnly: !(modoEdicion ? numeroGuardias > 0 ? false : true : false),
                  inputAttr: { style: "text-transform: uppercase; text-align: right" },
                  showSpinButtons: true,
                  showClearButton: true,
                  min: 0
                }}
              >
                <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
              </Item>

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false),
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                }}
              />
            </GroupItem>
          </Form>

        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(RegimenEditPage);
