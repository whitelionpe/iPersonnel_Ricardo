import React, { Fragment, useState, useEffect } from "react";
import CardVisits from "../../../../../../../partials/content/Acreditacion/CardVisits/CardVisits";
//import VisitStructure from "../../../../../../../partials/content/Acreditacion/CardVisits/VisitStructure";
import CustomTabNav from "../../../../../../../partials/content/Acreditacion/CustomTabNav/CustomTabNav";

//import CustomTabNav from '../../../../../../../partials/components/Tabs/CustomTabNav';
import { useStylesEncabezado } from "../../../../../../../store/config/Styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
//import { Button } from "devextreme-react";
import VisitaRequisitosPersonaPage from "./VisitaRequisitosPersonaPage";
import ValidationGroup from "devextreme-react/validation-group";
//import { downloadFile as downloadFileDetalle } from "../../../../../api/acreditacion/visitaPersonaDetalle.api";
import PdfViewer from "../../../../../../../partials/content/Acreditacion/PdfViewer/PdfViewer";
//import notify from "devextreme/ui/notify";
import { injectIntl } from "react-intl";

const VisitaRequisitosPage = (props) => {
  const {
    intl,
    modoEdicion,
    formControl,
    setFormControl,
    requisitos,
    visitas = [],
    personasRequisitos,
    headerDataRequeriments = [],
    configuracionPeso
  } = props;

  const classesEncabezado = useStylesEncabezado();
  const [evaluarRequerido, setEvaluarRequerido] = useState(false);

  const [popupVisible, setPopupVisible] = useState(false);
  const [fileView, setFileView] = useState({
    fileType: "",
    fileBase64: "",
    fileName: "",
    Titulo: "",
    Index: ""
  });



  const descargarArchivo = (id, file, name) => {
    if (id !== "") {
      let a = document.createElement("a"); //Create <a>
      a.href = file; //Image Base64 Goes here
      a.download = name; //File name Here
      a.click(); //Downloaded file
    }
  };

  return (
    <Fragment>
      <div>
        <div className="row" style={{ paddingBottom: "20px" }}>
          <AppBar position="static" className={classesEncabezado.secundario}>
            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
              <Typography
                variant="h6"
                color="inherit"
                className={classesEncabezado.title}
              >
                {intl
                  .formatMessage({ id: "ACCREDITATION.VISIT.TAB3" })
                  .toUpperCase()}
              </Typography>
            </Toolbar>
          </AppBar>
        </div>

        <ValidationGroup
          name="validarRequisitos"
          onInitialized={e => {
            if (e.component !== null && formControl === null) {
              setFormControl(e.component);
            }
          }}
        >
          <CustomTabNav
            elementos={headerDataRequeriments}
            defaultTabActive={0}
            validateRequerid={false}
            evaluateRequerid={evaluarRequerido}
          // eventDeleteChildren={eventDeleteChildren}
          >
            {visitas.map((x, i) => (
              <VisitaRequisitosPersonaPage
                key={`CIRP_${x.Documento}`}
                visita={x}
                personasRequisitos={personasRequisitos}
                requisitos={requisitos}
                modoEdicion={modoEdicion}
                configuracionPeso={{ Valor1: 8 }}
                //eventViewDocument={eventViewDocument}
                intl={intl}
              />
            ))}
          </CustomTabNav>
        </ValidationGroup>
      </div>

      {popupVisible && (
        <PdfViewer
          showPopup={{
            isVisiblePopUp: popupVisible,
            setisVisiblePopUp: setPopupVisible
          }}
          fileType={fileView.fileType}
          fileBase64={fileView.fileBase64}
          fileName={fileView.fileName}
          Titulo={fileView.Titulo}
          Index={fileView.Index}
          eventoDescarga={descargarArchivo}
        />
      )}
    </Fragment>
  );
};

export default injectIntl(VisitaRequisitosPage);
