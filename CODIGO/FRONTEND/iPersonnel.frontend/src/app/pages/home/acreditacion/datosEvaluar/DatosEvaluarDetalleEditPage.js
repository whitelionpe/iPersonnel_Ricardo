import React, { useEffect, useState } from "react";
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
import { injectIntl } from "react-intl";
import HeaderInformation from "../../../../partials/components/HeaderInformation";

import { listarEstadoSimple, listarTipoDatoEvaluar, listarEstado, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";

const DatosEvaluarDetalleEditPage = props => {
  const { intl, modoEdicion, settingDataField } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [tipoDatosEvaluar, setTipoDatosEvaluar] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  // const [currentEditorType, setCurrentEditorType] = useState("dxTextBox");
  // const [isVisibleValorDefecto, setIsVisibleValorDefecto] = useState(true);
  const [estado, setEstado] = useState([]);
  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }

  useEffect(() => {
    cargarCombos();
  }, []);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    let datoEvaluar = listarTipoDatoEvaluar();
    let estado = listarEstado();
    setEstadoSimple(estadoSimple);
    setTipoDatosEvaluar(datoEvaluar);
    setEstado(estado);
  }


  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregar(props.dataRowEditNew);
      } else {
        //console.log("Actualizar Detalle", props.dataRowEditNew);
        props.actualizar(props.dataRowEditNew);
      }
    }
  }



  return (
    <>
      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={2}
        toolbar={
          <PortletHeader
            title=""
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
              <SimpleItem dataField="IdDatoEvaluar" visible={false}></SimpleItem>

              <Item dataField="IdDato"
                isRequired={true}
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                editorOptions={{
                  maxLength: 20,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !props.dataRowEditNew.esNuevoRegistro,
                }}
              >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>


              <Item dataField="Dato"
                isRequired={true}
                label={{ text: intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE.DATA" }) }}
                editorOptions={{
                  maxLength: 200,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !props.modoEdicion,
                }}
              >
                {(isRequiredRule("Dato")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={200} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item
                dataField="AdjuntarArchivo"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.INDISCIPLINE.ATTACHFILE" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  readOnly: !props.modoEdicion,
                  items: estado,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion"
                  //readOnly: props.dataRowEditNew.esNuevoRegistro ? true : !props.modoEdicion,
                }}
              />

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  readOnly: !props.modoEdicion,
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: props.dataRowEditNew.esNuevoRegistro ? true : !props.modoEdicion,
                }}
              />

            </GroupItem>



          </Form>

        </React.Fragment>
      </PortletBody>
    </>
  );

};

export default injectIntl(DatosEvaluarDetalleEditPage);
