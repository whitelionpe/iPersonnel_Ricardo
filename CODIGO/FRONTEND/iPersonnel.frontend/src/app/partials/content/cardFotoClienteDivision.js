import React, { useState } from 'react';
import { IconButton, Tooltip, Card } from '@material-ui/core';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import { TextField } from "@material-ui/core";
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { makeStyles } from '@material-ui/core';
import { injectIntl } from "react-intl";
import PropTypes from 'prop-types'

import { handleWarningMessages } from "../../store/ducks/notify-messages";
import { isNotEmpty, dateFormat } from "../../../_metronic";
import ImageViewerClienteDivision from '../components/ImageViewer/ImageViewerClienteDivision';

const useStyles = makeStyles((theme) => ({
    root: {
        minWidth: 300,
        maxWidth: 300,
        minHeight: 500,
        maxHeight: 500,
        margin: "20px auto 20px",
        overflow: "visible"
    },
    containerMedia: {
        height: 350,
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

const CardFotoClienteDivision = ({
    imagenConfiguracion = { width: 100, height: 100, minRange: 0.2, maxRange: 0.2, weight: 5242880 },
    imagenB64 = "",
    deletePicture = () => { console.log("Evento eliminar foto"); },
    editable = true,
    medidaSugeridas = "",
    ...props
}) => {

    const { intl } = props;
    const [currentImagePersona, setCurrentImagePersona] = useState("");
    const [flUpdate, setFlUpdateImage] = useState(false);

    const configuracion = {
        imageSize: {
            width: imagenConfiguracion.width,
            height: imagenConfiguracion.height
        },
        imageRange: {
            min: imagenConfiguracion.minRange,
            max: imagenConfiguracion.maxRange,
        },
        maxWeight: imagenConfiguracion.weight
    };

    const subirFotoBd = () => {
        if (flUpdate) {
            props.agregarFotoBd({ file: currentImagePersona });
            setFlUpdateImage(false);
        } else {
            handleWarningMessages("Debe seleccionar un archivo!");
        }
    }
    const cargarFotoSeleccionada = (data) => {
        //add
        props.agregarFotoBd({ file: data.imgBase64, fileHeight: data.imgInfo_.fileHeight, fileWidth: data.imgInfo_.fileWidth });

        setFlUpdateImage(true);
        setCurrentImagePersona(data.imgBase64);
    }

    return (
        <>
            <Card >
                <div id="container-media" style={{ marginBottom: '10px' }}>
                    <ImageViewerClienteDivision
                        setImagedLoad={cargarFotoSeleccionada}
                        defaultImage={imagenB64}
                        setFlUpdate={setFlUpdateImage}
                        flUpdate={flUpdate}
                        width={192}
                        height={192}
                        intl={intl}
                        editImage={editable}
                        {...configuracion}
                        numberPosition={props.numberPosition}
                        medidaSugeridas={medidaSugeridas}
                    //add
                    />
                </div>

                {props.esSubirImagen && isNotEmpty(props.message) && (
                    handleWarningMessages(props.message)
                )}

                {/* <div className='container'>
                    <div className="row">
                        <div className='col-9' style={{ maxWidth: '175px' }}>
                            <TextField
                                type="text"
                                label={isNotEmpty(props.fechaFoto) ? "Cargado" : intl.formatMessage({ id: "ACCREDITATION.SUBIR.IMAGEN" })}
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
                        </div>

                        {!!imagenB64 && imagenB64 !== "" && editable && (
                            <div className='col-2' >
                                <Tooltip title={intl.formatMessage({ id: "ACTION.REMOVE" })} aria-label="add">
                                    <label style={{ background: "#ffbf00", borderRadius: "50%" }} >
                                        <IconButton color="inherit" aria-label="delete picture" component="span" onClick={deletePicture} style={{ margin: "-5px -5px -5px" }}>
                                            <DeleteForeverIcon fontSize="large" style={{ fontSize: "21px" }} />
                                        </IconButton>
                                    </label >
                                </Tooltip>
                            </div>
                        )}
                    </div>
                    {props.esSubirImagen && isNotEmpty(props.message) && (
                        handleWarningMessages(props.message)
                    )}
                </div> */}

            </Card>
        </>
    )
}

CardFotoClienteDivision.propTypes = {
    size: PropTypes.string,
    id: PropTypes.string,
    esSubirImagen: PropTypes.bool,
    imagenB64: PropTypes.string,
    fechaFoto: PropTypes.string
}
CardFotoClienteDivision.defaultProps = {
    size: "",
    id: "idAvatar",
    esSubirImagen: false,
    imagenB64: "",
    fechaFoto: ""
}

export default injectIntl(CardFotoClienteDivision);
