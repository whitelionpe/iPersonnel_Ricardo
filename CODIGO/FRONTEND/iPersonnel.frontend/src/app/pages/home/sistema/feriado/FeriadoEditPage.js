import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem, RequiredRule, PatternRule, StringLengthRule } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { getMonths, getDays, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import HeaderInformation from "../../../../partials/components/HeaderInformation";


const FeriadoEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton } = props;
  const [meses, setMeses] = useState([]);
  const [dias, setDias] = useState([]);

  const classesEncabezado = useStylesEncabezado();

  async function cargarCombos() {

    let meses = getMonths();
    setMeses(meses);

    let dias = getDays();
    setDias(dias);

  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarPaisFeriado(props.dataRowEditNew);
      } else {
        props.actualizarPaisFeriado(props.dataRowEditNew);
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

      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title={""}
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
                dataField="Mes"
                label={{ text: intl.formatMessage({ id: "SYSTEM.COUNTRY.HOLIDAY.MONTH" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  items: meses,
                  valueExpr: "Id",
                  displayExpr: "Mes",
                }}
              />
              <Item
                dataField="Dia"
                label={{ text: intl.formatMessage({ id: "SYSTEM.COUNTRY.HOLIDAY.DAY" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  items: dias,
                  valueExpr: "Id",
                  displayExpr: "Descripcion",
                }}
              />
              <Item dataField="Feriado"
                label={{ text: intl.formatMessage({ id: "SYSTEM.COUNTRY.HOLIDAY" }) }}
                //isRequired={modoEdicion}
                // isRequired={modoEdicion ? isRequired('Feriado', settingDataField) : false}
                editorOptions={{
                  // readOnly: !(modoEdicion ? isModified('Feriado', settingDataField) : false),
                  maxLength: 50,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                }}
              >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <StringLengthRule max={50} />
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>

            </GroupItem>
          </Form>
        
        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(FeriadoEditPage);
