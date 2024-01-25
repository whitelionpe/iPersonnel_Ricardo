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
  EmptyItem
  } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { listarEstadoSimple, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import FieldsetAcreditacion from "../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion";

const IntegracionInfotipoEditPage = props => {
    const { intl, accessButton, modoEdicion, settingDataField } = props;

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
                props.agregarInfotipo(props.dataRowEditNew);
            } else {
                props.actualizarInfotipo(props.dataRowEditNew);
            }
        }
    }

    const isRequiredRule = (id) => {
      return modoEdicion ? false : isRequired(id, settingDataField);
    }

    useEffect(() => {
        cargarCombos();
    }, []);

    return (<>

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

        <PortletBody>
            <React.Fragment>
                <FieldsetAcreditacion title="Integración">
                    <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
                        <GroupItem itemType="group" colCount={2} colSpan={2}>
                            
                            <Item dataField="Tipo"
                                isRequired={modoEdicion}
                                editorType="dxSelectBox"
                                label={{ text: "Tipo" }}
                                editorOptions={{
                                    items: [{ Valor: "INFOTIPO2001", Descripcion: "INFOTIPO 2001" }, { Valor: "INFOTIPO2010", Descripcion: "INFOTIPO 2010" }],
                                    valueExpr: "Valor",
                                    displayExpr: "Descripcion",
                                    readOnly: !modoEdicion
                                }}
                                >
                                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                                <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                            </Item>

                            <EmptyItem/>

                            <Item dataField="IdInfotipo"
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

                            <Item dataField="Descripcion"
                                isRequired={modoEdicion}
                                label={{ text: "Descripción" }}
                                editorOptions={{
                                    maxLength: 200,
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                    readOnly: !modoEdicion
                                }}
                                >
                                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                            </Item>
                            
                            <Item dataField="Alias"
                                isRequired={modoEdicion}
                                label={{ text: "Alias" }}
                                editorOptions={{
                                    maxLength: 200,
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                    readOnly: !modoEdicion
                                }}
                                >
                                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                                <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                            </Item>

                            <Item dataField="Unidad"
                                isRequired={modoEdicion}
                                editorType="dxSelectBox"
                                label={{ text: "Unidad" }}
                                editorOptions={{
                                    items: [{ Valor: "001", Descripcion: "HORAS" }, { Valor: "010", Descripcion: "DÍAS" }],
                                    valueExpr: "Valor",
                                    displayExpr: "Descripcion",
                                    readOnly: !modoEdicion
                                }}
                                >
                                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
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
                </FieldsetAcreditacion>

                <FieldsetAcreditacion title="2Personnel">
                    <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
                        <GroupItem itemType="group" colCount={2} colSpan={2}>
                            <Item dataField="NombreTabla"
                                isRequired={modoEdicion ? isRequired("NombreTabla", settingDataField) : false}
                                label={{ text: "Nombre Tabla" }}
                                editorOptions={{
                                    maxLength: 200,
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                    readOnly: !modoEdicion
                                }}
                                >
                                {/*<RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />*/}
                                <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                            </Item>

                            <Item dataField="CodigoTabla"
                                isRequired={modoEdicion ? isRequired("CodigoTabla", settingDataField) : false}
                                label={{ text: "Código Tabla" }}
                                editorOptions={{
                                    maxLength: 20,
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                    readOnly: !modoEdicion
                                }}
                                >
                                {/*<RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />*/}
                                <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                            </Item>

                            <Item dataField="DescripcionTabla"
                                isRequired={modoEdicion ? isRequired("DescripcionTabla", settingDataField) : false}
                                label={{ text: "Descripción Tabla" }}
                                editorOptions={{
                                    maxLength: 200,
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                    readOnly: !modoEdicion
                                }}
                                >
                                {/*<RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />*/}
                                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                            </Item>
                        </GroupItem>
                    </Form>
                </FieldsetAcreditacion>
            </React.Fragment>
        </PortletBody>

    </>);

};

export default injectIntl(IntegracionInfotipoEditPage);