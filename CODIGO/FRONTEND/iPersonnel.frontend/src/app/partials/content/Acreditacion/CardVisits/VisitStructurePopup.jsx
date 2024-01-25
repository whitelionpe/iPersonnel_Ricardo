import React, { Fragment, useState, useEffect } from "react";
import { useSelector } from "react-redux";

import ImageViewer from "../../ImageViewer/ImageViewer";
import DateBoxItem from "../Inputs/DateBox";
import ListBoxItem from "../Inputs/ListBox";
import TextBoxItem from "../Inputs/TextBox";

import { PatterRuler } from "../../../../../_metronic";
import { useVisit } from "./useVisit";

const VisitStructurePopup = ({
  dataPersona,
  setDataPersona,

  modoEdicion,
  tipoDocumentos,
  sexoSimple,
  configuracion,
  intl,
  personDataValidationRules = []
}) => {
  const {
    //Variables para el formulario:
    //dataPersona,
    forceDisabled,
    maxLengthDocumento,
    reglas,
    currentImagePersona,
    mascara,
    //Funciones para validar formulario:
    isRequiredAccreditation,
    isModifiedAccreditation,
    onValueChangedTipoDocumento,
    cargarFotoSeleccionada,
    onEnterDocumento,
    onValueChangedFechaNacimiento
  } = useVisit({
    dataPersona,
    setDataPersona,
    personDataValidationRules,
    modoEdicion,
    tipoDocumentos,
    configuracion
  });

  return (
    <div>
      <div className="row">
        <div className="col-7">
          <div className="row">
            <ListBoxItem
              label={intl.formatMessage({
                id: "ADMINISTRATION.PERSON.DOCUMENT.TYPE"
              })}
              displayValue="IdTipoDocumento"
              displayText="Alias"
              elements={dataPersona}
              dataSource={tipoDocumentos}
              isRequired={isRequiredAccreditation("TIPODOCUMENTO")}
              textOnly={false}
              readOnly={
                !modoEdicion ? true : !isModifiedAccreditation("TIPODOCUMENTO")
              }
              onChange={onValueChangedTipoDocumento}
              colSpan={12}
              disabled={forceDisabled}
            />
            <TextBoxItem
              label={intl.formatMessage({
                id: "ADMINISTRATION.PERSON.DOCUMENT"
              })}
              name="Documento"
              elements={dataPersona}
              isRequired={isRequiredAccreditation("DOCUMENTO")}
              colSpan={12}
              maxLength={maxLengthDocumento}
              readOnly={
                !modoEdicion ? true : !isModifiedAccreditation("DOCUMENTO")
              }
              mask={mascara}
              onEnterKey={onEnterDocumento}
              ruleName={reglas}
              ruleMessage={"Valor incorrecto"}
              disabled={forceDisabled}
            />
          </div>
          <div className="row">
            <TextBoxItem
              label={intl.formatMessage({
                id: "ADMINISTRATION.PERSON.SURNAMES"
              })}
              name="Apellido"
              elements={dataPersona}
              colSpan={12}
              isRequired={isRequiredAccreditation("APELLIDO")}
              readOnly={
                !modoEdicion ? true : !isModifiedAccreditation("APELLIDO")
              }
              maxLength={50}
              ruleName={PatterRuler.LETRAS_DESCRIPCION}
              ruleMessage={intl.formatMessage({
                id: "COMMON.ENTER.LETTERS"
              })}
              disabled={forceDisabled}
            />
            <TextBoxItem
              label={intl.formatMessage({
                id: "ADMINISTRATION.PERSON.NAME"
              })}
              name="Nombre"
              elements={dataPersona}
              isRequired={isRequiredAccreditation("NOMBRE")}
              colSpan={12}
              maxLength={50}
              readOnly={
                !modoEdicion ? true : !isModifiedAccreditation("NOMBRE")
              }
              ruleName={PatterRuler.LETRAS_DESCRIPCION}
              ruleMessage={intl.formatMessage({
                id: "COMMON.ENTER.LETTERS"
              })}
              disabled={forceDisabled}
            />
          </div>
        </div>
        <div className="col-5">
          <ImageViewer
            setImagedLoad={cargarFotoSeleccionada}
            defaultImage={dataPersona.Foto}
            // setFlUpdate={setFlUpdateImage}
            // flUpdate={flUpdate}
            width={150}
            height={150}
            intl={intl}
            styleConteiner={{ padding: "5px" }}
            orientation={"H"}
          />
        </div>
      </div>

      <div className="row">
        <DateBoxItem
          label={intl.formatMessage({
            id: "ACCREDITATION.EDIT.BIRTHDAY"
          })}
          name="FechaNacimiento"
          elements={dataPersona}
          isRequired={isRequiredAccreditation("FECHANACIMIENTO")}
          readOnly={
            !modoEdicion ? true : !isModifiedAccreditation("FECHANACIMIENTO")
          }
          onChange={onValueChangedFechaNacimiento}
          min={new Date(1950, 1, 1)}
          disabled={forceDisabled}
          colSpan={7}
        />

        <TextBoxItem
          label={intl.formatMessage({ id: "ADMINISTRATION.PERSON.AGE" })}
          name="Edad"
          elements={dataPersona}
          readOnly={true}
          disabled={forceDisabled}
          colSpan={5}
        />
      </div>
      <div className="row">
        <ListBoxItem
          label={intl.formatMessage({
            id: "ADMINISTRATION.PERSON.GENDER"
          })}
          dataName="Sexo"
          displayValue="Valor"
          displayText="Descripcion"
          elements={dataPersona}
          dataSource={sexoSimple}
          isRequired={isRequiredAccreditation("SEXO")}
          readOnly={!modoEdicion ? true : !isModifiedAccreditation("SEXO")}
          colSpan={7}
          disabled={forceDisabled}
        />

        <TextBoxItem
          label={intl.formatMessage({
            id: "ADMINISTRATION.VISIT.MOBILE.PHONE"
          })}
          name="TelefonoMovil"
          elements={dataPersona}
          isRequired={isRequiredAccreditation("TELEFONOMOVIL")}
          maxLength={20}
          readOnly={
            !modoEdicion ? true : !isModifiedAccreditation("TELEFONOMOVIL")
          }
          ruleName={PatterRuler.SOLO_NUMEROS}
          ruleMessage={intl.formatMessage({
            id: "COMMON.ENTER.NUMERIC.DATA"
          })}
          colSpan={5}
          disabled={forceDisabled}
        />
      </div>

      <div className="row">
        <TextBoxItem
          label={intl.formatMessage({
            id: "ADMINISTRATION.PERSON.MAIL"
          })}
          name="Email"
          elements={dataPersona}
          isRequired={isRequiredAccreditation("EMAIL")}
          maxLength={50}
          readOnly={!modoEdicion ? true : !isModifiedAccreditation("EMAIL")}
          isEmailRule={true}
          ruleMessage={intl.formatMessage({
            id: "MESSAGES.INVALID.EMAIL"
          })}
          colSpan={12}
          disabled={forceDisabled}
        />
      </div>

      <div className="row">
        <TextBoxItem
          label={intl.formatMessage({
            id: "ADMINISTRATION.PERSON.ADDRESS"
          })}
          name="Direccion"
          elements={dataPersona}
          // customStyle={{ width: "164%", position: "absolute" }}
          isRequired={isRequiredAccreditation("DIRECCION")}
          maxLength={500}
          readOnly={!modoEdicion ? true : !isModifiedAccreditation("DIRECCION")}
          colSpan={12}
          disabled={forceDisabled}
        />
      </div>
    </div>
  );
};

export default VisitStructurePopup;
