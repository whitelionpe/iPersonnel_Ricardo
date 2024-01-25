import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";//Multi-idioma
import { Button } from "devextreme-react";
import { Portlet, PortletHeaderPopUp, PortletHeaderToolbar } from "../../content/Portlet";
import { isNotEmpty } from "../../../../_metronic";
import { handleInfoMessages } from "../../../store/ducks/notify-messages";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";
import ImageViewerSmall from "../../../partials/content/ImageViewer/ImageViewerSmall";

const PopUpImageViewer = props => {
  const { intl } = props;
  //Foto:
  const [currentImage, setCurrentImage] = useState("");
  const [flUpdate, setFlUpdateImage] = useState(false);
  const [imagenConfiguracion, setImagenConfiguracion] = useState({ width: 350, height: 450, minRange: 0.2, maxRange: 0.2 });

  const cargarIconoSeleccionado = (data) => {
  //  console.log("cargarIconoSeleccionado|data:",data);
   setCurrentImage(data.imgBase64);
   props.dataRowEditNew.IconoBase64 = data.imgBase64;
   setFlUpdateImage(true);
 }

  async function pageLoad() {
    if (!props.dataRowEditNew.esNuevoRegistro) {
      if (props.dataRowEditNew.IconoBase64 !== "") {
        setCurrentImage(props.dataRowEditNew.IconoBase64);
        setFlUpdateImage(true);
      }
    }
  } 

  function aceptar() {
    props.showPopup.setisVisiblePopUp(false);
  }

  function limpiar(){
    props.dataRowEditNew.IconoBase64 ="";
    setCurrentImage("");
    setFlUpdateImage(false);
  }

  useEffect(() => {
    pageLoad();
  }, []);


  return (
    <>
      <Popup
        visible={props.showPopup.isVisiblePopUp}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={"300px"}
        width={"300px"}
        title={(intl.formatMessage({ id: "SYSTEM.MENUDATA.SELECTICON" })).toUpperCase()}
        onHiding={() => props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)}
      >
        <Portlet>
          {props.showButton && (
            <PortletHeaderPopUp
              title={""}
              toolbar={
                <PortletHeaderToolbar>
                  <Button
                    icon="todo"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.ACCEPT" })}
                    onClick={aceptar}
                    useSubmitBehavior={true}
                  />
                  &nbsp;
                  <Button
                  icon="fa fa-trash" //fa fa-broom
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                  onClick={limpiar}
                />
                </PortletHeaderToolbar>
              }
            />
          )}
     
     <ImageViewerSmall
                setImagedLoad={cargarIconoSeleccionado}
                defaultImage={currentImage}
                setFlUpdate={setFlUpdateImage}
                flUpdate={flUpdate}
                width={100}
                height={95}
                intl={intl}
                // imageSize={{
                //   width: imagenConfiguracion.width,
                //   height: imagenConfiguracion.height
                // }}
                imageRange={{
                  min: imagenConfiguracion.minRange,
                  max: imagenConfiguracion.maxRange,
                }}
                maxWeight={50}
              />

        </Portlet>
      </Popup>
    </>
  );
};

PopUpImageViewer.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
};
PopUpImageViewer.defaultProps = {
  showButton: true,
  selectionMode: "row", //['multiple', 'row','single]
};
export default injectIntl(PopUpImageViewer);
