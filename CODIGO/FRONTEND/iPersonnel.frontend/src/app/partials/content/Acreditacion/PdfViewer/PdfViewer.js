import React, { useState } from 'react';
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { Popup } from "devextreme-react/popup";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";

import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";

import { Document, Page, pdfjs } from 'react-pdf';
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import './PdfViewer.css';

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;



const PdfViewer = (props) => {

    const { intl, setLoading, fileType, fileBase64, fileName, Titulo, Index, eventoDescarga } = props;
    const urlView = "https://docs.google.com/gview?";


    const paintTitle = () => {



        return (
            <div className="title-estado-general">
                <div className="title-estado-general-bar title-estado-general-bar1">
                    <b>{Titulo}</b>
                </div>

                <div className={"div-right"}>

                    <Button
                        icon="download"
                        type="default"
                        hint={fileName}
                        id={`gbi_${Index}`}
                        onClick={async (e) => {
                            e.event.preventDefault();
                            eventoDescarga(Index, fileBase64, fileName);
                        }}
                        useSubmitBehavior={true}
                        style={{ margin: "auto", display: "table" }}

                    />

                    &nbsp;
                    &nbsp;

                    <Button
                        icon="fa fa-times-circle"
                        type="default"
                        hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                        onClick={() =>
                            props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)
                        }
                        className={"div-right"}
                    />
                </div>
            </div>
        );
    }


    const [numPages, setNumPages] = useState(null);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    return (
        <>
            <Popup
                visible={props.showPopup.isVisiblePopUp}
                dragEnabled={false}
                closeOnOutsideClick={true}
                height={"700px"}
                width={"80%"}
                titleRender={paintTitle}
                onHiding={() =>
                    props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)
                }

            >
                <div className="pv-div-content">

                    <div>
                        <Document
                            file={`${fileType}${fileBase64}`}
                            onLoadSuccess={onDocumentLoadSuccess}
                            width={700}
                        >
                            {Array.from(new Array(numPages), (el, index) => (
                                <Page key={`page_${index + 1}`} pageNumber={index + 1} />
                            ))}
                        </Document>


                    </div>
                </div>

            </Popup>
        </>
    );
};



PdfViewer.propTypes = {
    showButton: PropTypes.bool,
    selectionMode: PropTypes.string,
    uniqueId: PropTypes.string,
    IdCompaniaMandante: PropTypes.string
};
PdfViewer.defaultProps = {
    showButton: false,
    selectionMode: "row",
    uniqueId: "PdfViewerPopup",
    IdCompaniaMandante: ""
};

export default injectIntl(WithLoandingPanel(PdfViewer));
