import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, {
  Item,
  GroupItem,
  SimpleItem,
  ButtonItem,
  CustomRule,
  CompareRule,
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
import { listarUnidadMedida } from "../../../../../_metronic";
import { listarEstadoSimple, listarEstado, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";



const RepositorioEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton } = props;
  const [unidadMedida, setUnidadMedida] = useState([]);

  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estados, setEstados] = useState([]);
  const classesEncabezado = useStylesEncabezado();

  const [longitudIsRequired, setLongitudIsRequired] = useState(true);
  const [customLongitud, setCustomLongitud] = useState(0);

  const passwordComparison = () => {
    return props.dataRowEditNew.Clave;
  };

  async function cargarCombos() {
    let unidadesMedida = listarUnidadMedida();
    console.log(unidadesMedida);
    let estadoSimple = listarEstadoSimple();
    let estado = listarEstado();
    setUnidadMedida(unidadesMedida);
    setEstadoSimple(estadoSimple);
    setEstados(estado);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    let pass = false;
    if (!longitudIsRequired && result.brokenRules.length == 1) {
      props.dataRowEditNew.Longitud = "0";
      pass = true;
    }
    if (result.isValid || pass) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        //debugger;
        props.agregarTipoDocumento(props.dataRowEditNew);
      } else {
        props.actualizarTipoDocumento(props.dataRowEditNew);
      }
    }
  }

  const getLongitud = async (value) => {
    let lrequired = value !== 'N';
    setLongitudIsRequired(lrequired);
  }

  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }

  useEffect(() => {
    cargarCombos();
  }, []);

  const validationLength = async (data) => {
    let isRequired = longitudIsRequired;
    let lvalue = data.value;

    if (!isRequired && lvalue === '') {
      //debugger;
      return true;
    }


    let x = Number.isInteger(lvalue);
    //debugger;
    return x;
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
                      {intl.formatMessage({ id: "COMMON.DETAIL" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

              <Item dataField="IdRepositorio"
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
              <Item> </Item>

              <Item dataField="Repositorio"
                label={{ text: intl.formatMessage({ id: "SYSTEM.REPOSITORY.DISCO" }) }}
                isRequired={modoEdicion ? isRequired('Repositorio', settingDataField) : false}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('Repositorio', settingDataField) : false),
                  maxLength: 8000,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                }}
              />
              <Item dataField="FolderSharepoint"
                label={{ text: intl.formatMessage({ id: "SYSTEM.REPOSITORY.SHAREPOINT" }) }}
                isRequired={modoEdicion ? isRequired('FolderSharepoint', settingDataField) : false}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('FolderSharepoint', settingDataField) : false),
                  maxLength: 8000,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                }}
              />

              <Item
                dataField="UnidadMedida"
                label={{ text: intl.formatMessage({ id: "SYSTEM.REPOSITORY.UNIT" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion ? isRequired('UnidadMedida', settingDataField) : false}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('UnidadMedida', settingDataField) : false),
                  items: unidadMedida,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                }}
              />
              <Item dataField="TamanoMax"
                label={{ text: intl.formatMessage({ id: "SYSTEM.REPOSITORY.MAXIMUN.SIZE" }) }}
                isRequired={modoEdicion}

                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('TamanoMax', settingDataField) : false),
                  maxLength: 4,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                }}
              >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.SOLO_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
              </Item>

              <Item dataField="Usuario"
                label={{ text: intl.formatMessage({ id: "SYSTEM.REPOSITORY.USER" }) }}
                isRequired={modoEdicion ? isRequired('Usuario', settingDataField) : false}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('Usuario', settingDataField) : false),
                  maxLength: 50,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                }}
              >
                {(isRequiredRule("Usuario")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
                <PatternRule pattern={PatterRuler.LETRAS_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>
              <Item> </Item>
              <Item dataField="Clave"
                label={{ text: intl.formatMessage({ id: "SYSTEM.REPOSITORY.PASSWORD" }) }}
                isRequired={modoEdicion ? isRequired('Clave', settingDataField) : false}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('Clave', settingDataField) : false),
                  maxLength: 50,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  mode: "password",
                  showClearButton: true,
                }}
              >
              </Item>
              <Item
                dataField="confirmarClave"
                label={{ text: intl.formatMessage({ id: "SYSTEM.REPOSITORY.CONFIRMPASSWORD" }) }}
                editorOptions={{
                  maxLength: 50,
                  readOnly: !modoEdicion,
                  mode: "password",
                  showClearButton: true,
                }}
              >
                <CompareRule
                  message={intl.formatMessage({ id: "SYSTEM.REPOSITORY.CONFIRMPASSWORDMATCHPASSWORD" })}
                  comparisonTarget={passwordComparison}
                />
              </Item>
              <Item dataField="Descripcion" colSpan={2}
                label={{ text: intl.formatMessage({ id: "COMMON.DESCRIPTION" }) }}
                isRequired={modoEdicion ? isRequired('Descripcion', settingDataField) : false}
                editorType="dxTextArea"
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('Descripcion', settingDataField) : false),
                  maxLength: 8000,
                  inputAttr: { 'style': 'text-transform: uppercase' },
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

export default injectIntl(RepositorioEditPage);
