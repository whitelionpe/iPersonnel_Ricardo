import React from "react";
import { injectIntl } from "react-intl";//Multi-idioma
import Form, { Item, GroupItem } from "devextreme-react/form";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../store/config/Styles";
import { PortletBody } from "../../../partials/content/Portlet";
import { dateFormat } from "../../../../_metronic";

const AuditoriaPage = props => {
    const classesEncabezado = useStylesEncabezado();
    const { intl } = props;

    return (
        <>
            <React.Fragment>
                <PortletBody >
                    <Form formData={props.dataRowEditNew}  >

                        <GroupItem itemType="group" colCount={2} colSpan={2} >
                            <Item colSpan={2}>
                                <AppBar position="static" className={classesEncabezado.secundario}>
                                    <Toolbar  className={classesEncabezado.toolbar}>
                                        <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                            {intl.formatMessage({ id: "AUDIT.DATA" })}
                                        </Typography>
                                    </Toolbar>
                                </AppBar>
                            </Item>
                            <Item dataField="IdUsuarioCreacion"
                                label={{ text: intl.formatMessage({ id: "AUDIT.USERCREATION" }) }}
                                editorOptions={{
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                    readOnly: true
                                }}
                            />
                            <Item dataField="FechaCreacion"
                                label={{ text: intl.formatMessage({ id: "AUDIT.CREATIONDATE" }) }}
                                editorOptions={{
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                    readOnly: true,
                                    value: (props.dataRowEditNew ? dateFormat(props.dataRowEditNew.FechaCreacion, "dd-MM-yyyy hh:mm") : "")
                                }}
                            />
                            <Item dataField="IdUsuarioModificacion"
                                label={{ text: intl.formatMessage({ id: "AUDIT.USERMODIFICATION" }) }}
                                editorOptions={{
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                    readOnly: true
                                }}
                            />
                            <Item dataField="FechaModificacion"
                                label={{ text: intl.formatMessage({ id: "AUDIT.MODIFICATIONDATE" }) }}
                                editorOptions={{
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                    readOnly: true,
                                    value: (props.dataRowEditNew ? dateFormat(props.dataRowEditNew.FechaModificacion, "dd-MM-yyyy hh:mm") : "")
                                }}
                            />

                        </GroupItem>
                    </Form>
                </PortletBody>
            </React.Fragment>
        </>
    );
};

export default injectIntl(AuditoriaPage);
