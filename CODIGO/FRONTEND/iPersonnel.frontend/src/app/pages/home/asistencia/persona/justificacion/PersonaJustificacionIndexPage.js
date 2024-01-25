import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";
import { addDaysToDate, dateFormat, getDateOfDay, isNotEmpty, TYPE_IDENTIFICACION_TIPOIDENTIFICACION } from "../../../../../../_metronic";
import { handleErrorMessages, handleInfoMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";
import { uploadFile } from "../../../../../api/helpers/fileBase64.api";
import { listar, obtener as ObtenerPersonaJusti } from "../../../../../api/asistencia/personaJustificacionDia.api";
import { crear, actualizar, eliminar, validar, obtenerResumen } from "../../../../../api/asistencia/personaJustificacion.api";
import PersonaJustificacionEditPage from "./PersonaJustificacionEditPage";
import PersonaJustificacionListPage from "./PersonaJustificacionListPage";
import Confirm from "../../../../../partials/components/Confirm";
import { obtenerTodos as obtenerHD } from "../../../../../api/asistencia/horarioDia.api";
import { horarioActual, horarioDiaBase } from "../../../../../api/asistencia/personaHorario.api";
import { obtener as obtenerJusti } from "../../../../../api/asistencia/justificacion.api";
import { servicePersonaGrupo } from "../../../../../api/asistencia/personaGrupo.api";

import { obtenerTodos as obtenerTipoIdentificacion } from "../../../../../api/identificacion/tipoIdentificacion.api";

import { crear as crearMarca } from "../../../../../api/asistencia/marcacion.api";

const PersonaJustificacionIndexPage = (props) => {

  const usuario = useSelector(state => state.auth.user);
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  const perfil = useSelector((state) => state.perfil.perfilActual);
  const { intl, setLoading, settingDataField, getInfo, accessButton, varIdPersona, selectedIndex, getInfoJustificacion, varIdCompania, idAplicacion, idMenu, idModulo } = props;
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [dataAppoinment, setDataAppoinment] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [lisJustificacionDias, setlisJustificacionDias] = useState([]);
  const [listarHorarioDia, setListarHorarioDia] = useState([]);

  const [varFechaAsistencia, setVarFechaAsistencia] = useState("");

  const [personaPlanilla, setPersonaPlanilla] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [, setInstance] = useState({});
  const [rangeDay, setRangeDay] = useState({});

  const [dataResumen, setDataResumen] = useState(null);
  const [dataPersonaHorario, setDataPersonaHorario] = useState(null);

  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());

  const [dataZona, setDataZona] = useState([]);
  const [dataTipoIdentificacion, setDataTipoIdentificacion] = useState([]);

  //>Horario Dia
  const [selected] = useState({});
  const [, setisVisiblePopUpHorarioDia] = useState(false);
  const [listarPopUpHorarioDia, setListarPopUpHorarioDia] = useState([]);
  //Validacion
  //const [personaHorario, setPersonaHorario] = useState({});

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const cargarDatos = (data) => {
    setDataRowEditNew(data);
  };

  //++++++Crear Nueva justificación+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++/
  async function agregarPersonaJustificacion(datarow) {
    setLoading(true);
    const { IdCompania, IdJustificacion, Observacion, NombreArchivo, FechaArchivo, FileBase64, Justificacion,
      FechaInicio, FechaFin, FechaAsistencia, FechaHoraInicio, FechaHoraFin, DiaCompleto, Activo, CompensarHorasExtras,
      CompensarHEPorPagar, Turno,
      EsSubsidio,
      EnfermedadInicio,
      EnfermedadFin,
      CertificadoInicio 
    } = datarow;

    let params = {
      IdCliente
      , IdPersona: varIdPersona
      , IdCompania: isNotEmpty(IdCompania) ? IdCompania : ""
      , IdJustificacion: isNotEmpty(IdJustificacion) ? IdJustificacion : ""
      , IdSecuencialJustificacion: 0
      , Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : ""
      , NombreArchivo: isNotEmpty(NombreArchivo) ? NombreArchivo : ""
      , IdItemSharepoint: ""
      , FechaArchivo: isNotEmpty(FechaArchivo) ? FechaArchivo : ""
      , FileBase64: isNotEmpty(FileBase64) ? FileBase64 : ""
      , ClaseArchivo: isNotEmpty(Justificacion) ? Justificacion : ""
      , FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd')
      , FechaFin: dateFormat(FechaFin, 'yyyyMMdd')
      , Turno
      //Detalle -- PersonaJustificacionDia
      , DiaCompleto: DiaCompleto
      , FechaAsistencia: dateFormat(FechaAsistencia, 'yyyyMMdd')
      , FechaHoraInicio: dateFormat(FechaHoraInicio, "yyyyMMdd hh:mm")
      , FechaHoraFin: dateFormat(FechaHoraFin, "yyyyMMdd hh:mm")
      , Activo: Activo
      , CompensarHorasExtras: CompensarHorasExtras
      , CompensarHEPorPagar: CompensarHEPorPagar
      , IdUsuario: usuario.username,
      PathFile: "",
      IdModulo: idModulo,
      IdAplicacion: idAplicacion,
      IdMenu: idMenu
      , EnfermedadInicio: EsSubsidio === "S" ? dateFormat(EnfermedadInicio, 'yyyyMMdd') : ''
      , EnfermedadFin: EsSubsidio === "S" ? dateFormat(EnfermedadFin, 'yyyyMMdd') : ''
      , CertificadoInicio: EsSubsidio === "S" ? dateFormat(CertificadoInicio, 'yyyyMMdd') : ''
      , IdDivision: perfil.IdDivision 
    };
    if (isNotEmpty(FileBase64)) {
      await uploadFile(params).then(response => {
        const { nombreArchivo,idItemSharepoint } = response;
        params.NombreArchivo = nombreArchivo;
        params.IdItemSharepoint = isNotEmpty(idItemSharepoint)?idItemSharepoint:'';
        crear(params)
          .then((response) => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            //listarJustificacionDia();
            setModoEdicion(false);
          })
          .catch((err) => {
            //handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            if (err.response.status == 400) {
              var msj = intl.formatMessage({ id: err.response.data.responseException.exceptionMessage });
              handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), msj, true)
            }
            else
              handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
          }).finally(() => { setLoading(false); });
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    } else {
      await crear(params)
        .then((response) => {
          if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
          //listarJustificacionDia();
          setModoEdicion(false);
        })
        .catch((err) => {
          if (err.response.status == 400) {
            var msj = intl.formatMessage({ id: err.response.data.responseException.exceptionMessage });
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), msj, true)
          }
          else
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)

        }).finally(() => { setLoading(false); });
    }
  }

  //++++++Obtener Horario Persona++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++/
  const obtenerPersonaHorario = async (fecha) => {
    setLoading(true);
    await horarioActual({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdPersona: varIdPersona,
      Fecha: dateFormat(fecha, 'yyyyMMdd')
    }).then(response => {
      setDataPersonaHorario(response);
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });
  }

  //++++++Actualizar Nueva justificación+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++/
  async function actualizarPersonaJustificacion(data) {
    setLoading(true);
    const { IdCliente, IdJustificacion, IdSecuencialJustificacion, Observacion,
      NombreArchivo, FechaArchivo, FileBase64, Justificacion, FechaAsistencia, FechaInicio, FechaFin, FechaHoraInicio,
      FechaHoraFin, DiaCompleto, Activo, CompensarHorasExtras, CompensarHEPorPagar, Turno,
      EsSubsidio,
      EnfermedadInicio,
      EnfermedadFin,
      CertificadoInicio,IdItemSharepoint
    } = data;
    let params = {
      IdCliente
      , IdPersona: varIdPersona
      , IdCompania: varIdCompania
      , IdJustificacion: isNotEmpty(IdJustificacion) ? IdJustificacion : ""
      , IdSecuencialJustificacion
      , Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : ""
      , NombreArchivo: isNotEmpty(NombreArchivo) ? NombreArchivo : ""
      , IdItemSharepoint: isNotEmpty(IdItemSharepoint) ? IdItemSharepoint : ""
      , FechaArchivo: isNotEmpty(FechaArchivo) ? FechaArchivo : ""
      , FileBase64: isNotEmpty(FileBase64) ? FileBase64 : ""
      , ClaseArchivo: isNotEmpty(Justificacion) ? Justificacion : ""
      , FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd')
      , FechaFin: dateFormat(FechaFin, 'yyyyMMdd')
      , Turno
      //Detalle -- PersonaJustificacionDia
      , DiaCompleto: DiaCompleto
      , FechaAsistencia: dateFormat(FechaAsistencia, 'yyyyMMdd')
      , FechaHoraInicio: dateFormat(FechaHoraInicio, "yyyyMMdd hh:mm")
      , FechaHoraFin: dateFormat(FechaHoraFin, "yyyyMMdd hh:mm")
      , Activo
      , CompensarHorasExtras: CompensarHorasExtras
      , CompensarHEPorPagar: CompensarHEPorPagar
      , IdUsuario: usuario.username,
      PathFile: "",
      IdModulo: idModulo,
      IdAplicacion: idAplicacion,
      IdMenu: idMenu
      , EnfermedadInicio: EsSubsidio === "S" ? dateFormat(EnfermedadInicio, 'yyyyMMdd') : ''
      , EnfermedadFin: EsSubsidio === "S" ? dateFormat(EnfermedadFin, 'yyyyMMdd') : ''
      , CertificadoInicio: EsSubsidio === "S" ? dateFormat(CertificadoInicio, 'yyyyMMdd') : ''
      , IdDivision: perfil.IdDivision
    };

    if (isNotEmpty(FileBase64)) {
      //console.log("FileBase64", FileBase64);
      setLoading(true);
      await uploadFile(params).then(response => {
        const { nombreArchivo ,idItemSharepoint} = response;
        params.NombreArchivo = nombreArchivo;
        params.IdItemSharepoint = isNotEmpty(idItemSharepoint)?idItemSharepoint:'';
        actualizar(params)
          .then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            //listarJustificacionDia();
          })
          .catch((err) => {
            //handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            if (err.response.status == 400)
              handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: err.response.data.responseException.exceptionMessage }), true)
            else
              handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
          }).finally(() => { setLoading(false); });
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    } else {
      setLoading(true);
      await actualizar(params)
        .then(() => {
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
          setModoEdicion(false);
        })
        .catch((err) => {
          //handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err) 
          if (err.response.status == 400)
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: err.response.data.responseException.exceptionMessage }), true)
          else
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)

        }).finally(() => { setLoading(false); });
    }
  }

  const obtenerAsistenciaJustificacion = async (idJustificacion, personaHorario) => {

    setLoading(true);
    await obtenerJusti({
      IdCliente: perfil.IdCliente,
      IdCompania: varIdCompania,
      IdJustificacion: idJustificacion,
    }).then(data => {
      const { AplicaPorDia, AplicaPorHora, RequiereObservacion, RequiereAutorizacion } = data;
      let DiaCompleto = AplicaPorDia;
      const { HoraEntradaInicio, HoraEntradaFin, HoraSalidaFin, Turno } = personaHorario;
      const { Origen, TieneMarcas, TipoJustificacionInasistencia, TieneJustificacion } = dataRowEditNew;

      //Validamos si el turno es Nocturno
      let FechaHoraInicio = new Date(HoraEntradaInicio);
      let FechaHoraFin;
      //--->>Pero hay un inconveniente porque debe mostrar las horas hasta las 00hrs,y el dia siguiente hasta la hora salida en caso sea nocturno
      //----Variables involucradas HoraEntradaInicio HoraEntradaFin (hasta las 00hrs) y HoraSalidaInicio HoraSalidaFin(Desde las 00hrs)
      if (Turno === 'N') {
        //Agrega un dia  
        FechaHoraFin = addDaysToDate(new Date(HoraSalidaFin), 1);
      } else {
        FechaHoraFin = new Date(HoraEntradaFin);
      }

      //Validamos si el origen es una Incidencia, para mostrar la hora Inicio y fin del incidente.-->LSF
      if (Origen == 'INCIDENCIA') {
        if (isNotEmpty(dataRowEditNew.FechaHoraInicioLibre) && isNotEmpty(dataRowEditNew.FechaHoraFinLibre)) {
          FechaHoraInicio = dataRowEditNew.FechaHoraInicioLibre;
          FechaHoraFin = dataRowEditNew.FechaHoraFinLibre;
        } else {
          FechaHoraInicio = dataRowEditNew.HoraEntrada;
          FechaHoraFin = dataRowEditNew.HoraSalida;
        }

        //Validacion para indicar si la inasistencia tiene justificaciones previas, debe tratarse como una justificacion xHoras
        if (TipoJustificacionInasistencia === 'S' && TieneJustificacion === 'S') {
          DiaCompleto = 'N';
          data.AplicaPorDia = 'N';
        } else if (TipoJustificacionInasistencia === 'N') {//La incidencia no es una inasistencia,corresponde xHoras
          DiaCompleto = 'N';
          data.AplicaPorDia = 'N';
        }


      }

      //LSF-> Si el origen es una Incidencia, debe evaluar el tipo de incidneica
      /*
      --**Inasistencia**
      --Busqueda por Dia
      --Seleccionado Combo Por Dia : 'S'
      --ReadOnly : 'S'

      --**Tardanza**
      --Busqueda por Horas
      --Seleccionado Combo por Hora : 'S' [CompoPor Dia : 'N']
      --ReadOnly : 'S'

      --**Horas Intermedias**
      --Busqueda por Horas
      --Seleccionado Combo por Hora : 'S' [CompoPor Dia : 'N']
      --ReadOnly : 'S'
      
      -> Si es de otro Origen, debe seguir las validaciones existentes

      --> CONSIDERACIONES : 
      - Si tiene Justificaciones, debe ser por horas      | *Ojo para despues, validar que sean justificaciones en el horario de trabajo
      - Si No Tiene Justificaciones y Es Incidencia de Insistencia(xDia) , debe ser por dia y solo lectura
      - Si No Tiene Justificaciones y Es Incidencia de Tardanza o HorasIntermedia(xHora), debe ser por hora y solo Lectura
      - Si Es de Origen diferente al de Incidencia, no debe hacer nada | *Ojo para despues o consultar , validar que si existe justificaiones en el horario permita el check por dia
      
      -->Incidentes encontrados:
      - al realizar el cambio en el combo por dia debe retornar el valor de la hora inicio y fin

      */



      //JDL->
      setDataRowEditNew({
        ...dataRowEditNew, ...data, DiaCompleto,
        HoraEntradaInicio,
        HoraEntradaFin,
        HoraSalidaFin, Turno,
        FechaHoraInicio, FechaHoraFin
      });

    }).finally(() => { setLoading(false) });
  }

  const nuevoPersonaJustificacion = async () => {
    const { IdCliente, IdCompania, IdPersona, Compania } = selectedIndex;
    await obtenerPersonaHorario(dataRowEditNew.FechaInicio);

    let data = {
      IdCliente,
      IdDivision: perfil.IdDivision,
      IdCompania,
      IdPersona,
      Observacion: "",
      Activo: "S",
      Compania,
      FechaInicio: dataRowEditNew.FechaInicio,//dateFormat(dataRowEditNew.FechaInicio, 'yyyyMMdd'),
      FechaFin: dataRowEditNew.FechaFin,//dateFormat(dataRowEditNew.FechaFin, 'yyyyMMdd'),
      CompensarHorasExtras: "N",
      CompensarHEPorPagar: "N",
      Fecha: dateFormat(dataRowEditNew.FechaInicio, 'yyyyMMdd'),
      FechaHoraInicio: dataRowEditNew.FechaInicio,
      FechaHoraFin: dataRowEditNew.FechaInicio,
      FechaAsistencia: dataRowEditNew.FechaInicio,
      Evento: intl.formatMessage({ id: "ACREDITATION.NEW" }) + " " + intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION" }),
      Color: "Orange",
      Origen: "JUSTIFICACION",
      AplicaPorDia: "",
      EnfermedadInicio: dataRowEditNew.EnfermedadInicio,
      EnfermedadFin: dataRowEditNew.EnfermedadFin,
      CertificadoInicio: dataRowEditNew.CertificadoInicio,
    };
    setLoading(true);
    if (isNotEmpty(IdPersona)) {
      await validar({
        ...data, FechaInicio: dateFormat(dataRowEditNew.FechaInicio, 'yyyyMMdd'), //dataRowEditNew.FechaInicio
        FechaFin: dateFormat(dataRowEditNew.FechaFin, 'yyyyMMdd'),//dataRowEditNew.FechaFin
      }).then(response => {

        if (response[0][0].MensajeValidacion == '') {
          setDataRowEditNew({ ...data, esNuevoRegistro: true }); //, esEdicionRegistro: false 
          setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
          setModoEdicion(true);
        }
        else {
          handleInfoMessages(intl.formatMessage({ id: response[0][0].MensajeValidacion }));
        }

      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    }

  };

  const editarPersonaJustificacion = async (dataRow) => {
    setDataRowEditNew({});
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    await obtenerPersonaHorario(dataRow.FechaAsistencia);
    await obtenerPersonaJustificacionDia(dataRow);

    setModoEdicion(true);
  };

  const justificarIncidenciaPersonaJustificacion = async (appointmentData) => {
    const { IdCliente, IdCompania, IdPersona, Compania } = selectedIndex;

    await obtenerPersonaHorario(appointmentData.FechaAsistencia);

    let data = {
      IdCliente,
      IdDivision: perfil.IdDivision,
      IdCompania,
      IdPersona,
      Observacion: "",
      Activo: "S",
      Compania,
      FechaInicio: appointmentData.FechaAsistencia,//dateFormat(dataRowEditNew.FechaInicio, 'yyyyMMdd'),
      FechaFin: appointmentData.FechaAsistencia,//dateFormat(dataRowEditNew.FechaFin, 'yyyyMMdd'),
      CompensarHorasExtras: "N",
      CompensarHEPorPagar: "N",
      Fecha: dateFormat(appointmentData.FechaAsistencia, 'yyyyMMdd'),//dataRowEditNew.FechaInicio
      FechaHoraInicio: appointmentData.FechaAsistencia,//dataRowEditNew.FechaInicio
      FechaHoraFin: appointmentData.FechaAsistencia,//dataRowEditNew.FechaFin
      FechaAsistencia: appointmentData.FechaAsistencia,//dataRowEditNewFechaInicio
      Origen: appointmentData.Origen,
      IdEvento: appointmentData.IdEvento,
      Evento: appointmentData.Evento, //Puede ser tardanza o Inasistencia , u otro mas pero partimos con estos 2, luego cambiar al codigo 
      HoraEntrada: appointmentData.HoraEntrada,
      HoraSalida: appointmentData.HoraSalida,
      Color: appointmentData.color,
      AplicaPorDia: appointmentData.DiaCompleto,
      Saldo: appointmentData.Saldo,
      DuracionEvento: appointmentData.DuracionEvento,
      MostrarOpciones: appointmentData.MostrarOpciones
    };
    setLoading(true);
    if (isNotEmpty(IdPersona)) { //servicePersonaHorario.validarPersonaHorario(data)
      await validar({
        ...data, FechaInicio: dateFormat(appointmentData.FechaHoraInicio, 'yyyyMMdd'),
        FechaFin: dateFormat(appointmentData.FechaHoraFin, 'yyyyMMdd'),
        IdIncidencia: appointmentData.IdEvento,
      }).then(response => {
        let varFechaHoraInicioLibre = null;
        let varFechaHoraFinLibre = null;
        let varTipoJustificacionInasistencia = null;
        let varTieneJustificaciones = 'N';

        if (response[0][0].MensajeValidacion == '') {

          if (response[1].length > 0) {// Si hay justificaciones y si es Justificacion xDia, ahora debe ser por hora
            varTieneJustificaciones = 'S';
          }

          if (response[2].length > 0) {//Si hay Huecos --> Procede a seleccionar el hueco proximo | Observacion: si en un rango de fecha hay huecos de justificacion, deberia traer o mostrar el hueco correspondiente al día en especifico y marcarlo en la ventana de edicion
            varFechaHoraInicioLibre = response[2][0].FechaHoraInicioLibre;
            varFechaHoraFinLibre = response[2][0].FechaHoraFinLibre;
          }

          if (response[4].length > 0) { //Si es una Inasistencia--> se debe justificar por dias , de lo contrario para las demas incidencias son por horas
            varTipoJustificacionInasistencia = response[4][0].TipoJustificacionInasistencia;
          }

          //Si es una Justificacion de una Inasistencia y hay Justificaciones existentes, se deben cargar Justificaciones por Horas
          if (varTieneJustificaciones === 'S' && varTipoJustificacionInasistencia === 'S') {
            data.AplicaPorDia = 'N';
          }


          setDataRowEditNew({
            ...data, esNuevoRegistro: true,
            FechaHoraInicioLibre: varFechaHoraInicioLibre,
            FechaHoraFinLibre: varFechaHoraFinLibre,
            TipoJustificacionInasistencia: varTipoJustificacionInasistencia,
            TieneJustificacion: varTieneJustificaciones
          });

          setTitulo(intl.formatMessage({ id: "ACTION.JUSTIFICATE" }));
          setModoEdicion(true);
        }
        else {
          handleInfoMessages(intl.formatMessage({ id: response[0][0].MensajeValidacion }));
        }

      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    }
  };

  const obtenerResumenDia = async (fecha) => {
    if (!isNotEmpty(fecha)) return;
    setLoading(true);
    let array = [];
    setDataResumen([]);
    await obtenerResumen({
      IdDivision: perfil.IdDivision,
      IdCompania: varIdCompania,
      IdPersona: varIdPersona,
      Fecha: dateFormat(fecha, 'yyyyMMdd')
    }).then(response => {
      array.push(response[0]); // Horario
      array.push(response[1]); // Marcaciones
      array.push(response[2]); // Incidencias
      array.push(response[3]); // Justificaciones 
      array.push(response[4]); // EstaProcesado 
      array.push(response[5]); // Eventos 
      array.push(response[6]); // HorarioFlexible 
      array.push(response[7]); // Observación 
      array.push(response[8]); // Otras Justificaciones Sin Incidentes  
      array.push(response[9]); // Evento Marcacion
      array.push(response[10]); // Planilla Primera/Ultima Marca

      setDataResumen(array);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => {
      setLoading(false);
    });

  };

  const obtenerDatosMarcaDia = async (fecha) => {
    setLoading(true)

    await obtenerTipoIdentificacion()
      .then(response => {
        if (response.length > 0) {
          setDataTipoIdentificacion(response);
        }
      }).catch(err => {

      }).finally(() => {

      });


    await servicePersonaGrupo.obtenerZona({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdPersona: varIdPersona,
      IdModulo: idModulo
    }).then(response => {
      if (response.length > 0) {

        let dateNow = new Date(fecha);
        let fecMarca = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate());

        let data = {
          Activo: "S",
          MarcacionWeb: "N",
          FechaRegistro: dateNow,
          FechaMarca: dateNow,
          HoraMarca: dateNow,
          FechaCorta: fecMarca,
          IdTipoIdentificacion: TYPE_IDENTIFICACION_TIPOIDENTIFICACION.DOCUMENTO_DE_IDENTIDAD,
          Identificacion: selectedIndex.Documento,
        };

        setDataRowEditNew({ ...data, esNuevoRegistro: true, Automatico: "N", Online: "S" });
        setDataZona(response);
        //setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
        //setModoEdicion(true); 
      }
      else {
        handleInfoMessages(intl.formatMessage({ id: "ACCESS.PERSON.MARK.NOGROUP.MSG" }));
      }
    }).catch(err => {

    }).finally(() => { setLoading(false); });

  };

  async function agregarMarcacion(datarow) {
    setLoading(true);
    const { IdZona, IdEquipo, IdTipoIdentificacion, Identificacion, FechaMarca, HoraMarca, Automatico, Observacion, Online, FechaRegistro } = datarow;
    let data = {
      IdCliente: perfil.IdCliente
      , IdDivision: perfil.IdDivision
      , IdPersona: varIdPersona
      , IdSecuencial: 0
      , IdZona: isNotEmpty(IdZona) ? IdZona.toUpperCase() : ""
      , IdEquipo: isNotEmpty(IdEquipo) ? IdEquipo.toUpperCase() : ""
      , IdTipoIdentificacion: isNotEmpty(IdTipoIdentificacion) ? IdTipoIdentificacion.toUpperCase() : ""
      , Identificacion: isNotEmpty(Identificacion) ? Identificacion.toUpperCase() : ""
      , FechaMarca: dateFormat(FechaMarca, 'yyyyMMdd hh:mm')//dateFormat(FechaMarca, 'yyyyMMdd') + ' ' + dateFormat(HoraMarca, 'hh:mm')   
      , Hash: ""
      , Automatico: Automatico //"N"
      , Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : ""
      , Online: Online
      , MarcacionWeb: "S"
      , OrigenRegistro: "W" // Web
      , FechaRegistro: dateFormat(FechaRegistro, 'yyyyMMdd')
      , IdUsuario: usuario.username
    };

    await crearMarca(data).then(response => {
      if (response == '') {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        listarJustificacionDia(rangeDay);
      }
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }



  async function obtenerPersonaJustificacionDia(dataRow) {
    setLoading(true);
    const { IdCliente, IdPersona, IdJustificacion, IdSecuencialJustificacion, FechaAsistencia } = dataRow; //IdJustificacion
    await ObtenerPersonaJusti({
      IdCliente,
      IdPersona,
      IdCompania: varIdCompania,
      IdJustificacion,
      IdSecuencial: IdSecuencialJustificacion,
      FechaAsistencia
    }).then(data => {
      data.FechaInicio = new Date(data.FechaInicio);
      data.FechaFin = new Date(data.FechaFin);
      data.Fecha = dateFormat(data.FechaInicio, 'yyyyMMdd');
      data.FechaHoraInicio = new Date(data.FechaHoraInicio);
      data.FechaHoraFin = new Date(data.FechaHoraFin);
      data.FechaAsistencia = new Date(data.FechaInicio);
      data.Evento = dataRow.Evento;
      data.Color = dataRow.Color;
      data.Origen = dataRow.Origen;
      data.HoraEntrada = dataRow.HoraEntrada;
      data.HoraSalida = dataRow.HoraSalida;
      data.AplicaPorDia = "";

      //EsSubsidio,
      data.EnfermedadInicio = new Date(data.EnfermedadInicio);
      data.EnfermedadFin = new Date(data.EnfermedadFin);
      data.CertificadoInicio = new Date(data.CertificadoInicio);


      setDataRowEditNew({ ...data, esNuevoRegistro: false }); //, esEdicionRegistro: true 
      setVarFechaAsistencia(data.FechaAsistencia);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  const listarJustificacionDia = async (dataRow) => {
    setLoading(true);
    setRangeDay(dataRow);
    const { FechaInicio, FechaFin } = dataRow;
    await listar({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdPersona: varIdPersona,
      FechaInicio: dateFormat(FechaInicio, 'yyyyyMMdd'),
      FechaFin: dateFormat(FechaFin, 'yyyyyMMdd')
    })
      .then(resp => {
        let justificacionDias = resp.map(x => ({
          ...x,
          startDate: new Date(x.FechaHoraInicio), 
          endDate: new Date(x.FechaHoraInicio),//LSF/|20231219|se ingresa solo la fecha inicio, para ver un solo dia 
          text: x.Evento,
          color: x.Color,
          diaCompleto: x.DiaCompleto


        }));
        setDataRowEditNew({ ...dataRowEditNew, FechaInicio, FechaFin });
        setlisJustificacionDias(justificacionDias);
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function listarPersonaHorarioDia(dataRow) {

    let sCheduler = [];
    const { FechaInicio, FechaFin } = dataRow;

    setLoading(true);
    await horarioDiaBase({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdCompania: varIdCompania,
      FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd'),
      FechaFin: dateFormat(FechaFin, 'yyyyMMdd'),
      IdPersona: varIdPersona
    }).then(horarios => {
      if (isNotEmpty(horarios)) {
        horarios.map(data => {
          var x = new Date(data.date);
          let row = {
            date: x,
            color: data.Color,
            descanso: data.Descanso,
            turno: data.Turno,
          };
          sCheduler.push(row);
        });
      }
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });
    setListarHorarioDia(sCheduler);
    setModoEdicion(false);
  }

  async function eliminarJustificacion(data, confirm) {
    setSelectedDelete(data);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdCompania, IdPersona, IdSecuencialJustificacion, IdJustificacion } = selectedDelete;
      await eliminar({
        IdCliente: IdCliente,
        IdCompania: IdCompania,
        IdPersona: IdPersona,
        IdJustificacion: IdJustificacion,
        IdSecuencial: IdSecuencialJustificacion,
        IdDivision: perfil.IdDivision,
      }).then(() => {

        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        //Listar los eventos.
        listarJustificacionDia(rangeDay);
      }).catch(err => {

        if (err.response.status == 400) {
          var msj = intl.formatMessage({ id: err.response.data.responseException.exceptionMessage });
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), msj, true)
        }
        else
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)

      }).finally(() => { setLoading(false); });
    }
  }

  //::::::::::::::::::: Popup Horario día ::::::::::::::::::::::::::::::::::::::::::

  async function obtenerPopUpHorarioDia() {
    setLoading(true);
    const { IdCompania, IdHorario } = selected;
    await obtenerHD({
      IdCliente
      , IdDivision: perfil.IDivision
      , IdCompania
      , IdHorario
    }).then(data => {
      setListarPopUpHorarioDia(data);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function detalleHorarioDia(dataRow) {
    const {
      IdCliente, IDivision, IdCompania, IdHorario } = dataRow;
    obtenerPopUpHorarioDia(IdCliente, IDivision, IdCompania, IdHorario);
    setisVisiblePopUpHorarioDia(true);
  };

  useEffect(() => { }, []);

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  return <>

    {modoEdicion && (
      <>
        <PersonaJustificacionEditPage
          dataRowEditNew={dataRowEditNew}
          setDataRowEditNew={setDataRowEditNew}
          agregarPersonaJustificacion={agregarPersonaJustificacion}
          actualizarPersonaJustificacion={actualizarPersonaJustificacion}
          cancelarEdicion={cancelarEdicion}
          titulo={titulo}
          modoEdicion={modoEdicion}
          settingDataField={settingDataField}
          accessButton={accessButton}
          varIdPersona={varIdPersona}
          //dateSelected={dateSelected}
          getInfoJustificacion={getInfoJustificacion}
          //cargarDatos={cargarDatos}
          obtenerAsistenciaJustificacion={obtenerAsistenciaJustificacion}
          //viewPoppup={detalleHorarioDia}
          listarPopUpHorarioDia={listarPopUpHorarioDia}
          //datax={setlisJustificacionDias}
          varIdCompania={varIdCompania}
          fechaAsistencia={varFechaAsistencia}
          idModulo={idModulo}
          idAplicacion={idAplicacion}
          idMenu={idMenu}

          obtenerResumenDia={obtenerResumenDia}
          // obtener Persona Horario={obtener Persona Horario}
          dataResumen={dataResumen}
          dataPersonaHorario={dataPersonaHorario}
        />
        <div className="container_only">
          <div className="float-right">
            <ControlSwitch checked={auditoriaSwitch}
              onChange={e => { setAuditoriaSwitch(e.target.checked) }}
            /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
          </div>
        </div>
        {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
      </>
    )}

    {!modoEdicion && (
      <>
        <PersonaJustificacionListPage
          setDataRowEditNew={setDataRowEditNew}
          dataRowEditNew={dataRowEditNew}
          cancelarEdicion={props.cancelarEdicion}
          nuevoRegistro={nuevoPersonaJustificacion}
          editarRegistro={editarPersonaJustificacion}
          justificarRegistro={justificarIncidenciaPersonaJustificacion}
          obtenerResumenDia={obtenerResumenDia}
          obtenerDatosMarcaDia={obtenerDatosMarcaDia}
          agregarMarcacion={agregarMarcacion}
          //actualizarRangoDias={actualizarRangoDias}
          eliminarRegistro={eliminarJustificacion}
          getInfo={getInfo}
          showButton={true}
          accessButton={accessButton}
          personaJustificacionDias={lisJustificacionDias}
          listarJustificacionDia={listarJustificacionDia}
          personaHorarioDia={listarHorarioDia}
          listarPersonaHorarioDia={listarPersonaHorarioDia}
          dataAppoinment={dataAppoinment}
          setDataAppoinment={setDataAppoinment}

          varIdPersona={varIdPersona}
          varIdCompania={varIdCompania}
          idModulo={idModulo}
          idAplicacion={idAplicacion}
          idMenu={idMenu}

          dataResumen={dataResumen}

          dataZona={dataZona}
          dataTipoIdentificacion={dataTipoIdentificacion}

        />
      </>
    )}


    <Confirm
      message={intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.REMOVE" })}
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      setInstance={setInstance}
      onConfirm={() => eliminarJustificacion(selectedDelete, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />


  </>
};

export default injectIntl(WithLoandingPanel(PersonaJustificacionIndexPage));
