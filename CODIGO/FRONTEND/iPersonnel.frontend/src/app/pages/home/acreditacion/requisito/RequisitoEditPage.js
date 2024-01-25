import React, { useEffect, useState } from "react";
import Form, {
  Item,
  GroupItem,
  SimpleItem,
  PatternRule
} from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { injectIntl } from "react-intl";
import { isNotEmpty, TYPE_TIPO_REQUISITO } from "../../../../../_metronic";

import { listarTipoRequisito, listarEstadoSimple } from "../../../../../_metronic/utils/utils";
import { serviceEntidad } from "../../../../api/sistema/entidad.api";

import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";

const RequisitoEditPage = props => {
  const { intl, modoEdicion, dataRowEditNew, settingDataField } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [tipoRequisito, setTipoRequisito] = useState([]);
  const [entidades, setEntidades] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [readOnlyAprobarPorInterfaz, setReadOnlyAprobarPorInterfaz] = useState(false);


  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }

  useEffect(() => {
    cargarCombos();
    //console.log("xxxx", prop);
  }, []);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    let tipoRequisito = listarTipoRequisito();
    setEstadoSimple(estadoSimple);
    setTipoRequisito(tipoRequisito);
    let entidad = await serviceEntidad.obtenerTodos({ ImprimirFotocheck: "" });
    setEntidades(entidad);
    if (!dataRowEditNew.esNuevoRegistro) onValueChangedTipoRequisito(dataRowEditNew.TipoRequisito);
  }


  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (dataRowEditNew.esNuevoRegistro) {
        props.agregar(props.dataRowEditNew);
      } else {
        props.actualizar(props.dataRowEditNew);
      }
    }
  }

  function onValueChangedTipoRequisito(value) {
    //debugger;
    if (value === TYPE_TIPO_REQUISITO.AUTORIZADOR) {
      setReadOnlyAprobarPorInterfaz(true);
    } else {
      dataRowEditNew.AprobarPorInterfaz = false;
      setReadOnlyAprobarPorInterfaz(false);
    }
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

              <SimpleItem dataField="IdCliente" visible={false}></SimpleItem>

              <Item dataField="IdRequisito"
                isRequired={true}
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                editorOptions={{
                  maxLength: 20,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !dataRowEditNew.esNuevoRegistro,
                }}
              >

              </Item>

              <Item dataField="Requisito"
                isRequired={true}
                label={{ text: intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT" }) }}
                editorOptions={{
                  maxLength: 100,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !modoEdicion,
                }}
              >

              </Item>

              <Item
                dataField="IdEntidad"
                label={{ text: intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.ENTITY" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  items: entidades,
                  valueExpr: "IdEntidad",
                  displayExpr: "Entidad",
                  readOnly: !dataRowEditNew.esNuevoRegistro ? true : !modoEdicion,
                  placeholder: "Seleccione..",
                }}
              />

              <Item
                dataField="TipoRequisito"
                label={{ text: intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.TYPE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  items: tipoRequisito,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !dataRowEditNew.esNuevoRegistro ? true : !modoEdicion,
                  placeholder: "Seleccione..",
                  onValueChanged: (e) => onValueChangedTipoRequisito(e.value),

                }}
              />

              <Item
                dataField="Orden"
                label={{ text: intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.ORDER" }) }}
                isRequired={modoEdicion ? isRequired("Orden", settingDataField) : false}
                editorType="dxNumberBox"
                dataType="number"
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified("Orden", settingDataField) : false),
                  inputAttr: { style: "text-transform: uppercase; text-align: right" },
                  showSpinButtons: true,
                  showClearButton: true,
                  min: 0
                }}
              >
                <PatternRule
                  pattern={/[0-9]/}
                  message={intl.formatMessage({
                    id: "COMMON.ENTER.NUMERIC.DATA",
                  })}
                />
              </Item>

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  //readOnly: !modoEdicion,
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: dataRowEditNew.esNuevoRegistro ? true : !modoEdicion,
                }}
              />

              <Item
                dataField="AprobarPorInterfaz"
                // isRequired={false}
                editorType="dxCheckBox"
                label={{
                  text: "Check",
                  visible: false
                }}
                editorOptions={{
                  readOnly: dataRowEditNew.esNuevoRegistro ? true : !modoEdicion,
                  text: intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.APPROVE_BY_INTERFACE" }),
                  width: "100%",
                  //value: props.dataRowEditNew.AprobarPorInterfaz === "S" ? true : false
                  value: props.dataRowEditNew.AprobarPorInterfaz,
                  //onValueChanged: (e => onValueChangedAprobarPorInterfaz(e.value))

                }}
              />

              <Item
                dataField="FlDatoOpcional"
                // label={{ text: intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.OPTIONALTYPE.LABEL" }) }}
                label={{
                  text: "Check",
                  visible: false
                }}
                editorType="dxCheckBox"
                isRequired={false}
                editorOptions={{
                  text: intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.OPTIONALTYPE.LABEL" }),
                  width: "100%",
                  readOnly: !modoEdicion,
                  onValueChanged: (e) => { props.dataRowEditNew.DatoOpcional = e.value ? "S" : "N"; }
                }}
              />

            </GroupItem>

          </Form>
        </React.Fragment>
      </PortletBody>
    </>
  );

};

export default injectIntl(RequisitoEditPage);
