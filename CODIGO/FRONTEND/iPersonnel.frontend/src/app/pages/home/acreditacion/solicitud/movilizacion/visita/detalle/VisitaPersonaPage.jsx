import React, { Fragment, useState, useEffect } from "react";
import CardVisits from "../../../../../../../partials/content/Acreditacion/CardVisits/CardVisits";
import VisitStructureRequirement from "../../../../../../../partials/content/Acreditacion/CardVisits/VisitStructureRequirement";
import CustomTabNav from "../../../../../../../partials/content/Acreditacion/CustomTabNav/CustomTabNav";

import { useStylesEncabezado } from "../../../../../../../store/config/Styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
//import { Button } from "devextreme-react";
import notify from "devextreme/ui/notify";
import { injectIntl } from "react-intl";
import { downloadFile } from "../../../../../../../api/acreditacion/visitaPersonaDetalle.api";
//import PdfViewer from "../../../../../../../partials/content/Acreditacion/PdfViewer/PdfViewer";
//import ValidationGroup from "devextreme-react/validation-group";


const VisitaPersonaPage = (props) => {
  const { intl, setLoading,
    dataRowEditNew,
    viewCardVisita,
    setViewCardVisita,
    modoEdicion,
    tipoDocumentos,
    sexoSimple,
    personDataValidationRules = [],
    configuracion,
    formControl,
    setFormControl,
    //Control de Visitas:
    visitas,
    setVisitas,
    //Control de requisitos:

    requisitos,
    personasRequisitos,
    eventViewPdf,

    setpersonasRequisitos,
    //Cabecera de los tab visitas
    headerDataVisits = [],
    setHeaderDataVisits,
    //Cabecera de los tab requisitos
    setHeaderDataRequeriments } = props;


  const classesEncabezado = useStylesEncabezado();
  const [evaluarRequerido, setEvaluarRequerido] = useState(false);
  // const [fileView, setFileView] = useState();
  // const [verPopup, setVerPopup] = useState(false);

  const eventDeleteChildren = Documento => {

    let tmpVisitas = visitas.filter(x => x.Documento !== Documento);
    let tempElementos = headerDataVisits.filter(x => x.id != Documento);

    setHeaderDataVisits(tempElementos);
    setHeaderDataRequeriments(prev => prev.filter(x => x.id !== Documento));
    setVisitas(tmpVisitas);
  };

  const agregarPersona = data => {
    /*
    1.- Se valida si existe la persona
    2.- En caso exista muestra una alerta y no agrega
    3.- En caso no exista agrega la persona y crea sus requisitos.
        de acuerdo al perfil seleccionado.
    4.- Se crea la cabecera para el tab visita
    5.- Se crea la cabecera para el tab requisito
    */
    setLoading(true);

    let personaEncontrada = visitas.find(x => x.Documento === data.Documento);
    if (!!personaEncontrada) {
      const type = "error";
      const text = intl.formatMessage({ id: "ACCREDITATION.VISIT.TAB2.ALERT" });
      notify(text, type, 3000);
      return;
    }

    let tmpRequisitos = [];

    for (let i = 0; i < requisitos.length; i++) {
      tmpRequisitos.push({
        ...requisitos[i],
        Index: `${requisitos[i].Index}|${data.Documento}`,
        Documento: data.Documento
      });
    }

    let requisitosPorPersona = {
      Documento: data.Documento,
      TipoDocumento: data.TipoDocumento,
      Requisitos: tmpRequisitos
    };

    setVisitas(prev => [...prev, data]);
    //JDL//setpersonasRequisitos(prev => [...prev, requisitosPorPersona]);
    setViewCardVisita(false);
    setHeaderDataVisits([
      ...headerDataVisits,
      {
        id: `${data.Documento}`,
        nombre: () => (
          <>
            {data.TipoDocumento}
            <br />
            {data.Documento}
          </>
        ),
        buttonDelete: true,
        icon: ""
      }
    ]);

    setHeaderDataRequeriments(prev => [
      ...prev,
      {
        id: `${data.Documento}`,
        nombre: () => <span title="Requisitos"> {data.Documento} </span>,
        buttonDelete: false,
        icon: "dx-icon-folder"
      }
    ]);

    setLoading(false);
  };

  // const eventViewDocument = async (item) => {

  //   setLoading(true);

  //   await downloadFile({
  //     IdSolicitud: item.IdSolicitud,
  //     IdSecuencial: item.IdSecuencial,
  //     IdDatoEvaluar: item.Value
  //   })
  //     .then(res => {
  //       setFileView({
  //         fileType: "",
  //         fileBase64: res.file,
  //         fileName: res.name,
  //         Titulo: item.Text,
  //         Index: item.Index
  //       });

  //       setTimeout(() => {
  //         setLoading(false);
  //         setVerPopup(true);
  //       }, 200);
  //     })
  //     .catch(err => {
  //       let error = err.response.data.responseException.exceptionMessage || "";
  //       if (error !== "") {
  //         const type = "error";
  //         notify(error, type, 3000);
  //       }
  //       setLoading(false);
  //     })
  //     .finally(resp => {
  //       //setLoading(false);
  //     });

  // }


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
                {intl.formatMessage({ id: "ACCREDITATION.VISIT.TAB2" }).toUpperCase()}
              </Typography>
            </Toolbar>
          </AppBar>
        </div>
        {/* <ValidationGroup
          name="validarPersona"
          onInitialized={e => {
            if (e.component !== null && formControl === null) {
              setFormControl(e.component);
            }
          }}
        > */}
        {visitas.length === 0 ? (
          <>
            {intl.formatMessage({ id: "ACCREDITATION.VISIT.TAB2.NODATA" }).toUpperCase()}
          </>
        ) : (
          <CustomTabNav
            elementos={headerDataVisits}
            defaultTabActive={0}
            validateRequerid={false}
            evaluateRequerid={evaluarRequerido}
            eventDeleteChildren={eventDeleteChildren}
          >
            {visitas.map((x, i) => (
              <VisitStructureRequirement
                key={`VST_${i}`}
                nroDocumento={x.Documento}
                visits={visitas}
                setVisits={setVisitas}
                modoEdicion={modoEdicion}
                tipoDocumentos={tipoDocumentos}
                intl={intl}
                mode={"form"}
                sexoSimple={sexoSimple}
                personDataValidationRules={personDataValidationRules}
                configuracion={{ Valor1: 18 }}
                //Integrar Requisitos
                personasRequisitos={personasRequisitos}
                requisitos={requisitos}
                configuracionPeso={{ Valor1: 8 }}
                eventViewDocument={eventViewPdf}
              />
            ))}
          </CustomTabNav>
        )}
        {/* </ValidationGroup>  */}
      </div>
      {viewCardVisita && (
        <CardVisits
          intl={intl}
          modoEdicion={modoEdicion}
          tipoDocumentos={tipoDocumentos}
          sexoSimple={sexoSimple}
          personDataValidationRules={personDataValidationRules}
          showPopup={{
            isVisiblePopUp: viewCardVisita,
            setisVisiblePopUp: setViewCardVisita
          }}
          height={""}
          width={"600px"}
          eventAddData={agregarPersona}
          configuracion={configuracion}
        />
      )}

      {/* <PdfViewer
        showPopup={{ isVisiblePopUp: verPopup, setisVisiblePopUp: setVerPopup }}
        fileType={fileView.fileType}
        fileBase64={fileView.fileBase64}
        fileName={fileView.fileName}
        Titulo={fileView.Titulo}
        Index={fileView.Index}
        eventoDescarga={descargarArchivo}
      /> */}

    </Fragment>
  );
};

export default injectIntl(VisitaPersonaPage);
