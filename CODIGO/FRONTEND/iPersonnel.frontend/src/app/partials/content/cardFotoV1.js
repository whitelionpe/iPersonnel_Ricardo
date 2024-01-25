import React, { useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import ImageSearchOutlinedIcon from '@material-ui/icons/ImageSearchOutlined';
import BackupOutlinedIcon from '@material-ui/icons/BackupOutlined';

import withFileUpload from "./withFileUpload";
import Tooltip from '@material-ui/core/Tooltip';
import PropTypes from 'prop-types'

import { useStylesEncabezado, useStylesTab } from "../../store/config/Styles";
import { handleWarningMessages } from "../../store/ducks/notify-messages";
import { isNotEmpty, toAbsoluteUrl, dateFormat } from "../../../_metronic";

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import { Popup } from 'devextreme-react/popup';


const useStyles = makeStyles((theme) => ({
    root: {
        width: "280px!important",
        height: "400px!important",
    },
}));

const CardFoto = (props) => {
    const classes = useStyles();
    const [isUpdate, setIsUpdate] = useState(false);
    const classesEncabezado = useStylesEncabezado();
    const classesTab = useStylesTab();

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

    return (
        <>

            <Card className={classes.root}>
                <CardActionArea>
                    <div onClick={props.onClick}>
                        {isUpdate ? (
                            <>
                                {props.files.map((file, index) => (
                                    <CardMedia
                                        key="avartarFile"
                                        component="img"
                                        image={isNotEmpty(file) ? file : toAbsoluteUrl("/media/products/default.jpg")}
                                        title={isNotEmpty(props.fechaFoto) ? dateFormat(props.fechaFoto, 'dd-MM-yyyy hh:mm') : props.id}
                                        className={props.size}
                                    />
                                ))}
                            </>
                        ) : <CardMedia
                                key="avartarFileDb"
                                component="img"
                                image={isNotEmpty(props.imagenB64) ? props.imagenB64 : toAbsoluteUrl("/media/products/default.jpg")}
                                title={isNotEmpty(props.fechaFoto) ? dateFormat(props.fechaFoto, 'dd-MM-yyyy hh:mm') : props.id}
                                className={props.size}
                            />

                        }
                    </div>
                    <CardContent>
                        <div>
                            <div className="row">
                                {isNotEmpty(props.fechaFoto) && (
                                    <div class="row justify-content-md-center">
                                        <div className="col-md-4">Cargado:</div>
                                        <div className="col-md-8">
                                            <b> {dateFormat(props.fechaFoto, 'dd-MM-yyyy hh:mm')} </b>
                                        </div>
                                    </div>
                                )
                                }
                            </div>
                            <div className="row">
                                {isNotEmpty(props.fileSize) ? <p> <b>Tamaño:</b> {props.fileSize}&nbsp; </p> : ""}

                            </div>
                        </div>

                    </CardContent>
                </CardActionArea>
                <CardActions className={"content-center"}>
                    <div className="row">
                        {props.esSubirImagen && (
                            <div >
                                <div className="row">
                                    {isNotEmpty(props.message) && (
                                        handleWarningMessages(props.message)
                                    )}
                                </div>
                                <div className="row">
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
                        )}
                    </div>
                </CardActions>
            </Card>
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
                                    <CardMedia
                                        key="cardViewTemp"
                                        component="img"
                                        image={isNotEmpty(file) ? file : toAbsoluteUrl("/media/products/default.jpg")}
                                        title={isNotEmpty(props.fechaFoto) ? dateFormat(props.fechaFoto, 'dd-MM-yyyy hh:mm') : props.id}
                                        className={classesTab.cardPopup}
                                    />
                                ))}
                            </>
                        ) : <CardMedia
                                key="cardViewBd"
                                component="img"
                                image={isNotEmpty(props.imagenB64) ? props.imagenB64 : toAbsoluteUrl("/media/products/default.jpg")}
                                title={isNotEmpty(props.fechaFoto) ? dateFormat(props.fechaFoto, 'dd-MM-yyyy hh:mm') : props.id}
                                className={classesTab.cardPopup}
                            />

                        }

                    </div>
                </Popup>
            </div>


        </>
    )
    //}
}

CardFoto.propTypes = {
    size: PropTypes.string,
    id: PropTypes.string,
    esSubirImagen: PropTypes.bool,
    imagenB64: PropTypes.string,
    fechaFoto: PropTypes.string
}
CardFoto.defaultProps = {
    size: "",
    id: "idAvatar",
    esSubirImagen: false,
    imagenB64: "",
    fechaFoto: ""
}

export default withFileUpload(CardFoto);