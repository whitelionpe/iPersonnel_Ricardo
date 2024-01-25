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

import HeaderInformation from "../../../../partials/components/HeaderInformation";

import { listarEstadoSimple, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";

const MarcaModeloEditPage = props => {
    const { intl, modoEdicion, settingDataField, accessButton } = props;
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
                props.agregarModelo(props.dataRowEditNew);
            } else {
                props.actualizarModelo(props.dataRowEditNew);
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
                } />



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

                            <Item dataField="IdModelo"
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

                            <Item dataField="Modelo"
                                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.MODELBRAND.MODEL" }) }}
                                isRequired={modoEdicion ? isRequired('Modelo', settingDataField) : false}
                                editorOptions={{
                                    readOnly: !(modoEdicion ? isModified('Modelo', settingDataField) : false),
                                    maxLength: 50,
                                    inputAttr: { 'style': 'text-transform: uppercase' },

                                }}
                            >
                            {(isRequiredRule("Modelo")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                            <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                          </Item>

                            <Item dataField="IdMarca"
                                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.BRAND.BRAND" }) }}
                                visible={false}
                                isRequired={modoEdicion ? isRequired('IdMarca', settingDataField) : false}
                                editorOptions={{
                                    maxLength: 10,
                                    visible: false,
                                    readOnly: !(modoEdicion ? isModified('IdMarca', settingDataField) : false),
                                }}
                                >
                                {(isRequiredRule("IdMarca")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={10} />}
                                <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
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
                        </GroupItem>
                    </Form>

                </React.Fragment>
            </PortletBody >
        </>
    );
};

export default injectIntl(MarcaModeloEditPage);
