import React, { Fragment, useEffect, useState } from "react";
import RequestStructure from "../../../../../../../partials/content/Acreditacion/RequestStructure/RequestStructure";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import VisitaProgramacionPage from "./VisitaProgramacionPage";
import VisitaPersonaPage from "./VisitaPersonaPage";
import VisitaRequisitosPage from "./VisitaRequisitosPage";
import { dateFormat, isNotEmpty } from "../../../../../../../../_metronic";

const VisitaEditPage = ({
  dataRowEditNew = {},
  modoEdicion = false,

  centrosCostos = [],
  unidadesOrganizativas = [],
  perfilesAcreditacion = [],
  companias = [],
  tipoDocumentos = [],
  sexoSimple = [],
  personDataValidationRules = [],
  configuracion,
  configuracionPeso,
  setDataRowEditNew,
  cancelarEdicion = () => {},
  eventRetornar = () => {},
  loadDataByPerfil = () => {},
  loadCentroCostoByUnidadOrganizativa = () => {},
  loadTipoDocumentoByCompany = () => {},
  setLoading,
  intl,

  visitas,
  setVisitas,
  requisitos,
  personasRequisitos,
  setpersonasRequisitos,
  grabarSolicitudAvance
}) => {
  const perfil = useSelector(state => state.perfil.perfilActual);
  const usuario = useSelector(state => state.auth.user);

  const [headerDataVisits, setHeaderDataVisits] = useState([]);
  const [headerDataRequeriments, setHeaderDataRequeriments] = useState([]);
  const [formControlProgramacion, setFormControlProgramacion] = useState(null);
  const [formControlPersona, setFormControlPersona] = useState(null);
  const [formControlRequisito, setFormControlRequisito] = useState(null);
  const [viewCardVisita, setViewCardVisita] = useState(false);
  const stepEnableButton = 2;
  const steps = [
    {
      id: "programacion",
      title: intl.formatMessage({ id: "ACCREDITATION.VISIT.TAB1" })
    },
    {
      id: "personas",
      title: intl.formatMessage({ id: "ACCREDITATION.VISIT.TAB2" })
    },
    {
      id: "requisitos",
      title: intl.formatMessage({ id: "ACCREDITATION.VISIT.TAB3" })
    }
  ];

  const guardarAvance = () => {
    console.log("guardarAvance");
    console.log({ dataRowEditNew, visitas, personasRequisitos, requisitos });

    //Datos de Solicitud:
    let solicitud = {
      IdCompaniaMandante: dataRowEditNew.IdCompania,
      IdDivision: perfil.IdDivision,
      IdUnidadOrganizativa: dataRowEditNew.IdUnidadOrganizativa,
      IdPerfil: dataRowEditNew.IdPerfil,
      IdPersonaVisitada: dataRowEditNew.IdPersona,
      IdCentroCosto: dataRowEditNew.IdCentroCosto,
      Motivo: dataRowEditNew.Motivo,
      FechaInicio: dateFormat(dataRowEditNew.FechaFin, "yyyyMMdd"),
      FechaFin: dateFormat(dataRowEditNew.FechaInicio, "yyyyMMdd")
    };

    console.log({ solicitud });
    let datosPersona = [];

    for (let i = 0; i < visitas.length; i++) {
      let persona = {
        IdCliente: perfil.IdCliente,
        IdSolicitud: 0,
        IdPersona: visitas[i].IdPersona,
        Nombre: visitas[i].Nombre,
        Apellido: visitas[i].Apellido,
        Direcccion: visitas[i].Direcccion,
        IdTipoDocumento: visitas[i].IdTipoDocumento,
        Documento: visitas[i].Documento,
        Sexo: visitas[i].Sexo,
        FechaNacimiento: dateFormat(visitas[i].FechaNacimiento, "yyyyMMdd"),
        TelefonoMovil: visitas[i].TelefonoMovil,
        Email: visitas[i].Email,
        Direccion: visitas[i].Direccion,
        Foto: ""
      };
      datosPersona.push(persona);
    }
    console.log({ datosPersona });

    let requisitosPersona = [];

    for (let i = 0; i < personasRequisitos.length; i++) {
      //Documento: "46659778"
      for (let j = 0; j < personasRequisitos[i].Requisitos.length; j++) {
        let requisito = personasRequisitos[i].Requisitos[j];
        let persona = datosPersona.find(
          x => x.Documento === personasRequisitos[i].Documento
        );
        console.log("Persona con requisito encontrada", { persona, requisito });
        if (requisito.Tipo !== "G") {
          let valor = requisito[requisito.Index];

          //let valor = props.dataRowEditRequisitos[x.Index];
          if (requisito.Tipo === "F") {
            valor = isNotEmpty(valor) ? dateFormat(valor, "yyyyMMdd") : "";
          }

          requisitosPersona.push({
            IdCliente: perfil.IdCliente,
            IdSolicitud: 0,
            Documento: persona.Documento,
            IdPersona: persona.IdPersona,
            IdDatoEvaluar: requisito.Value,
            TipoRequisito: requisito.Tipo,
            Valor: isNotEmpty(valor) ? valor.toUpperCase() : "",
            Observacion: "",
            NombreArchivo: "",
            EstadoAprobacion: "I"
          });
        }
      }
    }
    console.log({ requisitosPersona });

    grabarSolicitudAvance({
      solicitud,
      datosPersona,
      requisitosPersona,
      estadoAprobacion: "P"
    });
  };

  const validateDataProgramacion = () => {
    let {
      IdCompania,
      IdPersona,
      IdPerfil,
      IdUnidadOrganizativa,
      IdCentroCosto,
      FechaInicio,
      FechaFin,
      Motivo
    } = dataRowEditNew;

    let isValidate =
      isNotEmpty(IdCompania) &&
      isNotEmpty(IdPersona) &&
      isNotEmpty(IdPerfil) &&
      isNotEmpty(IdUnidadOrganizativa) &&
      isNotEmpty(IdCentroCosto) &&
      isNotEmpty(FechaInicio) &&
      isNotEmpty(FechaFin) &&
      isNotEmpty(Motivo);

    return isValidate;
  };
  const validateDataVisitas = () => {
    if (visitas !== null && visitas.length > 0) {
      let validar = false;
      let datosMensaje = [];
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
      for (let i = 0; i < visitas.length; i++) {
        let visita = visitas[i];
        let mensajes = [];
        for (let i = 0; i < nombreCampos.length; i++) {
          let campo = nombreCampos[i];
          let valorCampo = visita[nombreCampos[i]];
          let datos = personDataValidationRules.find(
            x => x.IdDato.toUpperCase() === campo.toUpperCase()
          );

          if (!!datos) {
            let esObligado = datos.Obligatorio === "S";
            if (esObligado) {
              if (!isNotEmpty(valorCampo)) {
                bloqueValidado = false;
                mensajes.push({ campo, msj: `${datos.Dato}` });
              }
            }
          }
        }
        datosMensaje.push({ Documento: visita.Documento, mensajes });
      }

      return {
        correcto: bloqueValidado,
        mensaje: datosMensaje
      };
    } else {
      return {
        correcto: false,
        mensaje: [{ campo: "", msj: "Sin visitas agregadas" }]
      };
    }
  };

  const validateDataRequisitos = () => {
    let isValidate = true;

    for (let i = 0; i < visitas.length; i++) {
      let tmpRequisitos = personasRequisitos.find(
        x => x.Documento === visitas[i].Documento
      );
      if (!!tmpRequisitos) {
        for (let j = 0; j < tmpRequisitos.Requisitos.length; j++) {
          let x = tmpRequisitos.Requisitos[j];
          if (x.Tipo !== "G") {
            if (!isNotEmpty(x[x.Index])) {
              return false;
            } else {
              //Valida archivo:
              if (x.AdjuntarArchivo === "S") {
                let inputFile = document.getElementById(`btn_${x.Index}`);
                //Solo valida si es nuevo:
                if (inputFile.files.length === 0 && x.NombreArchivo == "") {
                  return false;
                }
              }
            }
          }
        }
      }
    }

    return true;
  };

  const validateFormDataByStepNumber = currentStep => {
    let isValidate = false;
    let message = "";
    if (modoEdicion) {
      if (currentStep == 0) {
        if (dataRowEditNew.esNuevoRegistro) {
          isValidate = validateDataProgramacion();
          if (!isValidate) {
            formControlProgramacion.validate();
            message = intl.formatMessage({ id: "MESSAGES.REQUIRED" });
          } else {
            let { FechaInicio, FechaFin } = dataRowEditNew;
            if (
              Date.parse(new Date(FechaInicio)).toLocaleString() >=
              Date.parse(new Date(FechaFin)).toLocaleString()
            ) {
              message = intl.formatMessage({ id: "MESSAGES.DATE" });
              isValidate = false;
            } /*else if(){
              //aca se debe agregar la validacion de maximo dias de permanencia
            }*/
          }
        } else {
          return { isValidate: true, message: "" };
        }
      }

      if (currentStep == 1) {
        if (dataRowEditNew.esNuevoRegistro) {
          let { correcto, mensaje } = validateDataVisitas();

          if (!correcto) {
            formControlPersona.validate();
          }
          return {
            isValidate: correcto,
            message: "Debe ingresar todos los datos para la visita"
          };
        } else {
          return { isValidate: true, message: "" };
        }
      }

      if (currentStep == 2) {
        if (dataRowEditNew.esNuevoRegistro) {
          isValidate = validateDataRequisitos();
          if (!isValidate) {
            formControlRequisito.validate();
            message = intl.formatMessage({ id: "MESSAGES.REQUIRED.ADJ" });
          }
        } else {
          return { isValidate: true, message: "" };
        }
      }
    } else {
      return { isValidate: true, message: "" };
    }
    return { isValidate, message };
  };

  const [Compania, setCompania] = useState(
    perfil.Compania === "" ? "[PENDIENTE]" : perfil.Compania
  );

  const agregarPersona = () => {
    setViewCardVisita(true);
  };

  const onValueChangedCompany = idcompania => {
    loadTipoDocumentoByCompany(idcompania);
    let companyFound = companias.find(x => x.IdCompania === idcompania);

    if (!!companyFound) setCompania(companyFound.Compania);
  };

  useEffect(() => {
    if (!modoEdicion) {
      console.log("No es modo edicion");
      if (!dataRowEditNew.esNuevoRegistro && headerDataVisits.length === 0) {
        console.log("No es nuevo y no existe cabecera de visitas ", {
          visitas
        });

        setHeaderDataVisits(
          visitas.map(x => ({
            id: `${x.Documento}`,
            nombre: () => (
              <>
                {x.TipoDocumento}
                <br />
                {x.Documento}
              </>
            ),
            buttonDelete: false,
            icon: ""
          }))
        );

        setHeaderDataRequeriments(
          visitas.map(x => ({
            id: `${x.Documento}`,
            nombre: () => <span title="Requisitos"> {x.Documento} </span>,
            buttonDelete: false,
            icon: "dx-icon-folder"
          }))
        );
      }
    }
  }, [modoEdicion]);

  return (
    <Fragment>
      <RequestStructure
        steps={steps}
        dataRowEditNew={dataRowEditNew}
        CompanyName={""}//Compania
        DivisionName={""} //perfil.Division
        isEditMode={false}
        stepEnableButton={stepEnableButton}
        eventSaveProgress={guardarAvance}
        eventCancelEdit={cancelarEdicion}
        validateFormDataByStepNumber={validateFormDataByStepNumber}
        eventReturnHome={eventRetornar}
        setLoading={setLoading}
        //Metodos agregados para validar el boton agregar
        //viewAdd={modoEdicion && dataRowEditNew.esNuevoRegistro}
        //activeButtonAdd={1}
        eventAdd={""}
      >
        <VisitaProgramacionPage
          formControl={formControlProgramacion}
          setFormControl={setFormControlProgramacion}
          dataRowEditNew={dataRowEditNew}
          setDataRowEditNew={setDataRowEditNew}
          intl={intl}
          setLoading={setLoading}
          centrosCostos={centrosCostos}
          unidadesOrganizativas={unidadesOrganizativas}
          perfilesAcreditacion={perfilesAcreditacion}
          companias={companias}
          loadDataByPerfil={loadDataByPerfil}
          loadCentroCostoByUnidadOrganizativa={
            loadCentroCostoByUnidadOrganizativa
          }
          modoEdicion={modoEdicion}
          onValueChangedCompany={onValueChangedCompany}
          setCompania={setCompania}
        />
        <VisitaPersonaPage
          formControl={formControlPersona}
          setFormControl={setFormControlPersona}
          dataRowEditNew={dataRowEditNew}
          intl={intl}
          modoEdicion={modoEdicion}
          tipoDocumentos={tipoDocumentos}
          sexoSimple={sexoSimple}
          personDataValidationRules={personDataValidationRules}
          setLoading={setLoading}
          configuracion={configuracion}
          viewCardVisita={viewCardVisita}
          setViewCardVisita={setViewCardVisita}
          visitas={visitas}
          setVisitas={setVisitas}
          requisitos={requisitos}
          personasRequisitos={personasRequisitos}
          setpersonasRequisitos={setpersonasRequisitos}
          headerDataVisits={headerDataVisits}
          setHeaderDataVisits={setHeaderDataVisits}
          setHeaderDataRequeriments={setHeaderDataRequeriments}
        />
        <VisitaRequisitosPage
          formControl={formControlRequisito}
          setFormControl={setFormControlRequisito}
          dataRowEditNew={dataRowEditNew}
          intl={intl}
          setLoading={setLoading}
          modoEdicion={modoEdicion}
          requisitos={requisitos}
          visitas={visitas}
          personasRequisitos={personasRequisitos}
          setpersonasRequisitos={setpersonasRequisitos}
          headerDataVisits={headerDataRequeriments}
          setHeaderDataVisits={setHeaderDataRequeriments}
          headerDataRequeriments={headerDataRequeriments}
          configuracionPeso={configuracionPeso} 
        />
      </RequestStructure> 
    </Fragment>
  );
};

export default VisitaEditPage;
