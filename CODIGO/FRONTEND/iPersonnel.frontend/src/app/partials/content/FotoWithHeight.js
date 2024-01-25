import React, { useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import ImageSearchOutlinedIcon from '@material-ui/icons/ImageSearchOutlined';
import BackupOutlinedIcon from '@material-ui/icons/BackupOutlined';

import withFileUploadImageWithHeight from "./withFileUploadImageWithHeight";
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

  /* root: {
    minWidth: 150,
    maxWidth: 150,
    minHeight: 250,
    maxHeight: 250,
    margin: "20px auto 20px",
    overflow: "visible",
  },
  containerMedia: {
    height: 140,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  media: {
    maxWidth: 100,
    maxHeight: 170
  }
  ,
  containerPopup: {
    height: 250,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  mediaPopup: {
    maxWidth: 140,
    maxHeight: 280
  } */

  media: {
    media: "(max-width: 420px)"
  }

}));

const FotoWithHeight = (props) => {

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
      props.agregarFotoBd({ file, fileHeight: props.fileHeight, fileWidth: props.fileWidth });
    }
    /* else {
     handleWarningMessages("No existe archivo!");
   } */
  }

  const buscarArchivo = (e) => {
    setIsUpdate(true);
    props.addFile(e);
  }

  return (
    <>

      {/*  <Card className={classes.root}>
        <CardActionArea> */}
      <div className="content">
        <div className="row">
          <div onClick={props.onClick} className={classes.containerMedia} id="container-media">

            {isUpdate ? (
              <>
                {props.files.map((file, index) => (
                  <CardMedia
                    key="avartarFile"
                    component="img"
                    image={isNotEmpty(file) ? file : toAbsoluteUrl("/media/products/default.jpg")}
                    title={isNotEmpty(props.fechaFoto) ? dateFormat(props.fechaFoto, 'dd-MM-yyyy hh:mm') : props.id}
                    style={{ display: 'block', margin: "0 auto", maxWidth: "100%", width: "80%", height: "200px" }}
                  />

                ))}
              </>
            ) :
              <CardMedia
                key="avartarFileDb"
                component="img"
                image={isNotEmpty(props.imagenB64) ? props.imagenB64 : toAbsoluteUrl("/media/products/default.jpg")}
                title={isNotEmpty(props.fechaFoto) ? dateFormat(props.fechaFoto, 'dd-MM-yyyy hh:mm') : props.id}
                style={{ display: 'block', margin: "0 auto", maxWidth: "100%", width: "80%", height: "200px" }}
              />

            }

          </div>
        </div>
        {/* <div className="row" style={{ marginTop: "5px", marginLeft: "22px", justifyContent: 'center' }}  > */}
        <div className="row" style={{ marginTop: "5px",justifyContent: 'center' }}  >
          <div className="d-flex justify-content-center" style={{ color: "black" }}>
            {<span> Altura: <b>{isNotEmpty(props.fileHeight) ? props.fileHeight : isNotEmpty(props.fileHeightX) ? props.fileHeightX + ' px' : ""} </b> &nbsp; </span>}
            {<span> Ancho: <b>{isNotEmpty(props.fileWidth) ? props.fileWidth : isNotEmpty(props.fileWidthX) ? props.fileWidthX + ' px' : ""} </b> </span>}
          </div>
          {props.mostrarTamanosSugeridos && (
            <div>
              {/* <div className="row" style={{ zIndex: +100, position: 'fixed', height: "97px", marginTop: "13px", marginLeft: "22px" }} > */}
              <div className="row">
                <div className="d-flex justify-content-center">
                  {<span style={{ color: "red" }}> Altura Sugerido: <b> {isNotEmpty(props.AlturaSugerido) ? props.AlturaSugerido + 'px' : ""} </b> &nbsp; </span>}
                </div>
              </div>

              <div className="row">
                <div className="d-flex justify-content-center">
                  {<span style={{ color: "red" }}> Ancho Sugerido:  <b> {isNotEmpty(props.AnchoSugerido) ? props.AnchoSugerido + 'px' : ""} </b> </span>}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="fixedButton">
          <div className="d-flex justify-content-center">
            {props.esSubirImagen && (
              <div className={""} >
                <div className="row">
                  {isNotEmpty(props.message) && (
                    handleWarningMessages(props.message)
                  )}
                </div>

                <Tooltip title="Buscar" aria-label="add">
                  <label htmlFor={props.id} >
                    <IconButton color="primary" aria-label="upload picture" component="span" >
                      <ImageSearchOutlinedIcon fontSize="large" />
                    </IconButton>
                  </label >
                </Tooltip>
                <Tooltip title="Cargar" aria-label="add">
                  <label >
                    <IconButton color="secondary" id="btnUpload" aria-label="upload picture" component="span" onClick={subirFotoBd} className={classesEncabezado.ocultar} >
                      <BackupOutlinedIcon fontSize="large" />
                    </IconButton>
                  </label >
                </Tooltip>
                <input accept="image/*" id={props.id} type="file" onChange={(e => buscarArchivo(e))} className={classesEncabezado.ocultar} />


              </div>
            )}
          </div>
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
      </div>


    </>
  )
  //}
}

FotoWithHeight.propTypes = {
  size: PropTypes.string,
  id: PropTypes.string,
  esSubirImagen: PropTypes.bool,
  imagenB64: PropTypes.string,
  fechaFoto: PropTypes.string,
  fileHeightX: PropTypes.string,
  fileWidthX: PropTypes.string,
  mostrarTamanosSugeridos: PropTypes.bool,
  AlturaSugerido: PropTypes.string,
  AnchoSugerido: PropTypes.string
}
FotoWithHeight.defaultProps = {
  size: "",
  id: "idAvatar",
  esSubirImagen: false,
  imagenB64: "",
  fechaFoto: "",
  AlturaSugerido: "",
  AnchoSugerido: "",
  mostrarTamanosSugeridos: false
}

export default withFileUploadImageWithHeight(FotoWithHeight);
