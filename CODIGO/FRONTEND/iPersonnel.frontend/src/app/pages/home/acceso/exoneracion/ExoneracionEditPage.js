import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import Form, {
  Item,
  GroupItem,
  SimpleItem,
  RequiredRule,
  StringLengthRule,
  PatternRule
} from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import AdministracionDivisionBuscar from "../../../../partials/components/AdministracionDivisionBuscar";

import { listarEstadoSimple, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";


const ExoneracionEditPage = props => {
  const { intl, setLoading, accessButton, modoEdicion, settingDataField } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [isVisiblePopUpDivision, setisVisiblePopUpDivision] = useState(false);
  const [divisiones, setDivisiones] = useState([]);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
  }

  const agregarDivision = (divsion) => {
    let data = divsion[0];
    props.setDataRowEditNew({
      ...props.dataRowEditNew,
      IdDivision: data.IdDivision,
      Division: data.Division,
    });
  };


  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarMotivo(props.dataRowEditNew);
      } else {
        props.actualizarMotivo(props.dataRowEditNew);
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
    <><PortletHeader
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
              <SimpleItem dataField="IdDivision" visible={false}></SimpleItem>
              <SimpleItem dataField="Division" visible={false}></SimpleItem>

              <Item dataField="IdExoneracion"
                isRequired={true}
                label={{ text: intl.formatMessage({ id: "ACCESS.EXONERATION.EXONERATION.CODE" }) }}
                // isRequired={modoEdicion}
                editorOptions={{
                  maxLength: 10,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item dataField="Motivo"
                label={{ text: intl.formatMessage({ id: "ACCESS.EXONERATION.REASON" }) }}
                isRequired={modoEdicion ? isRequired('Motivo', settingDataField) : false}
                editorOptions={{
                  maxLength: 100,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !(modoEdicion ? isModified('Motivo', settingDataField) : false)

                }}
              >
                {(isRequiredRule("Motivo")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>
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

              <Item dataField="IdCliente" visible={false} />

            </GroupItem>
          </Form>
          {/* ---------------------------------------------------- */}
          <AdministracionDivisionBuscar
            dataSource={divisiones}
            showPopup={{ isVisiblePopUp: isVisiblePopUpDivision, setisVisiblePopUp: setisVisiblePopUpDivision }}
            cancelar={() => setisVisiblePopUpDivision(false)}
            selectData={agregarDivision}
            selectionMode={"row"}
          />
          {/* ---------------------------------------------------- */}


        </React.Fragment>
      </PortletBody >
    </>
  );

};

export default injectIntl(WithLoandingPanel(ExoneracionEditPage));
