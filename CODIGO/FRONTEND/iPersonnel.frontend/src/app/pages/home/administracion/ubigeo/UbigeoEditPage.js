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

import { isNotEmpty, listarEstadoSimple, NivelesUbicacionPais, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import { useSelector } from "react-redux";

const UbigeoEditPage = props => {
    const { intl ,  modoEdicion, settingDataField, accessButton } = props;
    const [estadoSimple, setEstadoSimple] = useState([]);
    const classesEncabezado = useStylesEncabezado();
    const [idPaisActual, setIdPaisActual] = useState("");
  
    const [ubicacion, setUbicacion] = useState({
        Nivel1: intl.formatMessage({ id: "ADMINISTRATION.UBIGEO.DEPARTAMENT" }),
        Nivel2: intl.formatMessage({ id: "ADMINISTRATION.UBIGEO.PROVINCE" }),
        Nivel3: intl.formatMessage({ id: "ADMINISTRATION.UBIGEO.DISTRIC" })
    })

    async function cargarCombos() {
        let estadoSimple = listarEstadoSimple();
        setEstadoSimple(estadoSimple);
    }

    function grabar(e) {
        let result = e.validationGroup.validate();
        if (result.isValid) {
            if (props.dataRowEditNew.esNuevoRegistro) {
                props.agregarUbigeo(props.dataRowEditNew);
            } else {
                props.actualizarUbigeo(props.dataRowEditNew);
            }
        }
    }

    const isRequiredRule = (id) => {
      return modoEdicion ? false : isRequired(id, settingDataField);
    }

    useEffect(() => {
        cargarCombos();
    }, []);

    useEffect(() => { 
        if (isNotEmpty(idPaisActual)) {
            var ress = NivelesUbicacionPais().find(x => x.Pais == idPaisActual); 
            setUbicacion({
                Nivel1: ress.Ubicacion.Nivel1,
                Nivel2: ress.Ubicacion.Nivel2,
                Nivel3: ress.Ubicacion.Nivel3
            });
        }
    }, [idPaisActual])

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

                            <Item dataField="IdUbigeo"
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

                            <Item
                                dataField="IdPais"
                                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.UBIGEO.COUNTRY" }) }}
                                editorType="dxSelectBox"
                                isRequired={modoEdicion ? isRequired('IdPais', settingDataField) : false}
                                editorOptions={{
                                    readOnly: !(modoEdicion ? isModified('IdPais', settingDataField) : false),
                                    items: props.paisData,
                                    valueExpr: "IdPais",
                                    displayExpr: "Pais",
                                    onValueChanged: (e) => {
                                        setIdPaisActual(e.value);  
                                    },
                                }}
                            />

                            <Item dataField="Departamento"
                                label={{ text:  ubicacion.Nivel1 }}
                                isRequired={modoEdicion ? isRequired('Departamento', settingDataField) : false}
                                editorOptions={{
                                    readOnly: !(modoEdicion ? isModified('Departamento', settingDataField) : false),
                                    maxLength: 50,
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                }}
                                >
                                {(isRequiredRule("Departamento")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
                                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
                              </Item>


                            <Item dataField="Provincia"
                                label={{ text: ubicacion.Nivel2 }}
                                isRequired={modoEdicion ? isRequired('Provincia', settingDataField) : false}
                                editorOptions={{
                                    readOnly: !(modoEdicion ? isModified('Provincia', settingDataField) : false),
                                    maxLength: 50,
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                }}
                                >
                                {(isRequiredRule("Provincia")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
                                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
                              </Item>

                            <Item dataField="Distrito"
                                label={{ text: ubicacion.Nivel3 }}
                                isRequired={modoEdicion ? isRequired('Distrito', settingDataField) : false}
                                editorOptions={{
                                    readOnly: !(modoEdicion ? isModified('Distrito', settingDataField) : false),
                                    maxLength: 50,
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                }}
                                >
                                {(isRequiredRule("Distrito")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
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
                        </GroupItem>
                    </Form>

                </React.Fragment>
            </PortletBody>
        </>
    );
};

export default injectIntl(UbigeoEditPage);
