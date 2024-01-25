import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { 
  Item,
  GroupItem,
  SimpleItem,
  ButtonItem,
  RequiredRule,
  StringLengthRule,
  PatternRule,
  CustomRule
  } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { obtenerTodos as obtenerPaises } from "../../../../api/sistema/pais.api";
import { serviceEntidad } from "../../../../api/sistema/entidad.api";
import { listarEstadoSimple,listarEstado, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";

 
const TipoDocumentoEditPage = props => {
    const { intl, modoEdicion, settingDataField, accessButton } = props;
    const [paises, setPaises] = useState([]);
    const [entidades, setEntidades] = useState([]);
    const [estadoSimple, setEstadoSimple] = useState([]);
    const [estados, setEstados] = useState([]);
    const classesEncabezado = useStylesEncabezado();
    //const [longitud, setLongitud] = useState([]);
    const [longitudIsRequired, setLongitudIsRequired] = useState(true);
    //const [customLongitud, setCustomLongitud] = useState(0);

    async function cargarCombos() {
        let paises = await obtenerPaises();
        let entidades = await serviceEntidad.obtenerTodos({ ImprimirFotocheck: "" });
        let estadoSimple = listarEstadoSimple();
        let estado = listarEstado();
        setPaises(paises);
        setEntidades(entidades);
        setEstadoSimple(estadoSimple);
        setEstados(estado);
    }

    function grabar(e) {

        let result = e.validationGroup.validate();
        
        let pass = false;

        
        if(!longitudIsRequired && result.brokenRules.length == 1) {
            props.dataRowEditNew.Longitud = "0";
            pass = true;    
        }
        
        
        if (result.isValid || pass) {
            if (props.dataRowEditNew.esNuevoRegistro) {
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

        if(!isRequired && lvalue === '') {
            return true;
        }

        let x = Number.isInteger(lvalue);
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

                            <Item dataField="IdTipoDocumento"
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

                            <Item dataField="TipoDocumento"
                                label={{ text: intl.formatMessage({ id: "SYSTEM.DOCUMENTOTYPE" }) }}
                                isRequired={modoEdicion ? isRequired('TipoDocumento', settingDataField) : false}
                                editorOptions={{
                                    readOnly: !(modoEdicion ? isModified('TipoDocumento', settingDataField) : false),
                                    maxLength: 50,
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                }}
                                >
                                {(isRequiredRule("TipoDocumento")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
                                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
                              </Item>

                            <Item dataField="Alias"
                                label={{ text: intl.formatMessage({ id: "SYSTEM.DOCUMENTOTYPE.NICKNAME" }) }}
                                isRequired={modoEdicion ? isRequired('Alias', settingDataField) : false}
                                editorOptions={{
                                    readOnly: !(modoEdicion ? isModified('Alias', settingDataField) : false),
                                    maxLength: 20,
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                }}
                                >
                                {(isRequiredRule("Alias")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={20} />}
                                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
                              </Item>

                            <Item dataField="CodigoEquivalente"
                                label={{ text: intl.formatMessage({ id: "SYSTEM.DOCUMENTOTYPE.EQUIVALENT.CODE" }) }}
                                isRequired={modoEdicion ? isRequired('CodigoEquivalente', settingDataField) : false}
                                editorOptions={{
                                    readOnly: !(modoEdicion ? isModified('CodigoEquivalente', settingDataField) : false),
                                    maxLength: 20,
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                }}
                                >
                                {(isRequiredRule("CodigoEquivalente")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={20} />}
                                <PatternRule pattern={PatterRuler.SOLO_LETRAS} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
                              </Item>

                            <Item
                                dataField="LongitudExacta"
                                label={{ text: intl.formatMessage({ id: "SYSTEM.DOCUMENTOTYPE.EXACT.LENGTH" }) }}
                                editorType="dxSelectBox"
                                 isRequired={true}
                                editorOptions={{
                                    readOnly: !(modoEdicion ? isModified('LongitudExacta', settingDataField) : false),
                                    items: estados,
                                    valueExpr: "Valor",
                                    displayExpr: "Descripcion",
                                    onValueChanged: (e => getLongitud(e.value))
                                }}
                            />
                            <Item dataField="Longitud"
                                label={{ text: intl.formatMessage({ id: "SYSTEM.DOCUMENTOTYPE.LENGTH" }) }}
                                isRequired= {longitudIsRequired}
                                editorType="dxNumberBox"
                                dataType="number"
                                editorOptions={{
                                    readOnly: !(modoEdicion ? isModified('Longitud', settingDataField) : false),
                                    maxLength: 2,
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                    showSpinButtons: true,
                                    showClearButton: true,
                                    min:4,
                                    max:20
                                }}
                            >

                                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> 
                                <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />                                
                            </Item>

                              <Item
                              dataField="Mascara"
                              label={{
                              text: intl.formatMessage({id: "SYSTEM.DOCUMENTOTYPE.MASK" })}
                              }
                              editorOptions={{
                              maxLength: 50,
                              inputAttr: { style: "text-transform: uppercase" },
                              }}
                              />

                            <Item
                              dataField="CaracteresPermitidos"
                              label={{ text: intl.formatMessage({ id: "SYSTEM.DOCUMENTOTYPE.CARACTERS_ALLOWED" }) }}
                              isRequired={true}
                              editorType="dxSelectBox"
                              editorOptions={{
                                items: [{ valor: "SOLO_LETRAS", descripcion: "SOLO LETRAS" },{ valor: "SOLO_NUMEROS", descripcion: "SOLO NUMEROS" }, { valor: "LETRAS_DESCRIPCION", descripcion: "LETRAS DESCRIPCION" }],
                                valueExpr: "valor",
                                displayExpr: "descripcion",
                              }}
                            />

                            <Item
                                dataField="IdEntidad"
                                label={{ text: intl.formatMessage({ id: "SYSTEM.ENTITY" }) }}
                                editorType="dxSelectBox"
                                isRequired={true}
                                editorOptions={{
                                    readOnly: !(modoEdicion ? isModified('IdEntidad', settingDataField) : false),
                                    items: entidades,
                                    valueExpr: "IdEntidad",
                                    displayExpr: "Entidad",
                                }}
                            />
                            <Item
                                dataField="IdPais"
                                label={{ text: intl.formatMessage({ id: "SYSTEM.COUNTRY" }) }}
                                editorType="dxSelectBox"
                                isRequired={modoEdicion ? isRequired('IdPais', settingDataField) : false}
                                editorOptions={{
                                    readOnly: !(modoEdicion ? isModified('IdPais', settingDataField) : false),
                                    items: paises,
                                    valueExpr: "IdPais",
                                    displayExpr: "Pais",
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

export default injectIntl(TipoDocumentoEditPage);
