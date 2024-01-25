import React, { useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import ImageSearchOutlinedIcon from '@material-ui/icons/ImageSearchOutlined';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { TextField } from "@material-ui/core";
import Tooltip from '@material-ui/core/Tooltip';
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import { Popup } from 'devextreme-react/popup';
import ReactAvatarEditor from 'react-avatar-editor'

import { useStylesEncabezado } from "../../store/config/Styles";
import { handleWarningMessages } from "../../store/ducks/notify-messages";
import { isNotEmpty, toAbsoluteUrl, dateFormat } from "../../../_metronic";
import withFileUpload from "./withFileUploadImage";

const useStyles = makeStyles((theme) => ({
    root: {
        minWidth: 300,
        maxWidth: 300,
        // minHeight: 500,
        // maxHeight: 500,
        margin: "20px auto 20px",
        overflow: "visible"
    },
    containerMedia: {
        // height: 350,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    },
    media: {
        maxWidth: 200,
        maxHeight: 350
    }
    ,
    containerPopup: {
        height: 500,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    },
    mediaPopup: {
        maxWidth: 240,
        maxHeight: 380
    }

}));

const AvatarEditor = (props) => {
    const classes = useStyles();
    const [isUpdate, setIsUpdate] = useState(false);
    const classesEncabezado = useStylesEncabezado();
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0.5, y: 0.5 });
    const [editor, setEditorRef] = useState(null);
    const [allowZoomOut, setAllowZoomOut] = useState(false);

    const subirFotoBd = () => {
        let file = [];
        if (props.files.length > 0) {
            props.files.map((xFile, index) => (
                file = xFile
            ));
            // console.log("subirFotoBd|editor", editor);

            if (editor) {
                const img = editor.getImage().toDataURL();
                file = img;
                props.agregarFotoBd({ file });
            }
            props.setPopupVisibleFoto1(false);
            setIsUpdate(false);
        } else {
            handleWarningMessages("No existe archivo!");
        }
    }

    const buscarArchivo = (e) => {
        setIsUpdate(true);
        props.addFile(e);
    }

    const handlePositionChange = position => {
        // const img = editor.getImage().toDataURL();
        setPosition(position);
    }


    const handleScale = e => {
        const scale = parseFloat(e.target.value)
        setScale(scale);
    }


    return (
        <>
            <Card >
                <div className='container'>
                    <div onClick={props.onClick} className={classes.containerMedia} id="container-media" style={{ height: '16rem' }}>
                        {isUpdate ? (
                            <>
                                {props.files.map((file, index) => (
                                    <ReactAvatarEditor
                                        ref={e => { setEditorRef(e); }}
                                        scale={parseFloat(scale)}
                                        width={300}
                                        height={300}
                                        position={position}
                                        onPositionChange={handlePositionChange}
                                        rotate={parseFloat(0)}
                                        borderRadius={200 / (100 / 0)}
                                        image={isNotEmpty(file) ? file : toAbsoluteUrl("/media/products/default.jpg")}
                                        className="editor-canvas"
                                        border={5}
                                    />
                                ))}

                                <br />
                                Zoom:
                                <input
                                    name="scale"
                                    type="range"
                                    onChange={handleScale}
                                    min={allowZoomOut ? '0.1' : '1'}
                                    max="2"
                                    step="0.01"
                                    defaultValue="1"
                                />
                                <br />

                            </>
                        ) : <CardMedia
                            key="avartarFileDb"
                            component="img"
                            image={isNotEmpty(props.imagenB64) ? props.imagenB64 : toAbsoluteUrl("/media/products/default.jpg")}
                            title={isNotEmpty(props.fechaFoto) ? dateFormat(props.fechaFoto, 'dd-MM-yyyy hh:mm') : props.id}
                            className={classes.media}
                        />

                        }


                    </div>
                </div>

                <div className='container' style={{ marginTop: '12px' }}>
                    {props.esSubirImagen && (
                        <>
                            <div className="row">
                                {isNotEmpty(props.message) && (
                                    handleWarningMessages(props.message)
                                )}
                            </div>
                            <div style={{ display: 'flex' }}>
                                <TextField
                                    type="text"
                                    label={isNotEmpty(props.fechaFoto) ? "Cargado" : "Subir imagen"}
                                    className="kt-width-full"
                                    style={{ width: 'calc(100%)' }}
                                    name="fileUploadNombre"
                                    value={isNotEmpty(props.fechaFoto) ? dateFormat(props.fechaFoto, 'dd-MM-yyyy hh:mm') : ""}
                                    variant="outlined"
                                    size="small"
                                    InputProps={{
                                        endAdornment:
                                            <label htmlFor={1} >
                                                <IconButton
                                                    component="span"
                                                    onClick={subirFotoBd}
                                                    size="small"
                                                    style={{ marginLeft: '10px' }}
                                                >
                                                    <CloudUploadIcon style={{ position: 'absolute', marginLeft: '-13px', color: 'black', fontSize: "25px" }} />
                                                </IconButton>
                                            </label >
                                    }}
                                />

                                <Tooltip title={"Buscar"} aria-label="search">
                                    <label htmlFor={props.id} style={{ background: "#ffbf00", borderRadius: "50%", marginLeft: '5px' }} >
                                        <IconButton color="secondary" aria-label="upload picture" component="span" style={{ margin: "-5px -5px -5px" }}>
                                            <ImageSearchOutlinedIcon fontSize="large" style={{ fontSize: "21px", color: "black" }} />
                                        </IconButton>
                                    </label >
                                </Tooltip>
                            </div>
                            <input accept="image/*" id={props.id} type="file" onChange={(e => buscarArchivo(e))} className={classesEncabezado.ocultar} />
                        </>
                    )}
                    <div className="row">
                        {isNotEmpty(props.fileSize) ? <p> <b>Tamaño:</b> {props.fileSize}&nbsp; </p> : ""}
                    </div>
                </div>
            </Card>

            {!isUpdate && (
                <>
                    <Popup
                        visible={props.popupVisible}
                        onHiding={props.hidePopup}
                        dragEnabled={false}
                        closeOnOutsideClick={true}
                        showTitle={false}
                        width={"510px"}
                        height={"510px"}
                    >
                        <div className={classes.containerPopup} >
                            {isUpdate ? (
                                <>
                                    {props.files.map((file, index) => (
                                        <CardMedia
                                            key="cardViewTemp"
                                            component="img"
                                            image={isNotEmpty(file) ? file : toAbsoluteUrl("/media/products/default.jpg")}
                                            title={isNotEmpty(props.fechaFoto) ? dateFormat(props.fechaFoto, 'dd-MM-yyyy hh:mm') : props.id}
                                            className={classes.mediaPopup}
                                        />
                                    ))}
                                </>
                            ) : <CardMedia
                                key="cardViewBd"
                                component="img"
                                image={isNotEmpty(props.imagenB64) ? props.imagenB64 : toAbsoluteUrl("/media/products/default.jpg")}
                                title={isNotEmpty(props.fechaFoto) ? dateFormat(props.fechaFoto, 'dd-MM-yyyy hh:mm') : props.id}
                                className={classes.mediaPopup}
                            />
                            }
                        </div>
                    </Popup>
                </>
            )}

        </>
    )
}

AvatarEditor.propTypes = {
    size: PropTypes.string,
    id: PropTypes.string,
    esSubirImagen: PropTypes.bool,
    imagenB64: PropTypes.string,
    fechaFoto: PropTypes.string
}
AvatarEditor.defaultProps = {
    size: "",
    id: "idAvatar",
    esSubirImagen: false,
    imagenB64: "",
    fechaFoto: ""
}

export default withFileUpload(AvatarEditor);
