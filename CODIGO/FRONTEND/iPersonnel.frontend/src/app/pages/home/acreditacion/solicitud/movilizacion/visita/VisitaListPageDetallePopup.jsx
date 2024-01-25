import React, { useState } from "react";
import ScrollView from 'devextreme-react/scroll-view';
import { Button } from "devextreme-react";
import { Popup } from "devextreme-react/popup";
import Form, {
  Item,
  GroupItem,
  PatternRule,
  RequiredRule,
  EmailRule,
  StringLengthRule,
  EmptyItem
} from "devextreme-react/form";
import { AppBar, Toolbar, Typography } from "@material-ui/core";
import {
  isNotEmpty,
  dateFormat
} from "../../../../../../../_metronic";
import CustomTabNav from "../../../../../../partials/content/Acreditacion/CustomTabNav/CustomTabNav";
import {
  PortletBody,
  PortletHeader,
  //PortletHeaderToolbar
} from "../../../../../../partials/content/Portlet";
import {
  handleErrorMessages,
  handleSuccessMessages
} from "../../../../../../store/ducks/notify-messages";
import {
  actualizarobservado
} from "../../../../../../api/acreditacion/visitaPersonaDetalle.api";
import VisitaPersonaDatosGenerales from "./persona/VisitaPersonaDatosGenerales";
import VisitaPersonaDatosRequisitos from "./persona/VisitaPersonaDatosRequisitos";
import VisitaPersonaDatosPersonales from "./persona/VisitaPersonaDatosPersonales";
import './VisitaListPage.css'
import FieldsetAcreditacion from '../../../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';
import RequestStructurePopup from "../../../../../../partials/content/Acreditacion/RequestStructure/RequestStructurePopup";
import { useStylesEncabezado } from "../../../../../../store/config/Styles";


const VisitaListPageDetallePopup = ({
  intl,
  setLoading,
  optRequisito,
  setOptRequisito,
  modoEdicion,
  dataRowEditNew,
  tipoDocumentos,
  sexoSimple,
  showPopup,
  permisosDatosPersona,
  personaRequisitos,
  setpersonaRequisitos,
  refreshDataGrid,
  SaveEnabled = true,
  colorRojo,
  colorVerde
}) => {
  const classesEncabezado = useStylesEncabezado();
  const [configuracionPeso, setConfiguracionPeso] = useState({ Valor1: 5 });

  //===============================STEPS IN MODAL===========================================
  const steps = [
    {
      id: "idDatosGenerales",
      title: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.TAB1" })
    },
    {
      id: "idDatosPersonales",
      title: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.TAB2" })
    },
    {
      id: "idDatosEvaluar",
      title: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.TAB3" })
    }
  ];

  const validateFormDataByStepNumber = currentStep => {
    let isValidate = true;
    let message = "";
    return { isValidate, message };
  };

  const eventoRetornar = () => {
    //let { IdCompania, IdCompaniaMandante } = dataRowEditNew;
    // eventoRetornar({
    //   IdCompania,
    //   IdCompaniaMandante
    // })
  }

  //==========================================================================

  const guardarAvance = async () => {
    //Se obtienen todos los registros pendientes u observados para ser enviados:
    let requisitos = personaRequisitos.filter(
      x => x.EstadoAprobacion === "P" || x.EstadoAprobacion === "O"
    );

    let arrayParams = await cargarParametrosFormulario(requisitos);
    setLoading(true);
    //console.log("Datos de formualario ", { arrayParams });
    let totales = [];
    for (let i = 0; i < arrayParams.length; i++) {
      let fl = await evento_actualizarSolicitud(arrayParams[i]);
      totales.push(totales);
    }

    //Aca de acuerdo al array de totales se muestra el mensaje
    //console.log("Totales Guardados", { totales });
    let oks = totales.filter(x => x);
    setLoading(false);
    if (oks.length > 0) {
      //Se refresca grilla:
      refreshDataGrid(dataRowEditNew.IdSolicitud);
      //Mensaje de Ok:
      handleSuccessMessages(
        intl.formatMessage({ id: "MESSAGES.SUCESS" }),
        intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
      );
    } else {
      handleErrorMessages(
        intl.formatMessage({ id: "MESSAGES.ERROR" }),
        "No se pudo subir los archivos"
      );
    }
  };

  //=======================================================

  const cargarParametrosFormulario = async requisitos => {
    //Cabecera:
    let { IdSolicitud, IdSecuencial, Documento } = dataRowEditNew;
    let maxWeight = 1024 * 1024 * configuracionPeso.Valor1;
    //Detalle:
    let Detalle = [];


    for (let i = 0; i < requisitos.length; i++) {
      let x = requisitos[i];
      //|OBS  |CHECK
      //.hasOwnProperty("IdSolicitud")
      //console.log("Se evalua =======> ", { x });
      if (x.Tipo !== "G" && x.Tipo !== "B") {

        //Se obtiene el estado del requisito antes del cambio: 
        let requisitoOriginal = personaRequisitos.find(item => item.Index === x.Index);
        let EstadoAprobacionOld = "";
        //console.log("requisitoOriginal", { requisitoOriginal });
        if (!!requisitoOriginal) {
          EstadoAprobacionOld = requisitoOriginal.EstadoAprobacion;
          if (EstadoAprobacionOld && EstadoAprobacionOld !== "") {
            EstadoAprobacionOld = EstadoAprobacionOld.trim();
          }

          //console.log("EstadoAprobacionOld", { EstadoAprobacionOld });
          if (EstadoAprobacionOld === "P" || EstadoAprobacionOld === "R" || EstadoAprobacionOld === "A") {
            continue;
          }
        }
        //console.log("cargarParametrosFormulario", { requisitos, EstadoAprobacionOld });
        //let Observacion = dataRowEditNew[`${x.Index}|OBS`];
        let EstadoAprobacion = dataRowEditNew[`${x.Index}|CHECK`];

        if (EstadoAprobacion && EstadoAprobacion !== "") {
          EstadoAprobacion = EstadoAprobacion.trim();
        }

        //Solo si se realizo cambio: 
        if (EstadoAprobacion === EstadoAprobacionOld) {
          continue;
        }

        //console.log("EstadoAprobacion", { EstadoAprobacion, dataRowEditNew, personaRequisitos });

        let valor = dataRowEditNew[x.Index];

        if (x.Tipo === "F") {
          valor = isNotEmpty(valor) ? dateFormat(valor, "yyyyMMdd") : "";
        }
        //console.log("Valores principales :::", { EstadoAprobacion, valor });
        let inputFile = document.getElementById(`btn_${x.Index}`);

        //AdjuntarArchivo: "N"
        //console.log("inputFile antes del if ", { inputFile, x });

        let formData = new FormData();
        formData.append("fileName", x.Index);
        formData.append("IdSolicitud", IdSolicitud);
        formData.append("IdSecuencial", IdSecuencial);
        formData.append("Documento", Documento);
        formData.append("IdDatoEvaluar", x.Value);
        formData.append("Valor", isNotEmpty(valor) ? valor : "");
        formData.append("EstadoAprobacion", isNotEmpty(EstadoAprobacion) ? EstadoAprobacion : "");

        if (x.AdjuntarArchivo === "N") {
          //Sin archivo:  
          formData.append("documentFile", "");

        } else {
          //Con archivo:
          if (inputFile !== undefined && inputFile.value.length > 0) {
            //console.log("inputFile ", { inputFile });
            if (inputFile.files[0].size <= maxWeight) {
              //console.log("inputFile.files ", { peso: inputFile.files[0].size });
              formData.append("documentFile", inputFile.files[0]);
            }
          }
        }
        Detalle.push(formData);
      }
    }
    //console.log("Parametros ::: ", Detalle);
    return Detalle;
  };


  const paintTitle = () => {
    return (
      <div className={`title-bloque`} style={{ display: "flex" }}>
        <div style={{ width: "100%" }} className={`title-bloque-a`}>
          <div className={`title-estado-general`}>
            <div
              className="title-estado-general-bar"
              style={{ color: "white", display: "flex" }}
            >
              <div style={{ marginTop: "5px" }}>
                {`${dataRowEditNew.Apellido}, ${dataRowEditNew.Nombre}`}

              </div>
              <div style={{ marginLeft: "12px", display: "flex" }}>
                <strong style={{ marginTop: "5px" }}> {intl.formatMessage({ id: "ACCREDITATION.EDIT.REQUEST" })} </strong> <p style={{ marginLeft: "10px", marginTop: "5px" }}> {zeroPad(dataRowEditNew.IdSolicitud, 8)} </p>
              </div>
              {paintState()}

            </div>

            <div className={"div-right"}>
              <Button
                icon="fa fa-times-circle"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                onClick={() =>
                  showPopup.setisVisiblePopUp(!showPopup.isVisiblePopUp)
                }
                className={"div-right"}
              />
            </div>
          </div>
        </div>
        {/* <div className="title-bloque-a">{paintObservacion()}</div> */}
      </div>
    );

    // return <div className="title-estado-general title-estado-general-bar"> Evaluar Solicitud</div>;
  };

  const paintObservacion = () => {
    //console.log("Observacion ", dataRowEditNew.Observacion);

    if (dataRowEditNew.EstadoAprobacion === "A") {
      if (
        dataRowEditNew.Observacion != null &&
        dataRowEditNew.Observacion !== ""
      ) {
        return (
          <div
            style={{
              // textTransform: "uppercase",
              fontWeight: "bold",
              marginTop: "1px",
              marginLeft: "20px",
              border: "solid 1px red",
              borderRadius: "5px",
              color: "red",
              paddingBottom: "10px",
              paddingTop: "10px",
              paddingLeft: "5px",
              paddingRight: "5px"
            }}
          >
            <i className="dx-icon-warning"></i>
            <span>{dataRowEditNew.Observacion}</span>
          </div>
        );
      }
    }
    return null;
  };

  function zeroPad(num, places) {
    if (num === undefined) {
      return "";
    }
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
  }

  const paintState = () => {
    let estado = "";
    let css = "";
    switch (dataRowEditNew.EstadoAprobacion) {
      case "I":
        css = "estado_item_incompleto";
        estado = intl.formatMessage({ id: "COMMON.INCOMPLETE" });
        break;
      case "P":
        css = "estado_item_pendiente";
        estado = intl.formatMessage({ id: "COMMON.EARRING" });
        break;
      case "O":
        css = "estado_item_observado";
        estado = intl.formatMessage({ id: "COMMON.OBSERVED" });
        break;
      case "R":
        css = "estado_item_rechazado";
        estado = intl.formatMessage({ id: "COMMON.REJECTED" });
        break;
      case "A":
        css = "estado_item_aprobado";
        estado = intl.formatMessage({ id: "COMMON.APPROVED" });
        break;
      default:
        css = "estado_item_incompleto";
        estado = intl.formatMessage({ id: "COMMON.INCOMPLETE" });
        break;
    }

    return (
      <span className={`estado_item_izq estado_item_general  ${css}`}>
        {estado}
      </span>
    );
  };

  const evento_actualizarSolicitud = async params => {
    //console.log("evento_actualizarSolicitud", { params });
    let isOk = false;

    await actualizarobservado(params)
      .then(async res => {
        isOk = true;
      })
      .catch(err => {

        isOk = false;
      })
      .finally(res => { });

    return isOk;
  };

  //========== TIEMPO ACREDITACION =================================================

  function retornaColor() {
    const { DiasTranscurridos } = dataRowEditNew;
    let color = '';
    if (!isNotEmpty(DiasTranscurridos)) {
      color = 'rgb(167, 167, 167)';
    }
    else if (DiasTranscurridos >= colorRojo) {
      color = 'red';
    }
    else if (DiasTranscurridos <= colorVerde) {
      color = 'green';
    } else if (DiasTranscurridos < colorRojo && DiasTranscurridos > colorVerde) {
      color = '#ffd400';
    }

    return color;
  }

  function retornaColorTexto() {
    const { DiasTranscurridos } = dataRowEditNew;
    let color = '';
    if (DiasTranscurridos < colorRojo && DiasTranscurridos > colorVerde) {
      color = 'black';
    }
    else {
      color = 'white';
    }
    return color;
  }

  const renderTiempoAcreditacion = () => {
    return (
      <Form formData={dataRowEditNew} validationGroup="FormEdicion">
        <GroupItem itemType="group" colSpan={3} colCount={3} >
          <Item colSpan={3}>
            <AppBar
              position="static"
              className={classesEncabezado.secundario}
            >
              <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                <Typography
                  variant="h6"
                  color="inherit"
                  className={classesEncabezado.title}
                >
                  {intl.formatMessage({ id: "ADMINISTRATION.REQUEST.ACCREDITATION.TIME" })}
                </Typography>
              </Toolbar>
            </AppBar>
          </Item>
          <Item
            dataField="FechaSolicitud"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.REQUEST.ACCREDITATION.STARTDATE" }) }}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy HH:mm",
              readOnly: true
            }}
          />
          <Item
            dataField="FechaAprobacion"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.REQUEST.ACCREDITATION.APPROVAL.DATE" }) }}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy HH:mm",
              readOnly: true
            }}
          />
          <Item
            dataField="FechaProcesado"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.REQUEST.ACCREDITATION.DATE.PROCESS" }) }}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy HH:mm",
              readOnly: true
            }}
          />
          <Item
            dataField="TiempoAcreditacion"
            label={{ text: intl.formatMessage({ id: "ACCREDITATION.TIME" }) }}
            editorOptions={{
              readOnly: true,
              inputAttr: { 'style': 'background-color: ' + retornaColor() + ' ;color: ' + retornaColorTexto() + '' }
            }}
          />
          <Item />
        </GroupItem>
      </Form>
    )
  };



  return (
    <Popup
      visible={showPopup.isVisiblePopUp}
      dragEnabled={false}
      closeOnOutsideClick={false}
      //showTitle={false}
      height={"540px"}
      width={"1100px"}
      //title={paintTitle()}
      titleRender={paintTitle}
      onHiding={() => showPopup.setisVisiblePopUp(!showPopup.isVisiblePopUp)}
    >
      <div style={{ overflowY: "auto", height: "99%" }}>

        <ScrollView id="scroll">

          <div className="content">
            <div className="row">
              <div className="col-12">
                <PortletHeader classNameHead={"title-estado-general-row"} />

                <PortletBody>
                  <RequestStructurePopup
                    steps={steps}
                    validateFormDataByStepNumber={validateFormDataByStepNumber}
                    eventReturnHome={eventoRetornar}
                  >
                    <VisitaPersonaDatosGenerales
                      id={"CO_DatosGenerales"}
                      intl={intl}
                      dataRowEditNew={dataRowEditNew}
                      modoEdicion={modoEdicion}
                      colSpan={2}
                      colorRojo={colorRojo}
                      colorVerde={colorVerde}
                    />
                    <VisitaPersonaDatosPersonales
                      id={"CO_DatosPersonales"}
                      intl={intl}
                      dataRowEditNew={dataRowEditNew}
                      modoEdicion={modoEdicion}
                      tipoDocumentos={tipoDocumentos}
                      sexoSimple={sexoSimple}
                      permisosDatosPersona={permisosDatosPersona}
                    />
                    <VisitaPersonaDatosRequisitos
                      id={"CO_DatosRequisitos"}
                      intl={intl}
                      setLoading={setLoading}
                      dataRowEditNew={dataRowEditNew}
                      modoEdicion={modoEdicion}
                      optRequisito={optRequisito}
                      personaRequisitos={personaRequisitos}
                      setpersonaRequisitos={setpersonaRequisitos}
                      visita={dataRowEditNew}
                      configuracionPeso={{ Valor1: 8 }}
                      setOptRequisito={setOptRequisito}
                    />
                  </RequestStructurePopup>
                  <br></br>
                  {renderTiempoAcreditacion()}
                </PortletBody>

              </div>
            </div>
          </div>

        </ScrollView>
      </div>

    </Popup>
  );
};

export default VisitaListPageDetallePopup;
