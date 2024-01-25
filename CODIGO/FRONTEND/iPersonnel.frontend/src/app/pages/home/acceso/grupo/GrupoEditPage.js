import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl"
import Form, {
  Item,
  GroupItem,
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
import { obtenerTodos as obtenerCmbHorario } from "../../../../api/acceso/horario.api";

import {listarEstado, listarEstadoSimple, PatterRuler} from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";


const GrupoEditPage = props => {
  const { intl, accessButton, modoEdicion, settingDataField } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [listaEstados, setListaEstados] = useState([]);//si, no
  const classesEncabezado = useStylesEncabezado();
  const [cmbHorario, setCmbHorario] = useState([]);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    let estados = listarEstado();

    let cmbHorario = await obtenerCmbHorario({ IdCliente: props.idCliente, IdDivision: props.idDivision });

    setEstadoSimple(estadoSimple);
    setListaEstados(estados);
    setCmbHorario(cmbHorario);
  }

  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarGrupo(props.dataRowEditNew);
      } else {
        props.actualizarGrupo(props.dataRowEditNew);
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

              <Item dataField="IdGrupo"
                    label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                    isRequired={modoEdicion}
                    editorOptions={{
                      maxLength: 10,
                      inputAttr: { 'style': 'text-transform: uppercase' },
                      readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                    }}
              >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item dataField="Grupo"
                    isRequired={modoEdicion ? isRequired('Grupo', settingDataField) : false}
                    label={{ text: intl.formatMessage({ id: "ACCESS.GROUP" }) }}
                    colSpan={2}
                    editorOptions={{
                      maxLength: 200,
                      inputAttr: { 'style': 'text-transform: uppercase' },
                      readOnly: !(modoEdicion ? isModified('Grupo', settingDataField) : false)
                    }}
              >
                {(isRequiredRule("Grupo")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={200} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item
                dataField="IdHorario"
                label={{ text: intl.formatMessage({ id: "ACCESS.GROUP.SCHEDULE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion ? isRequired('IdHorario', settingDataField) : false}
                editorOptions={{
                  items: cmbHorario,
                  valueExpr: "IdHorario",
                  displayExpr: "Horario",
                  readOnly: !(modoEdicion ? isModified('Grupo', settingDataField) : false)
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

              <Item
                dataField="AsignarAContratoUnidadOrganizativa"
                label={{ text: intl.formatMessage({ id: "ACCESS.GROUP.ASSIGNFROMCONTRACT" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  items: listaEstados,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !(modoEdicion ? isModified('Grupo', settingDataField) : false)
                }}
              />
            </GroupItem>
          </Form>

        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(GrupoEditPage);
