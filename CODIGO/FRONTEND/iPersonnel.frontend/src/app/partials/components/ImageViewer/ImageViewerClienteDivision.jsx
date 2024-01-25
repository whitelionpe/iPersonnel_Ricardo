import React from 'react';
import { Fragment } from 'react';
import { Popup } from 'devextreme-react/popup';
import { CardMedia } from '@material-ui/core';
import styled from '@emotion/styled';

import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import { Tooltip } from 'devextreme-react/tooltip';

import useImageViewer from './useImageViewer';
import { isNotEmpty } from '../../../../_metronic';
import { toAbsoluteUrl } from '../../../../_metronic';
import './ImageViewer.css';


const DivImage = styled.div`
    width: 100%;
    height: 100%;
    border-radius:${props => (props.ENABLERADIUS ? "100%" : "0%")};
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    position: relative; 
    border: 6px solid #f8f8f8;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);

`;

const ImageViewerClienteDivision = ({
    filters = ".png, .jpg, .jpeg",
    maxWeight = 5000,
    defaultImage = "",
    setImagedLoad = () => { },
    width = 150,
    height = 160,
    editImage = true,
    intl,
    styleConteiner = null,
    orientation = "H", //H=Horizontal | V=Vertical
    imageSize = {
        width: -1,
        height: -1
    },
    imageRange = {
        min: 0,
        max: 0
    },
    enableRadius = false
    , numberPosition = ""
    , medidaSugeridas = ""
}) => {

    const {
        refInputFile,
        subirImagen,
        cargarImagen,
        verImagenZoom,
        imgBase64,
        imgInfo,
        popupVisible,
        hideInfo } = useImageViewer({
            defaultImage,
            maxWeight,
            imageSize,
            imageRange,
            setImagedLoad,
            medidaSugeridas
        });

    //============= NUEVA CONFIGURACION ================
    // RADIO ALTO
    let conf_Radio_alto = parseFloat(medidaSugeridas.height_radio);
    let conf_altura_bd = Math.round(imageSize.height);

    //RADIO ANCHO
    let conf_Radio_ancho = parseFloat(medidaSugeridas.width_radio);
    let conf_ancho_bd = Math.round(imageSize.width);

    //PORCENTAJES - ALTO
    let alto_arriba = conf_altura_bd + Math.round(conf_altura_bd * conf_Radio_alto);
    let alto_bajada = conf_altura_bd - Math.round(conf_altura_bd * conf_Radio_alto);

    //PORCENTAJES - ANCHO
    let ancho_derecho = conf_ancho_bd + Math.round(conf_ancho_bd * conf_Radio_ancho);
    let ancho_izquierdo = conf_ancho_bd - Math.round(conf_ancho_bd * conf_Radio_ancho);

    //======================================================

    return (
        <Fragment>
            <div style={styleConteiner} className="container">
                <div className="row">
                    <div className={`col-${orientation === "V" ? "9" : "12"}`}>
                        <div className="avatar-upload">
                            {editImage ? (
                                <>
                                    <div className="avatar-edit">
                                        <input type='file' accept={filters} ref={refInputFile}
                                            onChange={subirImagen}
                                        />
                                        <a className="imageupload-label" onClick={cargarImagen} >
                                            <i className="fas fa-pen imageupload-i"></i>
                                        </a>
                                    </div>
                                    <div className="avatar-edit" style={{ marginTop: "38px" }}>
                                        <a className="imageupload-label" id={`Id${numberPosition}`}  >
                                            <HelpOutlineIcon fontSize="large" style={{ color: "black", marginTop: "3px" }} />
                                        </a>

                                        <Tooltip
                                            target={`#Id${numberPosition}`}
                                            showEvent="mouseenter"
                                            hideEvent="mouseleave"
                                            position="right"
                                            hideOnOutsideClick={false}
                                        >

                                            <div style={{ display: 'inline-grid', position: 'relative', bottom: '2rem' }}>
                                                <label>{`Máximo ${alto_arriba} px.`}</label>
                                                <b>{intl.formatMessage({ id: "COMMON.HEIGHT.SUGERIDA" })}</b>
                                                <label>{`Mínimo: ${alto_bajada} px.`}</label>
                                            </div>
                                            <img alt="SuperPlasma 50" width="150" src={toAbsoluteUrl("/media/users/imagenDeauldClienteDivision.png")} /><br />
                                            <div style={{ display: 'inline-grid', marginLeft: '6rem' }}>
                                                <label>{`Mínimo: ${ancho_izquierdo} px.`}</label>
                                                <b>{intl.formatMessage({ id: "COMMON.WIDTH.SUGERIDA" })}</b>
                                                <label>{`Máximo ${ancho_derecho} px.`}</label>
                                            </div>

                                        </Tooltip>

                                    </div>
                                </>
                            ) : null}

                            <div className="avatar-preview"
                                style={{
                                    width: `${width}px`,
                                    height: `${height}px`,
                                }} onClick={verImagenZoom} >

                                <DivImage ENABLERADIUS={enableRadius}
                                    style={{
                                        backgroundImage: `url(${(isNotEmpty(imgBase64) || defaultImage !== null ? imgBase64 : "/media/products/default.jpg")})`,
                                    }}>
                                </DivImage>
                            </div>
                        </div>
                    </div>

                    <div style={orientation === "V" ? null : { position: "absolute", botton: "50px" }} className={`content-imginfo`} >
                        <h6 className="h1-imageviewer" >
                            {intl.formatMessage({ id: "COMMON.HEIGHT" })}<b>{`${Math.round(medidaSugeridas.height)} px`}</b>
                        </h6>
                        <h6 className="h1-imageviewer" >
                            {intl.formatMessage({ id: "COMMON.WIDTH" })}<b>{`${Math.round(medidaSugeridas.width)} px`}</b>
                        </h6>
                    </div>
                </div>
            </div>

            <div>
                <Popup
                    visible={popupVisible}
                    onHiding={hideInfo}
                    dragEnabled={false}
                    closeOnOutsideClick={true}
                    showTitle={false}
                    width={"510px"}
                    height={"510px"}
                >
                    <div  >
                        <CardMedia
                            key="cardViewBd"
                            component="img"
                            image={isNotEmpty(imgBase64) ? imgBase64 : "/media/products/default.jpg"}
                            title={""}
                        />
                    </div>
                </Popup>
            </div>

        </Fragment >
    );
};

export default ImageViewerClienteDivision;
