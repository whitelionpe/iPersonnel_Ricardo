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

import { listarEstadoSimple, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";

 

const ParametroEditPage = props => {

    const { intl,  modoEdicion, settingDataField, accessButton } = props;
    const [estadoSimple, setEstadoSimple] = useState([]);
    const classesEncabezado = useStylesEncabezado();

    async function cargarCombos() {
        let estadoSimple = listarEstadoSimple();

        setEstadoSimple(estadoSimple);
    }

    function grabar(e) {
        let result = e.validationGroup.validate();
        if (result.isValid) {
            if (props.dataRowEditNew.esNuevoRegistro) {
                props.agregarParametro(props.dataRowEditNew);
            } else {
                props.actualizarParametro(props.dataRowEditNew);
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

                            <Item dataField="IdParametro"
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

                            <Item colSpan={1} />
                            <Item dataField="Parametro"
                                label={{ text: intl.formatMessage({ id: "SYSTEM.PARAMETER" }) }}
                                isRequired={modoEdicion ? isRequired('Parametro', settingDataField) : false}
                                colSpan={2}
                                editorType="dxTextArea"
                                editorOptions={{
                                    readOnly: !(modoEdicion ? isModified('Parametro', settingDataField) : false),
                                    maxLength: 500,
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                    height: 90
                                }}
                              >
                              {(isRequiredRule("Parametro")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={500} />}
                              <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
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
                            <Item dataField="IdModulo" visible={false} />
                            <Item dataField="IdAplicacion" visible={false} />
                            <Item dataField="IdCliente" visible={false} />
                        </GroupItem>
                    </Form>
       
                </React.Fragment>
            </PortletBody>
        </>
    );

};

export default injectIntl(ParametroEditPage);
