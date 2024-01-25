import React from "react";
import { injectIntl } from "react-intl";//Multi-idioma
import { isNotEmpty } from "../../../_metronic";

/* import Dialog from '@material-ui/core/Dialog';
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close'; */

import PropTypes from "prop-types";
import { useStylesEncabezado } from "../../store/config/Styles";

const FileViewer = props => {
  const { fileBase64, fileName, fileType } = props;
  //const perfil = useSelector(state => state.perfil.perfilActual);   
  //const classesEncabezado = useStylesEncabezado();

  const openFile = () => {
    //funcion que abre nueva tab del navegador con archivo
    if (isNotEmpty(fileBase64)) {
      let pdfWindow = window.open();

      pdfWindow.document.write(
        `<iframe url="https://docs.google.com/gview?" width='100%' height='100%' src='${fileType + fileBase64}' 
            download='${fileName}'
            frameborder="0"
            className="responsive"
        >
        </iframe>`
      );
      pdfWindow.document.title = `${fileName}`;
    }

  }

  return (
    <>
      <a id="fileOpenWindow" onClick={openFile} />
      {/*//////////////////////////-Se desactivo popup para abrir una ventana//////////////////////////////////. 

      <Dialog fullScreen open={props.showPopup.isVisiblePopUp}  //{props.showPopup.isVisiblePopUp}
        onClose={() => props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)}
      >

        <AppBar position="static" className={classesEncabezado.principal}>
          <Toolbar variant="dense" className={classesEncabezado.toolbar}  >
            <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
              {fileName}

            </Typography>
            <IconButton autoFocus size="medium" color="inherit" onClick={() => props.cancelar()} >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        {isNotEmpty(fileBase64) && (
          <iframe url="https://docs.google.com/gview?"
            src={fileType + fileBase64}
            //style={{ "width": props.width, "height": props.height }}
            style={{ "width": "100%", "height": "100%" }}
            fileName={fileName}
            frameborder="0"
            className="responsive"
          />
        )}
      </Dialog> */}
    </>
  );
};

FileViewer.propTypes = {
  showButton: PropTypes.bool,
  fileBase64: PropTypes.string,
  fileType: PropTypes.string,
  fileName: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string
};
FileViewer.defaultProps = {
  showButton: true,
  fileBase64: "",
  fileType: "data:application/pdf;base64,",
  fileName: "Documento.pdf",
  width: "600px",
  height: "600px"

};
export default injectIntl(FileViewer);
