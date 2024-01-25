import React, { useEffect, useState } from "react";
import Form, {
    Item,
    GroupItem,
    SimpleItem,
    RequiredRule,
    StringLengthRule,
    PatternRule
} from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { AppBar } from "@material-ui/core";
import { Toolbar } from "@material-ui/core";
import { Typography } from "@material-ui/core";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { injectIntl } from "react-intl";
import PropTypes from 'prop-types'
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";

import FileUploader from "../../../../../partials/content/FileUploader";
import FileViewer from "../../../../../partials/content/FileViewer";
import { downloadFile } from "../../../../../api/helpers/fileBase64.api";
import { isNotEmpty } from "../../../../../../_metronic";
import { handleInfoMessages, handleErrorMessages } from "../../../../../store/ducks/notify-messages";

import { listarEstadoSimple, PatterRuler } from "../../../../../../_metronic";
import { isRequired } from "../../../../../../_metronic/utils/securityUtils";
import FieldsetAcreditacion from '../../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';

const ContratoAdendaEditPage = props => {

    const { intl, modoEdicion, settingDataField, accessButton, setLoading, idModulo, idMenu, idAplicacion } = props;

    const [fileBase64, setFileBase64] = useState();

    const [, setEstadoSimple] = useState([]);
    const classesEncabezado = useStylesEncabezado();
    const [isVisiblePopUpFile, setisVisiblePopUpFile] = useState(false);

    async function cargarCombos() {
        let estadoSimple = listarEstadoSimple();
        setEstadoSimple(estadoSimple);
    }

    function grabar(e) {
        let result = e.validationGroup.validate();
        if (result.isValid) {
            document.getElementById("btnUploadFile").click();
            if (props.dataRowEditNew.esNuevoRegistro) {
                props.agregarContratoAdenda(props.dataRowEditNew);
            } else {
                props.actualizarContratoAdenda(props.dataRowEditNew);
            }
        }
    }

    const agregarCompania = (companias) => {
        let data = companias[0];

        props.setDataRowEditNew({
            ...props.dataRowEditNew,
            IdCompaniaSubContratista: data.IdCompania,
            CompaniaSubContratista: data.Compania,
        });

    };

    /**************************************************************************************************** */
    async function descargarArchivo() {

        if (!isNotEmpty(fileBase64)) {
            let params = {
                FileName: props.dataRowEditNew.NombreArchivo,
                IdItemSharepoint: props.dataRowEditNew.IdItemSharepoint,
                FileType: "data:application/pdf;base64,",
                path: "",
                idModulo,
                idAplicacion,
                idMenu
            };
            setLoading(true);
            await downloadFile(params)
                .then(data => {
                    setFileBase64(data.fileBase64);
                    document.getElementById("fileOpenWindow").click()
                })
                .catch((err) => {
                    handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
                }).finally(() => setLoading(false));

        } else {
            document.getElementById("fileOpenWindow").click()
        }
    }

    const onFileUploader = (data) => {

        const { file, fileName, fileDate } = data;
        props.dataRowEditNew.FileBase64 = file;
        props.dataRowEditNew.NombreArchivo = fileName;
        props.dataRowEditNew.FechaArchivo = fileDate;
        console.log(props.dataRowEditNew);
    }

    /**************************************************************************************************** */

    const isRequiredRule = (id) => {
        return modoEdicion ? false : isRequired(id, settingDataField);
    }

    useEffect(() => {
        cargarCombos();
    }, []);

    return (
        <>
            {props.showButton && (
                <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={3}
                    toolbar={
                        <PortletHeader
                            title=""
                            toolbar={
                                <PortletHeaderToolbar>
                                    <PortletHeaderToolbar>
                                        <Button
                                            icon="exportpdf"
                                            type="default"
                                            hint={intl.formatMessage({ id: "ACTION.DOWNLOAD" })}
                                            onClick={descargarArchivo}
                                            visible={isNotEmpty(props.dataRowEditNew.NombreArchivo) && !props.dataRowEditNew.esNuevoRegistro ? true : false}
                                        />
                                        &nbsp;
                                        <Button
                                            icon="fa fa-save"
                                            type="default"
                                            hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                                            visible={props.modoEdicion}
                                            onClick={grabar}
                                            useSubmitBehavior={true}
                                            validationGroup="FormEdicion"
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
                                </PortletHeaderToolbar>
                            }
                        />

                    } />)}

            <PortletBody >
                <React.Fragment>
                    <FieldsetAcreditacion title={intl.formatMessage({ id: "COMMON.DETAIL" })}>
                        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
                            <GroupItem itemType="group" colCount={2} colSpan={2}>
                                <SimpleItem dataField="IdCliente" visible={false}></SimpleItem>
                                <SimpleItem dataField="IdCompaniaMandante" visible={false}></SimpleItem>
                                <SimpleItem dataField="IdCompaniaContratista" visible={false}></SimpleItem>
                                <SimpleItem dataField="IdContrato" visible={false}></SimpleItem>
                                <SimpleItem dataField="IdCompaniaSubContratista" visible={false}></SimpleItem>
                                <SimpleItem dataField="IdCompaniaSubContratistaPadre" visible={false}></SimpleItem>
                                <Item
                                    colSpan={1} dataField="IdAdenda" isRequired={true} label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.ADDENDUM" }), }}
                                    editorOptions={{
                                        maxLength: 100,
                                        inputAttr: { style: "text-transform: uppercase" },
                                        readOnly: !props.dataRowEditNew.esNuevoRegistro,
                                    }}
                                >
                                    <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                                    <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                                </Item>
                                <Item itemType="empty" />
                                <Item
                                    colSpan={2} dataField="Asunto" isRequired={true} label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBJECT" }), }}
                                    editorOptions={{
                                        maxLength: 1000,
                                        inputAttr: { style: "text-transform: uppercase" },
                                        readOnly: !props.modoEdicion,
                                    }}
                                >
                                    {(isRequiredRule("Asunto")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                                    <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
                                </Item>
                                <Item
                                    dataField="FechaInicio"
                                    label={{
                                        text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.STARTDATE" }),
                                    }}
                                    isRequired={true}
                                    editorType="dxDateBox"
                                    dataType="datetime"
                                    editorOptions={{
                                        inputAttr: { style: "text-transform: uppercase" },
                                        displayFormat: "dd/MM/yyyy",
                                        readOnly: !props.modoEdicion,
                                    }}
                                />
                                <Item
                                    dataField="FechaFin"
                                    label={{
                                        text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.ENDDATE" }),
                                    }}
                                    isRequired={true}
                                    editorType="dxDateBox"
                                    dataType="datetime"
                                    editorOptions={{
                                        inputAttr: { style: "text-transform: uppercase" },
                                        displayFormat: "dd/MM/yyyy",
                                        readOnly: !props.modoEdicion,
                                    }}
                                />
                            </GroupItem>
                        </Form>
                    </FieldsetAcreditacion>
                    <FieldsetAcreditacion title={intl.formatMessage({ id: "COMMON.FILE" })}>
                        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
                            <GroupItem itemType="group" colCount={2} colSpan={2}>
                                <Item colSpan={2}>
                                    {/* Componente-> Cargar un documento .PDF*/}
                                    <FileUploader
                                        agregarFotoBd={onFileUploader}
                                        fileNameX={props.dataRowEditNew.NombreArchivo}
                                        fileDateX={props.dataRowEditNew.FechaArchivo}
                                    />
                                </Item>
                            </GroupItem>
                        </Form>
                    </FieldsetAcreditacion>
                    {/* ---------------------------------------------------- */}
                    <FileViewer
                        showPopup={{ isVisiblePopUp: isVisiblePopUpFile, setisVisiblePopUp: setisVisiblePopUpFile }}
                        cancelar={() => setisVisiblePopUpFile(false)}
                        fileBase64={fileBase64}
                        fileName={props.dataRowEditNew.NombreArchivo}
                    />
                    {/* ---------------------------------------------------- */}
                </React.Fragment>
            </PortletBody>
        </>
    );

};

ContratoAdendaEditPage.propTypes = {
    titulo: PropTypes.string,
    modoEdicion: PropTypes.bool,
    showButtons: PropTypes.bool,
    showAppBar: PropTypes.bool,

}
ContratoAdendaEditPage.defaultProps = {
    titulo: "",
    modoEdicion: false,
    showButtons: true,
    showAppBar: true,
}

export default injectIntl(WithLoandingPanel(ContratoAdendaEditPage));
