import React, { useState } from "react";
import { DataGrid, Column, Button as ColumnButton, Summary, TotalItem } from "devextreme-react/data-grid";

import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";

import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { isNotEmpty } from "../../../../../../_metronic";

import FileViewer from "../../../../../partials/content/FileViewer";
import { downloadFile } from "../../../../../api/helpers/fileBase64.api";
import { handleErrorMessages } from "../../../../../store/ducks/notify-messages";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";

const ContratoAdendaListPage = props => {

    const { intl, setLoading, idModulo, idMenu, idAplicacion,accessButton } = props;

    const [fileBase64, setFileBase64] = useState();
    const [fileName, setFileName] = useState();
    const [isVisiblePopUpFile, setisVisiblePopUpFile] = useState(false);


    const editarRegistro = evt => {
        props.editarRegistro(evt.row.data);
    };

    const eliminarRegistro = evt => {
        props.eliminarRegistro(evt.row.data);
    };


    function onCellPrepared(e) {
        if (e.rowType === 'data') {
            if (e.data.Activo === 'N') {
                e.cellElement.style.color = 'red';
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
                    onClick={(e) => descarArchivo(data)}
                />
            </div>
        )
    }

    const descarArchivo = async (evt) => {
        const { NombreArchivo, IdItemSharepoint} = evt.data;

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
                    //setisVisiblePopUpFile(true);
                    document.getElementById("fileOpenWindow").click()
                })
                .catch((err) => {
                    handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
                }).finally(() => setLoading(false));
        } else {
            if (isNotEmpty(fileBase64)) {
                //setisVisiblePopUpFile(true);
                document.getElementById("fileOpenWindow").click()
            }
        }
    }

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
                                            icon="plus"
                                            type="default"
                                            hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                            onClick={props.nuevoRegistro}
                                            disabled={!accessButton.nuevo}
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


            <PortletBody>
                <DataGrid
                    dataSource={props.Adendas}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onCellPrepared={onCellPrepared}
                >
                    <Column dataField="RowIndex" caption="#" width={25} alignment={"center"} />
                    <Column dataField="IdAdenda" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.ADDENDUM" })} width={"25%"} alignment={"left"} />
                    <Column dataField="Asunto" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBJECT" })} width={"40%"} />
                    <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.STARTDATE" })} width={"12%"} dataType="date" format="dd/MM/yyyy" />
                    <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.ENDDATE" })} width={"12%"} dataType="date" format="dd/MM/yyyy" />
                    <Column dataField="NombreArchivo" caption={intl.formatMessage({ id: "COMMON.FILE" })} cellRender={cellRenderFile} width={"10%"} alignment="center" />
                    <Column type="buttons" width={70} visible={props.showButtons} >
                        <ColumnButton icon="edit" hint={intl.formatMessage({ id: "ACTION.EDIT", })} 
                        onClick={editarRegistro} 
                        visible={accessButton.editar}
                        />
                        <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} 
                        onClick={eliminarRegistro} 
                        visible={accessButton.eliminar}
                        />
                    </Column>

                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="IdAdenda"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>

                </DataGrid>
            </PortletBody>

            <FileViewer
                showPopup={{ isVisiblePopUp: isVisiblePopUpFile, setisVisiblePopUp: setisVisiblePopUpFile }}
                cancelar={() => setisVisiblePopUpFile(false)}
                fileBase64={fileBase64}
                fileName={fileName}
            />
        </>
    );
};


export default injectIntl(WithLoandingPanel(ContratoAdendaListPage));
