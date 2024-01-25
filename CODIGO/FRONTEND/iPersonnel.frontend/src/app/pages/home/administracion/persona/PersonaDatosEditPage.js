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

import { listarEstadoSimple,listarTipoDato, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";

const PersonaDatosEditPage = props => {
    const { intl, modoEdicion, settingDataField, accessButton} = props;

    const [estadoSimple, setEstadoSimple] = useState([]);
    const [tipoDatos, setTipoDatos] = useState([]);

    const classesEncabezado = useStylesEncabezado();

    async function cargarCombos() {

        let estadoSimple = listarEstadoSimple();
        let tipoDatos = listarTipoDato();
        setTipoDatos(tipoDatos);
        setEstadoSimple(estadoSimple);
    }

    function grabar(e) {

        let result = e.validationGroup.validate();
        if (result.isValid) {
            if (props.dataRowEditNew.esNuevoRegistro) {
                props.agregarDatos(props.dataRowEditNew);
            } else {
                props.actualizarDatos(props.dataRowEditNew);
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
                            <Item dataField="IdCliente" visible={false} />
                            <Item dataField="IdPersona" visible={false} />
                            <Item dataField="IdSecuencial" visible={false} />
                            <Item
                                dataField="TipoDato"
                                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.DATATYPE" }) }}
                                editorType="dxSelectBox"
                                isRequired={modoEdicion}
                                editorOptions={{
                                    items: tipoDatos,
                                    valueExpr: "Valor",
                                    displayExpr: "Descripcion",
                                    searchEnabled: true,
                                    readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                                }}
                            >
                            </Item>

                            <Item dataField="Dato"
                                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.DATA" }) }}
                                isRequired={modoEdicion ? isRequired('Dato', settingDataField) : false}
                                editorOptions={{
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                    maxLength: 50,
                                    readOnly: !(modoEdicion ? isModified('Dato', settingDataField) : false)
                                }}
                                >
                                {(isRequiredRule("Dato")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
                                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
                              </Item>

                            <Item dataField="Valor"
                                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.VALUE" }) }}
                                isRequired={modoEdicion ? isRequired('Valor', settingDataField) : false}
                                editorOptions={{
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                    maxLength: 50,
                                    readOnly: !(modoEdicion ? isModified('Valor', settingDataField) : false)
                                }}
                                >
                                {(isRequiredRule("Valor")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
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
                                    readOnly: props.dataRowEditNew.esNuevoRegistro ? true : false
                                }}
                            />
                        </GroupItem>
                    </Form>
                </React.Fragment>
            </PortletBody>
        </>
    );

};

export default injectIntl(PersonaDatosEditPage);
