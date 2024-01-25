import React, { useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import ImageSearchOutlinedIcon from '@material-ui/icons/ImageSearchOutlined';
import BackupOutlinedIcon from '@material-ui/icons/BackupOutlined';

import Avatar from '@material-ui/core/Avatar';
import withFileUpload from "./withFileUploadImage";
import Tooltip from '@material-ui/core/Tooltip';
import PropTypes from 'prop-types'

import { useStylesEncabezado, useStylesTab } from "../../store/config/Styles";
import { handleWarningMessages } from "../../store/ducks/notify-messages";
import { isNotEmpty, toAbsoluteUrl, dateFormat } from "../../../_metronic";

import { Popup } from 'devextreme-react/popup';


const AvatarFoto = (props) => {

    const [isUpdate, setIsUpdate] = useState(false);
    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab()

    const subirFotoBd = () => {
        let file = [];
        if (props.files.length > 0) {
            props.files.map((xFile, index) => (
                file = xFile
            ));
            props.agregarFotoBd({ file });
        } else {
            handleWarningMessages("No existe archivo!");
        }
    }

    const buscarArchivo = (e) => {
        setIsUpdate(true);
        props.addFile(e);
    }
    //console.log("AvatarFoto..",props.imagenB64 )

    return (
        <>
            <div>

                <div className="row" onClick={props.onClick} >
                    {isUpdate ? (
                        <>
                            {props.files.map((file, index) => (
                                <Avatar key="avartarFile" src={isNotEmpty(file) ? file : toAbsoluteUrl("/media/users/default.jpg")} className={props.size} />
                            ))}
                        </>
                    ) : <Avatar key="avartarFileDb" src={isNotEmpty(props.imagenB64) ? props.imagenB64 : toAbsoluteUrl("/media/users/default.jpg")} className={props.size} />
                    }
                </div>

                <div className="row justify-content-center">

                    {props.esSubirImagen && (
                        <>
                            <div className="row">
                                <div className='button'>
                                    <Tooltip title="Buscar" aria-label="add">
                                        <label htmlFor={props.id} >
                                            <IconButton color="primary" aria-label="upload picture" component="span" >
                                                <ImageSearchOutlinedIcon fontSize="large" />
                                            </IconButton>
                                        </label >
                                    </Tooltip>
                                    <Tooltip title="Cargar" aria-label="add">
                                        <label >
                                            <IconButton color="secondary" aria-label="upload picture" component="span" onClick={subirFotoBd} >
                                                <BackupOutlinedIcon fontSize="large" />
                                            </IconButton>
                                        </label >
                                    </Tooltip>
                                    <input accept="image/*" id={props.id} type="file" onChange={(e => buscarArchivo(e))} className={classesEncabezado.ocultar} />
                                </div>
                            </div>
                            <div className="row">
                                {isNotEmpty(props.message) && (
                                    handleWarningMessages(props.message)
                                )}
                            </div>

                        </>
                    )}
                </div>
                <div className="row">
                    {isNotEmpty(props.fechaFoto) && (
                        <div className="row justify-content-md-center">
                            <div className="col-md-4">Cargado:</div>
                            <div className="col-md-8">
                                <b> {dateFormat(props.fechaFoto, 'dd-MM-yyyy hh:mm')} </b>
                            </div>
                        </div>
                        // </div>
                    )
                    }
                </div>
                <div className="row">
                    {isNotEmpty(props.fileSize) ? <p> <b>Tamaño:</b> {props.fileSize}&nbsp; </p> : ""}
                    {/* {isNotEmpty(props.fileName) ? <p><b>Nombre:</b> {props.fileName} </p> : ""} */}
                </div>
            </div>
            <div>
                <Popup
                    visible={props.popupVisible}
                    onHiding={props.hidePopup}
                    dragEnabled={false}
                    closeOnOutsideClick={true}
                    showTitle={false}
                    width={"510px"}
                    height={"510px"}>
                    <div >
                        {isUpdate ? (
                            <>
                                {props.files.map((file, index) => (
                                    <Avatar key="avartarTempFile" src={isNotEmpty(file) ? file : toAbsoluteUrl("/media/users/default.jpg")} className={classes.avatarPopup} />
                                ))}
                            </>
                        ) : <Avatar key="avartarViewDb" src={isNotEmpty(props.imagenB64) ? props.imagenB64 : toAbsoluteUrl("/media/users/default.jpg")} className={classes.avatarPopup} />
                        }
                    </div>
                </Popup>
            </div>

        </>
    )
    //}
}

AvatarFoto.propTypes = {
    size: PropTypes.string,
    id: PropTypes.string,
    esSubirImagen: PropTypes.bool,
    imagenB64: PropTypes.string,
    fechaFoto: PropTypes.string,
    popupVisible: PropTypes.bool

}
AvatarFoto.defaultProps = {
    size: "",
    id: "idAvatar",
    esSubirImagen: false,
    imagenB64: "",
    fechaFoto: "",
    popupVisible: false
}

export default withFileUpload(AvatarFoto);