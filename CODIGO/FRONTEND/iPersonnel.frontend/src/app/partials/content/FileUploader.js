import React, { useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';

//import ImageSearchOutlinedIcon from '@material-ui/icons/ImageSearchOutlined';
import BackupOutlinedIcon from '@material-ui/icons/BackupOutlined';

//import Avatar from '@material-ui/core/Avatar';
import withFileUpload from "./withFileUpload";
//import Tooltip from '@material-ui/core/Tooltip';
import PropTypes from 'prop-types'

//import { useStylesEncabezado, useStylesTab } from "../../store/config/Styles";
import { handleWarningMessages } from "../../store/ducks/notify-messages";
import { isNotEmpty, toAbsoluteUrl, dateFormat } from "../../../_metronic";
import { TextField } from "@material-ui/core";
//import Grid from '@material-ui/core/Grid';
import AttachFileIcon from '@material-ui/icons/AttachFile';

//import { Popup } from 'devextreme-react/popup';
import ClearIcon from "@material-ui/icons/Clear";
import { injectIntl } from "react-intl";



const FileUploader = (props) => {
    const { intl } = props;
    const [isUpdate, setIsUpdate] = useState(false);
    //const classesEncabezado = useStylesEncabezado();
    //const classes = useStylesTab()

    const subirArchivo = () => {
        //console.log("subirArchivo", { files: props.files });
        let file = [];
        if (props.files.length > 0) {
            props.files.map((xFile, index) => (
                file = xFile
            ));
            props.agregarFotoBd({ file, fileName: props.fileName, fileDate: props.fileDate });
        } else {
            //handleWarningMessages("No existe archivo!");
        }
    }

    const buscarArchivo = (e) => {
        setIsUpdate(true);
        props.addFile(e);
    }



    return (
        <>

            <div className="content">

                <div className="row">
                    <div className="col-6">

                        <TextField
                            type="text"
                            label={intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE.ATTACHFILE" })}
                            className="kt-width-full"
                            style={{ width: 'calc(100% - 80px)' }}
                            name="fileUploadNombre"
                            value={isUpdate ? props.fileName : props.fileNameX}
                            variant="outlined"
                            size="small"
                            InputProps={{
                                endAdornment:
                                    <label htmlFor={props.id} >
                                        <IconButton
                                            component="span"
                                            size="small"
                                            style={{ marginLeft: '10px' }}
                                        >
                                            <AttachFileIcon style={{ position: 'absolute', marginLeft: '3px', color: 'black' }} />
                                        </IconButton>
                                    </label >
                            }}
                        />

                    </div>
                    <div className="col-6">
                        <div style={{ marginTop: "14px" }}>
                            {/* <label htmlFor={props.id} >
                                <Button color="primary" aria-label="upload picture" component="span" >
                                    <AttachFileIcon fontSize="large" style={{ color: 'black' }} />
                                </Button>
                            </label > */}

                            <label >
                                <IconButton color="secondary" aria-label="upload picture" component="span" id="btnUploadFile" onClick={subirArchivo} style={{ display: 'none' }} >
                                    <BackupOutlinedIcon fontSize="large" />
                                </IconButton>
                            </label >
                            <input
                                accept="application/pdf"//, image/*,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                //accept=".xlsx,.xls,image/*,.doc, .docx,.ppt, .pptx,.txt,.pdf"
                                id={props.id}
                                type="file" onChange={(e => buscarArchivo(e))} style={{ display: 'none' }} />

                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        {/* <div className="form-group"> */}
                        {/*Campo informativo como Fecha y Tamaño */}
                        <TextField
                            label="Upload date" //PENDIENTE
                            id="outlined-date-small"
                            margin="dense"
                            //defaultValue="Small"
                            variant="outlined"
                            size="small"
                            value={isUpdate ? isNotEmpty(props.fileDate) ? dateFormat(props.fileDate, 'dd-MM-yyyy hh:mm') : "" : isNotEmpty(props.fileDateX) ? dateFormat(props.fileDateX, 'dd-MM-yyyy hh:mm') : ""}
                        />
                        &nbsp;
                        {isNotEmpty(props.fileSize) && (
                            <TextField
                                label="Size"
                                id="outlined-size-small"
                                margin="dense"
                                //defaultValue="Small"
                                variant="outlined"
                                size="small"
                                value={isNotEmpty(props.fileSize) ? props.fileSize : ""}
                            />
                        )
                        }
                        {/* </div> */}
                    </div>
                </div>

                <div className="row">
                    {isNotEmpty(props.message) && (
                        handleWarningMessages(props.message)
                    )}
                </div>
            </div>

        </>
    )
    //}
}

FileUploader.propTypes = {
    fileNameX: PropTypes.string,
    id: PropTypes.string,
    //esSubirImagen: PropTypes.bool,
    //imagenB64: PropTypes.string,
    fileDateX: PropTypes.string,
    MaxFileSize: PropTypes.number,
    // popupVisible: PropTypes.bool

}
FileUploader.defaultProps = {
    fileNameX: "",
    id: "fileUploader",
    //esSubirImagen: false,
    //imagenB64: "",
    fileDateX: "",
    //popupVisible: false
    MaxFileSize: 1200000
}

export default injectIntl(withFileUpload(FileUploader));