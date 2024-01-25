import React from "react";
//import { useSelector } from "react-redux";
import ImageViewer from "../../ImageViewer/ImageViewer";
import DateBoxItem from "../Inputs/DateBox";
import ListBoxItem from "../Inputs/ListBox";
import TextBoxItem from "../Inputs/TextBox";

import { PatterRuler } from "../../../../../_metronic";
//import { useVisit } from "./useVisit";
import { useVisitArray } from "./useVisitArray";

const VisitStructure = ({
  nroDocumento,
  visits,
  setVisits,
  modoEdicion,
  tipoDocumentos,
  sexoSimple,
  configuracion,
  intl,
  personDataValidationRules = []
}) => {
  const {
    //Variables para el formulario:
    dataPersona,
    maxLengthDocumento,
    reglas,
    //currentImagePersona,
    mascara,
    //Funciones para validar formulario:
    isRequiredAccreditation,
    isModifiedAccreditation,
    onValueChangedTipoDocumento,
    cargarFotoSeleccionada,
    onEnterDocumento,
    onValueChangedFechaNacimiento
  } = useVisitArray({
    nroDocumento,
    visits,
    setVisits,
    personDataValidationRules,
    modoEdicion,
    tipoDocumentos,
    configuracion
  });


  return (
    <div>
      <div className="row">
        <div className="col-9">
          <div className="row">
            <ListBoxItem
              label={intl.formatMessage({
                id: "ADMINISTRATION.PERSON.DOCUMENT.TYPE"
              })}
              displayValue="IdTipoDocumento"
              displayText="TipoDocumento"
              elements={dataPersona}
              dataSource={tipoDocumentos}
              isRequired={isRequiredAccreditation("TIPODOCUMENTO")}
              textOnly={false}
              readOnly={
                !modoEdicion ? true : !isModifiedAccreditation("TIPODOCUMENTO")
              }
              onChange={onValueChangedTipoDocumento}
              colSpan={6}
            />
            <TextBoxItem
              label={intl.formatMessage({
                id: "ADMINISTRATION.PERSON.DOCUMENT"
              })}
              name="Documento"
              elements={dataPersona}
              isRequired={isRequiredAccreditation("DOCUMENTO")}
              maxLength={maxLengthDocumento}
              readOnly={
                !modoEdicion ? true : !isModifiedAccreditation("DOCUMENTO")
              }
              mask={mascara}
              onEnterKey={onEnterDocumento}
              ruleName={reglas}
              ruleMessage={"Valor incorrecto"}
              colSpan={6}
            />
            <TextBoxItem
              label={intl.formatMessage({
                id: "ADMINISTRATION.PERSON.SURNAMES"
              })}
              name="Apellido"
              elements={dataPersona}
              isRequired={isRequiredAccreditation("APELLIDO")}
              readOnly={
                !modoEdicion ? true : !isModifiedAccreditation("APELLIDO")
              }
              maxLength={50}
              ruleName={PatterRuler.LETRAS_DESCRIPCION}
              ruleMessage={intl.formatMessage({
                id: "COMMON.ENTER.LETTERS"
              })}
              colSpan={6}
            />
            <TextBoxItem
              label={intl.formatMessage({
                id: "ADMINISTRATION.PERSON.NAME"
              })}
              name="Nombre"
              elements={dataPersona}
              //isRequired={isRequiredAccreditation("NOMBRE")}
              maxLength={50}
              readOnly={
                !modoEdicion ? true : !isModifiedAccreditation("NOMBRE")
              }
              ruleName={PatterRuler.LETRAS_DESCRIPCION}
              ruleMessage={intl.formatMessage({id: "COMMON.ENTER.LETTERS"})}
              colSpan={6}
            />

            <DateBoxItem
              label={intl.formatMessage({
                id: "ACCREDITATION.EDIT.BIRTHDAY"
              })}
              name="FechaNacimiento"
              elements={dataPersona}
              isRequired={isRequiredAccreditation("FECHANACIMIENTO")}
              readOnly={!modoEdicion? true : !isModifiedAccreditation("FECHANACIMIENTO")
              }
              onChange={onValueChangedFechaNacimiento}
              min={new Date(1950, 1, 1)}
              colSpan={6}
            />

            <TextBoxItem
              label={intl.formatMessage({ id: "ADMINISTRATION.PERSON.AGE" })}
              name="Edad"
              elements={dataPersona}
              readOnly={true}
              colSpan={6}
            />

            <ListBoxItem
              label={intl.formatMessage({id: "ADMINISTRATION.PERSON.GENDER"})}
              dataName="Sexo"
              displayValue="Valor"
              displayText="Descripcion"
              elements={dataPersona}
              dataSource={sexoSimple}
              isRequired={isRequiredAccreditation("SEXO")}
              readOnly={!modoEdicion ? true : !isModifiedAccreditation("SEXO")}
              colSpan={6}
            />

            <TextBoxItem
              label={intl.formatMessage({
                id: "ADMINISTRATION.PERSON.MOBILE.PHONE"
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
              colSpan={6}
            />
          </div>
        </div>
        <div className="col-3">
          <ImageViewer
            setImagedLoad={cargarFotoSeleccionada}
            defaultImage={dataPersona.Foto}
            width={150}
            height={150}
            intl={intl}
            styleConteiner={{ padding: "5px" }}
            orientation={"H"}
            editImage={false}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-9">
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
              colSpan={6}
            />

            <TextBoxItem
              label={intl.formatMessage({
                id: "ADMINISTRATION.PERSON.ADDRESS"
              })}
              name="Direccion"
              elements={dataPersona}
              // customStyle={{ width: "164%", position: "absolute" }}
              isRequired={isRequiredAccreditation("DIRECCION")}
              maxLength={500}
              readOnly={  !modoEdicion ? true : !isModifiedAccreditation("DIRECCION")
              }
              colSpan={6}
            />
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default VisitStructure;
