import React, { Fragment, useState, useEffect } from "react";
import ValidationGroup from "devextreme-react/validation-group";

import { Popup } from "devextreme-react/popup";
import { Button } from "devextreme-react";
import { Portlet, PortletHeader, PortletHeaderToolbar } from "../../Portlet";

import VisitStructure from "./VisitStructure";
import VisitStructurePopup from "./VisitStructurePopup";
import notify from "devextreme/ui/notify";
import { isNotEmpty } from "../../../../../_metronic";

const CardVisits = ({
  modoEdicion,
  intl,
  showPopup,
  tipoDocumentos,
  sexoSimple,
  personDataValidationRules = [],
  eventAddData = () => {},
  height = "600px",
  width = "550px",
  configuracion
}) => {
  const [componentForm, setComponentForm] = useState(null);
  const [dataPersona, setDataPersona] = useState({ Foto: "" });
  const validateRowEditPersona = dataPersona => {
    let mensajes = [];
    let nombreCampos = [
      "IdTipoDocumento",
      "Documento",
      "Apellido",
      "Nombre",
      "Direccion",
      "FechaNacimiento",
      "Sexo",
      "TelefonoMovil",
      "Email"
    ];

    let bloqueValidado = true;

    for (let i = 0; i < nombreCampos.length; i++) {
      let campo = nombreCampos[i];
      let valorCampo = dataPersona[nombreCampos[i]];
      let datos = personDataValidationRules.filter(
        x => x.IdDato.toUpperCase() === campo.toUpperCase()
      );

      if (datos.length > 0) {
        let esObligado = datos[0].Obligatorio === "S";
        if (esObligado) {
          if (!isNotEmpty(valorCampo)) {
            bloqueValidado = false;
            mensajes.push({ campo, msj: `${datos[0].Dato}` });
          }
        }
      }
    }
    /*********************************************************** */
    let FechaActual = new Date();
    if (bloqueValidado) {
      let edad =
        FechaActual.getFullYear() -
        new Date(dataPersona.FechaNacimiento).getFullYear();
      if (edad < configuracion.Valor1) {
        bloqueValidado = false;
        mensajes.push({
          campo: "Edad",
          msj: `La edad mínima permitida es de ${configuracion.Valor1}`
        });
      }
    }

    /*********************************************************** */
    return { bloqueValidado, mensajes };
  };

  const aceptar = () => {
    //Evento de validar :
    let isValidate = false;
    let array_mensajes = [];
    let message = "";

    console.log("aceptar", { dataPersona });
    if (!modoEdicion) {
      isValidate = true;
    } else {
      let { bloqueValidado, mensajes } = validateRowEditPersona(dataPersona);
      isValidate = bloqueValidado;
      array_mensajes = mensajes;
    }

    if (!isValidate) {
      componentForm.validate();
      message =
        intl.formatMessage({ id: "MESSAGES.REQUIRED.PERSONAL" }) +
        array_mensajes.map(x => x.msj).join(", ");

      const type = "error";
      const text = message;
      notify(text, type, 3000);
    } else {
      eventAddData(dataPersona);
    }
  };

  return (
    <Fragment>
      <Popup
        visible={showPopup.isVisiblePopUp}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={height}
        width={width}
        title={intl
          .formatMessage({ id: "ADMINISTRATION.VISIT.ADDVISIT" })
          .toUpperCase()}
        onHiding={() => showPopup.setisVisiblePopUp(!showPopup.isVisiblePopUp)}
      >
        <Portlet>
          <PortletHeader
            title={""}
            toolbar={
              <PortletHeaderToolbar>
                <Button
                  //icon="fa fa-save"
                  icon="todo"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.ACCEPT" })}
                  onClick={aceptar}
                  useSubmitBehavior={true}
                />
              </PortletHeaderToolbar>
            }
          />

          <ValidationGroup
            name="validateVisit"
            onInitialized={e => {
              if (e.component !== null && componentForm === null) {
                setComponentForm(e.component);
              }
            }}
          >
            <VisitStructurePopup
              dataPersona={dataPersona}
              setDataPersona={setDataPersona}
              modoEdicion={modoEdicion}
              tipoDocumentos={tipoDocumentos}
              sexoSimple={sexoSimple}
              personDataValidationRules={personDataValidationRules}
              intl={intl}
              mode={"popup"}
              configuracion={configuracion}
            />
          </ValidationGroup>
        </Portlet>
      </Popup>
    </Fragment>
  );
};

export default CardVisits;
