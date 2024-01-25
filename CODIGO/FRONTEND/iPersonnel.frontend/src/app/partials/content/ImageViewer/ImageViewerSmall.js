import React, { useState, useEffect, useRef } from 'react';
import { Fragment } from 'react';
import './ImageViewerSmall.css';

import CardMedia from '@material-ui/core/CardMedia';
import { Popup } from 'devextreme-react/popup';
import { isNotEmpty } from '../../../../_metronic';
import { injectIntl } from "react-intl";
import notify from 'devextreme/ui/notify';

const ImageViewerSmall = ({
  filters = ".png, .jpg, .jpeg",
  maxWeight = 5000,
  defaultImage = "",
  setImagedLoad = () => { },
  width = 150,
  height = 160,
  editImage = true,
  intl,
  styleConteiner = null,
  orientation = "V", //H=Horizontal | V=Vertical
  imageSize = {
    width: -1,
    height: -1
  },
  imageRange = {
    min: 0,
    max: 0
  }
}) => {

  const [popupVisible, setPopupVisible] = useState(false);
  const [imgBase64, setImgBase64] = useState("");
  const [message, setMessage] = useState("");
  const [imgInfo, setImgInfo] = useState({
    fileSize: "-",
    fileName: "-",
    fileWidth: "-",
    fileHeight: "-"
  });

  const [upComponent, setUpComponent] = useState(false);

  // console.log("ImageViewer", {
  //   defaultImage,
  //   imgBase64
  // });

  useEffect(() => {
    // console.log("useEffect ImageViewer", { defaultImage, imgBase64 });
    if (defaultImage !== "") {
      setImgBase64(defaultImage);
    }else
    {
      setImgBase64("");
    }

  }, [defaultImage]);

  useEffect(() => {

    if (message !== "") {
      notify(message, 'error', 3000);

      setMessage("");
    }

  }, [message])


  // useEffect(() => {
  //   if (defaultImage !== "" && defaultImage != imgBase64) {// && upComponent
  //     console.log("Se agrega img cargada:");
  //     //Se carga imagen por default: 
  //     setImgBase64(defaultImage);
  //     loadInfoImage(defaultImage);
  //   }



  // const loadInfoImage = (data) => {
  //   let customImg = new Image()
  //   customImg.onload = function () {
  //     setImgInfo({
  //       ...imgInfo,
  //       fileWidth: this.width,
  //       fileHeight: this.height
  //     });

  //   };
  //   customImg.src = data;
  // }

  const subirImagen = async (e) => {
    //console.log("subirImagen :::", e);
    let input = e.target;
    // console.log("subirImagen input:::", e.target);
    // console.log("subirImagen input files :::", e.target.files);

    if (input.files && input.files.length > 0 && input.files[0]) {

      //Se valida peso:
      let tmpFile = input.files[0];
      let tmpWeight = Math.round(tmpFile.size / 1024, 0);
      
      let sizeFile = formatBytes(tmpFile.size, 2);
      // console.log("sizeFile:",sizeFile);
      // console.log("tmpWeight:",tmpWeight);
      // console.log("maxWeight:",maxWeight);
      if (tmpWeight > maxWeight) {
        //fileOk = false;
        let mensaje = `El tamaño de su archivo ${sizeFile} es mayor al máximo pérmitido, por favor cambiar!`
        setMessage(mensaje);

        input.value = '';
        if (input.value) {
          input.type = "text";
          input.type = "file";
        }
        return;
      } else {

        //Se carga imagen:
        let fotoPersona = await fileToBase64(tmpFile);
        let dimension = await getImageSize(tmpFile);
        let flImageOk = false;
        let messageError = '';
        if (imageSize.width > 0) {
          //Se encuentra configurado el tamaño de la foto:
          //imageRange.min
          let conf_w = Math.round(imageSize.width);
          let conf_h = Math.round(imageSize.height);
          let img_w = Math.round(dimension.width);
          let img_h = Math.round(dimension.height);
          let tamanioExacto = conf_w === img_w || conf_h === img_h;
 

          if (!tamanioExacto) {
            //Se valida que la imagen sea proporcional al tamaño original:
            let factor_h = conf_h / conf_w;
            let proporcional = Math.round(factor_h * img_w) === img_h;

            //console.log("factores", { factor_h, proporcional });

            //En caso la imagen no sea de tamaño exacto se evalua el factor + / - 
            if (proporcional) {
              let max = parseFloat(imageRange.max);
              let min = parseFloat(imageRange.min);
              let rangoMaximo = img_w <= (conf_w * (1 + max)) && img_h <= (conf_h * (1 + max));
              let rangoMinimo = img_w >= (conf_w * (1 - min)) && img_h >= (conf_h * (1 - min));
     
              if (rangoMaximo && rangoMinimo) {
                flImageOk = true;
              } else {
                flImageOk = false;
                messageError = `El tamaño de la imagen no esta en el rango permitido`
              }
            } else {
              flImageOk = false;
              messageError = `El tamaño de la imagen no es proporcional a ${conf_w}x${conf_h}`
            }
          } else {
            //Ok
            flImageOk = true;
          }

          if (!flImageOk) {
            setMessage(messageError);

            input.value = '';
            if (input.value) {
              input.type = "text";
              input.type = "file";
            }
            return;
          }

          /*if (imageSize.width < dimension.width ||
            imageSize.height < dimension.height) {
            let mensaje = `El tamaño máximo de la imagen es de ${imageSize.width}x${imageSize.height}`
            setMessage(mensaje);

            input.value = '';
            if (input.value) {
              input.type = "text";
              input.type = "file";
            }
            return;
          }*/
        }

        setMessage("");
        setImgBase64(fotoPersona[0]);
        setImgInfo({
          ...imgInfo,
          fileSize: sizeFile,
          fileName: tmpFile.name,
          fileWidth: dimension.width,
          fileHeight: dimension.height
        });
        setImagedLoad({ imgBase64: fotoPersona[0], imgInfo,fileName:tmpFile.name });
      }

      // console.log("aaaa", { dimension });
      // console.log("IfotoPersona", fotoPersona);


    }
  }

  const getImageSize = (tmpFile) => {
    let customImg = document.createElement("img");

    const promise = new Promise((resolve, reject) => {
      customImg.onload = () => {
        const width = customImg.naturalWidth;
        const height = customImg.naturalHeight;
        resolve({ width, height });
      }
      customImg.onerror = reject;
    });


    customImg.src = window.URL.createObjectURL(tmpFile);

    return promise;
  }

  async function fileToBase64(file) {
    function getBase64(file) {
      const reader = new FileReader()
      return new Promise(resolve => {
        reader.onload = ev => {
          resolve(ev.target.result)
        }
        reader.readAsDataURL(file)
      })
    }

    const promises = []
    promises.push(getBase64(file))
    return await Promise.all(promises);
  }

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  function verImagenZoom() {
    setPopupVisible(true);
  }

  function showInfo(tipo) {
    setPopupVisible(true);
  }

  function hideInfo(tipo) {
    setPopupVisible(false);
  }


  const refInputFile = useRef(null);
  const cargarImagen = (e) => {
    e.preventDefault()
    if (refInputFile != null) {
      //console.log("refInputFile", refInputFile);
      refInputFile.current.click();
    }
  }

  return (
    <Fragment>
      <div style={styleConteiner} className="container">
        <div className="row">
          <div className={`col-${orientation === "V" ? "9" : "12"}`}>
            <div className="avatar-upload">
              {editImage ? (
                <div className="avatar-edit">
                  <input type='file' accept={filters} ref={refInputFile}
                    onChange={subirImagen}
                  />
                  <a className="imageupload-label" onClick={cargarImagen} >
                    <i className="fas fa-pen imageupload-i"></i>
                  </a>

                  {/* <label className="imageupload-label" onClick={cargarImagen} >
                    <i className="fas fa-pen imageupload-i"></i>
                  </label> */}
                </div>
              ) : null}

              <div className="avatar-preview"
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                }}
                onClick={verImagenZoom} >
                <div
                  style={{
                    backgroundImage: `url(${(imgBase64 == "" ? "/media/products/default.jpg" : imgBase64)})`,
                  }}>
                </div>

                {/* <img src={imgBase64} /> */}
              </div>
            </div>
          </div>
          <div style={orientation === "V" ? null : { position: "absolute", botton: "50px" }}
            className={`col-${orientation === "V" ? "3" : "12"} content-imginfo`} >
            <h6 className="h1-imageviewer" >
              {intl.formatMessage({ id: "COMMON.HEIGHT" })}<b>{imgInfo.fileHeight} px</b>
            </h6>
            <h6 className="h1-imageviewer" >
              {intl.formatMessage({ id: "COMMON.WIDTH" })}<b>{imgInfo.fileWidth} px</b>
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

export default injectIntl(ImageViewerSmall);
