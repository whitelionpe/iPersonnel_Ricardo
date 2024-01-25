import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem, RequiredRule, PatternRule, StringLengthRule, PatterRuler } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useSelector } from "react-redux";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { listarEstado } from "../../../../../../_metronic";
import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import FieldsetAcreditacion from '../../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';

const AuditoriaEditPage = props => {

    const { intl, modoEdicion, settingDataField, accessButton } = props;
    const perfil = useSelector(state => state.perfil.perfilActual);
    const [estado, setEstado] = useState([]);
    const classesEncabezado = useStylesEncabezado();




    /* function grabar(e) {
        let result = e.validationGroup.validate();
        if (result.isValid) {
            if (props.dataRowEditNew.esNuevoRegistro) {
                props.agregarProcesoAuditoria(props.dataRowEditNew);
            } else {
                props.actualizarProcesoAuditoria(props.dataRowEditNew);
            }
        }
    } */


    const isRequiredRule = (id) => {
        return modoEdicion ? false : isRequired(id, settingDataField);
    }

    useEffect(() => {

    }, []);



    return (
        <>
            <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
                toolbar={
                    <PortletHeader
                        title={""}
                        toolbar={
                            <PortletHeaderToolbar>
                                {/* <Button
                                    icon="fa fa-save"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                                    onClick={grabar}
                                    useSubmitBehavior={true}
                                    validationGroup="FormEdicion"
                                />
                                &nbsp; */}
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
                                <Item dataField="IdCliente" visible={false} />
                                <Item dataField="IdProceso" visible={false} />
                                <Item dataField="IdProgramacion" visible={false} />

                                <Item dataField="Proceso"
                                    label={{ text: intl.formatMessage({ id: "SYSTEM.PROCESS" }) }}
                                    isRequired={modoEdicion}
                                    editorOptions={{
                                        readOnly: true,
                                        inputAttr: { 'style': 'text-transform: uppercase' }
                                    }}
                                />

                                <Item dataField="Programacion"
                                    label={{ text: intl.formatMessage({ id: "SYSTEM.PROCESS.PROGRAMMING" }) }}
                                    isRequired={modoEdicion}
                                    editorOptions={{
                                        readOnly: true,
                                        inputAttr: { 'style': 'text-transform: uppercase' }
                                    }}
                                />

                                <Item dataField="Evento"
                                    label={{ text: intl.formatMessage({ id: "SYSTEM.PROCESS.EVENT" }) }}
                                    isRequired={modoEdicion}
                                    editorOptions={{
                                        readOnly: true,
                                        inputAttr: { 'style': 'text-transform: uppercase' }
                                    }}
                                />

                                <Item
                                    dataField="FechaEjecucion"
                                    label={{ text: intl.formatMessage({ id: "SYSTEM.PROCESS.DATE" }) }}
                                    isRequired={true}
                                    editorType="dxDateBox"
                                    dataType="date"
                                    editorOptions={{
                                        displayFormat: "dd/MM/yyyy",
                                        readOnly: true
                                        //readOnly: (modoEdicion && !esNuevoRegistro) ? true : false
                                    }}
                                />

                                <Item dataField="MensajeEvento"
                                    label={{ text: intl.formatMessage({ id: "COMMON.DESCRIPTION" }) }}
                                    //isRequired={modoEdicion ? isRequired('MensajeEvento', settingDataField) : false}
                                    isRequired={modoEdicion}
                                    editorType="dxTextArea"
                                    colSpan={2}
                                    editorOptions={{
                                        //readOnly: !(modoEdicion ? isModified('MensajeEvento', settingDataField) : false),
                                        maxLength: 400,
                                        height: 60,
                                        inputAttr: { 'style': 'text-transform: uppercase' },
                                        readOnly: true
                                    }}
                                />

                            </GroupItem>
                        </Form>
         
                </React.Fragment>
            </PortletBody>
        </>
    );
};

export default injectIntl(AuditoriaEditPage);
