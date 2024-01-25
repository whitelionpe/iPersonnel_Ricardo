import React, { useEffect } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem, RequiredRule, PatternRule } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { PatterRuler } from "../../../../../_metronic";


const MenuControllerEditPage = props => {

  const { intl } = props;

  const classesEncabezado = useStylesEncabezado();

  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarMenuController(props.dataRowEditNew);
      } else {
        props.actualizarMenuController(props.dataRowEditNew);
      }
    }
  }

  useEffect(() => {
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
                    {intl.formatMessage({ id: "SYSTEM.MENUDATA.CONTROLLER" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

                <Item
                  dataField="IdController"
                  isRequired={true}
                  label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                  colSpan={2}
                  editorOptions={{
                    maxLength: 50,
                    inputAttr: { style: "text-transform: uppercase" },
                    disabled: !props.dataRowEditNew.esNuevoRegistro ? true : false
                  }}
                >
                  <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                  <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                </Item>

              </GroupItem>
            </Form>
       
        </React.Fragment>
      </PortletBody>
    </>
  );

};

export default injectIntl(MenuControllerEditPage);
