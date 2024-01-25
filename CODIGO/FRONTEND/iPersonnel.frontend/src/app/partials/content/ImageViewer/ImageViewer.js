import React, { useState, useEffect } from 'react';
import { Fragment } from 'react';
import './ImageViewer.css';

import CardMedia from '@material-ui/core/CardMedia';
import { Popup } from 'devextreme-react/popup';
import { isNotEmpty } from '../../../../_metronic';
import { injectIntl } from "react-intl";


const ImageViewer = ({
  filters = ".png, .jpg, .jpeg",
  maxWeight = 8000,
  defaultImage = "",
  setImagedLoad = () => { },
  width = 150,
  height = 160,
  editImage = true,
  intl
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
  // useEffect(() => {
  //     setUpComponent(true);  
  // }, []);

  useEffect(() => {
    if (defaultImage !== "" && defaultImage != imgBase64) {// && upComponent
      //console.log("Se agrega img cargada:");
      //Se carga imagen por default: 
      setImgBase64(defaultImage);
      loadInfoImage(defaultImage);
    }
  }, [defaultImage]);
  // }, [defaultImage, upComponent]);

  /* */


  const loadInfoImage = (data) => {
    let customImg = new Image()
    customImg.onload = function () {
      setImgInfo({
        ...imgInfo,
        fileWidth: this.width,
        fileHeight: this.height
      });

    };
    customImg.src = data;
  }

  const subirImagen = async (e) => {
    //console.log("subirImagen :::", e);
    let input = e.target;
    //console.log("subirImagen input:::", e.target);
    //console.log("subirImagen input files :::", e.target.files);

    if (input.files && input.files.length > 0 && input.files[0]) {
      //console.log("File:::", input.files);
      let tmpFile = input.files[0];

      let customImg = new Image()
      customImg.src = window.URL.createObjectURL(tmpFile);
      let sizeFile = formatBytes(tmpFile.size, 2);

      //console.log("Inicia validacion de foto", tmpFile.size);
      if (tmpFile.size > maxWeight) {
        //fileOk = false;
        let mensaje = `El tamaño de su archivo ${sizeFile} es mayor al máximo pérmitido ${formatBytes(sizeFile, 2)}, por favor cambiar!`
        setMessage(mensaje);
      } else {
        setMessage("");
      }
      //console.log("Carga");
      let fotoPersona = await fileToBase64(tmpFile);

      //console.log("IfotoPersona", fotoPersona);
      setImgBase64(fotoPersona[0]);
      setImgInfo({
        ...imgInfo,
        fileSize: sizeFile,
        fileName: tmpFile.name,
        fileWidth: customImg.width,
        fileHeight: customImg.height
      });
      setImagedLoad({ imgBase64: fotoPersona[0], imgInfo });
    }
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

  return (
    <Fragment>
      <div className="container">
        <div className="row">
          <div className="col-9">
            <div className="avatar-upload">
              {editImage ? (
                <div className="avatar-edit">
                  <input type='file' id="imageUpload" accept={filters}
                    onChange={subirImagen}
                  />
                  <label className="imageupload-label" htmlFor="imageUpload">
                    <i className="fas fa-pen imageupload-i"></i>
                  </label>
                </div>
              ) : null}

              <div className="avatar-preview"
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                }}
                onClick={verImagenZoom} >
                <div id="imagePreview"
                  style={{
                    backgroundImage: `url(${(imgBase64 == "" ? "/media/products/default.jpg" : imgBase64)})`,
                  }}>
                  {/* <img id="imagePreview"
                                src={imgBase64 == "" ? "/media/products/default.jpg" : imgBase64}
                            /> */}
                  {/* <div id="imagePreview" >*/}
                </div>
              </div>
            </div>
          </div>
          <div className="col-3 content-imginfo">
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

    </Fragment>
  );
};

export default injectIntl(ImageViewer);
