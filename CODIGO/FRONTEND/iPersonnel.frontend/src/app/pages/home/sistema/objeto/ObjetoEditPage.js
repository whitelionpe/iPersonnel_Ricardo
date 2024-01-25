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
import { listarEstadoSimple, PatterRuler,listarTipoObjeto } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";


const ObjetoEditPage = props => {
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estadoObjeto, setEstadoObjeto] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const { intl, modoEdicion, settingDataField, accessButton } = props;

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);

    let estadoObjeto = listarTipoObjeto();
    setEstadoObjeto(estadoObjeto);
  }


  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarObjeto(props.dataRowEditNew);
      } else {
        props.actualizarObjeto(props.dataRowEditNew);
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

              <Item dataField="Identificador"
                label={{ text: intl.formatMessage({ id: "SYSTEM.OBJECT.IDENTIFIER" }) }}
                isRequired={true}
                editorOptions={{
                  maxLength: 50,
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              >
              </Item>

              <Item dataField="Objeto"
                label={{ text: intl.formatMessage({ id: "COMMON.DESCRIPTION" }) }}
                isRequired={modoEdicion ? isRequired('Objeto', settingDataField) : false}
                colSpan={2}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('Objeto', settingDataField) : false),
                  maxLength: 50,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                }}
              >
                {/* {(isRequiredRule("Objeto")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />} */}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>

              <Item
                dataField="TipoObjeto"
                label={{ text: intl.formatMessage({ id: "SYSTEM.OBJECT.OBJECTTYPE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion ? isRequired('TipoObjeto', settingDataField) : false}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('TipoObjeto', settingDataField) : false),
                  items: estadoObjeto,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
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

export default injectIntl(ObjetoEditPage);
