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
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { useSelector } from "react-redux";

import { obtenerTodos as obtenerTodosRegimen } from "../../../../../api/administracion/regimen.api";
import { obtenerTodos as obtenerTodosGuardia } from "../../../../../api/administracion/regimenGuardia.api";

import { listarEstadoSimple, PatterRuler } from "../../../../../../_metronic";
import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";
 
const PersonaRegimenEditPage = props => {
    const { intl, modoEdicion, settingDataField,accessButton } = props;
    const perfil = useSelector(state => state.perfil.perfilActual);

    const [regimen, setRegimen] = useState([]);
    const [guardia, setGuardia] = useState([]);
    const [estadoSimple, setEstadoSimple] = useState([]);
    const classesEncabezado = useStylesEncabezado();

    async function cargarCombos() {

        if (perfil.IdCliente) {
            let regimenp = await obtenerTodosRegimen({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision, IdRegimen: '%' });
            let estadoSimple = listarEstadoSimple();

            setRegimen(regimenp);
            setEstadoSimple(estadoSimple);
        }
    }

    function grabar(e) {

        let result = e.validationGroup.validate();
        if (result.isValid) {
            if (props.dataRowEditNew.esNuevoRegistro) {
                props.agregarRegimen(props.dataRowEditNew);
            } else {
                props.actualizarRegimen(props.dataRowEditNew);
            }
        }
    }

    const getGuardia = async (value) => {
        if (value) {
            let regimenGuardia = await obtenerTodosGuardia({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision, IdRegimen: value })
            setGuardia(regimenGuardia);        
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
                            <Item dataField="IdPersona" visible={false} />
                            <Item dataField="IdSecuencial" visible={false} />
                            <Item
                                dataField="IdRegimen"
                                label={{ text: intl.formatMessage({id:"ADMINISTRATION.PERSON.REGIME.REGIME"}) }}
                                editorType="dxSelectBox"
                                isRequired={modoEdicion}
                                editorOptions={{
                                    items: regimen,
                                    valueExpr: "IdRegimen",
                                    displayExpr: "Regimen",
                                    searchEnabled: true,
                                    readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false,
                                    onValueChanged: (e => getGuardia(e.value))
                                }}
                            >
                            </Item>
                            <Item
                                dataField="IdGuardia"
                                label={{ text: intl.formatMessage({id:"ADMINISTRATION.PERSON.REGIME.GUARD"}) }}
                                editorType="dxSelectBox"
                                isRequired={modoEdicion ? isRequired('IdGuardia', settingDataField) : false}
                                editorOptions={{
                                    items: guardia,
                                    valueExpr: "IdGuardia",
                                    displayExpr: "Guardia",
                                    searchEnabled: true,
                                    readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false,
                                }}
                            >
                            </Item>

                            <Item dataField="FechaInicio"
                                label={{ text: intl.formatMessage({id:"ADMINISTRATION.PERSON.STARTDATE"}) }}
                                isRequired={modoEdicion ? isRequired('FechaInicio', settingDataField) : false}
                                editorType="dxDateBox"
                                dataType="date"
                                editorOptions={{
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                    displayFormat: "dd/MM/yyyy",
                                }}
                            />

                            <Item dataField="FechaFin"
                                label={{ text: intl.formatMessage({id:"ADMINISTRATION.PERSON.ENDDATE"}) }}
                                isRequired={modoEdicion ? isRequired('FechaFin', settingDataField) : false}
                                editorType="dxDateBox"
                                dataType="date"
                                editorOptions={{
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                    displayFormat: "dd/MM/yyyy",
                                }}
                            />
                            <Item
                                dataField="Activo"
                                label={{ text: intl.formatMessage({id:"COMMON.STATE"}) }}
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

export default injectIntl(PersonaRegimenEditPage) ;
