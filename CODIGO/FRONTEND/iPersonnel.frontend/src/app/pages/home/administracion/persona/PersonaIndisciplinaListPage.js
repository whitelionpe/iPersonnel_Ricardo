import React, { useState } from "react";
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { injectIntl } from "react-intl";
import { isNotEmpty } from "../../../../../_metronic";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import FileViewer from "../../../../partials/content/FileViewer";
import { downloadFile } from "../../../../api/helpers/fileBase64.api";
import { handleErrorMessages } from "../../../../store/ducks/notify-messages";
import WithLoandingPanel from "../../../../partials/content/withLoandingPanel";

const PersonaIndisciplinaListPage = props => {
    const { intl, accessButton, setLoading, idModulo, idMenu, idAplicacion } = props;
    const [fileBase64, setFileBase64] = useState();
    const [fileName, setFileName] = useState();
    const [isVisiblePopUpFile, setisVisiblePopUpFile] = useState(false);

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
        evt.cancel = true;
        props.eliminarRegistro(evt.data);
    };

    const seleccionarRegistro = evt => {
        props.seleccionarRegistro(evt.data);
    }

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    }

    function onCellPrepared(e) {
        if (e.rowType === "data") {
            if (e.data.Activo === "N") {
                e.cellElement.style.color = "red";
            }
        }
    }

    const textEditing = {
        confirmDeleteMessage: '',
        editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
        deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
    }

    const descargarArchivo = async (evt) => {
        const { NombreArchivo, IdItemSharepoint } = evt.data;

        if (fileName !== NombreArchivo) {
            setFileName(NombreArchivo);
            let params = {
                FileName: NombreArchivo,
                IdItemSharepoint: IdItemSharepoint,
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
            if (isNotEmpty(fileBase64)) {
                document.getElementById("fileOpenWindow").click()
            }
        }
    }

    function cellRenderFile(data) {
        return isNotEmpty(data.value) && (
            <div className="dx-command-edit-with-icons">
                <span
                    className="dx-icon-exportpdf"
                    title={intl.formatMessage({ id: "ACTION.DOWNLOAD" })}
                    aria-label={intl.formatMessage({ id: "ACTION.DOWNLOAD" })}
                    onClick={(e) => descargarArchivo(data)}
                />
            </div>
        )
    }

    return (
        <>
            <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
                toolbar={
                    <PortletHeader
                        title={""}
                        toolbar={
                            <PortletHeaderToolbar>
                                <Button icon="plus"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                    onClick={props.nuevoRegistro}
                                    disabled={!accessButton.nuevo} />
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
                }
            />
            <PortletBody>
                <React.Fragment>
                    <Form>
                        <GroupItem>
                            <Item>
                              
                                <DataGrid
                                    dataSource={props.personaIndisciplinas}
                                    showBorders={true}
                                    focusedRowEnabled={true}
                                    keyExpr="RowIndex"
                                    onEditingStart={editarRegistro}
                                    onRowRemoving={eliminarRegistro}
                                    onRowClick={seleccionarRegistro}
                                    onCellPrepared={onCellPrepared}
                                    repaintChangesOnly={true}
                                >
                                    <Editing
                                        mode="row"
                                        useIcons={true}
                                        allowUpdating={accessButton.editar}
                                        allowDeleting={accessButton.eliminar}
                                        texts={textEditing}
                                    />

                                    <Column dataField="Indisciplina" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.INDISCIPLINE.INDISCIPLINE" })} width={"30%"} />
                                    <Column dataField="NivelSeveridad" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.INDISCIPLINE.SEVERITY" })} width={"10%"} />
                                    <Column dataField="Observacion" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.INDISCIPLINE.OBSERVATION" })} width={"42%"} />
                                    <Column dataField="NombreArchivo" caption={intl.formatMessage({ id: "COMMON.FILE" })} cellRender={cellRenderFile} width={"10%"} alignment="center" />
                                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} width={"10%"} calculateCellValue={obtenerCampoActivo} />
                                    <Column dataField="IdItemSharepoint" caption="IdItemSharepoint" visible={false} />
                                    <Summary>
                                        <TotalItem
                                            cssClass="classColorPaginador_"
                                            column="Indisciplina"
                                            summaryType="count"
                                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                                        />
                                    </Summary>

                                </DataGrid>
                            </Item>
                        </GroupItem>
                    </Form>


                </React.Fragment>
            </PortletBody>
            {/* POPUP-> Visualizar documento .PDF*/}
            <FileViewer
                showPopup={{ isVisiblePopUp: isVisiblePopUpFile, setisVisiblePopUp: setisVisiblePopUpFile }}
                cancelar={() => setisVisiblePopUpFile(false)}
                fileBase64={fileBase64}
                fileName={fileName}
            />
        </>
    );
};
PersonaIndisciplinaListPage.propTypes = {
    showHeaderInformation: PropTypes.bool,
};
PersonaIndisciplinaListPage.defaultProps = {
    showHeaderInformation: true,
};

export default injectIntl(WithLoandingPanel(PersonaIndisciplinaListPage));
